const Note = require("../models/Note");
const Purchase = require("../models/Purchase");

// UPLOAD NOTE
const uploadNote = async (req, res) => {

    try {

        const {
            courseId,
            title
        } = req.body;

        const fileUrl = req.file.filename;

        const note = await Note.create({
            courseId,
            title,
            fileUrl
        });

        res.status(201).json({
            message: "Note Uploaded Successfully",
            note
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server Error"
        });
    }
};

// GET NOTES BY COURSE
const getNotesByCourse = async (req, res) => {

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

        const notes = await Note.findAll({
            where: { courseId }
        });

        res.status(200).json({
            notes
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server Error"
        });
    }
};

module.exports = {
    uploadNote,
    getNotesByCourse
};