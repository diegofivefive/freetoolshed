import type { LinearUnit } from "../types";

export const energyUnits: LinearUnit[] = [
  { id: "joule", name: "Joule", symbol: "J", aliases: ["joules"], category: "energy", factor: 1 },
  { id: "kilojoule", name: "Kilojoule", symbol: "kJ", aliases: ["kilojoules"], category: "energy", factor: 1000 },
  { id: "megajoule", name: "Megajoule", symbol: "MJ", aliases: ["megajoules"], category: "energy", factor: 1e6 },
  { id: "gigajoule", name: "Gigajoule", symbol: "GJ", aliases: ["gigajoules"], category: "energy", factor: 1e9 },
  { id: "calorie", name: "Calorie (thermochemical)", symbol: "cal", aliases: ["calories", "small calorie"], category: "energy", factor: 4.184 },
  { id: "kilocalorie", name: "Kilocalorie", symbol: "kcal", aliases: ["kilocalories", "food calorie", "Cal"], category: "energy", factor: 4184 },
  { id: "watt-hour", name: "Watt Hour", symbol: "Wh", aliases: ["watt hours"], category: "energy", factor: 3600 },
  { id: "kilowatt-hour", name: "Kilowatt Hour", symbol: "kWh", aliases: ["kilowatt hours"], category: "energy", factor: 3.6e6 },
  { id: "megawatt-hour", name: "Megawatt Hour", symbol: "MWh", aliases: ["megawatt hours"], category: "energy", factor: 3.6e9 },
  { id: "electronvolt", name: "Electronvolt", symbol: "eV", aliases: ["electron volt", "electron volts"], category: "energy", factor: 1.602176634e-19 },
  { id: "btu", name: "British Thermal Unit", symbol: "BTU", aliases: ["btu", "btus"], category: "energy", factor: 1055.06 },
  { id: "therm", name: "Therm", symbol: "thm", aliases: ["therms"], category: "energy", factor: 1.055e8 },
  { id: "foot-pound", name: "Foot-Pound", symbol: "ft\u00B7lbf", aliases: ["foot pounds", "ft lbf", "ft-lbf"], category: "energy", factor: 1.3558179483 },
  { id: "erg", name: "Erg", symbol: "erg", aliases: ["ergs"], category: "energy", factor: 1e-7 },
];
