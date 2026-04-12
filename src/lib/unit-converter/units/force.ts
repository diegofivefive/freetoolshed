import type { LinearUnit } from "../types";

export const forceUnits: LinearUnit[] = [
  { id: "newton", name: "Newton", symbol: "N", aliases: ["newtons"], category: "force", factor: 1 },
  { id: "kilonewton", name: "Kilonewton", symbol: "kN", aliases: ["kilonewtons"], category: "force", factor: 1000 },
  { id: "meganewton", name: "Meganewton", symbol: "MN", aliases: ["meganewtons"], category: "force", factor: 1e6 },
  { id: "dyne", name: "Dyne", symbol: "dyn", aliases: ["dynes"], category: "force", factor: 1e-5 },
  { id: "kilogram-force", name: "Kilogram-Force", symbol: "kgf", aliases: ["kilopond", "kp"], category: "force", factor: 9.80665 },
  { id: "pound-force", name: "Pound-Force", symbol: "lbf", aliases: ["pound force", "pounds force"], category: "force", factor: 4.4482216152605 },
  { id: "ounce-force", name: "Ounce-Force", symbol: "ozf", aliases: ["ounce force"], category: "force", factor: 0.27801385095378 },
  { id: "poundal", name: "Poundal", symbol: "pdl", aliases: ["poundals"], category: "force", factor: 0.138254954376 },
  { id: "kip", name: "Kip", symbol: "kip", aliases: ["kips", "kilopound"], category: "force", factor: 4448.2216152605 },
];
