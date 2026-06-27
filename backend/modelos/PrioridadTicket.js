const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('PrioridadTicket', {
    id_prioridad: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    nombre:       { type: DataTypes.STRING(50), allowNull: false, unique: true },
  }, { tableName: 'prioridades_ticket', timestamps: false });
};
