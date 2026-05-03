import { STATION_MAX_PRODUCTION_RATE, STATION_SELL_PERCENT } from "@/constants/game";
import type { OilStation } from "@/types/game";

interface OilModifiers {
  productionRateMultiplier: number;
  minProductionFloor: number;
}

export function calcOilProductionRate(station: OilStation, mods?: OilModifiers): number {
  const base = (station.oilRemaining / station.capacity) * STATION_MAX_PRODUCTION_RATE;
  if (!mods) return base;
  return Math.max(mods.minProductionFloor, base * mods.productionRateMultiplier);
}

export function calcStationSellValue(station: OilStation): number {
  return Math.floor(station.purchasePrice * STATION_SELL_PERCENT);
}
