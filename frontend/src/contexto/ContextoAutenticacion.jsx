import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import api from '../servicios/api';

const ContextoAutenticacion = createContext(null);

const TIEMPO_INACTIVIDAD = 5 * 60 * 1000; // 5 minutos

export const ProveedorAutenticacion = ({ children }) => {
  const [usuario, setUsuario] = useState(() => {
    const guardado = localStorage.getItem('usuario');
    return guardado ? JSON.parse(guardado) : null;
  });

  const temporizador = useRef(null);

  const cerrarSesion = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setUsuario(null);
    if (temporizador.current) clearTimeout(temporizador.current);
  }, []);

  const reiniciarTemporizador = useCallback(() => {
    if (temporizador.current) clearTimeout(temporizador.current);
    temporizador.current = setTimeout(() => {
      cerrarSesion();
      window.location.href = '/iniciar-sesion';
    }, TIEMPO_INACTIVIDAD);
  }, [cerrarSesion]);

  useEffect(() => {
    if (!usuario) return;

    const eventos = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];
    eventos.forEach((e) => window.addEventListener(e, reiniciarTemporizador));
    reiniciarTemporizador();

    return () => {
      eventos.forEach((e) => window.removeEventListener(e, reiniciarTemporizador));
      if (temporizador.current) clearTimeout(temporizador.current);
    };
  }, [usuario, reiniciarTemporizador]);

  const iniciarSesion = async (correo, contrasena) => {
    const { data } = await api.post('/autenticacion/iniciar-sesion', { correo, contrasena });
    localStorage.setItem('token', data.token);
    localStorage.setItem('usuario', JSON.stringify(data.usuario));
    setUsuario(data.usuario);
    return { usuario: data.usuario, primer_ingreso: data.primer_ingreso };
  };

  return (
    <ContextoAutenticacion.Provider value={{ usuario, iniciarSesion, cerrarSesion }}>
      {children}
    </ContextoAutenticacion.Provider>
  );
};

export const useAutenticacion = () => {
  const contexto = useContext(ContextoAutenticacion);
  if (!contexto) throw new Error('useAutenticacion debe usarse dentro de ProveedorAutenticacion');
  return contexto;
};
