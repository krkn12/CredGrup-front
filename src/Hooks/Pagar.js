import api from '../services/api';

export const analisarChavePix = (payload) => {
  return new Promise((resolve, reject) => {
    try {
      if (!payload || !payload.trim()) {
        throw new Error("Chave PIX inválida ou vazia");
      }

      const parseEMV = (data) => {
        const result = {};
        let index = 0;

        while (index < data.length) {
          const id = data.substring(index, index + 2);
          index += 2;
          const length = parseInt(data.substring(index, index + 2), 10);
          index += 2;
          const value = data.substring(index, index + length);
          index += length;
          result[id] = value;
          if (id === "26") {
            const subResult = parseEMV(value);
            result[id] = subResult;
          }
        }
        return result;
      };

      const parsedData = parseEMV(payload);
      const transactionData = parsedData["26"] || {};
      const chavePix = transactionData["01"] || "Chave não informada";
      const destinatario = parsedData["59"] || "Destinatário Desconhecido";
      const valor = parsedData["54"] ? parseFloat(parsedData["54"]).toFixed(2) : "0.00";

      if (!parsedData["00"] || parsedData["00"] !== "01") {
        throw new Error("Formato de chave PIX inválido");
      }

      resolve({
        destinatario: destinatario,
        valor: valor,
        chavePix: chavePix,
      });
    } catch (error) {
      reject(new Error(error.message || "Erro ao analisar a chave PIX"));
    }
  });
};

export const categoriasPagamento = [
  { id: "1", nome: "Conta de Luz" },
  { id: "2", nome: "Conta de Água" },
  { id: "3", nome: "Internet" },
  { id: "4", nome: "Aluguel" },
  { id: "5", nome: "Supermercado" },
  { id: "6", nome: "Farmácia" },
  { id: "7", nome: "Streaming" },
  { id: "8", nome: "Transferência" },
  { id: "9", nome: "Outros" },
];

export const calcularCashback = (valor, wbtcBrlPrice) => {
  const cashbackReais = valor * 0.002; // 0.2% do valor em reais
  return wbtcBrlPrice ? (cashbackReais / wbtcBrlPrice).toFixed(8) : 0;
};

export const calcularTaxaPagamento = (valor) => {
  return valor * 0.025; // 2.5% de taxa
};

export const validarPagamento = (
  valorPagamento,
  descricaoPagamento,
  categoriaPagamento,
  saldoReais
) => {
  if (!valorPagamento || isNaN(parseFloat(valorPagamento)) || parseFloat(valorPagamento) <= 0) {
    return { valido: false, mensagem: "Por favor, informe um valor válido para o pagamento." };
  }

  if (!descricaoPagamento || !descricaoPagamento.trim()) {
    return { valido: false, mensagem: "Por favor, informe uma descrição para o pagamento." };
  }

  if (!categoriaPagamento) {
    return { valido: false, mensagem: "Por favor, selecione uma categoria de pagamento." };
  }

  const valor = parseFloat(valorPagamento);
  const taxa = calcularTaxaPagamento(valor);
  const valorTotal = valor + taxa;

  if (valorTotal > saldoReais) {
    return { valido: false, mensagem: "Saldo insuficiente para realizar o pagamento (incluindo taxa de 2.5%)." };
  }

  return { valido: true, valorTotal, taxa };
};

export const processarPagamento = async (
  valorPagamento,
  descricaoPagamento,
  categoriaPagamento,
  pixKey,
  callbacks
) => {
  const { onInicio, onSucesso, onErro, onFim } = callbacks;

  onInicio && onInicio();

  try {
    const valor = parseFloat(valorPagamento);
    const taxa = calcularTaxaPagamento(valor);
    
    const response = await api.post('/payments/pix', {
      valorPagamento: valor,
      descricaoPagamento,
      categoriaPagamento,
      pixKey,
      taxa
    });

    const resultado = {
      ...response.data,
      taxa,
      valorTotal: valor + taxa,
    };

    onSucesso && onSucesso(resultado);
    return resultado;
  } catch (error) {
    const mensagemErro = error.response?.data?.message || "Erro ao processar o pagamento. Tente novamente.";
    onErro && onErro(mensagemErro);
    throw new Error(mensagemErro);
  } finally {
    onFim && onFim();
  }
};

export const gerenciarPagamento = async (
  valorPagamento,
  descricaoPagamento,
  categoriaPagamento,
  saldoReais,
  wbtcBrlPrice,
  pixKey,
  callbacks
) => {
  const { onInicio, onSucesso, onErro, onFim } = callbacks;

  const validacao = validarPagamento(valorPagamento, descricaoPagamento, categoriaPagamento, saldoReais);
  if (!validacao.valido) {
    onErro(validacao.mensagem);
    return null;
  }

  const valor = parseFloat(valorPagamento);
  const { taxa, valorTotal } = validacao;

  try {
    const resultado = await processarPagamento(
      valorPagamento,
      descricaoPagamento,
      categoriaPagamento,
      pixKey,
      { onInicio, onSucesso: null, onErro, onFim: null }
    );

    const resultadoCompleto = {
      ...resultado,
      pontoGanho: 1,
      novoPagamento: {
        id: resultado._id,
        description: descricaoPagamento,
        amount: -valor,
        date: resultado.createdAt || new Date(),
        cashback: calcularCashback(valor, wbtcBrlPrice), // Calcula estimativa
        tipo: "pagamento",
        pontosGanhos: 1,
        taxa,
        status: resultado.status,
      },
    };

    onSucesso(resultadoCompleto);
    onFim && onFim();
    return resultadoCompleto;
  } catch (error) {
    onFim && onFim();
    return null;
  }
};

export const listarPagamentos = async () => {
  try {
    const response = await api.get('/payments/me');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Erro ao listar pagamentos');
  }
};