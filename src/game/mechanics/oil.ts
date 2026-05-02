import { STATION_MAX_PRODUCTION_RATE, STATION_SELL_PERCENT } from "@/constants/game";
import type { OilStation } from "@/types/game";

export function calcOilProductionRate(station: OilStation): number {
  return (station.oilRemaining / station.capacity) * STATION_MAX_PRODUCTION_RATE;
}

export function calcStationSellValue(station: OilStation): number {
  return Math.floor(station.purchasePrice * STATION_SELL_PERCENT);
}
