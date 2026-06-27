const axios = require('axios');

const brevo = axios.create({
  baseURL: 'https://api.brevo.com/v3',
  headers: {
    'api-key':      process.env.BREVO_API_KEY,
    'Content-Type': 'application/json',
  },
});

const enviarCorreo = async ({ destinatario, asunto, html }) => {
  try {
    await brevo.post('/smtp/email', {
      sender:      { email: process.env.BREVO_REMITENTE_EMAIL, name: process.env.BREVO_REMITENTE_NOMBRE },
      to:          [{ email: destinatario.email, name: destinatario.nombre }],
      subject:     asunto,
      htmlContent: html,
    });
    console.log(`Correo enviado a ${destinatario.email}`);
  } catch (error) {
    console.error('Error al enviar correo:', error?.response?.data || error.message);
  }
};

const plantillaContrasenaProvisional = (nombre, contrasena, correo) => `
<div style="font-family:sans-serif;max-width:520px;margin:auto;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden">
  <div style="background:#2d3250;padding:1.5rem;text-align:center">
    <h1 style="color:#f9b17a;margin:0">🎫 TickeTics</h1>
  </div>
  <div style="padding:2rem">
    <p>Hola <strong>${nombre}</strong>,</p>
    <p>Tu cuenta ha sido creada en el sistema de soporte. Usa las siguientes credenciales para ingresar:</p>
    <div style="background:#f0f2f8;border-radius:8px;padding:1.25rem;margin:1.5rem 0">
      <p style="margin:0 0 0.5rem;color:#6b7280;font-size:0.85rem;font-weight:600">USUARIO</p>
      <p style="margin:0 0 1rem;font-size:1.1rem;font-weight:700;color:#2d3250">${correo}</p>
      <p style="margin:0 0 0.5rem;color:#6b7280;font-size:0.85rem;font-weight:600">CONTRASEÑA PROVISIONAL</p>
      <p style="margin:0;font-size:1.8rem;font-weight:800;letter-spacing:4px;color:#2d3250;text-align:center">${contrasena}</p>
    </div>
    <p style="color:#dc2626;font-weight:600">⏱ Esta contraseña expira en 5 minutos.</p>
    <p>Al ingresar deberás crear una contraseña personal segura.</p>
    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/iniciar-sesion"
       style="display:block;background:#2d3250;color:#fff;text-align:center;padding:.8rem;border-radius:8px;text-decoration:none;font-weight:700;margin-top:1rem">
      Ingresar a TickeTics
    </a>
  </div>
</div>`;

const plantillaTicketAsignado = (tecnico, ticket) => `
<div style="font-family:sans-serif;max-width:520px;margin:auto;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden">
  <div style="background:#2d3250;padding:1.5rem;text-align:center">
    <h1 style="color:#f9b17a;margin:0">🎫 TickeTics</h1>
  </div>
  <div style="padding:2rem">
    <p>Hola <strong>${tecnico.nombre}</strong>,</p>
    <p>Se te ha asignado un nuevo ticket de soporte:</p>
    <div style="background:#f0f2f8;border-radius:8px;padding:1.25rem;margin:1rem 0">
      <p><strong>Ticket #${ticket.id}</strong></p>
      <p><strong>Título:</strong> ${ticket.titulo}</p>
      <p><strong>Prioridad:</strong> ${ticket.prioridad}</p>
    </div>
    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/tecnico/ticket/${ticket.id}"
       style="display:block;background:#424769;color:#fff;text-align:center;padding:.8rem;border-radius:8px;text-decoration:none;font-weight:700;margin-top:1rem">
      Ver Ticket
    </a>
  </div>
</div>`;

const plantillaTicketClienteAsignado = (clienteUsuario, ticket, tecnico) => `
<div style="font-family:sans-serif;max-width:520px;margin:auto;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden">
  <div style="background:#2d3250;padding:1.5rem;text-align:center">
    <h1 style="color:#f9b17a;margin:0">🎫 TickeTics</h1>
  </div>
  <div style="padding:2rem">
    <p>Hola <strong>${clienteUsuario.nombre}</strong>,</p>
    <p>Tu ticket ha sido asignado a un técnico que te atenderá:</p>
    <div style="background:#f0f2f8;border-radius:8px;padding:1.25rem;margin:1rem 0">
      <p><strong>Ticket #${ticket.id}:</strong> ${ticket.titulo}</p>
      <p><strong>Técnico asignado:</strong> ${tecnico ? tecnico.nombre : 'Sin asignar'}</p>
    </div>
    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/cliente/ticket/${ticket.id}"
       style="display:block;background:#2d3250;color:#fff;text-align:center;padding:.8rem;border-radius:8px;text-decoration:none;font-weight:700;margin-top:1rem">
      Ver mi ticket
    </a>
  </div>
</div>`;

module.exports = {
  enviarCorreo,
  plantillaContrasenaProvisional,
  plantillaTicketAsignado,
  plantillaTicketClienteAsignado,
};
