"use client";

import type { Dispatch } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ExportButton } from "@/components/shared/export-button";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Printer, FilePlus } from "lucide-react";
import { InvoiceSettingsFields } from "./invoice-settings";
import { CompanyFields } from "./company-fields";
import { ClientFields } from "./client-fields";
import { LineItemsEditor } from "./line-items-editor";
import { InvoiceSummary } from "./invoice-summary";
import { NotesFields } from "./notes-fields";
import { TemplateSelector } from "./template-selector";
import { ColorPicker } from "./color-picker";
import { LogoUpload } from "./logo-upload";
import type {
  InvoiceData,
  InvoiceAction,
  InvoiceCalculations,
} from "@/lib/invoice/types";

interface InvoiceFormProps {
  state: InvoiceData;
  calculations: InvoiceCalculations;
  dispatch: Dispatch<InvoiceAction>;
  onNewInvoice: () => void;
}

export function InvoiceForm({
  state,
  calculations,
  dispatch,
  onNewInvoice,
}: InvoiceFormProps) {
  const handleDownloadPdf = () => {
    // Wired in Stage 8
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="items">Items</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="style">Style</TabsTrigger>
        </TabsList>

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
      <div className="flex items-center gap-3">
        <ExportButton
          onClick={handleDownloadPdf}
          label="Download PDF"
          disabled={!state.company.name && !state.client.name}
        />
        <Button variant="outline" onClick={handlePrint}>
          <Printer className="size-4" data-icon="inline-start" />
          Print
        </Button>
        <div className="flex-1" />
        <Button variant="ghost" onClick={onNewInvoice}>
          <FilePlus className="size-4" data-icon="inline-start" />
          New Invoice
        </Button>
      </div>
    </div>
  );
}
