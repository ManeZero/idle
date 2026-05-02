import { AUTO_BUY_COST } from "@/constants/game";
import { useGameStore } from "@/stores/gameStore";
import { formatNumber } from "@/utils/formatNumber";

export function AutoBuyButton() {
  const points = useGameStore((state) => state.points);
  const autoBuyUnlocked = useGameStore((state) => state.autoBuyUnlocked);
  const autoBuyEnabled = useGameStore((state) => state.autoBuyEnabled);
  const autoBuyUpgradeCount = useGameStore((state) => state.autoBuyUpgradeCount);
  const buyAutoBuy = useGameStore((state) => state.buyAutoBuy);
  const toggleAutoBuy = useGameStore((state) => state.toggleAutoBuy);

  if (!autoBuyUnlocked && points < AUTO_BUY_COST) return null;

  const amount = 1 + autoBuyUpgradeCount;

  if (!autoBuyUnlocked) {
    return (
      <div className="generator-card">
        <div className="generator-info">
          <span className="generator-name">Автопокупка</span>
          <span className="generator-production">Покупает {amount} за раз</span>
        </div>
        <button className="buy-button" onClick={buyAutoBuy} type="button">
          Купить — {formatNumber(AUTO_BUY_COST, 0)} очков
        </button>
      </div>
    );
  }

  return (
    <div className="generator-card">
      <div className="generator-info">
        <span className="generator-name">Автопокупка</span>
        <span className="generator-production">Покупает {amount} за раз</span>
      </div>
      <button
        className={`toggle-button${autoBuyEnabled ? " toggle-button--on" : ""}`}
        onClick={toggleAutoBuy}
        type="button"
      >
        {autoBuyEnabled ? "ВКЛ" : "ВЫКЛ"}
      </button>
    </div>
  );
}
