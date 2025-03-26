import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

function Dashboard() {
  const { user } = useAuth();
  const [walletData, setWalletData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Função para buscar os dados da carteira
  const fetchWalletData = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await axios.get('https://credgrup.click/api/wallet/data', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setWalletData(res.data);
    } catch (error) {
      setError(error.response?.data?.message || 'Erro ao carregar dados da carteira');
    } finally {
      setLoading(false);
    }
  };

  // Busca inicial e atualizações periódicas (a cada 5 minutos, por exemplo)
  useEffect(() => {
    fetchWalletData();
    const interval = setInterval(fetchWalletData, 5 * 60 * 1000); // Atualiza a cada 5 minutos
    return () => clearInterval(interval); // Limpa o intervalo ao desmontar o componente
  }, []);

  // Função para formatar valores em BRL
  const formatBRL = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value || 0);
  };

  return (
    <div className="p-6 min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Bem-vindo, {user?.name || 'Usuário'}
      </h1>

      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
          <button
            onClick={fetchWalletData}
            className="ml-4 text-sm underline hover:text-red-900"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : walletData ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card principal com saldo em reais */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              Sua Carteira
            </h2>
            <div className="space-y-4">
              <p className="text-lg">
                <strong>Saldo em Reais (BRL):</strong>{' '}
                <span className="text-green-600 font-bold">
                  {formatBRL(walletData.wbtcBalance)}
                </span>
              </p>
              <p className="text-sm text-gray-500">
                (Baseado na cotação atual do WBTC)
              </p>
            </div>
          </div>

          {/* Card com informações adicionais */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Detalhes Financeiros
            </h2>
            <div className="space-y-3">
              <p>
                <strong>Total Investido:</strong>{' '}
                {formatBRL(walletData.totalInvested)}
              </p>
              <p>
                <strong>Disponível para Empréstimo:</strong>{' '}
                {formatBRL(walletData.loanAvailable)}
              </p>
              <p className="text-sm text-gray-500">
                <strong>Última Atualização:</strong>{' '}
                {new Date(walletData.lastUpdated).toLocaleString('pt-BR', {
                  dateStyle: 'short',
                  timeStyle: 'medium',
                })}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-gray-600">Nenhum dado disponível no momento.</p>
      )}
    </div>
  );
}

export default Dashboard;