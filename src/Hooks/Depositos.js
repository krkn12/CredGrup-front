import api from '../services/api';

// Função para calcular pontos com base no status do depósito
export const calcularPontosDeposito = (valor, status) => {
  return status === "Concluído" ? 1 : 0; // 1 ponto apenas se concluído
};

// Funções adicionais para cálculo de pontos
export const calcularPontosPagamento = (valor, status) => {
  return status === "Concluído" ? 1 : 0; // 1 ponto apenas se concluído
};

export const calcularPontosVenda = (valor, status) => {
  return status === "Concluído" ? 1 : 0; // 1 ponto apenas se concluído
};

// Métodos de pagamento
export const metodosPagamento = [
  { id: "pix", nome: "PIX", taxa: 0, disponivel: true },
  { id: "boleto", nome: "Boleto (Em desenvolvimento)", taxa: 0, disponivel: false },
  { id: "cartao", nome: "Cartão de Crédito (Em desenvolvimento)", taxa: 0, disponivel: false },
];

export const CHAVE_PIX_EMPRESA = "01558516247";
export const WHATSAPP_ADMIN = "91993612101";
export const TEMPO_ESPERA_HORAS = 4;

// Função para calcular taxa (taxa zero apenas para depósito PIX)
export const calcularTaxa = (valor, metodoId, tipoOperacao = 'deposito') => {
  if (tipoOperacao === 'deposito' && metodoId === 'pix') {
    return 0; // Taxa zero para depósito PIX
  }
  const metodo = metodosPagamento.find(m => m.id === metodoId);
  return metodo && tipoOperacao === 'deposito' ? parseFloat(valor) * (metodo.taxa / 100) : 0;
};

export const processarDeposito = async (valor, metodoId, comprovante = null) => {
  try {
    const taxa = calcularTaxa(valor, metodoId, 'deposito');
    const formData = new FormData();
    formData.append('valor', valor);
    formData.append('metodoId', metodoId);
    formData.append('metodoNome', metodosPagamento.find(m => m.id === metodoId)?.nome || metodoId);
    formData.append('taxa', taxa);

    if (comprovante) {
      formData.append('comprovante', comprovante);
    }

    const response = await api.post('/api/deposits', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return {
      sucesso: true,
      mensagem: response.data.mensagem || 'Depósito registrado com sucesso!',
      id: response.data._id,
      valor: response.data.valor,
      status: response.data.status || 'Pendente'
    };
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Erro ao processar depósito');
  }
};

export const listarDepositos = async () => {
  try {
    const response = await api.get('/deposits/me');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Erro ao listar depósitos');
  }
};

export const verificarAtualizacoesDepositos = async (ultimaVerificacao) => {
  try {
    const response = await api.get('/deposits/me/updates', {
      params: { desde: ultimaVerificacao }
    });
    return {
      depositosAtualizados: response.data.depositosAtualizados,
      saldoAtualizado: response.data.saldoAtualizado,
      pontosAtualizados: response.data.pontosAtualizados
    };
  } catch (error) {
    console.error('Erro ao verificar atualizações:', error);
    return { depositosAtualizados: false };
  }
};