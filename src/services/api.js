import axios from "axios";

const api = axios.create({
  baseURL: "https://credgrup.click/api", // Porta 80 com proxy Cloudflare
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;