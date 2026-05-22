const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Review = sequelize.define('Review', {
  studentId: { type: DataTypes.INTEGER, allowNull: false },
  courseId: { type: DataTypes.INTEGER, allowNull: false },
  rating: { type: DataTypes.INTEGER, allowNull: false },
  comment: { type: DataTypes.TEXT, allowNull: false },
  status: { type: DataTypes.ENUM('pending','approved','rejected'), defaultValue: 'pending' }
});

module.exports = Review;
