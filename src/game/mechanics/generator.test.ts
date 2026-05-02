import { calcGeneratorCost, calcPointsPerSecond } from "./generator";

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
