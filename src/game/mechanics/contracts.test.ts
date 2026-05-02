import { calcContractCost } from "./contracts";

describe("calcContractCost", () => {
  it("costs 100 with 0 active contracts", () => {
    expect(calcContractCost(0)).toBe(100);
  });

  it("costs 110 with 1 active contract", () => {
    expect(calcContractCost(1)).toBe(110);
  });

  it("costs 120 with 2 active contracts", () => {
    expect(calcContractCost(2)).toBe(120);
  });

  it("costs 130 with 3 active contracts", () => {
    expect(calcContractCost(3)).toBe(130);
  });

  it("costs 140 with 4 active contracts", () => {
    expect(calcContractCost(4)).toBe(140);
  });

  it("costs 150 with 5 active contracts", () => {
    expect(calcContractCost(5)).toBe(150);
  });
});
