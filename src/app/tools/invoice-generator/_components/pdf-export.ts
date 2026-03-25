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

export async function generateInvoicePdf(
  data: InvoiceData,
  calculations: InvoiceCalculations
): Promise<PdfExportResult | PdfExportError> {
  // ── Validate ──
  const validation = validateInvoice(data);
  if (!validation.success) {
    return {
      success: false,
      errors: humanizeErrors(validation.errors),
    };
  }

  // ── Create jsPDF instance ──
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  // ── Select and render template ──
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

  // ── Build filename ──
  const invoiceNum = data.settings.invoiceNumber || "invoice";
  const clientName = data.client.name
    ? `-${data.client.name.replace(/[^a-zA-Z0-9]/g, "_")}`
    : "";
  const filename = `${invoiceNum}${clientName}.pdf`;

  // ── Download ──
  doc.save(filename);

  // ── Persist invoice number for auto-increment ──
  saveInvoiceNumber(data.settings.invoiceNumber);

  return { success: true };
}

export async function printInvoicePdf(
  data: InvoiceData,
  calculations: InvoiceCalculations
): Promise<PdfExportResult | PdfExportError> {
  // ── Validate ──
  const validation = validateInvoice(data);
  if (!validation.success) {
    return {
      success: false,
      errors: humanizeErrors(validation.errors),
    };
  }

  // ── Create jsPDF instance ──
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  // ── Select and render template ──
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

  // ── Open print dialog via blob URL ──
  const blob = doc.output("blob");
  const url = URL.createObjectURL(blob);
  const printWindow = window.open(url);
  if (printWindow) {
    printWindow.onload = () => {
      printWindow.print();
    };
  }

  return { success: true };
}
