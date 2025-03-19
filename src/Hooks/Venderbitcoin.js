import api from '../services/api';

// Função para processar a venda de WBTC
export const processarVendaWBTC = async (wbtcAmount, callbackObj) => {
  const { onInicio, onSucesso, onErro, onFim } = callbackObj || {};
  
  if (onInicio) onInicio();
  
  try {
    // Validações básicas
    if (!wbtcAmount || isNaN(parseFloat(wbtcAmount)) || parseFloat(wbtcAmount) <= 0) {
      throw new Error("Por favor, informe um valor válido para a venda.");
    }
    
    // Envia requisição para o backend
    const response = await api.post("/api/user/sell-wbtc", {
      wbtcAmount: parseFloat(wbtcAmount)
    });
    
    const { transaction, updatedUser } = response.data;
    
    if (onSucesso) {
      onSucesso({
        transaction,
        updatedUser
      });
    }
    
    return {
      transaction,
      updatedUser
    };
  } catch (error) {
    console.error("Erro ao processar venda de WBTC:", error);
    
    if (onErro) {
      onErro(error.response?.data?.error || error.message || "Erro ao processar a venda. Tente novamente.");
    }
    
    throw error;
  } finally {
    if (onFim) onFim();
  }
};