"use client";

import dynamic from "next/dynamic";

const OcrScanner = dynamic(
  () => import("./ocr-scanner").then((mod) => mod.OcrScanner),
  { ssr: false }
);

export function OcrScannerLoader() {
  return <OcrScanner />;
}
