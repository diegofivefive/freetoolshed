"use client";

import type { InvoiceData, InvoiceCalculations } from "@/lib/invoice/types";
import { formatCurrency, formatDate, formatQuantityWithUnit } from "@/lib/invoice/format";
import { STATUS_OPTIONS } from "@/lib/invoice/constants";

interface InvoicePreviewProps {
  state: InvoiceData;
  calculations: InvoiceCalculations;
}

const SCALE = 520 / 595;

export function InvoicePreview({ state, calculations }: InvoicePreviewProps) {
  const { company, client, lineItems, settings, notes, terms, status, paymentLink } = state;
  const { lineItemTotals, subtotal, totalTax, discountAmount, grandTotal } =
    calculations;
  const accent = settings.accentColor;
  const cur = settings.currency;

  return (
    <div
      className="origin-top-left"
      style={{
        width: 595,
        height: 842,
        transform: `scale(${SCALE})`,
      }}
    >
      <div
        style={{
          width: 595,
          height: 842,
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontSize: 10,
          color: "#1a1a1a",
          background: "#ffffff",
          padding: settings.template === "compact" ? 28 : 40,
          boxSizing: "border-box",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {settings.template === "modern" && (
          <ModernLayout
            company={company}
            client={client}
            lineItems={lineItems}
            lineItemTotals={lineItemTotals}
            settings={settings}
            subtotal={subtotal}
            totalTax={totalTax}
            discountAmount={discountAmount}
            grandTotal={grandTotal}
            notes={notes}
            terms={terms}
            paymentLink={paymentLink}
            accent={accent}
            cur={cur}
          />
        )}
        {settings.template === "classic" && (
          <ClassicLayout
            company={company}
            client={client}
            lineItems={lineItems}
            lineItemTotals={lineItemTotals}
            settings={settings}
            subtotal={subtotal}
            totalTax={totalTax}
            discountAmount={discountAmount}
            grandTotal={grandTotal}
            notes={notes}
            terms={terms}
            paymentLink={paymentLink}
            accent={accent}
            cur={cur}
          />
        )}
        {settings.template === "compact" && (
          <CompactLayout
            company={company}
            client={client}
            lineItems={lineItems}
            lineItemTotals={lineItemTotals}
            settings={settings}
            subtotal={subtotal}
            totalTax={totalTax}
            discountAmount={discountAmount}
            grandTotal={grandTotal}
            notes={notes}
            terms={terms}
            paymentLink={paymentLink}
            accent={accent}
            cur={cur}
          />
        )}
        {/* Status watermark */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%) rotate(-30deg)",
            fontSize: 72,
            fontWeight: 900,
            color: STATUS_OPTIONS.find((o) => o.value === status)?.color ?? "#a1a1aa",
            opacity: 0.1,
            textTransform: "uppercase",
            letterSpacing: 8,
            pointerEvents: "none",
            whiteSpace: "nowrap",
            userSelect: "none",
          }}
        >
          {STATUS_OPTIONS.find((o) => o.value === status)?.label ?? status}
        </div>
      </div>
    </div>
  );
}

// Shared types for layout props
interface LayoutProps {
  company: InvoiceData["company"];
  client: InvoiceData["client"];
  lineItems: InvoiceData["lineItems"];
  lineItemTotals: InvoiceCalculations["lineItemTotals"];
  settings: InvoiceData["settings"];
  subtotal: number;
  totalTax: number;
  discountAmount: number;
  grandTotal: number;
  notes: string;
  terms: string;
  paymentLink: string;
  accent: string;
  cur: InvoiceData["settings"]["currency"];
}

/* ─── Modern Template ─── */
function ModernLayout({
  company,
  client,
  lineItems,
  lineItemTotals,
  settings,
  subtotal,
  totalTax,
  discountAmount,
  grandTotal,
  notes,
  terms,
  paymentLink,
  accent,
  cur,
}: LayoutProps) {
  return (
    <>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 32 }}>
        <div>
          {company.logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={company.logoUrl}
              alt=""
              style={{ height: 40, marginBottom: 8, objectFit: "contain" }}
            />
          )}
          <div style={{ fontSize: 14, fontWeight: 700, color: accent }}>
            {company.name || "Your Company"}
          </div>
          {company.address && (
            <div style={{ color: "#666", marginTop: 2 }}>{company.address}</div>
          )}
          {company.email && (
            <div style={{ color: "#666" }}>{company.email}</div>
          )}
          {company.phone && (
            <div style={{ color: "#666" }}>{company.phone}</div>
          )}
          {company.website && (
            <div style={{ color: "#666" }}>{company.website}</div>
          )}
          {company.taxId && (
            <div style={{ color: "#666", marginTop: 4 }}>
              Tax ID: {company.taxId}
            </div>
          )}
        </div>
        <div style={{ textAlign: "right" }}>
          <div
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: accent,
              letterSpacing: 1,
            }}
          >
            INVOICE
          </div>
          <div style={{ marginTop: 8 }}>
            <div style={{ color: "#666" }}>
              <span style={{ fontWeight: 600, color: "#333" }}>
                {settings.invoiceNumber}
              </span>
            </div>
            <div style={{ color: "#666", marginTop: 4 }}>
              Date: {formatDate(settings.invoiceDate, settings.dateFormat)}
            </div>
            <div style={{ color: "#666" }}>
              Due: {formatDate(settings.dueDate, settings.dateFormat)}
            </div>
          </div>
        </div>
      </div>

      {/* Bill To */}
      <div style={{ marginBottom: 24 }}>
        <div
          style={{
            fontSize: 9,
            fontWeight: 600,
            color: accent,
            textTransform: "uppercase",
            letterSpacing: 1,
            marginBottom: 6,
          }}
        >
          Bill To
        </div>
        <div style={{ fontWeight: 600 }}>
          {client.name || "Client Name"}
        </div>
        {client.address && <div style={{ color: "#666" }}>{client.address}</div>}
        {client.email && <div style={{ color: "#666" }}>{client.email}</div>}
        {client.phone && <div style={{ color: "#666" }}>{client.phone}</div>}
      </div>

      {/* Table */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 16 }}>
        <thead>
          <tr
            style={{
              background: `${accent}15`,
              borderBottom: `2px solid ${accent}30`,
            }}
          >
            <th style={{ ...thStyle, textAlign: "left", color: accent }}>Description</th>
            <th style={{ ...thStyle, textAlign: "right", width: 50, color: accent }}>Qty</th>
            <th style={{ ...thStyle, textAlign: "right", width: 80, color: accent }}>Price</th>
            <th style={{ ...thStyle, textAlign: "right", width: 80, color: accent }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {lineItems.map((item, i) => {
            const total = lineItemTotals.find((t) => t.id === item.id);
            return (
              <tr
                key={item.id}
                style={{
                  borderBottom: "1px solid #f0f0f0",
                  background: i % 2 === 1 ? "#fafafa" : "transparent",
                }}
              >
                <td style={tdStyle}>
                  {item.description || "—"}
                </td>
                <td style={{ ...tdStyle, textAlign: "right" }}>
                  {formatQuantityWithUnit(item.quantity, item.unitType)}
                </td>
                <td style={{ ...tdStyle, textAlign: "right" }}>
                  {formatCurrency(item.unitPrice, cur)}
                </td>
                <td style={{ ...tdStyle, textAlign: "right", fontWeight: 500 }}>
                  {formatCurrency(total?.amount ?? 0, cur)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Summary */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 24 }}>
        <div style={{ width: 200 }}>
          <SummaryRow label="Subtotal" value={formatCurrency(subtotal, cur)} />
          {totalTax > 0 && (
            <SummaryRow
              label={`Tax (${settings.taxRate}%)`}
              value={formatCurrency(totalTax, cur)}
            />
          )}
          {discountAmount > 0 && (
            <SummaryRow
              label="Discount"
              value={`-${formatCurrency(discountAmount, cur)}`}
              color="#dc2626"
            />
          )}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "8px 0",
              marginTop: 4,
              borderTop: `2px solid ${accent}`,
              fontWeight: 700,
              fontSize: 13,
            }}
          >
            <span>Total</span>
            <span style={{ color: accent }}>
              {formatCurrency(grandTotal, cur)}
            </span>
          </div>
        </div>
      </div>

      {/* Notes & Terms */}
      <NotesBlock notes={notes} terms={terms} accent={accent} paymentLink={paymentLink} />
    </>
  );
}

/* ─── Classic Template ─── */
function ClassicLayout({
  company,
  client,
  lineItems,
  lineItemTotals,
  settings,
  subtotal,
  totalTax,
  discountAmount,
  grandTotal,
  notes,
  terms,
  paymentLink,
  accent,
  cur,
}: LayoutProps) {
  return (
    <>
      {/* Header bar */}
      <div
        style={{
          background: accent,
          margin: "-40px -40px 24px -40px",
          padding: "16px 40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {company.logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={company.logoUrl}
              alt=""
              style={{ height: 32, objectFit: "contain" }}
            />
          )}
          <div style={{ color: "#fff", fontSize: 16, fontWeight: 700 }}>
            {company.name || "Your Company"}
          </div>
        </div>
        <div style={{ color: "#fff", fontSize: 20, fontWeight: 700, letterSpacing: 2 }}>
          INVOICE
        </div>
      </div>

      {/* Company contact + Invoice details */}
      <div style={{ display: "flex", gap: 20, marginBottom: 20 }}>
        <div
          style={{
            flex: 1,
            border: "1px solid #e0e0e0",
            borderRadius: 4,
            padding: 12,
          }}
        >
          <div style={{ fontSize: 9, fontWeight: 600, color: accent, marginBottom: 6, textTransform: "uppercase" }}>
            From
          </div>
          {company.address && <div style={{ color: "#666" }}>{company.address}</div>}
          {company.email && <div style={{ color: "#666" }}>{company.email}</div>}
          {company.phone && <div style={{ color: "#666" }}>{company.phone}</div>}
          {company.taxId && <div style={{ color: "#666" }}>Tax ID: {company.taxId}</div>}
        </div>
        <div
          style={{
            flex: 1,
            border: "1px solid #e0e0e0",
            borderRadius: 4,
            padding: 12,
          }}
        >
          <div style={{ fontSize: 9, fontWeight: 600, color: accent, marginBottom: 6, textTransform: "uppercase" }}>
            Invoice Details
          </div>
          <div><span style={{ fontWeight: 600 }}>Number:</span> {settings.invoiceNumber}</div>
          <div><span style={{ fontWeight: 600 }}>Date:</span> {formatDate(settings.invoiceDate, settings.dateFormat)}</div>
          <div><span style={{ fontWeight: 600 }}>Due:</span> {formatDate(settings.dueDate, settings.dateFormat)}</div>
        </div>
      </div>

      {/* Bill To */}
      <div
        style={{
          border: "1px solid #e0e0e0",
          borderRadius: 4,
          padding: 12,
          marginBottom: 20,
        }}
      >
        <div style={{ fontSize: 9, fontWeight: 600, color: accent, marginBottom: 6, textTransform: "uppercase" }}>
          Bill To
        </div>
        <div style={{ fontWeight: 600 }}>{client.name || "Client Name"}</div>
        {client.address && <div style={{ color: "#666" }}>{client.address}</div>}
        {client.email && <div style={{ color: "#666" }}>{client.email}</div>}
        {client.phone && <div style={{ color: "#666" }}>{client.phone}</div>}
      </div>

      {/* Table */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 16, border: "1px solid #e0e0e0" }}>
        <thead>
          <tr style={{ background: `${accent}20` }}>
            <th style={{ ...thStyle, textAlign: "left", borderRight: "1px solid #e0e0e0" }}>Description</th>
            <th style={{ ...thStyle, textAlign: "right", width: 50, borderRight: "1px solid #e0e0e0" }}>Qty</th>
            <th style={{ ...thStyle, textAlign: "right", width: 80, borderRight: "1px solid #e0e0e0" }}>Price</th>
            <th style={{ ...thStyle, textAlign: "right", width: 80 }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {lineItems.map((item) => {
            const total = lineItemTotals.find((t) => t.id === item.id);
            return (
              <tr key={item.id} style={{ borderBottom: "1px solid #e0e0e0" }}>
                <td style={{ ...tdStyle, borderRight: "1px solid #e0e0e0" }}>
                  {item.description || "—"}
                </td>
                <td style={{ ...tdStyle, textAlign: "right", borderRight: "1px solid #e0e0e0" }}>
                  {formatQuantityWithUnit(item.quantity, item.unitType)}
                </td>
                <td style={{ ...tdStyle, textAlign: "right", borderRight: "1px solid #e0e0e0" }}>
                  {formatCurrency(item.unitPrice, cur)}
                </td>
                <td style={{ ...tdStyle, textAlign: "right", fontWeight: 500 }}>
                  {formatCurrency(total?.amount ?? 0, cur)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Summary */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 24 }}>
        <div style={{ width: 220 }}>
          <SummaryRow label="Subtotal" value={formatCurrency(subtotal, cur)} />
          {totalTax > 0 && (
            <SummaryRow label={`Tax (${settings.taxRate}%)`} value={formatCurrency(totalTax, cur)} />
          )}
          {discountAmount > 0 && (
            <SummaryRow label="Discount" value={`-${formatCurrency(discountAmount, cur)}`} color="#dc2626" />
          )}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "8px 12px",
              marginTop: 4,
              background: accent,
              color: "#fff",
              borderRadius: 4,
              fontWeight: 700,
              fontSize: 13,
            }}
          >
            <span>Total</span>
            <span>{formatCurrency(grandTotal, cur)}</span>
          </div>
        </div>
      </div>

      <NotesBlock notes={notes} terms={terms} accent={accent} paymentLink={paymentLink} />
    </>
  );
}

/* ─── Compact Template ─── */
function CompactLayout({
  company,
  client,
  lineItems,
  lineItemTotals,
  settings,
  subtotal,
  totalTax,
  discountAmount,
  grandTotal,
  notes,
  terms,
  paymentLink,
  accent,
  cur,
}: LayoutProps) {
  return (
    <>
      {/* Side-by-side header */}
      <div style={{ display: "flex", gap: 20, marginBottom: 16, fontSize: 9 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            {company.logoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={company.logoUrl} alt="" style={{ height: 24, objectFit: "contain" }} />
            )}
            <div style={{ fontSize: 12, fontWeight: 700, color: accent }}>
              {company.name || "Your Company"}
            </div>
          </div>
          {company.address && <div style={{ color: "#666" }}>{company.address}</div>}
          {company.email && <div style={{ color: "#666" }}>{company.email}</div>}
          {company.phone && <div style={{ color: "#666" }}>{company.phone}</div>}
          {company.taxId && <div style={{ color: "#666" }}>Tax ID: {company.taxId}</div>}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 9, fontWeight: 600, color: accent, textTransform: "uppercase", marginBottom: 4 }}>
            Bill To
          </div>
          <div style={{ fontWeight: 600 }}>{client.name || "Client Name"}</div>
          {client.address && <div style={{ color: "#666" }}>{client.address}</div>}
          {client.email && <div style={{ color: "#666" }}>{client.email}</div>}
          {client.phone && <div style={{ color: "#666" }}>{client.phone}</div>}
        </div>
      </div>

      {/* Invoice meta row */}
      <div
        style={{
          display: "flex",
          gap: 16,
          padding: "6px 8px",
          background: `${accent}10`,
          borderRadius: 3,
          marginBottom: 12,
          fontSize: 9,
        }}
      >
        <span>
          <span style={{ fontWeight: 600, color: accent }}>Invoice</span>{" "}
          {settings.invoiceNumber}
        </span>
        <span>
          <span style={{ fontWeight: 600 }}>Date:</span>{" "}
          {formatDate(settings.invoiceDate, settings.dateFormat)}
        </span>
        <span>
          <span style={{ fontWeight: 600 }}>Due:</span>{" "}
          {formatDate(settings.dueDate, settings.dateFormat)}
        </span>
      </div>

      {/* Table — dense */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 12, fontSize: 9 }}>
        <thead>
          <tr style={{ background: `${accent}12`, borderBottom: `1px solid ${accent}40` }}>
            <th style={{ ...thStyleCompact, textAlign: "left", color: accent }}>Description</th>
            <th style={{ ...thStyleCompact, textAlign: "right", width: 40, color: accent }}>Qty</th>
            <th style={{ ...thStyleCompact, textAlign: "right", width: 65, color: accent }}>Price</th>
            <th style={{ ...thStyleCompact, textAlign: "right", width: 65, color: accent }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {lineItems.map((item) => {
            const total = lineItemTotals.find((t) => t.id === item.id);
            return (
              <tr key={item.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                <td style={tdStyleCompact}>{item.description || "—"}</td>
                <td style={{ ...tdStyleCompact, textAlign: "right" }}>
                  {formatQuantityWithUnit(item.quantity, item.unitType)}
                </td>
                <td style={{ ...tdStyleCompact, textAlign: "right" }}>
                  {formatCurrency(item.unitPrice, cur)}
                </td>
                <td style={{ ...tdStyleCompact, textAlign: "right", fontWeight: 500 }}>
                  {formatCurrency(total?.amount ?? 0, cur)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Summary — compact */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <div style={{ width: 180, fontSize: 9 }}>
          <SummaryRow label="Subtotal" value={formatCurrency(subtotal, cur)} />
          {totalTax > 0 && (
            <SummaryRow label={`Tax (${settings.taxRate}%)`} value={formatCurrency(totalTax, cur)} />
          )}
          {discountAmount > 0 && (
            <SummaryRow label="Discount" value={`-${formatCurrency(discountAmount, cur)}`} color="#dc2626" />
          )}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "5px 0",
              marginTop: 2,
              borderTop: `2px solid ${accent}`,
              fontWeight: 700,
              fontSize: 11,
            }}
          >
            <span>Total</span>
            <span style={{ color: accent }}>{formatCurrency(grandTotal, cur)}</span>
          </div>
        </div>
      </div>

      <NotesBlock notes={notes} terms={terms} accent={accent} compact paymentLink={paymentLink} />
    </>
  );
}

/* ─── Shared sub-components ─── */

function SummaryRow({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "3px 0",
        fontSize: 10,
        color: color ?? "#666",
      }}
    >
      <span>{label}</span>
      <span style={{ fontWeight: 500 }}>{value}</span>
    </div>
  );
}

function NotesBlock({
  notes,
  terms,
  accent,
  compact,
  paymentLink,
}: {
  notes: string;
  terms: string;
  accent: string;
  compact?: boolean;
  paymentLink?: string;
}) {
  if (!notes && !terms && !paymentLink) return null;
  const fs = compact ? 8 : 9;
  return (
    <div style={{ fontSize: fs, color: "#666" }}>
      {notes && (
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontWeight: 600, color: accent, marginBottom: 2 }}>
            Notes
          </div>
          <div style={{ whiteSpace: "pre-wrap" }}>{notes}</div>
        </div>
      )}
      {terms && (
        <div style={{ marginBottom: paymentLink ? 8 : 0 }}>
          <div style={{ fontWeight: 600, color: accent, marginBottom: 2 }}>
            Terms &amp; Conditions
          </div>
          <div style={{ whiteSpace: "pre-wrap" }}>{terms}</div>
        </div>
      )}
      {paymentLink && (
        <div>
          <div style={{ fontWeight: 600, color: accent, marginBottom: 2 }}>
            Payment Link
          </div>
          <div style={{ color: accent, wordBreak: "break-all" }}>
            {paymentLink}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Shared styles ─── */

const thStyle: React.CSSProperties = {
  padding: "8px 6px",
  fontSize: 9,
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: 0.5,
};

const tdStyle: React.CSSProperties = {
  padding: "7px 6px",
};

const thStyleCompact: React.CSSProperties = {
  padding: "5px 4px",
  fontSize: 8,
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: 0.5,
};

const tdStyleCompact: React.CSSProperties = {
  padding: "4px 4px",
};
