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

// ── Smart alignment guides ──────────────────────────────────

export interface AlignGuide {
  axis: "x" | "y";
  position: number; // in plan units
}

export interface AlignResult {
  x: number;
  y: number;
  guides: AlignGuide[];
}

interface ElementEdges {
  left: number;
  right: number;
  top: number;
  bottom: number;
  centerX: number;
  centerY: number;
}

function getEdges(el: { x: number; y: number; width?: number; height?: number }): ElementEdges {
  const w = el.width ?? 0;
  const h = el.height ?? 0;
  return {
    left: el.x,
    right: el.x + w,
    top: el.y,
    bottom: el.y + h,
    centerX: el.x + w / 2,
    centerY: el.y + h / 2,
  };
}

/**
 * Check a dragged element's position against all other elements
 * and snap to alignment if within threshold. Returns snapped
 * position and active guide lines.
 */
export function computeAlignGuides(
  draggedX: number,
  draggedY: number,
  draggedW: number,
  draggedH: number,
  otherElements: { x: number; y: number; width?: number; height?: number }[],
  threshold = 0.5
): AlignResult {
  const dragged: ElementEdges = {
    left: draggedX,
    right: draggedX + draggedW,
    top: draggedY,
    bottom: draggedY + draggedH,
    centerX: draggedX + draggedW / 2,
    centerY: draggedY + draggedH / 2,
  };

  const guides: AlignGuide[] = [];
  let snappedX = draggedX;
  let snappedY = draggedY;
  let bestDx = threshold;
  let bestDy = threshold;

  for (const other of otherElements) {
    const edges = getEdges(other);

    // X-axis alignment (vertical guide lines)
    const xPairs: [number, number][] = [
      [dragged.left, edges.left],
      [dragged.left, edges.right],
      [dragged.right, edges.left],
      [dragged.right, edges.right],
      [dragged.centerX, edges.centerX],
      [dragged.left, edges.centerX],
      [dragged.right, edges.centerX],
      [dragged.centerX, edges.left],
      [dragged.centerX, edges.right],
    ];

    for (const [dEdge, oEdge] of xPairs) {
      const dist = Math.abs(dEdge - oEdge);
      if (dist < bestDx) {
        bestDx = dist;
        snappedX = draggedX + (oEdge - dEdge);
        // Reset x guides when we find a closer match
        const filtered = guides.filter((g) => g.axis !== "x");
        guides.length = 0;
        guides.push(...filtered);
        guides.push({ axis: "x", position: oEdge });
      } else if (dist === bestDx && dist < threshold) {
        guides.push({ axis: "x", position: oEdge });
      }
    }

    // Y-axis alignment (horizontal guide lines)
    const yPairs: [number, number][] = [
      [dragged.top, edges.top],
      [dragged.top, edges.bottom],
      [dragged.bottom, edges.top],
      [dragged.bottom, edges.bottom],
      [dragged.centerY, edges.centerY],
      [dragged.top, edges.centerY],
      [dragged.bottom, edges.centerY],
      [dragged.centerY, edges.top],
      [dragged.centerY, edges.bottom],
    ];

    for (const [dEdge, oEdge] of yPairs) {
      const dist = Math.abs(dEdge - oEdge);
      if (dist < bestDy) {
        bestDy = dist;
        snappedY = draggedY + (oEdge - dEdge);
        const filtered = guides.filter((g) => g.axis !== "y");
        guides.length = 0;
        guides.push(...filtered);
        guides.push({ axis: "y", position: oEdge });
      } else if (dist === bestDy && dist < threshold) {
        guides.push({ axis: "y", position: oEdge });
      }
    }
  }

  return { x: snappedX, y: snappedY, guides };
}
