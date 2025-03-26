import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

function Dashboard() {
  const { user, logout } = useAuth();
  const [walletData, setWalletData] = useState(null);

  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        const res = await axios.get('https://credgrup.click/api/wallet/data', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setWalletData(res.data);
      } catch (error) {
        console.error('Error fetching wallet data:', error);
      }
    };
    fetchWalletData();
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl">Bem-vindo, {user.name}</h1>
        <button onClick={logout} className="p-2 bg-red-500 text-white rounded">
          Sair
        </button>
      </div>
      {walletData && (
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl mb-2">Dados da Carteira</h2>
          <p>Saldo WBTC: {walletData.wbtcBalance}</p>
          <p>Última atualização: {new Date(walletData.lastUpdated).toLocaleString()}</p>
        </div>
      )}
      {user.isAdmin && (
        <a href="/admin/config" className="mt-4 inline-block p-2 bg-blue-500 text-white rounded">
          Configurações Admin
        </a>
      )}
    </div>
  );
}

export default Dashboard;