import type { jsPDF } from "jspdf";
import type { ResumeData } from "../types";
import { SECTION_TYPE_LABELS } from "../constants";
import { getVisibleSections, getFontSizes, hexToRgb, renderSectionContent, renderSectionHeading } from "./shared";

export async function renderClassicTemplate(
  doc: jsPDF,
  data: ResumeData
): Promise<void> {
  const { personalInfo, settings } = data;
  const font = settings.fontFamily;
  const sizes = getFontSizes(settings.fontSize);
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 20;
  const w = pageW - margin * 2;
  const accent = hexToRgb("#333333"); // Classic uses neutral colors

  let y = margin;

  // ── Name (centered) ──
  doc.setFont(font, "bold");
  doc.setFontSize(sizes.heading + 8);
  doc.setTextColor(30, 30, 30);
  doc.text(personalInfo.name || "Your Name", pageW / 2, y, { align: "center" });
  y += sizes.heading * 0.5 + 2;

  // ── Title ──
  if (personalInfo.title) {
    doc.setFont(font, "normal");
    doc.setFontSize(sizes.heading);
    doc.setTextColor(100, 100, 100);
    doc.text(personalInfo.title, pageW / 2, y, { align: "center" });
    y += sizes.heading * 0.4 + 2;
  }

  // ── Contact line ──
  const contactParts = [personalInfo.email, personalInfo.phone, personalInfo.location, personalInfo.website, personalInfo.linkedin].filter(Boolean);
  if (contactParts.length > 0) {
    doc.setFont(font, "normal");
    doc.setFontSize(sizes.body - 1);
    doc.setTextColor(120, 120, 120);
    doc.text(contactParts.join("  |  "), pageW / 2, y, { align: "center" });
    y += 4;
  }

  // ── Horizontal rule ──
  y += 2;
  doc.setDrawColor(50, 50, 50);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageW - margin, y);
  y += 6;

  // ── Sections ──
  const sections = getVisibleSections(data.sections);
  sections.forEach((section) => {
    if (y > pageH - margin - 15) { doc.addPage(); y = margin; }
    y = renderSectionHeading(doc, SECTION_TYPE_LABELS[section.type], margin, y, w, font, sizes.heading, accent, "bar");
    y = renderSectionContent(doc, section, margin, y, w, font, sizes.body, accent, settings.dateFormat, pageH, margin);
    y += 4;
  });
}
