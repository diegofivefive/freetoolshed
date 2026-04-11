"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  Pause,
  Play,
  RefreshCcw,
  RotateCcw,
  Scissors,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  formatBytes,
  formatDuration,
} from "@/lib/screen-recorder/format";
import type { TrimRange } from "@/lib/screen-recorder/types";

interface PlaybackStageProps {
  recordedUrl: string;
  recordedMimeType: string | null;
  recordedDurationMs: number;
  recordedSizeBytes: number;
  trim: TrimRange | null;
  onTrimChange: (trim: TrimRange) => void;
  onRecordAnother: () => void;
}

// Minimum gap between start and end handles (100ms).
const MIN_TRIM_GAP_SECONDS = 0.1;
// Small epsilon to avoid the loop-back boundary sticking on >=.
const TRIM_BOUNDARY_EPSILON = 0.03;

type DragKind = "start" | "end" | "playhead";

export function PlaybackStage({
  recordedUrl,
  recordedMimeType,
  recordedDurationMs,
  recordedSizeBytes,
  trim,
  onTrimChange,
  onRecordAnother,
}: PlaybackStageProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const timelineRef = useRef<HTMLDivElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [dragKind, setDragKind] = useState<DragKind | null>(null);

  // Use the authoritative duration we tracked during recording. WebM produced
  // by MediaRecorder often has Infinity duration in metadata, so we never rely
  // on video.duration for math — only for the browser's internal seeking.
  const totalSeconds = useMemo(
    () => Math.max(0, recordedDurationMs / 1000),
    [recordedDurationMs],
  );

  const trimStart = trim?.start ?? 0;
  const trimEnd = trim?.end ?? totalSeconds;
  const trimmedDuration = Math.max(0, trimEnd - trimStart);

  /* ── Video element bookkeeping ──────────────────────────── */

  // Chrome/MediaRecorder WebM files often report duration === Infinity until
  // you seek beyond the end. Nudge the video into calculating a real duration
  // so trimmed playback can seek cleanly.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onLoadedMetadata = () => {
      if (video.duration === Infinity || Number.isNaN(video.duration)) {
        const fix = () => {
          video.removeEventListener("timeupdate", fix);
          video.currentTime = 0;
        };
        video.addEventListener("timeupdate", fix);
        try {
          video.currentTime = 1e101;
        } catch {
          /* some browsers throw on absurd seeks — fall back to doing nothing */
          video.removeEventListener("timeupdate", fix);
        }
      }
    };

    video.addEventListener("loadedmetadata", onLoadedMetadata);
    return () => {
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
    };
  }, [recordedUrl]);

  // Respect trim bounds: pause & loop back to trim start when we hit trim end.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTimeUpdate = () => {
      const t = video.currentTime;
      setCurrentTime(t);
      if (t >= trimEnd - TRIM_BOUNDARY_EPSILON / 2) {
        video.pause();
        video.currentTime = trimStart;
      } else if (t < trimStart - TRIM_BOUNDARY_EPSILON) {
        video.currentTime = trimStart;
      }
    };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => {
      setIsPlaying(false);
      video.currentTime = trimStart;
    };

    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("ended", onEnded);
    return () => {
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("ended", onEnded);
    };
  }, [trimStart, trimEnd]);

  /* ── Playback controls ──────────────────────────────────── */

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      // If the playhead is outside the trim window, jump to trim start.
      if (
        video.currentTime < trimStart - TRIM_BOUNDARY_EPSILON ||
        video.currentTime >= trimEnd - TRIM_BOUNDARY_EPSILON / 2
      ) {
        video.currentTime = trimStart;
      }
      void video.play().catch(() => {
        /* autoplay policies can reject; user will click again */
      });
    } else {
      video.pause();
    }
  }, [trimStart, trimEnd]);

  /* ── Timeline math ──────────────────────────────────────── */

  const timeFromClientX = useCallback(
    (clientX: number): number => {
      const el = timelineRef.current;
      if (!el || totalSeconds <= 0) return 0;
      const rect = el.getBoundingClientRect();
      const ratio =
        rect.width > 0
          ? Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
          : 0;
      return ratio * totalSeconds;
    },
    [totalSeconds],
  );

  const applyDrag = useCallback(
    (kind: DragKind, clientX: number) => {
      const t = timeFromClientX(clientX);
      const video = videoRef.current;

      if (kind === "start") {
        const clamped = Math.min(
          trimEnd - MIN_TRIM_GAP_SECONDS,
          Math.max(0, t),
        );
        onTrimChange({ start: clamped, end: trimEnd });
        if (video) video.currentTime = clamped;
        return;
      }
      if (kind === "end") {
        const clamped = Math.max(
          trimStart + MIN_TRIM_GAP_SECONDS,
          Math.min(totalSeconds, t),
        );
        onTrimChange({ start: trimStart, end: clamped });
        if (video && video.currentTime > clamped) {
          video.currentTime = Math.max(trimStart, clamped - TRIM_BOUNDARY_EPSILON);
        }
        return;
      }
      // playhead
      const clamped = Math.max(trimStart, Math.min(trimEnd, t));
      if (video) video.currentTime = clamped;
    },
    [onTrimChange, timeFromClientX, totalSeconds, trimEnd, trimStart],
  );

  // Window-level pointer listeners while dragging so the gesture survives the
  // cursor leaving the handle.
  useEffect(() => {
    if (!dragKind) return;
    const onMove = (e: PointerEvent) => {
      e.preventDefault();
      applyDrag(dragKind, e.clientX);
    };
    const onUp = () => setDragKind(null);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [applyDrag, dragKind]);

  const beginDrag = useCallback(
    (kind: DragKind) =>
      (e: ReactPointerEvent<HTMLElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragKind(kind);
        applyDrag(kind, e.clientX);
      },
    [applyDrag],
  );

  const onTimelineClick = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      // Click-to-seek inside the track itself (not the handles).
      setDragKind("playhead");
      applyDrag("playhead", e.clientX);
    },
    [applyDrag],
  );

  const nudgeHandle = useCallback(
    (kind: "start" | "end", deltaSeconds: number) => {
      if (kind === "start") {
        const next = Math.min(
          trimEnd - MIN_TRIM_GAP_SECONDS,
          Math.max(0, trimStart + deltaSeconds),
        );
        onTrimChange({ start: next, end: trimEnd });
        const video = videoRef.current;
        if (video) video.currentTime = next;
      } else {
        const next = Math.max(
          trimStart + MIN_TRIM_GAP_SECONDS,
          Math.min(totalSeconds, trimEnd + deltaSeconds),
        );
        onTrimChange({ start: trimStart, end: next });
      }
    },
    [onTrimChange, totalSeconds, trimEnd, trimStart],
  );

  const onResetTrim = useCallback(() => {
    onTrimChange({ start: 0, end: totalSeconds });
    const video = videoRef.current;
    if (video) video.currentTime = 0;
  }, [onTrimChange, totalSeconds]);

  /* ── Derived percentages for positioning ────────────────── */

  const toPercent = useCallback(
    (seconds: number): number => {
      if (totalSeconds <= 0) return 0;
      return Math.min(100, Math.max(0, (seconds / totalSeconds) * 100));
    },
    [totalSeconds],
  );

  const startPct = toPercent(trimStart);
  const endPct = toPercent(trimEnd);
  const playheadPct = toPercent(currentTime);
  const currentTrimmed = Math.max(0, currentTime - trimStart);

  const trimApplied = trimStart > 0.05 || trimEnd < totalSeconds - 0.05;

  return (
    <div className="space-y-5 rounded-lg border border-border bg-card p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Review &amp; Trim</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Play back your recording, then drag the handles on the timeline to
            trim the start or end.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onRecordAnother}>
            <RefreshCcw className="size-4" />
            Record another
          </Button>
        </div>
      </div>

      <div
        className="overflow-hidden rounded-md border border-border bg-black"
        style={{ aspectRatio: "16 / 9" }}
        aria-label="Recording playback"
      >
        <video
          ref={videoRef}
          src={recordedUrl}
          className="block h-full w-full"
          controls={false}
          playsInline
          preload="metadata"
        />
      </div>

      {/* Playback controls row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            size="sm"
            onClick={togglePlay}
            aria-label={isPlaying ? "Pause playback" : "Play recording"}
          >
            {isPlaying ? (
              <Pause className="size-4" />
            ) : (
              <Play className="size-4" />
            )}
            {isPlaying ? "Pause" : "Play"}
          </Button>
          <div className="font-mono tabular-nums text-sm text-muted-foreground">
            <span className="text-foreground">
              {formatDuration(currentTrimmed * 1000)}
            </span>{" "}
            / {formatDuration(trimmedDuration * 1000)}
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onResetTrim}
          disabled={!trimApplied}
        >
          <RotateCcw className="size-4" />
          Reset trim
        </Button>
      </div>

      {/* Timeline */}
      <div>
        <div
          ref={timelineRef}
          role="group"
          aria-label="Trim timeline"
          className="group relative h-10 w-full select-none touch-none"
          onPointerDown={onTimelineClick}
        >
          {/* Track background */}
          <div className="absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 rounded-full bg-muted" />

          {/* Dimmed regions outside the trim window */}
          <div
            className="pointer-events-none absolute top-1/2 h-2 -translate-y-1/2 rounded-l-full bg-border"
            style={{ left: 0, width: `${startPct}%` }}
            aria-hidden
          />
          <div
            className="pointer-events-none absolute top-1/2 h-2 -translate-y-1/2 rounded-r-full bg-border"
            style={{
              left: `${endPct}%`,
              width: `${Math.max(0, 100 - endPct)}%`,
            }}
            aria-hidden
          />

          {/* Active trim region */}
          <div
            className="pointer-events-none absolute top-1/2 h-2 -translate-y-1/2 bg-brand"
            style={{
              left: `${startPct}%`,
              width: `${Math.max(0, endPct - startPct)}%`,
            }}
            aria-hidden
          />

          {/* Start handle */}
          <button
            type="button"
            role="slider"
            aria-label="Trim start"
            aria-valuemin={0}
            aria-valuemax={totalSeconds}
            aria-valuenow={trimStart}
            aria-valuetext={formatDuration(trimStart * 1000)}
            onPointerDown={beginDrag("start")}
            onKeyDown={(e) => {
              if (e.key === "ArrowLeft") {
                e.preventDefault();
                nudgeHandle("start", e.shiftKey ? -1 : -0.1);
              } else if (e.key === "ArrowRight") {
                e.preventDefault();
                nudgeHandle("start", e.shiftKey ? 1 : 0.1);
              } else if (e.key === "Home") {
                e.preventDefault();
                onTrimChange({ start: 0, end: trimEnd });
              }
            }}
            className="absolute top-1/2 flex h-8 w-4 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize items-center justify-center rounded border border-brand bg-brand/90 shadow hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:ring-offset-1 focus:ring-offset-background"
            style={{ left: `${startPct}%` }}
          >
            <Scissors className="size-3 text-background" aria-hidden />
          </button>

          {/* End handle */}
          <button
            type="button"
            role="slider"
            aria-label="Trim end"
            aria-valuemin={0}
            aria-valuemax={totalSeconds}
            aria-valuenow={trimEnd}
            aria-valuetext={formatDuration(trimEnd * 1000)}
            onPointerDown={beginDrag("end")}
            onKeyDown={(e) => {
              if (e.key === "ArrowLeft") {
                e.preventDefault();
                nudgeHandle("end", e.shiftKey ? -1 : -0.1);
              } else if (e.key === "ArrowRight") {
                e.preventDefault();
                nudgeHandle("end", e.shiftKey ? 1 : 0.1);
              } else if (e.key === "End") {
                e.preventDefault();
                onTrimChange({ start: trimStart, end: totalSeconds });
              }
            }}
            className="absolute top-1/2 flex h-8 w-4 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize items-center justify-center rounded border border-brand bg-brand/90 shadow hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:ring-offset-1 focus:ring-offset-background"
            style={{ left: `${endPct}%` }}
          >
            <Scissors className="size-3 text-background" aria-hidden />
          </button>

          {/* Playhead (tall thin line inside trim region) */}
          <div
            className="pointer-events-none absolute top-1/2 h-6 w-0.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground shadow-[0_0_0_1px_rgba(0,0,0,0.6)]"
            style={{ left: `${playheadPct}%` }}
            aria-hidden
          />
        </div>

        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-mono tabular-nums">0:00</span>
          <span className="font-mono tabular-nums">
            {formatDuration(totalSeconds * 1000)}
          </span>
        </div>
      </div>

      {/* Stats */}
      <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <Stat label="Original" value={formatDuration(recordedDurationMs)} />
        <Stat
          label="Trimmed"
          value={formatDuration(trimmedDuration * 1000)}
          highlight={trimApplied}
        />
        <Stat label="File size" value={formatBytes(recordedSizeBytes)} />
        <Stat
          label="Format"
          value={
            recordedMimeType
              ? recordedMimeType.replace("video/", "").split(";")[0]
              : "webm"
          }
        />
      </dl>
    </div>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-md border px-3 py-2 ${
        highlight
          ? "border-brand/40 bg-brand/10"
          : "border-border bg-muted/40"
      }`}
    >
      <dt className="text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd
        className={`font-mono tabular-nums ${
          highlight ? "text-brand" : "text-foreground"
        }`}
      >
        {value}
      </dd>
    </div>
  );
}
