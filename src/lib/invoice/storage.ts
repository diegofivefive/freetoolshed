import type { InvoiceData } from "./types";

const DRAFT_KEY = "freetoolshed-invoice-draft";
const INVOICE_NUMBER_KEY = "freetoolshed-invoice-last-number";

export function saveDraft(data: InvoiceData): void {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
  } catch {
    // QuotaExceededError or other storage errors — silently fail
  }
}

export function loadDraft(): InvoiceData | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as InvoiceData;
  } catch {
    return null;
  }
}

export function clearDraft(): void {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    // silently fail
  }
}

export function getNextInvoiceNumber(): string {
  try {
    const raw = localStorage.getItem(INVOICE_NUMBER_KEY);
    const last = raw ? parseInt(raw, 10) : 0;
    const next = last + 1;
    return `INV-${String(next).padStart(4, "0")}`;
  } catch {
    return "INV-0001";
  }
}

export function saveInvoiceNumber(invoiceNumber: string): void {
  try {
    const match = invoiceNumber.match(/(\d+)$/);
    if (match) {
      localStorage.setItem(INVOICE_NUMBER_KEY, match[1]);
    }
  } catch {
    // silently fail
  }
}
