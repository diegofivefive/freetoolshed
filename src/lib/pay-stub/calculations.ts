import type {
  EarningsEntry,
  DeductionEntry,
  PayStubCalculations,
} from "./types";

export function calculateEarningAmount(entry: EarningsEntry): number {
  if (entry.type === "regular" || entry.type === "overtime") {
    return round2(entry.hours * entry.rate);
  }
  return round2(entry.rate);
}

export function calculatePayStub(
  earnings: EarningsEntry[],
  deductions: DeductionEntry[]
): PayStubCalculations {
  const grossPay = earnings.reduce((sum, e) => sum + e.currentAmount, 0);

  const totalPreTaxDeductions = deductions
    .filter((d) => d.category === "pre-tax")
    .reduce((sum, d) => sum + d.currentAmount, 0);

  const totalPostTaxDeductions = deductions
    .filter((d) => d.category === "post-tax")
    .reduce((sum, d) => sum + d.currentAmount, 0);

  const totalDeductions = totalPreTaxDeductions + totalPostTaxDeductions;
  const netPay = grossPay - totalDeductions;

  const ytdGrossPay = earnings.reduce((sum, e) => sum + e.ytdAmount, 0);
  const ytdTotalDeductions = deductions.reduce(
    (sum, d) => sum + d.ytdAmount,
    0
  );
  const ytdNetPay = ytdGrossPay - ytdTotalDeductions;

  return {
    grossPay: round2(grossPay),
    totalPreTaxDeductions: round2(totalPreTaxDeductions),
    totalPostTaxDeductions: round2(totalPostTaxDeductions),
    totalDeductions: round2(totalDeductions),
    netPay: round2(netPay),
    ytdGrossPay: round2(ytdGrossPay),
    ytdTotalDeductions: round2(ytdTotalDeductions),
    ytdNetPay: round2(ytdNetPay),
  };
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
