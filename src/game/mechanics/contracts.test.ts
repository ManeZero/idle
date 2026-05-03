import { CONTRACT_BASE_COST, CONTRACT_COST_PER_STATION } from "@/constants/game";
import { calcContractCost } from "./contracts";

describe("calcContractCost", () => {
  it("equals base cost with 0 enabled stations", () => {
    expect(calcContractCost(0)).toBe(CONTRACT_BASE_COST);
  });

  it("equals base cost with 1 enabled station", () => {
    expect(calcContractCost(1)).toBe(CONTRACT_BASE_COST);
  });

  it("adds per-station cost for each station beyond the first", () => {
    expect(calcContractCost(2)).toBe(CONTRACT_BASE_COST + CONTRACT_COST_PER_STATION);
    expect(calcContractCost(3)).toBe(CONTRACT_BASE_COST + 2 * CONTRACT_COST_PER_STATION);
    expect(calcContractCost(4)).toBe(CONTRACT_BASE_COST + 3 * CONTRACT_COST_PER_STATION);
    expect(calcContractCost(5)).toBe(CONTRACT_BASE_COST + 4 * CONTRACT_COST_PER_STATION);
  });
});
