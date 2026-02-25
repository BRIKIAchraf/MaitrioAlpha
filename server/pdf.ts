import { jsPDF } from "jspdf";

interface InvoiceData {
  invoiceNumber: string;
  missionTitle: string;
  missionCategory: string;
  clientName: string;
  artisanName: string;
  amount: number;
  address: string;
  completedDate: Date;
  description?: string;
}

export function generateInvoicePDF(data: InvoiceData): string {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFontSize(24);
  doc.setTextColor(27, 44, 78);
  doc.text("FACTURE", 20, 30);

  doc.setFontSize(14);
  doc.setTextColor(201, 168, 76);
  doc.text("Elite Flow", pageWidth - 20, 30, { align: "right" });

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`N° ${data.invoiceNumber}`, 20, 42);
  doc.text(`Date: ${data.completedDate.toLocaleDateString("fr-FR")}`, 20, 48);

  doc.setDrawColor(201, 168, 76);
  doc.setLineWidth(0.5);
  doc.line(20, 55, pageWidth - 20, 55);

  doc.setFontSize(11);
  doc.setTextColor(27, 44, 78);
  doc.text("Client", 20, 68);
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  doc.text(data.clientName, 20, 75);

  doc.setFontSize(11);
  doc.setTextColor(27, 44, 78);
  doc.text("Artisan", pageWidth / 2 + 10, 68);
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  doc.text(data.artisanName, pageWidth / 2 + 10, 75);

  doc.setFillColor(245, 245, 250);
  doc.rect(20, 95, pageWidth - 40, 10, "F");
  doc.setFontSize(10);
  doc.setTextColor(27, 44, 78);
  doc.text("Description", 25, 102);
  doc.text("Montant", pageWidth - 45, 102, { align: "right" });

  doc.setTextColor(60, 60, 60);
  let y = 115;
  doc.text(data.missionTitle, 25, y);
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text(`Categorie: ${data.missionCategory}`, 25, y + 6);
  doc.text(`Adresse: ${data.address}`, 25, y + 12);
  if (data.description) {
    const lines = doc.splitTextToSize(data.description, pageWidth - 80);
    doc.text(lines.slice(0, 3), 25, y + 18);
  }

  doc.setFontSize(11);
  doc.setTextColor(27, 44, 78);
  doc.text(`${data.amount.toFixed(2)} EUR`, pageWidth - 45, y, { align: "right" });

  doc.line(20, y + 30, pageWidth - 20, y + 30);

  const totalY = y + 42;
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text("Sous-total HT:", pageWidth - 90, totalY);
  doc.text(`${(data.amount / 1.2).toFixed(2)} EUR`, pageWidth - 45, totalY, { align: "right" });

  doc.text("TVA (20%):", pageWidth - 90, totalY + 8);
  doc.text(`${(data.amount - data.amount / 1.2).toFixed(2)} EUR`, pageWidth - 45, totalY + 8, { align: "right" });

  doc.setFillColor(27, 44, 78);
  doc.rect(pageWidth - 110, totalY + 14, 90, 12, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.text("TOTAL TTC:", pageWidth - 105, totalY + 22);
  doc.text(`${data.amount.toFixed(2)} EUR`, pageWidth - 25, totalY + 22, { align: "right" });

  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text("Elite Flow - Plateforme de mise en relation artisans-clients", pageWidth / 2, 280, { align: "center" });
  doc.text("Paiement securise via escrow", pageWidth / 2, 285, { align: "center" });

  return doc.output("datauristring");
}
