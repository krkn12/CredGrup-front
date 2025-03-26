import { useState } from 'react';
import axios from 'axios';

function Payments() {
  const [amount, setAmount] = useState('');
  const [destination, setDestination] = useState('');
  const [message, setMessage] = useState('');

  const handlePayment = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post('/api/payments', { amount: Number(amount), destination }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setMessage('Pagamento realizado com sucesso!');
    } catch (error) {
      setMessage('Erro ao realizar pagamento: ' + error.response?.data?.message);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Pagamentos</h1>
      <form onSubmit={handlePayment}>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Valor em BRL"
          required
        />
        <input
          type="text"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder="Destino (ex: endereço BTC)"
          required
        />
        <button type="submit">Pagar</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default Payments;