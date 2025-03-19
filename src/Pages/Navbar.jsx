import React, { useEffect, useState } from 'react';
import '../Pages/Styles/Navbar.css';
import "bootstrap/dist/css/bootstrap.min.css";
import { PersonFill, Key, BoxArrowRight, Gear, Person } from 'react-bootstrap-icons'; // Adicionei Person para o ícone de usuário
import { useNavigate, useLocation } from 'react-router-dom';

function Navbar({ isAuthPage, currentUser, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(currentUser);
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const syncUser = () => {
      const storedUser = JSON.parse(localStorage.getItem('currentUser'));
      setUser(storedUser || null);
    };

    syncUser();
    window.addEventListener('storage', syncUser);
    return () => window.removeEventListener('storage', syncUser);
  }, []);

  const displayUser = currentUser || user;

  const handleAuthClick = (tab) => {
    navigate('/auth', { state: { activeTab: tab } });
  };

  const handleHomeClick = (e) => {
    e.preventDefault();
    navigate('/');
  };

  const handleAdminClick = () => {
    navigate('/admin');
  };
  
  // Nova função para ir para a área do usuário
  const handleUserAreaClick = () => {
    navigate('/user');
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setUser(null);
    window.dispatchEvent(new Event('storage'));
    if (onLogout) onLogout(); // Sinaliza que o logout está acontecendo
    navigate('/', { replace: true }); // Redireciona para a página inicial
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-warning fixed-top">
      <div className="container">
        <a className="navbar-brand" href="/" onClick={handleHomeClick}>
          PagContas 💰
        </a>
        
        <div className="ms-auto">
          {displayUser ? (
            <div className="d-flex align-items-center">
              <span className="text-white me-3">
                Olá, {displayUser.name.split(' ')[0]}
              </span>
              {displayUser.isAdmin && (
                <>
                  <button className="btn btn-light me-2" onClick={handleAdminClick}>
                    <Gear /> Admin
                  </button>
                  <button className="btn btn-light me-2" onClick={handleUserAreaClick}>
                    <Person /> Área do Usuário
                  </button>
                </>
              )}
              <button className="btn btn-light" onClick={handleLogout}>
                <BoxArrowRight /> Sair
              </button>
            </div>
          ) : (
            isHomePage && !isAuthPage && (
              <>
                <button
                  className="btn btn-light me-2"
                  onClick={() => handleAuthClick('login')}
                >
                  <PersonFill /> Entrar
                </button>
                <button
                  className="btn btn-light"
                  onClick={() => handleAuthClick('register')}
                >
                  <Key /> Cadastrar
                </button>
              </>
            )
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;