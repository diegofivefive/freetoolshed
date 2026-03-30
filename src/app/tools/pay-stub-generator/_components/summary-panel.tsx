"use client";

import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/pay-stub/format";
import type { PayStubCalculations } from "@/lib/pay-stub/types";

interface SummaryPanelProps {
  calculations: PayStubCalculations;
}

export function SummaryPanel({ calculations }: SummaryPanelProps) {
  const {
    grossPay,
    totalPreTaxDeductions,
    totalPostTaxDeductions,
    totalDeductions,
    netPay,
    ytdGrossPay,
    ytdTotalDeductions,
    ytdNetPay,
  } = calculations;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold">Summary</h3>

      <div className="rounded-lg border border-border p-4">
        <div className="space-y-2.5">
          {/* Gross Pay */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Gross Pay</span>
            <span className="font-medium tabular-nums">
              {formatCurrency(grossPay)}
            </span>
          </div>

          {/* Pre-Tax Deductions */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              (–) Pre-Tax Deductions
            </span>
            <span className="tabular-nums text-pink-400">
              {totalPreTaxDeductions > 0
                ? `–${formatCurrency(totalPreTaxDeductions)}`
                : formatCurrency(0)}
            </span>
          </div>

          {/* Post-Tax Deductions */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              (–) Post-Tax Deductions
            </span>
            <span className="tabular-nums text-pink-400">
              {totalPostTaxDeductions > 0
                ? `–${formatCurrency(totalPostTaxDeductions)}`
                : formatCurrency(0)}
            </span>
          </div>

          <Separator />

          {/* Net Pay */}
          <div className="flex items-center justify-between">
            <span className="font-semibold">Net Pay</span>
            <span className="text-lg font-bold tabular-nums text-brand">
              {formatCurrency(netPay)}
            </span>
          </div>
        </div>

        {/* YTD Summary */}
        {(ytdGrossPay > 0 || ytdTotalDeductions > 0) && (
          <>
            <Separator className="my-3" />
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Year-to-Date
              </h4>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">YTD Gross</span>
                <span className="tabular-nums">
                  {formatCurrency(ytdGrossPay)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">YTD Deductions</span>
                <span className="tabular-nums">
                  {ytdTotalDeductions > 0
                    ? `–${formatCurrency(ytdTotalDeductions)}`
                    : formatCurrency(0)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">YTD Net</span>
                <span className="font-medium tabular-nums text-brand">
                  {formatCurrency(ytdNetPay)}
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
