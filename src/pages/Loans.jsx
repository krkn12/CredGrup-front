import { useState, useEffect } from 'react';
import axios from 'axios';

function Loans() {
  const [loans, setLoans] = useState([]);
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLoans = async () => {
      try {
        const res = await axios.get('https://credgrup.click/api/loans', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setLoans(res.data);
      } catch (err) {
        setError('Erro ao carregar empréstimos');
        console.error(err);
      }
    };
    fetchLoans();
  }, []);

  const handleLoanRequest = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        'https://credgrup.click/api/loans',
        { amount },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setLoans([...loans, res.data]);
      setAmount('');
      setError('');
    } catch (err) {
      setError('Erro ao solicitar empréstimo');
      console.error(err);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl mb-4">Empréstimos</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleLoanRequest} className="mb-6">
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Valor do empréstimo"
          className="p-2 border rounded mr-2"
          required
        />
        <button type="submit" className="p-2 bg-blue-500 text-white rounded">
          Solicitar Empréstimo
        </button>
      </form>
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-xl mb-2">Histórico de Empréstimos</h2>
        {loans.length > 0 ? (
          <ul>
            {loans.map((l) => (
              <li key={l.id}>Valor: {l.amount} - Data: {new Date(l.createdAt).toLocaleString()}</li>
            ))}
          </ul>
        ) : (
          <p>Nenhum empréstimo encontrado</p>
        )}
      </div>
    </div>
  );
}

export default Loans;