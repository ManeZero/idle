import { STATION_PRICE } from "@/constants/game";
import { calcStationSellValue } from "@/game/mechanics/oil";
import { getResearchModifiers } from "@/game/mechanics/research";
import { useGameStore } from "@/stores/gameStore";
import type { OilStation } from "@/types/game";

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
  const sellOilStation = useGameStore((s) => s.sellOilStation);
  const mods = getResearchModifiers(completedResearch);
  const enabled = stations.filter((s) => s.enabled).length;
  const totalSlots = mods.maxStationSlots;
  const canBuy = currency >= STATION_PRICE && stations.length < totalSlots;

  const selectedStation = stations.find((s) => s.id === selectedId) ?? null;

  const handleSell = () => {
    if (!selectedStation) return;
    sellOilStation(selectedStation.id);
    // Авто-выбираем следующую станцию (или сбрасываем) — удобно при
    // последовательной продаже нескольких подряд.
    const remaining = stations.filter((s) => s.id !== selectedStation.id);
    onSelect(remaining[0]?.id ?? null);
  };

  return (
    <div className="bp-panel">
      <div className="bp-panel__head">
        <span className="bp-panel__title">СТАНЦИИ</span>
        <span className="bp-panel__sub">
          {enabled}/{stations.length} активно · слотов {stations.length}/{totalSlots}
        </span>
      </div>
      <div className="bp-stations-grid">
        {SLOTS.map((slot) => (
          <SlotCell
            key={slot.id}
            slot={slot}
            station={stations[slot.idx] ?? null}
            isLockedSlot={slot.idx >= totalSlots}
            selectedId={selectedId}
            onSelect={onSelect}
          />
        ))}
      </div>
      <div className="bp-stations__actions">
        <SellButton station={selectedStation} onSell={handleSell} />
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

interface SlotCellProps {
  slot: { idx: number; id: string; label: string };
  station: OilStation | null;
  isLockedSlot: boolean;
  selectedId: number | null;
  onSelect: (id: number | null) => void;
}

function SlotCell({ slot, station, isLockedSlot, selectedId, onSelect }: SlotCellProps) {
  if (!station) {
    return (
      <div
        className={`bp-station-cell bp-station-cell--empty${isLockedSlot ? " bp-station-cell--locked" : ""}`}
      >
        {isLockedSlot ? "R6" : "—"}
      </div>
    );
  }
  const isSel = selectedId === station.id;
  const empty = station.oilRemaining / station.capacity < 0.05;
  const cls =
    `bp-station-cell${station.enabled ? " bp-station-cell--on" : ""}` +
    `${isSel ? " bp-station-cell--sel" : ""}` +
    `${empty ? " bp-station-cell--empty-warn empty-pulse" : ""}`;
  return (
    <button
      type="button"
      className={cls}
      onClick={() => onSelect(isSel ? null : station.id)}
      title={empty ? "Иссякла — выгодно продать" : undefined}
    >
      {slot.label}
    </button>
  );
}

function SellButton({ station, onSell }: { station: OilStation | null; onSell: () => void }) {
  const sellValue = station ? calcStationSellValue(station) : 0;
  return (
    <button
      type="button"
      className="bp-btn bp-btn--danger bp-btn--danger-active"
      disabled={!station}
      onClick={onSell}
      title={
        station
          ? `Продать ${station.id.toString().padStart(2, "0")} → +$${sellValue}`
          : "Сначала выберите станцию"
      }
    >
      {station ? `ПРОДАТЬ +$${sellValue}` : "ПРОДАТЬ —"}
    </button>
  );
}
