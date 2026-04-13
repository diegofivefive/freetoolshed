"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Upload,
  Plus,
  Download,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  X,
  Trash2,
  Image as ImageIcon,
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
  IMAGE_FORMATS,
  ACCEPTED_IMAGE_TYPES,
  detectSupportedFormats,
  convertImageBatch,
} from "@/lib/media-toolkit/image-convert";
import type { ImageConvertResult } from "@/lib/media-toolkit/image-convert";

// ─── Tool Guide ──────────────────────────────────────────────────────────────

const GUIDE_SECTIONS: ToolGuideSection[] = [
  {
    title: "Getting Started",
    content: "Drop images, choose a format, and click Convert All.",
    steps: [
      "Drop images or click Browse",
      "Select an output format",
      "Adjust quality if needed",
      "Click Convert All",
      "Download the results",
    ],
  },
  {
    title: "Output Formats",
    content:
      "PNG: lossless, supports transparency, larger files. JPG: lossy, no transparency, smallest files. WebP: modern format, 25-35% smaller than JPG, supports transparency. AVIF: newest format, even smaller than WebP (browser support varies).",
  },
  {
    title: "Quality Slider",
    content:
      "For lossy formats (JPG, WebP, AVIF), the quality slider controls the compression level. 100 = best quality / largest file. 70-85 is a good balance. PNG is always lossless — the slider is hidden.",
  },
  {
    title: "Resize",
    content:
      "Set a max dimension (e.g. 1920) to automatically scale down images whose longest side exceeds that value. Aspect ratio is always preserved. Leave blank to keep original dimensions.",
  },
  {
    title: "Batch Mode",
    content:
      "Add as many images as you want. They convert sequentially and each gets its own download button. Use 'Download All' to grab everything at once.",
  },
  {
    title: "Tips",
    content:
      "Converting JPG → PNG won't improve quality (the lossy data is already lost). For web use, WebP at 80% quality offers the best size-to-quality ratio. AVIF is even smaller but encodes slightly slower.",
  },
];

// ─── Types ───────────────────────────────────────────────────────────────────

type FileStatus = "pending" | "converting" | "done" | "error";
type ConvertStatus = "idle" | "converting" | "done";

interface FileEntry {
  id: string;
  file: File;
  name: string;
  sizeBytes: number;
  status: FileStatus;
  previewUrl: string;
  result?: ImageConvertResult;
  error?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

let idCounter = 0;
function nextId(): string {
  return `img-${Date.now()}-${++idCounter}`;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function ImageConverter() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addInputRef = useRef<HTMLInputElement>(null);

  const [files, setFiles] = useState<FileEntry[]>([]);
  const [targetFormat, setTargetFormat] = useState("webp");
  const [quality, setQuality] = useState(80);
  const [maxDimension, setMaxDimension] = useState("");
  const [status, setStatus] = useState<ConvertStatus>("idle");
  const [supportedFormats, setSupportedFormats] = useState<Set<string> | null>(
    null
  );

  // Detect supported formats on mount
  useEffect(() => {
    detectSupportedFormats().then(setSupportedFormats);
  }, []);

  const isConverting = status === "converting";
  const isLossy = IMAGE_FORMATS[targetFormat]?.lossy ?? true;

  // ── File handling ───────────────────────────────────────────────────────

  const addFiles = useCallback(
    (incoming: FileList | File[]) => {
      if (isConverting) return;
      const imageFiles = Array.from(incoming).filter((f) =>
        f.type.startsWith("image/")
      );
      if (imageFiles.length === 0) return;

      const entries: FileEntry[] = imageFiles.map((f) => ({
        id: nextId(),
        file: f,
        name: f.name,
        sizeBytes: f.size,
        status: "pending" as const,
        previewUrl: URL.createObjectURL(f),
      }));

      setFiles((prev) => [...prev, ...entries]);
      setStatus("idle");
    },
    [isConverting]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      addFiles(e.dataTransfer.files);
    },
    [addFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) addFiles(e.target.files);
      e.target.value = "";
    },
    [addFiles]
  );

  const removeFile = useCallback(
    (id: string) => {
      if (isConverting) return;
      setFiles((prev) => {
        const entry = prev.find((f) => f.id === id);
        if (entry) {
          URL.revokeObjectURL(entry.previewUrl);
          if (entry.result) URL.revokeObjectURL(entry.previewUrl);
        }
        return prev.filter((f) => f.id !== id);
      });
    },
    [isConverting]
  );

  const clearAll = useCallback(() => {
    if (isConverting) return;
    files.forEach((f) => URL.revokeObjectURL(f.previewUrl));
    setFiles([]);
    setStatus("idle");
  }, [isConverting, files]);

  // ── Convert ─────────────────────────────────────────────────────────────

  const handleConvert = useCallback(async () => {
    const pending = files.filter(
      (f) => f.status === "pending" || f.status === "error"
    );
    if (pending.length === 0) return;

    setStatus("converting");

    // Reset pending/error files
    setFiles((prev) =>
      prev.map((f) =>
        f.status === "pending" || f.status === "error"
          ? { ...f, status: "converting" as const, error: undefined }
          : f
      )
    );

    const parsedMax = maxDimension ? parseInt(maxDimension, 10) : null;

    await convertImageBatch(
      pending.map((f) => f.file),
      {
        targetFormat,
        quality: quality / 100,
        maxDimension: parsedMax && parsedMax > 0 ? parsedMax : null,
      },
      {
        onFileStart: (idx) => {
          const entryId = pending[idx].id;
          setFiles((prev) =>
            prev.map((f) =>
              f.id === entryId ? { ...f, status: "converting" as const } : f
            )
          );
        },
        onFileComplete: (idx, result) => {
          const entryId = pending[idx].id;
          setFiles((prev) =>
            prev.map((f) =>
              f.id === entryId
                ? { ...f, status: "done" as const, result }
                : f
            )
          );
        },
        onFileError: (idx, error) => {
          const entryId = pending[idx].id;
          setFiles((prev) =>
            prev.map((f) =>
              f.id === entryId
                ? { ...f, status: "error" as const, error }
                : f
            )
          );
        },
      }
    );

    setStatus("done");
  }, [files, targetFormat, quality, maxDimension]);

  // ── Download ────────────────────────────────────────────────────────────

  const handleDownload = useCallback((result: ImageConvertResult) => {
    const url = URL.createObjectURL(result.blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = result.filename;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const handleDownloadAll = useCallback(() => {
    files.forEach((f) => {
      if (f.status === "done" && f.result) {
        handleDownload(f.result);
      }
    });
  }, [files, handleDownload]);

  // ── Status icon ─────────────────────────────────────────────────────────

  const statusIcon = (entry: FileEntry) => {
    switch (entry.status) {
      case "pending":
        return <ImageIcon className="size-4 text-muted-foreground" />;
      case "converting":
        return <Loader2 className="size-4 animate-spin text-brand" />;
      case "done":
        return <CheckCircle2 className="size-4 text-emerald-500" />;
      case "error":
        return <AlertTriangle className="size-4 text-pink-400" />;
    }
  };

  // ── Counts ──────────────────────────────────────────────────────────────

  const doneCount = files.filter((f) => f.status === "done").length;
  const pendingCount = files.filter(
    (f) => f.status === "pending" || f.status === "error"
  ).length;

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
            Drop images here to convert
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            PNG, JPG, WebP, AVIF, BMP, GIF, TIFF, SVG — add as many as you
            like.
          </p>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept={ACCEPTED_IMAGE_TYPES}
            multiple
            onChange={handleFileInput}
          />
        </div>
        <ToolGuide sections={GUIDE_SECTIONS} />
      </>
    );
  }

  // ── Render: Converter UI ────────────────────────────────────────────────

  return (
    <>
      <div className="space-y-4">
        {/* Compact drop zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-border px-4 py-3 text-sm text-muted-foreground transition-colors hover:border-brand/50 hover:bg-muted/30"
          onClick={() => addInputRef.current?.click()}
        >
          <Plus className="size-4" />
          Drop more images or click to add
          <input
            ref={addInputRef}
            type="file"
            className="hidden"
            accept={ACCEPTED_IMAGE_TYPES}
            multiple
            onChange={handleFileInput}
          />
        </div>

        {/* Settings row */}
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="mb-3 text-sm font-semibold">Conversion Settings</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Format */}
            <div className="space-y-1.5">
              <Label htmlFor="img-format">Output Format</Label>
              <Select
                value={targetFormat}
                onValueChange={(v) => {
                  if (v) setTargetFormat(v);
                }}
                disabled={isConverting}
              >
                <SelectTrigger id="img-format">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(IMAGE_FORMATS).map(([key, fmt]) => {
                    const unsupported =
                      supportedFormats !== null && !supportedFormats.has(key);
                    return (
                      <SelectItem
                        key={key}
                        value={key}
                        disabled={unsupported}
                      >
                        {fmt.label}
                        {unsupported ? " (unsupported)" : ""}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Quality */}
            {isLossy && (
              <div className="space-y-1.5">
                <Label htmlFor="img-quality">Quality ({quality}%)</Label>
                <Input
                  id="img-quality"
                  type="range"
                  min={1}
                  max={100}
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  disabled={isConverting}
                  className="h-9"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Smallest file</span>
                  <span>Best quality</span>
                </div>
              </div>
            )}

            {/* Max dimension */}
            <div className="space-y-1.5">
              <Label htmlFor="img-maxdim">Max Dimension (px)</Label>
              <Input
                id="img-maxdim"
                type="number"
                min={1}
                placeholder="Original size"
                value={maxDimension}
                onChange={(e) => setMaxDimension(e.target.value)}
                disabled={isConverting}
              />
              <p className="text-xs text-muted-foreground">
                Leave blank to keep original size
              </p>
            </div>
          </div>
        </div>

        {/* File list */}
        <div className="overflow-hidden rounded-lg border border-border">
          {/* Summary bar */}
          <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-2 text-sm">
            <span>
              {files.length} image{files.length !== 1 ? "s" : ""}
              {doneCount > 0 && (
                <span className="ml-1 text-brand">
                  · {doneCount} converted
                </span>
              )}
            </span>
            {!isConverting && (
              <Button variant="ghost" size="sm" onClick={clearAll}>
                <Trash2 className="mr-1 size-3.5" />
                Clear All
              </Button>
            )}
          </div>

          {/* Scrollable list */}
          <div className="max-h-[60vh] divide-y divide-border overflow-y-auto">
            {files.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center gap-3 px-4 py-2"
              >
                {/* Thumbnail */}
                <img
                  src={entry.previewUrl}
                  alt=""
                  className="size-10 shrink-0 rounded border border-border object-cover"
                />

                {/* Status */}
                <span className="shrink-0">{statusIcon(entry)}</span>

                {/* Name + info */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium" title={entry.name}>
                    {entry.name}
                  </p>
                  <div className="flex gap-2 text-xs text-muted-foreground">
                    <span>{formatSize(entry.sizeBytes)}</span>
                    {entry.status === "done" && entry.result && (
                      <span className="text-brand">
                        → {formatSize(entry.result.blob.size)}
                      </span>
                    )}
                    {entry.status === "error" && entry.error && (
                      <span className="text-pink-400">{entry.error}</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {entry.status === "done" && entry.result && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(entry.result!)}
                    className="shrink-0"
                  >
                    <Download className="size-4" />
                  </Button>
                )}
                {!isConverting && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(entry.id)}
                    className="shrink-0"
                  >
                    <X className="size-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {!isConverting && pendingCount > 0 && (
            <Button size="sm" onClick={handleConvert}>
              Convert{pendingCount > 1 ? ` All (${pendingCount})` : ""}
            </Button>
          )}

          {isConverting && (
            <Button size="sm" disabled>
              <Loader2 className="mr-1.5 size-4 animate-spin" />
              Converting…
            </Button>
          )}

          {doneCount > 1 && !isConverting && (
            <Button variant="outline" size="sm" onClick={handleDownloadAll}>
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
