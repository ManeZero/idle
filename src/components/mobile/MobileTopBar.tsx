import { CONTRACT_DURATION } from "@/constants/game";
import { calcContractCostWithMods } from "@/game/mechanics/contracts";
import { calcEnergyDemand, calcEnergySupply } from "@/game/mechanics/energy";
import { getResearchModifiers } from "@/game/mechanics/research";
import { useGameStore } from "@/stores/gameStore";
import { formatTimer } from "@/utils/stationFormat";

export function MobileTopBar() {
  const currency = useGameStore((s) => s.currency);
  const oil = useGameStore((s) => s.oil);
  const experience = useGameStore((s) => s.experience);
  const stations = useGameStore((s) => s.stations);
  const contracts = useGameStore((s) => s.contracts);
  const completedResearch = useGameStore((s) => s.completedResearch);
  const buyContract = useGameStore((s) => s.buyContract);
  const paused = useGameStore((s) => s.paused);
  const togglePause = useGameStore((s) => s.togglePause);

  const mods = getResearchModifiers(completedResearch);
  const enabled = stations.filter((s) => s.enabled).length;
  const supply = calcEnergySupply(contracts);
  const demand = calcEnergyDemand(stations);
  const energyShort = demand > supply;
  const cost = calcContractCostWithMods(enabled, mods.contractCostMultiplier);
  const duration = Math.round(CONTRACT_DURATION * mods.contractDurationMultiplier);
  const timer = contracts[0]?.timeRemaining ?? 0;
  const ratio = duration > 0 ? Math.max(0, Math.min(1, timer / duration)) : 0;
  const segments = 24;
  const filled = Math.round(segments * ratio);
  const canBuy = enabled > 0 && currency >= cost;

  return (
    <>
      <div className="bp-mobile-topbar">
        <div className="bp-mobile-topbar__left">
          <span className="bp-mobile-topbar__name">BLACKWELL</span>
          <span className="bp-mobile-topbar__money tnum">
            ${Math.round(currency).toLocaleString("ru-RU")}
          </span>
        </div>
        <div className="bp-mobile-topbar__right">
          <span>
            <span className="bp-mobile-topbar__lbl">НФТ</span>{" "}
            <span className="tnum">{Math.round(oil).toLocaleString("ru-RU")}</span>
          </span>
          <span>
            <span className="bp-mobile-topbar__lbl">XP</span>{" "}
            <span className="tnum">{Math.round(experience).toLocaleString("ru-RU")}</span>
          </span>
          <span className={energyShort ? "bp-mobile-topbar__warn" : undefined}>
            {supply}/{demand}
          </span>
          <button
            type="button"
            className="bp-mobile-topbar__pause"
            onClick={togglePause}
            aria-label="Пауза"
          >
            {paused ? "▶" : "⏸"}
          </button>
        </div>
      </div>
      <div className="bp-mobile-banner">
        <span className="bp-mobile-banner__lbl">ЭНЕРГИЯ</span>
        <span className="bp-mobile-banner__timer tnum">T−{formatTimer(timer)}</span>
        <div className="bp-mobile-banner__bar">
          {Array.from({ length: segments }).map((_, i) => (
            <div
              key={`b-${
                // biome-ignore lint/suspicious/noArrayIndexKey: индекс — единственный стабильный ключ для сегментов
                i
              }`}
              className={`bp-mobile-banner__seg${i < filled ? " bp-mobile-banner__seg--on" : ""}`}
            />
          ))}
        </div>
        <button
          type="button"
          className="bp-mobile-banner__btn"
          disabled={!canBuy}
          onClick={() => buyContract()}
        >
          +${cost}
        </button>
      </div>
    </>
  );
}
