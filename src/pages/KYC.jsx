import { useState } from 'react';
import axios from 'axios';

function KYC() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('document', file);

    try {
      const { data } = await axios.post('/api/users/kyc', formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setMessage(data.message);
    } catch (error) {
      setMessage('Erro ao enviar documento: ' + error.response?.data?.message);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Verificação KYC</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          accept="image/jpeg,image/png,application/pdf"
          required
        />
        <button type="submit">Enviar</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default KYC;