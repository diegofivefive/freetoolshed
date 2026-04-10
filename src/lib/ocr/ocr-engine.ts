import type { OcrLanguage } from "./types";

type ProgressCallback = (progress: number) => void;

interface TesseractWorker {
  recognize: (
    image: string,
  ) => Promise<{ data: { text: string; confidence: number } }>;
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
      // Blank line → flush current paragraph
      if (current.length > 0) {
        paragraphs.push(current);
        current = "";
      }
      continue;
    }

    if (current.length === 0) {
      current = trimmed;
    } else if (current.endsWith("-")) {
      // Hyphenated word break: join without space and remove hyphen
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

export async function recognizeImage(
  imageUrl: string,
): Promise<{ text: string; confidence: number }> {
  if (!worker) throw new Error("OCR worker not initialized");
  const result = await worker.recognize(imageUrl);
  return {
    text: reflowParagraphs(result.data.text.trim()),
    confidence: result.data.confidence,
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

export function isWorkerReady(): boolean {
  return worker !== null;
}

export function getWorkerLanguage(): string | null {
  return currentLanguage;
}
