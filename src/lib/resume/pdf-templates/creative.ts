import type { jsPDF } from "jspdf";
import type { ResumeData, ResumeSection } from "../types";
import { SECTION_TYPE_LABELS, FONT_SIZE_OPTIONS } from "../constants";
import { formatDateRange, languageProficiencyLabel } from "../format";
import { renderSectionContent as sharedRenderSectionContent } from "./shared";

function hexToRgb(hex: string) {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
  };
}

function getVisibleSections(sections: ResumeSection[]): ResumeSection[] {
  return [...sections].filter((s) => s.visible).sort((a, b) => a.sortOrder - b.sortOrder);
}

function getFontSizes(fontSize: string) {
  const opt = FONT_SIZE_OPTIONS.find((o) => o.value === fontSize) ?? FONT_SIZE_OPTIONS[1];
  return { body: opt.bodyPt, heading: opt.headingPt };
}

export async function renderCreativeTemplate(
  doc: jsPDF,
  data: ResumeData
): Promise<void> {
  const { personalInfo, settings } = data;
  const accent = hexToRgb(settings.accentColor);
  const font = settings.fontFamily;
  const sizes = getFontSizes(settings.fontSize);
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 15;
  const sidebarW = 62;
  const sidebarX = pageW - sidebarW;
  const mainW = sidebarX - margin - 8;

  const sections = getVisibleSections(data.sections);
  const sidebarTypes = ["skills", "languages", "certifications", "references"];
  const sidebarSections = sections.filter((s) => sidebarTypes.includes(s.type));
  const mainSections = sections.filter((s) => !sidebarTypes.includes(s.type));

  // ── Right sidebar background ──
  doc.setFillColor(accent.r, accent.g, accent.b);
  doc.rect(sidebarX, 0, sidebarW, pageH, "F");

  // ── Sidebar content ──
  let sy = margin;
  doc.setTextColor(255, 255, 255);

  // Photo
  if (personalInfo.photoUrl) {
    try { doc.addImage(personalInfo.photoUrl, "PNG", sidebarX + 10, sy, 24, 24); sy += 28; } catch { /* skip */ }
  }

  // Contact
  doc.setFont(font, "normal");
  doc.setFontSize(sizes.body - 1);
  const contactFields = [personalInfo.email, personalInfo.phone, personalInfo.location, personalInfo.website, personalInfo.linkedin].filter(Boolean);
  contactFields.forEach((f) => {
    const lines = doc.splitTextToSize(f, sidebarW - 16);
    doc.text(lines, sidebarX + 8, sy);
    sy += lines.length * (sizes.body - 1) * 0.4 + 3;
  });

  // Sidebar sections
  sidebarSections.forEach((section) => {
    sy += 6;
    doc.setFont(font, "bold");
    doc.setFontSize(sizes.body);
    doc.setTextColor(255, 255, 255);
    doc.text(SECTION_TYPE_LABELS[section.type].toUpperCase(), sidebarX + 8, sy);
    sy += 5;
    doc.setFont(font, "normal");
    doc.setFontSize(sizes.body - 1);

    if (section.type === "skills") {
      section.items.filter((s) => s.name).forEach((item) => {
        doc.text(`${item.name} (${item.proficiency})`, sidebarX + 8, sy);
        sy += 4;
      });
    } else if (section.type === "languages") {
      section.items.filter((l) => l.name).forEach((item) => {
        doc.text(`${item.name} — ${languageProficiencyLabel(item.proficiency)}`, sidebarX + 8, sy);
        sy += 4;
      });
    } else if (section.type === "certifications") {
      section.items.forEach((item) => {
        const text = item.name + (item.issuer ? ` — ${item.issuer}` : "");
        const lines = doc.splitTextToSize(text, sidebarW - 16);
        doc.text(lines, sidebarX + 8, sy);
        sy += lines.length * 3.5 + 2;
      });
    } else if (section.type === "references") {
      section.items.forEach((item) => {
        doc.setFont(font, "bold");
        doc.text(item.name, sidebarX + 8, sy); sy += 3.5;
        doc.setFont(font, "normal");
        if (item.title) { doc.text(item.title, sidebarX + 8, sy); sy += 3.5; }
        if (item.email) { doc.text(item.email, sidebarX + 8, sy); sy += 3.5; }
        sy += 2;
      });
    }
  });

  // ── Main content (left side) ──
  let y = margin;
  doc.setTextColor(30, 30, 30);

  // Name
  doc.setFont(font, "bold");
  doc.setFontSize(sizes.heading + 6);
  doc.text(personalInfo.name || "Your Name", margin, y);
  y += sizes.heading * 0.5 + 2;

  // Title
  if (personalInfo.title) {
    doc.setFont(font, "normal");
    doc.setFontSize(sizes.heading);
    doc.setTextColor(accent.r, accent.g, accent.b);
    doc.text(personalInfo.title, margin, y);
    y += sizes.heading * 0.4 + 4;
  }

  // Main sections
  const lineH = sizes.body * 0.4;
  mainSections.forEach((section) => {
    if (y > pageH - margin - 15) { doc.addPage(); y = margin; }

    y += 4;
    doc.setFont(font, "bold");
    doc.setFontSize(sizes.heading);
    doc.setTextColor(accent.r, accent.g, accent.b);
    doc.text(SECTION_TYPE_LABELS[section.type].toUpperCase(), margin, y);
    y += 2;
    doc.setDrawColor(accent.r, accent.g, accent.b);
    doc.setLineWidth(0.4);
    doc.line(margin, y, margin + mainW, y);
    y += 5;

    doc.setTextColor(50, 50, 50);
    doc.setFont(font, "normal");
    doc.setFontSize(sizes.body);

    const pageBreak = () => {
      if (y > pageH - margin - 10) { doc.addPage(); y = margin; }
    };

    switch (section.type) {
      case "summary": {
        if (section.content) {
          const lines = doc.splitTextToSize(section.content, mainW);
          pageBreak();
          doc.text(lines, margin, y);
          y += lines.length * lineH + 2;
        }
        break;
      }
      case "experience": {
        section.items.forEach((item) => {
          pageBreak();
          doc.setFont(font, "bold");
          doc.setFontSize(sizes.body);
          doc.setTextColor(30, 30, 30);
          doc.text(item.title || "", margin, y);
          const dateStr = formatDateRange(item.startDate, item.endDate, item.isCurrentRole, settings.dateFormat as "Month YYYY");
          if (dateStr) {
            doc.setFont(font, "normal");
            doc.setTextColor(120, 120, 120);
            doc.text(dateStr, margin + mainW, y, { align: "right" });
          }
          y += 4;
          doc.setFont(font, "normal");
          doc.setTextColor(100, 100, 100);
          const sub = [item.company, item.location].filter(Boolean).join(" | ");
          if (sub) { doc.text(sub, margin, y); y += 4; }
          doc.setTextColor(50, 50, 50);
          item.bullets.filter(Boolean).forEach((b) => {
            pageBreak();
            const lines = doc.splitTextToSize(`\u2022 ${b}`, mainW - 4);
            doc.text(lines, margin + 2, y);
            y += lines.length * lineH + 1;
          });
          y += 3;
        });
        break;
      }
      case "education": {
        section.items.forEach((item) => {
          pageBreak();
          doc.setFont(font, "bold");
          doc.setTextColor(30, 30, 30);
          doc.text(`${item.degree}${item.field ? ` in ${item.field}` : ""}`, margin, y);
          const dateStr = formatDateRange(item.startDate, item.endDate, false, settings.dateFormat as "Month YYYY");
          if (dateStr) {
            doc.setFont(font, "normal");
            doc.setTextColor(120, 120, 120);
            doc.text(dateStr, margin + mainW, y, { align: "right" });
          }
          y += 4;
          doc.setFont(font, "normal");
          doc.setTextColor(100, 100, 100);
          if (item.school) { doc.text(item.school, margin, y); y += 4; }
          doc.setTextColor(50, 50, 50);
          if (item.gpa) { doc.text(`GPA: ${item.gpa}`, margin, y); y += 4; }
          if (item.description) {
            const lines = doc.splitTextToSize(item.description, mainW);
            doc.text(lines, margin, y);
            y += lines.length * lineH + 2;
          }
          y += 2;
        });
        break;
      }
      default: {
        y = sharedRenderSectionContent(doc, section, margin, y, mainW, font, sizes.body, accent, settings.dateFormat, pageH, margin);
        break;
      }
    }
  });
}
