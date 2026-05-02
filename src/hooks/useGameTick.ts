import { useEffect } from "react";
import { TICK_INTERVAL_MS } from "@/constants/game";
import { useGameStore } from "@/stores/gameStore";

export function useGameTick(): void {
  const tick = useGameStore((state) => state.tick);

  useEffect(() => {
    const id = setInterval(() => {
      tick(TICK_INTERVAL_MS / 1000);
    }, TICK_INTERVAL_MS);
    return () => clearInterval(id);
  }, [tick]);
}
