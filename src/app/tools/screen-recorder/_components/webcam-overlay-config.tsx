"use client";

import { Video, VideoOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type {
  WebcamConfig,
  WebcamPosition,
  WebcamShape,
  WebcamSize,
} from "@/lib/screen-recorder/types";

interface WebcamOverlayConfigProps {
  webcam: WebcamConfig;
  onToggle: () => void;
  onChange: (patch: Partial<WebcamConfig>) => void;
}

const POSITION_LABEL: Record<WebcamPosition, string> = {
  "top-left": "Top left",
  "top-right": "Top right",
  "bottom-left": "Bottom left",
  "bottom-right": "Bottom right",
};

const POSITION_ORDER: WebcamPosition[] = [
  "top-left",
  "top-right",
  "bottom-left",
  "bottom-right",
];

const SIZE_ORDER: WebcamSize[] = ["sm", "md", "lg"];
const SIZE_LABEL: Record<WebcamSize, string> = {
  sm: "Small",
  md: "Medium",
  lg: "Large",
};

// Preview-only sizes (px) — proportional to the mock screen's ~280px width
// so users can see how the real overlay will look relative to their screen.
const PREVIEW_SIZE_PX: Record<WebcamSize, number> = {
  sm: 28,
  md: 40,
  lg: 52,
};

const SHAPE_ORDER: WebcamShape[] = ["circle", "square"];
const SHAPE_LABEL: Record<WebcamShape, string> = {
  circle: "Circle",
  square: "Square",
};

const PREVIEW_EDGE_INSET = 8; // px padding from preview container edges

export function WebcamOverlayConfig({
  webcam,
  onToggle,
  onChange,
}: WebcamOverlayConfigProps) {
  const previewPx = PREVIEW_SIZE_PX[webcam.size];
  const previewPositionStyle: React.CSSProperties = {
    width: previewPx,
    height: previewPx,
    borderRadius: webcam.shape === "circle" ? "9999px" : "0.5rem",
    ...(webcam.position === "top-left" && {
      top: PREVIEW_EDGE_INSET,
      left: PREVIEW_EDGE_INSET,
    }),
    ...(webcam.position === "top-right" && {
      top: PREVIEW_EDGE_INSET,
      right: PREVIEW_EDGE_INSET,
    }),
    ...(webcam.position === "bottom-left" && {
      bottom: PREVIEW_EDGE_INSET,
      left: PREVIEW_EDGE_INSET,
    }),
    ...(webcam.position === "bottom-right" && {
      bottom: PREVIEW_EDGE_INSET,
      right: PREVIEW_EDGE_INSET,
    }),
  };

  return (
    <div className="space-y-4 rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold">Webcam Overlay</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Add a picture-in-picture bubble baked into the final recording.
          </p>
        </div>
        <Button
          variant={webcam.enabled ? "default" : "outline"}
          size="sm"
          onClick={onToggle}
          aria-pressed={webcam.enabled}
          aria-label={webcam.enabled ? "Disable webcam overlay" : "Enable webcam overlay"}
        >
          {webcam.enabled ? (
            <>
              <Video className="size-3.5" />
              On
            </>
          ) : (
            <>
              <VideoOff className="size-3.5" />
              Off
            </>
          )}
        </Button>
      </div>

      <div
        className={cn(
          "grid gap-4 transition-opacity sm:grid-cols-[1fr_auto]",
          !webcam.enabled && "pointer-events-none opacity-40",
        )}
        aria-hidden={!webcam.enabled}
      >
        <div className="space-y-3">
          {/* Position grid */}
          <div>
            <div className="mb-1.5 text-xs font-medium text-muted-foreground">
              Position
            </div>
            <div className="grid max-w-[180px] grid-cols-2 gap-1.5">
              {POSITION_ORDER.map((pos) => {
                const active = webcam.position === pos;
                return (
                  <button
                    key={pos}
                    type="button"
                    onClick={() => onChange({ position: pos })}
                    aria-pressed={active}
                    aria-label={POSITION_LABEL[pos]}
                    className={cn(
                      "relative aspect-video rounded border transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                      active
                        ? "border-brand bg-brand/10"
                        : "border-border bg-muted/40 hover:border-brand/50",
                    )}
                  >
                    <span
                      className={cn(
                        "absolute size-2 rounded-full",
                        active ? "bg-brand" : "bg-muted-foreground/50",
                        pos === "top-left" && "top-1 left-1",
                        pos === "top-right" && "top-1 right-1",
                        pos === "bottom-left" && "bottom-1 left-1",
                        pos === "bottom-right" && "bottom-1 right-1",
                      )}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Size buttons */}
          <div>
            <div className="mb-1.5 text-xs font-medium text-muted-foreground">
              Size
            </div>
            <div className="flex gap-1.5">
              {SIZE_ORDER.map((size) => (
                <Button
                  key={size}
                  variant={webcam.size === size ? "default" : "outline"}
                  size="sm"
                  onClick={() => onChange({ size })}
                  aria-pressed={webcam.size === size}
                >
                  {SIZE_LABEL[size]}
                </Button>
              ))}
            </div>
          </div>

          {/* Shape buttons */}
          <div>
            <div className="mb-1.5 text-xs font-medium text-muted-foreground">
              Shape
            </div>
            <div className="flex gap-1.5">
              {SHAPE_ORDER.map((shape) => (
                <Button
                  key={shape}
                  variant={webcam.shape === shape ? "default" : "outline"}
                  size="sm"
                  onClick={() => onChange({ shape })}
                  aria-pressed={webcam.shape === shape}
                >
                  {SHAPE_LABEL[shape]}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Live preview */}
        <div className="flex flex-col items-center gap-1.5">
          <div className="mb-0.5 text-xs font-medium text-muted-foreground">
            Preview
          </div>
          <div
            className="relative aspect-video w-[220px] overflow-hidden rounded-md border border-border bg-gradient-to-br from-muted via-muted/60 to-muted/40"
            aria-hidden
          >
            {/* Fake dock/toolbar lines for screen context */}
            <div className="absolute inset-x-3 top-2 flex gap-1">
              <div className="h-1 w-6 rounded-full bg-muted-foreground/30" />
              <div className="h-1 w-10 rounded-full bg-muted-foreground/20" />
              <div className="h-1 w-4 rounded-full bg-muted-foreground/20" />
            </div>
            <div className="absolute inset-x-6 top-6 flex flex-col gap-1">
              <div className="h-0.5 w-full rounded bg-muted-foreground/15" />
              <div className="h-0.5 w-4/5 rounded bg-muted-foreground/15" />
              <div className="h-0.5 w-3/5 rounded bg-muted-foreground/10" />
            </div>
            {/* Webcam bubble */}
            <div
              className="absolute border border-brand/70 bg-brand/25 shadow-sm"
              style={previewPositionStyle}
            >
              <div className="flex size-full items-center justify-center">
                <Video className="size-3 text-brand" aria-hidden />
              </div>
            </div>
          </div>
          <span className="text-[11px] text-muted-foreground">
            {PREVIEW_LABEL[webcam.size]}
          </span>
        </div>
      </div>
    </div>
  );
}

const PREVIEW_LABEL: Record<WebcamSize, string> = {
  sm: "160 × 160 px",
  md: "220 × 220 px",
  lg: "300 × 300 px",
};
