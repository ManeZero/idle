import { calcEnergySupply } from "@/game/mechanics/energy";
import { useGameStore } from "@/stores/gameStore";

function contractWord(n: number): string {
  if (n === 1) return "контракт";
  if (n <= 4) return "контракта";
  return "контрактов";
}

export function EnergyPanel() {
  const contracts = useGameStore((state) => state.contracts);
  const contractTime = useGameStore((state) => state.contractTime);

  if (contracts.length === 0) {
    return (
      <div className="generator-card">
        <span className="generator-count">Нет активных контрактов</span>
      </div>
    );
  }

  const totalEnergy = calcEnergySupply(contracts);
  const timeLeft = Math.ceil(contractTime);

  return (
    <div className="generator-card">
      <span className="generator-production">
        Энергия: {totalEnergy} МВт ({contracts.length} {contractWord(contracts.length)}) ·{" "}
        {timeLeft} сек
      </span>
    </div>
  );
}
