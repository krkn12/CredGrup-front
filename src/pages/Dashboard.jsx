import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

function Dashboard() {
  const { user } = useAuth();
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
      <h1 className="text-2xl mb-4">Bem-vindo, {user.name}</h1>
      {walletData && (
        <div className="bg-white p-4 rounded shadow mb-6">
          <h2 className="text-xl mb-2">Carteira</h2>
          <p>Saldo WBTC: {walletData.wbtcBalance}</p>
          <p>Última atualização: {new Date(walletData.lastUpdated).toLocaleString()}</p>
        </div>
      )}
    </div>
  );
}

export default Dashboard;