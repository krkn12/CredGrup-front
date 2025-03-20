import axios from 'axios';

const api = axios.create({
  baseURL: 'https://158.69.35.122:5000' // Muda de http pra https
});

// Interceptor para incluir o token em todas requisições
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;