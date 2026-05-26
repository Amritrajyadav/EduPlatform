const User = require("../models/User");
const cloudinary = require("../config/cloudinary");

function uploadToCloudinary(fileBuffer, userId) {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: "lms/profile",
                resource_type: "image",
                public_id: `profile_${userId}_${Date.now()}`
            },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );

        stream.end(fileBuffer);
    });
}

const uploadProfilePhoto = async (req, res) => {
    try {
        const userId = req.user.id;

        if (!req.file) {
            return res.status(400).json({ message: "No image uploaded" });
        }

        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const result = await uploadToCloudinary(req.file.buffer, userId);

        user.profilePhoto = result.secure_url;
        await user.save();

        res.status(200).json({
            message: "Profile photo uploaded successfully",
            photo: result.secure_url,
            photoUrl: result.secure_url
        });

    } catch (error) {
        console.error("Cloudinary Upload Error:", error.message || error);
        res.status(500).json({
            message: error.message || "Server Error"
        });
    }
};

const deleteProfilePhoto = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.profilePhoto = null;
        await user.save();

        res.status(200).json({
            message: "Profile photo deleted successfully"
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

module.exports = {
    uploadProfilePhoto,
    deleteProfilePhoto
};