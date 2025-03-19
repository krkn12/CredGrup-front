import axios from 'axios'; // Certifique-se de importar axios

export const walletAddress = "0x1c580b494ea23661feec1738bfd8e38adc264775"; // Endereço da carteira
const wbtcContractAddress = "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f"; // Contrato WBTC na Arbitrum One
const apiKey = "Z5SJNYF55WMFBDXC5VXMXQTZBDKTH47VBR"; // Sua chave da Arbiscan (substitua pela sua própria)

// Função para buscar o saldo de WBTC na carteira
export const fetchWalletData = (callback, setLoading, intervalTime = 30000) => {
  let intervalId = null;

  const getWalletBalance = async () => {
    try {
      if (setLoading) setLoading(true);

      // Consulta o saldo de WBTC usando a API da Arbiscan
      const response = await axios.get(
        `https://api.arbiscan.io/api?module=account&action=tokenbalance&contractaddress=${wbtcContractAddress}&address=${walletAddress}&tag=latest&apikey=${apiKey}`
      );

      if (response.data.status !== "1") {
        throw new Error(response.data.message || "Erro na API da Arbiscan");
      }

      // O saldo vem em wei-like (8 casas decimais para WBTC)
      const wbtcBalance = parseFloat(response.data.result) / 1e8;

      const walletData = {
        wbtcBalance,
        lastUpdated: new Date().toISOString(),
      };

      if (callback) callback(walletData);
      return walletData;
    } catch (error) {
      console.error("Erro ao buscar dados da carteira:", error.message);
      const fallbackData = { wbtcBalance: 0, lastUpdated: new Date().toISOString() };
      if (callback) callback(fallbackData);
      return fallbackData;
    } finally {
      if (setLoading) setLoading(false);
    }
  };

  // Executa a busca imediatamente
  getWalletBalance();

  // Configura o polling para verificar continuamente
  intervalId = setInterval(getWalletBalance, intervalTime);

  // Retorna uma função para limpar o intervalo quando o componente for desmontado
  return () => {
    if (intervalId) {
      clearInterval(intervalId);
      console.log("Polling de dados da carteira interrompido.");
    }
  };
};

// Função para vender WBTC (mantida como estava)
export const venderWbtc = async (valorWbtc) => {
  try {
    const response = await api.post('/withdrawals/vender-wbtc', { valorWbtc });
    return {
      sucesso: true,
      mensagem: response.data.mensagem,
      id: response.data.id,
      valorReais: response.data.valorReais,
      taxa: response.data.taxa,
      valorLiquido: response.data.valorLiquido,
      wbtcVendido: response.data.wbtcVendido,
      pontoGanho: response.data.pontoGanho,
      novoSaldoWbtc: response.data.novoSaldoWbtc,
      novoSaldoReais: response.data.novoSaldoReais,
      data: response.data.data,
    };
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Erro ao processar a venda de WBTC');
  }
};

// Função para obter cotação do WBTC (mantida como estava)
export const getCotacaoWbtc = async () => {
  try {
    const response = await api.get('/withdrawals/cotacao');
    return response.data.price;
  } catch (error) {
    console.error("Erro ao obter cotação do WBTC:", error);
    return null;
  }
};