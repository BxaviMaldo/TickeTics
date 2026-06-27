import { useEffect, useState } from 'react';
import api from '../../servicios/api';
import Estrellas from '../../componentes/Estrellas';

const colorEstado    = { abierto: '#f9b17a', en_proceso: '#676fad', cerrado: '#22c55e'};
const colorPrioridad = { baja: '#86efac', media: '#fde68a', alta: '#f87171' };
const ESTADOS = ['abierto', 'en_proceso', 'cerrado'];

const TodosLosTickets = () => {
  const [tickets, setTickets]       = useState([]);
  const [tecnicos, setTecnicos]     = useState([]);
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [busqueda, setBusqueda]     = useState('');
  const [cambios, setCambios]       = useState({});   // { [ticketId]: { asignado_a, id_estado } }
  const [guardando, setGuardando]   = useState(null);
  const [guardadoOk, setGuardadoOk] = useState(null);
  const [ticketAbierto, setTicketAbierto] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get('/tickets'),
      api.get('/usuarios'),
    ]).then(([t, u]) => {
      setTickets(t.data);
      const soloTecnicos = u.data.filter((x) => x.rol?.nombre === 'tecnico' || x.id_rol === 2);
      setTecnicos(soloTecnicos);
    });

  }, []);

  const marcarCambio = (ticketId, campo, valor) => {
    setCambios((prev) => ({ ...prev, [ticketId]: { ...prev[ticketId], [campo]: valor } }));
  };

  const guardarCambios = async (ticketId) => {
    const datos = cambios[ticketId];
    if (!datos) return;
    setGuardando(ticketId);
    try {
      await api.put(`/tickets/${ticketId}`, datos);
      const r = await api.get('/tickets');
      setTickets(r.data);
      setCambios((prev) => { const c = { ...prev }; delete c[ticketId]; return c; });
      setGuardadoOk(ticketId);
      setTimeout(() => setGuardadoOk(null), 2500);
    } finally {
      setGuardando(null);
    }
  };

  const filtrados = tickets.filter((t) => {
    const est = filtroEstado === 'todos' || t.estado?.nombre === filtroEstado;
    const bus = !busqueda ||
      t.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
      t.creador?.nombre.toLowerCase().includes(busqueda.toLowerCase());
    return est && bus;
  });

  return (
    <div>
      <h2 style={s.titulo}>Todos los Tickets</h2>

      <div style={s.controles}>
        <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por título o cliente..." style={s.busqueda} />
        <div style={s.filtros}>
          {['todos', ...ESTADOS].map((f) => (
            <button key={f} onClick={() => setFiltroEstado(f)}
              style={{ ...s.filtroBtn, ...(filtroEstado === f ? s.filtroActivo : {}) }}>
              {f.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div style={s.lista}>
        {filtrados.map((t) => {
          const cambio       = cambios[t.id] || {};
          const hayPendiente = !!cambios[t.id];
          const esOk         = guardadoOk === t.id;
          const abierto      = ticketAbierto === t.id;

          return (
            <div key={t.id} style={{ ...s.tarjeta, ...(abierto ? s.tarjetaAbierta : {}) }}>
              {/* Cabecera clickeable */}
              <div style={s.cabecera} onClick={() => setTicketAbierto(abierto ? null : t.id)}>
                <div style={s.cabeceraIzq}>
                  <span style={{ ...s.badge, background: colorEstado[t.estado?.nombre] || '#ccc' }}>
                    {t.estado?.nombre?.replace('_', ' ')}
                  </span>
                  <span style={{ ...s.badge, background: colorPrioridad[t.prioridad?.nombre] || '#eee', color: '#333' }}>
                    {t.prioridad?.nombre}
                  </span>
                  <strong style={{ color: 'var(--azul-oscuro)' }}>#{t.id}</strong>
                  <span>{t.titulo}</span>
                </div>
                <div style={s.cabeceraIzq}>
                  <span style={s.metaTexto}>{t.creador?.nombre}</span>
                  <span style={s.metaTexto}>{new Date(t.fecha_creacion).toLocaleDateString()}</span>
                  <span style={s.chevron}>{abierto ? '▲' : '▼'}</span>
                </div>
              </div>

              {/* Panel expandido */}
              {abierto && (
                <div style={s.panel}>
                  <div style={s.panelGrid}>
                    {/* Asignar técnico */}
                    <div style={s.grupo}>
                      <label style={s.etiqueta}>Técnico asignado</label>
                      <select
                        value={cambio.asignado_a ?? t.asignado_a ?? ''}
                        onChange={(e) => marcarCambio(t.id, 'asignado_a', e.target.value || null)}
                        style={s.select}>
                        <option value="">Sin asignar</option>
                        {tecnicos.map((u) => <option key={u.id} value={u.id}>{u.nombre}</option>)}
                      </select>
                    </div>

                    {/* Estado actual (solo lectura para admin — el estado cambia automáticamente) */}
                    <div style={s.grupo}>
                      <label style={s.etiqueta}>Estado actual</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ ...s.badge, background: colorEstado[t.estado?.nombre] || '#ccc' }}>
                          {t.estado?.nombre?.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Descripción */}
                  <p style={s.desc}>{t.descripcion}</p>

                  {/* Valoración */}
                  {t.valoracion && (
                    <div style={s.valoracionBox}>
                      <p style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.35rem' }}>⭐ Valoración del cliente</p>
                      <Estrellas valor={t.valoracion.calificacion} solo_lectura />
                      {t.valoracion.comentario && <p style={{ fontSize: '0.85rem', color: '#555', marginTop: '0.35rem' }}>{t.valoracion.comentario}</p>}
                    </div>
                  )}

                  {/* Botón guardar */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
                    <button
                      onClick={() => guardarCambios(t.id)}
                      disabled={!hayPendiente || guardando === t.id}
                      style={{ ...s.btnGuardar, opacity: !hayPendiente ? 0.4 : 1 }}>
                      {guardando === t.id ? 'Guardando...' : '💾 Guardar cambios'}
                    </button>
                    {esOk && <span style={s.okMsg}>✅ Cambios guardados</span>}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {filtrados.length === 0 && <p style={{ color: '#9ca3af' }}>No hay tickets.</p>}
      </div>
    </div>
  );
};

const s = {
  titulo:       { fontSize: '1.5rem', fontWeight: 700, color: 'var(--azul-oscuro)', marginBottom: '1rem' },
  controles:    { display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' },
  busqueda:     { padding: '0.55rem 1rem', border: '1px solid var(--borde)', borderRadius: '8px', fontSize: '0.9rem', flex: 1, minWidth: '220px' },
  filtros:      { display: 'flex', gap: '0.4rem', flexWrap: 'wrap' },
  filtroBtn:    { padding: '0.4rem 0.9rem', border: '1px solid var(--borde)', borderRadius: '20px', background: '#fff', cursor: 'pointer', fontSize: '0.8rem', textTransform: 'capitalize' },
  filtroActivo: { background: 'var(--azul-oscuro)', color: '#fff', border: 'none' },
  lista:        { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  tarjeta:      { background: '#fff', borderRadius: 'var(--radio)', boxShadow: 'var(--sombra)', overflow: 'hidden', border: '1px solid var(--borde)' },
  tarjetaAbierta:{ border: '1px solid var(--lila)' },
  cabecera:     { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', cursor: 'pointer', gap: '1rem' },
  cabeceraIzq:  { display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' },
  badge:        { borderRadius: '20px', padding: '2px 10px', fontSize: '0.75rem', fontWeight: 700, color: '#fff' },
  metaTexto:    { fontSize: '0.8rem', color: '#9ca3af' },
  chevron:      { fontSize: '0.75rem', color: '#9ca3af' },
  panel:        { padding: '0 1.25rem 1.25rem', borderTop: '1px solid var(--borde)' },
  panelGrid:    { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', padding: '1rem 0' },
  grupo:        { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  etiqueta:     { fontWeight: 600, fontSize: '0.85rem', color: '#374151' },
  select:       { padding: '0.5rem', border: '1px solid var(--borde)', borderRadius: '8px', fontSize: '0.9rem', background: '#fff' },
  estadoBtn:    { padding: '0.35rem 0.9rem', border: 'none', borderRadius: '20px', cursor: 'pointer', fontSize: '0.8rem', textTransform: 'capitalize', transition: 'all 0.15s' },
  desc:         { fontSize: '0.87rem', color: '#4b5563', lineHeight: 1.6, margin: '0.5rem 0' },
  valoracionBox:{ background: '#fefce8', border: '1px solid #fde68a', borderRadius: '8px', padding: '0.75rem', marginTop: '0.5rem' },
  btnGuardar:   { padding: '0.6rem 1.5rem', background: 'var(--azul-oscuro)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' },
  okMsg:        { color: '#15803d', fontWeight: 600, fontSize: '0.9rem' },
};

export default TodosLosTickets;
