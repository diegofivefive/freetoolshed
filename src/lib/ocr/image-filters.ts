import type { ImageFilters } from "./types";
import { DEFAULT_FILTERS } from "./constants";

/** Build a CSS `filter` string for live-preview on thumbnails */
export function getCssFilterString(filters: ImageFilters): string {
  const parts: string[] = [];
  if (filters.brightness !== 100) {
    parts.push(`brightness(${filters.brightness / 100})`);
  }
  if (filters.contrast !== 100) {
    parts.push(`contrast(${filters.contrast / 100})`);
  }
  return parts.length > 0 ? parts.join(" ") : "none";
}

/** Check whether filters differ from defaults */
export function filtersAreDefault(filters: ImageFilters): boolean {
  return (
    filters.brightness === DEFAULT_FILTERS.brightness &&
    filters.contrast === DEFAULT_FILTERS.contrast &&
    filters.threshold === DEFAULT_FILTERS.threshold
  );
}

/**
 * Apply brightness, contrast, and threshold to an image via canvas.
 * Returns a new blob URL of the processed image.
 */
export async function applyFiltersToImage(
  imageUrl: string,
  filters: ImageFilters,
): Promise<string> {
  const img = await loadImage(imageUrl);
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get 2D context");

  // Apply brightness + contrast via CSS filter on the canvas context
  const cssParts: string[] = [];
  if (filters.brightness !== 100) {
    cssParts.push(`brightness(${filters.brightness / 100})`);
  }
  if (filters.contrast !== 100) {
    cssParts.push(`contrast(${filters.contrast / 100})`);
  }
  ctx.filter = cssParts.length > 0 ? cssParts.join(" ") : "none";
  ctx.drawImage(img, 0, 0);
  ctx.filter = "none";

  // Threshold: pixel-level grayscale binarization (0 = off)
  if (filters.threshold > 0) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const t = filters.threshold;
    for (let i = 0; i < data.length; i += 4) {
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      const val = gray >= t ? 255 : 0;
      data[i] = val;
      data[i + 1] = val;
      data[i + 2] = val;
    }
    ctx.putImageData(imageData, 0, 0);
  }

  return new Promise<string>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) return reject(new Error("Canvas toBlob failed"));
        resolve(URL.createObjectURL(blob));
      },
      "image/png",
    );
  });
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = url;
  });
}
