import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../servicios/api';

const colorEstado = { abierto: '#f9b17a', en_proceso: '#676fad', cerrado: '#22c55e' };

const TicketsTecnico = () => {
  const [tickets, setTickets]   = useState([]);
  const [filtro, setFiltro]     = useState('todos');
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    api.get('/tickets').then((r) => setTickets(r.data)).finally(() => setCargando(false));
  }, []);

  const filtrados = filtro === 'todos' ? tickets : tickets.filter((t) => t.estado?.nombre === filtro);

  if (cargando) return <p>Cargando...</p>;

  return (
    <div>
      <h2 style={s.titulo}>Tickets Asignados</h2>

      <div style={s.filtros}>
        {['todos', 'abierto', 'en_proceso', 'cerrado'].map((f) => (
          <button key={f} onClick={() => setFiltro(f)}
            style={{ ...s.filtroBtn, ...(filtro === f ? s.filtroActivo : {}) }}>
            {f.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div style={s.lista}>
        {filtrados.length === 0 && <p style={{ color: '#6b7280' }}>No hay tickets en esta categoría.</p>}
        {filtrados.map((t) => (
          <Link key={t.id} to={`/tecnico/ticket/${t.id}`} style={s.tarjeta}>
            <div style={s.izquierda}>
              <span style={{ ...s.badge, background: colorEstado[t.estado?.nombre] || '#ccc' }}>
                {t.estado?.nombre}
              </span>
              <h3 style={s.tarjetaTitulo}>{t.titulo}</h3>
              <p style={s.tarjetaMeta}>
                Cliente: {t.creador?.nombre} · {new Date(t.fecha_creacion).toLocaleDateString()}
              </p>
            </div>
            <div style={s.prioridadTag}>{t.prioridad?.nombre}</div>
          </Link>
        ))}
      </div>
    </div>
  );
};

const s = {
  titulo:      { fontSize: '1.5rem', fontWeight: 700, color: 'var(--azul-oscuro)', marginBottom: '1rem' },
  filtros:     { display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' },
  filtroBtn:   { padding: '0.4rem 1rem', border: '1px solid var(--borde)', borderRadius: '20px', background: '#fff', cursor: 'pointer', fontSize: '0.85rem', textTransform: 'capitalize' },
  filtroActivo:{ background: 'var(--azul-oscuro)', color: '#fff', border: 'none' },
  lista:       { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  tarjeta:     { background: '#fff', borderRadius: 'var(--radio)', padding: '1.25rem', boxShadow: 'var(--sombra)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--borde)' },
  izquierda:   { display: 'flex', flexDirection: 'column', gap: '0.35rem' },
  badge:       { borderRadius: '20px', padding: '2px 10px', fontSize: '0.75rem', fontWeight: 700, color: '#fff', alignSelf: 'flex-start' },
  tarjetaTitulo:{ fontSize: '1rem', fontWeight: 700, color: 'var(--azul-oscuro)' },
  tarjetaMeta: { fontSize: '0.8rem', color: '#9ca3af' },
  prioridadTag:{ background: '#f3f4f6', borderRadius: '8px', padding: '0.35rem 0.75rem', fontSize: '0.8rem', fontWeight: 600, color: '#374151' },
};

export default TicketsTecnico;
