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

type JsPDFDoc = Awaited<ReturnType<typeof createPdfDoc>>;

async function createPdfDoc() {
  const { jsPDF } = await import("jspdf");
  return new jsPDF({ unit: "mm", format: "a4" });
}

async function renderTemplate(
  doc: JsPDFDoc,
  data: PayStubData,
  calculations: PayStubCalculations
): Promise<void> {
  switch (data.settings.template) {
    case "standard": {
      const { renderStandardTemplate } = await import(
        "@/lib/pay-stub/templates/standard"
      );
      await renderStandardTemplate(doc, data, calculations);
      return;
    }
    case "modern": {
      const { renderModernTemplate } = await import(
        "@/lib/pay-stub/templates/modern"
      );
      await renderModernTemplate(doc, data, calculations);
      return;
    }
    case "compact": {
      const { renderCompactTemplate } = await import(
        "@/lib/pay-stub/templates/compact"
      );
      await renderCompactTemplate(doc, data, calculations);
      return;
    }
  }
}

function buildFilename(data: PayStubData): string {
  const employeeName = data.employee.name
    ? data.employee.name.replace(/[^a-zA-Z0-9]/g, "_")
    : "employee";
  const payDate = data.payPeriod.payDate || "undated";
  return `paystub-${employeeName}-${payDate}.pdf`;
}

export async function generatePayStubPdf(
  data: PayStubData,
  calculations: PayStubCalculations
): Promise<PdfExportResult | PdfExportError> {
  const validation = validatePayStub(data);
  if (!validation.success) {
    return { success: false, errors: humanizeErrors(validation.errors) };
  }

  const doc = await createPdfDoc();
  await renderTemplate(doc, data, calculations);
  doc.save(buildFilename(data));

  return { success: true };
}

export async function printPayStubPdf(
  data: PayStubData,
  calculations: PayStubCalculations
): Promise<PdfExportResult | PdfExportError> {
  const validation = validatePayStub(data);
  if (!validation.success) {
    return { success: false, errors: humanizeErrors(validation.errors) };
  }

  const doc = await createPdfDoc();
  await renderTemplate(doc, data, calculations);

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

  printWindow.onload = () => {
    printWindow.print();
  };
  printWindow.onafterprint = () => {
    URL.revokeObjectURL(url);
  };

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
  const doc = await createPdfDoc();

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

    await renderTemplate(doc, stub.data, calcs);
  }

  // ── Download ──
  const today = new Date().toISOString().split("T")[0];
  const filename = `paystubs-bulk-${today}.pdf`;
  doc.save(filename);

  return { success: true, count: stubs.length };
}
