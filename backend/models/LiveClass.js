const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LiveClass = sequelize.define('LiveClass', {
  courseId: { type: DataTypes.INTEGER, allowNull: false },
  title: { type: DataTypes.STRING, allowNull: false },
  meetLink: { type: DataTypes.STRING, allowNull: false },
  scheduledAt: { type: DataTypes.DATE, allowNull: false },
  teacherId: { type: DataTypes.INTEGER, allowNull: false }
});

module.exports = LiveClass;
