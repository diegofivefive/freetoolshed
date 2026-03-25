import type { jsPDF } from "jspdf";
import type { InvoiceData, InvoiceCalculations } from "../types";
import { formatCurrency, formatDate, formatQuantityWithUnit } from "../format";

export async function renderModernTemplate(
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
  let y = margin;

  // ── Logo + Company Info (left) ──
  const headerStartY = y;
  if (company.logoUrl) {
    try {
      doc.addImage(company.logoUrl, "PNG", margin, y, 30, 30);
      y += 34;
    } catch {
      // skip logo if it fails
    }
  }

  doc.setFontSize(14);
  doc.setTextColor(accent.r, accent.g, accent.b);
  doc.setFont("helvetica", "bold");
  doc.text(company.name || "Your Company", margin, y);
  y += 5;

  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.setFont("helvetica", "normal");
  const companyLines = [
    company.address,
    company.email,
    company.phone,
    company.website,
    company.taxId ? `Tax ID: ${company.taxId}` : "",
  ].filter(Boolean);
  companyLines.forEach((line) => {
    doc.text(line, margin, y);
    y += 4;
  });

  // ── INVOICE title + meta (right) ──
  let rightY = headerStartY;
  doc.setFontSize(24);
  doc.setTextColor(accent.r, accent.g, accent.b);
  doc.setFont("helvetica", "bold");
  doc.text("INVOICE", pageWidth - margin, rightY, { align: "right" });
  rightY += 10;

  doc.setFontSize(10);
  doc.setTextColor(50, 50, 50);
  doc.setFont("helvetica", "bold");
  doc.text(settings.invoiceNumber, pageWidth - margin, rightY, {
    align: "right",
  });
  rightY += 5;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text(`Date: ${formatDate(settings.invoiceDate, settings.dateFormat)}`, pageWidth - margin, rightY, {
    align: "right",
  });
  rightY += 4;
  doc.text(`Due: ${formatDate(settings.dueDate, settings.dateFormat)}`, pageWidth - margin, rightY, {
    align: "right",
  });

  y = Math.max(y, rightY) + 12;

  // ── Bill To ──
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(accent.r, accent.g, accent.b);
  doc.text("BILL TO", margin, y);
  y += 5;

  doc.setFontSize(10);
  doc.setTextColor(30, 30, 30);
  doc.text(client.name || "Client Name", margin, y);
  y += 4;

  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.setFont("helvetica", "normal");
  const clientLines = [client.address, client.email, client.phone].filter(Boolean);
  clientLines.forEach((line) => {
    doc.text(line, margin, y);
    y += 4;
  });

  y += 6;

  // ── Line Items Table ──
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
      fontSize: 8,
      cellPadding: 3,
    },
    bodyStyles: {
      fontSize: 9,
      cellPadding: 3,
      textColor: [50, 50, 50],
    },
    alternateRowStyles: {
      fillColor: [250, 250, 250],
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
    doc.text(`-${formatCurrency(discountAmount, cur)}`, valueX, y, {
      align: "right",
    });
    y += 5;
  }

  // Total line
  y += 2;
  doc.setDrawColor(accent.r, accent.g, accent.b);
  doc.setLineWidth(0.5);
  doc.line(summaryX - 5, y - 2, valueX, y - 2);

  doc.setFontSize(13);
  doc.setTextColor(accent.r, accent.g, accent.b);
  doc.setFont("helvetica", "bold");
  doc.text("Total", summaryX, y + 3);
  doc.text(formatCurrency(grandTotal, cur), valueX, y + 3, {
    align: "right",
  });

  y += 16;

  // ── Notes & Terms ──
  renderNotesAndTerms(doc, notes, terms, accent, margin, y, contentWidth, data.paymentLink);

  // ── Status Watermark ──
  renderStatusWatermark(doc, data.status);
}

// ── Helpers ──

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
  };
}

async function importAutoTable() {
  return await import("jspdf-autotable");
}

function renderNotesAndTerms(
  doc: jsPDF,
  notes: string,
  terms: string,
  accent: { r: number; g: number; b: number },
  margin: number,
  startY: number,
  contentWidth: number,
  paymentLink?: string,
): void {
  let y = startY;

  if (notes) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(accent.r, accent.g, accent.b);
    doc.text("Notes", margin, y);
    y += 4;

    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    const noteLines = doc.splitTextToSize(notes, contentWidth);
    doc.text(noteLines, margin, y);
    y += noteLines.length * 4 + 6;
  }

  if (terms) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(accent.r, accent.g, accent.b);
    doc.text("Terms & Conditions", margin, y);
    y += 4;

    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    const termLines = doc.splitTextToSize(terms, contentWidth);
    doc.text(termLines, margin, y);
    y += termLines.length * 4 + 6;
  }

  if (paymentLink) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(accent.r, accent.g, accent.b);
    doc.text("Payment Link", margin, y);
    y += 4;

    doc.setFont("helvetica", "normal");
    const linkLines = doc.splitTextToSize(paymentLink, contentWidth);
    doc.text(linkLines, margin, y);
  }
}

function renderStatusWatermark(
  doc: jsPDF,
  status: string,
): void {
  const statusConfig: Record<string, { label: string; color: string }> = {
    draft: { label: "DRAFT", color: "#a1a1aa" },
    sent: { label: "SENT", color: "#3b82f6" },
    paid: { label: "PAID", color: "#10b981" },
    overdue: { label: "OVERDUE", color: "#ef4444" },
  };

  const config = statusConfig[status];
  if (!config) return;

  const color = hexToRgb(config.color);
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Very light tint (~12% opacity)
  const r = Math.round(color.r + (255 - color.r) * 0.88);
  const g = Math.round(color.g + (255 - color.g) * 0.88);
  const b = Math.round(color.b + (255 - color.b) * 0.88);

  doc.setTextColor(r, g, b);
  doc.setFontSize(60);
  doc.setFont("helvetica", "bold");
  doc.text(config.label, pageWidth / 2, pageHeight / 2, {
    align: "center",
    angle: 30,
  });
}

export { hexToRgb, renderNotesAndTerms, importAutoTable, renderStatusWatermark };
