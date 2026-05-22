const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Payment = sequelize.define("Payment", {
    studentId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    courseId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    amount: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    razorpayOrderId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    razorpayPaymentId: {
        type: DataTypes.STRING,
        allowNull: true
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: "created"
    }
});

module.exports = Payment;