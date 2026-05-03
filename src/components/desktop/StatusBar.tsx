import { OIL_TANK_CAPACITY } from "@/constants/game";
import { calcEnergyDemand, calcEnergySupply } from "@/game/mechanics/energy";
import { useGameStore } from "@/stores/gameStore";
import { formatTimer } from "@/utils/stationFormat";

export function StatusBar() {
  const currency = useGameStore((s) => s.currency);
  const oil = useGameStore((s) => s.oil);
  const experience = useGameStore((s) => s.experience);
  const stations = useGameStore((s) => s.stations);
  const contracts = useGameStore((s) => s.contracts);
  const paused = useGameStore((s) => s.paused);
  const togglePause = useGameStore((s) => s.togglePause);

  const supply = calcEnergySupply(contracts);
  const demand = calcEnergyDemand(stations);
  const energyShort = demand > supply;
  const timer = contracts[0]?.timeRemaining ?? 0;
  const hasContract = contracts.length > 0;

  return (
    <div className="bp-statusbar">
      <div className="bp-statusbar__title">
        <span className="bp-statusbar__name">СХЕМА — МЕСТОРОЖДЕНИЕ «BLACKWELL»</span>
        <span className="bp-statusbar__rev">ЧЕРТЁЖ 7204 · РЕВ. 03 · ОПЕРАТИВНЫЙ ВИД</span>
      </div>
      <div className="bp-statusbar__stats">
        <Stat label="$" value={Math.round(currency).toLocaleString("ru-RU")} />
        <Stat
          label="НЕФТЬ"
          value={`${Math.round(oil).toLocaleString("ru-RU")}`}
          sub={`/ ${OIL_TANK_CAPACITY.toLocaleString("ru-RU")}`}
        />
        <Stat label="ОПЫТ" value={Math.round(experience).toLocaleString("ru-RU")} />
        <Stat label="МВт" value={`${supply}/${demand}`} warn={energyShort} />
        <Stat label="T−" value={hasContract ? formatTimer(timer) : "—"} warn={!hasContract} />
        <button
          type="button"
          className={`bp-statusbar__pause${paused ? " bp-statusbar__pause--on" : ""}`}
          onClick={togglePause}
        >
          {paused ? "▶ ПРОДОЛЖИТЬ" : "⏸ ПАУЗА"}
        </button>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
  warn,
}: {
  label: string;
  value: string;
  sub?: string;
  warn?: boolean;
}) {
  return (
    <div className="bp-stat">
      <span className="bp-stat__l">{label}</span>
      <span className={`bp-stat__v tnum${warn ? " bp-stat__v--warn" : ""}`}>
        {value}
        {sub && <span className="bp-stat__sub">{sub}</span>}
      </span>
    </div>
  );
}
