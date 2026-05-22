const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Resume = sequelize.define('Resume', {
  studentId: { type: DataTypes.INTEGER, allowNull: false },
  title: { type: DataTypes.STRING, allowNull: false },
  fileUrl: { type: DataTypes.STRING, allowNull: false }
});

module.exports = Resume;
