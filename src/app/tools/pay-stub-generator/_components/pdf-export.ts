import type { PayStubData, PayStubCalculations } from "@/lib/pay-stub/types";
import type { PayStubValidationError } from "@/lib/pay-stub/types";
import { validatePayStub } from "@/lib/pay-stub/schema";

export interface PdfExportResult {
  success: true;
}

export interface PdfExportError {
  success: false;
  errors: string[];
}

function humanizeErrors(
  errors: PayStubValidationError[]
): string[] {
  return errors.map((e) => e.message);
}

export async function generatePayStubPdf(
  data: PayStubData,
  calculations: PayStubCalculations
): Promise<PdfExportResult | PdfExportError> {
  // ── Validate ──
  const validation = validatePayStub(data);
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
    case "standard": {
      const { renderStandardTemplate } = await import(
        "@/lib/pay-stub/templates/standard"
      );
      await renderStandardTemplate(doc, data, calculations);
      break;
    }
    case "modern": {
      const { renderModernTemplate } = await import(
        "@/lib/pay-stub/templates/modern"
      );
      await renderModernTemplate(doc, data, calculations);
      break;
    }
    case "compact": {
      const { renderCompactTemplate } = await import(
        "@/lib/pay-stub/templates/compact"
      );
      await renderCompactTemplate(doc, data, calculations);
      break;
    }
  }

  // ── Build filename ──
  const employeeName = data.employee.name
    ? data.employee.name.replace(/[^a-zA-Z0-9]/g, "_")
    : "employee";
  const payDate = data.payPeriod.payDate || "undated";
  const filename = `paystub-${employeeName}-${payDate}.pdf`;

  // ── Download ──
  doc.save(filename);

  return { success: true };
}

export async function printPayStubPdf(
  data: PayStubData,
  calculations: PayStubCalculations
): Promise<PdfExportResult | PdfExportError> {
  // ── Validate ──
  const validation = validatePayStub(data);
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
    case "standard": {
      const { renderStandardTemplate } = await import(
        "@/lib/pay-stub/templates/standard"
      );
      await renderStandardTemplate(doc, data, calculations);
      break;
    }
    case "modern": {
      const { renderModernTemplate } = await import(
        "@/lib/pay-stub/templates/modern"
      );
      await renderModernTemplate(doc, data, calculations);
      break;
    }
    case "compact": {
      const { renderCompactTemplate } = await import(
        "@/lib/pay-stub/templates/compact"
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
