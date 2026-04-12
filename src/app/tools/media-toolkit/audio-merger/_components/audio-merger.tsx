"use client";

import { useCallback, useReducer, useRef, useState } from "react";
import {
  Upload,
  Plus,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Trash2,
  Merge,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToolGuide } from "@/components/shared/tool-guide";
import type { ToolGuideSection } from "@/components/shared/tool-guide";
import { mergerReducer, initialMergerState } from "@/lib/media-toolkit/reducer";
import { probeBatch } from "@/lib/media-toolkit/audio-probe";
import { runMerge, abortMerge } from "@/lib/media-toolkit/merge";
import {
  ACCEPTED_AUDIO_TYPES,
  MEMORY_WARNING_BYTES,
} from "@/lib/media-toolkit/constants";
import type { AudioFile, SortMode } from "@/lib/media-toolkit/types";
import { FileQueue } from "./file-queue";
import { OutputSettings } from "./output-settings";
import { MergeProgress } from "./merge-progress";

// ─── Tool Guide ──────────────────────────────────────────────────────────────

const GUIDE_SECTIONS: ToolGuideSection[] = [
  {
    title: "Getting Started",
    content: "Add audio files by dragging them onto the upload area or clicking to browse.",
    steps: [
      "Drop files or click Browse",
      "Arrange the order",
      "Choose output format",
      "Click Merge",
      "Download the result",
    ],
  },
  {
    title: "Supported Formats",
    content: "Input: MP3, M4A, WAV, OGG, FLAC, AAC, WebM. Output: M4A (AAC), MP3, OGG.",
  },
  {
    title: "Sorting & Reordering",
    content:
      "Sort by Name (natural numeric order), Date Modified, File Size, or Duration. Toggle ascending/descending. Switch to Manual to drag-reorder with grip handles.",
  },
  {
    title: "Chapter Markers",
    content: "Enable chapter markers (M4A only) to embed chapter metadata. Each file becomes a chapter titled by its filename. Works in Apple Books, VLC, iTunes.",
  },
  {
    title: "Output Settings",
    content: "Choose M4A for audiobooks (best compatibility + chapters), MP3 for universal playback, OGG for open-source players. Bitrate 128k is a good default for speech.",
  },
  {
    title: "Tips",
    content: "For audiobooks, 64-128 kbps is plenty for speech. Higher bitrates are better for music. The first merge downloads ffmpeg (~30 MB) — subsequent merges are instant.",
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

let nextId = 0;
function makeId(): string {
  return `file-${++nextId}-${Date.now()}`;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function estimateOutputSize(
  totalDuration: number,
  bitrate: string
): string {
  const kbps = parseInt(bitrate, 10);
  if (!kbps || totalDuration <= 0) return "—";
  const bytes = (kbps * 1000 * totalDuration) / 8;
  return formatSize(bytes);
}

const SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: "manual", label: "Manual (drag)" },
  { value: "name", label: "Name" },
  { value: "date", label: "Date Modified" },
  { value: "size", label: "File Size" },
  { value: "duration", label: "Duration" },
];

// ─── Component ───────────────────────────────────────────────────────────────

export function AudioMerger() {
  const [state, dispatch] = useReducer(mergerReducer, initialMergerState);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const { files, options, mergeStatus, mergeProgress, mergeError, outputBlob } =
    state;

  const isMerging =
    mergeStatus === "loading-ffmpeg" ||
    mergeStatus === "concatenating" ||
    mergeStatus === "encoding";

  const readyFiles = files.filter((f) => f.status === "ready");
  const canMerge = readyFiles.length >= 2 && !isMerging;
  const totalSize = files.reduce((sum, f) => sum + f.sizeBytes, 0);
  const totalDuration = files.reduce((sum, f) => sum + f.duration, 0);
  const showMemoryWarning = totalSize > MEMORY_WARNING_BYTES;

  // ── Sort helper ─────────────────────────────────────────────────────────

  const applySort = useCallback(
    (mode: SortMode, direction: "asc" | "desc") => {
      if (mode !== "manual") {
        dispatch({ type: "SORT", mode, direction });
      }
    },
    []
  );

  const handleSortModeChange = useCallback(
    (value: string | null) => {
      if (!value) return;
      const mode = value as SortMode;
      setSortMode(mode);
      applySort(mode, sortDirection);
    },
    [sortDirection, applySort]
  );

  const toggleSortDirection = useCallback(() => {
    const next = sortDirection === "asc" ? "desc" : "asc";
    setSortDirection(next);
    applySort(sortMode, next);
  }, [sortMode, sortDirection, applySort]);

  // ── Add files ───────────────────────────────────────────────────────────

  const addFiles = useCallback(
    (fileList: FileList | File[]) => {
      const newFiles: AudioFile[] = Array.from(fileList).map((file) => ({
        id: makeId(),
        file,
        name: file.name,
        duration: 0,
        sizeBytes: file.size,
        lastModified: file.lastModified,
        status: "probing" as const,
      }));

      dispatch({ type: "ADD_FILES", files: newFiles });

      // Probe durations in background
      probeBatch(
        newFiles.map((f) => ({ id: f.id, file: f.file })),
        (id, duration) =>
          dispatch({
            type: "UPDATE_FILE",
            id,
            patch: { duration, status: "ready" },
          }),
        (id, error) =>
          dispatch({
            type: "UPDATE_FILE",
            id,
            patch: { status: "error", error },
          })
      );

      // Auto-sort after adding (for non-manual modes)
      if (sortMode !== "manual") {
        // Use a microtask so the ADD_FILES dispatch settles first
        queueMicrotask(() => applySort(sortMode, sortDirection));
      }
    },
    [sortMode, sortDirection, applySort]
  );

  // ── Drop zone handlers ──────────────────────────────────────────────────

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (isMerging) return;

      const droppedFiles = Array.from(e.dataTransfer.files).filter((f) =>
        f.type.startsWith("audio/")
      );
      if (droppedFiles.length > 0) addFiles(droppedFiles);
    },
    [addFiles, isMerging]
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

  // ── Merge ───────────────────────────────────────────────────────────────

  const handleMerge = useCallback(async () => {
    if (!canMerge) return;

    const controller = new AbortController();
    abortRef.current = controller;

    dispatch({ type: "SET_MERGE_STATUS", status: "loading-ffmpeg" });

    try {
      const blob = await runMerge(
        readyFiles,
        options,
        {
          onStatus: (status) => {
            if (status === "Reading files…") {
              dispatch({ type: "SET_MERGE_STATUS", status: "concatenating" });
            } else if (status === "Merging audio…") {
              dispatch({ type: "SET_MERGE_STATUS", status: "encoding" });
            }
          },
          onProgress: (fraction) =>
            dispatch({ type: "SET_MERGE_PROGRESS", progress: fraction }),
        },
        controller.signal
      );

      dispatch({ type: "SET_OUTPUT_BLOB", blob });
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        dispatch({ type: "RESET_MERGE" });
      } else {
        dispatch({
          type: "SET_MERGE_ERROR",
          error: err instanceof Error ? err.message : "Unknown error",
        });
      }
    } finally {
      abortRef.current = null;
    }
  }, [canMerge, readyFiles, options]);

  const handleCancel = useCallback(async () => {
    abortRef.current?.abort();
    await abortMerge();
    dispatch({ type: "RESET_MERGE" });
  }, []);

  const handleReset = useCallback(() => {
    dispatch({ type: "RESET_MERGE" });
  }, []);

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
            Drop audio files here to merge
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            MP3, M4A, WAV, OGG, FLAC, AAC, WebM — drag and drop or click to
            browse. Supports hundreds of files.
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

  // ── Render: File queue + controls ───────────────────────────────────────

  return (
    <>
      <div className="space-y-4">
        {/* Drop zone (compact) */}
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

        {/* Memory warning */}
        {showMemoryWarning && (
          <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-400">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <span>
              Total input size exceeds 1 GB ({(totalSize / (1024 * 1024 * 1024)).toFixed(1)} GB).
              Your browser may run out of memory during the merge.
            </span>
          </div>
        )}

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isMerging}
          >
            <Plus className="mr-1.5 size-4" />
            Add Files
          </Button>

          {/* Sort controls */}
          <div className="flex items-center gap-1">
            <ArrowUpDown className="size-4 text-muted-foreground" />
            <Select
              value={sortMode}
              onValueChange={handleSortModeChange}
              disabled={isMerging}
            >
              <SelectTrigger className="h-8 w-[140px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {sortMode !== "manual" && (
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={toggleSortDirection}
                disabled={isMerging}
                title={sortDirection === "asc" ? "Ascending" : "Descending"}
              >
                {sortDirection === "asc" ? (
                  <ArrowUp className="size-4" />
                ) : (
                  <ArrowDown className="size-4" />
                )}
              </Button>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => dispatch({ type: "CLEAR_FILES" })}
            disabled={isMerging}
          >
            <Trash2 className="mr-1.5 size-4" />
            Clear All
          </Button>

          <div className="flex-1" />

          {/* Estimated output size */}
          {totalDuration > 0 && (
            <span className="text-xs text-muted-foreground">
              Est. output: {estimateOutputSize(totalDuration, options.outputBitrate)}
            </span>
          )}

          <Button
            size="sm"
            onClick={handleMerge}
            disabled={!canMerge}
          >
            <Merge className="mr-1.5 size-4" />
            Merge {readyFiles.length} Files
          </Button>
        </div>

        {/* File queue */}
        <FileQueue
          files={files}
          onReorder={(from, to) => {
            setSortMode("manual");
            dispatch({ type: "REORDER", fromIndex: from, toIndex: to });
          }}
          onRemove={(id) => dispatch({ type: "REMOVE_FILE", id })}
          disabled={isMerging}
        />

        {/* Output settings */}
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="mb-3 text-sm font-semibold">Output Settings</h3>
          <OutputSettings
            options={options}
            onUpdate={(patch) => dispatch({ type: "SET_OPTION", patch })}
            disabled={isMerging}
          />
        </div>

        {/* Merge progress */}
        <MergeProgress
          status={mergeStatus}
          progress={mergeProgress}
          error={mergeError}
          outputBlob={outputBlob}
          outputFilename={options.outputFilename}
          outputFormat={options.outputFormat}
          onCancel={handleCancel}
          onReset={handleReset}
        />
      </div>
      <ToolGuide sections={GUIDE_SECTIONS} />
    </>
  );
}
