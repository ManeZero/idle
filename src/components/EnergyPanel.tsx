import { useGameStore } from "@/stores/gameStore";

export function EnergyPanel() {
  const contracts = useGameStore((state) => state.contracts);

  if (contracts.length === 0) {
    return (
      <div className="generator-card">
        <span className="generator-count">Нет активного контракта</span>
      </div>
    );
  }

  return (
    <>
      {contracts.map((c) => (
        <div key={c.id} className="generator-card">
          <span className="generator-production">
            {c.energyProvided} МВт · {Math.ceil(c.timeRemaining)} сек
          </span>
        </div>
      ))}
    </>
  );
}
