const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const User = sequelize.define("User", {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },

    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },

    password: {
        type: DataTypes.STRING,
        allowNull: false
    },

    role: {
        type: DataTypes.ENUM("student", "teacher", "admin"),
        allowNull: false,
        defaultValue: "student"
    },
    
    isApproved: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },

    mobile: {
        type: DataTypes.STRING,
        allowNull: true
    },

    subject: {
        type: DataTypes.STRING,
        allowNull: true
    },

    experience: {
        type: DataTypes.STRING,
        allowNull: true
    },

    profilePhoto: {
        type: DataTypes.STRING,
        allowNull: true
    },

    emailVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },

    emailOtp: {
        type: DataTypes.STRING,
        allowNull: true
    },

    resetToken: {
        type: DataTypes.STRING,
        allowNull: true
    },

    resetTokenExpiry: {
        type: DataTypes.DATE,
        allowNull: true
    }
});

module.exports = User;