import type { OcrLanguage, ExportFormat } from "./types";

const STORAGE_KEY = "freetoolshed:ocr-scanner:prefs";

interface OcrPrefs {
  language: OcrLanguage;
  exportFormat: ExportFormat;
}

const DEFAULTS: OcrPrefs = {
  language: "eng",
  exportFormat: "txt",
};

export function loadPrefs(): OcrPrefs {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw) as Partial<OcrPrefs>;
    return {
      language: parsed.language ?? DEFAULTS.language,
      exportFormat: parsed.exportFormat ?? DEFAULTS.exportFormat,
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
