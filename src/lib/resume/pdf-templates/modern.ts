import type { jsPDF } from "jspdf";
import type { ResumeData, ResumeSection } from "../types";
import { getSectionLabel, FONT_SIZE_OPTIONS } from "../constants";
import { formatDateRange, languageProficiencyLabel } from "../format";
import { renderRichLine } from "../rich-text";
import { getSpacingScales, applyMargin } from "./shared";

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

export async function renderModernTemplate(
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
  const margin = applyMargin(15, scales.marginScale);
  const sidebarW = 62;
  const mainX = sidebarW + 8;
  const mainW = pageW - mainX - margin;

  const sections = getVisibleSections(data.sections);
  const sidebarTypes = ["skills", "languages", "certifications", "references"];
  const sidebarSections = sections.filter((s) => sidebarTypes.includes(s.type));
  const mainSections = sections.filter((s) => !sidebarTypes.includes(s.type));

  // ── Sidebar background ──
  doc.setFillColor(accent.r, accent.g, accent.b);
  doc.rect(0, 0, sidebarW, pageH, "F");

  // ── Sidebar content ──
  let sy = margin;
  doc.setTextColor(255, 255, 255);

  // Photo
  if (personalInfo.photoUrl) {
    try { doc.addImage(personalInfo.photoUrl, "PNG", 10, sy, 24, 24); sy += 28; } catch { /* skip */ }
  }

  // Contact
  doc.setFont(font, "normal");
  doc.setFontSize(sizes.body - 1);
  const contactFields = [personalInfo.email, personalInfo.phone, personalInfo.location, personalInfo.website, personalInfo.linkedin].filter(Boolean);
  contactFields.forEach((f) => {
    const lines = doc.splitTextToSize(f, sidebarW - 16);
    doc.text(lines, 8, sy);
    sy += lines.length * (sizes.body - 1) * 0.4 + 3;
  });

  // Sidebar sections
  sidebarSections.forEach((section) => {
    sy += 6;
    doc.setFont(font, "bold");
    doc.setFontSize(sizes.body);
    doc.setTextColor(255, 255, 255);
    doc.text(getSectionLabel(section).toUpperCase(), 8, sy);
    sy += 5;
    doc.setFont(font, "normal");
    doc.setFontSize(sizes.body - 1);

    if (section.type === "skills") {
      section.items.filter((s) => s.name).forEach((item) => {
        doc.text(`${item.name} (${item.proficiency})`, 8, sy);
        sy += 4;
      });
    } else if (section.type === "languages") {
      section.items.filter((l) => l.name).forEach((item) => {
        doc.text(`${item.name} — ${languageProficiencyLabel(item.proficiency)}`, 8, sy);
        sy += 4;
      });
    } else if (section.type === "certifications") {
      section.items.forEach((item) => {
        const text = item.name + (item.issuer ? ` — ${item.issuer}` : "");
        const lines = doc.splitTextToSize(text, sidebarW - 16);
        doc.text(lines, 8, sy);
        sy += lines.length * 3.5 + 2;
      });
    } else if (section.type === "references") {
      section.items.forEach((item) => {
        doc.setFont(font, "bold");
        doc.text(item.name, 8, sy); sy += 3.5;
        doc.setFont(font, "normal");
        if (item.title) { doc.text(item.title, 8, sy); sy += 3.5; }
        if (item.email) { doc.text(item.email, 8, sy); sy += 3.5; }
        sy += 2;
      });
    }
  });

  // ── Main content ──
  let y = margin;
  doc.setTextColor(30, 30, 30);

  // Name
  doc.setFont(font, "bold");
  doc.setFontSize(sizes.heading + 6);
  doc.text(personalInfo.name || "Your Name", mainX, y);
  y += sizes.heading * 0.5 + 2;

  // Title
  if (personalInfo.title) {
    doc.setFont(font, "normal");
    doc.setFontSize(sizes.heading);
    doc.setTextColor(accent.r, accent.g, accent.b);
    doc.text(personalInfo.title, mainX, y);
    y += sizes.heading * 0.4 + 4;
  }

  // Main sections
  mainSections.forEach((section) => {
    y = renderSection(doc, section, mainX, y, mainW, font, sizes, accent, settings.dateFormat, pageH, margin, scales.sectionScale, scales.lineScale);
  });
}

function renderSection(
  doc: jsPDF,
  section: ResumeSection,
  x: number,
  startY: number,
  w: number,
  font: string,
  sizes: { body: number; heading: number },
  accent: { r: number; g: number; b: number },
  dateFormat: string,
  pageH: number,
  margin: number,
  sectionScale: number = 1,
  lineScale: number = 1
): number {
  let y = startY + 4 * sectionScale;
  const pageBreak = () => {
    if (y > pageH - margin - 10) { doc.addPage(); y = margin; }
  };

  // Section heading
  doc.setFont(font, "bold");
  doc.setFontSize(sizes.heading);
  doc.setTextColor(accent.r, accent.g, accent.b);
  doc.text(getSectionLabel(section).toUpperCase(), x, y);
  y += 2;
  doc.setDrawColor(accent.r, accent.g, accent.b);
  doc.setLineWidth(0.4);
  doc.line(x, y, x + w, y);
  y += 5;

  doc.setTextColor(50, 50, 50);
  doc.setFont(font, "normal");
  doc.setFontSize(sizes.body);

  switch (section.type) {
    case "summary": {
      if (section.content) {
        pageBreak();
        y = renderRichLine(doc, section.content, x, y, w, font, sizes.body, accent);
        y += 2;
      }
      break;
    }
    case "experience": {
      section.items.forEach((item) => {
        pageBreak();
        doc.setFont(font, "bold");
        doc.setFontSize(sizes.body);
        doc.text(item.title || "", x, y);
        const dateStr = formatDateRange(item.startDate, item.endDate, item.isCurrentRole, dateFormat as "Month YYYY");
        if (dateStr) {
          doc.setFont(font, "normal");
          doc.setTextColor(120, 120, 120);
          doc.text(dateStr, x + w, y, { align: "right" });
        }
        y += 4;
        doc.setFont(font, "normal");
        doc.setTextColor(100, 100, 100);
        const sub = [item.company, item.location].filter(Boolean).join(" | ");
        if (sub) { doc.text(sub, x, y); y += 4; }
        doc.setTextColor(50, 50, 50);
        item.bullets.filter(Boolean).forEach((b) => {
          pageBreak();
          doc.setFont(font, "normal");
          doc.setFontSize(sizes.body);
          doc.setTextColor(50, 50, 50);
          y = renderRichLine(doc, b, x + 2, y, w - 4, font, sizes.body, accent, "\u2022 ");
          y += 1;
        });
        y += 3;
      });
      break;
    }
    case "education": {
      section.items.forEach((item) => {
        pageBreak();
        doc.setFont(font, "bold");
        doc.text(`${item.degree}${item.field ? ` in ${item.field}` : ""}`, x, y);
        const dateStr = formatDateRange(item.startDate, item.endDate, false, dateFormat as "Month YYYY");
        if (dateStr) {
          doc.setFont(font, "normal");
          doc.setTextColor(120, 120, 120);
          doc.text(dateStr, x + w, y, { align: "right" });
        }
        y += 4;
        doc.setFont(font, "normal");
        doc.setTextColor(100, 100, 100);
        if (item.school) { doc.text(item.school, x, y); y += 4; }
        doc.setTextColor(50, 50, 50);
        if (item.gpa) { doc.text(`GPA: ${item.gpa}`, x, y); y += 4; }
        if (item.description) {
          doc.setFont(font, "normal");
          doc.setFontSize(sizes.body);
          doc.setTextColor(50, 50, 50);
          y = renderRichLine(doc, item.description, x, y, w, font, sizes.body, accent);
          y += 2;
        }
        y += 2;
      });
      break;
    }
    case "projects": {
      section.items.forEach((item) => {
        pageBreak();
        doc.setFont(font, "bold");
        doc.text(item.name, x, y);
        if (item.url) {
          doc.setFont(font, "normal");
          doc.setTextColor(accent.r, accent.g, accent.b);
          doc.text(item.url, x + doc.getTextWidth(item.name) + 3, y);
        }
        y += 4;
        doc.setTextColor(50, 50, 50);
        doc.setFont(font, "normal");
        if (item.description) {
          doc.setFont(font, "normal");
          doc.setFontSize(sizes.body);
          doc.setTextColor(50, 50, 50);
          y = renderRichLine(doc, item.description, x, y, w, font, sizes.body, accent);
          y += 1;
        }
        if (item.technologies.length > 0) {
          doc.setTextColor(120, 120, 120);
          doc.text(item.technologies.join(", "), x, y);
          y += 4;
        }
        doc.setTextColor(50, 50, 50);
        y += 2;
      });
      break;
    }
    case "volunteer": {
      section.items.forEach((item) => {
        pageBreak();
        doc.setFont(font, "bold");
        doc.text(item.role || "", x, y);
        const dateStr = formatDateRange(item.startDate, item.endDate, false, dateFormat as "Month YYYY");
        if (dateStr) {
          doc.setFont(font, "normal");
          doc.setTextColor(120, 120, 120);
          doc.text(dateStr, x + w, y, { align: "right" });
        }
        y += 4;
        doc.setFont(font, "normal");
        doc.setTextColor(100, 100, 100);
        if (item.organization) { doc.text(item.organization, x, y); y += 4; }
        doc.setTextColor(50, 50, 50);
        if (item.description) {
          doc.setFont(font, "normal");
          doc.setFontSize(sizes.body);
          doc.setTextColor(50, 50, 50);
          y = renderRichLine(doc, item.description, x, y, w, font, sizes.body, accent);
          y += 2;
        }
        y += 2;
      });
      break;
    }
    case "awards": {
      section.items.forEach((item) => {
        pageBreak();
        doc.setFont(font, "bold");
        doc.text(item.title, x, y);
        if (item.issuer) {
          doc.setFont(font, "normal");
          doc.setTextColor(100, 100, 100);
          doc.text(` — ${item.issuer}`, x + doc.getTextWidth(item.title), y);
        }
        y += 4;
        doc.setFont(font, "normal");
        doc.setTextColor(50, 50, 50);
        if (item.description) {
          doc.setFont(font, "normal");
          doc.setFontSize(sizes.body);
          doc.setTextColor(50, 50, 50);
          y = renderRichLine(doc, item.description, x, y, w, font, sizes.body, accent);
          y += 2;
        }
        y += 1;
      });
      break;
    }
    case "publications": {
      section.items.forEach((item) => {
        pageBreak();
        doc.setFont(font, "bold");
        doc.text(item.title, x, y);
        doc.setFont(font, "normal");
        doc.setTextColor(100, 100, 100);
        if (item.publisher) { doc.text(` — ${item.publisher}`, x + doc.getTextWidth(item.title), y); }
        y += 4;
        doc.setTextColor(50, 50, 50);
      });
      break;
    }
    default:
      break;
  }

  return y;
}
