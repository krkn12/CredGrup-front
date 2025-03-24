import axios from "axios";

const api = axios.create({
  baseURL: "https://credgrup.click/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;