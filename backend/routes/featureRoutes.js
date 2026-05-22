const express = require('express');
const router = express.Router();
const upload = require('../middleware/noteUpload');
const { protect, allowRoles } = require('../middleware/authMiddleware');
const c = require('../controllers/featureController');

router.post('/assignments', protect, allowRoles('teacher','admin'), c.createAssignment);
router.get('/assignments/:courseId', protect, c.getAssignments);
router.post('/assignments/submit/:assignmentId', protect, allowRoles('student'), upload.single('file'), c.submitAssignment);
router.get('/submissions', protect, allowRoles('teacher','admin'), c.getSubmissions);
router.get('/submissions/:assignmentId', protect, allowRoles('teacher','admin'), c.getSubmissions);
router.post('/submissions/grade/:submissionId', protect, allowRoles('teacher','admin'), c.gradeSubmission);

router.post('/live-classes', protect, allowRoles('teacher','admin'), c.createLiveClass);
router.get('/live-classes', protect, c.getLiveClasses);
router.get('/live-classes/:courseId', protect, c.getLiveClasses);

router.get('/notifications', protect, c.getNotifications);
router.post('/notifications', protect, allowRoles('admin'), c.createNotification);

router.post('/wishlist', protect, allowRoles('student'), c.toggleWishlist);
router.get('/wishlist', protect, allowRoles('student'), c.getWishlist);

router.post('/reviews', protect, allowRoles('student'), c.createReview);
router.get('/reviews', protect, c.getReviews);
router.get('/reviews/:courseId', protect, c.getReviews);
router.post('/reviews/status/:reviewId', protect, allowRoles('admin'), c.updateReviewStatus);

router.post('/student-notes', protect, allowRoles('student'), c.saveStudentNote);
router.get('/student-notes/:courseId', protect, allowRoles('student'), c.getStudentNotes);

router.post('/discussion', protect, c.createDiscussion);
router.get('/discussion/:courseId', protect, c.getDiscussions);

router.post('/subscription', protect, allowRoles('student'), c.activateSubscription);
router.get('/subscription', protect, allowRoles('student'), c.getMySubscription);

router.post('/resume', protect, allowRoles('student'), upload.single('file'), c.uploadResume);
router.post('/jobs/apply', protect, allowRoles('student'), c.applyJob);
router.get('/placement', protect, allowRoles('student'), c.getPlacement);

router.post('/lessons', protect, allowRoles('teacher','admin'), c.createLesson);
router.get('/lessons/:courseId', protect, c.getLessons);

router.get('/leaderboard', protect, c.leaderboard);
router.post('/ai', protect, c.aiAssistant);

module.exports = router;
