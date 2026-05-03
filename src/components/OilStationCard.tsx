import { calcOilProductionRate, calcStationSellValue } from "@/game/mechanics/oil";
import { getResearchModifiers } from "@/game/mechanics/research";
import { useGameStore } from "@/stores/gameStore";
import type { OilStation } from "@/types/game";
import { formatNumber } from "@/utils/formatNumber";

interface Props {
  station: OilStation;
}

export function OilStationCard({ station }: Props) {
  const sellOilStation = useGameStore((state) => state.sellOilStation);
  const toggleOilStation = useGameStore((state) => state.toggleOilStation);
  const completedResearch = useGameStore((state) => state.completedResearch);

  const mods = getResearchModifiers(completedResearch);
  const rate = calcOilProductionRate(station, mods);
  const fillPercent = (station.oilRemaining / station.capacity) * 100;
  const sellValue = calcStationSellValue(station);

  return (
    <div className={`generator-card${station.enabled ? "" : " generator-card--disabled"}`}>
      <div className="generator-info">
        <span className="generator-name">Нефтяная станция #{station.id}</span>
        <span className="generator-production">{formatNumber(rate)} барр./сек</span>
        <div className="station-bar">
          <div className="station-bar-fill" style={{ width: `${fillPercent}%` }} />
        </div>
        <span className="generator-count">
          {formatNumber(station.oilRemaining, 0)} / {formatNumber(station.capacity, 0)} барр.
        </span>
        <span className="generator-count">{station.energyConsumption} МВт</span>
      </div>
      <div className="card-actions">
        <button
          className={`toggle-button${station.enabled ? " toggle-button--on" : ""}`}
          onClick={() => toggleOilStation(station.id)}
          type="button"
        >
          {station.enabled ? "ВКЛ" : "ВЫКЛ"}
        </button>
        <button className="sell-button" onClick={() => sellOilStation(station.id)} type="button">
          Продать {formatNumber(sellValue, 0)}
        </button>
      </div>
    </div>
  );
}
