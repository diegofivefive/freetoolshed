import type { LinearUnit } from "../types";

export const electricCurrentUnits: LinearUnit[] = [
  { id: "ampere", name: "Ampere", symbol: "A", aliases: ["amperes", "amp", "amps"], category: "electric-current", factor: 1 },
  { id: "milliampere", name: "Milliampere", symbol: "mA", aliases: ["milliamperes", "milliamp"], category: "electric-current", factor: 0.001 },
  { id: "microampere", name: "Microampere", symbol: "\u00B5A", aliases: ["microamperes", "microamp"], category: "electric-current", factor: 1e-6 },
  { id: "nanoampere", name: "Nanoampere", symbol: "nA", aliases: ["nanoamperes", "nanoamp"], category: "electric-current", factor: 1e-9 },
  { id: "kiloampere", name: "Kiloampere", symbol: "kA", aliases: ["kiloamperes", "kiloamp"], category: "electric-current", factor: 1000 },
  { id: "abampere", name: "Abampere", symbol: "abA", aliases: ["abamperes", "biot"], category: "electric-current", factor: 10 },
  { id: "statampere", name: "Statampere", symbol: "statA", aliases: ["statamperes"], category: "electric-current", factor: 3.33564e-10 },
];
