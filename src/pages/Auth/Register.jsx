import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import '@/styles/auth.css'; // Estilo compartilhado com Login

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }
    
    const result = await register(formData);
    if (result.success) {
      navigate('/login');
    } else {
      setError(result.message || 'Erro no cadastro');
    }
  };

  return (
    <div className="auth-container">
      <h2>Criar Conta</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          placeholder="Nome completo"
          required
        />
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          placeholder="Email"
          required
        />
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
          placeholder="Senha (mínimo 6 caracteres)"
          minLength="6"
          required
        />
        <input
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
          placeholder="Confirme sua senha"
          required
        />
        <button type="submit">Cadastrar</button>
      </form>
    </div>
  );
};

export default Register;