import axios from 'axios';

const api = axios.create({
  baseURL: 'http://158.69.35.122:5000' // Mude de localhost para o IP do VPS
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