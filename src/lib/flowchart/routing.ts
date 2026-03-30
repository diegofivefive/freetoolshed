import type { FlowchartEdge, FlowchartNode, AnchorPosition, RouteType } from "./types";
import { getAnchorWorldPosition } from "./shapes";

// ── Route computation ─────────────────────────────────────────

export interface RouteResult {
  /** SVG path `d` attribute */
  path: string;
  /** Label position (midpoint of the edge) */
  labelX: number;
  labelY: number;
}

/**
 * Compute the SVG path for an edge, given source/target nodes.
 */
export function computeEdgePath(
  edge: FlowchartEdge,
  sourceNode: FlowchartNode,
  targetNode: FlowchartNode
): RouteResult {
  const src = getAnchorWorldPosition(sourceNode, edge.sourceAnchor);
  const tgt = getAnchorWorldPosition(targetNode, edge.targetAnchor);

  // If there are user-defined control points, use them
  if (edge.controlPoints.length > 0) {
    return computeCustomPath(src, tgt, edge.controlPoints);
  }

  switch (edge.routeType) {
    case "straight":
      return computeStraightPath(src, tgt);
    case "bezier":
      return computeBezierPath(src, tgt, edge.sourceAnchor, edge.targetAnchor);
    case "orthogonal":
      return computeOrthogonalPath(src, tgt, edge.sourceAnchor, edge.targetAnchor);
    default:
      return computeBezierPath(src, tgt, edge.sourceAnchor, edge.targetAnchor);
  }
}

/**
 * Compute a draft edge path (while user is dragging to connect).
 */
export function computeDraftEdgePath(
  sourceNode: FlowchartNode,
  sourceAnchor: AnchorPosition,
  mouseX: number,
  mouseY: number,
  routeType: RouteType
): string {
  const src = getAnchorWorldPosition(sourceNode, sourceAnchor);
  const tgt = { x: mouseX, y: mouseY };

  switch (routeType) {
    case "straight":
      return `M ${src.x} ${src.y} L ${tgt.x} ${tgt.y}`;
    case "bezier": {
      const cp = getAutoBezierControls(src, tgt, sourceAnchor, "top");
      return `M ${src.x} ${src.y} C ${cp.cp1x} ${cp.cp1y}, ${cp.cp2x} ${cp.cp2y}, ${tgt.x} ${tgt.y}`;
    }
    case "orthogonal": {
      const result = computeOrthogonalPath(src, tgt, sourceAnchor, "top");
      return result.path;
    }
    default:
      return `M ${src.x} ${src.y} L ${tgt.x} ${tgt.y}`;
  }
}

// ── Straight line ────────────────────────────────────────────

function computeStraightPath(
  src: { x: number; y: number },
  tgt: { x: number; y: number }
): RouteResult {
  return {
    path: `M ${src.x} ${src.y} L ${tgt.x} ${tgt.y}`,
    labelX: (src.x + tgt.x) / 2,
    labelY: (src.y + tgt.y) / 2,
  };
}

// ── Smooth bezier curve (Coggle-style) ───────────────────────

/**
 * Compute the two auto-generated bezier control points for a source/target pair.
 * Exported so that svg-canvas can initialize draggable control points.
 */
export function getAutoBezierControls(
  src: { x: number; y: number },
  tgt: { x: number; y: number },
  srcAnchor: AnchorPosition,
  tgtAnchor: AnchorPosition
) {
  const dist = Math.hypot(tgt.x - src.x, tgt.y - src.y);
  // Control point offset — proportional to distance, with a min/max
  const offset = Math.max(40, Math.min(dist * 0.4, 200));

  const srcDir = anchorDirection(srcAnchor);
  const tgtDir = anchorDirection(tgtAnchor);

  return {
    cp1x: src.x + srcDir.dx * offset,
    cp1y: src.y + srcDir.dy * offset,
    cp2x: tgt.x + tgtDir.dx * offset,
    cp2y: tgt.y + tgtDir.dy * offset,
  };
}

function computeBezierPath(
  src: { x: number; y: number },
  tgt: { x: number; y: number },
  srcAnchor: AnchorPosition,
  tgtAnchor: AnchorPosition
): RouteResult {
  const cp = getAutoBezierControls(src, tgt, srcAnchor, tgtAnchor);

  // Label position: evaluate cubic bezier at t=0.5
  const t = 0.5;
  const t1 = 1 - t;
  const labelX =
    t1 * t1 * t1 * src.x +
    3 * t1 * t1 * t * cp.cp1x +
    3 * t1 * t * t * cp.cp2x +
    t * t * t * tgt.x;
  const labelY =
    t1 * t1 * t1 * src.y +
    3 * t1 * t1 * t * cp.cp1y +
    3 * t1 * t * t * cp.cp2y +
    t * t * t * tgt.y;

  return {
    path: `M ${src.x} ${src.y} C ${cp.cp1x} ${cp.cp1y}, ${cp.cp2x} ${cp.cp2y}, ${tgt.x} ${tgt.y}`,
    labelX,
    labelY,
  };
}

// ── Custom path (user-defined control points) ────────────────

function computeCustomPath(
  src: { x: number; y: number },
  tgt: { x: number; y: number },
  controlPoints: { x: number; y: number }[]
): RouteResult {
  if (controlPoints.length === 1) {
    // Quadratic bezier through one control point
    const cp = controlPoints[0];
    const labelX = 0.25 * src.x + 0.5 * cp.x + 0.25 * tgt.x;
    const labelY = 0.25 * src.y + 0.5 * cp.y + 0.25 * tgt.y;
    return {
      path: `M ${src.x} ${src.y} Q ${cp.x} ${cp.y}, ${tgt.x} ${tgt.y}`,
      labelX,
      labelY,
    };
  }

  if (controlPoints.length === 2) {
    // Cubic bezier
    const cp1 = controlPoints[0];
    const cp2 = controlPoints[1];
    const t = 0.5;
    const t1 = 1 - t;
    const labelX =
      t1 * t1 * t1 * src.x +
      3 * t1 * t1 * t * cp1.x +
      3 * t1 * t * t * cp2.x +
      t * t * t * tgt.x;
    const labelY =
      t1 * t1 * t1 * src.y +
      3 * t1 * t1 * t * cp1.y +
      3 * t1 * t * t * cp2.y +
      t * t * t * tgt.y;
    return {
      path: `M ${src.x} ${src.y} C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${tgt.x} ${tgt.y}`,
      labelX,
      labelY,
    };
  }

  // Multiple control points — use poly-bezier (smooth curve through points)
  const allPts = [src, ...controlPoints, tgt];
  const parts: string[] = [`M ${allPts[0].x} ${allPts[0].y}`];
  for (let i = 1; i < allPts.length; i++) {
    parts.push(`L ${allPts[i].x} ${allPts[i].y}`);
  }
  const mid = allPts[Math.floor(allPts.length / 2)];
  return {
    path: parts.join(" "),
    labelX: mid.x,
    labelY: mid.y,
  };
}

// ── Orthogonal (right-angle) path ────────────────────────────

function computeOrthogonalPath(
  src: { x: number; y: number },
  tgt: { x: number; y: number },
  srcAnchor: AnchorPosition,
  tgtAnchor: AnchorPosition
): RouteResult {
  const offset = 30;
  const srcDir = anchorDirection(srcAnchor);
  const tgtDir = anchorDirection(tgtAnchor);

  // Extend from source
  const s1 = {
    x: src.x + srcDir.dx * offset,
    y: src.y + srcDir.dy * offset,
  };
  // Extend from target
  const t1 = {
    x: tgt.x + tgtDir.dx * offset,
    y: tgt.y + tgtDir.dy * offset,
  };

  // Route through intermediate points for a clean orthogonal path
  const midX = (s1.x + t1.x) / 2;
  const midY = (s1.y + t1.y) / 2;

  let points: { x: number; y: number }[];

  const srcHorizontal = srcAnchor === "left" || srcAnchor === "right";
  const tgtHorizontal = tgtAnchor === "left" || tgtAnchor === "right";

  if (srcHorizontal && tgtHorizontal) {
    // Both horizontal exits — route via midX
    points = [
      src,
      s1,
      { x: midX, y: s1.y },
      { x: midX, y: t1.y },
      t1,
      tgt,
    ];
  } else if (!srcHorizontal && !tgtHorizontal) {
    // Both vertical exits — route via midY
    points = [
      src,
      s1,
      { x: s1.x, y: midY },
      { x: t1.x, y: midY },
      t1,
      tgt,
    ];
  } else if (srcHorizontal && !tgtHorizontal) {
    // Horizontal → vertical
    points = [
      src,
      s1,
      { x: t1.x, y: s1.y },
      t1,
      tgt,
    ];
  } else {
    // Vertical → horizontal
    points = [
      src,
      s1,
      { x: s1.x, y: t1.y },
      t1,
      tgt,
    ];
  }

  // Build path with rounded corners
  const path = buildRoundedPolyline(points, 8);
  const mid2 = points[Math.floor(points.length / 2)];

  return {
    path,
    labelX: mid2.x,
    labelY: mid2.y,
  };
}

// ── Rounded polyline helper ─────────────────────────────────

function buildRoundedPolyline(
  points: { x: number; y: number }[],
  radius: number
): string {
  if (points.length < 2) return "";
  if (points.length === 2) {
    return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
  }

  const parts: string[] = [`M ${points[0].x} ${points[0].y}`];

  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const next = points[i + 1];

    // Distance to adjacent points
    const d1 = Math.hypot(curr.x - prev.x, curr.y - prev.y);
    const d2 = Math.hypot(next.x - curr.x, next.y - curr.y);
    const r = Math.min(radius, d1 / 2, d2 / 2);

    if (r < 1) {
      // Too close, just go straight
      parts.push(`L ${curr.x} ${curr.y}`);
      continue;
    }

    // Points before and after the corner
    const dx1 = (curr.x - prev.x) / d1;
    const dy1 = (curr.y - prev.y) / d1;
    const dx2 = (next.x - curr.x) / d2;
    const dy2 = (next.y - curr.y) / d2;

    const before = { x: curr.x - dx1 * r, y: curr.y - dy1 * r };
    const after = { x: curr.x + dx2 * r, y: curr.y + dy2 * r };

    parts.push(`L ${before.x} ${before.y}`);
    parts.push(`Q ${curr.x} ${curr.y} ${after.x} ${after.y}`);
  }

  const last = points[points.length - 1];
  parts.push(`L ${last.x} ${last.y}`);

  return parts.join(" ");
}

// ── Direction vectors for anchor positions ──────────────────

function anchorDirection(anchor: AnchorPosition): { dx: number; dy: number } {
  switch (anchor) {
    case "top":    return { dx: 0, dy: -1 };
    case "right":  return { dx: 1, dy: 0 };
    case "bottom": return { dx: 0, dy: 1 };
    case "left":   return { dx: -1, dy: 0 };
  }
}

// ── Closest anchor to a point ───────────────────────────────

const ANCHORS: AnchorPosition[] = ["top", "right", "bottom", "left"];

export function findClosestAnchor(
  node: FlowchartNode,
  worldX: number,
  worldY: number
): { anchor: AnchorPosition; distance: number } {
  let bestAnchor: AnchorPosition = "top";
  let bestDist = Infinity;

  for (const anchor of ANCHORS) {
    const pos = getAnchorWorldPosition(node, anchor);
    const dist = Math.hypot(pos.x - worldX, pos.y - worldY);
    if (dist < bestDist) {
      bestDist = dist;
      bestAnchor = anchor;
    }
  }

  return { anchor: bestAnchor, distance: bestDist };
}
