const express = require("express");
const router = express.Router();

const upload = require("../middleware/upload");

const {
    createCourse,
    getAllCourses,
    buyCourse,
    getPurchasedCourses,
    uploadCourseVideo,
    getPurchasedCourseById
} = require("../controllers/courseController");

const { protect, allowRoles } = require("../middleware/authMiddleware");

// Public: Get all courses
router.get("/all", getAllCourses);

// Teacher/Admin: Create course
router.post("/create", protect, allowRoles("teacher", "admin"), createCourse);

// Student: Buy course
router.post("/buy", protect, allowRoles("student"), buyCourse);

// Student: Get own purchased courses
router.get("/purchased/:studentId", protect, allowRoles("student"), getPurchasedCourses);

// Student: Open purchased course only
router.get("/purchased-course/:courseId", protect, allowRoles("student"), getPurchasedCourseById);

// Teacher/Admin: Upload course video
router.post(
    "/upload-video/:courseId",
    protect,
    allowRoles("teacher", "admin"),
    upload.single("video"),
    uploadCourseVideo
);

module.exports = router;
