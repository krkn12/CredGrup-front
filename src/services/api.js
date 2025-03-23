import axios from "axios";

const api = axios.create({
  baseURL: "https://158.69.35.122:5000/api", // Ajuste para o IP e porta da VPS
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;