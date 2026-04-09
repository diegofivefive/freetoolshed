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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/shared/file-upload";
import { ocrReducer } from "@/lib/ocr/reducer";
import {
  INITIAL_OCR_STATE,
  INPUT_ACCEPT,
  MAX_FILE_SIZE_MB,
  MAX_PDF_PAGES,
  IMAGE_MIME_TYPES,
  LANGUAGE_LABELS,
} from "@/lib/ocr/constants";
import { loadPrefs, savePrefs } from "@/lib/ocr/storage";
import {
  initWorker,
  recognizeImage,
  terminateWorker,
  getWorkerLanguage,
} from "@/lib/ocr/ocr-engine";
import { renderPdfPages } from "@/lib/ocr/pdf-renderer";
import { ExportPanel } from "./export-panel";
import { ToolGuide } from "@/components/shared/tool-guide";
import type { ToolGuideSection } from "@/components/shared/tool-guide";
import type { OcrFile, OcrPage, OcrLanguage, ExportFormat } from "@/lib/ocr/types";
import type { SearchablePdfPage } from "@/lib/ocr/export";

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

        // Init or reinit worker if language changed
        if (getWorkerLanguage() !== language) {
          dispatch({ type: "SET_WORKER_READY", payload: false });
          await initWorker(language);
          dispatch({ type: "SET_WORKER_READY", payload: true });
        }

        dispatch({
          type: "SET_PAGE_STATUS",
          payload: { pageId: nextPending.id, status: "processing" },
        });

        try {
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

  const handleReOcr = useCallback(() => {
    // Abort current processing, terminate worker (forces reinit with current language)
    abortRef.current = true;
    terminateWorker();
    // Small delay to let abort take effect, then reset all pages to pending
    setTimeout(() => {
      dispatch({ type: "RESET_ALL_PAGES_PENDING" });
    }, 100);
  }, []);

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

  // Build searchable PDF page data for export (only done pages with images)
  const searchablePdfPages: SearchablePdfPage[] = state.pages
    .filter((p) => p.status === "done")
    .map((p) => ({
      imageUrl: p.imageUrl,
      width: p.width,
      height: p.height,
      text: p.text,
    }));

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

      {/* Two-panel layout */}
      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        {/* Left: File list */}
        <div
          className="space-y-2 overflow-y-auto rounded-lg border border-border p-3"
          style={{ maxHeight: "500px" }}
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
                        <img
                          src={page.imageUrl}
                          alt={`Page ${page.pageNumber + 1}`}
                          className="size-8 shrink-0 rounded border border-border object-cover"
                        />
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
        </div>

        {/* Right: Text output */}
        <div className="flex flex-col rounded-lg border border-border">
          <div className="border-b border-border px-4 py-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Extracted Text</p>
              {state.editedText && (
                <p className="text-xs text-muted-foreground">
                  {state.editedText.split(/\s+/).filter(Boolean).length} words
                  {" / "}
                  {state.editedText.length} chars
                </p>
              )}
            </div>
          </div>
          {(state.isProcessing || pdfRenderingCount > 0) &&
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
          {((!state.isProcessing && pdfRenderingCount === 0) ||
            state.editedText) && (
            <textarea
              value={state.editedText}
              onChange={(e) =>
                dispatch({
                  type: "SET_EDITED_TEXT",
                  payload: e.target.value,
                })
              }
              placeholder="Extracted text will appear here..."
              className="min-h-[400px] flex-1 resize-none bg-transparent px-4 py-3 text-sm leading-relaxed focus:outline-none"
            />
          )}
        </div>
      </div>

      {/* Export bar */}
      <ExportPanel
        text={state.editedText}
        format={state.exportFormat}
        onFormatChange={(f: ExportFormat) =>
          dispatch({ type: "SET_EXPORT_FORMAT", payload: f })
        }
        pages={searchablePdfPages}
        disabled={state.isProcessing || pdfRenderingCount > 0}
      />
    </div>
    <ToolGuide sections={OCR_GUIDE_SECTIONS} />
    </>
  );
}
