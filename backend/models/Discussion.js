const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Discussion = sequelize.define('Discussion', {
  courseId: { type: DataTypes.INTEGER, allowNull: false },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  parentId: { type: DataTypes.INTEGER, allowNull: true },
  message: { type: DataTypes.TEXT, allowNull: false }
});

module.exports = Discussion;
