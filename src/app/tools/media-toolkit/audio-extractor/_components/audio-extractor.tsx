"use client";

import { useCallback, useRef, useState } from "react";
import {
  Upload,
  Download,
  Loader2,
  XCircle,
  RotateCcw,
  AlertTriangle,
  Music,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ToolGuide } from "@/components/shared/tool-guide";
import type { ToolGuideSection } from "@/components/shared/tool-guide";
import {
  extractAudio,
  abortExtract,
} from "@/lib/media-toolkit/audio-extract";
import type {
  ExtractResult,
  AudioOutputFormat,
} from "@/lib/media-toolkit/audio-extract";

// ─── Tool Guide ──────────────────────────────────────────────────────────────

const GUIDE_SECTIONS: ToolGuideSection[] = [
  {
    title: "Getting Started",
    content: "Drop a video file, choose an output format, and extract the audio.",
    steps: [
      "Drop a video file or click Browse",
      "Choose an output format",
      "Adjust bitrate if needed",
      "Click Extract Audio",
      "Download the result",
    ],
  },
  {
    title: "Output Formats",
    content:
      "Original keeps the video's native audio codec (fastest, lossless). MP3 and M4A are lossy but widely compatible. WAV and FLAC are lossless but larger. OGG is a free lossy codec.",
  },
  {
    title: "Stream Copy (Original)",
    content:
      "When you choose 'Original', the audio track is copied without re-encoding. This is the fastest option and preserves exact quality. If the codec isn't compatible with the output container, the tool automatically falls back to AAC encoding.",
  },
  {
    title: "Bitrate",
    content:
      "Higher bitrate = better quality but larger file. 128 kbps is standard for most uses. 320 kbps is maximum quality for MP3. Bitrate only applies to lossy formats (MP3, M4A, OGG). WAV and FLAC are always lossless.",
  },
  {
    title: "Tips",
    content:
      "Use Original mode for the fastest extraction with zero quality loss. Use MP3 for maximum compatibility. Use FLAC or WAV if you need lossless audio for editing. All processing happens in your browser.",
  },
];

// ─── Types ───────────────────────────────────────────────────────────────────

type Status = "idle" | "processing" | "done" | "error";

type FormatOption = AudioOutputFormat | "original";

const FORMAT_OPTIONS: { value: FormatOption; label: string }[] = [
  { value: "original", label: "Original (stream copy)" },
  { value: "mp3", label: "MP3" },
  { value: "m4a", label: "M4A (AAC)" },
  { value: "wav", label: "WAV (lossless)" },
  { value: "ogg", label: "OGG (Vorbis)" },
  { value: "flac", label: "FLAC (lossless)" },
];

const BITRATE_OPTIONS = [
  { value: "64k", label: "64 kbps" },
  { value: "128k", label: "128 kbps" },
  { value: "192k", label: "192 kbps" },
  { value: "256k", label: "256 kbps" },
  { value: "320k", label: "320 kbps" },
];

const ACCEPTED_VIDEO_TYPES =
  "video/mp4,video/webm,video/quicktime,video/x-msvideo,video/x-matroska";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function AudioExtractor() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<FormatOption>("original");
  const [bitrate, setBitrate] = useState("128k");

  const [status, setStatus] = useState<Status>("idle");
  const [statusLabel, setStatusLabel] = useState("");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const [result, setResult] = useState<ExtractResult | null>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const isProcessing = status === "processing";
  const isLossless = format === "wav" || format === "flac" || format === "original";

  // ── File handling ───────────────────────────────────────────────────────

  const handleFile = useCallback((f: File) => {
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setFile(f);
    setStatus("idle");
    setResult(null);
    setError(null);
    setProgress(0);

    const url = URL.createObjectURL(f);
    setPreviewUrl(url);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (isProcessing) return;
      const f = Array.from(e.dataTransfer.files).find((f) =>
        f.type.startsWith("video/")
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

  // ── Process ────────────────────────────────────────────────────────────

  const handleProcess = useCallback(async () => {
    if (!file) return;

    const controller = new AbortController();
    abortRef.current = controller;

    setStatus("processing");
    setError(null);
    setResult(null);
    setProgress(0);

    try {
      const extractResult = await extractAudio(
        file,
        format,
        bitrate,
        { onStatus: setStatusLabel, onProgress: setProgress },
        controller.signal
      );
      setResult(extractResult);
      setStatus("done");
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        setStatus("idle");
      } else {
        setError(err instanceof Error ? err.message : "Extraction failed");
        setStatus("error");
      }
    } finally {
      abortRef.current = null;
    }
  }, [file, format, bitrate]);

  const handleCancel = useCallback(async () => {
    abortRef.current?.abort();
    await abortExtract();
  }, []);

  const handleDownload = useCallback((r: ExtractResult) => {
    const url = URL.createObjectURL(r.blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = r.filename;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const handleReset = useCallback(() => {
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setFile(null);
    setStatus("idle");
    setResult(null);
    setError(null);
    setProgress(0);
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
            Drop a video file here to extract audio
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            MP4, WebM, MOV, AVI, MKV — one file at a time.
          </p>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept={ACCEPTED_VIDEO_TYPES}
            onChange={handleFileInput}
          />
        </div>
        <ToolGuide sections={GUIDE_SECTIONS} />
      </>
    );
  }

  // ── Render: Extractor UI ────────────────────────────────────────────────

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
            </p>
          </div>
          {!isProcessing && (
            <Button variant="ghost" size="sm" onClick={handleReset}>
              Change File
            </Button>
          )}
        </div>

        {/* Video preview */}
        {previewUrl && (
          <video
            controls
            src={previewUrl}
            className="w-full rounded-lg"
            preload="metadata"
            style={{ maxHeight: "300px" }}
          />
        )}

        {/* Settings */}
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="mb-3 text-sm font-semibold">Output Settings</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="format-select">Audio Format</Label>
              <select
                id="format-select"
                value={format}
                onChange={(e) => setFormat(e.target.value as FormatOption)}
                disabled={isProcessing}
                className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm"
              >
                {FORMAT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bitrate-select">Bitrate</Label>
              <select
                id="bitrate-select"
                value={bitrate}
                onChange={(e) => setBitrate(e.target.value)}
                disabled={isProcessing || isLossless}
                className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm disabled:opacity-50"
              >
                {BITRATE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {isLossless && (
                <p className="text-xs text-muted-foreground">
                  {format === "original"
                    ? "Stream copy — no bitrate control"
                    : "Lossless — bitrate not applicable"}
                </p>
              )}
            </div>
          </div>
        </div>

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

        {/* Result */}
        {status === "done" && result && (
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="mb-2 text-sm font-semibold text-brand">
              Extraction Complete
            </h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{result.filename}</p>
                <p className="text-xs text-muted-foreground">
                  {formatSize(result.blob.size)}
                </p>
              </div>
              <Button size="sm" onClick={() => handleDownload(result)}>
                <Download className="mr-1.5 size-4" />
                Download
              </Button>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {!isProcessing && status !== "done" && (
            <Button size="sm" onClick={handleProcess}>
              <Music className="mr-1.5 size-4" />
              Extract Audio
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
