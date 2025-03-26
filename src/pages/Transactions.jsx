import { useState, useEffect } from 'react';
import axios from 'axios';

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await axios.get('https://credgrup.click/api/transactions', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setTransactions(res.data);
      } catch (err) {
        setError('Erro ao carregar transações');
      }
    };
    fetchTransactions();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl mb-4">Transações</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-xl mb-2">Histórico de Transações</h2>
        {transactions.length > 0 ? (
          <ul>
            {transactions.map((t) => (
              <li key={t.id}>
                Tipo: {t.type} - Valor: {t.amount} - Data: {new Date(t.createdAt).toLocaleString()}
              </li>
            ))}
          </ul>
        ) : (
          <p>Nenhuma transação encontrada</p>
        )}
      </div>
    </div>
  );
}

export default Transactions;