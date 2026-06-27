import { useEffect, useState, useMemo } from 'react';
import api from '../../servicios/api';
import Estrellas from '../../componentes/Estrellas';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

const Stat = ({ titulo, valor, color, emoji, pequeno = false }) => (
  <div style={{ background: '#fff', borderRadius: '10px', padding: pequeno ? '0.85rem 1rem' : '1.25rem 1.5rem', boxShadow: 'var(--sombra)', borderLeft: `4px solid ${color}` }}>
    <p style={{ fontSize: pequeno ? '0.72rem' : '0.85rem', color: '#6b7280', marginBottom: '0.25rem' }}>{emoji} {titulo}</p>
    <p style={{ fontSize: pequeno ? '1.2rem' : '2.2rem', fontWeight: 800, color, margin: 0 }}>{valor ?? '—'}</p>
  </div>
);

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const COLORES = ['#676fad','#f9b17a','#2d3250','#22c55e','#f59e0b'];

const TableroAdmin = () => {
  const [tecnicos, setTecnicos]               = useState([]);
  const [todosTickets, setTodosTickets]       = useState([]);
  const [tecnicoSeleccionado, setTecnico]     = useState(null);
  const [statsDetalle, setStatsDetalle]       = useState(null);
  const [filtroMes, setFiltroMes]             = useState('');
  const [filtroGrafico, setFiltroGrafico]     = useState('total');
  const [top3, setTop3]                       = useState([]);

  useEffect(() => {
    api.get('/usuarios').then((r) => setTecnicos(r.data.filter((u) => u.rol?.nombre === 'tecnico')));
    api.get('/tickets').then((r) => setTodosTickets(r.data));
    api.get('/valoraciones/tecnicos-destacados').then((r) => setTop3(r.data)).catch(() => {});
  }, []);

  const ticketsFiltrados = useMemo(() => {
    if (!filtroMes) return todosTickets;
    const mes = parseInt(filtroMes);
    return todosTickets.filter((t) => new Date(t.fecha_creacion).getMonth() === mes);
  }, [todosTickets, filtroMes]);

  const statsGlobal = useMemo(() => {
    const cerrados = ticketsFiltrados.filter((t) => t.estado?.nombre === 'cerrado');
    const conFechaCierre = cerrados.filter((t) => t.fecha_cierre);
    const horasPromedio = conFechaCierre.length > 0
      ? (conFechaCierre.reduce((acc, t) => {
          const horas = (new Date(t.fecha_cierre) - new Date(t.fecha_creacion)) / 3600000;
          return acc + horas;
        }, 0) / conFechaCierre.length).toFixed(1)
      : null;
    return {
      total:    ticketsFiltrados.length,
      abiertos: ticketsFiltrados.filter((t) => t.estado?.nombre === 'abierto').length,
      proceso:  ticketsFiltrados.filter((t) => t.estado?.nombre === 'en_proceso').length,
      cerrados: cerrados.length,
      horasPromedio,
    };
  }, [ticketsFiltrados]);

  // Datos para gráfico de barras por técnico
  const datosGrafico = useMemo(() => tecnicos.map((tec) => {
    const asignados = ticketsFiltrados.filter((t) => t.asignado_a === tec.id || t.tecnico?.id === tec.id);
    return {
      nombre: tec.nombre.split(' ')[0],
      total:    asignados.length,
      en_proceso: asignados.filter((t) => t.estado?.nombre === 'en_proceso').length,
      cerrados:   asignados.filter((t) => t.estado?.nombre === 'cerrado').length,
    };
  }), [tecnicos, ticketsFiltrados]);

  const seleccionarTecnico = async (id) => {
    if (tecnicoSeleccionado === id) { setTecnico(null); setStatsDetalle(null); return; }
    setTecnico(id);
    const r = await api.get(`/valoraciones/estadisticas/${id}`);
    setStatsDetalle(r.data);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Cabecera con filtro de mes */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={s.titulo}>Tablero de Administración</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: 600 }}>Mes:</label>
          <select value={filtroMes} onChange={(e) => setFiltroMes(e.target.value)} style={s.select}>
            <option value="">Todos</option>
            {MESES.map((m, i) => <option key={i} value={i}>{m}</option>)}
          </select>
        </div>
      </div>

      {/* Tarjetas globales */}
      <div style={s.grid5}>
        <Stat titulo="Total tickets"    valor={statsGlobal.total}        color="var(--azul-oscuro)" emoji="🎫" />
        <Stat titulo="Abiertos"         valor={statsGlobal.abiertos}     color="var(--naranja)"     emoji="📬" />
        <Stat titulo="En proceso"       valor={statsGlobal.proceso}      color="var(--lila)"        emoji="⏳" />
        <Stat titulo="Cerrados"         valor={statsGlobal.cerrados}     color="#22c55e"            emoji="✅" />
        <Stat titulo="Tiempo resolución de tickets"  valor={statsGlobal.horasPromedio != null ? `${statsGlobal.horasPromedio}h` : '—'} color="#0ea5e9"/>
      </div>

      {/* Gráfico: tickets por técnico */}
      <div style={s.panel}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={s.secTitulo}>Tickets por Técnico</h3>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {[['total','Todos'],['en_proceso','En proceso'],['cerrados','Cerrados']].map(([v, l]) => (
              <button key={v} onClick={() => setFiltroGrafico(v)}
                style={{ ...s.filtroBtn, ...(filtroGrafico === v ? s.filtroBtnActivo : {}) }}>{l}</button>
            ))}
          </div>
        </div>
        {datosGrafico.length === 0 ? (
          <p style={{ color: '#9ca3af', textAlign: 'center', padding: '2rem' }}>No hay datos de técnicos.</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={datosGrafico} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="nombre" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey={filtroGrafico} radius={[4,4,0,0]}>
                {datosGrafico.map((_, i) => <Cell key={i} fill={COLORES[i % COLORES.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Top 3 técnicos por valoración */}
      <div style={s.panel}>
        <h3 style={{ ...s.secTitulo, marginBottom: '1rem' }}>🏆 Top 3 Técnicos Mejor Valorados</h3>
        {top3.length === 0 ? (
          <p style={{ color: '#9ca3af', textAlign: 'center', padding: '1rem' }}>Aún no hay valoraciones registradas.</p>
        ) : (
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {top3.map((t, i) => (
              <div key={t.id} style={{ ...s.top3Card, borderTop: `4px solid ${['#f9b17a','#676fad','#2d3250'][i]}` }}>
                <div style={{ fontSize: '1.8rem' }}>{['🥇','🥈','🥉'][i]}</div>
                <div style={s.avatarTop}>{t.nombre[0]}</div>
                <p style={{ fontWeight: 700, fontSize: '0.95rem', margin: '0.25rem 0' }}>{t.nombre}</p>
                <Estrellas valor={Math.round(Number(t.promedio))} solo_lectura color="#f9b17a" />
                <p style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.25rem' }}>
                  {Number(t.promedio).toFixed(1)} / 5 · {t.total_valoraciones} valoraciones
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Técnicos del equipo + detalle */}
      <div style={s.dosCols}>
        <div style={s.panel}>
          <h3 style={s.secTitulo}>Técnicos del Equipo</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '8px'}}>
            {tecnicos.map((t) => (
              <button key={t.id} onClick={() => seleccionarTecnico(t.id)}
                style={{ ...s.tecnicoBtn, ...(tecnicoSeleccionado === t.id ? s.tecnicoBtnActivo : {}) }}>
                <div style={s.avatar}>{t.nombre[0]}</div>
                <span style={{ fontSize: '0.88rem' }}>{t.nombre}</span>
                {tecnicoSeleccionado === t.id && <span style={{ marginLeft: 'auto', opacity: 0.7 }}>✕</span>}
              </button>
            ))}
            {tecnicos.length === 0 && <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>No hay técnicos.</p>}
          </div>
        </div>

        <div style={s.panel}>
          {!statsDetalle ? (
            <div style={{ color: '#9ca3af', textAlign: 'center', paddingTop: '2rem'}}>
              <p style={{ fontSize: '0.9rem' }}>Selecciona un técnico para ver sus estadísticas</p>
            </div>
          ) : (
            <>
              <h3 style={{...s.secTitulo, marginBottom: '8px'}}>Estadísticas del Técnico</h3>
              <div style={{...s.grid2, width: '100%'}}>
                <Stat titulo="Total"        valor={statsDetalle.resumen.total_tickets}      color="var(--azul-oscuro)" emoji="🎫" pequeno />
                <Stat titulo="Cerrados"     valor={statsDetalle.resumen.resueltos}          color="#22c55e"            emoji="✅" pequeno />
                <Stat titulo="En proceso"   valor={statsDetalle.resumen.en_proceso}         color="var(--lila)"        emoji="⏳" pequeno />
                <Stat titulo="Valoraciones" valor={statsDetalle.resumen.total_valoraciones} color="#f59e0b"            emoji="⭐" pequeno />
              </div>
              {statsDetalle.resumen.horas_promedio_resolucion != null && (
                <div style={{ marginTop: '0.75rem', background: '#f0f1ff', borderRadius: '8px', padding: '0.6rem 0.9rem' }}>
                    <p style={{ fontSize: '0.72rem', color: '#6b7280', margin: 0, fontWeight: 600 }}>Tiempo promedio de resolución de tickets
                    </p>
                    <p style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--lila)', margin: 0 }}>
                      {statsDetalle.resumen.horas_promedio_resolucion} horas
                    </p>
                </div>
              )}
              {statsDetalle.resumen.promedio_calificacion && (
                <div style={{ marginTop: '1rem' }}>
                  <p style={{ fontWeight: 600, marginBottom: '0.4rem', fontSize: '0.9rem'}}>Calificación promedio</p>
                  <div style={{ color: 'var(--lila)', fill: 'var(--lila)' }}>
                    <Estrellas valor={Math.round(statsDetalle.resumen.promedio_calificacion)} solo_lectura/>
                  </div>
                  
                  <p style={{ fontSize: '1.3rem', fontWeight: 700, marginTop: '0.2rem' }}>
                    {statsDetalle.resumen.promedio_calificacion} / 5
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const s = {
  titulo:           { fontSize: '1.5rem', fontWeight: 700, color: 'var(--azul-oscuro)', margin: 0 },
  select:           { padding: '0.4rem 0.7rem', border: '1px solid var(--borde)', borderRadius: '8px', fontSize: '0.88rem', fontFamily: 'inherit', cursor: 'pointer' },
  grid4:            { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' },
  grid5:            { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' },
  grid2:            { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' },
  panel:            { background: '#fff', borderRadius: 'var(--radio)', padding: '1.25rem', boxShadow: 'var(--sombra)' },
  secTitulo:        { fontWeight: 700, color: 'var(--azul-oscuro)', margin: 0 },
  dosCols:          { display: 'grid', gridTemplateColumns: '240px 1fr', gap: '1.25rem' },
  tecnicoBtn:       { display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid var(--borde)', background: '#f9fafb', cursor: 'pointer', textAlign: 'left', width: '100%' },
  tecnicoBtnActivo: { background: 'var(--azul-oscuro)', color: '#fff', border: 'none' },
  avatar:           { width: '28px', height: '28px', borderRadius: '50%', background: 'var(--lila)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0, fontSize: '0.8rem' },
  filtroBtn:        { padding: '0.3rem 0.75rem', border: '1px solid var(--borde)', borderRadius: '6px', background: '#f9fafb', cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'inherit' },
  filtroBtnActivo:  { background: 'var(--azul-oscuro)', color: '#fff', border: 'none', fontWeight: 700 },
  top3Card:         { flex: 1, minWidth: '160px', background: '#f9fafb', borderRadius: '10px', padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' },
  avatarTop:        { width: '44px', height: '44px', borderRadius: '50%', background: 'var(--lila)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.1rem', marginTop: '0.25rem' },
};

export default TableroAdmin;
