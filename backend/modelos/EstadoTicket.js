const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('EstadoTicket', {
    id_estado: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    nombre:    { type: DataTypes.STRING(50), allowNull: false, unique: true },
  }, { tableName: 'estados_ticket', timestamps: false });
};
