import React, { useState, useEffect } from "react";
import "./Styles/Page_user.css";
import { useNavigate } from "react-router-dom";
import { FiletypePdf, ChevronLeft, ChevronRight } from "react-bootstrap-icons";
import api from "../services/api";
import { processarVendaWBTC } from "../Hooks/Venderbitcoin";
import Investments from "../Hooks/Investments";
import Loans from "../Hooks/Loans"; // Corrigido para Loans.js
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

function Page_user({ currentUser }) {
  const navigate = useNavigate();
  const walletAddress = "0x1c580b494ea23661feec1738bfd8e38adc264775";

  // Estados
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

  // Função para atualizar userData
  const updateUserData = (newData) => {
    setUserData((prev) => ({ ...prev, ...newData }));
  };

  // Função para gerar histórico simplificado da carteira
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

  // useEffect para inicialização e atualização
  useEffect(() => {
    const intervalId = startPriceUpdates(setWbtcBrlPrice, 10000);
    setPriceUpdateInterval(intervalId);

    const fetchInitialData = async () => {
      try {
        const userResponse = await api.get("/users/me");
        const data = userResponse.data;

        const depositsResponse = await api.get("/deposits/me");
        const depositHistory = depositsResponse.data.map((deposit) => ({
          _id: deposit._id,
          description: `Depósito via ${deposit.metodoNome}`,
          amount: deposit.valor,
          date: new Date(deposit.createdAt),
          cashback: 0,
          status: deposit.status,
          tipo: "deposito",
        }));

        const paymentsResponse = await api.get("/payments/me");
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

        // Adicionar histórico de empréstimos
        const loansResponse = await api.get("/loans/me");
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

        // Buscar dados de investimento
        const investmentResponse = await api.get("/investments/me");
        const investmentData = investmentResponse.data || { amount: 0 }; // Default caso não haja investimento

        setUserData({
          ...data,
          paymentHistory: allHistory,
          investmentData,
        });
        setTotalPages(Math.ceil((allHistory.length || 1) / itemsPerPage));

        const walletResponse = await api.get("/wallet/data");
        setWalletData(walletResponse.data);
        setWalletHistory(fetchWalletHistory(walletResponse.data.wbtcBalance));
        setWalletLoading(false);
      } catch (error) {
        console.error("Erro ao carregar dados iniciais:", error);
        navigate("/auth", { replace: true });
      } finally {
        setLoading(false);
      }
    };

    const checkForUpdates = async () => {
      try {
        const userResponse = await api.get("/users/me");
        const depositsResponse = await api.get("/deposits/me");
        const paymentsResponse = await api.get("/payments/me");
        const loansResponse = await api.get("/loans/me");
        const walletResponse = await api.get("/wallet/data");

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

        const investmentResponse = await api.get("/investments/me");
        const investmentData = investmentResponse.data || { amount: 0 }; // Default caso não haja investimento

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

    if (currentUser) {
      fetchInitialData();
      const updateIntervalId = setInterval(checkForUpdates, 30000);
      return () => {
        clearInterval(updateIntervalId);
        stopPriceUpdates(intervalId);
      };
    } else {
      navigate("/auth", { replace: true });
    }
  }, [currentUser, navigate, itemsPerPage]);

  // Funções de manipulação de modais e ações
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
  const handleDescricaoPagamentoChange = (e) =>
    setDescricaoPagamento(e.target.value);
  const handleCategoriaPagamentoChange = (e) =>
    setCategoriaPagamento(e.target.value);

  const handleProcessarPagamentoPix = async () => {
    setPixLoading(true);
    setPixMensagem(null);

    const callbacks = {
      onInicio: () => setPixLoading(true),
      onSucesso: (resultado) => {
        setUserData((prev) => ({
          ...prev,
          paymentHistory: [resultado.novoPagamento, ...prev.paymentHistory],
        }));
        setTotalPages(
          Math.ceil((userData.paymentHistory.length + 1) / itemsPerPage)
        );
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
      if (metodoDeposito !== "pix")
        throw new Error("Apenas o método PIX está disponível");
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

      setTotalPages(
        Math.ceil((userData.paymentHistory.length + 1) / itemsPerPage)
      );
      setDepositoMensagem({
        tipo: "sucesso",
        texto:
          "Depósito registrado! Aguarde até 10 minutos para processamento.",
      });
      setTimeout(() => setShowDepositoModal(false), 5000);
    } catch (error) {
      setDepositoMensagem({
        tipo: "erro",
        texto:
          error.message ||
          error.response?.data?.message ||
          "Erro ao processar depósito",
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
        onErro: (mensagem) =>
          setSellMensagem({ tipo: "erro", texto: mensagem }),
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

      setTotalPages(
        Math.ceil(((userData.paymentHistory?.length || 0) + 1) / itemsPerPage)
      );

      setSellMensagem({
        tipo: "sucesso",
        texto: `Venda de ${wbtcToSell.toFixed(
          8
        )} WBTC realizada com sucesso! Recebido: R$ ${transaction.amount.toFixed(
          2
        )} (Taxa: R$ ${transaction.taxa?.toFixed(2) || "0.00"}). +1 ponto!`,
      });

      setTimeout(() => setShowSellModal(false), 3000);
    } catch (error) {
      console.error("Erro na venda:", error);
      setSellMensagem({
        tipo: "erro",
        texto:
          error.response?.data?.error ||
          error.message ||
          "Erro ao processar a venda. Tente novamente.",
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

  const goToNextPage = () =>
    currentPage < totalPages && setCurrentPage(currentPage + 1);
  const goToPreviousPage = () =>
    currentPage > 1 && setCurrentPage(currentPage - 1);
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
        React.createElement(
          "li",
          {
            key: i,
            className: `page-item ${currentPage === i ? "active" : ""}`,
          },
          React.createElement(
            "button",
            { className: "page-link", onClick: () => goToPage(i) },
            i
          )
        )
      );
    }
    return pageNumbers;
  };

  if (loading) {
    return React.createElement(
      "div",
      { className: "container text-center" },
      React.createElement("h3", null, "Carregando...")
    );
  }

  if (!userData) {
    return React.createElement(
      "div",
      { className: "container text-center" },
      React.createElement("h3", null, "Erro ao carregar dados do usuário"),
      React.createElement("p", null, "Tente novamente mais tarde.")
    );
  }

  return React.createElement(
    "div",
    { className: "container" },
    React.createElement(
      "div",
      { className: "row" },
      React.createElement(
        "div",
        { className: "col-md-8" },
        React.createElement(
          "h1",
          { className: "user-title" },
          `Bem-vindo, ${userData.name.split(" ")[0]}! 👋`
        ),
        React.createElement(
          "p",
          { className: "user-subtitle" },
          "Gerencie suas contas e recompensas aqui."
        )
      ),
      React.createElement(
        "div",
        { className: "col-md-4" },
        React.createElement(
          "div",
          {
            className:
              "points-section d-flex justify-content-md-end justify-content-center",
          },
          React.createElement(
            "div",
            { className: "d-flex align-items-center" },
            React.createElement(
              "div",
              { className: "points-circle me-2" },
              React.createElement(
                "span",
                { className: "points-value" },
                userData.pontos
              )
            ),
            React.createElement(
              "div",
              null,
              React.createElement(
                "span",
                { className: "points-text fw-bold" },
                "Seus Pontos"
              ),
              React.createElement("br"),
              React.createElement(
                "small",
                { className: "text-muted" },
                "Acumulados"
              )
            )
          )
        )
      )
    ),

    React.createElement(
      "div",
      { className: "row" },
      React.createElement(
        "div",
        { className: "col-md-6" },
        React.createElement(
          "div",
          { className: "card" },
          React.createElement(
            "div",
            { className: "card-body" },
            React.createElement("h5", { className: "card-title" }, "Saldos"),
            React.createElement(
              "div",
              {
                className:
                  "d-flex justify-content-between align-items-center mb-2",
              },
              React.createElement(
                "div",
                null,
                React.createElement(
                  "p",
                  { className: "card-text mb-0" },
                  React.createElement(
                    "strong",
                    null,
                    (userData.wbtcBalance || 0).toFixed(8),
                    " WBTC"
                  ),
                  React.createElement("br"),
                  React.createElement(
                    "small",
                    null,
                    "1 WBTC = ",
                    wbtcBrlPrice
                      ? React.createElement(
                          "span",
                          null,
                          "R$ ",
                          wbtcBrlPrice.toFixed(2),
                          React.createElement(
                            "span",
                            {
                              className: "ms-1 text-success",
                              style: { fontSize: "0.8em" },
                            },
                            React.createElement("span", {
                              className: "spinner-grow spinner-grow-sm",
                              role: "status",
                              "aria-hidden": "true",
                              style: { width: "0.5rem", height: "0.5rem" },
                            })
                          )
                        )
                      : "Carregando..."
                  )
                )
              ),
              React.createElement(
                "button",
                {
                  className: "btn btn-outline-warning",
                  onClick: handleSellWbtc,
                },
                "Vender"
              )
            ),
            React.createElement(
              "p",
              { className: "card-text mb-0" },
              React.createElement(
                "strong",
                null,
                "R$ ",
                (userData.saldoReais || 0).toFixed(2)
              ),
              React.createElement("br"),
              React.createElement(
                "small",
                null,
                "Disponível em Reais"
              )
            )
          )
        )
      ),
      React.createElement(
        "div",
        { className: "col-md-6" },
        React.createElement(
          "div",
          { className: "card" },
          React.createElement(
            "div",
            { className: "card-body" },
            React.createElement(
              "h5",
              { className: "card-title" },
              "Ações Rápidas"
            ),
            React.createElement(
              "div",
              { className: "d-flex gap-2 flex-wrap" },
              React.createElement(
                "button",
                {
                  className: "btn btn-warning flex-grow-1",
                  onClick: handlePayBill,
                },
                "Pagar Conta"
              ),
              React.createElement(
                "button",
                {
                  className: "btn btn-warning flex-grow-1",
                  onClick: handleDeposit,
                },
                "Depositar"
              ),
              React.createElement(Loans, {
                currentUser: userData,
                saldoReais: userData.saldoReais,
                investmentData: userData.investmentData || { amount: 0 },
                updateUserData,
              })
            )
          )
        )
      )
    ),

    React.createElement(
      "div",
      { className: "row" },
      React.createElement(
        "div",
        { className: "col-12" },
        React.createElement(
          "div",
          { className: "card" },
          React.createElement(
            "div",
            { className: "card-body" },
            React.createElement(
              "h5",
              { className: "card-title" },
              "Histórico da Carteira WBTC (Arbitrum One)"
            ),
            React.createElement(
              "p",
              { className: "wallet-address" },
              React.createElement("small", null, "Endereço: ", walletAddress)
            ),
            walletLoading
              ? React.createElement(
                  "div",
                  { className: "text-center py-3" },
                  React.createElement(
                    "p",
                    null,
                    "Carregando dados da carteira..."
                  )
                )
              : React.createElement(
                  "div",
                  { className: "wallet-chart" },
                  React.createElement(
                    ResponsiveContainer,
                    { width: "100%", height: 200 },
                    React.createElement(LineChart, {
                      data: walletHistory,
                      margin: { top: 5, right: 20, bottom: 5, left: 0 },
                      children: [
                        React.createElement(CartesianGrid, {
                          strokeDasharray: "3 3",
                          stroke: "#eee",
                        }),
                        React.createElement(XAxis, {
                          dataKey: "date",
                          tickFormatter: (date) => {
                            const d = new Date(date);
                            return `${d.getMonth() + 1}/${d
                              .getFullYear()
                              .toString()
                              .substr(2, 2)}`;
                          },
                          interval: 3,
                        }),
                        React.createElement(YAxis, {
                          tickFormatter: (value) => value.toFixed(6),
                          domain: ["dataMin", "dataMax"],
                        }),
                        React.createElement(Tooltip, {
                          formatter: (value) => [
                            `${value.toFixed(8)} WBTC`,
                            "Saldo",
                          ],
                          labelFormatter: (date) =>
                            `Data: ${new Date(date).toLocaleDateString()}`,
                        }),
                        React.createElement(Line, {
                          type: "monotone",
                          dataKey: "value",
                          stroke: "#2a5298",
                          strokeWidth: 2,
                          dot: { r: 2 },
                          activeDot: { r: 4 },
                        }),
                      ],
                    })
                  ),
                  React.createElement(
                    "div",
                    { className: "text-center mt-1" },
                    React.createElement(
                      "small",
                      { className: "text-muted" },
                      "Saldo atual: ",
                      walletData.wbtcBalance.toFixed(8),
                      " WBTC | Última atualização: ",
                      new Date(walletData.lastUpdated).toLocaleString("pt-BR")
                    )
                  )
                )
          )
        )
      )
    ),

    React.createElement(
      "div",
      { className: "row" },
      React.createElement(
        "div",
        { className: "col-12" },
        React.createElement(Investments, {
          currentUser,
          saldoReais: userData.saldoReais,
          updateUserData,
        })
      )
    ),

    React.createElement(
      "div",
      { className: "row" },
      React.createElement(
        "div",
        { className: "col-12" },
        React.createElement(
          "div",
          { className: "card" },
          React.createElement(
            "div",
            { className: "card-body" },
            React.createElement(
              "div",
              {
                className:
                  "d-flex justify-content-between align-items-center mb-3 flex-wrap",
              },
              React.createElement(
                "h5",
                { className: "card-title mb-0" },
                "Histórico de Transações"
              ),
              React.createElement(
                "div",
                {
                  className:
                    "d-flex align-items-center flex-wrap export-controls gap-2",
                },
                React.createElement(
                  "button",
                  {
                    className: "btn btn-sm btn-outline-primary",
                    onClick: handleExportFullStatement,
                  },
                  "Extrato Completo"
                ),
                React.createElement("input", {
                  type: "date",
                  className: "form-control form-control-sm",
                  value: startDate,
                  onChange: (e) => setStartDate(e.target.value),
                  style: { maxWidth: "150px" },
                }),
                React.createElement("input", {
                  type: "date",
                  className: "form-control form-control-sm",
                  value: endDate,
                  onChange: (e) => setEndDate(e.target.value),
                  style: { maxWidth: "150px" },
                }),
                React.createElement(
                  "button",
                  {
                    className: "btn btn-sm btn-outline-primary",
                    onClick: handleExportCustomStatement,
                    disabled: !startDate || !endDate,
                  },
                  "Extrato Personalizado"
                )
              )
            ),
            userData.paymentHistory.length > 0
              ? React.createElement(
                  React.Fragment,
                  null,
                  React.createElement(
                    "div",
                    { className: "table-responsive" },
                    React.createElement(
                      "table",
                      { className: "table table-striped transaction-table" },
                      React.createElement(
                        "thead",
                        null,
                        React.createElement(
                          "tr",
                          null,
                          React.createElement("th", null, "Descrição"),
                          React.createElement("th", null, "Valor (R$)"),
                          React.createElement("th", null, "Data"),
                          React.createElement("th", null, "Cashback (WBTC)"),
                          React.createElement("th", null, "Status"),
                          React.createElement("th", null)
                        )
                      ),
                      React.createElement(
                        "tbody",
                        null,
                        getCurrentItems().map((item) =>
                          React.createElement(
                            "tr",
                            { key: item._id || item.id },
                            React.createElement("td", null, item.description),
                            React.createElement(
                              "td",
                              null,
                              item.amount.toFixed(2)
                            ),
                            React.createElement(
                              "td",
                              null,
                              new Date(item.date).toLocaleDateString("pt-BR")
                            ),
                            React.createElement(
                              "td",
                              null,
                              React.createElement(
                                "span",
                                { className: "cashback-value" },
                                (item.cashback || 0).toFixed(8),
                                " WBTC"
                              )
                            ),
                            React.createElement("td", null, item.status),
                            React.createElement(
                              "td",
                              null,
                              (item.status === "Concluído" || item.status === "Pago") &&
                                React.createElement(
                                  "button",
                                  {
                                    className: "btn btn-link p-0 export-btn",
                                    onClick: () => handleExportTransaction(item),
                                    title: "Exportar em PDF",
                                  },
                                  React.createElement(FiletypePdf, { size: 16 })
                                )
                            )
                          )
                        )
                      )
                    )
                  ),
                  React.createElement(
                    "nav",
                    { "aria-label": "Paginação do histórico" },
                    React.createElement(
                      "ul",
                      { className: "pagination justify-content-center mt-3" },
                      React.createElement(
                        "li",
                        {
                          className: `page-item ${
                            currentPage === 1 ? "disabled" : ""
                          }`,
                        },
                        React.createElement(
                          "button",
                          { className: "page-link", onClick: goToPreviousPage },
                          React.createElement(ChevronLeft)
                        )
                      ),
                      renderPageNumbers(),
                      React.createElement(
                        "li",
                        {
                          className: `page-item ${
                            currentPage === totalPages ? "disabled" : ""
                          }`,
                        },
                        React.createElement(
                          "button",
                          { className: "page-link", onClick: goToNextPage },
                          React.createElement(ChevronRight)
                        )
                      )
                    )
                  )
                )
              : React.createElement(
                  "p",
                  null,
                  "Nenhuma transação realizada ainda."
                )
          )
        )
      )
    ),

    showPixModal &&
      React.createElement(
        "div",
        {
          className: "modal fade show",
          style: { display: "block" },
          tabIndex: "-1",
        },
        React.createElement(
          "div",
          { className: "modal-dialog modal-dialog-centered" },
          React.createElement(
            "div",
            { className: "modal-content" },
            React.createElement(
              "div",
              { className: "modal-header" },
              React.createElement(
                "h5",
                { className: "modal-title" },
                "Pagar Conta com Pix"
              ),
              React.createElement("button", {
                type: "button",
                className: "btn-close",
                onClick: handleClosePixModal,
                disabled: pixLoading,
              })
            ),
            React.createElement(
              "div",
              { className: "modal-body" },
              pixMensagem &&
                React.createElement(
                  "div",
                  {
                    className: `alert alert-${
                      pixMensagem.tipo === "sucesso" ? "success" : "danger"
                    }`,
                  },
                  pixMensagem.texto
                ),
              React.createElement(
                "div",
                { className: "mb-3" },
                React.createElement(
                  "label",
                  { htmlFor: "pixKey", className: "form-label" },
                  "Chave Pix do Destinatário"
                ),
                React.createElement("input", {
                  type: "text",
                  className: "form-control",
                  id: "pixKey",
                  placeholder: "Cole a chave Pix aqui",
                  value: pixKey,
                  onChange: handlePixKeyChange,
                  disabled: pixLoading,
                  autoFocus: true,
                })
              ),
              pixDetails &&
                React.createElement(
                  "div",
                  { className: "mb-3" },
                  React.createElement(
                    "div",
                    { className: "card bg-light" },
                    React.createElement(
                      "div",
                      { className: "card-body" },
                      React.createElement(
                        "h6",
                        { className: "card-title" },
                        "Detalhes do Pagamento"
                      ),
                      React.createElement(
                        "p",
                        null,
                        React.createElement("strong", null, "Destinatário: "),
                        pixDetails.destinatario
                      ),
                      React.createElement(
                        "p",
                        null,
                        React.createElement("strong", null, "Valor: "),
                        "R$ ",
                        pixDetails.valor || valorPagamento
                      )
                    )
                  )
                ),
              React.createElement(
                "div",
                { className: "mb-3" },
                React.createElement(
                  "label",
                  { htmlFor: "valorPagamento", className: "form-label" },
                  "Valor do Pagamento (R$)"
                ),
                React.createElement("input", {
                  type: "number",
                  className: "form-control",
                  id: "valorPagamento",
                  placeholder: "Digite o valor",
                  value: valorPagamento,
                  onChange: handleValorPagamentoChange,
                  disabled: pixLoading,
                  min: "0.01",
                  step: "0.01",
                })
              ),
              React.createElement(
                "div",
                { className: "mb-3" },
                React.createElement(
                  "label",
                  { htmlFor: "categoriaPagamento", className: "form-label" },
                  "Categoria do Pagamento"
                ),
                React.createElement(
                  "select",
                  {
                    className: "form-select",
                    id: "categoriaPagamento",
                    value: categoriaPagamento,
                    onChange: handleCategoriaPagamentoChange,
                    disabled: pixLoading,
                  },
                  React.createElement(
                    "option",
                    { value: "" },
                    "Selecione uma categoria"
                  ),
                  categoriasPagamento.map((cat) =>
                    React.createElement(
                      "option",
                      { key: cat.id, value: cat.id },
                      cat.nome
                    )
                  )
                )
              ),
              React.createElement(
                "div",
                { className: "mb-3" },
                React.createElement(
                  "label",
                  { htmlFor: "descricaoPagamento", className: "form-label" },
                  "Descrição"
                ),
                React.createElement("input", {
                  type: "text",
                  className: "form-control",
                  id: "descricaoPagamento",
                  placeholder: "Digite uma descrição",
                  value: descricaoPagamento,
                  onChange: handleDescricaoPagamentoChange,
                  disabled: pixLoading,
                })
              ),
              valorPagamento &&
                categoriaPagamento &&
                React.createElement(
                  "div",
                  { className: "mb-3" },
                  React.createElement(
                    "div",
                    { className: "card bg-light" },
                    React.createElement(
                      "div",
                      { className: "card-body" },
                      React.createElement(
                        "h6",
                        { className: "card-title" },
                        "Resumo do Pagamento"
                      ),
                      React.createElement(
                        "p",
                        null,
                        "Valor do pagamento: R$ ",
                        parseFloat(valorPagamento).toFixed(2)
                      ),
                      React.createElement(
                        "p",
                        null,
                        "Taxa (3%): R$ ",
                        (parseFloat(valorPagamento) * 0.03).toFixed(2)
                      ),
                      React.createElement(
                        "p",
                        null,
                        "Total a pagar: R$ ",
                        (parseFloat(valorPagamento) * 1.03).toFixed(2)
                      ),
                      React.createElement(
                        "p",
                        null,
                        "Cashback estimado: ",
                        calcularCashback(valorPagamento, wbtcBrlPrice),
                        " WBTC (após aprovação)"
                      )
                    )
                  )
                )
            ),
            React.createElement(
              "div",
              { className: "modal-footer" },
              React.createElement(
                "button",
                {
                  type: "button",
                  className: "btn btn-secondary",
                  onClick: handleClosePixModal,
                  disabled: pixLoading,
                },
                "Cancelar"
              ),
              React.createElement(
                "button",
                {
                  type: "button",
                  className: "btn btn-warning",
                  onClick: handleProcessarPagamentoPix,
                  disabled:
                    pixLoading ||
                    !valorPagamento ||
                    !categoriaPagamento ||
                    !descricaoPagamento.trim() ||
                    parseFloat(valorPagamento) * 1.03 > userData.saldoReais,
                },
                pixLoading
                  ? React.createElement(
                      React.Fragment,
                      null,
                      React.createElement(
                        "span",
                        {
                          className: "spinner-border spinner-border-sm me-2",
                          role: "status",
                          "aria-hidden": "true",
                        }
                      ),
                      "Processando..."
                    )
                  : "Confirmar Pagamento"
              )
            )
          )
        ),
        React.createElement("div", {
          className: "modal-backdrop fade show",
          onClick: !pixLoading ? handleClosePixModal : null,
          style: { zIndex: -1 },
        })
      ),

    showDepositoModal &&
      React.createElement(
        "div",
        {
          className: "modal-backdrop",
          style: {
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
          },
        },
        React.createElement(
          "div",
          {
            className: "modal-content",
            style: {
              backgroundColor: "white",
              borderRadius: "10px",
              width: "90%",
              maxWidth: "500px",
              padding: "20px",
            },
          },
          React.createElement(
            "div",
            { className: "modal-header" },
            React.createElement(
              "h5",
              { className: "modal-title" },
              "Realizar Depósito"
            ),
            React.createElement("button", {
              type: "button",
              className: "btn-close",
              onClick: handleCloseDepositoModal,
              disabled: depositoLoading,
            })
          ),
          React.createElement(
            "div",
            { className: "modal-body" },
            depositoMensagem &&
              React.createElement(
                "div",
                {
                  className: `alert alert-${
                    depositoMensagem.tipo === "sucesso" ? "success" : "danger"
                  }`,
                },
                depositoMensagem.texto
              ),
            React.createElement(
              "div",
              { className: "alert alert-info mb-3" },
              React.createElement(
                "h6",
                { className: "alert-heading" },
                "Informações para depósito PIX"
              ),
              React.createElement(
                "p",
                { className: "mb-1" },
                React.createElement("strong", null, "Chave PIX (CPF): "),
                "01558516247"
              ),
              React.createElement(
                "p",
                { className: "mb-1" },
                React.createElement("strong", null, "Favorecido: "),
                "Josias Silva Monteiro"
              ),
              React.createElement("hr"),
              React.createElement(
                "small",
                null,
                "Faça o depósito PIX usando os dados acima e envie o comprovante para confirmar seu depósito."
              )
            ),
            React.createElement(
              "div",
              { className: "mb-3" },
              React.createElement(
                "label",
                { htmlFor: "valorDeposito", className: "form-label" },
                "Valor do Depósito (R$)"
              ),
              React.createElement("input", {
                type: "number",
                className: "form-control",
                id: "valorDeposito",
                placeholder: "Digite o valor",
                value: valorDeposito,
                onChange: handleValorDepositoChange,
                disabled: depositoLoading,
                min: "1",
                step: "0.01",
              })
            ),
            React.createElement(
              "div",
              { className: "mb-3" },
              React.createElement(
                "label",
                { htmlFor: "metodoDeposito", className: "form-label" },
                "Método de Pagamento"
              ),
              React.createElement(
                "select",
                {
                  className: "form-select",
                  id: "metodoDeposito",
                  value: metodoDeposito,
                  onChange: handleMetodoDepositoChange,
                  disabled: depositoLoading,
                },
                React.createElement(
                  "option",
                  { value: "" },
                  "Selecione um método"
                ),
                metodosPagamento.map((metodo) =>
                  React.createElement(
                    "option",
                    {
                      key: metodo.id,
                      value: metodo.id,
                      disabled: !metodo.disponivel,
                    },
                    metodo.nome,
                    " ",
                    metodo.taxa > 0 && metodo.id !== "pix"
                      ? `(Taxa: ${metodo.taxa}%)`
                      : "(Sem taxa)"
                  )
                )
              )
            ),
            React.createElement(
              "div",
              { className: "mb-3" },
              React.createElement(
                "label",
                { htmlFor: "comprovante", className: "form-label" },
                "Comprovante (Obrigatório)"
              ),
              React.createElement("input", {
                type: "file",
                className: "form-control",
                id: "comprovante",
                accept: "image/*,.pdf",
                onChange: handleComprovanteChange,
                disabled: depositoLoading,
                required: true,
              }),
              React.createElement(
                "small",
                { className: "text-muted" },
                "Para confirmar seu depósito, precisamos do comprovante da transação."
              )
            ),
            valorDeposito &&
              metodoDeposito &&
              React.createElement(
                "div",
                { className: "mb-3" },
                React.createElement(
                  "div",
                  { className: "card bg-light" },
                  React.createElement(
                    "div",
                    { className: "card-body" },
                    React.createElement(
                      "h6",
                      { className: "card-title" },
                      "Resumo do Depósito"
                    ),
                    React.createElement(
                      "p",
                      null,
                      "Valor do depósito: R$ ",
                      parseFloat(valorDeposito).toFixed(2)
                    ),
                    taxaDeposito > 0 &&
                      React.createElement(
                        "p",
                        null,
                        "Taxa: R$ ",
                        taxaDeposito.toFixed(2)
                      ),
                    React.createElement(
                      "p",
                      { className: "fw-bold" },
                      "Total a pagar: R$ ",
                      (parseFloat(valorDeposito) + taxaDeposito).toFixed(2)
                    )
                  )
                )
              )
          ),
          React.createElement(
            "div",
            { className: "modal-footer" },
            React.createElement(
              "button",
              {
                type: "button",
                className: "btn btn-secondary",
                onClick: handleCloseDepositoModal,
                disabled: depositoLoading,
              },
              "Cancelar"
            ),
            React.createElement(
              "button",
              {
                type: "button",
                className: "btn btn-warning",
                onClick: handleProcessarDeposito,
                disabled:
                  depositoLoading ||
                  !valorDeposito ||
                  !metodoDeposito ||
                  !comprovanteArquivo ||
                  metodoDeposito !== "pix",
              },
              depositoLoading
                ? React.createElement(
                    React.Fragment,
                    null,
                    React.createElement(
                      "span",
                      {
                        className: "spinner-border spinner-border-sm me-2",
                        role: "status",
                        "aria-hidden": "true",
                      }
                    ),
                    "Processando..."
                  )
                : "Confirmar Depósito"
            )
          )
        )
      ),

    showSellModal &&
      React.createElement(
        "div",
        {
          className: "modal fade show",
          style: { display: "block" },
          tabIndex: "-1",
        },
        React.createElement(
          "div",
          { className: "modal-dialog modal-dialog-centered" },
          React.createElement(
            "div",
            { className: "modal-content" },
            React.createElement(
              "div",
              { className: "modal-header" },
              React.createElement("h5", { className: "modal-title" }, "Vender WBTC"),
              React.createElement("button", {
                type: "button",
                className: "btn-close",
                onClick: handleCloseSellModal,
                disabled: sellLoading,
              })
            ),
            React.createElement(
              "div",
              { className: "modal-body" },
              sellMensagem &&
                React.createElement(
                  "div",
                  {
                    className: `alert alert-${
                      sellMensagem.tipo === "sucesso" ? "success" : "danger"
                    }`,
                  },
                  sellMensagem.texto
                ),
              React.createElement(
                "div",
                { className: "mb-3" },
                React.createElement(
                  "label",
                  { htmlFor: "valorVenda", className: "form-label" },
                  "Quantidade de WBTC a Vender"
                ),
                React.createElement("input", {
                  type: "number",
                  className: "form-control",
                  id: "valorVenda",
                  placeholder: "Digite a quantidade",
                  value: valorVenda,
                  onChange: handleValorVendaChange,
                  disabled: sellLoading,
                  min: "0.00000001",
                  step: "0.00000001",
                  autoFocus: true,
                }),
                React.createElement(
                  "small",
                  { className: "text-muted" },
                  "Saldo disponível: ",
                  (userData.wbtcBalance || 0).toFixed(8),
                  " WBTC"
                )
              ),
              valorVenda &&
                !isNaN(parseFloat(valorVenda)) &&
                wbtcBrlPrice &&
                React.createElement(
                  "div",
                  { className: "mb-3" },
                  React.createElement(
                    "div",
                    { className: "card bg-light" },
                    React.createElement(
                      "div",
                      { className: "card-body" },
                      React.createElement(
                        "h6",
                        { className: "card-title" },
                        "Resumo da Venda"
                      ),
                      React.createElement(
                        "p",
                        { className: "mb-1" },
                        "Quantidade: ",
                        parseFloat(valorVenda).toFixed(8),
                        " WBTC"
                      ),
                      React.createElement(
                        "p",
                        { className: "mb-1" },
                        "Valor a receber: R$ ",
                        (parseFloat(valorVenda) * wbtcBrlPrice).toFixed(2)
                      ),
                      React.createElement(
                        "p",
                        { className: "mt-2 text-success" },
                        React.createElement(
                          "small",
                          null,
                          "+ 1 ponto será adicionado à sua conta"
                        )
                      )
                    )
                  )
                )
            ),
            React.createElement(
              "div",
              { className: "modal-footer" },
              React.createElement(
                "button",
                {
                  type: "button",
                  className: "btn btn-secondary",
                  onClick: handleCloseSellModal,
                  disabled: sellLoading,
                },
                "Cancelar"
              ),
              React.createElement(
                "button",
                {
                  type: "button",
                  className: "btn btn-warning",
                  onClick: handleProcessarVenda,
                  disabled:
                    sellLoading ||
                    !valorVenda ||
                    isNaN(parseFloat(valorVenda)) ||
                    parseFloat(valorVenda) <= 0 ||
                    parseFloat(valorVenda) > (userData.wbtcBalance || 0),
                },
                sellLoading
                  ? React.createElement(
                      React.Fragment,
                      null,
                      React.createElement(
                        "span",
                        {
                          className: "spinner-border spinner-border-sm me-2",
                          role: "status",
                          "aria-hidden": "true",
                        }
                      ),
                      "Processando..."
                    )
                  : "Confirmar Venda"
              )
            )
          )
        ),
        React.createElement("div", {
          className: "modal-backdrop fade show",
          onClick: !sellLoading ? handleCloseSellModal : null,
          style: { zIndex: -1 },
        })
      )
  );
}

export default Page_user;