"use client";

import { useCallback, useRef, useState } from "react";
import {
  Upload,
  Download,
  Loader2,
  XCircle,
  RotateCcw,
  AlertTriangle,
  Scissors,
  SplitSquareHorizontal,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ToolGuide } from "@/components/shared/tool-guide";
import type { ToolGuideSection } from "@/components/shared/tool-guide";
import { ACCEPTED_AUDIO_TYPES } from "@/lib/media-toolkit/constants";
import {
  trimAudio,
  splitAudio,
  abortTrim,
  parseTimestamp,
  formatDuration,
} from "@/lib/media-toolkit/trim";
import type { TrimResult } from "@/lib/media-toolkit/trim";

// ─── Tool Guide ──────────────────────────────────────────────────────────────

const GUIDE_SECTIONS: ToolGuideSection[] = [
  {
    title: "Getting Started",
    content: "Drop an audio file, enter time values, and click Trim or Split.",
    steps: [
      "Drop an audio file or click Browse",
      "Choose Trim or Split mode",
      "Enter start/end times or split markers",
      "Click the action button",
      "Download the result(s)",
    ],
  },
  {
    title: "Trim Mode",
    content:
      "Extracts a single segment between a start and end time. Enter the start and end times using any supported format. The output preserves original quality (stream copy).",
  },
  {
    title: "Split Mode",
    content:
      "Cuts the file at one or more time markers, producing separate segments. For example, splitting at 1:00 and 3:00 produces three files: 0:00–1:00, 1:00–3:00, and 3:00–end.",
  },
  {
    title: "Time Formats",
    content:
      "Enter time as seconds (90), minutes:seconds (1:30), or hours:minutes:seconds (1:02:30). Decimal seconds work too (90.5).",
  },
  {
    title: "Stream Copy",
    content:
      "This tool uses ffmpeg's -c copy mode, which means cuts are nearly instant and preserve original audio quality exactly. No re-encoding occurs. The only caveat: cuts may not be perfectly frame-accurate on some compressed formats.",
  },
  {
    title: "Tips",
    content:
      "Use the preview button to listen to your file before cutting. For audiobooks, use Split mode with chapter timestamps. All processing happens in your browser — files never leave your device.",
  },
];

// ─── Types ───────────────────────────────────────────────────────────────────

type Mode = "trim" | "split";
type Status = "idle" | "processing" | "done" | "error";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function AudioTrimmer() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // File state
  const [file, setFile] = useState<File | null>(null);
  const [duration, setDuration] = useState<number | null>(null);

  // Mode
  const [mode, setMode] = useState<Mode>("trim");

  // Trim inputs
  const [startTime, setStartTime] = useState("0");
  const [endTime, setEndTime] = useState("");

  // Split inputs
  const [splitMarkers, setSplitMarkers] = useState<string[]>([""]);

  // Processing state
  const [status, setStatus] = useState<Status>("idle");
  const [statusLabel, setStatusLabel] = useState("");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Results
  const [trimResult, setTrimResult] = useState<TrimResult | null>(null);
  const [splitResults, setSplitResults] = useState<TrimResult[]>([]);

  // Audio preview URL
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const isProcessing = status === "processing";

  // ── File handling ───────────────────────────────────────────────────────

  const handleFile = useCallback((f: File) => {
    // Clean up old preview
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });

    setFile(f);
    setStatus("idle");
    setTrimResult(null);
    setSplitResults([]);
    setError(null);
    setProgress(0);
    setStartTime("0");
    setEndTime("");
    setSplitMarkers([""]);
    setDuration(null);

    // Create preview URL and probe duration
    const url = URL.createObjectURL(f);
    setPreviewUrl(url);

    const audio = new Audio();
    audio.preload = "metadata";
    audio.onloadedmetadata = () => {
      if (isFinite(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
        setEndTime(formatDuration(audio.duration));
      }
    };
    audio.src = url;
    audioRef.current = audio;
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (isProcessing) return;
      const f = Array.from(e.dataTransfer.files).find((f) =>
        f.type.startsWith("audio/")
      );
      if (f) handleFile(f);
    },
    [handleFile, isProcessing]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (f) handleFile(f);
      e.target.value = "";
    },
    [handleFile]
  );

  // ── Split marker management ────────────────────────────────────────────

  const addMarker = useCallback(() => {
    setSplitMarkers((prev) => [...prev, ""]);
  }, []);

  const updateMarker = useCallback((index: number, value: string) => {
    setSplitMarkers((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }, []);

  const removeMarker = useCallback((index: number) => {
    setSplitMarkers((prev) => {
      if (prev.length <= 1) return [""];
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  // ── Validation ─────────────────────────────────────────────────────────

  const validateTrim = useCallback((): string | null => {
    const start = parseTimestamp(startTime);
    const end = parseTimestamp(endTime);
    if (start === null) return "Invalid start time";
    if (end === null) return "Invalid end time";
    if (start < 0) return "Start time cannot be negative";
    if (end <= start) return "End time must be after start time";
    if (duration !== null && end > duration + 0.5)
      return `End time exceeds file duration (${formatDuration(duration)})`;
    return null;
  }, [startTime, endTime, duration]);

  const validateSplit = useCallback((): string | null => {
    const parsed: number[] = [];
    for (let i = 0; i < splitMarkers.length; i++) {
      const v = parseTimestamp(splitMarkers[i]);
      if (v === null) return `Invalid time at marker ${i + 1}`;
      if (v <= 0) return `Marker ${i + 1} must be greater than 0`;
      if (duration !== null && v >= duration)
        return `Marker ${i + 1} is at or beyond file duration (${formatDuration(duration)})`;
      parsed.push(v);
    }
    const unique = new Set(parsed);
    if (unique.size !== parsed.length) return "Duplicate markers found";
    return null;
  }, [splitMarkers, duration]);

  // ── Process ────────────────────────────────────────────────────────────

  const handleProcess = useCallback(async () => {
    if (!file) return;

    // Validate
    if (mode === "trim") {
      const err = validateTrim();
      if (err) {
        setError(err);
        return;
      }
    } else {
      const err = validateSplit();
      if (err) {
        setError(err);
        return;
      }
    }

    const controller = new AbortController();
    abortRef.current = controller;

    setStatus("processing");
    setError(null);
    setTrimResult(null);
    setSplitResults([]);
    setProgress(0);

    try {
      if (mode === "trim") {
        const start = parseTimestamp(startTime)!;
        const end = parseTimestamp(endTime)!;

        const result = await trimAudio(
          file,
          start,
          end,
          { onStatus: setStatusLabel, onProgress: setProgress },
          controller.signal
        );

        setTrimResult(result);
      } else {
        const points = splitMarkers.map((m) => parseTimestamp(m)!);

        const results = await splitAudio(
          file,
          points,
          {
            onSegmentStart: (idx, total) =>
              setStatusLabel(`Processing segment ${idx} of ${total}…`),
            onProgress: setProgress,
          },
          controller.signal
        );

        setSplitResults(results);
      }

      setStatus("done");
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        setStatus("idle");
      } else {
        setError(err instanceof Error ? err.message : "Processing failed");
        setStatus("error");
      }
    } finally {
      abortRef.current = null;
    }
  }, [file, mode, startTime, endTime, splitMarkers, validateTrim, validateSplit]);

  const handleCancel = useCallback(async () => {
    abortRef.current?.abort();
    await abortTrim();
  }, []);

  const handleDownload = useCallback((result: TrimResult) => {
    const url = URL.createObjectURL(result.blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = result.filename;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const handleReset = useCallback(() => {
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setFile(null);
    setDuration(null);
    setStatus("idle");
    setTrimResult(null);
    setSplitResults([]);
    setError(null);
    setProgress(0);
    setStartTime("0");
    setEndTime("");
    setSplitMarkers([""]);
    audioRef.current = null;
  }, []);

  // ── Render: Empty state ─────────────────────────────────────────────────

  if (!file) {
    return (
      <>
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="cursor-pointer rounded-lg border-2 border-dashed border-border p-12 text-center transition-colors hover:border-brand/50 hover:bg-muted/30"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="mx-auto size-10 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">
            Drop an audio file here to trim or split
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            MP3, M4A, WAV, OGG, FLAC, AAC, WebM — one file at a time.
          </p>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept={ACCEPTED_AUDIO_TYPES}
            onChange={handleFileInput}
          />
        </div>
        <ToolGuide sections={GUIDE_SECTIONS} />
      </>
    );
  }

  // ── Render: Trimmer UI ──────────────────────────────────────────────────

  return (
    <>
      <div className="space-y-4">
        {/* File info */}
        <div className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium" title={file.name}>
              {file.name}
            </p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {formatSize(file.size)}
              {duration !== null && (
                <span className="ml-2">· {formatDuration(duration)}</span>
              )}
            </p>
          </div>
          {!isProcessing && (
            <Button variant="ghost" size="sm" onClick={handleReset}>
              Change File
            </Button>
          )}
        </div>

        {/* Audio preview */}
        {previewUrl && (
          <audio
            controls
            src={previewUrl}
            className="w-full rounded-lg"
            preload="metadata"
          />
        )}

        {/* Mode toggle */}
        <div className="flex gap-2">
          <Button
            variant={mode === "trim" ? "default" : "outline"}
            size="sm"
            onClick={() => !isProcessing && setMode("trim")}
            disabled={isProcessing}
          >
            <Scissors className="mr-1.5 size-4" />
            Trim
          </Button>
          <Button
            variant={mode === "split" ? "default" : "outline"}
            size="sm"
            onClick={() => !isProcessing && setMode("split")}
            disabled={isProcessing}
          >
            <SplitSquareHorizontal className="mr-1.5 size-4" />
            Split
          </Button>
        </div>

        {/* Trim settings */}
        {mode === "trim" && (
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="mb-3 text-sm font-semibold">Trim Range</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="trim-start">Start Time</Label>
                <Input
                  id="trim-start"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  placeholder="0:00"
                  disabled={isProcessing}
                />
                <p className="text-xs text-muted-foreground">
                  e.g. 0, 1:30, 0:02:15
                </p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="trim-end">End Time</Label>
                <Input
                  id="trim-end"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  placeholder={
                    duration !== null ? formatDuration(duration) : "1:30"
                  }
                  disabled={isProcessing}
                />
                <p className="text-xs text-muted-foreground">
                  e.g. 90, 3:00, 1:02:30
                </p>
              </div>
            </div>
            {duration !== null && (
              <p className="mt-3 text-xs text-muted-foreground">
                File duration: {formatDuration(duration)}
                {parseTimestamp(startTime) !== null &&
                  parseTimestamp(endTime) !== null && (
                    <span className="ml-2 text-brand">
                      · Segment:{" "}
                      {formatDuration(
                        Math.max(
                          0,
                          parseTimestamp(endTime)! - parseTimestamp(startTime)!
                        )
                      )}
                    </span>
                  )}
              </p>
            )}
          </div>
        )}

        {/* Split settings */}
        {mode === "split" && (
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold">Split Markers</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={addMarker}
                disabled={isProcessing}
              >
                <Plus className="mr-1 size-4" />
                Add Marker
              </Button>
            </div>
            <p className="mb-3 text-xs text-muted-foreground">
              Add time markers where you want to cut. {splitMarkers.length}{" "}
              marker{splitMarkers.length !== 1 ? "s" : ""} ={" "}
              {splitMarkers.length + 1} output segments.
            </p>
            <div className="space-y-2">
              {splitMarkers.map((marker, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-6 text-right text-xs text-muted-foreground">
                    {i + 1}.
                  </span>
                  <Input
                    value={marker}
                    onChange={(e) => updateMarker(i, e.target.value)}
                    placeholder="e.g. 1:30"
                    disabled={isProcessing}
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeMarker(i)}
                    disabled={isProcessing}
                    className="shrink-0"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
            {duration !== null && (
              <p className="mt-3 text-xs text-muted-foreground">
                File duration: {formatDuration(duration)}
              </p>
            )}
          </div>
        )}

        {/* Progress */}
        {isProcessing && (
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="mb-2 flex items-center gap-2 text-sm">
              <Loader2 className="size-4 animate-spin text-brand" />
              <span className="text-muted-foreground">{statusLabel}</span>
            </div>
            <div className="mb-3 h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-brand transition-all duration-300"
                style={{ width: `${Math.round(progress * 100)}%` }}
              />
            </div>
            <Button variant="outline" size="sm" onClick={handleCancel}>
              <XCircle className="mr-1.5 size-4" />
              Cancel
            </Button>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-pink-500/30 bg-pink-500/10 px-4 py-3 text-sm text-pink-400">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Trim result */}
        {status === "done" && trimResult && (
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="mb-2 text-sm font-semibold text-brand">
              Trim Complete
            </h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{trimResult.filename}</p>
                <p className="text-xs text-muted-foreground">
                  {formatSize(trimResult.blob.size)}
                </p>
              </div>
              <Button size="sm" onClick={() => handleDownload(trimResult)}>
                <Download className="mr-1.5 size-4" />
                Download
              </Button>
            </div>
          </div>
        )}

        {/* Split results */}
        {status === "done" && splitResults.length > 0 && (
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="mb-3 text-sm font-semibold text-brand">
              Split Complete — {splitResults.length} Segments
            </h3>
            <div className="max-h-64 space-y-2 overflow-y-auto">
              {splitResults.map((result, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-md border border-border px-3 py-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {result.filename}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatSize(result.blob.size)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(result)}
                  >
                    <Download className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="mt-3">
              <Button
                size="sm"
                onClick={() => splitResults.forEach(handleDownload)}
              >
                <Download className="mr-1.5 size-4" />
                Download All
              </Button>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {!isProcessing && status !== "done" && (
            <Button size="sm" onClick={handleProcess}>
              {mode === "trim" ? (
                <>
                  <Scissors className="mr-1.5 size-4" />
                  Trim Audio
                </>
              ) : (
                <>
                  <SplitSquareHorizontal className="mr-1.5 size-4" />
                  Split Audio
                </>
              )}
            </Button>
          )}

          {status === "done" && (
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="mr-1.5 size-4" />
              New File
            </Button>
          )}

          {status === "error" && (
            <>
              <Button size="sm" onClick={handleProcess}>
                Retry
              </Button>
              <Button variant="outline" size="sm" onClick={handleReset}>
                <RotateCcw className="mr-1.5 size-4" />
                New File
              </Button>
            </>
          )}
        </div>
      </div>
      <ToolGuide sections={GUIDE_SECTIONS} />
    </>
  );
}
