import type { DateFormatPreference } from "./types";

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(
  isoDate: string,
  preference: DateFormatPreference = "MM/DD/YYYY"
): string {
  const date = new Date(isoDate + "T00:00:00");
  const y = date.getFullYear();
  const m = date.getMonth();
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
