import type {
  LineItem,
  InvoiceSettings,
  InvoiceCalculations,
  LineItemTotal,
} from "./types";

export function calculateLineItemAmount(item: LineItem): number {
  return item.quantity * item.unitPrice;
}

export function calculateLineItemTax(
  item: LineItem,
  globalTaxRate: number
): number {
  if (!item.taxEnabled) return 0;
  const rate = item.taxRate > 0 ? item.taxRate : globalTaxRate;
  return calculateLineItemAmount(item) * (rate / 100);
}

export function calculateInvoice(
  lineItems: LineItem[],
  settings: InvoiceSettings
): InvoiceCalculations {
  const lineItemTotals: LineItemTotal[] = lineItems.map((item) => ({
    id: item.id,
    amount: calculateLineItemAmount(item),
    taxAmount: calculateLineItemTax(item, settings.taxRate),
  }));

  const subtotal = lineItemTotals.reduce((sum, t) => sum + t.amount, 0);
  const totalTax = lineItemTotals.reduce((sum, t) => sum + t.taxAmount, 0);

  let discountAmount = 0;
  if (settings.discountValue > 0) {
    discountAmount =
      settings.discountType === "percentage"
        ? subtotal * (settings.discountValue / 100)
        : settings.discountValue;
  }

  const grandTotal = subtotal + totalTax - discountAmount;

  return {
    lineItemTotals,
    subtotal: round2(subtotal),
    totalTax: round2(totalTax),
    discountAmount: round2(discountAmount),
    grandTotal: round2(grandTotal),
  };
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
