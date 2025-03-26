import { useState, useEffect } from 'react';
import axios from 'axios';

function Payments() {
  const [payments, setPayments] = useState([]);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await axios.get('https://credgrup.click/api/payments', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setPayments(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Erro ao carregar pagamentos');
      }
    };
    fetchPayments();
  }, []);

  const handlePayment = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        'https://credgrup.click/api/payments',
        { amount, description },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setPayments([...payments, res.data]);
      setAmount('');
      setDescription('');
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao fazer pagamento');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl mb-4">Pagamentos de Contas</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handlePayment} className="mb-6">
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Valor do pagamento"
          className="p-2 border rounded mr-2"
          required
        />
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descrição (ex: Conta de Luz)"
          className="p-2 border rounded mr-2"
          required
        />
        <button type="submit" className="p-2 bg-blue-500 text-white rounded">Pagar</button>
      </form>
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-xl mb-2">Histórico de Pagamentos</h2>
        {payments.length > 0 ? (
          <ul>
            {payments.map((p) => (
              <li key={p._id}>
                Valor: {p.amount} - Descrição: {p.description} - Status: {p.status} - Data: {new Date(p.createdAt).toLocaleString()}
              </li>
            ))}
          </ul>
        ) : (
          <p>Nenhum pagamento encontrado</p>
        )}
      </div>
    </div>
  );
}

export default Payments;