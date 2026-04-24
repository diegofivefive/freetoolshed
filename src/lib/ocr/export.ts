import type { ExportFormat } from "./types";

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

function sanitizeFilename(name: string): string {
  return name
    .replace(/\.[^.]+$/, "")
    .replace(/\s+/g, "-")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "")
    .slice(0, 80);
}

export async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function exportAsTxt(text: string, filename: string): void {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  downloadBlob(blob, `${sanitizeFilename(filename)}.txt`);
}

export async function exportAsDocx(
  text: string,
  filename: string,
): Promise<void> {
  const { Document, Packer, Paragraph, TextRun } = await import("docx");

  const paragraphs = text.split("\n").map((line) => {
    if (line.trim() === "---") {
      return new Paragraph({
        children: [
          new TextRun({
            text: "───────────────────────────────",
            color: "999999",
            size: 18,
          }),
        ],
        spacing: { before: 200, after: 200 },
      });
    }

    return new Paragraph({
      children: [
        new TextRun({
          text: line || " ",
          size: 24,
          font: "Calibri",
        }),
      ],
      spacing: { after: 60 },
    });
  });

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
          },
        },
        children: paragraphs,
      },
    ],
  });

  const buffer = await Packer.toBlob(doc);
  downloadBlob(buffer, `${sanitizeFilename(filename)}.docx`);
}

/**
 * Merge per-page searchable PDFs (produced by tesseract with image + invisible
 * text layer) into a single multi-page PDF. Each input PDF has accurate word
 * bounding boxes so text selection/search lines up with the scan.
 */
export async function exportAsSearchablePdf(
  pagePdfs: Uint8Array[],
  filename: string,
): Promise<void> {
  if (pagePdfs.length === 0) {
    throw new Error("No PDF data available. Run OCR first.");
  }

  const { PDFDocument } = await import("pdf-lib");
  const merged = await PDFDocument.create();

  for (const bytes of pagePdfs) {
    const src = await PDFDocument.load(bytes);
    const copied = await merged.copyPages(src, src.getPageIndices());
    for (const page of copied) merged.addPage(page);
  }

  const out = await merged.save();
  // Copy to a fresh ArrayBuffer so Blob typing is happy regardless of
  // whether `out` is backed by a SharedArrayBuffer or a plain Uint8Array.
  const ab = new ArrayBuffer(out.byteLength);
  new Uint8Array(ab).set(out);
  downloadBlob(new Blob([ab], { type: "application/pdf" }), `${sanitizeFilename(filename)}.pdf`);
}

export interface ExportOptions {
  format: ExportFormat;
  text: string;
  filename: string;
  /** Per-page searchable PDF bytes — required when format === "pdf" */
  pagePdfs?: Uint8Array[];
}

export async function exportOcrResult(options: ExportOptions): Promise<void> {
  const { format, text, filename, pagePdfs } = options;

  switch (format) {
    case "txt":
      exportAsTxt(text, filename);
      break;
    case "docx":
      await exportAsDocx(text, filename);
      break;
    case "pdf":
      await exportAsSearchablePdf(pagePdfs ?? [], filename);
      break;
  }
}
