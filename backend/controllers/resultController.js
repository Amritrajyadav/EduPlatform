const Result = require("../models/Result");
const Purchase = require("../models/Purchase");

// SAVE RESULT
const saveResult = async (req, res) => {
    try {
        const { courseId, score, totalQuestions } = req.body;
        const studentId = req.user.id;

        const purchase = await Purchase.findOne({
            where: { studentId, courseId }
        });

        if (!purchase) {
            return res.status(403).json({
                message: "Please purchase this course first"
            });
        }

        const result = await Result.create({
            studentId,
            courseId,
            score,
            totalQuestions
        });

        res.status(201).json({
            message: "Result Saved Successfully",
            result
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Server Error"
        });
    }
};

// GET STUDENT RESULTS
const getStudentResults = async (req, res) => {
    try {
        const { studentId } = req.params;

        if (Number(studentId) !== Number(req.user.id)) {
            return res.status(403).json({
                message: "Access denied"
            });
        }

        const results = await Result.findAll({
            where: { studentId }
        });

        res.status(200).json({
            message: "Results fetched successfully",
            results
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Server Error"
        });
    }
};

module.exports = {
    saveResult,
    getStudentResults
};