"use client";

import { useState } from "react";
import type { Dispatch } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Trash2 } from "lucide-react";
import type { LineItem, InvoiceAction, CurrencyCode } from "@/lib/invoice/types";
import { formatCurrency } from "@/lib/invoice/format";
import { UNIT_TYPES } from "@/lib/invoice/constants";

interface LineItemRowProps {
  item: LineItem;
  currency: CurrencyCode;
  lineAmount: number;
  canDelete: boolean;
  dispatch: Dispatch<InvoiceAction>;
}

const PRESET_VALUES: string[] = UNIT_TYPES.map((u) => u.value);

function UnitTypeCell({
  unitType,
  onChange,
}: {
  unitType: string;
  onChange: (value: string) => void;
}) {
  const isPreset = PRESET_VALUES.includes(unitType);
  const [isCustom, setIsCustom] = useState(!isPreset);

  const selectValue = isCustom ? "__custom__" : unitType;

  return isCustom ? (
    <Input
      value={unitType === "item" ? "" : unitType}
      placeholder="Custom"
      onChange={(e) => onChange(e.target.value)}
      onBlur={() => {
        if (!unitType || PRESET_VALUES.includes(unitType)) {
          setIsCustom(false);
        }
      }}
      className="h-8 text-xs"
      autoFocus
    />
  ) : (
    <Select
      value={selectValue}
      onValueChange={(val) => {
        if (!val) return;
        if (val === "__custom__") {
          setIsCustom(true);
          onChange("");
        } else {
          onChange(val);
        }
      }}
    >
      <SelectTrigger className="h-8 text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {UNIT_TYPES.map((u) => (
          <SelectItem key={u.value} value={u.value}>
            {u.label}
          </SelectItem>
        ))}
        <SelectItem value="__custom__">Custom...</SelectItem>
      </SelectContent>
    </Select>
  );
}

export function LineItemRow({
  item,
  currency,
  lineAmount,
  canDelete,
  dispatch,
}: LineItemRowProps) {
  const update = (payload: Partial<LineItem>) =>
    dispatch({
      type: "UPDATE_LINE_ITEM",
      payload: { id: item.id, ...payload },
    });

  return (
    <div className="group overflow-hidden rounded-lg border border-border bg-card p-3 transition-colors hover:border-muted-foreground/30">
      {/* Row 1: Description + delete */}
      <div className="flex items-center gap-2">
        <Input
          placeholder="Item description"
          value={item.description}
          onChange={(e) => update({ description: e.target.value })}
          className="h-8 flex-1"
        />
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() =>
            dispatch({ type: "REMOVE_LINE_ITEM", payload: item.id })
          }
          disabled={!canDelete}
          aria-label="Remove line item"
          className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
        >
          <Trash2 className="size-3.5 text-muted-foreground" />
        </Button>
      </div>

      {/* Row 2: Qty, Unit, Price, Tax, Amount */}
      <div className="mt-2 flex items-end gap-1.5">
        <div className="min-w-0 flex-[2]">
          <label className="mb-0.5 block text-[10px] text-muted-foreground">Qty</label>
          <Input
            type="number"
            min={0}
            step={1}
            value={item.quantity}
            onChange={(e) => update({ quantity: Number(e.target.value) })}
            className="h-8 text-right text-xs"
          />
        </div>
        <div className="min-w-0 flex-[3]">
          <label className="mb-0.5 block text-[10px] text-muted-foreground">Unit</label>
          <UnitTypeCell unitType={item.unitType} onChange={(v) => update({ unitType: v })} />
        </div>
        <div className="min-w-0 flex-[4]">
          <label className="mb-0.5 block text-[10px] text-muted-foreground">Price</label>
          <Input
            type="number"
            min={0}
            step={0.01}
            value={item.unitPrice}
            onChange={(e) => update({ unitPrice: Number(e.target.value) })}
            className="h-8 text-right text-xs"
          />
        </div>
        <div className="flex shrink-0 flex-col items-center pb-1.5">
          <label className="mb-0.5 block text-[10px] text-muted-foreground">Tax</label>
          <input
            type="checkbox"
            checked={item.taxEnabled}
            onChange={(e) => update({ taxEnabled: e.target.checked })}
            className="size-4 rounded border-border accent-brand"
            aria-label="Apply tax to this item"
          />
        </div>
        <div className="min-w-0 flex-[3] text-right">
          <label className="mb-0.5 block text-[10px] text-muted-foreground">Amount</label>
          <div className="pb-1 text-sm font-medium tabular-nums">
            {formatCurrency(lineAmount, currency)}
          </div>
        </div>
      </div>
    </div>
  );
}
