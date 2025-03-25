import jsPDF from "jspdf";
import "jspdf-autotable";

const useStatementExport = () => {
  const exportFullStatement = (userData) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Extrato Completo", 14, 22);
    doc.setFontSize(12);
    doc.text(`Usuário: ${userData.name}`, 14, 32);
    doc.text(`Data: ${new Date().toLocaleDateString("pt-BR")}`, 14, 40);
    doc.text(`Saldo em Reais: R$ ${(userData.saldoReais || 0).toFixed(2)}`, 14, 48);
    doc.text(`Saldo em WBTC: ${(userData.bitcoinBalance || 0).toFixed(8)}`, 14, 56);
    doc.text(`Pontos: ${userData.pontos || 0}`, 14, 64);

    const tableData = (userData.paymentHistory || []).map((item) => [
      item.description,
      `R$ ${item.amount.toFixed(2)}`,
      new Date(item.date).toLocaleDateString("pt-BR"),
      `${(item.cashback || 0).toFixed(8)} WBTC`,
      item.status,
    ]);

    doc.autoTable({
      head: [["Descrição", "Valor", "Data", "Cashback", "Status"]],
      body: tableData,
      startY: 70,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [42, 82, 152] },
    });

    doc.save(`extrato_completo_${userData.name.split(" ")[0]}_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  const exportCustomStatement = (userData, startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) throw new Error("Data final deve ser posterior à inicial");

    const filteredHistory = (userData.paymentHistory || []).filter((item) => {
      const itemDate = new Date(item.date);
      return itemDate >= start && itemDate <= end;
    });

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Extrato Personalizado", 14, 22);
    doc.setFontSize(12);
    doc.text(`Usuário: ${userData.name}`, 14, 32);
    doc.text(`Período: ${start.toLocaleDateString("pt-BR")} a ${end.toLocaleDateString("pt-BR")}`, 14, 40);
    doc.text(`Saldo em Reais: R$ ${(userData.saldoReais || 0).toFixed(2)}`, 14, 48);
    doc.text(`Saldo em WBTC: ${(userData.bitcoinBalance || 0).toFixed(8)}`, 14, 56);
    doc.text(`Pontos: ${userData.pontos || 0}`, 14, 64);

    const tableData = filteredHistory.map((item) => [
      item.description,
      `R$ ${item.amount.toFixed(2)}`,
      new Date(item.date).toLocaleDateString("pt-BR"),
      `${(item.cashback || 0).toFixed(8)} WBTC`,
      item.status,
    ]);

    doc.autoTable({
      head: [["Descrição", "Valor", "Data", "Cashback", "Status"]],
      body: tableData,
      startY: 70,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [42, 82, 152] },
    });

    doc.save(`extrato_${userData.name.split(" ")[0]}_${startDate}_a_${endDate}.pdf`);
  };

  const exportTransaction = (userData, transaction) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Detalhes da Transação", 14, 22);
    doc.setFontSize(12);
    doc.text(`Usuário: ${userData.name}`, 14, 32);
    doc.text(`Data da Transação: ${new Date(transaction.date).toLocaleDateString("pt-BR")}`, 14, 40);
    doc.text(`Descrição: ${transaction.description}`, 14, 48);
    doc.text(`Valor: R$ ${transaction.amount.toFixed(2)}`, 14, 56);
    doc.text(`Cashback: ${(transaction.cashback || 0).toFixed(8)} WBTC`, 14, 64);
    doc.text(`Taxa: R$ ${(transaction.taxa || 0).toFixed(2)}`, 14, 72);
    doc.text(`Status: ${transaction.status}`, 14, 80);
    doc.text(`Tipo: ${transaction.tipo}`, 14, 88);

    doc.save(`transacao_${transaction.id || transaction._id}_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  return { exportFullStatement, exportCustomStatement, exportTransaction };
};

export default useStatementExport;