const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Result = sequelize.define("Result", {
    studentId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    courseId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    score: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    totalQuestions: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
});

module.exports = Result;