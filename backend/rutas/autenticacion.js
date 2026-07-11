const express = require('express');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const crypto  = require('crypto');
const { Usuario, Rol, RegistroAuditoria } = require('../modelos');

const registrarAuditoria = (usuario_id, accion, tipo_entidad, id_entidad, detalles, ip) =>
  RegistroAuditoria.create({ usuario_id, accion, tipo_entidad, id_entidad, detalles, direccion_ip: ip }).catch(() => {});
const autenticar = require('../middlewares/autenticar');
const { enviarCorreo, plantillaContrasenaProvisional } = require('../servicios/correo');

const enrutador = express.Router();

// POST /api/autenticacion/registro — crea usuario con contraseña provisional (solo admin)
enrutador.post('/registro', autenticar, async (req, res) => {
  try {
    const { nombre, correo, rol } = req.body;

    const rolRegistro = await Rol.findOne({ where: { nombre: rol || 'cliente' } });
    if (!rolRegistro) return res.status(400).json({ mensaje: 'Rol inválido' });

    const existente = await Usuario.findOne({ where: { correo } });
    if (existente) return res.status(409).json({ mensaje: 'El correo ya está registrado' });

    // Generar contraseña provisional de 8 caracteres
    const contrasenaProvisional = crypto.randomBytes(4).toString('hex').toUpperCase();
    const provisional_hash      = await bcrypt.hash(contrasenaProvisional, 10);
    const expira                = new Date(Date.now() + 5 * 60 * 1000); // 5 minutos

    // Hash vacío obligatorio para el campo contrasena_hash
    const contrasena_hash = await bcrypt.hash(crypto.randomUUID(), 10);

    const nuevoUsuario = await Usuario.create({
      nombre,
      correo,
      contrasena_hash,
      id_rol: rolRegistro.id_rol,
      contrasena_provisional_hash: provisional_hash,
      expira_provisional: expira,
      primer_ingreso: true,
    });

    // Enviar correo con contraseña provisional (no bloquea si falla)
    enviarCorreo({
      destinatario: { email: correo, nombre },
      asunto: '🎫 Bienvenido a TickeTics — Tu contraseña provisional',
      html: plantillaContrasenaProvisional(nombre, contrasenaProvisional, correo),
    }).catch(() => {});

    await registrarAuditoria(req.usuario.id, 'crear_usuario', 'usuario', nuevoUsuario.id,
      JSON.stringify({ nombre, correo, rol }), req.ip);

    res.status(201).json({ mensaje: 'Usuario creado. Se envió contraseña provisional al correo.' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al registrar usuario', error: error.message });
  }
});

// POST /api/autenticacion/iniciar-sesion
enrutador.post('/iniciar-sesion', async (req, res) => {
  try {
    const { correo, contrasena } = req.body;

    const usuario = await Usuario.findOne({
      where: { correo },
      include: [{ model: Rol, as: 'rol' }],
    });
    if (!usuario) return res.status(401).json({ mensaje: 'Credenciales incorrectas' });

    let contrasenaValida = false;
    let usandoProvisional = false;

    // Verificar contraseña provisional primero
    if (usuario.contrasena_provisional_hash && usuario.expira_provisional) {
      if (new Date() > usuario.expira_provisional) {
        // Limpiar provisional expirada
        await usuario.update({ contrasena_provisional_hash: null, expira_provisional: null });
      } else {
        usandoProvisional = await bcrypt.compare(contrasena, usuario.contrasena_provisional_hash);
        if (usandoProvisional) contrasenaValida = true;
      }
    }

    // Verificar contraseña definitiva (solo si no es primer ingreso)
    if (!contrasenaValida && !usuario.primer_ingreso) {
      contrasenaValida = await bcrypt.compare(contrasena, usuario.contrasena_hash);
    }

    if (!contrasenaValida) return res.status(401).json({ mensaje: 'Credenciales incorrectas' });

    const rolNombre = usuario.rol.nombre;
    const token = jwt.sign(
      { id: usuario.id, correo: usuario.correo, rol: rolNombre },
      process.env.JWT_SECRETO,
      { expiresIn: '8h' }
    );

    await registrarAuditoria(usuario.id, 'iniciar_sesion', 'usuario', usuario.id,
      JSON.stringify({ correo: usuario.correo }), req.ip);

    res.json({
      token,
      usuario: { id: usuario.id, nombre: usuario.nombre, correo: usuario.correo, rol: rolNombre },
      primer_ingreso: usuario.primer_ingreso || usandoProvisional,
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al iniciar sesión', error: error.message });
  }
});

// PUT /api/autenticacion/cambiar-contrasena — primer ingreso
enrutador.put('/cambiar-contrasena', autenticar, async (req, res) => {
  try {
    const { nueva_contrasena } = req.body;

    if (!nueva_contrasena || nueva_contrasena.length < 8) {
      return res.status(400).json({ mensaje: 'La contraseña debe tener al menos 8 caracteres' });
    }

    const contrasena_hash = await bcrypt.hash(nueva_contrasena, 10);

    await Usuario.update(
      {
        contrasena_hash,
        primer_ingreso: false,
        contrasena_provisional_hash: null,
        expira_provisional: null,
      },
      { where: { id: req.usuario.id } }
    );

    await registrarAuditoria(req.usuario.id, 'cambiar_contrasena', 'usuario', req.usuario.id,
      null, req.ip);

    res.json({ mensaje: 'Contraseña actualizada correctamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al cambiar contraseña', error: error.message });
  }
});

module.exports = enrutador;
