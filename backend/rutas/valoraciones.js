const express = require('express');
const { Valoracion, Ticket, Usuario, Rol, sequelize } = require('../modelos');
const autenticar = require('../middlewares/autenticar');
const { Op, fn, col, literal } = require('sequelize');

const enrutador = express.Router();

// POST /api/valoraciones — cliente califica ticket resuelto
enrutador.post('/', autenticar, async (req, res) => {
  try {
    const { ticket_id, calificacion, comentario } = req.body;

    const ticket = await Ticket.findByPk(ticket_id, {
      include: [{ model: require('../modelos').EstadoTicket, as: 'estado' }],
    });
    if (!ticket) return res.status(404).json({ mensaje: 'Ticket no encontrado' });
    if (ticket.creado_por !== req.usuario.id) return res.status(403).json({ mensaje: 'Solo puedes calificar tus propios tickets' });
    if (ticket.estado.nombre !== 'cerrado') return res.status(400).json({ mensaje: 'Solo puedes calificar tickets cerrados' });

    const existente = await Valoracion.findOne({ where: { ticket_id } });
    if (existente) return res.status(409).json({ mensaje: 'Este ticket ya fue calificado' });

    const valoracion = await Valoracion.create({ ticket_id, usuario_id: req.usuario.id, calificacion, comentario });
    res.status(201).json(valoracion);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear valoración', error: error.message });
  }
});

// GET /api/valoraciones/tecnicos-destacados — top 3 técnicos por calificación promedio
enrutador.get('/tecnicos-destacados', autenticar, async (req, res) => {
  try {
    const [resultados] = await sequelize.query(`
      SELECT u.id, u.nombre,
             ROUND(AVG(v.calificacion)::numeric, 2) AS promedio,
             COUNT(v.id) AS total_valoraciones
      FROM usuarios u
      JOIN roles r ON u.id_rol = r.id_rol
      JOIN tickets t ON t.asignado_a = u.id
      JOIN valoraciones v ON v.ticket_id = t.id
      WHERE r.nombre = 'tecnico'
      GROUP BY u.id, u.nombre
      ORDER BY promedio DESC
      LIMIT 3
    `);
    res.json(resultados);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener técnicos destacados', error: error.message });
  }
});

// GET /api/valoraciones/estadisticas/:tecnicoId
enrutador.get('/estadisticas/:tecnicoId', autenticar, async (req, res) => {
  try {
    const { tecnicoId } = req.params;

    // Técnico solo ve sus propias stats; admin ve cualquiera
    if (req.usuario.rol === 'tecnico' && req.usuario.id !== parseInt(tecnicoId)) {
      return res.status(403).json({ mensaje: 'No autorizado' });
    }

    const { sequelize } = require('../modelos');
    const [stats] = await sequelize.query(`
      SELECT
        COUNT(t.id)                                                      AS total_tickets,
        COUNT(t.id) FILTER (WHERE e.nombre = 'cerrado')                  AS resueltos,
        COUNT(t.id) FILTER (WHERE e.nombre = 'en_proceso')               AS en_proceso,
        COUNT(t.id) FILTER (WHERE e.nombre = 'abierto')                  AS abiertos,
        ROUND(AVG(v.calificacion)::numeric, 2)                           AS promedio_calificacion,
        COUNT(v.id)                                                      AS total_valoraciones,
        ROUND(AVG(EXTRACT(EPOCH FROM (t.fecha_cierre - t.fecha_creacion)) / 3600)
          FILTER (WHERE t.fecha_cierre IS NOT NULL)::numeric, 1)         AS horas_promedio_resolucion
      FROM tickets t
      JOIN estados_ticket e ON e.id_estado = t.id_estado
      LEFT JOIN valoraciones v ON v.ticket_id = t.id
      WHERE t.asignado_a = :tecnicoId
    `, { replacements: { tecnicoId }, type: sequelize.QueryTypes.SELECT });

    const [porSemana] = await sequelize.query(`
      SELECT
        DATE_TRUNC('week', t.fecha_creacion) AS semana,
        COUNT(t.id) AS tickets
      FROM tickets t
      WHERE t.asignado_a = :tecnicoId
        AND t.fecha_creacion >= NOW() - INTERVAL '8 weeks'
      GROUP BY semana
      ORDER BY semana
    `, { replacements: { tecnicoId }, type: sequelize.QueryTypes.SELECT });

    res.json({ resumen: stats, por_semana: porSemana });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener estadísticas', error: error.message });
  }
});

module.exports = enrutador;
