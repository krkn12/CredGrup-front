import api from "../services/api";

export function startPriceUpdates(setWbtcBrlPrice, intervalTime = 10000) {
  const fetchPrice = async () => {
    try {
      const response = await api.get("/market/wbtc-price");
      setWbtcBrlPrice(response.data.price);
    } catch (error) {
      console.error("Erro ao atualizar preço do WBTC:", error);
      setWbtcBrlPrice(null); // Ou um valor padrão, se preferir
    }
  };

  fetchPrice(); // Primeira chamada imediata
  const intervalId = setInterval(fetchPrice, intervalTime);
  return intervalId;
}

export function stopPriceUpdates(intervalId) {
  if (intervalId) {
    clearInterval(intervalId);
  }
}