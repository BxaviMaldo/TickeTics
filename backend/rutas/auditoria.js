const express = require('express');
const { RegistroAuditoria, Usuario } = require('../modelos');
const autenticar = require('../middlewares/autenticar');
const verificarRol = require('../middlewares/verificarRol');

const enrutador = express.Router();

// GET /api/auditoria — solo administrador
enrutador.get('/', autenticar, verificarRol('administrador'), async (req, res) => {
  try {
    const registros = await RegistroAuditoria.findAll({
      include: [{ model: Usuario, as: 'usuario', attributes: ['id', 'nombre', 'correo'] }],
      order: [['fecha_creacion', 'DESC']],
      limit: 200,
    });
    res.json(registros);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener auditoría', error: error.message });
  }
});

module.exports = enrutador;
