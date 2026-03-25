import type { jsPDF } from "jspdf";
import type { InvoiceData, InvoiceCalculations } from "../types";
import { formatCurrency, formatDate, formatQuantityWithUnit } from "../format";
import { hexToRgb, renderNotesAndTerms, importAutoTable, renderStatusWatermark } from "./modern";

export async function renderClassicTemplate(
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
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;

  // ── Header bar ──
  doc.setFillColor(accent.r, accent.g, accent.b);
  doc.rect(0, 0, pageWidth, 24, "F");

  // Logo + company name in header
  let headerX = margin;
  if (company.logoUrl) {
    try {
      doc.addImage(company.logoUrl, "PNG", margin, 4, 16, 16);
      headerX = margin + 20;
    } catch {
      // skip logo
    }
  }

  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.text(company.name || "Your Company", headerX, 14);

  doc.setFontSize(18);
  doc.text("INVOICE", pageWidth - margin, 14, { align: "right" });

  let y = 34;

  // ── Two-column boxes: From + Invoice Details ──
  const boxWidth = (contentWidth - 10) / 2;
  const boxHeight = 30;

  // From box
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, boxWidth, boxHeight, 2, 2, "S");

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(accent.r, accent.g, accent.b);
  doc.text("FROM", margin + 4, y + 6);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  let fromY = y + 11;
  [company.address, company.email, company.phone, company.taxId ? `Tax ID: ${company.taxId}` : ""]
    .filter(Boolean)
    .slice(0, 4)
    .forEach((line) => {
      doc.text(line, margin + 4, fromY);
      fromY += 4;
    });

  // Invoice Details box
  const detailsX = margin + boxWidth + 10;
  doc.roundedRect(detailsX, y, boxWidth, boxHeight, 2, 2, "S");

  doc.setFont("helvetica", "bold");
  doc.setTextColor(accent.r, accent.g, accent.b);
  doc.text("INVOICE DETAILS", detailsX + 4, y + 6);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  let detY = y + 11;
  doc.setFont("helvetica", "bold");
  doc.text("Number:", detailsX + 4, detY);
  doc.setFont("helvetica", "normal");
  doc.text(settings.invoiceNumber, detailsX + 24, detY);
  detY += 4;
  doc.setFont("helvetica", "bold");
  doc.text("Date:", detailsX + 4, detY);
  doc.setFont("helvetica", "normal");
  doc.text(formatDate(settings.invoiceDate, settings.dateFormat), detailsX + 24, detY);
  detY += 4;
  doc.setFont("helvetica", "bold");
  doc.text("Due:", detailsX + 4, detY);
  doc.setFont("helvetica", "normal");
  doc.text(formatDate(settings.dueDate, settings.dateFormat), detailsX + 24, detY);

  y += boxHeight + 8;

  // ── Bill To box ──
  doc.roundedRect(margin, y, contentWidth, 24, 2, 2, "S");

  doc.setFont("helvetica", "bold");
  doc.setTextColor(accent.r, accent.g, accent.b);
  doc.text("BILL TO", margin + 4, y + 6);

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 30, 30);
  doc.text(client.name || "Client Name", margin + 4, y + 11);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  let billY = y + 15;
  [client.address, client.email, client.phone].filter(Boolean).slice(0, 2).forEach((line) => {
    doc.text(line, margin + 4, billY);
    billY += 4;
  });

  y += 32;

  // ── Table ──
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
    theme: "grid",
    headStyles: {
      fillColor: [accent.r, accent.g, accent.b],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8,
      cellPadding: 3,
      lineColor: [200, 200, 200],
      lineWidth: 0.3,
    },
    bodyStyles: {
      fontSize: 9,
      cellPadding: 3,
      textColor: [50, 50, 50],
      lineColor: [200, 200, 200],
      lineWidth: 0.3,
    },
    columnStyles: {
      0: { cellWidth: contentWidth - 75 },
      1: { cellWidth: 20, halign: "right" },
      2: { cellWidth: 30, halign: "right" },
      3: { cellWidth: 25, halign: "right", fontStyle: "bold" },
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = (doc as any).lastAutoTable.finalY + 8;

  // ── Summary ──
  const summaryX = pageWidth - margin - 60;
  const valueX = pageWidth - margin;

  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.setFont("helvetica", "normal");

  doc.text("Subtotal", summaryX, y);
  doc.text(formatCurrency(subtotal, cur), valueX, y, { align: "right" });
  y += 5;

  if (totalTax > 0) {
    doc.text(`Tax (${settings.taxRate}%)`, summaryX, y);
    doc.text(formatCurrency(totalTax, cur), valueX, y, { align: "right" });
    y += 5;
  }

  if (discountAmount > 0) {
    doc.setTextColor(200, 50, 50);
    doc.text("Discount", summaryX, y);
    doc.text(`-${formatCurrency(discountAmount, cur)}`, valueX, y, { align: "right" });
    y += 5;
    doc.setTextColor(100, 100, 100);
  }

  // Total bar
  y += 2;
  const totalBarWidth = 68;
  const totalBarX = pageWidth - margin - totalBarWidth;
  doc.setFillColor(accent.r, accent.g, accent.b);
  doc.roundedRect(totalBarX, y - 3, totalBarWidth, 10, 2, 2, "F");

  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.text("Total", totalBarX + 4, y + 3);
  doc.text(formatCurrency(grandTotal, cur), pageWidth - margin - 4, y + 3, {
    align: "right",
  });

  y += 18;

  // ── Notes & Terms ──
  renderNotesAndTerms(doc, notes, terms, accent, margin, y, contentWidth, data.paymentLink);

  // ── Status Watermark ──
  renderStatusWatermark(doc, data.status);
}
