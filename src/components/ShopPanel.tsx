import { MAX_CONTRACT_SLOTS, MAX_STATION_SLOTS, STATION_PRICE } from "@/constants/game";
import { calcContractCost } from "@/game/mechanics/contracts";
import { useGameStore } from "@/stores/gameStore";
import { formatNumber } from "@/utils/formatNumber";

export function ShopPanel() {
  const currency = useGameStore((state) => state.currency);
  const stations = useGameStore((state) => state.stations);
  const contracts = useGameStore((state) => state.contracts);
  const buyOilStation = useGameStore((state) => state.buyOilStation);
  const buyContract = useGameStore((state) => state.buyContract);

  const contractCost = calcContractCost(contracts.length);

  return (
    <div className="shop-panel">
      <div className="generator-card">
        <div className="generator-info">
          <span className="generator-name">Нефтяная станция</span>
          <span className="generator-production">10 барр./сек · 10 МВт</span>
          <span className="generator-count">
            Станции ({stations.length}/{MAX_STATION_SLOTS})
          </span>
        </div>
        <button
          className="buy-button"
          disabled={currency < STATION_PRICE || stations.length >= MAX_STATION_SLOTS}
          onClick={buyOilStation}
          type="button"
        >
          Купить — {formatNumber(STATION_PRICE, 0)}
        </button>
      </div>
      <div className="generator-card">
        <div className="generator-info">
          <span className="generator-name">Энергоконтракт</span>
          <span className="generator-production">+10 МВт · +100 сек</span>
          <span className="generator-count">
            Контракты ({contracts.length}/{MAX_CONTRACT_SLOTS})
          </span>
        </div>
        <button
          className="buy-button"
          disabled={currency < contractCost || contracts.length >= MAX_CONTRACT_SLOTS}
          onClick={buyContract}
          type="button"
        >
          Купить — {formatNumber(contractCost, 0)}
        </button>
      </div>
    </div>
  );
}
