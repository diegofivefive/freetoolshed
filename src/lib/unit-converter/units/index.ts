import type { UnitDefinition } from "../types";
import { lengthUnits } from "./length";
import { massUnits } from "./mass";
import { temperatureUnits } from "./temperature";
import { volumeUnits } from "./volume";
import { areaUnits } from "./area";
import { speedUnits } from "./speed";
import { timeUnits } from "./time";
import { pressureUnits } from "./pressure";
import { energyUnits } from "./energy";
import { powerUnits } from "./power";
import { dataUnits } from "./data";
import { angleUnits } from "./angle";
import { forceUnits } from "./force";
import { torqueUnits } from "./torque";
import { frequencyUnits } from "./frequency";
import { fuelEconomyUnits } from "./fuel-economy";
import { viscosityUnits } from "./viscosity";
import { thermalConductivityUnits } from "./thermal-conductivity";
import { flowRateUnits } from "./flow-rate";
import { illuminanceUnits } from "./illuminance";
import { electricCurrentUnits } from "./electric-current";
import { voltageUnits } from "./voltage";
import { cookingUnits } from "./cooking";

export {
  lengthUnits,
  massUnits,
  temperatureUnits,
  volumeUnits,
  areaUnits,
  speedUnits,
  timeUnits,
  pressureUnits,
  energyUnits,
  powerUnits,
  dataUnits,
  angleUnits,
  forceUnits,
  torqueUnits,
  frequencyUnits,
  fuelEconomyUnits,
  viscosityUnits,
  thermalConductivityUnits,
  flowRateUnits,
  illuminanceUnits,
  electricCurrentUnits,
  voltageUnits,
  cookingUnits,
};

const allUnits: UnitDefinition[] = [
  ...lengthUnits,
  ...massUnits,
  ...temperatureUnits,
  ...volumeUnits,
  ...areaUnits,
  ...speedUnits,
  ...timeUnits,
  ...pressureUnits,
  ...energyUnits,
  ...powerUnits,
  ...dataUnits,
  ...angleUnits,
  ...forceUnits,
  ...torqueUnits,
  ...frequencyUnits,
  ...fuelEconomyUnits,
  ...viscosityUnits,
  ...thermalConductivityUnits,
  ...flowRateUnits,
  ...illuminanceUnits,
  ...electricCurrentUnits,
  ...voltageUnits,
  ...cookingUnits,
];

/** Flat lookup map: unit ID -> UnitDefinition. O(1) access. */
export const UNIT_MAP = new Map<string, UnitDefinition>(
  allUnits.map((u) => [u.id, u])
);

/** All unit aliases flattened for search: [alias, unitId, categoryId] */
export const ALIAS_INDEX: Array<[string, string, string]> = allUnits.flatMap(
  (u) => [
    [u.name.toLowerCase(), u.id, u.category],
    [u.symbol.toLowerCase(), u.id, u.category],
    ...u.aliases.map((a): [string, string, string] => [a.toLowerCase(), u.id, u.category]),
  ]
);

export function findUnitByIdOrAlias(query: string): UnitDefinition | undefined {
  const lower = query.toLowerCase().trim();
  const direct = UNIT_MAP.get(lower);
  if (direct) return direct;

  const match = ALIAS_INDEX.find(([alias]) => alias === lower);
  if (match) return UNIT_MAP.get(match[1]);

  return undefined;
}
