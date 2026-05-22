const express = require("express");
const router = express.Router();

const noteUpload = require("../middleware/noteUpload");

const {
    uploadNote,
    getNotesByCourse
} = require("../controllers/noteController");

const { protect, allowRoles } = require("../middleware/authMiddleware");

// Teacher/Admin: Upload Note/PDF
router.post("/upload", protect, allowRoles("teacher", "admin"), noteUpload.single("note"), uploadNote);

// Student: Get Notes By Course
router.get("/:courseId", protect, allowRoles("student"), getNotesByCourse);

module.exports = router;
