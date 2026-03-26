"use client";

import type { Dispatch } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { LineItemRow } from "./line-item-row";
import type {
  LineItem,
  InvoiceAction,
  CurrencyCode,
  LineItemTotal,
} from "@/lib/invoice/types";

interface LineItemsEditorProps {
  lineItems: LineItem[];
  lineItemTotals: LineItemTotal[];
  currency: CurrencyCode;
  dispatch: Dispatch<InvoiceAction>;
}

export function LineItemsEditor({
  lineItems,
  lineItemTotals,
  currency,
  dispatch,
}: LineItemsEditorProps) {
  const canDelete = lineItems.length > 1;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold">Line Items</h3>

      <div className="space-y-3">
        {lineItems.map((item) => {
          const total = lineItemTotals.find((t) => t.id === item.id);
          return (
            <LineItemRow
              key={item.id}
              item={item}
              currency={currency}
              lineAmount={total?.amount ?? 0}
              canDelete={canDelete}
              dispatch={dispatch}
            />
          );
        })}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => dispatch({ type: "ADD_LINE_ITEM" })}
      >
        <Plus className="size-4" data-icon="inline-start" />
        Add Line Item
      </Button>
    </div>
  );
}
