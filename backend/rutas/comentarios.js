const express = require('express');
const { Comentario, Usuario, Rol } = require('../modelos');
const autenticar = require('../middlewares/autenticar');

const enrutador = express.Router();

// GET /api/comentarios/:ticketId
enrutador.get('/:ticketId', autenticar, async (req, res) => {
  try {
    const comentarios = await Comentario.findAll({
      where: { ticket_id: req.params.ticketId },
      include: [{ model: Usuario, as: 'autor', attributes: ['id', 'nombre'], include: [{ model: Rol, as: 'rol', attributes: ['nombre'] }] }],
    });
    res.json(comentarios);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener comentarios', error: error.message });
  }
});

// POST /api/comentarios
enrutador.post('/', autenticar, async (req, res) => {
  try {
    const { ticket_id, contenido } = req.body;
    const nuevoComentario = await Comentario.create({
      ticket_id,
      contenido,
      usuario_id: req.usuario.id,
    });
    res.status(201).json(nuevoComentario);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear comentario', error: error.message });
  }
});

module.exports = enrutador;
