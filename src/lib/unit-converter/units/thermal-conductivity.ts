import type { LinearUnit } from "../types";

export const thermalConductivityUnits: LinearUnit[] = [
  { id: "watt-per-meter-kelvin", name: "Watt per Meter Kelvin", symbol: "W/(m\u00B7K)", aliases: ["w/mk", "w/m-k", "w/(m*k)"], category: "thermal-conductivity", factor: 1 },
  { id: "watt-per-centimeter-kelvin", name: "Watt per Centimeter Kelvin", symbol: "W/(cm\u00B7K)", aliases: ["w/cmk"], category: "thermal-conductivity", factor: 100 },
  { id: "kilowatt-per-meter-kelvin", name: "Kilowatt per Meter Kelvin", symbol: "kW/(m\u00B7K)", aliases: ["kw/mk"], category: "thermal-conductivity", factor: 1000 },
  { id: "btu-per-hour-foot-fahrenheit", name: "BTU per Hour Foot \u00B0F", symbol: "BTU/(h\u00B7ft\u00B7\u00B0F)", aliases: ["btu/h-ft-f", "btu per hour foot fahrenheit"], category: "thermal-conductivity", factor: 1.730735 },
  { id: "btu-inch-per-hour-sqft-fahrenheit", name: "BTU\u00B7in per Hour ft\u00B2 \u00B0F", symbol: "BTU\u00B7in/(h\u00B7ft\u00B2\u00B7\u00B0F)", aliases: ["btu-in/h-ft2-f"], category: "thermal-conductivity", factor: 0.144228 },
  { id: "calorie-per-second-cm-kelvin", name: "Calorie per Second cm \u00B0C", symbol: "cal/(s\u00B7cm\u00B7\u00B0C)", aliases: ["cal/s-cm-c"], category: "thermal-conductivity", factor: 418.4 },
];
