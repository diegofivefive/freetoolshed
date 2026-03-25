import type { jsPDF } from "jspdf";
import type { InvoiceData, InvoiceCalculations } from "../types";
import { formatCurrency, formatDate, formatQuantityWithUnit } from "../format";
import { hexToRgb, renderNotesAndTerms, importAutoTable, renderStatusWatermark } from "./modern";

export async function renderCompactTemplate(
  doc: jsPDF,
  data: InvoiceData,
  calculations: InvoiceCalculations
): Promise<void> {
  const { company, client, settings, lineItems, notes, terms } = data;
  const { lineItemTotals, subtotal, totalTax, discountAmount, grandTotal } =
    calculations;
  const cur = settings.currency;
  const accent = hexToRgb(settings.accentColor);
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // ── Side-by-side header ──
  const halfWidth = (contentWidth - 10) / 2;

  // Left: Company
  if (company.logoUrl) {
    try {
      doc.addImage(company.logoUrl, "PNG", margin, y, 14, 14);
      doc.setFontSize(11);
      doc.setTextColor(accent.r, accent.g, accent.b);
      doc.setFont("helvetica", "bold");
      doc.text(company.name || "Your Company", margin + 17, y + 5);
    } catch {
      doc.setFontSize(11);
      doc.setTextColor(accent.r, accent.g, accent.b);
      doc.setFont("helvetica", "bold");
      doc.text(company.name || "Your Company", margin, y + 4);
    }
  } else {
    doc.setFontSize(11);
    doc.setTextColor(accent.r, accent.g, accent.b);
    doc.setFont("helvetica", "bold");
    doc.text(company.name || "Your Company", margin, y + 4);
  }

  let compY = y + 9;
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);
  doc.setFont("helvetica", "normal");
  [company.address, company.email, company.phone, company.taxId ? `Tax ID: ${company.taxId}` : ""]
    .filter(Boolean)
    .forEach((line) => {
      doc.text(line, margin, compY);
      compY += 3.5;
    });

  // Right: Client
  const rightX = margin + halfWidth + 10;
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(accent.r, accent.g, accent.b);
  doc.text("BILL TO", rightX, y + 2);

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 30, 30);
  doc.text(client.name || "Client Name", rightX, y + 6);

  let clY = y + 9;
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  [client.address, client.email, client.phone].filter(Boolean).forEach((line) => {
    doc.text(line, rightX, clY);
    clY += 3.5;
  });

  y = Math.max(compY, clY) + 4;

  // ── Invoice meta row (8% tint of accent on white) ──
  const tintR = Math.round(255 + (accent.r - 255) * 0.08);
  const tintG = Math.round(255 + (accent.g - 255) * 0.08);
  const tintB = Math.round(255 + (accent.b - 255) * 0.08);
  doc.setFillColor(tintR, tintG, tintB);
  doc.rect(margin, y, contentWidth, 8, "F");

  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(50, 50, 50);

  let metaX = margin + 3;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(accent.r, accent.g, accent.b);
  doc.text("Invoice", metaX, y + 5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(50, 50, 50);
  doc.text(settings.invoiceNumber, metaX + 14, y + 5);

  metaX += 40;
  doc.setFont("helvetica", "bold");
  doc.text("Date:", metaX, y + 5);
  doc.setFont("helvetica", "normal");
  doc.text(formatDate(settings.invoiceDate, settings.dateFormat), metaX + 10, y + 5);

  metaX += 50;
  doc.setFont("helvetica", "bold");
  doc.text("Due:", metaX, y + 5);
  doc.setFont("helvetica", "normal");
  doc.text(formatDate(settings.dueDate, settings.dateFormat), metaX + 10, y + 5);

  y += 12;

  // ── Table — dense ──
  const tableBody = lineItems.map((item, i) => {
    const total = lineItemTotals[i];
    return [
      item.description || "—",
      formatQuantityWithUnit(item.quantity, item.unitType),
      formatCurrency(item.unitPrice, cur),
      formatCurrency(total?.amount ?? 0, cur),
    ];
  });

  const { default: autoTable } = await importAutoTable();
  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [["Description", "Qty", "Price", "Amount"]],
    body: tableBody,
    theme: "plain",
    headStyles: {
      fillColor: [accent.r, accent.g, accent.b],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 7,
      cellPadding: 2,
    },
    bodyStyles: {
      fontSize: 7,
      cellPadding: 2,
      textColor: [50, 50, 50],
    },
    alternateRowStyles: {
      fillColor: [248, 248, 248],
    },
    columnStyles: {
      0: { cellWidth: contentWidth - 65 },
      1: { cellWidth: 18, halign: "right" },
      2: { cellWidth: 25, halign: "right" },
      3: { cellWidth: 22, halign: "right", fontStyle: "bold" },
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = (doc as any).lastAutoTable.finalY + 6;

  // ── Summary ──
  const summaryX = pageWidth - margin - 50;
  const valueX = pageWidth - margin;

  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);
  doc.setFont("helvetica", "normal");

  doc.text("Subtotal", summaryX, y);
  doc.text(formatCurrency(subtotal, cur), valueX, y, { align: "right" });
  y += 4;

  if (totalTax > 0) {
    doc.text(`Tax (${settings.taxRate}%)`, summaryX, y);
    doc.text(formatCurrency(totalTax, cur), valueX, y, { align: "right" });
    y += 4;
  }

  if (discountAmount > 0) {
    doc.setTextColor(200, 50, 50);
    doc.text("Discount", summaryX, y);
    doc.text(`-${formatCurrency(discountAmount, cur)}`, valueX, y, { align: "right" });
    y += 4;
    doc.setTextColor(100, 100, 100);
  }

  // Total line
  doc.setDrawColor(accent.r, accent.g, accent.b);
  doc.setLineWidth(0.5);
  doc.line(summaryX - 3, y, valueX, y);
  y += 4;

  doc.setFontSize(10);
  doc.setTextColor(accent.r, accent.g, accent.b);
  doc.setFont("helvetica", "bold");
  doc.text("Total", summaryX, y);
  doc.text(formatCurrency(grandTotal, cur), valueX, y, { align: "right" });

  y += 12;

  // ── Notes & Terms ──
  renderNotesAndTerms(doc, notes, terms, accent, margin, y, contentWidth, data.paymentLink);

  // ── Status Watermark ──
  renderStatusWatermark(doc, data.status);
}
