"use client";

import {
  useRef,
  useEffect,
  useCallback,
  useState,
  type MouseEvent,
} from "react";
import { WAVEFORM_HEIGHT, WAVEFORM_COLORS } from "@/lib/audio/constants";
import type { Selection } from "@/lib/audio/types";

/** Resolve CSS variable references (e.g. "var(--color-brand)") to actual
 *  color values that the Canvas 2D API can use. Raw color values pass through. */
function resolveColor(el: HTMLElement, color: string): string {
  const match = color.match(/^var\((.+)\)$/);
  if (!match) return color;
  return getComputedStyle(el).getPropertyValue(match[1]).trim() || color;
}

interface WaveformProps {
  buffer: AudioBuffer;
  zoom: number;
  scrollOffset: number;
  playheadPosition: number;
  selection: Selection | null;
  onSelectionChange: (sel: Selection | null) => void;
  onPlayheadChange: (pos: number) => void;
  onScrollOffsetChange: (offset: number) => void;
  onZoomChange: (zoom: number) => void;
}

/** Downsample audio channel data into min/max peaks per pixel column */
function getPeaks(
  channelData: Float32Array,
  width: number,
  startSample: number,
  samplesPerPixel: number
): { min: number; max: number }[] {
  const peaks: { min: number; max: number }[] = [];
  for (let i = 0; i < width; i++) {
    const start = Math.floor(startSample + i * samplesPerPixel);
    const end = Math.min(
      Math.floor(start + samplesPerPixel),
      channelData.length
    );
    let min = 1;
    let max = -1;
    for (let j = start; j < end; j++) {
      const val = channelData[j];
      if (val < min) min = val;
      if (val > max) max = val;
    }
    peaks.push({ min, max });
  }
  return peaks;
}

const MINIMAP_HEIGHT = 40;
const RULER_HEIGHT = 24;

export function Waveform({
  buffer,
  zoom,
  scrollOffset,
  playheadPosition,
  selection,
  onSelectionChange,
  onPlayheadChange,
  onScrollOffsetChange,
  onZoomChange,
}: WaveformProps) {
  const rulerRef = useRef<HTMLCanvasElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const minimapRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(800);
  const [isDragging, setIsDragging] = useState(false);
  const [isMinimapDragging, setIsMinimapDragging] = useState(false);
  const dragStartRef = useRef<number>(0);

  // Measure container
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w && w > 0) setContainerWidth(Math.floor(w));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Convert pixel X to time in seconds
  const pxToTime = useCallback(
    (px: number): number => {
      return scrollOffset + px / zoom;
    },
    [scrollOffset, zoom]
  );

  // Convert time to pixel X
  const timeToPx = useCallback(
    (time: number): number => {
      return (time - scrollOffset) * zoom;
    },
    [scrollOffset, zoom]
  );

  // Draw waveform
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = containerWidth * dpr;
    canvas.height = WAVEFORM_HEIGHT * dpr;
    ctx.scale(dpr, dpr);

    const width = containerWidth;
    const height = WAVEFORM_HEIGHT;

    // Resolve CSS variables once per frame
    const rc = (c: string) => resolveColor(canvas, c);

    // Background
    ctx.fillStyle = rc(WAVEFORM_COLORS.background);
    ctx.fillRect(0, 0, width, height);

    // Grid lines (no labels — ruler handles those)
    const startTime = scrollOffset;
    const endTime = scrollOffset + width / zoom;
    const gridStep = zoom > 200 ? 0.5 : zoom > 50 ? 1 : zoom > 20 ? 5 : 10;

    ctx.strokeStyle = rc(WAVEFORM_COLORS.gridLine);
    ctx.lineWidth = 0.5;

    const firstGrid = Math.ceil(startTime / gridStep) * gridStep;
    for (let t = firstGrid; t <= endTime; t += gridStep) {
      const x = timeToPx(t);
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Selection highlight
    if (selection) {
      const selX1 = timeToPx(selection.start);
      const selX2 = timeToPx(selection.end);
      ctx.fillStyle = rc(WAVEFORM_COLORS.selection);
      ctx.fillRect(selX1, 0, selX2 - selX1, height);

      ctx.strokeStyle = rc(WAVEFORM_COLORS.selectionBorder);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(selX1, 0);
      ctx.lineTo(selX1, height);
      ctx.moveTo(selX2, 0);
      ctx.lineTo(selX2, height);
      ctx.stroke();
    }

    // Draw waveform for each channel
    const channelCount = buffer.numberOfChannels;
    const channelHeight = height / channelCount;
    const samplesPerPixel = buffer.sampleRate / zoom;
    const startSample = Math.floor(scrollOffset * buffer.sampleRate);

    for (let ch = 0; ch < channelCount; ch++) {
      const channelData = buffer.getChannelData(ch);
      const peaks = getPeaks(channelData, width, startSample, samplesPerPixel);
      const centerY = channelHeight * ch + channelHeight / 2;

      ctx.fillStyle = rc(WAVEFORM_COLORS.waveform);

      for (let i = 0; i < peaks.length; i++) {
        const { min, max } = peaks[i];
        const y1 = centerY - max * (channelHeight / 2) * 0.9;
        const y2 = centerY - min * (channelHeight / 2) * 0.9;
        ctx.fillRect(i, y1, 1, Math.max(1, y2 - y1));
      }

      // Center line
      if (channelCount > 1) {
        ctx.strokeStyle = rc(WAVEFORM_COLORS.gridLine);
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(0, channelHeight * (ch + 1));
        ctx.lineTo(width, channelHeight * (ch + 1));
        ctx.stroke();
      }
    }

    // Playhead
    const phX = timeToPx(playheadPosition);
    if (phX >= 0 && phX <= width) {
      ctx.strokeStyle = rc(WAVEFORM_COLORS.playhead);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(phX, 0);
      ctx.lineTo(phX, height);
      ctx.stroke();
    }
  }, [
    buffer,
    containerWidth,
    zoom,
    scrollOffset,
    playheadPosition,
    selection,
    timeToPx,
  ]);

  // --- Time ruler rendering ---
  useEffect(() => {
    const canvas = rulerRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = containerWidth * dpr;
    canvas.height = RULER_HEIGHT * dpr;
    ctx.scale(dpr, dpr);

    const width = containerWidth;
    const height = RULER_HEIGHT;
    const rc = (c: string) => resolveColor(canvas, c);

    // Background
    ctx.fillStyle = rc(WAVEFORM_COLORS.background);
    ctx.fillRect(0, 0, width, height);

    // Bottom border line
    ctx.strokeStyle = rc(WAVEFORM_COLORS.gridLine);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, height - 0.5);
    ctx.lineTo(width, height - 0.5);
    ctx.stroke();

    const startTime = scrollOffset;
    const endTime = scrollOffset + width / zoom;

    // Determine major and minor grid steps based on zoom
    let majorStep: number;
    let minorStep: number;
    if (zoom > 400) {
      majorStep = 0.5;
      minorStep = 0.1;
    } else if (zoom > 200) {
      majorStep = 1;
      minorStep = 0.5;
    } else if (zoom > 100) {
      majorStep = 2;
      minorStep = 1;
    } else if (zoom > 50) {
      majorStep = 5;
      minorStep = 1;
    } else if (zoom > 20) {
      majorStep = 10;
      minorStep = 5;
    } else {
      majorStep = 30;
      minorStep = 10;
    }

    // Draw minor ticks
    ctx.strokeStyle = rc(WAVEFORM_COLORS.gridLine);
    ctx.lineWidth = 0.5;
    const firstMinor = Math.ceil(startTime / minorStep) * minorStep;
    for (let t = firstMinor; t <= endTime; t += minorStep) {
      const x = timeToPx(t);
      ctx.beginPath();
      ctx.moveTo(x, height - 5);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Draw major ticks + labels
    const timeLabelColor = rc(WAVEFORM_COLORS.timeLabel);
    ctx.strokeStyle = timeLabelColor;
    ctx.lineWidth = 1;
    ctx.fillStyle = timeLabelColor;
    const monoFont = getComputedStyle(canvas).getPropertyValue("--font-geist-mono").trim() || "monospace";
    ctx.font = `10px ${monoFont}`;
    ctx.textBaseline = "top";

    const firstMajor = Math.ceil(startTime / majorStep) * majorStep;
    for (let t = firstMajor; t <= endTime; t += majorStep) {
      const x = timeToPx(t);

      // Major tick
      ctx.beginPath();
      ctx.moveTo(x, height - 10);
      ctx.lineTo(x, height);
      ctx.stroke();

      // Label
      const min = Math.floor(t / 60);
      const sec = Math.floor(t % 60);
      const label =
        majorStep < 1
          ? `${min}:${sec.toString().padStart(2, "0")}.${Math.round((t % 1) * 10)}`
          : `${min}:${sec.toString().padStart(2, "0")}`;
      ctx.fillText(label, x + 3, 2);
    }

    // Playhead marker on ruler
    const phX = timeToPx(playheadPosition);
    if (phX >= 0 && phX <= width) {
      ctx.fillStyle = rc(WAVEFORM_COLORS.playhead);
      ctx.beginPath();
      ctx.moveTo(phX - 4, height);
      ctx.lineTo(phX + 4, height);
      ctx.lineTo(phX, height - 6);
      ctx.closePath();
      ctx.fill();
    }
  }, [containerWidth, zoom, scrollOffset, playheadPosition, timeToPx]);

  // Mouse handlers for selection
  const handleMouseDown = useCallback(
    (e: MouseEvent<HTMLCanvasElement>) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = e.clientX - rect.left;
      const time = pxToTime(x);
      dragStartRef.current = time;
      setIsDragging(true);
      onPlayheadChange(Math.max(0, Math.min(time, buffer.duration)));
      onSelectionChange(null);
    },
    [pxToTime, buffer.duration, onPlayheadChange, onSelectionChange]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent<HTMLCanvasElement>) => {
      if (!isDragging) return;
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = e.clientX - rect.left;
      const time = Math.max(0, Math.min(pxToTime(x), buffer.duration));
      const start = Math.min(dragStartRef.current, time);
      const end = Math.max(dragStartRef.current, time);
      if (end - start > 0.01) {
        onSelectionChange({ start, end });
      }
    },
    [isDragging, pxToTime, buffer.duration, onSelectionChange]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Scroll wheel for horizontal scroll + zoom
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) {
        // Zoom
        const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
        const newZoom = Math.max(10, Math.min(1000, zoom * factor));
        onZoomChange(newZoom);
      } else {
        // Horizontal scroll
        const delta = e.deltaY / zoom;
        const maxOffset = Math.max(0, buffer.duration - containerWidth / zoom);
        onScrollOffsetChange(
          Math.max(0, Math.min(scrollOffset + delta, maxOffset))
        );
      }
    },
    [zoom, buffer.duration, containerWidth, scrollOffset, onZoomChange, onScrollOffsetChange]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const ruler = rulerRef.current;
    if (!canvas) return;
    canvas.addEventListener("wheel", handleWheel, { passive: false });
    ruler?.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      canvas.removeEventListener("wheel", handleWheel);
      ruler?.removeEventListener("wheel", handleWheel);
    };
  }, [handleWheel]);

  // --- Minimap rendering ---
  useEffect(() => {
    const canvas = minimapRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = containerWidth * dpr;
    canvas.height = MINIMAP_HEIGHT * dpr;
    ctx.scale(dpr, dpr);

    const width = containerWidth;
    const height = MINIMAP_HEIGHT;
    const rc = (c: string) => resolveColor(canvas, c);

    // Background
    ctx.fillStyle = rc(WAVEFORM_COLORS.background);
    ctx.fillRect(0, 0, width, height);

    // Draw full waveform (all channels mixed)
    const samplesPerPixel = buffer.length / width;
    const channelCount = buffer.numberOfChannels;
    const waveformMuted = rc(WAVEFORM_COLORS.waveformMuted);

    for (let i = 0; i < width; i++) {
      let min = 1;
      let max = -1;
      const startSample = Math.floor(i * samplesPerPixel);
      const endSample = Math.min(
        Math.floor(startSample + samplesPerPixel),
        buffer.length
      );
      for (let ch = 0; ch < channelCount; ch++) {
        const data = buffer.getChannelData(ch);
        for (let j = startSample; j < endSample; j++) {
          if (data[j] < min) min = data[j];
          if (data[j] > max) max = data[j];
        }
      }
      const y1 = height / 2 - max * (height / 2) * 0.85;
      const y2 = height / 2 - min * (height / 2) * 0.85;
      ctx.fillStyle = waveformMuted;
      ctx.fillRect(i, y1, 1, Math.max(1, y2 - y1));
    }

    // Selection overlay on minimap
    if (selection) {
      const selX1 = (selection.start / buffer.duration) * width;
      const selX2 = (selection.end / buffer.duration) * width;
      ctx.fillStyle = rc(WAVEFORM_COLORS.selection);
      ctx.fillRect(selX1, 0, selX2 - selX1, height);
    }

    // Viewport indicator
    const vpStart = (scrollOffset / buffer.duration) * width;
    const vpWidth = (containerWidth / zoom / buffer.duration) * width;

    // Dim areas outside viewport
    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    ctx.fillRect(0, 0, vpStart, height);
    ctx.fillRect(vpStart + vpWidth, 0, width - vpStart - vpWidth, height);

    // Viewport border
    ctx.strokeStyle = rc(WAVEFORM_COLORS.selectionBorder);
    ctx.lineWidth = 1.5;
    ctx.strokeRect(vpStart, 0.5, vpWidth, height - 1);

    // Playhead on minimap
    const phX = (playheadPosition / buffer.duration) * width;
    ctx.strokeStyle = rc(WAVEFORM_COLORS.playhead);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(phX, 0);
    ctx.lineTo(phX, height);
    ctx.stroke();
  }, [buffer, containerWidth, zoom, scrollOffset, playheadPosition, selection]);

  // Minimap click/drag to navigate
  const minimapToOffset = useCallback(
    (clientX: number): number => {
      const rect = minimapRef.current?.getBoundingClientRect();
      if (!rect) return 0;
      const x = clientX - rect.left;
      const time = (x / containerWidth) * buffer.duration;
      const viewDuration = containerWidth / zoom;
      const offset = time - viewDuration / 2;
      const maxOffset = Math.max(0, buffer.duration - viewDuration);
      return Math.max(0, Math.min(offset, maxOffset));
    },
    [containerWidth, buffer.duration, zoom]
  );

  const handleMinimapDown = useCallback(
    (e: MouseEvent<HTMLCanvasElement>) => {
      setIsMinimapDragging(true);
      onScrollOffsetChange(minimapToOffset(e.clientX));
    },
    [minimapToOffset, onScrollOffsetChange]
  );

  const handleMinimapMove = useCallback(
    (e: MouseEvent<HTMLCanvasElement>) => {
      if (!isMinimapDragging) return;
      onScrollOffsetChange(minimapToOffset(e.clientX));
    },
    [isMinimapDragging, minimapToOffset, onScrollOffsetChange]
  );

  const handleMinimapUp = useCallback(() => {
    setIsMinimapDragging(false);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full space-y-0">
      <canvas
        ref={rulerRef}
        className="w-full cursor-default rounded-t border border-b-0 border-border"
        style={{ height: RULER_HEIGHT }}
      />
      <canvas
        ref={canvasRef}
        className="w-full cursor-crosshair border border-border"
        style={{ height: WAVEFORM_HEIGHT }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
      <canvas
        ref={minimapRef}
        className="w-full cursor-pointer rounded-b border border-t-0 border-border"
        style={{ height: MINIMAP_HEIGHT }}
        onMouseDown={handleMinimapDown}
        onMouseMove={handleMinimapMove}
        onMouseUp={handleMinimapUp}
        onMouseLeave={handleMinimapUp}
      />
    </div>
  );
}
