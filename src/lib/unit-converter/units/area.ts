import type { LinearUnit } from "../types";

export const areaUnits: LinearUnit[] = [
  { id: "square-meter", name: "Square Meter", symbol: "m\u00B2", aliases: ["square meters", "sq m", "m2"], category: "area", factor: 1 },
  { id: "square-kilometer", name: "Square Kilometer", symbol: "km\u00B2", aliases: ["square kilometers", "sq km", "km2"], category: "area", factor: 1e6 },
  { id: "square-centimeter", name: "Square Centimeter", symbol: "cm\u00B2", aliases: ["square centimeters", "sq cm", "cm2"], category: "area", factor: 1e-4 },
  { id: "square-millimeter", name: "Square Millimeter", symbol: "mm\u00B2", aliases: ["square millimeters", "sq mm", "mm2"], category: "area", factor: 1e-6 },
  { id: "hectare", name: "Hectare", symbol: "ha", aliases: ["hectares"], category: "area", factor: 10000 },
  { id: "acre", name: "Acre", symbol: "ac", aliases: ["acres"], category: "area", factor: 4046.8564224 },
  { id: "square-mile", name: "Square Mile", symbol: "mi\u00B2", aliases: ["square miles", "sq mi", "mi2"], category: "area", factor: 2589988.110336 },
  { id: "square-yard", name: "Square Yard", symbol: "yd\u00B2", aliases: ["square yards", "sq yd", "yd2"], category: "area", factor: 0.83612736 },
  { id: "square-foot", name: "Square Foot", symbol: "ft\u00B2", aliases: ["square feet", "sq ft", "ft2"], category: "area", factor: 0.09290304 },
  { id: "square-inch", name: "Square Inch", symbol: "in\u00B2", aliases: ["square inches", "sq in", "in2"], category: "area", factor: 6.4516e-4 },
  { id: "barn", name: "Barn", symbol: "b", aliases: ["barns"], category: "area", factor: 1e-28 },
];
