import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../servicios/api';

const colorEstado = { abierto: '#f9b17a', en_proceso: '#676fad', cerrado: '#22c55e' };

const DetalleTicketTecnico = () => {
  const { id } = useParams();
  const [ticket, setTicket]       = useState(null);
  const [comentarios, setComentarios] = useState([]);
  const [estadoCerradoId, setEstadoCerradoId] = useState(null);
  const [nota, setNota]           = useState('');
  const [enviando, setEnviando]   = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [cerradoOk, setCerradoOk] = useState(false);
  const [error, setError]         = useState('');

  const cargar = async () => {
    try {
      const [t, c] = await Promise.all([
        api.get(`/tickets/${id}`),
        api.get(`/comentarios/${id}`),
      ]);
      setTicket(t.data);
      setComentarios(c.data);
    } catch (err) {
      setError('No se pudo cargar el ticket.');
    }
  };

  useEffect(() => {
    cargar();
    // Obtener el ID del estado "cerrado"
    api.get('/tickets/catalogos').then((r) => {
      const cerrado = r.data.estados.find((e) => e.nombre === 'cerrado');
      if (cerrado) setEstadoCerradoId(cerrado.id_estado);
    });
  }, [id]);

  const marcarCerrado = async () => {
    if (!estadoCerradoId) return;
    setGuardando(true);
    try {
      await api.put(`/tickets/${id}`, { id_estado: estadoCerradoId });
      setCerradoOk(true);
      await cargar();
    } finally {
      setGuardando(false);
    }
  };

  const enviarNota = async (e) => {
    e.preventDefault();
    if (!nota.trim()) return;
    setEnviando(true);
    try {
      await api.post('/comentarios', { ticket_id: id, contenido: nota });
      setNota('');
      await cargar();
    } finally {
      setEnviando(false);
    }
  };

  if (error) return <div style={{ padding: '2rem', color: '#dc2626' }}>{error}</div>;
  if (!ticket) return <div style={{ padding: '2rem', color: '#6b7280' }}>Cargando ticket...</div>;

  const estadoActual  = ticket.estado?.nombre;
  const yaCerrado     = estadoActual === 'cerrado';

  return (
    <div style={s.contenedor}>
      {/* Cabecera del ticket */}
      <div style={s.tarjeta}>
        <span style={{ ...s.badge, background: colorEstado[estadoActual] || '#ccc' }}>
          {estadoActual?.replace('_', ' ')}
        </span>
        <h2 style={s.titulo}>{ticket.titulo}</h2>
        <p style={s.desc}>{ticket.descripcion}</p>
        <div style={s.meta}>
          <span>👤 Cliente: {ticket.creador?.nombre}</span>
          <span>📅 {new Date(ticket.fecha_creacion).toLocaleString()}</span>
          <span>🔴 Prioridad: {ticket.prioridad?.nombre}</span>
        </div>
      </div>

      {/* Acción del técnico: solo puede cerrar */}
      <div style={s.tarjeta}>
        <h3 style={s.secTitulo}>Acción del Técnico</h3>
        {yaCerrado ? (
          <div style={s.cerradoMsg}>✅ Este ticket ya fue cerrado.</div>
        ) : (
          <div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <button onClick={marcarCerrado} disabled={guardando} style={s.btnCerrar}>
                {guardando ? 'Guardando...' : 'Marcar como Cerrado'}
              </button>
              {cerradoOk && <span style={{ color: '#22c55e', fontWeight: 600 }}>✅ Ticket cerrado</span>}
            </div>
          </div>
        )}
      </div>

      {/* Notas y conversación */}
      <div style={s.tarjeta}>
        <h3 style={s.secTitulo}>Notas y Conversación ({comentarios.length})</h3>
        <div style={s.listaComentarios}>
          {comentarios.length === 0 && <p style={{ color: '#9ca3af' }}>Sin comentarios aún.</p>}
          {comentarios.map((c) => (
            <div key={c.id} style={s.comentario}>
              <div style={s.avatar}>{c.autor?.nombre?.[0] || '?'}</div>
              <div>
                <p style={s.autorNombre}>
                  {c.autor?.nombre}
                  <span style={s.fecha}>{new Date(c.fecha_creacion).toLocaleString()}</span>
                </p>
                <p style={s.contenido}>{c.contenido}</p>
              </div>
            </div>
          ))}
        </div>

        {!yaCerrado && (
          <form onSubmit={enviarNota} style={s.form}>
            <textarea value={nota} onChange={(e) => setNota(e.target.value)} rows={3}
              placeholder="Escribe una nota de seguimiento..." style={s.entrada} />
            <button type="submit" disabled={enviando || !nota.trim()} style={s.btnEnviar}>
              {enviando ? 'Enviando...' : 'Agregar Nota'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

const s = {
  contenedor:       { maxWidth: '760px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  tarjeta:          { background: '#fff', borderRadius: 'var(--radio)', padding: '1.5rem', boxShadow: 'var(--sombra)' },
  badge:            { borderRadius: '20px', padding: '3px 12px', fontSize: '0.8rem', fontWeight: 700, color: '#fff', display: 'inline-block', marginBottom: '0.75rem', textTransform: 'capitalize' },
  titulo:           { fontSize: '1.4rem', fontWeight: 700, color: 'var(--azul-oscuro)', marginBottom: '0.5rem' },
  desc:             { color: '#4b5563', lineHeight: 1.6, marginBottom: '1rem' },
  meta:             { display: 'flex', gap: '1.5rem', fontSize: '0.85rem', color: '#9ca3af', flexWrap: 'wrap' },
  secTitulo:        { fontWeight: 700, fontSize: '1rem', color: 'var(--azul-oscuro)', marginBottom: '1rem' },
  cerradoMsg:       { background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px', padding: '0.75rem 1rem', color: '#15803d', fontWeight: 600 },
  btnCerrar:        { padding: '0.65rem 1.5rem', background: '#6b7280', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem' },
  listaComentarios: { display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1rem' },
  comentario:       { display: 'flex', gap: '0.75rem' },
  avatar:           { width: '36px', height: '36px', borderRadius: '50%', background: 'var(--lila)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 },
  autorNombre:      { fontWeight: 600, fontSize: '0.9rem', color: '#374151', marginBottom: '0.25rem' },
  fecha:            { fontWeight: 400, fontSize: '0.75rem', color: '#9ca3af', marginLeft: '0.5rem' },
  contenido:        { fontSize: '0.9rem', color: '#4b5563', lineHeight: 1.5 },
  form:             { display: 'flex', flexDirection: 'column', gap: '0.75rem', borderTop: '1px solid var(--borde)', paddingTop: '1rem' },
  entrada:          { padding: '0.65rem', border: '1px solid var(--borde)', borderRadius: '8px', fontFamily: 'inherit', fontSize: '0.95rem', resize: 'vertical' },
  btnEnviar:        { alignSelf: 'flex-end', padding: '0.6rem 1.5rem', background: 'var(--azul-medio)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' },
};

export default DetalleTicketTecnico;
