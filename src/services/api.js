import axios from "axios";

const api = axios.create({
  baseURL: "https://158.69.35.122:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;