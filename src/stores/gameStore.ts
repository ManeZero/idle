import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { GENERATOR_BASE_PPS, STORAGE_KEY } from "@/constants/game";
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

      tick(deltaSeconds) {
        const saved = readFromStorage();
        set((state) => {
          const points = saved.points ?? state.points;
          const count = saved.generatorCount ?? state.generatorCount;
          state.points = points + count * GENERATOR_BASE_PPS * deltaSeconds;
          state.generatorCount = count;
        });
      },

      buyGenerator() {
        const { points, generatorCount } = get();
        const cost = calcGeneratorCost(generatorCount);
        if (points < cost) return;
        set((state) => {
          state.points -= cost;
          state.generatorCount += 1;
        });
      },
    })),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({
        points: state.points,
        generatorCount: state.generatorCount,
      }),
    },
  ),
);
