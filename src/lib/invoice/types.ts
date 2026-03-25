export interface CompanyInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  taxId: string;
  logoUrl: string | null;
}

export interface ClientInfo {
  name: string;
  email: string;
  address: string;
  phone: string;
}

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxEnabled: boolean;
  taxRate: number;
  unitType: string;
}

export type PaymentTerms =
  | "due-on-receipt"
  | "net-15"
  | "net-30"
  | "net-60"
  | "custom";

export type CurrencyCode =
  | "USD" | "EUR" | "GBP" | "CAD" | "AUD"
  | "JPY" | "CHF" | "CNY" | "INR" | "BRL"
  | "MXN" | "KRW" | "SEK" | "NOK" | "DKK"
  | "NZD" | "SGD" | "HKD" | "ZAR" | "PLN";

export interface Currency {
  code: CurrencyCode;
  name: string;
  symbol: string;
  decimals: number;
}

export type DiscountType = "percentage" | "flat";

export type TemplateName = "modern" | "classic" | "compact";

export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue";

export type DateFormatPreference =
  | "MM/DD/YYYY"
  | "DD/MM/YYYY"
  | "YYYY-MM-DD"
  | "Month D, YYYY";

export interface InvoiceSettings {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  paymentTerms: PaymentTerms;
  customTermsDays: number | null;
  currency: CurrencyCode;
  taxRate: number;
  discountType: DiscountType;
  discountValue: number;
  template: TemplateName;
  accentColor: string;
  dateFormat: DateFormatPreference;
}

export interface InvoiceData {
  company: CompanyInfo;
  client: ClientInfo;
  lineItems: LineItem[];
  settings: InvoiceSettings;
  notes: string;
  terms: string;
  status: InvoiceStatus;
  paymentLink: string;
}

export interface SavedInvoice {
  id: string;
  data: InvoiceData;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceDefaults {
  company: CompanyInfo;
  settings: Pick<
    InvoiceSettings,
    "currency" | "taxRate" | "template" | "accentColor" | "dateFormat"
  >;
}

export interface ExportEnvelope {
  tool: "freetoolshed-invoice-generator";
  version: 1;
  exportedAt: string;
  invoices: SavedInvoice[];
}

export type InvoiceAction =
  | { type: "SET_COMPANY"; payload: Partial<CompanyInfo> }
  | { type: "SET_CLIENT"; payload: Partial<ClientInfo> }
  | { type: "SET_SETTINGS"; payload: Partial<InvoiceSettings> }
  | { type: "SET_NOTES"; payload: string }
  | { type: "SET_TERMS"; payload: string }
  | { type: "ADD_LINE_ITEM" }
  | { type: "REMOVE_LINE_ITEM"; payload: string }
  | { type: "UPDATE_LINE_ITEM"; payload: { id: string } & Partial<LineItem> }
  | { type: "REORDER_LINE_ITEMS"; payload: LineItem[] }
  | { type: "SET_LOGO"; payload: string | null }
  | { type: "SET_STATUS"; payload: InvoiceStatus }
  | { type: "SET_PAYMENT_LINK"; payload: string }
  | { type: "LOAD_DRAFT"; payload: InvoiceData }
  | { type: "RESET" };

export interface LineItemTotal {
  id: string;
  amount: number;
  taxAmount: number;
}

export interface InvoiceCalculations {
  lineItemTotals: LineItemTotal[];
  subtotal: number;
  totalTax: number;
  discountAmount: number;
  grandTotal: number;
}
