import api from "../services/api";

export function calcularPontosVenda(valorWbtc) {
  return Math.floor(parseFloat(valorWbtc) * 10); // 1 ponto por 0.1 WBTC vendido
}

export async function processarVendaWBTC(wbtcToSell, callbacks = {}) {
  const { onInicio, onSucesso, onErro, onFim } = callbacks;

  try {
    if (onInicio) onInicio();

    const wbtcFloat = parseFloat(wbtcToSell);
    if (!wbtcFloat || wbtcFloat <= 0) throw new Error("Quantidade inválida de WBTC");

    const response = await api.post("/user/sell-wbtc", { wbtcAmount: wbtcFloat });

    const { transaction, updatedUser } = response.data;
    const pontos = calcularPontosVenda(wbtcFloat);

    const novaTransacao = {
      id: transaction._id,
      description: `Venda de ${wbtcFloat.toFixed(8)} WBTC`,
      amount: transaction.amount,
      date: new Date(),
      cashback: 0,
      status: "Concluído",
      tipo: "venda",
      taxa: transaction.taxa || 0,
    };

    if (onSucesso) onSucesso({ transaction: novaTransacao, updatedUser, pontos });
    return { transaction: novaTransacao, updatedUser };
  } catch (error) {
    const errorMessage = error.response?.data?.error || error.message || "Erro ao processar venda";
    if (onErro) onErro(errorMessage);
    if (error.response?.status === 401) {
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = "/auth";
    }
    throw error;
  } finally {
    if (onFim) onFim();
  }
}