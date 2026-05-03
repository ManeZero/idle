import { CONTRACT_DURATION, CONTRACT_ENERGY, STATION_PRICE } from "@/constants/game";
import { calcContractCost } from "@/game/mechanics/contracts";
import { getResearchModifiers } from "@/game/mechanics/research";
import { useGameStore } from "@/stores/gameStore";
import { formatNumber } from "@/utils/formatNumber";

export function ShopPanel() {
  const currency = useGameStore((state) => state.currency);
  const stations = useGameStore((state) => state.stations);
  const contracts = useGameStore((state) => state.contracts);
  const completedResearch = useGameStore((state) => state.completedResearch);
  const buyOilStation = useGameStore((state) => state.buyOilStation);
  const buyContract = useGameStore((state) => state.buyContract);

  const mods = getResearchModifiers(completedResearch);
  const enabledCount = stations.filter((s) => s.enabled).length;
  const contractCost = Math.floor(calcContractCost(enabledCount) * mods.contractCostMultiplier);
  const contractMW = enabledCount * CONTRACT_ENERGY;
  const contractDuration = Math.round(CONTRACT_DURATION * mods.contractDurationMultiplier);

  const neededEnergy = enabledCount * CONTRACT_ENERGY;
  const currentEnergy = contracts.reduce((s, c) => s + c.energyProvided, 0);
  const isUpgrade = contracts.length > 0 && currentEnergy < neededEnergy;
  const isCovered = contracts.length >= mods.maxContractSlots && !isUpgrade;
  const contractDisabled = enabledCount === 0 || currency < contractCost || isCovered;

  return (
    <div className="shop-panel">
      <div className="generator-card">
        <div className="generator-info">
          <span className="generator-name">Нефтяная станция</span>
          <span className="generator-production">10 барр./сек · 10 МВт</span>
          <span className="generator-count">
            Станции ({stations.length}/{mods.maxStationSlots})
          </span>
        </div>
        <button
          className="buy-button"
          disabled={currency < STATION_PRICE || stations.length >= mods.maxStationSlots}
          onClick={buyOilStation}
          type="button"
        >
          Купить — {formatNumber(STATION_PRICE, 0)}
        </button>
      </div>
      <div className="generator-card">
        <div className="generator-info">
          <span className="generator-name">Энергоконтракт</span>
          <span className="generator-production">
            {contractMW} МВт · {contractDuration} сек
          </span>
          <span className="generator-count">
            Контракты ({contracts.length}/{mods.maxContractSlots})
          </span>
        </div>
        {isCovered ? (
          <button className="buy-button" disabled type="button">
            Активен
          </button>
        ) : (
          <button
            className="buy-button"
            disabled={contractDisabled}
            onClick={buyContract}
            type="button"
          >
            {isUpgrade ? "Обновить" : "Купить"} — {formatNumber(contractCost, 0)}
          </button>
        )}
      </div>
    </div>
  );
}
