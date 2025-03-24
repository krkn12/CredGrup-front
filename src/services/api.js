import axios from "axios";

const api = axios.create({
  baseURL: "https://credgrup.click/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para adicionar o token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;