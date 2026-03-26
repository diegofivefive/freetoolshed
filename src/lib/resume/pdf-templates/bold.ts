import type { jsPDF } from "jspdf";
import type { ResumeData } from "../types";
import { getSectionLabel } from "../constants";
import { getVisibleSections, getFontSizes, hexToRgb, getSpacingScales, applyMargin, renderSectionContent } from "./shared";

export async function renderBoldTemplate(
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
  const margin = applyMargin(18, scales.marginScale);
  const w = pageW - margin * 2;

  let y = margin;

  // ── Bold name (all-caps, large) ──
  doc.setFont(font, "bold");
  doc.setFontSize(sizes.heading + 14);
  doc.setTextColor(30, 30, 30);
  doc.text((personalInfo.name || "Your Name").toUpperCase(), margin, y);
  y += sizes.heading * 0.6 + 4;

  // Thick accent divider
  doc.setFillColor(accent.r, accent.g, accent.b);
  doc.rect(margin, y, w, 3, "F");
  y += 7;

  // Title
  if (personalInfo.title) {
    doc.setFont(font, "bold");
    doc.setFontSize(sizes.heading + 2);
    doc.setTextColor(80, 80, 80);
    doc.text(personalInfo.title.toUpperCase(), margin, y);
    y += sizes.heading * 0.4 + 3;
  }

  // Contact line
  const contactParts = [personalInfo.email, personalInfo.phone, personalInfo.location, personalInfo.website, personalInfo.linkedin].filter(Boolean);
  if (contactParts.length > 0) {
    doc.setFont(font, "normal");
    doc.setFontSize(sizes.body - 1);
    doc.setTextColor(100, 100, 100);
    doc.text(contactParts.join("  |  "), margin, y);
    y += 6;
  }

  y += 2;

  // ── Sections ──
  const sections = getVisibleSections(data.sections);
  sections.forEach((section) => {
    if (y > pageH - margin - 15) { doc.addPage(); y = margin; }

    // Bold heading with thick left bar
    doc.setFillColor(accent.r, accent.g, accent.b);
    doc.rect(margin, y - 3, 3, sizes.heading * 0.7 + 2, "F");

    doc.setFont(font, "bold");
    doc.setFontSize(sizes.heading + 1);
    doc.setTextColor(30, 30, 30);
    doc.text(getSectionLabel(section).toUpperCase(), margin + 7, y);
    y += 2;

    // Thick line under heading
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.8);
    doc.line(margin, y, pageW - margin, y);
    y += 5;

    y = renderSectionContent(doc, section, margin, y, w, font, sizes.body, accent, settings.dateFormat, pageH, margin, scales.lineScale);
    y += 5 * scales.sectionScale;
  });
}
