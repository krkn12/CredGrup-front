import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [wallet, setWallet] = useState({
    brlBalance: 0,
    wbtcBalance: 0,
    brlInvested: 0,
    wbtcInvested: 0,
    loanLimitBrl: 0,
    loanLimitWbtc: 0,
  });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Faça login para acessar o dashboard');
        setLoading(false);
        return;
      }

      try {
        // Buscar dados da carteira
        const walletRes = await axios.get('http://localhost:5000/api/wallet/data', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setWallet(walletRes.data);

        // Buscar transações recentes
        const transactionsRes = await axios.get('http://localhost:5000/api/transactions', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTransactions(transactionsRes.data.slice(0, 5)); // Últimas 5 transações
      } catch (err) {
        setError('Erro ao carregar dados: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Carregando...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center mt-10">{error}</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Dashboard</h1>

      {/* Resumo da Carteira */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Saldo */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Saldo Disponível</h2>
          <p className="text-2xl font-bold text-green-600">R$ {wallet.brlBalance.toFixed(2)}</p>
          <p className="text-lg text-gray-600">{wallet.wbtcBalance.toFixed(6)} WBTC</p>
        </div>

        {/* Investido */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Investido na Plataforma</h2>
          <p className="text-2xl font-bold text-blue-600">R$ {wallet.brlInvested.toFixed(2)}</p>
          <p className="text-lg text-gray-600">{wallet.wbtcInvested.toFixed(6)} WBTC</p>
        </div>

        {/* Disponível para Empréstimo */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Disponível para Empréstimo</h2>
          <p className="text-2xl font-bold text-purple-600">R$ {wallet.loanLimitBrl.toFixed(2)}</p>
          <p className="text-lg text-gray-600">{wallet.loanLimitWbtc.toFixed(6)} WBTC</p>
        </div>
      </div>

      {/* Transações Recentes */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Transações Recentes</h2>
        {transactions.length === 0 ? (
          <p className="text-gray-500">Nenhuma transação recente.</p>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="py-2 text-gray-600">Data</th>
                <th className="py-2 text-gray-600">Tipo</th>
                <th className="py-2 text-gray-600">Descrição</th>
                <th className="py-2 text-gray-600">Valor</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx._id} className="border-b last:border-b-0">
                  <td className="py-2">{new Date(tx.createdAt).toLocaleDateString()}</td>
                  <td className="py-2">{tx.type}</td>
                  <td className="py-2">{tx.description}</td>
                  <td className="py-2">
                    {tx.type === 'btc_reward' ? (
                      <span className="text-green-600">{tx.amount.toFixed(6)} WBTC</span>
                    ) : (
                      <span className={tx.amount < 0 ? 'text-red-600' : 'text-green-600'}>
                        R$ {Math.abs(tx.amount).toFixed(2)}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Botões de Ação */}
      <div className="mt-8 flex flex-wrap gap-4">
        <button
          onClick={() => alert('Funcionalidade de depósito em breve!')}
          className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 transition"
        >
          Depositar
        </button>
        <button
          onClick={() => alert('Funcionalidade de pagamento em breve!')}
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition"
        >
          Pagar
        </button>
        <button
          onClick={() => alert('Funcionalidade de empréstimo em breve!')}
          className="bg-purple-500 text-white px-6 py-2 rounded hover:bg-purple-600 transition"
        >
          Solicitar Empréstimo
        </button>
        <button
          onClick={() => alert('Funcionalidade de investimento em breve!')}
          className="bg-indigo-500 text-white px-6 py-2 rounded hover:bg-indigo-600 transition"
        >
          Investir
        </button>
      </div>
    </div>
  );
};

export default Dashboard;