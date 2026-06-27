import { createContext, useContext, useState } from 'react';
import api from '../servicios/api';

const ContextoAutenticacion = createContext(null);

export const ProveedorAutenticacion = ({ children }) => {
  const [usuario, setUsuario] = useState(() => {
    const guardado = localStorage.getItem('usuario');
    return guardado ? JSON.parse(guardado) : null;
  });

  const iniciarSesion = async (correo, contrasena) => {
    const { data } = await api.post('/autenticacion/iniciar-sesion', { correo, contrasena });
    localStorage.setItem('token', data.token);
    localStorage.setItem('usuario', JSON.stringify(data.usuario));
    setUsuario(data.usuario);
    return { usuario: data.usuario, primer_ingreso: data.primer_ingreso };
  };

  const cerrarSesion = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setUsuario(null);
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
