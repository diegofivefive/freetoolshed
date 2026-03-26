"use client";

import { useReducer, useMemo, useEffect, useRef, useCallback, useState } from "react";
import { InvoiceForm } from "./invoice-form";
import { InvoicePreview } from "./invoice-preview";
import { useContainerWidth } from "./use-container-width";
import type {
  InvoiceData,
  InvoiceAction,
  InvoiceCalculations,
} from "@/lib/invoice/types";
import { createDefaultInvoiceData } from "@/lib/invoice/constants";
import { calculateInvoice } from "@/lib/invoice/calculations";
import { saveDraft, loadDraft, getNextInvoiceNumber, loadDefaults } from "@/lib/invoice/storage";

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
  const [containerRef, containerWidth] = useContainerWidth();
  const [showPreview, setShowPreview] = useState(true);
  // Use card layout when preview is on, OR when container is too narrow for table
  const useCompactItems = showPreview || containerWidth < 768;
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
    // Skip saving on initial mount (we just loaded the draft)
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
    <div ref={containerRef} className={showPreview ? "overflow-x-auto [transform:scaleY(-1)]" : ""}>
      <div className={showPreview ? "flex min-w-[880px] gap-6 [transform:scaleY(-1)]" : "flex gap-6"}>
        {/* Form — left side */}
        <div className={showPreview ? "min-w-[340px] flex-1" : "min-w-0 flex-1"}>
          <InvoiceForm
            state={state}
            calculations={calculations}
            dispatch={dispatch}
            onNewInvoice={handleNewInvoice}
            showPreview={showPreview}
            onTogglePreview={() => setShowPreview((p) => !p)}
            compact={useCompactItems}
          />
        </div>

        {/* Preview — right side */}
        {showPreview && (
          <div className="w-[520px] shrink-0">
            <div className="sticky top-20">
              <div className="overflow-hidden rounded-lg border border-border bg-white shadow-sm">
                <InvoicePreview state={state} calculations={calculations} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
