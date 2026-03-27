import type { FloorPlan } from "./types";
import { PIXELS_PER_UNIT } from "./constants";
import { getFurnitureItem } from "./furniture";
import jsPDF from "jspdf";

// ── Build standalone SVG string ─────────────────────────────

export function buildSvgString(
  plan: FloorPlan,
  options: { includeGrid: boolean; includeDimensions: boolean }
): string {
  const w = plan.width * PIXELS_PER_UNIT;
  const h = plan.height * PIXELS_PER_UNIT;

  const parts: string[] = [];

  parts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">`
  );

  // Background
  parts.push(
    `<rect x="0" y="0" width="${w}" height="${h}" fill="${plan.backgroundColor}" stroke="#e2e8f0" stroke-width="1"/>`
  );

  // Grid
  if (options.includeGrid && plan.showGrid) {
    const gs = plan.gridSize * PIXELS_PER_UNIT;
    parts.push(`<g opacity="0.2" stroke="#94a3b8" stroke-width="0.5">`);
    for (let x = gs; x < w; x += gs) {
      parts.push(`<line x1="${x}" y1="0" x2="${x}" y2="${h}"/>`);
    }
    for (let y = gs; y < h; y += gs) {
      parts.push(`<line x1="0" y1="${y}" x2="${w}" y2="${y}"/>`);
    }
    parts.push(`</g>`);
  }

  // Elements sorted by zIndex
  const sorted = [...plan.elements].sort((a, b) => a.zIndex - b.zIndex);

  for (const el of sorted) {
    const px = el.x * PIXELS_PER_UNIT;
    const py = el.y * PIXELS_PER_UNIT;

    switch (el.type) {
      case "room": {
        const pw = el.width * PIXELS_PER_UNIT;
        const ph = el.height * PIXELS_PER_UNIT;
        const cx = px + pw / 2;
        const cy = py + ph / 2;
        parts.push(`<g transform="rotate(${el.rotation}, ${cx}, ${cy})" opacity="${el.opacity}">`);
        parts.push(
          `<rect x="${px}" y="${py}" width="${pw}" height="${ph}" fill="${el.fill}" fill-opacity="0.5" stroke="${el.strokeColor}" stroke-width="1" rx="2"/>`
        );
        if (el.label) {
          parts.push(
            `<text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="central" font-size="12" fill="#1e293b" font-family="sans-serif" font-weight="500">${escapeXml(el.label)}</text>`
          );
        }
        if (options.includeDimensions) {
          const wLabel = formatDim(el.width, plan.unit);
          const hLabel = formatDim(el.height, plan.unit);
          parts.push(
            `<text x="${px + pw / 2}" y="${py - 6}" text-anchor="middle" font-size="9" fill="#64748b" font-family="monospace">${escapeXml(wLabel)}</text>`
          );
          parts.push(
            `<text x="${px - 6}" y="${py + ph / 2}" text-anchor="middle" font-size="9" fill="#64748b" font-family="monospace" transform="rotate(-90, ${px - 6}, ${py + ph / 2})">${escapeXml(hLabel)}</text>`
          );
        }
        parts.push(`</g>`);
        break;
      }

      case "furniture": {
        const pw = el.width * PIXELS_PER_UNIT;
        const ph = el.height * PIXELS_PER_UNIT;
        const cx = px + pw / 2;
        const cy = py + ph / 2;
        const catalogItem = getFurnitureItem(el.furnitureType);
        parts.push(`<g transform="rotate(${el.rotation}, ${cx}, ${cy})" opacity="${el.opacity}">`);
        parts.push(
          `<rect x="${px}" y="${py}" width="${pw}" height="${ph}" fill="${el.fill}" fill-opacity="0.15" stroke="#cbd5e1" stroke-width="0.5" rx="2"/>`
        );
        if (catalogItem) {
          parts.push(
            `<svg x="${px}" y="${py}" width="${pw}" height="${ph}" viewBox="${catalogItem.viewBox}"><path d="${catalogItem.svgPath}" fill="none" stroke="${el.fill}" stroke-width="2" opacity="0.7"/></svg>`
          );
        }
        if (el.label) {
          parts.push(
            `<text x="${cx}" y="${py + ph + 12}" text-anchor="middle" font-size="9" fill="#64748b" font-family="sans-serif">${escapeXml(el.label)}</text>`
          );
        }
        parts.push(`</g>`);
        break;
      }

      case "wall": {
        const x2 = el.x2 * PIXELS_PER_UNIT;
        const y2 = el.y2 * PIXELS_PER_UNIT;
        const thickness = el.thickness * PIXELS_PER_UNIT;
        parts.push(
          `<line x1="${px}" y1="${py}" x2="${x2}" y2="${y2}" stroke="${el.strokeColor}" stroke-width="${thickness}" stroke-linecap="round" opacity="${el.opacity}"/>`
        );
        break;
      }

      case "text": {
        parts.push(
          `<text x="${px}" y="${py}" font-size="${el.fontSize}" font-weight="${el.fontWeight}" fill="${el.color}" font-family="sans-serif" transform="rotate(${el.rotation}, ${px}, ${py})" opacity="${el.opacity}">${escapeXml(el.text)}</text>`
        );
        break;
      }
    }
  }

  parts.push(`</svg>`);
  return parts.join("\n");
}

// ── SVG export ──────────────────────────────────────────────

export function exportSvg(plan: FloorPlan, options: { includeGrid: boolean; includeDimensions: boolean }): void {
  const svgStr = buildSvgString(plan, options);
  const blob = new Blob([svgStr], { type: "image/svg+xml" });
  downloadBlob(blob, `${slugify(plan.name)}.svg`);
}

// ── PNG export ──────────────────────────────────────────────

export function exportPng(
  plan: FloorPlan,
  options: { includeGrid: boolean; includeDimensions: boolean; scale: number }
): void {
  const svgStr = buildSvgString(plan, options);
  const w = plan.width * PIXELS_PER_UNIT;
  const h = plan.height * PIXELS_PER_UNIT;

  const canvas = document.createElement("canvas");
  canvas.width = w * options.scale;
  canvas.height = h * options.scale;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const img = new Image();
  const svgBlob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);

  img.onload = () => {
    ctx.scale(options.scale, options.scale);
    ctx.drawImage(img, 0, 0, w, h);
    URL.revokeObjectURL(url);

    canvas.toBlob((blob) => {
      if (blob) downloadBlob(blob, `${slugify(plan.name)}.png`);
    }, "image/png");
  };
  img.src = url;
}

// ── PDF export ──────────────────────────────────────────────

export function exportPdf(
  plan: FloorPlan,
  options: {
    includeGrid: boolean;
    includeDimensions: boolean;
    paperSize: "a4" | "letter";
  }
): void {
  const svgStr = buildSvgString(plan, options);
  const w = plan.width * PIXELS_PER_UNIT;
  const h = plan.height * PIXELS_PER_UNIT;

  const canvas = document.createElement("canvas");
  const scale = 2;
  canvas.width = w * scale;
  canvas.height = h * scale;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const img = new Image();
  const svgBlob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);

  img.onload = () => {
    ctx.scale(scale, scale);
    ctx.drawImage(img, 0, 0, w, h);
    URL.revokeObjectURL(url);

    const imgData = canvas.toDataURL("image/png");

    const isLandscape = w > h;
    const doc = new jsPDF({
      orientation: isLandscape ? "landscape" : "portrait",
      unit: "mm",
      format: options.paperSize,
    });

    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 15;
    const headerH = 10;
    const availW = pageW - margin * 2;
    const availH = pageH - margin * 2 - headerH;

    // Fit plan within available area
    const ratio = Math.min(availW / w, availH / h);
    const imgW = w * ratio;
    const imgH = h * ratio;
    const offsetX = margin + (availW - imgW) / 2;
    const offsetY = margin + headerH + (availH - imgH) / 2;

    // Header
    doc.setFontSize(12);
    doc.text(plan.name, margin, margin + 6);
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text(
      `${plan.width} × ${plan.height} ${plan.unit} — Free Tool Shed`,
      pageW - margin,
      margin + 6,
      { align: "right" }
    );

    // Plan image
    doc.addImage(imgData, "PNG", offsetX, offsetY, imgW, imgH);

    doc.save(`${slugify(plan.name)}.pdf`);
  };
  img.src = url;
}

// ── Helpers ─────────────────────────────────────────────────

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function slugify(name: string): string {
  return name.replace(/\s+/g, "-").toLowerCase().replace(/[^a-z0-9-]/g, "");
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function formatDim(value: number, unit: string): string {
  if (unit === "ft") {
    const feet = Math.floor(value);
    const inches = Math.round((value - feet) * 12);
    if (inches === 0) return `${feet}'`;
    return `${feet}'-${inches}"`;
  }
  return `${value.toFixed(2)} m`;
}
