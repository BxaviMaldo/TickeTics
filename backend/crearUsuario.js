require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, Rol, Usuario } = require('./modelos');

const usuariosPrueba = [
  { nombre: 'Administrador', correo: 'admin@ticketics.com',   contrasena: 'Admin123!',   rol: 'administrador' },
  { nombre: 'Técnico Demo',  correo: 'tecnico@ticketics.com', contrasena: 'Tecnico123!', rol: 'tecnico' },
  { nombre: 'Cliente Demo',  correo: 'cliente@ticketics.com', contrasena: 'Cliente123!', rol: 'cliente' },
];

(async () => {
  try {
    await sequelize.authenticate();

    for (const u of usuariosPrueba) {
      const rolRegistro = await Rol.findOne({ where: { nombre: u.rol } });
      if (!rolRegistro) { console.error(`Rol no encontrado: ${u.rol}`); continue; }

      const existente = await Usuario.findOne({ where: { correo: u.correo } });
      if (existente) { console.log(`Ya existe: ${u.correo}`); continue; }

      const contrasena_hash = await bcrypt.hash(u.contrasena, 10);
      await Usuario.create({ nombre: u.nombre, correo: u.correo, contrasena_hash, id_rol: rolRegistro.id_rol });
      console.log(`Creado: [${u.rol}] ${u.correo} / ${u.contrasena}`);
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await sequelize.close();
  }
})();
