const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

console.log("Cloudinary Config Check:", {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? "OK" : "MISSING",
    api_key: process.env.CLOUDINARY_API_KEY ? "OK" : "MISSING",
    api_secret: process.env.CLOUDINARY_API_SECRET ? "OK" : "MISSING"
});

const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
        console.log("Uploading file to Cloudinary:", file.originalname);

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