import React, { useState, useEffect } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { Download, Clipboard, ChevronLeft, ChevronRight } from "react-bootstrap-icons";

function Page_admin({ currentUser }) {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [deposits, setDeposits] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loans, setLoans] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("users");
  const [searchTerm, setSearchTerm] = useState("");
  const [showRejectedDeposits, setShowRejectedDeposits] = useState(false);
  const [showRejectedPayments, setShowRejectedPayments] = useState(false);
  const [showRejectedLoans, setShowRejectedLoans] = useState(false);

  // Estados para paginação
  const [usersPage, setUsersPage] = useState(1);
  const [depositsPage, setDepositsPage] = useState(1);
  const [paymentsPage, setPaymentsPage] = useState(1);
  const [transactionsPage, setTransactionsPage] = useState(1);
  const [loansPage, setLoansPage] = useState(1);
  const [investmentsPage, setInvestmentsPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    if (!currentUser || !currentUser.isAdmin) {
      navigate("/auth", { replace: true });
      return;
    }

    const fetchAdminData = async () => {
      try {
        const [usersRes, depositsRes, paymentsRes, transactionsRes, loansRes, investmentsRes] = await Promise.all([
          api.get("/admin/users"),
          api.get("/admin/deposits"),
          api.get("/admin/payments"),
          api.get("/admin/transactions"),
          api.get("/admin/loans"),
          api.get("/admin/investments"),
        ]);

        setUsers(usersRes.data.sort((a, b) => b._id.localeCompare(a._id)));
        setDeposits(depositsRes.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        setPayments(paymentsRes.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        setTransactions(transactionsRes.data.sort((a, b) => new Date(b.date) - new Date(a.date)));
        setLoans(loansRes.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        setInvestments(investmentsRes.data.sort((a, b) => new Date(b.initialDate) - new Date(a.initialDate)));
      } catch (error) {
        console.error("Erro ao carregar dados administrativos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [currentUser, navigate]);

  // Funções de manipulação de dados
  const handleUpdateUser = async (userId, updatedData) => {
    try {
      const response = await api.put(`/admin/users/${userId}`, updatedData);
      setUsers(users.map((u) => (u._id === userId ? response.data : u)));
      alert("Usuário atualizado com sucesso!");
    } catch (error) {
      alert("Erro ao atualizar usuário.");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Tem certeza que deseja deletar este usuário?")) {
      try {
        await api.delete(`/admin/users/${userId}`);
        setUsers(users.filter((u) => u._id !== userId));
        alert("Usuário deletado com sucesso!");
      } catch (error) {
        alert("Erro ao deletar usuário.");
      }
    }
  };

  const handleUpdateDeposit = async (depositId, status) => {
    try {
      const response = await api.put(`/admin/deposits/${depositId}`, { status });
      setDeposits(deposits.map((d) => (d._id === depositId ? response.data : d)));
      alert(`Depósito atualizado com sucesso para "${status}"!`);
      if (status === "Concluído") {
        const usersRes = await api.get("/admin/users");
        setUsers(usersRes.data.sort((a, b) => b._id.localeCompare(a._id)));
      }
    } catch (error) {
      console.error("Erro ao atualizar depósito:", error);
      alert(`Erro ao atualizar depósito: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleUpdatePayment = async (paymentId, status) => {
    try {
      const response = await api.put(`/admin/payments/${paymentId}`, { status });
      setPayments(payments.map((p) => (p._id === paymentId ? response.data : p)));
      alert(`Pagamento atualizado com sucesso para "${status}"!`);
      if (status === "Concluído") {
        const usersRes = await api.get("/admin/users");
        setUsers(usersRes.data.sort((a, b) => b._id.localeCompare(a._id)));
      }
    } catch (error) {
      console.error("Erro ao atualizar pagamento:", error);
      alert(`Erro ao atualizar pagamento: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleDownloadComprovante = async (depositId) => {
    try {
      const response = await api.get(`/admin/deposits/${depositId}/comprovante`);
      const fileUrl = `${api.defaults.baseURL}/uploads/${response.data.fileName}`;
      window.open(fileUrl, "_blank");
    } catch (error) {
      console.error("Erro ao baixar comprovante:", error);
      alert("Erro ao baixar comprovante. O arquivo pode não existir ou foi removido.");
    }
  };

  const handleUpdateTransaction = async (transactionId, updatedData) => {
    try {
      const response = await api.put(`/admin/transactions/${transactionId}`, updatedData);
      setTransactions(transactions.map((t) => (t._id === transactionId ? response.data : t)));
      alert("Transação atualizada com sucesso!");
    } catch (error) {
      alert("Erro ao atualizar transação.");
    }
  };

  const handleDeleteTransaction = async (transactionId) => {
    if (window.confirm("Tem certeza que deseja deletar esta transação?")) {
      try {
        await api.delete(`/admin/transactions/${transactionId}`);
        setTransactions(transactions.filter((t) => t._id !== transactionId));
        alert("Transação deletada com sucesso!");
      } catch (error) {
        alert("Erro ao deletar transação.");
      }
    }
  };

  const handleUpdateLoan = async (loanId, status) => {
    try {
      const response = await api.put(`/admin/loans/${loanId}`, { status });
      setLoans(loans.map((l) => (l._id === loanId ? response.data : l)));
      alert(`Empréstimo atualizado com sucesso para "${status}"!`);
    } catch (error) {
      console.error("Erro ao atualizar empréstimo:", error);
      alert(`Erro ao atualizar empréstimo: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleReleaseFunds = async (userId) => {
    if (window.confirm("Tem certeza que deseja liberar os fundos investidos deste usuário?")) {
      try {
        const response = await api.put(`/admin/investments/release/${userId}`);
        setInvestments(investments.map((inv) =>
          inv.userId._id === userId ? { ...inv, initialDate: response.data.investment.initialDate } : inv
        ));
        alert("Fundos liberados com sucesso! O usuário pode resgatar imediatamente.");
      } catch (error) {
        console.error("Erro ao liberar fundos:", error);
        alert("Erro ao liberar fundos: " + (error.response?.data?.error || error.message));
      }
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => alert("Chave PIX copiada para a área de transferência!"))
      .catch((err) => {
        console.error("Erro ao copiar texto:", err);
        alert("Não foi possível copiar a chave PIX");
      });
  };

  // Funções de paginação
  const getPaginatedItems = (items, page) => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return items.slice(startIndex, endIndex);
  };

  const renderPagination = (totalItems, currentPage, setPage) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
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
          <button className="page-link" onClick={() => setPage(i)}>
            {i}
          </button>
        </li>
      );
    }

    return (
      <nav aria-label="Paginação">
        <ul className="pagination justify-content-center mt-3">
          <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
            <button className="page-link" onClick={() => setPage(currentPage - 1)}>
              <ChevronLeft />
            </button>
          </li>
          {pageNumbers}
          <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
            <button className="page-link" onClick={() => setPage(currentPage + 1)}>
              <ChevronRight />
            </button>
          </li>
        </ul>
      </nav>
    );
  };

  // Filtragem de dados
  const filteredUsers = users.filter((user) =>
    (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     user.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  const filteredDeposits = deposits.filter((deposit) =>
    showRejectedDeposits || deposit.status !== "Rejeitado"
  );
  const filteredPayments = payments.filter((payment) =>
    showRejectedPayments || payment.status !== "Rejeitado"
  );
  const filteredLoans = loans.filter((loan) =>
    showRejectedLoans || loan.status !== "repaid"
  );

  if (loading) return <div className="container text-center"><h3>Carregando...</h3></div>;

  return (
    <div className="container my-4">
      <h1 className="mb-4">Painel Administrativo</h1>

      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button className={`nav-link ${activeTab === "users" ? "active" : ""}`} onClick={() => setActiveTab("users")}>
            Usuários
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === "deposits" ? "active" : ""}`} onClick={() => setActiveTab("deposits")}>
            Depósitos
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === "payments" ? "active" : ""}`} onClick={() => setActiveTab("payments")}>
            Pagamentos
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === "transactions" ? "active" : ""}`} onClick={() => setActiveTab("transactions")}>
            Transações
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === "loans" ? "active" : ""}`} onClick={() => setActiveTab("loans")}>
            Empréstimos
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === "investments" ? "active" : ""}`} onClick={() => setActiveTab("investments")}>
            Investimentos
          </button>
        </li>
      </ul>

      {activeTab === "users" && (
        <div className="card">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="card-title mb-0">Usuários</h5>
              <input
                type="text"
                className="form-control w-25"
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Email</th>
                    <th>Saldo (R$)</th>
                    <th>WBTC</th>
                    <th>Pontos</th>
                    <th>Admin</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {getPaginatedItems(filteredUsers, usersPage).map((user) => (
                    <tr key={user._id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.saldoReais.toFixed(2)}</td>
                      <td>{user.wbtcBalance.toFixed(8)}</td>
                      <td>{user.pontos}</td>
                      <td>{user.isAdmin ? "Sim" : "Não"}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-primary me-2"
                          onClick={() =>
                            handleUpdateUser(user._id, {
                              saldoReais: prompt("Novo saldo em reais:", user.saldoReais),
                              wbtcBalance: prompt("Novo saldo WBTC:", user.wbtcBalance),
                              pontos: prompt("Novos pontos:", user.pontos),
                              isAdmin: confirm("Tornar administrador?"),
                            })
                          }
                        >
                          Editar
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDeleteUser(user._id)}
                        >
                          Deletar
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan="7" className="text-center">
                        Nenhum usuário encontrado
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {filteredUsers.length > itemsPerPage && renderPagination(filteredUsers.length, usersPage, setUsersPage)}
          </div>
        </div>
      )}

      {activeTab === "deposits" && (
        <div className="card">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="card-title mb-0">Depósitos</h5>
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="showRejectedDepositsToggle"
                  checked={showRejectedDeposits}
                  onChange={() => setShowRejectedDeposits(!showRejectedDeposits)}
                />
                <label className="form-check-label" htmlFor="showRejectedDepositsToggle">
                  Mostrar Rejeitados
                </label>
              </div>
            </div>
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Usuário</th>
                    <th>Valor (R$)</th>
                    <th>Método</th>
                    <th>Status</th>
                    <th>Data</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {getPaginatedItems(filteredDeposits, depositsPage).map((deposit) => (
                    <tr key={deposit._id}>
                      <td>{deposit.userId?.name || "Usuário não encontrado"}</td>
                      <td>{deposit.valor.toFixed(2)}</td>
                      <td>{deposit.metodoNome}</td>
                      <td>
                        <span
                          className={`badge ${
                            deposit.status === "Concluído"
                              ? "bg-success"
                              : deposit.status === "Rejeitado"
                              ? "bg-danger"
                              : "bg-warning"
                          }`}
                        >
                          {deposit.status}
                        </span>
                      </td>
                      <td>{new Date(deposit.createdAt).toLocaleDateString("pt-BR")}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-success me-2"
                          onClick={() => handleUpdateDeposit(deposit._id, "Concluído")}
                          disabled={deposit.status === "Concluído"}
                        >
                          Aprovar
                        </button>
                        <button
                          className="btn btn-sm btn-danger me-2"
                          onClick={() => handleUpdateDeposit(deposit._id, "Rejeitado")}
                          disabled={deposit.status === "Rejeitado"}
                        >
                          Rejeitar
                        </button>
                        <button
                          className="btn btn-sm btn-info"
                          onClick={() => handleDownloadComprovante(deposit._id)}
                          title="Baixar comprovante"
                        >
                          <Download />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredDeposits.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center">
                        Nenhum depósito encontrado
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {filteredDeposits.length > itemsPerPage && renderPagination(filteredDeposits.length, depositsPage, setDepositsPage)}
          </div>
        </div>
      )}

      {activeTab === "payments" && (
        <div className="card">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="card-title mb-0">Pagamentos</h5>
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="showRejectedPaymentsToggle"
                  checked={showRejectedPayments}
                  onChange={() => setShowRejectedPayments(!showRejectedPayments)}
                />
                <label className="form-check-label" htmlFor="showRejectedPaymentsToggle">
                  Mostrar Rejeitados
                </label>
              </div>
            </div>
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Usuário</th>
                    <th>Descrição</th>
                    <th>Valor (R$)</th>
                    <th>Taxa (R$)</th>
                    <th>Chave PIX</th>
                    <th>Status</th>
                    <th>Data</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {getPaginatedItems(filteredPayments, paymentsPage).map((payment) => (
                    <tr key={payment._id}>
                      <td>{payment.userId?.name || "Usuário não encontrado"}</td>
                      <td>{payment.descricaoPagamento}</td>
                      <td>{payment.valorPagamento.toFixed(2)}</td>
                      <td>{payment.taxa.toFixed(2)}</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <small
                            className="text-muted me-2"
                            style={{
                              fontSize: "0.75rem",
                              wordBreak: "break-all",
                              maxWidth: "200px",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {payment.pixKey || "N/A"}
                          </small>
                          {payment.pixKey && (
                            <button
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => copyToClipboard(payment.pixKey)}
                              title="Copiar chave PIX"
                            >
                              <Clipboard />
                            </button>
                          )}
                        </div>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            payment.status === "Concluído"
                              ? "bg-success"
                              : payment.status === "Rejeitado"
                              ? "bg-danger"
                              : "bg-warning"
                          }`}
                        >
                          {payment.status}
                        </span>
                      </td>
                      <td>{new Date(payment.createdAt).toLocaleDateString("pt-BR")}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-success me-2"
                          onClick={() => handleUpdatePayment(payment._id, "Concluído")}
                          disabled={payment.status === "Concluído"}
                        >
                          Aprovar
                        </button>
                        <button
                          className="btn btn-sm btn-danger me-2"
                          onClick={() => handleUpdatePayment(payment._id, "Rejeitado")}
                          disabled={payment.status === "Rejeitado"}
                        >
                          Rejeitar
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredPayments.length === 0 && (
                    <tr>
                      <td colSpan="8" className="text-center">
                        Nenhum pagamento encontrado
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {filteredPayments.length > itemsPerPage && renderPagination(filteredPayments.length, paymentsPage, setPaymentsPage)}
          </div>
        </div>
      )}

      {activeTab === "transactions" && (
        <div className="card">
          <div className="card-body">
            <h5 className="card-title">Transações</h5>
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Usuário</th>
                    <th>Descrição</th>
                    <th>Valor (R$)</th>
                    <th>Taxa</th>
                    <th>Status</th>
                    <th>Data</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {getPaginatedItems(transactions, transactionsPage).map((transaction) => (
                    <tr key={transaction._id}>
                      <td>{transaction.user?.name}</td>
                      <td>{transaction.description}</td>
                      <td>{transaction.amount.toFixed(2)}</td>
                      <td>{transaction.taxa.toFixed(2)}</td>
                      <td>{transaction.status}</td>
                      <td>{new Date(transaction.date).toLocaleDateString("pt-BR")}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-primary me-2"
                          onClick={() =>
                            handleUpdateTransaction(transaction._id, {
                              status: prompt("Novo status:", transaction.status),
                              amount: prompt("Novo valor:", transaction.amount),
                              taxa: prompt("Nova taxa:", transaction.taxa),
                            })
                          }
                        >
                          Editar
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDeleteTransaction(transaction._id)}
                        >
                          Deletar
                        </button>
                      </td>
                    </tr>
                  ))}
                  {transactions.length === 0 && (
                    <tr>
                      <td colSpan="7" className="text-center">
                        Nenhuma transação encontrada
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {transactions.length > itemsPerPage && renderPagination(transactions.length, transactionsPage, setTransactionsPage)}
          </div>
        </div>
      )}

      {activeTab === "loans" && (
        <div className="card">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="card-title mb-0">Empréstimos</h5>
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="showRejectedLoansToggle"
                  checked={showRejectedLoans}
                  onChange={() => setShowRejectedLoans(!showRejectedLoans)}
                />
                <label className="form-check-label" htmlFor="showRejectedLoansToggle">
                  Mostrar Pagos
                </label>
              </div>
            </div>
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Usuário</th>
                    <th>Valor (R$)</th>
                    <th>Total a Pagar (R$)</th>
                    <th>Data de Vencimento</th>
                    <th>Status</th>
                    <th>Data de Criação</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {getPaginatedItems(filteredLoans, loansPage).map((loan) => (
                    <tr key={loan._id}>
                      <td>{loan.userId?.name || "Usuário não encontrado"}</td>
                      <td>{loan.amount.toFixed(2)}</td>
                      <td>{loan.totalToRepay.toFixed(2)}</td>
                      <td>{new Date(loan.dueDate).toLocaleDateString("pt-BR")}</td>
                      <td>
                        <span
                          className={`badge ${
                            loan.status === "active"
                              ? "bg-warning"
                              : loan.status === "repaid"
                              ? "bg-success"
                              : "bg-danger"
                          }`}
                        >
                          {loan.status === "active" ? "Ativo" : loan.status === "repaid" ? "Pago" : "Vencido"}
                        </span>
                      </td>
                      <td>
                        {loan.createdAt ? new Date(loan.createdAt).toLocaleDateString("pt-BR") : "Data não disponível"}
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => alert(`Detalhes do empréstimo:\nID: ${loan._id}\nUsuário: ${loan.userId?.name}\nValor: R$${loan.amount.toFixed(2)}\nTotal a Pagar: R$${loan.totalToRepay.toFixed(2)}`)}
                        >
                          Detalhes
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredLoans.length === 0 && (
                    <tr>
                      <td colSpan="7" className="text-center">
                        Nenhum empréstimo encontrado
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {filteredLoans.length > itemsPerPage && renderPagination(filteredLoans.length, loansPage, setLoansPage)}
          </div>
        </div>
      )}

      {activeTab === "investments" && (
        <div className="card">
          <div className="card-body">
            <h5 className="card-title">Investimentos</h5>
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Usuário</th>
                    <th>Valor (R$)</th>
                    <th>Data Inicial</th>
                    <th>Última Adição</th>
                    <th>Lucro Estimado (15%)</th>
                    <th>Pode Resgatar?</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {getPaginatedItems(investments, investmentsPage).map((investment) => {
                    const oneYearLater = new Date(investment.initialDate);
                    oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
                    const canWithdraw = new Date() >= oneYearLater;
                    const profit = investment.amount * 0.15;

                    return (
                      <tr key={investment._id}>
                        <td>{investment.userId?.name || "Usuário não encontrado"}</td>
                        <td>{investment.amount.toFixed(2)}</td>
                        <td>{new Date(investment.initialDate).toLocaleDateString("pt-BR")}</td>
                        <td>{new Date(investment.lastAddedDate).toLocaleDateString("pt-BR")}</td>
                        <td>{profit.toFixed(2)}</td>
                        <td>
                          <span className={`badge ${canWithdraw ? "bg-success" : "bg-warning"}`}>
                            {canWithdraw ? "Sim" : "Não"}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() => handleReleaseFunds(investment.userId._id)}
                            disabled={canWithdraw}
                          >
                            Liberar Fundos
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {investments.length === 0 && (
                    <tr>
                      <td colSpan="7" className="text-center">
                        Nenhum investimento encontrado
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {investments.length > itemsPerPage && renderPagination(investments.length, investmentsPage, setInvestmentsPage)}
          </div>
        </div>
      )}
    </div>
  );
}

export default Page_admin;