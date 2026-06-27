const express = require('express');
const { Usuario, Rol } = require('../modelos');
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
    const usuario = await Usuario.findByPk(req.params.id);
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
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
