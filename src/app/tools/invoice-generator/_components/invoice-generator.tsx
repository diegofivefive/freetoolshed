"use client";

import { useReducer, useMemo, useEffect, useRef, useCallback, useState } from "react";
import { InvoiceForm } from "./invoice-form";
import { InvoicePreview } from "./invoice-preview";
import type {
  InvoiceData,
  InvoiceAction,
  InvoiceCalculations,
} from "@/lib/invoice/types";
import { createDefaultInvoiceData } from "@/lib/invoice/constants";
import { calculateInvoice } from "@/lib/invoice/calculations";
import { saveDraft, loadDraft, getNextInvoiceNumber, loadDefaults } from "@/lib/invoice/storage";
import { ToolGuide } from "@/components/shared/tool-guide";
import type { ToolGuideSection } from "@/components/shared/tool-guide";

const INVOICE_GUIDE_SECTIONS: ToolGuideSection[] = [
  {
    title: "Getting Started",
    content:
      "Fill in your company details and client information in the Details tab. Set the invoice number, date, and payment terms. The due date calculates automatically based on your payment terms.",
    steps: [
      "Enter your company name, address, and contact info",
      "Add your client's name and details",
      "Set invoice number, date, and payment terms",
      "Move to the Items tab to add line items",
    ],
  },
  {
    title: "Adding Line Items",
    content:
      "Each line item has a description, quantity, unit type, and unit price. Toggle the tax checkbox per item to control which items are taxed. You must have at least one line item.",
    steps: [
      "Click \"Add Item\" to add a new line",
      "Choose a unit type: Item, Hour, Day, Unit, or Service",
      "Enable/disable tax per item with the tax checkbox",
      "Amounts calculate automatically (qty × price)",
    ],
  },
  {
    title: "Tax & Discounts",
    content:
      "Set a tax rate percentage in the summary section — it applies only to line items with tax enabled. Add a discount as a percentage or flat amount.",
    steps: [
      "Tax rate applies to items with the tax checkbox on",
      "Toggle discount between % and flat currency",
      "Grand total = subtotal + tax - discount",
    ],
  },
  {
    title: "Templates & Styling",
    content:
      "Switch between three PDF templates in the Style tab. Customize the accent color, upload your logo, and choose a date format.",
    steps: [
      "Modern — clean, minimal with whitespace",
      "Classic — traditional with full borders",
      "Compact — dense layout for many line items",
      "Pick from 8 preset colors or enter a custom hex",
    ],
  },
  {
    title: "Notes & Payment",
    content:
      "Add a memo, terms & conditions, and a payment link (Stripe, PayPal, etc.) in the Notes tab. Set the invoice status to Draft, Sent, Paid, or Overdue.",
  },
  {
    title: "Export & Print",
    content:
      "Download as PDF or print directly from the browser. The filename is auto-generated from the invoice number and client name. Both company name and client name are required to export.",
  },
  {
    title: "Saving & History",
    content:
      "Your invoice auto-saves as you type. Use the History panel to save snapshots, duplicate past invoices, or export/import as JSON. Save your company info as defaults for future invoices.",
    steps: [
      "Auto-saves every second to localStorage",
      "History panel: save, load, duplicate, or delete invoices",
      "Export single invoice or all invoices as JSON",
      "\"Save Company as Default\" pre-fills future invoices",
    ],
  },
  {
    title: "Multi-Currency",
    content:
      "Choose from 20 currencies in the Details tab. Amounts format automatically with the correct symbol and decimal places (e.g., JPY and KRW use no decimals).",
  },
];

function invoiceReducer(
  state: InvoiceData,
  action: InvoiceAction
): InvoiceData {
  switch (action.type) {
    case "SET_COMPANY":
      return { ...state, company: { ...state.company, ...action.payload } };
    case "SET_CLIENT":
      return { ...state, client: { ...state.client, ...action.payload } };
    case "SET_SETTINGS":
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
      };
    case "SET_NOTES":
      return { ...state, notes: action.payload };
    case "SET_TERMS":
      return { ...state, terms: action.payload };
    case "ADD_LINE_ITEM":
      return {
        ...state,
        lineItems: [
          ...state.lineItems,
          {
            id: crypto.randomUUID(),
            description: "",
            quantity: 1,
            unitPrice: 0,
            taxEnabled: false,
            taxRate: 0,
            unitType: "item",
          },
        ],
      };
    case "REMOVE_LINE_ITEM":
      return {
        ...state,
        lineItems: state.lineItems.filter(
          (item) => item.id !== action.payload
        ),
      };
    case "UPDATE_LINE_ITEM":
      return {
        ...state,
        lineItems: state.lineItems.map((item) =>
          item.id === action.payload.id
            ? { ...item, ...action.payload }
            : item
        ),
      };
    case "REORDER_LINE_ITEMS":
      return { ...state, lineItems: action.payload };
    case "SET_LOGO":
      return {
        ...state,
        company: { ...state.company, logoUrl: action.payload },
      };
    case "SET_STATUS":
      return { ...state, status: action.payload };
    case "SET_PAYMENT_LINK":
      return { ...state, paymentLink: action.payload };
    case "LOAD_DRAFT":
      return action.payload;
    case "RESET": {
      const fresh = createDefaultInvoiceData();
      fresh.settings.invoiceNumber = getNextInvoiceNumber();
      const defaults = loadDefaults();
      if (defaults) {
        fresh.company = { ...fresh.company, ...defaults.company };
        fresh.settings = { ...fresh.settings, ...defaults.settings };
      }
      return fresh;
    }
    default:
      return state;
  }
}

export function InvoiceGenerator() {
  const [showPreview, setShowPreview] = useState(true);
  const [state, dispatch] = useReducer(
    invoiceReducer,
    null,
    () => {
      const draft = loadDraft();
      if (draft) return draft;
      const fresh = createDefaultInvoiceData();
      fresh.settings.invoiceNumber = getNextInvoiceNumber();
      const defaults = loadDefaults();
      if (defaults) {
        fresh.company = { ...fresh.company, ...defaults.company };
        fresh.settings = { ...fresh.settings, ...defaults.settings };
      }
      return fresh;
    }
  );

  const calculations: InvoiceCalculations = useMemo(
    () => calculateInvoice(state.lineItems, state.settings),
    [state.lineItems, state.settings]
  );

  // Auto-save with 1s debounce
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      saveDraft(state);
    }, 1000);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [state]);

  const handleNewInvoice = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  return (
    <>
    <div className="flex gap-6">
      {/* Form */}
      <div className="min-w-0 flex-1">
        <InvoiceForm
          state={state}
          calculations={calculations}
          dispatch={dispatch}
          onNewInvoice={handleNewInvoice}
          showPreview={showPreview}
          onTogglePreview={() => setShowPreview((p) => !p)}
        />
      </div>

      {/* Preview — visible at xl+ by default, toggle overrides */}
      <div
        className={
          showPreview
            ? "hidden w-[520px] shrink-0 xl:block"
            : "hidden"
        }
      >
        <div className="sticky top-20">
          <div className="overflow-hidden rounded-lg border border-border bg-white shadow-sm">
            <InvoicePreview state={state} calculations={calculations} />
          </div>
        </div>
      </div>
    </div>
    <ToolGuide sections={INVOICE_GUIDE_SECTIONS} />
    </>
  );
}
