import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { AUTO_BUY_COST, GENERATOR_BASE_PPS, STORAGE_KEY } from "@/constants/game";
import { calcGeneratorCost } from "@/game/mechanics/generator";
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

      tick(deltaSeconds) {
        const saved = readFromStorage();
        set((state) => {
          const points = saved.points ?? state.points;
          const count = saved.generatorCount ?? state.generatorCount;
          const unlocked = saved.autoBuyUnlocked ?? state.autoBuyUnlocked;
          const enabled = saved.autoBuyEnabled ?? state.autoBuyEnabled;
          state.points = points + count * GENERATOR_BASE_PPS * deltaSeconds;
          state.generatorCount = count;
          state.autoBuyUnlocked = unlocked;
          state.autoBuyEnabled = enabled;
        });
        const { points, autoBuyUnlocked, autoBuyEnabled } = get();
        const cost = calcGeneratorCost();
        if (autoBuyUnlocked && autoBuyEnabled && points >= cost) {
          set((state) => {
            state.points -= cost;
            state.generatorCount += 1;
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
    })),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({
        points: state.points,
        generatorCount: state.generatorCount,
        autoBuyUnlocked: state.autoBuyUnlocked,
        autoBuyEnabled: state.autoBuyEnabled,
      }),
    },
  ),
);
