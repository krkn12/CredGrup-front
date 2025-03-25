import axios from "axios";

const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production' ? "https://credgrup.click/api" : "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization; // Remove o header se não houver token
    }
    return config;
  },
  (error) => {
    console.error("Erro no interceptor de requisição:", error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("Erro na resposta da API:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;