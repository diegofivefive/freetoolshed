"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileVideo,
  Image as ImageIcon,
  Loader2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ExportStatus } from "@/lib/screen-recorder/export";
import {
  effectiveExportSeconds,
  estimateExportBytes,
  runExport,
  triggerBlobDownload,
} from "@/lib/screen-recorder/export";
import {
  buildDefaultFilename,
  formatBytes,
  formatDuration,
  sanitizeFilename,
} from "@/lib/screen-recorder/format";
import type { ExportFormat, TrimRange } from "@/lib/screen-recorder/types";

interface ExportPanelProps {
  recordedBlob: Blob;
  recordedMimeType: string | null;
  recordedDurationMs: number;
  recordedSizeBytes: number;
  trim: TrimRange | null;
  exportFormat: ExportFormat;
  exportFilename: string;
  onFormatChange: (format: ExportFormat) => void;
  onFilenameChange: (filename: string) => void;
}

interface FormatMeta {
  id: ExportFormat;
  label: string;
  icon: React.ReactNode;
  tagline: string;
  details: string;
  extension: string;
}

const FORMATS: FormatMeta[] = [
  {
    id: "webm",
    label: "WebM",
    icon: <FileVideo className="size-4" />,
    tagline: "Instant, no transcode",
    details:
      "Downloads the original VP9/VP8 recording directly. Fastest, smallest, plays in every modern browser. Trimming runs through ffmpeg but keeps the original codec.",
    extension: "webm",
  },
  {
    id: "mp4",
    label: "MP4",
    icon: <FileVideo className="size-4" />,
    tagline: "H.264 for universal playback",
    details:
      "Transcoded to H.264/AAC on the first use. Compatible with everything — Quicktime, Premiere, social uploads. First export downloads a ~30 MB ffmpeg core.",
    extension: "mp4",
  },
  {
    id: "gif",
    label: "GIF",
    icon: <ImageIcon className="size-4" />,
    tagline: "12 fps, 720p, palette",
    details:
      "Re-encoded to a palette-optimised GIF at 12 fps and max 720p width. Great for README demos. File size varies by content.",
    extension: "gif",
  },
];

export function ExportPanel({
  recordedBlob,
  recordedMimeType,
  recordedDurationMs,
  recordedSizeBytes,
  trim,
  exportFormat,
  exportFilename,
  onFormatChange,
  onFilenameChange,
}: ExportPanelProps) {
  const [status, setStatus] = useState<ExportStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Populate a default filename the first time we land in this panel.
  useEffect(() => {
    if (!exportFilename) {
      onFilenameChange(buildDefaultFilename());
    }
    // Only run when filename is cleared from the outside.
  }, [exportFilename, onFilenameChange]);

  // Abort any in-flight export if the panel unmounts (e.g. user hits
  // "Record another" mid-transcode).
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const meta = useMemo(
    () => FORMATS.find((f) => f.id === exportFormat) ?? FORMATS[0],
    [exportFormat],
  );

  const trimmedSeconds = useMemo(
    () => effectiveExportSeconds(trim, recordedDurationMs),
    [recordedDurationMs, trim],
  );

  const estimatedBytes = useMemo(
    () =>
      estimateExportBytes(
        exportFormat,
        trimmedSeconds,
        recordedSizeBytes,
        recordedDurationMs,
      ),
    [exportFormat, recordedDurationMs, recordedSizeBytes, trimmedSeconds],
  );

  const isBusy = status === "loading-ffmpeg" || status === "transcoding";

  const resolvedFilename = useMemo(() => {
    const base = sanitizeFilename(exportFilename || buildDefaultFilename());
    // Strip any extension the user may have typed, then append the format's.
    const withoutExt = base.replace(/\.(webm|mp4|gif)$/i, "");
    return `${withoutExt}.${meta.extension}`;
  }, [exportFilename, meta.extension]);

  const onSelectFormat = useCallback(
    (format: ExportFormat) => {
      if (isBusy) return;
      onFormatChange(format);
      setErrorMessage(null);
      if (status === "done") setStatus("idle");
    },
    [isBusy, onFormatChange, status],
  );

  const onFilenameInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onFilenameChange(e.target.value);
    },
    [onFilenameChange],
  );

  const onCancelExport = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setStatus("idle");
    setProgress(0);
  }, []);

  const onDownload = useCallback(async () => {
    if (isBusy) return;
    setErrorMessage(null);
    setProgress(0);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const result = await runExport({
        sourceBlob: recordedBlob,
        sourceMimeType: recordedMimeType,
        sourceDurationMs: recordedDurationMs,
        trim,
        format: exportFormat,
        onStatusChange: setStatus,
        onProgress: setProgress,
        signal: controller.signal,
      });

      if (controller.signal.aborted) return;

      triggerBlobDownload(result.blob, resolvedFilename);
      setStatus("done");
      setProgress(1);
    } catch (err) {
      if ((err as DOMException)?.name === "AbortError") {
        setStatus("idle");
        setProgress(0);
        return;
      }
      setStatus("error");
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Export failed. Please try again.",
      );
    } finally {
      abortControllerRef.current = null;
    }
  }, [
    exportFormat,
    isBusy,
    recordedBlob,
    recordedDurationMs,
    recordedMimeType,
    resolvedFilename,
    trim,
  ]);

  const progressPct = Math.round(progress * 100);
  const statusLabel =
    status === "loading-ffmpeg"
      ? "Loading ffmpeg core…"
      : status === "transcoding"
        ? exportFormat === "webm"
          ? "Trimming…"
          : exportFormat === "gif"
            ? "Generating GIF…"
            : "Transcoding to MP4…"
        : null;

  return (
    <div className="space-y-5 rounded-lg border border-border bg-card p-6">
      <div>
        <h2 className="text-lg font-semibold">Export</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose a format, set a filename, and download. Everything runs
          locally — your recording never leaves your browser.
        </p>
      </div>

      {/* Format picker */}
      <fieldset className="space-y-2" disabled={isBusy}>
        <legend className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Format
        </legend>
        <div
          role="radiogroup"
          aria-label="Export format"
          className="grid grid-cols-1 gap-2 sm:grid-cols-3"
        >
          {FORMATS.map((f) => {
            const selected = exportFormat === f.id;
            return (
              <button
                key={f.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => onSelectFormat(f.id)}
                className={`flex flex-col items-start gap-1 rounded-md border p-3 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-brand/40 ${
                  selected
                    ? "border-brand bg-brand/10"
                    : "border-border bg-background hover:bg-muted"
                } ${isBusy ? "cursor-not-allowed opacity-60" : ""}`}
              >
                <div
                  className={`flex items-center gap-2 text-sm font-semibold ${
                    selected ? "text-brand" : "text-foreground"
                  }`}
                >
                  {f.icon}
                  {f.label}
                </div>
                <p className="text-xs text-muted-foreground">{f.tagline}</p>
              </button>
            );
          })}
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{meta.details}</p>
      </fieldset>

      {/* Filename */}
      <div className="space-y-2">
        <label
          htmlFor="screen-recorder-export-filename"
          className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
        >
          Filename
        </label>
        <div className="flex items-center gap-2">
          <Input
            id="screen-recorder-export-filename"
            value={exportFilename}
            onChange={onFilenameInputChange}
            placeholder={buildDefaultFilename()}
            disabled={isBusy}
            aria-describedby="screen-recorder-export-filename-hint"
          />
          <span className="whitespace-nowrap rounded-md border border-border bg-muted/40 px-2 py-1 font-mono text-xs text-muted-foreground">
            .{meta.extension}
          </span>
        </div>
        <p
          id="screen-recorder-export-filename-hint"
          className="text-xs text-muted-foreground"
        >
          Downloads as <span className="font-mono">{resolvedFilename}</span>
        </p>
      </div>

      {/* Summary stats */}
      <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
        <SummaryStat
          label="Duration"
          value={formatDuration(trimmedSeconds * 1000)}
        />
        <SummaryStat
          label="Estimated size"
          value={estimatedBytes === null ? "Varies" : formatBytes(estimatedBytes)}
        />
        <SummaryStat label="Format" value={meta.label} />
      </dl>

      {errorMessage && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-md border border-pink-400/40 bg-pink-400/10 px-3 py-2 text-sm text-pink-400"
        >
          <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span>{errorMessage}</span>
        </div>
      )}

      {isBusy && (
        <div className="space-y-2 rounded-md border border-border bg-muted/40 p-3">
          <div className="flex items-center justify-between text-sm">
            <span className="inline-flex items-center gap-2 text-foreground">
              <Loader2 className="size-4 animate-spin text-brand" aria-hidden />
              {statusLabel}
            </span>
            <span className="font-mono tabular-nums text-xs text-muted-foreground">
              {status === "transcoding" ? `${progressPct}%` : ""}
            </span>
          </div>
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progressPct}
            className="h-2 w-full overflow-hidden rounded-full bg-border"
          >
            <div
              className={`h-full bg-brand transition-[width] duration-150 ${
                status === "loading-ffmpeg" ? "animate-pulse" : ""
              }`}
              style={{
                width:
                  status === "loading-ffmpeg" ? "30%" : `${progressPct}%`,
              }}
            />
          </div>
          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onCancelExport}
            >
              <X className="size-4" />
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs text-muted-foreground">
          {status === "done" ? (
            <span className="inline-flex items-center gap-1.5 text-brand">
              <CheckCircle2 className="size-4" aria-hidden />
              Download started.
            </span>
          ) : (
            <span>
              Ready to export{" "}
              <span className="font-mono">{meta.label}</span>.
            </span>
          )}
        </div>
        <Button
          type="button"
          size="sm"
          disabled={isBusy || trimmedSeconds <= 0}
          onClick={onDownload}
        >
          {isBusy ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Download className="size-4" />
          )}
          {isBusy ? "Working…" : `Download .${meta.extension}`}
        </Button>
      </div>
    </div>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-muted/40 px-3 py-2">
      <dt className="text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd className="font-mono tabular-nums text-foreground">{value}</dd>
    </div>
  );
}
