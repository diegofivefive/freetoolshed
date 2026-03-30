"use client";

import dynamic from "next/dynamic";

const PayStubGenerator = dynamic(
  () =>
    import("./pay-stub-generator").then((mod) => mod.PayStubGenerator),
  { ssr: false }
);

export function PayStubGeneratorLoader() {
  return <PayStubGenerator />;
}
