import type { OcrState, OcrLanguage, ExportFormat, ImageFilters } from "./types";

/** Human-readable language labels */
export const LANGUAGE_LABELS: Record<OcrLanguage, string> = {
  eng: "English",
  fra: "French",
  deu: "German",
  spa: "Spanish",
  ita: "Italian",
  por: "Portuguese",
  nld: "Dutch",
  pol: "Polish",
  rus: "Russian",
  jpn: "Japanese",
  kor: "Korean",
  chi_sim: "Chinese (Simplified)",
  chi_tra: "Chinese (Traditional)",
  ara: "Arabic",
  hin: "Hindi",
};

/** Export format labels */
export const EXPORT_FORMAT_LABELS: Record<ExportFormat, string> = {
  txt: "Plain Text (.txt)",
  docx: "Word Document (.docx)",
  pdf: "Searchable PDF (.pdf)",
};

/** File input accept string */
export const INPUT_ACCEPT =
  ".png,.jpg,.jpeg,.tiff,.tif,.bmp,.webp,.pdf,image/*,application/pdf";

/** Max file size in MB */
export const MAX_FILE_SIZE_MB = 50;

/** Max pages per PDF (safety limit for browser memory) */
export const MAX_PDF_PAGES = 50;

/** PDF render scale (2 = ~144dpi, good balance for OCR quality vs memory) */
export const PDF_RENDER_SCALE = 2;

/** Image MIME types */
export const IMAGE_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/tiff",
  "image/bmp",
  "image/webp",
]);

/** Default image filter values (no-op) */
export const DEFAULT_FILTERS: ImageFilters = {
  brightness: 100,
  contrast: 100,
  threshold: 0,
};

/** Default state */
export const INITIAL_OCR_STATE: OcrState = {
  files: [],
  pages: [],
  selectedPageId: null,
  viewMode: "combined",
  language: "eng",
  isProcessing: false,
  combinedText: "",
  editedText: "",
  isTextEdited: false,
  exportFormat: "txt",
  errorMessage: null,
  filters: DEFAULT_FILTERS,
  showFilters: false,
};
