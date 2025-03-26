import { useState } from 'react';
import axios from 'axios';

function Loans() {
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');

  const handleLoanRequest = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post('/api/loans', { amount: Number(amount) }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setMessage('Empréstimo solicitado com sucesso!');
    } catch (error) {
      setMessage('Erro ao solicitar empréstimo: ' + error.response?.data?.message);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Empréstimos</h1>
      <form onSubmit={handleLoanRequest}>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Valor em BRL"
          required
        />
        <button type="submit">Solicitar Empréstimo</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default Loans;