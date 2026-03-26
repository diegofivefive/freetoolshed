import type {
  ResumeData,
  ResumeDefaults,
  SavedResume,
  ResumeExportEnvelope,
} from "./types";
import { exportEnvelopeSchema } from "./schema";
import { createDefaultResumeData, DEFAULT_SETTINGS } from "./constants";

// ── Storage keys ──────────────────────────────────────────────
const DRAFT_KEY = "freetoolshed-resume-draft";
const HISTORY_KEY = "freetoolshed-resume-history";
const DEFAULTS_KEY = "freetoolshed-resume-defaults";

// ── Migration ─────────────────────────────────────────────────

export function migrateResumeData(raw: Record<string, unknown>): ResumeData {
  const defaults = createDefaultResumeData();

  const personalInfo = {
    ...defaults.personalInfo,
    ...((raw.personalInfo as object) ?? {}),
  };

  const settings = {
    ...defaults.settings,
    ...((raw.settings as object) ?? {}),
  };

  const sections = Array.isArray(raw.sections) ? raw.sections : defaults.sections;

  return {
    personalInfo,
    sections: sections.map((s: Record<string, unknown>, i: number) => ({
      id: (s.id as string) ?? crypto.randomUUID(),
      type: s.type as string,
      visible: (s.visible as boolean) ?? true,
      sortOrder: (s.sortOrder as number) ?? i,
      ...(s.type === "summary" ? { content: (s.content as string) ?? "" } : { items: (s.items as unknown[]) ?? [] }),
    })) as ResumeData["sections"],
    settings,
  };
}

// ── Draft persistence ─────────────────────────────────────────

export function saveDraft(data: ResumeData): void {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
  } catch {
    // QuotaExceededError — silently fail
  }
}

export function loadDraft(): ResumeData | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return migrateResumeData(parsed);
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

// ── Resume history ────────────────────────────────────────────

export function loadHistory(): SavedResume[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavedResume[];
    return parsed.map((r) => ({
      ...r,
      data: migrateResumeData(r.data as unknown as Record<string, unknown>),
    }));
  } catch {
    return [];
  }
}

function persistHistory(history: SavedResume[]): void {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    // QuotaExceededError — silently fail
  }
}

export function saveToHistory(data: ResumeData, name: string): SavedResume {
  const history = loadHistory();
  const now = new Date().toISOString();
  const saved: SavedResume = {
    id: crypto.randomUUID(),
    name,
    data,
    createdAt: now,
    updatedAt: now,
  };
  history.unshift(saved);
  persistHistory(history);
  return saved;
}

export function deleteFromHistory(id: string): void {
  const history = loadHistory().filter((r) => r.id !== id);
  persistHistory(history);
}

export function duplicateFromHistory(id: string): ResumeData | null {
  const history = loadHistory();
  const source = history.find((r) => r.id === id);
  if (!source) return null;
  return structuredClone(source.data);
}

export function renameInHistory(id: string, name: string): void {
  const history = loadHistory();
  const target = history.find((r) => r.id === id);
  if (target) {
    target.name = name;
    target.updatedAt = new Date().toISOString();
    persistHistory(history);
  }
}

// ── Settings defaults ─────────────────────────────────────────

export function saveDefaults(data: ResumeData): void {
  try {
    const defaults: ResumeDefaults = {
      settings: { ...data.settings },
    };
    localStorage.setItem(DEFAULTS_KEY, JSON.stringify(defaults));
  } catch {
    // silently fail
  }
}

export function loadDefaults(): ResumeDefaults | null {
  try {
    const raw = localStorage.getItem(DEFAULTS_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ResumeDefaults;
  } catch {
    return null;
  }
}

// ── JSON export / import ──────────────────────────────────────

export function exportResumeJson(data: ResumeData, name: string): string {
  const saved: SavedResume = {
    id: crypto.randomUUID(),
    name,
    data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const envelope: ResumeExportEnvelope = {
    tool: "freetoolshed-resume-builder",
    version: 1,
    exportedAt: new Date().toISOString(),
    resumes: [saved],
  };
  return JSON.stringify(envelope, null, 2);
}

export function exportAllJson(history: SavedResume[]): string {
  const envelope: ResumeExportEnvelope = {
    tool: "freetoolshed-resume-builder",
    version: 1,
    exportedAt: new Date().toISOString(),
    resumes: history,
  };
  return JSON.stringify(envelope, null, 2);
}

export interface ImportResult {
  success: true;
  resumes: SavedResume[];
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
        error: "Invalid resume file format. Please use a file exported from Free Tool Shed.",
      };
    }

    const resumes: SavedResume[] = result.data.resumes.map((r) => ({
      ...r,
      data: migrateResumeData(r.data as unknown as Record<string, unknown>),
    }));

    return { success: true, resumes };
  } catch {
    return {
      success: false,
      error: "Could not read the file. Make sure it is a valid JSON file.",
    };
  }
}
