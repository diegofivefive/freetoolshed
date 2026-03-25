"use client";

import type { Dispatch } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import type { LineItem, InvoiceAction, CurrencyCode } from "@/lib/invoice/types";
import { formatCurrency } from "@/lib/invoice/format";

interface LineItemRowProps {
  item: LineItem;
  currency: CurrencyCode;
  lineAmount: number;
  canDelete: boolean;
  dispatch: Dispatch<InvoiceAction>;
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
    <tr className="group border-b border-border last:border-b-0">
      {/* Description */}
      <td className="py-2 pr-2">
        <Input
          placeholder="Item description"
          value={item.description}
          onChange={(e) => update({ description: e.target.value })}
          className="h-9"
        />
      </td>

      {/* Quantity */}
      <td className="w-24 px-2 py-2">
        <Input
          type="number"
          min={0}
          step={1}
          value={item.quantity}
          onChange={(e) => update({ quantity: Number(e.target.value) })}
          className="h-9 text-right"
        />
      </td>

      {/* Unit Price */}
      <td className="w-32 px-2 py-2">
        <Input
          type="number"
          min={0}
          step={0.01}
          value={item.unitPrice}
          onChange={(e) => update({ unitPrice: Number(e.target.value) })}
          className="h-9 text-right"
        />
      </td>

      {/* Tax toggle */}
      <td className="w-16 px-2 py-2 text-center">
        <input
          type="checkbox"
          checked={item.taxEnabled}
          onChange={(e) => update({ taxEnabled: e.target.checked })}
          className="size-4 rounded border-border accent-brand"
          aria-label="Apply tax to this item"
        />
      </td>

      {/* Amount (computed) */}
      <td className="w-32 px-2 py-2 text-right text-sm font-medium tabular-nums">
        {formatCurrency(lineAmount, currency)}
      </td>

      {/* Delete */}
      <td className="w-10 py-2 pl-2">
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() =>
            dispatch({ type: "REMOVE_LINE_ITEM", payload: item.id })
          }
          disabled={!canDelete}
          aria-label="Remove line item"
          className="opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
        >
          <Trash2 className="size-3.5 text-muted-foreground" />
        </Button>
      </td>
    </tr>
  );
}
