import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAutenticacion } from '../contexto/ContextoAutenticacion';

const Navegacion = () => {
  const { usuario, cerrarSesion } = useAutenticacion();
  const navegar = useNavigate();
  const { pathname } = useLocation();

  const handleCerrar = () => { cerrarSesion(); navegar('/iniciar-sesion'); };

  const enlaces = {
    cliente:       [{ a: '/cliente/mis-tickets', etiqueta: 'Mis Tickets' }, { a: '/cliente/crear-ticket', etiqueta: 'Crear Ticket' }],
    tecnico:       [{ a: '/tecnico/tickets', etiqueta: 'Tickets Asignados' }, { a: '/tecnico/tablero', etiqueta: 'Mi Rendimiento' }],
    administrador: [{ a: '/admin/tickets', etiqueta: 'Todos los Tickets' }, { a: '/admin/usuarios', etiqueta: 'Usuarios' }, { a: '/admin/tablero', etiqueta: 'Tablero' }, { a: '/admin/auditoria', etiqueta: 'Auditoría' }],
  };
  const enlacesCambiarContrasena = '/cambiar-contrasena';

  return (
    <nav style={s.nav}>
      <img src="/Logosinfondo.png" alt="TickeTics Logo" style={{ height: '50px', width: 'auto', objectFit: 'contain' }} />
      
      <div style={s.links}>
        {(enlaces[usuario?.rol] || []).map((l) => (
          <Link key={l.a} to={l.a} style={{ ...s.link, ...(pathname.startsWith(l.a) ? s.linkActivo : {}) }}>
            {l.etiqueta}
          </Link>
        ))}
      </div>
      <div style={s.usuario}>
        <span style={s.nombre}>{usuario?.nombre}</span>
        <span style={s.rol}>{usuario?.rol}</span>
        <Link to={enlacesCambiarContrasena} style={s.btnClave} title="Cambiar contraseña">🔑</Link>
        <button onClick={handleCerrar} style={s.boton}>Cerrar sesión</button>
      </div>
    </nav>
  );
};

const s = {
  nav:    { background: 'var(--azul-oscuro)', color: '#fff', display: 'flex', alignItems: 'center', padding: '0 2rem', height: '60px', gap: '2rem' },
  marca:  { fontWeight: 700, fontSize: '1.2rem', color: 'var(--naranja)', whiteSpace: 'nowrap' },
  links:  { display: 'flex', gap: '1rem', flex: 1 },
  link:      { color: '#cdd3f5', fontSize: '0.9rem', padding: '0.3rem 0.8rem', borderRadius: '6px', transition: 'background 0.2s' },
  linkActivo:{ background: 'rgba(249,177,122,0.2)', color: '#f9b17a', fontWeight: 700, borderBottom: '2px solid #f9b17a' },
  usuario:{ display: 'flex', alignItems: 'center', gap: '0.75rem' },
  nombre: { fontSize: '0.9rem', fontWeight: 600 },
  rol:    { background: 'var(--lila)', borderRadius: '20px', padding: '2px 10px', fontSize: '0.75rem' },
  boton:     { background: 'var(--naranja)', border: 'none', borderRadius: '6px', padding: '0.35rem 0.9rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' },
  btnClave:  { fontSize: '1.1rem', cursor: 'pointer', textDecoration: 'none', opacity: 0.85 },
};

export default Navegacion;
