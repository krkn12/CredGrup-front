import React, { useState } from 'react';
import { useLocation, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from "./Pages/Navbar";
import Inicio from "./Pages/Inicio";
import Page_user from "./Pages/Page_user";
import Page_admin from "./Components/Page_admin";
import Auth from "./Pages/auth";

function Dashboard({ currentUser, onLogin, onLogout }) {
  const location = useLocation();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const isAuthPage = location.pathname === '/auth';

  const handleLogout = () => {
    setIsLoggingOut(true);
    onLogout();
  };
  
  // Componente para proteger rotas de usuários autenticados
  const RequireAuth = ({ children }) => {
    if (!currentUser) {
      return <Navigate to="/auth" state={{ from: location }} replace />;
    }
    return children;
  };
  
  // Componente para proteger rotas de administradores
  const RequireAdmin = ({ children }) => {
    if (!currentUser) {
      return <Navigate to="/auth" state={{ from: location }} replace />;
    }
    if (!currentUser.isAdmin) {
      return <Navigate to="/user" replace />; // Redireciona para a página de usuário se não for admin
    }
    return children;
  };

  return (
    <div>
      <Navbar 
        isAuthPage={isAuthPage} 
        currentUser={currentUser} 
        onLogout={handleLogout}
      />
      <div className="container mt-5 pt-5">
        <Routes>
          <Route path="/" element={<Inicio currentUser={currentUser} />} />
          <Route 
            path="/auth" 
            element={currentUser ? <Navigate to={currentUser.isAdmin ? "/admin" : "/user"} replace /> : <Auth onLogin={onLogin} />} 
          />
          <Route 
            path="/user" 
            element={
              <RequireAuth>
                <Page_user currentUser={currentUser} onLogout={onLogout} />
              </RequireAuth>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <RequireAdmin>
                <Page_admin currentUser={currentUser} onLogout={onLogout} />
              </RequireAdmin>
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}

export default Dashboard;