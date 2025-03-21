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
        paymentHistory: [novoEmprestimo, ...currentUser.paymentHistory],
      });

      setLoanMessage({
        tipo: "sucesso",
        texto: `Empréstimo de R$ ${loan.amount.toFixed(2)} solicitado com sucesso! Total a pagar: R$ ${loan.totalToRepay.toFixed(2)} em 1 mês.`,
      });

      setTimeout(() => setShowLoanModal(false), 3000);
    } catch (error) {
      console.error("Erro ao solicitar empréstimo:", error);
      setLoanMessage({
        tipo: "erro",
        texto:
          error.response?.data?.error ||
          error.message ||
          "Erro ao processar o empréstimo. Tente novamente.",
      });
    } finally {
      setLoanLoading(false);
    }
  };

  return React.createElement(
    React.Fragment,
    null,
    React.createElement(
      "button",
      {
        className: "btn btn-warning flex-grow-1",
        onClick: handleLoanRequest,
      },
      "Solicitar Empréstimo"
    ),

    showLoanModal &&
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
              React.createElement("h5", { className: "modal-title" }, "Solicitar Empréstimo"),
              React.createElement("button", {
                type: "button",
                className: "btn-close",
                onClick: handleCloseLoanModal,
                disabled: loanLoading,
              })
            ),
            React.createElement(
              "div",
              { className: "modal-body" },
              loanMessage &&
                React.createElement(
                  "div",
                  {
                    className: `alert alert-${
                      loanMessage.tipo === "sucesso" ? "success" : "danger"
                    }`,
                  },
                  loanMessage.texto
                ),
              React.createElement(
                "p",
                null,
                React.createElement("strong", null, "Valor máximo disponível:"),
                " R$ ",
                (investmentData.amount * 0.85).toFixed(2),
                " (85% do seu investimento)"
              ),
              React.createElement(
                "p",
                null,
                React.createElement(
                  "small",
                  null,
                  "Juros: 5% ao mês. O pagamento deve ser feito em até 30 dias."
                )
              ),
              React.createElement(
                "div",
                { className: "mb-3" },
                React.createElement(
                  "label",
                  { htmlFor: "loanAmount", className: "form-label" },
                  "Valor do Empréstimo (R$)"
                ),
                React.createElement("input", {
                  type: "number",
                  className: "form-control",
                  id: "loanAmount",
                  placeholder: "Digite o valor",
                  value: loanAmount,
                  onChange: handleLoanAmountChange,
                  disabled: loanLoading,
                  min: "1",
                  step: "0.01",
                  autoFocus: true,
                })
              ),
              loanAmount &&
                !isNaN(parseFloat(loanAmount)) &&
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
                        "Resumo do Empréstimo"
                      ),
                      React.createElement(
                        "p",
                        { className: "mb-1" },
                        "Valor solicitado: R$ ",
                        parseFloat(loanAmount).toFixed(2)
                      ),
                      React.createElement(
                        "p",
                        { className: "mb-1" },
                        "Juros (5%): R$ ",
                        (parseFloat(loanAmount) * 0.05).toFixed(2)
                      ),
                      React.createElement(
                        "p",
                        { className: "fw-bold" },
                        "Total a pagar em 1 mês: R$ ",
                        (parseFloat(loanAmount) * 1.05).toFixed(2)
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
                  onClick: handleCloseLoanModal,
                  disabled: loanLoading,
                },
                "Cancelar"
              ),
              React.createElement(
                "button",
                {
                  type: "button",
                  className: "btn btn-warning",
                  onClick: handleProcessarEmprestimo,
                  disabled:
                    loanLoading ||
                    !loanAmount ||
                    isNaN(parseFloat(loanAmount)) ||
                    parseFloat(loanAmount) <= 0 ||
                    parseFloat(loanAmount) > investmentData.amount * 0.85,
                },
                loanLoading
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
                  : "Solicitar Empréstimo"
              )
            )
          )
        ),
        React.createElement("div", {
          className: "modal-backdrop fade show",
          onClick: !loanLoading ? handleCloseLoanModal : null,
          style: { zIndex: -1 },
        })
      )
  );
}

export default Loans;