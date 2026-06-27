const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Usuario', {
    id:              { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    nombre:          { type: DataTypes.STRING(255), allowNull: false },
    correo:          { type: DataTypes.STRING(255), allowNull: false, unique: true },
    contrasena_hash: { type: DataTypes.STRING(255), allowNull: false },
    id_rol:          { type: DataTypes.INTEGER, allowNull: false, references: { model: 'roles', key: 'id_rol' } },
    fecha_creacion:  { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    contrasena_provisional_hash: { type: DataTypes.STRING(255), allowNull: true },
    expira_provisional:          { type: DataTypes.DATE, allowNull: true },
    primer_ingreso:              { type: DataTypes.BOOLEAN, defaultValue: false },
  }, { tableName: 'usuarios', timestamps: false });
};
