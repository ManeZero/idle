import { calcGeneratorCost } from "@/game/mechanics/generator";
import { useGameStore } from "@/stores/gameStore";
import { formatNumber } from "@/utils/formatNumber";

export function GeneratorButton() {
  const points = useGameStore((state) => state.points);
  const generatorCount = useGameStore((state) => state.generatorCount);
  const buyGenerator = useGameStore((state) => state.buyGenerator);

  const cost = calcGeneratorCost();
  const canAfford = points >= cost;

  return (
    <div className="generator-card">
      <div className="generator-info">
        <span className="generator-name">Генератор</span>
        <span className="generator-count">куплено: {generatorCount}</span>
        <span className="generator-production">+1 очко / сек</span>
      </div>
      <button className="buy-button" disabled={!canAfford} onClick={buyGenerator} type="button">
        Купить — {formatNumber(cost, 0)} очков
      </button>
    </div>
  );
}
