const User = require("../models/User");
const Course = require("../models/Course");
const Purchase = require("../models/Purchase");
const Payment = require("../models/Payment");
const Progress = require("../models/Progress");
const Review = require("../models/Review");
const AssignmentSubmission = require("../models/AssignmentSubmission");

// ADMIN DASHBOARD DATA
const getAdminDashboard = async (req, res) => {
    try {
        const totalUsers = await User.count();
        const totalStudents = await User.count({ where: { role: "student" } });
        const totalTeachers = await User.count({ where: { role: "teacher" } });
        const totalAdmins = await User.count({ where: { role: "admin" } });

        const totalCourses = await Course.count();
        const totalPurchases = await Purchase.count();
        const totalPayments = await Payment.count();
        const activeStudents = await Progress.count({ distinct: true, col: "studentId" });
        const approvedReviews = await Review.count({ where: { status: "approved" } });
        const pendingReviews = await Review.count({ where: { status: "pending" } });
        const pendingAssignments = await AssignmentSubmission.count({ where: { status: "submitted" } });

        const users = await User.findAll({
            attributes: [
                "id",
                "name",
                "email",
                "role",
                "mobile",
                "subject",
                "experience",
                "profilePhoto",
                "createdAt"
            ]
        });

        const courses = await Course.findAll();
        const purchases = await Purchase.findAll();
        const payments = await Payment.findAll({ order: [["createdAt", "DESC"]], limit: 10 });

        const totalRevenue = payments.reduce((sum, payment) => {
            return sum + (Number(payment.amount) || 0);
        }, 0);

        const purchaseCountByCourse = {};
        purchases.forEach((purchase) => {
            purchaseCountByCourse[purchase.courseId] = (purchaseCountByCourse[purchase.courseId] || 0) + 1;
        });

        let mostPurchasedCourse = null;
        let maxPurchases = 0;
        courses.forEach((course) => {
            const count = purchaseCountByCourse[course.id] || 0;
            if (count > maxPurchases) {
                maxPurchases = count;
                mostPurchasedCourse = { id: course.id, title: course.title, purchases: count };
            }
        });

        const chartData = courses.map((course) => ({
            title: course.title,
            purchases: purchaseCountByCourse[course.id] || 0
        }));

        res.status(200).json({
            totalUsers,
            totalStudents,
            totalTeachers,
            totalAdmins,
            totalCourses,
            totalPurchases,
            totalPayments,
            users,
            courses,
            purchases,
            payments,
            totalRevenue,
            activeStudents,
            approvedReviews,
            pendingReviews,
            pendingAssignments,
            mostPurchasedCourse,
            recentPayments: payments,
            chartData
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Server Error"
        });
    }
};

// DELETE USER
const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        await user.destroy();

        res.status(200).json({
            message: "User deleted successfully"
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Server Error"
        });
    }
};

// DELETE COURSE
const deleteCourse = async (req, res) => {
    try {
        const { courseId } = req.params;

        const course = await Course.findByPk(courseId);

        if (!course) {
            return res.status(404).json({
                message: "Course not found"
            });
        }

        await course.destroy();

        res.status(200).json({
            message: "Course deleted successfully"
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Server Error"
        });
    }
};

module.exports = {
    getAdminDashboard,
    deleteUser,
    deleteCourse
};