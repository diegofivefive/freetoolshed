"use client";

import { useCallback, useRef, useState } from "react";
import { GripVertical, X, Clock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AudioFile } from "@/lib/media-toolkit/types";

function formatDuration(seconds: number): string {
  if (seconds <= 0) return "—";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface FileQueueProps {
  files: AudioFile[];
  onReorder: (fromIndex: number, toIndex: number) => void;
  onRemove: (id: string) => void;
  disabled?: boolean;
}

export function FileQueue({
  files,
  onReorder,
  onRemove,
  disabled,
}: FileQueueProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const dragCounter = useRef(0);

  const handleDragStart = useCallback(
    (e: React.DragEvent, index: number) => {
      if (disabled) return;
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", String(index));
      setDragIndex(index);
    },
    [disabled]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent, index: number) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      if (index !== dropIndex) setDropIndex(index);
    },
    [dropIndex]
  );

  const handleDragEnter = useCallback(() => {
    dragCounter.current++;
  }, []);

  const handleDragLeave = useCallback(() => {
    dragCounter.current--;
    if (dragCounter.current === 0) setDropIndex(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, toIndex: number) => {
      e.preventDefault();
      const fromIndex = parseInt(e.dataTransfer.getData("text/plain"), 10);
      if (!isNaN(fromIndex) && fromIndex !== toIndex) {
        onReorder(fromIndex, toIndex);
      }
      setDragIndex(null);
      setDropIndex(null);
      dragCounter.current = 0;
    },
    [onReorder]
  );

  const handleDragEnd = useCallback(() => {
    setDragIndex(null);
    setDropIndex(null);
    dragCounter.current = 0;
  }, []);

  const totalDuration = files.reduce((sum, f) => sum + f.duration, 0);
  const totalSize = files.reduce((sum, f) => sum + f.sizeBytes, 0);
  const readyCount = files.filter((f) => f.status === "ready").length;

  return (
    <div className="rounded-lg border border-border bg-card">
      {/* Summary bar */}
      <div className="flex flex-wrap items-center gap-4 border-b border-border px-4 py-2 text-sm text-muted-foreground">
        <span>
          {files.length} file{files.length !== 1 ? "s" : ""}
          {readyCount < files.length && ` (${readyCount} ready)`}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="size-3.5" />
          {formatDuration(totalDuration)}
        </span>
        <span>{formatSize(totalSize)}</span>
      </div>

      {/* File list */}
      <div className="max-h-[60vh] overflow-y-auto">
        {files.map((file, index) => (
          <div
            key={file.id}
            draggable={!disabled}
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            className={`flex items-center gap-2 border-b border-border px-2 py-1.5 text-sm transition-colors last:border-b-0 ${
              dragIndex === index
                ? "opacity-40"
                : dropIndex === index
                  ? "bg-brand/10"
                  : "hover:bg-muted/50"
            } ${disabled ? "cursor-default" : "cursor-grab active:cursor-grabbing"}`}
          >
            {/* Drag handle */}
            <GripVertical className="size-4 shrink-0 text-muted-foreground" />

            {/* Number */}
            <span className="w-8 shrink-0 text-right tabular-nums text-muted-foreground">
              {index + 1}
            </span>

            {/* Filename */}
            <span className="min-w-0 flex-1 truncate" title={file.name}>
              {file.name}
            </span>

            {/* Status / duration */}
            {file.status === "error" ? (
              <span className="flex items-center gap-1 text-pink-400">
                <AlertTriangle className="size-3.5" />
                <span className="text-xs">Error</span>
              </span>
            ) : file.status === "probing" ? (
              <span className="text-xs text-muted-foreground">Reading…</span>
            ) : (
              <span className="shrink-0 tabular-nums text-muted-foreground">
                {formatDuration(file.duration)}
              </span>
            )}

            {/* Size */}
            <span className="w-16 shrink-0 text-right tabular-nums text-muted-foreground">
              {formatSize(file.sizeBytes)}
            </span>

            {/* Remove */}
            <Button
              variant="ghost"
              size="icon"
              className="size-6 shrink-0"
              onClick={() => onRemove(file.id)}
              disabled={disabled}
            >
              <X className="size-3.5" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
