import type { jsPDF } from "jspdf";
import type { ResumeData } from "../types";
import { getSectionLabel } from "../constants";
import { getVisibleSections, getFontSizes, hexToRgb, getSpacingScales, applyMargin, renderSectionContent, renderSectionHeading } from "./shared";

export async function renderExecutiveTemplate(
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

  // ── Dark header bar ──
  const headerH = 38;
  doc.setFillColor(accent.r, accent.g, accent.b);
  doc.rect(0, 0, pageW, headerH, "F");

  // Name (white on dark)
  doc.setFont(font, "bold");
  doc.setFontSize(sizes.heading + 10);
  doc.setTextColor(255, 255, 255);
  doc.text(personalInfo.name || "Your Name", margin, 16);

  // Title (white, lighter)
  if (personalInfo.title) {
    doc.setFont(font, "normal");
    doc.setFontSize(sizes.heading);
    doc.setTextColor(255, 255, 255);
    doc.text(personalInfo.title, margin, 24);
  }

  // Contact (white, right-aligned)
  const contactFields = [personalInfo.email, personalInfo.phone, personalInfo.location, personalInfo.website, personalInfo.linkedin].filter(Boolean);
  if (contactFields.length > 0) {
    doc.setFont(font, "normal");
    doc.setFontSize(sizes.body - 1);
    doc.setTextColor(255, 255, 255);
    doc.text(contactFields.join("  |  "), pageW - margin, 34, { align: "right" });
  }

  let y = headerH + 10;

  // ── Sections ──
  const sections = getVisibleSections(data.sections);
  sections.forEach((section) => {
    if (y > pageH - margin - 15) { doc.addPage(); y = margin; }
    y = renderSectionHeading(doc, getSectionLabel(section), margin, y, w, font, sizes.heading, accent, "underline");
    y = renderSectionContent(doc, section, margin, y, w, font, sizes.body, accent, settings.dateFormat, pageH, margin, scales.lineScale);
    y += 4 * scales.sectionScale;
  });
}
