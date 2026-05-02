import type { EnergyContract } from "@/types/game";

interface Props {
  contract: EnergyContract;
}

export function ContractCard({ contract }: Props) {
  const timeLeft = Math.ceil(contract.timeRemaining);

  return (
    <div className="generator-card">
      <div className="generator-info">
        <span className="generator-name">Контракт #{contract.id}</span>
        <span className="generator-production">+{contract.energyProvided} МВт</span>
        <span className="generator-count">{timeLeft} сек</span>
      </div>
    </div>
  );
}
