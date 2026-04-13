"use client";

import { useCallback, useRef, useState } from "react";
import {
  Upload,
  Plus,
  Trash2,
  ArrowLeftRight,
  Download,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
  CONVERT_FORMATS,
  CONVERT_BITRATES,
  LOSSLESS_FORMATS,
  convertBatch,
  abortConvert,
} from "@/lib/media-toolkit/convert";
import type { ConvertResult } from "@/lib/media-toolkit/convert";
import { ACCEPTED_AUDIO_TYPES } from "@/lib/media-toolkit/constants";

// ─── Tool Guide ──────────────────────────────────────────────────────────────

const GUIDE_SECTIONS: ToolGuideSection[] = [
  {
    title: "Getting Started",
    content: "Add audio files, choose an output format, and click Convert.",
    steps: [
      "Drop files or click Browse",
      "Choose output format",
      "Set bitrate (lossy only)",
      "Click Convert All",
      "Download converted files",
    ],
  },
  {
    title: "Supported Formats",
    content:
      "Input: MP3, M4A, WAV, OGG, FLAC, AAC, WebM. Output: MP3, M4A (AAC), WAV, OGG (Vorbis), FLAC.",
  },
  {
    title: "Lossy vs Lossless",
    content:
      "MP3, M4A, OGG are lossy — smaller files, slight quality loss. WAV and FLAC are lossless — larger files, perfect quality. FLAC compresses losslessly (smaller than WAV).",
  },
  {
    title: "Bitrate Guide",
    content:
      "64-128 kbps: speech/podcasts. 192 kbps: good music quality. 256-320 kbps: high/maximum quality. Lossless formats ignore bitrate.",
  },
  {
    title: "Batch Mode",
    content:
      "Add multiple files to convert them all to the same format. Files convert one at a time. Each gets its own download button when done.",
  },
  {
    title: "Tips",
    content:
      "The first conversion downloads ffmpeg (~30 MB) — subsequent conversions are instant. Converting to WAV produces large files (10x MP3). FLAC is a good middle ground for archiving.",
  },
];

// ─── Types ───────────────────────────────────────────────────────────────────

interface FileEntry {
  id: string;
  file: File;
  name: string;
  sizeBytes: number;
  status: "pending" | "converting" | "done" | "error";
  progress: number;
  result?: ConvertResult;
  error?: string;
}

type ConvertStatus = "idle" | "converting" | "done" | "error";

// ─── Helpers ─────────────────────────────────────────────────────────────────

let nextId = 0;
function makeId(): string {
  return `conv-${++nextId}-${Date.now()}`;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function AudioConverter() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const [files, setFiles] = useState<FileEntry[]>([]);
  const [targetFormat, setTargetFormat] = useState("mp3");
  const [bitrate, setBitrate] = useState("192k");
  const [status, setStatus] = useState<ConvertStatus>("idle");

  const isConverting = status === "converting";
  const isLossless = LOSSLESS_FORMATS.has(targetFormat);
  const pendingFiles = files.filter((f) => f.status === "pending");
  const canConvert = pendingFiles.length > 0 && !isConverting;

  // ── Add files ───────────────────────────────────────────────────────────

  const addFiles = useCallback((fileList: FileList | File[]) => {
    const newEntries: FileEntry[] = Array.from(fileList)
      .filter((f) => f.type.startsWith("audio/"))
      .map((file) => ({
        id: makeId(),
        file,
        name: file.name,
        sizeBytes: file.size,
        status: "pending" as const,
        progress: 0,
      }));
    setFiles((prev) => [...prev, ...newEntries]);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (isConverting) return;
      addFiles(Array.from(e.dataTransfer.files));
    },
    [addFiles, isConverting]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        addFiles(e.target.files);
        e.target.value = "";
      }
    },
    [addFiles]
  );

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setFiles([]);
    setStatus("idle");
  }, []);

  // ── Convert ─────────────────────────────────────────────────────────────

  const handleConvert = useCallback(async () => {
    if (!canConvert) return;

    const controller = new AbortController();
    abortRef.current = controller;
    setStatus("converting");

    // Map pending indices to file entries
    const pendingIndices: number[] = [];
    const pendingFileObjs: File[] = [];
    files.forEach((f, i) => {
      if (f.status === "pending") {
        pendingIndices.push(i);
        pendingFileObjs.push(f.file);
      }
    });

    try {
      await convertBatch(
        pendingFileObjs,
        targetFormat,
        bitrate,
        {
          onFileStart: (batchIdx) => {
            const fileIdx = pendingIndices[batchIdx];
            setFiles((prev) =>
              prev.map((f, i) =>
                i === fileIdx ? { ...f, status: "converting", progress: 0 } : f
              )
            );
          },
          onFileProgress: (batchIdx, fraction) => {
            const fileIdx = pendingIndices[batchIdx];
            setFiles((prev) =>
              prev.map((f, i) =>
                i === fileIdx ? { ...f, progress: fraction } : f
              )
            );
          },
          onFileComplete: (batchIdx, result) => {
            const fileIdx = pendingIndices[batchIdx];
            setFiles((prev) =>
              prev.map((f, i) =>
                i === fileIdx
                  ? { ...f, status: "done", progress: 1, result }
                  : f
              )
            );
          },
          onFileError: (batchIdx, error) => {
            const fileIdx = pendingIndices[batchIdx];
            setFiles((prev) =>
              prev.map((f, i) =>
                i === fileIdx ? { ...f, status: "error", error } : f
              )
            );
          },
        },
        controller.signal
      );
      setStatus("done");
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        setStatus("idle");
        setFiles((prev) =>
          prev.map((f) =>
            f.status === "converting" ? { ...f, status: "pending", progress: 0 } : f
          )
        );
      } else {
        setStatus("error");
      }
    } finally {
      abortRef.current = null;
    }
  }, [canConvert, files, targetFormat, bitrate]);

  const handleCancel = useCallback(async () => {
    abortRef.current?.abort();
    await abortConvert();
  }, []);

  const handleDownload = useCallback((result: ConvertResult) => {
    const url = URL.createObjectURL(result.blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = result.filename;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const downloadAll = useCallback(() => {
    files
      .filter((f) => f.status === "done" && f.result)
      .forEach((f) => handleDownload(f.result!));
  }, [files, handleDownload]);

  // ── Render: Empty state ─────────────────────────────────────────────────

  if (files.length === 0) {
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
            Drop audio files here to convert
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            MP3, M4A, WAV, OGG, FLAC, AAC, WebM — single file or batch.
          </p>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept={ACCEPTED_AUDIO_TYPES}
            multiple
            onChange={handleFileInput}
          />
        </div>
        <ToolGuide sections={GUIDE_SECTIONS} />
      </>
    );
  }

  // ── Render: File list + controls ────────────────────────────────────────

  const doneCount = files.filter((f) => f.status === "done").length;

  return (
    <>
      <div className="space-y-4">
        {/* Compact drop zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="cursor-pointer rounded-lg border-2 border-dashed border-border px-4 py-3 text-center text-sm text-muted-foreground transition-colors hover:border-brand/50 hover:bg-muted/30"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="mr-1.5 inline-block size-4" />
          Drop more files here or click to browse
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept={ACCEPTED_AUDIO_TYPES}
            multiple
            onChange={handleFileInput}
          />
        </div>

        {/* Settings row */}
        <div className="flex flex-wrap items-end gap-4 rounded-lg border border-border bg-card p-4">
          <div className="space-y-1.5">
            <Label htmlFor="target-format">Convert to</Label>
            <Select
              value={targetFormat}
              onValueChange={(v) => { if (v) setTargetFormat(v); }}
              disabled={isConverting}
            >
              <SelectTrigger id="target-format" className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CONVERT_FORMATS).map(([key, fmt]) => (
                  <SelectItem key={key} value={key}>
                    {fmt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="conv-bitrate">
              Bitrate{isLossless && " (n/a)"}
            </Label>
            <Select
              value={bitrate}
              onValueChange={(v) => { if (v) setBitrate(v); }}
              disabled={isConverting || isLossless}
            >
              <SelectTrigger id="conv-bitrate" className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CONVERT_BITRATES.map((b) => (
                  <SelectItem key={b.value} value={b.value}>
                    {b.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-1 items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isConverting}
            >
              <Plus className="mr-1.5 size-4" />
              Add Files
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearAll}
              disabled={isConverting}
            >
              <Trash2 className="mr-1.5 size-4" />
              Clear
            </Button>
          </div>
        </div>

        {/* File list */}
        <div className="rounded-lg border border-border bg-card">
          <div className="max-h-[60vh] overflow-y-auto">
            {files.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center gap-3 border-b border-border px-4 py-2.5 text-sm last:border-b-0"
              >
                {/* Status icon */}
                {entry.status === "done" && (
                  <CheckCircle2 className="size-4 shrink-0 text-emerald-400" />
                )}
                {entry.status === "error" && (
                  <AlertTriangle className="size-4 shrink-0 text-pink-400" />
                )}
                {entry.status === "converting" && (
                  <Loader2 className="size-4 shrink-0 animate-spin text-brand" />
                )}
                {entry.status === "pending" && (
                  <ArrowLeftRight className="size-4 shrink-0 text-muted-foreground" />
                )}

                {/* Filename */}
                <span className="min-w-0 flex-1 truncate" title={entry.name}>
                  {entry.name}
                </span>

                {/* Size */}
                <span className="shrink-0 text-muted-foreground">
                  {formatSize(entry.sizeBytes)}
                </span>

                {/* Progress bar (converting) */}
                {entry.status === "converting" && (
                  <div className="h-1.5 w-20 shrink-0 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-brand transition-all duration-300"
                      style={{ width: `${Math.round(entry.progress * 100)}%` }}
                    />
                  </div>
                )}

                {/* Result size (done) */}
                {entry.status === "done" && entry.result && (
                  <span className="shrink-0 text-xs text-muted-foreground">
                    → {formatSize(entry.result.blob.size)}
                  </span>
                )}

                {/* Error */}
                {entry.status === "error" && (
                  <span className="shrink-0 text-xs text-pink-400">
                    {entry.error || "Failed"}
                  </span>
                )}

                {/* Download button */}
                {entry.status === "done" && entry.result && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 shrink-0"
                    onClick={() => handleDownload(entry.result!)}
                    title="Download"
                  >
                    <Download className="size-3.5" />
                  </Button>
                )}

                {/* Remove button */}
                {!isConverting && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 shrink-0"
                    onClick={() => removeFile(entry.id)}
                  >
                    <X className="size-3.5" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Action bar */}
        <div className="flex items-center gap-2">
          {isConverting ? (
            <Button variant="outline" size="sm" onClick={handleCancel}>
              <XCircle className="mr-1.5 size-4" />
              Cancel
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={handleConvert}
              disabled={!canConvert}
            >
              <ArrowLeftRight className="mr-1.5 size-4" />
              Convert {pendingFiles.length > 0 ? `${pendingFiles.length} File${pendingFiles.length !== 1 ? "s" : ""}` : "All"}
            </Button>
          )}

          {doneCount > 1 && !isConverting && (
            <Button variant="outline" size="sm" onClick={downloadAll}>
              <Download className="mr-1.5 size-4" />
              Download All ({doneCount})
            </Button>
          )}
        </div>
      </div>
      <ToolGuide sections={GUIDE_SECTIONS} />
    </>
  );
}
