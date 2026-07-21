const db = require('../config/db');
const { collection, setDoc, doc, getDoc, deleteDoc } = require('firebase/firestore');

// Add a question to a test
exports.addQuestion = async (req, res) => {
  const { testId } = req.params;
  const {
    question_text,
    question_type,
    options, // Array of strings, e.g., ["A", "B", "C", "D"]
    image_url,
    correct_answer, // Array containing index/indices or numerical answer value
    explanation,
    marks,
    negative_marks,
    section
  } = req.body;

  if (!question_text || !question_type || !options || !correct_answer) {
    return res.status(400).json({ error: 'Required fields: question_text, question_type, options, correct_answer' });
  }

  try {
    // Check if test exists
    const testRef = doc(db, 'tests', testId.toString());
    const testSnap = await getDoc(testRef);
    if (!testSnap.exists()) {
      return res.status(404).json({ error: 'Test not found' });
    }
    const testInfo = testSnap.data();

    const marksVal = marks !== undefined ? parseFloat(marks) : (testInfo.marks !== undefined ? parseFloat(testInfo.marks) : 4.0);
    const negMarksVal = negative_marks !== undefined ? parseFloat(negative_marks) : (testInfo.negative_marks !== undefined ? parseFloat(testInfo.negative_marks) : -1.0);

    const questionId = (Date.now() + Math.floor(Math.random() * 1000)).toString();
    await setDoc(doc(db, 'questions', questionId), {
      test_id: testId.toString(),
      question_text,
      question_type,
      options: Array.isArray(options) ? options : [],
      image_url: image_url || null,
      correct_answer: Array.isArray(correct_answer) ? correct_answer : [correct_answer],
      explanation: explanation || '',
      marks: marksVal,
      negative_marks: negMarksVal,
      section: section || 'Physics',
      created_at: new Date().toISOString()
    });

    res.status(201).json({
      message: 'Question added successfully',
      questionId: questionId
    });
  } catch (error) {
    console.error('Error adding question:', error);
    res.status(500).json({ error: 'Failed to add question' });
  }
};

// Update a question
exports.updateQuestion = async (req, res) => {
  const { testId, questionId } = req.params;
  const {
    question_text,
    question_type,
    options,
    image_url,
    correct_answer,
    explanation,
    marks,
    negative_marks,
    section
  } = req.body;

  if (!question_text || !question_type || !options || !correct_answer) {
    return res.status(400).json({ error: 'Required fields: question_text, question_type, options, correct_answer' });
  }

  try {
    const questionRef = doc(db, 'questions', questionId.toString());
    const questionSnap = await getDoc(questionRef);
    if (!questionSnap.exists() || questionSnap.data().test_id !== testId.toString()) {
      return res.status(404).json({ error: 'Question not found for this test' });
    }

    const marksVal = marks !== undefined ? parseFloat(marks) : 4;
    const negMarksVal = negative_marks !== undefined ? parseFloat(negative_marks) : -1;

    await setDoc(questionRef, {
      ...questionSnap.data(),
      question_text,
      question_type,
      options: Array.isArray(options) ? options : [],
      image_url: image_url || null,
      correct_answer: Array.isArray(correct_answer) ? correct_answer : [correct_answer],
      explanation: explanation || '',
      marks: marksVal,
      negative_marks: negMarksVal,
      section: section || 'Physics'
    });

    res.json({ message: 'Question updated successfully' });
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({ error: 'Failed to update question' });
  }
};

// Delete a question
exports.deleteQuestion = async (req, res) => {
  const { testId, questionId } = req.params;
  try {
    const questionRef = doc(db, 'questions', questionId.toString());
    const questionSnap = await getDoc(questionRef);
    if (!questionSnap.exists() || questionSnap.data().test_id !== testId.toString()) {
      return res.status(404).json({ error: 'Question not found for this test' });
    }

    await deleteDoc(questionRef);
    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({ error: 'Failed to delete question' });
  }
};
