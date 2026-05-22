const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Lesson = sequelize.define('Lesson', {
  courseId: { type: DataTypes.INTEGER, allowNull: false },
  title: { type: DataTypes.STRING, allowNull: false },
  contentType: { type: DataTypes.ENUM('video','notes','quiz','assignment'), defaultValue: 'video' },
  contentUrl: { type: DataTypes.STRING, allowNull: true },
  sortOrder: { type: DataTypes.INTEGER, defaultValue: 1 }
});

module.exports = Lesson;
