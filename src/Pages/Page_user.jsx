import React, { useState, useEffect } from "react";
import "./Styles/Page_user.css";
import { useNavigate } from "react-router-dom";
import { FiletypePdf, ChevronLeft, ChevronRight } from "react-bootstrap-icons";
import api from "../services/api";
import { processarVendaWBTC } from "../Hooks/Venderbitcoin";
import Investments from "../Hooks/Investments";
import Loans from "../Hooks/Loans";
import {
  processarDeposito,
  metodosPagamento,
  calcularTaxa,
  calcularPontosDeposito,
  calcularPontosPagamento,
  calcularPontosVenda,
  verificarAtualizacoesDepositos,
} from "../Hooks/Depositos";
import {
  gerenciarPagamento,
  analisarChavePix,
  calcularCashback,
  calcularTaxaPagamento,
  categoriasPagamento,
} from "../Hooks/Pagar";
import { startPriceUpdates, stopPriceUpdates } from "../Hooks/atualizarmoedas";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import useStatementExport from "../Hooks/useStatementExport";

function Page_user({ currentUser, onLogout }) {
  const navigate = useNavigate();
  const walletAddress = "0x1c580b494ea23661feec1738bfd8e38adc264775";

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [wbtcBrlPrice, setWbtcBrlPrice] = useState(null);
  const [lastCheck, setLastCheck] = useState(new Date().toISOString());
  const [priceUpdateInterval, setPriceUpdateInterval] = useState(null);
  const [showPixModal, setShowPixModal] = useState(false);
  const [pixKey, setPixKey] = useState("");
  const [valorPagamento, setValorPagamento] = useState("");
  const [descricaoPagamento, setDescricaoPagamento] = useState("");
  const [categoriaPagamento, setCategoriaPagamento] = useState("");
  const [pixLoading, setPixLoading] = useState(false);
  const [pixMensagem, setPixMensagem] = useState(null);
  const [pixDetails, setPixDetails] = useState(null);
  const [showDepositoModal, setShowDepositoModal] = useState(false);
  const [valorDeposito, setValorDeposito] = useState("");
  const [metodoDeposito, setMetodoDeposito] = useState("");
  const [depositoLoading, setDepositoLoading] = useState(false);
  const [depositoMensagem, setDepositoMensagem] = useState(null);
  const [taxaDeposito, setTaxaDeposito] = useState(0);
  const [comprovanteArquivo, setComprovanteArquivo] = useState(null);
  const [showSellModal, setShowSellModal] = useState(false);
  const [valorVenda, setValorVenda] = useState("");
  const [sellLoading, setSellLoading] = useState(false);
  const [sellMensagem, setSellMensagem] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(7);
  const [totalPages, setTotalPages] = useState(1);
  const [walletData, setWalletData] = useState({
    wbtcBalance: 0,
    lastUpdated: null,
  });
  const [walletHistory, setWalletHistory] = useState([]);
  const [walletLoading, setWalletLoading] = useState(true);
  const { exportFullStatement, exportCustomStatement, exportTransaction } =
    useStatementExport();

  const updateUserData = (newData) => {
    setUserData((prev) => ({ ...prev, ...newData }));
  };

  const fetchWalletHistory = (wbtcBalance) => {
    const dataPoints = [];
    const today = new Date();
    const initialBalance = wbtcBalance * 0.2;
    for (let i = 24; i >= 0; i--) {
      const date = new Date(today);
      date.setMonth(today.getMonth() - i);
      const growthFactor = 1 - i / 24;
      const currentValue =
        initialBalance + (wbtcBalance - initialBalance) * growthFactor;
      dataPoints.push({
        date: date.toISOString().split("T")[0],
        value: currentValue,
      });
    }
    return dataPoints;
  };

  useEffect(() => {
    if (!currentUser || !localStorage.getItem("token")) {
      console.log("Usuário ou token ausente, redirecionando para /auth");
      navigate("/auth", { replace: true });
      return;
    }

    console.log("Token atual no localStorage:", localStorage.getItem("token"));
    console.log("Token atual no sessionStorage:", sessionStorage.getItem("token"));

    const intervalId = startPriceUpdates(setWbtcBrlPrice, 10000);
    setPriceUpdateInterval(intervalId);

    const fetchInitialData = async () => {
      try {
        const [
          userResponse,
          depositsResponse,
          paymentsResponse,
          loansResponse,
          walletResponse,
          investmentResponse,
        ] = await Promise.all([
          api.get("/users/me"),
          api.get("/deposits/me"),
          api.get("/payments/me"),
          api.get("/loans/me"),
          api.get("/wallet/data"),
          api.get("/investments/me"),
        ]);

        const depositHistory = depositsResponse.data.map((deposit) => ({
          _id: deposit._id,
          description: `Depósito via ${deposit.metodoNome}`,
          amount: deposit.valor,
          date: new Date(deposit.createdAt),
          cashback: 0,
          status: deposit.status,
          tipo: "deposito",
        }));

        const paymentHistory = paymentsResponse.data.map((payment) => ({
          id: payment._id,
          description: payment.descricaoPagamento,
          amount: payment.valorPagamento,
          date: new Date(payment.createdAt),
          cashback: payment.cashback || 0,
          status: payment.status,
          tipo: "pagamento",
          taxa: payment.taxa,
        }));

        const loanHistory = loansResponse.data.map((loan) => ({
          _id: loan._id,
          description: `Empréstimo de R$ ${loan.amount.toFixed(2)}`,
          amount: loan.totalToRepay,
          date: new Date(loan.createdAt),
          cashback: 0,
          status: loan.status === "active" ? "Ativo" : loan.status === "repaid" ? "Pago" : "Vencido",
          tipo: "emprestimo",
        }));

        const allHistory = [...depositHistory, ...paymentHistory, ...loanHistory];
        allHistory.sort((a, b) => new Date(b.date) - new Date(a.date));

        const investmentData = investmentResponse.data || { amount: 0 };

        setUserData({
          ...userResponse.data,
          paymentHistory: allHistory,
          investmentData,
        });
        setTotalPages(Math.ceil((allHistory.length || 1) / itemsPerPage));
        setWalletData(walletResponse.data);
        setWalletHistory(fetchWalletHistory(walletResponse.data.wbtcBalance));
        setWalletLoading(false);
      } catch (error) {
        console.error("Erro ao carregar dados iniciais:", error);
        if (error.response?.status === 401) {
          onLogout();
        }
        navigate("/auth", { replace: true });
      } finally {
        setLoading(false);
      }
    };

    const checkForUpdates = async () => {
      try {
        const [
          userResponse,
          depositsResponse,
          paymentsResponse,
          loansResponse,
          walletResponse,
          investmentResponse,
        ] = await Promise.all([
          api.get("/users/me"),
          api.get("/deposits/me"),
          api.get("/payments/me"),
          api.get("/loans/me"),
          api.get("/wallet/data"),
          api.get("/investments/me"),
        ]);

        const depositHistory = depositsResponse.data.map((deposit) => ({
          _id: deposit._id,
          description: `Depósito via ${deposit.metodoNome}`,
          amount: deposit.valor,
          date: new Date(deposit.createdAt),
          cashback: 0,
          status: deposit.status,
          tipo: "deposito",
        }));

        const paymentHistory = paymentsResponse.data.map((payment) => ({
          id: payment._id,
          description: payment.descricaoPagamento,
          amount: payment.valorPagamento,
          date: new Date(payment.createdAt),
          cashback: payment.cashback || 0,
          status: payment.status,
          tipo: "pagamento",
          taxa: payment.taxa,
        }));

        const loanHistory = loansResponse.data.map((loan) => ({
          _id: loan._id,
          description: `Empréstimo de R$ ${loan.amount.toFixed(2)}`,
          amount: loan.totalToRepay,
          date: new Date(loan.createdAt),
          cashback: 0,
          status: loan.status === "active" ? "Ativo" : loan.status === "repaid" ? "Pago" : "Vencido",
          tipo: "emprestimo",
        }));

        const allHistory = [...depositHistory, ...paymentHistory, ...loanHistory];
        allHistory.sort((a, b) => new Date(b.date) - new Date(a.date));

        const investmentData = investmentResponse.data || { amount: 0 };

        setUserData({
          ...userResponse.data,
          paymentHistory: allHistory,
          investmentData,
        });
        setTotalPages(Math.ceil((allHistory.length || 1) / itemsPerPage));
        setWalletData(walletResponse.data);
        setWalletHistory(fetchWalletHistory(walletResponse.data.wbtcBalance));
        setLastCheck(new Date().toISOString());
      } catch (error) {
        console.error("Erro ao verificar atualizações:", error);
      }
    };

    fetchInitialData();
    const updateIntervalId = setInterval(checkForUpdates, 30000);

    return () => {
      clearInterval(updateIntervalId);
      stopPriceUpdates(intervalId);
    };
  }, [currentUser, navigate, itemsPerPage, onLogout]);

  const handlePayBill = () => {
    setPixKey("");
    setValorPagamento("");
    setDescricaoPagamento("");
    setCategoriaPagamento("");
    setPixMensagem(null);
    setPixLoading(false);
    setPixDetails(null);
    setShowPixModal(true);
  };

  const handleClosePixModal = () => setShowPixModal(false);

  const handlePixKeyChange = async (e) => {
    const key = e.target.value;
    setPixKey(key);
    if (key) {
      try {
        const details = await analisarChavePix(key);
        setPixDetails(details);
        setValorPagamento(details.valor || "");
        setDescricaoPagamento(details.destinatario || "Pagamento Pix");
        setPixMensagem(null);
      } catch (error) {
        setPixMensagem({ tipo: "erro", texto: error.message });
        setPixDetails(null);
        setValorPagamento("");
        setDescricaoPagamento("");
      }
    } else {
      setPixDetails(null);
      setPixMensagem(null);
      setValorPagamento("");
      setDescricaoPagamento("");
    }
  };

  const handleValorPagamentoChange = (e) => setValorPagamento(e.target.value);
  const handleDescricaoPagamentoChange = (e) => setDescricaoPagamento(e.target.value);
  const handleCategoriaPagamentoChange = (e) => setCategoriaPagamento(e.target.value);

  const handleProcessarPagamentoPix = async () => {
    setPixLoading(true);
    setPixMensagem(null);

    const callbacks = {
      onInicio: () => setPixLoading(true),
      onSucesso: (resultado) => {
        setUserData((prev) => ({
          ...prev,
          paymentHistory: [resultado.novoPagamento, ...prev.paymentHistory],
          saldoReais: prev.saldoReais - resultado.valorTotal,
        }));
        setTotalPages(Math.ceil((userData.paymentHistory.length + 1) / itemsPerPage));
        setPixMensagem({
          tipo: "sucesso",
          texto: "Pagamento registrado! Aguarde a aprovação do administrador.",
        });
      },
      onErro: (mensagem) => setPixMensagem({ tipo: "erro", texto: mensagem }),
      onFim: () => setPixLoading(false),
    };

    await gerenciarPagamento(
      valorPagamento,
      descricaoPagamento,
      categoriaPagamento,
      userData.saldoReais,
      wbtcBrlPrice,
      pixKey,
      callbacks
    );

    setTimeout(() => setShowPixModal(false), 5000);
  };

  const handleDeposit = () => {
    setValorDeposito("");
    setMetodoDeposito("");
    setDepositoMensagem(null);
    setTaxaDeposito(0);
    setComprovanteArquivo(null);
    setDepositoLoading(false);
    setShowDepositoModal(true);
  };

  const handleCloseDepositoModal = () => setShowDepositoModal(false);

  const handleValorDepositoChange = (e) => {
    const valor = e.target.value;
    setValorDeposito(valor);
    if (metodoDeposito && !isNaN(parseFloat(valor))) {
      const taxa = calcularTaxa(valor, metodoDeposito, "deposito");
      setTaxaDeposito(taxa);
    }
  };

  const handleMetodoDepositoChange = (e) => {
    const metodo = e.target.value;
    setMetodoDeposito(metodo);
    if (valorDeposito && !isNaN(parseFloat(valorDeposito))) {
      const taxa = calcularTaxa(valorDeposito, metodo, "deposito");
      setTaxaDeposito(taxa);
    }
  };

  const handleComprovanteChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setComprovanteArquivo(e.target.files[0]);
    }
  };

  const handleProcessarDeposito = async () => {
    setDepositoLoading(true);
    setDepositoMensagem(null);

    try {
      const valor = parseFloat(valorDeposito);
      if (!valor || valor <= 0) throw new Error("Valor inválido");
      if (!metodoDeposito) throw new Error("Selecione um método de pagamento");
      if (metodoDeposito !== "pix") throw new Error("Apenas o método PIX está disponível");
      if (!comprovanteArquivo) throw new Error("O comprovante é obrigatório");

      const metodo = metodosPagamento.find((m) => m.id === metodoDeposito);
      const taxa = calcularTaxa(valor, metodoDeposito, "deposito");

      const depositData = new FormData();
      depositData.append("valor", valor);
      depositData.append("metodoId", metodoDeposito);
      depositData.append("metodoNome", metodo.nome);
      depositData.append("taxa", taxa);
      depositData.append("comprovante", comprovanteArquivo);

      const response = await api.post("/deposits", depositData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const novoDeposito = {
        _id: response.data._id,
        description: `Depósito via ${metodo.nome}`,
        amount: valor,
        date: new Date(),
        cashback: 0,
        status: "Pendente",
        tipo: "deposito",
      };

      setUserData((prev) => ({
        ...prev,
        paymentHistory: [novoDeposito, ...prev.paymentHistory],
      }));
      setTotalPages(Math.ceil((userData.paymentHistory.length + 1) / itemsPerPage));
      setDepositoMensagem({
        tipo: "sucesso",
        texto: "Depósito registrado! Aguarde até 10 minutos para processamento.",
      });
      setTimeout(() => setShowDepositoModal(false), 5000);
    } catch (error) {
      setDepositoMensagem({
        tipo: "erro",
        texto: error.message || error.response?.data?.message || "Erro ao processar depósito",
      });
    } finally {
      setDepositoLoading(false);
    }
  };

  const handleSellWbtc = () => {
    setValorVenda("");
    setSellMensagem(null);
    setSellLoading(false);
    setShowSellModal(true);
  };

  const handleCloseSellModal = () => setShowSellModal(false);

  const handleValorVendaChange = (e) => setValorVenda(e.target.value);

  const handleProcessarVenda = async () => {
    setSellLoading(true);
    setSellMensagem(null);

    try {
      const wbtcToSell = parseFloat(valorVenda);
      if (!Number.isFinite(wbtcToSell) || wbtcToSell <= 0) {
        throw new Error("Por favor, informe um valor válido para a venda.");
      }
      if (wbtcToSell > (userData.wbtcBalance || 0)) {
        throw new Error("Saldo insuficiente de WBTC para a venda.");
      }

      const result = await processarVendaWBTC(wbtcToSell, {
        onInicio: () => setSellLoading(true),
        onErro: (mensagem) => setSellMensagem({ tipo: "erro", texto: mensagem }),
        onFim: () => setSellLoading(false),
      });

      const { transaction, updatedUser } = result;

      setUserData((prev) => ({
        ...prev,
        wbtcBalance: updatedUser.wbtcBalance,
        saldoReais: updatedUser.saldoReais,
        pontos: updatedUser.pontos,
        paymentHistory: [transaction, ...prev.paymentHistory],
      }));

      setTotalPages(Math.ceil(((userData.paymentHistory?.length || 0) + 1) / itemsPerPage));

      setSellMensagem({
        tipo: "sucesso",
        texto: `Venda de ${wbtcToSell.toFixed(8)} WBTC realizada com sucesso! Recebido: R$ ${transaction.amount.toFixed(2)} (Taxa: R$ ${transaction.taxa?.toFixed(2) || "0.00"}). +1 ponto!`,
      });

      setTimeout(() => setShowSellModal(false), 3000);
    } catch (error) {
      console.error("Erro na venda:", error);
      setSellMensagem({
        tipo: "erro",
        texto: error.response?.data?.error || error.message || "Erro ao processar a venda. Tente novamente.",
      });
      setSellLoading(false);
    }
  };

  const handleExportFullStatement = () => {
    if (!userData) return;
    try {
      exportFullStatement({
        ...userData,
        bitcoinBalance: userData.wbtcBalance,
      });
      alert("Extrato completo gerado com sucesso!");
    } catch (error) {
      alert("Erro ao gerar extrato completo.");
    }
  };

  const handleExportCustomStatement = () => {
    if (!userData || !startDate || !endDate) {
      alert("Selecione as datas de início e fim.");
      return;
    }
    try {
      exportCustomStatement(
        { ...userData, bitcoinBalance: userData.wbtcBalance },
        startDate,
        endDate
      );
      alert("Extrato personalizado gerado com sucesso!");
    } catch (error) {
      alert("Erro ao gerar extrato personalizado.");
    }
  };

  const handleExportTransaction = (payment) => {
    if (!userData) return;
    try {
      exportTransaction(
        { ...userData, bitcoinBalance: userData.wbtcBalance },
        payment
      );
      alert(`Detalhes da transação "${payment.description}" exportados!`);
    } catch (error) {
      alert("Erro ao exportar transação.");
    }
  };

  const getCurrentItems = () => {
    if (!userData || !userData.paymentHistory) return [];
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return userData.paymentHistory.slice(indexOfFirstItem, indexOfLastItem);
  };

  const goToNextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);
  const goToPreviousPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const goToPage = (pageNumber) => setCurrentPage(pageNumber);

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxPageButtons = 3;
    let startPage = Math.max(1, currentPage - 1);
    let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);
    if (endPage - startPage + 1 < maxPageButtons) {
      startPage = Math.max(1, endPage - maxPageButtons + 1);
    }
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <li key={i} className={`page-item ${currentPage === i ? "active" : ""}`}>
          <button className="page-link" onClick={() => goToPage(i)}>{i}</button>
        </li>
      );
    }
    return pageNumbers;
  };

  if (loading) {
    return <div className="container text-center"><h3>Carregando...</h3></div>;
  }

  if (!userData) {
    return (
      <div className="container text-center">
        <h3>Erro ao carregar dados do usuário</h3>
        <p>Tente novamente mais tarde.</p>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="row">
        <div className="col-md-8">
          <h1 className="user-title">Bem-vindo, {userData.name.split(" ")[0]}! 👋</h1>
          <p className="user-subtitle">Gerencie suas contas e recompensas aqui.</p>
        </div>
        <div className="col-md-4">
          <div className="points-section d-flex justify-content-md-end justify-content-center">
            <div className="d-flex align-items-center">
              <div className="points-circle me-2">
                <span className="points-value">{userData.pontos}</span>
              </div>
              <div>
                <span className="points-text fw-bold">Seus Pontos</span>
                <br />
                <small className="text-muted">Acumulados</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Saldos</h5>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div>
                  <p className="card-text mb-0">
                    <strong>{(userData.wbtcBalance || 0).toFixed(8)} WBTC</strong>
                    <br />
                    <small>
                      1 WBTC = {wbtcBrlPrice ? (
                        <span>
                          R$ {wbtcBrlPrice.toFixed(2)}
                          <span className="ms-1 text-success" style={{ fontSize: "0.8em" }}>
                            <span className="spinner-grow spinner-grow-sm" role="status" aria-hidden="true" style={{ width: "0.5rem", height: "0.5rem" }}></span>
                          </span>
                        </span>
                      ) : "Carregando..."}
                    </small>
                  </p>
                </div>
                <button className="btn btn-outline-warning" onClick={handleSellWbtc}>Vender</button>
              </div>
              <p className="card-text mb-0">
                <strong>R$ {(userData.saldoReais || 0).toFixed(2)}</strong>
                <br />
                <small>Disponível em Reais</small>
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Ações Rápidas</h5>
              <div className="d-flex gap-2 flex-wrap">
                <button className="btn btn-warning flex-grow-1" onClick={handlePayBill}>Pagar Conta</button>
                <button className="btn btn-warning flex-grow-1" onClick={handleDeposit}>Depositar</button>
                <Loans
                  currentUser={userData}
                  saldoReais={userData.saldoReais}
                  investmentData={userData.investmentData || { amount: 0 }}
                  updateUserData={updateUserData}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Histórico da Carteira WBTC (Arbitrum One)</h5>
              <p className="wallet-address"><small>Endereço: {walletAddress}</small></p>
              {walletLoading ? (
                <div className="text-center py-3">
                  <p>Carregando dados da carteira...</p>
                </div>
              ) : (
                <div className="wallet-chart">
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={walletHistory} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(date) => {
                          const d = new Date(date);
                          return `${d.getMonth() + 1}/${d.getFullYear().toString().substr(2, 2)}`;
                        }}
                        interval={3}
                      />
                      <YAxis tickFormatter={(value) => value.toFixed(6)} domain={["dataMin", "dataMax"]} />
                      <Tooltip
                        formatter={(value) => [`${value.toFixed(8)} WBTC`, "Saldo"]}
                        labelFormatter={(date) => `Data: ${new Date(date).toLocaleDateString()}`}
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#2a5298"
                        strokeWidth={2}
                        dot={{ r: 2 }}
                        activeDot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                  <div className="text-center mt-1">
                    <small className="text-muted">
                      Saldo atual: {walletData.wbtcBalance.toFixed(8)} WBTC | Última atualização: {new Date(walletData.lastUpdated).toLocaleString("pt-BR")}
                    </small>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <Investments currentUser={currentUser} saldoReais={userData.saldoReais} updateUserData={updateUserData} />
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
                <h5 className="card-title mb-0">Histórico de Transações</h5>
                <div className="d-flex align-items-center flex-wrap export-controls gap-2">
                  <button className="btn btn-sm btn-outline-primary" onClick={handleExportFullStatement}>Extrato Completo</button>
                  <input
                    type="date"
                    className="form-control form-control-sm"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    style={{ maxWidth: "150px" }}
                  />
                  <input
                    type="date"
                    className="form-control form-control-sm"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    style={{ maxWidth: "150px" }}
                  />
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={handleExportCustomStatement}
                    disabled={!startDate || !endDate}
                  >
                    Extrato Personalizado
                  </button>
                </div>
              </div>
              {userData.paymentHistory.length > 0 ? (
                <>
                  <div className="table-responsive">
                    <table className="table table-striped transaction-table">
                      <thead>
                        <tr>
                          <th>Descrição</th>
                          <th>Valor (R$)</th>
                          <th>Data</th>
                          <th>Cashback (WBTC)</th>
                          <th>Status</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {getCurrentItems().map((item) => (
                          <tr key={item._id || item.id}>
                            <td>{item.description}</td>
                            <td>{item.amount.toFixed(2)}</td>
                            <td>{new Date(item.date).toLocaleDateString("pt-BR")}</td>
                            <td><span className="cashback-value">{(item.cashback || 0).toFixed(8)} WBTC</span></td>
                            <td>{item.status}</td>
                            <td>
                              {(item.status === "Concluído" || item.status === "Pago") && (
                                <button
                                  className="btn btn-link p-0 export-btn"
                                  onClick={() => handleExportTransaction(item)}
                                  title="Exportar em PDF"
                                >
                                  <FiletypePdf size={16} />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <nav aria-label="Paginação do histórico">
                    <ul className="pagination justify-content-center mt-3">
                      <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                        <button className="page-link" onClick={goToPreviousPage}><ChevronLeft /></button>
                      </li>
                      {renderPageNumbers()}
                      <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                        <button className="page-link" onClick={goToNextPage}><ChevronRight /></button>
                      </li>
                    </ul>
                  </nav>
                </>
              ) : (
                <p>Nenhuma transação realizada ainda.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {showPixModal && (
        <div className="modal fade show" style={{ display: "block" }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Pagar Conta com Pix</h5>
                <button type="button" className="btn-close" onClick={handleClosePixModal} disabled={pixLoading}></button>
              </div>
              <div className="modal-body">
                {pixMensagem && (
                  <div className={`alert alert-${pixMensagem.tipo === "sucesso" ? "success" : "danger"}`}>
                    {pixMensagem.texto}
                  </div>
                )}
                <div className="mb-3">
                  <label htmlFor="pixKey" className="form-label">Chave Pix do Destinatário</label>
                  <input
                    type="text"
                    className="form-control"
                    id="pixKey"
                    placeholder="Cole a chave Pix aqui"
                    value={pixKey}
                    onChange={handlePixKeyChange}
                    disabled={pixLoading}
                    autoFocus
                  />
                </div>
                {pixDetails && (
                  <div className="mb-3">
                    <div className="card bg-light">
                      <div className="card-body">
                        <h6 className="card-title">Detalhes do Pagamento</h6>
                        <p><strong>Destinatário:</strong> {pixDetails.destinatario}</p>
                        <p><strong>Valor:</strong> R$ {pixDetails.valor || valorPagamento}</p>
                      </div>
                    </div>
                  </div>
                )}
                <div className="mb-3">
                  <label htmlFor="valorPagamento" className="form-label">Valor do Pagamento (R$)</label>
                  <input
                    type="number"
                    className="form-control"
                    id="valorPagamento"
                    placeholder="Digite o valor"
                    value={valorPagamento}
                    onChange={handleValorPagamentoChange}
                    disabled={pixLoading}
                    min="0.01"
                    step="0.01"
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="categoriaPagamento" className="form-label">Categoria do Pagamento</label>
                  <select
                    className="form-select"
                    id="categoriaPagamento"
                    value={categoriaPagamento}
                    onChange={handleCategoriaPagamentoChange}
                    disabled={pixLoading}
                  >
                    <option value="">Selecione uma categoria</option>
                    {categoriasPagamento.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.nome}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label htmlFor="descricaoPagamento" className="form-label">Descrição</label>
                  <input
                    type="text"
                    className="form-control"
                    id="descricaoPagamento"
                    placeholder="Digite uma descrição"
                    value={descricaoPagamento}
                    onChange={handleDescricaoPagamentoChange}
                    disabled={pixLoading}
                  />
                </div>
                {valorPagamento && categoriaPagamento && (
                  <div className="mb-3">
                    <div className="card bg-light">
                      <div className="card-body">
                        <h6 className="card-title">Resumo do Pagamento</h6>
                        <p>Valor do pagamento: R$ {parseFloat(valorPagamento).toFixed(2)}</p>
                        <p>Taxa (3%): R$ {(parseFloat(valorPagamento) * 0.03).toFixed(2)}</p>
                        <p>Total a pagar: R$ {(parseFloat(valorPagamento) * 1.03).toFixed(2)}</p>
                        <p>Cashback estimado: {calcularCashback(valorPagamento, wbtcBrlPrice)} WBTC (após aprovação)</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleClosePixModal}
                  disabled={pixLoading}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-warning"
                  onClick={handleProcessarPagamentoPix}
                  disabled={
                    pixLoading ||
                    !valorPagamento ||
                    !categoriaPagamento ||
                    !descricaoPagamento.trim() ||
                    parseFloat(valorPagamento) * 1.03 > userData.saldoReais
                  }
                >
                  {pixLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Processando...
                    </>
                  ) : (
                    "Confirmar Pagamento"
                  )}
                </button>
              </div>
            </div>
          </div>
          <div
            className="modal-backdrop fade show"
            onClick={!pixLoading ? handleClosePixModal : null}
            style={{ zIndex: -1 }}
          ></div>
        </div>
      )}

      {showDepositoModal && (
        <div
          className="modal-backdrop"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1050,
          }}
        >
          <div
            className="modal-content"
            style={{
              backgroundColor: "white",
              borderRadius: "10px",
              width: "90%",
              maxWidth: "500px",
              padding: "20px",
            }}
          >
            <div className="modal-header">
              <h5 className="modal-title">Realizar Depósito</h5>
              <button
                type="button"
                className="btn-close"
                onClick={handleCloseDepositoModal}
                disabled={depositoLoading}
              ></button>
            </div>
            <div className="modal-body">
              {depositoMensagem && (
                <div className={`alert alert-${depositoMensagem.tipo === "sucesso" ? "success" : "danger"}`}>
                  {depositoMensagem.texto}
                </div>
              )}
              <div className="alert alert-info mb-3">
                <h6 className="alert-heading">Informações para depósito PIX</h6>
                <p className="mb-1"><strong>Chave PIX (CPF):</strong> 01558516247</p>
                <p className="mb-1"><strong>Favorecido:</strong> Josias Silva Monteiro</p>
                <hr />
                <small>Faça o depósito PIX usando os dados acima e envie o comprovante para confirmar seu depósito.</small>
              </div>
              <div className="mb-3">
                <label htmlFor="valorDeposito" className="form-label">Valor do Depósito (R$)</label>
                <input
                  type="number"
                  className="form-control"
                  id="valorDeposito"
                  placeholder="Digite o valor"
                  value={valorDeposito}
                  onChange={handleValorDepositoChange}
                  disabled={depositoLoading}
                  min="1"
                  step="0.01"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="metodoDeposito" className="form-label">Método de Pagamento</label>
                <select
                  className="form-select"
                  id="metodoDeposito"
                  value={metodoDeposito}
                  onChange={handleMetodoDepositoChange}
                  disabled={depositoLoading}
                >
                  <option value="">Selecione um método</option>
                  {metodosPagamento.map((metodo) => (
                    <option
                      key={metodo.id}
                      value={metodo.id}
                      disabled={!metodo.disponivel}
                    >
                      {metodo.nome} {metodo.taxa > 0 && metodo.id !== "pix" ? `(Taxa: ${metodo.taxa}%)` : "(Sem taxa)"}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label htmlFor="comprovante" className="form-label">Comprovante (Obrigatório)</label>
                <input
                  type="file"
                  className="form-control"
                  id="comprovante"
                  accept="image/*,.pdf"
                  onChange={handleComprovanteChange}
                  disabled={depositoLoading}
                  required
                />
                <small className="text-muted">Para confirmar seu depósito, precisamos do comprovante da transação.</small>
              </div>
              {valorDeposito && metodoDeposito && (
                <div className="mb-3">
                  <div className="card bg-light">
                    <div className="card-body">
                      <h6 className="card-title">Resumo do Depósito</h6>
                      <p>Valor do depósito: R$ {parseFloat(valorDeposito).toFixed(2)}</p>
                      {taxaDeposito > 0 && <p>Taxa: R$ {taxaDeposito.toFixed(2)}</p>}
                      <p className="fw-bold">Total a pagar: R$ {(parseFloat(valorDeposito) + taxaDeposito).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCloseDepositoModal}
                disabled={depositoLoading}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn-warning"
                onClick={handleProcessarDeposito}
                disabled={
                  depositoLoading ||
                  !valorDeposito ||
                  !metodoDeposito ||
                  !comprovanteArquivo ||
                  metodoDeposito !== "pix"
                }
              >
                {depositoLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Processando...
                  </>
                ) : (
                  "Confirmar Depósito"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSellModal && (
        <div className="modal fade show" style={{ display: "block" }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Vender WBTC</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseSellModal}
                  disabled={sellLoading}
                ></button>
              </div>
              <div className="modal-body">
                {sellMensagem && (
                  <div className={`alert alert-${sellMensagem.tipo === "sucesso" ? "success" : "danger"}`}>
                    {sellMensagem.texto}
                  </div>
                )}
                <div className="mb-3">
                  <label htmlFor="valorVenda" className="form-label">Quantidade de WBTC a Vender</label>
                  <input
                    type="number"
                    className="form-control"
                    id="valorVenda"
                    placeholder="Digite a quantidade"
                    value={valorVenda}
                    onChange={handleValorVendaChange}
                    disabled={sellLoading}
                    min="0.00000001"
                    step="0.00000001"
                    autoFocus
                  />
                  <small className="text-muted">Saldo disponível: {(userData.wbtcBalance || 0).toFixed(8)} WBTC</small>
                </div>
                {valorVenda && !isNaN(parseFloat(valorVenda)) && wbtcBrlPrice && (
                  <div className="mb-3">
                    <div className="card bg-light">
                      <div className="card-body">
                        <h6 className="card-title">Resumo da Venda</h6>
                        <p className="mb-1">Quantidade: {parseFloat(valorVenda).toFixed(8)} WBTC</p>
                        <p className="mb-1">Valor a receber: R$ {(parseFloat(valorVenda) * wbtcBrlPrice).toFixed(2)}</p>
                        <p className="mt-2 text-success">
                          <small>+ 1 ponto será adicionado à sua conta</small>
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCloseSellModal}
                  disabled={sellLoading}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-warning"
                  onClick={handleProcessarVenda}
                  disabled={
                    sellLoading ||
                    !valorVenda ||
                    isNaN(parseFloat(valorVenda)) ||
                    parseFloat(valorVenda) <= 0 ||
                    parseFloat(valorVenda) > (userData.wbtcBalance || 0)
                  }
                >
                  {sellLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Processando...
                    </>
                  ) : (
                    "Confirmar Venda"
                  )}
                </button>
              </div>
            </div>
          </div>
          <div
            className="modal-backdrop fade show"
            onClick={!sellLoading ? handleCloseSellModal : null}
            style={{ zIndex: -1 }}
          ></div>
        </div>
      )}
    </div>
  );
}

export default Page_user;