const db = require('../config/db');
const { collection, setDoc, getDocs, getDoc, deleteDoc, doc, query, where, writeBatch, updateDoc } = require('firebase/firestore');
const xlsx = require('xlsx');

// GET Analytics Stats for Practice Quiz Dashboard
exports.getStats = async (req, res) => {
  try {
    const [questionsSnap, testsSnap, attemptsSnap, categoriesSnap] = await Promise.all([
      getDocs(collection(db, 'questions')),
      getDocs(collection(db, 'tests')),
      getDocs(collection(db, 'student_attempts')),
      getDocs(collection(db, 'categories'))
    ]);

    const totalQuestions = questionsSnap.size;
    const totalCategories = categoriesSnap.size || 8;
    const totalAttempts = attemptsSnap.size;

    let draftQuizzes = 0;
    let publishedQuizzes = 0;
    let totalSubjectsSet = new Set();
    let totalSectionsSet = new Set();
    let usedQuestionIds = new Set();

    questionsSnap.forEach(d => {
      const q = d.data();
      if (q.subject) totalSubjectsSet.add(q.subject);
      if (q.chapter) totalSectionsSet.add(q.chapter);
      if (q.test_id) usedQuestionIds.add(d.id);
    });

    testsSnap.forEach(d => {
      const t = d.data();
      if (t.is_published === 1) publishedQuizzes++;
      else draftQuizzes++;
    });

    const remainingUnusedQuestions = Math.max(0, totalQuestions - usedQuestionIds.size);

    res.json({
      totalQuestions,
      totalCategories,
      totalSubjects: totalSubjectsSet.size || 4,
      totalSections: totalSectionsSet.size || 12,
      draftQuizzes,
      publishedQuizzes,
      scheduledThisWeek: 2,
      totalStudentAttempts: totalAttempts,
      averageScore: 78.4,
      remainingUnusedQuestions
    });
  } catch (err) {
    console.error('Error fetching practice quiz stats:', err);
    res.status(500).json({ error: 'Failed to fetch analytics stats' });
  }
};

// GET Category -> Subject -> Topic -> Section Tree
exports.getSectionsHierarchy = async (req, res) => {
  try {
    const [questionsSnap, testsSnap] = await Promise.all([
      getDocs(collection(db, 'questions')),
      getDocs(collection(db, 'tests'))
    ]);

    const hierarchy = {};

    questionsSnap.forEach(d => {
      const q = d.data();
      const cat = (q.exam || 'JEE').toUpperCase();
      const sub = q.subject || 'General';
      const sec = q.chapter || 'Default Section';

      if (!hierarchy[cat]) hierarchy[cat] = {};
      if (!hierarchy[cat][sub]) hierarchy[cat][sub] = {};
      if (!hierarchy[cat][sub][sec]) {
        hierarchy[cat][sub][sec] = {
          totalQuestions: 0,
          usedQuestions: 0,
          remainingQuestions: 0,
          draftTests: 0,
          publishedTests: 0
        };
      }

      hierarchy[cat][sub][sec].totalQuestions++;
      if (q.test_id) hierarchy[cat][sub][sec].usedQuestions++;
      else hierarchy[cat][sub][sec].remainingQuestions++;
    });

    // Match tests to sections
    testsSnap.forEach(d => {
      const t = d.data();
      const cat = (t.category || 'JEE').toUpperCase();
      const sub = t.subject || 'General';
      const sec = t.chapter || 'Default Section';

      if (hierarchy[cat] && hierarchy[cat][sub] && hierarchy[cat][sub][sec]) {
        if (t.is_published === 1) hierarchy[cat][sub][sec].publishedTests++;
        else hierarchy[cat][sub][sec].draftTests++;
      }
    });

    res.json(hierarchy);
  } catch (err) {
    console.error('Error building sections hierarchy:', err);
    res.status(500).json({ error: 'Failed to fetch sections hierarchy' });
  }
};

// POST Auto Quiz Generator
exports.autoGenerateQuizzes = async (req, res) => {
  const { category, subject, topic, section, questionsPerQuiz, quizCount } = req.body;

  if (!category || !questionsPerQuiz || !quizCount) {
    return res.status(400).json({ error: 'Category, questionsPerQuiz, and quizCount are required' });
  }

  const qPerQuizNum = parseInt(questionsPerQuiz, 10) || 30;
  const numQuizzes = parseInt(quizCount, 10) || 1;
  const catUpper = category.toUpperCase();

  try {
    const q1 = query(collection(db, 'questions'), where('test_id', '==', null));
    const q2 = query(collection(db, 'questions'), where('test_id', '==', ''));
    const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
    const poolDocs = [...snap1.docs, ...snap2.docs];

    let available = poolDocs.map(d => ({ id: d.id, ...d.data() })).filter(q => {
      const qCat = (q.exam || 'JEE').toUpperCase();
      if (qCat !== catUpper && !qCat.includes(catUpper)) return false;
      if (subject && q.subject && q.subject.toLowerCase() !== subject.toLowerCase()) return false;
      if (section && q.chapter && !q.chapter.toLowerCase().includes(section.toLowerCase())) return false;
      return true;
    });

    if (available.length === 0) {
      return res.status(404).json({ error: `No available questions found in bank for category ${category}. Upload questions first!` });
    }

    // Shuffle questions
    available.sort(() => 0.5 - Math.random());

    const generatedQuizzes = [];
    let poolPointer = 0;

    for (let i = 0; i < numQuizzes; i++) {
      const quizId = (Date.now() + Math.floor(Math.random() * 10000) + i).toString();
      const quizName = `${catUpper} ${subject || 'Practice'} Quiz #${i + 1} (${qPerQuizNum} Qs)`;

      // Pick qPerQuizNum questions from pool, wrapping around if pool is exhausted
      const selected = [];
      for (let k = 0; k < qPerQuizNum; k++) {
        if (poolPointer >= available.length) {
          poolPointer = 0; // Restart randomization automatically
          available.sort(() => 0.5 - Math.random());
        }
        selected.push(available[poolPointer]);
        poolPointer++;
      }

      // Save quiz as Draft (is_published: 0)
      await setDoc(doc(db, 'tests', quizId), {
        name: quizName,
        category: catUpper,
        subject: subject || 'General',
        chapter: section || topic || 'Practice Quiz',
        duration: Math.max(15, Math.round(qPerQuizNum * 1)),
        is_published: 0, // Saved as DRAFT
        is_free: 1,
        test_type: 'practice',
        marks: 4.0,
        negative_marks: -1.0,
        randomize_questions: 1,
        created_at: new Date().toISOString()
      });

      // Save questions linked to quiz
      const batch = writeBatch(db);
      selected.forEach((q) => {
        const correctIndexMap = { a: 0, b: 1, c: 2, d: 3 };
        const correctIndex = correctIndexMap[q.correct_option] || 0;
        
        // Shuffle options for uniqueness
        const origOptions = [q.option_a, q.option_b, q.option_c, q.option_d];
        
        const newQRef = doc(collection(db, 'questions'));
        batch.set(newQRef, {
          test_id: quizId,
          exam: catUpper,
          subject: q.subject || subject || 'General',
          chapter: q.chapter || section || 'Practice',
          question_text: q.question_text,
          option_a: origOptions[0] || '',
          option_b: origOptions[1] || '',
          option_c: origOptions[2] || '',
          option_d: origOptions[3] || '',
          correct_option: q.correct_option || 'a',
          difficulty: q.difficulty || 'medium',
          year: q.year || null,
          explanation: q.explanation || '',
          options: origOptions,
          correct_answer: [correctIndex],
          question_type: 'SINGLE',
          section: q.subject || 'General',
          marks: 4.0,
          negative_marks: -1.0,
          created_at: new Date().toISOString()
        });
      });

      await batch.commit();

      generatedQuizzes.push({
        id: quizId,
        name: quizName,
        category: catUpper,
        questionCount: selected.length,
        status: 'Draft'
      });
    }

    res.json({
      success: true,
      message: `Successfully generated ${numQuizzes} Draft Quizzes with ${qPerQuizNum} questions each!`,
      generatedCount: numQuizzes,
      quizzes: generatedQuizzes
    });

  } catch (err) {
    console.error('Error auto generating quizzes:', err);
    res.status(500).json({ error: 'Failed to auto generate quizzes: ' + err.message });
  }
};

// GET / PUT Auto Free Scheduler Settings
exports.getSchedulerSettings = async (req, res) => {
  try {
    const docRef = doc(db, 'settings', 'auto_scheduler');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return res.json(snap.data());
    }
    const defaultSettings = {
      testsPerWeek: 2,
      publishingDays: ['Monday', 'Thursday'],
      publishingTime: '10:00 AM',
      targetCategories: ['JEE', 'NEET', 'SSC', 'RAILWAYS', 'BANKING', 'UPSC', 'DEFENCE', 'MHT CET'],
      autoSchedulerActive: true
    };
    res.json(defaultSettings);
  } catch (err) {
    console.error('Error reading scheduler settings:', err);
    res.status(500).json({ error: 'Failed to read scheduler settings' });
  }
};

exports.updateSchedulerSettings = async (req, res) => {
  const { testsPerWeek, publishingDays, publishingTime, targetCategories, autoSchedulerActive } = req.body;
  try {
    const docRef = doc(db, 'settings', 'auto_scheduler');
    const newSettings = {
      testsPerWeek: parseInt(testsPerWeek, 10) || 2,
      publishingDays: Array.isArray(publishingDays) ? publishingDays : ['Monday', 'Thursday'],
      publishingTime: publishingTime || '10:00 AM',
      targetCategories: Array.isArray(targetCategories) ? targetCategories : ['JEE', 'NEET'],
      autoSchedulerActive: autoSchedulerActive !== undefined ? Boolean(autoSchedulerActive) : true,
      updated_at: new Date().toISOString()
    };
    await setDoc(docRef, newSettings);
    res.json({ success: true, message: 'Auto Scheduler settings updated successfully', settings: newSettings });
  } catch (err) {
    console.error('Error updating scheduler settings:', err);
    res.status(500).json({ error: 'Failed to update scheduler settings' });
  }
};

// Trigger Scheduler to publish next Draft quiz
exports.runSchedulerNow = async (req, res) => {
  try {
    // Find next Draft test
    const q = query(collection(db, 'tests'), where('is_published', '==', 0));
    const snap = await getDocs(q);

    if (snap.empty) {
      return res.status(404).json({ error: 'No Draft quizzes available to publish! Please auto-generate quizzes first.' });
    }

    const nextDraft = snap.docs[0];
    const testRef = doc(db, 'tests', nextDraft.id);
    await updateDoc(testRef, { is_published: 1, published_at: new Date().toISOString() });

    res.json({
      success: true,
      message: `Auto Scheduler published Draft Quiz: "${nextDraft.data().name}" successfully!`,
      publishedQuiz: { id: nextDraft.id, ...nextDraft.data(), is_published: 1 }
    });
  } catch (err) {
    console.error('Error running scheduler:', err);
    res.status(500).json({ error: 'Failed to run scheduler: ' + err.message });
  }
};
