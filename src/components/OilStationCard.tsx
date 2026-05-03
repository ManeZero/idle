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
    <div className={`station-card${station.enabled ? "" : " station-card--off"}`}>
      <div className="station-bar-wrap">
        <div className="station-bar-fill" style={{ width: `${fillPercent}%` }} />
      </div>
      <span className="station-info">
        {formatNumber(rate)} барр./сек &nbsp;·&nbsp; {formatNumber(station.oilRemaining, 0)}/
        {formatNumber(station.capacity, 0)}
      </span>
      <div className="card-actions">
        <button
          className={`toggle-button${station.enabled ? " toggle-button--on" : ""}`}
          onClick={() => toggleOilStation(station.id)}
          type="button"
        >
          {station.enabled ? "ВКЛ" : "ВЫКЛ"}
        </button>
        <button className="sell-button" onClick={() => sellOilStation(station.id)} type="button">
          {formatNumber(sellValue, 0)}
        </button>
      </div>
    </div>
  );
}
