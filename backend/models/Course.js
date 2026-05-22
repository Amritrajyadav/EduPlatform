const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Course = sequelize.define("Course", {
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },

    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },

    price: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    thumbnail: {
        type: DataTypes.STRING,
        allowNull: true
    },

    videoUrl: {
        type: DataTypes.STRING,
        allowNull: true
    },

    teacherId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
});

module.exports = Course;