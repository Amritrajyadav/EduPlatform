const Course = require('../models/Course');
const Purchase = require('../models/Purchase');
const Assignment = require('../models/Assignment');
const AssignmentSubmission = require('../models/AssignmentSubmission');
const LiveClass = require('../models/LiveClass');
const Notification = require('../models/Notification');
const Wishlist = require('../models/Wishlist');
const Review = require('../models/Review');
const StudentNote = require('../models/StudentNote');
const Discussion = require('../models/Discussion');
const Subscription = require('../models/Subscription');
const Resume = require('../models/Resume');
const JobApplication = require('../models/JobApplication');
const Lesson = require('../models/Lesson');
const Progress = require('../models/Progress');
const Result = require('../models/Result');
const User = require('../models/User');

async function hasAccess(studentId, courseId) {
  const purchase = await Purchase.findOne({ where: { studentId, courseId } });
  const subscription = await Subscription.findOne({ where: { studentId, status: 'active' } });
  return Boolean(purchase || subscription);
}

const createAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.create(req.body);
    await Notification.create({ role: 'student', title: 'New Assignment', message: `New assignment added: ${assignment.title}` });
    res.status(201).json({ message: 'Assignment created', assignment });
  } catch (error) { console.log(error); res.status(500).json({ message: 'Server Error' }); }
};

const getAssignments = async (req, res) => {
  try {
    const { courseId } = req.params;
    if (req.user.role === 'student' && !(await hasAccess(req.user.id, courseId))) {
      return res.status(403).json({ message: 'Please purchase this course first' });
    }
    const assignments = await Assignment.findAll({ where: { courseId }, order: [['createdAt','DESC']] });
    res.json({ assignments });
  } catch (error) { console.log(error); res.status(500).json({ message: 'Server Error' }); }
};

const submitAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const assignment = await Assignment.findByPk(assignmentId);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });
    if (!(await hasAccess(req.user.id, assignment.courseId))) return res.status(403).json({ message: 'Please purchase this course first' });
    const fileUrl = req.file ? req.file.filename : null;
    const submission = await AssignmentSubmission.create({ assignmentId, studentId: req.user.id, answer: req.body.answer || '', fileUrl });
    res.status(201).json({ message: 'Assignment submitted', submission });
  } catch (error) { console.log(error); res.status(500).json({ message: 'Server Error' }); }
};

const getSubmissions = async (req, res) => {
  try {
    const where = req.params.assignmentId ? { assignmentId: req.params.assignmentId } : {};
    const submissions = await AssignmentSubmission.findAll({ where, order: [['createdAt','DESC']] });
    res.json({ submissions });
  } catch (error) { console.log(error); res.status(500).json({ message: 'Server Error' }); }
};

const gradeSubmission = async (req, res) => {
  try {
    const submission = await AssignmentSubmission.findByPk(req.params.submissionId);
    if (!submission) return res.status(404).json({ message: 'Submission not found' });
    submission.marks = req.body.marks;
    submission.feedback = req.body.feedback || '';
    submission.status = 'graded';
    await submission.save();
    await Notification.create({ userId: submission.studentId, role: 'student', title: 'Assignment Graded', message: `Marks: ${submission.marks}. ${submission.feedback || ''}` });
    res.json({ message: 'Submission graded', submission });
  } catch (error) { console.log(error); res.status(500).json({ message: 'Server Error' }); }
};

const createLiveClass = async (req, res) => {
  try {
    const liveClass = await LiveClass.create({ ...req.body, teacherId: req.user.id });
    await Notification.create({ role: 'student', title: 'Live Class Scheduled', message: `${liveClass.title} at ${new Date(liveClass.scheduledAt).toLocaleString()}` });
    res.status(201).json({ message: 'Live class scheduled', liveClass });
  } catch (error) { console.log(error); res.status(500).json({ message: 'Server Error' }); }
};

const getLiveClasses = async (req, res) => {
  try {
    const where = req.params.courseId ? { courseId: req.params.courseId } : {};
    const liveClasses = await LiveClass.findAll({ where, order: [['scheduledAt','ASC']] });
    res.json({ liveClasses });
  } catch (error) { console.log(error); res.status(500).json({ message: 'Server Error' }); }
};

const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findAll({ order: [['createdAt','DESC']] });
    const filtered = notifications.filter(n => !n.userId || n.userId === req.user.id || n.role === req.user.role || n.role === 'all');
    res.json({ notifications: filtered.slice(0, 50) });
  } catch (error) { console.log(error); res.status(500).json({ message: 'Server Error' }); }
};

const createNotification = async (req, res) => {
  try {
    const notification = await Notification.create(req.body);
    res.status(201).json({ message: 'Notification created', notification });
  } catch (error) { console.log(error); res.status(500).json({ message: 'Server Error' }); }
};

const toggleWishlist = async (req, res) => {
  try {
    const { courseId } = req.body;
    const existing = await Wishlist.findOne({ where: { studentId: req.user.id, courseId } });
    if (existing) { await existing.destroy(); return res.json({ message: 'Removed from wishlist', wished: false }); }
    const wishlist = await Wishlist.create({ studentId: req.user.id, courseId });
    res.status(201).json({ message: 'Added to wishlist', wished: true, wishlist });
  } catch (error) { console.log(error); res.status(500).json({ message: 'Server Error' }); }
};

const getWishlist = async (req, res) => {
  try {
    const items = await Wishlist.findAll({ where: { studentId: req.user.id } });
    const courses = [];
    for (const item of items) { const c = await Course.findByPk(item.courseId); if (c) courses.push(c); }
    res.json({ courses });
  } catch (error) { console.log(error); res.status(500).json({ message: 'Server Error' }); }
};

const createReview = async (req, res) => {
  try {
    if (!(await hasAccess(req.user.id, req.body.courseId))) return res.status(403).json({ message: 'Please purchase this course first' });
    const review = await Review.create({ ...req.body, studentId: req.user.id });
    res.status(201).json({ message: 'Review submitted for approval', review });
  } catch (error) { console.log(error); res.status(500).json({ message: 'Server Error' }); }
};

const getReviews = async (req, res) => {
  try {
    const where = req.params.courseId ? { courseId: req.params.courseId } : {};
    if (req.user.role === 'student') where.status = 'approved';
    const reviews = await Review.findAll({ where, order: [['createdAt','DESC']] });
    res.json({ reviews });
  } catch (error) { console.log(error); res.status(500).json({ message: 'Server Error' }); }
};

const updateReviewStatus = async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.reviewId);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    review.status = req.body.status || 'approved';
    await review.save();
    res.json({ message: 'Review updated', review });
  } catch (error) { console.log(error); res.status(500).json({ message: 'Server Error' }); }
};

const saveStudentNote = async (req, res) => {
  try {
    if (!(await hasAccess(req.user.id, req.body.courseId))) return res.status(403).json({ message: 'Please purchase this course first' });
    const note = await StudentNote.create({ ...req.body, studentId: req.user.id });
    res.status(201).json({ message: 'Personal note saved', note });
  } catch (error) { console.log(error); res.status(500).json({ message: 'Server Error' }); }
};

const getStudentNotes = async (req, res) => {
  try {
    const notes = await StudentNote.findAll({ where: { studentId: req.user.id, courseId: req.params.courseId }, order: [['createdAt','DESC']] });
    res.json({ notes });
  } catch (error) { console.log(error); res.status(500).json({ message: 'Server Error' }); }
};

const createDiscussion = async (req, res) => {
  try {
    const post = await Discussion.create({ ...req.body, userId: req.user.id });
    res.status(201).json({ message: 'Discussion posted', post });
  } catch (error) { console.log(error); res.status(500).json({ message: 'Server Error' }); }
};

const getDiscussions = async (req, res) => {
  try {
    const posts = await Discussion.findAll({ where: { courseId: req.params.courseId }, order: [['createdAt','DESC']] });
    res.json({ posts });
  } catch (error) { console.log(error); res.status(500).json({ message: 'Server Error' }); }
};

const activateSubscription = async (req, res) => {
  try {
    const months = req.body.plan === 'yearly' ? 12 : 1;
    const endDate = new Date(); endDate.setMonth(endDate.getMonth() + months);
    const subscription = await Subscription.create({ studentId: req.user.id, plan: req.body.plan || 'monthly', endDate });
    res.status(201).json({ message: 'Subscription activated', subscription });
  } catch (error) { console.log(error); res.status(500).json({ message: 'Server Error' }); }
};

const getMySubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ where: { studentId: req.user.id, status: 'active' }, order: [['createdAt','DESC']] });
    res.json({ subscription });
  } catch (error) { console.log(error); res.status(500).json({ message: 'Server Error' }); }
};

const uploadResume = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Resume file required' });
    const resume = await Resume.create({ studentId: req.user.id, title: req.body.title || 'My Resume', fileUrl: req.file.filename });
    res.status(201).json({ message: 'Resume uploaded', resume });
  } catch (error) { console.log(error); res.status(500).json({ message: 'Server Error' }); }
};

const applyJob = async (req, res) => {
  try {
    const app = await JobApplication.create({ ...req.body, studentId: req.user.id });
    res.status(201).json({ message: 'Job application saved', application: app });
  } catch (error) { console.log(error); res.status(500).json({ message: 'Server Error' }); }
};

const getPlacement = async (req, res) => {
  try {
    const resumes = await Resume.findAll({ where: { studentId: req.user.id }, order: [['createdAt','DESC']] });
    const applications = await JobApplication.findAll({ where: { studentId: req.user.id }, order: [['createdAt','DESC']] });
    res.json({ resumes, applications });
  } catch (error) { console.log(error); res.status(500).json({ message: 'Server Error' }); }
};

const createLesson = async (req, res) => {
  try {
    const lesson = await Lesson.create(req.body);
    res.status(201).json({ message: 'Lesson added', lesson });
  } catch (error) { console.log(error); res.status(500).json({ message: 'Server Error' }); }
};

const getLessons = async (req, res) => {
  try {
    const lessons = await Lesson.findAll({ where: { courseId: req.params.courseId }, order: [['sortOrder','ASC']] });
    res.json({ lessons });
  } catch (error) { console.log(error); res.status(500).json({ message: 'Server Error' }); }
};

const leaderboard = async (req, res) => {
  try {
    const users = await User.findAll({ where: { role: 'student' }, attributes: ['id','name','email'] });
    const rows = [];
    for (const u of users) {
      const progresses = await Progress.findAll({ where: { studentId: u.id } });
      const results = await Result.findAll({ where: { studentId: u.id } });
      const completed = progresses.filter(p => p.isCompleted).length;
      const avgScore = results.length ? Math.round(results.reduce((s,r) => s + Number(r.score || 0), 0) / results.length) : 0;
      const xp = completed * 100 + progresses.reduce((s,p) => s + Number(p.progressPercent || 0), 0) + avgScore * 5;
      rows.push({ studentId: u.id, name: u.name, completedCourses: completed, avgScore, xp });
    }
    rows.sort((a,b) => b.xp - a.xp);
    res.json({ leaderboard: rows.slice(0, 50) });
  } catch (error) { console.log(error); res.status(500).json({ message: 'Server Error' }); }
};

const aiAssistant = async (req, res) => {
  try {
    const prompt = (req.body.prompt || '').trim();
    if (!prompt) return res.status(400).json({ message: 'Prompt required' });
    if (!process.env.OPENAI_API_KEY) {
      return res.json({ answer: `AI Assistant demo mode: ${prompt}\n\nAdd OPENAI_API_KEY in .env to connect real OpenAI API. For now, break the topic into definition, example, and practice task.` });
    }
    res.json({ answer: 'OPENAI_API_KEY found. Connect your preferred OpenAI SDK here as the next production step.' });
  } catch (error) { console.log(error); res.status(500).json({ message: 'Server Error' }); }
};

module.exports = { createAssignment, getAssignments, submitAssignment, getSubmissions, gradeSubmission, createLiveClass, getLiveClasses, getNotifications, createNotification, toggleWishlist, getWishlist, createReview, getReviews, updateReviewStatus, saveStudentNote, getStudentNotes, createDiscussion, getDiscussions, activateSubscription, getMySubscription, uploadResume, applyJob, getPlacement, createLesson, getLessons, leaderboard, aiAssistant };
