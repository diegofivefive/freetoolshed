import type { NodeShapeType, AnchorPosition, FlowchartNode } from "./types";

// ── Anchor world positions ───────────────────────────────────

/**
 * Get the world-space position of an anchor point on a node.
 * Coordinates are the point on the node boundary where a connection
 * should attach.
 */
export function getAnchorWorldPosition(
  node: FlowchartNode,
  anchor: AnchorPosition
): { x: number; y: number } {
  const cx = node.x + node.width / 2;
  const cy = node.y + node.height / 2;
  const hw = node.width / 2;
  const hh = node.height / 2;

  switch (node.shape) {
    case "decision": {
      // Diamond — anchors are at the midpoints of the diamond edges
      switch (anchor) {
        case "top":    return { x: cx, y: node.y };
        case "right":  return { x: node.x + node.width, y: cy };
        case "bottom": return { x: cx, y: node.y + node.height };
        case "left":   return { x: node.x, y: cy };
      }
      break;
    }

    case "io": {
      // Parallelogram — offset anchors for the skew
      const skew = node.width * 0.15;
      switch (anchor) {
        case "top":    return { x: cx + skew / 2, y: node.y };
        case "right":  return { x: node.x + node.width - skew / 2, y: cy };
        case "bottom": return { x: cx - skew / 2, y: node.y + node.height };
        case "left":   return { x: node.x + skew / 2, y: cy };
      }
      break;
    }

    case "manual-input": {
      // Trapezoid — top is slanted
      const topSlant = node.height * 0.2;
      switch (anchor) {
        case "top":    return { x: cx, y: node.y + topSlant / 2 };
        case "right":  return { x: node.x + node.width, y: cy };
        case "bottom": return { x: cx, y: node.y + node.height };
        case "left":   return { x: node.x, y: cy };
      }
      break;
    }

    case "preparation": {
      // Hexagon — left/right anchors at the pointed edges
      const inset = node.width * 0.15;
      switch (anchor) {
        case "top":    return { x: cx, y: node.y };
        case "right":  return { x: node.x + node.width, y: cy };
        case "bottom": return { x: cx, y: node.y + node.height };
        case "left":   return { x: node.x, y: cy };
      }
      break;
    }

    case "connector": {
      // Circle — anchors at the cardinal points of the circle
      const r = Math.min(hw, hh);
      switch (anchor) {
        case "top":    return { x: cx, y: cy - r };
        case "right":  return { x: cx + r, y: cy };
        case "bottom": return { x: cx, y: cy + r };
        case "left":   return { x: cx - r, y: cy };
      }
      break;
    }

    // Default: rectangle-based shapes (process, terminal, document,
    //   predefined-process, database, comment)
    default: {
      switch (anchor) {
        case "top":    return { x: cx, y: node.y };
        case "right":  return { x: node.x + node.width, y: cy };
        case "bottom": return { x: cx, y: node.y + node.height };
        case "left":   return { x: node.x, y: cy };
      }
    }
  }

  // Fallback (shouldn't reach here)
  return { x: cx, y: cy };
}

// ── SVG path generators ──────────────────────────────────────

/** Default corner radius for smooth shapes */
const R = 14;

/**
 * Returns the SVG path `d` attribute for a shape type.
 * All shapes are drawn in a local coordinate space from (0,0) to (w,h).
 * Every shape uses rounded / smooth corners — no hard points.
 */
export function getShapePath(shape: NodeShapeType, w: number, h: number): string {
  switch (shape) {
    case "process":
      // Rounded rectangle
      return roundedRectPath(w, h, R);

    case "decision": {
      // Diamond with rounded vertices via quadratic curves
      const r = Math.min(R, w * 0.12, h * 0.12);
      const mx = w / 2;
      const my = h / 2;
      return [
        // Start slightly right of the top vertex
        `M ${mx + r} ${r}`,
        // Top → Right: line toward right vertex, then round corner
        `L ${w - r} ${my - r}`,
        `Q ${w} ${my} ${w - r} ${my + r}`,
        // Right → Bottom
        `L ${mx + r} ${h - r}`,
        `Q ${mx} ${h} ${mx - r} ${h - r}`,
        // Bottom → Left
        `L ${r} ${my + r}`,
        `Q 0 ${my} ${r} ${my - r}`,
        // Left → Top
        `L ${mx - r} ${r}`,
        `Q ${mx} 0 ${mx + r} ${r}`,
        `Z`,
      ].join(" ");
    }

    case "terminal":
      // Stadium (pill shape) — rx = half height
      return roundedRectPath(w, h, Math.min(h / 2, w / 2));

    case "io": {
      // Parallelogram with rounded corners
      const skew = w * 0.15;
      const r = Math.min(R, skew * 0.8, h * 0.15);
      return [
        // Top-left (skewed) — start after rounded corner
        `M ${skew + r} 0`,
        // Top edge
        `L ${w - r} 0`,
        // Top-right corner
        `Q ${w} 0 ${w - r * 0.3} ${r}`,
        // Right edge going down
        `L ${w - skew + r * 0.3} ${h - r}`,
        // Bottom-right corner
        `Q ${w - skew} ${h} ${w - skew - r} ${h}`,
        // Bottom edge
        `L ${r} ${h}`,
        // Bottom-left corner
        `Q 0 ${h} ${r * 0.3} ${h - r}`,
        // Left edge going up
        `L ${skew - r * 0.3} ${r}`,
        // Top-left corner
        `Q ${skew} 0 ${skew + r} 0`,
        `Z`,
      ].join(" ");
    }

    case "document": {
      // Rectangle with rounded top corners and wavy bottom
      const waveH = h * 0.12;
      const r = Math.min(R, w * 0.1, h * 0.12);
      return [
        // Top-left rounded corner
        `M ${r} 0`,
        `L ${w - r} 0`,
        `Q ${w} 0 ${w} ${r}`,
        // Right side down to wave
        `L ${w} ${h - waveH}`,
        // Wavy bottom
        `Q ${w * 0.75} ${h - waveH * 2}, ${w / 2} ${h - waveH}`,
        `Q ${w * 0.25} ${h}, 0 ${h - waveH}`,
        // Left side up
        `L 0 ${r}`,
        `Q 0 0 ${r} 0`,
        `Z`,
      ].join(" ");
    }

    case "predefined-process":
      // Rectangle with inner vertical lines — rounded outer rect
      return roundedRectPath(w, h, R);

    case "manual-input": {
      // Trapezoid with rounded corners
      const topSlant = h * 0.2;
      const r = Math.min(R, w * 0.08, h * 0.12);
      return [
        // Top-left (elevated) — start after corner
        `M ${r * 0.5} ${topSlant}`,
        // Slanted top edge toward top-right
        `L ${w - r} ${r * 0.2}`,
        // Top-right corner
        `Q ${w} 0 ${w} ${r}`,
        // Right edge down
        `L ${w} ${h - r}`,
        // Bottom-right corner
        `Q ${w} ${h} ${w - r} ${h}`,
        // Bottom edge
        `L ${r} ${h}`,
        // Bottom-left corner
        `Q 0 ${h} 0 ${h - r}`,
        // Left edge up to top-left
        `L 0 ${topSlant + r}`,
        // Top-left corner
        `Q 0 ${topSlant} ${r * 0.5} ${topSlant}`,
        `Z`,
      ].join(" ");
    }

    case "preparation": {
      // Hexagon with rounded vertices
      const inset = w * 0.15;
      const r = Math.min(R, inset * 0.7, h * 0.12);
      const my = h / 2;
      return [
        // Start at top-left vertex, offset right
        `M ${inset + r} 0`,
        // Top edge
        `L ${w - inset - r} 0`,
        // Top-right vertex
        `Q ${w - inset} 0 ${w - inset + r} ${r}`,
        // Right diagonal down
        `L ${w - r} ${my - r}`,
        // Right vertex
        `Q ${w} ${my} ${w - r} ${my + r}`,
        // Right diagonal continuing down
        `L ${w - inset + r} ${h - r}`,
        // Bottom-right vertex
        `Q ${w - inset} ${h} ${w - inset - r} ${h}`,
        // Bottom edge
        `L ${inset + r} ${h}`,
        // Bottom-left vertex
        `Q ${inset} ${h} ${inset - r} ${h - r}`,
        // Left diagonal up
        `L ${r} ${my + r}`,
        // Left vertex
        `Q 0 ${my} ${r} ${my - r}`,
        // Left diagonal continuing up
        `L ${inset - r} ${r}`,
        // Top-left vertex
        `Q ${inset} 0 ${inset + r} 0`,
        `Z`,
      ].join(" ");
    }

    case "database": {
      // Cylinder — already smooth (elliptical arcs)
      const ry = h * 0.12;
      return [
        `M 0 ${ry}`,
        `A ${w / 2} ${ry} 0 0 1 ${w} ${ry}`,
        `L ${w} ${h - ry}`,
        `A ${w / 2} ${ry} 0 0 1 0 ${h - ry}`,
        `Z`,
      ].join(" ");
    }

    case "connector": {
      // Circle — already smooth
      const r = Math.min(w, h) / 2;
      const cx = w / 2;
      const cy = h / 2;
      return [
        `M ${cx - r} ${cy}`,
        `A ${r} ${r} 0 1 1 ${cx + r} ${cy}`,
        `A ${r} ${r} 0 1 1 ${cx - r} ${cy}`,
        `Z`,
      ].join(" ");
    }

    case "comment": {
      // Open bracket with rounded corners
      const tick = Math.min(20, w * 0.12);
      const r = Math.min(R * 0.7, tick * 0.8, h * 0.08);
      return [
        `M ${tick} 0`,
        `L ${r} 0`,
        `Q 0 0 0 ${r}`,
        `L 0 ${h - r}`,
        `Q 0 ${h} ${r} ${h}`,
        `L ${tick} ${h}`,
      ].join(" ");
    }

    default:
      return roundedRectPath(w, h, R);
  }
}

/**
 * Returns whether a shape should be rendered as a closed fill path
 * or as a stroke-only open path.
 */
export function isOpenShape(shape: NodeShapeType): boolean {
  return shape === "comment";
}

/**
 * Returns extra SVG elements for shapes that need overlays
 * (e.g., the inner vertical lines of predefined-process,
 * the top ellipse line of database).
 * Returns array of SVG path strings.
 */
export function getShapeOverlays(
  shape: NodeShapeType,
  w: number,
  h: number
): string[] {
  switch (shape) {
    case "predefined-process": {
      const inset = w * 0.1;
      return [
        `M ${inset} 0 L ${inset} ${h}`,
        `M ${w - inset} 0 L ${w - inset} ${h}`,
      ];
    }
    case "database": {
      const ry = h * 0.12;
      // Extra top ellipse visible arc
      return [
        `M 0 ${ry} A ${w / 2} ${ry} 0 0 0 ${w} ${ry}`,
      ];
    }
    default:
      return [];
  }
}

// ── Helpers ──────────────────────────────────────────────────

function roundedRectPath(w: number, h: number, r: number): string {
  // Clamp radius so it never exceeds half the shortest side
  r = Math.max(0, Math.min(r, w / 2, h / 2));
  return [
    `M ${r} 0`,
    `L ${w - r} 0`,
    `Q ${w} 0 ${w} ${r}`,
    `L ${w} ${h - r}`,
    `Q ${w} ${h} ${w - r} ${h}`,
    `L ${r} ${h}`,
    `Q 0 ${h} 0 ${h - r}`,
    `L 0 ${r}`,
    `Q 0 0 ${r} 0`,
    `Z`,
  ].join(" ");
}
