const multer = require("multer");
const fs = require("fs");

const storage = multer.diskStorage({

    destination: function (req, file, cb) {
        fs.mkdirSync("uploads/videos", { recursive: true });
        cb(null, "uploads/videos");
    },

    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

const upload = multer({ storage });

module.exports = upload;