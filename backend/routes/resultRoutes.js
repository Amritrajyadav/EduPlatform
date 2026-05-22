const express = require("express");
const router = express.Router();

const {
    saveResult,
    getStudentResults
} = require("../controllers/resultController");

const { protect, allowRoles } = require("../middleware/authMiddleware");

router.post("/save", protect, allowRoles("student"), saveResult);

router.get("/student/:studentId", protect, allowRoles("student"), getStudentResults);

module.exports = router;
