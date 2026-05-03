import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import {
  AUTOSELL_INTERVAL_SECONDS,
  AUTOSELL_PERCENT,
  CONTRACT_DURATION,
  CONTRACT_ENERGY,
  EXPERIENCE_PER_BARREL,
  OIL_SELL_PRICE,
  OIL_TANK_CAPACITY,
  STARTING_CURRENCY,
  STATION_CAPACITY,
  STATION_ENERGY_CONSUMPTION,
  STATION_PRICE,
  STORAGE_KEY,
} from "@/constants/game";
import { calcContractCost } from "@/game/mechanics/contracts";
import { hasEnoughEnergy } from "@/game/mechanics/energy";
import { calcOilProductionRate, calcStationSellValue } from "@/game/mechanics/oil";
import { getResearchModifiers, RESEARCH_DEFS } from "@/game/mechanics/research";
import type { EnergyContract, GameActions, GameState, OilStation } from "@/types/game";

function readFromStorage(): Partial<GameState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return {};
    const { state } = JSON.parse(raw) as { state: Partial<GameState> };
    return state ?? {};
  } catch {
    return {};
  }
}

function extractOil(
  stations: OilStation[],
  energyOk: boolean,
  deltaSeconds: number,
  mods: { productionRateMultiplier: number; minProductionFloor: number },
): { stations: OilStation[]; extracted: number } {
  if (!energyOk) return { stations, extracted: 0 };
  let extracted = 0;
  const updated = stations.map((s) => {
    if (!s.enabled) return s;
    const rate = calcOilProductionRate(s, mods);
    const amount = Math.min(rate * deltaSeconds, s.oilRemaining);
    extracted += amount;
    return { ...s, oilRemaining: s.oilRemaining - amount };
  });
  return { stations: updated, extracted };
}

function advanceContracts(contracts: EnergyContract[], deltaSeconds: number): EnergyContract[] {
  return contracts
    .map((c) => ({ ...c, timeRemaining: c.timeRemaining - deltaSeconds }))
    .filter((c) => c.timeRemaining > 0);
}

function tickAutosell(
  state: { oil: number; currency: number; experience: number; autosellTimer: number },
  deltaSeconds: number,
): void {
  state.autosellTimer += deltaSeconds;
  if (state.autosellTimer < AUTOSELL_INTERVAL_SECONDS) return;
  state.autosellTimer -= AUTOSELL_INTERVAL_SECONDS;
  const amount = state.oil * AUTOSELL_PERCENT;
  state.oil -= amount;
  state.currency += Math.floor(amount * OIL_SELL_PRICE);
  state.experience += amount * EXPERIENCE_PER_BARREL;
}

function tickAutorenew(
  state: {
    stations: OilStation[];
    contracts: EnergyContract[];
    currency: number;
    nextId: number;
  },
  mods: { contractCostMultiplier: number; contractDurationMultiplier: number },
): void {
  if (state.contracts.length > 0) return;
  const enabledCount = state.stations.filter((s) => s.enabled).length;
  if (enabledCount === 0) return;
  const cost = Math.floor(calcContractCost(enabledCount) * mods.contractCostMultiplier);
  if (state.currency < cost) return;
  const duration = Math.round(CONTRACT_DURATION * mods.contractDurationMultiplier);
  state.currency -= cost;
  state.contracts.push({
    id: state.nextId,
    energyProvided: enabledCount * CONTRACT_ENERGY,
    timeRemaining: duration,
  });
  state.nextId += 1;
}

function tickContracts(
  state: {
    stations: OilStation[];
    contracts: EnergyContract[];
    currency: number;
    nextId: number;
  },
  mods: {
    contractCostMultiplier: number;
    contractDurationMultiplier: number;
    autorenewEnabled: boolean;
  },
  deltaSeconds: number,
): void {
  if (state.contracts.length > 0) {
    state.contracts = advanceContracts(state.contracts, deltaSeconds);
  }
  if (mods.autorenewEnabled) tickAutorenew(state, mods);
}

export const useGameStore = create<GameState & GameActions>()(
  persist(
    immer((set, get) => ({
      currency: STARTING_CURRENCY,
      oil: 0,
      stations: [],
      contracts: [],
      nextId: 1,
      paused: false,
      experience: 0,
      completedResearch: [],
      autosellTimer: 0,

      tick(deltaSeconds) {
        if (get().paused) return;
        const saved = readFromStorage();
        set((state) => {
          state.currency = saved.currency ?? state.currency;
          state.oil = saved.oil ?? state.oil;
          state.stations = saved.stations ?? state.stations;
          state.contracts = saved.contracts ?? state.contracts;
          state.nextId = saved.nextId ?? state.nextId;
          state.experience = saved.experience ?? state.experience;
          state.completedResearch = saved.completedResearch ?? state.completedResearch;

          const mods = getResearchModifiers(state.completedResearch);

          tickContracts(state, mods, deltaSeconds);

          const energyOk = hasEnoughEnergy(state.contracts, state.stations);
          const result = extractOil(state.stations, energyOk, deltaSeconds, mods);
          state.stations = result.stations;
          // Резервуар имеет лимит. Излишки добычи теряются (станции качают,
          // но нефть некуда сливать) — стимулирует игрока продавать.
          state.oil = Math.min(OIL_TANK_CAPACITY, state.oil + result.extracted);

          if (mods.autosellEnabled) tickAutosell(state, deltaSeconds);
        });
      },

      buyOilStation() {
        const { currency, stations, nextId, completedResearch } = get();
        const mods = getResearchModifiers(completedResearch);
        if (currency < STATION_PRICE) return;
        if (stations.length >= mods.maxStationSlots) return;
        const capacity = Math.floor(STATION_CAPACITY * mods.stationCapacityMultiplier);
        set((state) => {
          state.currency -= STATION_PRICE;
          state.stations.push({
            id: nextId,
            oilRemaining: capacity,
            capacity,
            energyConsumption: STATION_ENERGY_CONSUMPTION,
            enabled: true,
            purchasePrice: STATION_PRICE,
          });
          state.nextId += 1;
        });
      },

      sellOilStation(id) {
        const station = get().stations.find((s) => s.id === id);
        if (!station) return;
        set((state) => {
          state.currency += calcStationSellValue(station);
          state.stations = state.stations.filter((s) => s.id !== id);
        });
      },

      toggleOilStation(id) {
        set((state) => {
          const station = state.stations.find((s) => s.id === id);
          if (station) station.enabled = !station.enabled;
        });
      },

      buyContract() {
        const { currency, stations, contracts, nextId, completedResearch } = get();
        const mods = getResearchModifiers(completedResearch);
        const enabledCount = stations.filter((s) => s.enabled).length;
        if (enabledCount === 0) return;
        const cost = Math.floor(calcContractCost(enabledCount) * mods.contractCostMultiplier);
        if (currency < cost) return;
        const neededEnergy = enabledCount * CONTRACT_ENERGY;
        const currentEnergy = contracts.reduce((s, c) => s + c.energyProvided, 0);
        const isUpgrade = contracts.length > 0 && currentEnergy < neededEnergy;
        if (contracts.length >= mods.maxContractSlots && !isUpgrade) return;
        const duration = Math.round(CONTRACT_DURATION * mods.contractDurationMultiplier);
        set((state) => {
          state.currency -= cost;
          if (isUpgrade) {
            state.contracts = [
              { id: nextId, energyProvided: neededEnergy, timeRemaining: duration },
            ];
          } else {
            state.contracts.push({
              id: nextId,
              energyProvided: neededEnergy,
              timeRemaining: duration,
            });
          }
          state.nextId += 1;
        });
      },

      sellOil(fraction) {
        const { oil } = get();
        const amount = oil * fraction;
        set((state) => {
          state.oil -= amount;
          state.currency += amount * OIL_SELL_PRICE;
          state.experience += amount * EXPERIENCE_PER_BARREL;
        });
      },

      buyResearch(id) {
        const { experience, completedResearch } = get();
        const def = RESEARCH_DEFS.find((r) => r.id === id);
        if (!def) return;
        if (completedResearch.includes(id)) return;
        if (!def.requires.every((req) => completedResearch.includes(req))) return;
        if (experience < def.cost) return;
        set((state) => {
          state.experience -= def.cost;
          state.completedResearch.push(id);
          if (id === 3) {
            const newCapacity = Math.floor(STATION_CAPACITY * 1.5);
            for (const s of state.stations) {
              s.capacity = newCapacity;
            }
          }
        });
      },

      togglePause() {
        set((state) => {
          state.paused = !state.paused;
        });
      },
    })),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({
        currency: state.currency,
        oil: state.oil,
        stations: state.stations,
        contracts: state.contracts,
        nextId: state.nextId,
        experience: state.experience,
        completedResearch: state.completedResearch,
      }),
    },
  ),
);
