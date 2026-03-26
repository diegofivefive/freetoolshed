import type { jsPDF } from "jspdf";
import type { ResumeData } from "../types";
import { SECTION_TYPE_LABELS } from "../constants";
import { getVisibleSections, getFontSizes, hexToRgb, renderSectionContent, renderSectionHeading } from "./shared";

export async function renderMinimalTemplate(
  doc: jsPDF,
  data: ResumeData
): Promise<void> {
  const { personalInfo, settings } = data;
  const font = settings.fontFamily;
  const sizes = getFontSizes(settings.fontSize);
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 22;
  const w = pageW - margin * 2;
  const neutral = hexToRgb("#666666");

  let y = margin;

  // ── Name ──
  doc.setFont(font, "normal");
  doc.setFontSize(sizes.heading + 6);
  doc.setTextColor(30, 30, 30);
  doc.text(personalInfo.name || "Your Name", margin, y);
  y += sizes.heading * 0.4 + 2;

  // ── Title ──
  if (personalInfo.title) {
    doc.setFont(font, "normal");
    doc.setFontSize(sizes.body + 1);
    doc.setTextColor(140, 140, 140);
    doc.text(personalInfo.title, margin, y);
    y += 5;
  }

  // ── Contact ──
  const contactParts = [personalInfo.email, personalInfo.phone, personalInfo.location, personalInfo.website, personalInfo.linkedin].filter(Boolean);
  if (contactParts.length > 0) {
    doc.setFont(font, "normal");
    doc.setFontSize(sizes.body - 1);
    doc.setTextColor(160, 160, 160);
    doc.text(contactParts.join("   "), margin, y);
    y += 6;
  }

  y += 4;

  // ── Sections ──
  const sections = getVisibleSections(data.sections);
  sections.forEach((section) => {
    if (y > pageH - margin - 15) { doc.addPage(); y = margin; }
    y = renderSectionHeading(doc, SECTION_TYPE_LABELS[section.type], margin, y, w, font, sizes.body, neutral, "plain");
    y = renderSectionContent(doc, section, margin, y, w, font, sizes.body, neutral, settings.dateFormat, pageH, margin);
    y += 5;
  });
}
