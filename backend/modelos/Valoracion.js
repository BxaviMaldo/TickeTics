const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Valoracion', {
    id:             { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    ticket_id:      { type: DataTypes.INTEGER, allowNull: false, unique: true, references: { model: 'tickets', key: 'id' } },
    usuario_id:     { type: DataTypes.INTEGER, allowNull: false, references: { model: 'usuarios', key: 'id' } },
    calificacion:   { type: DataTypes.SMALLINT, allowNull: false, validate: { min: 1, max: 5 } },
    comentario:     { type: DataTypes.TEXT, allowNull: true },
    fecha_creacion: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, { tableName: 'valoraciones', timestamps: false });
};
