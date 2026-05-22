const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Notification = sequelize.define('Notification', {
  userId: { type: DataTypes.INTEGER, allowNull: true },
  role: { type: DataTypes.ENUM('student','teacher','admin','all'), defaultValue: 'all' },
  title: { type: DataTypes.STRING, allowNull: false },
  message: { type: DataTypes.TEXT, allowNull: false },
  isRead: { type: DataTypes.BOOLEAN, defaultValue: false }
});

module.exports = Notification;
