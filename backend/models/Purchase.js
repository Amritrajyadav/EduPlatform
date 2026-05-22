const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Purchase = sequelize.define("Purchase", {
    studentId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    courseId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    paymentStatus: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "paid"
    }
});

module.exports = Purchase;
