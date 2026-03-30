import type { jsPDF } from "jspdf";
import type { PayStubData, PayStubCalculations } from "../types";
import { formatCurrency, formatDate } from "../format";
import { hexToRgb, importAutoTable } from "./standard";

export async function renderCompactTemplate(
  doc: jsPDF,
  data: PayStubData,
  calculations: PayStubCalculations
): Promise<void> {
  const { employer, employee, payPeriod, earnings, deductions, settings } =
    data;
  const accent = hexToRgb(settings.accentColor);
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // ── Side-by-side header ──
  const halfWidth = (contentWidth - 10) / 2;

  // Left: Employer
  if (employer.logoUrl) {
    try {
      doc.addImage(employer.logoUrl, "PNG", margin, y, 12, 12);
      doc.setFontSize(10);
      doc.setTextColor(accent.r, accent.g, accent.b);
      doc.setFont("helvetica", "bold");
      doc.text(employer.companyName || "Company", margin + 15, y + 4);
    } catch {
      doc.setFontSize(10);
      doc.setTextColor(accent.r, accent.g, accent.b);
      doc.setFont("helvetica", "bold");
      doc.text(employer.companyName || "Company", margin, y + 4);
    }
  } else {
    doc.setFontSize(10);
    doc.setTextColor(accent.r, accent.g, accent.b);
    doc.setFont("helvetica", "bold");
    doc.text(employer.companyName || "Company", margin, y + 4);
  }

  let compY = y + 8;
  doc.setFontSize(6.5);
  doc.setTextColor(100, 100, 100);
  doc.setFont("helvetica", "normal");
  [
    employer.address,
    employer.phone,
    employer.ein ? `EIN: ${employer.ein}` : "",
  ]
    .filter(Boolean)
    .forEach((line) => {
      doc.text(line, margin, compY);
      compY += 3;
    });

  // Right: Employee
  const rightX = margin + halfWidth + 10;
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(accent.r, accent.g, accent.b);
  doc.text("EMPLOYEE", rightX, y + 2);

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 30, 30);
  doc.text(employee.name || "Employee", rightX, y + 6);

  let empY = y + 9;
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  [
    employee.address,
    employee.employeeId ? `ID: ${employee.employeeId}` : "",
    settings.showSsnLast4 && employee.ssnLast4
      ? `SSN: ***-**-${employee.ssnLast4}`
      : "",
    employee.department ? `Dept: ${employee.department}` : "",
  ]
    .filter(Boolean)
    .forEach((line) => {
      doc.text(line, rightX, empY);
      empY += 3;
    });

  y = Math.max(compY, empY) + 3;

  // ── Pay period meta row (tinted bar) ──
  const tintR = Math.round(255 + (accent.r - 255) * 0.08);
  const tintG = Math.round(255 + (accent.g - 255) * 0.08);
  const tintB = Math.round(255 + (accent.b - 255) * 0.08);
  doc.setFillColor(tintR, tintG, tintB);
  doc.rect(margin, y, contentWidth, 7, "F");

  doc.setFontSize(6.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(50, 50, 50);

  let metaX = margin + 3;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(accent.r, accent.g, accent.b);
  doc.text("PAY STUB", metaX, y + 4.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(50, 50, 50);

  metaX += 24;
  doc.text(
    `Pay Date: ${formatDate(payPeriod.payDate, settings.dateFormat)}`,
    metaX,
    y + 4.5
  );

  metaX += 46;
  doc.text(
    `Period: ${formatDate(payPeriod.startDate, settings.dateFormat)} — ${formatDate(payPeriod.endDate, settings.dateFormat)}`,
    metaX,
    y + 4.5
  );

  y += 11;

  // ── Earnings Table (dense) ──
  const isHourly = settings.payType === "hourly";
  const { default: autoTable } = await importAutoTable();

  const earningsHead = isHourly
    ? [["Description", "Hrs", "Rate", "Current", "YTD"]]
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
      fontSize: 6.5,
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
    columnStyles: isHourly
      ? {
          0: { cellWidth: contentWidth - 88 },
          1: { cellWidth: 16, halign: "right" as const },
          2: { cellWidth: 22, halign: "right" as const },
          3: { cellWidth: 26, halign: "right" as const, fontStyle: "bold" as const },
          4: { cellWidth: 24, halign: "right" as const },
        }
      : {
          0: { cellWidth: contentWidth - 70 },
          1: { cellWidth: 22, halign: "right" as const },
          2: { cellWidth: 26, halign: "right" as const, fontStyle: "bold" as const },
          3: { cellWidth: 22, halign: "right" as const },
        },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = (doc as any).lastAutoTable.finalY + 4;

  // ── Deductions Table (dense) ──
  const allDeductions = [
    ...deductions.filter((d) => d.category === "pre-tax"),
    ...deductions.filter((d) => d.category === "post-tax"),
  ];

  if (allDeductions.length > 0) {
    const deductionsBody = allDeductions.map((d) => [
      d.label || "—",
      d.category === "pre-tax" ? "Pre" : "Post",
      formatCurrency(d.currentAmount),
      formatCurrency(d.ytdAmount),
    ]);

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [["Deduction", "Type", "Current", "YTD"]],
      body: deductionsBody,
      theme: "plain",
      headStyles: {
        fillColor: [accent.r, accent.g, accent.b],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 6.5,
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
        0: { cellWidth: contentWidth - 64 },
        1: { cellWidth: 16 },
        2: { cellWidth: 26, halign: "right" as const, fontStyle: "bold" as const },
        3: { cellWidth: 22, halign: "right" as const },
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    y = (doc as any).lastAutoTable.finalY + 5;
  }

  // ── Compact Summary ──
  doc.setDrawColor(accent.r, accent.g, accent.b);
  doc.setLineWidth(0.5);
  doc.line(margin, y, margin + contentWidth, y);
  y += 5;

  const summaryLabelX = margin + contentWidth - 86;
  const summaryValX = margin + contentWidth;

  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);

  doc.text("Gross Pay", summaryLabelX, y);
  doc.text(formatCurrency(calculations.grossPay), summaryValX, y, {
    align: "right",
  });
  y += 3.5;

  doc.text("Total Deductions", summaryLabelX, y);
  doc.setTextColor(180, 60, 80);
  doc.text(
    `−${formatCurrency(calculations.totalDeductions)}`,
    summaryValX,
    y,
    { align: "right" }
  );
  y += 4;

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(accent.r, accent.g, accent.b);
  doc.text("Net Pay", summaryLabelX, y);
  doc.text(formatCurrency(calculations.netPay), summaryValX, y, {
    align: "right",
  });
  y += 8;

  // YTD row
  if (calculations.ytdGrossPay > 0) {
    doc.setFontSize(6.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text(
      `YTD:  Gross ${formatCurrency(calculations.ytdGrossPay)}  |  Deductions ${formatCurrency(calculations.ytdTotalDeductions)}  |  Net ${formatCurrency(calculations.ytdNetPay)}`,
      margin,
      y
    );
  }
}
