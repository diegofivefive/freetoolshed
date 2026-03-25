import type { CurrencyCode, DateFormatPreference } from "./types";

export function formatCurrency(
  amount: number,
  currencyCode: CurrencyCode
): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: currencyCode === "JPY" || currencyCode === "KRW" ? 0 : 2,
    maximumFractionDigits: currencyCode === "JPY" || currencyCode === "KRW" ? 0 : 2,
  }).format(amount);
}

export function formatDate(
  isoDate: string,
  preference: DateFormatPreference = "Month D, YYYY"
): string {
  const date = new Date(isoDate + "T00:00:00");
  const y = date.getFullYear();
  const m = date.getMonth(); // 0-indexed
  const d = date.getDate();

  const pad = (n: number) => String(n).padStart(2, "0");

  switch (preference) {
    case "MM/DD/YYYY":
      return `${pad(m + 1)}/${pad(d)}/${y}`;
    case "DD/MM/YYYY":
      return `${pad(d)}/${pad(m + 1)}/${y}`;
    case "YYYY-MM-DD":
      return `${y}-${pad(m + 1)}-${pad(d)}`;
    case "Month D, YYYY":
    default:
      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(date);
  }
}

export function formatDateShort(isoDate: string): string {
  const date = new Date(isoDate + "T00:00:00");
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

const UNIT_LABELS: Record<string, { singular: string; plural: string }> = {
  item: { singular: "item", plural: "items" },
  hour: { singular: "hr", plural: "hrs" },
  day: { singular: "day", plural: "days" },
  unit: { singular: "unit", plural: "units" },
  service: { singular: "service", plural: "services" },
};

export function formatQuantityWithUnit(
  quantity: number,
  unitType: string
): string {
  const labels = UNIT_LABELS[unitType];
  if (!labels) {
    // Custom unit type — use as-is
    return `${quantity} ${unitType}`;
  }
  const label = quantity === 1 ? labels.singular : labels.plural;
  return `${quantity} ${label}`;
}
