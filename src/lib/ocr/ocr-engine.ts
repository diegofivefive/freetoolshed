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

export async function recognizeImage(
  imageUrl: string,
): Promise<{ text: string; confidence: number }> {
  if (!worker) throw new Error("OCR worker not initialized");
  const result = await worker.recognize(imageUrl);
  return {
    text: result.data.text.trim(),
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
