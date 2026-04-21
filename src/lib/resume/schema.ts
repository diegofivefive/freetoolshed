import { z } from "zod";

const personalInfoSchema = z.object({
  name: z.string(),
  title: z.string(),
  email: z.string(),
  phone: z.string(),
  location: z.string(),
  website: z.string(),
  linkedin: z.string(),
  photoUrl: z.string().nullable(),
});

const sectionBaseSchema = z.object({
  id: z.string(),
  visible: z.boolean(),
  sortOrder: z.number(),
});

const workExperienceSchema = z.object({
  id: z.string(),
  company: z.string(),
  title: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  isCurrentRole: z.boolean(),
  location: z.string(),
  bullets: z.array(z.string()),
});

const educationSchema = z.object({
  id: z.string(),
  school: z.string(),
  degree: z.string(),
  field: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  gpa: z.string(),
  description: z.string(),
});

const skillSchema = z.object({
  id: z.string(),
  name: z.string(),
  proficiency: z.enum(["beginner", "intermediate", "advanced", "expert"]),
});

const certificationSchema = z.object({
  id: z.string(),
  name: z.string(),
  issuer: z.string(),
  date: z.string(),
  url: z.string(),
});

const languageSchema = z.object({
  id: z.string(),
  name: z.string(),
  proficiency: z.enum(["basic", "conversational", "professional", "native"]),
});

const projectSchema = z.object({
  id: z.string(),
  name: z.string(),
  url: z.string(),
  description: z.string(),
  technologies: z.array(z.string()),
});

const volunteerSchema = z.object({
  id: z.string(),
  organization: z.string(),
  role: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  description: z.string(),
});

const awardSchema = z.object({
  id: z.string(),
  title: z.string(),
  issuer: z.string(),
  date: z.string(),
  description: z.string(),
});

const publicationSchema = z.object({
  id: z.string(),
  title: z.string(),
  publisher: z.string(),
  date: z.string(),
  url: z.string(),
});

const referenceSchema = z.object({
  id: z.string(),
  name: z.string(),
  title: z.string(),
  company: z.string(),
  email: z.string(),
  phone: z.string(),
});

const customItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  subtitle: z.string(),
  date: z.string(),
  description: z.string(),
});

const resumeSectionSchema = z.discriminatedUnion("type", [
  sectionBaseSchema.extend({ type: z.literal("summary"), content: z.string() }),
  sectionBaseSchema.extend({ type: z.literal("experience"), items: z.array(workExperienceSchema) }),
  sectionBaseSchema.extend({ type: z.literal("education"), items: z.array(educationSchema) }),
  sectionBaseSchema.extend({ type: z.literal("skills"), items: z.array(skillSchema) }),
  sectionBaseSchema.extend({ type: z.literal("certifications"), items: z.array(certificationSchema) }),
  sectionBaseSchema.extend({ type: z.literal("languages"), items: z.array(languageSchema) }),
  sectionBaseSchema.extend({ type: z.literal("projects"), items: z.array(projectSchema) }),
  sectionBaseSchema.extend({ type: z.literal("volunteer"), items: z.array(volunteerSchema) }),
  sectionBaseSchema.extend({ type: z.literal("awards"), items: z.array(awardSchema) }),
  sectionBaseSchema.extend({ type: z.literal("publications"), items: z.array(publicationSchema) }),
  sectionBaseSchema.extend({ type: z.literal("references"), items: z.array(referenceSchema) }),
  sectionBaseSchema.extend({ type: z.literal("custom"), title: z.string(), items: z.array(customItemSchema) }),
]);

const settingsSchema = z.object({
  template: z.enum(["modern", "classic", "professional", "minimal", "executive", "creative", "compact", "elegant", "bold", "technical", "columns", "timeline"]),
  accentColor: z.string(),
  fontFamily: z.enum(["helvetica", "times", "courier"]),
  dateFormat: z.enum(["MM/YYYY", "Month YYYY", "YYYY"]).default("Month YYYY"),
  fontSize: z.enum(["compact", "standard", "spacious"]).default("standard"),
  marginSize: z.enum(["narrow", "normal", "wide"]).default("normal"),
  sectionSpacing: z.enum(["compact", "normal", "relaxed"]).default("normal"),
  lineSpacing: z.enum(["tight", "normal", "relaxed"]).default("normal"),
});

export const resumeDataSchema = z.object({
  personalInfo: personalInfoSchema,
  sections: z.array(resumeSectionSchema),
  settings: settingsSchema,
});

const savedResumeSchema = z.object({
  id: z.string(),
  name: z.string(),
  data: resumeDataSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const exportEnvelopeSchema = z.object({
  tool: z.literal("freetoolshed-resume-builder"),
  version: z.literal(1),
  exportedAt: z.string(),
  resumes: z.array(savedResumeSchema),
});

export type ResumeValidationError = {
  field: string;
  message: string;
};

export function validateResume(
  data: unknown
): { success: true } | { success: false; errors: ResumeValidationError[] } {
  const result = resumeDataSchema.safeParse(data);
  if (result.success) {
    return { success: true };
  }
  const errors: ResumeValidationError[] = result.error.issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
  }));
  return { success: false, errors };
}
