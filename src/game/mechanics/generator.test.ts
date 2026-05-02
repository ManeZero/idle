import { calcAutoBuyUpgradeCost, calcGeneratorCost, calcPointsPerSecond } from "./generator";

describe("calcGeneratorCost", () => {
  it("always returns the base price", () => {
    expect(calcGeneratorCost()).toBe(100);
  });
});

describe("calcPointsPerSecond", () => {
  it("returns 0 with no generators", () => {
    expect(calcPointsPerSecond(0)).toBe(0);
  });

  it("returns 1 with 1 generator", () => {
    expect(calcPointsPerSecond(1)).toBe(1);
  });

  it("returns 3 with 3 generators", () => {
    expect(calcPointsPerSecond(3)).toBe(3);
  });
});

describe("calcAutoBuyUpgradeCost", () => {
  it("costs 100 000 before any upgrades", () => {
    expect(calcAutoBuyUpgradeCost(0)).toBe(100_000);
  });

  it("costs 110 000 after 1 upgrade", () => {
    expect(calcAutoBuyUpgradeCost(1)).toBe(110_000);
  });

  it("costs 120 000 after 2 upgrades", () => {
    expect(calcAutoBuyUpgradeCost(2)).toBe(120_000);
  });

  it("costs 130 000 after 3 upgrades", () => {
    expect(calcAutoBuyUpgradeCost(3)).toBe(130_000);
  });

  it("costs 140 000 after 4 upgrades", () => {
    expect(calcAutoBuyUpgradeCost(4)).toBe(140_000);
  });

  it("costs 150 000 after 5 upgrades", () => {
    expect(calcAutoBuyUpgradeCost(5)).toBe(150_000);
  });
});
