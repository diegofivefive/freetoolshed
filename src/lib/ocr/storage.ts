import type { OcrLanguage, ExportFormat } from "./types";
import { LANGUAGE_LABELS, EXPORT_FORMAT_LABELS } from "./constants";

const STORAGE_KEY = "freetoolshed:ocr-scanner:prefs";

interface OcrPrefs {
  language: OcrLanguage;
  exportFormat: ExportFormat;
}

const DEFAULTS: OcrPrefs = {
  language: "eng",
  exportFormat: "txt",
};

function isValidLanguage(v: unknown): v is OcrLanguage {
  return typeof v === "string" && v in LANGUAGE_LABELS;
}

function isValidExportFormat(v: unknown): v is ExportFormat {
  return typeof v === "string" && v in EXPORT_FORMAT_LABELS;
}

export function loadPrefs(): OcrPrefs {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw) as Partial<OcrPrefs>;
    return {
      language: isValidLanguage(parsed.language)
        ? parsed.language
        : DEFAULTS.language,
      exportFormat: isValidExportFormat(parsed.exportFormat)
        ? parsed.exportFormat
        : DEFAULTS.exportFormat,
    };
  } catch {
    return DEFAULTS;
  }
}

export function savePrefs(prefs: Partial<OcrPrefs>) {
  if (typeof window === "undefined") return;
  try {
    const current = loadPrefs();
    const merged = { ...current, ...prefs };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  } catch {
    // localStorage full or unavailable
  }
}
