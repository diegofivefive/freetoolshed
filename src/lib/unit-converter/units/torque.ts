import type { LinearUnit } from "../types";

export const torqueUnits: LinearUnit[] = [
  { id: "newton-meter", name: "Newton Meter", symbol: "N\u00B7m", aliases: ["newton meters", "nm", "n-m", "n*m"], category: "torque", factor: 1 },
  { id: "kilonewton-meter", name: "Kilonewton Meter", symbol: "kN\u00B7m", aliases: ["kilonewton meters", "knm"], category: "torque", factor: 1000 },
  { id: "foot-pound-torque", name: "Foot-Pound", symbol: "ft\u00B7lbf", aliases: ["foot pounds", "ft lbf", "ft-lbs", "ft lbs"], category: "torque", factor: 1.3558179483 },
  { id: "inch-pound", name: "Inch-Pound", symbol: "in\u00B7lbf", aliases: ["inch pounds", "in lbf", "in-lbs", "in lbs"], category: "torque", factor: 0.1129848290 },
  { id: "kilogram-force-meter", name: "Kilogram-Force Meter", symbol: "kgf\u00B7m", aliases: ["kgf m", "kgf-m"], category: "torque", factor: 9.80665 },
  { id: "kilogram-force-centimeter", name: "Kilogram-Force Centimeter", symbol: "kgf\u00B7cm", aliases: ["kgf cm", "kgf-cm"], category: "torque", factor: 0.0980665 },
  { id: "dyne-centimeter", name: "Dyne Centimeter", symbol: "dyn\u00B7cm", aliases: ["dyne cm"], category: "torque", factor: 1e-7 },
  { id: "ounce-force-inch", name: "Ounce-Force Inch", symbol: "ozf\u00B7in", aliases: ["ounce force inch"], category: "torque", factor: 0.00706155 },
];
