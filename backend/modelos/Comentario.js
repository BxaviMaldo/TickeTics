const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Comentario', {
    id:             { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    ticket_id:      { type: DataTypes.INTEGER, allowNull: false, references: { model: 'tickets', key: 'id' } },
    usuario_id:     { type: DataTypes.INTEGER, allowNull: false, references: { model: 'usuarios', key: 'id' } },
    contenido:      { type: DataTypes.TEXT, allowNull: false },
    fecha_creacion: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, { tableName: 'comentarios', timestamps: false });
};
