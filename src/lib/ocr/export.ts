import type { ExportFormat } from "./types";

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

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
    .replace(/\.[^.]+$/, "") // strip extension
    .replace(/\s+/g, "-")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "")
    .slice(0, 80);
}

/* ------------------------------------------------------------------ */
/*  Copy to clipboard                                                 */
/* ------------------------------------------------------------------ */

export async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------ */
/*  Export as .txt                                                     */
/* ------------------------------------------------------------------ */

export function exportAsTxt(text: string, filename: string): void {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  downloadBlob(blob, `${sanitizeFilename(filename)}.txt`);
}

/* ------------------------------------------------------------------ */
/*  Export as .docx                                                    */
/* ------------------------------------------------------------------ */

export async function exportAsDocx(
  text: string,
  filename: string,
): Promise<void> {
  const { Document, Packer, Paragraph, TextRun } = await import("docx");

  const paragraphs = text.split("\n").map((line) => {
    // Page separator
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
          text: line || " ", // empty lines need at least a space
          size: 24, // 12pt
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
            margin: {
              top: 1440, // 1 inch in twips
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        children: paragraphs,
      },
    ],
  });

  const buffer = await Packer.toBlob(doc);
  downloadBlob(buffer, `${sanitizeFilename(filename)}.docx`);
}

/* ------------------------------------------------------------------ */
/*  Export as text PDF                                                  */
/* ------------------------------------------------------------------ */

export async function exportAsTextPdf(
  text: string,
  filename: string,
): Promise<void> {
  const { default: jsPDF } = await import("jspdf");

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  const usableWidth = pageWidth - margin * 2;
  const lineHeight = 18;
  const fontSize = 12;

  doc.setFontSize(fontSize);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");

  const wrapped = doc.splitTextToSize(text, usableWidth) as string[];
  let y = margin + fontSize;

  for (const line of wrapped) {
    if (y + lineHeight > pageHeight - margin) {
      doc.addPage("a4", "portrait");
      y = margin + fontSize;
    }
    doc.text(line, margin, y);
    y += lineHeight;
  }

  doc.save(`${sanitizeFilename(filename)}.pdf`);
}

/* ------------------------------------------------------------------ */
/*  Unified export dispatcher                                         */
/* ------------------------------------------------------------------ */

export interface ExportOptions {
  format: ExportFormat;
  text: string;
  filename: string;
}

export async function exportOcrResult(options: ExportOptions): Promise<void> {
  const { format, text, filename } = options;

  switch (format) {
    case "txt":
      exportAsTxt(text, filename);
      break;
    case "docx":
      await exportAsDocx(text, filename);
      break;
    case "pdf":
      await exportAsTextPdf(text, filename);
      break;
  }
}
