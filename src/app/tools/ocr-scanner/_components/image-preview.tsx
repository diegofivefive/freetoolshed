"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  ZoomIn,
  ZoomOut,
  Maximize,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
} from "lucide-react";
import type { OcrPage } from "@/lib/ocr/types";

interface ImagePreviewProps {
  page: OcrPage | null;
  open: boolean;
  onClose: () => void;
  onNavigate: (direction: "prev" | "next") => void;
  hasPrev: boolean;
  hasNext: boolean;
}

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.25;

export function ImagePreview({
  page,
  open,
  onClose,
  onNavigate,
  hasPrev,
  hasNext,
}: ImagePreviewProps) {
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [showText, setShowText] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const panStartOffsetRef = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset zoom/pan when page changes
  useEffect(() => {
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
  }, [page?.id]);

  const handleZoomIn = useCallback(() => {
    setZoom((z) => Math.min(MAX_ZOOM, z + ZOOM_STEP));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((z) => Math.max(MIN_ZOOM, z - ZOOM_STEP));
  }, []);

  const handleFitWidth = useCallback(() => {
    if (!containerRef.current || !page) return;
    const containerWidth = containerRef.current.clientWidth - 32; // padding
    const fitZoom = containerWidth / page.width;
    setZoom(Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, fitZoom)));
    setPanOffset({ x: 0, y: 0 });
  }, [page]);

  const handleReset = useCallback(() => {
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
    setZoom((z) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z + delta)));
  }, []);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (zoom <= 1) return;
      e.preventDefault();
      setIsPanning(true);
      panStartRef.current = { x: e.clientX, y: e.clientY };
      panStartOffsetRef.current = { ...panOffset };
    },
    [zoom, panOffset],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isPanning) return;
      const dx = e.clientX - panStartRef.current.x;
      const dy = e.clientY - panStartRef.current.y;
      setPanOffset({
        x: panStartOffsetRef.current.x + dx,
        y: panStartOffsetRef.current.y + dy,
      });
    },
    [isPanning],
  );

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  // Keyboard shortcuts — ignore when typing in an input/textarea/contentEditable
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target) {
        const tag = target.tagName;
        if (
          tag === "INPUT" ||
          tag === "TEXTAREA" ||
          tag === "SELECT" ||
          target.isContentEditable
        ) {
          return;
        }
      }
      if (e.key === "ArrowLeft" && hasPrev) {
        e.preventDefault();
        onNavigate("prev");
      } else if (e.key === "ArrowRight" && hasNext) {
        e.preventDefault();
        onNavigate("next");
      } else if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        handleZoomIn();
      } else if (e.key === "-") {
        e.preventDefault();
        handleZoomOut();
      } else if (e.key === "0") {
        e.preventDefault();
        handleReset();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, hasPrev, hasNext, onNavigate, handleZoomIn, handleZoomOut, handleReset]);

  if (!page) return null;

  const zoomPercent = Math.round(zoom * 100);

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent
        side="right"
        className="flex w-full flex-col sm:max-w-2xl lg:max-w-3xl"
        showCloseButton
      >
        {/* Header */}
        <SheetHeader className="shrink-0 border-b border-border pb-3">
          <div className="flex items-center gap-3 pr-8">
            <div className="min-w-0 flex-1">
              <SheetTitle className="truncate text-sm">
                Page {page.pageNumber + 1}
              </SheetTitle>
              <SheetDescription className="text-xs">
                {page.width} x {page.height}px
                {page.status === "done" && (
                  <> &middot; {Math.round(page.confidence)}% confidence</>
                )}
              </SheetDescription>
            </div>
            {/* Navigation */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onNavigate("prev")}
                disabled={!hasPrev}
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onNavigate("next")}
                disabled={!hasNext}
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </SheetHeader>

        {/* Zoom toolbar */}
        <div className="flex shrink-0 items-center justify-center gap-1 border-b border-border px-4 py-1.5">
          <Button variant="ghost" size="icon-sm" onClick={handleZoomOut} disabled={zoom <= MIN_ZOOM}>
            <ZoomOut className="size-4" />
          </Button>
          <span className="w-12 text-center text-xs tabular-nums text-muted-foreground">
            {zoomPercent}%
          </span>
          <Button variant="ghost" size="icon-sm" onClick={handleZoomIn} disabled={zoom >= MAX_ZOOM}>
            <ZoomIn className="size-4" />
          </Button>
          <div className="mx-1 h-4 w-px bg-border" />
          <Button variant="ghost" size="icon-sm" onClick={handleFitWidth} title="Fit width">
            <Maximize className="size-4" />
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={handleReset} title="Reset zoom">
            <RotateCcw className="size-4" />
          </Button>
        </div>

        {/* Image container */}
        <div
          ref={containerRef}
          className={`relative flex-1 overflow-hidden bg-muted/30 ${
            zoom > 1 ? (isPanning ? "cursor-grabbing" : "cursor-grab") : ""
          }`}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div
            className="flex size-full items-center justify-center"
            style={{
              transform: `scale(${zoom}) translate(${panOffset.x / zoom}px, ${panOffset.y / zoom}px)`,
              transformOrigin: "center center",
            }}
          >
            <img
              src={page.imageUrl}
              alt={`Page ${page.pageNumber + 1}`}
              className="max-h-full max-w-full object-contain"
              draggable={false}
            />
          </div>
        </div>

        {/* Collapsible text panel */}
        {page.status === "done" && page.text && (
          <div className="shrink-0 border-t border-border">
            <button
              onClick={() => setShowText((v) => !v)}
              className="flex w-full items-center justify-between px-4 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <span>Extracted Text</span>
              <ChevronsUpDown className="size-3.5" />
            </button>
            {showText && (
              <div className="max-h-40 overflow-y-auto border-t border-border px-4 py-2 text-xs leading-relaxed text-muted-foreground">
                {page.text}
              </div>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
