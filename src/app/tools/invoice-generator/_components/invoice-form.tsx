"use client";

import { type Dispatch, useState, useCallback } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ExportButton } from "@/components/shared/export-button";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Printer, FilePlus, Loader2, CircleAlert, X, Eye, EyeOff } from "lucide-react";
import { STATUS_OPTIONS } from "@/lib/invoice/constants";
import { InvoiceSettingsFields } from "./invoice-settings";
import { CompanyFields } from "./company-fields";
import { ClientFields } from "./client-fields";
import { LineItemsEditor } from "./line-items-editor";
import { InvoiceSummary } from "./invoice-summary";
import { NotesFields } from "./notes-fields";
import { TemplateSelector } from "./template-selector";
import { ColorPicker } from "./color-picker";
import { LogoUpload } from "./logo-upload";
import { InvoiceHistory } from "./invoice-history";
import { generateInvoicePdf, printInvoicePdf } from "./pdf-export";
import type {
  InvoiceData,
  InvoiceAction,
  InvoiceCalculations,
  InvoiceStatus,
} from "@/lib/invoice/types";

interface InvoiceFormProps {
  state: InvoiceData;
  calculations: InvoiceCalculations;
  dispatch: Dispatch<InvoiceAction>;
  onNewInvoice: () => void;
  showPreview: boolean;
  onTogglePreview: () => void;
}

export function InvoiceForm({
  state,
  calculations,
  dispatch,
  onNewInvoice,
  showPreview,
  onTogglePreview,
}: InvoiceFormProps) {
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfErrors, setPdfErrors] = useState<string[]>([]);

  const handleDownloadPdf = useCallback(async () => {
    setPdfLoading(true);
    setPdfErrors([]);
    try {
      const result = await generateInvoicePdf(state, calculations);
      if (!result.success) {
        setPdfErrors(result.errors);
      }
    } catch {
      setPdfErrors(["Failed to generate PDF. Please try again."]);
    } finally {
      setPdfLoading(false);
    }
  }, [state, calculations]);

  const handlePrint = useCallback(async () => {
    setPdfLoading(true);
    setPdfErrors([]);
    try {
      const result = await printInvoicePdf(state, calculations);
      if (!result.success) {
        setPdfErrors(result.errors);
      }
    } catch {
      setPdfErrors(["Failed to generate printable PDF. Please try again."]);
    } finally {
      setPdfLoading(false);
    }
  }, [state, calculations]);

  return (
    <div className="space-y-4">
      <Tabs defaultValue="details">
        <div className="flex items-center gap-2">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="items">Items</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="style">Style</TabsTrigger>
          </TabsList>
          <Button variant="outline" size="sm" onClick={onNewInvoice}>
            <FilePlus className="size-4" data-icon="inline-start" />
            New Invoice
          </Button>
        </div>
        <div className="mt-2">
          <Button
            variant={showPreview ? "default" : "outline"}
            size="sm"
            onClick={onTogglePreview}
            className="gap-1.5"
          >
            {showPreview ? (
              <Eye className="size-4" />
            ) : (
              <EyeOff className="size-4" />
            )}
            Preview
          </Button>
        </div>

        <TabsContent value="details">
          <div className="space-y-6 py-4">
            <InvoiceSettingsFields
              settings={state.settings}
              dispatch={dispatch}
            />
            <Separator />
            <CompanyFields company={state.company} dispatch={dispatch} />
            <Separator />
            <ClientFields client={state.client} dispatch={dispatch} />
          </div>
        </TabsContent>

        <TabsContent value="items">
          <div className="space-y-6 py-4">
            <LineItemsEditor
              lineItems={state.lineItems}
              lineItemTotals={calculations.lineItemTotals}
              currency={state.settings.currency}
              dispatch={dispatch}
            />
            <InvoiceSummary
              settings={state.settings}
              calculations={calculations}
              dispatch={dispatch}
            />
          </div>
        </TabsContent>

        <TabsContent value="notes">
          <div className="py-4">
            <NotesFields
              notes={state.notes}
              terms={state.terms}
              paymentLink={state.paymentLink}
              dispatch={dispatch}
            />
          </div>
        </TabsContent>

        <TabsContent value="style">
          <div className="space-y-6 py-4">
            <TemplateSelector
              template={state.settings.template}
              accentColor={state.settings.accentColor}
              dispatch={dispatch}
            />
            <Separator />
            <ColorPicker
              accentColor={state.settings.accentColor}
              dispatch={dispatch}
            />
            <Separator />
            <LogoUpload
              logoUrl={state.company.logoUrl}
              dispatch={dispatch}
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Toolbar */}
      <Separator />
      {pdfErrors.length > 0 && (
        <div className="flex items-start gap-3 rounded-lg border border-pink-400/30 bg-pink-500/5 px-4 py-3">
          <CircleAlert className="mt-0.5 size-4 shrink-0 text-pink-400" />
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium text-pink-400">
              Please fix before exporting:
            </p>
            <ul className="list-inside list-disc text-sm text-pink-400/80">
              {pdfErrors.map((err) => (
                <li key={err}>{err}</li>
              ))}
            </ul>
          </div>
          <button
            type="button"
            onClick={() => setPdfErrors([])}
            className="shrink-0 rounded p-0.5 text-pink-400/60 hover:text-pink-400"
          >
            <X className="size-4" />
          </button>
        </div>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <ExportButton
          onClick={handleDownloadPdf}
          label={pdfLoading ? "Generating..." : "Download PDF"}
          disabled={pdfLoading || (!state.company.name && !state.client.name)}
        />
        <Button variant="outline" onClick={handlePrint} disabled={pdfLoading}>
          {pdfLoading ? (
            <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
          ) : (
            <Printer className="size-4" data-icon="inline-start" />
          )}
          Print
        </Button>
        <InvoiceHistory
          currentState={state}
          onLoad={(data) => dispatch({ type: "LOAD_DRAFT", payload: data })}
        />
        <div className="flex-1" />
        <Select
          value={state.status}
          onValueChange={(val) => {
            if (val) dispatch({ type: "SET_STATUS", payload: val as InvoiceStatus });
          }}
        >
          <SelectTrigger className="w-32">
            <span
              className="mr-1.5 inline-block size-2 rounded-full"
              style={{
                backgroundColor:
                  STATUS_OPTIONS.find((o) => o.value === state.status)?.color ??
                  "#a1a1aa",
              }}
            />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                <span className="flex items-center gap-2">
                  <span
                    className="inline-block size-2 rounded-full"
                    style={{ backgroundColor: opt.color }}
                  />
                  {opt.label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
