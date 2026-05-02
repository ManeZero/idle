import { calcPointsPerSecond } from "@/game/mechanics/generator";
import { useGameStore } from "@/stores/gameStore";
import { formatNumber } from "@/utils/formatNumber";

export function PointsDisplay() {
  const points = useGameStore((state) => state.points);
  const generatorCount = useGameStore((state) => state.generatorCount);
  const pps = calcPointsPerSecond(generatorCount);

  return (
    <div className="points-display">
      <span className="points-value">{formatNumber(points)}</span>
      <span className="points-label">очков</span>
      <span className="points-pps">{formatNumber(pps)} / сек</span>
    </div>
  );
}
