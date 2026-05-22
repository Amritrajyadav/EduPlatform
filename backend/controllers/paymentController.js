require("dotenv").config();

const Razorpay = require("razorpay");
const Payment = require("../models/Payment");

function hasRealRazorpayKeys() {
    const key = process.env.RAZORPAY_KEY_ID || "";
    const secret = process.env.RAZORPAY_KEY_SECRET || "";
    return key.startsWith("rzp_test_") && secret && !key.includes("your_real_key") && !secret.includes("your_real_secret");
}

const createOrder = async (req, res) => {
    try {
        const { studentId, courseId, amount } = req.body;

        if (!studentId || !courseId || !amount) {
            return res.status(400).json({ message: "studentId, courseId and amount are required" });
        }

        if (!hasRealRazorpayKeys()) {
            const testOrder = {
                id: `order_test_${Date.now()}`,
                amount: Number(amount) * 100,
                currency: "INR",
                status: "created"
            };

            await Payment.create({ studentId, courseId, amount, razorpayOrderId: testOrder.id, status: "created" });
            return res.status(200).json({ message: "Test order created. Add real Razorpay test keys in .env for live payment testing.", order: testOrder });
        }

        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });

        const order = await razorpay.orders.create({
            amount: Number(amount) * 100,
            currency: "INR",
            receipt: `receipt_${Date.now()}`
        });

        await Payment.create({ studentId, courseId, amount, razorpayOrderId: order.id, status: "created" });
        res.status(200).json({ message: "Order Created", order });
    } catch (error) {
        console.log("Payment Error:", error);
        res.status(500).json({ message: error?.error?.description || error.message || "Server Error" });
    }
};

module.exports = { createOrder };
