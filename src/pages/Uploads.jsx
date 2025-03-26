import { useState } from 'react';
import axios from 'axios';

function Uploads() {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await axios.post('https://credgrup.click/uploads', formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setUploadedFile(res.data);
      setError('');
    } catch (err) {
      setError('Erro ao fazer upload');
      console.error(err);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl mb-4">Upload de Arquivos</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleUpload} className="mb-6">
        <input type="file" onChange={handleFileChange} className="mb-2" />
        <button type="submit" className="p-2 bg-blue-500 text-white rounded">
          Enviar
        </button>
      </form>
      {uploadedFile && (
        <div className="bg-white p-4 rounded shadow">
          <p>Arquivo enviado: {uploadedFile.filename}</p>
          <a href={`https://credgrup.click/uploads/${uploadedFile.filename}`} target="_blank" rel="noopener noreferrer">
            Visualizar
          </a>
        </div>
      )}
    </div>
  );
}

export default Uploads;