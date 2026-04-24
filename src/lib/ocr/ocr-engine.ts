import type { OcrLanguage } from "./types";

type ProgressCallback = (progress: number) => void;

interface TesseractWorker {
  recognize: (
    image: string,
    options?: Record<string, unknown>,
    output?: { text?: boolean; pdf?: boolean },
  ) => Promise<{
    data: { text: string; confidence: number; pdf: number[] | null };
  }>;
  terminate: () => Promise<void>;
}

let worker: TesseractWorker | null = null;
let currentLanguage: string | null = null;
let initPromise: Promise<void> | null = null;
/** Mutable ref so the logger always uses the latest callback */
let activeProgressCb: ProgressCallback | null = null;

export async function initWorker(
  language: OcrLanguage,
  onProgress?: ProgressCallback,
): Promise<void> {
  // Always update the progress callback so recognition events use the latest
  activeProgressCb = onProgress ?? null;

  // If already initializing with same language, wait for it
  if (initPromise && currentLanguage === language) {
    await initPromise;
    return;
  }

  // If worker exists with different language, terminate it
  if (worker && currentLanguage !== language) {
    await worker.terminate();
    worker = null;
    currentLanguage = null;
  }

  // If worker already exists with same language, reuse
  if (worker && currentLanguage === language) return;

  initPromise = (async () => {
    const { createWorker } = await import("tesseract.js");
    worker = (await createWorker(language, 1, {
      logger: (m: { status: string; progress: number }) => {
        if (m.status === "recognizing text" && activeProgressCb) {
          activeProgressCb(Math.round(m.progress * 100));
        }
      },
    })) as unknown as TesseractWorker;
    currentLanguage = language;
  })();

  await initPromise;
  initPromise = null;
}

/**
 * Join lines that are part of the same paragraph.
 * - Blank lines (or lines that are only whitespace) mark paragraph boundaries.
 * - A trailing hyphen at end-of-line is treated as a word break (re-joined).
 * - Otherwise consecutive non-blank lines are joined with a space.
 */
function reflowParagraphs(raw: string): string {
  const lines = raw.split("\n");
  const paragraphs: string[] = [];
  let current = "";

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.length === 0) {
      if (current.length > 0) {
        paragraphs.push(current);
        current = "";
      }
      continue;
    }

    if (current.length === 0) {
      current = trimmed;
    } else if (current.endsWith("-")) {
      current = current.slice(0, -1) + trimmed;
    } else {
      current += " " + trimmed;
    }
  }

  if (current.length > 0) {
    paragraphs.push(current);
  }

  return paragraphs.join("\n\n");
}

export interface RecognizeResult {
  text: string;
  confidence: number;
  /** Single-page searchable PDF bytes (image + invisible text layer) */
  pdfBytes: Uint8Array | null;
}

export async function recognizeImage(imageUrl: string): Promise<RecognizeResult> {
  if (!worker) throw new Error("OCR worker not initialized");
  const result = await worker.recognize(imageUrl, {}, { text: true, pdf: true });
  const pdfArray = result.data.pdf;
  return {
    text: reflowParagraphs(result.data.text.trim()),
    confidence: result.data.confidence,
    pdfBytes: pdfArray ? new Uint8Array(pdfArray) : null,
  };
}

export async function terminateWorker(): Promise<void> {
  if (worker) {
    await worker.terminate();
    worker = null;
    currentLanguage = null;
    initPromise = null;
  }
}
