import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../servicios/api';
import Estrellas from '../../componentes/Estrellas';

const colorEstado = { abierto: '#f9b17a', en_proceso: '#676fad', cerrado: '#22c55e'};
const colorPrioridad = { baja: '#86efac', media: '#fde68a', alta: '#f87171' };

const MisTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [cargando, setCargando] = useState(true);

  const cargar = async () => {
    setCargando(true);
    try {
      const t = await api.get('/tickets');
      setTickets(t.data);
    } catch (e) {
      console.error('Error cargando tickets:', e);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  if (cargando) return <p>Cargando...</p>;

  return (
    <div>
      <div style={s.cabecera}>
        <h2 style={s.titulo}>Mis Tickets</h2>
        <Link to="/cliente/crear-ticket" style={s.btnNuevo}>+ Nuevo Ticket</Link>
      </div>

      {tickets.length === 0 ? (
        <div style={s.vacio}>
          <p>No tienes tickets todavía.</p>
          <Link to="/cliente/crear-ticket" style={s.btnNuevo}>Crear mi primer ticket</Link>
        </div>
      ) : (
        <div style={s.lista}>
          {tickets.map((t) => (
            <Link to={`/cliente/ticket/${t.id}`} key={t.id} style={s.tarjeta}>
              <div style={s.tarjetaTop}>
                <span style={{ ...s.badge, background: colorEstado[t.estado?.nombre] || '#ccc' }}>
                  {t.estado?.nombre}
                </span>
                <span style={{ ...s.badge, background: colorPrioridad[t.prioridad?.nombre] || '#ccc', color: '#333' }}>
                  {t.prioridad?.nombre}
                </span>
                {t.valoracion && <Estrellas valor={t.valoracion.calificacion} solo_lectura />}
              </div>
              <h3 style={s.tarjetaTitulo}>{t.titulo}</h3>
              <p style={s.tarjetaDesc}>{t.descripcion.slice(0, 100)}...</p>
              <p style={s.tarjetaMeta}>
                {t.tecnico ? `Técnico: ${t.tecnico.nombre}` : 'Sin asignar'} · {new Date(t.fecha_creacion).toLocaleDateString()}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

const s = {
  cabecera:     { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  titulo:       { fontSize: '1.5rem', fontWeight: 700, color: 'var(--azul-oscuro)' },
  btnNuevo:     { background: 'var(--azul-oscuro)', color: '#fff', padding: '0.6rem 1.2rem', borderRadius: '8px', fontWeight: 600 },
  lista:        { display: 'grid', gap: '1rem' },
  tarjeta:      { background: '#fff', borderRadius: 'var(--radio)', padding: '1.25rem', boxShadow: 'var(--sombra)', display: 'block', transition: 'transform 0.15s', border: '1px solid var(--borde)' },
  tarjetaTop:   { display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' },
  badge:        { borderRadius: '20px', padding: '2px 10px', fontSize: '0.75rem', fontWeight: 600, color: '#fff' },
  tarjetaTitulo:{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.25rem', color: 'var(--azul-oscuro)' },
  tarjetaDesc:  { fontSize: '0.85rem', color: '#6b7280', marginBottom: '0.5rem' },
  tarjetaMeta:  { fontSize: '0.75rem', color: '#9ca3af' },
  vacio:        { textAlign: 'center', padding: '3rem', color: '#6b7280', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' },
};

export default MisTickets;
