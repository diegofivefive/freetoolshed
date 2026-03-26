import type { jsPDF } from "jspdf";
import type { ResumeSection } from "../types";
import { SECTION_TYPE_LABELS, FONT_SIZE_OPTIONS } from "../constants";
import { formatDateRange, languageProficiencyLabel } from "../format";
import { renderRichLine, stripHtml } from "../rich-text";

export function hexToRgb(hex: string) {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
  };
}

export function getVisibleSections(sections: ResumeSection[]): ResumeSection[] {
  return [...sections].filter((s) => s.visible).sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getFontSizes(fontSize: string) {
  const opt = FONT_SIZE_OPTIONS.find((o) => o.value === fontSize) ?? FONT_SIZE_OPTIONS[1];
  return { body: opt.bodyPt, heading: opt.headingPt };
}

export function renderSectionContent(
  doc: jsPDF,
  section: ResumeSection,
  x: number,
  startY: number,
  w: number,
  font: string,
  bodyPt: number,
  accentRgb: { r: number; g: number; b: number },
  dateFormat: string,
  pageH: number,
  margin: number
): number {
  let y = startY;
  const lineH = bodyPt * 0.4;

  const pageBreak = () => {
    if (y > pageH - margin - 10) {
      doc.addPage();
      y = margin;
    }
  };

  doc.setFont(font, "normal");
  doc.setFontSize(bodyPt);
  doc.setTextColor(50, 50, 50);

  switch (section.type) {
    case "summary": {
      if (section.content) {
        pageBreak();
        y = renderRichLine(doc, section.content, x, y, w, font, bodyPt, accentRgb);
        y += 2;
      }
      break;
    }
    case "experience": {
      section.items.forEach((item) => {
        pageBreak();
        doc.setFont(font, "bold");
        doc.setFontSize(bodyPt);
        doc.setTextColor(30, 30, 30);
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
        doc.setFontSize(bodyPt);
        const sub = [item.company, item.location].filter(Boolean).join(" | ");
        if (sub) { doc.text(sub, x, y); y += 4; }
        doc.setTextColor(50, 50, 50);
        item.bullets.filter(Boolean).forEach((b) => {
          pageBreak();
          doc.setFont(font, "normal");
          doc.setFontSize(bodyPt);
          doc.setTextColor(50, 50, 50);
          y = renderRichLine(doc, b, x + 2, y, w - 4, font, bodyPt, accentRgb, "\u2022 ");
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
        doc.setTextColor(30, 30, 30);
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
          doc.setFontSize(bodyPt);
          doc.setTextColor(50, 50, 50);
          y = renderRichLine(doc, item.description, x, y, w, font, bodyPt, accentRgb);
          y += 2;
        }
        y += 2;
      });
      break;
    }
    case "skills": {
      const skills = section.items.filter((s) => s.name);
      if (skills.length > 0) {
        const text = skills.map((s) => `${s.name} (${s.proficiency})`).join("  \u2022  ");
        const lines = doc.splitTextToSize(text, w);
        doc.text(lines, x, y);
        y += lines.length * lineH + 2;
      }
      break;
    }
    case "certifications": {
      section.items.forEach((item) => {
        pageBreak();
        doc.setFont(font, "bold");
        doc.setTextColor(30, 30, 30);
        doc.text(item.name, x, y);
        doc.setFont(font, "normal");
        doc.setTextColor(100, 100, 100);
        if (item.issuer) doc.text(` \u2014 ${item.issuer}`, x + doc.getTextWidth(item.name), y);
        y += 4;
      });
      break;
    }
    case "languages": {
      const langs = section.items.filter((l) => l.name);
      if (langs.length > 0) {
        const text = langs.map((l) => `${l.name} (${languageProficiencyLabel(l.proficiency)})`).join("  \u2022  ");
        const lines = doc.splitTextToSize(text, w);
        doc.text(lines, x, y);
        y += lines.length * lineH + 2;
      }
      break;
    }
    case "projects": {
      section.items.forEach((item) => {
        pageBreak();
        doc.setFont(font, "bold");
        doc.setTextColor(30, 30, 30);
        doc.text(item.name, x, y);
        if (item.url) {
          doc.setFont(font, "normal");
          doc.setTextColor(accentRgb.r, accentRgb.g, accentRgb.b);
          doc.text(item.url, x + doc.getTextWidth(item.name) + 3, y);
        }
        y += 4;
        doc.setFont(font, "normal");
        doc.setTextColor(50, 50, 50);
        if (item.description) {
          doc.setFont(font, "normal");
          doc.setFontSize(bodyPt);
          doc.setTextColor(50, 50, 50);
          y = renderRichLine(doc, item.description, x, y, w, font, bodyPt, accentRgb);
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
        doc.setTextColor(30, 30, 30);
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
          doc.setFontSize(bodyPt);
          doc.setTextColor(50, 50, 50);
          y = renderRichLine(doc, item.description, x, y, w, font, bodyPt, accentRgb);
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
        doc.setTextColor(30, 30, 30);
        doc.text(item.title, x, y);
        if (item.issuer) {
          doc.setFont(font, "normal");
          doc.setTextColor(100, 100, 100);
          doc.text(` \u2014 ${item.issuer}`, x + doc.getTextWidth(item.title), y);
        }
        y += 4;
        doc.setFont(font, "normal");
        doc.setTextColor(50, 50, 50);
        if (item.description) {
          doc.setFont(font, "normal");
          doc.setFontSize(bodyPt);
          doc.setTextColor(50, 50, 50);
          y = renderRichLine(doc, item.description, x, y, w, font, bodyPt, accentRgb);
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
        doc.setTextColor(30, 30, 30);
        doc.text(item.title, x, y);
        doc.setFont(font, "normal");
        doc.setTextColor(100, 100, 100);
        if (item.publisher) doc.text(` \u2014 ${item.publisher}`, x + doc.getTextWidth(item.title), y);
        y += 4;
        doc.setTextColor(50, 50, 50);
      });
      break;
    }
    case "references": {
      section.items.forEach((item) => {
        pageBreak();
        doc.setFont(font, "bold");
        doc.setTextColor(30, 30, 30);
        doc.text(item.name, x, y);
        doc.setFont(font, "normal");
        doc.setTextColor(100, 100, 100);
        if (item.title) doc.text(` \u2014 ${item.title}${item.company ? `, ${item.company}` : ""}`, x + doc.getTextWidth(item.name), y);
        y += 4;
        doc.setTextColor(120, 120, 120);
        const contact = [item.email, item.phone].filter(Boolean).join(" | ");
        if (contact) { doc.text(contact, x, y); y += 4; }
        doc.setTextColor(50, 50, 50);
      });
      break;
    }
  }

  return y;
}

export function renderSectionHeading(
  doc: jsPDF,
  label: string,
  x: number,
  y: number,
  w: number,
  font: string,
  headingPt: number,
  accentRgb: { r: number; g: number; b: number },
  style: "underline" | "bar" | "plain"
): number {
  doc.setFont(font, "bold");
  doc.setFontSize(headingPt);
  doc.setTextColor(accentRgb.r, accentRgb.g, accentRgb.b);
  doc.text(label.toUpperCase(), x, y);

  if (style === "underline") {
    y += 1.5;
    doc.setDrawColor(accentRgb.r, accentRgb.g, accentRgb.b);
    doc.setLineWidth(0.4);
    doc.line(x, y, x + w, y);
    y += 4;
  } else if (style === "bar") {
    y += 1.5;
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(x, y, x + w, y);
    y += 4;
  } else {
    y += 5;
  }

  return y;
}
