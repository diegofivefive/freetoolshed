/**
 * Format a millisecond duration as `mm:ss` or `h:mm:ss` when >= 1 hour.
 */
export function formatDuration(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0) return "0:00";
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const mm = hours > 0 ? String(minutes).padStart(2, "0") : String(minutes);
  const ss = String(seconds).padStart(2, "0");
  return hours > 0 ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`;
}

/**
 * Human-readable byte count: 742 B, 12.4 KB, 3.2 MB, 1.1 GB.
 */
export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let size = bytes / 1024;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }
  const precision = size >= 100 ? 0 : size >= 10 ? 1 : 2;
  return `${size.toFixed(precision)} ${units[unitIndex]}`;
}

/**
 * Estimate the encoded file size for a given duration and bitrate.
 * Used to show a "roughly X MB" hint before/after recording.
 */
export function estimateFileSize(
  durationSeconds: number,
  videoBitsPerSecond: number,
  audioBitsPerSecond = 128_000,
): number {
  if (durationSeconds <= 0) return 0;
  const bits = durationSeconds * (videoBitsPerSecond + audioBitsPerSecond);
  return Math.round(bits / 8);
}

/**
 * Build a default filename like `screen-recording-2026-04-10-1530`.
 * Extension is appended by the caller based on the chosen export format.
 */
export function buildDefaultFilename(date: Date = new Date()): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `screen-recording-${yyyy}-${mm}-${dd}-${hh}${min}`;
}

/**
 * Sanitize a user-entered filename: strip slashes, control chars, and
 * trailing dots. Preserves the common `name.ext` shape if supplied.
 */
export function sanitizeFilename(input: string): string {
  // eslint-disable-next-line no-control-regex
  const cleaned = input.replace(/[\\/:*?"<>|\x00-\x1f]/g, "").trim();
  return cleaned.replace(/\.+$/, "") || "screen-recording";
}
