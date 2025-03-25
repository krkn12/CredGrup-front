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
    if (token && typeof token === "string" && token.trim() !== "") {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("[API] Token adicionado à requisição:", token.slice(0, 10) + "...");
    } else {
      delete config.headers.Authorization;
      console.log("[API] Nenhum token válido encontrado");
    }
    return config;
  },
  (error) => {
    console.error("[API] Erro no interceptor de requisição:", error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("[API] Erro na resposta:", error.response?.data || error.message);
    if (error.response?.status === 401) {
      console.log("[API] Erro 401 - Redirecionando para login");
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = "/auth";
    }
    return Promise.reject(error);
  }
);

export default api;