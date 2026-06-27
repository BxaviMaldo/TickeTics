const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('RegistroAuditoria', {
    id:             { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    usuario_id:     { type: DataTypes.INTEGER, allowNull: true, references: { model: 'usuarios', key: 'id' } },
    accion:         { type: DataTypes.STRING(255), allowNull: false },
    tipo_entidad:   { type: DataTypes.STRING(255), allowNull: false },
    id_entidad:     { type: DataTypes.INTEGER, allowNull: true },
    detalles:       { type: DataTypes.TEXT, allowNull: true },
    direccion_ip:   { type: DataTypes.STRING(255), allowNull: true },
    fecha_creacion: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, { tableName: 'registro_auditoria', timestamps: false });
};
