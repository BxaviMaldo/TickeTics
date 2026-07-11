const jwt = require('jsonwebtoken');
const { Usuario } = require('../modelos');

const autenticar = async (req, res, next) => {
  const encabezado = req.headers['authorization'];
  const token = encabezado && encabezado.split(' ')[1];

  if (!token) {
    return res.status(401).json({ mensaje: 'Token de acceso requerido' });
  }

  try {
    const datos = jwt.verify(token, process.env.JWT_SECRETO);

    const usuario = await Usuario.findByPk(datos.id, { attributes: ['id', 'sesion_token'] });
    if (!usuario) {
      return res.status(401).json({ mensaje: 'Usuario no encontrado' });
    }

    if (usuario.sesion_token !== datos.sesion_token) {
      return res.status(401).json({ mensaje: 'SESION_OTRO_DISPOSITIVO' });
    }

    req.usuario = datos;
    next();
  } catch (error) {
    return res.status(403).json({ mensaje: 'Token inválido o expirado' });
  }
};

module.exports = autenticar;
