import type {
  PayStubData,
  PayStubDefaults,
  SavedPayStub,
  ExportEnvelope,
} from "./types";
import { createDefaultPayStubData } from "./constants";

// ── Storage keys ──────────────────────────────────────────────
const DRAFT_KEY = "freetoolshed-paystub-draft";
const HISTORY_KEY = "freetoolshed-paystub-history";
const DEFAULTS_KEY = "freetoolshed-paystub-defaults";

// ── Migration ─────────────────────────────────────────────────
// Fills missing fields so old localStorage drafts still load.

export function migratePayStubData(
  raw: Record<string, unknown>
): PayStubData {
  const defaults = createDefaultPayStubData();

  const employer = {
    ...defaults.employer,
    ...((raw.employer as object) ?? {}),
  };
  const employee = {
    ...defaults.employee,
    ...((raw.employee as object) ?? {}),
  };
  const payPeriod = {
    ...defaults.payPeriod,
    ...((raw.payPeriod as object) ?? {}),
  };
  const settings = {
    ...defaults.settings,
    ...((raw.settings as object) ?? {}),
  };

  const earnings = Array.isArray(raw.earnings)
    ? raw.earnings.map((e: Record<string, unknown>) => ({
        id: (e.id as string) ?? crypto.randomUUID(),
        label: (e.label as string) ?? "",
        type: (e.type as string) ?? "regular",
        hours: (e.hours as number) ?? 0,
        rate: (e.rate as number) ?? 0,
        currentAmount: (e.currentAmount as number) ?? 0,
        ytdAmount: (e.ytdAmount as number) ?? 0,
      }))
    : defaults.earnings;

  const deductions = Array.isArray(raw.deductions)
    ? raw.deductions.map((d: Record<string, unknown>) => ({
        id: (d.id as string) ?? crypto.randomUUID(),
        label: (d.label as string) ?? "",
        category: (d.category as string) ?? "pre-tax",
        type: (d.type as string) ?? "other",
        currentAmount: (d.currentAmount as number) ?? 0,
        ytdAmount: (d.ytdAmount as number) ?? 0,
      }))
    : defaults.deductions;

  return {
    employer,
    employee,
    payPeriod,
    earnings,
    deductions,
    settings,
  } as PayStubData;
}

// ── Draft persistence ─────────────────────────────────────────

export function saveDraft(data: PayStubData): void {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
  } catch {
    // QuotaExceededError or other storage errors — silently fail
  }
}

export function loadDraft(): PayStubData | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return migratePayStubData(parsed);
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

// ── Pay stub history (saved stubs) ────────────────────────────

export function loadHistory(): SavedPayStub[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavedPayStub[];
    return parsed.map((stub) => ({
      ...stub,
      data: migratePayStubData(
        stub.data as unknown as Record<string, unknown>
      ),
    }));
  } catch {
    return [];
  }
}

function persistHistory(history: SavedPayStub[]): void {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    // QuotaExceededError — silently fail
  }
}

export function saveToHistory(data: PayStubData): SavedPayStub {
  const history = loadHistory();
  const now = new Date().toISOString();
  const saved: SavedPayStub = {
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
  const history = loadHistory().filter((stub) => stub.id !== id);
  persistHistory(history);
}

export function duplicateFromHistory(id: string): PayStubData | null {
  const history = loadHistory();
  const source = history.find((stub) => stub.id === id);
  if (!source) return null;

  const cloned = structuredClone(source.data);
  const today = new Date().toISOString().split("T")[0];

  // Reset dates for new pay period, keep employer/employee/deductions
  cloned.payPeriod.payDate = today;
  cloned.payPeriod.startDate = today;
  cloned.payPeriod.endDate = today;

  // Reset current amounts but keep YTD
  cloned.earnings = cloned.earnings.map((e) => ({
    ...e,
    id: crypto.randomUUID(),
    currentAmount: 0,
    hours: 0,
  }));
  cloned.deductions = cloned.deductions.map((d) => ({
    ...d,
    id: crypto.randomUUID(),
    currentAmount: 0,
  }));

  return cloned;
}

// ── Employer / settings defaults ──────────────────────────────

export function saveDefaults(data: PayStubData): void {
  try {
    const defaults: PayStubDefaults = {
      employer: { ...data.employer },
      settings: {
        template: data.settings.template,
        accentColor: data.settings.accentColor,
        dateFormat: data.settings.dateFormat,
        payType: data.settings.payType,
      },
    };
    localStorage.setItem(DEFAULTS_KEY, JSON.stringify(defaults));
  } catch {
    // silently fail
  }
}

export function loadDefaults(): PayStubDefaults | null {
  try {
    const raw = localStorage.getItem(DEFAULTS_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PayStubDefaults;
  } catch {
    return null;
  }
}

// ── JSON export / import ──────────────────────────────────────

export function exportStubJson(data: PayStubData): string {
  const saved: SavedPayStub = {
    id: crypto.randomUUID(),
    data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const envelope: ExportEnvelope = {
    tool: "freetoolshed-pay-stub-generator",
    version: 1,
    exportedAt: new Date().toISOString(),
    stubs: [saved],
  };
  return JSON.stringify(envelope, null, 2);
}

export function exportAllJson(history: SavedPayStub[]): string {
  const envelope: ExportEnvelope = {
    tool: "freetoolshed-pay-stub-generator",
    version: 1,
    exportedAt: new Date().toISOString(),
    stubs: history,
  };
  return JSON.stringify(envelope, null, 2);
}

export interface ImportResult {
  success: true;
  stubs: SavedPayStub[];
}

export interface ImportError {
  success: false;
  error: string;
}

export function parseImportedJson(
  jsonString: string
): ImportResult | ImportError {
  try {
    const parsed = JSON.parse(jsonString) as Record<string, unknown>;

    if (parsed.tool !== "freetoolshed-pay-stub-generator") {
      return {
        success: false,
        error:
          "Invalid pay stub file. Please use a file exported from Free Tool Shed.",
      };
    }

    const rawStubs = Array.isArray(parsed.stubs) ? parsed.stubs : [];
    if (rawStubs.length === 0) {
      return {
        success: false,
        error: "No pay stubs found in the file.",
      };
    }

    const stubs: SavedPayStub[] = rawStubs.map(
      (stub: Record<string, unknown>) => ({
        id: (stub.id as string) ?? crypto.randomUUID(),
        createdAt:
          (stub.createdAt as string) ?? new Date().toISOString(),
        updatedAt:
          (stub.updatedAt as string) ?? new Date().toISOString(),
        data: migratePayStubData(
          (stub.data as Record<string, unknown>) ?? {}
        ),
      })
    );

    return { success: true, stubs };
  } catch {
    return {
      success: false,
      error: "Could not read the file. Make sure it is a valid JSON file.",
    };
  }
}
