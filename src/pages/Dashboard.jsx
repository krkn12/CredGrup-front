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

  // Busca inicial e atualizações periódicas
  useEffect(() => {
    fetchWalletData();
    const interval = setInterval(fetchWalletData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Função para formatar valores em BRL
  const formatBRL = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value || 0);
  };

  // Função para vender WBTC (exemplo básico, precisa de backend)
  const handleSellWBTC = async () => {
    if (!walletData?.wbtcBalance || walletData.wbtcBalance <= 0) {
      alert('Você não tem WBTC para vender.');
      return;
    }
    try {
      const amountToSell = prompt('Quantos WBTC você deseja vender?');
      if (amountToSell && !isNaN(amountToSell) && amountToSell > 0) {
        alert(`Venda de ${amountToSell} WBTC iniciada! (Funcionalidade a ser implementada no backend)`);
        fetchWalletData(); // Atualiza os dados após a venda
      }
    } catch (error) {
      setError('Erro ao processar a venda. Tente novamente.');
    }
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
          {/* Card de Saldo em Reais */}
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

          {/* Card de Detalhes Financeiros */}
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

          {/* Card de Carteira WBTC */}
          <div className="bg-white p-6 rounded-lg shadow-lg md:col-span-2">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              Carteira WBTC
            </h2>
            <div className="space-y-3">
              <p className="text-lg">
                <strong>Saldo WBTC:</strong>{' '}
                <span className="font-bold">
                  {(walletData.wbtcBalance / (walletData.wbtcBalance ? walletData.wbtcBalance : 1)).toFixed(8)} WBTC
                </span>
              </p>
              <p className="text-lg">
                <strong>Equivalente em Reais:</strong>{' '}
                <span className="text-green-600 font-bold">
                  {formatBRL(walletData.wbtcBalance)}
                </span>
              </p>
              <button
                onClick={handleSellWBTC}
                className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
              >
                Vender WBTC
              </button>
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