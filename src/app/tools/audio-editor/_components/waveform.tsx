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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(800);
  const [isDragging, setIsDragging] = useState(false);
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

    // Background
    ctx.fillStyle = WAVEFORM_COLORS.background;
    ctx.fillRect(0, 0, width, height);

    // Grid lines (every second)
    const startTime = scrollOffset;
    const endTime = scrollOffset + width / zoom;
    const gridStep = zoom > 200 ? 0.5 : zoom > 50 ? 1 : zoom > 20 ? 5 : 10;

    ctx.strokeStyle = WAVEFORM_COLORS.gridLine;
    ctx.lineWidth = 0.5;
    ctx.fillStyle = WAVEFORM_COLORS.timeLabel;
    ctx.font = "10px var(--font-geist-mono)";

    const firstGrid = Math.ceil(startTime / gridStep) * gridStep;
    for (let t = firstGrid; t <= endTime; t += gridStep) {
      const x = timeToPx(t);
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();

      // Time label
      const min = Math.floor(t / 60);
      const sec = Math.floor(t % 60);
      const label =
        gridStep < 1
          ? `${min}:${sec.toString().padStart(2, "0")}.${Math.round((t % 1) * 10)}`
          : `${min}:${sec.toString().padStart(2, "0")}`;
      ctx.fillText(label, x + 2, 10);
    }

    // Selection highlight
    if (selection) {
      const selX1 = timeToPx(selection.start);
      const selX2 = timeToPx(selection.end);
      ctx.fillStyle = WAVEFORM_COLORS.selection;
      ctx.fillRect(selX1, 0, selX2 - selX1, height);

      ctx.strokeStyle = WAVEFORM_COLORS.selectionBorder;
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

      ctx.fillStyle = WAVEFORM_COLORS.waveform;

      for (let i = 0; i < peaks.length; i++) {
        const { min, max } = peaks[i];
        const y1 = centerY - max * (channelHeight / 2) * 0.9;
        const y2 = centerY - min * (channelHeight / 2) * 0.9;
        ctx.fillRect(i, y1, 1, Math.max(1, y2 - y1));
      }

      // Center line
      if (channelCount > 1) {
        ctx.strokeStyle = WAVEFORM_COLORS.gridLine;
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
      ctx.strokeStyle = WAVEFORM_COLORS.playhead;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(phX, 0);
      ctx.lineTo(phX, height);
      ctx.stroke();

      // Playhead triangle
      ctx.fillStyle = WAVEFORM_COLORS.playhead;
      ctx.beginPath();
      ctx.moveTo(phX - 5, 0);
      ctx.lineTo(phX + 5, 0);
      ctx.lineTo(phX, 8);
      ctx.closePath();
      ctx.fill();
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
    if (!canvas) return;
    canvas.addEventListener("wheel", handleWheel, { passive: false });
    return () => canvas.removeEventListener("wheel", handleWheel);
  }, [handleWheel]);

  return (
    <div ref={containerRef} className="relative w-full">
      <canvas
        ref={canvasRef}
        className="w-full cursor-crosshair rounded border border-border"
        style={{ height: WAVEFORM_HEIGHT }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
    </div>
  );
}
