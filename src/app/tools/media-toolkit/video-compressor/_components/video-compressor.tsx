"use client";

import { useCallback, useRef, useState } from "react";
import {
  Upload,
  Download,
  Loader2,
  XCircle,
  RotateCcw,
  AlertTriangle,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToolGuide } from "@/components/shared/tool-guide";
import type { ToolGuideSection } from "@/components/shared/tool-guide";
import {
  COMPRESS_PRESETS,
  MAX_HEIGHT_OPTIONS,
  compressVideo,
  abortCompress,
} from "@/lib/media-toolkit/compress";
import type { CompressResult } from "@/lib/media-toolkit/compress";

// ─── Tool Guide ──────────────────────────────────────────────────────────────

const GUIDE_SECTIONS: ToolGuideSection[] = [
  {
    title: "Getting Started",
    content: "Drop a video file, choose a preset, and click Compress.",
    steps: [
      "Drop a video or click Browse",
      "Choose a quality preset",
      "Optionally adjust resolution",
      "Click Compress",
      "Download the result",
    ],
  },
  {
    title: "Quality Presets",
    content:
      "Small File: aggressive compression (CRF 32, 720p cap). Balanced: good quality/size ratio (CRF 26). High Quality: minimal loss (CRF 20). Custom: set your own CRF.",
  },
  {
    title: "CRF Explained",
    content:
      "CRF (Constant Rate Factor) controls quality. 0 = lossless, 18 = visually lossless, 23 = default, 28+ = aggressive. Lower = better quality but larger file.",
  },
  {
    title: "Resolution",
    content:
      "Downscaling from 4K to 1080p or 720p dramatically reduces file size. Aspect ratio is always preserved. 'Original' keeps the source resolution.",
  },
  {
    title: "Performance",
    content:
      "Video encoding in the browser is slower than desktop software (single-threaded WASM). A 1-min 1080p video takes ~2-5 minutes. For very long videos, desktop HandBrake may be faster.",
  },
  {
    title: "Output Format",
    content:
      "Output is always MP4 (H.264 + AAC) — the most universally compatible format for web, mobile, and social media. Faststart flag is enabled for instant web playback.",
  },
];

// ─── Types ───────────────────────────────────────────────────────────────────

type Status = "idle" | "compressing" | "done" | "error";

const ACCEPTED_VIDEO_TYPES =
  "video/mp4,video/webm,video/quicktime,video/x-msvideo,video/x-matroska,video/avi";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function compressionRatio(original: number, compressed: number): string {
  if (original <= 0) return "—";
  const pct = ((1 - compressed / original) * 100).toFixed(0);
  return `${pct}% smaller`;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function VideoCompressor() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [preset, setPreset] = useState("balanced");
  const [crf, setCrf] = useState(26);
  const [maxHeight, setMaxHeight] = useState<number | null>(null);
  const [audioPassthrough, setAudioPassthrough] = useState(true);

  const [status, setStatus] = useState<Status>("idle");
  const [statusLabel, setStatusLabel] = useState("");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CompressResult | null>(null);

  const isCompressing = status === "compressing";

  // ── Preset handling ─────────────────────────────────────────────────────

  const handlePresetChange = useCallback((value: string | null) => {
    if (!value) return;
    setPreset(value);
    const p = COMPRESS_PRESETS[value];
    if (p && value !== "custom") {
      setCrf(p.crf);
      setMaxHeight(p.maxHeight);
    }
  }, []);

  // ── File handling ───────────────────────────────────────────────────────

  const handleFile = useCallback((f: File) => {
    setFile(f);
    setStatus("idle");
    setResult(null);
    setError(null);
    setProgress(0);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (isCompressing) return;
      const f = Array.from(e.dataTransfer.files).find((f) =>
        f.type.startsWith("video/")
      );
      if (f) handleFile(f);
    },
    [handleFile, isCompressing]
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

  // ── Compress ────────────────────────────────────────────────────────────

  const handleCompress = useCallback(async () => {
    if (!file) return;

    const controller = new AbortController();
    abortRef.current = controller;

    setStatus("compressing");
    setError(null);
    setResult(null);
    setProgress(0);

    try {
      const compressResult = await compressVideo(
        file,
        { crf, maxHeight, audioPassthrough },
        {
          onStatus: setStatusLabel,
          onProgress: setProgress,
        },
        controller.signal
      );

      setResult(compressResult);
      setStatus("done");
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        setStatus("idle");
      } else {
        setError(err instanceof Error ? err.message : "Compression failed");
        setStatus("error");
      }
    } finally {
      abortRef.current = null;
    }
  }, [file, crf, maxHeight, audioPassthrough]);

  const handleCancel = useCallback(async () => {
    abortRef.current?.abort();
    await abortCompress();
  }, []);

  const handleDownload = useCallback(() => {
    if (!result) return;
    const url = URL.createObjectURL(result.blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = result.filename;
    a.click();
    URL.revokeObjectURL(url);
  }, [result]);

  const handleReset = useCallback(() => {
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
            Drop a video file here to compress
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            MP4, WebM, MOV, AVI, MKV — one file at a time for best
            performance.
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

  // ── Render: Compression UI ──────────────────────────────────────────────

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
              {result && (
                <span className="ml-2 text-brand">
                  → {formatSize(result.blob.size)} (
                  {compressionRatio(file.size, result.blob.size)})
                </span>
              )}
            </p>
          </div>
          {!isCompressing && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
            >
              Change File
            </Button>
          )}
        </div>

        {/* Performance notice */}
        <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
          <Info className="mt-0.5 size-4 shrink-0" />
          <span>
            Video encoding in the browser is slower than desktop software.
            A 1-minute 1080p video typically takes 2-5 minutes. Your video
            never leaves your device.
          </span>
        </div>

        {/* Settings */}
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="mb-3 text-sm font-semibold">Compression Settings</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Preset */}
            <div className="space-y-1.5">
              <Label htmlFor="compress-preset">Preset</Label>
              <Select
                value={preset}
                onValueChange={handlePresetChange}
                disabled={isCompressing}
              >
                <SelectTrigger id="compress-preset">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(COMPRESS_PRESETS).map(([key, p]) => (
                    <SelectItem key={key} value={key}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {COMPRESS_PRESETS[preset]?.description}
              </p>
            </div>

            {/* CRF */}
            <div className="space-y-1.5">
              <Label htmlFor="compress-crf">
                CRF ({crf})
              </Label>
              <Input
                id="compress-crf"
                type="range"
                min={0}
                max={51}
                value={crf}
                onChange={(e) => {
                  setCrf(Number(e.target.value));
                  setPreset("custom");
                }}
                disabled={isCompressing}
                className="h-9"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Best quality</span>
                <span>Smallest file</span>
              </div>
            </div>

            {/* Max height */}
            <div className="space-y-1.5">
              <Label htmlFor="compress-height">Max Resolution</Label>
              <Select
                value={maxHeight === null ? "original" : String(maxHeight)}
                onValueChange={(v) => {
                  if (!v) return;
                  setMaxHeight(v === "original" ? null : Number(v));
                  setPreset("custom");
                }}
                disabled={isCompressing}
              >
                <SelectTrigger id="compress-height">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MAX_HEIGHT_OPTIONS.map((opt) => (
                    <SelectItem
                      key={opt.label}
                      value={opt.value === null ? "original" : String(opt.value)}
                    >
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Audio */}
            <div className="space-y-1.5">
              <Label htmlFor="compress-audio">Audio</Label>
              <Select
                value={audioPassthrough ? "copy" : "reencode"}
                onValueChange={(v) => {
                  if (!v) return;
                  setAudioPassthrough(v === "copy");
                }}
                disabled={isCompressing}
              >
                <SelectTrigger id="compress-audio">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="copy">Copy (fast)</SelectItem>
                  <SelectItem value="reencode">Re-encode AAC 128k</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Progress / result */}
        {isCompressing && (
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

        {status === "error" && error && (
          <div className="flex items-start gap-2 rounded-lg border border-pink-500/30 bg-pink-500/10 px-4 py-3 text-sm text-pink-400">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {!isCompressing && status !== "done" && (
            <Button size="sm" onClick={handleCompress}>
              Compress Video
            </Button>
          )}

          {status === "done" && result && (
            <>
              <Button size="sm" onClick={handleDownload}>
                <Download className="mr-1.5 size-4" />
                Download ({formatSize(result.blob.size)})
              </Button>
              <Button variant="outline" size="sm" onClick={handleReset}>
                <RotateCcw className="mr-1.5 size-4" />
                New Video
              </Button>
            </>
          )}

          {status === "error" && (
            <>
              <Button size="sm" onClick={handleCompress}>
                Retry
              </Button>
              <Button variant="outline" size="sm" onClick={handleReset}>
                <RotateCcw className="mr-1.5 size-4" />
                New Video
              </Button>
            </>
          )}
        </div>
      </div>
      <ToolGuide sections={GUIDE_SECTIONS} />
    </>
  );
}
