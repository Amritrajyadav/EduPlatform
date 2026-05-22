const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Progress = sequelize.define("Progress", {
    studentId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    courseId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    watchedSeconds: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0
    },

    totalSeconds: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0
    },

    progressPercent: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },

    isCompleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },

    lastWatchedAt: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    indexes: [
        {
            unique: true,
            fields: ["studentId", "courseId"]
        }
    ]
});

module.exports = Progress;
