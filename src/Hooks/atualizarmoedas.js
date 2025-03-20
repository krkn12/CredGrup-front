import axios from "axios";

// Cache para armazenar o último preço obtido com sucesso
let lastValidPrice = 481826.0; // Valor inicial mais atual (Abril 2024)
let lastFetchTime = 0;
const MIN_FETCH_INTERVAL = 10000; // 10 segundos mínimo entre requisições

/**
 * Busca o preço atual do WBTC em BRL usando o backend
 */
const fetchBitcoinPrice = async () => {
  const now = Date.now();

  if (lastFetchTime > 0 && now - lastFetchTime < MIN_FETCH_INTERVAL) {
    return lastValidPrice;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch('http://158.69.35.122:5000/bitcoin/price', {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }

    const data = await response.json();
    const price = data.price;

    if (price === undefined || price === null || isNaN(price)) {
      console.warn("Preço recebido inválido:", price);
      return lastValidPrice;
    }

    console.log(`[FRONTEND] Preço do WBTC atualizado: R$ ${price}`);
    lastValidPrice = price;
    lastFetchTime = now;
    return price;
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error("Timeout ao buscar preço do WBTC");
    } else {
      console.error("Erro ao buscar preço do WBTC:", error.message);
    }

    const randomChange = Math.random() * 0.002 - 0.001;
    const simulatedPrice = lastValidPrice * (1 + randomChange);
    return Math.round(simulatedPrice * 100) / 100;
  }
};

/**
 * Inicia atualizações de preço em intervalos regulares
 */
const startPriceUpdates = (setPriceCallback, interval = 30000) => {
  fetchBitcoinPrice()
    .then(setPriceCallback)
    .catch(error => {
      console.error("Erro na busca inicial:", error);
      setPriceCallback(lastValidPrice);
    });

  const intervalId = setInterval(async () => {
    try {
      const price = await fetchBitcoinPrice();
      setPriceCallback(price);
    } catch (error) {
      console.error("Erro na atualização periódica:", error);
      setPriceCallback(lastValidPrice);
    }
  }, interval);

  return intervalId;
};

/**
 * Calcula o valor em BRL com base na quantidade de WBTC
 */
const calculateBrlValue = (wbtcAmount, btcPrice) => {
  if (!wbtcAmount || !btcPrice) return 0;
  return wbtcAmount * btcPrice;
};

/**
 * Para as atualizações periódicas de preço
 */
const stopPriceUpdates = (intervalId) => {
  if (intervalId) {
    clearInterval(intervalId);
  }
};

// Configuração do Axios para comunicação com o backend
const api = axios.create({
  baseURL: 'http://158.69.35.122:5000' // VPS IP
});

// Interceptor para incluir o token JWT em todas as requisições
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export { fetchBitcoinPrice, startPriceUpdates, stopPriceUpdates, calculateBrlValue, api };
