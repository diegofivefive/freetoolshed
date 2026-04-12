import type { LinearUnit } from "../types";

export const dataUnits: LinearUnit[] = [
  { id: "byte", name: "Byte", symbol: "B", aliases: ["bytes"], category: "data", factor: 1 },
  { id: "bit", name: "Bit", symbol: "b", aliases: ["bits"], category: "data", factor: 0.125 },
  { id: "kilobyte", name: "Kilobyte", symbol: "KB", aliases: ["kilobytes"], category: "data", factor: 1000 },
  { id: "megabyte", name: "Megabyte", symbol: "MB", aliases: ["megabytes"], category: "data", factor: 1e6 },
  { id: "gigabyte", name: "Gigabyte", symbol: "GB", aliases: ["gigabytes"], category: "data", factor: 1e9 },
  { id: "terabyte", name: "Terabyte", symbol: "TB", aliases: ["terabytes"], category: "data", factor: 1e12 },
  { id: "petabyte", name: "Petabyte", symbol: "PB", aliases: ["petabytes"], category: "data", factor: 1e15 },
  { id: "kibibyte", name: "Kibibyte", symbol: "KiB", aliases: ["kibibytes"], category: "data", factor: 1024 },
  { id: "mebibyte", name: "Mebibyte", symbol: "MiB", aliases: ["mebibytes"], category: "data", factor: 1048576 },
  { id: "gibibyte", name: "Gibibyte", symbol: "GiB", aliases: ["gibibytes"], category: "data", factor: 1073741824 },
  { id: "tebibyte", name: "Tebibyte", symbol: "TiB", aliases: ["tebibytes"], category: "data", factor: 1099511627776 },
  { id: "kilobit", name: "Kilobit", symbol: "kb", aliases: ["kilobits", "kbit"], category: "data", factor: 125 },
  { id: "megabit", name: "Megabit", symbol: "Mb", aliases: ["megabits", "mbit"], category: "data", factor: 125000 },
  { id: "gigabit", name: "Gigabit", symbol: "Gb", aliases: ["gigabits", "gbit"], category: "data", factor: 1.25e8 },
];
