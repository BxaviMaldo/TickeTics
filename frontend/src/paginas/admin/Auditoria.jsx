import { useEffect, useState } from 'react';
import api from '../../servicios/api';

const Auditoria = () => {
  const [registros, setRegistros] = useState([]);
  const [busqueda, setBusqueda]   = useState('');

  useEffect(() => { api.get('/auditoria').then((r) => setRegistros(r.data)); }, []);

  const filtrados = registros.filter((r) =>
    r.accion.includes(busqueda) || r.tipo_entidad.includes(busqueda) ||
    r.usuario?.nombre?.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div>
      <h2 style={s.titulo}>Registro de Auditoría</h2>
      <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
        placeholder="Filtrar por acción, entidad o usuario..." style={s.busqueda} />

      <div style={s.tabla}>
        <div style={s.encabezado}>
          <span>Fecha</span><span>Usuario</span><span>Acción</span><span>Entidad</span><span>IP</span>
        </div>
        {filtrados.map((r) => (
          <div key={r.id} style={s.fila}>
            <span style={s.fecha}>{new Date(r.fecha_creacion).toLocaleString()}</span>
            <span style={s.celda}>{r.usuario?.nombre || 'Sistema'}</span>
            <span style={s.accion}>{r.accion}</span>
            <span style={s.celda}>{r.tipo_entidad} {r.id_entidad ? `#${r.id_entidad}` : ''}</span>
            <span style={s.ip}>{r.direccion_ip || '—'}</span>
          </div>
        ))}
        {filtrados.length === 0 && <p style={{ padding: '1rem', color: '#9ca3af' }}>No hay registros.</p>}
      </div>
    </div>
  );
};

const s = {
  titulo:    { fontSize: '1.5rem', fontWeight: 700, color: 'var(--azul-oscuro)', marginBottom: '1rem' },
  busqueda:  { padding: '0.55rem 1rem', border: '1px solid var(--borde)', borderRadius: '8px', fontSize: '0.9rem', width: '100%', marginBottom: '1.5rem' },
  tabla:     { background: '#fff', borderRadius: 'var(--radio)', boxShadow: 'var(--sombra)', overflow: 'auto' },
  encabezado:{ display: 'grid', gridTemplateColumns: '1.8fr 1fr 1.2fr 1fr 1fr', padding: '0.75rem 1rem', background: 'var(--azul-oscuro)', color: '#fff', fontSize: '0.8rem', fontWeight: 700, gap: '1rem' },
  fila:      { display: 'grid', gridTemplateColumns: '1.8fr 1fr 1.2fr 1fr 1fr', padding: '0.75rem 1rem', borderBottom: '1px solid var(--borde)', gap: '1rem', alignItems: 'center', fontSize: '0.82rem' },
  fecha:     { color: '#6b7280', fontSize: '0.78rem' },
  celda:     { color: '#374151' },
  accion:    { color: 'var(--azul-medio)', fontWeight: 600 },
  ip:        { color: '#9ca3af', fontFamily: 'monospace' },
};

export default Auditoria;
