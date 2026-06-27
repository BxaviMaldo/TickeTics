require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const { sequelize } = require('./modelos');

const aplicacion = express();
const PUERTO = process.env.PUERTO || 3000;

aplicacion.use(helmet({ contentSecurityPolicy: false }));
const origenesPermitidos = (process.env.FRONTEND_URL || 'http://localhost:5173').split(',');
aplicacion.use(cors({ origin: origenesPermitidos, credentials: true }));
aplicacion.use(morgan('dev'));
aplicacion.use(express.json());
aplicacion.use(express.urlencoded({ extended: true }));

aplicacion.use('/api/autenticacion', require('./rutas/autenticacion'));
aplicacion.use('/api/usuarios',      require('./rutas/usuarios'));
aplicacion.use('/api/tickets',       require('./rutas/tickets'));
aplicacion.use('/api/comentarios',   require('./rutas/comentarios'));
aplicacion.use('/api/valoraciones',  require('./rutas/valoraciones'));
aplicacion.use('/api/auditoria',     require('./rutas/auditoria'));

aplicacion.get('/api/salud', (req, res) => {
  res.json({ mensaje: 'Servidor TickeTics funcionando correctamente' });
});

sequelize
  .authenticate()
  .then(() => {
    console.log('Conexión a la base de datos establecida correctamente.');
    aplicacion.listen(PUERTO, () => {
      console.log(`Servidor TickeTics corriendo en el puerto ${PUERTO}`);
    });
  })
  .catch((error) => {
    console.error('Error al conectar con la base de datos:', error);
  });
