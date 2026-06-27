const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Ticket', {
    id:                  { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    titulo:              { type: DataTypes.STRING(255), allowNull: false },
    descripcion:         { type: DataTypes.TEXT, allowNull: false },
    id_estado:           { type: DataTypes.INTEGER, allowNull: false, references: { model: 'estados_ticket', key: 'id_estado' } },
    id_prioridad:        { type: DataTypes.INTEGER, allowNull: false, references: { model: 'prioridades_ticket', key: 'id_prioridad' } },
    creado_por:          { type: DataTypes.INTEGER, allowNull: false, references: { model: 'usuarios', key: 'id' } },
    asignado_a:          { type: DataTypes.INTEGER, allowNull: true,  references: { model: 'usuarios', key: 'id' } },
    fecha_creacion:      { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    fecha_actualizacion: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    fecha_cierre:        { type: DataTypes.DATE, allowNull: true },
  }, { tableName: 'tickets', timestamps: false });
};
