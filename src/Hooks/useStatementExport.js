import { useCallback } from 'react';
import { jsPDF } from 'jspdf';

// Endereços que estavam sendo usados para o fetchWalletData
const walletAddress = "0x1c580b494ea23661feec1738bfd8e38adc264775";
const wbtcContractAddress = "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f"; // WBTC na Arbitrum One
const apiKey = "Z5SJNYF55WMFBDXC5VXMXQTZBDKTH47VBR";

// Função independente para buscar dados da carteira
export const fetchWalletData = async (callback, setWalletLoading) => {
  setWalletLoading(true);
  try {
    const wbtcResponse = await axios.get(
      `https://api.arbiscan.io/api?module=account&action=tokenbalance&contractaddress=${wbtcContractAddress}&address=${walletAddress}&tag=latest&apikey=${apiKey}`
    );

    let wbtcBalance = 0;
    if (wbtcResponse.data.status === "1") {
      wbtcBalance = parseFloat(wbtcResponse.data.result) / 1e8; // Converte de wei para WBTC (8 decimais)
    } else {
      console.error("Erro na resposta da API da Arbiscan:", wbtcResponse.data.message);
    }

    // Chama o callback com os dados obtidos
    callback({ wbtcBalance });
  } catch (error) {
    console.error("Erro ao buscar dados:", error.message);
    callback({ wbtcBalance: 0 }); // Retorna 0 em caso de erro
  } finally {
    setWalletLoading(false);
  }
};

// Exportação do endereço da carteira
export { walletAddress };

// Hook para exportação de extratos
function useStatementExport() {
  // Usando useCallback para memorizar as funções
  const exportFullStatement = useCallback((userData) => {
    console.log("Exportando extrato completo para", userData.name);

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 10;
    let yPosition = margin;

    // Título
    doc.setFontSize(16);
    doc.text(`Extrato Completo - ${userData.name}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;

    // Informações do usuário
    doc.setFontSize(12);
    doc.text(`Email: ${userData.email}`, margin, yPosition);
    yPosition += 6;
    doc.text(`Saldo em Reais: R$ ${userData.saldoReais.toFixed(2)}`, margin, yPosition);
    yPosition += 6;
    doc.text(`Saldo em WBTC: ${userData.wbtcBalance.toFixed(8)} WBTC`, margin, yPosition);
    yPosition += 6;
    doc.text(`Pontos: ${userData.pontos}`, margin, yPosition);
    yPosition += 10;

    // Histórico de transações
    doc.setFontSize(14);
    doc.text("Histórico de Pagamentos", margin, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    const headers = ["Descrição", "Valor (R$)", "Data", "Cashback (WBTC)", "Status"];
    const columnWidths = [60, 30, 30, 40, 20];
    let xPosition = margin;

    // Cabeçalhos
    headers.forEach((header, index) => {
      doc.text(header, xPosition, yPosition);
      xPosition += columnWidths[index];
    });
    yPosition += 6;
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 6;

    // Dados
    userData.paymentHistory.forEach((payment) => {
      if (yPosition > 270) { // Adiciona nova página se necessário
        doc.addPage();
        yPosition = margin;
      }
      xPosition = margin;
      doc.text(payment.description.substring(0, 30), xPosition, yPosition); // Limita descrição
      xPosition += columnWidths[0];
      doc.text(payment.amount.toFixed(2), xPosition, yPosition);
      xPosition += columnWidths[1];
      doc.text(new Date(payment.date).toLocaleDateString("pt-BR"), xPosition, yPosition);
      xPosition += columnWidths[2];
      doc.text((payment.cashback || 0).toFixed(8), xPosition, yPosition);
      xPosition += columnWidths[3];
      doc.text(payment.status, xPosition, yPosition);
      yPosition += 6;
    });

    // Salva o PDF
    doc.save(`extrato_completo_${userData.name.split(" ")[0]}_${new Date().toISOString().split("T")[0]}.pdf`);
  }, []);

  const exportCustomStatement = useCallback((userData, startDate, endDate) => {
    console.log(`Exportando extrato de ${startDate} até ${endDate} para ${userData.name}`);

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 10;
    let yPosition = margin;

    // Título
    doc.setFontSize(16);
    doc.text(`Extrato Personalizado - ${userData.name}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;

    // Período
    doc.setFontSize(12);
    doc.text(`Período: ${startDate} até ${endDate}`, margin, yPosition);
    yPosition += 6;
    doc.text(`Email: ${userData.email}`, margin, yPosition);
    yPosition += 6;
    doc.text(`Saldo em Reais: R$ ${userData.saldoReais.toFixed(2)}`, margin, yPosition);
    yPosition += 6;
    doc.text(`Saldo em WBTC: ${userData.wbtcBalance.toFixed(8)} WBTC`, margin, yPosition);
    yPosition += 6;
    doc.text(`Pontos: ${userData.pontos}`, margin, yPosition);
    yPosition += 10;

    // Filtrar transações pelo período
    const start = new Date(startDate);
    const end = new Date(endDate);
    const filteredHistory = userData.paymentHistory.filter((payment) => {
      const paymentDate = new Date(payment.date);
      return paymentDate >= start && paymentDate <= end;
    });

    // Histórico de transações
    doc.setFontSize(14);
    doc.text("Histórico de Pagamentos", margin, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    const headers = ["Descrição", "Valor (R$)", "Data", "Cashback (WBTC)", "Status"];
    const columnWidths = [60, 30, 30, 40, 20];
    let xPosition = margin;

    // Cabeçalhos
    headers.forEach((header, index) => {
      doc.text(header, xPosition, yPosition);
      xPosition += columnWidths[index];
    });
    yPosition += 6;
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 6;

    // Dados
    filteredHistory.forEach((payment) => {
      if (yPosition > 270) { // Adiciona nova página se necessário
        doc.addPage();
        yPosition = margin;
      }
      xPosition = margin;
      doc.text(payment.description.substring(0, 30), xPosition, yPosition); // Limita descrição
      xPosition += columnWidths[0];
      doc.text(payment.amount.toFixed(2), xPosition, yPosition);
      xPosition += columnWidths[1];
      doc.text(new Date(payment.date).toLocaleDateString("pt-BR"), xPosition, yPosition);
      xPosition += columnWidths[2];
      doc.text((payment.cashback || 0).toFixed(8), xPosition, yPosition);
      xPosition += columnWidths[3];
      doc.text(payment.status, xPosition, yPosition);
      yPosition += 6;
    });

    // Salva o PDF
    doc.save(`extrato_${startDate}_ate_${endDate}_${userData.name.split(" ")[0]}.pdf`);
  }, []);

  const exportTransaction = useCallback((userData, transaction) => {
    console.log(`Exportando transação ${transaction.id} para ${userData.name}`);

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 10;
    let yPosition = margin;

    // Título
    doc.setFontSize(16);
    doc.text(`Detalhes da Transação - ${userData.name}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;

    // Informações do usuário
    doc.setFontSize(12);
    doc.text(`Email: ${userData.email}`, margin, yPosition);
    yPosition += 6;
    doc.text(`Data: ${new Date(transaction.date).toLocaleString("pt-BR")}`, margin, yPosition);
    yPosition += 10;

    // Detalhes da transação
    doc.setFontSize(14);
    doc.text("Detalhes", margin, yPosition);
    yPosition += 10;

    doc.setFontSize(12);
    doc.text(`Descrição: ${transaction.description}`, margin, yPosition);
    yPosition += 6;
    doc.text(`Valor: R$ ${transaction.amount.toFixed(2)}`, margin, yPosition);
    yPosition += 6;
    doc.text(`Cashback: ${(transaction.cashback || 0).toFixed(8)} WBTC`, margin, yPosition);
    yPosition += 6;
    doc.text(`Status: ${transaction.status}`, margin, yPosition);
    yPosition += 6;
    if (transaction.taxa !== undefined) {
      doc.text(`Taxa: R$ ${transaction.taxa.toFixed(2)}`, margin, yPosition);
      yPosition += 6;
    }
    if (transaction.tipo) {
      doc.text(`Tipo: ${transaction.tipo}`, margin, yPosition);
    }

    // Salva o PDF
    doc.save(`transacao_${transaction.id || transaction._id}_${userData.name.split(" ")[0]}.pdf`);
  }, []);

  return {
    exportFullStatement,
    exportCustomStatement,
    exportTransaction
  };
}

export default useStatementExport;