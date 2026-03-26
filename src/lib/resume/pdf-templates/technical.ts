import type { jsPDF } from "jspdf";
import type { ResumeData } from "../types";
import { SECTION_TYPE_LABELS } from "../constants";
import { getVisibleSections, getFontSizes, hexToRgb, renderSectionContent } from "./shared";

export async function renderTechnicalTemplate(
  doc: jsPDF,
  data: ResumeData
): Promise<void> {
  const { personalInfo, settings } = data;
  const accent = hexToRgb(settings.accentColor);
  const font = settings.fontFamily;
  const sizes = getFontSizes(settings.fontSize);
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 16;
  const gutterW = 42;
  const contentX = margin + gutterW + 4;
  const contentW = pageW - contentX - margin;

  let y = margin;

  // ── Header ──
  doc.setFont(font, "bold");
  doc.setFontSize(sizes.heading + 6);
  doc.setTextColor(30, 30, 30);
  doc.text(personalInfo.name || "Your Name", margin, y);
  y += sizes.heading * 0.4 + 2;

  if (personalInfo.title) {
    doc.setFont(font, "normal");
    doc.setFontSize(sizes.heading);
    doc.setTextColor(accent.r, accent.g, accent.b);
    doc.text(personalInfo.title, margin, y);
    y += sizes.heading * 0.4 + 1;
  }

  // Contact as a row of key-value pairs
  const contactEntries: [string, string][] = [];
  if (personalInfo.email) contactEntries.push(["Email", personalInfo.email]);
  if (personalInfo.phone) contactEntries.push(["Phone", personalInfo.phone]);
  if (personalInfo.location) contactEntries.push(["Location", personalInfo.location]);
  if (personalInfo.website) contactEntries.push(["Web", personalInfo.website]);
  if (personalInfo.linkedin) contactEntries.push(["LinkedIn", personalInfo.linkedin]);

  if (contactEntries.length > 0) {
    y += 2;
    doc.setFont(font, "normal");
    doc.setFontSize(sizes.body - 1);
    const parts = contactEntries.map(([k, v]) => `${k}: ${v}`);
    doc.setTextColor(100, 100, 100);
    const lines = doc.splitTextToSize(parts.join("  |  "), pageW - margin * 2);
    doc.text(lines, margin, y);
    y += lines.length * (sizes.body - 1) * 0.4 + 2;
  }

  y += 3;

  // Thin full-width line
  doc.setDrawColor(accent.r, accent.g, accent.b);
  doc.setLineWidth(0.4);
  doc.line(margin, y, pageW - margin, y);
  y += 6;

  // ── Sections: label in left gutter, content on right ──
  const sections = getVisibleSections(data.sections);
  sections.forEach((section) => {
    if (y > pageH - margin - 15) { doc.addPage(); y = margin; }

    const sectionStartY = y;

    // Gutter label (rotated-style: small, uppercase, accent color)
    doc.setFont(font, "bold");
    doc.setFontSize(sizes.body - 1);
    doc.setTextColor(accent.r, accent.g, accent.b);
    const label = SECTION_TYPE_LABELS[section.type].toUpperCase();
    const labelLines = doc.splitTextToSize(label, gutterW - 2);
    doc.text(labelLines, margin, y);

    // Vertical gutter line
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.3);
    const gutterLineX = margin + gutterW;

    // Content
    y = renderSectionContent(doc, section, contentX, y, contentW, font, sizes.body, accent, settings.dateFormat, pageH, margin);

    // Draw gutter line from section start to section end
    doc.line(gutterLineX, sectionStartY - 2, gutterLineX, y + 1);

    y += 5;
  });
}
