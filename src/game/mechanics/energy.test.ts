import type { EnergyContract, OilStation } from "@/types/game";
import { calcEnergyDemand, calcEnergySupply, hasEnoughEnergy } from "./energy";

function makeContract(energyProvided: number, id = 1): EnergyContract {
  return { id, energyProvided };
}

function makeStation(enabled: boolean, id = 1): OilStation {
  return {
    id,
    oilRemaining: 10_000,
    capacity: 10_000,
    energyConsumption: 10,
    enabled,
    purchasePrice: 500,
  };
}

describe("calcEnergySupply", () => {
  it("returns 0 with no contracts", () => {
    expect(calcEnergySupply([])).toBe(0);
  });

  it("sums energy from all contracts", () => {
    expect(calcEnergySupply([makeContract(10, 1), makeContract(10, 2)])).toBe(20);
  });
});

describe("calcEnergyDemand", () => {
  it("returns 0 with no stations", () => {
    expect(calcEnergyDemand([])).toBe(0);
  });

  it("sums consumption of enabled stations only", () => {
    const stations = [makeStation(true, 1), makeStation(false, 2), makeStation(true, 3)];
    expect(calcEnergyDemand(stations)).toBe(20);
  });
});

describe("hasEnoughEnergy", () => {
  it("returns true when supply >= demand", () => {
    expect(hasEnoughEnergy([makeContract(10)], [makeStation(true)])).toBe(true);
  });

  it("returns true with no stations", () => {
    expect(hasEnoughEnergy([], [])).toBe(true);
  });

  it("returns false when supply < demand", () => {
    const stations = [makeStation(true, 1), makeStation(true, 2)];
    expect(hasEnoughEnergy([makeContract(10)], stations)).toBe(false);
  });

  it("returns false with stations but no contracts", () => {
    expect(hasEnoughEnergy([], [makeStation(true)])).toBe(false);
  });
});
