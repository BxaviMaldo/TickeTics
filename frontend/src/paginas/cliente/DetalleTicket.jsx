import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../servicios/api';
import Estrellas from '../../componentes/Estrellas';

const colorEstado = { abierto: '#f9b17a', en_proceso: '#676fad', cerrado: '#22c55e' };

const DetalleTicket = () => {
  const { id } = useParams();
  const [ticket, setTicket]         = useState(null);
  const [comentarios, setComentarios] = useState([]);
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [calificacion, setCalificacion] = useState(0);
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState('');

  const cargar = async () => {
    const [t, c] = await Promise.all([
      api.get(`/tickets/${id}`),
      api.get(`/comentarios/${id}`),
    ]);
    setTicket(t.data);
    setComentarios(c.data);
  };

  useEffect(() => { cargar(); }, [id]);

  const enviarComentario = async (e) => {
    e.preventDefault();
    if (!nuevoComentario.trim()) return;
    setEnviando(true);
    await api.post('/comentarios', { ticket_id: id, contenido: nuevoComentario });
    setNuevoComentario('');
    await cargar();
    setEnviando(false);
  };

  const enviarValoracion = async (e) => {
    e.preventDefault();
    try {
      await api.post('/valoraciones', { ticket_id: id, calificacion });
      setMensaje('¡Gracias por tu valoración!');
      await cargar();
    } catch (err) {
      setMensaje(err.response?.data?.mensaje || 'Error al enviar valoración');
    }
  };

  if (!ticket) return <p>Cargando...</p>;

  const estadoNombre = ticket.estado?.nombre;
  const yaValorado   = !!ticket.valoracion;

  return (
    <div style={s.contenedor}>
      <div style={s.tarjeta}>
        <div style={s.topBadges}>
          <span style={{ ...s.badge, background: colorEstado[estadoNombre] || '#ccc' }}>{estadoNombre}</span>
          <span style={s.badgeGris}>{ticket.prioridad?.nombre}</span>
        </div>
        <h2 style={s.titulo}>{ticket.titulo}</h2>
        <p style={s.desc}>{ticket.descripcion}</p>
        <div style={s.meta}>
          <span>📅 {new Date(ticket.fecha_creacion).toLocaleString()}</span>
          <span>👷 {ticket.tecnico ? ticket.tecnico.nombre : 'Sin asignar'}</span>
        </div>
      </div>

      {/* Sección de valoración */}
      {estadoNombre === 'cerrado' && !yaValorado && (
        <div style={s.tarjeta}>
          <h3 style={s.seccionTitulo}>⭐ Califica la atención recibida</h3>
          <form onSubmit={enviarValoracion} style={{ ...s.form, alignItems: 'center' }}>
            <Estrellas valor={calificacion} onChange={setCalificacion} />
            {mensaje && <p style={{ color: '#22c55e', fontWeight: 600 }}>{mensaje}</p>}
            <button type="submit" disabled={calificacion === 0} style={s.btnEnviar}>Enviar</button>
          </form>
        </div>
      )}

      {/* Comentarios */}
      <div style={s.tarjeta}>
        <h3 style={s.seccionTitulo}>Comentarios ({comentarios.length})</h3>
        <div style={s.listaComentarios}>
          {comentarios.map((c) => (
            <div key={c.id} style={s.comentario}>
              <div style={s.avatarComentario}>{c.autor?.nombre?.[0] || '?'}</div>
              <div>
                <p style={s.autorNombre}>{c.autor?.nombre} <span style={s.fechaComentario}>{new Date(c.fecha_creacion).toLocaleString()}</span></p>
                <p style={s.contenidoComentario}>{c.contenido}</p>
              </div>
            </div>
          ))}
        </div>
        {estadoNombre !== 'cerrado' && (
          <form onSubmit={enviarComentario} style={{ ...s.form, marginTop: '1rem' }}>
            <textarea value={nuevoComentario} onChange={(e) => setNuevoComentario(e.target.value)}
              rows={3} placeholder="Escribe un comentario..." style={s.entrada} />
            <button type="submit" disabled={enviando} style={s.btnEnviar}>
              {enviando ? 'Enviando...' : 'Comentar'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

const s = {
  contenedor:        { maxWidth: '760px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  tarjeta:           { background: '#fff', borderRadius: 'var(--radio)', padding: '1.5rem', boxShadow: 'var(--sombra)' },
  topBadges:         { display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' },
  badge:             { borderRadius: '20px', padding: '3px 12px', fontSize: '0.8rem', fontWeight: 700, color: '#fff' },
  badgeGris:         { borderRadius: '20px', padding: '3px 12px', fontSize: '0.8rem', fontWeight: 600, background: '#e5e7eb', color: '#374151' },
  titulo:            { fontSize: '1.4rem', fontWeight: 700, color: 'var(--azul-oscuro)', marginBottom: '0.5rem' },
  desc:              { color: '#4b5563', lineHeight: 1.6, marginBottom: '1rem' },
  meta:              { display: 'flex', gap: '1.5rem', fontSize: '0.85rem', color: '#9ca3af' },
  seccionTitulo:     { fontWeight: 700, fontSize: '1rem', color: 'var(--azul-oscuro)', marginBottom: '1rem' },
  form:              { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  entrada:           { padding: '0.65rem', border: '1px solid var(--borde)', borderRadius: '8px', fontFamily: 'inherit', fontSize: '0.95rem', resize: 'vertical' },
  btnEnviar:         { alignSelf: 'flex-end', padding: '0.6rem 1.5rem', background: 'var(--azul-oscuro)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' },
  listaComentarios:  { display: 'flex', flexDirection: 'column', gap: '1rem' },
  comentario:        { display: 'flex', gap: '0.75rem' },
  avatarComentario:  { width: '36px', height: '36px', borderRadius: '50%', background: 'var(--lila)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 },
  autorNombre:       { fontWeight: 600, fontSize: '0.9rem', color: '#374151', marginBottom: '0.25rem' },
  fechaComentario:   { fontWeight: 400, fontSize: '0.75rem', color: '#9ca3af', marginLeft: '0.5rem' },
  contenidoComentario: { fontSize: '0.9rem', color: '#4b5563', lineHeight: 1.5 },
};

export default DetalleTicket;
