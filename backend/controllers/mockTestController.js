const MockTest = require("../models/MockTest");
const Purchase = require("../models/Purchase");

// CREATE QUESTION
const createQuestion = async (req, res) => {
    try {
        const {
            courseId,
            question,
            optionA,
            optionB,
            optionC,
            optionD,
            correctAnswer
        } = req.body;

        if (!courseId || !question || !optionA || !optionB || !optionC || !optionD || !correctAnswer) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        const mockQuestion = await MockTest.create({
            courseId,
            question,
            optionA,
            optionB,
            optionC,
            optionD,
            correctAnswer
        });

        res.status(201).json({
            message: "Question Added Successfully",
            mockQuestion
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Server Error"
        });
    }
};

// GET QUESTIONS BY COURSE
const getQuestionsByCourse = async (req, res) => {
    try {
        const { courseId } = req.params;

        const purchase = await Purchase.findOne({
            where: {
                studentId: req.user.id,
                courseId
            }
        });

        if (!purchase) {
            return res.status(403).json({
                message: "Please purchase this course first"
            });
        }

        const questions = await MockTest.findAll({
            where: { courseId }
        });

        res.status(200).json({
            message: "Questions fetched successfully",
            questions
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Server Error"
        });
    }
};

// GET QUESTIONS FOR TEACHER / ADMIN
const getQuestionsForManage = async (req, res) => {
    try {
        const { courseId } = req.params;

        const questions = await MockTest.findAll({
            where: { courseId },
            order: [["id", "DESC"]]
        });

        res.status(200).json({
            message: "Questions fetched successfully",
            questions
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Server Error"
        });
    }
};

// DELETE QUESTION
const deleteQuestion = async (req, res) => {
    try {
        const { id } = req.params;

        const question = await MockTest.findByPk(id);

        if (!question) {
            return res.status(404).json({
                message: "Question not found"
            });
        }

        await question.destroy();

        res.status(200).json({
            message: "Question deleted successfully"
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Server Error"
        });
    }
};

module.exports = {
    createQuestion,
    getQuestionsByCourse,
    getQuestionsForManage,
    deleteQuestion
};