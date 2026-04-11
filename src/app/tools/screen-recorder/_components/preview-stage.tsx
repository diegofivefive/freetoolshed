"use client";

import { useEffect, useRef } from "react";
import { CircleDot, Mic, MicOff, Video, VideoOff, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Compositor } from "@/lib/screen-recorder/compositor";
import type {
  AudioSourceConfig,
  QualityPreset,
  WebcamConfig,
} from "@/lib/screen-recorder/types";

interface PreviewStageProps {
  compositor: Compositor | null;
  webcam: WebcamConfig;
  audioSources: AudioSourceConfig;
  quality: QualityPreset;
  hasMicStream: boolean;
  hasWebcamStream: boolean;
  hasSystemAudio: boolean;
  recordingError: string | null;
  onCancel: () => void;
  onStartRecording: () => void;
}

export function PreviewStage({
  compositor,
  webcam,
  audioSources,
  quality,
  hasMicStream,
  hasWebcamStream,
  hasSystemAudio,
  recordingError,
  onCancel,
  onStartRecording,
}: PreviewStageProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Mount the compositor's canvas into our container. We manage this
  // imperatively because the canvas is created outside React (in compositor.ts)
  // and we don't want to recreate it on every render.
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

  return (
    <div className="space-y-4 rounded-lg border border-border bg-card p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Live Preview</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            This is exactly what will be recorded. Webcam overlay is baked into
            the video.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onCancel}>
            <X className="size-4" />
            Cancel
          </Button>
          <Button size="sm" onClick={onStartRecording}>
            <CircleDot className="size-4" />
            Record
          </Button>
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
        ref={containerRef}
        className="overflow-hidden rounded-md border border-border bg-black"
        style={{ aspectRatio: `${quality.width} / ${quality.height}` }}
        aria-label="Live recording preview"
      />

      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
        <PreviewBadge
          icon={<Video className="size-3" />}
          label={`${quality.label} · ${quality.frameRate} fps`}
          active
        />
        <PreviewBadge
          icon={hasSystemAudio ? <Video className="size-3" /> : <VideoOff className="size-3" />}
          label={
            audioSources.system
              ? hasSystemAudio
                ? "System audio captured"
                : "System audio not available"
              : "System audio off"
          }
          active={audioSources.system && hasSystemAudio}
          warning={audioSources.system && !hasSystemAudio}
        />
        <PreviewBadge
          icon={hasMicStream ? <Mic className="size-3" /> : <MicOff className="size-3" />}
          label={audioSources.mic ? "Microphone ready" : "Microphone off"}
          active={audioSources.mic && hasMicStream}
        />
        <PreviewBadge
          icon={webcam.enabled && hasWebcamStream ? <Video className="size-3" /> : <VideoOff className="size-3" />}
          label={
            webcam.enabled
              ? hasWebcamStream
                ? `Webcam ${webcam.shape} · ${webcam.position.replace("-", " ")}`
                : "Webcam not ready"
              : "Webcam off"
          }
          active={webcam.enabled && hasWebcamStream}
        />
      </div>
    </div>
  );
}

interface PreviewBadgeProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  warning?: boolean;
}

function PreviewBadge({ icon, label, active, warning }: PreviewBadgeProps) {
  const tone = warning
    ? "border-pink-400/40 bg-pink-400/10 text-pink-400"
    : active
      ? "border-brand/40 bg-brand/10 text-brand"
      : "border-border bg-muted/40 text-muted-foreground";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 ${tone}`}
    >
      {icon}
      {label}
    </span>
  );
}
