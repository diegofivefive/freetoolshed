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
/*  Export as searchable PDF                                           */
/* ------------------------------------------------------------------ */

/** Page data needed for searchable PDF export */
export interface SearchablePdfPage {
  imageUrl: string;
  width: number;
  height: number;
  text: string;
}

export async function exportAsSearchablePdf(
  pages: SearchablePdfPage[],
  filename: string,
): Promise<void> {
  if (pages.length === 0) return;

  const { default: jsPDF } = await import("jspdf");

  // Determine page size from first page aspect ratio
  const first = pages[0];
  const isLandscape = first.width > first.height;

  const doc = new jsPDF({
    orientation: isLandscape ? "landscape" : "portrait",
    unit: "pt",
    format: "a4",
  });

  for (let i = 0; i < pages.length; i++) {
    if (i > 0) {
      const pg = pages[i];
      const landscape = pg.width > pg.height;
      doc.addPage("a4", landscape ? "landscape" : "portrait");
    }

    const page = pages[i];
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Load the scanned image and embed it as the background
    try {
      const imgData = await loadImageAsDataUrl(page.imageUrl);
      const aspect = page.width / page.height;
      let imgW = pageWidth;
      let imgH = pageWidth / aspect;

      if (imgH > pageHeight) {
        imgH = pageHeight;
        imgW = pageHeight * aspect;
      }

      const x = (pageWidth - imgW) / 2;
      const y = (pageHeight - imgH) / 2;

      doc.addImage(imgData, "PNG", x, y, imgW, imgH);

      // Add invisible text layer on top for searchability
      if (page.text.trim()) {
        doc.setTextColor(0, 0, 0);
        // Render text invisibly (opacity 0) — this makes the PDF searchable/selectable
        // while the scan image is what the user sees
        doc.setFontSize(1);
        doc.setFont("helvetica", "normal");

        // We can't make text truly invisible in jsPDF, but we can make it
        // extremely small and positioned at top-left. A better approach:
        // place text at proper positions with transparent rendering mode.
        doc.saveGraphicsState();
        // Set text rendering mode to invisible (mode 3)
        // jsPDF types don't expose write(), but it's a valid API call
        (doc.internal as unknown as { write: (s: string) => void }).write(
          "3 Tr",
        );

        const lines = page.text.split("\n");
        const lineHeight = imgH / Math.max(lines.length, 1);
        const fontSize = Math.max(4, Math.min(12, lineHeight * 0.8));
        doc.setFontSize(fontSize);

        lines.forEach((line, lineIdx) => {
          if (line.trim()) {
            const lineY = y + lineHeight * (lineIdx + 0.8);
            if (lineY < y + imgH) {
              doc.text(line, x + 4, lineY);
            }
          }
        });

        doc.restoreGraphicsState();
      }
    } catch {
      // If image loading fails, just add the text
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      const lines = doc.splitTextToSize(page.text, pageWidth - 80);
      doc.text(lines, 40, 40);
    }
  }

  doc.save(`${sanitizeFilename(filename)}.pdf`);
}

/** Load an image URL (object URL or data URL) as a data URL for jsPDF */
async function loadImageAsDataUrl(imageUrl: string): Promise<string> {
  // If already a data URL, return as-is
  if (imageUrl.startsWith("data:")) return imageUrl;

  // Convert object URL → data URL via canvas
  return new Promise<string>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Failed to get canvas context"));
        return;
      }
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
      canvas.width = 0;
      canvas.height = 0;
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = imageUrl;
  });
}

/* ------------------------------------------------------------------ */
/*  Unified export dispatcher                                         */
/* ------------------------------------------------------------------ */

export interface ExportOptions {
  format: ExportFormat;
  text: string;
  filename: string;
  /** Required for searchable PDF export */
  pages?: SearchablePdfPage[];
}

export async function exportOcrResult(options: ExportOptions): Promise<void> {
  const { format, text, filename, pages } = options;

  switch (format) {
    case "txt":
      exportAsTxt(text, filename);
      break;
    case "docx":
      await exportAsDocx(text, filename);
      break;
    case "pdf":
      if (pages && pages.length > 0) {
        await exportAsSearchablePdf(pages, filename);
      } else {
        // Fallback: export text-only PDF if no pages available
        const { default: jsPDF } = await import("jspdf");
        const doc = new jsPDF({ unit: "pt", format: "a4" });
        const pageWidth = doc.internal.pageSize.getWidth();
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        const lines = doc.splitTextToSize(text, pageWidth - 80);
        doc.text(lines, 40, 40);
        doc.save(`${sanitizeFilename(filename)}.pdf`);
      }
      break;
  }
}
