"use client";

import DOMPurify from "dompurify";
import type { ResumeData, ResumeSection } from "@/lib/resume/types";
import { getSectionLabel, MARGIN_OPTIONS, SECTION_SPACING_OPTIONS, LINE_SPACING_OPTIONS } from "@/lib/resume/constants";
import { formatDateRange, proficiencyToPercentage, languageProficiencyLabel } from "@/lib/resume/format";
import type { ResumeSettings } from "@/lib/resume/types";

function sanitize(html: string): string {
  return DOMPurify.sanitize(html, { ALLOWED_TAGS: ["b", "strong", "i", "em", "a", "br", "u"], ALLOWED_ATTR: ["href", "target", "rel"] });
}

interface ResumePreviewProps {
  state: ResumeData;
}

const SCALE = 520 / 595;
const PAGE_W = 595;
const PAGE_H = 842;

const FONT_MAP: Record<string, string> = {
  helvetica: "Helvetica, Arial, sans-serif",
  times: "'Times New Roman', Times, serif",
  courier: "'Courier New', Courier, monospace",
};

const SIZE_MAP: Record<string, { body: number; heading: number; name: number }> = {
  compact: { body: 8.5, heading: 11, name: 16 },
  standard: { body: 9.5, heading: 12, name: 18 },
  spacious: { body: 10.5, heading: 13, name: 20 },
};

function getVisibleSections(sections: ResumeSection[]): ResumeSection[] {
  return [...sections].filter((s) => s.visible).sort((a, b) => a.sortOrder - b.sortOrder);
}

function getSpacing(settings: ResumeSettings) {
  const marginScale = MARGIN_OPTIONS.find((o) => o.value === settings.marginSize)?.scale ?? 1;
  const sectionScale = SECTION_SPACING_OPTIONS.find((o) => o.value === settings.sectionSpacing)?.scale ?? 1;
  const lineScale = LINE_SPACING_OPTIONS.find((o) => o.value === settings.lineSpacing)?.scale ?? 1;
  return { marginScale, sectionScale, lineScale };
}

// ── Shared renderers ────────────────────────────────────────

function ContactLine({ state, fontSize }: { state: ResumeData; fontSize: number }) {
  const { email, phone, location, website, linkedin } = state.personalInfo;
  const parts = [email, phone, location, website, linkedin].filter(Boolean);
  if (parts.length === 0) return null;
  return (
    <div style={{ fontSize: fontSize - 1, color: "#666", display: "flex", flexWrap: "wrap", gap: "4px 12px" }}>
      {parts.map((p, i) => (
        <span key={i}>{p}</span>
      ))}
    </div>
  );
}

function SectionContent({ section, accent, fontSize, dateFormat, lineScale = 1 }: {
  section: ResumeSection;
  accent: string;
  fontSize: number;
  dateFormat: string;
  lineScale?: number;
}) {
  const lh = 1.5 * lineScale;
  const lhBullet = 1.4 * lineScale;
  switch (section.type) {
    case "summary":
      return section.content ? (
        <p style={{ fontSize, color: "#444", lineHeight: lh }} dangerouslySetInnerHTML={{ __html: sanitize(section.content) }} />
      ) : null;

    case "experience":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {section.items.map((item) => (
            <div key={item.id}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <div>
                  <span style={{ fontWeight: 600, fontSize }}>{item.title}</span>
                  {item.company && <span style={{ fontSize, color: "#666" }}> at {item.company}</span>}
                </div>
                <span style={{ fontSize: fontSize - 1, color: "#888", whiteSpace: "nowrap" }}>
                  {formatDateRange(item.startDate, item.endDate, item.isCurrentRole, dateFormat as "Month YYYY")}
                </span>
              </div>
              {item.location && <div style={{ fontSize: fontSize - 1, color: "#888" }}>{item.location}</div>}
              {item.bullets.filter(Boolean).length > 0 && (
                <ul style={{ margin: "2px 0 0 14px", padding: 0, listStyle: "disc" }}>
                  {item.bullets.filter(Boolean).map((b, i) => (
                    <li key={i} style={{ fontSize, color: "#444", lineHeight: lhBullet }} dangerouslySetInnerHTML={{ __html: sanitize(b) }} />
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      );

    case "education":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {section.items.map((item) => (
            <div key={item.id}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <div>
                  <span style={{ fontWeight: 600, fontSize }}>{item.degree}</span>
                  {item.field && <span style={{ fontSize, color: "#666" }}> in {item.field}</span>}
                </div>
                <span style={{ fontSize: fontSize - 1, color: "#888", whiteSpace: "nowrap" }}>
                  {formatDateRange(item.startDate, item.endDate, false, dateFormat as "Month YYYY")}
                </span>
              </div>
              {item.school && <div style={{ fontSize, color: "#666" }}>{item.school}</div>}
              {item.gpa && <div style={{ fontSize: fontSize - 1, color: "#888" }}>GPA: {item.gpa}</div>}
              {item.description && <div style={{ fontSize, color: "#444", marginTop: 2 }} dangerouslySetInnerHTML={{ __html: sanitize(item.description) }} />}
            </div>
          ))}
        </div>
      );

    case "skills":
      return (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {section.items.filter((s) => s.name).map((item) => (
            <span key={item.id} style={{
              fontSize: fontSize - 1,
              padding: "2px 8px",
              borderRadius: 4,
              background: accent + "18",
              color: "#333",
            }}>
              {item.name}
              <span style={{ color: "#999", marginLeft: 4 }}>
                ({item.proficiency})
              </span>
            </span>
          ))}
        </div>
      );

    case "certifications":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {section.items.map((item) => (
            <div key={item.id} style={{ fontSize }}>
              <span style={{ fontWeight: 600 }}>{item.name}</span>
              {item.issuer && <span style={{ color: "#666" }}> — {item.issuer}</span>}
              {item.date && <span style={{ color: "#888", marginLeft: 6 }}>{item.date}</span>}
            </div>
          ))}
        </div>
      );

    case "languages":
      return (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 16px" }}>
          {section.items.filter((l) => l.name).map((item) => (
            <span key={item.id} style={{ fontSize }}>
              {item.name} <span style={{ color: "#888" }}>({languageProficiencyLabel(item.proficiency)})</span>
            </span>
          ))}
        </div>
      );

    case "projects":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {section.items.map((item) => (
            <div key={item.id}>
              <span style={{ fontWeight: 600, fontSize }}>{item.name}</span>
              {item.url && <span style={{ fontSize: fontSize - 1, color: accent, marginLeft: 6 }}>{item.url}</span>}
              {item.description && <div style={{ fontSize, color: "#444", marginTop: 1 }} dangerouslySetInnerHTML={{ __html: sanitize(item.description) }} />}
              {item.technologies.length > 0 && (
                <div style={{ fontSize: fontSize - 1, color: "#888", marginTop: 1 }}>
                  {item.technologies.join(", ")}
                </div>
              )}
            </div>
          ))}
        </div>
      );

    case "volunteer":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {section.items.map((item) => (
            <div key={item.id}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <div>
                  <span style={{ fontWeight: 600, fontSize }}>{item.role}</span>
                  {item.organization && <span style={{ fontSize, color: "#666" }}> at {item.organization}</span>}
                </div>
                <span style={{ fontSize: fontSize - 1, color: "#888", whiteSpace: "nowrap" }}>
                  {formatDateRange(item.startDate, item.endDate, false, dateFormat as "Month YYYY")}
                </span>
              </div>
              {item.description && <div style={{ fontSize, color: "#444", marginTop: 1 }} dangerouslySetInnerHTML={{ __html: sanitize(item.description) }} />}
            </div>
          ))}
        </div>
      );

    case "awards":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {section.items.map((item) => (
            <div key={item.id} style={{ fontSize }}>
              <span style={{ fontWeight: 600 }}>{item.title}</span>
              {item.issuer && <span style={{ color: "#666" }}> — {item.issuer}</span>}
              {item.date && <span style={{ color: "#888", marginLeft: 6 }}>{item.date}</span>}
              {item.description && <div style={{ color: "#444", marginTop: 1 }} dangerouslySetInnerHTML={{ __html: sanitize(item.description) }} />}
            </div>
          ))}
        </div>
      );

    case "publications":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {section.items.map((item) => (
            <div key={item.id} style={{ fontSize }}>
              <span style={{ fontWeight: 600 }}>{item.title}</span>
              {item.publisher && <span style={{ color: "#666" }}> — {item.publisher}</span>}
              {item.date && <span style={{ color: "#888", marginLeft: 6 }}>{item.date}</span>}
            </div>
          ))}
        </div>
      );

    case "references":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {section.items.map((item) => (
            <div key={item.id} style={{ fontSize }}>
              <span style={{ fontWeight: 600 }}>{item.name}</span>
              {item.title && <span style={{ color: "#666" }}> — {item.title}</span>}
              {item.company && <span style={{ color: "#666" }}>, {item.company}</span>}
              <div style={{ color: "#888", fontSize: fontSize - 1 }}>
                {[item.email, item.phone].filter(Boolean).join(" | ")}
              </div>
            </div>
          ))}
        </div>
      );

    case "custom":
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {section.items.map((item) => (
            <div key={item.id}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontWeight: 600, fontSize }}>{item.title}</span>
                {item.date && (
                  <span style={{ fontSize: fontSize - 1, color: "#888", whiteSpace: "nowrap" }}>{item.date}</span>
                )}
              </div>
              {item.subtitle && <div style={{ fontSize, color: "#666" }}>{item.subtitle}</div>}
              {item.description && <div style={{ fontSize, color: "#444", marginTop: 1, lineHeight: lh }} dangerouslySetInnerHTML={{ __html: sanitize(item.description) }} />}
            </div>
          ))}
        </div>
      );

    default:
      return null;
  }
}

// ── Template layouts ─────────────────────────────────────────

function ModernLayout({ state }: { state: ResumeData }) {
  const accent = state.settings.accentColor;
  const sizes = SIZE_MAP[state.settings.fontSize];
  const font = FONT_MAP[state.settings.fontFamily];
  const sp = getSpacing(state.settings);
  const sections = getVisibleSections(state.sections);
  const sidebarSections = sections.filter((s) => ["skills", "languages", "certifications"].includes(s.type));
  const mainSections = sections.filter((s) => !["skills", "languages", "certifications"].includes(s.type));

  return (
    <div style={{ display: "flex", height: "100%", fontFamily: font }}>
      {/* Sidebar */}
      <div style={{ width: "32%", background: accent + "12", padding: 20 * sp.marginScale, boxSizing: "border-box" }}>
        {state.personalInfo.photoUrl && (
          <img src={state.personalInfo.photoUrl} alt="" style={{ width: 70, height: 70, borderRadius: "50%", objectFit: "cover", marginBottom: 12 }} />
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: "4px 0" }}>
          {state.personalInfo.email && <div style={{ fontSize: sizes.body - 1, color: "#555" }}>{state.personalInfo.email}</div>}
          {state.personalInfo.phone && <div style={{ fontSize: sizes.body - 1, color: "#555" }}>{state.personalInfo.phone}</div>}
          {state.personalInfo.location && <div style={{ fontSize: sizes.body - 1, color: "#555" }}>{state.personalInfo.location}</div>}
          {state.personalInfo.website && <div style={{ fontSize: sizes.body - 1, color: accent }}>{state.personalInfo.website}</div>}
          {state.personalInfo.linkedin && <div style={{ fontSize: sizes.body - 1, color: accent }}>{state.personalInfo.linkedin}</div>}
        </div>
        {sidebarSections.map((section) => (
          <div key={section.id} style={{ marginTop: 16 * sp.sectionScale }}>
            <div style={{ fontSize: sizes.heading - 2, fontWeight: 700, color: accent, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>
              {getSectionLabel(section)}
            </div>
            <SectionContent section={section} accent={accent} fontSize={sizes.body} dateFormat={state.settings.dateFormat} lineScale={sp.lineScale} />
          </div>
        ))}
      </div>
      {/* Main */}
      <div style={{ flex: 1, padding: 20 * sp.marginScale, boxSizing: "border-box" }}>
        <div style={{ fontSize: sizes.name, fontWeight: 700, color: "#1a1a1a" }}>{state.personalInfo.name || "Your Name"}</div>
        {state.personalInfo.title && <div style={{ fontSize: sizes.heading, color: accent, marginTop: 2 }}>{state.personalInfo.title}</div>}
        {mainSections.map((section) => (
          <div key={section.id} style={{ marginTop: 14 * sp.sectionScale }}>
            <div style={{ fontSize: sizes.heading, fontWeight: 700, color: accent, borderBottom: `1.5px solid ${accent}40`, paddingBottom: 3, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>
              {getSectionLabel(section)}
            </div>
            <SectionContent section={section} accent={accent} fontSize={sizes.body} dateFormat={state.settings.dateFormat} lineScale={sp.lineScale} />
          </div>
        ))}
      </div>
    </div>
  );
}

function ClassicLayout({ state }: { state: ResumeData }) {
  const sizes = SIZE_MAP[state.settings.fontSize];
  const font = FONT_MAP[state.settings.fontFamily];
  const sp = getSpacing(state.settings);
  const sections = getVisibleSections(state.sections);

  return (
    <div style={{ padding: 36 * sp.marginScale, fontFamily: font, boxSizing: "border-box" }}>
      <div style={{ textAlign: "center", marginBottom: 12 }}>
        <div style={{ fontSize: sizes.name, fontWeight: 700 }}>{state.personalInfo.name || "Your Name"}</div>
        {state.personalInfo.title && <div style={{ fontSize: sizes.heading, color: "#555", marginTop: 2 }}>{state.personalInfo.title}</div>}
        <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "2px 12px", marginTop: 4 }}>
          {[state.personalInfo.email, state.personalInfo.phone, state.personalInfo.location, state.personalInfo.website, state.personalInfo.linkedin]
            .filter(Boolean).map((p, i) => (
              <span key={i} style={{ fontSize: sizes.body - 1, color: "#666" }}>{p}</span>
            ))}
        </div>
      </div>
      <hr style={{ border: "none", borderTop: "1.5px solid #333", margin: "8px 0" }} />
      {sections.map((section) => (
        <div key={section.id} style={{ marginTop: 12 * sp.sectionScale }}>
          <div style={{ fontSize: sizes.heading, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, borderBottom: "1px solid #ccc", paddingBottom: 2, marginBottom: 6 }}>
            {getSectionLabel(section)}
          </div>
          <SectionContent section={section} accent="#333" fontSize={sizes.body} dateFormat={state.settings.dateFormat} lineScale={sp.lineScale} />
        </div>
      ))}
    </div>
  );
}

function ProfessionalLayout({ state }: { state: ResumeData }) {
  const accent = state.settings.accentColor;
  const sizes = SIZE_MAP[state.settings.fontSize];
  const font = FONT_MAP[state.settings.fontFamily];
  const sp = getSpacing(state.settings);
  const sections = getVisibleSections(state.sections);

  return (
    <div style={{ padding: 36 * sp.marginScale, fontFamily: font, boxSizing: "border-box" }}>
      {/* Header: two columns */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: sizes.name, fontWeight: 700, color: accent }}>{state.personalInfo.name || "Your Name"}</div>
          {state.personalInfo.title && <div style={{ fontSize: sizes.heading, color: "#555", marginTop: 2 }}>{state.personalInfo.title}</div>}
        </div>
        <div style={{ textAlign: "right", display: "flex", flexDirection: "column", gap: 1 }}>
          {state.personalInfo.email && <div style={{ fontSize: sizes.body - 1, color: "#666" }}>{state.personalInfo.email}</div>}
          {state.personalInfo.phone && <div style={{ fontSize: sizes.body - 1, color: "#666" }}>{state.personalInfo.phone}</div>}
          {state.personalInfo.location && <div style={{ fontSize: sizes.body - 1, color: "#666" }}>{state.personalInfo.location}</div>}
          {state.personalInfo.website && <div style={{ fontSize: sizes.body - 1, color: accent }}>{state.personalInfo.website}</div>}
          {state.personalInfo.linkedin && <div style={{ fontSize: sizes.body - 1, color: accent }}>{state.personalInfo.linkedin}</div>}
        </div>
      </div>
      <div style={{ height: 3, background: accent, marginBottom: 14 }} />
      {sections.map((section) => (
        <div key={section.id} style={{ marginTop: 12 * sp.sectionScale }}>
          <div style={{ fontSize: sizes.heading, fontWeight: 700, color: accent, borderBottom: `2px solid ${accent}30`, paddingBottom: 3, marginBottom: 6 }}>
            {getSectionLabel(section)}
          </div>
          <SectionContent section={section} accent={accent} fontSize={sizes.body} dateFormat={state.settings.dateFormat} lineScale={sp.lineScale} />
        </div>
      ))}
    </div>
  );
}

function MinimalLayout({ state }: { state: ResumeData }) {
  const sizes = SIZE_MAP[state.settings.fontSize];
  const font = FONT_MAP[state.settings.fontFamily];
  const sp = getSpacing(state.settings);
  const sections = getVisibleSections(state.sections);

  return (
    <div style={{ padding: 40 * sp.marginScale, fontFamily: font, boxSizing: "border-box" }}>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: sizes.name, fontWeight: 600 }}>{state.personalInfo.name || "Your Name"}</div>
        {state.personalInfo.title && <div style={{ fontSize: sizes.body + 1, color: "#888", marginTop: 2 }}>{state.personalInfo.title}</div>}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "2px 10px", marginTop: 4 }}>
          {[state.personalInfo.email, state.personalInfo.phone, state.personalInfo.location, state.personalInfo.website, state.personalInfo.linkedin]
            .filter(Boolean).map((p, i) => (
              <span key={i} style={{ fontSize: sizes.body - 1, color: "#999" }}>{p}</span>
            ))}
        </div>
      </div>
      {sections.map((section) => (
        <div key={section.id} style={{ marginTop: 14 * sp.sectionScale }}>
          <div style={{ fontSize: sizes.body, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1.5, color: "#999", marginBottom: 5 }}>
            {getSectionLabel(section)}
          </div>
          <SectionContent section={section} accent="#666" fontSize={sizes.body} dateFormat={state.settings.dateFormat} lineScale={sp.lineScale} />
        </div>
      ))}
    </div>
  );
}

// ── Executive layout ──────────────────────────────────────────

function ExecutiveLayout({ state }: { state: ResumeData }) {
  const accent = state.settings.accentColor;
  const sizes = SIZE_MAP[state.settings.fontSize];
  const font = FONT_MAP[state.settings.fontFamily];
  const sp = getSpacing(state.settings);
  const sections = getVisibleSections(state.sections);
  const hPad = Math.round(28 * sp.marginScale);

  return (
    <div style={{ fontFamily: font }}>
      {/* Dark accent header */}
      <div style={{ background: accent, padding: `20px ${hPad}px 16px`, color: "#fff" }}>
        <div style={{ fontSize: sizes.name + 2, fontWeight: 700 }}>{state.personalInfo.name || "Your Name"}</div>
        {state.personalInfo.title && <div style={{ fontSize: sizes.heading, marginTop: 2, opacity: 0.9 }}>{state.personalInfo.title}</div>}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "2px 12px", marginTop: 6 }}>
          {[state.personalInfo.email, state.personalInfo.phone, state.personalInfo.location, state.personalInfo.website, state.personalInfo.linkedin]
            .filter(Boolean).map((p, i) => (
              <span key={i} style={{ fontSize: sizes.body - 1, opacity: 0.85 }}>{p}</span>
            ))}
        </div>
      </div>
      <div style={{ padding: `14px ${hPad}px ${hPad}px` }}>
        {sections.map((section) => (
          <div key={section.id} style={{ marginTop: 14 * sp.sectionScale }}>
            <div style={{ fontSize: sizes.heading, fontWeight: 700, color: accent, borderBottom: `2px solid ${accent}30`, paddingBottom: 3, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>
              {getSectionLabel(section)}
            </div>
            <SectionContent section={section} accent={accent} fontSize={sizes.body} dateFormat={state.settings.dateFormat} lineScale={sp.lineScale} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Creative layout (right sidebar) ─────────────────────────

function CreativeLayout({ state }: { state: ResumeData }) {
  const accent = state.settings.accentColor;
  const sizes = SIZE_MAP[state.settings.fontSize];
  const font = FONT_MAP[state.settings.fontFamily];
  const sp = getSpacing(state.settings);
  const sections = getVisibleSections(state.sections);
  const sidebarSections = sections.filter((s) => ["skills", "languages", "certifications"].includes(s.type));
  const mainSections = sections.filter((s) => !["skills", "languages", "certifications"].includes(s.type));

  return (
    <div style={{ display: "flex", height: "100%", fontFamily: font }}>
      {/* Main left */}
      <div style={{ flex: 1, padding: 20 * sp.marginScale, boxSizing: "border-box" }}>
        <div style={{ fontSize: sizes.name, fontWeight: 700, color: "#1a1a1a" }}>{state.personalInfo.name || "Your Name"}</div>
        {state.personalInfo.title && <div style={{ fontSize: sizes.heading, color: accent, marginTop: 2 }}>{state.personalInfo.title}</div>}
        {mainSections.map((section) => (
          <div key={section.id} style={{ marginTop: 14 * sp.sectionScale }}>
            <div style={{ fontSize: sizes.heading, fontWeight: 700, color: accent, borderBottom: `1.5px solid ${accent}40`, paddingBottom: 3, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>
              {getSectionLabel(section)}
            </div>
            <SectionContent section={section} accent={accent} fontSize={sizes.body} dateFormat={state.settings.dateFormat} lineScale={sp.lineScale} />
          </div>
        ))}
      </div>
      {/* Right sidebar */}
      <div style={{ width: "32%", background: accent + "12", padding: 20 * sp.marginScale, boxSizing: "border-box" }}>
        {state.personalInfo.photoUrl && (
          <img src={state.personalInfo.photoUrl} alt="" style={{ width: 70, height: 70, borderRadius: "50%", objectFit: "cover", marginBottom: 12 }} />
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: "4px 0" }}>
          {state.personalInfo.email && <div style={{ fontSize: sizes.body - 1, color: "#555" }}>{state.personalInfo.email}</div>}
          {state.personalInfo.phone && <div style={{ fontSize: sizes.body - 1, color: "#555" }}>{state.personalInfo.phone}</div>}
          {state.personalInfo.location && <div style={{ fontSize: sizes.body - 1, color: "#555" }}>{state.personalInfo.location}</div>}
          {state.personalInfo.website && <div style={{ fontSize: sizes.body - 1, color: accent }}>{state.personalInfo.website}</div>}
          {state.personalInfo.linkedin && <div style={{ fontSize: sizes.body - 1, color: accent }}>{state.personalInfo.linkedin}</div>}
        </div>
        {sidebarSections.map((section) => (
          <div key={section.id} style={{ marginTop: 16 * sp.sectionScale }}>
            <div style={{ fontSize: sizes.heading - 2, fontWeight: 700, color: accent, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>
              {getSectionLabel(section)}
            </div>
            <SectionContent section={section} accent={accent} fontSize={sizes.body} dateFormat={state.settings.dateFormat} lineScale={sp.lineScale} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Compact layout ───────────────────────────────────────────

function CompactLayout({ state }: { state: ResumeData }) {
  const accent = state.settings.accentColor;
  const sizes = SIZE_MAP[state.settings.fontSize];
  const font = FONT_MAP[state.settings.fontFamily];
  const sp = getSpacing(state.settings);
  const sections = getVisibleSections(state.sections);

  return (
    <div style={{ padding: 20 * sp.marginScale, fontFamily: font, boxSizing: "border-box" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: sizes.name - 2, fontWeight: 700, color: accent }}>{state.personalInfo.name || "Your Name"}</div>
          {state.personalInfo.title && <div style={{ fontSize: sizes.body, color: "#666", marginTop: 1 }}>{state.personalInfo.title}</div>}
        </div>
        <div style={{ textAlign: "right", display: "flex", flexDirection: "column", gap: 1 }}>
          {state.personalInfo.email && <div style={{ fontSize: sizes.body - 2, color: "#888" }}>{state.personalInfo.email}</div>}
          {state.personalInfo.phone && <div style={{ fontSize: sizes.body - 2, color: "#888" }}>{state.personalInfo.phone}</div>}
          {state.personalInfo.location && <div style={{ fontSize: sizes.body - 2, color: "#888" }}>{state.personalInfo.location}</div>}
          {state.personalInfo.website && <div style={{ fontSize: sizes.body - 2, color: "#888" }}>{state.personalInfo.website}</div>}
        </div>
      </div>
      <div style={{ height: 1, background: accent, margin: "6px 0" }} />
      {sections.map((section) => (
        <div key={section.id} style={{ marginTop: 8 * sp.sectionScale }}>
          <div style={{ fontSize: sizes.body, fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: 0.5, borderBottom: "1px solid #e5e5e5", paddingBottom: 1, marginBottom: 4 }}>
            {getSectionLabel(section)}
          </div>
          <SectionContent section={section} accent={accent} fontSize={sizes.body - 1} dateFormat={state.settings.dateFormat} lineScale={sp.lineScale} />
        </div>
      ))}
    </div>
  );
}

// ── Elegant layout ───────────────────────────────────────────

function ElegantLayout({ state }: { state: ResumeData }) {
  const accent = state.settings.accentColor;
  const sizes = SIZE_MAP[state.settings.fontSize];
  const font = FONT_MAP[state.settings.fontFamily];
  const sp = getSpacing(state.settings);
  const sections = getVisibleSections(state.sections);

  return (
    <div style={{ padding: 36 * sp.marginScale, fontFamily: font, boxSizing: "border-box" }}>
      {/* Top decorative border */}
      <div style={{ borderTop: `2px solid ${accent}`, paddingTop: 2, borderBottom: `0.5px solid ${accent}40`, marginBottom: 8 }}>
        <div style={{ height: 1 }} />
      </div>
      <div style={{ textAlign: "center", marginBottom: 8 }}>
        <div style={{ fontSize: sizes.name, fontWeight: 700 }}>{state.personalInfo.name || "Your Name"}</div>
        {state.personalInfo.title && <div style={{ fontSize: sizes.heading, color: accent, marginTop: 2 }}>{state.personalInfo.title}</div>}
        <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "2px 8px", marginTop: 4 }}>
          {[state.personalInfo.email, state.personalInfo.phone, state.personalInfo.location, state.personalInfo.website, state.personalInfo.linkedin]
            .filter(Boolean).map((p, i) => (
              <span key={i} style={{ fontSize: sizes.body - 1, color: "#888" }}>
                {i > 0 && <span style={{ color: accent, margin: "0 4px" }}>{"\u2666"}</span>}
                {p}
              </span>
            ))}
        </div>
      </div>
      {/* Bottom decorative border */}
      <div style={{ borderTop: `0.5px solid ${accent}40`, paddingTop: 2, borderBottom: `2px solid ${accent}`, marginBottom: 12 }}>
        <div style={{ height: 1 }} />
      </div>
      {sections.map((section) => (
        <div key={section.id} style={{ marginTop: 14 * sp.sectionScale }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <div style={{ flex: 1, height: 1, background: `${accent}30` }} />
            <div style={{ fontSize: sizes.heading, fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: 1 }}>
              {getSectionLabel(section)}
            </div>
            <div style={{ flex: 1, height: 1, background: `${accent}30` }} />
          </div>
          <SectionContent section={section} accent={accent} fontSize={sizes.body} dateFormat={state.settings.dateFormat} lineScale={sp.lineScale} />
        </div>
      ))}
    </div>
  );
}

// ── Bold layout ──────────────────────────────────────────────

function BoldLayout({ state }: { state: ResumeData }) {
  const accent = state.settings.accentColor;
  const sizes = SIZE_MAP[state.settings.fontSize];
  const font = FONT_MAP[state.settings.fontFamily];
  const sp = getSpacing(state.settings);
  const sections = getVisibleSections(state.sections);

  return (
    <div style={{ padding: 28 * sp.marginScale, fontFamily: font, boxSizing: "border-box" }}>
      <div style={{ fontSize: sizes.name + 4, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: "#1a1a1a" }}>
        {state.personalInfo.name || "Your Name"}
      </div>
      <div style={{ height: 4, background: accent, margin: "6px 0 8px" }} />
      {state.personalInfo.title && (
        <div style={{ fontSize: sizes.heading + 1, fontWeight: 700, textTransform: "uppercase", color: "#555", letterSpacing: 1 }}>{state.personalInfo.title}</div>
      )}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "2px 12px", marginTop: 4 }}>
        {[state.personalInfo.email, state.personalInfo.phone, state.personalInfo.location, state.personalInfo.website, state.personalInfo.linkedin]
          .filter(Boolean).map((p, i) => (
            <span key={i} style={{ fontSize: sizes.body - 1, color: "#888" }}>{p}</span>
          ))}
      </div>
      {sections.map((section) => (
        <div key={section.id} style={{ marginTop: 14 * sp.sectionScale }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
            <div style={{ width: 4, height: 16, background: accent, borderRadius: 1 }} />
            <div style={{ fontSize: sizes.heading, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>
              {getSectionLabel(section)}
            </div>
          </div>
          <div style={{ borderTop: "2px solid #e5e5e5", paddingTop: 6 }}>
            <SectionContent section={section} accent={accent} fontSize={sizes.body} dateFormat={state.settings.dateFormat} lineScale={sp.lineScale} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Technical layout ─────────────────────────────────────────

function TechnicalLayout({ state }: { state: ResumeData }) {
  const accent = state.settings.accentColor;
  const sizes = SIZE_MAP[state.settings.fontSize];
  const font = FONT_MAP[state.settings.fontFamily];
  const sp = getSpacing(state.settings);
  const sections = getVisibleSections(state.sections);

  return (
    <div style={{ padding: 24 * sp.marginScale, fontFamily: font, boxSizing: "border-box" }}>
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: sizes.name, fontWeight: 700 }}>{state.personalInfo.name || "Your Name"}</div>
        {state.personalInfo.title && <div style={{ fontSize: sizes.heading, color: accent, marginTop: 2 }}>{state.personalInfo.title}</div>}
        <div style={{ fontSize: sizes.body - 1, color: "#888", marginTop: 4 }}>
          {[
            state.personalInfo.email && `Email: ${state.personalInfo.email}`,
            state.personalInfo.phone && `Phone: ${state.personalInfo.phone}`,
            state.personalInfo.location && `Location: ${state.personalInfo.location}`,
          ].filter(Boolean).join("  |  ")}
        </div>
        {(state.personalInfo.website || state.personalInfo.linkedin) && (
          <div style={{ fontSize: sizes.body - 1, color: "#888", marginTop: 1 }}>
            {[
              state.personalInfo.website && `Web: ${state.personalInfo.website}`,
              state.personalInfo.linkedin && `LinkedIn: ${state.personalInfo.linkedin}`,
            ].filter(Boolean).join("  |  ")}
          </div>
        )}
      </div>
      <div style={{ height: 1, background: accent, margin: "6px 0 10px" }} />
      {sections.map((section) => (
        <div key={section.id} style={{ display: "flex", gap: 12, marginTop: 10 * sp.sectionScale, minHeight: 30 }}>
          {/* Left gutter label */}
          <div style={{ width: 90, flexShrink: 0, paddingTop: 1 }}>
            <div style={{ fontSize: sizes.body - 1, fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: 0.5 }}>
              {getSectionLabel(section)}
            </div>
          </div>
          {/* Vertical gutter line */}
          <div style={{ width: 1, background: "#e5e5e5", flexShrink: 0 }} />
          {/* Content */}
          <div style={{ flex: 1 }}>
            <SectionContent section={section} accent={accent} fontSize={sizes.body} dateFormat={state.settings.dateFormat} lineScale={sp.lineScale} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Columns layout ───────────────────────────────────────────

function ColumnsLayout({ state }: { state: ResumeData }) {
  const accent = state.settings.accentColor;
  const sizes = SIZE_MAP[state.settings.fontSize];
  const font = FONT_MAP[state.settings.fontFamily];
  const sp = getSpacing(state.settings);
  const sections = getVisibleSections(state.sections);
  const leftSections = sections.filter((_, i) => i % 2 === 0);
  const rightSections = sections.filter((_, i) => i % 2 === 1);

  return (
    <div style={{ fontFamily: font, boxSizing: "border-box" }}>
      <div style={{ textAlign: "center", padding: `${Math.round(24 * sp.marginScale)}px ${Math.round(28 * sp.marginScale)}px 12px` }}>
        <div style={{ fontSize: sizes.name, fontWeight: 700, color: accent }}>{state.personalInfo.name || "Your Name"}</div>
        {state.personalInfo.title && <div style={{ fontSize: sizes.heading, color: "#555", marginTop: 2 }}>{state.personalInfo.title}</div>}
        <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "2px 10px", marginTop: 4 }}>
          {[state.personalInfo.email, state.personalInfo.phone, state.personalInfo.location, state.personalInfo.website, state.personalInfo.linkedin]
            .filter(Boolean).map((p, i) => (
              <span key={i} style={{ fontSize: sizes.body - 1, color: "#888" }}>{p}</span>
            ))}
        </div>
      </div>
      <div style={{ height: 2, background: accent, margin: `0 ${Math.round(24 * sp.marginScale)}px 12px` }} />
      <div style={{ display: "flex", gap: 16, padding: `0 ${Math.round(24 * sp.marginScale)}px ${Math.round(24 * sp.marginScale)}px` }}>
        <div style={{ flex: 1 }}>
          {leftSections.map((section) => (
            <div key={section.id} style={{ marginTop: 10 * sp.sectionScale }}>
              <div style={{ fontSize: sizes.heading - 1, fontWeight: 700, color: accent, borderBottom: `1.5px solid ${accent}30`, paddingBottom: 2, marginBottom: 5, textTransform: "uppercase", letterSpacing: 0.5 }}>
                {getSectionLabel(section)}
              </div>
              <SectionContent section={section} accent={accent} fontSize={sizes.body - 0.5} dateFormat={state.settings.dateFormat} lineScale={sp.lineScale} />
            </div>
          ))}
        </div>
        <div style={{ flex: 1 }}>
          {rightSections.map((section) => (
            <div key={section.id} style={{ marginTop: 10 * sp.sectionScale }}>
              <div style={{ fontSize: sizes.heading - 1, fontWeight: 700, color: accent, borderBottom: `1.5px solid ${accent}30`, paddingBottom: 2, marginBottom: 5, textTransform: "uppercase", letterSpacing: 0.5 }}>
                {getSectionLabel(section)}
              </div>
              <SectionContent section={section} accent={accent} fontSize={sizes.body - 0.5} dateFormat={state.settings.dateFormat} lineScale={sp.lineScale} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Timeline layout ──────────────────────────────────────────

function TimelineLayout({ state }: { state: ResumeData }) {
  const accent = state.settings.accentColor;
  const sizes = SIZE_MAP[state.settings.fontSize];
  const font = FONT_MAP[state.settings.fontFamily];
  const sp = getSpacing(state.settings);
  const sections = getVisibleSections(state.sections);

  return (
    <div style={{ padding: 28 * sp.marginScale, fontFamily: font, boxSizing: "border-box" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <div>
          <div style={{ fontSize: sizes.name, fontWeight: 700 }}>{state.personalInfo.name || "Your Name"}</div>
          {state.personalInfo.title && <div style={{ fontSize: sizes.heading, color: accent, marginTop: 2 }}>{state.personalInfo.title}</div>}
          {(state.personalInfo.website || state.personalInfo.linkedin) && (
            <div style={{ fontSize: sizes.body - 1, color: accent, marginTop: 2 }}>
              {[state.personalInfo.website, state.personalInfo.linkedin].filter(Boolean).join("  |  ")}
            </div>
          )}
        </div>
        <div style={{ textAlign: "right" }}>
          {state.personalInfo.email && <div style={{ fontSize: sizes.body - 1, color: "#888" }}>{state.personalInfo.email}</div>}
          {state.personalInfo.phone && <div style={{ fontSize: sizes.body - 1, color: "#888" }}>{state.personalInfo.phone}</div>}
          {state.personalInfo.location && <div style={{ fontSize: sizes.body - 1, color: "#888" }}>{state.personalInfo.location}</div>}
        </div>
      </div>
      <div style={{ height: 1.5, background: accent, marginBottom: 14 }} />
      {sections.map((section) => (
        <div key={section.id} style={{ display: "flex", gap: 12, marginTop: 10 * sp.sectionScale }}>
          {/* Timeline dot + line */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 12, flexShrink: 0, paddingTop: 2 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: accent, flexShrink: 0 }} />
            <div style={{ width: 1.5, flex: 1, background: `${accent}40`, marginTop: 2 }} />
          </div>
          {/* Content */}
          <div style={{ flex: 1, paddingBottom: 6 }}>
            <div style={{ fontSize: sizes.heading, fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 5 }}>
              {getSectionLabel(section)}
            </div>
            <SectionContent section={section} accent={accent} fontSize={sizes.body} dateFormat={state.settings.dateFormat} lineScale={sp.lineScale} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main preview ─────────────────────────────────────────────

const LAYOUT_MAP: Record<string, React.ComponentType<{ state: ResumeData }>> = {
  modern: ModernLayout,
  classic: ClassicLayout,
  professional: ProfessionalLayout,
  minimal: MinimalLayout,
  executive: ExecutiveLayout,
  creative: CreativeLayout,
  compact: CompactLayout,
  elegant: ElegantLayout,
  bold: BoldLayout,
  technical: TechnicalLayout,
  columns: ColumnsLayout,
  timeline: TimelineLayout,
};

export function ResumePreview({ state }: ResumePreviewProps) {
  const Layout = LAYOUT_MAP[state.settings.template] ?? ModernLayout;

  return (
    <div
      className="origin-top-left"
      style={{
        width: PAGE_W,
        height: PAGE_H,
        transform: `scale(${SCALE})`,
      }}
    >
      <div
        style={{
          width: PAGE_W,
          height: PAGE_H,
          fontSize: 10,
          color: "#1a1a1a",
          background: "#ffffff",
          boxSizing: "border-box",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Layout state={state} />
      </div>
    </div>
  );
}
