const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Assignment = sequelize.define('Assignment', {
  courseId: { type: DataTypes.INTEGER, allowNull: false },
  title: { type: DataTypes.STRING, allowNull: false },
  question: { type: DataTypes.TEXT, allowNull: false },
  type: { type: DataTypes.ENUM('mcq','coding','upload'), allowNull: false, defaultValue: 'upload' },
  optionA: { type: DataTypes.STRING, allowNull: true },
  optionB: { type: DataTypes.STRING, allowNull: true },
  optionC: { type: DataTypes.STRING, allowNull: true },
  optionD: { type: DataTypes.STRING, allowNull: true },
  correctAnswer: { type: DataTypes.STRING, allowNull: true },
  dueDate: { type: DataTypes.DATE, allowNull: true }
});

module.exports = Assignment;
