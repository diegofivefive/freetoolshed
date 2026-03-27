import { z } from "zod";

// ── Element schemas ──────────────────────────────────────────

const baseElementSchema = z.object({
  id: z.string(),
  x: z.number(),
  y: z.number(),
  rotation: z.number(),
  locked: z.boolean(),
  label: z.string(),
  opacity: z.number().min(0).max(1),
  zIndex: z.number(),
});

export const roomElementSchema = baseElementSchema.extend({
  type: z.literal("room"),
  width: z.number().positive(),
  height: z.number().positive(),
  roomType: z.enum([
    "living-room", "bedroom", "kitchen", "bathroom", "dining-room",
    "office", "garage", "hallway", "closet", "laundry", "custom",
  ]),
  fill: z.string(),
  strokeColor: z.string(),
  showDimensions: z.boolean(),
});

export const furnitureElementSchema = baseElementSchema.extend({
  type: z.literal("furniture"),
  width: z.number().positive(),
  height: z.number().positive(),
  furnitureType: z.string(),
  category: z.enum(["living", "bedroom", "kitchen", "bathroom", "office", "outdoor"]),
  fill: z.string(),
});

export const wallElementSchema = baseElementSchema.extend({
  type: z.literal("wall"),
  x2: z.number(),
  y2: z.number(),
  thickness: z.number().positive(),
  strokeColor: z.string(),
});

export const textElementSchema = baseElementSchema.extend({
  type: z.literal("text"),
  text: z.string(),
  fontSize: z.number().positive(),
  fontWeight: z.enum(["normal", "bold"]),
  color: z.string(),
});

export const floorPlanElementSchema = z.discriminatedUnion("type", [
  roomElementSchema,
  furnitureElementSchema,
  wallElementSchema,
  textElementSchema,
]);

// ── Floor plan schema ────────────────────────────────────────

export const floorPlanSchema = z.object({
  id: z.string(),
  name: z.string(),
  width: z.number().positive(),
  height: z.number().positive(),
  unit: z.enum(["ft", "m"]),
  gridSize: z.number().positive(),
  gridSnap: z.boolean(),
  showGrid: z.boolean(),
  showDimensions: z.boolean(),
  backgroundColor: z.string(),
  elements: z.array(floorPlanElementSchema),
});

// ── Saved plan schema ────────────────────────────────────────

export const savedFloorPlanSchema = z.object({
  id: z.string(),
  plan: floorPlanSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const exportEnvelopeSchema = z.object({
  tool: z.literal("freetoolshed-floor-plan-maker"),
  version: z.literal(1),
  exportedAt: z.string(),
  plans: z.array(savedFloorPlanSchema),
});

// ── Validation ───────────────────────────────────────────────

export type FloorPlanValidationError = {
  field: string;
  message: string;
};

export function validateFloorPlan(
  data: unknown
): { success: true } | { success: false; errors: FloorPlanValidationError[] } {
  const result = floorPlanSchema.safeParse(data);
  if (result.success) {
    return { success: true };
  }
  const errors: FloorPlanValidationError[] = result.error.issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
  }));
  return { success: false, errors };
}
