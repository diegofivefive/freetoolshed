import type { ResumeData } from "@/lib/resume/types";

export interface PdfExportResult {
  success: true;
}

export interface PdfExportError {
  success: false;
  errors: string[];
}

function validate(data: ResumeData): string[] {
  const errors: string[] = [];
  if (!data.personalInfo.name.trim()) errors.push("Full name is required to generate a PDF.");
  if (data.sections.filter((s) => s.visible).length === 0) errors.push("At least one visible section is required.");
  return errors;
}

async function renderTemplate(doc: import("jspdf").jsPDF, data: ResumeData): Promise<void> {
  switch (data.settings.template) {
    case "modern": {
      const { renderModernTemplate } = await import("@/lib/resume/pdf-templates/modern");
      await renderModernTemplate(doc, data);
      break;
    }
    case "classic": {
      const { renderClassicTemplate } = await import("@/lib/resume/pdf-templates/classic");
      await renderClassicTemplate(doc, data);
      break;
    }
    case "professional": {
      const { renderProfessionalTemplate } = await import("@/lib/resume/pdf-templates/professional");
      await renderProfessionalTemplate(doc, data);
      break;
    }
    case "minimal": {
      const { renderMinimalTemplate } = await import("@/lib/resume/pdf-templates/minimal");
      await renderMinimalTemplate(doc, data);
      break;
    }
    case "executive": {
      const { renderExecutiveTemplate } = await import("@/lib/resume/pdf-templates/executive");
      await renderExecutiveTemplate(doc, data);
      break;
    }
    case "creative": {
      const { renderCreativeTemplate } = await import("@/lib/resume/pdf-templates/creative");
      await renderCreativeTemplate(doc, data);
      break;
    }
    case "compact": {
      const { renderCompactTemplate } = await import("@/lib/resume/pdf-templates/compact");
      await renderCompactTemplate(doc, data);
      break;
    }
    case "elegant": {
      const { renderElegantTemplate } = await import("@/lib/resume/pdf-templates/elegant");
      await renderElegantTemplate(doc, data);
      break;
    }
    case "bold": {
      const { renderBoldTemplate } = await import("@/lib/resume/pdf-templates/bold");
      await renderBoldTemplate(doc, data);
      break;
    }
    case "technical": {
      const { renderTechnicalTemplate } = await import("@/lib/resume/pdf-templates/technical");
      await renderTechnicalTemplate(doc, data);
      break;
    }
    case "columns": {
      const { renderColumnsTemplate } = await import("@/lib/resume/pdf-templates/columns");
      await renderColumnsTemplate(doc, data);
      break;
    }
    case "timeline": {
      const { renderTimelineTemplate } = await import("@/lib/resume/pdf-templates/timeline");
      await renderTimelineTemplate(doc, data);
      break;
    }
  }
}

export async function generateResumePdf(
  data: ResumeData
): Promise<PdfExportResult | PdfExportError> {
  const errors = validate(data);
  if (errors.length > 0) return { success: false, errors };

  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  await renderTemplate(doc, data);

  const safeName = data.personalInfo.name.replace(/[^a-zA-Z0-9]/g, "_");
  doc.save(`Resume-${safeName}.pdf`);
  return { success: true };
}

export async function printResumePdf(
  data: ResumeData
): Promise<PdfExportResult | PdfExportError> {
  if (!data.personalInfo.name.trim()) {
    return { success: false, errors: ["Full name is required to print."] };
  }

  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  await renderTemplate(doc, data);

  const blob = doc.output("blob");
  const url = URL.createObjectURL(blob);
  const printWindow = window.open(url);
  if (printWindow) {
    printWindow.onload = () => {
      printWindow.print();
    };
    const revoke = () => URL.revokeObjectURL(url);
    printWindow.addEventListener("afterprint", revoke);
    printWindow.addEventListener("pagehide", revoke);
  } else {
    URL.revokeObjectURL(url);
  }

  return { success: true };
}
