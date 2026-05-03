import {
  MAX_CONTRACT_SLOTS,
  MAX_STATION_SLOTS,
  STATION_MAX_PRODUCTION_RATE,
} from "@/constants/game";

/**
 * R5 «Вторичная добыча»: минимальная скорость = доля от текущей макс. скорости
 * новой станции (с учётом множителя R1).
 */
const SECONDARY_RECOVERY_FRACTION = 0.5;

export interface ResearchDef {
  id: number;
  name: string;
  description: string;
  cost: number;
  requires: number[];
}

export interface ResearchModifiers {
  productionRateMultiplier: number;
  stationCapacityMultiplier: number;
  contractDurationMultiplier: number;
  contractCostMultiplier: number;
  minProductionFloor: number;
  maxStationSlots: number;
  maxContractSlots: number;
  autorenewEnabled: boolean;
  autosellEnabled: boolean;
}

export const RESEARCH_DEFS: ResearchDef[] = [
  {
    id: 1,
    name: "Опытный бурильщик",
    cost: 90,
    requires: [],
    description: "+25% скорость добычи",
  },
  {
    id: 2,
    name: "Дешёвые контракты",
    cost: 140,
    requires: [],
    description: "−20% стоимость контракта",
  },
  {
    id: 3,
    name: "Расширенный резервуар",
    cost: 280,
    requires: [1],
    description: "+50% ёмкость станции",
  },
  {
    id: 4,
    name: "Долгосрочные контракты",
    cost: 450,
    requires: [2],
    description: "+60% длительность контракта",
  },
  {
    id: 5,
    name: "Вторичная добыча",
    cost: 750,
    requires: [3],
    description: "Мин. добыча 50% от макс.",
  },
  {
    id: 6,
    name: "6-й слот станции",
    cost: 1_150,
    requires: [3],
    description: "+1 слот под станцию",
  },
  {
    id: 7,
    name: "Автопродление контракта",
    cost: 1_600,
    requires: [4],
    description: "Контракт продлевается автоматически",
  },
  {
    id: 8,
    name: "Нефтепровод",
    cost: 2_200,
    requires: [5, 6],
    description: "Авто-продажа 10% нефти / 25 сек",
  },
];

const BASE_MODIFIERS: ResearchModifiers = {
  productionRateMultiplier: 1,
  stationCapacityMultiplier: 1,
  contractDurationMultiplier: 1,
  contractCostMultiplier: 1,
  minProductionFloor: 0,
  maxStationSlots: MAX_STATION_SLOTS,
  maxContractSlots: MAX_CONTRACT_SLOTS,
  autorenewEnabled: false,
  autosellEnabled: false,
};

const EFFECTS: Partial<Record<number, (m: ResearchModifiers) => void>> = {
  1: (m) => {
    m.productionRateMultiplier = 1.25;
  },
  2: (m) => {
    m.contractCostMultiplier = 0.8;
  },
  3: (m) => {
    m.stationCapacityMultiplier = 1.5;
  },
  4: (m) => {
    m.contractDurationMultiplier = 1.6;
  },
  5: (m) => {
    // Конкретное значение floor вычисляется после применения всех эффектов
    // (см. getResearchModifiers ниже), потому что зависит от R1.
    m.minProductionFloor = STATION_MAX_PRODUCTION_RATE * SECONDARY_RECOVERY_FRACTION;
  },
  6: (m) => {
    m.maxStationSlots = MAX_STATION_SLOTS + 1;
  },
  7: (m) => {
    m.autorenewEnabled = true;
  },
  8: (m) => {
    m.autosellEnabled = true;
  },
};

export function getResearchModifiers(completed: number[]): ResearchModifiers {
  const mods = { ...BASE_MODIFIERS };
  for (const id of completed) {
    EFFECTS[id]?.(mods);
  }
  // R5 floor зависит от уже применённого R1 (productionRateMultiplier).
  // Пересчитываем в самом конце.
  if (completed.includes(5)) {
    mods.minProductionFloor =
      STATION_MAX_PRODUCTION_RATE * mods.productionRateMultiplier * SECONDARY_RECOVERY_FRACTION;
  }
  return mods;
}
