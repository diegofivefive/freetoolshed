import type { LinearUnit } from "../types";

// Base unit: milliliter (mL)
export const cookingUnits: LinearUnit[] = [
  { id: "ml-cooking", name: "Milliliter", symbol: "mL", aliases: ["milliliters", "ml", "cc"], category: "cooking", factor: 1 },
  { id: "liter-cooking", name: "Liter", symbol: "L", aliases: ["liters", "l"], category: "cooking", factor: 1000 },
  { id: "teaspoon", name: "Teaspoon", symbol: "tsp", aliases: ["teaspoons"], category: "cooking", factor: 4.92892 },
  { id: "tablespoon", name: "Tablespoon", symbol: "tbsp", aliases: ["tablespoons", "tbs"], category: "cooking", factor: 14.7868 },
  { id: "fluid-ounce-cooking", name: "Fluid Ounce", symbol: "fl oz", aliases: ["fluid ounces"], category: "cooking", factor: 29.5735 },
  { id: "cup-cooking", name: "Cup", symbol: "cup", aliases: ["cups"], category: "cooking", factor: 236.588 },
  { id: "pint-cooking", name: "Pint", symbol: "pt", aliases: ["pints"], category: "cooking", factor: 473.176 },
  { id: "quart-cooking", name: "Quart", symbol: "qt", aliases: ["quarts"], category: "cooking", factor: 946.353 },
  { id: "gallon-cooking", name: "Gallon", symbol: "gal", aliases: ["gallons"], category: "cooking", factor: 3785.41 },
  { id: "drop", name: "Drop", symbol: "drop", aliases: ["drops", "gtt"], category: "cooking", factor: 0.05 },
  { id: "dash", name: "Dash", symbol: "dash", aliases: ["dashes"], category: "cooking", factor: 0.616115 },
  { id: "pinch", name: "Pinch", symbol: "pinch", aliases: ["pinches"], category: "cooking", factor: 0.308057 },
  { id: "smidgen", name: "Smidgen", symbol: "smidgen", aliases: ["smidgens"], category: "cooking", factor: 0.154029 },
  { id: "stick-butter", name: "Stick of Butter", symbol: "stick", aliases: ["sticks", "stick of butter"], category: "cooking", factor: 118.294 },
];
