const { DataTypes } = require("sequelize");

const sequelize = require("../config/database");

const Note = sequelize.define("Note", {

    courseId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

    title: {
        type: DataTypes.STRING,
        allowNull: false
    },

    fileUrl: {
        type: DataTypes.STRING,
        allowNull: false
    }

});

module.exports = Note;