import { STATION_PRICE } from "@/constants/game";
import { calcContractCost } from "@/game/mechanics/contracts";
import { useGameStore } from "@/stores/gameStore";
import { formatNumber } from "@/utils/formatNumber";

export function ShopPanel() {
  const currency = useGameStore((state) => state.currency);
  const contracts = useGameStore((state) => state.contracts);
  const buyOilStation = useGameStore((state) => state.buyOilStation);
  const buyContract = useGameStore((state) => state.buyContract);

  const contractCost = calcContractCost(contracts.length);

  return (
    <div className="shop-panel">
      <div className="generator-card">
        <div className="generator-info">
          <span className="generator-name">Нефтяная станция</span>
          <span className="generator-production">100 барр./сек · 10 МВт</span>
        </div>
        <button
          className="buy-button"
          disabled={currency < STATION_PRICE}
          onClick={buyOilStation}
          type="button"
        >
          Купить — {formatNumber(STATION_PRICE, 0)}
        </button>
      </div>
      <div className="generator-card">
        <div className="generator-info">
          <span className="generator-name">Энергоконтракт</span>
          <span className="generator-production">+10 МВт · 100 сек</span>
        </div>
        <button
          className="buy-button"
          disabled={currency < contractCost}
          onClick={buyContract}
          type="button"
        >
          Купить — {formatNumber(contractCost, 0)}
        </button>
      </div>
    </div>
  );
}
