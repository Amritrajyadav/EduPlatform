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

        // Cloudinary image URL save
        user.profilePhoto = req.file.path;

        await user.save();

        res.status(200).json({
            message: "Profile photo uploaded successfully",
            photo: req.file.path,
            photoUrl: req.file.path
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