import { describe, expect, it } from "vitest";
import {
  MAX_CONTRACT_SLOTS,
  MAX_STATION_SLOTS,
  STATION_MAX_PRODUCTION_RATE,
} from "@/constants/game";
import { getResearchModifiers } from "./research";

describe("getResearchModifiers", () => {
  it("returns base values with no research", () => {
    const m = getResearchModifiers([]);
    expect(m.productionRateMultiplier).toBe(1);
    expect(m.stationCapacityMultiplier).toBe(1);
    expect(m.contractDurationMultiplier).toBe(1);
    expect(m.contractCostMultiplier).toBe(1);
    expect(m.minProductionFloor).toBe(0);
    expect(m.maxStationSlots).toBe(MAX_STATION_SLOTS);
    expect(m.maxContractSlots).toBe(MAX_CONTRACT_SLOTS);
    expect(m.autorenewEnabled).toBe(false);
    expect(m.autosellEnabled).toBe(false);
  });

  it("#1 increases production rate", () => {
    expect(getResearchModifiers([1]).productionRateMultiplier).toBe(1.25);
  });

  it("#2 reduces contract cost", () => {
    expect(getResearchModifiers([2]).contractCostMultiplier).toBe(0.8);
  });

  it("#3 increases station capacity", () => {
    expect(getResearchModifiers([3]).stationCapacityMultiplier).toBe(1.5);
  });

  it("#4 increases contract duration", () => {
    expect(getResearchModifiers([4]).contractDurationMultiplier).toBe(1.6);
  });

  it("#5 sets min production floor to 50% of station max rate", () => {
    expect(getResearchModifiers([5]).minProductionFloor).toBe(STATION_MAX_PRODUCTION_RATE * 0.5);
  });

  it("#5 floor scales with R1 production multiplier", () => {
    // R1 даёт +25% → floor = MAX * 1.25 * 0.5
    expect(getResearchModifiers([1, 5]).minProductionFloor).toBe(
      STATION_MAX_PRODUCTION_RATE * 1.25 * 0.5,
    );
  });

  it("#6 adds station slot", () => {
    expect(getResearchModifiers([6]).maxStationSlots).toBe(MAX_STATION_SLOTS + 1);
  });

  it("#7 enables autorenew", () => {
    expect(getResearchModifiers([7]).autorenewEnabled).toBe(true);
  });

  it("#8 enables autosell", () => {
    expect(getResearchModifiers([8]).autosellEnabled).toBe(true);
  });

  it("multiple research stack correctly", () => {
    const m = getResearchModifiers([1, 2, 6, 7]);
    expect(m.productionRateMultiplier).toBe(1.25);
    expect(m.contractCostMultiplier).toBe(0.8);
    expect(m.maxStationSlots).toBe(MAX_STATION_SLOTS + 1);
    expect(m.autorenewEnabled).toBe(true);
    expect(m.autosellEnabled).toBe(false);
  });
});
