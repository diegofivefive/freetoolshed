"use client";

import { type Dispatch, useState, useCallback } from "react";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { ExportButton } from "@/components/shared/export-button";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Printer,
  FilePlus,
  Loader2,
  CircleAlert,
  X,
} from "lucide-react";
import { PayPeriodFields } from "./pay-period-fields";
import { EmployerFields } from "./employer-fields";
import { EmployeeFields } from "./employee-fields";
import { EarningsEditor } from "./earnings-editor";
import { DeductionsEditor } from "./deductions-editor";
import { SummaryPanel } from "./summary-panel";
import { TemplateSelector } from "./template-selector";
import { ColorPicker } from "./color-picker";
import { LogoUpload } from "./logo-upload";
import { PayStubHistory } from "./pay-stub-history";
import { generatePayStubPdf, printPayStubPdf } from "./pdf-export";
import type {
  PayStubData,
  PayStubAction,
  PayStubCalculations,
} from "@/lib/pay-stub/types";

interface PayStubFormProps {
  state: PayStubData;
  calculations: PayStubCalculations;
  dispatch: Dispatch<PayStubAction>;
  onNewStub: () => void;
  onLoadFromHistory: (data: PayStubData) => void;
}

export function PayStubForm({
  state,
  calculations,
  dispatch,
  onNewStub,
  onLoadFromHistory,
}: PayStubFormProps) {
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfErrors, setPdfErrors] = useState<string[]>([]);

  const handleDownloadPdf = useCallback(async () => {
    setPdfLoading(true);
    setPdfErrors([]);
    try {
      const result = await generatePayStubPdf(state, calculations);
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
      const result = await printPayStubPdf(state, calculations);
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
        <div className="flex items-center gap-3">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
            <TabsTrigger value="deductions">Deductions</TabsTrigger>
            <TabsTrigger value="style">Style</TabsTrigger>
          </TabsList>
          <div className="flex-1" />
          <Button variant="outline" size="sm" onClick={onNewStub}>
            <FilePlus className="size-4" data-icon="inline-start" />
            New Stub
          </Button>
        </div>

        <TabsContent value="details">
          <div className="space-y-6 py-4">
            <PayPeriodFields
              payPeriod={state.payPeriod}
              dispatch={dispatch}
            />
            <Separator />
            <EmployerFields employer={state.employer} dispatch={dispatch} />
            <Separator />
            <EmployeeFields
              employee={state.employee}
              deductions={state.deductions}
              dispatch={dispatch}
            />
          </div>
        </TabsContent>

        <TabsContent value="earnings">
          <div className="space-y-6 py-4">
            <EarningsEditor
              earnings={state.earnings}
              payType={state.settings.payType}
              dispatch={dispatch}
            />
            <SummaryPanel calculations={calculations} />
          </div>
        </TabsContent>

        <TabsContent value="deductions">
          <div className="space-y-6 py-4">
            <DeductionsEditor
              deductions={state.deductions}
              dispatch={dispatch}
            />
            <SummaryPanel calculations={calculations} />
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
              logoUrl={state.employer.logoUrl}
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
          disabled={
            pdfLoading ||
            (!state.employer.companyName && !state.employee.name)
          }
        />
        <Button variant="outline" onClick={handlePrint} disabled={pdfLoading}>
          {pdfLoading ? (
            <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
          ) : (
            <Printer className="size-4" data-icon="inline-start" />
          )}
          Print
        </Button>
        <div className="flex-1" />
        <PayStubHistory
          currentState={state}
          onLoad={onLoadFromHistory}
        />
      </div>
    </div>
  );
}
