// ── Personal Info ────────────────────────────────────────────
export interface PersonalInfo {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  linkedin: string;
  photoUrl: string | null;
}

// ── Section item types ───────────────────────────────────────
export interface WorkExperience {
  id: string;
  company: string;
  title: string;
  startDate: string;
  endDate: string;
  isCurrentRole: boolean;
  location: string;
  bullets: string[];
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  gpa: string;
  description: string;
}

export type SkillProficiency = "beginner" | "intermediate" | "advanced" | "expert";

export interface Skill {
  id: string;
  name: string;
  proficiency: SkillProficiency;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  url: string;
}

export type LanguageProficiency = "basic" | "conversational" | "professional" | "native";

export interface Language {
  id: string;
  name: string;
  proficiency: LanguageProficiency;
}

export interface Project {
  id: string;
  name: string;
  url: string;
  description: string;
  technologies: string[];
}

export interface VolunteerExperience {
  id: string;
  organization: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Award {
  id: string;
  title: string;
  issuer: string;
  date: string;
  description: string;
}

export interface Publication {
  id: string;
  title: string;
  publisher: string;
  date: string;
  url: string;
}

export interface Reference {
  id: string;
  name: string;
  title: string;
  company: string;
  email: string;
  phone: string;
}

export interface CustomItem {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  description: string;
}

// ── Section discriminated union ──────────────────────────────
export type SectionType =
  | "summary"
  | "experience"
  | "education"
  | "skills"
  | "certifications"
  | "languages"
  | "projects"
  | "volunteer"
  | "awards"
  | "publications"
  | "references"
  | "custom";

interface SectionBase {
  id: string;
  visible: boolean;
  sortOrder: number;
}

export interface SummarySection extends SectionBase {
  type: "summary";
  content: string;
}

export interface ExperienceSection extends SectionBase {
  type: "experience";
  items: WorkExperience[];
}

export interface EducationSection extends SectionBase {
  type: "education";
  items: Education[];
}

export interface SkillsSection extends SectionBase {
  type: "skills";
  items: Skill[];
}

export interface CertificationsSection extends SectionBase {
  type: "certifications";
  items: Certification[];
}

export interface LanguagesSection extends SectionBase {
  type: "languages";
  items: Language[];
}

export interface ProjectsSection extends SectionBase {
  type: "projects";
  items: Project[];
}

export interface VolunteerSection extends SectionBase {
  type: "volunteer";
  items: VolunteerExperience[];
}

export interface AwardsSection extends SectionBase {
  type: "awards";
  items: Award[];
}

export interface PublicationsSection extends SectionBase {
  type: "publications";
  items: Publication[];
}

export interface ReferencesSection extends SectionBase {
  type: "references";
  items: Reference[];
}

export interface CustomSection extends SectionBase {
  type: "custom";
  title: string;
  items: CustomItem[];
}

export type ResumeSection =
  | SummarySection
  | ExperienceSection
  | EducationSection
  | SkillsSection
  | CertificationsSection
  | LanguagesSection
  | ProjectsSection
  | VolunteerSection
  | AwardsSection
  | PublicationsSection
  | ReferencesSection
  | CustomSection;

// ── Settings ─────────────────────────────────────────────────
export type ResumeTemplateName =
  | "modern"
  | "classic"
  | "professional"
  | "minimal"
  | "executive"
  | "creative"
  | "compact"
  | "elegant"
  | "bold"
  | "technical"
  | "columns"
  | "timeline";

export type ResumeFontFamily = "helvetica" | "times" | "courier";

export type ResumeDateFormat = "MM/YYYY" | "Month YYYY" | "YYYY";

export type ResumeFontSize = "compact" | "standard" | "spacious";

export type ResumeMarginSize = "narrow" | "normal" | "wide";
export type ResumeSectionSpacing = "compact" | "normal" | "relaxed";
export type ResumeLineSpacing = "tight" | "normal" | "relaxed";

export interface ResumeSettings {
  template: ResumeTemplateName;
  accentColor: string;
  fontFamily: ResumeFontFamily;
  dateFormat: ResumeDateFormat;
  fontSize: ResumeFontSize;
  marginSize: ResumeMarginSize;
  sectionSpacing: ResumeSectionSpacing;
  lineSpacing: ResumeLineSpacing;
}

// ── Top-level resume data ────────────────────────────────────
export interface ResumeData {
  personalInfo: PersonalInfo;
  sections: ResumeSection[];
  settings: ResumeSettings;
}

export interface SavedResume {
  id: string;
  name: string;
  data: ResumeData;
  createdAt: string;
  updatedAt: string;
}

export interface ResumeDefaults {
  settings: ResumeSettings;
}

export interface ResumeExportEnvelope {
  tool: "freetoolshed-resume-builder";
  version: 1;
  exportedAt: string;
  resumes: SavedResume[];
}

// ── Reducer actions ──────────────────────────────────────────
export type ResumeAction =
  | { type: "SET_PERSONAL_INFO"; payload: Partial<PersonalInfo> }
  | { type: "SET_PHOTO"; payload: string | null }
  | { type: "SET_SETTINGS"; payload: Partial<ResumeSettings> }
  | { type: "SET_SECTION_CONTENT"; payload: { sectionId: string; content: string } }
  | { type: "ADD_SECTION"; payload: SectionType }
  | { type: "ADD_CUSTOM_SECTION"; payload: string }
  | { type: "RENAME_SECTION"; payload: { sectionId: string; title: string } }
  | { type: "REMOVE_SECTION"; payload: string }
  | { type: "TOGGLE_SECTION_VISIBILITY"; payload: string }
  | { type: "REORDER_SECTIONS"; payload: ResumeSection[] }
  | { type: "ADD_ITEM"; payload: { sectionId: string } }
  | { type: "REMOVE_ITEM"; payload: { sectionId: string; itemId: string } }
  | { type: "UPDATE_ITEM"; payload: { sectionId: string; itemId: string; data: Record<string, unknown> } }
  | { type: "REORDER_ITEMS"; payload: { sectionId: string; items: ResumeSection["type"] extends "summary" ? never : unknown[] } }
  | { type: "LOAD_DRAFT"; payload: ResumeData }
  | { type: "RESET" };
