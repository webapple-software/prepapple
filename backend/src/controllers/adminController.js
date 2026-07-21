const db = require('../config/db');
const { collection, setDoc, getDocs, getDoc, deleteDoc, doc, query, where } = require('firebase/firestore');

// List all teachers
exports.getAllTeachers = async (req, res) => {
  try {
    const querySnapshot = await getDocs(collection(db, 'teachers'));
    const teachers = querySnapshot.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));
    
    // Sort in-memory to bypass composite index requirements
    teachers.sort((a, b) => {
      const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
      const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
      return bTime - aTime;
    });

    res.json(teachers);
  } catch (error) {
    console.error('Error fetching teachers:', error);
    res.status(500).json({ error: 'Failed to fetch teachers' });
  }
};

// Add a teacher
exports.addTeacher = async (req, res) => {
  const { name, username, password } = req.body;
  if (!name || !username || !password) {
    return res.status(400).json({ error: 'Name, username, and password are required' });
  }

  const cleanUsername = username.trim().toLowerCase();

  try {
    const checkTeacherQuery = query(collection(db, 'teachers'), where('username', '==', cleanUsername));
    const checkStudentQuery = query(collection(db, 'students'), where('username', '==', cleanUsername));

    const [teacherSnap, studentSnap] = await Promise.all([
      getDocs(checkTeacherQuery),
      getDocs(checkStudentQuery)
    ]);

    if (!teacherSnap.empty || !studentSnap.empty || cleanUsername === 'mahakal') {
      return res.status(400).json({ error: 'Username is already taken' });
    }

    const teacherId = (Date.now() + Math.floor(Math.random() * 1000)).toString();
    await setDoc(doc(db, 'teachers', teacherId), {
      name: name.trim(),
      username: cleanUsername,
      password: password,
      created_at: new Date().toISOString()
    });

    res.status(201).json({ success: true, message: 'Teacher added successfully' });
  } catch (error) {
    console.error('Error adding teacher:', error);
    res.status(500).json({ error: 'Failed to add teacher' });
  }
};

// Remove a teacher
exports.deleteTeacher = async (req, res) => {
  const { id } = req.params;
  try {
    const teacherRef = doc(db, 'teachers', id.toString());
    const teacherSnap = await getDoc(teacherRef);
    if (!teacherSnap.exists()) {
      return res.status(404).json({ error: 'Teacher not found' });
    }
    await deleteDoc(teacherRef);
    res.json({ success: true, message: 'Teacher deleted successfully' });
  } catch (error) {
    console.error('Error deleting teacher:', error);
    res.status(500).json({ error: 'Failed to delete teacher' });
  }
};

// List all students
exports.getAllStudents = async (req, res) => {
  try {
    const querySnapshot = await getDocs(collection(db, 'students'));
    const nowISO = new Date().toISOString();
    const students = [];

    for (const d of querySnapshot.docs) {
      const data = d.data();
      const studentId = d.id;

      // Auto-deactivate logic:
      // If subscription exists, has an expiry date, and that date has passed, and student is still marked active,
      // deactivate student immediately.
      const hasExpired = data.is_subscribed === 1 && data.subscription_expires_at && data.subscription_expires_at < nowISO;

      if (hasExpired && data.is_active !== 0) {
        const studentRef = doc(db, 'students', studentId.toString());
        const updatedData = { ...data, is_active: 0 };
        await setDoc(studentRef, updatedData);
        students.push({
          id: studentId,
          ...updatedData
        });
      } else {
        students.push({
          id: studentId,
          ...data
        });
      }
    }

    // Sort in-memory
    students.sort((a, b) => {
      const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
      const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
      return bTime - aTime;
    });

    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
};

// Toggle student subscription status
exports.toggleStudentSubscription = async (req, res) => {
  const { id } = req.params;
  try {
    const studentRef = doc(db, 'students', id.toString());
    const studentSnap = await getDoc(studentRef);
    if (!studentSnap.exists()) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const currentSub = studentSnap.data().is_subscribed;
    const newStatus = currentSub === 1 ? 0 : 1;
    const expiresAt = newStatus === 1 ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : null;

    await setDoc(studentRef, { 
      ...studentSnap.data(), 
      is_subscribed: newStatus,
      subscription_expires_at: expiresAt
    });

    res.json({ 
      success: true, 
      isSubscribed: newStatus === 1, 
      subscription_expires_at: expiresAt,
      message: 'Student subscription status updated successfully' 
    });
  } catch (error) {
    console.error('Error toggling student subscription:', error);
    res.status(500).json({ error: 'Failed to update student subscription' });
  }
};

// Set custom student subscription expiry date
exports.updateStudentSubscriptionExpiry = async (req, res) => {
  const { id } = req.params;
  const { expires_at } = req.body; // ISO String or null
  try {
    const studentRef = doc(db, 'students', id.toString());
    const studentSnap = await getDoc(studentRef);
    if (!studentSnap.exists()) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const expiresAt = expires_at ? new Date(expires_at).toISOString() : null;
    const isSubscribed = expiresAt ? 1 : 0;

    await setDoc(studentRef, { 
      ...studentSnap.data(), 
      is_subscribed: isSubscribed,
      subscription_expires_at: expiresAt 
    });

    res.json({ 
      success: true, 
      isSubscribed: isSubscribed === 1,
      subscription_expires_at: expiresAt,
      message: 'Subscription expiry updated successfully' 
    });
  } catch (error) {
    console.error('Error updating student subscription expiry:', error);
    res.status(500).json({ error: 'Failed to update student subscription expiry' });
  }
};

// Add a student
exports.addStudent = async (req, res) => {
  const { name, roll_number, username, password, course } = req.body;
  if (!name || !roll_number || !username || !password) {
    return res.status(400).json({ error: 'Name, roll number, username, and password are required' });
  }

  const cleanUsername = username.trim().toLowerCase();
  const cleanRoll = roll_number.trim().toUpperCase();
  const selectedCourse = course || 'JEE';

  try {
    const checkTeacherQuery = query(collection(db, 'teachers'), where('username', '==', cleanUsername));
    const checkStudentQuery = query(collection(db, 'students'), where('username', '==', cleanUsername));
    const [teacherSnap, studentSnap] = await Promise.all([
      getDocs(checkTeacherQuery),
      getDocs(checkStudentQuery)
    ]);

    if (!teacherSnap.empty || !studentSnap.empty || cleanUsername === 'mahakal') {
      return res.status(400).json({ error: 'Username is already taken' });
    }

    const checkRollQuery = query(collection(db, 'students'), where('roll_number', '==', cleanRoll));
    const rollSnap = await getDocs(checkRollQuery);
    if (!rollSnap.empty) {
      return res.status(400).json({ error: 'Roll Number is already taken' });
    }

    const studentId = (Date.now() + Math.floor(Math.random() * 1000)).toString();
    await setDoc(doc(db, 'students', studentId), {
      name: name.trim(),
      roll_number: cleanRoll,
      username: cleanUsername,
      password: password,
      course: selectedCourse,
      is_subscribed: 0,
      is_active: 1,
      created_at: new Date().toISOString()
    });

    res.status(201).json({ success: true, message: 'Student added successfully' });
  } catch (error) {
    console.error('Error adding student:', error);
    res.status(500).json({ error: 'Failed to add student' });
  }
};

// Remove a student
exports.deleteStudent = async (req, res) => {
  const { id } = req.params;
  try {
    const studentRef = doc(db, 'students', id.toString());
    const studentSnap = await getDoc(studentRef);
    if (!studentSnap.exists()) {
      return res.status(404).json({ error: 'Student not found' });
    }
    await deleteDoc(studentRef);
    res.json({ success: true, message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ error: 'Failed to delete student' });
  }
};

// Fetch distinct chapter-wise question sets in the Question Bank pool
exports.getChapterSets = async (req, res) => {
  try {
    const q1 = query(collection(db, 'questions'), where('test_id', '==', null));
    const q2 = query(collection(db, 'questions'), where('test_id', '==', ''));
    const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);

    const allDocs = [...snap1.docs, ...snap2.docs];
    
    const counts = {};
    allDocs.forEach(d => {
      const data = d.data();
      const exam = data.exam || 'Unknown';
      const subject = data.subject || 'Unknown';
      const chapter = data.chapter || 'Unknown';
      const key = `${exam}|||${subject}|||${chapter}`;
      if (!counts[key]) {
        counts[key] = { exam, subject, chapter, question_count: 0 };
      }
      counts[key].question_count++;
    });

    const result = Object.values(counts).sort((a, b) => {
      return a.exam.localeCompare(b.exam) || a.subject.localeCompare(b.subject) || a.chapter.localeCompare(b.chapter);
    });

    res.json(result);
  } catch (error) {
    console.error('Error fetching chapter sets:', error);
    res.status(500).json({ error: 'Failed to fetch chapter sets' });
  }
};

// Delete all questions for a given exam, subject, and chapter set in the bank
exports.deleteChapterSet = async (req, res) => {
  const { exam, subject, chapter } = req.query;
  if (!exam || !subject || !chapter) {
    return res.status(400).json({ error: 'Exam, subject, and chapter parameters are required' });
  }
  try {
    const q1 = query(
      collection(db, 'questions'), 
      where('test_id', '==', null),
      where('exam', '==', exam),
      where('subject', '==', subject),
      where('chapter', '==', chapter)
    );
    const q2 = query(
      collection(db, 'questions'), 
      where('test_id', '==', ''),
      where('exam', '==', exam),
      where('subject', '==', subject),
      where('chapter', '==', chapter)
    );
    
    const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
    const docsToDelete = [...snap1.docs, ...snap2.docs];

    const deletePromises = docsToDelete.map(d => deleteDoc(d.ref));
    await Promise.all(deletePromises);

    res.json({ success: true, message: `Successfully deleted ${docsToDelete.length} questions from chapter '${chapter}' set.` });
  } catch (error) {
    console.error('Error deleting chapter set:', error);
    res.status(500).json({ error: 'Failed to delete chapter set' });
  }
};

// Toggle student active/inactive status
exports.toggleStudentActiveStatus = async (req, res) => {
  const { id } = req.params;
  try {
    const studentRef = doc(db, 'students', id.toString());
    const studentSnap = await getDoc(studentRef);
    if (!studentSnap.exists()) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const currentStatus = studentSnap.data().is_active !== undefined ? studentSnap.data().is_active : 1;
    const newStatus = currentStatus === 0 ? 1 : 0;
    await setDoc(studentRef, { ...studentSnap.data(), is_active: newStatus });

    res.json({ 
      success: true, 
      isActive: newStatus === 1, 
      message: 'Student active status updated successfully' 
    });
  } catch (error) {
    console.error('Error toggling student active status:', error);
    res.status(500).json({ error: 'Failed to update student active status' });
  }
};

// Bulk import student accounts
exports.bulkImportStudents = async (req, res) => {
  const { students } = req.body;
  if (!students || !Array.isArray(students)) {
    return res.status(400).json({ error: 'Students array is required' });
  }

  const results = { imported: 0, skipped: 0, errors: [] };

  try {
    for (const s of students) {
      const { name, roll_number, username, password, course, subscription_expires_at } = s;
      if (!name || !roll_number || !username || !password) {
        results.skipped++;
        results.errors.push(`Skipped roll number '${roll_number || 'unknown'}': Missing required fields`);
        continue;
      }

      const cleanUsername = username.trim().toLowerCase();
      const cleanRoll = roll_number.trim().toUpperCase();
      const selectedCourse = course || 'JEE';

      let isSubscribed = 0;
      let expiryDate = null;
      if (subscription_expires_at && String(subscription_expires_at).trim()) {
        try {
          const parsed = new Date(String(subscription_expires_at).trim());
          if (!isNaN(parsed.getTime())) {
            isSubscribed = 1;
            expiryDate = parsed.toISOString();
          }
        } catch (e) {
          // ignore invalid dates
        }
      }

      try {
        const checkTeacherQuery = query(collection(db, 'teachers'), where('username', '==', cleanUsername));
        const checkStudentQuery = query(collection(db, 'students'), where('username', '==', cleanUsername));
        const checkRollQuery = query(collection(db, 'students'), where('roll_number', '==', cleanRoll));

        const [teacherSnap, studentSnap, rollSnap] = await Promise.all([
          getDocs(checkTeacherQuery),
          getDocs(checkStudentQuery),
          getDocs(checkRollQuery)
        ]);

        if (!teacherSnap.empty || !studentSnap.empty || cleanUsername === 'mahakal' || !rollSnap.empty) {
          results.skipped++;
          results.errors.push(`Skipped '${name}' (Roll: ${cleanRoll}, Username: ${cleanUsername}): Username or Roll Number already exists`);
          continue;
        }

        const studentId = (Date.now() + Math.floor(Math.random() * 1000)).toString();
        await setDoc(doc(db, 'students', studentId), {
          name: name.trim(),
          roll_number: cleanRoll,
          username: cleanUsername,
          password: password,
          course: selectedCourse,
          is_subscribed: isSubscribed,
          subscription_expires_at: expiryDate,
          is_active: 1,
          created_at: new Date().toISOString()
        });
        results.imported++;
      } catch (err) {
        results.skipped++;
        results.errors.push(`Error importing student '${name}': ${err.message}`);
      }
    }

    res.json({ success: true, ...results });
  } catch (error) {
    console.error('Error during bulk student import:', error);
    res.status(500).json({ error: 'Failed bulk student import process' });
  }
};

// Bulk update active/inactive status
exports.bulkUpdateStudentActiveStatus = async (req, res) => {
  const { ids, active } = req.body; // ids: array of strings, active: 1 or 0
  if (!ids || !Array.isArray(ids)) {
    return res.status(400).json({ error: 'Student IDs array is required' });
  }

  try {
    const promises = ids.map(async (id) => {
      const studentRef = doc(db, 'students', id.toString());
      const studentSnap = await getDoc(studentRef);
      if (studentSnap.exists()) {
        await setDoc(studentRef, {
          ...studentSnap.data(),
          is_active: active === 1 ? 1 : 0
        });
      }
    });

    await Promise.all(promises);
    res.json({ success: true, message: `Successfully updated status for ${ids.length} student(s)` });
  } catch (error) {
    console.error('Error bulk updating student active status:', error);
    res.status(500).json({ error: 'Failed bulk update' });
  }
};
