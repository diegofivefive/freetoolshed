/** Supported input file types */
export type InputFileType = "image" | "pdf";

/** OCR processing status for a single page/image */
export type OcrStatus = "pending" | "processing" | "done" | "error";

/** Export format options */
export type ExportFormat = "txt" | "docx" | "pdf";

/** Text panel view mode */
export type TextViewMode = "combined" | "page";

/** Image preprocessing filter values */
export interface ImageFilters {
  brightness: number; // 0–200, default 100
  contrast: number; // 0–200, default 100
  threshold: number; // 0–255, default 0 (off)
}

/** Supported OCR languages (subset of tesseract's ~100 languages) */
export type OcrLanguage =
  | "eng"
  | "fra"
  | "deu"
  | "spa"
  | "ita"
  | "por"
  | "nld"
  | "pol"
  | "rus"
  | "jpn"
  | "kor"
  | "chi_sim"
  | "chi_tra"
  | "ara"
  | "hin";

/** A single page extracted from a file (standalone image or one PDF page) */
export interface OcrPage {
  id: string;
  fileId: string;
  pageNumber: number;
  imageUrl: string;
  originalImageUrl: string;
  width: number;
  height: number;
  status: OcrStatus;
  progress: number;
  text: string;
  confidence: number;
  errorMessage: string | null;
}

/** An uploaded file (image or PDF) */
export interface OcrFile {
  id: string;
  name: string;
  type: InputFileType;
  size: number;
  pageCount: number;
  addedAt: number;
}

/** Main application state */
export interface OcrState {
  files: OcrFile[];
  pages: OcrPage[];
  selectedPageId: string | null;
  viewMode: TextViewMode;
  language: OcrLanguage;
  isProcessing: boolean;
  combinedText: string;
  editedText: string;
  isTextEdited: boolean;
  exportFormat: ExportFormat;
  isWorkerReady: boolean;
  errorMessage: string | null;
  filters: ImageFilters;
  showFilters: boolean;
}

/** Reducer actions */
export type OcrAction =
  | { type: "ADD_FILE"; payload: OcrFile }
  | { type: "ADD_PAGES"; payload: OcrPage[] }
  | { type: "REMOVE_FILE"; payload: string }
  | { type: "CLEAR_ALL" }
  | { type: "SET_PAGE_STATUS"; payload: { pageId: string; status: OcrStatus } }
  | { type: "SET_PAGE_PROGRESS"; payload: { pageId: string; progress: number } }
  | {
      type: "SET_PAGE_RESULT";
      payload: { pageId: string; text: string; confidence: number };
    }
  | {
      type: "SET_PAGE_ERROR";
      payload: { pageId: string; errorMessage: string };
    }
  | { type: "SELECT_PAGE"; payload: string | null }
  | { type: "SET_LANGUAGE"; payload: OcrLanguage }
  | { type: "SET_PROCESSING"; payload: boolean }
  | { type: "UPDATE_COMBINED_TEXT" }
  | { type: "SET_EDITED_TEXT"; payload: string }
  | { type: "RESET_EDITED_TEXT" }
  | { type: "SET_EXPORT_FORMAT"; payload: ExportFormat }
  | { type: "SET_WORKER_READY"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "RESET_ALL_PAGES_PENDING" }
  | { type: "UPDATE_FILE_PAGE_COUNT"; payload: { fileId: string; pageCount: number } }
  | { type: "SET_VIEW_MODE"; payload: TextViewMode }
  | { type: "SET_PAGE_TEXT"; payload: { pageId: string; text: string } }
  | { type: "REBUILD_COMBINED_FROM_PAGES" }
  | { type: "SET_FILTERS"; payload: ImageFilters }
  | { type: "TOGGLE_FILTERS_PANEL" }
  | { type: "RESET_FILTERS" }
  | { type: "SET_PAGE_IMAGE_URL"; payload: { pageId: string; imageUrl: string } };
