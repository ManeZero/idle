import { calcOilProductionRate, calcStationSellValue } from "@/game/mechanics/oil";
import { getResearchModifiers } from "@/game/mechanics/research";
import { useGameStore } from "@/stores/gameStore";
import type { OilStation } from "@/types/game";
import { pitCode, wellCode } from "@/utils/stationFormat";

interface Props {
  station: OilStation;
  onClose: () => void;
}

export function StationInspector({ station, onClose }: Props) {
  const completedResearch = useGameStore((s) => s.completedResearch);
  const toggleOilStation = useGameStore((s) => s.toggleOilStation);
  const sellOilStation = useGameStore((s) => s.sellOilStation);

  const mods = getResearchModifiers(completedResearch);
  const rate = calcOilProductionRate(station, mods);
  const fillPct = (station.oilRemaining / station.capacity) * 100;
  const sellValue = calcStationSellValue(station);
  const lowFill = fillPct < 15;

  return (
    <div className="bp-inspector">
      <div className="bp-inspector__head">
        <div>
          <div className="bp-inspector__sub">ИНСПЕКТОР · {pitCode(station.id)}</div>
          <div className="bp-inspector__title">{wellCode(station.id)}</div>
        </div>
        <button
          type="button"
          className="bp-inspector__close"
          onClick={onClose}
          aria-label="Закрыть"
        >
          ×
        </button>
      </div>
      <div className="bp-inspector__grid">
        <Cell
          label="СТАТУС"
          value={station.enabled ? "● РАБОТАЕТ" : "○ ВЫКЛЮЧЕНА"}
          color={station.enabled ? "var(--bp-green)" : "var(--bp-rust)"}
        />
        <Cell label="ДОБЫЧА" value={`${rate.toFixed(1)} барр/с`} />
        <Cell
          label="ПЛАСТ"
          value={`${Math.round(fillPct)}%${lowFill ? " (иссякает)" : ""}`}
          color={lowFill ? "var(--bp-amber)" : undefined}
        />
        <Cell label="ПОТРЕБЛ." value={`${station.energyConsumption} МВт`} />
      </div>
      <div className="bp-inspector__actions">
        <button
          type="button"
          className="bp-btn bp-btn--primary"
          onClick={() => toggleOilStation(station.id)}
        >
          {station.enabled ? "⏸ ВЫКЛЮЧИТЬ" : "▶ ВКЛЮЧИТЬ"}
        </button>
        <button
          type="button"
          className={`bp-btn bp-btn--danger${lowFill ? " bp-btn--danger-active" : ""}`}
          onClick={() => sellOilStation(station.id)}
          title={
            lowFill
              ? "Месторождение почти иссякло — выгодно продать"
              : "Продажа доступна всегда; ярко подсвечивается при <15%"
          }
        >
          ПРОДАТЬ +${sellValue}
        </button>
      </div>
    </div>
  );
}

function Cell({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string | undefined;
}) {
  return (
    <div className="bp-inspector__cell">
      <div className="bp-inspector__l">{label}</div>
      <div className="bp-inspector__v" style={color ? { color } : undefined}>
        {value}
      </div>
    </div>
  );
}
