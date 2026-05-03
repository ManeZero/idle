import { calcContractCost } from "./contracts";

describe("calcContractCost", () => {
  it("costs 100 with 0 enabled stations", () => {
    expect(calcContractCost(0)).toBe(100);
  });

  it("costs 100 with 1 enabled station", () => {
    expect(calcContractCost(1)).toBe(100);
  });

  it("costs 140 with 2 enabled stations", () => {
    expect(calcContractCost(2)).toBe(140);
  });

  it("costs 180 with 3 enabled stations", () => {
    expect(calcContractCost(3)).toBe(180);
  });

  it("costs 220 with 4 enabled stations", () => {
    expect(calcContractCost(4)).toBe(220);
  });

  it("costs 260 with 5 enabled stations", () => {
    expect(calcContractCost(5)).toBe(260);
  });
});
