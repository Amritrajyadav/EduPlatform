const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Certificate = sequelize.define("Certificate", {
    studentId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    courseId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    certificateId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    issuedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
});

module.exports = Certificate;
