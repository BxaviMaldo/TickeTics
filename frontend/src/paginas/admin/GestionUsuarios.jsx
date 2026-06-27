import { useEffect, useState } from 'react';
import api from '../../servicios/api';
import { useAutenticacion } from '../../contexto/ContextoAutenticacion';

const colorRol = { cliente: '#f9b17a', tecnico: '#676fad', administrador: '#2d3250' };

const ModalConfirmar = ({ nombre, onConfirmar, onCancelar }) => (
  <div style={sm.fondo}>
    <div style={sm.caja}>
      <p style={sm.icono}>🗑️</p>
      <h3 style={sm.titulo}>¿Está seguro de eliminar al usuario?</h3>
      <p style={sm.nombre}>{nombre}</p>
      <p style={sm.aviso}>Esta acción no se puede deshacer.</p>
      <div style={sm.botones}>
        <button onClick={onCancelar} style={sm.btnCancelar}>Cancelar</button>
        <button onClick={onConfirmar} style={sm.btnEliminar}>Eliminar</button>
      </div>
    </div>
  </div>
);

const sm = {
  fondo:      { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  caja:       { background: '#fff', borderRadius: '14px', padding: '2rem', maxWidth: '380px', width: '90%', textAlign: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.18)' },
  icono:      { fontSize: '2.5rem', margin: '0 0 0.5rem' },
  titulo:     { fontWeight: 700, fontSize: '1.05rem', color: 'var(--azul-oscuro)', margin: '0 0 0.5rem' },
  nombre:     { fontWeight: 700, fontSize: '1rem', color: '#dc2626', margin: '0 0 0.5rem' },
  aviso:      { fontSize: '0.85rem', color: '#6b7280', margin: '0 0 1.5rem' },
  botones:    { display: 'flex', gap: '0.75rem', justifyContent: 'center' },
  btnCancelar:{ padding: '0.6rem 1.4rem', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' },
  btnEliminar:{ padding: '0.6rem 1.4rem', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' },
};

const GestionUsuarios = () => {
  const { usuario: usuarioActual } = useAutenticacion();
  const [usuarios, setUsuarios] = useState([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState({ nombre: '', correo: '', rol: 'cliente' });
  const [editando, setEditando] = useState(null);
  const [confirmarEliminar, setConfirmarEliminar] = useState(null); // usuario a eliminar
  const [filtroNombre, setFiltroNombre] = useState('');
  const [filtroRol, setFiltroRol] = useState('');
  const [exito, setExito] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const cargar = () => api.get('/usuarios').then((r) => setUsuarios(r.data));
  useEffect(() => { cargar(); }, []);

  const manejarCambio = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const manejarEnvio = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      await api.post('/autenticacion/registro', form);
      setForm({ nombre: '', correo: '', rol: 'cliente' });
      setMostrarForm(false);
      setExito(`Usuario creado. Se envió una contraseña provisional al correo ${form.correo}.`);
      setTimeout(() => setExito(''), 6000);
      cargar();
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al crear usuario');
    } finally {
      setCargando(false);
    }
  };

  const abrirEditar = (u) => setEditando({ id: u.id, nombre: u.nombre, correo: u.correo, rol: u.rol?.nombre });

  const guardarEdicion = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.put(`/usuarios/${editando.id}`, editando);
      setExito('Usuario actualizado correctamente.');
      setTimeout(() => setExito(''), 4000);
      setEditando(null);
      cargar();
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al actualizar');
    }
  };

  const confirmarYEliminar = async () => {
    try {
      await api.delete(`/usuarios/${confirmarEliminar.id}`);
      setExito('Usuario eliminado correctamente.');
      setTimeout(() => setExito(''), 4000);
      setConfirmarEliminar(null);
      cargar();
    } catch (err) {
      setError(err.response?.data?.mensaje || 'No se puede eliminar este usuario porque tiene tickets asociados.');
      setConfirmarEliminar(null);
      setTimeout(() => setError(''), 5000);
    }
  };

  const usuariosFiltrados = usuarios.filter((u) => {
    const coincideNombre = u.nombre.toLowerCase().includes(filtroNombre.toLowerCase());
    const coincideRol    = filtroRol === '' || u.rol?.nombre === filtroRol;
    return coincideNombre && coincideRol;
  });

  return (
    <div>
      {confirmarEliminar && (
        <ModalConfirmar
          nombre={confirmarEliminar.nombre}
          onConfirmar={confirmarYEliminar}
          onCancelar={() => setConfirmarEliminar(null)}
        />
      )}

      <div style={s.cabecera}>
        <h2 style={s.titulo}>Gestión de Usuarios</h2>
        <button onClick={() => { setMostrarForm(!mostrarForm); setEditando(null); }} style={s.btnNuevo}>
          {mostrarForm ? 'Cancelar' : '+ Nuevo Usuario'}
        </button>
      </div>

      {mostrarForm && (
        <div style={s.formCard}>
          <h3 style={s.formTitulo}>Registrar Nuevo Usuario</h3>
          <form onSubmit={manejarEnvio} style={s.form}>
            <div style={s.grid2}>
              <div style={s.campo}>
                <label style={s.etiqueta}>Nombre completo</label>
                <input name="nombre" value={form.nombre} onChange={manejarCambio} required style={s.entrada} placeholder="Nombre Apellido" />
              </div>
              <div style={s.campo}>
                <label style={s.etiqueta}>Correo electrónico</label>
                <input name="correo" type="email" value={form.correo} onChange={manejarCambio} required style={s.entrada} placeholder="usuario@ejemplo.com" />
              </div>
              <div style={s.campo}>
                <label style={s.etiqueta}>Rol</label>
                <select name="rol" value={form.rol} onChange={manejarCambio} style={s.entrada}>
                  <option value="cliente">Cliente</option>
                  <option value="tecnico">Técnico</option>
                  <option value="administrador">Administrador</option>
                </select>
              </div>
            </div>
            {error && <p style={s.error}>{error}</p>}
            <button type="submit" disabled={cargando} style={s.btnEnviar}>
              {cargando ? 'Creando...' : 'Crear Usuario'}
            </button>
          </form>
        </div>
      )}

      {editando && (
        <div style={s.formCard}>
          <h3 style={s.formTitulo}>Editar Usuario</h3>
          <form onSubmit={guardarEdicion} style={s.form}>
            <div style={s.grid2}>
              <div style={s.campo}>
                <label style={s.etiqueta}>Nombre completo</label>
                <input value={editando.nombre} onChange={(e) => setEditando({ ...editando, nombre: e.target.value })} required style={s.entrada} />
              </div>
              <div style={s.campo}>
                <label style={s.etiqueta}>Correo electrónico</label>
                <input type="email" value={editando.correo} onChange={(e) => setEditando({ ...editando, correo: e.target.value })} required style={s.entrada} />
              </div>
              <div style={s.campo}>
                <label style={s.etiqueta}>Rol</label>
                <select value={editando.rol} onChange={(e) => setEditando({ ...editando, rol: e.target.value })} style={s.entrada}>
                  <option value="cliente">Cliente</option>
                  <option value="tecnico">Técnico</option>
                  <option value="administrador">Administrador</option>
                </select>
              </div>
            </div>
            {error && <p style={s.error}>{error}</p>}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="submit" style={s.btnEnviar}>Guardar cambios</button>
              <button type="button" onClick={() => setEditando(null)} style={s.btnCancelar}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

      {exito && <div style={s.exitoMsg}>{exito}</div>}
      {error && !mostrarForm && !editando && <div style={s.errorMsg}>{error}</div>}

      {/* Filtros */}
      <div style={s.filtros}>
        <input
          placeholder="Buscar por nombre..."
          value={filtroNombre}
          onChange={(e) => setFiltroNombre(e.target.value)}
          style={{ ...s.entrada, flex: 1 }}
        />
        <select value={filtroRol} onChange={(e) => setFiltroRol(e.target.value)} style={{ ...s.entrada, minWidth: '160px' }}>
          <option value="">Todos los roles</option>
          <option value="cliente">Cliente</option>
          <option value="tecnico">Técnico</option>
          <option value="administrador">Administrador</option>
        </select>
      </div>

      <div style={s.tabla}>
        <div style={s.encabezado}>
          <span>Nombre</span><span>Correo</span><span>Rol</span><span>Fecha de registro</span><span></span>
        </div>
        {usuariosFiltrados.map((u) => (
          <div key={u.id} style={s.fila}>
            <div style={s.userInfo}>
              <div style={s.avatar}>{u.nombre[0]}</div>
              <span style={{ fontWeight: 600 }}>{u.nombre}</span>
            </div>
            <span style={s.celda}>{u.correo}</span>
            <span style={{ ...s.rolBadge, background: colorRol[u.rol?.nombre] || '#ccc' }}>
              {u.rol?.nombre || '—'}
            </span>
            <span style={s.celda}>{new Date(u.fecha_creacion || u.creado_en).toLocaleDateString()}</span>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button onClick={() => { setMostrarForm(false); abrirEditar(u); }} style={s.btnEditar}>✏️</button>
              {Number(usuarioActual?.id) !== Number(u.id) && (
                <button onClick={() => setConfirmarEliminar(u)} style={s.btnEliminar}>🗑️</button>
              )}
            </div>
          </div>
        ))}
        {usuariosFiltrados.length === 0 && (
          <p style={{ padding: '1rem', color: '#9ca3af', textAlign: 'center' }}>No se encontraron usuarios.</p>
        )}
      </div>
    </div>
  );
};

const s = {
  cabecera:    { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  titulo:      { fontSize: '1.5rem', fontWeight: 700, color: 'var(--azul-oscuro)' },
  btnNuevo:    { background: 'var(--azul-oscuro)', color: '#fff', padding: '0.6rem 1.2rem', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' },
  formCard:    { background: '#fff', borderRadius: 'var(--radio)', padding: '1.5rem', boxShadow: 'var(--sombra)', marginBottom: '1.5rem' },
  formTitulo:  { fontWeight: 700, color: 'var(--azul-oscuro)', marginBottom: '1rem' },
  form:        { display: 'flex', flexDirection: 'column', gap: '1rem' },
  grid2:       { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
  campo:       { display: 'flex', flexDirection: 'column', gap: '0.35rem' },
  etiqueta:    { fontWeight: 600, fontSize: '0.85rem', color: '#374151' },
  entrada:     { padding: '0.6rem 0.9rem', border: '1px solid var(--borde)', borderRadius: '8px', fontSize: '0.95rem', fontFamily: 'inherit' },
  error:       { color: '#dc2626', fontSize: '0.85rem' },
  btnEnviar:   { alignSelf: 'flex-start', padding: '0.6rem 1.5rem', background: 'var(--azul-oscuro)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' },
  btnCancelar: { alignSelf: 'flex-start', padding: '0.6rem 1.5rem', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' },
  filtros:     { display: 'flex', gap: '0.75rem', marginBottom: '1rem' },
  tabla:       { background: '#fff', borderRadius: 'var(--radio)', boxShadow: 'var(--sombra)', overflow: 'hidden' },
  encabezado:  { display: 'grid', gridTemplateColumns: '1.5fr 2fr 1fr 1fr 100px', padding: '0.75rem 1rem', background: 'var(--azul-oscuro)', color: '#fff', fontSize: '0.85rem', fontWeight: 700, gap: '1rem' },
  fila:        { display: 'grid', gridTemplateColumns: '1.5fr 2fr 1fr 1fr 100px', padding: '0.9rem 1rem', borderBottom: '1px solid var(--borde)', gap: '1rem', alignItems: 'center', fontSize: '0.85rem' },
  userInfo:    { display: 'flex', alignItems: 'center', gap: '0.6rem' },
  avatar:      { width: '32px', height: '32px', borderRadius: '50%', background: 'var(--lila)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 },
  celda:       { color: '#4b5563' },
  rolBadge:    { borderRadius: '20px', padding: '2px 10px', fontSize: '0.75rem', fontWeight: 700, color: '#fff', display: 'inline-block', width: 'fit-content' },
  exitoMsg:    { background: '#dcfce7', color: '#166534', border: '1px solid #86efac', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.9rem' },
  errorMsg:    { background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.9rem' },
  btnEditar:   { padding: '0.35rem 0.6rem', background: '#f0f1ff', color: 'var(--azul-medio)', border: '1px solid var(--lila)', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem' },
  btnEliminar: { padding: '0.35rem 0.6rem', background: '#fff0f0', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem' },
};

export default GestionUsuarios;
