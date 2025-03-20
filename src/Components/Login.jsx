import React, { useState } from 'react';
import { PersonFill, ArrowClockwise } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function Login({ onLogin }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [showRecoveryForm, setShowRecoveryForm] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryMessage, setRecoveryMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email é obrigatório';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email inválido';
    if (!formData.password) newErrors.password = 'Senha é obrigatória';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRememberMeChange = (e) => {
    setRememberMe(e.target.checked);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await api.post('/users/login', {
        email: formData.email,
        password: formData.password,
      });

      const { token, id, name, email, saldoReais, wbtcBalance, pontos, walletAddress, isAdmin } = response.data;

      if (rememberMe) {
        localStorage.setItem('token', token);
      } else {
        sessionStorage.setItem('token', token);
      }

      const loggedUser = {
        id,
        name,
        email,
        saldoReais: saldoReais || 0,
        wbtcBalance: wbtcBalance || 0,
        pontos: pontos || 0,
        walletAddress: walletAddress || '0xSeuEnderecoAqui',
        isAdmin: isAdmin || false,
      };
      localStorage.setItem('currentUser', JSON.stringify(loggedUser));

      setSuccessMessage('Login realizado com sucesso! Redirecionando...');
      if (onLogin) {
        onLogin(loggedUser);
      }

      setTimeout(() => {
        setSuccessMessage('');
        const redirectTo = isAdmin ? '/admin' : '/user';
        navigate(redirectTo, { replace: true });
      }, 1000);
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      setErrors({
        auth: error.response?.data?.error || 'Erro ao fazer login. Verifique sua conexão ou credenciais.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Resto do código (recuperação de senha) ...
  const handleRecoveryEmailChange = (e) => {
    setRecoveryEmail(e.target.value);
  };

  const handleRecoverySubmit = async (e) => {
    e.preventDefault();
    if (!recoveryEmail) {
      setRecoveryMessage({ type: 'error', text: 'Por favor, informe seu email' });
      return;
    }
    if (!/\S+@\S+\.\S+/.test(recoveryEmail)) {
      setRecoveryMessage({ type: 'error', text: 'Email inválido' });
      return;
    }

    setRecoveryMessage({
      type: 'success',
      text: 'Instruções de recuperação enviadas para seu email. Verifique sua caixa de entrada.',
    });
    setTimeout(() => {
      setRecoveryEmail('');
      setRecoveryMessage('');
      setShowRecoveryForm(false);
    }, 3000);
  };

  const toggleRecoveryForm = (e) => {
    e.preventDefault();
    setShowRecoveryForm(!showRecoveryForm);
    setRecoveryMessage('');
  };

  return (
    // JSX completo omitido por brevidade, mas deve estar correto como você passou
    <></>
  );
}

export default Login;