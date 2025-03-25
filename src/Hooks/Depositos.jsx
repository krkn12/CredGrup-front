import api from "../services/api";

export const metodosPagamento = [
  { id: "pix", nome: "Pix", taxa: 0, disponivel: true },
  { id: "boleto", nome: "Boleto", taxa: 2, disponivel: false },
  { id: "ted", nome: "TED", taxa: 1.5, disponivel: false },
];

export function calcularTaxa(valor, metodoId, tipo) {
  const metodo = metodosPagamento.find((m) => m.id === metodoId);
  if (!metodo || !valor || isNaN(valor)) return 0;
  return tipo === "deposito" && metodo.taxa > 0 ? (valor * metodo.taxa) / 100 : 0;
}

export function calcularPontosDeposito(valor) {
  return Math.floor(valor / 100);
}

export async function processarDeposito(valor, metodoId, comprovanteArquivo, callbacks = {}) {
  const { onInicio, onSucesso, onErro, onFim } = callbacks;

  try {
    if (onInicio) onInicio();

    const valorFloat = parseFloat(valor);
    if (!valorFloat || valorFloat <= 0) throw new Error("Valor inválido");
    const metodo = metodosPagamento.find((m) => m.id === metodoId);
    if (!metodo) throw new Error("Método de pagamento inválido");
    if (!comprovanteArquivo) throw new Error("Comprovante é obrigatório");

    const taxa = calcularTaxa(valorFloat, metodoId, "deposito");
    const depositData = new FormData();
    depositData.append("valor", valorFloat);
    depositData.append("metodoId", metodoId);
    depositData.append("metodoNome", metodo.nome);
    depositData.append("taxa", taxa);
    depositData.append("comprovante", comprovanteArquivo);

    const response = await api.post("/deposits", depositData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    const novoDeposito = {
      _id: response.data._id,
      description: `Depósito via ${metodo.nome}`,
      amount: valorFloat,
      date: new Date(),
      cashback: 0,
      status: "Pendente",
      tipo: "deposito",
    };

    if (onSucesso) onSucesso({ novoDeposito, pontos: calcularPontosDeposito(valorFloat) });
    return novoDeposito;
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || "Erro ao processar depósito";
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

export async function verificarAtualizacoesDepositos() {
  try {
    const response = await api.get("/deposits/me");
    return response.data.map((deposit) => ({
      _id: deposit._id,
      description: `Depósito via ${deposit.metodoNome}`,
      amount: deposit.valor,
      date: new Date(deposit.createdAt),
      cashback: 0,
      status: deposit.status,
      tipo: "deposito",
    }));
  } catch (error) {
    console.error("Erro ao verificar atualizações de depósitos:", error);
    if (error.response?.status === 401) {
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = "/auth";
    }
    throw error;
  }
}