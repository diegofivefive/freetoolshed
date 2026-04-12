import type { LinearUnit } from "../types";

export const voltageUnits: LinearUnit[] = [
  { id: "volt", name: "Volt", symbol: "V", aliases: ["volts"], category: "voltage", factor: 1 },
  { id: "millivolt", name: "Millivolt", symbol: "mV", aliases: ["millivolts"], category: "voltage", factor: 0.001 },
  { id: "microvolt", name: "Microvolt", symbol: "\u00B5V", aliases: ["microvolts"], category: "voltage", factor: 1e-6 },
  { id: "kilovolt", name: "Kilovolt", symbol: "kV", aliases: ["kilovolts"], category: "voltage", factor: 1000 },
  { id: "megavolt", name: "Megavolt", symbol: "MV", aliases: ["megavolts"], category: "voltage", factor: 1e6 },
  { id: "abvolt", name: "Abvolt", symbol: "abV", aliases: ["abvolts"], category: "voltage", factor: 1e-8 },
  { id: "statvolt", name: "Statvolt", symbol: "statV", aliases: ["statvolts"], category: "voltage", factor: 299.792458 },
];
