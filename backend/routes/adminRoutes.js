const express = require("express");
const router = express.Router();

const {
    getAdminDashboard,
    deleteUser,
    deleteCourse
} = require("../controllers/adminController");

const { protect, allowRoles } = require("../middleware/authMiddleware");

// All admin routes are protected
router.use(protect, allowRoles("admin"));

// DASHBOARD DATA
router.get("/dashboard", getAdminDashboard);

// DELETE USER
router.delete("/delete-user/:userId", deleteUser);

// DELETE COURSE
router.delete("/delete-course/:courseId", deleteCourse);

module.exports = router;
