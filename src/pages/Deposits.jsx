import { useState } from 'react';
import axios from 'axios';

function Deposits() {
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');

  const handleDeposit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post('/api/deposits', { amount: Number(amount) }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setMessage('Depósito solicitado com sucesso!');
    } catch (error) {
      setMessage('Erro ao processar depósito: ' + error.response?.data?.message);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Depósitos</h1>
      <form onSubmit={handleDeposit}>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Valor em BRL"
          required
        />
        <button type="submit">Depositar</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default Deposits;