const express = require("express");
const router = express.Router();

const {
    createQuestion,
    getQuestionsByCourse,
    getQuestionsForManage,
    deleteQuestion
} = require("../controllers/mockTestController");

const { protect, allowRoles } = require("../middleware/authMiddleware");

// Teacher/Admin: Create Question
router.post(
    "/create",
    protect,
    allowRoles("teacher", "admin"),
    createQuestion
);

// Teacher/Admin: View Questions
router.get(
    "/manage/:courseId",
    protect,
    allowRoles("teacher", "admin"),
    getQuestionsForManage
);

// Teacher/Admin: Delete Question
router.delete(
    "/delete/:id",
    protect,
    allowRoles("teacher", "admin"),
    deleteQuestion
);

// Student: Get Questions By Course
router.get(
    "/:courseId",
    protect,
    allowRoles("student"),
    getQuestionsByCourse
);

module.exports = router;