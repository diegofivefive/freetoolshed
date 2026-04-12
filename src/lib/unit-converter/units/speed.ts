import type { LinearUnit } from "../types";

export const speedUnits: LinearUnit[] = [
  { id: "meter-per-second", name: "Meter per Second", symbol: "m/s", aliases: ["meters per second", "mps"], category: "speed", factor: 1 },
  { id: "kilometer-per-hour", name: "Kilometer per Hour", symbol: "km/h", aliases: ["kilometers per hour", "kph", "kmh"], category: "speed", factor: 1 / 3.6 },
  { id: "mile-per-hour", name: "Mile per Hour", symbol: "mph", aliases: ["miles per hour"], category: "speed", factor: 0.44704 },
  { id: "knot", name: "Knot", symbol: "kn", aliases: ["knots", "kt"], category: "speed", factor: 0.514444 },
  { id: "foot-per-second", name: "Foot per Second", symbol: "ft/s", aliases: ["feet per second", "fps"], category: "speed", factor: 0.3048 },
  { id: "mach", name: "Mach", symbol: "Ma", aliases: ["mach number"], category: "speed", factor: 340.29 },
  { id: "speed-of-light", name: "Speed of Light", symbol: "c", aliases: ["light speed"], category: "speed", factor: 299792458 },
  { id: "centimeter-per-second", name: "Centimeter per Second", symbol: "cm/s", aliases: ["centimeters per second"], category: "speed", factor: 0.01 },
  { id: "inch-per-second", name: "Inch per Second", symbol: "in/s", aliases: ["inches per second", "ips"], category: "speed", factor: 0.0254 },
];
