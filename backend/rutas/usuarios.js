const express = require('express');
const { Usuario, Rol, Ticket, Comentario, Valoracion, RegistroAuditoria, EstadoTicket } = require('../modelos');
const { Op } = require('sequelize');
const autenticar = require('../middlewares/autenticar');
const verificarRol = require('../middlewares/verificarRol');
const registrar = require('../middlewares/auditoria');

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
enrutador.put('/:id', autenticar, verificarRol('administrador'), registrar('actualizar_usuario', 'usuario'), async (req, res) => {
  try {
    const { nombre, correo, rol } = req.body;
    const usuario = await Usuario.findByPk(req.params.id);
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

    const rolRegistro = await Rol.findOne({ where: { nombre: rol } });
    if (!rolRegistro) return res.status(400).json({ mensaje: 'Rol inválido' });

    await usuario.update({ nombre, correo, id_rol: rolRegistro.id_rol });
    res.json({ mensaje: 'Usuario actualizado correctamente', id: usuario.id });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar usuario', error: error.message });
  }
});

// DELETE /api/usuarios/:id — solo administrador
enrutador.delete('/:id', autenticar, verificarRol('administrador'), async (req, res) => {
  try {
    const id = req.params.id;
    if (Number(id) === req.usuario.id) {
      return res.status(400).json({ mensaje: 'No puedes eliminar tu propia cuenta.' });
    }
    const usuario = await Usuario.findByPk(id);
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

    // Verificar que no tenga tickets abiertos o en proceso
    const estadoCerrado = await EstadoTicket.findOne({ where: { nombre: 'cerrado' } });
    const ticketsActivos = await Ticket.count({
      where: { creado_por: id, id_estado: { [Op.ne]: estadoCerrado.id_estado } },
    });
    if (ticketsActivos > 0) {
      return res.status(400).json({ mensaje: `No se puede eliminar: el usuario tiene ${ticketsActivos} ticket(s) sin cerrar.` });
    }

    // Eliminar comentarios del usuario
    await Comentario.destroy({ where: { usuario_id: id } });

    // Eliminar valoraciones del usuario
    await Valoracion.destroy({ where: { usuario_id: id } });

    // Desasignar tickets donde era técnico
    await Ticket.update({ asignado_a: null }, { where: { asignado_a: id } });

    // Nullificar referencias en auditoría
    await RegistroAuditoria.update({ usuario_id: null }, { where: { usuario_id: id } });

    const nombreUsuario = usuario.nombre;
    const correoUsuario = usuario.correo;
    await usuario.destroy();

    // Registrar en auditoría
    await RegistroAuditoria.create({
      usuario_id: req.usuario.id,
      accion: 'eliminar_usuario',
      tipo_entidad: 'usuario',
      id_entidad: Number(id),
      detalles: JSON.stringify({ nombre: nombreUsuario, correo: correoUsuario }),
      direccion_ip: req.ip,
    }).catch(() => {});

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
