import type { jsPDF } from "jspdf";
import type { ResumeData } from "../types";
import { SECTION_TYPE_LABELS } from "../constants";
import { getVisibleSections, getFontSizes, hexToRgb, getSpacingScales, applyMargin, renderSectionContent, renderSectionHeading } from "./shared";

export async function renderColumnsTemplate(
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
  const margin = applyMargin(16, scales.marginScale);
  const fullW = pageW - margin * 2;
  const colGap = 8;
  const colW = (fullW - colGap) / 2;

  let y = margin;

  // ── Full-width header ──
  doc.setFont(font, "bold");
  doc.setFontSize(sizes.heading + 8);
  doc.setTextColor(accent.r, accent.g, accent.b);
  doc.text(personalInfo.name || "Your Name", pageW / 2, y, { align: "center" });
  y += sizes.heading * 0.5 + 2;

  if (personalInfo.title) {
    doc.setFont(font, "normal");
    doc.setFontSize(sizes.heading);
    doc.setTextColor(80, 80, 80);
    doc.text(personalInfo.title, pageW / 2, y, { align: "center" });
    y += sizes.heading * 0.4 + 2;
  }

  // Contact centered
  const contactParts = [personalInfo.email, personalInfo.phone, personalInfo.location, personalInfo.website, personalInfo.linkedin].filter(Boolean);
  if (contactParts.length > 0) {
    doc.setFont(font, "normal");
    doc.setFontSize(sizes.body - 1);
    doc.setTextColor(120, 120, 120);
    doc.text(contactParts.join("  \u2022  "), pageW / 2, y, { align: "center" });
    y += 4;
  }

  // Accent line
  y += 2;
  doc.setDrawColor(accent.r, accent.g, accent.b);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageW - margin, y);
  y += 6;

  // ── Two-column body ──
  // Split sections: left column gets odd-indexed, right gets even
  const sections = getVisibleSections(data.sections);
  const leftSections = sections.filter((_, i) => i % 2 === 0);
  const rightSections = sections.filter((_, i) => i % 2 === 1);

  const colStartY = y;
  const leftX = margin;
  const rightX = margin + colW + colGap;

  // Render left column
  let ly = colStartY;
  leftSections.forEach((section) => {
    if (ly > pageH - margin - 15) return; // skip overflow for simplicity
    ly = renderSectionHeading(doc, SECTION_TYPE_LABELS[section.type], leftX, ly, colW, font, sizes.heading - 1, accent, "underline");
    ly = renderSectionContent(doc, section, leftX, ly, colW, font, sizes.body - 0.5, accent, settings.dateFormat, pageH, margin, scales.lineScale);
    ly += 5 * scales.sectionScale;
  });

  // Render right column
  let ry = colStartY;
  rightSections.forEach((section) => {
    if (ry > pageH - margin - 15) return;
    ry = renderSectionHeading(doc, SECTION_TYPE_LABELS[section.type], rightX, ry, colW, font, sizes.heading - 1, accent, "underline");
    ry = renderSectionContent(doc, section, rightX, ry, colW, font, sizes.body - 0.5, accent, settings.dateFormat, pageH, margin, scales.lineScale);
    ry += 5 * scales.sectionScale;
  });
}
