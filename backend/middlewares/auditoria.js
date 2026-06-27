const { RegistroAuditoria } = require('../modelos');

const registrar = (accion, tipo_entidad) => async (req, res, next) => {
  const original = res.json.bind(res);
  res.json = async (datos) => {
    if (res.statusCode < 400 && req.usuario) {
      try {
        await RegistroAuditoria.create({
          usuario_id:  req.usuario.id,
          accion,
          tipo_entidad,
          id_entidad:  datos?.id || req.params?.id || null,
          detalles:    JSON.stringify({ metodo: req.method, ruta: req.originalUrl }),
          direccion_ip: req.ip,
        });
      } catch (_) {}
    }
    return original(datos);
  };
  next();
};

module.exports = registrar;
