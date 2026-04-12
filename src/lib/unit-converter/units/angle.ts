import type { LinearUnit } from "../types";

export const angleUnits: LinearUnit[] = [
  { id: "radian", name: "Radian", symbol: "rad", aliases: ["radians"], category: "angle", factor: 1 },
  { id: "degree", name: "Degree", symbol: "\u00B0", aliases: ["degrees", "deg"], category: "angle", factor: Math.PI / 180 },
  { id: "gradian", name: "Gradian", symbol: "gon", aliases: ["gradians", "grad", "gon"], category: "angle", factor: Math.PI / 200 },
  { id: "arcminute", name: "Arcminute", symbol: "\u2032", aliases: ["arcminutes", "arc minute", "minute of arc", "moa"], category: "angle", factor: Math.PI / 10800 },
  { id: "arcsecond", name: "Arcsecond", symbol: "\u2033", aliases: ["arcseconds", "arc second", "second of arc"], category: "angle", factor: Math.PI / 648000 },
  { id: "revolution", name: "Revolution", symbol: "rev", aliases: ["revolutions", "turn", "turns", "full circle"], category: "angle", factor: 2 * Math.PI },
  { id: "milliradian", name: "Milliradian", symbol: "mrad", aliases: ["milliradians", "mil"], category: "angle", factor: 0.001 },
];
