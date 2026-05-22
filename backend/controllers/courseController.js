const Course = require("../models/Course");
const Purchase = require("../models/Purchase");

// CREATE COURSE
const createCourse = async (req, res) => {
    try {

        const {
            title,
            description,
            price,
            thumbnail,
            videoUrl,
            teacherId
        } = req.body;

        const course = await Course.create({
            title,
            description,
            price,
            thumbnail,
            videoUrl,
            teacherId
        });

        res.status(201).json({
            message: "Course Created Successfully",
            course
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server Error"
        });
    }
};

// GET ALL COURSES
const getAllCourses = async (req, res) => {

    try {

        const courses = await Course.findAll();

        res.status(200).json({
            message: "Courses fetched successfully",
            courses
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server Error"
        });
    }
};

// BUY COURSE
const buyCourse = async (req, res) => {

    try {

        const { courseId } = req.body;
        const studentId = req.user.id;

        const course = await Course.findByPk(courseId);

        if (!course) {
            return res.status(404).json({
                message: "Course not found"
            });
        }

        const alreadyPurchased = await Purchase.findOne({
            where: { studentId, courseId }
        });

        if (alreadyPurchased) {

            return res.status(400).json({
                message: "Course already purchased"
            });
        }

        const purchase = await Purchase.create({
            studentId,
            courseId,
            paymentStatus: "paid"
        });

        res.status(201).json({
            message: "Course Purchased Successfully",
            purchase
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server Error"
        });
    }
};

// GET PURCHASED COURSES
const getPurchasedCourses = async (req, res) => {

    try {

        const { studentId } = req.params;

        if (Number(studentId) !== Number(req.user.id)) {
            return res.status(403).json({
                message: "Access denied"
            });
        }

        const purchases = await Purchase.findAll({
            where: { studentId }
        });

        const purchasedCourses = [];

        for (let purchase of purchases) {

            const course = await Course.findOne({
                where: { id: purchase.courseId }
            });

            if (course) {
                purchasedCourses.push(course);
            }
        }

        res.status(200).json({
            message: "Purchased courses fetched successfully",
            courses: purchasedCourses
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server Error"
        });
    }
};

// GET SINGLE PURCHASED COURSE
const getPurchasedCourseById = async (req, res) => {

    try {

        const { courseId } = req.params;
        const studentId = req.user.id;

        const purchase = await Purchase.findOne({
            where: { studentId, courseId }
        });

        if (!purchase) {
            return res.status(403).json({
                message: "Please purchase this course first"
            });
        }

        const course = await Course.findByPk(courseId);

        if (!course) {
            return res.status(404).json({
                message: "Course not found"
            });
        }

        res.status(200).json({
            message: "Course fetched successfully",
            course
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server Error"
        });
    }
};

// UPLOAD COURSE VIDEO
const uploadCourseVideo = async (req, res) => {

    try {

        const { courseId } = req.params;

        const course = await Course.findByPk(courseId);

        if (!course) {

            return res.status(404).json({
                message: "Course not found"
            });
        }

        course.videoUrl = `https://eduplatform-5i45.onrender.com/uploads/videos/${req.file.filename}`;

        await course.save();

        res.status(200).json({
            message: "Video uploaded successfully",
            videoUrl: course.videoUrl
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server Error"
        });
    }
};

module.exports = {
    createCourse,
    getAllCourses,
    buyCourse,
    getPurchasedCourses,
    uploadCourseVideo,
    getPurchasedCourseById
};