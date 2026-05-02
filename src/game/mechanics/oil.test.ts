import type { OilStation } from "@/types/game";
import { calcOilProductionRate, calcStationSellValue } from "./oil";

function makeStation(oilRemaining: number, overrides: Partial<OilStation> = {}): OilStation {
  return {
    id: 1,
    oilRemaining,
    capacity: 10_000,
    energyConsumption: 10,
    enabled: true,
    purchasePrice: 500,
    ...overrides,
  };
}

describe("calcOilProductionRate", () => {
  it("returns 10/sec at 100% capacity", () => {
    expect(calcOilProductionRate(makeStation(10_000))).toBe(10);
  });

  it("returns 5/sec at 50% capacity", () => {
    expect(calcOilProductionRate(makeStation(5_000))).toBe(5);
  });

  it("returns 3/sec at 30% capacity", () => {
    expect(calcOilProductionRate(makeStation(3_000))).toBe(3);
  });

  it("returns 0/sec at 0% capacity", () => {
    expect(calcOilProductionRate(makeStation(0))).toBe(0);
  });
});

describe("calcStationSellValue", () => {
  it("returns 60% of purchase price", () => {
    expect(calcStationSellValue(makeStation(5_000))).toBe(300);
  });

  it("floors fractional values", () => {
    expect(calcStationSellValue(makeStation(0, { purchasePrice: 333 }))).toBe(199);
  });
});
