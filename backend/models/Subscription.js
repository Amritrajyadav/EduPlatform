const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Subscription = sequelize.define('Subscription', {
  studentId: { type: DataTypes.INTEGER, allowNull: false },
  plan: { type: DataTypes.ENUM('monthly','yearly'), defaultValue: 'monthly' },
  status: { type: DataTypes.ENUM('active','expired','cancelled'), defaultValue: 'active' },
  startDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  endDate: { type: DataTypes.DATE, allowNull: false }
});

module.exports = Subscription;
