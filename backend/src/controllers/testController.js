const db = require('../config/db');
const { collection, setDoc, getDocs, getDoc, deleteDoc, doc, query, where, writeBatch } = require('firebase/firestore');

// Create a new Mock Test
exports.createTest = async (req, res) => {
  const { name, duration, marks, negative_marks, randomize_questions, category, is_free, test_type } = req.body;
  if (!name || !duration) {
    return res.status(400).json({ error: 'Test name and duration are required' });
  }

  const marksVal = marks !== undefined ? parseFloat(marks) : 4.0;
  const negMarksVal = negative_marks !== undefined ? parseFloat(negative_marks) : -1.0;
  const randomizeVal = randomize_questions !== undefined ? parseInt(randomize_questions, 10) : 0;
  const categoryVal = category || 'JEE';
  const isFreeVal = is_free !== undefined ? parseInt(is_free, 10) : 0;
  const testTypeVal = test_type || 'mock';

  try {
    const testId = (Date.now() + Math.floor(Math.random() * 1000)).toString();
    await setDoc(doc(db, 'tests', testId), {
      name,
      duration: parseInt(duration, 10),
      is_published: 0,
      marks: marksVal,
      negative_marks: negMarksVal,
      randomize_questions: randomizeVal,
      category: categoryVal,
      is_free: isFreeVal,
      test_type: testTypeVal,
      created_at: new Date().toISOString()
    });

    res.status(201).json({
      message: 'Test created successfully',
      testId: testId
    });
  } catch (error) {
    console.error('Error creating test:', error);
    res.status(500).json({ error: 'Failed to create test' });
  }
};

// Get all tests
exports.getAllTests = async (req, res) => {
  const publishedOnly = req.query.published === 'true';
  const category = req.query.category;
  
  try {
    let q = collection(db, 'tests');
    
    if (publishedOnly && category) {
      q = query(collection(db, 'tests'), where('is_published', '==', 1), where('category', '==', category));
    } else if (publishedOnly) {
      q = query(collection(db, 'tests'), where('is_published', '==', 1));
    } else if (category) {
      q = query(collection(db, 'tests'), where('category', '==', category));
    }

    const [testsSnap, questionsSnap, attemptsSnap] = await Promise.all([
      getDocs(q),
      getDocs(collection(db, 'questions')),
      getDocs(collection(db, 'student_attempts'))
    ]);

    const questionCounts = {};
    questionsSnap.forEach(d => {
      const qData = d.data();
      if (qData.test_id) {
        questionCounts[qData.test_id] = (questionCounts[qData.test_id] || 0) + 1;
      }
    });

    const attemptCounts = {};
    attemptsSnap.forEach(d => {
      const aData = d.data();
      if (aData.test_id) {
        attemptCounts[aData.test_id] = (attemptCounts[aData.test_id] || 0) + 1;
      }
    });

    const tests = testsSnap.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        question_count: questionCounts[doc.id] || 0,
        attempt_count: attemptCounts[doc.id] || 0
      };
    });

    // Sort in-memory to bypass composite indexes
    tests.sort((a, b) => {
      const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
      const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
      return bTime - aTime;
    });

    res.json(tests);
  } catch (error) {
    console.error('Error fetching tests:', error);
    res.status(500).json({ error: 'Failed to fetch tests' });
  }
};

// Get a single test
exports.getTestById = async (req, res) => {
  const { id } = req.params;
  try {
    const testRef = doc(db, 'tests', id.toString());
    const testSnap = await getDoc(testRef);
    if (!testSnap.exists()) {
      return res.status(404).json({ error: 'Test not found' });
    }

    const test = { id: testSnap.id, ...testSnap.data() };
    
    const qQuery = query(collection(db, 'questions'), where('test_id', '==', id.toString()));
    const questionsSnap = await getDocs(qQuery);

    const questions = questionsSnap.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        options: Array.isArray(data.options) ? data.options : [],
        correct_answer: Array.isArray(data.correct_answer) ? data.correct_answer : [data.correct_answer]
      };
    });

    res.json({ ...test, questions });
  } catch (error) {
    console.error('Error fetching test:', error);
    res.status(500).json({ error: 'Failed to fetch test details' });
  }
};

// Update test metadata
exports.updateTest = async (req, res) => {
  const { id } = req.params;
  const { name, duration, randomize_questions, category, is_free, test_type } = req.body;
  if (!name || !duration) {
    return res.status(400).json({ error: 'Test name and duration are required' });
  }

  const randomizeVal = randomize_questions !== undefined ? parseInt(randomize_questions, 10) : 0;
  const isFreeVal = is_free !== undefined ? parseInt(is_free, 10) : 0;

  try {
    const testRef = doc(db, 'tests', id.toString());
    const testSnap = await getDoc(testRef);
    if (!testSnap.exists()) {
      return res.status(404).json({ error: 'Test not found' });
    }

    const updateData = {
      ...testSnap.data(),
      name,
      duration: parseInt(duration, 10),
      randomize_questions: randomizeVal,
      is_free: isFreeVal
    };

    if (category !== undefined) updateData.category = category;
    if (test_type !== undefined) updateData.test_type = test_type;

    await setDoc(testRef, updateData);
    res.json({ message: 'Test updated successfully' });
  } catch (error) {
    console.error('Error updating test:', error);
    res.status(500).json({ error: 'Failed to update test' });
  }
};

// Delete a test
exports.deleteTest = async (req, res) => {
  const { id } = req.params;
  try {
    const testRef = doc(db, 'tests', id.toString());
    const testSnap = await getDoc(testRef);
    if (!testSnap.exists()) {
      return res.status(404).json({ error: 'Test not found' });
    }

    await deleteDoc(testRef);
    
    const qQuery = query(collection(db, 'questions'), where('test_id', '==', id.toString()));
    const assignQuery = query(collection(db, 'test_assignments'), where('test_id', '==', id.toString()));
    
    const [questionsSnap, assignSnap] = await Promise.all([
      getDocs(qQuery),
      getDocs(assignQuery)
    ]);

    const batch = writeBatch(db);
    questionsSnap.forEach(d => batch.delete(d.ref));
    assignSnap.forEach(d => batch.delete(d.ref));
    await batch.commit();

    res.json({ message: 'Test deleted successfully' });
  } catch (error) {
    console.error('Error deleting test:', error);
    res.status(500).json({ error: 'Failed to delete test' });
  }
};

// Publish or Unpublish a test
exports.publishTest = async (req, res) => {
  const { id } = req.params;
  const { is_published } = req.body;
  
  if (is_published === undefined) {
    return res.status(400).json({ error: 'is_published value is required' });
  }

  const publishStatus = is_published ? 1 : 0;

  try {
    if (publishStatus === 1) {
      const qQuery = query(collection(db, 'questions'), where('test_id', '==', id.toString()));
      const questionsSnap = await getDocs(qQuery);
      if (questionsSnap.empty) {
        return res.status(400).json({ error: 'Cannot publish a test with zero questions' });
      }
    }

    const testRef = doc(db, 'tests', id.toString());
    const testSnap = await getDoc(testRef);
    if (!testSnap.exists()) {
      return res.status(404).json({ error: 'Test not found' });
    }

    await setDoc(testRef, { ...testSnap.data(), is_published: publishStatus });

    res.json({ 
      message: `Test ${publishStatus === 1 ? 'published' : 'unpublished'} successfully`,
      is_published: publishStatus === 1
    });
  } catch (error) {
    console.error('Error updating publish status:', error);
    res.status(500).json({ error: 'Failed to update publish status' });
  }
};

// Automatically generate custom mock test from the pool
exports.generateCustomTest = async (req, res) => {
  const { id: testId } = req.params;
  const { exam, subject, chapters, totalQuestions } = req.body;

  if (!exam || !subject || !totalQuestions) {
    return res.status(400).json({ error: 'Exam, subject, and totalQuestions are required' });
  }

  try {
    const testRef = doc(db, 'tests', testId.toString());
    const testSnap = await getDoc(testRef);
    if (!testSnap.exists()) {
      return res.status(404).json({ error: 'Test not found' });
    }

    const testData = testSnap.data();
    const testMarks = testData.marks !== undefined ? parseFloat(testData.marks) : 4.0;
    const testNegMarks = testData.negative_marks !== undefined ? parseFloat(testData.negative_marks) : -1.0;

    const q1 = query(collection(db, 'questions'), where('test_id', '==', null), where('difficulty', '==', 'hard'), where('subject', '==', subject));
    const q2 = query(collection(db, 'questions'), where('test_id', '==', ''), where('difficulty', '==', 'hard'), where('subject', '==', subject));
    
    const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
    const poolDocs = [...snap1.docs, ...snap2.docs];

    let filtered = poolDocs.map(d => ({ id: d.id, ...d.data() })).filter(q => {
      const matchesExam = q.exam && (q.exam.toLowerCase() === exam.toLowerCase() || q.exam.toLowerCase().includes(exam.toLowerCase()));
      if (!matchesExam) return false;

      if (chapters && chapters.length > 0) {
        return chapters.includes(q.chapter);
      }
      return true;
    });

    if (filtered.length === 0) {
      return res.status(404).json({ error: 'No matching questions found in the question bank pool.' });
    }

    filtered.sort(() => 0.5 - Math.random());
    const selectedQuestions = filtered.slice(0, parseInt(totalQuestions, 10));

    const batch = writeBatch(db);
    selectedQuestions.forEach(q => {
      let section = 'Physics';
      const subLower = q.subject ? q.subject.toLowerCase() : '';
      if (subLower.includes('chem')) {
        section = 'Chemistry';
      } else if (subLower.includes('math') || subLower.includes('calculus') || subLower.includes('algebra')) {
        section = 'Mathematics';
      } else if (subLower.includes('bio') || subLower.includes('botany') || subLower.includes('zoology')) {
        section = 'Biology';
      } else {
        section = q.subject || 'Physics';
      }

      const newQId = (Date.now() + Math.floor(Math.random() * 1000)).toString();
      const newQRef = doc(db, 'questions', newQId);
      batch.set(newQRef, {
        test_id: testId.toString(),
        exam: q.exam || '',
        subject: q.subject || '',
        chapter: q.chapter || '',
        question_text: q.question_text || '',
        option_a: q.option_a || '',
        option_b: q.option_b || '',
        option_c: q.option_c || '',
        option_d: q.option_d || '',
        correct_option: q.correct_option || '',
        difficulty: q.difficulty || '',
        year: q.year || null,
        explanation: q.explanation || '',
        options: Array.isArray(q.options) ? q.options : [],
        correct_answer: Array.isArray(q.correct_answer) ? q.correct_answer : [q.correct_answer],
        question_type: q.question_type || 'SINGLE',
        section,
        marks: testMarks,
        negative_marks: testNegMarks,
        created_at: new Date().toISOString()
      });
    });

    await batch.commit();

    res.json({
      success: true,
      message: `Successfully generated custom test with ${selectedQuestions.length} matching difficult questions from the pool.`,
      inserted: selectedQuestions.length
    });

  } catch (error) {
    console.error('Error generating custom test:', error);
    res.status(500).json({ error: 'Failed to generate custom test: ' + error.message });
  }
};

// Get all assigned student IDs for a test
exports.getTestAssignments = async (req, res) => {
  const { id } = req.params;
  try {
    const q = query(collection(db, 'test_assignments'), where('test_id', '==', id.toString()));
    const snap = await getDocs(q);
    const studentIds = snap.docs.map(doc => doc.data().student_id);
    res.json(studentIds);
  } catch (error) {
    console.error('Error fetching test assignments:', error);
    res.status(500).json({ error: 'Failed to fetch test assignments' });
  }
};

// Update assignments for a test
exports.updateTestAssignments = async (req, res) => {
  const { id } = req.params;
  const { studentIds } = req.body;
  if (!Array.isArray(studentIds)) {
    return res.status(400).json({ error: 'studentIds must be an array' });
  }
  try {
    const q = query(collection(db, 'test_assignments'), where('test_id', '==', id.toString()));
    const snap = await getDocs(q);
    
    const batch = writeBatch(db);
    snap.docs.forEach(doc => batch.delete(doc.ref));
    
    studentIds.forEach(studentId => {
      const assignmentId = (Date.now() + Math.floor(Math.random() * 1000)).toString();
      const docRef = doc(db, 'test_assignments', assignmentId);
      batch.set(docRef, {
        student_id: studentId.toString(),
        test_id: id.toString(),
        assigned_at: new Date().toISOString()
      });
    });

    await batch.commit();
    res.json({ success: true, message: 'Test assignments updated successfully' });
  } catch (error) {
    console.error('Error updating test assignments:', error);
    res.status(500).json({ error: 'Failed to update test assignments' });
  }
};

// Get all tests assigned to a specific student
exports.getStudentAssignedTests = async (req, res) => {
  const { studentId } = req.params;
  try {
    const assignQuery = query(collection(db, 'test_assignments'), where('student_id', '==', studentId.toString()));
    const assignSnap = await getDocs(assignQuery);
    
    if (assignSnap.empty) {
      return res.json([]);
    }

    const assignedTestIds = assignSnap.docs.map(doc => doc.data().test_id);
    
    const [testsSnap, questionsSnap, attemptsSnap] = await Promise.all([
      getDocs(query(collection(db, 'tests'), where('is_published', '==', 1))),
      getDocs(collection(db, 'questions')),
      getDocs(collection(db, 'student_attempts'))
    ]);

    const questionCounts = {};
    questionsSnap.forEach(d => {
      const qData = d.data();
      if (qData.test_id) {
        questionCounts[qData.test_id] = (questionCounts[qData.test_id] || 0) + 1;
      }
    });

    const attemptCounts = {};
    attemptsSnap.forEach(d => {
      const aData = d.data();
      if (aData.test_id) {
        attemptCounts[aData.test_id] = (attemptCounts[aData.test_id] || 0) + 1;
      }
    });

    const result = testsSnap.docs
      .filter(doc => assignedTestIds.includes(doc.id))
      .map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          question_count: questionCounts[doc.id] || 0,
          attempt_count: attemptCounts[doc.id] || 0
        };
      });

    // Sort in-memory
    result.sort((a, b) => {
      const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
      const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
      return bTime - aTime;
    });

    res.json(result);
  } catch (error) {
    console.error('Error fetching student assigned tests:', error);
    res.status(500).json({ error: 'Failed to fetch student assigned tests' });
  }
};
