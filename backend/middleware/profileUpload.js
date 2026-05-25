const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "lms/profile",
        allowed_formats: ["jpg", "jpeg", "png", "webp"]
    }
});

const profileUpload = multer({ storage });

module.exports = profileUpload;