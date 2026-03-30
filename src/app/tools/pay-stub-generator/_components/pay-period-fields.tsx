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
import type { PayPeriod, PayStubAction, PayFrequency } from "@/lib/pay-stub/types";
import { PAY_FREQUENCY_OPTIONS } from "@/lib/pay-stub/constants";

interface PayPeriodFieldsProps {
  payPeriod: PayPeriod;
  dispatch: Dispatch<PayStubAction>;
}

function calculateEndDate(startDate: string, frequency: PayFrequency): string {
  if (!startDate) return "";
  const start = new Date(startDate + "T00:00:00");
  switch (frequency) {
    case "weekly":
      start.setDate(start.getDate() + 6);
      break;
    case "bi-weekly":
      start.setDate(start.getDate() + 13);
      break;
    case "semi-monthly":
      start.setDate(start.getDate() + 14);
      break;
    case "monthly":
      start.setMonth(start.getMonth() + 1);
      start.setDate(start.getDate() - 1);
      break;
  }
  return start.toISOString().split("T")[0];
}

export function PayPeriodFields({ payPeriod, dispatch }: PayPeriodFieldsProps) {
  const update = (payload: Partial<PayPeriod>) =>
    dispatch({ type: "SET_PAY_PERIOD", payload });

  const handleStartDateChange = (startDate: string) => {
    const endDate = calculateEndDate(startDate, payPeriod.payFrequency);
    update({ startDate, endDate, payDate: endDate });
  };

  const handleFrequencyChange = (frequency: PayFrequency) => {
    const endDate = calculateEndDate(payPeriod.startDate, frequency);
    update({ payFrequency: frequency, endDate, payDate: endDate });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">Pay Period</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="pay-frequency">Pay Frequency</Label>
          <Select
            value={payPeriod.payFrequency}
            onValueChange={(val) =>
              handleFrequencyChange(val as PayFrequency)
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAY_FREQUENCY_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="pay-date">Pay Date *</Label>
          <Input
            id="pay-date"
            type="date"
            value={payPeriod.payDate}
            onChange={(e) => update({ payDate: e.target.value })}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="period-start">Period Start *</Label>
          <Input
            id="period-start"
            type="date"
            value={payPeriod.startDate}
            onChange={(e) => handleStartDateChange(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="period-end">Period End *</Label>
          <Input
            id="period-end"
            type="date"
            value={payPeriod.endDate}
            onChange={(e) => update({ endDate: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}
