import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import {
  CONTRACT_DURATION,
  CONTRACT_ENERGY,
  OIL_SELL_PRICE,
  STARTING_CURRENCY,
  STATION_CAPACITY,
  STATION_ENERGY_CONSUMPTION,
  STATION_PRICE,
  STORAGE_KEY,
} from "@/constants/game";
import { calcContractCost } from "@/game/mechanics/contracts";
import { hasEnoughEnergy } from "@/game/mechanics/energy";
import { calcOilProductionRate, calcStationSellValue } from "@/game/mechanics/oil";
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
): { stations: OilStation[]; extracted: number } {
  if (!energyOk) return { stations, extracted: 0 };
  let extracted = 0;
  const updated = stations.map((s) => {
    if (!s.enabled) return s;
    const rate = calcOilProductionRate(s);
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

export const useGameStore = create<GameState & GameActions>()(
  persist(
    immer((set, get) => ({
      currency: STARTING_CURRENCY,
      oil: 0,
      stations: [],
      contracts: [],
      nextId: 1,
      paused: false,

      tick(deltaSeconds) {
        if (get().paused) return;
        const saved = readFromStorage();
        set((state) => {
          state.currency = saved.currency ?? state.currency;
          state.oil = saved.oil ?? state.oil;
          state.stations = saved.stations ?? state.stations;
          state.contracts = saved.contracts ?? state.contracts;
          state.nextId = saved.nextId ?? state.nextId;

          const energyOk = hasEnoughEnergy(state.contracts, state.stations);
          const result = extractOil(state.stations, energyOk, deltaSeconds);
          state.stations = result.stations;
          state.oil += result.extracted;
          state.contracts = advanceContracts(state.contracts, deltaSeconds);
        });
      },

      buyOilStation() {
        const { currency, nextId } = get();
        if (currency < STATION_PRICE) return;
        set((state) => {
          state.currency -= STATION_PRICE;
          state.stations.push({
            id: nextId,
            oilRemaining: STATION_CAPACITY,
            capacity: STATION_CAPACITY,
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
        const { currency, contracts, nextId } = get();
        const cost = calcContractCost(contracts.length);
        if (currency < cost) return;
        set((state) => {
          state.currency -= cost;
          state.contracts.push({
            id: nextId,
            energyProvided: CONTRACT_ENERGY,
            timeRemaining: CONTRACT_DURATION,
          });
          state.nextId += 1;
        });
      },

      sellOil(fraction) {
        const { oil } = get();
        const amount = oil * fraction;
        set((state) => {
          state.oil -= amount;
          state.currency += amount * OIL_SELL_PRICE;
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
      }),
    },
  ),
);
