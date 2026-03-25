import type { CurrencyCode } from "./types";

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

export function formatDate(isoDate: string): string {
  const date = new Date(isoDate + "T00:00:00");
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function formatDateShort(isoDate: string): string {
  const date = new Date(isoDate + "T00:00:00");
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}
