import { z } from "zod";

export const lineItemSchema = z.object({
  id: z.string(),
  description: z.string().min(1, "Description is required"),
  quantity: z.number().positive("Quantity must be greater than 0"),
  unitPrice: z.number().min(0, "Unit price cannot be negative"),
  taxEnabled: z.boolean(),
  taxRate: z.number().min(0).max(100),
  unitType: z.string().default("item"),
});

export const companySchema = z.object({
  name: z.string().min(1, "Company name is required"),
  address: z.string(),
  phone: z.string(),
  email: z.string(),
  website: z.string(),
  taxId: z.string(),
  logoUrl: z.string().nullable(),
});

export const clientSchema = z.object({
  name: z.string().min(1, "Client name is required"),
  email: z.string(),
  address: z.string(),
  phone: z.string(),
});

export const settingsSchema = z.object({
  invoiceNumber: z.string().min(1, "Invoice number is required"),
  invoiceDate: z.string().min(1, "Invoice date is required"),
  dueDate: z.string().min(1, "Due date is required"),
  paymentTerms: z.enum([
    "due-on-receipt",
    "net-15",
    "net-30",
    "net-60",
    "custom",
  ]),
  customTermsDays: z.number().nullable(),
  currency: z.string(),
  taxRate: z.number().min(0).max(100),
  discountType: z.enum(["percentage", "flat"]),
  discountValue: z.number().min(0),
  template: z.enum(["modern", "classic", "compact"]),
  accentColor: z.string(),
  dateFormat: z
    .enum(["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD", "Month D, YYYY"])
    .default("Month D, YYYY"),
});

export const invoiceSchema = z.object({
  company: companySchema,
  client: clientSchema,
  lineItems: z.array(lineItemSchema).min(1, "At least one line item is required"),
  settings: settingsSchema,
  notes: z.string(),
  terms: z.string(),
  status: z.enum(["draft", "sent", "paid", "overdue"]).default("draft"),
  paymentLink: z.string().default(""),
});

export const savedInvoiceSchema = z.object({
  id: z.string(),
  data: invoiceSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const exportEnvelopeSchema = z.object({
  tool: z.literal("freetoolshed-invoice-generator"),
  version: z.literal(1),
  exportedAt: z.string(),
  invoices: z.array(savedInvoiceSchema),
});

export type InvoiceValidationError = {
  field: string;
  message: string;
};

export function validateInvoice(
  data: unknown
): { success: true } | { success: false; errors: InvoiceValidationError[] } {
  const result = invoiceSchema.safeParse(data);
  if (result.success) {
    return { success: true };
  }
  const errors: InvoiceValidationError[] = result.error.issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
  }));
  return { success: false, errors };
}
