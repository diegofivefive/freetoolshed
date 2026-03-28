"use client";

import dynamic from "next/dynamic";

const FlowchartMaker = dynamic(
  () => import("./flowchart-maker").then((mod) => mod.FlowchartMaker),
  { ssr: false }
);

export function FlowchartMakerLoader() {
  return <FlowchartMaker />;
}
