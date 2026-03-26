"use client";

import dynamic from "next/dynamic";

const ResumeBuilder = dynamic(
  () =>
    import("./resume-builder").then((mod) => mod.ResumeBuilder),
  { ssr: false }
);

export function ResumeBuilderLoader() {
  return <ResumeBuilder />;
}
