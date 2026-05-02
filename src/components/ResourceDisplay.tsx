import { calcEnergyDemand, calcEnergySupply } from "@/game/mechanics/energy";
import { useGameStore } from "@/stores/gameStore";
import { formatNumber } from "@/utils/formatNumber";

export function ResourceDisplay() {
  const currency = useGameStore((state) => state.currency);
  const oil = useGameStore((state) => state.oil);
  const stations = useGameStore((state) => state.stations);
  const contracts = useGameStore((state) => state.contracts);
  const sellOil = useGameStore((state) => state.sellOil);

  const supply = calcEnergySupply(contracts);
  const demand = calcEnergyDemand(stations);
  const energyShortage = demand > supply;

  return (
    <div className="resource-display">
      <div className="resource-row">
        <span className="resource-label">Валюта</span>
        <span className="resource-value">{formatNumber(currency, 0)}</span>
      </div>
      <div className="resource-row">
        <span className="resource-label">Нефть</span>
        <span className="resource-value">{formatNumber(oil)}</span>
        <div className="sell-buttons">
          <button className="sell-button" onClick={() => sellOil(0.1)} type="button">
            Продать 10%
          </button>
          <button className="sell-button" onClick={() => sellOil(0.5)} type="button">
            Продать 50%
          </button>
          <button className="sell-button" onClick={() => sellOil(1)} type="button">
            Продать 100%
          </button>
        </div>
      </div>
      <div className={`resource-row${energyShortage ? " resource-row--danger" : ""}`}>
        <span className="resource-label">Энергия</span>
        <span className="resource-value">
          {demand} / {supply} МВт
        </span>
      </div>
    </div>
  );
}
