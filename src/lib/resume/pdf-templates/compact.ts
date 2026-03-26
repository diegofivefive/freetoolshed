import type { jsPDF } from "jspdf";
import type { ResumeData } from "../types";
import { getSectionLabel } from "../constants";
import { getVisibleSections, getFontSizes, hexToRgb, getSpacingScales, applyMargin, renderSectionContent } from "./shared";

export async function renderCompactTemplate(
  doc: jsPDF,
  data: ResumeData
): Promise<void> {
  const { personalInfo, settings } = data;
  const accent = hexToRgb(settings.accentColor);
  const font = settings.fontFamily;
  const sizes = getFontSizes(settings.fontSize);
  const scales = getSpacingScales(settings);
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = applyMargin(12, scales.marginScale);
  const w = pageW - margin * 2;

  let y = margin;

  // ── Compact header: name left, contact right ──
  doc.setFont(font, "bold");
  doc.setFontSize(sizes.heading + 4);
  doc.setTextColor(accent.r, accent.g, accent.b);
  doc.text(personalInfo.name || "Your Name", margin, y);

  // Contact fields stacked on right
  let ry = y - 2;
  doc.setFont(font, "normal");
  doc.setFontSize(sizes.body - 2);
  doc.setTextColor(100, 100, 100);
  const contactFields = [personalInfo.email, personalInfo.phone, personalInfo.location, personalInfo.website, personalInfo.linkedin].filter(Boolean);
  contactFields.forEach((f) => {
    doc.text(f, pageW - margin, ry, { align: "right" });
    ry += 3;
  });

  y += sizes.heading * 0.3 + 1;

  if (personalInfo.title) {
    doc.setFont(font, "normal");
    doc.setFontSize(sizes.body);
    doc.setTextColor(80, 80, 80);
    doc.text(personalInfo.title, margin, y);
    y += 4;
  }

  y = Math.max(y, ry) + 2;

  // Thin accent line
  doc.setDrawColor(accent.r, accent.g, accent.b);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageW - margin, y);
  y += 4;

  // ── Sections with tight spacing ──
  const sections = getVisibleSections(data.sections);
  sections.forEach((section) => {
    if (y > pageH - margin - 10) { doc.addPage(); y = margin; }

    // Compact heading: bold label + thin underline
    doc.setFont(font, "bold");
    doc.setFontSize(sizes.body + 1);
    doc.setTextColor(accent.r, accent.g, accent.b);
    doc.text(getSectionLabel(section).toUpperCase(), margin, y);
    y += 1.5;
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.2);
    doc.line(margin, y, pageW - margin, y);
    y += 3;

    y = renderSectionContent(doc, section, margin, y, w, font, sizes.body - 1, accent, settings.dateFormat, pageH, margin, scales.lineScale);
    y += 2 * scales.sectionScale;
  });
}
