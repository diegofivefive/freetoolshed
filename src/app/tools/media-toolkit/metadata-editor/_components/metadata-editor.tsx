"use client";

import { useCallback, useRef, useState } from "react";
import {
  Upload,
  Download,
  Loader2,
  XCircle,
  RotateCcw,
  AlertTriangle,
  Plus,
  Trash2,
  Save,
  Eraser,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ToolGuide } from "@/components/shared/tool-guide";
import type { ToolGuideSection } from "@/components/shared/tool-guide";
import {
  probeMetadata,
  writeMetadata,
  stripMetadata,
  abortMetadataEdit,
} from "@/lib/media-toolkit/metadata-edit";
import type {
  MetadataEntry,
  ProbeResult,
} from "@/lib/media-toolkit/metadata-edit";

// ─── Tool Guide ──────────────────────────────────────────────────────────────

const GUIDE_SECTIONS: ToolGuideSection[] = [
  {
    title: "Getting Started",
    content: "Drop a media file to view its metadata, then edit or strip tags.",
    steps: [
      "Drop an audio or video file",
      "Review detected metadata and streams",
      "Edit existing tags or add new ones",
      "Save changes or strip all metadata",
      "Download the modified file",
    ],
  },
  {
    title: "Viewing Metadata",
    content:
      "After loading a file, you'll see format info, duration, bitrate, stream details, and all metadata tags. This information is read-only until you click Edit.",
  },
  {
    title: "Editing Tags",
    content:
      "Edit any detected tag value or add new custom tags. Common tags include title, artist, album, date, genre, and track. Changes use stream copy — no re-encoding.",
  },
  {
    title: "Stripping Metadata",
    content:
      "Strip All Metadata removes every tag from the file using ffmpeg's -map_metadata -1. Useful for privacy before sharing files publicly.",
  },
  {
    title: "Common Tags",
    content:
      "title, artist, album, album_artist, date, genre, track, disc, composer, comment. Not all tags are supported by all formats.",
  },
  {
    title: "Tips",
    content:
      "MP3 files use ID3 tags. M4A/MP4 use iTunes-style atoms. MKV uses Matroska tags. The editor writes format-appropriate tags automatically. All processing is local.",
  },
];

// ─── Types ───────────────────────────────────────────────────────────────────

type Status = "idle" | "probing" | "saving" | "stripping" | "done" | "error";

const ACCEPTED_MEDIA_TYPES =
  "audio/mpeg,audio/mp3,audio/mp4,audio/m4a,audio/ogg,audio/wav,audio/flac,audio/aac,audio/webm,video/mp4,video/webm,video/quicktime,video/x-msvideo,video/x-matroska";

const COMMON_TAGS = [
  "title",
  "artist",
  "album",
  "album_artist",
  "date",
  "genre",
  "track",
  "disc",
  "composer",
  "comment",
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function MetadataEditor() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [probeResult, setProbeResult] = useState<ProbeResult | null>(null);
  const [editEntries, setEditEntries] = useState<MetadataEntry[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  const [status, setStatus] = useState<Status>("idle");
  const [statusLabel, setStatusLabel] = useState("");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const [downloadResult, setDownloadResult] = useState<{
    blob: Blob;
    filename: string;
  } | null>(null);

  const isBusy =
    status === "probing" || status === "saving" || status === "stripping";

  // ── File handling ───────────────────────────────────────────────────────

  const handleFile = useCallback(async (f: File) => {
    setFile(f);
    setStatus("probing");
    setError(null);
    setProbeResult(null);
    setEditEntries([]);
    setIsEditing(false);
    setDownloadResult(null);
    setProgress(0);

    try {
      const result = await probeMetadata(f, {
        onStatus: setStatusLabel,
        onProgress: setProgress,
      });
      setProbeResult(result);
      setEditEntries(result.metadata.map((m) => ({ ...m })));
      setStatus("idle");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to read file");
      setStatus("error");
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (isBusy) return;
      const f = Array.from(e.dataTransfer.files).find(
        (f) => f.type.startsWith("audio/") || f.type.startsWith("video/")
      );
      if (f) handleFile(f);
    },
    [handleFile, isBusy]
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

  // ── Edit entries ───────────────────────────────────────────────────────

  const updateEntry = useCallback(
    (index: number, field: "key" | "value", val: string) => {
      setEditEntries((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], [field]: val };
        return next;
      });
    },
    []
  );

  const removeEntry = useCallback((index: number) => {
    setEditEntries((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const addEntry = useCallback(() => {
    setEditEntries((prev) => [...prev, { key: "", value: "" }]);
  }, []);

  const addCommonTag = useCallback(
    (tag: string) => {
      if (!editEntries.find((e) => e.key === tag)) {
        setEditEntries((prev) => [...prev, { key: tag, value: "" }]);
      }
    },
    [editEntries]
  );

  // ── Save / Strip ──────────────────────────────────────────────────────

  const handleSave = useCallback(async () => {
    if (!file) return;

    const validEntries = editEntries.filter((e) => e.key.trim());
    if (validEntries.length === 0) {
      setError("Add at least one metadata tag to save.");
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;

    setStatus("saving");
    setError(null);
    setDownloadResult(null);
    setProgress(0);

    try {
      const result = await writeMetadata(
        file,
        validEntries,
        { onStatus: setStatusLabel, onProgress: setProgress },
        controller.signal
      );
      setDownloadResult(result);
      setStatus("done");
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        setStatus("idle");
      } else {
        setError(err instanceof Error ? err.message : "Save failed");
        setStatus("error");
      }
    } finally {
      abortRef.current = null;
    }
  }, [file, editEntries]);

  const handleStrip = useCallback(async () => {
    if (!file) return;

    const controller = new AbortController();
    abortRef.current = controller;

    setStatus("stripping");
    setError(null);
    setDownloadResult(null);
    setProgress(0);

    try {
      const result = await stripMetadata(
        file,
        { onStatus: setStatusLabel, onProgress: setProgress },
        controller.signal
      );
      setDownloadResult(result);
      setStatus("done");
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        setStatus("idle");
      } else {
        setError(err instanceof Error ? err.message : "Strip failed");
        setStatus("error");
      }
    } finally {
      abortRef.current = null;
    }
  }, [file]);

  const handleCancel = useCallback(async () => {
    abortRef.current?.abort();
    await abortMetadataEdit();
  }, []);

  const handleDownload = useCallback(() => {
    if (!downloadResult) return;
    const url = URL.createObjectURL(downloadResult.blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = downloadResult.filename;
    a.click();
    URL.revokeObjectURL(url);
  }, [downloadResult]);

  const handleReset = useCallback(() => {
    setFile(null);
    setProbeResult(null);
    setEditEntries([]);
    setIsEditing(false);
    setStatus("idle");
    setError(null);
    setProgress(0);
    setDownloadResult(null);
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
            Drop a media file here to view & edit metadata
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Audio (MP3, M4A, OGG, FLAC, WAV) or Video (MP4, WebM, MKV, MOV,
            AVI).
          </p>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept={ACCEPTED_MEDIA_TYPES}
            onChange={handleFileInput}
          />
        </div>
        <ToolGuide sections={GUIDE_SECTIONS} />
      </>
    );
  }

  // ── Render: Editor UI ───────────────────────────────────────────────────

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
          {!isBusy && (
            <Button variant="ghost" size="sm" onClick={handleReset}>
              Change File
            </Button>
          )}
        </div>

        {/* Probing */}
        {status === "probing" && (
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-sm">
              <Loader2 className="size-4 animate-spin text-brand" />
              <span className="text-muted-foreground">{statusLabel}</span>
            </div>
          </div>
        )}

        {/* File properties */}
        {probeResult && status !== "probing" && (
          <>
            {/* Format info */}
            <div className="rounded-lg border border-border bg-card p-4">
              <h3 className="mb-2 text-sm font-semibold">File Properties</h3>
              <div className="grid gap-2 text-sm sm:grid-cols-3">
                <div>
                  <span className="text-muted-foreground">Format:</span>{" "}
                  <span className="font-medium">
                    {probeResult.format || "Unknown"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Duration:</span>{" "}
                  <span className="font-medium">
                    {probeResult.duration || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Bitrate:</span>{" "}
                  <span className="font-medium">
                    {probeResult.bitrate || "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Streams */}
            {probeResult.streams.length > 0 && (
              <div className="rounded-lg border border-border bg-card p-4">
                <h3 className="mb-2 text-sm font-semibold">Streams</h3>
                <div className="space-y-1.5">
                  {probeResult.streams.map((stream) => (
                    <div
                      key={stream.index}
                      className="flex items-baseline gap-2 text-sm"
                    >
                      <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-xs font-medium">
                        {stream.type}
                      </span>
                      <span className="text-muted-foreground">
                        {stream.details}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Metadata tags */}
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold">
                  Metadata Tags
                  {probeResult.metadata.length === 0 && !isEditing && (
                    <span className="ml-2 text-muted-foreground font-normal">
                      — none found
                    </span>
                  )}
                </h3>
                {!isEditing && !isBusy && status !== "done" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Tags
                  </Button>
                )}
              </div>

              {/* Read-only view */}
              {!isEditing && editEntries.length > 0 && (
                <div className="space-y-1.5">
                  {editEntries.map((entry, i) => (
                    <div key={i} className="flex gap-2 text-sm">
                      <span className="w-28 shrink-0 text-muted-foreground">
                        {entry.key}
                      </span>
                      <span>{entry.value}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Edit view */}
              {isEditing && (
                <>
                  <div className="space-y-2">
                    {editEntries.map((entry, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Input
                          value={entry.key}
                          onChange={(e) =>
                            updateEntry(i, "key", e.target.value)
                          }
                          placeholder="Tag name"
                          className="w-32 shrink-0"
                          disabled={isBusy}
                        />
                        <Input
                          value={entry.value}
                          onChange={(e) =>
                            updateEntry(i, "value", e.target.value)
                          }
                          placeholder="Value"
                          className="flex-1"
                          disabled={isBusy}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeEntry(i)}
                          disabled={isBusy}
                          className="shrink-0"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={addEntry}
                      disabled={isBusy}
                    >
                      <Plus className="mr-1 size-4" />
                      Custom Tag
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      Quick add:
                    </span>
                    {COMMON_TAGS.filter(
                      (t) => !editEntries.find((e) => e.key === t)
                    )
                      .slice(0, 6)
                      .map((tag) => (
                        <Button
                          key={tag}
                          variant="outline"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => addCommonTag(tag)}
                          disabled={isBusy}
                        >
                          {tag}
                        </Button>
                      ))}
                  </div>
                </>
              )}
            </div>
          </>
        )}

        {/* Progress */}
        {(status === "saving" || status === "stripping") && (
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

        {/* Download result */}
        {status === "done" && downloadResult && (
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="mb-2 text-sm font-semibold text-brand">
              {isEditing ? "Tags Saved" : "Metadata Stripped"}
            </h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">
                  {downloadResult.filename}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatSize(downloadResult.blob.size)}
                </p>
              </div>
              <Button size="sm" onClick={handleDownload}>
                <Download className="mr-1.5 size-4" />
                Download
              </Button>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {isEditing && !isBusy && status !== "done" && (
            <>
              <Button size="sm" onClick={handleSave}>
                <Save className="mr-1.5 size-4" />
                Save Tags
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsEditing(false);
                  if (probeResult) {
                    setEditEntries(
                      probeResult.metadata.map((m) => ({ ...m }))
                    );
                  }
                }}
              >
                Cancel Edit
              </Button>
            </>
          )}

          {probeResult && !isEditing && !isBusy && status !== "done" && (
            <Button variant="outline" size="sm" onClick={handleStrip}>
              <Eraser className="mr-1.5 size-4" />
              Strip All Metadata
            </Button>
          )}

          {status === "done" && (
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="mr-1.5 size-4" />
              New File
            </Button>
          )}

          {status === "error" && (
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="mr-1.5 size-4" />
              New File
            </Button>
          )}
        </div>
      </div>
      <ToolGuide sections={GUIDE_SECTIONS} />
    </>
  );
}
