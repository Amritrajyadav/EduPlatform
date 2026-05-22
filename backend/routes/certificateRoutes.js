const express = require("express");
const router = express.Router();

const {
    getCertificateStatus,
    issueCertificate,
    getMyCertificates
} = require("../controllers/certificateController");

const { protect, allowRoles } = require("../middleware/authMiddleware");

router.get("/my", protect, allowRoles("student"), getMyCertificates);
router.get("/status/:courseId", protect, allowRoles("student"), getCertificateStatus);
router.post("/issue/:courseId", protect, allowRoles("student"), issueCertificate);

module.exports = router;
