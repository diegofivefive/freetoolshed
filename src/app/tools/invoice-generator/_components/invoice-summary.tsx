"use client";

import type { Dispatch } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type {
  InvoiceSettings,
  InvoiceAction,
  InvoiceCalculations,
  DiscountType,
} from "@/lib/invoice/types";
import { formatCurrency } from "@/lib/invoice/format";

interface InvoiceSummaryProps {
  settings: InvoiceSettings;
  calculations: InvoiceCalculations;
  dispatch: Dispatch<InvoiceAction>;
}

export function InvoiceSummary({
  settings,
  calculations,
  dispatch,
}: InvoiceSummaryProps) {
  const { currency, taxRate, discountType, discountValue } = settings;
  const { subtotal, totalTax, discountAmount, grandTotal } = calculations;

  const toggleDiscountType = () => {
    const next: DiscountType =
      discountType === "percentage" ? "flat" : "percentage";
    dispatch({ type: "SET_SETTINGS", payload: { discountType: next } });
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold">Summary</h3>

      <div className="rounded-lg border border-border p-4">
        <div className="space-y-2.5">
          {/* Subtotal */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium tabular-nums">
              {formatCurrency(subtotal, currency)}
            </span>
          </div>

          {/* Tax */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Tax</span>
            <Input
              type="number"
              min={0}
              max={100}
              step={0.5}
              value={taxRate}
              onChange={(e) =>
                dispatch({
                  type: "SET_SETTINGS",
                  payload: { taxRate: Number(e.target.value) },
                })
              }
              className="h-7 w-20 text-right text-sm"
            />
            <span className="text-sm text-muted-foreground">%</span>
            <span className="ml-auto text-sm font-medium tabular-nums">
              {formatCurrency(totalTax, currency)}
            </span>
          </div>

          {/* Discount */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Discount</span>
            <Input
              type="number"
              min={0}
              step={discountType === "percentage" ? 1 : 0.01}
              value={discountValue}
              onChange={(e) =>
                dispatch({
                  type: "SET_SETTINGS",
                  payload: { discountValue: Number(e.target.value) },
                })
              }
              className="h-7 w-20 text-right text-sm"
            />
            <Button
              variant="outline"
              size="xs"
              onClick={toggleDiscountType}
              className="h-7 w-8 px-0 text-xs"
              aria-label={`Switch to ${discountType === "percentage" ? "flat" : "percentage"} discount`}
            >
              {discountType === "percentage" ? "%" : currency}
            </Button>
            {discountAmount > 0 && (
              <span className="ml-auto text-sm font-medium tabular-nums text-destructive">
                -{formatCurrency(discountAmount, currency)}
              </span>
            )}
          </div>

          <Separator />

          {/* Grand Total */}
          <div className="flex items-center justify-between">
            <span className="font-semibold">Total</span>
            <span className="text-lg font-bold tabular-nums text-brand">
              {formatCurrency(grandTotal, currency)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
