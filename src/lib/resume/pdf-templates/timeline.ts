import type { jsPDF } from "jspdf";
import type { ResumeData } from "../types";
import { SECTION_TYPE_LABELS } from "../constants";
import { getVisibleSections, getFontSizes, hexToRgb, getSpacingScales, applyMargin, renderSectionContent, renderSectionHeading } from "./shared";

export async function renderTimelineTemplate(
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
  const timelineX = margin + 4;

  let y = margin;

  // ── Header ──
  doc.setFont(font, "bold");
  doc.setFontSize(sizes.heading + 6);
  doc.setTextColor(30, 30, 30);
  doc.text(personalInfo.name || "Your Name", margin, y);

  // Contact right-aligned
  let ry = y - 1;
  doc.setFont(font, "normal");
  doc.setFontSize(sizes.body - 1);
  doc.setTextColor(100, 100, 100);
  const contactFields = [personalInfo.email, personalInfo.phone, personalInfo.location].filter(Boolean);
  contactFields.forEach((f) => {
    doc.text(f, pageW - margin, ry, { align: "right" });
    ry += 3.5;
  });

  y += sizes.heading * 0.4 + 2;

  if (personalInfo.title) {
    doc.setFont(font, "normal");
    doc.setFontSize(sizes.heading);
    doc.setTextColor(accent.r, accent.g, accent.b);
    doc.text(personalInfo.title, margin, y);
    y += sizes.heading * 0.4 + 1;
  }

  // Additional contact
  const extraContact = [personalInfo.website, personalInfo.linkedin].filter(Boolean);
  if (extraContact.length > 0) {
    doc.setFont(font, "normal");
    doc.setFontSize(sizes.body - 1);
    doc.setTextColor(accent.r, accent.g, accent.b);
    doc.text(extraContact.join("  |  "), margin, y);
    y += 4;
  }

  y = Math.max(y, ry) + 4;

  // Full-width accent line
  doc.setDrawColor(accent.r, accent.g, accent.b);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageW - margin, y);
  y += 8;

  // ── Sections with timeline ──
  const sections = getVisibleSections(data.sections);
  const contentX = timelineX + 10;
  const contentW = pageW - contentX - margin;

  sections.forEach((section) => {
    if (y > pageH - margin - 15) { doc.addPage(); y = margin; }

    const sectionStartY = y;

    // Timeline dot
    doc.setFillColor(accent.r, accent.g, accent.b);
    doc.circle(timelineX, y - 1, 2, "F");

    // Section heading
    doc.setFont(font, "bold");
    doc.setFontSize(sizes.heading);
    doc.setTextColor(accent.r, accent.g, accent.b);
    doc.text(SECTION_TYPE_LABELS[section.type].toUpperCase(), contentX, y);
    y += 5;

    // Content
    y = renderSectionContent(doc, section, contentX, y, contentW, font, sizes.body, accent, settings.dateFormat, pageH, margin, scales.lineScale);
    y += 3 * scales.sectionScale;

    // Timeline vertical line
    doc.setDrawColor(accent.r, accent.g, accent.b);
    doc.setLineWidth(0.4);
    doc.line(timelineX, sectionStartY + 2, timelineX, y - 1);

    y += 3 * scales.sectionScale;
  });
}
