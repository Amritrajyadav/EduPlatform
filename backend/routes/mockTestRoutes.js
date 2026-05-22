const express = require("express");
const router = express.Router();

const {
    createQuestion,
    getQuestionsByCourse
} = require("../controllers/mockTestController");

const { protect, allowRoles } = require("../middleware/authMiddleware");

// Teacher/Admin: Create Question
router.post("/create", protect, allowRoles("teacher", "admin"), createQuestion);

// Student: Get Questions By Course
router.get("/:courseId", protect, allowRoles("student"), getQuestionsByCourse);

module.exports = router;
