import api from "../services/api";

export const categoriasPagamento = [
  { id: "conta", nome: "Conta (Luz, Água, etc.)" },
  { id: "compras", nome: "Compras" },
  { id: "outros", nome: "Outros" },
];

export async function analisarChavePix(chavePix) {
  try {
    const response = await api.post("/payments/validate-pix", { pixKey: chavePix });
    return {
      destinatario: response.data.destinatario || "Destinatário desconhecido",
      valor: response.data.valor || null,
    };
  } catch (error) {
    throw new Error(error.response?.data?.message || "Chave Pix inválida ou não reconhecida");
  }
}

export function calcularTaxaPagamento(valor) {
  const valorFloat = parseFloat(valor);
  return isNaN(valorFloat) ? 0 : valorFloat * 0.03; // 3% de taxa
}

export function calcularCashback(valor, wbtcBrlPrice) {
  const valorFloat = parseFloat(valor);
  if (!valorFloat || !wbtcBrlPrice) return "0.00000000";
  const cashbackReais = valorFloat * 0.005; // 0.5% de cashback
  return (cashbackReais / wbtcBrlPrice).toFixed(8);
}

export function calcularPontosPagamento(valor) {
  return Math.floor(parseFloat(valor) / 200);
}

export async function gerenciarPagamento(
  valorPagamento,
  descricaoPagamento,
  categoriaPagamento,
  saldoReais,
  wbtcBrlPrice,
  pixKey,
  callbacks = {}
) {
  const { onInicio, onSucesso, onErro, onFim } = callbacks;

  try {
    if (onInicio) onInicio();

    const valorFloat = parseFloat(valorPagamento);
    if (!valorFloat || valorFloat <= 0) throw new Error("Valor inválido");
    if (!pixKey) throw new Error("Chave Pix é obrigatória");
    if (!categoriaPagamento) throw new Error("Selecione uma categoria");
    if (!descricaoPagamento.trim()) throw new Error("Descrição é obrigatória");

    const taxa = calcularTaxaPagamento(valorFloat);
    const valorTotal = valorFloat + taxa;
    if (valorTotal > saldoReais) throw new Error("Saldo insuficiente");

    const cashback = calcularCashback(valorFloat, wbtcBrlPrice);
    const pontos = calcularPontosPagamento(valorFloat);

    const paymentData = {
      valorPagamento: valorFloat,
      descricaoPagamento,
      categoriaPagamento,
      pixKey,
      taxa,
      cashback: parseFloat(cashback),
    };

    const response = await api.post("/payments/pix", paymentData);

    const novoPagamento = {
      id: response.data._id,
      description: descricaoPagamento,
      amount: valorFloat,
      date: new Date(),
      cashback: parseFloat(cashback),
      status: "Pendente",
      tipo: "pagamento",
      taxa,
    };

    if (onSucesso) onSucesso({ novoPagamento, valorTotal, pontos });
    return novoPagamento;
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || "Erro ao processar pagamento";
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