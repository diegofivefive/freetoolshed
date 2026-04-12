import type { LinearUnit } from "../types";

export const flowRateUnits: LinearUnit[] = [
  { id: "cubic-meter-per-second", name: "Cubic Meter per Second", symbol: "m\u00B3/s", aliases: ["m3/s", "cubic meters per second"], category: "flow-rate", factor: 1 },
  { id: "cubic-meter-per-hour", name: "Cubic Meter per Hour", symbol: "m\u00B3/h", aliases: ["m3/h", "cubic meters per hour"], category: "flow-rate", factor: 1 / 3600 },
  { id: "cubic-meter-per-minute", name: "Cubic Meter per Minute", symbol: "m\u00B3/min", aliases: ["m3/min"], category: "flow-rate", factor: 1 / 60 },
  { id: "liter-per-second", name: "Liter per Second", symbol: "L/s", aliases: ["l/s", "liters per second"], category: "flow-rate", factor: 0.001 },
  { id: "liter-per-minute", name: "Liter per Minute", symbol: "L/min", aliases: ["l/min", "liters per minute", "lpm"], category: "flow-rate", factor: 1 / 60000 },
  { id: "liter-per-hour", name: "Liter per Hour", symbol: "L/h", aliases: ["l/h", "liters per hour"], category: "flow-rate", factor: 1 / 3600000 },
  { id: "cubic-foot-per-second", name: "Cubic Foot per Second", symbol: "ft\u00B3/s", aliases: ["ft3/s", "cfs"], category: "flow-rate", factor: 0.028316846592 },
  { id: "cubic-foot-per-minute", name: "Cubic Foot per Minute", symbol: "ft\u00B3/min", aliases: ["ft3/min", "cfm"], category: "flow-rate", factor: 0.028316846592 / 60 },
  { id: "us-gallon-per-minute", name: "US Gallon per Minute", symbol: "gpm", aliases: ["gallons per minute", "gal/min"], category: "flow-rate", factor: 6.30902e-5 },
  { id: "us-gallon-per-hour", name: "US Gallon per Hour", symbol: "gph", aliases: ["gallons per hour", "gal/h"], category: "flow-rate", factor: 6.30902e-5 / 60 },
  { id: "barrel-per-day", name: "Barrel per Day (Oil)", symbol: "bbl/d", aliases: ["barrels per day", "bpd"], category: "flow-rate", factor: 1.84013e-6 },
];
