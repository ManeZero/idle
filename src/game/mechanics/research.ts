import { MAX_CONTRACT_SLOTS, MAX_STATION_SLOTS } from "@/constants/game";

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
  autosellEnabled: boolean;
}

export const RESEARCH_DEFS: ResearchDef[] = [
  {
    id: 1,
    name: "Опытный бурильщик",
    cost: 100,
    requires: [],
    description: "+25% скорость добычи",
  },
  {
    id: 2,
    name: "Дешёвые контракты",
    cost: 120,
    requires: [],
    description: "−20% стоимость контракта",
  },
  {
    id: 3,
    name: "Расширенный резервуар",
    cost: 300,
    requires: [1],
    description: "+50% ёмкость станции",
  },
  {
    id: 4,
    name: "Долгосрочные контракты",
    cost: 350,
    requires: [2],
    description: "+60% длительность контракта",
  },
  {
    id: 5,
    name: "Вторичная добыча",
    cost: 600,
    requires: [3],
    description: "Мин. добыча 1.5 барр/сек",
  },
  { id: 6, name: "6-й слот станции", cost: 800, requires: [3], description: "+1 слот под станцию" },
  { id: 7, name: "Второй контракт", cost: 900, requires: [4], description: "+1 слот контракта" },
  {
    id: 8,
    name: "Нефтепровод",
    cost: 1_500,
    requires: [5, 6],
    description: "Авто-продажа 8% нефти / 30 сек",
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
    m.minProductionFloor = 1.5;
  },
  6: (m) => {
    m.maxStationSlots = MAX_STATION_SLOTS + 1;
  },
  7: (m) => {
    m.maxContractSlots = MAX_CONTRACT_SLOTS + 1;
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
  return mods;
}
