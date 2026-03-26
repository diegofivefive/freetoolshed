import type { ResumeData } from "@/lib/resume/types";

export interface PdfExportResult {
  success: true;
}

export interface PdfExportError {
  success: false;
  errors: string[];
}

export async function generateResumePdf(
  data: ResumeData
): Promise<PdfExportResult | PdfExportError> {
  // Basic validation
  if (!data.personalInfo.name.trim()) {
    return { success: false, errors: ["Full name is required to generate a PDF."] };
  }

  const visibleSections = data.sections.filter((s) => s.visible);
  if (visibleSections.length === 0) {
    return { success: false, errors: ["At least one visible section is required."] };
  }

  // Create jsPDF instance
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  // Select and render template
  switch (data.settings.template) {
    case "modern": {
      const { renderModernTemplate } = await import(
        "@/lib/resume/pdf-templates/modern"
      );
      await renderModernTemplate(doc, data);
      break;
    }
    case "classic": {
      const { renderClassicTemplate } = await import(
        "@/lib/resume/pdf-templates/classic"
      );
      await renderClassicTemplate(doc, data);
      break;
    }
    case "professional": {
      const { renderProfessionalTemplate } = await import(
        "@/lib/resume/pdf-templates/professional"
      );
      await renderProfessionalTemplate(doc, data);
      break;
    }
    case "minimal": {
      const { renderMinimalTemplate } = await import(
        "@/lib/resume/pdf-templates/minimal"
      );
      await renderMinimalTemplate(doc, data);
      break;
    }
  }

  // Build filename
  const safeName = data.personalInfo.name.replace(/[^a-zA-Z0-9]/g, "_");
  const filename = `Resume-${safeName}.pdf`;

  doc.save(filename);
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
  }

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
