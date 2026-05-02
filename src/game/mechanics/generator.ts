import { GENERATOR_BASE_PPS, GENERATOR_BASE_PRICE } from "@/constants/game";

export function calcGeneratorCost(): number {
  return GENERATOR_BASE_PRICE;
}

export function calcPointsPerSecond(count: number): number {
  return count * GENERATOR_BASE_PPS;
}
