import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';

function Dashboard() {
  const { user } = useContext(AuthContext);
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const { data } = await axios.get('/api/wallet/data', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setWallet(data);
      } catch (error) {
        console.error('Erro ao carregar carteira:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchWallet();
  }, []);

  if (loading) return <p>Carregando...</p>;

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Bem-vindo, {user.name}</h1>
      {wallet && (
        <>
          <h2>Carteira</h2>
          <p>Saldo WBTC (BRL): {wallet.wbtcBalance.toFixed(2)}</p>
          <p>Total Investido (BRL): {wallet.totalInvested.toFixed(2)}</p>
          <p>Empréstimo Disponível (BRL): {wallet.loanAvailable.toFixed(2)}</p>
          <p>Última Atualização: {new Date(wallet.lastUpdated).toLocaleString()}</p>
          
          <h3>Transações Recentes</h3>
          <ul>
            {wallet.recentTransactions.map((tx, index) => (
              <li key={index}>
                {tx.type} - {tx.amount.toFixed(2)} BRL - {new Date(tx.date).toLocaleString()}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default Dashboard;