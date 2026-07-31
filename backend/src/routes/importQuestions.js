const express = require('express');
const router = express.Router();
const multer = require('multer');
const xlsx = require('xlsx');
const pdfParse = require('pdf-parse');
const db = require('../config/db');
const { collection, getDocs, getDoc, addDoc, doc, updateDoc, deleteDoc, query, where, writeBatch } = require('firebase/firestore');

// Multer memory storage configuration
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /xlsx|xls|pdf/;
    const mimetype = filetypes.test(file.mimetype) || file.originalname.endsWith('.xlsx') || file.originalname.endsWith('.xls') || file.originalname.endsWith('.pdf');
    if (mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only Excel (.xlsx, .xls) and PDF (.pdf) files are allowed!'));
  }
});

// GET Template Excel Endpoint
router.get('/import-questions/template', (req, res) => {
  try {
    const wb = xlsx.utils.book_new();
    const data = [
      ["Exam", "Subject", "Chapter", "Question Text", "Option A", "Option B", "Option C", "Option D", "Correct Option", "Difficulty", "Year", "Explanation"],
      ["Instructions: Skip this row. Insert questions from row 3. correct_option must be only a, b, c, or d.", "", "", "", "", "", "", "", "", "", "", ""],
      ["JEE Advanced", "Physics", "Mechanics", "What is the acceleration due to gravity on Earth?", "9.8 m/s²", "10 m/s²", "1.6 m/s²", "0 m/s²", "a", "medium", 2026, "The standard acceleration due to gravity on Earth is approximately 9.8 m/s²."]
    ];
    const ws = xlsx.utils.aoa_to_sheet(data);
    xlsx.utils.book_append_sheet(wb, ws, "Questions Template");
    const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Disposition', 'attachment; filename=questions_template.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (err) {
    console.error('Error generating template:', err);
    res.status(500).json({ success: false, message: 'Failed to generate template' });
  }
});

// GET All Questions (Question Bank) Endpoint
router.get('/questions', async (req, res) => {
  try {
    const { exam, subject, chapter } = req.query;
    
    // Fetch all questions from bank (test_id is null or empty)
    const q1 = query(collection(db, 'questions'), where('test_id', '==', null));
    const q2 = query(collection(db, 'questions'), where('test_id', '==', ''));
    const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
    const docs = [...snap1.docs, ...snap2.docs];

    let questions = docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Filter in memory to bypass indexes requirement
    if (exam) {
      const eLower = exam.toLowerCase();
      questions = questions.filter(q => q.exam && q.exam.toLowerCase().includes(eLower));
    }
    if (subject) {
      questions = questions.filter(q => q.subject && q.subject.toLowerCase() === subject.toLowerCase());
    }
    if (chapter) {
      const cLower = chapter.toLowerCase();
      questions = questions.filter(q => q.chapter && q.chapter.toLowerCase().includes(cLower));
    }

    // Sort by created_at desc
    questions.sort((a, b) => {
      const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
      const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
      return bTime - aTime;
    });

    const formatted = questions.map(q => {
      const options = Array.isArray(q.options) ? q.options : [q.option_a, q.option_b, q.option_c, q.option_d];
      const correct_answer = Array.isArray(q.correct_answer) ? q.correct_answer : [];
      return {
        ...q,
        options,
        correct_answer
      };
    });

    res.json(formatted);
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

// Import Questions Endpoint
router.post('/import-questions', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  // Retrieve optional default values
  const defaultExam = req.body.exam || '';
  const defaultSubject = req.body.subject || '';
  const defaultChapter = req.body.chapter || '';
  const defaultDifficulty = req.body.difficulty || 'medium';
  const defaultYear = req.body.year ? parseInt(req.body.year, 10) : null;
  const forceMetadata = req.body.forceMetadata === 'true' || req.body.forceMetadata === true;
  const testId = req.body.testId || req.query.testId || null;

  let testMarks = 4.0;
  let testNegMarks = -1.0;
  if (testId) {
    try {
      const testSnap = await getDoc(doc(db, 'tests', testId));
      if (testSnap.exists()) {
        const t = testSnap.data();
        if (t.marks !== undefined) testMarks = parseFloat(t.marks);
        if (t.negative_marks !== undefined) testNegMarks = parseFloat(t.negative_marks);
      }
    } catch (e) {
      console.warn('Could not read test details:', e);
    }
  }

  const errors = [];
  let inserted = 0;
  let skipped = 0;
  const questionsToInsert = [];

  try {
    const filename = req.file.originalname.toLowerCase();
    
    if (filename.endsWith('.xlsx') || filename.endsWith('.xls')) {
      // --- Excel Parsing ---
      const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });

      if (rows.length < 3) {
        return res.status(400).json({
          success: false,
          message: 'Excel file is empty or does not have enough rows.'
        });
      }

      const headerRow = rows[0] || [];
      const normalizedHeaders = headerRow.map(h => (h || '').toString().trim().toLowerCase().replace(/[\s_-]/g, ''));

      const fieldIndices = {
        exam: normalizedHeaders.indexOf('exam'),
        subject: normalizedHeaders.indexOf('subject'),
        chapter: normalizedHeaders.indexOf('chapter'),
        question_text: normalizedHeaders.findIndex(h => h === 'questiontext' || h === 'question' || h === 'questiontext'),
        option_a: normalizedHeaders.findIndex(h => h === 'optiona' || h === 'a'),
        option_b: normalizedHeaders.findIndex(h => h === 'optionb' || h === 'b'),
        option_c: normalizedHeaders.findIndex(h => h === 'optionc' || h === 'c'),
        option_d: normalizedHeaders.findIndex(h => h === 'optiond' || h === 'd'),
        correct_option: normalizedHeaders.findIndex(h => h === 'correctoption' || h === 'correct' || h === 'correctans' || h === 'correctanswer'),
        difficulty: normalizedHeaders.indexOf('difficulty'),
        year: normalizedHeaders.indexOf('year'),
        explanation: normalizedHeaders.indexOf('explanation')
      };

      const getRowValue = (row, field) => {
        const idx = fieldIndices[field];
        if (idx !== undefined && idx !== -1) {
          return row[idx];
        }
        const defaults = {
          exam: 0, subject: 1, chapter: 2, question_text: 3,
          option_a: 4, option_b: 5, option_c: 6, option_d: 7,
          correct_option: 8, difficulty: 9, year: 10, explanation: 11
        };
        return row[defaults[field]];
      };

      for (let i = 2; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length === 0) continue;

        const hasContent = row.some(cell => cell !== null && cell !== undefined && cell.toString().trim() !== '');
        if (!hasContent) continue;

        const excelRowNumber = i + 1;

        const exam = (forceMetadata && defaultExam ? defaultExam : (getRowValue(row, 'exam') || defaultExam || '')).toString().trim();
        const subject = (forceMetadata && defaultSubject ? defaultSubject : (getRowValue(row, 'subject') || defaultSubject || '')).toString().trim();
        const chapter = (forceMetadata && defaultChapter ? defaultChapter : (getRowValue(row, 'chapter') || defaultChapter || '')).toString().trim();
        const question_text = (getRowValue(row, 'question_text') || '').toString().trim();
        const option_a = (getRowValue(row, 'option_a') || '').toString().trim();
        const option_b = (getRowValue(row, 'option_b') || '').toString().trim();
        const option_c = (getRowValue(row, 'option_c') || '').toString().trim();
        const option_d = (getRowValue(row, 'option_d') || '').toString().trim();
        const correct_option_raw = (getRowValue(row, 'correct_option') || '').toString().trim().toLowerCase();
        const difficulty = (forceMetadata && defaultDifficulty ? defaultDifficulty : (getRowValue(row, 'difficulty') || defaultDifficulty || 'medium')).toString().trim().toLowerCase();
        
        let year = null;
        if (forceMetadata && defaultYear !== null) {
          year = defaultYear;
        } else {
          const yearVal = getRowValue(row, 'year');
          if (yearVal !== undefined && yearVal !== null && yearVal !== '') {
            year = parseInt(yearVal, 10);
          } else {
            year = defaultYear;
          }
        }

        const explanation = (getRowValue(row, 'explanation') || '').toString().trim();

        const missingFields = [];
        if (!exam) missingFields.push('exam');
        if (!subject) missingFields.push('subject');
        if (!chapter) missingFields.push('chapter');
        if (!question_text) missingFields.push('question_text');
        if (!option_a) missingFields.push('option_a');
        if (!option_b) missingFields.push('option_b');
        if (!option_c) missingFields.push('option_c');
        if (!option_d) missingFields.push('option_d');
        if (!correct_option_raw) missingFields.push('correct_option');

        if (missingFields.length > 0) {
          skipped++;
          errors.push(`Row ${excelRowNumber}: Missing required field(s): ${missingFields.join(', ')}`);
          continue;
        }

        if (!['a', 'b', 'c', 'd'].includes(correct_option_raw)) {
          skipped++;
          errors.push(`Row ${excelRowNumber}: correct_option must be a, b, c, or d (got: "${correct_option_raw}")`);
          continue;
        }

        questionsToInsert.push({
          exam, subject, chapter, question_text,
          option_a, option_b, option_c, option_d,
          correct_option: correct_option_raw, difficulty, year, explanation
        });
      }

    } else if (filename.endsWith('.pdf')) {
      // --- PDF Parsing ---
      const pdfData = await pdfParse(req.file.buffer);
      const text = pdfData.text;

      if (!text || text.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'PDF file is empty or text could not be extracted.'
        });
      }

      const lines = text.split(/\r?\n/);
      let currentQuestion = null;
      let currentField = 'question_text';

      let activeExam = defaultExam;
      let activeSubject = defaultSubject;
      let activeChapter = defaultChapter;
      let activeDifficulty = defaultDifficulty;
      let activeYear = defaultYear;

      const saveCurrentQuestion = () => {
        if (!currentQuestion) return;

        currentQuestion.exam = forceMetadata && defaultExam ? defaultExam : (currentQuestion.exam || activeExam);
        currentQuestion.subject = forceMetadata && defaultSubject ? defaultSubject : (currentQuestion.subject || activeSubject);
        currentQuestion.chapter = forceMetadata && defaultChapter ? defaultChapter : (currentQuestion.chapter || activeChapter);
        currentQuestion.difficulty = forceMetadata && defaultDifficulty ? defaultDifficulty : (currentQuestion.difficulty || activeDifficulty);
        if (forceMetadata && defaultYear !== null) {
          currentQuestion.year = defaultYear;
        } else if (currentQuestion.year === null) {
          currentQuestion.year = activeYear;
        }

        const missingFields = [];
        if (!currentQuestion.exam) missingFields.push('exam');
        if (!currentQuestion.subject) missingFields.push('subject');
        if (!currentQuestion.chapter) missingFields.push('chapter');
        if (!currentQuestion.question_text) missingFields.push('question_text');
        if (!currentQuestion.option_a) missingFields.push('option_a');
        if (!currentQuestion.option_b) missingFields.push('option_b');
        if (!currentQuestion.option_c) missingFields.push('option_c');
        if (!currentQuestion.option_d) missingFields.push('option_d');
        if (!currentQuestion.correct_option) missingFields.push('correct_option');

        if (missingFields.length > 0) {
          skipped++;
          errors.push(`Line ${currentQuestion.lineNum} (Question ${currentQuestion.qNum || '?'}): Missing required field(s): ${missingFields.join(', ')}`);
        } else if (!['a', 'b', 'c', 'd'].includes(currentQuestion.correct_option)) {
          skipped++;
          errors.push(`Line ${currentQuestion.lineNum} (Question ${currentQuestion.qNum || '?'}): correct_option must be a, b, c, or d (got: "${currentQuestion.correct_option}")`);
        } else {
          questionsToInsert.push({
            exam: currentQuestion.exam,
            subject: currentQuestion.subject,
            chapter: currentQuestion.chapter,
            question_text: currentQuestion.question_text,
            option_a: currentQuestion.option_a,
            option_b: currentQuestion.option_b,
            option_c: currentQuestion.option_c,
            option_d: currentQuestion.option_d,
            correct_option: currentQuestion.correct_option,
            difficulty: currentQuestion.difficulty,
            year: currentQuestion.year,
            explanation: currentQuestion.explanation
          });
        }
      };

      for (let idx = 0; idx < lines.length; idx++) {
        const line = lines[idx].trim();
        if (!line) continue;

        const examMatch = line.match(/^Exam\s*[:\-]\s*(.*)$/i);
        if (examMatch) {
          activeExam = examMatch[1].trim();
          continue;
        }
        const subjectMatch = line.match(/^Subject\s*[:\-]\s*(.*)$/i);
        if (subjectMatch) {
          activeSubject = subjectMatch[1].trim();
          continue;
        }
        const chapterMatch = line.match(/^Chapter\s*[:\-]\s*(.*)$/i);
        if (chapterMatch) {
          activeChapter = chapterMatch[1].trim();
          continue;
        }
        const diffMatch = line.match(/^Difficulty\s*[:\-]\s*(.*)$/i);
        if (diffMatch) {
          activeDifficulty = diffMatch[1].trim().toLowerCase();
          continue;
        }
        const yearMatch = line.match(/^Year\s*[:\-]\s*(.*)$/i);
        if (yearMatch) {
          activeYear = parseInt(yearMatch[1].trim(), 10) || null;
          continue;
        }

        const qMatch = line.match(/^(?:Q|Question)?\s*(\d+)[\.\s\)]+[:\-]?\s*(.*)$/i);
        if (qMatch) {
          saveCurrentQuestion();
          currentQuestion = {
            lineNum: idx + 1,
            qNum: qMatch[1],
            question_text: qMatch[2].trim(),
            option_a: '',
            option_b: '',
            option_c: '',
            option_d: '',
            correct_option: '',
            explanation: '',
            exam: activeExam,
            subject: activeSubject,
            chapter: activeChapter,
            difficulty: activeDifficulty,
            year: activeYear
          };
          currentField = 'question_text';
          continue;
        }

        if (!currentQuestion) continue;

        const inlineMatch = line.match(/^\(?A[\.\)\s]+(.*?)\s+B[\.\)\s]+(.*?)\s+C[\.\)\s]+(.*?)\s+D[\.\)\s]+(.*)$/i);
        if (inlineMatch) {
          currentQuestion.option_a = inlineMatch[1].trim();
          currentQuestion.option_b = inlineMatch[2].trim();
          currentQuestion.option_c = inlineMatch[3].trim();
          currentQuestion.option_d = inlineMatch[4].trim();
          currentField = 'option_d';
          continue;
        }

        const optAMatch = line.match(/^(?:\(|\[)?A(?:\)|\]|\.|\s)\s*(.*)/i);
        if (optAMatch) {
          currentQuestion.option_a = optAMatch[1].trim();
          currentField = 'option_a';
          continue;
        }
        const optBMatch = line.match(/^(?:\(|\[)?B(?:\)|\]|\.|\s)\s*(.*)/i);
        if (optBMatch) {
          currentQuestion.option_b = optBMatch[1].trim();
          currentField = 'option_b';
          continue;
        }
        const optCMatch = line.match(/^(?:\(|\[)?C(?:\)|\]|\.|\s)\s*(.*)/i);
        if (optCMatch) {
          currentQuestion.option_c = optCMatch[1].trim();
          currentField = 'option_c';
          continue;
        }
        const optDMatch = line.match(/^(?:\(|\[)?D(?:\)|\]|\.|\s)\s*(.*)/i);
        if (optDMatch) {
          currentQuestion.option_d = optDMatch[1].trim();
          currentField = 'option_d';
          continue;
        }

        const ansMatch = line.match(/^(?:Ans(?:wer)?|Correct(?:\s*Option)?|Key)\s*[:\-\s]*([a-d])/i);
        if (ansMatch) {
          currentQuestion.correct_option = ansMatch[1].trim().toLowerCase();
          currentField = 'correct_option';
          continue;
        }

        const expMatch = line.match(/^(?:Explanation|Exp|Sol(?:ution)?)\s*[:\-\s]*(.*)/i);
        if (expMatch) {
          currentQuestion.explanation = expMatch[1].trim();
          currentField = 'explanation';
          continue;
        }

        if (currentField && currentQuestion[currentField] !== undefined) {
          currentQuestion[currentField] = (currentQuestion[currentField] + ' ' + line).trim();
        }
      }

      saveCurrentQuestion();
    }

    if (questionsToInsert.length === 0) {
      return res.status(200).json({
        success: true,
        inserted: 0,
        skipped,
        errors,
        message: 'No valid questions were found in the uploaded file.'
      });
    }

    // --- Bulk Insertion using batch ---
    const batch = writeBatch(db);
    questionsToInsert.forEach(q => {
      let section = 'Physics';
      const subLower = q.subject.toLowerCase();
      if (subLower.includes('chem')) {
        section = 'Chemistry';
      } else if (subLower.includes('math') || subLower.includes('calculus') || subLower.includes('algebra')) {
        section = 'Mathematics';
      } else if (subLower.includes('bio') || subLower.includes('botany') || subLower.includes('zoology')) {
        section = 'Biology';
      } else {
        section = q.subject.charAt(0).toUpperCase() + q.subject.slice(1);
      }

      const optionsArray = [q.option_a, q.option_b, q.option_c, q.option_d];
      const correctIndexMap = { a: 0, b: 1, c: 2, d: 3 };
      const correctIndex = correctIndexMap[q.correct_option];
      const correctAnswersArray = [correctIndex];

      const newQRef = doc(collection(db, 'questions'));
      batch.set(newQRef, {
        test_id: testId,
        exam: q.exam,
        subject: q.subject,
        chapter: q.chapter,
        question_text: q.question_text,
        option_a: q.option_a,
        option_b: q.option_b,
        option_c: q.option_c,
        option_d: q.option_d,
        correct_option: q.correct_option,
        difficulty: q.difficulty,
        year: q.year,
        explanation: q.explanation,
        options: optionsArray,
        correct_answer: correctAnswersArray,
        question_type: 'SINGLE',
        section,
        marks: testMarks,
        negative_marks: testNegMarks,
        created_at: new Date().toISOString()
      });
      inserted++;
    });

    await batch.commit();

    return res.status(200).json({
      success: true,
      inserted,
      skipped,
      errors,
      message: `Successfully imported ${inserted} questions.${skipped > 0 ? ` Skipped ${skipped} questions due to validation errors.` : ''}`
    });

  } catch (error) {
    console.error('Error importing questions:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to parse file: ' + error.message,
      inserted: 0,
      skipped: 0,
      errors: [error.message]
    });
  }
});

// DELETE Question from Question Bank
router.delete('/questions/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const qRef = doc(db, 'questions', id);
    const qSnap = await getDoc(qRef);
    if (!qSnap.exists()) {
      return res.status(404).json({ error: 'Question not found' });
    }
    await deleteDoc(qRef);
    res.json({ success: true, message: 'Question deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete question' });
  }
});

// Assign Question to a Mock Test
router.put('/questions/:id/assign-test', async (req, res) => {
  const { id } = req.params;
  const { test_id } = req.body;
  if (!test_id) {
    return res.status(400).json({ error: 'test_id is required' });
  }
  try {
    const qRef = doc(db, 'questions', id);
    const qSnap = await getDoc(qRef);
    if (!qSnap.exists()) {
      return res.status(404).json({ error: 'Question not found' });
    }
    await updateDoc(qRef, { test_id });
    res.json({ success: true, message: 'Question assigned to test successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to assign question to test' });
  }
});

// POST /import-questions/bulk-chunk
// Upload 500+ / 1000+ questions Excel sheet, parse, and auto-chunk into 30-question test sets!
router.post('/import-questions/bulk-chunk', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  const category = (req.body.category || 'JEE').toUpperCase();
  const questionsPerTest = parseInt(req.body.questionsPerTest, 10) || 30;
  const isFree = req.body.isFree === '0' || req.body.isFree === 0 ? 0 : 1;

  try {
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });

    if (rows.length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Excel file is empty or does not have enough rows.'
      });
    }

    const headerRow = rows[0] || [];
    const normalizedHeaders = headerRow.map(h => (h || '').toString().trim().toLowerCase().replace(/[\s_-]/g, ''));

    const fieldIndices = {
      exam: normalizedHeaders.indexOf('exam'),
      subject: normalizedHeaders.indexOf('subject'),
      chapter: normalizedHeaders.indexOf('chapter'),
      question_text: normalizedHeaders.findIndex(h => h === 'questiontext' || h === 'question'),
      option_a: normalizedHeaders.findIndex(h => h === 'optiona' || h === 'a'),
      option_b: normalizedHeaders.findIndex(h => h === 'optionb' || h === 'b'),
      option_c: normalizedHeaders.findIndex(h => h === 'optionc' || h === 'c'),
      option_d: normalizedHeaders.findIndex(h => h === 'optiond' || h === 'd'),
      correct_option: normalizedHeaders.findIndex(h => h === 'correctoption' || h === 'correct' || h === 'correctans' || h === 'correctanswer'),
      difficulty: normalizedHeaders.indexOf('difficulty'),
      year: normalizedHeaders.indexOf('year'),
      explanation: normalizedHeaders.indexOf('explanation')
    };

    const getRowValue = (row, field) => {
      const idx = fieldIndices[field];
      if (idx !== undefined && idx !== -1) return row[idx];
      const defaults = {
        exam: 0, subject: 1, chapter: 2, question_text: 3,
        option_a: 4, option_b: 5, option_c: 6, option_d: 7,
        correct_option: 8, difficulty: 9, year: 10, explanation: 11
      };
      return row[defaults[field]];
    };

    const parsedQuestions = [];

    for (let i = 2; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length === 0) continue;
      const hasContent = row.some(cell => cell !== null && cell !== undefined && cell.toString().trim() !== '');
      if (!hasContent) continue;

      const examRow = (getRowValue(row, 'exam') || category).toString().trim();
      const subject = (getRowValue(row, 'subject') || 'Physics').toString().trim();
      const chapter = (getRowValue(row, 'chapter') || 'General Practice').toString().trim();
      const question_text = (getRowValue(row, 'question_text') || '').toString().trim();
      const option_a = (getRowValue(row, 'option_a') || '').toString().trim();
      const option_b = (getRowValue(row, 'option_b') || '').toString().trim();
      const option_c = (getRowValue(row, 'option_c') || '').toString().trim();
      const option_d = (getRowValue(row, 'option_d') || '').toString().trim();
      const correct_option_raw = (getRowValue(row, 'correct_option') || '').toString().trim().toLowerCase();
      const difficulty = (getRowValue(row, 'difficulty') || 'medium').toString().trim().toLowerCase();
      const yearVal = getRowValue(row, 'year');
      const year = yearVal ? parseInt(yearVal, 10) : null;
      const explanation = (getRowValue(row, 'explanation') || '').toString().trim();

      if (!question_text || !option_a || !option_b || !option_c || !option_d || !['a', 'b', 'c', 'd'].includes(correct_option_raw)) {
        continue;
      }

      parsedQuestions.push({
        exam: examRow || category,
        subject,
        chapter,
        question_text,
        option_a, option_b, option_c, option_d,
        correct_option: correct_option_raw,
        difficulty, year, explanation
      });
    }

    if (parsedQuestions.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid questions found in Excel file.' });
    }

    // Split into chunks of questionsPerTest (e.g. 30 Qs per test)
    const chunks = [];
    for (let i = 0; i < parsedQuestions.length; i += questionsPerTest) {
      chunks.push(parsedQuestions.slice(i, i + questionsPerTest));
    }

    const createdTestSets = [];

    for (let cIdx = 0; cIdx < chunks.length; cIdx++) {
      const chunk = chunks[cIdx];
      const testId = (Date.now() + Math.floor(Math.random() * 10000) + cIdx).toString();
      const testName = `Practice Quiz Set #${cIdx + 1} - ${category}`;

      // Save test document
      await setDoc(doc(db, 'tests', testId), {
        name: testName,
        duration: 30,
        is_published: 1,
        marks: 4.0,
        negative_marks: -1.0,
        randomize_questions: 1,
        category: category,
        is_free: isFree,
        test_type: 'practice',
        created_at: new Date().toISOString()
      });

      // Batch insert questions linked to this testId
      const batch = writeBatch(db);
      chunk.forEach((q) => {
        const correctIndexMap = { a: 0, b: 1, c: 2, d: 3 };
        const correctIndex = correctIndexMap[q.correct_option];
        const newQRef = doc(collection(db, 'questions'));
        batch.set(newQRef, {
          test_id: testId,
          exam: q.exam,
          subject: q.subject,
          chapter: q.chapter,
          question_text: q.question_text,
          option_a: q.option_a,
          option_b: q.option_b,
          option_c: q.option_c,
          option_d: q.option_d,
          correct_option: q.correct_option,
          difficulty: q.difficulty,
          year: q.year,
          explanation: q.explanation,
          options: [q.option_a, q.option_b, q.option_c, q.option_d],
          correct_answer: [correctIndex],
          question_type: 'SINGLE',
          section: q.subject,
          marks: 4.0,
          negative_marks: -1.0,
          created_at: new Date().toISOString()
        });
      });

      await batch.commit();

      createdTestSets.push({
        testId,
        name: testName,
        category,
        questionCount: chunk.length,
        isFree
      });
    }

    return res.status(200).json({
      success: true,
      totalQuestions: parsedQuestions.length,
      createdTestsCount: createdTestSets.length,
      createdTests: createdTestSets,
      message: `Successfully imported ${parsedQuestions.length} questions and created ${createdTestSets.length} auto-generated 30-question quiz sets!`
    });

  } catch (error) {
    console.error('Error in bulk-chunk import:', error);
    return res.status(500).json({ success: false, message: 'Failed to process bulk Excel chunking: ' + error.message });
  }
});

module.exports = router;
