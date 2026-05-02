import { AUTO_BUY_UPGRADE_UNLOCK_GENERATORS } from "@/constants/game";
import { calcAutoBuyUpgradeCost } from "@/game/mechanics/generator";
import { useGameStore } from "@/stores/gameStore";
import { formatNumber } from "@/utils/formatNumber";

export function AutoBuyUpgradeButton() {
  const points = useGameStore((state) => state.points);
  const generatorCount = useGameStore((state) => state.generatorCount);
  const autoBuyUpgradeCount = useGameStore((state) => state.autoBuyUpgradeCount);
  const buyAutoBuyUpgrade = useGameStore((state) => state.buyAutoBuyUpgrade);

  if (generatorCount < AUTO_BUY_UPGRADE_UNLOCK_GENERATORS) return null;

  const cost = calcAutoBuyUpgradeCost(autoBuyUpgradeCount);
  const nextAmount = 2 + autoBuyUpgradeCount;
  const canAfford = points >= cost;

  return (
    <div className="generator-card">
      <div className="generator-info">
        <span className="generator-name">Усиление автопокупки</span>
        <span className="generator-production">Будет покупать {nextAmount} за раз</span>
      </div>
      <button
        className="buy-button"
        disabled={!canAfford}
        onClick={buyAutoBuyUpgrade}
        type="button"
      >
        Купить — {formatNumber(cost, 0)} очков
      </button>
    </div>
  );
}
