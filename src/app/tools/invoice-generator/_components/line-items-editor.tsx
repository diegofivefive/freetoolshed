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

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border text-left text-xs font-medium text-muted-foreground">
              <th className="pb-2 pr-2">Description</th>
              <th className="w-24 px-2 pb-2 text-right">Qty</th>
              <th className="w-20 px-2 pb-2 text-center">Unit</th>
              <th className="w-32 px-2 pb-2 text-right">Unit Price</th>
              <th className="w-16 px-2 pb-2 text-center">Tax</th>
              <th className="w-32 px-2 pb-2 text-right">Amount</th>
              <th className="w-10 pb-2 pl-2" />
            </tr>
          </thead>
          <tbody>
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
          </tbody>
        </table>
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
