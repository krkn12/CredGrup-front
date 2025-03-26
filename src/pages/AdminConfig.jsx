import { useState, useEffect } from 'react';
import axios from 'axios';

function AdminConfig() {
  const [config, setConfig] = useState({ loanInterestRate: 0, investmentInterestRate: 0, btcRewardRate: 0.0002 });
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await axios.get('https://credgrup.click/api/admin/config', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setConfig(res.data);
      } catch (err) {
        setError('Erro ao carregar configuração');
      }
    };
    fetchConfig();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(
        'https://credgrup.click/api/admin/config',
        config,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setConfig(res.data);
      setError('');
    } catch (err) {
      setError('Erro ao salvar configuração');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl mb-4">Configurações Admin</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow">
        <div className="mb-4">
          <label className="block mb-2">Taxa de Juros de Empréstimo (%)</label>
          <input
            type="number"
            value={config.loanInterestRate * 100}
            onChange={(e) => setConfig({ ...config, loanInterestRate: e.target.value / 100 })}
            className="w-full p-2 border rounded"
            step="0.1"
            min="0"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2">Taxa de Juros de Investimento (%)</label>
          <input
            type="number"
            value={config.investmentInterestRate * 100}
            onChange={(e) => setConfig({ ...config, investmentInterestRate: e.target.value / 100 })}
            className="w-full p-2 border rounded"
            step="0.1"
            min="0"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2">Taxa de Ganho em BTC por Pagamento (%)</label>
          <input
            type="number"
            value={config.btcRewardRate * 100}
            onChange={(e) => setConfig({ ...config, btcRewardRate: e.target.value / 100 })}
            className="w-full p-2 border rounded"
            step="0.01"
            min="0"
          />
        </div>
        <button type="submit" className="p-2 bg-blue-500 text-white rounded">Salvar</button>
      </form>
    </div>
  );
}

export default AdminConfig;