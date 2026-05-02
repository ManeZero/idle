import type { EnergyContract, OilStation } from "@/types/game";

export function calcEnergySupply(contracts: EnergyContract[]): number {
  return contracts.reduce((sum, c) => sum + c.energyProvided, 0);
}

export function calcEnergyDemand(stations: OilStation[]): number {
  return stations.filter((s) => s.enabled).reduce((sum, s) => sum + s.energyConsumption, 0);
}

export function hasEnoughEnergy(contracts: EnergyContract[], stations: OilStation[]): boolean {
  return calcEnergySupply(contracts) >= calcEnergyDemand(stations);
}
