import type { LinearUnit } from "../types";

export const powerUnits: LinearUnit[] = [
  { id: "watt", name: "Watt", symbol: "W", aliases: ["watts"], category: "power", factor: 1 },
  { id: "kilowatt", name: "Kilowatt", symbol: "kW", aliases: ["kilowatts"], category: "power", factor: 1000 },
  { id: "megawatt", name: "Megawatt", symbol: "MW", aliases: ["megawatts"], category: "power", factor: 1e6 },
  { id: "gigawatt", name: "Gigawatt", symbol: "GW", aliases: ["gigawatts"], category: "power", factor: 1e9 },
  { id: "milliwatt", name: "Milliwatt", symbol: "mW", aliases: ["milliwatts"], category: "power", factor: 0.001 },
  { id: "horsepower", name: "Horsepower (mechanical)", symbol: "hp", aliases: ["horsepower", "hp", "brake horsepower"], category: "power", factor: 745.69987158 },
  { id: "metric-horsepower", name: "Horsepower (metric)", symbol: "PS", aliases: ["metric horsepower", "pferdestärke"], category: "power", factor: 735.49875 },
  { id: "btu-per-hour", name: "BTU per Hour", symbol: "BTU/h", aliases: ["btu/h", "btuh"], category: "power", factor: 0.293071 },
  { id: "foot-pound-per-second", name: "Foot-Pound per Second", symbol: "ft\u00B7lbf/s", aliases: ["ft lbf/s"], category: "power", factor: 1.3558179483 },
  { id: "calorie-per-second", name: "Calorie per Second", symbol: "cal/s", aliases: ["calories per second"], category: "power", factor: 4.184 },
  { id: "ton-of-refrigeration", name: "Ton of Refrigeration", symbol: "TR", aliases: ["tons of refrigeration"], category: "power", factor: 3516.853 },
];
