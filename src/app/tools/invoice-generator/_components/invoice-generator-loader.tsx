"use client";

import dynamic from "next/dynamic";

const InvoiceGenerator = dynamic(
  () =>
    import("./invoice-generator").then((mod) => mod.InvoiceGenerator),
  { ssr: false }
);

export function InvoiceGeneratorLoader() {
  return <InvoiceGenerator />;
}
