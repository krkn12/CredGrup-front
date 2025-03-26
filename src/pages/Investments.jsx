import { useState } from 'react';
import axios from 'axios';

function Investments() {
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');

  const handleInvestment = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post('/api/investments', { amount: Number(amount) }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setMessage('Investimento realizado com sucesso!');
    } catch (error) {
      setMessage('Erro ao investir: ' + error.response?.data?.message);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Investimentos</h1>
      <form onSubmit={handleInvestment}>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Valor em BRL"
          required
        />
        <button type="submit">Investir</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default Investments;