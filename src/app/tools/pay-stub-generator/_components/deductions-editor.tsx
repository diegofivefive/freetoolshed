"use client";

import type { Dispatch } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Plus, Trash2, ListChecks } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { DEDUCTION_TYPES } from "@/lib/pay-stub/constants";
import { formatCurrency } from "@/lib/pay-stub/format";
import type {
  DeductionEntry,
  DeductionCategory,
  DeductionType,
  PayStubAction,
} from "@/lib/pay-stub/types";

interface DeductionsEditorProps {
  deductions: DeductionEntry[];
  dispatch: Dispatch<PayStubAction>;
}

function DeductionRow({
  entry,
  dispatch,
  categoryTypes,
}: {
  entry: DeductionEntry;
  dispatch: Dispatch<PayStubAction>;
  categoryTypes: { label: string; value: DeductionType; category: DeductionCategory }[];
}) {
  return (
    <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_110px_90px_90px_32px] items-center gap-2">
      {/* Label */}
      <Input
        value={entry.label}
        placeholder="Deduction name"
        className="h-8 min-w-0 text-sm"
        onChange={(e) =>
          dispatch({
            type: "UPDATE_DEDUCTION",
            payload: { id: entry.id, label: e.target.value },
          })
        }
      />

      {/* Type */}
      <div className="min-w-0 overflow-hidden">
        <Select
          value={entry.type}
          onValueChange={(val) => {
            const match = DEDUCTION_TYPES.find((d) => d.value === val);
            dispatch({
              type: "UPDATE_DEDUCTION",
              payload: {
                id: entry.id,
                type: val as DeductionType,
                label: match?.label ?? entry.label,
              },
            });
          }}
        >
          <SelectTrigger className="h-8 w-full text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categoryTypes.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Current Amount */}
      <Input
        type="number"
        min={0}
        step={0.01}
        value={entry.currentAmount || ""}
        placeholder="0.00"
        className="h-8 text-right text-sm tabular-nums"
        onChange={(e) =>
          dispatch({
            type: "UPDATE_DEDUCTION",
            payload: {
              id: entry.id,
              currentAmount: Number(e.target.value),
            },
          })
        }
      />

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
            type: "UPDATE_DEDUCTION",
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
        onClick={() =>
          dispatch({ type: "REMOVE_DEDUCTION", payload: entry.id })
        }
        aria-label="Remove deduction"
      >
        <Trash2 className="size-3.5" />
      </Button>
    </div>
  );
}

function DeductionSection({
  title,
  category,
  deductions,
  dispatch,
}: {
  title: string;
  category: DeductionCategory;
  deductions: DeductionEntry[];
  dispatch: Dispatch<PayStubAction>;
}) {
  const categoryTypes = DEDUCTION_TYPES.filter((d) => d.category === category);
  const filtered = deductions.filter((d) => d.category === category);
  const total = filtered.reduce((sum, d) => sum + d.currentAmount, 0);
  const ytdTotal = filtered.reduce((sum, d) => sum + d.ytdAmount, 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </h4>
        {filtered.length > 0 && (
          <span className="text-xs tabular-nums text-muted-foreground">
            {formatCurrency(total)} / YTD {formatCurrency(ytdTotal)}
          </span>
        )}
      </div>

      {filtered.length > 0 && (
        <>
          {/* Column headers */}
          <div className="grid grid-cols-[minmax(0,1fr)_110px_90px_90px_32px] items-end gap-2 text-xs font-medium text-muted-foreground">
            <span>Description</span>
            <span>Type</span>
            <span className="text-right">Current</span>
            <span className="text-right">YTD</span>
            <span />
          </div>

          <div className="space-y-2">
            {filtered.map((entry) => (
              <DeductionRow
                key={entry.id}
                entry={entry}
                dispatch={dispatch}
                categoryTypes={categoryTypes}
              />
            ))}
          </div>
        </>
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={() =>
          dispatch({ type: "ADD_DEDUCTION", payload: { category } })
        }
      >
        <Plus className="size-4" data-icon="inline-start" />
        Add {category === "pre-tax" ? "Pre-Tax" : "Post-Tax"} Deduction
      </Button>
    </div>
  );
}

export function DeductionsEditor({
  deductions,
  dispatch,
}: DeductionsEditorProps) {
  const hasAnyPreset = deductions.some(
    (d) =>
      d.type === "federal-income-tax" ||
      d.type === "state-income-tax" ||
      d.type === "social-security" ||
      d.type === "medicare"
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Deductions</h3>
        {!hasAnyPreset && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => dispatch({ type: "APPLY_PRESET_DEDUCTIONS" })}
          >
            <ListChecks className="size-4" data-icon="inline-start" />
            Apply Standard US Deductions
          </Button>
        )}
      </div>

      <DeductionSection
        title="Pre-Tax Deductions"
        category="pre-tax"
        deductions={deductions}
        dispatch={dispatch}
      />

      <Separator />

      <DeductionSection
        title="Post-Tax Deductions"
        category="post-tax"
        deductions={deductions}
        dispatch={dispatch}
      />
    </div>
  );
}
