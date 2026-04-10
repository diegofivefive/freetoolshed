"use client";

import { useReducer, useCallback, useRef, useEffect, useState } from "react";
import {
  ScanText,
  Plus,
  Trash2,
  Languages,
  Loader2,
  RotateCcw,
  FileText,
  ZoomIn,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileUpload } from "@/components/shared/file-upload";
import { ocrReducer } from "@/lib/ocr/reducer";
import {
  INITIAL_OCR_STATE,
  INPUT_ACCEPT,
  MAX_FILE_SIZE_MB,
  MAX_PDF_PAGES,
  IMAGE_MIME_TYPES,
  LANGUAGE_LABELS,
  DEFAULT_FILTERS,
} from "@/lib/ocr/constants";
import { loadPrefs, savePrefs } from "@/lib/ocr/storage";
import {
  initWorker,
  recognizeImage,
  terminateWorker,
} from "@/lib/ocr/ocr-engine";
import { renderPdfPages } from "@/lib/ocr/pdf-renderer";
import {
  getCssFilterString,
  filtersAreDefault,
  applyFiltersToImage,
} from "@/lib/ocr/image-filters";
import { ExportPanel } from "./export-panel";
import { ImagePreview } from "./image-preview";
import { ToolGuide } from "@/components/shared/tool-guide";
import type { ToolGuideSection } from "@/components/shared/tool-guide";
import type { OcrFile, OcrPage, OcrLanguage, ExportFormat, TextViewMode, ImageFilters } from "@/lib/ocr/types";

const OCR_GUIDE_SECTIONS: ToolGuideSection[] = [
  {
    title: "Getting Started",
    content:
      "Drop images or scanned PDFs onto the upload area, or click to browse. Supports PNG, JPG, TIFF, BMP, WebP, and PDF files.",
    steps: [
      "Drop or select one or more files",
      "OCR begins automatically",
      "Review extracted text on the right",
    ],
  },
  {
    title: "Supported Inputs",
    content:
      "Images: PNG, JPG, TIFF, BMP, WebP. Scanned PDFs: each page is rendered and OCR'd individually. Max 50 MB per file, up to 50 PDF pages.",
  },
  {
    title: "Language Selection",
    content:
      "Use the language dropdown in the toolbar to switch OCR languages. Supports 15+ languages including English, French, German, Spanish, Chinese, Japanese, Arabic, and more. Changing the language re-initializes the OCR engine.",
  },
  {
    title: "Editing Text",
    content:
      "The extracted text panel is fully editable. Fix OCR errors, remove unwanted content, or reformat text before exporting. Word and character counts update in real time.",
  },
  {
    title: "Batch Processing",
    content:
      "Add multiple files at once — images and PDFs can be mixed. Each page is processed sequentially. Use 'Add Files' to append more files to an existing session.",
  },
  {
    title: "Page View",
    content:
      "Switch between 'All Pages' (combined text) and 'Selected Page' to view or edit text for a single page. Click a page in the sidebar to select it. Per-page edits automatically update the combined text.",
  },
  {
    title: "Image Preview",
    content:
      "Hover over a thumbnail and click the magnifying glass to open a full-size preview. Zoom in/out with toolbar buttons or scroll wheel. Drag to pan when zoomed in. Use arrow keys or nav buttons to move between pages.",
  },
  {
    title: "Image Preprocessing",
    content:
      "Click 'Image Settings' to adjust brightness, contrast, and threshold before OCR. Thumbnails show a live CSS preview. Click 'Apply & Re-OCR' to process images with the new settings. Threshold converts to black and white — useful for faded or noisy scans.",
  },
  {
    title: "Re-OCR",
    content:
      "Click 'Re-OCR All' to reprocess every page. Useful after switching languages or if you want a fresh extraction. The current text will be replaced.",
  },
  {
    title: "Exporting Results",
    content:
      "Choose an export format and click Download, or use Copy Text for quick clipboard access.",
    steps: [
      "Plain Text (.txt) — simple text file",
      "Word Document (.docx) — formatted with page separators",
      "Searchable PDF — original scan with invisible text overlay",
    ],
  },
  {
    title: "Privacy",
    content:
      "All processing runs locally in your browser via WebAssembly. Your files are never uploaded to any server. Close the tab and everything is gone.",
  },
];

let nextId = 0;
function uid() {
  return `ocr-${Date.now()}-${nextId++}`;
}

function getInitialState() {
  const prefs = loadPrefs();
  return {
    ...INITIAL_OCR_STATE,
    language: prefs.language,
    exportFormat: prefs.exportFormat,
  };
}

export function OcrScanner() {
  const [state, dispatch] = useReducer(ocrReducer, undefined, getInitialState);
  const objectUrlsRef = useRef<Map<string, string>>(new Map());
  const addFilesInputRef = useRef<HTMLInputElement>(null);
  const processingRef = useRef(false);
  const abortRef = useRef(false);
  const [pdfRenderingCount, setPdfRenderingCount] = useState(0);
  const [previewPageId, setPreviewPageId] = useState<string | null>(null);

  // Save preferences when they change
  useEffect(() => {
    savePrefs({ language: state.language, exportFormat: state.exportFormat });
  }, [state.language, state.exportFormat]);

  // Cleanup on unmount
  useEffect(() => {
    const urls = objectUrlsRef.current;
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
      urls.clear();
      abortRef.current = true;
      terminateWorker();
    };
  }, []);

  // Keep refs to latest state for the processing loop
  const pagesRef = useRef(state.pages);
  const languageRef = useRef(state.language);
  pagesRef.current = state.pages;
  languageRef.current = state.language;

  // Process pending pages sequentially, re-checking for new pages after each batch
  const processQueue = useCallback(async () => {
    if (processingRef.current) return;

    processingRef.current = true;
    abortRef.current = false;
    dispatch({ type: "SET_PROCESSING", payload: true });

    try {
      // Loop: keep processing as long as there are pending pages
      // This handles pages added during processing (e.g. PDF pages rendered mid-OCR)
      while (!abortRef.current) {
        const currentPages = pagesRef.current;
        const language = languageRef.current;
        const nextPending = currentPages.find((p) => p.status === "pending");
        if (!nextPending) break;

        dispatch({
          type: "SET_PAGE_STATUS",
          payload: { pageId: nextPending.id, status: "processing" },
        });

        try {
          // Init/reinit worker (handles language change + dedup internally).
          // Progress callback is always updated so recognition events fire.
          await initWorker(language, (progress) => {
            dispatch({
              type: "SET_PAGE_PROGRESS",
              payload: { pageId: nextPending.id, progress },
            });
          });

          const result = await recognizeImage(nextPending.imageUrl);
          dispatch({
            type: "SET_PAGE_RESULT",
            payload: {
              pageId: nextPending.id,
              text: result.text,
              confidence: result.confidence,
            },
          });
        } catch (err) {
          dispatch({
            type: "SET_PAGE_ERROR",
            payload: {
              pageId: nextPending.id,
              errorMessage:
                err instanceof Error ? err.message : "OCR failed",
            },
          });
        }
      }
    } finally {
      processingRef.current = false;
      dispatch({ type: "SET_PROCESSING", payload: false });
    }
  }, []);

  // Trigger processing when new pending pages appear
  useEffect(() => {
    const hasPending = state.pages.some((p) => p.status === "pending");
    if (hasPending && !processingRef.current) {
      processQueue();
    }
  }, [state.pages, state.language, processQueue]);

  // Handle image files
  const addImageFile = useCallback((file: File, fileId: string) => {
    const imageUrl = URL.createObjectURL(file);
    const pageId = uid();
    objectUrlsRef.current.set(pageId, imageUrl);

    const img = new Image();
    img.onload = () => {
      const ocrFile: OcrFile = {
        id: fileId,
        name: file.name,
        type: "image",
        size: file.size,
        pageCount: 1,
        addedAt: Date.now(),
      };
      const ocrPage: OcrPage = {
        id: pageId,
        fileId,
        pageNumber: 0,
        imageUrl,
        originalImageUrl: imageUrl,
        width: img.naturalWidth,
        height: img.naturalHeight,
        status: "pending",
        progress: 0,
        text: "",
        confidence: 0,
        errorMessage: null,
      };
      dispatch({ type: "ADD_FILE", payload: ocrFile });
      dispatch({ type: "ADD_PAGES", payload: [ocrPage] });
    };
    img.onerror = () => {
      URL.revokeObjectURL(imageUrl);
      objectUrlsRef.current.delete(pageId);
    };
    img.src = imageUrl;
  }, []);

  // Handle PDF files — render pages then add as OcrPages
  const addPdfFile = useCallback(async (file: File, fileId: string) => {
    const ocrFile: OcrFile = {
      id: fileId,
      name: file.name,
      type: "pdf",
      size: file.size,
      pageCount: 0,
      addedAt: Date.now(),
    };
    dispatch({ type: "ADD_FILE", payload: ocrFile });
    setPdfRenderingCount((c) => c + 1);

    try {
      const renderedPages = await renderPdfPages(file);

      dispatch({
        type: "UPDATE_FILE_PAGE_COUNT",
        payload: { fileId, pageCount: renderedPages.length },
      });

      const ocrPages: OcrPage[] = renderedPages.map((rp) => {
        const pageId = uid();
        objectUrlsRef.current.set(pageId, rp.imageUrl);
        return {
          id: pageId,
          fileId,
          pageNumber: rp.pageNumber,
          imageUrl: rp.imageUrl,
          originalImageUrl: rp.imageUrl,
          width: rp.width,
          height: rp.height,
          status: "pending" as const,
          progress: 0,
          text: "",
          confidence: 0,
          errorMessage: null,
        };
      });

      dispatch({ type: "ADD_PAGES", payload: ocrPages });
    } catch (err) {
      dispatch({
        type: "SET_ERROR",
        payload: `Failed to render PDF "${file.name}": ${
          err instanceof Error ? err.message : "Unknown error"
        }`,
      });
    } finally {
      setPdfRenderingCount((c) => c - 1);
    }
  }, []);

  const handleFiles = useCallback(
    (files: File[]) => {
      for (const file of files) {
        const isImage = IMAGE_MIME_TYPES.has(file.type);
        const isPdf = file.type === "application/pdf";

        if (!isImage && !isPdf) continue;

        const fileId = uid();

        if (isImage) {
          addImageFile(file, fileId);
        }

        if (isPdf) {
          addPdfFile(file, fileId);
        }
      }
    },
    [addImageFile, addPdfFile],
  );

  const handleRemoveFile = useCallback(
    (fileId: string) => {
      const pagesToRemove = state.pages.filter((p) => p.fileId === fileId);
      for (const page of pagesToRemove) {
        const url = objectUrlsRef.current.get(page.id);
        if (url) {
          URL.revokeObjectURL(url);
          objectUrlsRef.current.delete(page.id);
        }
      }
      dispatch({ type: "REMOVE_FILE", payload: fileId });
    },
    [state.pages],
  );

  const handleClearAll = useCallback(() => {
    abortRef.current = true;
    objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    objectUrlsRef.current.clear();
    dispatch({ type: "CLEAR_ALL" });
  }, []);

  const handleReOcr = useCallback(async () => {
    abortRef.current = true;
    await terminateWorker();
    dispatch({ type: "RESET_ALL_PAGES_PENDING" });
  }, []);

  const handleApplyFiltersAndReOcr = useCallback(async () => {
    abortRef.current = true;
    await terminateWorker();

    const pages = pagesRef.current;
    const filters = state.filters;

    for (const page of pages) {
      // Revoke old filtered URL (only if it differs from original)
      if (page.imageUrl !== page.originalImageUrl) {
        URL.revokeObjectURL(page.imageUrl);
        objectUrlsRef.current.delete(page.id);
      }

      if (filtersAreDefault(filters)) {
        // Reset to original
        dispatch({
          type: "SET_PAGE_IMAGE_URL",
          payload: { pageId: page.id, imageUrl: page.originalImageUrl },
        });
        objectUrlsRef.current.set(page.id, page.originalImageUrl);
      } else {
        const filteredUrl = await applyFiltersToImage(
          page.originalImageUrl,
          filters,
        );
        dispatch({
          type: "SET_PAGE_IMAGE_URL",
          payload: { pageId: page.id, imageUrl: filteredUrl },
        });
        objectUrlsRef.current.set(page.id, filteredUrl);
      }
    }

    dispatch({ type: "RESET_ALL_PAGES_PENDING" });
  }, [state.filters]);

  const hasFiles = state.files.length > 0;
  const totalPages = state.pages.length;
  const donePages = state.pages.filter((p) => p.status === "done").length;
  const avgConfidence =
    donePages > 0
      ? Math.round(
          state.pages
            .filter((p) => p.status === "done")
            .reduce((sum, p) => sum + p.confidence, 0) / donePages,
        )
      : 0;

  // Per-page text view support
  const selectedPage = state.pages.find((p) => p.id === state.selectedPageId);
  const displayedText =
    state.viewMode === "combined"
      ? state.editedText
      : (selectedPage?.text ?? "");

  const handleTextChange = (value: string) => {
    if (state.viewMode === "combined") {
      dispatch({ type: "SET_EDITED_TEXT", payload: value });
    } else if (state.selectedPageId) {
      dispatch({
        type: "SET_PAGE_TEXT",
        payload: { pageId: state.selectedPageId, text: value },
      });
    }
  };

  // Drag-and-drop into file list
  const [fileListDragOver, setFileListDragOver] = useState(false);
  const fileListDragCounter = useRef(0);

  const handleFileListDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    fileListDragCounter.current++;
    if (e.dataTransfer.types.includes("Files")) {
      setFileListDragOver(true);
    }
  }, []);

  const handleFileListDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    fileListDragCounter.current--;
    if (fileListDragCounter.current === 0) {
      setFileListDragOver(false);
    }
  }, []);

  const handleFileListDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleFileListDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      fileListDragCounter.current = 0;
      setFileListDragOver(false);
      if (e.dataTransfer.files.length > 0) {
        handleFiles(Array.from(e.dataTransfer.files));
      }
    },
    [handleFiles],
  );

  // Image preview navigation
  const previewPage = state.pages.find((p) => p.id === previewPageId) ?? null;
  const previewIndex = previewPageId
    ? state.pages.findIndex((p) => p.id === previewPageId)
    : -1;
  const handlePreviewNavigate = useCallback(
    (direction: "prev" | "next") => {
      const pages = pagesRef.current;
      const idx = pages.findIndex((p) => p.id === previewPageId);
      if (idx === -1) return;
      const newIdx = direction === "prev" ? idx - 1 : idx + 1;
      if (newIdx >= 0 && newIdx < pages.length) {
        setPreviewPageId(pages[newIdx].id);
      }
    },
    [previewPageId],
  );

  // Empty state — full-width drop zone
  if (!hasFiles) {
    return (
      <>
        <FileUpload
          accept={INPUT_ACCEPT}
          multiple
          maxSizeMB={MAX_FILE_SIZE_MB}
          onFiles={handleFiles}
          className="py-20"
        >
          <ScanText className="mb-4 size-12 text-muted-foreground/50" />
          <p className="text-lg font-medium">
            Drop images or scanned PDFs here
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            PNG, JPG, TIFF, BMP, WebP, or PDF — up to {MAX_FILE_SIZE_MB}MB per
            file (max {MAX_PDF_PAGES} PDF pages)
          </p>
        </FileUpload>
        <ToolGuide sections={OCR_GUIDE_SECTIONS} />
      </>
    );
  }

  // Loaded state
  return (
    <>
    <div className="space-y-4">
      {/* Error banner */}
      {state.errorMessage && (
        <div className="rounded-lg border border-pink-500/30 bg-pink-500/10 px-4 py-2 text-sm text-pink-400">
          {state.errorMessage}
          <button
            className="ml-2 underline"
            onClick={() => dispatch({ type: "SET_ERROR", payload: null })}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => addFilesInputRef.current?.click()}
        >
          <Plus className="mr-1.5 size-4" />
          Add Files
        </Button>
        <input
          ref={addFilesInputRef}
          type="file"
          className="sr-only"
          accept={INPUT_ACCEPT}
          multiple
          onChange={(e) => {
            if (e.target.files) {
              handleFiles(Array.from(e.target.files));
              e.target.value = "";
            }
          }}
        />
        <Button variant="outline" size="sm" onClick={handleClearAll}>
          <Trash2 className="mr-1.5 size-4" />
          Clear All
        </Button>
        {donePages > 0 && !state.isProcessing && (
          <Button variant="outline" size="sm" onClick={handleReOcr}>
            <RotateCcw className="mr-1.5 size-4" />
            Re-OCR All
          </Button>
        )}
        <Button
          variant={state.showFilters ? "default" : "outline"}
          size="sm"
          onClick={() => dispatch({ type: "TOGGLE_FILTERS_PANEL" })}
        >
          <SlidersHorizontal className="mr-1.5 size-4" />
          Image Settings
        </Button>

        {/* Processing status */}
        {pdfRenderingCount > 0 && (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Loader2 className="size-3.5 animate-spin" />
            <span>Rendering PDF pages...</span>
          </div>
        )}
        {state.isProcessing && (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Loader2 className="size-3.5 animate-spin" />
            <span>
              OCR {donePages + 1} of {totalPages}...
            </span>
          </div>
        )}
        {!state.isProcessing && donePages > 0 && pdfRenderingCount === 0 && (
          <p className="text-sm text-brand">
            {donePages}/{totalPages} pages — {avgConfidence}% avg confidence
          </p>
        )}

        <div className="ml-auto flex items-center gap-2">
          <Languages className="size-4 text-muted-foreground" />
          <select
            value={state.language}
            onChange={(e) =>
              dispatch({
                type: "SET_LANGUAGE",
                payload: e.target.value as OcrLanguage,
              })
            }
            className="rounded-md border border-border bg-background px-2 py-1 text-sm"
          >
            {(
              Object.entries(LANGUAGE_LABELS) as [OcrLanguage, string][]
            ).map(([code, label]) => (
              <option key={code} value={code}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Image preprocessing filters */}
      {state.showFilters && (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="space-y-1.5">
              <span className="text-xs font-medium text-muted-foreground">
                Brightness ({state.filters.brightness}%)
              </span>
              <input
                type="range"
                min={0}
                max={200}
                step={5}
                value={state.filters.brightness}
                onChange={(e) =>
                  dispatch({
                    type: "SET_FILTERS",
                    payload: {
                      ...state.filters,
                      brightness: Number(e.target.value),
                    },
                  })
                }
                className="w-full accent-brand"
              />
            </label>
            <label className="space-y-1.5">
              <span className="text-xs font-medium text-muted-foreground">
                Contrast ({state.filters.contrast}%)
              </span>
              <input
                type="range"
                min={0}
                max={200}
                step={5}
                value={state.filters.contrast}
                onChange={(e) =>
                  dispatch({
                    type: "SET_FILTERS",
                    payload: {
                      ...state.filters,
                      contrast: Number(e.target.value),
                    },
                  })
                }
                className="w-full accent-brand"
              />
            </label>
            <label className="space-y-1.5">
              <span className="text-xs font-medium text-muted-foreground">
                Threshold ({state.filters.threshold === 0 ? "Off" : state.filters.threshold})
              </span>
              <input
                type="range"
                min={0}
                max={255}
                step={5}
                value={state.filters.threshold}
                onChange={(e) =>
                  dispatch({
                    type: "SET_FILTERS",
                    payload: {
                      ...state.filters,
                      threshold: Number(e.target.value),
                    },
                  })
                }
                className="w-full accent-brand"
              />
            </label>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleApplyFiltersAndReOcr}
              disabled={state.isProcessing || filtersAreDefault(state.filters)}
            >
              Apply & Re-OCR
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => dispatch({ type: "RESET_FILTERS" })}
              disabled={filtersAreDefault(state.filters)}
            >
              Reset
            </Button>
            {!filtersAreDefault(state.filters) && (
              <p className="text-xs text-muted-foreground">
                Thumbnails show a live preview. Click &quot;Apply & Re-OCR&quot; to process.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Two-panel layout */}
      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        {/* Left: File list */}
        <div
          className={`space-y-2 overflow-y-auto rounded-lg border p-3 transition-colors ${
            fileListDragOver
              ? "border-brand bg-brand/5"
              : "border-border"
          }`}
          style={{ maxHeight: "500px" }}
          onDragEnter={handleFileListDragEnter}
          onDragLeave={handleFileListDragLeave}
          onDragOver={handleFileListDragOver}
          onDrop={handleFileListDrop}
        >
          {state.files.map((file) => {
            const filePages = state.pages.filter(
              (p) => p.fileId === file.id,
            );
            return (
              <div
                key={file.id}
                className="rounded-md border border-border bg-card p-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-1.5">
                    <FileText className="size-3.5 shrink-0 text-muted-foreground" />
                    <p className="truncate text-sm font-medium">{file.name}</p>
                  </div>
                  <button
                    onClick={() => handleRemoveFile(file.id)}
                    className="shrink-0 text-muted-foreground hover:text-foreground"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
                {file.type === "pdf" && file.pageCount > 0 && (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {file.pageCount} page{file.pageCount !== 1 ? "s" : ""}
                  </p>
                )}
                {file.type === "pdf" && filePages.length === 0 && (
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Loader2 className="size-3 animate-spin" />
                    <span>Rendering pages...</span>
                  </div>
                )}
                {filePages.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {filePages.map((page) => (
                      <div
                        key={page.id}
                        onClick={() =>
                          dispatch({
                            type: "SELECT_PAGE",
                            payload: page.id,
                          })
                        }
                        className={`flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-xs transition-colors ${
                          state.selectedPageId === page.id
                            ? "bg-brand/10 text-brand"
                            : "text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        <div className="group/thumb relative size-8 shrink-0">
                          <img
                            src={page.originalImageUrl}
                            alt={`Page ${page.pageNumber + 1}`}
                            className="size-full rounded border border-border object-cover"
                            style={{
                              filter: filtersAreDefault(state.filters)
                                ? undefined
                                : getCssFilterString(state.filters),
                            }}
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewPageId(page.id);
                            }}
                            className="absolute inset-0 flex items-center justify-center rounded bg-black/50 opacity-0 transition-opacity group-hover/thumb:opacity-100"
                          >
                            <ZoomIn className="size-3.5 text-white" />
                          </button>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate">
                            {file.type === "pdf"
                              ? `Page ${page.pageNumber + 1}`
                              : file.name}
                          </p>
                          {page.status === "pending" && (
                            <p className="text-muted-foreground">Pending</p>
                          )}
                          {page.status === "processing" && (
                            <div className="mt-0.5">
                              <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
                                <div
                                  className="h-full rounded-full bg-brand transition-all"
                                  style={{ width: `${page.progress}%` }}
                                />
                              </div>
                            </div>
                          )}
                          {page.status === "done" && (
                            <p className="text-brand">
                              {Math.round(page.confidence)}% confidence
                            </p>
                          )}
                          {page.status === "error" && (
                            <p className="text-pink-400">
                              {page.errorMessage ?? "Error"}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          <p className="py-2 text-center text-xs text-muted-foreground/50">
            Drop files here to add more
          </p>
        </div>

        {/* Right: Text output */}
        <div className="flex flex-col rounded-lg border border-border">
          <div className="border-b border-border px-4 py-2">
            <div className="flex items-center justify-between">
              <Tabs
                value={state.viewMode}
                onValueChange={(v: string) =>
                  dispatch({ type: "SET_VIEW_MODE", payload: v as TextViewMode })
                }
              >
                <TabsList variant="line">
                  <TabsTrigger value="combined">All Pages</TabsTrigger>
                  <TabsTrigger value="page">Selected Page</TabsTrigger>
                </TabsList>
              </Tabs>
              {displayedText && (
                <p className="text-xs text-muted-foreground">
                  {displayedText.split(/\s+/).filter(Boolean).length} words
                  {" / "}
                  {displayedText.length} chars
                </p>
              )}
            </div>
          </div>

          {/* Amber info bar: combined text was manually edited */}
          {state.viewMode === "page" && state.isTextEdited && (
            <div className="flex items-center gap-2 border-b border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs text-amber-400">
              <span>Combined text was manually edited.</span>
              <button
                className="underline"
                onClick={() =>
                  dispatch({ type: "REBUILD_COMBINED_FROM_PAGES" })
                }
              >
                Rebuild from pages
              </button>
            </div>
          )}

          {/* Page mode: no page selected */}
          {state.viewMode === "page" && !selectedPage && (
            <div className="flex flex-1 items-center justify-center py-20">
              <p className="text-sm text-muted-foreground">
                Select a page from the sidebar to view its text.
              </p>
            </div>
          )}

          {/* Page mode: selected page is pending/processing */}
          {state.viewMode === "page" &&
            selectedPage &&
            (selectedPage.status === "pending" ||
              selectedPage.status === "processing") && (
              <div className="flex flex-1 items-center justify-center py-20">
                <div className="text-center">
                  <Loader2 className="mx-auto mb-3 size-8 animate-spin text-brand" />
                  <p className="text-sm text-muted-foreground">
                    {selectedPage.status === "pending"
                      ? "Waiting to process..."
                      : "Extracting text..."}
                  </p>
                </div>
              </div>
            )}

          {/* Page mode: selected page errored */}
          {state.viewMode === "page" &&
            selectedPage &&
            selectedPage.status === "error" && (
              <div className="flex flex-1 items-center justify-center py-20">
                <p className="text-sm text-pink-400">
                  {selectedPage.errorMessage ?? "OCR failed for this page"}
                </p>
              </div>
            )}

          {/* Page mode: selected page done — editable text */}
          {state.viewMode === "page" &&
            selectedPage &&
            selectedPage.status === "done" && (
              <textarea
                value={selectedPage.text}
                onChange={(e) => handleTextChange(e.target.value)}
                placeholder="No text detected on this page."
                className="min-h-[400px] flex-1 resize-none bg-transparent px-4 py-3 text-sm leading-relaxed focus:outline-none"
              />
            )}

          {/* Combined mode: loading spinner when no text yet */}
          {state.viewMode === "combined" &&
            (state.isProcessing || pdfRenderingCount > 0) &&
            !state.editedText && (
              <div className="flex flex-1 items-center justify-center py-20">
                <div className="text-center">
                  <Loader2 className="mx-auto mb-3 size-8 animate-spin text-brand" />
                  <p className="text-sm text-muted-foreground">
                    {pdfRenderingCount > 0
                      ? "Rendering PDF pages..."
                      : "Extracting text..."}
                  </p>
                </div>
              </div>
            )}

          {/* Combined mode: editable text */}
          {state.viewMode === "combined" &&
            ((!state.isProcessing && pdfRenderingCount === 0) ||
              state.editedText) && (
              <textarea
                value={state.editedText}
                onChange={(e) => handleTextChange(e.target.value)}
                placeholder="Extracted text will appear here..."
                className="min-h-[400px] flex-1 resize-none bg-transparent px-4 py-3 text-sm leading-relaxed focus:outline-none"
              />
            )}
        </div>
      </div>

      {/* Export bar */}
      <ExportPanel
        text={displayedText}
        format={state.exportFormat}
        onFormatChange={(f: ExportFormat) =>
          dispatch({ type: "SET_EXPORT_FORMAT", payload: f })
        }
        disabled={state.isProcessing || pdfRenderingCount > 0}
        defaultFilename={
          state.files.length === 1
            ? state.files[0].name.replace(/\.[^.]+$/, "")
            : "ocr-result"
        }
      />
    </div>
    <ImagePreview
      page={previewPage}
      open={previewPageId !== null}
      onClose={() => setPreviewPageId(null)}
      onNavigate={handlePreviewNavigate}
      hasPrev={previewIndex > 0}
      hasNext={previewIndex < state.pages.length - 1}
    />
    <ToolGuide sections={OCR_GUIDE_SECTIONS} />
    </>
  );
}
