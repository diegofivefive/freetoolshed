import { z } from "zod";
import type { PayStubValidationError } from "./types";

const employerSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  address: z.string(),
  phone: z.string(),
  ein: z.string(),
  logoUrl: z.string().nullable(),
});

const employeeSchema = z.object({
  name: z.string().min(1, "Employee name is required"),
  address: z.string(),
  employeeId: z.string(),
  ssnLast4: z
    .string()
    .max(4, "SSN must be at most 4 digits")
    .regex(/^\d{0,4}$/, "Must be digits only"),
  department: z.string(),
});

const payPeriodSchema = z.object({
  startDate: z.string().min(1, "Pay period start date is required"),
  endDate: z.string().min(1, "Pay period end date is required"),
  payDate: z.string().min(1, "Pay date is required"),
  payFrequency: z.enum(["weekly", "bi-weekly", "semi-monthly", "monthly"]),
});

const earningsEntrySchema = z.object({
  id: z.string(),
  label: z.string().min(1, "Earnings label is required"),
  type: z.enum([
    "regular",
    "overtime",
    "bonus",
    "commission",
    "tips",
    "other",
  ]),
  hours: z.number().min(0, "Hours cannot be negative"),
  rate: z.number().min(0, "Rate cannot be negative"),
  currentAmount: z.number().min(0, "Amount cannot be negative"),
  ytdAmount: z.number().min(0, "YTD amount cannot be negative"),
});

const deductionEntrySchema = z.object({
  id: z.string(),
  label: z.string().min(1, "Deduction label is required"),
  category: z.enum(["pre-tax", "post-tax"]),
  type: z.enum([
    "federal-income-tax",
    "state-income-tax",
    "social-security",
    "medicare",
    "401k",
    "health-insurance",
    "dental-vision",
    "hsa-fsa",
    "roth-401k",
    "life-insurance",
    "garnishment",
    "union-dues",
    "other",
  ]),
  currentAmount: z.number().min(0, "Amount cannot be negative"),
  ytdAmount: z.number().min(0, "YTD amount cannot be negative"),
});

const settingsSchema = z.object({
  payType: z.enum(["hourly", "salary"]),
  template: z.enum(["standard", "modern", "compact"]),
  accentColor: z.string(),
  dateFormat: z.enum(["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD", "Month D, YYYY"]),
  showSsnLast4: z.boolean(),
});

const payStubSchema = z.object({
  employer: employerSchema,
  employee: employeeSchema,
  payPeriod: payPeriodSchema,
  earnings: z
    .array(earningsEntrySchema)
    .min(1, "At least one earnings entry is required"),
  deductions: z.array(deductionEntrySchema),
  settings: settingsSchema,
});

const FIELD_LABELS: Record<string, string> = {
  "employer.companyName": "Company Name",
  "employer.address": "Company Address",
  "employer.phone": "Company Phone",
  "employer.ein": "EIN",
  "employee.name": "Employee Name",
  "employee.address": "Employee Address",
  "employee.employeeId": "Employee ID",
  "employee.ssnLast4": "SSN (Last 4)",
  "employee.department": "Department",
  "payPeriod.startDate": "Pay Period Start",
  "payPeriod.endDate": "Pay Period End",
  "payPeriod.payDate": "Pay Date",
  "payPeriod.payFrequency": "Pay Frequency",
};

export function validatePayStub(
  data: unknown
): { success: true } | { success: false; errors: PayStubValidationError[] } {
  const result = payStubSchema.safeParse(data);
  if (result.success) return { success: true };

  return {
    success: false,
    errors: result.error.issues.map((issue) => {
      const field = issue.path.join(".");
      const earningsMatch = field.match(/^earnings\.(\d+)\.(.+)$/);
      if (earningsMatch) {
        const row = Number(earningsMatch[1]) + 1;
        return { field, message: `Earnings row ${row}: ${issue.message}` };
      }
      const deductionsMatch = field.match(/^deductions\.(\d+)\.(.+)$/);
      if (deductionsMatch) {
        const row = Number(deductionsMatch[1]) + 1;
        return { field, message: `Deduction row ${row}: ${issue.message}` };
      }
      const label = FIELD_LABELS[field];
      return {
        field,
        message: label ? `${label} — ${issue.message}` : issue.message,
      };
    }),
  };
}
