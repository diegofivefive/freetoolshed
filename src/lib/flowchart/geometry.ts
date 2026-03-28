import type { Viewport, FlowchartNode } from "./types";

/**
 * Convert screen (mouse) coordinates to world (pixel) coordinates.
 * Unlike floor plan, flowchart uses raw pixels (no PIXELS_PER_UNIT).
 */
export function screenToWorld(
  screenX: number,
  screenY: number,
  viewport: Viewport,
  svgRect: DOMRect
): { x: number; y: number } {
  const relX = screenX - svgRect.left;
  const relY = screenY - svgRect.top;
  return {
    x: (relX - viewport.panX) / viewport.zoom,
    y: (relY - viewport.panY) / viewport.zoom,
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

  const worldPxX = (relX - viewport.panX) / viewport.zoom;
  const worldPxY = (relY - viewport.panY) / viewport.zoom;

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

/**
 * Get the bounding box of a node in world coordinates.
 */
export function getNodeBounds(node: FlowchartNode): {
  left: number;
  top: number;
  right: number;
  bottom: number;
  centerX: number;
  centerY: number;
} {
  return {
    left: node.x,
    top: node.y,
    right: node.x + node.width,
    bottom: node.y + node.height,
    centerX: node.x + node.width / 2,
    centerY: node.y + node.height / 2,
  };
}

/**
 * Test whether a world-space point is inside a node's bounding rect.
 */
export function isPointInNode(
  px: number,
  py: number,
  node: FlowchartNode
): boolean {
  return (
    px >= node.x &&
    px <= node.x + node.width &&
    py >= node.y &&
    py <= node.y + node.height
  );
}

/**
 * Return all nodes whose bounding rect overlaps a selection rectangle.
 */
export function getNodesInRect(
  nodes: FlowchartNode[],
  rx: number,
  ry: number,
  rw: number,
  rh: number
): string[] {
  const rectLeft = Math.min(rx, rx + rw);
  const rectRight = Math.max(rx, rx + rw);
  const rectTop = Math.min(ry, ry + rh);
  const rectBottom = Math.max(ry, ry + rh);

  return nodes
    .filter((node) => {
      const b = getNodeBounds(node);
      return (
        b.left < rectRight &&
        b.right > rectLeft &&
        b.top < rectBottom &&
        b.bottom > rectTop
      );
    })
    .map((node) => node.id);
}

// ── Smart alignment guides ──────────────────────────────────

export interface AlignGuide {
  axis: "x" | "y";
  position: number;
}

export interface AlignResult {
  x: number;
  y: number;
  guides: AlignGuide[];
}

/**
 * Check a dragged node's position against all other nodes
 * and snap to alignment if within threshold.
 */
export function computeAlignGuides(
  draggedX: number,
  draggedY: number,
  draggedW: number,
  draggedH: number,
  otherNodes: FlowchartNode[],
  threshold = 8
): AlignResult {
  const dragged = {
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

  for (const other of otherNodes) {
    const edges = getNodeBounds(other);

    // X-axis alignment (vertical guide lines)
    const xPairs: [number, number][] = [
      [dragged.left, edges.left],
      [dragged.left, edges.right],
      [dragged.right, edges.left],
      [dragged.right, edges.right],
      [dragged.centerX, edges.centerX],
    ];

    for (const [dEdge, oEdge] of xPairs) {
      const dist = Math.abs(dEdge - oEdge);
      if (dist < bestDx) {
        bestDx = dist;
        snappedX = draggedX + (oEdge - dEdge);
        const filtered = guides.filter((g) => g.axis !== "x");
        guides.length = 0;
        guides.push(...filtered);
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
      }
    }
  }

  return { x: snappedX, y: snappedY, guides };
}
