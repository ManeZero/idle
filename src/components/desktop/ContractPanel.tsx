import { CONTRACT_DURATION, CONTRACT_ENERGY } from "@/constants/game";
import { calcContractCostWithMods } from "@/game/mechanics/contracts";
import { calcEnergyDemand, calcEnergySupply } from "@/game/mechanics/energy";
import { getResearchModifiers } from "@/game/mechanics/research";
import { useGameStore } from "@/stores/gameStore";
import { formatTimer } from "@/utils/stationFormat";

export function ContractPanel() {
  const currency = useGameStore((s) => s.currency);
  const stations = useGameStore((s) => s.stations);
  const contracts = useGameStore((s) => s.contracts);
  const completedResearch = useGameStore((s) => s.completedResearch);
  const buyContract = useGameStore((s) => s.buyContract);

  const mods = getResearchModifiers(completedResearch);
  const enabledCount = stations.filter((s) => s.enabled).length;
  const supply = calcEnergySupply(contracts);
  const demand = calcEnergyDemand(stations);
  const cost = calcContractCostWithMods(enabledCount, mods.contractCostMultiplier);
  const duration = Math.round(CONTRACT_DURATION * mods.contractDurationMultiplier);
  const timer = contracts[0]?.timeRemaining ?? 0;
  const ratio = duration > 0 ? Math.max(0, Math.min(1, timer / duration)) : 0;
  const needed = enabledCount * CONTRACT_ENERGY;
  const isUpgrade = contracts.length > 0 && supply < needed;
  const isCovered = contracts.length > 0 && supply >= needed;
  const disabled = enabledCount === 0 || currency < cost || isCovered;

  return (
    <BPanel title="ЭНЕРГОКОНТРАКТ" sub={`${supply}/${demand} МВт · $${cost} / ${duration}с`}>
      <div className="bp-contract__row">
        <span>{contracts.length > 0 ? `T−${formatTimer(timer)}` : "Нет активного"}</span>
        <span>{contracts.length > 0 ? `/ ${duration}с` : ""}</span>
      </div>
      <SegmentedBar value={ratio} segments={32} danger={ratio < 0.15} />
      <div className="bp-contract__actions">
        <button
          type="button"
          className="bp-btn bp-btn--primary"
          disabled={disabled}
          onClick={() => buyContract()}
        >
          {isUpgrade ? `ОБНОВИТЬ $${cost}` : `ПРОДЛИТЬ $${cost}`}
        </button>
      </div>
    </BPanel>
  );
}

function BPanel({
  title,
  sub,
  children,
}: {
  title: string;
  sub: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bp-panel">
      <div className="bp-panel__head">
        <span className="bp-panel__title">{title}</span>
        <span className="bp-panel__sub">{sub}</span>
      </div>
      {children}
    </div>
  );
}

function SegmentedBar({
  value,
  segments,
  danger,
}: {
  value: number;
  segments: number;
  danger: boolean;
}) {
  const filled = Math.round(segments * value);
  return (
    <div className="bp-segbar">
      {Array.from({ length: segments }).map((_, i) => (
        <div
          key={`s-${
            // biome-ignore lint/suspicious/noArrayIndexKey: фиксированная сетка сегментов прогресс-бара
            i
          }`}
          className={`bp-segbar__seg${i < filled ? (danger ? " bp-segbar__seg--danger" : " bp-segbar__seg--on") : ""}`}
        />
      ))}
    </div>
  );
}
