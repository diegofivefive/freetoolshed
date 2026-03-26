import type { jsPDF } from "jspdf";

/** Segment of parsed rich text */
export interface RichTextSegment {
  text: string;
  bold: boolean;
  italic: boolean;
  link: string | null;
}

/**
 * Parse simple HTML (only <b>, <strong>, <i>, <em>, <a>) into segments.
 * Falls back gracefully for plain text (no tags = single segment).
 */
export function parseRichText(html: string): RichTextSegment[] {
  if (!html) return [];

  const segments: RichTextSegment[] = [];
  // Use regex to split on supported tags
  const tagRegex = /<\/?(b|strong|i|em|a)(\s[^>]*)?>/gi;
  let bold = false;
  let italic = false;
  let link: string | null = null;
  let lastIndex = 0;

  // Replace <br> and &nbsp; with spaces
  const cleaned = html.replace(/<br\s*\/?>/gi, " ").replace(/&nbsp;/gi, " ");

  let match: RegExpExecArray | null;
  while ((match = tagRegex.exec(cleaned)) !== null) {
    // Add text before this tag
    const textBefore = cleaned.slice(lastIndex, match.index);
    if (textBefore) {
      const decoded = decodeHtmlEntities(textBefore);
      if (decoded.trim() || decoded.includes(" ")) {
        segments.push({ text: decoded, bold, italic, link });
      }
    }
    lastIndex = match.index + match[0].length;

    const tag = match[1].toLowerCase();
    const isClosing = match[0].startsWith("</");

    if (tag === "b" || tag === "strong") {
      bold = !isClosing;
    } else if (tag === "i" || tag === "em") {
      italic = !isClosing;
    } else if (tag === "a") {
      if (isClosing) {
        link = null;
      } else {
        const hrefMatch = match[0].match(/href=["']([^"']*)["']/i);
        link = hrefMatch ? hrefMatch[1] : null;
      }
    }
  }

  // Remaining text
  const remaining = cleaned.slice(lastIndex);
  if (remaining) {
    const decoded = decodeHtmlEntities(remaining);
    if (decoded) {
      segments.push({ text: decoded, bold, italic, link });
    }
  }

  // If no segments, treat as plain text
  if (segments.length === 0 && html.trim()) {
    segments.push({ text: decodeHtmlEntities(html), bold: false, italic: false, link: null });
  }

  return segments;
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

/** Strip all HTML tags, returning plain text */
export function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

/**
 * Render rich text segments using jsPDF.
 * Draws text inline, handling bold/italic/link styling.
 * Returns the final Y position.
 */
export function renderRichLine(
  doc: jsPDF,
  html: string,
  x: number,
  y: number,
  maxW: number,
  font: string,
  bodyPt: number,
  accentRgb: { r: number; g: number; b: number },
  prefix?: string
): number {
  const segments = parseRichText(html);
  if (segments.length === 0) return y;

  const lineH = bodyPt * 0.4;

  // For simple text (no formatting), use the fast path
  const hasFormatting = segments.some((s) => s.bold || s.italic || s.link);
  if (!hasFormatting) {
    const plainText = prefix ? `${prefix}${stripHtml(html)}` : stripHtml(html);
    doc.setFont(font, "normal");
    doc.setFontSize(bodyPt);
    const lines = doc.splitTextToSize(plainText, maxW);
    doc.text(lines, x, y);
    return y + lines.length * lineH;
  }

  // Build the full plain text for line-wrapping calculation
  const fullText = prefix
    ? prefix + segments.map((s) => s.text).join("")
    : segments.map((s) => s.text).join("");

  // Split into visual lines for word wrapping
  doc.setFont(font, "normal");
  doc.setFontSize(bodyPt);
  const wrappedLines = doc.splitTextToSize(fullText, maxW);

  // For multi-line rich text, render line by line with style tracking
  // We need to map characters to their segments
  const allSegments: RichTextSegment[] = prefix
    ? [{ text: prefix, bold: false, italic: false, link: null }, ...segments]
    : [...segments];

  let charIndex = 0;
  for (const line of wrappedLines) {
    let lineX = x;
    let remaining = line.length;

    // Walk through segments that overlap with this line
    let segIdx = 0;
    let segCharOffset = 0;

    // Find which segment the current charIndex falls in
    let cumLen = 0;
    for (let i = 0; i < allSegments.length; i++) {
      if (cumLen + allSegments[i].text.length > charIndex) {
        segIdx = i;
        segCharOffset = charIndex - cumLen;
        break;
      }
      cumLen += allSegments[i].text.length;
    }

    while (remaining > 0 && segIdx < allSegments.length) {
      const seg = allSegments[segIdx];
      const availChars = seg.text.length - segCharOffset;
      const take = Math.min(remaining, availChars);
      const chunk = seg.text.slice(segCharOffset, segCharOffset + take);

      // Set font style
      const style = seg.bold && seg.italic ? "bolditalic" : seg.bold ? "bold" : seg.italic ? "italic" : "normal";
      doc.setFont(font, style);
      doc.setFontSize(bodyPt);

      if (seg.link) {
        doc.setTextColor(accentRgb.r, accentRgb.g, accentRgb.b);
      } else {
        doc.setTextColor(50, 50, 50);
      }

      doc.text(chunk, lineX, y);
      lineX += doc.getTextWidth(chunk);

      remaining -= take;
      segCharOffset += take;

      if (segCharOffset >= seg.text.length) {
        segIdx++;
        segCharOffset = 0;
      }
    }

    charIndex += line.length;
    // Skip whitespace that was used for line breaking
    if (charIndex < fullText.length && fullText[charIndex] === " ") {
      charIndex++;
    }
    y += lineH;
  }

  // Reset font
  doc.setFont(font, "normal");
  doc.setTextColor(50, 50, 50);

  return y;
}
