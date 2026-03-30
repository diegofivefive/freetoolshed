import type { FlowchartDiagram, FlowchartNode, FlowchartEdge } from "./types";
import { getShapePath, isOpenShape, getShapeOverlays } from "./shapes";
import { computeEdgePath } from "./routing";

// ── Helpers ──────────────────────────────────────────────────

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function slugify(name: string): string {
  return name
    .replace(/\s+/g, "-")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "");
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// ── Bounding box ────────────────────────────────────────────

interface BoundingBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
}

function getDiagramBounds(diagram: FlowchartDiagram, padding: number = 40): BoundingBox {
  if (diagram.nodes.length === 0) {
    return { minX: 0, minY: 0, maxX: 400, maxY: 300, width: 400, height: 300 };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const node of diagram.nodes) {
    minX = Math.min(minX, node.x);
    minY = Math.min(minY, node.y);
    maxX = Math.max(maxX, node.x + node.width);
    maxY = Math.max(maxY, node.y + node.height);
  }

  minX -= padding;
  minY -= padding;
  maxX += padding;
  maxY += padding;

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

// ── Arrow marker defs for standalone SVG ────────────────────

function buildMarkerDefs(diagram: FlowchartDiagram): string {
  const markers: string[] = [];

  // Generate per-edge markers (unique by color + strokeWidth) using userSpaceOnUse
  const seen = new Set<string>();
  for (const edge of diagram.edges) {
    const cid = edge.style.stroke.replace(/[^a-zA-Z0-9]/g, "_");
    const swKey = String(edge.style.strokeWidth);
    const key = `${cid}_${swKey}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const color = edge.style.stroke;
    const sz = Math.max(10, edge.style.strokeWidth * 4);
    const suffix = `${cid}-${swKey}`;

    // Filled arrow
    markers.push(
      `<marker id="fc-exp-filled-arrow-${suffix}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="${sz}" markerHeight="${sz}" markerUnits="userSpaceOnUse" orient="auto-start-reverse">`,
      `  <path d="M 1 1.5 L 9 5 L 1 8.5 Z" fill="${color}"/>`,
      `</marker>`
    );

    // Open arrow
    markers.push(
      `<marker id="fc-exp-arrow-${suffix}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="${sz}" markerHeight="${sz}" markerUnits="userSpaceOnUse" orient="auto-start-reverse">`,
      `  <path d="M 1 1.5 L 9 5 L 1 8.5" fill="none" stroke="${color}" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>`,
      `</marker>`
    );

    // Diamond
    markers.push(
      `<marker id="fc-exp-diamond-${suffix}" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="${sz}" markerHeight="${sz}" markerUnits="userSpaceOnUse" orient="auto-start-reverse">`,
      `  <path d="M 0 5 L 5 1 L 10 5 L 5 9 Z" fill="${color}"/>`,
      `</marker>`
    );

    // Circle
    markers.push(
      `<marker id="fc-exp-circle-${suffix}" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="${sz}" markerHeight="${sz}" markerUnits="userSpaceOnUse" orient="auto-start-reverse">`,
      `  <circle cx="5" cy="5" r="4" fill="${color}"/>`,
      `</marker>`
    );
  }

  return `<defs>\n${markers.join("\n")}\n</defs>`;
}

// ── Build node SVG ──────────────────────────────────────────

function buildNodeSvg(node: FlowchartNode, offsetX: number, offsetY: number): string {
  const x = node.x - offsetX;
  const y = node.y - offsetY;
  const parts: string[] = [];

  const transform = node.rotation !== 0
    ? ` transform="rotate(${node.rotation}, ${x + node.width / 2}, ${y + node.height / 2})"`
    : "";

  parts.push(`<g${transform}>`);

  // Shape path
  const shapePath = getShapePath(node.shape, node.width, node.height);
  const open = isOpenShape(node.shape);

  parts.push(
    `  <path d="${shapePath}" transform="translate(${x}, ${y})"`,
    `    fill="${open ? "none" : node.style.fill}"`,
    `    stroke="${node.style.stroke}"`,
    `    stroke-width="${node.style.strokeWidth}"`,
    `    opacity="${node.style.opacity}"`,
    `    stroke-linejoin="round"/>`,
  );

  // Shape overlays (predefined-process inner lines, database arc)
  const overlays = getShapeOverlays(node.shape, node.width, node.height);
  for (const overlay of overlays) {
    parts.push(
      `  <path d="${overlay}" transform="translate(${x}, ${y})"`,
      `    fill="none" stroke="${node.style.stroke}" stroke-width="${node.style.strokeWidth * 0.7}"/>`
    );
  }

  // Text
  if (node.text) {
    const cx = x + node.width / 2;
    const cy = y + node.height / 2;
    const maxChars = Math.max(4, Math.floor((node.width - 20) / (node.style.fontSize * 0.55)));
    const words = node.text.split(" ");
    const lines: string[] = [];
    let current = "";
    for (const word of words) {
      if (current && (current + " " + word).length > maxChars) {
        lines.push(current);
        current = word;
      } else {
        current = current ? current + " " + word : word;
      }
    }
    if (current) lines.push(current);

    const lineHeight = node.style.fontSize * 1.3;
    const startY = cy - ((lines.length - 1) * lineHeight) / 2;

    parts.push(
      `  <text x="${cx}" y="${startY}"`,
      `    text-anchor="middle" dominant-baseline="central"`,
      `    font-size="${node.style.fontSize}" font-weight="${node.style.fontWeight}"`,
      `    font-family="system-ui, -apple-system, sans-serif"`,
      `    fill="${node.style.textColor}">`
    );

    for (let i = 0; i < lines.length; i++) {
      if (i === 0) {
        parts.push(`    ${escapeXml(lines[i])}`);
      } else {
        parts.push(`    <tspan x="${cx}" dy="${lineHeight}">${escapeXml(lines[i])}</tspan>`);
      }
    }
    parts.push(`  </text>`);
  }

  parts.push(`</g>`);
  return parts.join("\n");
}

// ── Build edge SVG ──────────────────────────────────────────

function buildEdgeSvg(
  edge: FlowchartEdge,
  diagram: FlowchartDiagram,
  offsetX: number,
  offsetY: number
): string {
  const sourceNode = diagram.nodes.find((n) => n.id === edge.sourceNodeId);
  const targetNode = diagram.nodes.find((n) => n.id === edge.targetNodeId);
  if (!sourceNode || !targetNode) return "";

  const route = computeEdgePath(edge, sourceNode, targetNode);

  // Offset the path by translating coordinates
  const parts: string[] = [];

  const cid = edge.style.stroke.replace(/[^a-zA-Z0-9]/g, "_");
  const suffix = `${cid}-${edge.style.strokeWidth}`;
  const markerEnd =
    edge.style.arrowHead !== "none"
      ? ` marker-end="url(#fc-exp-${edge.style.arrowHead}-${suffix})"`
      : "";
  const markerStart =
    edge.style.arrowTail !== "none"
      ? ` marker-start="url(#fc-exp-${edge.style.arrowTail}-${suffix})"`
      : "";

  parts.push(
    `<g transform="translate(${-offsetX}, ${-offsetY})">`,
    `  <path d="${route.path}"`,
    `    fill="none"`,
    `    stroke="${edge.style.stroke}"`,
    `    stroke-width="${edge.style.strokeWidth}"`,
    `    stroke-linecap="round"`,
    `    stroke-linejoin="round"`,
    `    opacity="${edge.style.opacity}"`,
    edge.style.dashArray ? `    stroke-dasharray="${edge.style.dashArray}"` : "",
    `    ${markerEnd}${markerStart}/>`,
  );

  // Edge label
  if (edge.label) {
    const lx = route.labelX;
    const ly = route.labelY;
    const labelW = edge.label.length * 7 + 12;
    parts.push(
      `  <rect x="${lx - labelW / 2}" y="${ly - 10}" width="${labelW}" height="20"`,
      `    rx="4" fill="white" stroke="#e2e8f0" stroke-width="1"/>`,
      `  <text x="${lx}" y="${ly}" text-anchor="middle" dominant-baseline="central"`,
      `    font-size="12" font-family="system-ui, -apple-system, sans-serif"`,
      `    fill="#111827">${escapeXml(edge.label)}</text>`
    );
  }

  parts.push(`</g>`);
  return parts.filter(Boolean).join("\n");
}

// ── Build standalone SVG string ─────────────────────────────

export function buildSvgString(
  diagram: FlowchartDiagram,
  options: { includeGrid?: boolean; background?: string } = {}
): string {
  const bounds = getDiagramBounds(diagram);
  const parts: string[] = [];

  parts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${bounds.width}" height="${bounds.height}" viewBox="0 0 ${bounds.width} ${bounds.height}">`
  );

  // Marker defs (per-color)
  parts.push(buildMarkerDefs(diagram));

  // Background
  const bg = options.background ?? "#ffffff";
  parts.push(
    `<rect x="0" y="0" width="${bounds.width}" height="${bounds.height}" fill="${bg}"/>`
  );

  // Edges first (behind nodes)
  const sortedEdges = [...diagram.edges].sort((a, b) => a.zIndex - b.zIndex);
  for (const edge of sortedEdges) {
    parts.push(buildEdgeSvg(edge, diagram, bounds.minX, bounds.minY));
  }

  // Nodes
  const sortedNodes = [...diagram.nodes].sort((a, b) => a.zIndex - b.zIndex);
  for (const node of sortedNodes) {
    parts.push(buildNodeSvg(node, bounds.minX, bounds.minY));
  }

  parts.push(`</svg>`);
  return parts.join("\n");
}

// ── Export SVG ───────────────────────────────────────────────

export function exportSvg(diagram: FlowchartDiagram): void {
  const svgStr = buildSvgString(diagram);
  const blob = new Blob([svgStr], { type: "image/svg+xml" });
  downloadBlob(blob, `${slugify(diagram.name) || "flowchart"}.svg`);
}

// ── Export PNG ───────────────────────────────────────────────

export function exportPng(
  diagram: FlowchartDiagram,
  scale: number = 2
): void {
  const svgStr = buildSvgString(diagram);
  const bounds = getDiagramBounds(diagram);

  const canvas = document.createElement("canvas");
  canvas.width = bounds.width * scale;
  canvas.height = bounds.height * scale;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const img = new Image();
  const svgBlob = new Blob([svgStr], {
    type: "image/svg+xml;charset=utf-8",
  });
  const url = URL.createObjectURL(svgBlob);

  img.onload = () => {
    ctx.scale(scale, scale);
    ctx.drawImage(img, 0, 0, bounds.width, bounds.height);
    URL.revokeObjectURL(url);

    canvas.toBlob((blob) => {
      if (blob) {
        downloadBlob(blob, `${slugify(diagram.name) || "flowchart"}.png`);
      }
    }, "image/png");
  };
  img.onerror = () => {
    URL.revokeObjectURL(url);
  };
  img.src = url;
}

// ── Export PDF ───────────────────────────────────────────────

export async function exportPdf(
  diagram: FlowchartDiagram,
  paperSize: "a4" | "letter" = "a4"
): Promise<void> {
  const svgStr = buildSvgString(diagram);
  const bounds = getDiagramBounds(diagram);

  // Render SVG to canvas
  const scale = 2;
  const canvas = document.createElement("canvas");
  canvas.width = bounds.width * scale;
  canvas.height = bounds.height * scale;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const img = new Image();
  const svgBlob = new Blob([svgStr], {
    type: "image/svg+xml;charset=utf-8",
  });
  const url = URL.createObjectURL(svgBlob);

  return new Promise<void>((resolve) => {
    img.onload = async () => {
      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0, bounds.width, bounds.height);
      URL.revokeObjectURL(url);

      const imgData = canvas.toDataURL("image/png");

      // Lazy load jsPDF
      const { default: jsPDF } = await import("jspdf");

      const isLandscape = bounds.width > bounds.height;
      const doc = new jsPDF({
        orientation: isLandscape ? "landscape" : "portrait",
        unit: "mm",
        format: paperSize,
      });

      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      const margin = 10;
      const headerH = 14;

      // Title
      doc.setFontSize(11);
      doc.setTextColor(55, 65, 81);
      doc.text(diagram.name || "Flowchart", margin, margin + 6);

      // Subtitle
      doc.setFontSize(8);
      doc.setTextColor(156, 163, 175);
      doc.text("Created with Free Tool Shed", margin, margin + 11);

      // Fit diagram image to page
      const availW = pageW - margin * 2;
      const availH = pageH - margin * 2 - headerH;
      const ratio = Math.min(availW / bounds.width, availH / bounds.height);
      const imgW = bounds.width * ratio;
      const imgH = bounds.height * ratio;
      const offsetX = margin + (availW - imgW) / 2;
      const offsetY = margin + headerH + (availH - imgH) / 2;

      doc.addImage(imgData, "PNG", offsetX, offsetY, imgW, imgH);
      doc.save(`${slugify(diagram.name) || "flowchart"}.pdf`);
      resolve();
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve();
    };
    img.src = url;
  });
}

// ── Copy to clipboard as PNG ────────────────────────────────

export async function copyToClipboard(
  diagram: FlowchartDiagram,
  scale: number = 2
): Promise<boolean> {
  const svgStr = buildSvgString(diagram);
  const bounds = getDiagramBounds(diagram);

  const canvas = document.createElement("canvas");
  canvas.width = bounds.width * scale;
  canvas.height = bounds.height * scale;
  const ctx = canvas.getContext("2d");
  if (!ctx) return false;

  return new Promise<boolean>((resolve) => {
    const img = new Image();
    const svgBlob = new Blob([svgStr], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(svgBlob);

    img.onload = async () => {
      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0, bounds.width, bounds.height);
      URL.revokeObjectURL(url);

      try {
        const blob = await new Promise<Blob | null>((res) =>
          canvas.toBlob(res, "image/png")
        );
        if (blob) {
          await navigator.clipboard.write([
            new ClipboardItem({ "image/png": blob }),
          ]);
          resolve(true);
        } else {
          resolve(false);
        }
      } catch {
        resolve(false);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(false);
    };
    img.src = url;
  });
}
