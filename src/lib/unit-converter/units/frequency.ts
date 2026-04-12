import type { LinearUnit } from "../types";

export const frequencyUnits: LinearUnit[] = [
  { id: "hertz", name: "Hertz", symbol: "Hz", aliases: ["hertz", "cycles per second", "cps"], category: "frequency", factor: 1 },
  { id: "kilohertz", name: "Kilohertz", symbol: "kHz", aliases: ["kilohertz"], category: "frequency", factor: 1000 },
  { id: "megahertz", name: "Megahertz", symbol: "MHz", aliases: ["megahertz"], category: "frequency", factor: 1e6 },
  { id: "gigahertz", name: "Gigahertz", symbol: "GHz", aliases: ["gigahertz"], category: "frequency", factor: 1e9 },
  { id: "terahertz", name: "Terahertz", symbol: "THz", aliases: ["terahertz"], category: "frequency", factor: 1e12 },
  { id: "rpm", name: "Revolutions per Minute", symbol: "rpm", aliases: ["rev/min", "revolutions per minute"], category: "frequency", factor: 1 / 60 },
  { id: "rps", name: "Revolutions per Second", symbol: "rps", aliases: ["rev/s", "revolutions per second"], category: "frequency", factor: 1 },
  { id: "beats-per-minute", name: "Beats per Minute", symbol: "BPM", aliases: ["bpm"], category: "frequency", factor: 1 / 60 },
];
