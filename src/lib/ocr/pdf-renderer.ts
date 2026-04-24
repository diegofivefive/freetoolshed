import { MAX_PDF_PAGES, PDF_RENDER_SCALE } from "./constants";

/**
 * Polyfill Map.prototype.getOrInsertComputed — pdfjs-dist v5.6+ requires this
 * TC39 Stage 4 feature, which isn't yet available in all environments (e.g. older Electron).
 */
if (
  typeof Map !== "undefined" &&
  !(Map.prototype as Map<unknown, unknown> & { getOrInsertComputed?: unknown })
    .getOrInsertComputed
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (Map.prototype as any).getOrInsertComputed = function <K, V>(
    this: Map<K, V>,
    key: K,
    callbackFn: (key: K) => V,
  ): V {
    if (this.has(key)) {
      return this.get(key) as V;
    }
    const value = callbackFn(key);
    this.set(key, value);
    return value;
  };
}

export interface RenderedPage {
  pageNumber: number;
  imageUrl: string;
  width: number;
  height: number;
}

let workerConfigured = false;

/**
 * Configure pdfjs-dist to run on the main thread (no Web Worker).
 * We pre-import the worker module and attach it to globalThis.pdfjsWorker
 * so pdfjs-dist uses its built-in "fake worker" path, which avoids
 * Web Worker creation issues in Next.js bundlers (turbopack/webpack).
 */
async function configurePdfjsMainThread(): Promise<void> {
  if (workerConfigured) return;

  try {
    // Import the worker module directly — runs on main thread
    const pdfjsWorker = await import("pdfjs-dist/build/pdf.worker.mjs");
    // pdfjs-dist checks globalThis.pdfjsWorker.WorkerMessageHandler
    // before attempting Worker() creation (see PDFWorker.#mainThreadWorkerMessageHandler)
    (globalThis as Record<string, unknown>).pdfjsWorker = pdfjsWorker;
  } catch {
    // If import fails, pdfjs-dist will still try its own fallback
  }

  workerConfigured = true;
}

/**
 * Render all pages of a PDF file to images (object URLs).
 */
export async function renderPdfPages(
  file: File,
  onProgress?: (current: number, total: number) => void,
): Promise<RenderedPage[]> {
  await configurePdfjsMainThread();
  const pdfjsLib = await import("pdfjs-dist");

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const pageCount = Math.min(pdf.numPages, MAX_PDF_PAGES);
  const results: RenderedPage[] = [];

  for (let i = 1; i <= pageCount; i++) {
    onProgress?.(i, pageCount);

    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: PDF_RENDER_SCALE });

    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error(`Failed to get canvas context for page ${i}`);

    await page.render({ canvas, canvasContext: ctx, viewport }).promise;

    // Convert canvas to blob → object URL (more memory-efficient than data URL)
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("Canvas toBlob failed"))),
        "image/png",
      );
    });

    const imageUrl = URL.createObjectURL(blob);

    results.push({
      pageNumber: i - 1,
      imageUrl,
      width: viewport.width,
      height: viewport.height,
    });

    // Clean up canvas
    canvas.width = 0;
    canvas.height = 0;
  }

  return results;
}
