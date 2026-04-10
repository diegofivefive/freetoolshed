"use client";

import dynamic from "next/dynamic";

const PeriodicTable = dynamic(
  () => import("./periodic-table").then((mod) => mod.PeriodicTable),
  { ssr: false }
);

export function PeriodicTableLoader() {
  return <PeriodicTable />;
}
