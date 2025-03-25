import React, { useState } from "react";
import api from "../services/api";

function Loans({ currentUser, saldoReais, investmentData, updateUserData }) {
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [loanAmount, setLoanAmount] = useState("");
  const [loanLoading, setLoanLoading] = useState(false);
  const [loanMessage, setLoanMessage] = useState(null);

  const handleLoanRequest = () => {
    setLoanAmount("");
    setLoanMessage(null);
    setLoanLoading(false);
    setShowLoanModal(true);
  };

  const handleCloseLoanModal = () => setShowLoanModal(false);

  const handleLoanAmountChange = (e) => setLoanAmount(e.target.value);

  const handleProcessarEmprestimo = async () => {
    setLoanLoading(true);
    setLoanMessage(null);

    try {
      const amount = parseFloat(loanAmount);
      if (!amount || amount <= 0) {
        throw new Error("Por favor, informe um valor válido para o empréstimo.");
      }
      const maxLoanAmount = investmentData.amount * 0.85;
      if (amount > maxLoanAmount) {
        throw new Error(`O valor máximo de empréstimo é R$ ${maxLoanAmount.toFixed(2)}.`);
      }

      const response = await api.post("/loans", { amount });
      const { loan, saldoReais: updatedSaldoReais } = response.data;

      const novoEmprestimo = {
        _id: loan._id,
        description: `Empréstimo de R$ ${loan.amount.toFixed(2)}`,
        amount: loan.totalToRepay,
        date: new Date(),
        cashback: 0,
        status: "Ativo",
        tipo: "emprestimo",
      };

      updateUserData({
        saldoReais: updatedSaldoReais,
        paymentHistory: [novoEmprestimo, ...(currentUser.paymentHistory || [])],
      });

      setLoanMessage({
        tipo: "sucesso",
        texto: `Empréstimo de R$ ${loan.amount.toFixed(2)} solicitado com sucesso! Total a pagar: R$ ${loan.totalToRepay.toFixed(2)} em 1 mês.`,
      });

      setTimeout(() => setShowLoanModal(false), 3000);
    } catch (error) {
      console.error("[Loans] Erro ao solicitar empréstimo:", error);
      setLoanMessage({
        tipo: "erro",
        texto: error.response?.data?.error || error.message || "Erro ao processar o empréstimo.",
      });
    } finally {
      setLoanLoading(false);
    }
  };

  return (
    <>
      <button className="btn btn-warning flex-grow-1" onClick={handleLoanRequest}>
        Solicitar Empréstimo
      </button>

      {showLoanModal && (
        <div className="modal fade show" style={{ display: "block" }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Solicitar Empréstimo</h5>
                <button type="button" className="btn-close" onClick={handleCloseLoanModal} disabled={loanLoading}></button>
              </div>
              <div className="modal-body">
                {loanMessage && (
                  <div className={`alert alert-${loanMessage.tipo === "sucesso" ? "success" : "danger"}`}>
                    {loanMessage.texto}
                  </div>
                )}
                <p>
                  <strong>Valor máximo disponível:</strong> R$ {(investmentData.amount * 0.85).toFixed(2)} (85% do seu investimento)
                </p>
                <p>
                  <small>Juros: 5% ao mês. O pagamento deve ser feito em até 30 dias.</small>
                </p>
                <div className="mb-3">
                  <label htmlFor="loanAmount" className="form-label">Valor do Empréstimo (R$)</label>
                  <input
                    type="number"
                    className="form-control"
                    id="loanAmount"
                    placeholder="Digite o valor"
                    value={loanAmount}
                    onChange={handleLoanAmountChange}
                    disabled={loanLoading}
                    min="1"
                    step="0.01"
                    autoFocus
                  />
                </div>
                {loanAmount && !isNaN(parseFloat(loanAmount)) && (
                  <div className="mb-3">
                    <div className="card bg-light">
                      <div className="card-body">
                        <h6 className="card-title">Resumo do Empréstimo</h6>
                        <p className="mb-1">Valor solicitado: R$ {parseFloat(loanAmount).toFixed(2)}</p>
                        <p className="mb-1">Juros (5%): R$ {(parseFloat(loanAmount) * 0.05).toFixed(2)}</p>
                        <p className="fw-bold">Total a pagar em 1 mês: R$ {(parseFloat(loanAmount) * 1.05).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseLoanModal} disabled={loanLoading}>Cancelar</button>
                <button
                  type="button"
                  className="btn btn-warning"
                  onClick={handleProcessarEmprestimo}
                  disabled={
                    loanLoading ||
                    !loanAmount ||
                    isNaN(parseFloat(loanAmount)) ||
                    parseFloat(loanAmount) <= 0 ||
                    parseFloat(loanAmount) > investmentData.amount * 0.85
                  }
                >
                  {loanLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Processando...
                    </>
                  ) : (
                    "Solicitar Empréstimo"
                  )}
                </button>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show" onClick={!loanLoading ? handleCloseLoanModal : null} style={{ zIndex: -1 }}></div>
        </div>
      )}
    </>
  );
}

export default Loans;