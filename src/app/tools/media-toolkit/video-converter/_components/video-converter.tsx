"use client";

import { useCallback, useRef, useState } from "react";
import {
  Upload,
  Plus,
  Trash2,
  Film,
  Download,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  X,
  Info,
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
import { loadFFmpeg, resetFFmpeg } from "@/lib/ffmpeg";

// ─── Video format configs ────────────────────────────────────────────────────

interface VideoFormat {
  label: string;
  extension: string;
  mimeType: string;
  args: string[];
}

const VIDEO_FORMATS: Record<string, VideoFormat> = {
  mp4: {
    label: "MP4 (H.264)",
    extension: "mp4",
    mimeType: "video/mp4",
    args: ["-c:v", "libx264", "-crf", "23", "-preset", "fast", "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart"],
  },
  webm: {
    label: "WebM (VP8)",
    extension: "webm",
    mimeType: "video/webm",
    args: ["-c:v", "libvpx", "-crf", "10", "-b:v", "1M", "-c:a", "libvorbis", "-b:a", "128k"],
  },
  avi: {
    label: "AVI (MPEG-4)",
    extension: "avi",
    mimeType: "video/x-msvideo",
    args: ["-c:v", "mpeg4", "-q:v", "5", "-c:a", "mp3", "-b:a", "128k"],
  },
  gif: {
    label: "GIF",
    extension: "gif",
    mimeType: "image/gif",
    // GIF uses a two-pass approach handled separately
    args: [],
  },
};

const ACCEPTED_VIDEO_TYPES =
  "video/mp4,video/webm,video/quicktime,video/x-msvideo,video/x-matroska,video/avi";

// ─── Tool Guide ──────────────────────────────────────────────────────────────

const GUIDE_SECTIONS: ToolGuideSection[] = [
  {
    title: "Getting Started",
    content: "Add video files, choose an output format, and click Convert.",
    steps: [
      "Drop files or click Browse",
      "Choose output format",
      "Click Convert All",
      "Download converted files",
    ],
  },
  {
    title: "Output Formats",
    content:
      "MP4 (H.264): most compatible, plays everywhere. WebM (VP8): open format, good for web. AVI (MPEG-4): legacy compatibility. GIF: animated images for short clips.",
  },
  {
    title: "GIF Conversion",
    content:
      "GIFs are capped at 12 fps and 720p width. A palette is generated per-frame for best quality. Keep clips short — GIF files get large quickly.",
  },
  {
    title: "Performance",
    content:
      "Video transcoding in the browser is slower than desktop software (single-threaded WASM). Short clips convert quickly; longer videos take proportionally longer.",
  },
  {
    title: "Tips",
    content:
      "The first conversion downloads ffmpeg (~30 MB). For GIFs, keep clips under 30 seconds for reasonable file sizes. MP4 is the safest choice for sharing.",
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
  resultBlob?: Blob;
  resultFilename?: string;
  error?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

let nextId = 0;
function makeId(): string {
  return `vconv-${++nextId}-${Date.now()}`;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

async function convertSingleVideo(
  file: File,
  targetFormat: string,
  onProgress: (fraction: number) => void,
  signal?: AbortSignal
): Promise<{ blob: Blob; filename: string }> {
  const ffmpeg = await loadFFmpeg();
  if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

  const format = VIDEO_FORMATS[targetFormat];
  const inputExt = file.name.split(".").pop() || "mp4";
  const inputName = `input.${inputExt}`;
  const baseName = file.name.replace(/\.[^.]+$/, "");
  const outputName = `${baseName}.${format.extension}`;

  const progressHandler = ({ progress }: { progress: number }) => {
    onProgress(Math.min(progress, 1));
  };
  ffmpeg.on("progress", progressHandler);

  try {
    const { fetchFile } = await import("@ffmpeg/util");
    const data = await fetchFile(file);
    await ffmpeg.writeFile(inputName, data);

    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

    let exitCode: number;

    if (targetFormat === "gif") {
      // Two-pass GIF: generate palette, then use it
      const paletteFilter = "fps=12,scale='min(720,iw)':-1:flags=lanczos";
      exitCode = await ffmpeg.exec([
        "-i", inputName,
        "-vf", `${paletteFilter},palettegen=stats_mode=diff`,
        "-y", "palette.png",
      ]);
      if (exitCode !== 0) throw new Error(`Palette generation failed (code ${exitCode})`);

      exitCode = await ffmpeg.exec([
        "-i", inputName,
        "-i", "palette.png",
        "-lavfi", `${paletteFilter} [x]; [x][1:v] paletteuse=dither=bayer:bayer_scale=5`,
        "-y", outputName,
      ]);

      try { await ffmpeg.deleteFile("palette.png"); } catch { /* ok */ }
    } else {
      exitCode = await ffmpeg.exec([
        "-i", inputName,
        ...format.args,
        outputName,
      ]);
    }

    if (exitCode !== 0) throw new Error(`ffmpeg exited with code ${exitCode}`);
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

    const outputData = await ffmpeg.readFile(outputName);
    const bytes =
      outputData instanceof Uint8Array
        ? outputData
        : new TextEncoder().encode(outputData as string);
    const ab = new ArrayBuffer(bytes.byteLength);
    new Uint8Array(ab).set(bytes);
    const blob = new Blob([ab], { type: format.mimeType });

    return { blob, filename: outputName };
  } finally {
    ffmpeg.off("progress", progressHandler);
    for (const name of [inputName, outputName]) {
      try { await ffmpeg.deleteFile(name); } catch { /* ok */ }
    }
  }
}

// ─── Component ───────────────────────────────────────────────────────────────

export function VideoConverter() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const [files, setFiles] = useState<FileEntry[]>([]);
  const [targetFormat, setTargetFormat] = useState("mp4");
  const [status, setStatus] = useState<"idle" | "converting" | "done">("idle");

  const isConverting = status === "converting";
  const pendingFiles = files.filter((f) => f.status === "pending");
  const canConvert = pendingFiles.length > 0 && !isConverting;
  const doneCount = files.filter((f) => f.status === "done").length;

  // ── File handling ───────────────────────────────────────────────────────

  const addFiles = useCallback((fileList: FileList | File[]) => {
    const entries: FileEntry[] = Array.from(fileList)
      .filter((f) => f.type.startsWith("video/"))
      .map((file) => ({
        id: makeId(),
        file,
        name: file.name,
        sizeBytes: file.size,
        status: "pending" as const,
        progress: 0,
      }));
    setFiles((prev) => [...prev, ...entries]);
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

    // Load ffmpeg once before the loop
    try {
      await loadFFmpeg();
    } catch (err) {
      setStatus("idle");
      return;
    }

    const pendingIndices: number[] = [];
    files.forEach((f, i) => {
      if (f.status === "pending") pendingIndices.push(i);
    });

    for (const fileIdx of pendingIndices) {
      if (controller.signal.aborted) break;

      setFiles((prev) =>
        prev.map((f, i) =>
          i === fileIdx ? { ...f, status: "converting", progress: 0 } : f
        )
      );

      try {
        const result = await convertSingleVideo(
          files[fileIdx].file,
          targetFormat,
          (fraction) => {
            setFiles((prev) =>
              prev.map((f, i) =>
                i === fileIdx ? { ...f, progress: fraction } : f
              )
            );
          },
          controller.signal
        );

        setFiles((prev) =>
          prev.map((f, i) =>
            i === fileIdx
              ? {
                  ...f,
                  status: "done",
                  progress: 1,
                  resultBlob: result.blob,
                  resultFilename: result.filename,
                }
              : f
          )
        );
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          setFiles((prev) =>
            prev.map((f, i) =>
              i === fileIdx && f.status === "converting"
                ? { ...f, status: "pending", progress: 0 }
                : f
            )
          );
          break;
        }
        setFiles((prev) =>
          prev.map((f, i) =>
            i === fileIdx
              ? {
                  ...f,
                  status: "error",
                  error: err instanceof Error ? err.message : "Failed",
                }
              : f
          )
        );
      }
    }

    if (!controller.signal.aborted) {
      setStatus("done");
    } else {
      setStatus("idle");
    }
    abortRef.current = null;
  }, [canConvert, files, targetFormat]);

  const handleCancel = useCallback(async () => {
    abortRef.current?.abort();
    try {
      const ffmpeg = await loadFFmpeg();
      ffmpeg.terminate();
    } catch { /* ok */ }
    resetFFmpeg();
  }, []);

  const handleDownload = useCallback((blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const downloadAll = useCallback(() => {
    files
      .filter((f) => f.status === "done" && f.resultBlob && f.resultFilename)
      .forEach((f) => handleDownload(f.resultBlob!, f.resultFilename!));
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
            Drop video files here to convert
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            MP4, WebM, MOV, AVI, MKV — single file or batch.
          </p>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept={ACCEPTED_VIDEO_TYPES}
            multiple
            onChange={handleFileInput}
          />
        </div>
        <ToolGuide sections={GUIDE_SECTIONS} />
      </>
    );
  }

  // ── Render: File list + controls ────────────────────────────────────────

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
            accept={ACCEPTED_VIDEO_TYPES}
            multiple
            onChange={handleFileInput}
          />
        </div>

        {/* Performance notice */}
        <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
          <Info className="mt-0.5 size-4 shrink-0" />
          <span>
            Video transcoding in the browser is slower than desktop software.
            Short clips convert quickly; longer videos take proportionally
            longer.
          </span>
        </div>

        {/* Settings row */}
        <div className="flex flex-wrap items-end gap-4 rounded-lg border border-border bg-card p-4">
          <div className="space-y-1.5">
            <Label htmlFor="target-video-format">Convert to</Label>
            <Select
              value={targetFormat}
              onValueChange={(v) => { if (v) setTargetFormat(v); }}
              disabled={isConverting}
            >
              <SelectTrigger id="target-video-format" className="w-[170px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(VIDEO_FORMATS).map(([key, fmt]) => (
                  <SelectItem key={key} value={key}>
                    {fmt.label}
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
                  <Film className="size-4 shrink-0 text-muted-foreground" />
                )}

                {/* Filename */}
                <span className="min-w-0 flex-1 truncate" title={entry.name}>
                  {entry.name}
                </span>

                {/* Size */}
                <span className="shrink-0 text-muted-foreground">
                  {formatSize(entry.sizeBytes)}
                </span>

                {/* Progress bar */}
                {entry.status === "converting" && (
                  <div className="h-1.5 w-20 shrink-0 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-brand transition-all duration-300"
                      style={{ width: `${Math.round(entry.progress * 100)}%` }}
                    />
                  </div>
                )}

                {/* Result size */}
                {entry.status === "done" && entry.resultBlob && (
                  <span className="shrink-0 text-xs text-muted-foreground">
                    → {formatSize(entry.resultBlob.size)}
                  </span>
                )}

                {/* Error */}
                {entry.status === "error" && (
                  <span className="shrink-0 text-xs text-pink-400">
                    {entry.error || "Failed"}
                  </span>
                )}

                {/* Download */}
                {entry.status === "done" && entry.resultBlob && entry.resultFilename && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 shrink-0"
                    onClick={() =>
                      handleDownload(entry.resultBlob!, entry.resultFilename!)
                    }
                    title="Download"
                  >
                    <Download className="size-3.5" />
                  </Button>
                )}

                {/* Remove */}
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
            <Button size="sm" onClick={handleConvert} disabled={!canConvert}>
              <Film className="mr-1.5 size-4" />
              Convert{" "}
              {pendingFiles.length > 0
                ? `${pendingFiles.length} File${pendingFiles.length !== 1 ? "s" : ""}`
                : "All"}
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
