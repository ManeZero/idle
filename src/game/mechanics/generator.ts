import {
  GENERATOR_BASE_PPS,
  GENERATOR_BASE_PRICE,
  GENERATOR_PRICE_MULTIPLIER,
} from "@/constants/game";

export function calcGeneratorCost(count: number): number {
  return Math.floor(GENERATOR_BASE_PRICE * GENERATOR_PRICE_MULTIPLIER ** count);
}

export function calcPointsPerSecond(count: number): number {
  return count * GENERATOR_BASE_PPS;
}
