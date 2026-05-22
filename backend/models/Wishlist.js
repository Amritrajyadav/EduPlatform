const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Wishlist = sequelize.define('Wishlist', {
  studentId: { type: DataTypes.INTEGER, allowNull: false },
  courseId: { type: DataTypes.INTEGER, allowNull: false }
}, { indexes: [{ unique: true, fields: ['studentId','courseId'] }] });

module.exports = Wishlist;
