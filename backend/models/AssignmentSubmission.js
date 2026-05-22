const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AssignmentSubmission = sequelize.define('AssignmentSubmission', {
  assignmentId: { type: DataTypes.INTEGER, allowNull: false },
  studentId: { type: DataTypes.INTEGER, allowNull: false },
  answer: { type: DataTypes.TEXT, allowNull: true },
  fileUrl: { type: DataTypes.STRING, allowNull: true },
  marks: { type: DataTypes.INTEGER, allowNull: true },
  feedback: { type: DataTypes.TEXT, allowNull: true },
  status: { type: DataTypes.ENUM('submitted','graded'), defaultValue: 'submitted' }
});

module.exports = AssignmentSubmission;
