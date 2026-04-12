import type { LinearUnit } from "../types";

export const viscosityUnits: LinearUnit[] = [
  { id: "pascal-second", name: "Pascal Second", symbol: "Pa\u00B7s", aliases: ["pascal seconds", "pa-s", "pa*s"], category: "viscosity", factor: 1 },
  { id: "millipascal-second", name: "Millipascal Second", symbol: "mPa\u00B7s", aliases: ["millipascal seconds", "centipoise"], category: "viscosity", factor: 0.001 },
  { id: "poise", name: "Poise", symbol: "P", aliases: ["poises"], category: "viscosity", factor: 0.1 },
  { id: "centipoise", name: "Centipoise", symbol: "cP", aliases: ["cp"], category: "viscosity", factor: 0.001 },
  { id: "micropoise", name: "Micropoise", symbol: "\u00B5P", aliases: ["micropoise"], category: "viscosity", factor: 1e-7 },
  { id: "pound-per-foot-second", name: "Pound per Foot Second", symbol: "lb/(ft\u00B7s)", aliases: ["lb/ft-s"], category: "viscosity", factor: 1.488164 },
  { id: "pound-per-foot-hour", name: "Pound per Foot Hour", symbol: "lb/(ft\u00B7h)", aliases: ["lb/ft-h"], category: "viscosity", factor: 0.000413379 },
  { id: "stokes", name: "Stokes", symbol: "St", aliases: ["stoke"], category: "viscosity", factor: 1e-4 },
  { id: "centistokes", name: "Centistokes", symbol: "cSt", aliases: ["centistoke"], category: "viscosity", factor: 1e-6 },
];
