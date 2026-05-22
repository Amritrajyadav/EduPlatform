const express = require("express");
const router = express.Router();

const profileUpload = require("../middleware/profileUpload");

const {
    uploadProfilePhoto,
    deleteProfilePhoto
} = require("../controllers/profileController");

const { protect } = require("../middleware/authMiddleware");

// UPLOAD PROFILE PHOTO
router.post(
    "/upload-photo",
    protect,
    profileUpload.single("photo"),
    uploadProfilePhoto
);

// DELETE PROFILE PHOTO
router.post(
    "/delete-photo",
    protect,
    deleteProfilePhoto
);

module.exports = router;
