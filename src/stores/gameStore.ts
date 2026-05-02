import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { AUTO_BUY_COST, GENERATOR_BASE_PPS, STORAGE_KEY } from "@/constants/game";
import { calcAutoBuyUpgradeCost, calcGeneratorCost } from "@/game/mechanics/generator";
import type { GameActions, GameState } from "@/types/game";

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

export const useGameStore = create<GameState & GameActions>()(
  persist(
    immer((set, get) => ({
      points: 100,
      generatorCount: 0,
      autoBuyUnlocked: false,
      autoBuyEnabled: false,
      autoBuyUpgradeCount: 0,
      paused: false,

      tick(deltaSeconds) {
        if (get().paused) return;
        const saved = readFromStorage();
        set((state) => {
          const points = saved.points ?? state.points;
          const count = saved.generatorCount ?? state.generatorCount;
          const unlocked = saved.autoBuyUnlocked ?? state.autoBuyUnlocked;
          const enabled = saved.autoBuyEnabled ?? state.autoBuyEnabled;
          const upgradeCount = saved.autoBuyUpgradeCount ?? state.autoBuyUpgradeCount;
          state.points = points + count * GENERATOR_BASE_PPS * deltaSeconds;
          state.generatorCount = count;
          state.autoBuyUnlocked = unlocked;
          state.autoBuyEnabled = enabled;
          state.autoBuyUpgradeCount = upgradeCount;
        });
        const { points, autoBuyUnlocked, autoBuyEnabled, autoBuyUpgradeCount } = get();
        const amount = 1 + autoBuyUpgradeCount;
        const totalCost = amount * calcGeneratorCost();
        if (autoBuyUnlocked && autoBuyEnabled && points >= totalCost) {
          set((state) => {
            state.points -= totalCost;
            state.generatorCount += amount;
          });
        }
      },

      buyGenerator() {
        const { points } = get();
        const cost = calcGeneratorCost();
        if (points < cost) return;
        set((state) => {
          state.points -= cost;
          state.generatorCount += 1;
        });
      },

      buyAutoBuy() {
        const { points, autoBuyUnlocked } = get();
        if (autoBuyUnlocked || points < AUTO_BUY_COST) return;
        set((state) => {
          state.points -= AUTO_BUY_COST;
          state.autoBuyUnlocked = true;
          state.autoBuyEnabled = true;
        });
      },

      toggleAutoBuy() {
        set((state) => {
          state.autoBuyEnabled = !state.autoBuyEnabled;
        });
      },

      buyAutoBuyUpgrade() {
        const { points, autoBuyUpgradeCount } = get();
        const cost = calcAutoBuyUpgradeCost(autoBuyUpgradeCount);
        if (points < cost) return;
        set((state) => {
          state.points -= cost;
          state.autoBuyUpgradeCount += 1;
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
        points: state.points,
        generatorCount: state.generatorCount,
        autoBuyUnlocked: state.autoBuyUnlocked,
        autoBuyEnabled: state.autoBuyEnabled,
        autoBuyUpgradeCount: state.autoBuyUpgradeCount,
      }),
    },
  ),
);
