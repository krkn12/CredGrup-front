import React from 'react';
import { NavLink } from 'react-router-dom';
import './styles/admin/admin-sidebar.css';

const AdminSidebar = () => {
  return (
    <aside className="admin-sidebar">
      <nav>
        <ul>
          <li>
            <NavLink 
              to="/admin" 
              end
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              Visão Geral
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/admin/users" 
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              Gerenciar Usuários
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/admin/transactions"
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              Transações
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/admin/settings"
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              Configurações
            </NavLink>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default AdminSidebar;