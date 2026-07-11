import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: adjunta el token JWT en cada petición si existe
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor: maneja errores de autenticación globalmente (excepto en el login)
api.interceptors.response.use(
  (respuesta) => respuesta,
  (error) => {
    const esRutaLogin = error.config?.url?.includes('iniciar-sesion');
    if (!esRutaLogin && (error.response?.status === 401 || error.response?.status === 403)) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      const mensaje = error.response?.data?.mensaje;
      if (mensaje === 'SESION_OTRO_DISPOSITIVO') {
        window.location.href = '/iniciar-sesion?razon=otro_dispositivo';
      } else {
        window.location.href = '/iniciar-sesion';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
