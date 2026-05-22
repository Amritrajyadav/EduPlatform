const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const MockTest = sequelize.define("MockTest", {
    courseId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    question: {
        type: DataTypes.TEXT,
        allowNull: false
    },

    optionA: {
        type: DataTypes.STRING,
        allowNull: false
    },

    optionB: {
        type: DataTypes.STRING,
        allowNull: false
    },

    optionC: {
        type: DataTypes.STRING,
        allowNull: false
    },

    optionD: {
        type: DataTypes.STRING,
        allowNull: false
    },

    correctAnswer: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

module.exports = MockTest;