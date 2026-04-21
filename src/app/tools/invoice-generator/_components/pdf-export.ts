import type { InvoiceData, InvoiceCalculations } from "@/lib/invoice/types";
import type { InvoiceValidationError } from "@/lib/invoice/schema";
import { validateInvoice } from "@/lib/invoice/schema";
import { saveInvoiceNumber } from "@/lib/invoice/storage";

export interface PdfExportResult {
  success: true;
}

export interface PdfExportError {
  success: false;
  errors: string[];
}

const FIELD_LABELS: Record<string, string> = {
  "company.name": "Company Name",
  "client.name": "Client Name",
  "settings.invoiceNumber": "Invoice Number",
  "settings.invoiceDate": "Invoice Date",
  "settings.dueDate": "Due Date",
  lineItems: "Line Items",
};

function humanizeErrors(errors: InvoiceValidationError[]): string[] {
  return errors.map((e) => {
    // Match line item field paths like "lineItems.0.description"
    const lineItemMatch = e.field.match(/^lineItems\.(\d+)\.(.+)$/);
    if (lineItemMatch) {
      const row = Number(lineItemMatch[1]) + 1;
      return `Line item ${row}: ${e.message}`;
    }

    const label = FIELD_LABELS[e.field];
    if (label) {
      return `${label} — ${e.message}`;
    }

    return e.message;
  });
}

type JsPDFDoc = Awaited<ReturnType<typeof buildInvoiceDoc>>;

async function buildInvoiceDoc(
  data: InvoiceData,
  calculations: InvoiceCalculations
) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  switch (data.settings.template) {
    case "modern": {
      const { renderModernTemplate } = await import(
        "@/lib/invoice/templates/modern"
      );
      await renderModernTemplate(doc, data, calculations);
      break;
    }
    case "classic": {
      const { renderClassicTemplate } = await import(
        "@/lib/invoice/templates/classic"
      );
      await renderClassicTemplate(doc, data, calculations);
      break;
    }
    case "compact": {
      const { renderCompactTemplate } = await import(
        "@/lib/invoice/templates/compact"
      );
      await renderCompactTemplate(doc, data, calculations);
      break;
    }
  }

  return doc;
}

function buildFilename(data: InvoiceData): string {
  const invoiceNum = data.settings.invoiceNumber || "invoice";
  const clientName = data.client.name
    ? `-${data.client.name.replace(/[^a-zA-Z0-9]/g, "_")}`
    : "";
  return `${invoiceNum}${clientName}.pdf`;
}

export async function generateInvoicePdf(
  data: InvoiceData,
  calculations: InvoiceCalculations
): Promise<PdfExportResult | PdfExportError> {
  const validation = validateInvoice(data);
  if (!validation.success) {
    return { success: false, errors: humanizeErrors(validation.errors) };
  }

  const doc: JsPDFDoc = await buildInvoiceDoc(data, calculations);
  doc.save(buildFilename(data));
  saveInvoiceNumber(data.settings.invoiceNumber);

  return { success: true };
}

export async function printInvoicePdf(
  data: InvoiceData,
  calculations: InvoiceCalculations
): Promise<PdfExportResult | PdfExportError> {
  const validation = validateInvoice(data);
  if (!validation.success) {
    return { success: false, errors: humanizeErrors(validation.errors) };
  }

  const doc: JsPDFDoc = await buildInvoiceDoc(data, calculations);
  const blob = doc.output("blob");
  const url = URL.createObjectURL(blob);
  const printWindow = window.open(url);

  if (!printWindow) {
    URL.revokeObjectURL(url);
    return {
      success: false,
      errors: ["Print window was blocked. Please allow popups and try again."],
    };
  }

  // Revoke the URL after the print dialog closes (or after a safety timeout).
  printWindow.onload = () => {
    printWindow.print();
  };
  printWindow.onafterprint = () => {
    URL.revokeObjectURL(url);
  };

  return { success: true };
}
