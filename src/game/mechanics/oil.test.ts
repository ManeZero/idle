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

describe("calcOilProductionRate with mods", () => {
  it("applies production rate multiplier", () => {
    const mods = { productionRateMultiplier: 1.25, minProductionFloor: 0 };
    expect(calcOilProductionRate(makeStation(10_000), mods)).toBe(12.5);
  });

  it("applies min production floor at low fill", () => {
    const mods = { productionRateMultiplier: 1, minProductionFloor: 1.5 };
    expect(calcOilProductionRate(makeStation(0), mods)).toBe(1.5);
  });

  it("does not apply floor when base rate is higher", () => {
    const mods = { productionRateMultiplier: 1, minProductionFloor: 1.5 };
    expect(calcOilProductionRate(makeStation(10_000), mods)).toBe(10);
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
