"use client";

import dynamic from "next/dynamic";

const GraphingCalculator = dynamic(
  () =>
    import("./graphing-calculator").then((mod) => mod.GraphingCalculator),
  { ssr: false }
);

export function GraphingCalculatorLoader() {
  return <GraphingCalculator />;
}
