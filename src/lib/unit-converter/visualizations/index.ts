import type { CategoryId } from "../types";
import { drawBarComparison } from "./bar-comparison";
import { drawThermometer } from "./thermometer";
import { drawBalanceScale } from "./balance-scale";
import { drawSpeedometer } from "./speedometer";
import { drawDataBlocks } from "./data-blocks";

export interface VisualizationParams {
  fromValue: number;
  toValue: number;
  fromSymbol: string;
  toSymbol: string;
  brandColor: string;
  mutedColor: string;
  textColor: string;
}

export type VisualizationRenderer = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  params: VisualizationParams,
  progress: number
) => void;

const RENDERER_MAP: Partial<Record<CategoryId, VisualizationRenderer>> = {
  temperature: drawThermometer,
  mass: drawBalanceScale,
  speed: drawSpeedometer,
  data: drawDataBlocks,
};

/**
 * Get the visualization renderer for a category.
 * Falls back to bar comparison for categories without a custom renderer.
 */
export function getRenderer(category: CategoryId): VisualizationRenderer {
  return RENDERER_MAP[category] ?? drawBarComparison;
}
