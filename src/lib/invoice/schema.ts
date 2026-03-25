import { z } from "zod";

export const lineItemSchema = z.object({
  id: z.string(),
  description: z.string().min(1, "Description is required"),
  quantity: z.number().positive("Quantity must be greater than 0"),
  unitPrice: z.number().min(0, "Unit price cannot be negative"),
  taxEnabled: z.boolean(),
  taxRate: z.number().min(0).max(100),
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
});

export const invoiceSchema = z.object({
  company: companySchema,
  client: clientSchema,
  lineItems: z.array(lineItemSchema).min(1, "At least one line item is required"),
  settings: settingsSchema,
  notes: z.string(),
  terms: z.string(),
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
