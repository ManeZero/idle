import { STATION_PRICE } from "@/constants/game";
import { calcOilProductionRate } from "@/game/mechanics/oil";
import { getResearchModifiers } from "@/game/mechanics/research";
import { useGameStore } from "@/stores/gameStore";
import { pitCode, wellCode } from "@/utils/stationFormat";

interface Props {
  selectedId: number | null;
  onSelect: (id: number) => void;
}

export function StationsList({ selectedId, onSelect }: Props) {
  const currency = useGameStore((s) => s.currency);
  const stations = useGameStore((s) => s.stations);
  const completedResearch = useGameStore((s) => s.completedResearch);
  const buyOilStation = useGameStore((s) => s.buyOilStation);
  const mods = getResearchModifiers(completedResearch);
  const enabledCount = stations.filter((s) => s.enabled).length;
  const canBuy = currency >= STATION_PRICE && stations.length < mods.maxStationSlots;

  return (
    <div className="bp-mlist">
      <div className="bp-mlist__head">
        <span>СТАНЦИИ</span>
        <span>
          {enabledCount}/{stations.length} активно · слотов {stations.length}/{mods.maxStationSlots}
        </span>
      </div>
      {stations.map((s) => {
        const rate = calcOilProductionRate(s, mods);
        const fillPct = (s.oilRemaining / s.capacity) * 100;
        const lowFill = fillPct < 15;
        return (
          <button
            key={s.id}
            type="button"
            className={`bp-mlist__item${selectedId === s.id ? " bp-mlist__item--sel" : ""}`}
            onClick={() => onSelect(s.id)}
          >
            <span className={`bp-mlist__dot${s.enabled ? " bp-mlist__dot--on" : ""}`} />
            <div className="bp-mlist__name">
              <div className="bp-mlist__well">{wellCode(s.id)}</div>
              <div className="bp-mlist__pit">
                {pitCode(s.id)} · {s.energyConsumption} МВт
              </div>
            </div>
            <div className="bp-mlist__rate">
              <div className="tnum bp-mlist__rate-v">{rate.toFixed(1)}</div>
              <div className="bp-mlist__rate-l">барр/с</div>
            </div>
            <div className="bp-mlist__fill">
              <div className="bp-mlist__fill-l">запас</div>
              <div className="bp-mlist__fill-bar">
                <div
                  className="bp-mlist__fill-inner"
                  style={{
                    width: `${Math.max(0, Math.min(100, fillPct))}%`,
                    background: lowFill ? "var(--bp-amber)" : "var(--bp-line)",
                  }}
                />
              </div>
              <div className="tnum bp-mlist__fill-pct">{Math.round(fillPct)}%</div>
            </div>
          </button>
        );
      })}
      {stations.length < mods.maxStationSlots && (
        <button
          type="button"
          className="bp-mlist__buy"
          disabled={!canBuy}
          onClick={() => buyOilStation()}
        >
          <span className="bp-mlist__buy-mark" />
          <div className="bp-mlist__buy-text">
            <div className="bp-mlist__buy-title">＋ КУПИТЬ СТАНЦИЮ</div>
            <div className="bp-mlist__buy-sub">
              слот {stations.length + 1}/{mods.maxStationSlots}
            </div>
          </div>
          <div className="bp-mlist__buy-price">${STATION_PRICE}</div>
        </button>
      )}
    </div>
  );
}
