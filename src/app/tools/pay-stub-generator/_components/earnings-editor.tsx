"use client";

import type { Dispatch } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { EARNING_TYPES } from "@/lib/pay-stub/constants";
import { formatCurrency } from "@/lib/pay-stub/format";
import type {
  EarningsEntry,
  EarningType,
  PayType,
  PayStubAction,
} from "@/lib/pay-stub/types";

interface EarningsEditorProps {
  earnings: EarningsEntry[];
  payType: PayType;
  dispatch: Dispatch<PayStubAction>;
}

export function EarningsEditor({
  earnings,
  payType,
  dispatch,
}: EarningsEditorProps) {
  const isHourly = payType === "hourly";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Earnings</h3>
        <div className="flex items-center gap-1 rounded-lg border border-border p-0.5">
          <button
            type="button"
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
              isHourly
                ? "bg-brand text-white"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() =>
              dispatch({
                type: "SET_SETTINGS",
                payload: { payType: "hourly" },
              })
            }
          >
            Hourly
          </button>
          <button
            type="button"
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
              !isHourly
                ? "bg-brand text-white"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() =>
              dispatch({
                type: "SET_SETTINGS",
                payload: { payType: "salary" },
              })
            }
          >
            Salary
          </button>
        </div>
      </div>

      {/* Column headers */}
      <div
        className={`grid items-end gap-2 text-xs font-medium text-muted-foreground ${
          isHourly
            ? "grid-cols-[minmax(0,1fr)_80px_70px_70px_90px_80px_32px]"
            : "grid-cols-[minmax(0,1fr)_80px_90px_90px_80px_32px]"
        }`}
      >
        <span>Description</span>
        <span>Type</span>
        {isHourly && <span className="text-right">Hours</span>}
        <span className="text-right">{isHourly ? "Rate" : "Amount"}</span>
        <span className="text-right">Current</span>
        <span className="text-right">YTD</span>
        <span />
      </div>

      {/* Earnings rows */}
      <div className="space-y-2">
        {earnings.map((entry, index) => {
          const isFirst = index === 0;
          const showHoursRate =
            isHourly &&
            (entry.type === "regular" || entry.type === "overtime");

          return (
            <div
              key={entry.id}
              className={`grid items-center gap-2 ${
                isHourly
                  ? "grid-cols-[minmax(0,1fr)_80px_70px_70px_90px_80px_32px]"
                  : "grid-cols-[minmax(0,1fr)_80px_90px_90px_80px_32px]"
              }`}
            >
              {/* Label */}
              <Input
                value={entry.label}
                placeholder="Description"
                className="h-8 min-w-0 text-sm"
                onChange={(e) =>
                  dispatch({
                    type: "UPDATE_EARNING",
                    payload: { id: entry.id, label: e.target.value },
                  })
                }
              />

              {/* Type */}
              <div className="min-w-0 overflow-hidden">
                <Select
                  value={entry.type}
                  onValueChange={(val) =>
                    dispatch({
                      type: "UPDATE_EARNING",
                      payload: { id: entry.id, type: val as EarningType },
                    })
                  }
                >
                  <SelectTrigger className="h-8 w-full text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EARNING_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Hours (hourly mode only) */}
              {isHourly && (
                <Input
                  type="number"
                  min={0}
                  step={0.5}
                  value={showHoursRate ? entry.hours || "" : ""}
                  disabled={!showHoursRate}
                  placeholder={showHoursRate ? "0" : "—"}
                  className="h-8 text-right text-sm tabular-nums"
                  onChange={(e) =>
                    dispatch({
                      type: "UPDATE_EARNING",
                      payload: {
                        id: entry.id,
                        hours: Number(e.target.value),
                      },
                    })
                  }
                />
              )}

              {/* Rate / Amount */}
              <Input
                type="number"
                min={0}
                step={0.01}
                value={entry.rate || ""}
                placeholder="0.00"
                className="h-8 text-right text-sm tabular-nums"
                onChange={(e) => {
                  const rate = Number(e.target.value);
                  if (isHourly && showHoursRate) {
                    dispatch({
                      type: "UPDATE_EARNING",
                      payload: { id: entry.id, rate },
                    });
                  } else {
                    dispatch({
                      type: "UPDATE_EARNING",
                      payload: {
                        id: entry.id,
                        rate,
                        currentAmount: Math.round(rate * 100) / 100,
                      },
                    });
                  }
                }}
              />

              {/* Current Amount */}
              <div className="flex h-8 items-center justify-end rounded-md border border-border bg-muted/50 px-2 text-sm tabular-nums">
                {formatCurrency(entry.currentAmount)}
              </div>

              {/* YTD */}
              <Input
                type="number"
                min={0}
                step={0.01}
                value={entry.ytdAmount || ""}
                placeholder="0.00"
                className="h-8 text-right text-sm tabular-nums"
                onChange={(e) =>
                  dispatch({
                    type: "UPDATE_EARNING",
                    payload: {
                      id: entry.id,
                      ytdAmount: Number(e.target.value),
                    },
                  })
                }
              />

              {/* Delete */}
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                disabled={isFirst}
                onClick={() =>
                  dispatch({ type: "REMOVE_EARNING", payload: entry.id })
                }
                aria-label="Remove earning"
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          );
        })}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => dispatch({ type: "ADD_EARNING" })}
      >
        <Plus className="size-4" data-icon="inline-start" />
        Add Earning
      </Button>
    </div>
  );
}
