const Certificate = require("../models/Certificate");
const Course = require("../models/Course");
const Progress = require("../models/Progress");
const Purchase = require("../models/Purchase");
const User = require("../models/User");

function buildCertificateId(studentId, courseId) {
    const timestamp = Date.now().toString(36).toUpperCase();
    return `AMRIT-${studentId}-${courseId}-${timestamp}`;
}

async function getCertificateEligibility(studentId, courseId) {
    const course = await Course.findByPk(courseId);
    if (!course) {
        return { status: 404, error: "Course not found" };
    }

    const purchase = await Purchase.findOne({ where: { studentId, courseId } });
    if (!purchase) {
        return { status: 403, error: "Please purchase this course first" };
    }

    const progress = await Progress.findOne({ where: { studentId, courseId } });
    const progressPercent = progress ? Number(progress.progressPercent) || 0 : 0;
    const isCompleted = Boolean(progress?.isCompleted || progressPercent >= 95);

    return {
        course,
        progress,
        progressPercent,
        isEligible: isCompleted
    };
}

const getCertificateStatus = async (req, res) => {
    try {
        const studentId = req.user.id;
        const { courseId } = req.params;

        const eligibility = await getCertificateEligibility(studentId, courseId);
        if (eligibility.error) {
            return res.status(eligibility.status).json({ message: eligibility.error });
        }

        const certificate = await Certificate.findOne({ where: { studentId, courseId } });

        res.status(200).json({
            message: "Certificate status fetched successfully",
            isEligible: eligibility.isEligible,
            progressPercent: eligibility.progressPercent,
            certificate,
            course: eligibility.course
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server Error" });
    }
};

const issueCertificate = async (req, res) => {
    try {
        const studentId = req.user.id;
        const { courseId } = req.params;

        const eligibility = await getCertificateEligibility(studentId, courseId);
        if (eligibility.error) {
            return res.status(eligibility.status).json({ message: eligibility.error });
        }

        if (!eligibility.isEligible) {
            return res.status(400).json({
                message: "Complete at least 95% of this course to unlock certificate",
                progressPercent: eligibility.progressPercent
            });
        }

        const [certificate, created] = await Certificate.findOrCreate({
            where: { studentId, courseId },
            defaults: {
                studentId,
                courseId,
                certificateId: buildCertificateId(studentId, courseId),
                issuedAt: new Date()
            }
        });

        const user = await User.findByPk(studentId, {
            attributes: ["id", "name", "email"]
        });

        res.status(created ? 201 : 200).json({
            message: created ? "Certificate issued successfully" : "Certificate already issued",
            certificate,
            course: eligibility.course,
            student: user
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server Error" });
    }
};

const getMyCertificates = async (req, res) => {
    try {
        const studentId = req.user.id;
        const certificates = await Certificate.findAll({
            where: { studentId },
            order: [["issuedAt", "DESC"]]
        });

        const formatted = [];

        for (const certificate of certificates) {
            const course = await Course.findByPk(certificate.courseId);
            formatted.push({
                ...certificate.toJSON(),
                course
            });
        }

        res.status(200).json({
            message: "Certificates fetched successfully",
            certificates: formatted
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server Error" });
    }
};

module.exports = {
    getCertificateStatus,
    issueCertificate,
    getMyCertificates
};
