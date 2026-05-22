const Course = require("../models/Course");
const Progress = require("../models/Progress");
const Purchase = require("../models/Purchase");

async function ensurePurchased(studentId, courseId) {
    const course = await Course.findByPk(courseId);
    if (!course) {
        return { error: "Course not found", status: 404 };
    }

    const purchase = await Purchase.findOne({ where: { studentId, courseId } });
    if (!purchase) {
        return { error: "Please purchase this course first", status: 403 };
    }

    return { course };
}

const getCourseProgress = async (req, res) => {
    try {
        const studentId = req.user.id;
        const { courseId } = req.params;

        const access = await ensurePurchased(studentId, courseId);
        if (access.error) {
            return res.status(access.status).json({ message: access.error });
        }

        const progress = await Progress.findOne({ where: { studentId, courseId } });

        res.status(200).json({
            message: "Progress fetched successfully",
            progress: progress || {
                studentId,
                courseId: Number(courseId),
                watchedSeconds: 0,
                totalSeconds: 0,
                progressPercent: 0,
                isCompleted: false,
                lastWatchedAt: null
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server Error" });
    }
};

const saveCourseProgress = async (req, res) => {
    try {
        const studentId = req.user.id;
        const { courseId } = req.params;
        const watchedSeconds = Math.max(0, Number(req.body.watchedSeconds) || 0);
        const totalSeconds = Math.max(0, Number(req.body.totalSeconds) || 0);
        const completedFromClient = Boolean(req.body.isCompleted);

        const access = await ensurePurchased(studentId, courseId);
        if (access.error) {
            return res.status(access.status).json({ message: access.error });
        }

        const progressPercent = totalSeconds > 0
            ? Math.min(100, Math.round((watchedSeconds / totalSeconds) * 100))
            : 0;

        const isCompleted = completedFromClient || progressPercent >= 95;

        const [progress] = await Progress.findOrCreate({
            where: { studentId, courseId },
            defaults: {
                studentId,
                courseId,
                watchedSeconds,
                totalSeconds,
                progressPercent,
                isCompleted,
                lastWatchedAt: new Date()
            }
        });

        progress.watchedSeconds = Math.max(Number(progress.watchedSeconds) || 0, watchedSeconds);
        progress.totalSeconds = Math.max(Number(progress.totalSeconds) || 0, totalSeconds);
        progress.progressPercent = Math.max(Number(progress.progressPercent) || 0, progressPercent);
        progress.isCompleted = Boolean(progress.isCompleted || isCompleted);
        progress.lastWatchedAt = new Date();

        await progress.save();

        res.status(200).json({
            message: "Progress saved successfully",
            progress
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server Error" });
    }
};

const getMyProgress = async (req, res) => {
    try {
        const studentId = req.user.id;
        const progress = await Progress.findAll({ where: { studentId } });

        res.status(200).json({
            message: "All progress fetched successfully",
            progress
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server Error" });
    }
};

module.exports = {
    getCourseProgress,
    saveCourseProgress,
    getMyProgress
};
