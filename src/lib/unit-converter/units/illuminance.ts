import type { LinearUnit } from "../types";

export const illuminanceUnits: LinearUnit[] = [
  { id: "lux", name: "Lux", symbol: "lx", aliases: ["lux"], category: "illuminance", factor: 1 },
  { id: "kilolux", name: "Kilolux", symbol: "klx", aliases: ["kilolux"], category: "illuminance", factor: 1000 },
  { id: "foot-candle", name: "Foot-Candle", symbol: "fc", aliases: ["foot candles", "foot-candles", "ftc"], category: "illuminance", factor: 10.7639 },
  { id: "phot", name: "Phot", symbol: "ph", aliases: ["phots"], category: "illuminance", factor: 10000 },
  { id: "nox", name: "Nox", symbol: "nx", aliases: ["nox"], category: "illuminance", factor: 0.001 },
  { id: "lumen-per-square-meter", name: "Lumen per Square Meter", symbol: "lm/m\u00B2", aliases: ["lm/m2"], category: "illuminance", factor: 1 },
  { id: "lumen-per-square-foot", name: "Lumen per Square Foot", symbol: "lm/ft\u00B2", aliases: ["lm/ft2"], category: "illuminance", factor: 10.7639 },
];
