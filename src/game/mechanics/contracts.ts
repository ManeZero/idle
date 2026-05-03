import { CONTRACT_BASE_COST, CONTRACT_COST_PER_STATION } from "@/constants/game";

/**
 * Базовая стоимость контракта по числу включённых станций.
 * Множитель из исследования R2 не применяется здесь — вызывающий код
 * (gameStore) умножает результат на mods.contractCostMultiplier и берёт floor.
 */
export function calcContractCost(enabledCount: number): number {
  return CONTRACT_BASE_COST + Math.max(0, enabledCount - 1) * CONTRACT_COST_PER_STATION;
}

/**
 * Финальная стоимость контракта с учётом скидки от R2.
 * Floor применяется так же, как в gameStore.buyContract.
 */
export function calcContractCostWithMods(
  enabledCount: number,
  contractCostMultiplier: number,
): number {
  return Math.floor(calcContractCost(enabledCount) * contractCostMultiplier);
}
