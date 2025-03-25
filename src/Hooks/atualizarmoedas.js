import api from '../services/api';

let lastValidPrice = 481826.0;
let lastFetchTime = 0;
const MIN_FETCH_INTERVAL = 10000;

const fetchBitcoinPrice = async () => {
  const now = Date.now();
  if (lastFetchTime > 0 && now - lastFetchTime < MIN_FETCH_INTERVAL) {
    return lastValidPrice;
  }

  try {
    const response = await api.get('/bitcoin/price', {
      timeout: 5000,
      headers: { 'Accept': 'application/json', 'Cache-Control': 'no-cache' },
    });

    const price = parseFloat(response.data.price);
    if (isNaN(price) || price <= 0) {
      console.warn("[atualizarmoedas] Preço inválido recebido:", response.data.price);
      return lastValidPrice;
    }

    console.log(`[atualizarmoedas] Preço do WBTC atualizado: R$ ${price}`);
    lastValidPrice = price;
    lastFetchTime = now;
    return price;
  } catch (error) {
    console.error("[atualizarmoedas] Erro ao buscar preço do WBTC:", error.message);
    return lastValidPrice; // Retorna último preço válido em vez de simular
  }
};

const startPriceUpdates = (setPriceCallback, interval = 30000) => {
  const fetchAndSetPrice = async () => {
    try {
      const price = await fetchBitcoinPrice();
      setPriceCallback(price);
    } catch (error) {
      setPriceCallback(lastValidPrice);
    }
  };

  fetchAndSetPrice();
  const intervalId = setInterval(fetchAndSetPrice, interval);
  return intervalId;
};

const calculateBrlValue = (wbtcAmount, btcPrice) => {
  if (!wbtcAmount || !btcPrice) return 0;
  return parseFloat(wbtcAmount) * parseFloat(btcPrice);
};

const stopPriceUpdates = (intervalId) => {
  if (intervalId) clearInterval(intervalId);
};

export { fetchBitcoinPrice, startPriceUpdates, stopPriceUpdates, calculateBrlValue };