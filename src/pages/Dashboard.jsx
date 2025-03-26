import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

function Dashboard() {
  const { user } = useAuth();
  const [walletData, setWalletData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        const res = await axios.get('https://credgrup.click/api/wallet/data', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setWalletData(res.data);
      } catch (error) {
        setError(error.response?.data?.message || 'Erro ao carregar dados da carteira');
      }
    };
    fetchWalletData();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl mb-4">Bem-vindo, {user.name}</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {walletData && (
        <div className="bg-white p-4 rounded shadow mb-6">
          <h2 className="text-xl mb-2">Informações da Carteira</h2>
          <p><strong>Saldo WBTC:</strong> {walletData.wbtcBalance.toFixed(8)} WBTC</p>
          <p><strong>Total Investido:</strong> {walletData.totalInvested.toFixed(2)} USD</p>
          <p><strong>Disponível para Empréstimo:</strong> {walletData.loanAvailable.toFixed(2)} USD</p>
          <p><strong>Última Atualização:</strong> {new Date(walletData.lastUpdated).toLocaleString()}</p>
        </div>
      )}
    </div>
  );
}

export default Dashboard;