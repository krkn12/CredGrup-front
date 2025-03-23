import axios from "axios";
import https from "https";

const api = axios.create({
  baseURL: "https://158.69.35.122:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
  httpsAgent: new https.Agent({
    rejectUnauthorized: false, // Para certificados autoassinados
  }),
});

export default api;