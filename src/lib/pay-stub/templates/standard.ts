import type { jsPDF } from "jspdf";
import type {
  PayStubData,
  PayStubCalculations,
} from "../types";
import { formatCurrency, formatDate } from "../format";

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
  };
}

export async function importAutoTable() {
  return await import("jspdf-autotable");
}

export async function renderStandardTemplate(
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

  // ── Header: Employer (left) + PAY STUB (right) ──
  const headerStartY = y;

  if (employer.logoUrl) {
    try {
      doc.addImage(employer.logoUrl, "PNG", margin, y, 24, 24);
      y += 28;
    } catch {
      // skip logo
    }
  }

  doc.setFontSize(14);
  doc.setTextColor(accent.r, accent.g, accent.b);
  doc.setFont("helvetica", "bold");
  doc.text(employer.companyName || "Company Name", margin, y);
  y += 5;

  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.setFont("helvetica", "normal");
  const employerLines = [employer.address, employer.phone, employer.ein ? `EIN: ${employer.ein}` : ""].filter(
    Boolean
  );
  employerLines.forEach((line) => {
    doc.text(line, margin, y);
    y += 3.5;
  });

  // Right side: PAY STUB title
  let rightY = headerStartY;
  doc.setFontSize(22);
  doc.setTextColor(accent.r, accent.g, accent.b);
  doc.setFont("helvetica", "bold");
  doc.text("PAY STUB", pageWidth - margin, rightY, { align: "right" });
  rightY += 8;

  doc.setFontSize(8);
  doc.setTextColor(80, 80, 80);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Pay Date: ${formatDate(payPeriod.payDate, settings.dateFormat)}`,
    pageWidth - margin,
    rightY,
    { align: "right" }
  );
  rightY += 4;
  doc.text(
    `Period: ${formatDate(payPeriod.startDate, settings.dateFormat)} — ${formatDate(payPeriod.endDate, settings.dateFormat)}`,
    pageWidth - margin,
    rightY,
    { align: "right" }
  );

  y = Math.max(y, rightY) + 10;

  // ── Divider ──
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  // ── Employee Info ──
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(accent.r, accent.g, accent.b);
  doc.text("EMPLOYEE", margin, y);
  y += 4;

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 30, 30);
  doc.text(employee.name || "Employee Name", margin, y);
  y += 4;

  doc.setFontSize(8);
  doc.setTextColor(80, 80, 80);
  doc.setFont("helvetica", "normal");
  const empLines = [
    employee.address,
    employee.employeeId ? `ID: ${employee.employeeId}` : "",
    settings.showSsnLast4 && employee.ssnLast4
      ? `SSN: ***-**-${employee.ssnLast4}`
      : "",
    employee.department ? `Dept: ${employee.department}` : "",
  ].filter(Boolean);
  empLines.forEach((line) => {
    doc.text(line, margin, y);
    y += 3.5;
  });

  y += 6;

  // ── Earnings Table ──
  const isHourly = settings.payType === "hourly";

  const earningsHead = isHourly
    ? [["Description", "Type", "Hours", "Rate", "Current", "YTD"]]
    : [["Description", "Type", "Amount", "Current", "YTD"]];

  const earningsBody = earnings.map((e) => {
    const showHoursRate =
      isHourly && (e.type === "regular" || e.type === "overtime");
    if (isHourly) {
      return [
        e.label || "—",
        e.type.charAt(0).toUpperCase() + e.type.slice(1),
        showHoursRate ? String(e.hours) : "—",
        showHoursRate ? formatCurrency(e.rate) : formatCurrency(e.rate),
        formatCurrency(e.currentAmount),
        formatCurrency(e.ytdAmount),
      ];
    }
    return [
      e.label || "—",
      e.type.charAt(0).toUpperCase() + e.type.slice(1),
      formatCurrency(e.rate),
      formatCurrency(e.currentAmount),
      formatCurrency(e.ytdAmount),
    ];
  });

  const { default: autoTable } = await importAutoTable();

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(accent.r, accent.g, accent.b);
  doc.text("EARNINGS", margin, y);
  y += 3;

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: earningsHead,
    body: earningsBody,
    theme: "grid",
    headStyles: {
      fillColor: [accent.r, accent.g, accent.b],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 7,
      cellPadding: 2.5,
      lineColor: [200, 200, 200],
      lineWidth: 0.3,
    },
    bodyStyles: {
      fontSize: 8,
      cellPadding: 2.5,
      textColor: [50, 50, 50],
      lineColor: [200, 200, 200],
      lineWidth: 0.3,
    },
    columnStyles: isHourly
      ? {
          0: { cellWidth: contentWidth - 120 },
          1: { cellWidth: 22 },
          2: { cellWidth: 18, halign: "right" as const },
          3: { cellWidth: 24, halign: "right" as const },
          4: { cellWidth: 28, halign: "right" as const, fontStyle: "bold" as const },
          5: { cellWidth: 28, halign: "right" as const },
        }
      : {
          0: { cellWidth: contentWidth - 98 },
          1: { cellWidth: 22 },
          2: { cellWidth: 24, halign: "right" as const },
          3: { cellWidth: 28, halign: "right" as const, fontStyle: "bold" as const },
          4: { cellWidth: 24, halign: "right" as const },
        },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = (doc as any).lastAutoTable.finalY + 6;

  // ── Deductions Table ──
  const preTax = deductions.filter((d) => d.category === "pre-tax");
  const postTax = deductions.filter((d) => d.category === "post-tax");
  const allDeductions = [...preTax, ...postTax];

  if (allDeductions.length > 0) {
    doc.setFontSize(9);
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
      theme: "grid",
      headStyles: {
        fillColor: [accent.r, accent.g, accent.b],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 7,
        cellPadding: 2.5,
        lineColor: [200, 200, 200],
        lineWidth: 0.3,
      },
      bodyStyles: {
        fontSize: 8,
        cellPadding: 2.5,
        textColor: [50, 50, 50],
        lineColor: [200, 200, 200],
        lineWidth: 0.3,
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

  // ── Summary Box ──
  renderSummaryBox(doc, calculations, accent, margin, contentWidth, y);
}

function renderSummaryBox(
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

  // Current period summary
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(accent.r, accent.g, accent.b);
  doc.text("SUMMARY", boxX, y);
  y += 4;

  const labelX = boxX;
  const valueX = boxX + boxWidth;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(50, 50, 50);

  doc.text("Gross Pay", labelX, y);
  doc.text(formatCurrency(calculations.grossPay), valueX, y, {
    align: "right",
  });
  y += 5;

  if (calculations.totalPreTaxDeductions > 0) {
    doc.text("Pre-Tax Deductions", labelX, y);
    doc.setTextColor(180, 60, 80);
    doc.text(
      `−${formatCurrency(calculations.totalPreTaxDeductions)}`,
      valueX,
      y,
      { align: "right" }
    );
    doc.setTextColor(50, 50, 50);
    y += 5;
  }

  if (calculations.totalPostTaxDeductions > 0) {
    doc.text("Post-Tax Deductions", labelX, y);
    doc.setTextColor(180, 60, 80);
    doc.text(
      `−${formatCurrency(calculations.totalPostTaxDeductions)}`,
      valueX,
      y,
      { align: "right" }
    );
    doc.setTextColor(50, 50, 50);
    y += 5;
  }

  // Net pay line
  y += 1;
  doc.setDrawColor(accent.r, accent.g, accent.b);
  doc.setLineWidth(0.5);
  doc.line(labelX, y, valueX, y);
  y += 5;

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(accent.r, accent.g, accent.b);
  doc.text("Net Pay", labelX, y);
  doc.text(formatCurrency(calculations.netPay), valueX, y, {
    align: "right",
  });
  y += 10;

  // YTD summary
  if (calculations.ytdGrossPay > 0) {
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(accent.r, accent.g, accent.b);
    doc.text("YEAR-TO-DATE", labelX, y);
    y += 4;

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);

    doc.text("YTD Gross", labelX, y);
    doc.text(formatCurrency(calculations.ytdGrossPay), valueX, y, {
      align: "right",
    });
    y += 4;

    doc.text("YTD Deductions", labelX, y);
    doc.text(formatCurrency(calculations.ytdTotalDeductions), valueX, y, {
      align: "right",
    });
    y += 4;

    doc.setFont("helvetica", "bold");
    doc.text("YTD Net", labelX, y);
    doc.text(formatCurrency(calculations.ytdNetPay), valueX, y, {
      align: "right",
    });
  }
}
