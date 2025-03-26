import { useState, useEffect } from 'react';
import axios from 'axios';

function Investments() {
  const [investments, setInvestments] = useState([]);
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInvestments = async () => {
      try {
        const res = await axios.get('https://credgrup.click/api/investments', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setInvestments(res.data);
      } catch (err) {
        setError('Erro ao carregar investimentos');
        console.error(err);
      }
    };
    fetchInvestments();
  }, []);

  const handleInvestment = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        'https://credgrup.click/api/investments',
        { amount },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setInvestments([...investments, res.data]);
      setAmount('');
      setError('');
    } catch (err) {
      setError('Erro ao fazer investimento');
      console.error(err);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl mb-4">Investimentos</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleInvestment} className="mb-6">
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Valor do investimento"
          className="p-2 border rounded mr-2"
          required
        />
        <button type="submit" className="p-2 bg-blue-500 text-white rounded">
          Investir
        </button>
      </form>
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-xl mb-2">Histórico de Investimentos</h2>
        {investments.length > 0 ? (
          <ul>
            {investments.map((i) => (
              <li key={i.id}>Valor: {i.amount} - Data: {new Date(i.createdAt).toLocaleString()}</li>
            ))}
          </ul>
        ) : (
          <p>Nenhum investimento encontrado</p>
        )}
      </div>
    </div>
  );
}

export default Investments;