// ─── Image Conversion Engine (Canvas API) ────────────────────────────────────
// No ffmpeg needed — uses native browser canvas.toBlob() for format conversion.

export interface ImageFormat {
  label: string;
  extension: string;
  mimeType: string;
  lossy: boolean;
}

export const IMAGE_FORMATS: Record<string, ImageFormat> = {
  png: {
    label: "PNG",
    extension: "png",
    mimeType: "image/png",
    lossy: false,
  },
  jpg: {
    label: "JPG",
    extension: "jpg",
    mimeType: "image/jpeg",
    lossy: true,
  },
  webp: {
    label: "WebP",
    extension: "webp",
    mimeType: "image/webp",
    lossy: true,
  },
  avif: {
    label: "AVIF",
    extension: "avif",
    mimeType: "image/avif",
    lossy: true,
  },
};

export const ACCEPTED_IMAGE_TYPES =
  "image/png,image/jpeg,image/webp,image/avif,image/bmp,image/gif,image/tiff,image/svg+xml";

export interface ImageConvertResult {
  blob: Blob;
  filename: string;
  width: number;
  height: number;
}

// ─── Runtime feature detection ───────────────────────────────────────────────

const formatSupportCache = new Map<string, boolean>();

export async function isFormatSupported(mimeType: string): Promise<boolean> {
  const cached = formatSupportCache.get(mimeType);
  if (cached !== undefined) return cached;

  try {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      formatSupportCache.set(mimeType, false);
      return false;
    }
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, 1, 1);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, mimeType, 0.5);
    });

    // If the browser doesn't support the format, toBlob returns a PNG fallback
    const supported = blob !== null && blob.type === mimeType;
    formatSupportCache.set(mimeType, supported);
    return supported;
  } catch {
    formatSupportCache.set(mimeType, false);
    return false;
  }
}

/** Check all formats and return which are supported */
export async function detectSupportedFormats(): Promise<Set<string>> {
  const supported = new Set<string>();
  const checks = Object.entries(IMAGE_FORMATS).map(async ([key, fmt]) => {
    if (await isFormatSupported(fmt.mimeType)) {
      supported.add(key);
    }
  });
  await Promise.all(checks);
  return supported;
}

// ─── Conversion ──────────────────────────────────────────────────────────────

interface ConvertOptions {
  targetFormat: string;
  /** 0–1 for lossy formats, ignored for PNG */
  quality: number;
  /** Optional max width/height in pixels (preserves aspect ratio) */
  maxDimension?: number | null;
}

export async function convertImage(
  file: File,
  options: ConvertOptions
): Promise<ImageConvertResult> {
  const { targetFormat, quality, maxDimension } = options;

  const fmt = IMAGE_FORMATS[targetFormat];
  if (!fmt) throw new Error(`Unknown format: ${targetFormat}`);

  // Load image
  const bitmap = await createImageBitmap(file);

  let drawWidth = bitmap.width;
  let drawHeight = bitmap.height;

  // Scale if maxDimension is set
  if (maxDimension && maxDimension > 0) {
    const longest = Math.max(drawWidth, drawHeight);
    if (longest > maxDimension) {
      const scale = maxDimension / longest;
      drawWidth = Math.round(drawWidth * scale);
      drawHeight = Math.round(drawHeight * scale);
    }
  }

  // Draw to canvas
  const canvas = document.createElement("canvas");
  canvas.width = drawWidth;
  canvas.height = drawHeight;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Failed to get canvas 2D context");

  // For JPG: fill white background (no transparency support)
  if (targetFormat === "jpg") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, drawWidth, drawHeight);
  }

  ctx.drawImage(bitmap, 0, 0, drawWidth, drawHeight);
  bitmap.close();

  // Convert to blob
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (b) resolve(b);
        else reject(new Error(`Failed to encode as ${fmt.label}`));
      },
      fmt.mimeType,
      fmt.lossy ? quality : undefined
    );
  });

  // Build filename
  const baseName = file.name.replace(/\.[^.]+$/, "");
  const filename = `${baseName}.${fmt.extension}`;

  return { blob, filename, width: drawWidth, height: drawHeight };
}

// ─── Batch conversion ────────────────────────────────────────────────────────

export interface BatchCallbacks {
  onFileStart: (index: number, filename: string) => void;
  onFileComplete: (index: number, result: ImageConvertResult) => void;
  onFileError: (index: number, error: string) => void;
}

export async function convertImageBatch(
  files: File[],
  options: ConvertOptions,
  callbacks: BatchCallbacks
): Promise<void> {
  for (let i = 0; i < files.length; i++) {
    callbacks.onFileStart(i, files[i].name);
    try {
      const result = await convertImage(files[i], options);
      callbacks.onFileComplete(i, result);
    } catch (err) {
      callbacks.onFileError(
        i,
        err instanceof Error ? err.message : "Conversion failed"
      );
    }
  }
}
