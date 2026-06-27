const express = require('express');
const { Usuario, Rol, Ticket, Comentario, Valoracion, RegistroAuditoria } = require('../modelos');
const { Op } = require('sequelize');
const autenticar = require('../middlewares/autenticar');
const verificarRol = require('../middlewares/verificarRol');

const enrutador = express.Router();

// GET /api/usuarios — solo administrador
enrutador.get('/', autenticar, verificarRol('administrador'), async (req, res) => {
  try {
    const usuarios = await Usuario.findAll({
      attributes: ['id', 'nombre', 'correo', 'id_rol', 'fecha_creacion'],
      include: [{ model: Rol, as: 'rol' }],
    });
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener usuarios', error: error.message });
  }
});

// PUT /api/usuarios/:id — solo administrador
enrutador.put('/:id', autenticar, verificarRol('administrador'), async (req, res) => {
  try {
    const { nombre, correo, rol } = req.body;
    const usuario = await Usuario.findByPk(req.params.id);
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

    const rolRegistro = await Rol.findOne({ where: { nombre: rol } });
    if (!rolRegistro) return res.status(400).json({ mensaje: 'Rol inválido' });

    await usuario.update({ nombre, correo, id_rol: rolRegistro.id_rol });
    res.json({ mensaje: 'Usuario actualizado correctamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar usuario', error: error.message });
  }
});

// DELETE /api/usuarios/:id — solo administrador
enrutador.delete('/:id', autenticar, verificarRol('administrador'), async (req, res) => {
  try {
    const id = req.params.id;
    const usuario = await Usuario.findByPk(id);
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

    // Verificar que no tenga tickets abiertos o en proceso
    const { sequelize } = require('../modelos');
    const estadoCerrado = await sequelize.models.EstadoTicket.findOne({ where: { nombre: 'cerrado' } });
    const ticketsActivos = await Ticket.count({
      where: {
        creado_por: id,
        id_estado: { [Op.ne]: estadoCerrado.id_estado },
      },
    });
    if (ticketsActivos > 0) {
      return res.status(400).json({ mensaje: `No se puede eliminar: el usuario tiene ${ticketsActivos} ticket(s) sin cerrar.` });
    }

    // Eliminar comentarios del usuario
    await Comentario.destroy({ where: { usuario_id: id } });

    // Eliminar valoraciones del usuario
    await Valoracion.destroy({ where: { usuario_id: id } });

    // Eliminar tickets creados por el usuario (y sus comentarios/valoraciones en cascada)
    await Ticket.destroy({ where: { creado_por: id } });

    // Desasignar tickets donde era técnico
    await Ticket.update({ asignado_a: null }, { where: { asignado_a: id } });

    // Nullificar auditoría
    await RegistroAuditoria.update({ usuario_id: null }, { where: { usuario_id: id } });

    await usuario.destroy();
    res.json({ mensaje: 'Usuario eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar usuario', error: error.message });
  }
});

// GET /api/usuarios/:id
enrutador.get('/:id', autenticar, async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id, {
      attributes: ['id', 'nombre', 'correo', 'id_rol', 'fecha_creacion'],
      include: [{ model: Rol, as: 'rol' }],
    });
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener usuario', error: error.message });
  }
});

module.exports = enrutador;
