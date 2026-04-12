import type { LinearUnit } from "../types";

export const timeUnits: LinearUnit[] = [
  { id: "second", name: "Second", symbol: "s", aliases: ["seconds", "sec"], category: "time", factor: 1 },
  { id: "millisecond", name: "Millisecond", symbol: "ms", aliases: ["milliseconds"], category: "time", factor: 0.001 },
  { id: "microsecond", name: "Microsecond", symbol: "\u00B5s", aliases: ["microseconds"], category: "time", factor: 1e-6 },
  { id: "nanosecond", name: "Nanosecond", symbol: "ns", aliases: ["nanoseconds"], category: "time", factor: 1e-9 },
  { id: "minute", name: "Minute", symbol: "min", aliases: ["minutes"], category: "time", factor: 60 },
  { id: "hour", name: "Hour", symbol: "h", aliases: ["hours", "hr", "hrs"], category: "time", factor: 3600 },
  { id: "day", name: "Day", symbol: "d", aliases: ["days"], category: "time", factor: 86400 },
  { id: "week", name: "Week", symbol: "wk", aliases: ["weeks"], category: "time", factor: 604800 },
  { id: "month", name: "Month (30 days)", symbol: "mo", aliases: ["months"], category: "time", factor: 2592000 },
  { id: "year", name: "Year (365 days)", symbol: "yr", aliases: ["years"], category: "time", factor: 31536000 },
  { id: "decade", name: "Decade", symbol: "dec", aliases: ["decades"], category: "time", factor: 315360000 },
  { id: "century", name: "Century", symbol: "cent", aliases: ["centuries"], category: "time", factor: 3153600000 },
  { id: "fortnight", name: "Fortnight", symbol: "fn", aliases: ["fortnights"], category: "time", factor: 1209600 },
];
