import type { jsPDF } from "jspdf";
import type { ResumeData } from "../types";
import { SECTION_TYPE_LABELS } from "../constants";
import { getVisibleSections, getFontSizes, hexToRgb, renderSectionContent, renderSectionHeading } from "./shared";

export async function renderProfessionalTemplate(
  doc: jsPDF,
  data: ResumeData
): Promise<void> {
  const { personalInfo, settings } = data;
  const accent = hexToRgb(settings.accentColor);
  const font = settings.fontFamily;
  const sizes = getFontSizes(settings.fontSize);
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 18;
  const w = pageW - margin * 2;

  let y = margin;

  // ── Two-column header ──
  // Left: name + title
  doc.setFont(font, "bold");
  doc.setFontSize(sizes.heading + 8);
  doc.setTextColor(accent.r, accent.g, accent.b);
  doc.text(personalInfo.name || "Your Name", margin, y);
  y += sizes.heading * 0.5 + 2;

  if (personalInfo.title) {
    doc.setFont(font, "normal");
    doc.setFontSize(sizes.heading);
    doc.setTextColor(80, 80, 80);
    doc.text(personalInfo.title, margin, y);
  }

  // Right: contact info
  let ry = margin;
  doc.setFont(font, "normal");
  doc.setFontSize(sizes.body - 1);
  doc.setTextColor(100, 100, 100);
  const contactFields = [personalInfo.email, personalInfo.phone, personalInfo.location, personalInfo.website, personalInfo.linkedin].filter(Boolean);
  contactFields.forEach((f) => {
    doc.text(f, pageW - margin, ry, { align: "right" });
    ry += 3.5;
  });

  y = Math.max(y, ry) + 4;

  // ── Accent bar ──
  doc.setFillColor(accent.r, accent.g, accent.b);
  doc.rect(margin, y, w, 1.5, "F");
  y += 8;

  // ── Sections ──
  const sections = getVisibleSections(data.sections);
  sections.forEach((section) => {
    if (y > pageH - margin - 15) { doc.addPage(); y = margin; }
    y = renderSectionHeading(doc, SECTION_TYPE_LABELS[section.type], margin, y, w, font, sizes.heading, accent, "underline");
    y = renderSectionContent(doc, section, margin, y, w, font, sizes.body, accent, settings.dateFormat, pageH, margin);
    y += 4;
  });
}
