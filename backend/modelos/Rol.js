const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Rol', {
    id_rol:  { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    nombre:  { type: DataTypes.STRING(50), allowNull: false, unique: true },
  }, { tableName: 'roles', timestamps: false });
};
