"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  History,
  Trash2,
  Copy,
  FileDown,
  Upload,
  Download,
  Save,
  FileText,
  Loader2,
} from "lucide-react";
import type { SavedPayStub, PayStubData } from "@/lib/pay-stub/types";
import {
  loadHistory,
  saveToHistory,
  deleteFromHistory,
  duplicateFromHistory,
  exportStubJson,
  exportAllJson,
  parseImportedJson,
  saveDefaults,
} from "@/lib/pay-stub/storage";
import { formatCurrency } from "@/lib/pay-stub/format";
import { calculatePayStub } from "@/lib/pay-stub/calculations";
import { generateBulkPdf } from "./pdf-export";

interface PayStubHistoryProps {
  currentState: PayStubData;
  onLoad: (data: PayStubData) => void;
}

export function PayStubHistory({
  currentState,
  onLoad,
}: PayStubHistoryProps) {
  const [open, setOpen] = useState(false);
  const [history, setHistory] = useState<SavedPayStub[]>([]);
  const [importError, setImportError] = useState<string | null>(null);
  const [bulkPdfError, setBulkPdfError] = useState<string | null>(null);
  const [bulkPdfLoading, setBulkPdfLoading] = useState(false);
  const [defaultsSaved, setDefaultsSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const refreshHistory = useCallback(() => {
    setHistory(loadHistory());
  }, []);

  useEffect(() => {
    if (open) {
      refreshHistory();
      setImportError(null);
      setBulkPdfError(null);
      setDefaultsSaved(false);
    }
  }, [open, refreshHistory]);

  const handleSave = useCallback(() => {
    saveToHistory(currentState);
    refreshHistory();
  }, [currentState, refreshHistory]);

  const handleLoad = useCallback(
    (inv: SavedPayStub) => {
      onLoad(inv.data);
      setOpen(false);
    },
    [onLoad]
  );

  const handleDuplicate = useCallback(
    (id: string) => {
      const cloned = duplicateFromHistory(id);
      if (cloned) {
        onLoad(cloned);
        setOpen(false);
      }
    },
    [onLoad]
  );

  const handleDelete = useCallback(
    (id: string) => {
      deleteFromHistory(id);
      refreshHistory();
    },
    [refreshHistory]
  );

  const handleExportCurrent = useCallback(() => {
    const json = exportStubJson(currentState);
    const employeeName = currentState.employee.name
      ? currentState.employee.name.replace(/[^a-zA-Z0-9]/g, "_")
      : "paystub";
    downloadJson(json, `${employeeName}-${currentState.payPeriod.payDate}.json`);
  }, [currentState]);

  const handleExportAll = useCallback(() => {
    const all = loadHistory();
    if (all.length === 0) return;
    const json = exportAllJson(all);
    downloadJson(json, "paystubs-export.json");
  }, []);

  const handleImport = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setImportError(null);
      const reader = new FileReader();
      reader.onload = () => {
        const result = parseImportedJson(reader.result as string);
        if (!result.success) {
          setImportError(result.error);
        } else if (result.stubs.length > 0) {
          onLoad(result.stubs[0].data);
          setOpen(false);
        }
      };
      reader.readAsText(file);
      // Reset so the same file can be re-selected
      e.target.value = "";
    },
    [onLoad]
  );

  const handleSaveDefaults = useCallback(() => {
    saveDefaults(currentState);
    setDefaultsSaved(true);
  }, [currentState]);

  const handleBulkPdf = useCallback(async () => {
    setBulkPdfLoading(true);
    setBulkPdfError(null);
    try {
      const all = loadHistory();
      if (all.length === 0) return;
      const result = await generateBulkPdf(all);
      if (!result.success) {
        setBulkPdfError(result.errors.join("; "));
      }
    } catch {
      setBulkPdfError("Failed to generate bulk PDF. Please try again.");
    } finally {
      setBulkPdfLoading(false);
    }
  }, []);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button variant="outline" size="sm">
            <History className="size-4" data-icon="inline-start" />
            History
          </Button>
        }
      />
      <SheetContent side="right" className="flex flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Pay Stub History</SheetTitle>
          <SheetDescription>
            Save, load, or duplicate past pay stubs.
          </SheetDescription>
        </SheetHeader>

        <div className="px-4">
          <Button onClick={handleSave} size="sm" className="w-full">
            <FileDown className="size-4" data-icon="inline-start" />
            Save Current Stub
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {history.length === 0 ? (
            <p className="mt-6 text-center text-sm text-muted-foreground">
              No saved pay stubs yet. Click &ldquo;Save Current Stub&rdquo; to
              save your first one.
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {history.map((stub) => (
                <HistoryRow
                  key={stub.id}
                  stub={stub}
                  onLoad={handleLoad}
                  onDuplicate={handleDuplicate}
                  onDelete={handleDelete}
                />
              ))}
            </ul>
          )}
        </div>

        <SheetFooter>
          <Separator />
          {importError && (
            <p className="text-xs text-pink-400">{importError}</p>
          )}
          {bulkPdfError && (
            <p className="text-xs text-pink-400">{bulkPdfError}</p>
          )}
          <TooltipProvider>
            <div className="flex flex-wrap gap-2">
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExportCurrent}
                    >
                      <Download className="size-3.5" data-icon="inline-start" />
                      Export JSON
                    </Button>
                  }
                />
                <TooltipContent side="bottom">
                  Download this pay stub as a JSON file you can back up or share
                </TooltipContent>
              </Tooltip>
              {history.length > 0 && (
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleExportAll}
                      >
                        <Download className="size-3.5" data-icon="inline-start" />
                        Export All
                      </Button>
                    }
                  />
                  <TooltipContent side="bottom">
                    Download all saved pay stubs as a single JSON file
                  </TooltipContent>
                </Tooltip>
              )}
              {history.length > 0 && (
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleBulkPdf}
                        disabled={bulkPdfLoading}
                      >
                        {bulkPdfLoading ? (
                          <Loader2
                            className="size-3.5 animate-spin"
                            data-icon="inline-start"
                          />
                        ) : (
                          <FileText
                            className="size-3.5"
                            data-icon="inline-start"
                          />
                        )}
                        Download All PDF
                      </Button>
                    }
                  />
                  <TooltipContent side="bottom">
                    Download all saved pay stubs as a single multi-page PDF
                  </TooltipContent>
                </Tooltip>
              )}
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="size-3.5" data-icon="inline-start" />
                      Import JSON
                    </Button>
                  }
                />
                <TooltipContent side="bottom">
                  Load a pay stub from a previously exported JSON file
                </TooltipContent>
              </Tooltip>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleImport}
              />
            </div>
          </TooltipProvider>
          <Separator />
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={handleSaveDefaults}
          >
            <Save className="size-3.5" data-icon="inline-start" />
            {defaultsSaved
              ? "Defaults Saved!"
              : "Save Employer as Default"}
          </Button>
          <p className="text-xs text-muted-foreground">
            New stubs will pre-fill your employer info, template, accent color,
            and pay type.
          </p>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function downloadJson(json: string, filename: string): void {
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function HistoryRow({
  stub,
  onLoad,
  onDuplicate,
  onDelete,
}: {
  stub: SavedPayStub;
  onLoad: (stub: SavedPayStub) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const { data } = stub;
  const calcs = calculatePayStub(data.earnings, data.deductions);
  const dateLabel = new Date(stub.updatedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <li className="group rounded-lg border border-border p-3">
      <button
        type="button"
        className="w-full text-left"
        onClick={() => onLoad(stub)}
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium truncate">
            {data.employee.name || "Unnamed Employee"}
          </span>
          <span className="text-sm font-medium tabular-nums">
            {formatCurrency(calcs.netPay)}
          </span>
        </div>
        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="truncate">
            {data.employer.companyName || "No employer"}
          </span>
          <span className="shrink-0">&middot;</span>
          <span className="shrink-0">{dateLabel}</span>
          <span className="shrink-0">&middot;</span>
          <span className="shrink-0">
            {data.payPeriod.payDate}
          </span>
        </div>
      </button>
      <div className="mt-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => onDuplicate(stub.id)}
          aria-label="Duplicate pay stub for new period"
        >
          <Copy className="size-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => onDelete(stub.id)}
          aria-label="Delete pay stub"
          className="text-pink-400 hover:text-pink-500"
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>
    </li>
  );
}
