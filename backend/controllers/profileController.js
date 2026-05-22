const fs = require("fs");
const path = require("path");

const User = require("../models/User");

// UPLOAD PROFILE PHOTO
const uploadProfilePhoto = async (req, res) => {

    try {

        const userId = req.user.id;

        if (!req.file) {
            return res.status(400).json({
                message: "No image uploaded"
            });
        }

        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // Delete old photo if exists
        if (user.profilePhoto) {

            const oldPhotoPath = path.join(
                __dirname,
                "../uploads",
                user.profilePhoto
            );

            if (fs.existsSync(oldPhotoPath)) {
                fs.unlinkSync(oldPhotoPath);
            }
        }

        user.profilePhoto = req.file.filename;

        await user.save();

        res.status(200).json({
            message: "Profile photo uploaded successfully",
            photo: req.file.filename,
            photoUrl:
                `http://localhost:5000/uploads/${req.file.filename}`
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server Error"
        });
    }
};

// DELETE PROFILE PHOTO
const deleteProfilePhoto = async (req, res) => {

    try {

        const userId = req.user.id;

        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (user.profilePhoto) {

            const photoPath = path.join(
                __dirname,
                "../uploads",
                user.profilePhoto
            );

            if (fs.existsSync(photoPath)) {
                fs.unlinkSync(photoPath);
            }
        }

        user.profilePhoto = null;

        await user.save();

        res.status(200).json({
            message: "Profile photo deleted successfully"
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server Error"
        });
    }
};

module.exports = {
    uploadProfilePhoto,
    deleteProfilePhoto
};