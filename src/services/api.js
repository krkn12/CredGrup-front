import axios from "axios";
import https from "https";

const api = axios.create({
  baseURL: "https://158.69.35.122:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
  httpsAgent: new https.Agent({
    rejectUnauthorized: false, // Ignora certificado inválido
  }),
});

export default api;