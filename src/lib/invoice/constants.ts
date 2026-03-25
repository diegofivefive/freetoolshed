import type {
  Currency,
  CurrencyCode,
  DateFormatPreference,
  InvoiceData,
  InvoiceStatus,
  PaymentTerms,
} from "./types";

export const CURRENCIES: Currency[] = [
  { code: "USD", name: "US Dollar", symbol: "$", decimals: 2 },
  { code: "EUR", name: "Euro", symbol: "\u20AC", decimals: 2 },
  { code: "GBP", name: "British Pound", symbol: "\u00A3", decimals: 2 },
  { code: "CAD", name: "Canadian Dollar", symbol: "CA$", decimals: 2 },
  { code: "AUD", name: "Australian Dollar", symbol: "A$", decimals: 2 },
  { code: "JPY", name: "Japanese Yen", symbol: "\u00A5", decimals: 0 },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF", decimals: 2 },
  { code: "CNY", name: "Chinese Yuan", symbol: "\u00A5", decimals: 2 },
  { code: "INR", name: "Indian Rupee", symbol: "\u20B9", decimals: 2 },
  { code: "BRL", name: "Brazilian Real", symbol: "R$", decimals: 2 },
  { code: "MXN", name: "Mexican Peso", symbol: "MX$", decimals: 2 },
  { code: "KRW", name: "South Korean Won", symbol: "\u20A9", decimals: 0 },
  { code: "SEK", name: "Swedish Krona", symbol: "kr", decimals: 2 },
  { code: "NOK", name: "Norwegian Krone", symbol: "kr", decimals: 2 },
  { code: "DKK", name: "Danish Krone", symbol: "kr", decimals: 2 },
  { code: "NZD", name: "New Zealand Dollar", symbol: "NZ$", decimals: 2 },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$", decimals: 2 },
  { code: "HKD", name: "Hong Kong Dollar", symbol: "HK$", decimals: 2 },
  { code: "ZAR", name: "South African Rand", symbol: "R", decimals: 2 },
  { code: "PLN", name: "Polish Zloty", symbol: "z\u0142", decimals: 2 },
];

export const PAYMENT_TERMS_OPTIONS: { label: string; value: PaymentTerms }[] = [
  { label: "Due on Receipt", value: "due-on-receipt" },
  { label: "Net 15", value: "net-15" },
  { label: "Net 30", value: "net-30" },
  { label: "Net 60", value: "net-60" },
  { label: "Custom", value: "custom" },
];

export const DEFAULT_TAX_RATES = [0, 5, 7.5, 10, 13, 15, 20, 21, 25];

export const UNIT_TYPES = [
  { label: "Item", value: "item" },
  { label: "Hour", value: "hour" },
  { label: "Day", value: "day" },
  { label: "Unit", value: "unit" },
  { label: "Service", value: "service" },
] as const;

export const STATUS_OPTIONS: {
  label: string;
  value: InvoiceStatus;
  color: string;
}[] = [
  { label: "Draft", value: "draft", color: "#a1a1aa" },
  { label: "Sent", value: "sent", color: "#3b82f6" },
  { label: "Paid", value: "paid", color: "#10b981" },
  { label: "Overdue", value: "overdue", color: "#ef4444" },
];

export const DATE_FORMAT_OPTIONS: {
  label: string;
  value: DateFormatPreference;
}[] = [
  { label: "Month D, YYYY", value: "Month D, YYYY" },
  { label: "MM/DD/YYYY", value: "MM/DD/YYYY" },
  { label: "DD/MM/YYYY", value: "DD/MM/YYYY" },
  { label: "YYYY-MM-DD", value: "YYYY-MM-DD" },
];

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

export function todayISO(): string {
  return new Date().toISOString().split("T")[0];
}

function addDays(isoDate: string, days: number): string {
  const date = new Date(isoDate);
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
}

export function calculateDueDate(
  invoiceDate: string,
  terms: PaymentTerms,
  customDays: number | null
): string {
  switch (terms) {
    case "due-on-receipt":
      return invoiceDate;
    case "net-15":
      return addDays(invoiceDate, 15);
    case "net-30":
      return addDays(invoiceDate, 30);
    case "net-60":
      return addDays(invoiceDate, 60);
    case "custom":
      return addDays(invoiceDate, customDays ?? 30);
  }
}

export function getCurrencyByCode(code: CurrencyCode): Currency {
  return CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0];
}

export function createDefaultInvoiceData(): InvoiceData {
  const today = todayISO();
  return {
    company: {
      name: "",
      address: "",
      phone: "",
      email: "",
      website: "",
      taxId: "",
      logoUrl: null,
    },
    client: {
      name: "",
      email: "",
      address: "",
      phone: "",
    },
    lineItems: [
      {
        id: crypto.randomUUID(),
        description: "",
        quantity: 1,
        unitPrice: 0,
        taxEnabled: false,
        taxRate: 0,
        unitType: "item",
      },
    ],
    settings: {
      invoiceNumber: "INV-0001",
      invoiceDate: today,
      dueDate: addDays(today, 30),
      paymentTerms: "net-30",
      customTermsDays: null,
      currency: "USD",
      taxRate: 0,
      discountType: "percentage",
      discountValue: 0,
      template: "modern",
      accentColor: "#10b981",
      dateFormat: "Month D, YYYY",
    },
    notes: "",
    terms: "",
    status: "draft",
    paymentLink: "",
  };
}
