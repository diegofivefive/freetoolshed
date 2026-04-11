"use client";

import dynamic from "next/dynamic";

const ScreenRecorder = dynamic(
  () => import("./screen-recorder").then((mod) => mod.ScreenRecorder),
  { ssr: false }
);

export function ScreenRecorderLoader() {
  return <ScreenRecorder />;
}
