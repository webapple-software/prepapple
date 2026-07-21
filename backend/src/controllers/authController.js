const db = require('../config/db');
const { collection, query, where, getDocs, doc, setDoc } = require('firebase/firestore');

exports.login = async (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password || !role) {
    return res.status(400).json({ error: 'Username, password, and role are required' });
  }

  try {
    if (role === 'admin') {
      if (username === 'mahakal' && password === 'mahakal@123') {
        return res.json({
          success: true,
          user: {
            name: 'Administrator',
            username: 'mahakal',
            role: 'admin'
          }
        });
      } else {
        return res.status(401).json({ error: 'Invalid admin credentials' });
      }
    }

    if (role === 'teacher') {
      const q = query(
        collection(db, 'teachers'),
        where('username', '==', username),
        where('password', '==', password)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return res.status(401).json({ error: 'Invalid teacher credentials' });
      }

      const doc = querySnapshot.docs[0];
      const teacher = doc.data();
      return res.json({
        success: true,
        user: {
          id: doc.id,
          name: teacher.name,
          username: teacher.username,
          role: 'teacher'
        }
      });
    }

    if (role === 'student') {
      const q = query(
        collection(db, 'students'),
        where('username', '==', username),
        where('password', '==', password)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return res.status(401).json({ error: 'Invalid student credentials' });
      }

      const doc = querySnapshot.docs[0];
      const student = doc.data();

      // Auto-deactivate logic on login:
      const nowISO = new Date().toISOString();
      const hasExpired = student.is_subscribed === 1 && student.subscription_expires_at && student.subscription_expires_at < nowISO;
      let isActive = student.is_active !== undefined ? student.is_active : 1;

      if (hasExpired && isActive !== 0) {
        isActive = 0;
        await setDoc(doc(db, 'students', doc.id), { ...student, is_active: 0 });
      }

      if (isActive === 0) {
        return res.status(403).json({ error: 'Your account is inactive. Please contact the administrator.' });
      }

      return res.json({
        success: true,
        user: {
          id: doc.id,
          name: student.name,
          username: student.username,
          rollNumber: student.roll_number,
          isSubscribed: student.is_subscribed === 1 && (!student.subscription_expires_at || new Date(student.subscription_expires_at).getTime() > Date.now()),
          subscriptionExpiresAt: student.subscription_expires_at || null,
          course: student.course || 'JEE',
          role: 'student'
        }
      });
    }

    return res.status(400).json({ error: 'Invalid role specified' });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ error: 'Internal server error occurred during login' });
  }
};
