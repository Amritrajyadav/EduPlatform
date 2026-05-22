const express = require("express");
const router = express.Router();

const {
    getCourseProgress,
    saveCourseProgress,
    getMyProgress
} = require("../controllers/progressController");

const { protect, allowRoles } = require("../middleware/authMiddleware");

router.get("/my", protect, allowRoles("student"), getMyProgress);
router.get("/:courseId", protect, allowRoles("student"), getCourseProgress);
router.post("/:courseId", protect, allowRoles("student"), saveCourseProgress);

module.exports = router;
