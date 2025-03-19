import React, { useState, useEffect } from 'react';
import { PersonFill, Key } from 'react-bootstrap-icons';
import { useLocation, useNavigate } from 'react-router-dom';
import Login from '../Components/Login';
import Register from '../Components/Register';
import './Styles/Auth.css';

function Auth({ onLogin }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('login');

  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location]);

  const handleBackToHome = () => navigate('/');
  const handleRegisterSuccess = () => setActiveTab('login');

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <ul className="nav nav-tabs card-header-tabs justify-content-center">
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'login' ? 'active' : ''}`}
                    onClick={() => setActiveTab('login')}
                  >
                    <PersonFill /> Entrar
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'register' ? 'active' : ''}`}
                    onClick={() => setActiveTab('register')}
                  >
                    <Key /> Cadastrar
                  </button>
                </li>
              </ul>
            </div>
            <div className="card-body">
              {activeTab === 'login' ? 
                <Login onLogin={onLogin} /> : 
                <Register onRegisterSuccess={handleRegisterSuccess} />
              }
              <div className="text-center mt-3">
                <button 
                  className="btn btn-link text-secondary" 
                  onClick={handleBackToHome}
                >
                  Voltar para a página inicial
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Auth;