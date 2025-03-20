import axios from 'axios';
import https from 'https';

const api = axios.create({
  baseURL: 'https://158.69.35.122:5000',
  httpsAgent: new https.Agent({
    rejectUnauthorized: false // Ignora certificados inválidos (só pra teste)
  })
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;