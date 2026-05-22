const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const StudentNote = sequelize.define('StudentNote', {
  studentId: { type: DataTypes.INTEGER, allowNull: false },
  courseId: { type: DataTypes.INTEGER, allowNull: false },
  title: { type: DataTypes.STRING, allowNull: false },
  content: { type: DataTypes.TEXT, allowNull: false },
  timestampSeconds: { type: DataTypes.INTEGER, defaultValue: 0 }
});

module.exports = StudentNote;
