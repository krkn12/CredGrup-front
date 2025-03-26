import { useState, useEffect } from 'react';
import axios from 'axios';

function AdminConfig() {
  const [config, setConfig] = useState({ loanInterestRate: 0, investmentInterestRate: 0, btcRewardRate: 0 });
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const { data } = await axios.get('/api/admin/config', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setConfig(data);
      } catch (error) {
        console.error('Erro ao carregar config:', error);
      }
    };
    fetchConfig();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.put('/api/admin/config', config, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setMessage('Configurações atualizadas com sucesso!');
      setConfig(data);
    } catch (error) {
      setMessage('Erro ao atualizar: ' + error.response?.data?.message);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Configurações Administrativas</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Taxa de Juros de Empréstimo (%):
          <input
            type="number"
            step="0.01"
            value={config.loanInterestRate * 100}
            onChange={(e) => setConfig({ ...config, loanInterestRate: e.target.value / 100 })}
          />
        </label>
        <label>
          Taxa de Juros de Investimento (%):
          <input
            type="number"
            step="0.01"
            value={config.investmentInterestRate * 100}
            onChange={(e) => setConfig({ ...config, investmentInterestRate: e.target.value / 100 })}
          />
        </label>
        <label>
          Taxa de Recompensa BTC (%):
          <input
            type="number"
            step="0.0001"
            value={config.btcRewardRate * 100}
            onChange={(e) => setConfig({ ...config, btcRewardRate: e.target.value / 100 })}
          />
        </label>
        <button type="submit">Salvar</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default AdminConfig;