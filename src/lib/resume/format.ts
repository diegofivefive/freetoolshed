import type { ResumeDateFormat, SkillProficiency, LanguageProficiency } from "./types";

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function formatResumeDate(
  isoDate: string,
  preference: ResumeDateFormat = "Month YYYY"
): string {
  if (!isoDate) return "";
  // Accept "YYYY-MM" or "YYYY-MM-DD"
  const [yearStr, monthStr] = isoDate.split("-");
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);

  if (isNaN(year)) return isoDate;

  switch (preference) {
    case "MM/YYYY":
      return isNaN(month) ? `${year}` : `${String(month).padStart(2, "0")}/${year}`;
    case "YYYY":
      return `${year}`;
    case "Month YYYY":
    default:
      return isNaN(month) ? `${year}` : `${MONTH_NAMES[month - 1]} ${year}`;
  }
}

export function formatDateRange(
  startDate: string,
  endDate: string,
  isCurrent: boolean,
  preference: ResumeDateFormat = "Month YYYY"
): string {
  const start = formatResumeDate(startDate, preference);
  if (!start) return "";
  const end = isCurrent ? "Present" : formatResumeDate(endDate, preference);
  if (!end) return start;
  return `${start} \u2013 ${end}`;
}

export function proficiencyToPercentage(proficiency: SkillProficiency): number {
  switch (proficiency) {
    case "beginner":
      return 25;
    case "intermediate":
      return 50;
    case "advanced":
      return 75;
    case "expert":
      return 100;
  }
}

export function languageProficiencyLabel(proficiency: LanguageProficiency): string {
  switch (proficiency) {
    case "basic":
      return "Basic";
    case "conversational":
      return "Conversational";
    case "professional":
      return "Professional";
    case "native":
      return "Native / Fluent";
  }
}
