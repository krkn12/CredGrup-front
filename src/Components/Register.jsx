import React, { useState } from 'react';
import { Key } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function Register({ onRegisterSuccess }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Nome é obrigatório';
    if (!formData.email) newErrors.email = 'Email é obrigatório';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email inválido';
    if (!formData.phone) newErrors.phone = 'Telefone é obrigatório';
    else if (!/^\(\d{2}\) \d{5}-\d{4}$/.test(formData.phone))
      newErrors.phone = 'Formato inválido. Use (99) 99999-9999';
    if (!formData.password) newErrors.password = 'Senha é obrigatória';
    else if (formData.password.length < 6)
      newErrors.password = 'A senha deve ter pelo menos 6 caracteres';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Confirme sua senha';
    else if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = 'As senhas não coincidem';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length <= 11) {
      if (value.length > 2) value = `(${value.substring(0, 2)}) ${value.substring(2)}`;
      if (value.length > 10) value = `${value.substring(0, 10)}-${value.substring(10)}`;
      setFormData((prev) => ({ ...prev, phone: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await api.post('/users/register', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      });

      // O back-end retorna o usuário completo com status 201
      if (response.status === 201) {
        const { name, email } = response.data; // Pega alguns dados do usuário retornado
        setSuccessMessage(`Cadastro realizado com sucesso para ${name}! Redirecionando para o login...`);
        setFormData({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
        if (onRegisterSuccess) onRegisterSuccess();
        setTimeout(() => {
          setSuccessMessage('');
          navigate('/auth', { replace: true });
        }, 2000);
      } else {
        throw new Error('Resposta inesperada do servidor');
      }
    } catch (error) {
      console.error('Erro ao registrar:', error);
      setErrors({
        submit: error.response?.data?.message || 'Erro ao registrar. Tente novamente.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {successMessage && (
        <div className="alert alert-success mb-3" role="alert">
          {successMessage}
        </div>
      )}
      {errors.submit && (
        <div className="alert alert-danger mb-3" role="alert">
          {errors.submit}
        </div>
      )}
      <div className="mb-3">
        <label htmlFor="name" className="form-label">Nome</label>
        <input
          type="text"
          className={`form-control ${errors.name ? 'is-invalid' : ''}`}
          id="name"
          placeholder="Seu nome completo"
          value={formData.name}
          onChange={handleChange}
        />
        {errors.name && <div className="invalid-feedback">{errors.name}</div>}
      </div>
      <div className="mb-3">
        <label htmlFor="email" className="form-label">Email</label>
        <input
          type="email"
          className={`form-control ${errors.email ? 'is-invalid' : ''}`}
          id="email"
          placeholder="Seu email"
          value={formData.email}
          onChange={handleChange}
        />
        {errors.email && <div className="invalid-feedback">{errors.email}</div>}
      </div>
      <div className="mb-3">
        <label htmlFor="phone" className="form-label">Telefone</label>
        <input
          type="tel"
          className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
          id="phone"
          placeholder="(99) 99999-9999"
          value={formData.phone}
          onChange={handlePhoneChange}
        />
        {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
      </div>
      <div className="mb-3">
        <label htmlFor="password" className="form-label">Senha</label>
        <input
          type="password"
          className={`form-control ${errors.password ? 'is-invalid' : ''}`}
          id="password"
          placeholder="Sua senha"
          value={formData.password}
          onChange={handleChange}
        />
        {errors.password && <div className="invalid-feedback">{errors.password}</div>}
      </div>
      <div className="mb-3">
        <label htmlFor="confirmPassword" className="form-label">Confirmar Senha</label>
        <input
          type="password"
          className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
          id="confirmPassword"
          placeholder="Confirme sua senha"
          value={formData.confirmPassword}
          onChange={handleChange}
        />
        {errors.confirmPassword && (
          <div className="invalid-feedback">{errors.confirmPassword}</div>
        )}
      </div>
      <button type="submit" className="btn btn-warning w-100" disabled={isLoading}>
        {isLoading ? (
          <>
            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            Cadastrando...
          </>
        ) : (
          <>
            <Key /> Cadastrar
          </>
        )}
      </button>
    </form>
  );
}

export default Register;