import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Investments = ({ currentUser, saldoReais, updateUserData }) => {
  const [investmentData, setInvestmentData] = useState({
    amount: 0,
    initialDate: null,
    canWithdraw: false,
    profit: 0,
  });
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const fetchInvestment = async () => {
      try {
        const response = await api.get('/api/investments/me');
        setInvestmentData(response.data);
      } catch (error) {
        console.error('Erro ao buscar investimento:', error);
      }
    };
    fetchInvestment();
  }, []);

  const handleInvest = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const amount = parseFloat(investmentAmount);
      if (!amount || amount <= 0) throw new Error('Valor inválido');
      if (amount > saldoReais) throw new Error('Saldo insuficiente');

      const response = await api.post('/api/investments', { amount });
      setInvestmentData({
        amount: response.data.investment.amount,
        initialDate: response.data.investment.initialDate,
        lastAddedDate: response.data.investment.lastAddedDate,
        canWithdraw: false,
        profit: response.data.investment.amount * 0.15,
      });
      updateUserData({ saldoReais: response.data.saldoReais });
      setMessage({ type: 'success', text: 'Investimento realizado com sucesso!' });
      setInvestmentAmount('');
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const response = await api.post('/api/investments/withdraw');
      setInvestmentData({ amount: 0, initialDate: null, canWithdraw: false, profit: 0 });
      updateUserData({ saldoReais: response.data.saldoReais });
      setMessage({ type: 'success', text: `Resgate de R$ ${response.data.amountWithdrawn.toFixed(2)} concluído!` });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || error.message });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => (date ? new Date(date).toLocaleDateString('pt-BR') : '-');

  return React.createElement(
    'div',
    { className: 'card mt-3' },
    React.createElement(
      'div',
      { className: 'card-body' },
      React.createElement('h5', { className: 'card-title' }, 'Investimentos'),
      React.createElement('p', null, 'Invista na PagTudo e receba 15% ao ano! Resgate disponível após 1 ano.'),
      message &&
        React.createElement(
          'div',
          { className: `alert alert-${message.type === 'success' ? 'success' : 'danger'}` },
          message.text
        ),
      React.createElement(
        'div',
        { className: 'mb-3' },
        React.createElement('p', null, 
          React.createElement('strong', null, 'Saldo Investido:'), 
          ` R$ ${investmentData.amount.toFixed(2)}`
        ),
        React.createElement('p', null, 
          React.createElement('strong', null, 'Lucro Estimado (15% a.a.):'), 
          ` R$ ${investmentData.profit.toFixed(2)}`
        ),
        React.createElement('p', null, 
          React.createElement('strong', null, 'Data Inicial:'), 
          ` ${formatDate(investmentData.initialDate)}`
        ),
        React.createElement('p', null, 
          React.createElement('strong', null, 'Resgate Disponível em:'), 
          ` ${investmentData.initialDate ? formatDate(new Date(new Date(investmentData.initialDate).setFullYear(new Date(investmentData.initialDate).getFullYear() + 1))) : '-' }`
        )
      ),
      React.createElement(
        'div',
        { className: 'mb-3' },
        React.createElement('label', { htmlFor: 'investmentAmount', className: 'form-label' }, 'Adicionar ao Investimento (R$)'),
        React.createElement('input', {
          type: 'number',
          className: 'form-control',
          id: 'investmentAmount',
          value: investmentAmount,
          onChange: (e) => setInvestmentAmount(e.target.value),
          disabled: loading,
          min: '1',
          step: '0.01',
        }),
        React.createElement('small', { className: 'text-muted' }, `Saldo disponível: R$ ${saldoReais.toFixed(2)}`)
      ),
      React.createElement(
        'div',
        { className: 'd-flex gap-2' },
        React.createElement(
          'button',
          {
            className: 'btn btn-warning',
            onClick: handleInvest,
            disabled: loading || !investmentAmount || parseFloat(investmentAmount) > saldoReais,
          },
          loading ? 'Processando...' : 'Investir'
        ),
        React.createElement(
          'button',
          {
            className: 'btn btn-success',
            onClick: handleWithdraw,
            disabled: loading || !investmentData.canWithdraw || investmentData.amount === 0,
          },
          loading ? 'Processando...' : 'Resgatar'
        )
      )
    )
  );
};

export default Investments;