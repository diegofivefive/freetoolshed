import type { jsPDF } from "jspdf";
import type { PayStubData, PayStubCalculations } from "../types";
import { formatCurrency, formatDate } from "../format";
import { hexToRgb, importAutoTable } from "./standard";

export async function renderModernTemplate(
  doc: jsPDF,
  data: PayStubData,
  calculations: PayStubCalculations
): Promise<void> {
  const { employer, employee, payPeriod, earnings, deductions, settings } =
    data;
  const accent = hexToRgb(settings.accentColor);
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // ── Accent Header Bar ──
  doc.setFillColor(accent.r, accent.g, accent.b);
  doc.rect(0, 0, pageWidth, 28, "F");

  // Logo in header
  let headerTextX = margin;
  if (employer.logoUrl) {
    try {
      doc.addImage(employer.logoUrl, "PNG", margin, 4, 20, 20);
      headerTextX = margin + 24;
    } catch {
      // skip logo
    }
  }

  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.text(employer.companyName || "Company Name", headerTextX, 12);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(employer.address || "", headerTextX, 17);

  // PAY STUB title (right)
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("PAY STUB", pageWidth - margin, 14, { align: "right" });

  y = 36;

  // ── Pay Period + Employee Cards ──
  const halfWidth = (contentWidth - 8) / 2;

  // Light accent tint for cards
  const tintR = Math.round(255 + (accent.r - 255) * 0.06);
  const tintG = Math.round(255 + (accent.g - 255) * 0.06);
  const tintB = Math.round(255 + (accent.b - 255) * 0.06);

  // Employee card (left)
  doc.setFillColor(tintR, tintG, tintB);
  doc.roundedRect(margin, y, halfWidth, 32, 2, 2, "F");

  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(accent.r, accent.g, accent.b);
  doc.text("EMPLOYEE", margin + 4, y + 5);

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 30, 30);
  doc.text(employee.name || "Employee Name", margin + 4, y + 10);

  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  let empY = y + 14;
  const empLines = [
    employee.address,
    employee.employeeId ? `ID: ${employee.employeeId}` : "",
    settings.showSsnLast4 && employee.ssnLast4
      ? `SSN: ***-**-${employee.ssnLast4}`
      : "",
    employee.department ? `Dept: ${employee.department}` : "",
  ].filter(Boolean);
  empLines.slice(0, 4).forEach((line) => {
    doc.text(line, margin + 4, empY);
    empY += 3.5;
  });

  // Pay Period card (right)
  const rightCardX = margin + halfWidth + 8;
  doc.setFillColor(tintR, tintG, tintB);
  doc.roundedRect(rightCardX, y, halfWidth, 32, 2, 2, "F");

  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(accent.r, accent.g, accent.b);
  doc.text("PAY PERIOD", rightCardX + 4, y + 5);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(50, 50, 50);
  let ppY = y + 10;

  doc.setFont("helvetica", "bold");
  doc.text("Pay Date:", rightCardX + 4, ppY);
  doc.setFont("helvetica", "normal");
  doc.text(
    formatDate(payPeriod.payDate, settings.dateFormat),
    rightCardX + 24,
    ppY
  );
  ppY += 4;

  doc.setFont("helvetica", "bold");
  doc.text("Start:", rightCardX + 4, ppY);
  doc.setFont("helvetica", "normal");
  doc.text(
    formatDate(payPeriod.startDate, settings.dateFormat),
    rightCardX + 24,
    ppY
  );
  ppY += 4;

  doc.setFont("helvetica", "bold");
  doc.text("End:", rightCardX + 4, ppY);
  doc.setFont("helvetica", "normal");
  doc.text(
    formatDate(payPeriod.endDate, settings.dateFormat),
    rightCardX + 24,
    ppY
  );
  ppY += 4;

  if (employer.ein) {
    doc.setFont("helvetica", "bold");
    doc.text("EIN:", rightCardX + 4, ppY);
    doc.setFont("helvetica", "normal");
    doc.text(employer.ein, rightCardX + 24, ppY);
  }

  y += 40;

  // ── Earnings Table ──
  const isHourly = settings.payType === "hourly";
  const { default: autoTable } = await importAutoTable();

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(accent.r, accent.g, accent.b);
  doc.text("EARNINGS", margin, y);
  y += 3;

  const earningsHead = isHourly
    ? [["Description", "Hours", "Rate", "Current", "YTD"]]
    : [["Description", "Amount", "Current", "YTD"]];

  const earningsBody = earnings.map((e) => {
    const showHoursRate =
      isHourly && (e.type === "regular" || e.type === "overtime");
    if (isHourly) {
      return [
        e.label || "—",
        showHoursRate ? String(e.hours) : "—",
        formatCurrency(e.rate),
        formatCurrency(e.currentAmount),
        formatCurrency(e.ytdAmount),
      ];
    }
    return [
      e.label || "—",
      formatCurrency(e.rate),
      formatCurrency(e.currentAmount),
      formatCurrency(e.ytdAmount),
    ];
  });

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: earningsHead,
    body: earningsBody,
    theme: "plain",
    headStyles: {
      fillColor: [accent.r, accent.g, accent.b],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 7,
      cellPadding: 2.5,
    },
    bodyStyles: {
      fontSize: 8,
      cellPadding: 2.5,
      textColor: [50, 50, 50],
    },
    alternateRowStyles: {
      fillColor: [250, 250, 250],
    },
    columnStyles: isHourly
      ? {
          0: { cellWidth: contentWidth - 100 },
          1: { cellWidth: 20, halign: "right" as const },
          2: { cellWidth: 24, halign: "right" as const },
          3: { cellWidth: 28, halign: "right" as const, fontStyle: "bold" as const },
          4: { cellWidth: 28, halign: "right" as const },
        }
      : {
          0: { cellWidth: contentWidth - 80 },
          1: { cellWidth: 24, halign: "right" as const },
          2: { cellWidth: 28, halign: "right" as const, fontStyle: "bold" as const },
          3: { cellWidth: 28, halign: "right" as const },
        },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = (doc as any).lastAutoTable.finalY + 6;

  // ── Deductions Table ──
  const allDeductions = [
    ...deductions.filter((d) => d.category === "pre-tax"),
    ...deductions.filter((d) => d.category === "post-tax"),
  ];

  if (allDeductions.length > 0) {
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(accent.r, accent.g, accent.b);
    doc.text("DEDUCTIONS", margin, y);
    y += 3;

    const deductionsBody = allDeductions.map((d) => [
      d.label || "—",
      d.category === "pre-tax" ? "Pre-Tax" : "Post-Tax",
      formatCurrency(d.currentAmount),
      formatCurrency(d.ytdAmount),
    ]);

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [["Description", "Category", "Current", "YTD"]],
      body: deductionsBody,
      theme: "plain",
      headStyles: {
        fillColor: [accent.r, accent.g, accent.b],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 7,
        cellPadding: 2.5,
      },
      bodyStyles: {
        fontSize: 8,
        cellPadding: 2.5,
        textColor: [50, 50, 50],
      },
      alternateRowStyles: {
        fillColor: [250, 250, 250],
      },
      columnStyles: {
        0: { cellWidth: contentWidth - 80 },
        1: { cellWidth: 24 },
        2: { cellWidth: 28, halign: "right" as const, fontStyle: "bold" as const },
        3: { cellWidth: 28, halign: "right" as const },
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    y = (doc as any).lastAutoTable.finalY + 8;
  } else {
    y += 4;
  }

  // ── Summary Card ──
  renderModernSummary(doc, calculations, accent, margin, contentWidth, y);
}

function renderModernSummary(
  doc: jsPDF,
  calculations: PayStubCalculations,
  accent: { r: number; g: number; b: number },
  margin: number,
  contentWidth: number,
  startY: number
): void {
  const boxWidth = 90;
  const boxX = margin + contentWidth - boxWidth;
  let y = startY;

  // Background card
  const tintR = Math.round(255 + (accent.r - 255) * 0.06);
  const tintG = Math.round(255 + (accent.g - 255) * 0.06);
  const tintB = Math.round(255 + (accent.b - 255) * 0.06);
  doc.setFillColor(tintR, tintG, tintB);
  doc.roundedRect(boxX - 4, y - 2, boxWidth + 8, 48, 2, 2, "F");

  const labelX = boxX;
  const valueX = boxX + boxWidth;

  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(accent.r, accent.g, accent.b);
  doc.text("SUMMARY", labelX, y + 3);
  y += 7;

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(50, 50, 50);

  doc.text("Gross Pay", labelX, y);
  doc.text(formatCurrency(calculations.grossPay), valueX, y, {
    align: "right",
  });
  y += 4.5;

  if (calculations.totalPreTaxDeductions > 0) {
    doc.text("Pre-Tax", labelX, y);
    doc.setTextColor(180, 60, 80);
    doc.text(
      `−${formatCurrency(calculations.totalPreTaxDeductions)}`,
      valueX,
      y,
      { align: "right" }
    );
    doc.setTextColor(50, 50, 50);
    y += 4.5;
  }

  if (calculations.totalPostTaxDeductions > 0) {
    doc.text("Post-Tax", labelX, y);
    doc.setTextColor(180, 60, 80);
    doc.text(
      `−${formatCurrency(calculations.totalPostTaxDeductions)}`,
      valueX,
      y,
      { align: "right" }
    );
    doc.setTextColor(50, 50, 50);
    y += 4.5;
  }

  // Net Pay accent bar
  y += 1;
  doc.setFillColor(accent.r, accent.g, accent.b);
  doc.roundedRect(labelX - 2, y - 2, boxWidth + 4, 10, 1.5, 1.5, "F");

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("Net Pay", labelX + 2, y + 4);
  doc.text(formatCurrency(calculations.netPay), valueX, y + 4, {
    align: "right",
  });

  y += 16;

  // YTD
  if (calculations.ytdGrossPay > 0) {
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(accent.r, accent.g, accent.b);
    doc.text("YEAR-TO-DATE", labelX, y);
    y += 4;

    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);

    doc.text("Gross", labelX, y);
    doc.text(formatCurrency(calculations.ytdGrossPay), valueX, y, {
      align: "right",
    });
    y += 3.5;

    doc.text("Deductions", labelX, y);
    doc.text(formatCurrency(calculations.ytdTotalDeductions), valueX, y, {
      align: "right",
    });
    y += 3.5;

    doc.setFont("helvetica", "bold");
    doc.text("Net", labelX, y);
    doc.text(formatCurrency(calculations.ytdNetPay), valueX, y, {
      align: "right",
    });
  }
}
