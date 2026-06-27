import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAutenticacion } from '../contexto/ContextoAutenticacion';
import api from '../servicios/api';

const requisitos = [
  { texto: 'Mínimo 8 caracteres',           fn: (p) => p.length >= 8 },
  { texto: 'Al menos una letra mayúscula',   fn: (p) => /[A-Z]/.test(p) },
  { texto: 'Al menos una letra minúscula',   fn: (p) => /[a-z]/.test(p) },
  { texto: 'Al menos un número',             fn: (p) => /[0-9]/.test(p) },
  { texto: 'Al menos un carácter especial',  fn: (p) => /[^A-Za-z0-9]/.test(p) },
];

const CambiarContrasena = () => {
  const [nueva, setNueva]         = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [error, setError]         = useState('');
  const [cargando, setCargando]   = useState(false);
  const [verNueva, setVerNueva]       = useState(false);
  const [verConfirmar, setVerConfirmar] = useState(false);
  const { usuario } = useAutenticacion();
  const navegar = useNavigate();

  const cumpleRequisitos = requisitos.every((r) => r.fn(nueva));

  const manejarEnvio = async (e) => {
    e.preventDefault();
    if (!cumpleRequisitos) return setError('La contraseña no cumple todos los requisitos.');
    if (nueva !== confirmar) return setError('Las contraseñas no coinciden.');
    setCargando(true);
    setError('');
    try {
      await api.put('/autenticacion/cambiar-contrasena', { nueva_contrasena: nueva });
      // Redirigir según rol
      if (usuario.rol === 'administrador') navegar('/admin/tablero');
      else if (usuario.rol === 'tecnico') navegar('/tecnico/tickets');
      else navegar('/cliente/mis-tickets');
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al cambiar contraseña');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={s.fondo}>
      <div style={s.tarjeta}>
        <h2 style={s.titulo}>🔑 Cambiar contraseña</h2>
        <p style={s.sub}>Hola <strong>{usuario?.nombre}</strong>. Ingresa y confirma tu nueva contraseña.</p>

        <form onSubmit={manejarEnvio} style={s.form}>
          <div style={s.campo}>
            <label style={s.etiqueta}>Nueva contraseña</label>
            <div style={s.inputWrap}>
              <input type={verNueva ? 'text' : 'password'} value={nueva} onChange={(e) => setNueva(e.target.value)} required style={{ ...s.entrada, flex: 1, border: 'none', outline: 'none' }} />
              <button type="button" onClick={() => setVerNueva(!verNueva)} style={s.ojo}>{verNueva ? '🙈' : '👁️'}</button>
            </div>
          </div>

          <div style={s.requisitos}>
            {requisitos.map((r) => (
              <div key={r.texto} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem' }}>
                <span style={{ color: r.fn(nueva) ? '#22c55e' : '#d1d5db', fontSize: '1rem' }}>
                  {r.fn(nueva) ? '✅' : '○'}
                </span>
                <span style={{ color: r.fn(nueva) ? '#15803d' : '#6b7280' }}>{r.texto}</span>
              </div>
            ))}
          </div>

          <div style={s.campo}>
            <label style={s.etiqueta}>Confirmar contraseña</label>
            <div style={s.inputWrap}>
              <input type={verConfirmar ? 'text' : 'password'} value={confirmar} onChange={(e) => setConfirmar(e.target.value)} required style={{ ...s.entrada, flex: 1, border: 'none', outline: 'none' }} />
              <button type="button" onClick={() => setVerConfirmar(!verConfirmar)} style={s.ojo}>{verConfirmar ? '🙈' : '👁️'}</button>
            </div>
            {confirmar && nueva !== confirmar && (
              <p style={{ color: '#dc2626', fontSize: '0.8rem' }}>Las contraseñas no coinciden</p>
            )}
          </div>

          {error && <p style={s.error}>{error}</p>}

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button type="button" onClick={() => navegar(-1)} style={s.btnCancelar}>Cancelar</button>
            <button type="submit" disabled={cargando || !cumpleRequisitos || nueva !== confirmar} style={s.btn}>
              {cargando ? 'Guardando...' : 'Guardar contraseña'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const s = {
  fondo:    { minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--fondo)' },
  tarjeta:  { background: '#fff', borderRadius: 'var(--radio)', padding: '2.5rem', boxShadow: 'var(--sombra)', maxWidth: '460px', width: '100%' },
  titulo:   { fontSize: '1.4rem', fontWeight: 700, color: 'var(--azul-oscuro)', marginBottom: '0.5rem' },
  sub:      { color: '#6b7280', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.5 },
  form:     { display: 'flex', flexDirection: 'column', gap: '1.25rem' },
  campo:    { display: 'flex', flexDirection: 'column', gap: '0.35rem' },
  etiqueta: { fontWeight: 600, fontSize: '0.9rem', color: '#374151' },
  entrada:  { padding: '0.65rem 0.9rem', border: '1px solid var(--borde)', borderRadius: '8px', fontSize: '1rem' },
  inputWrap:{ display: 'flex', alignItems: 'center', border: '1px solid var(--borde)', borderRadius: '8px', overflow: 'hidden' },
  ojo:      { padding: '0 0.75rem', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.1rem' },
  requisitos:{ background: '#f9fafb', borderRadius: '8px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  error:    { color: '#dc2626', fontSize: '0.85rem' },
  btn:       { flex: 1, padding: '0.75rem', background: 'var(--azul-oscuro)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '1rem' },
  btnCancelar:{ padding: '0.75rem 1.25rem', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '1rem' },
};

export default CambiarContrasena;
