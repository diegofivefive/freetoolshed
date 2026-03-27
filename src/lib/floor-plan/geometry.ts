import type { Viewport } from "./types";
import { PIXELS_PER_UNIT } from "./constants";

/**
 * Convert screen (mouse) coordinates to world (plan unit) coordinates.
 */
export function screenToWorld(
  screenX: number,
  screenY: number,
  viewport: Viewport,
  svgRect: DOMRect
): { x: number; y: number } {
  const relX = screenX - svgRect.left;
  const relY = screenY - svgRect.top;
  const worldPx = {
    x: (relX - viewport.panX) / viewport.zoom,
    y: (relY - viewport.panY) / viewport.zoom,
  };
  return {
    x: worldPx.x / PIXELS_PER_UNIT,
    y: worldPx.y / PIXELS_PER_UNIT,
  };
}

/**
 * Convert world coordinates (plan units) to screen pixel coordinates.
 */
export function worldToScreen(
  worldX: number,
  worldY: number,
  viewport: Viewport
): { x: number; y: number } {
  return {
    x: worldX * PIXELS_PER_UNIT * viewport.zoom + viewport.panX,
    y: worldY * PIXELS_PER_UNIT * viewport.zoom + viewport.panY,
  };
}

/**
 * Snap a value to the nearest grid increment.
 */
export function snapToGrid(value: number, gridSize: number): number {
  return Math.round(value / gridSize) * gridSize;
}

/**
 * Calculate new pan after zooming so the point under the cursor stays fixed.
 */
export function zoomAtPoint(
  viewport: Viewport,
  newZoom: number,
  screenX: number,
  screenY: number,
  svgRect: DOMRect
): { zoom: number; panX: number; panY: number } {
  const relX = screenX - svgRect.left;
  const relY = screenY - svgRect.top;

  // World point under the cursor (in pixels, not plan units)
  const worldPxX = (relX - viewport.panX) / viewport.zoom;
  const worldPxY = (relY - viewport.panY) / viewport.zoom;

  // New pan so the same world point stays under the cursor
  const panX = relX - worldPxX * newZoom;
  const panY = relY - worldPxY * newZoom;

  return { zoom: newZoom, panX, panY };
}

/**
 * Clamp a value to a range.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
