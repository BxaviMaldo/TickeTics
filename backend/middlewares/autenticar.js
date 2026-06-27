const jwt = require('jsonwebtoken');

const autenticar = (req, res, next) => {
  const encabezado = req.headers['authorization'];
  const token = encabezado && encabezado.split(' ')[1];

  if (!token) {
    return res.status(401).json({ mensaje: 'Token de acceso requerido' });
  }

  try {
    const datos = jwt.verify(token, process.env.JWT_SECRETO);
    req.usuario = datos;
    next();
  } catch (error) {
    return res.status(403).json({ mensaje: 'Token inválido o expirado' });
  }
};

module.exports = autenticar;
