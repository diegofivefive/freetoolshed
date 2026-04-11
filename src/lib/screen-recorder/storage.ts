import {
  DEFAULT_AUDIO_CONFIG,
  DEFAULT_EXPORT_FORMAT,
  DEFAULT_QUALITY,
  DEFAULT_WEBCAM_CONFIG,
} from "./constants";
import type { RecorderPrefs } from "./types";

const STORAGE_KEY = "freetoolshed:screen-recorder:prefs";

const DEFAULTS: RecorderPrefs = {
  quality: DEFAULT_QUALITY,
  audioSources: DEFAULT_AUDIO_CONFIG,
  webcam: DEFAULT_WEBCAM_CONFIG,
  exportFormat: DEFAULT_EXPORT_FORMAT,
};

const QUALITY_VALUES = new Set(["720p", "1080p", "1440p"]);
const POSITION_VALUES = new Set([
  "top-left",
  "top-right",
  "bottom-left",
  "bottom-right",
]);
const SIZE_VALUES = new Set(["sm", "md", "lg"]);
const SHAPE_VALUES = new Set(["circle", "square"]);
const FORMAT_VALUES = new Set(["webm", "mp4", "gif"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function sanitize(raw: unknown): RecorderPrefs {
  if (!isRecord(raw)) return DEFAULTS;

  const quality =
    typeof raw.quality === "string" && QUALITY_VALUES.has(raw.quality)
      ? (raw.quality as RecorderPrefs["quality"])
      : DEFAULTS.quality;

  const audio = isRecord(raw.audioSources) ? raw.audioSources : null;
  const audioSources: RecorderPrefs["audioSources"] = {
    system:
      typeof audio?.system === "boolean"
        ? audio.system
        : DEFAULTS.audioSources.system,
    mic:
      typeof audio?.mic === "boolean" ? audio.mic : DEFAULTS.audioSources.mic,
  };

  const cam = isRecord(raw.webcam) ? raw.webcam : null;
  const webcam: RecorderPrefs["webcam"] = {
    enabled:
      typeof cam?.enabled === "boolean"
        ? cam.enabled
        : DEFAULTS.webcam.enabled,
    position:
      typeof cam?.position === "string" && POSITION_VALUES.has(cam.position)
        ? (cam.position as RecorderPrefs["webcam"]["position"])
        : DEFAULTS.webcam.position,
    size:
      typeof cam?.size === "string" && SIZE_VALUES.has(cam.size)
        ? (cam.size as RecorderPrefs["webcam"]["size"])
        : DEFAULTS.webcam.size,
    shape:
      typeof cam?.shape === "string" && SHAPE_VALUES.has(cam.shape)
        ? (cam.shape as RecorderPrefs["webcam"]["shape"])
        : DEFAULTS.webcam.shape,
  };

  const exportFormat =
    typeof raw.exportFormat === "string" && FORMAT_VALUES.has(raw.exportFormat)
      ? (raw.exportFormat as RecorderPrefs["exportFormat"])
      : DEFAULTS.exportFormat;

  return { quality, audioSources, webcam, exportFormat };
}

export function loadPrefs(): RecorderPrefs {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    return sanitize(JSON.parse(raw));
  } catch {
    return DEFAULTS;
  }
}

export function savePrefs(prefs: Partial<RecorderPrefs>) {
  if (typeof window === "undefined") return;
  try {
    const current = loadPrefs();
    const merged: RecorderPrefs = { ...current, ...prefs };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  } catch {
    // localStorage full, disabled, or unavailable — ignore silently.
  }
}
