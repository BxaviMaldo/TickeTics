require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.BD_NOMBRE,
  process.env.BD_USUARIO,
  process.env.BD_CONTRASENA,
  {
    host: process.env.BD_HOST,
    port: process.env.BD_PUERTO,
    dialect: 'postgres',
    logging: false,
  }
);

const Rol             = require('./Rol')(sequelize);
const EstadoTicket    = require('./EstadoTicket')(sequelize);
const PrioridadTicket = require('./PrioridadTicket')(sequelize);
const Usuario         = require('./Usuario')(sequelize);
const Ticket          = require('./Ticket')(sequelize);
const Comentario      = require('./Comentario')(sequelize);
const RegistroAuditoria = require('./RegistroAuditoria')(sequelize);
const Valoracion      = require('./Valoracion')(sequelize);

// Asociaciones de roles y catálogos
Rol.hasMany(Usuario, { foreignKey: 'id_rol', as: 'usuarios' });
Usuario.belongsTo(Rol, { foreignKey: 'id_rol', as: 'rol' });

EstadoTicket.hasMany(Ticket, { foreignKey: 'id_estado', as: 'tickets' });
Ticket.belongsTo(EstadoTicket, { foreignKey: 'id_estado', as: 'estado' });

PrioridadTicket.hasMany(Ticket, { foreignKey: 'id_prioridad', as: 'tickets' });
Ticket.belongsTo(PrioridadTicket, { foreignKey: 'id_prioridad', as: 'prioridad' });

// Asociaciones de tickets y usuarios
Usuario.hasMany(Ticket, { foreignKey: 'creado_por', as: 'ticketsCreados' });
Ticket.belongsTo(Usuario, { foreignKey: 'creado_por', as: 'creador' });

Usuario.hasMany(Ticket, { foreignKey: 'asignado_a', as: 'ticketsAsignados' });
Ticket.belongsTo(Usuario, { foreignKey: 'asignado_a', as: 'tecnico' });

// Asociaciones de comentarios
Ticket.hasMany(Comentario, { foreignKey: 'ticket_id', as: 'comentarios' });
Comentario.belongsTo(Ticket, { foreignKey: 'ticket_id', as: 'ticket' });
Usuario.hasMany(Comentario, { foreignKey: 'usuario_id', as: 'comentarios' });
Comentario.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'autor' });

// Asociaciones de auditoría
Usuario.hasMany(RegistroAuditoria, { foreignKey: 'usuario_id', as: 'registros' });
RegistroAuditoria.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });

// Asociaciones de valoraciones
Ticket.hasOne(Valoracion, { foreignKey: 'ticket_id', as: 'valoracion' });
Valoracion.belongsTo(Ticket, { foreignKey: 'ticket_id', as: 'ticket' });
Usuario.hasMany(Valoracion, { foreignKey: 'usuario_id', as: 'valoraciones' });
Valoracion.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'cliente' });

module.exports = {
  sequelize,
  Rol, EstadoTicket, PrioridadTicket,
  Usuario, Ticket, Comentario, RegistroAuditoria, Valoracion,
};
