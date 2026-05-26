const multer = require("multer");

const storage = multer.memoryStorage();

const profileUpload = multer({
    storage,
    limits: {
        fileSize: 15 * 1024 * 1024 // 15 MB limit
    }
});

module.exports = profileUpload;