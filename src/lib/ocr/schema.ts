import { z } from "zod";

export const ocrResultSchema = z.object({
  fileName: z.string(),
  pageNumber: z.number(),
  text: z.string(),
  confidence: z.number(),
  language: z.string(),
});

export const ocrExportEnvelopeSchema = z.object({
  tool: z.literal("freetoolshed-ocr-scanner"),
  version: z.literal(1),
  exportedAt: z.string(),
  results: z.array(ocrResultSchema),
});
