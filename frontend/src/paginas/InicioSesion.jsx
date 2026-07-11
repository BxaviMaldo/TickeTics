import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAutenticacion } from '../contexto/ContextoAutenticacion';

const ModalProvExpirada = ({ onCerrar }) => (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
    <div style={{ background: '#fff', borderRadius: '14px', padding: '2rem', maxWidth: '380px', width: '90%', textAlign: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
      <p style={{ fontSize: '2.5rem', margin: '0 0 0.5rem' }}>⏱️</p>
      <h3 style={{ color: '#2d3250', fontWeight: 700, margin: '0 0 0.75rem' }}>Contraseña expirada</h3>
      <p style={{ color: '#4b5563', fontSize: '0.95rem', margin: '0 0 1.5rem' }}>
        El tiempo para usar la contraseña provisional ya pasó. Por favor contacta a un administrador para que genere una nueva cuenta.
      </p>
      <button onClick={onCerrar} style={{ padding: '0.65rem 1.5rem', background: '#2d3250', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem' }}>
        Entendido
      </button>
    </div>
  </div>
);

const InicioSesion = () => {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [mostrarModalExpirada, setMostrarModalExpirada] = useState(false);

  const { iniciarSesion } = useAutenticacion();
  const navegar = useNavigate();

  const manejarEnvio = async (evento) => {
    evento.preventDefault();
    setError('');
    setCargando(true);

    try {
      const { usuario, primer_ingreso } = await iniciarSesion(correo, contrasena);

      if (primer_ingreso) { navegar('/cambiar-contrasena'); return; }
      if (usuario.rol === 'administrador') navegar('/admin/tablero');
      else if (usuario.rol === 'tecnico') navegar('/tecnico/tickets');
      else navegar('/cliente/mis-tickets');
    } catch (err) {
      const mensaje = err.response?.data?.mensaje;
      if (mensaje === 'PROVISIONAL_EXPIRADA') {
        setMostrarModalExpirada(true);
      } else {
        setError(mensaje || 'Error al iniciar sesión');
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={estilos.contenedor}>
      {mostrarModalExpirada && <ModalProvExpirada onCerrar={() => setMostrarModalExpirada(false)} />}
      <div style={estilos.tarjeta}>
        <div style={{ textAlign: 'center', marginBottom: '0.75rem' }}>
          <img src="/Logo.jpg" alt="TickeTics Logo" style={{ width: '150px', height: '100px', borderRadius: '16px', objectFit: 'cover'}} />
        </div>
        <h1 style={estilos.titulo}>TickeTics</h1>
        <p style={estilos.subtitulo}>Gestión de Tickets de TI & Soporte</p>
        <div style={{ height: '3px', background: 'linear-gradient(90deg, #2d3250, #f9b17a)', borderRadius: '2px', marginBottom: '1.75rem' }} />

        <form onSubmit={manejarEnvio} style={estilos.formulario}>
          <div style={estilos.campo}>
            <label htmlFor="correo" style={estilos.etiqueta}>Correo electrónico</label>
            <input
              id="correo"
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
              style={estilos.entrada}
              placeholder="usuario@dominio.com"
            />
          </div>

          <div style={estilos.campo}>
            <label htmlFor="contrasena" style={estilos.etiqueta}>Contraseña</label>
            <input
              id="contrasena"
              type="password"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              required
              style={estilos.entrada}
              placeholder="••••••••"
            />
          </div>

          {error && <p style={estilos.error}>{error}</p>}

          <button type="submit" disabled={cargando} style={estilos.boton}>
            {cargando ? 'Ingresando...' : 'Iniciar sesión'}
          </button>
        </form>
      </div>
    </div>
  );
};

const estilos = {
  contenedor: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #2d3250 0%, #424769 60%, #676fad 100%)',
    fontFamily: "'Segoe UI', sans-serif",
  },
  tarjeta: {
    backgroundColor: '#ffffff',
    padding: '2.5rem',
    borderRadius: '16px',
    boxShadow: '0 20px 60px rgba(45,50,80,0.4)',
    width: '100%',
    maxWidth: '420px',
  },
  titulo: {
    textAlign: 'center',
    color: '#2d3250',
    margin: '0 0 0.25rem',
    fontSize: '2.2rem',
    fontWeight: 800,
    letterSpacing: '-0.5px',
  },
  subtitulo: {
    textAlign: 'center',
    color: '#676fad',
    margin: '0 0 2rem',
    fontSize: '0.95rem',
    fontWeight: 500,
  },
  formulario: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  campo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
  },
  etiqueta: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#424769',
  },
  entrada: {
    padding: '0.65rem 0.9rem',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  boton: {
    padding: '0.8rem',
    backgroundColor: '#2d3250',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '700',
    cursor: 'pointer',
    marginTop: '0.5rem',
    transition: 'background 0.2s',
  },
  error: {
    color: '#dc2626',
    fontSize: '0.875rem',
    textAlign: 'center',
    margin: 0,
  },
};

export default InicioSesion;
