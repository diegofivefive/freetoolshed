"use client";

import type { Dispatch } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import type { InvoiceSettings, InvoiceAction, CurrencyCode, PaymentTerms } from "@/lib/invoice/types";
import { CURRENCIES, PAYMENT_TERMS_OPTIONS, calculateDueDate } from "@/lib/invoice/constants";

interface InvoiceSettingsProps {
  settings: InvoiceSettings;
  dispatch: Dispatch<InvoiceAction>;
}

export function InvoiceSettingsFields({
  settings,
  dispatch,
}: InvoiceSettingsProps) {
  const handlePaymentTermsChange = (value: PaymentTerms) => {
    const dueDate = calculateDueDate(
      settings.invoiceDate,
      value,
      settings.customTermsDays
    );
    dispatch({
      type: "SET_SETTINGS",
      payload: { paymentTerms: value, dueDate },
    });
  };

  const handleInvoiceDateChange = (date: string) => {
    const dueDate = calculateDueDate(
      date,
      settings.paymentTerms,
      settings.customTermsDays
    );
    dispatch({
      type: "SET_SETTINGS",
      payload: { invoiceDate: date, dueDate },
    });
  };

  const handleCustomDaysChange = (days: number) => {
    const dueDate = calculateDueDate(
      settings.invoiceDate,
      "custom",
      days
    );
    dispatch({
      type: "SET_SETTINGS",
      payload: { customTermsDays: days, dueDate },
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">Invoice Details</h3>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {/* Invoice Number */}
        <div className="space-y-1.5">
          <Label htmlFor="invoice-number">Invoice #</Label>
          <Input
            id="invoice-number"
            value={settings.invoiceNumber}
            onChange={(e) =>
              dispatch({
                type: "SET_SETTINGS",
                payload: { invoiceNumber: e.target.value },
              })
            }
          />
        </div>

        {/* Invoice Date */}
        <div className="space-y-1.5">
          <Label htmlFor="invoice-date">Invoice Date</Label>
          <Input
            id="invoice-date"
            type="date"
            value={settings.invoiceDate}
            onChange={(e) => handleInvoiceDateChange(e.target.value)}
          />
        </div>

        {/* Payment Terms */}
        <div className="space-y-1.5">
          <Label>Payment Terms</Label>
          <Select
            value={settings.paymentTerms}
            onValueChange={(val) => handlePaymentTermsChange(val as PaymentTerms)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAYMENT_TERMS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Due Date */}
        <div className="space-y-1.5">
          <Label htmlFor="due-date">Due Date</Label>
          <Input
            id="due-date"
            type="date"
            value={settings.dueDate}
            onChange={(e) =>
              dispatch({
                type: "SET_SETTINGS",
                payload: { dueDate: e.target.value },
              })
            }
          />
        </div>
      </div>

      {/* Custom days row */}
      {settings.paymentTerms === "custom" && (
        <div className="flex items-center gap-2">
          <Label htmlFor="custom-days" className="shrink-0">
            Custom days:
          </Label>
          <Input
            id="custom-days"
            type="number"
            min={1}
            className="w-24"
            value={settings.customTermsDays ?? 30}
            onChange={(e) => handleCustomDaysChange(Number(e.target.value))}
          />
        </div>
      )}

      {/* Currency */}
      <div className="space-y-1.5">
        <Label>Currency</Label>
        <Select
          value={settings.currency}
          onValueChange={(val) =>
            dispatch({
              type: "SET_SETTINGS",
              payload: { currency: val as CurrencyCode },
            })
          }
        >
          <SelectTrigger className="w-full max-w-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CURRENCIES.map((c) => (
              <SelectItem key={c.code} value={c.code}>
                {c.symbol} — {c.name} ({c.code})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
