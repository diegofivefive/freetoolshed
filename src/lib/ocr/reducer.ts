import type { OcrState, OcrAction } from "./types";
import { INITIAL_OCR_STATE } from "./constants";

function buildCombinedText(pages: OcrState["pages"]): string {
  return pages
    .filter((p) => p.status === "done" && p.text.length > 0)
    .map((p) => p.text)
    .join("\n\n---\n\n");
}

export function ocrReducer(state: OcrState, action: OcrAction): OcrState {
  switch (action.type) {
    case "ADD_FILE":
      return { ...state, files: [...state.files, action.payload] };

    case "ADD_PAGES":
      return {
        ...state,
        pages: [...state.pages, ...action.payload],
        selectedPageId:
          state.selectedPageId ?? action.payload[0]?.id ?? null,
      };

    case "REMOVE_FILE": {
      const fileId = action.payload;
      const removedPageIds = new Set(
        state.pages.filter((p) => p.fileId === fileId).map((p) => p.id),
      );
      const newPages = state.pages.filter((p) => p.fileId !== fileId);
      const newCombined = buildCombinedText(newPages);
      return {
        ...state,
        files: state.files.filter((f) => f.id !== fileId),
        pages: newPages,
        selectedPageId: removedPageIds.has(state.selectedPageId ?? "")
          ? (newPages[0]?.id ?? null)
          : state.selectedPageId,
        combinedText: newCombined,
        editedText: state.isTextEdited ? state.editedText : newCombined,
      };
    }

    case "CLEAR_ALL":
      return { ...INITIAL_OCR_STATE, isWorkerReady: state.isWorkerReady };

    case "SET_PAGE_STATUS":
      return {
        ...state,
        pages: state.pages.map((p) =>
          p.id === action.payload.pageId
            ? { ...p, status: action.payload.status }
            : p,
        ),
      };

    case "SET_PAGE_PROGRESS":
      return {
        ...state,
        pages: state.pages.map((p) =>
          p.id === action.payload.pageId
            ? { ...p, progress: action.payload.progress }
            : p,
        ),
      };

    case "SET_PAGE_RESULT": {
      const newPages = state.pages.map((p) =>
        p.id === action.payload.pageId
          ? {
              ...p,
              status: "done" as const,
              progress: 100,
              text: action.payload.text,
              confidence: action.payload.confidence,
            }
          : p,
      );
      const newCombined = buildCombinedText(newPages);
      return {
        ...state,
        pages: newPages,
        combinedText: newCombined,
        editedText: state.isTextEdited ? state.editedText : newCombined,
      };
    }

    case "SET_PAGE_ERROR":
      return {
        ...state,
        pages: state.pages.map((p) =>
          p.id === action.payload.pageId
            ? {
                ...p,
                status: "error" as const,
                errorMessage: action.payload.errorMessage,
              }
            : p,
        ),
      };

    case "SELECT_PAGE":
      return { ...state, selectedPageId: action.payload };

    case "SET_LANGUAGE":
      return { ...state, language: action.payload };

    case "SET_PROCESSING":
      return { ...state, isProcessing: action.payload };

    case "UPDATE_COMBINED_TEXT": {
      const newCombined = buildCombinedText(state.pages);
      return {
        ...state,
        combinedText: newCombined,
        editedText: state.isTextEdited ? state.editedText : newCombined,
      };
    }

    case "SET_EDITED_TEXT":
      return { ...state, editedText: action.payload, isTextEdited: true };

    case "RESET_EDITED_TEXT":
      return {
        ...state,
        editedText: state.combinedText,
        isTextEdited: false,
      };

    case "SET_EXPORT_FORMAT":
      return { ...state, exportFormat: action.payload };

    case "SET_WORKER_READY":
      return { ...state, isWorkerReady: action.payload };

    case "SET_ERROR":
      return { ...state, errorMessage: action.payload };

    case "RESET_ALL_PAGES_PENDING":
      return {
        ...state,
        pages: state.pages.map((p) => ({
          ...p,
          status: "pending" as const,
          progress: 0,
          text: "",
          confidence: 0,
          errorMessage: null,
        })),
        combinedText: "",
        editedText: state.isTextEdited ? state.editedText : "",
      };

    case "UPDATE_FILE_PAGE_COUNT":
      return {
        ...state,
        files: state.files.map((f) =>
          f.id === action.payload.fileId
            ? { ...f, pageCount: action.payload.pageCount }
            : f,
        ),
      };

    default:
      return state;
  }
}
