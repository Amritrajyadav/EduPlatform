const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        return {
            folder: "lms/profile",
            resource_type: "image",
            public_id: `profile_${req.user.id}_${Date.now()}`,
            allowed_formats: ["jpg", "jpeg", "png", "webp"]
        };
    }
});

const profileUpload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});

module.exports = profileUpload;