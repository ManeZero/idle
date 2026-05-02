import { CONTRACT_BASE_COST, CONTRACT_COST_INCREMENT } from "@/constants/game";

export function calcContractCost(activeCount: number): number {
  return CONTRACT_BASE_COST + activeCount * CONTRACT_COST_INCREMENT;
}
