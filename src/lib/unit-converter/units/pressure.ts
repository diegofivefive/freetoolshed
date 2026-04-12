import type { LinearUnit } from "../types";

export const pressureUnits: LinearUnit[] = [
  { id: "pascal", name: "Pascal", symbol: "Pa", aliases: ["pascals"], category: "pressure", factor: 1 },
  { id: "kilopascal", name: "Kilopascal", symbol: "kPa", aliases: ["kilopascals"], category: "pressure", factor: 1000 },
  { id: "megapascal", name: "Megapascal", symbol: "MPa", aliases: ["megapascals"], category: "pressure", factor: 1e6 },
  { id: "gigapascal", name: "Gigapascal", symbol: "GPa", aliases: ["gigapascals"], category: "pressure", factor: 1e9 },
  { id: "bar", name: "Bar", symbol: "bar", aliases: ["bars"], category: "pressure", factor: 100000 },
  { id: "millibar", name: "Millibar", symbol: "mbar", aliases: ["millibars"], category: "pressure", factor: 100 },
  { id: "atmosphere", name: "Atmosphere", symbol: "atm", aliases: ["atmospheres", "standard atmosphere"], category: "pressure", factor: 101325 },
  { id: "psi", name: "Pounds per Square Inch", symbol: "psi", aliases: ["pound per square inch", "lbf/in2"], category: "pressure", factor: 6894.757293168 },
  { id: "mmhg", name: "Millimeters of Mercury", symbol: "mmHg", aliases: ["mm hg", "millimeters mercury"], category: "pressure", factor: 133.322387415 },
  { id: "torr", name: "Torr", symbol: "Torr", aliases: ["torrs"], category: "pressure", factor: 133.322368421 },
  { id: "inhg", name: "Inches of Mercury", symbol: "inHg", aliases: ["in hg", "inches mercury"], category: "pressure", factor: 3386.389 },
  { id: "inh2o", name: "Inches of Water", symbol: "inH\u2082O", aliases: ["in h2o", "inches water"], category: "pressure", factor: 249.08891 },
  { id: "cmh2o", name: "Centimeters of Water", symbol: "cmH\u2082O", aliases: ["cm h2o"], category: "pressure", factor: 98.0665 },
  { id: "kgf-per-cm2", name: "Kilogram-Force per cm\u00B2", symbol: "kgf/cm\u00B2", aliases: ["kgf/cm2", "technical atmosphere", "at"], category: "pressure", factor: 98066.5 },
];
