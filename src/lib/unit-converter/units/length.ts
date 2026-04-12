import type { LinearUnit } from "../types";

export const lengthUnits: LinearUnit[] = [
  { id: "meter", name: "Meter", symbol: "m", aliases: ["meters", "metre", "metres"], category: "length", factor: 1 },
  { id: "kilometer", name: "Kilometer", symbol: "km", aliases: ["kilometers", "kilometre"], category: "length", factor: 1000 },
  { id: "centimeter", name: "Centimeter", symbol: "cm", aliases: ["centimeters", "centimetre"], category: "length", factor: 0.01 },
  { id: "millimeter", name: "Millimeter", symbol: "mm", aliases: ["millimeters", "millimetre"], category: "length", factor: 0.001 },
  { id: "micrometer", name: "Micrometer", symbol: "\u00B5m", aliases: ["micrometers", "micron", "microns"], category: "length", factor: 1e-6 },
  { id: "nanometer", name: "Nanometer", symbol: "nm", aliases: ["nanometers", "nanometre"], category: "length", factor: 1e-9 },
  { id: "mile", name: "Mile", symbol: "mi", aliases: ["miles"], category: "length", factor: 1609.344 },
  { id: "yard", name: "Yard", symbol: "yd", aliases: ["yards"], category: "length", factor: 0.9144 },
  { id: "foot", name: "Foot", symbol: "ft", aliases: ["feet"], category: "length", factor: 0.3048 },
  { id: "inch", name: "Inch", symbol: "in", aliases: ["inches"], category: "length", factor: 0.0254 },
  { id: "nautical-mile", name: "Nautical Mile", symbol: "nmi", aliases: ["nautical miles", "naut mi"], category: "length", factor: 1852 },
  { id: "fathom", name: "Fathom", symbol: "ftm", aliases: ["fathoms"], category: "length", factor: 1.8288 },
  { id: "furlong", name: "Furlong", symbol: "fur", aliases: ["furlongs"], category: "length", factor: 201.168 },
  { id: "angstrom", name: "Angstrom", symbol: "\u00C5", aliases: ["angstroms"], category: "length", factor: 1e-10 },
  { id: "light-year", name: "Light Year", symbol: "ly", aliases: ["light years", "lightyear"], category: "length", factor: 9.461e15 },
  { id: "parsec", name: "Parsec", symbol: "pc", aliases: ["parsecs"], category: "length", factor: 3.086e16 },
  { id: "astronomical-unit", name: "Astronomical Unit", symbol: "AU", aliases: ["au", "astronomical units"], category: "length", factor: 1.496e11 },
  { id: "chain", name: "Chain", symbol: "ch", aliases: ["chains"], category: "length", factor: 20.1168 },
  { id: "rod", name: "Rod", symbol: "rd", aliases: ["rods", "perch", "pole"], category: "length", factor: 5.0292 },
  { id: "mil", name: "Mil (Thousandth Inch)", symbol: "mil", aliases: ["mils", "thou"], category: "length", factor: 2.54e-5 },
];
