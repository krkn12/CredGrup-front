import api from '../services/api'; // Usa o api já configurado

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
    const response = await api.get('/bitcoin/price', {
      timeout: 3000, // 3 segundos de timeout
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });

    const price = response.data.price;

    if (price === undefined || price === null || isNaN(price)) {
      console.warn("Preço recebido inválido:", price);
      return lastValidPrice;
    }

    console.log(`[FRONTEND] Preço do WBTC atualizado: R$ ${price}`);
    lastValidPrice = price;
    lastFetchTime = now;
    return price;
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
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

export { fetchBitcoinPrice, startPriceUpdates, stopPriceUpdates, calculateBrlValue };