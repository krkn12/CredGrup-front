import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/api/api';
import '@/styles/dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [balanceRes, transactionsRes] = await Promise.all([
          api.get('/wallet'),
          api.get('/transactions')
        ]);
        setBalance(balanceRes.data.balance);
        setTransactions(transactionsRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="dashboard-container">
      <h1>Bem-vindo, {user?.name}</h1>
      <div className="balance">Saldo: R$ {balance.toFixed(2)}</div>
      
      <h2>Últimas Transações</h2>
      <ul className="transactions-list">
        {transactions.map((transaction) => (
          <li key={transaction.id}>
            {transaction.description}: R$ {transaction.amount.toFixed(2)}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;