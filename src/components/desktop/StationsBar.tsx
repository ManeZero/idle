import { STATION_PRICE } from "@/constants/game";
import { getResearchModifiers } from "@/game/mechanics/research";
import { useGameStore } from "@/stores/gameStore";

const SLOTS = Array.from({ length: 6 }, (_, i) => ({
  idx: i,
  id: `slot-${i + 1}`,
  label: (i + 1).toString().padStart(2, "0"),
}));

interface Props {
  selectedId: number | null;
  onSelect: (id: number | null) => void;
}

export function StationsBar({ selectedId, onSelect }: Props) {
  const currency = useGameStore((s) => s.currency);
  const stations = useGameStore((s) => s.stations);
  const completedResearch = useGameStore((s) => s.completedResearch);
  const buyOilStation = useGameStore((s) => s.buyOilStation);
  const mods = getResearchModifiers(completedResearch);
  const enabled = stations.filter((s) => s.enabled).length;
  const totalSlots = mods.maxStationSlots;
  const canBuy = currency >= STATION_PRICE && stations.length < totalSlots;

  return (
    <div className="bp-panel">
      <div className="bp-panel__head">
        <span className="bp-panel__title">СТАНЦИИ</span>
        <span className="bp-panel__sub">
          {enabled}/{stations.length} активно · слотов {stations.length}/{totalSlots}
        </span>
      </div>
      <div className="bp-stations-grid">
        {SLOTS.map((slot) => {
          const station = stations[slot.idx];
          const isLockedSlot = slot.idx >= totalSlots;
          if (station) {
            const isSel = selectedId === station.id;
            return (
              <button
                key={station.id}
                type="button"
                className={`bp-station-cell${station.enabled ? " bp-station-cell--on" : ""}${isSel ? " bp-station-cell--sel" : ""}`}
                onClick={() => onSelect(isSel ? null : station.id)}
              >
                {slot.label}
              </button>
            );
          }
          return (
            <div
              key={slot.id}
              className={`bp-station-cell bp-station-cell--empty${isLockedSlot ? " bp-station-cell--locked" : ""}`}
            >
              {isLockedSlot ? "R6" : "—"}
            </div>
          );
        })}
      </div>
      <div className="bp-stations__actions">
        <button
          type="button"
          className="bp-btn bp-btn--primary"
          disabled={!canBuy}
          onClick={() => buyOilStation()}
        >
          ＋ КУПИТЬ ${STATION_PRICE}
        </button>
      </div>
    </div>
  );
}
