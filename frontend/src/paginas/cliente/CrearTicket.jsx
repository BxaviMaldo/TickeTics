import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../servicios/api';

const CrearTicket = () => {
  const [form, setForm] = useState({ titulo: '', descripcion: '', id_prioridad: '' });
  const [prioridades, setPrioridades] = useState([]);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const navegar = useNavigate();

  useEffect(() => {
    api.get('/tickets/catalogos').then((r) => setPrioridades(r.data.prioridades));
  }, []);

  const manejarCambio = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const manejarEnvio = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      await api.post('/tickets', form);
      window.location.href = '/cliente/mis-tickets';
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al crear ticket');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={s.contenedor}>
      <div style={s.tarjeta}>
        <h2 style={s.titulo}>Crear Nuevo Ticket</h2>
        <p style={s.subtitulo}>Describe tu problema o solicitud.</p>

        <form onSubmit={manejarEnvio} style={s.form}>
          <div style={s.campo}>
            <label style={s.etiqueta}>Título del problema</label>
            <input name="titulo" value={form.titulo} onChange={manejarCambio} required
              placeholder="Ej: No puedo acceder a mi correo corporativo"
              style={s.entrada} />
          </div>

          <div style={s.campo}>
            <label style={s.etiqueta}>Descripción detallada</label>
            <textarea name="descripcion" value={form.descripcion} onChange={manejarCambio} required
              rows={5} placeholder="Describe el problema con el mayor detalle posible..."
              style={{ ...s.entrada, resize: 'vertical' }} />
          </div>

          <div style={s.campo}>
            <label style={s.etiqueta}>Prioridad</label>
            <select name="id_prioridad" value={form.id_prioridad} onChange={manejarCambio} required style={s.entrada}>
              <option value="">Selecciona la prioridad</option>
              {prioridades.map((p) => (
                <option key={p.id_prioridad} value={p.id_prioridad}>{p.nombre.charAt(0).toUpperCase() + p.nombre.slice(1)}</option>
              ))}
            </select>
          </div>

          {error && <p style={s.error}>{error}</p>}

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button type="button" onClick={() => navegar('/cliente/mis-tickets')} style={s.btnCancelar}>
              Cancelar
            </button>
            <button type="submit" disabled={cargando} style={s.btnEnviar}>
              {cargando ? 'Enviando...' : 'Enviar Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const s = {
  contenedor: { maxWidth: '680px', margin: '0 auto' },
  tarjeta:    { background: '#fff', borderRadius: 'var(--radio)', padding: '2rem', boxShadow: 'var(--sombra)' },
  titulo:     { fontSize: '1.5rem', fontWeight: 700, color: 'var(--azul-oscuro)', marginBottom: '0.25rem' },
  subtitulo:  { color: '#6b7280', marginBottom: '2rem', fontSize: '0.9rem' },
  form:       { display: 'flex', flexDirection: 'column', gap: '1.25rem' },
  campo:      { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  etiqueta:   { fontWeight: 600, fontSize: '0.9rem', color: '#374151' },
  entrada:    { padding: '0.65rem 0.9rem', border: '1px solid var(--borde)', borderRadius: '8px', fontSize: '1rem', fontFamily: 'inherit', outline: 'none' },
  error:      { color: '#dc2626', fontSize: '0.875rem' },
  btnEnviar:  { flex: 1, padding: '0.75rem', background: 'var(--azul-oscuro)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '1rem' },
  btnCancelar:{ flex: 1, padding: '0.75rem', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '1rem' },
};

export default CrearTicket;
