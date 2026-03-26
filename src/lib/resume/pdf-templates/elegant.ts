import type { jsPDF } from "jspdf";
import type { ResumeData } from "../types";
import { getSectionLabel } from "../constants";
import { getVisibleSections, getFontSizes, hexToRgb, getSpacingScales, applyMargin, renderSectionContent } from "./shared";

export async function renderElegantTemplate(
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
  const margin = applyMargin(24, scales.marginScale);
  const w = pageW - margin * 2;

  let y = margin + 4;

  // ── Centered header with decorative lines ──
  // Top decorative line
  doc.setDrawColor(accent.r, accent.g, accent.b);
  doc.setLineWidth(0.6);
  doc.line(margin, y - 2, pageW - margin, y - 2);
  doc.setLineWidth(0.2);
  doc.line(margin, y, pageW - margin, y);
  y += 6;

  // Name
  doc.setFont(font, "bold");
  doc.setFontSize(sizes.heading + 8);
  doc.setTextColor(30, 30, 30);
  doc.text(personalInfo.name || "Your Name", pageW / 2, y, { align: "center" });
  y += sizes.heading * 0.5 + 2;

  // Title
  if (personalInfo.title) {
    doc.setFont(font, "normal");
    doc.setFontSize(sizes.heading);
    doc.setTextColor(accent.r, accent.g, accent.b);
    doc.text(personalInfo.title, pageW / 2, y, { align: "center" });
    y += sizes.heading * 0.4 + 2;
  }

  // Contact (centered, separated by diamond)
  const contactParts = [personalInfo.email, personalInfo.phone, personalInfo.location, personalInfo.website, personalInfo.linkedin].filter(Boolean);
  if (contactParts.length > 0) {
    doc.setFont(font, "normal");
    doc.setFontSize(sizes.body - 1);
    doc.setTextColor(120, 120, 120);
    doc.text(contactParts.join("  \u2666  "), pageW / 2, y, { align: "center" });
    y += 4;
  }

  // Bottom decorative line
  y += 2;
  doc.setDrawColor(accent.r, accent.g, accent.b);
  doc.setLineWidth(0.2);
  doc.line(margin, y, pageW - margin, y);
  doc.setLineWidth(0.6);
  doc.line(margin, y + 2, pageW - margin, y + 2);
  y += 10;

  // ── Sections ──
  const sections = getVisibleSections(data.sections);
  sections.forEach((section) => {
    if (y > pageH - margin - 15) { doc.addPage(); y = margin; }

    // Centered section heading
    doc.setFont(font, "bold");
    doc.setFontSize(sizes.heading);
    doc.setTextColor(accent.r, accent.g, accent.b);
    const label = getSectionLabel(section).toUpperCase();
    doc.text(label, pageW / 2, y, { align: "center" });
    y += 2;

    // Decorative hairlines around heading
    const labelW = doc.getTextWidth(label);
    const lineY = y;
    const gap = 4;
    doc.setDrawColor(accent.r, accent.g, accent.b);
    doc.setLineWidth(0.3);
    doc.line(margin, lineY, pageW / 2 - labelW / 2 - gap, lineY);
    doc.line(pageW / 2 + labelW / 2 + gap, lineY, pageW - margin, lineY);
    y += 5;

    y = renderSectionContent(doc, section, margin, y, w, font, sizes.body, accent, settings.dateFormat, pageH, margin, scales.lineScale);
    y += 6 * scales.sectionScale;
  });
}
