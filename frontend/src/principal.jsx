import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProveedorAutenticacion } from './contexto/ContextoAutenticacion';
import './estilos/variables.css';

import InicioSesion         from './paginas/InicioSesion';
import CambiarContrasena    from './paginas/CambiarContrasena';
// Cliente
import MisTickets           from './paginas/cliente/MisTickets';
import CrearTicket          from './paginas/cliente/CrearTicket';
import DetalleTicket        from './paginas/cliente/DetalleTicket';
// Técnico
import TicketsTecnico       from './paginas/tecnico/TicketsTecnico';
import TableroTecnico       from './paginas/tecnico/TableroTecnico';
import DetalleTicketTecnico from './paginas/tecnico/DetalleTicketTecnico';
// Admin
import TodosLosTickets      from './paginas/admin/TodosLosTickets';
import TableroAdmin         from './paginas/admin/TableroAdmin';
import GestionUsuarios      from './paginas/admin/GestionUsuarios';
import Auditoria            from './paginas/admin/Auditoria';

import RutaProtegida from './componentes/RutaProtegida';

createRoot(document.getElementById('raiz')).render(
  <StrictMode>
    <ProveedorAutenticacion>
      <BrowserRouter>
        <Routes>
          <Route path="/iniciar-sesion" element={<InicioSesion />} />
          <Route path="/cambiar-contrasena" element={<RutaProtegida><CambiarContrasena /></RutaProtegida>} />

          {/* Rutas Cliente */}
          <Route path="/cliente/mis-tickets"    element={<RutaProtegida roles={['cliente']}><MisTickets /></RutaProtegida>} />
          <Route path="/cliente/crear-ticket"   element={<RutaProtegida roles={['cliente']}><CrearTicket /></RutaProtegida>} />
          <Route path="/cliente/ticket/:id"     element={<RutaProtegida roles={['cliente']}><DetalleTicket /></RutaProtegida>} />

          {/* Rutas Técnico */}
          <Route path="/tecnico/tickets"        element={<RutaProtegida roles={['tecnico']}><TicketsTecnico /></RutaProtegida>} />
          <Route path="/tecnico/tablero"        element={<RutaProtegida roles={['tecnico']}><TableroTecnico /></RutaProtegida>} />
          <Route path="/tecnico/ticket/:id"     element={<RutaProtegida roles={['tecnico']}><DetalleTicketTecnico /></RutaProtegida>} />

          {/* Rutas Admin */}
          <Route path="/admin/tickets"          element={<RutaProtegida roles={['administrador']}><TodosLosTickets /></RutaProtegida>} />
          <Route path="/admin/tablero"          element={<RutaProtegida roles={['administrador']}><TableroAdmin /></RutaProtegida>} />
          <Route path="/admin/usuarios"         element={<RutaProtegida roles={['administrador']}><GestionUsuarios /></RutaProtegida>} />
          <Route path="/admin/auditoria"        element={<RutaProtegida roles={['administrador']}><Auditoria /></RutaProtegida>} />

          <Route path="/" element={<Navigate to="/iniciar-sesion" replace />} />
          <Route path="*" element={<Navigate to="/iniciar-sesion" replace />} />
        </Routes>
      </BrowserRouter>
    </ProveedorAutenticacion>
  </StrictMode>
);
