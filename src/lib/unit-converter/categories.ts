import type { CategoryDefinition } from "./types";
import { lengthUnits } from "./units/length";
import { massUnits } from "./units/mass";
import { temperatureUnits } from "./units/temperature";
import { volumeUnits } from "./units/volume";
import { areaUnits } from "./units/area";
import { speedUnits } from "./units/speed";
import { timeUnits } from "./units/time";
import { pressureUnits } from "./units/pressure";
import { energyUnits } from "./units/energy";
import { powerUnits } from "./units/power";
import { dataUnits } from "./units/data";
import { angleUnits } from "./units/angle";
import { forceUnits } from "./units/force";
import { torqueUnits } from "./units/torque";
import { frequencyUnits } from "./units/frequency";
import { fuelEconomyUnits } from "./units/fuel-economy";
import { viscosityUnits } from "./units/viscosity";
import { thermalConductivityUnits } from "./units/thermal-conductivity";
import { flowRateUnits } from "./units/flow-rate";
import { illuminanceUnits } from "./units/illuminance";
import { electricCurrentUnits } from "./units/electric-current";
import { voltageUnits } from "./units/voltage";
import { cookingUnits } from "./units/cooking";

export const CATEGORIES: CategoryDefinition[] = [
  { id: "length", label: "Length", icon: "Ruler", baseUnit: "meter", units: lengthUnits },
  { id: "mass", label: "Mass", icon: "Weight", baseUnit: "kilogram", units: massUnits },
  { id: "temperature", label: "Temperature", icon: "Thermometer", baseUnit: "celsius", units: temperatureUnits },
  { id: "volume", label: "Volume", icon: "Beaker", baseUnit: "liter", units: volumeUnits },
  { id: "area", label: "Area", icon: "Square", baseUnit: "square-meter", units: areaUnits },
  { id: "speed", label: "Speed", icon: "Gauge", baseUnit: "meter-per-second", units: speedUnits },
  { id: "time", label: "Time", icon: "Clock", baseUnit: "second", units: timeUnits },
  { id: "pressure", label: "Pressure", icon: "ArrowDownToLine", baseUnit: "pascal", units: pressureUnits },
  { id: "energy", label: "Energy", icon: "Zap", baseUnit: "joule", units: energyUnits },
  { id: "power", label: "Power", icon: "Activity", baseUnit: "watt", units: powerUnits },
  { id: "data", label: "Data", icon: "HardDrive", baseUnit: "byte", units: dataUnits },
  { id: "angle", label: "Angle", icon: "TriangleRight", baseUnit: "radian", units: angleUnits },
  { id: "force", label: "Force", icon: "MoveRight", baseUnit: "newton", units: forceUnits },
  { id: "torque", label: "Torque", icon: "RotateCw", baseUnit: "newton-meter", units: torqueUnits },
  { id: "frequency", label: "Frequency", icon: "Radio", baseUnit: "hertz", units: frequencyUnits },
  { id: "fuel-economy", label: "Fuel Economy", icon: "Fuel", baseUnit: "km-per-liter", units: fuelEconomyUnits },
  { id: "viscosity", label: "Viscosity", icon: "Droplets", baseUnit: "pascal-second", units: viscosityUnits },
  { id: "thermal-conductivity", label: "Thermal Conductivity", icon: "Flame", baseUnit: "watt-per-meter-kelvin", units: thermalConductivityUnits },
  { id: "flow-rate", label: "Flow Rate", icon: "Waves", baseUnit: "cubic-meter-per-second", units: flowRateUnits },
  { id: "illuminance", label: "Illuminance", icon: "Sun", baseUnit: "lux", units: illuminanceUnits },
  { id: "electric-current", label: "Electric Current", icon: "Cable", baseUnit: "ampere", units: electricCurrentUnits },
  { id: "voltage", label: "Voltage", icon: "CircuitBoard", baseUnit: "volt", units: voltageUnits },
  { id: "cooking", label: "Cooking", icon: "CookingPot", baseUnit: "milliliter", units: cookingUnits },
];

export function getCategoryById(id: string): CategoryDefinition | undefined {
  return CATEGORIES.find((c) => c.id === id);
}
