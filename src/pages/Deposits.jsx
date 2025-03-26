import { useState, useEffect } from 'react';
import axios from 'axios';

function Deposits() {
  const [deposits, setDeposits] = useState([]);
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDeposits = async () => {
      try {
        const res = await axios.get('https://credgrup.click/api/deposits', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setDeposits(res.data);
      } catch (err) {
        setError('Erro ao carregar depósitos');
      }
    };
    fetchDeposits();
  }, []);

  const handleDeposit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        'https://credgrup.click/api/deposits',
        { amount },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setDeposits([...deposits, res.data]);
      setAmount('');
      setError('');
    } catch (err) {
      setError('Erro ao fazer depósito');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl mb-4">Depósitos</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleDeposit} className="mb-6">
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Valor do depósito"
          className="p-2 border rounded mr-2"
          required
        />
        <button type="submit" className="p-2 bg-blue-500 text-white rounded">Depositar</button>
      </form>
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-xl mb-2">Histórico de Depósitos</h2>
        {deposits.length > 0 ? (
          <ul>
            {deposits.map((d) => (
              <li key={d.id}>
                Valor: {d.amount} - Status: {d.status} - Data: {new Date(d.createdAt).toLocaleString()}
              </li>
            ))}
          </ul>
        ) : (
          <p>Nenhum depósito encontrado</p>
        )}
      </div>
    </div>
  );
}

export default Deposits;