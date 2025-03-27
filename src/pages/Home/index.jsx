import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Link } from 'react-router-dom';
import '@/styles/home.css';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="home-container">
      <header className="hero-section">
        <h1>Bem-vindo ao CredGrup</h1>
        <p>Sua plataforma completa de serviços financeiros</p>
        
        {!user ? (
          <div className="auth-buttons">
            <Link to="/login" className="btn primary">Entrar</Link>
            <Link to="/register" className="btn secondary">Cadastre-se</Link>
          </div>
        ) : (
          <Link to="/dashboard" className="btn primary">Acessar Dashboard</Link>
        )}
      </header>

      <section className="features">
        <div className="feature-card">
          <h3>Empréstimos</h3>
          <p>Taxas competitivas e aprovação rápida</p>
        </div>
        
        <div className="feature-card">
          <h3>Investimentos</h3>
          <p>Diversas opções para seu perfil</p>
        </div>
        
        <div className="feature-card">
          <h3>Pagamentos</h3>
          <p>Realize pagamentos com segurança</p>
        </div>
      </section>
    </div>
  );
};

export default Home;