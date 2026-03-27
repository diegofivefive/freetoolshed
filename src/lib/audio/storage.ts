/**
 * Persist user preferences for the audio editor.
 * AudioBuffers can't be serialized, so we only save settings.
 */

import type { ExportFormat } from "./types";

const STORAGE_KEY = "freetoolshed:audio-editor:prefs";

interface AudioEditorPrefs {
  exportFormat: ExportFormat;
  exportBitrate: number;
}

const DEFAULTS: AudioEditorPrefs = {
  exportFormat: "wav",
  exportBitrate: 192,
};

export function loadPrefs(): AudioEditorPrefs {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw) as Partial<AudioEditorPrefs>;
    return {
      exportFormat: parsed.exportFormat ?? DEFAULTS.exportFormat,
      exportBitrate: parsed.exportBitrate ?? DEFAULTS.exportBitrate,
    };
  } catch {
    return DEFAULTS;
  }
}

export function savePrefs(prefs: Partial<AudioEditorPrefs>) {
  if (typeof window === "undefined") return;
  try {
    const current = loadPrefs();
    const merged = { ...current, ...prefs };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  } catch {
    // localStorage full or unavailable — fail silently
  }
}
