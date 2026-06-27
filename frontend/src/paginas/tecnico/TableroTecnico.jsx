import { useEffect, useState } from 'react';
import api from '../../servicios/api';
import { useAutenticacion } from '../../contexto/ContextoAutenticacion';
import Estrellas from '../../componentes/Estrellas';

const Tarjeta = ({ titulo, valor, color, emoji }) => (
  <div style={{ background: '#fff', borderRadius: 'var(--radio)', padding: '1.25rem', boxShadow: 'var(--sombra)', borderLeft: `4px solid ${color}` }}>
    <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '0.25rem' }}>{emoji} {titulo}</p>
    <p style={{ fontSize: '2rem', fontWeight: 800, color }}>{valor ?? '—'}</p>
  </div>
);

const TableroTecnico = () => {
  const { usuario } = useAutenticacion();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get(`/valoraciones/estadisticas/${usuario.id}`).then((r) => setStats(r.data));
  }, [usuario.id]);

  if (!stats) return <p>Cargando estadísticas...</p>;

  const { resumen } = stats;

  return (
    <div>
      <h2 style={s.titulo}>Mi Rendimiento</h2>
      <p style={s.sub}>Solo tú puedes ver estas estadísticas.</p>

      <div style={s.grid}>
        <Tarjeta titulo="Tickets totales"   valor={resumen.total_tickets}        color="var(--azul-oscuro)" emoji="🎫" />
        <Tarjeta titulo="Cerrados"              valor={resumen.resueltos}           color="#22c55e"            emoji="✅" />
        <Tarjeta titulo="En proceso"         valor={resumen.en_proceso}           color="var(--lila)"        emoji="⏳" />
        <Tarjeta titulo="Abiertos"           valor={resumen.abiertos}             color="var(--naranja)"     emoji="📬" />
        <Tarjeta titulo="Valoraciones"       valor={resumen.total_valoraciones}   color="#f59e0b"            emoji="⭐" />
        <Tarjeta titulo="Promedio calificación" valor={resumen.promedio_calificacion ?? '—'} color="#ef4444" emoji="📊" />
      </div>

      {resumen.promedio_calificacion && (
        <div style={s.promedioCard}>
          <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Tu calificación promedio</p>
          <Estrellas valor={Math.round(resumen.promedio_calificacion)} solo_lectura />
          <p style={{ marginTop: '0.5rem', color: '#6b7280', fontSize: '0.85rem' }}>
            Basado en {resumen.total_valoraciones} valoraciones de clientes
          </p>
        </div>
      )}

      {stats.por_semana?.length > 0 && (
        <div style={s.grafCard}>
          <h3 style={s.secTitulo}>Tickets por semana (últimas 8 semanas)</h3>
          <div style={s.barras}>
            {stats.por_semana.map((s, i) => (
              <div key={i} style={sb.columna}>
                <div style={{ ...sb.barra, height: `${Math.max(20, s.tickets * 20)}px` }}>{s.tickets}</div>
                <p style={sb.etiqueta}>{new Date(s.semana).toLocaleDateString('es', { month: 'short', day: 'numeric' })}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const s = {
  titulo:    { fontSize: '1.5rem', fontWeight: 700, color: 'var(--azul-oscuro)', marginBottom: '0.25rem' },
  sub:       { color: '#6b7280', marginBottom: '1.5rem', fontSize: '0.9rem' },
  grid:      { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' },
  promedioCard: { background: '#fff', borderRadius: 'var(--radio)', padding: '1.25rem', boxShadow: 'var(--sombra)', marginBottom: '1.5rem' },
  grafCard:  { background: '#fff', borderRadius: 'var(--radio)', padding: '1.5rem', boxShadow: 'var(--sombra)' },
  secTitulo: { fontWeight: 700, marginBottom: '1rem', color: 'var(--azul-oscuro)' },
  barras:    { display: 'flex', gap: '0.5rem', alignItems: 'flex-end', height: '160px', padding: '0 0.5rem' },
};
const sb = {
  columna:  { display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 },
  barra:    { background: 'var(--lila)', borderRadius: '4px 4px 0 0', width: '100%', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', color: '#fff', fontSize: '0.75rem', fontWeight: 700, paddingTop: '4px', transition: 'height 0.3s' },
  etiqueta: { fontSize: '0.65rem', color: '#9ca3af', marginTop: '4px', textAlign: 'center' },
};

export default TableroTecnico;
