import type { LinearUnit } from "../types";

export const volumeUnits: LinearUnit[] = [
  { id: "liter", name: "Liter", symbol: "L", aliases: ["liters", "litre", "litres"], category: "volume", factor: 1 },
  { id: "milliliter", name: "Milliliter", symbol: "mL", aliases: ["milliliters", "millilitre", "cc"], category: "volume", factor: 0.001 },
  { id: "cubic-meter", name: "Cubic Meter", symbol: "m\u00B3", aliases: ["cubic meters", "m3"], category: "volume", factor: 1000 },
  { id: "cubic-centimeter", name: "Cubic Centimeter", symbol: "cm\u00B3", aliases: ["cubic centimeters", "cm3"], category: "volume", factor: 0.001 },
  { id: "cubic-inch", name: "Cubic Inch", symbol: "in\u00B3", aliases: ["cubic inches", "in3"], category: "volume", factor: 0.016387064 },
  { id: "cubic-foot", name: "Cubic Foot", symbol: "ft\u00B3", aliases: ["cubic feet", "ft3"], category: "volume", factor: 28.316846592 },
  { id: "cubic-yard", name: "Cubic Yard", symbol: "yd\u00B3", aliases: ["cubic yards", "yd3"], category: "volume", factor: 764.554857984 },
  { id: "us-gallon", name: "US Gallon", symbol: "gal", aliases: ["gallons", "us gallons", "gallon"], category: "volume", factor: 3.785411784 },
  { id: "us-quart", name: "US Quart", symbol: "qt", aliases: ["quarts", "us quarts"], category: "volume", factor: 0.946352946 },
  { id: "us-pint", name: "US Pint", symbol: "pt", aliases: ["pints", "us pints"], category: "volume", factor: 0.473176473 },
  { id: "us-cup", name: "US Cup", symbol: "cup", aliases: ["cups", "us cups"], category: "volume", factor: 0.2365882365 },
  { id: "us-fluid-ounce", name: "US Fluid Ounce", symbol: "fl oz", aliases: ["fluid ounces", "fl oz", "us fl oz"], category: "volume", factor: 0.029573529563 },
  { id: "us-tablespoon", name: "US Tablespoon", symbol: "tbsp", aliases: ["tablespoons", "tbs"], category: "volume", factor: 0.014786764781 },
  { id: "us-teaspoon", name: "US Teaspoon", symbol: "tsp", aliases: ["teaspoons"], category: "volume", factor: 0.004928921594 },
  { id: "imperial-gallon", name: "Imperial Gallon", symbol: "imp gal", aliases: ["imperial gallons", "uk gallon"], category: "volume", factor: 4.54609 },
  { id: "imperial-quart", name: "Imperial Quart", symbol: "imp qt", aliases: ["imperial quarts"], category: "volume", factor: 1.1365225 },
  { id: "imperial-pint", name: "Imperial Pint", symbol: "imp pt", aliases: ["imperial pints", "uk pint"], category: "volume", factor: 0.56826125 },
  { id: "imperial-fluid-ounce", name: "Imperial Fluid Ounce", symbol: "imp fl oz", aliases: ["imperial fluid ounces"], category: "volume", factor: 0.028413063 },
  { id: "barrel-oil", name: "Barrel (Oil)", symbol: "bbl", aliases: ["barrels", "oil barrel"], category: "volume", factor: 158.987294928 },
  { id: "hectoliter", name: "Hectoliter", symbol: "hL", aliases: ["hectoliters", "hectolitre"], category: "volume", factor: 100 },
];
