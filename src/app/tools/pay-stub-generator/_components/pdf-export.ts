import type {
  PayStubData,
  PayStubCalculations,
  PayStubValidationError,
  SavedPayStub,
} from "@/lib/pay-stub/types";
import { validatePayStub } from "@/lib/pay-stub/schema";
import { calculatePayStub } from "@/lib/pay-stub/calculations";

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

// ── Bulk PDF export ──────────────────────────────────────────

export interface BulkPdfExportResult {
  success: true;
  count: number;
}

export interface BulkPdfExportError {
  success: false;
  errors: string[];
}

export async function generateBulkPdf(
  stubs: SavedPayStub[]
): Promise<BulkPdfExportResult | BulkPdfExportError> {
  if (stubs.length === 0) {
    return { success: false, errors: ["No pay stubs to export."] };
  }

  // ── Pre-validate all stubs ──
  const errors: string[] = [];
  for (const stub of stubs) {
    const validation = validatePayStub(stub.data);
    if (!validation.success) {
      const name = stub.data.employee.name || "Unnamed Employee";
      const stubErrors = humanizeErrors(validation.errors);
      errors.push(`${name}: ${stubErrors.join(", ")}`);
    }
  }
  if (errors.length > 0) {
    return { success: false, errors };
  }

  // ── Create a single jsPDF instance ──
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  // ── Render each stub to its own page ──
  for (let i = 0; i < stubs.length; i++) {
    if (i > 0) {
      doc.addPage();
    }

    const stub = stubs[i];
    const calcs = calculatePayStub(
      stub.data.earnings,
      stub.data.deductions
    );

    switch (stub.data.settings.template) {
      case "standard": {
        const { renderStandardTemplate } = await import(
          "@/lib/pay-stub/templates/standard"
        );
        await renderStandardTemplate(doc, stub.data, calcs);
        break;
      }
      case "modern": {
        const { renderModernTemplate } = await import(
          "@/lib/pay-stub/templates/modern"
        );
        await renderModernTemplate(doc, stub.data, calcs);
        break;
      }
      case "compact": {
        const { renderCompactTemplate } = await import(
          "@/lib/pay-stub/templates/compact"
        );
        await renderCompactTemplate(doc, stub.data, calcs);
        break;
      }
    }
  }

  // ── Download ──
  const today = new Date().toISOString().split("T")[0];
  const filename = `paystubs-bulk-${today}.pdf`;
  doc.save(filename);

  return { success: true, count: stubs.length };
}
