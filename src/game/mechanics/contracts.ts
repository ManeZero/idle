import { CONTRACT_BASE_COST, CONTRACT_COST_PER_STATION } from "@/constants/game";

export function calcContractCost(enabledCount: number): number {
  return CONTRACT_BASE_COST + Math.max(0, enabledCount - 1) * CONTRACT_COST_PER_STATION;
}
