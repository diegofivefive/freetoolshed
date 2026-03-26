import type {
  SectionType,
  ResumeData,
  ResumeSettings,
  SkillProficiency,
  LanguageProficiency,
  ResumeFontFamily,
  ResumeFontSize,
  ResumeDateFormat,
} from "./types";

// ── Section metadata ─────────────────────────────────────────
export const SECTION_TYPE_LABELS: Record<SectionType, string> = {
  summary: "Professional Summary",
  experience: "Work Experience",
  education: "Education",
  skills: "Skills",
  certifications: "Certifications",
  languages: "Languages",
  projects: "Projects",
  volunteer: "Volunteer Experience",
  awards: "Awards & Honors",
  publications: "Publications",
  references: "References",
};

export const SECTION_TYPE_ICONS: Record<SectionType, string> = {
  summary: "FileText",
  experience: "Briefcase",
  education: "GraduationCap",
  skills: "Wrench",
  certifications: "Award",
  languages: "Globe",
  projects: "FolderOpen",
  volunteer: "Heart",
  awards: "Trophy",
  publications: "BookOpen",
  references: "Users",
};

// Sections that cannot be deleted (but can be hidden)
export const CORE_SECTIONS: SectionType[] = [
  "summary",
  "experience",
  "education",
  "skills",
];

// Sections available to add
export const OPTIONAL_SECTIONS: SectionType[] = [
  "certifications",
  "languages",
  "projects",
  "volunteer",
  "awards",
  "publications",
  "references",
];

// ── Proficiency levels ───────────────────────────────────────
export const SKILL_PROFICIENCY_OPTIONS: {
  label: string;
  value: SkillProficiency;
}[] = [
  { label: "Beginner", value: "beginner" },
  { label: "Intermediate", value: "intermediate" },
  { label: "Advanced", value: "advanced" },
  { label: "Expert", value: "expert" },
];

export const LANGUAGE_PROFICIENCY_OPTIONS: {
  label: string;
  value: LanguageProficiency;
}[] = [
  { label: "Basic", value: "basic" },
  { label: "Conversational", value: "conversational" },
  { label: "Professional", value: "professional" },
  { label: "Native / Fluent", value: "native" },
];

// ── Style options ────────────────────────────────────────────
export const ACCENT_PRESETS = [
  { name: "Emerald", hex: "#10b981" },
  { name: "Blue", hex: "#3b82f6" },
  { name: "Indigo", hex: "#6366f1" },
  { name: "Violet", hex: "#8b5cf6" },
  { name: "Rose", hex: "#f43f5e" },
  { name: "Amber", hex: "#f59e0b" },
  { name: "Teal", hex: "#14b8a6" },
  { name: "Slate", hex: "#64748b" },
];

export const FONT_OPTIONS: { label: string; value: ResumeFontFamily }[] = [
  { label: "Helvetica (Sans-Serif)", value: "helvetica" },
  { label: "Times (Serif)", value: "times" },
  { label: "Courier (Monospace)", value: "courier" },
];

export const FONT_SIZE_OPTIONS: {
  label: string;
  value: ResumeFontSize;
  bodyPt: number;
  headingPt: number;
}[] = [
  { label: "Compact", value: "compact", bodyPt: 9, headingPt: 12 },
  { label: "Standard", value: "standard", bodyPt: 10, headingPt: 14 },
  { label: "Spacious", value: "spacious", bodyPt: 11, headingPt: 16 },
];

export const DATE_FORMAT_OPTIONS: {
  label: string;
  value: ResumeDateFormat;
}[] = [
  { label: "Jan 2024", value: "Month YYYY" },
  { label: "01/2024", value: "MM/YYYY" },
  { label: "2024", value: "YYYY" },
];

// ── Defaults ─────────────────────────────────────────────────
export const DEFAULT_SETTINGS: ResumeSettings = {
  template: "modern",
  accentColor: "#3b82f6",
  fontFamily: "helvetica",
  dateFormat: "Month YYYY",
  fontSize: "standard",
};

export function createDefaultResumeData(): ResumeData {
  return {
    personalInfo: {
      name: "",
      title: "",
      email: "",
      phone: "",
      location: "",
      website: "",
      linkedin: "",
      photoUrl: null,
    },
    sections: [
      {
        id: crypto.randomUUID(),
        type: "summary",
        visible: true,
        sortOrder: 0,
        content: "",
      },
      {
        id: crypto.randomUUID(),
        type: "experience",
        visible: true,
        sortOrder: 1,
        items: [
          {
            id: crypto.randomUUID(),
            company: "",
            title: "",
            startDate: "",
            endDate: "",
            isCurrentRole: false,
            location: "",
            bullets: [""],
          },
        ],
      },
      {
        id: crypto.randomUUID(),
        type: "education",
        visible: true,
        sortOrder: 2,
        items: [
          {
            id: crypto.randomUUID(),
            school: "",
            degree: "",
            field: "",
            startDate: "",
            endDate: "",
            gpa: "",
            description: "",
          },
        ],
      },
      {
        id: crypto.randomUUID(),
        type: "skills",
        visible: true,
        sortOrder: 3,
        items: [
          {
            id: crypto.randomUUID(),
            name: "",
            proficiency: "intermediate" as const,
          },
        ],
      },
    ],
    settings: { ...DEFAULT_SETTINGS },
  };
}

export function createEmptySectionItem(sectionType: SectionType): Record<string, unknown> {
  const id = crypto.randomUUID();
  switch (sectionType) {
    case "experience":
      return { id, company: "", title: "", startDate: "", endDate: "", isCurrentRole: false, location: "", bullets: [""] };
    case "education":
      return { id, school: "", degree: "", field: "", startDate: "", endDate: "", gpa: "", description: "" };
    case "skills":
      return { id, name: "", proficiency: "intermediate" };
    case "certifications":
      return { id, name: "", issuer: "", date: "", url: "" };
    case "languages":
      return { id, name: "", proficiency: "conversational" };
    case "projects":
      return { id, name: "", url: "", description: "", technologies: [] };
    case "volunteer":
      return { id, organization: "", role: "", startDate: "", endDate: "", description: "" };
    case "awards":
      return { id, title: "", issuer: "", date: "", description: "" };
    case "publications":
      return { id, title: "", publisher: "", date: "", url: "" };
    case "references":
      return { id, name: "", title: "", company: "", email: "", phone: "" };
    default:
      return { id };
  }
}

export function createEmptySection(sectionType: SectionType, sortOrder: number): Record<string, unknown> {
  const base = { id: crypto.randomUUID(), type: sectionType, visible: true, sortOrder };
  if (sectionType === "summary") {
    return { ...base, content: "" };
  }
  return { ...base, items: [createEmptySectionItem(sectionType)] };
}
