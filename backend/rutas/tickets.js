const express = require('express');
const { Ticket, Usuario, EstadoTicket, PrioridadTicket, Valoracion } = require('../modelos');
const autenticar  = require('../middlewares/autenticar');
const verificarRol = require('../middlewares/verificarRol');
const registrar   = require('../middlewares/auditoria');
const { enviarCorreo, plantillaTicketAsignado, plantillaTicketClienteAsignado } = require('../servicios/correo');

const enrutador = express.Router();

const incluirCompleto = [
  { model: Usuario,         as: 'creador',   attributes: ['id', 'nombre', 'correo'] },
  { model: Usuario,         as: 'tecnico',   attributes: ['id', 'nombre', 'correo'] },
  { model: EstadoTicket,    as: 'estado' },
  { model: PrioridadTicket, as: 'prioridad' },
  { model: Valoracion,      as: 'valoracion' },
];

// GET /api/tickets/catalogos — estados y prioridades
enrutador.get('/catalogos', autenticar, async (req, res) => {
  try {
    const [estados, prioridades] = await Promise.all([
      EstadoTicket.findAll({ order: [['id_estado', 'ASC']] }),
      PrioridadTicket.findAll({ order: [['id_prioridad', 'ASC']] }),
    ]);
    res.json({ estados, prioridades });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener catálogos', error: error.message });
  }
});

// GET /api/tickets
enrutador.get('/', autenticar, async (req, res) => {
  try {
    const { rol, id } = req.usuario;
    const condicion =
      rol === 'cliente' ? { creado_por: id } :
      rol === 'tecnico' ? { asignado_a: id } : {};

    const tickets = await Ticket.findAll({
      where: condicion,
      include: incluirCompleto,
      order: [['fecha_creacion', 'DESC']],
    });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener tickets', error: error.message });
  }
});

// GET /api/tickets/:id
enrutador.get('/:id', autenticar, async (req, res) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id, { include: incluirCompleto });
    if (!ticket) return res.status(404).json({ mensaje: 'Ticket no encontrado' });
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener ticket', error: error.message });
  }
});

// POST /api/tickets
enrutador.post('/', autenticar, verificarRol('cliente', 'administrador'), registrar('crear_ticket', 'ticket'), async (req, res) => {
  try {
    const { titulo, descripcion, id_prioridad } = req.body;
    const estadoAbierto = await EstadoTicket.findOne({ where: { nombre: 'abierto' } });
    const nuevoTicket = await Ticket.create({
      titulo, descripcion, id_prioridad,
      id_estado: estadoAbierto.id_estado,
      creado_por: req.usuario.id,
    });
    res.status(201).json(nuevoTicket);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear ticket', error: error.message });
  }
});

// PUT /api/tickets/:id
enrutador.put('/:id', autenticar, registrar('actualizar_ticket', 'ticket'), async (req, res) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id, { include: incluirCompleto });
    if (!ticket) return res.status(404).json({ mensaje: 'Ticket no encontrado' });

    const tecnicoAnterior = ticket.asignado_a;
    const datosActualizar = { ...req.body };

    // Auto-cambiar a "en_proceso" al asignar técnico
    if (req.body.asignado_a && req.body.asignado_a !== tecnicoAnterior) {
      const estadoEnProceso = await EstadoTicket.findOne({ where: { nombre: 'en_proceso' } });
      if (estadoEnProceso) datosActualizar.id_estado = estadoEnProceso.id_estado;
    }

    // Registrar fecha_cierre al cerrar el ticket
    if (req.body.id_estado) {
      const estadoCerrado = await EstadoTicket.findOne({ where: { nombre: 'cerrado' } });
      if (estadoCerrado && req.body.id_estado === estadoCerrado.id_estado) {
        datosActualizar.fecha_cierre = new Date();
      }
    }

    await ticket.update(datosActualizar);

    // Enviar correos si se asignó un técnico nuevo
    if (req.body.asignado_a && req.body.asignado_a !== tecnicoAnterior) {
      const [tecnico, creador, prioridad] = await Promise.all([
        Usuario.findByPk(req.body.asignado_a),
        Usuario.findByPk(ticket.creado_por),
        PrioridadTicket.findByPk(ticket.id_prioridad),
      ]);

      const infoTicket = { id: ticket.id, titulo: ticket.titulo, prioridad: prioridad?.nombre || '' };

      if (tecnico) {
        await enviarCorreo({
          destinatario: { email: tecnico.correo, nombre: tecnico.nombre },
          asunto: `🎫 Nuevo ticket asignado #${ticket.id}`,
          html: plantillaTicketAsignado(tecnico, infoTicket),
        });
      }
      if (creador) {
        await enviarCorreo({
          destinatario: { email: creador.correo, nombre: creador.nombre },
          asunto: `✅ Tu ticket #${ticket.id} fue asignado`,
          html: plantillaTicketClienteAsignado(creador, infoTicket, tecnico),
        });
      }
    }

    const ticketActualizado = await Ticket.findByPk(ticket.id, { include: incluirCompleto });
    res.json(ticketActualizado);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar ticket', error: error.message });
  }
});

// DELETE /api/tickets/:id
enrutador.delete('/:id', autenticar, verificarRol('administrador'), registrar('eliminar_ticket', 'ticket'), async (req, res) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id);
    if (!ticket) return res.status(404).json({ mensaje: 'Ticket no encontrado' });
    await ticket.destroy();
    res.json({ mensaje: 'Ticket eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar ticket', error: error.message });
  }
});

module.exports = enrutador;
