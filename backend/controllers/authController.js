const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const User = require("../models/User");

function createOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function buildUser(user) {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        mobile: user.mobile,
        subject: user.subject,
        experience: user.experience,
        profilePhoto: user.profilePhoto,
        emailVerified: user.emailVerified,
        isApproved: user.isApproved
    };
}

// REGISTER
const register = async (req, res) => {
    try {
        const { name, email, password, role, mobile, subject, experience } = req.body;
        if (role === "admin") {
            return res.status(403).json({
                message: "Admin registration is not allowed"
            });
        }

        const finalRole = role === "teacher" ? "teacher" : "student";
        const isApproved = finalRole === "student";

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const emailOtp = createOtp();

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: finalRole,
            isApproved,
            mobile,
            subject,
            experience,
            emailOtp,
            emailVerified: false
        });

        res.status(201).json({
            message: "Registration Successful. Verify email with OTP.",
            user: buildUser(user),
            devOtp: process.env.NODE_ENV === "production" ? undefined : emailOtp
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server Error" });
    }
};

// LOGIN
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(400).json({ message: "Invalid Email" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid Password" });
        }

        if (user.role === "teacher" && !user.isApproved) {
            return res.status(403).json({
                message: "Your teacher account is waiting for admin approval"
            });
        }

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.status(200).json({ message: "Login Successful", token, user: buildUser(user) });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server Error" });
    }
};

const verifyEmail = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(404).json({ message: "User not found" });
        if (user.emailOtp !== otp) return res.status(400).json({ message: "Invalid OTP" });

        user.emailVerified = true;
        user.emailOtp = null;
        await user.save();

        res.json({ message: "Email verified successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server Error" });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(404).json({ message: "User not found" });

        const resetToken = crypto.randomBytes(20).toString("hex");
        const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000);
        user.resetToken = resetToken;
        user.resetTokenExpiry = resetTokenExpiry;
        await user.save();

        res.json({
            message: "Password reset token generated. Configure Nodemailer in production to email this token.",
            devResetToken: process.env.NODE_ENV === "production" ? undefined : resetToken
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server Error" });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { email, token, newPassword } = req.body;
        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(404).json({ message: "User not found" });
        if (!user.resetToken || user.resetToken !== token || new Date(user.resetTokenExpiry) < new Date()) {
            return res.status(400).json({ message: "Invalid or expired reset token" });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        user.resetToken = null;
        user.resetTokenExpiry = null;
        await user.save();

        res.json({ message: "Password reset successful" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server Error" });
    }
};

module.exports = { register, login, verifyEmail, forgotPassword, resetPassword };
