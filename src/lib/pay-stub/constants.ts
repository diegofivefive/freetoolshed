import type {
  PayFrequency,
  EarningType,
  DeductionType,
  DeductionCategory,
  PayStubData,
  EarningsEntry,
  DeductionEntry,
  DateFormatPreference,
  TemplateName,
} from "./types";

// ── Pay Frequency ──

export const PAY_FREQUENCY_OPTIONS: {
  label: string;
  value: PayFrequency;
}[] = [
  { label: "Weekly", value: "weekly" },
  { label: "Bi-Weekly", value: "bi-weekly" },
  { label: "Semi-Monthly", value: "semi-monthly" },
  { label: "Monthly", value: "monthly" },
];

// ── Earning Types ──

export const EARNING_TYPES: { label: string; value: EarningType }[] = [
  { label: "Regular", value: "regular" },
  { label: "Overtime", value: "overtime" },
  { label: "Bonus", value: "bonus" },
  { label: "Commission", value: "commission" },
  { label: "Tips", value: "tips" },
  { label: "Other", value: "other" },
];

// ── Deduction Types ──

export const DEDUCTION_TYPES: {
  label: string;
  value: DeductionType;
  category: DeductionCategory;
}[] = [
  { label: "Federal Income Tax", value: "federal-income-tax", category: "pre-tax" },
  { label: "State Income Tax", value: "state-income-tax", category: "pre-tax" },
  { label: "Social Security", value: "social-security", category: "pre-tax" },
  { label: "Medicare", value: "medicare", category: "pre-tax" },
  { label: "401(k)", value: "401k", category: "pre-tax" },
  { label: "Health Insurance", value: "health-insurance", category: "pre-tax" },
  { label: "Dental/Vision", value: "dental-vision", category: "pre-tax" },
  { label: "HSA/FSA", value: "hsa-fsa", category: "pre-tax" },
  { label: "Roth 401(k)", value: "roth-401k", category: "post-tax" },
  { label: "Life Insurance", value: "life-insurance", category: "post-tax" },
  { label: "Garnishment", value: "garnishment", category: "post-tax" },
  { label: "Union Dues", value: "union-dues", category: "post-tax" },
  { label: "Other", value: "other", category: "post-tax" },
];

// ── Standard US Deductions Preset ──

export const STANDARD_DEDUCTION_PRESET: Omit<DeductionEntry, "id">[] = [
  {
    label: "Federal Income Tax",
    type: "federal-income-tax",
    category: "pre-tax",
    currentAmount: 0,
    ytdAmount: 0,
  },
  {
    label: "State Income Tax",
    type: "state-income-tax",
    category: "pre-tax",
    currentAmount: 0,
    ytdAmount: 0,
  },
  {
    label: "Social Security (6.2%)",
    type: "social-security",
    category: "pre-tax",
    currentAmount: 0,
    ytdAmount: 0,
  },
  {
    label: "Medicare (1.45%)",
    type: "medicare",
    category: "pre-tax",
    currentAmount: 0,
    ytdAmount: 0,
  },
  {
    label: "401(k)",
    type: "401k",
    category: "pre-tax",
    currentAmount: 0,
    ytdAmount: 0,
  },
  {
    label: "Health Insurance",
    type: "health-insurance",
    category: "pre-tax",
    currentAmount: 0,
    ytdAmount: 0,
  },
];

// ── Templates ──

export const TEMPLATE_OPTIONS: { label: string; value: TemplateName }[] = [
  { label: "Standard", value: "standard" },
  { label: "Modern", value: "modern" },
  { label: "Compact", value: "compact" },
];

// ── Accent Color Presets ──

export const ACCENT_PRESETS: { name: string; hex: string }[] = [
  { name: "Emerald", hex: "#10b981" },
  { name: "Blue", hex: "#3b82f6" },
  { name: "Indigo", hex: "#6366f1" },
  { name: "Violet", hex: "#8b5cf6" },
  { name: "Pink", hex: "#ec4899" },
  { name: "Amber", hex: "#f59e0b" },
  { name: "Teal", hex: "#14b8a6" },
  { name: "Slate", hex: "#64748b" },
];

// ── Date Format Options ──

export const DATE_FORMAT_OPTIONS: {
  label: string;
  value: DateFormatPreference;
}[] = [
  { label: "MM/DD/YYYY", value: "MM/DD/YYYY" },
  { label: "DD/MM/YYYY", value: "DD/MM/YYYY" },
  { label: "YYYY-MM-DD", value: "YYYY-MM-DD" },
  { label: "Month D, YYYY", value: "Month D, YYYY" },
];

// ── Helpers ──

function todayISO(): string {
  return new Date().toISOString().split("T")[0];
}

function createDefaultEarning(): EarningsEntry {
  return {
    id: crypto.randomUUID(),
    label: "Regular",
    type: "regular",
    hours: 0,
    rate: 0,
    currentAmount: 0,
    ytdAmount: 0,
  };
}

export function createBlankEarning(): EarningsEntry {
  return {
    id: crypto.randomUUID(),
    label: "",
    type: "other",
    hours: 0,
    rate: 0,
    currentAmount: 0,
    ytdAmount: 0,
  };
}

export function createBlankDeduction(
  category: DeductionCategory = "pre-tax"
): DeductionEntry {
  return {
    id: crypto.randomUUID(),
    label: "",
    type: "other",
    category,
    currentAmount: 0,
    ytdAmount: 0,
  };
}

export function createDefaultPayStubData(): PayStubData {
  const today = todayISO();
  return {
    employer: {
      companyName: "",
      address: "",
      phone: "",
      ein: "",
      logoUrl: null,
    },
    employee: {
      name: "",
      address: "",
      employeeId: "",
      ssnLast4: "",
      department: "",
    },
    payPeriod: {
      startDate: today,
      endDate: today,
      payDate: today,
      payFrequency: "bi-weekly",
    },
    earnings: [createDefaultEarning()],
    deductions: [],
    settings: {
      payType: "hourly",
      template: "standard",
      accentColor: "#10b981",
      dateFormat: "MM/DD/YYYY",
      showSsnLast4: true,
    },
  };
}
