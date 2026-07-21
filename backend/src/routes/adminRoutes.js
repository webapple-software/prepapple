const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Teacher routes
router.get('/teachers', adminController.getAllTeachers);
router.post('/teachers', adminController.addTeacher);
router.delete('/teachers/:id', adminController.deleteTeacher);

// Student routes
router.get('/students', adminController.getAllStudents);
router.post('/students', adminController.addStudent);
router.delete('/students/:id', adminController.deleteStudent);
router.put('/students/:id/subscription', adminController.toggleStudentSubscription);
router.put('/students/:id/subscription-expiry', adminController.updateStudentSubscriptionExpiry);
router.put('/students/:id/active', adminController.toggleStudentActiveStatus);
router.post('/students/bulk-import', adminController.bulkImportStudents);
router.put('/students/bulk-active', adminController.bulkUpdateStudentActiveStatus);

// Question Bank Management
router.get('/chapter-sets', adminController.getChapterSets);
router.delete('/chapter-sets', adminController.deleteChapterSet);

module.exports = router;
