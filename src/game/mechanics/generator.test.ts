import { calcGeneratorCost, calcPointsPerSecond } from "./generator";

describe("calcGeneratorCost", () => {
  it("returns base price when none owned", () => {
    expect(calcGeneratorCost(0)).toBe(100);
  });

  it("returns 120 when 1 owned", () => {
    expect(calcGeneratorCost(1)).toBe(120);
  });

  it("returns 144 when 2 owned", () => {
    expect(calcGeneratorCost(2)).toBe(144);
  });

  it("increases with each purchase", () => {
    expect(calcGeneratorCost(1)).toBeGreaterThan(calcGeneratorCost(0));
    expect(calcGeneratorCost(2)).toBeGreaterThan(calcGeneratorCost(1));
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
