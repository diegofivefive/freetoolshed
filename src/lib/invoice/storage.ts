import type {
  InvoiceData,
  InvoiceDefaults,
  SavedInvoice,
  ExportEnvelope,
} from "./types";
import { exportEnvelopeSchema } from "./schema";
import { createDefaultInvoiceData, calculateDueDate } from "./constants";

// ── Storage keys ──────────────────────────────────────────────
const DRAFT_KEY = "freetoolshed-invoice-draft";
const INVOICE_NUMBER_KEY = "freetoolshed-invoice-last-number";
const HISTORY_KEY = "freetoolshed-invoice-history";
const DEFAULTS_KEY = "freetoolshed-invoice-defaults";

// ── Migration ─────────────────────────────────────────────────
// Fills missing fields added in Phase 2 so old localStorage drafts still load.

export function migrateInvoiceData(raw: Record<string, unknown>): InvoiceData {
  const defaults = createDefaultInvoiceData();

  const company = { ...defaults.company, ...(raw.company as object ?? {}) };
  const client = { ...defaults.client, ...(raw.client as object ?? {}) };
  const settings = { ...defaults.settings, ...(raw.settings as object ?? {}) };

  // Migrate line items — add unitType if missing
  const rawItems = Array.isArray(raw.lineItems) ? raw.lineItems : defaults.lineItems;
  const lineItems = rawItems.map((item: Record<string, unknown>) => ({
    id: (item.id as string) ?? crypto.randomUUID(),
    description: (item.description as string) ?? "",
    quantity: (item.quantity as number) ?? 1,
    unitPrice: (item.unitPrice as number) ?? 0,
    taxEnabled: (item.taxEnabled as boolean) ?? false,
    taxRate: (item.taxRate as number) ?? 0,
    unitType: (item.unitType as string) ?? "item",
  }));

  return {
    company,
    client,
    lineItems,
    settings,
    notes: (raw.notes as string) ?? "",
    terms: (raw.terms as string) ?? "",
    status: (raw.status as InvoiceData["status"]) ?? "draft",
    paymentLink: (raw.paymentLink as string) ?? "",
  };
}

// ── Draft persistence ─────────────────────────────────────────

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
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return migrateInvoiceData(parsed);
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

// ── Invoice number auto-increment ─────────────────────────────

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

// ── Invoice history (saved invoices) ──────────────────────────

export function loadHistory(): SavedInvoice[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavedInvoice[];
    // Migrate each invoice's data for backward compat
    return parsed.map((inv) => ({
      ...inv,
      data: migrateInvoiceData(inv.data as unknown as Record<string, unknown>),
    }));
  } catch {
    return [];
  }
}

function persistHistory(history: SavedInvoice[]): void {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    // QuotaExceededError — silently fail
  }
}

export function saveToHistory(data: InvoiceData): SavedInvoice {
  const history = loadHistory();
  const now = new Date().toISOString();
  const saved: SavedInvoice = {
    id: crypto.randomUUID(),
    data,
    createdAt: now,
    updatedAt: now,
  };
  // Newest first
  history.unshift(saved);
  persistHistory(history);
  return saved;
}

export function deleteFromHistory(id: string): void {
  const history = loadHistory().filter((inv) => inv.id !== id);
  persistHistory(history);
}

export function duplicateFromHistory(id: string): InvoiceData | null {
  const history = loadHistory();
  const source = history.find((inv) => inv.id === id);
  if (!source) return null;

  const cloned = structuredClone(source.data);
  const nextNumber = getNextInvoiceNumber();
  const today = new Date().toISOString().split("T")[0];

  cloned.settings.invoiceNumber = nextNumber;
  cloned.settings.invoiceDate = today;
  cloned.settings.dueDate = calculateDueDate(
    today,
    cloned.settings.paymentTerms,
    cloned.settings.customTermsDays
  );
  cloned.status = "draft";

  return cloned;
}

// ── Company / settings defaults ───────────────────────────────

export function saveDefaults(data: InvoiceData): void {
  try {
    const defaults: InvoiceDefaults = {
      company: { ...data.company },
      settings: {
        currency: data.settings.currency,
        taxRate: data.settings.taxRate,
        template: data.settings.template,
        accentColor: data.settings.accentColor,
        dateFormat: data.settings.dateFormat,
      },
    };
    localStorage.setItem(DEFAULTS_KEY, JSON.stringify(defaults));
  } catch {
    // silently fail
  }
}

export function loadDefaults(): InvoiceDefaults | null {
  try {
    const raw = localStorage.getItem(DEFAULTS_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as InvoiceDefaults;
  } catch {
    return null;
  }
}

// ── JSON export / import ──────────────────────────────────────

export function exportInvoiceJson(data: InvoiceData): string {
  const saved: SavedInvoice = {
    id: crypto.randomUUID(),
    data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const envelope: ExportEnvelope = {
    tool: "freetoolshed-invoice-generator",
    version: 1,
    exportedAt: new Date().toISOString(),
    invoices: [saved],
  };
  return JSON.stringify(envelope, null, 2);
}

export function exportAllJson(history: SavedInvoice[]): string {
  const envelope: ExportEnvelope = {
    tool: "freetoolshed-invoice-generator",
    version: 1,
    exportedAt: new Date().toISOString(),
    invoices: history,
  };
  return JSON.stringify(envelope, null, 2);
}

export interface ImportResult {
  success: true;
  invoices: SavedInvoice[];
}

export interface ImportError {
  success: false;
  error: string;
}

export function parseImportedJson(
  jsonString: string
): ImportResult | ImportError {
  try {
    const parsed = JSON.parse(jsonString);
    const result = exportEnvelopeSchema.safeParse(parsed);

    if (!result.success) {
      return {
        success: false,
        error: "Invalid invoice file format. Please use a file exported from Free Tool Shed.",
      };
    }

    // Migrate each invoice for forward compat
    const invoices: SavedInvoice[] = result.data.invoices.map((inv) => ({
      ...inv,
      data: migrateInvoiceData(inv.data as unknown as Record<string, unknown>),
    }));

    return { success: true, invoices };
  } catch {
    return {
      success: false,
      error: "Could not read the file. Make sure it is a valid JSON file.",
    };
  }
}
