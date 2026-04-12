import type { FunctionUnit, UnitDefinition } from "../types";

// Fuel economy is special: some units are "distance per volume" and some are "volume per distance".
// We use km/L as base. Everything converts through km/L.
export const fuelEconomyUnits: UnitDefinition[] = [
  {
    id: "km-per-liter",
    name: "Kilometers per Liter",
    symbol: "km/L",
    aliases: ["km/l", "kilometers per liter"],
    category: "fuel-economy",
    toBase: (v: number) => v,
    fromBase: (v: number) => v,
  } satisfies FunctionUnit,
  {
    id: "liters-per-100km",
    name: "Liters per 100 km",
    symbol: "L/100km",
    aliases: ["l/100km", "liters per 100km"],
    category: "fuel-economy",
    toBase: (v: number) => (v === 0 ? 0 : 100 / v),
    fromBase: (v: number) => (v === 0 ? 0 : 100 / v),
  } satisfies FunctionUnit,
  {
    id: "miles-per-gallon-us",
    name: "Miles per Gallon (US)",
    symbol: "mpg",
    aliases: ["mpg us", "miles per gallon"],
    category: "fuel-economy",
    toBase: (v: number) => v * 0.425143707,
    fromBase: (v: number) => v / 0.425143707,
  } satisfies FunctionUnit,
  {
    id: "miles-per-gallon-imp",
    name: "Miles per Gallon (Imperial)",
    symbol: "mpg (imp)",
    aliases: ["mpg imp", "mpg imperial"],
    category: "fuel-economy",
    toBase: (v: number) => v * 0.354006044,
    fromBase: (v: number) => v / 0.354006044,
  } satisfies FunctionUnit,
  {
    id: "km-per-gallon-us",
    name: "Kilometers per Gallon (US)",
    symbol: "km/gal",
    aliases: ["km/gal", "kilometers per gallon"],
    category: "fuel-economy",
    toBase: (v: number) => v / 3.785411784,
    fromBase: (v: number) => v * 3.785411784,
  } satisfies FunctionUnit,
];
