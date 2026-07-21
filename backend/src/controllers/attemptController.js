const db = require('../config/db');
const { collection, setDoc, getDocs, getDoc, doc, query, where } = require('firebase/firestore');

// Start test: fetch questions without correct answers and explanations
exports.startTest = async (req, res) => {
  const { testId } = req.params;
  try {
    const testRef = doc(db, 'tests', testId.toString());
    const testSnap = await getDoc(testRef);
    if (!testSnap.exists()) {
      return res.status(404).json({ error: 'Test not found' });
    }

    const test = testSnap.data();
    if (test.is_published !== 1) {
      return res.status(400).json({ error: 'Test is not published yet' });
    }

    const qQuery = query(collection(db, 'questions'), where('test_id', '==', testId.toString()));
    const questionsSnap = await getDocs(qQuery);

    let questions = questionsSnap.docs.map(doc => {
      const q = doc.data();
      return {
        id: doc.id,
        test_id: q.test_id,
        question_text: q.question_text,
        question_type: q.question_type,
        options: Array.isArray(q.options) ? q.options : [],
        image_url: q.image_url,
        marks: q.marks,
        negative_marks: q.negative_marks,
        section: q.section
      };
    });

    if (test.randomize_questions === 1) {
      for (let i = questions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [questions[i], questions[j]] = [questions[j], questions[i]];
      }
    }

    res.json({
      id: testSnap.id,
      name: test.name,
      duration: test.duration,
      questions
    });
  } catch (error) {
    console.error('Error starting test:', error);
    res.status(500).json({ error: 'Failed to start test' });
  }
};

// Submit test attempt and calculate scores
exports.submitAttempt = async (req, res) => {
  const { testId, studentName, timeTaken, answers, questionOrder } = req.body;

  if (!testId || !studentName || timeTaken === undefined || !answers) {
    return res.status(400).json({ error: 'Required fields: testId, studentName, timeTaken, answers' });
  }

  try {
    const testRef = doc(db, 'tests', testId.toString());
    const testSnap = await getDoc(testRef);
    if (!testSnap.exists()) {
      return res.status(404).json({ error: 'Test not found' });
    }

    const qQuery = query(collection(db, 'questions'), where('test_id', '==', testId.toString()));
    const questionsSnap = await getDocs(qQuery);
    
    const questionsMap = {};
    questionsSnap.docs.forEach(doc => {
      questionsMap[doc.id] = { id: doc.id, ...doc.data() };
    });

    let score = 0;
    let correctCount = 0;
    let wrongCount = 0;
    let unattemptedCount = 0;
    
    const processedAnswers = [];

    let orderedQuestionIds = [];
    if (questionOrder && Array.isArray(questionOrder) && questionOrder.length > 0) {
      orderedQuestionIds = questionOrder;
    } else {
      orderedQuestionIds = Object.keys(questionsMap);
    }

    orderedQuestionIds.forEach((qId) => {
      const q = questionsMap[qId];
      if (!q) return;

      const selectedRaw = answers[qId];
      const selected = Array.isArray(selectedRaw)
        ? selectedRaw.filter(x => x !== undefined && x !== null)
        : (selectedRaw !== undefined && selectedRaw !== null ? [selectedRaw] : []);

      const rawCorrect = q.correct_answer;
      const correctAns = Array.isArray(rawCorrect)
        ? rawCorrect.filter(x => x !== undefined && x !== null)
        : (rawCorrect !== undefined && rawCorrect !== null ? [rawCorrect] : []);
      
      let isCorrect = 0;
      let marksObtained = 0;
      let isAttempted = false;

      const qMarks = typeof q.marks === 'number' ? q.marks : 4;
      const qNegativeMarks = typeof q.negative_marks === 'number' ? q.negative_marks : 0;

      if (q.question_type === 'SINGLE' || q.question_type === 'MULTIPLE') {
        if (selected.length > 0) {
          isAttempted = true;
        }
      } else if (q.question_type === 'NUMERICAL') {
        if (selected.length > 0 && selected[0] !== null && String(selected[0]).trim() !== '') {
          isAttempted = true;
        }
      }

      if (!isAttempted) {
        unattemptedCount++;
        isCorrect = 0;
        marksObtained = 0;
      } else {
        if (q.question_type === 'SINGLE') {
          const selectedIdx = selected[0];
          const correctIdx = correctAns[0];
          
          if (selectedIdx === correctIdx) {
            isCorrect = 1;
            marksObtained = qMarks;
            correctCount++;
          } else {
            isCorrect = 0;
            marksObtained = qNegativeMarks;
            wrongCount++;
          }
        } else if (q.question_type === 'MULTIPLE') {
          const correctSet = new Set(correctAns);
          const selectedSet = new Set(selected);
          
          let selectedWrongOption = false;
          selected.forEach(idx => {
            if (!correctSet.has(idx)) {
              selectedWrongOption = true;
            }
          });

          if (selectedWrongOption) {
            isCorrect = 0;
            marksObtained = qNegativeMarks;
            wrongCount++;
          } else {
            let allCorrectSelected = true;
            correctAns.forEach(idx => {
              if (!selectedSet.has(idx)) {
                allCorrectSelected = false;
              }
            });

            if (allCorrectSelected) {
              isCorrect = 1;
              marksObtained = qMarks;
              correctCount++;
            } else {
              isCorrect = 1; // partial correct
              marksObtained = parseFloat(((qMarks * selected.length) / correctAns.length).toFixed(2));
              correctCount++;
            }
          }
        } else if (q.question_type === 'NUMERICAL') {
          const studentInput = String(selected[0]).trim();
          const correctInput = String(correctAns[0]).trim();
          
          const studentFloat = parseFloat(studentInput);
          const correctFloat = parseFloat(correctInput);

          if (!isNaN(studentFloat) && !isNaN(correctFloat) && studentFloat === correctFloat) {
            isCorrect = 1;
            marksObtained = qMarks;
            correctCount++;
          } else {
            isCorrect = 0;
            marksObtained = qNegativeMarks;
            wrongCount++;
          }
        }
      }

      score += marksObtained;

      processedAnswers.push({
        question_id: qId,
        question_text: q.question_text || '',
        question_type: q.question_type || 'SINGLE',
        options: Array.isArray(q.options) ? q.options : [],
        image_url: q.image_url || '',
        correct_answer: correctAns,
        explanation: q.explanation || '',
        marks: qMarks,
        negative_marks: qNegativeMarks,
        selected_options: selected,
        is_correct: isCorrect === 1,
        marks_obtained: marksObtained
      });
    });

    const totalQuestions = Object.keys(questionsMap).length;
    const attemptedCount = correctCount + wrongCount;
    const accuracy = attemptedCount > 0 ? parseFloat(((correctCount / attemptedCount) * 100).toFixed(2)) : 0;

    const attemptId = (Date.now() + Math.floor(Math.random() * 1000)).toString();
    const attemptRef = doc(db, 'student_attempts', attemptId);
    
    await setDoc(attemptRef, {
      test_id: testId.toString(),
      student_name: studentName,
      score: parseFloat(score.toFixed(2)),
      total_questions: totalQuestions,
      correct_count: correctCount,
      wrong_count: wrongCount,
      unattempted_count: unattemptedCount,
      time_taken: timeTaken,
      accuracy: accuracy,
      review: processedAnswers,
      submitted_at: new Date().toISOString()
    });

    res.status(201).json({
      message: 'Attempt submitted successfully',
      attemptId: attemptId,
      score: parseFloat(score.toFixed(2)),
      totalQuestions,
      correctCount,
      wrongCount,
      unattemptedCount,
      accuracy
    });
  } catch (error) {
    console.error('Error submitting attempt:', error);
    res.status(500).json({ error: 'Failed to submit attempt' });
  }
};

// Get detailed result of an attempt for review
exports.getAttemptDetails = async (req, res) => {
  const { id } = req.params;
  try {
    const attemptRef = doc(db, 'student_attempts', id.toString());
    const attemptSnap = await getDoc(attemptRef);

    if (!attemptSnap.exists()) {
      return res.status(404).json({ error: 'Attempt details not found' });
    }

    const attemptData = attemptSnap.data();
    
    const testRef = doc(db, 'tests', attemptData.test_id);
    const testSnap = await getDoc(testRef);
    const testName = testSnap.exists() ? testSnap.data().name : 'Unknown Test';
    const testDuration = testSnap.exists() ? testSnap.data().duration : 30;

    const attempt = {
      id: attemptSnap.id,
      ...attemptData,
      test_name: testName,
      test_duration: testDuration
    };

    const review = attemptData.review || [];

    res.json({
      attempt,
      review
    });
  } catch (error) {
    console.error('Error fetching attempt review:', error);
    res.status(500).json({ error: 'Failed to fetch attempt details' });
  }
};

// Get all attempts for a specific test (Teacher Dashboard)
exports.getAttemptsByTest = async (req, res) => {
  const { testId } = req.params;
  try {
    const q = query(collection(db, 'student_attempts'), where('test_id', '==', testId.toString()));
    const querySnapshot = await getDocs(q);
    const attempts = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Sort in-memory to bypass composite indexes
    attempts.sort((a, b) => {
      const aTime = a.submitted_at ? new Date(a.submitted_at).getTime() : 0;
      const bTime = b.submitted_at ? new Date(b.submitted_at).getTime() : 0;
      return bTime - aTime;
    });

    res.json(attempts);
  } catch (error) {
    console.error('Error fetching attempts for test:', error);
    res.status(500).json({ error: 'Failed to fetch attempts' });
  }
};

// Get all attempts for a specific student name
exports.getAttemptsByStudent = async (req, res) => {
  const { studentName } = req.params;
  try {
    const q = query(collection(db, 'student_attempts'), where('student_name', '==', studentName));
    const attemptsSnap = await getDocs(q);

    const testsSnap = await getDocs(collection(db, 'tests'));
    const testsMap = {};
    testsSnap.forEach(d => {
      testsMap[d.id] = d.data().name;
    });

    const attempts = attemptsSnap.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        test_name: testsMap[data.test_id] || 'Unknown Test'
      };
    });

    // Sort in-memory to bypass composite indexes
    attempts.sort((a, b) => {
      const aTime = a.submitted_at ? new Date(a.submitted_at).getTime() : 0;
      const bTime = b.submitted_at ? new Date(b.submitted_at).getTime() : 0;
      return bTime - aTime;
    });

    res.json(attempts);
  } catch (error) {
    console.error('Error fetching attempts for student:', error);
    res.status(500).json({ error: 'Failed to fetch student attempts' });
  }
};

// Get all attempts across all tests
exports.getAllAttempts = async (req, res) => {
  try {
    const attemptsSnap = await getDocs(collection(db, 'student_attempts'));

    const testsSnap = await getDocs(collection(db, 'tests'));
    const testsMap = {};
    testsSnap.forEach(d => {
      testsMap[d.id] = d.data().name;
    });

    const attempts = attemptsSnap.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        test_name: testsMap[data.test_id] || 'Unknown Test'
      };
    });

    // Sort in-memory
    attempts.sort((a, b) => {
      const aTime = a.submitted_at ? new Date(a.submitted_at).getTime() : 0;
      const bTime = b.submitted_at ? new Date(b.submitted_at).getTime() : 0;
      return bTime - aTime;
    });

    res.json(attempts);
  } catch (error) {
    console.error('Error fetching all attempts:', error);
    res.status(500).json({ error: 'Failed to fetch attempts' });
  }
};
