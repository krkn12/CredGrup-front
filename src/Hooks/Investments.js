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

  const formatDate = (date) => date ? new Date(date).toLocaleDateString('pt-BR') : '-';

  return (
    <div className="card mt-3">
      <div className="card-body">
        <h5 className="card-title">Investimentos</h5>
        <p>Invista na PagTudo e receba 15% ao ano! Resgate disponível após 1 ano.</p>
        {message && (
          <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'}`}>
            {message.text}
          </div>
        )}
        <div className="mb-3">
          <p><strong>Saldo Investido:</strong> R$ {investmentData.amount.toFixed(2)}</p>
          <p><strong>Lucro Estimado (15% a.a.):</strong> R$ {investmentData.profit.toFixed(2)}</p>
          <p><strong>Data Inicial:</strong> {formatDate(investmentData.initialDate)}</p>
          <p><strong>Resgate Disponível em:</strong> {investmentData.initialDate ? formatDate(new Date(new Date(investmentData.initialDate).setFullYear(new Date(investmentData.initialDate).getFullYear() + 1))) : '-'}</p>
        </div>
        <div className="mb-3">
          <label htmlFor="investmentAmount" className="form-label">Adicionar ao Investimento (R$)</label>
          <input
            type="number"
            className="form-control"
            id="investmentAmount"
            value={investmentAmount}
            onChange={(e) => setInvestmentAmount(e.target.value)}
            disabled={loading}
            min="1"
            step="0.01"
          />
          <small className="text-muted">Saldo disponível: R$ {saldoReais.toFixed(2)}</small>
        </div>
        <div className="d-flex gap-2">
          <button
            className="btn btn-warning"
            onClick={handleInvest}
            disabled={loading || !investmentAmount || parseFloat(investmentAmount) > saldoReais}
          >
            {loading ? 'Processando...' : 'Investir'}
          </button>
          <button
            className="btn btn-success"
            onClick={handleWithdraw}
            disabled={loading || !investmentData.canWithdraw || investmentData.amount === 0}
          >
            {loading ? 'Processando...' : 'Resgatar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Investments;