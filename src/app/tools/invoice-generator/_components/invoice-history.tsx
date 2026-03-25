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
} from "lucide-react";
import type { SavedInvoice, InvoiceData } from "@/lib/invoice/types";
import { STATUS_OPTIONS } from "@/lib/invoice/constants";
import {
  loadHistory,
  saveToHistory,
  deleteFromHistory,
  duplicateFromHistory,
  saveInvoiceNumber,
  exportInvoiceJson,
  exportAllJson,
  parseImportedJson,
  saveDefaults,
} from "@/lib/invoice/storage";
import { formatCurrency } from "@/lib/invoice/format";
import { calculateInvoice } from "@/lib/invoice/calculations";

interface InvoiceHistoryProps {
  currentState: InvoiceData;
  onLoad: (data: InvoiceData) => void;
}

export function InvoiceHistory({ currentState, onLoad }: InvoiceHistoryProps) {
  const [open, setOpen] = useState(false);
  const [history, setHistory] = useState<SavedInvoice[]>([]);
  const [importError, setImportError] = useState<string | null>(null);
  const [defaultsSaved, setDefaultsSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const refreshHistory = useCallback(() => {
    setHistory(loadHistory());
  }, []);

  useEffect(() => {
    if (open) {
      refreshHistory();
      setImportError(null);
      setDefaultsSaved(false);
    }
  }, [open, refreshHistory]);

  const handleSave = useCallback(() => {
    saveToHistory(currentState);
    saveInvoiceNumber(currentState.settings.invoiceNumber);
    refreshHistory();
  }, [currentState, refreshHistory]);

  const handleLoad = useCallback(
    (inv: SavedInvoice) => {
      onLoad(inv.data);
      setOpen(false);
    },
    [onLoad]
  );

  const handleDuplicate = useCallback(
    (id: string) => {
      const cloned = duplicateFromHistory(id);
      if (cloned) {
        saveInvoiceNumber(cloned.settings.invoiceNumber);
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
    const json = exportInvoiceJson(currentState);
    downloadJson(json, `${currentState.settings.invoiceNumber}.json`);
  }, [currentState]);

  const handleExportAll = useCallback(() => {
    const all = loadHistory();
    if (all.length === 0) return;
    const json = exportAllJson(all);
    downloadJson(json, "invoices-export.json");
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
        } else if (result.invoices.length > 0) {
          onLoad(result.invoices[0].data);
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
          <SheetTitle>Invoice History</SheetTitle>
          <SheetDescription>
            Save, load, or duplicate past invoices.
          </SheetDescription>
        </SheetHeader>

        <div className="px-4">
          <Button onClick={handleSave} size="sm" className="w-full">
            <FileDown className="size-4" data-icon="inline-start" />
            Save Current Invoice
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {history.length === 0 ? (
            <p className="mt-6 text-center text-sm text-muted-foreground">
              No saved invoices yet. Click &ldquo;Save Current Invoice&rdquo; to
              save your first one.
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {history.map((inv) => (
                <HistoryRow
                  key={inv.id}
                  inv={inv}
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
            <p className="text-xs text-destructive">{importError}</p>
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
                  Download this invoice as a JSON file you can back up or share
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
                    Download all saved invoices as a single JSON file
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
                  Load an invoice from a previously exported JSON file
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
            {defaultsSaved ? "Defaults Saved!" : "Save Company as Default"}
          </Button>
          <p className="text-xs text-muted-foreground">
            New invoices will pre-fill your company info, currency, tax rate, template, and accent color.
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
  inv,
  onLoad,
  onDuplicate,
  onDelete,
}: {
  inv: SavedInvoice;
  onLoad: (inv: SavedInvoice) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const { data } = inv;
  const calcs = calculateInvoice(data.lineItems, data.settings);
  const statusOpt = STATUS_OPTIONS.find((o) => o.value === data.status);
  const dateLabel = new Date(inv.updatedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <li className="group rounded-lg border border-border p-3">
      <button
        type="button"
        className="w-full text-left"
        onClick={() => onLoad(inv)}
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">
            {data.settings.invoiceNumber}
          </span>
          <span className="text-sm font-medium tabular-nums">
            {formatCurrency(calcs.grandTotal, data.settings.currency)}
          </span>
        </div>
        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="truncate">
            {data.client.name || "No client"}
          </span>
          <span className="shrink-0">&middot;</span>
          <span className="shrink-0">{dateLabel}</span>
          {statusOpt && (
            <>
              <span className="shrink-0">&middot;</span>
              <span className="flex items-center gap-1">
                <span
                  className="inline-block size-1.5 rounded-full"
                  style={{ backgroundColor: statusOpt.color }}
                />
                {statusOpt.label}
              </span>
            </>
          )}
        </div>
      </button>
      <div className="mt-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => onDuplicate(inv.id)}
          aria-label="Duplicate invoice"
        >
          <Copy className="size-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => onDelete(inv.id)}
          aria-label="Delete invoice"
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>
    </li>
  );
}
