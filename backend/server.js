const profileRoutes = require("./routes/profileRoutes");
const noteRoutes = require("./routes/noteRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const adminRoutes = require("./routes/adminRoutes");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const compression = require("compression");

dotenv.config();

const sequelize = require("./config/database");

const authRoutes = require("./routes/authRoutes");
const courseRoutes = require("./routes/courseRoutes");
const mockTestRoutes = require("./routes/mockTestRoutes");
const resultRoutes = require("./routes/resultRoutes");
const progressRoutes = require("./routes/progressRoutes");
const certificateRoutes = require("./routes/certificateRoutes");
const featureRoutes = require("./routes/featureRoutes");

const User = require("./models/User");
const Course = require("./models/Course");
const Purchase = require("./models/Purchase");
const MockTest = require("./models/MockTest");
const Result = require("./models/Result");
const Payment = require("./models/Payment");
const Note = require("./models/Note");
const Progress = require("./models/Progress");
const Certificate = require("./models/Certificate");
require("./models/Assignment");
require("./models/AssignmentSubmission");
require("./models/LiveClass");
require("./models/Notification");
require("./models/Wishlist");
require("./models/Review");
require("./models/StudentNote");
require("./models/Discussion");
require("./models/Subscription");
require("./models/Resume");
require("./models/JobApplication");
require("./models/Lesson");

const app = express();

const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5500,http://127.0.0.1:5500")
    .split(",")
    .map(origin => origin.trim());

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(compression());
app.use(morgan("dev"));
app.use(cors({
    origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error("Not allowed by CORS"));
    },
    credentials: true
}));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

app.use("/api/auth", authRoutes);
app.use("/api/course", courseRoutes);
app.use("/api/mocktest", mockTestRoutes);
app.use("/api/result", resultRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/certificate", certificateRoutes);
app.use("/api/features", featureRoutes);

app.get("/", (req, res) => {
    res.send("Edu Platform Backend Running Successfully");
});

app.get("/api/health", (req, res) => {
    res.json({ status: "ok", service: "EduPlatform API", timestamp: new Date().toISOString() });
});

sequelize.authenticate()
.then(() => {
    console.log("MySQL Connected Successfully");
})
.catch((err) => {
    console.log("Database Connection Error:", err);
});
sequelize.sync({ alter: true })
.then(() => {
    console.log("Database tables synced");
})
.catch((err) => {
    console.log("Table sync error:", err);
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});