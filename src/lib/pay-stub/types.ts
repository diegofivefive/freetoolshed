// ── Employer ──

export interface EmployerInfo {
  companyName: string;
  address: string;
  phone: string;
  ein: string;
  logoUrl: string | null;
}

// ── Employee ──

export interface EmployeeInfo {
  name: string;
  address: string;
  employeeId: string;
  ssnLast4: string;
  department: string;
}

// ── Pay Period ──

export type PayFrequency = "weekly" | "bi-weekly" | "semi-monthly" | "monthly";

export interface PayPeriod {
  startDate: string;
  endDate: string;
  payDate: string;
  payFrequency: PayFrequency;
}

// ── Pay Type ──

export type PayType = "hourly" | "salary";

// ── Earnings ──

export type EarningType =
  | "regular"
  | "overtime"
  | "bonus"
  | "commission"
  | "tips"
  | "other";

export interface EarningsEntry {
  id: string;
  label: string;
  type: EarningType;
  hours: number;
  rate: number;
  currentAmount: number;
  ytdAmount: number;
}

// ── Deductions ──

export type DeductionCategory = "pre-tax" | "post-tax";

export type DeductionType =
  | "federal-income-tax"
  | "state-income-tax"
  | "social-security"
  | "medicare"
  | "401k"
  | "health-insurance"
  | "dental-vision"
  | "hsa-fsa"
  | "roth-401k"
  | "life-insurance"
  | "garnishment"
  | "union-dues"
  | "other";

export interface DeductionEntry {
  id: string;
  label: string;
  category: DeductionCategory;
  type: DeductionType;
  currentAmount: number;
  ytdAmount: number;
}

// ── Settings ──

export type TemplateName = "standard" | "modern" | "compact";

export type DateFormatPreference =
  | "MM/DD/YYYY"
  | "DD/MM/YYYY"
  | "YYYY-MM-DD"
  | "Month D, YYYY";

export interface PayStubSettings {
  payType: PayType;
  template: TemplateName;
  accentColor: string;
  dateFormat: DateFormatPreference;
  showSsnLast4: boolean;
}

// ── Calculations (derived, never persisted) ──

export interface PayStubCalculations {
  grossPay: number;
  totalPreTaxDeductions: number;
  totalPostTaxDeductions: number;
  totalDeductions: number;
  netPay: number;
  ytdGrossPay: number;
  ytdTotalDeductions: number;
  ytdNetPay: number;
}

// ── Top-level state ──

export interface PayStubData {
  employer: EmployerInfo;
  employee: EmployeeInfo;
  payPeriod: PayPeriod;
  earnings: EarningsEntry[];
  deductions: DeductionEntry[];
  settings: PayStubSettings;
}

// ── Persistence ──

export interface SavedPayStub {
  id: string;
  data: PayStubData;
  createdAt: string;
  updatedAt: string;
}

export interface PayStubDefaults {
  employer: EmployerInfo;
  settings: Pick<
    PayStubSettings,
    "template" | "accentColor" | "dateFormat" | "payType"
  >;
}

export interface ExportEnvelope {
  tool: "freetoolshed-pay-stub-generator";
  version: 1;
  exportedAt: string;
  stubs: SavedPayStub[];
}

// ── Validation ──

export interface PayStubValidationError {
  field: string;
  message: string;
}

// ── Reducer Actions ──

export type PayStubAction =
  | { type: "SET_EMPLOYER"; payload: Partial<EmployerInfo> }
  | { type: "SET_EMPLOYEE"; payload: Partial<EmployeeInfo> }
  | { type: "SET_PAY_PERIOD"; payload: Partial<PayPeriod> }
  | { type: "SET_SETTINGS"; payload: Partial<PayStubSettings> }
  | { type: "ADD_EARNING" }
  | { type: "REMOVE_EARNING"; payload: string }
  | { type: "UPDATE_EARNING"; payload: { id: string } & Partial<EarningsEntry> }
  | { type: "ADD_DEDUCTION"; payload?: { category: DeductionCategory } }
  | { type: "REMOVE_DEDUCTION"; payload: string }
  | {
      type: "UPDATE_DEDUCTION";
      payload: { id: string } & Partial<DeductionEntry>;
    }
  | { type: "SET_LOGO"; payload: string | null }
  | { type: "APPLY_PRESET_DEDUCTIONS" }
  | { type: "LOAD_DRAFT"; payload: PayStubData }
  | { type: "RESET" };
