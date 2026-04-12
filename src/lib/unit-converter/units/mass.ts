import type { LinearUnit } from "../types";

export const massUnits: LinearUnit[] = [
  { id: "kilogram", name: "Kilogram", symbol: "kg", aliases: ["kilograms", "kilo", "kilos"], category: "mass", factor: 1 },
  { id: "gram", name: "Gram", symbol: "g", aliases: ["grams", "gm"], category: "mass", factor: 0.001 },
  { id: "milligram", name: "Milligram", symbol: "mg", aliases: ["milligrams"], category: "mass", factor: 1e-6 },
  { id: "microgram", name: "Microgram", symbol: "\u00B5g", aliases: ["micrograms", "mcg"], category: "mass", factor: 1e-9 },
  { id: "metric-ton", name: "Metric Ton", symbol: "t", aliases: ["metric tons", "tonne", "tonnes"], category: "mass", factor: 1000 },
  { id: "pound", name: "Pound", symbol: "lb", aliases: ["pounds", "lbs"], category: "mass", factor: 0.45359237 },
  { id: "ounce", name: "Ounce", symbol: "oz", aliases: ["ounces"], category: "mass", factor: 0.028349523125 },
  { id: "stone", name: "Stone", symbol: "st", aliases: ["stones"], category: "mass", factor: 6.35029318 },
  { id: "us-ton", name: "US Ton (Short)", symbol: "ton", aliases: ["short ton", "short tons", "us tons"], category: "mass", factor: 907.18474 },
  { id: "imperial-ton", name: "Imperial Ton (Long)", symbol: "long ton", aliases: ["long tons", "imperial tons"], category: "mass", factor: 1016.0469088 },
  { id: "carat", name: "Carat", symbol: "ct", aliases: ["carats"], category: "mass", factor: 0.0002 },
  { id: "grain", name: "Grain", symbol: "gr", aliases: ["grains"], category: "mass", factor: 6.479891e-5 },
  { id: "troy-ounce", name: "Troy Ounce", symbol: "oz t", aliases: ["troy ounces"], category: "mass", factor: 0.0311034768 },
  { id: "slug", name: "Slug", symbol: "slug", aliases: ["slugs"], category: "mass", factor: 14.593903 },
  { id: "atomic-mass-unit", name: "Atomic Mass Unit", symbol: "u", aliases: ["amu", "dalton", "Da"], category: "mass", factor: 1.66053906660e-27 },
];
