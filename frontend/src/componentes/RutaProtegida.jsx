import { Navigate } from 'react-router-dom';
import { useAutenticacion } from '../contexto/ContextoAutenticacion';
import Navegacion from './Navegacion';

const RutaProtegida = ({ children, roles }) => {
  const { usuario } = useAutenticacion();

  if (!usuario) return <Navigate to="/iniciar-sesion" replace />;
  if (roles && !roles.includes(usuario.rol)) return <Navigate to="/iniciar-sesion" replace />;

  return (
    <>
      <Navegacion />
      <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        {children}
      </main>
    </>
  );
};

export default RutaProtegida;
