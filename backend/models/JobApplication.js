const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const JobApplication = sequelize.define('JobApplication', {
  studentId: { type: DataTypes.INTEGER, allowNull: false },
  company: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.STRING, allowNull: false },
  status: { type: DataTypes.ENUM('applied','shortlisted','rejected','selected'), defaultValue: 'applied' }
});

module.exports = JobApplication;
