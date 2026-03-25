"use client";

import type { Dispatch } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { InvoiceAction } from "@/lib/invoice/types";

interface NotesFieldsProps {
  notes: string;
  terms: string;
  dispatch: Dispatch<InvoiceAction>;
}

export function NotesFields({ notes, terms, dispatch }: NotesFieldsProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <Label htmlFor="invoice-notes">Notes / Memo</Label>
        <Textarea
          id="invoice-notes"
          placeholder="Thank you for your business! Payment is due within the terms specified above."
          value={notes}
          onChange={(e) =>
            dispatch({ type: "SET_NOTES", payload: e.target.value })
          }
          className="min-h-24"
        />
        <p className="text-xs text-muted-foreground">
          Visible to your client on the invoice.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="invoice-terms">Terms &amp; Conditions</Label>
        <Textarea
          id="invoice-terms"
          placeholder="Late payments may be subject to a fee of 1.5% per month. All sales are final."
          value={terms}
          onChange={(e) =>
            dispatch({ type: "SET_TERMS", payload: e.target.value })
          }
          className="min-h-24"
        />
        <p className="text-xs text-muted-foreground">
          Standard terms that appear at the bottom of your invoice.
        </p>
      </div>
    </div>
  );
}
