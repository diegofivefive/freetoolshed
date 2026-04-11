"use client";

import { useEffect, useRef } from "react";
import { Pause, Play, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Compositor } from "@/lib/screen-recorder/compositor";
import { formatDuration } from "@/lib/screen-recorder/format";
import type { QualityPreset, RecorderPhase } from "@/lib/screen-recorder/types";
import { CountdownOverlay } from "./countdown-overlay";

interface RecordingStageProps {
  compositor: Compositor | null;
  phase: Extract<RecorderPhase, "countdown" | "recording" | "paused">;
  quality: QualityPreset;
  elapsedMs: number;
  countdownValue: number | null;
  recordingError: string | null;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
}

export function RecordingStage({
  compositor,
  phase,
  quality,
  elapsedMs,
  countdownValue,
  recordingError,
  onPause,
  onResume,
  onStop,
}: RecordingStageProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Mount the (shared) compositor canvas into this stage's container.
  // The same DOM canvas element moves between PreviewStage and RecordingStage
  // via React effect cleanups — captureStream() keeps producing frames
  // regardless of DOM parent.
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !compositor) return;
    const canvas = compositor.canvas;
    canvas.className = "block h-auto w-full";
    container.appendChild(canvas);
    return () => {
      if (canvas.parentElement === container) {
        container.removeChild(canvas);
      }
    };
  }, [compositor]);

  const isCountdown = phase === "countdown";
  const isRecording = phase === "recording";
  const isPaused = phase === "paused";

  return (
    <div className="space-y-4 rounded-lg border border-border bg-card p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">
            {isCountdown
              ? "Get Ready\u2026"
              : isPaused
                ? "Recording Paused"
                : "Recording"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {isCountdown
              ? "Recording will start automatically."
              : "Your screen is being captured. Audio and webcam overlay are baked in."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isRecording && (
            <Button variant="outline" size="sm" onClick={onPause}>
              <Pause className="size-4" />
              Pause
            </Button>
          )}
          {isPaused && (
            <Button variant="outline" size="sm" onClick={onResume}>
              <Play className="size-4" />
              Resume
            </Button>
          )}
          {(isRecording || isPaused) && (
            <Button size="sm" onClick={onStop}>
              <Square className="size-4" />
              Stop
            </Button>
          )}
        </div>
      </div>

      {recordingError && (
        <div
          role="alert"
          className="rounded-md border border-pink-400/40 bg-pink-400/10 px-3 py-2 text-sm text-pink-400"
        >
          {recordingError}
        </div>
      )}

      <div
        className="relative overflow-hidden rounded-md border border-border bg-black"
        style={{ aspectRatio: `${quality.width} / ${quality.height}` }}
        aria-label="Recording preview"
      >
        <div ref={containerRef} className="h-full w-full" />

        {/* Elapsed time / REC indicator — absolutely positioned on top of the canvas */}
        {(isRecording || isPaused) && (
          <div className="pointer-events-none absolute top-3 left-3 flex items-center gap-2 rounded-full bg-black/70 px-3 py-1.5 text-sm text-white shadow-lg backdrop-blur">
            <span
              className={`size-2.5 rounded-full bg-pink-400 ${
                isRecording ? "animate-pulse" : ""
              }`}
              aria-hidden
            />
            <span className="font-mono tabular-nums">
              {formatDuration(elapsedMs)}
            </span>
            <span className="text-xs uppercase tracking-wider text-pink-400">
              {isPaused ? "Paused" : "Rec"}
            </span>
          </div>
        )}

        {isCountdown && countdownValue !== null && (
          <CountdownOverlay count={countdownValue} />
        )}
      </div>

      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-2.5 py-1">
          {quality.label} &middot; {quality.frameRate} fps
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-2.5 py-1">
          {isCountdown
            ? "Starting\u2026"
            : isPaused
              ? "Paused"
              : `Recording \u2014 ${formatDuration(elapsedMs)}`}
        </span>
      </div>
    </div>
  );
}
