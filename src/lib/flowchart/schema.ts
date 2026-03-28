import { z } from "zod";

// ── Node style schema ────────────────────────────────────────

export const nodeStyleSchema = z.object({
  fill: z.string(),
  stroke: z.string(),
  strokeWidth: z.number().positive(),
  fontSize: z.number().positive(),
  fontWeight: z.enum(["normal", "bold"]),
  textAlign: z.enum(["left", "center", "right"]),
  textColor: z.string(),
  opacity: z.number().min(0).max(1),
});

// ── Node schema ──────────────────────────────────────────────

export const nodeShapeTypeSchema = z.enum([
  "process", "decision", "terminal", "io", "document",
  "predefined-process", "manual-input", "preparation",
  "database", "connector", "comment",
]);

export const flowchartNodeSchema = z.object({
  id: z.string(),
  shape: nodeShapeTypeSchema,
  x: z.number(),
  y: z.number(),
  width: z.number().positive(),
  height: z.number().positive(),
  text: z.string(),
  style: nodeStyleSchema,
  rotation: z.number(),
  locked: z.boolean(),
  zIndex: z.number(),
});

// ── Edge style schema ────────────────────────────────────────

export const edgeStyleSchema = z.object({
  stroke: z.string(),
  strokeWidth: z.number().positive(),
  dashArray: z.string(),
  arrowHead: z.enum(["none", "arrow", "filled-arrow", "diamond", "circle"]),
  arrowTail: z.enum(["none", "arrow", "filled-arrow", "diamond", "circle"]),
  opacity: z.number().min(0).max(1),
});

// ── Edge schema ──────────────────────────────────────────────

export const anchorPositionSchema = z.enum(["top", "right", "bottom", "left"]);

export const controlPointSchema = z.object({
  x: z.number(),
  y: z.number(),
});

export const flowchartEdgeSchema = z.object({
  id: z.string(),
  sourceNodeId: z.string(),
  sourceAnchor: anchorPositionSchema,
  targetNodeId: z.string(),
  targetAnchor: anchorPositionSchema,
  routeType: z.enum(["straight", "bezier", "orthogonal"]),
  controlPoints: z.array(controlPointSchema),
  label: z.string(),
  style: edgeStyleSchema,
  zIndex: z.number(),
});

// ── Diagram schema ───────────────────────────────────────────

export const flowchartDiagramSchema = z.object({
  id: z.string(),
  name: z.string(),
  nodes: z.array(flowchartNodeSchema),
  edges: z.array(flowchartEdgeSchema),
  gridSize: z.number().positive(),
  gridSnap: z.boolean(),
  gridVisible: z.boolean(),
  backgroundColor: z.string(),
});

// ── Saved diagram schema ─────────────────────────────────────

export const savedDiagramSchema = z.object({
  id: z.string(),
  diagram: flowchartDiagramSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const exportEnvelopeSchema = z.object({
  tool: z.literal("freetoolshed-flowchart-maker"),
  version: z.literal(1),
  exportedAt: z.string(),
  diagrams: z.array(savedDiagramSchema),
});

// ── Validation ───────────────────────────────────────────────

export type DiagramValidationError = {
  field: string;
  message: string;
};

export function validateDiagram(
  data: unknown
): { success: true } | { success: false; errors: DiagramValidationError[] } {
  const result = flowchartDiagramSchema.safeParse(data);
  if (result.success) {
    return { success: true };
  }
  const errors: DiagramValidationError[] = result.error.issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
  }));
  return { success: false, errors };
}
