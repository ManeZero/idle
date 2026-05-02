import {
  AUTO_BUY_UPGRADE_BASE_COST,
  AUTO_BUY_UPGRADE_COST_INCREMENT,
  GENERATOR_BASE_PPS,
  GENERATOR_BASE_PRICE,
} from "@/constants/game";

export function calcGeneratorCost(): number {
  return GENERATOR_BASE_PRICE;
}

export function calcPointsPerSecond(count: number): number {
  return count * GENERATOR_BASE_PPS;
}

export function calcAutoBuyUpgradeCost(upgradeCount: number): number {
  return AUTO_BUY_UPGRADE_BASE_COST + upgradeCount * AUTO_BUY_UPGRADE_COST_INCREMENT;
}
