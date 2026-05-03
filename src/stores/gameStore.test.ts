import { beforeEach, describe, expect, it } from "vitest";
import { CONTRACT_DURATION, EXPERIENCE_PER_BARREL } from "@/constants/game";
import type { EnergyContract, OilStation } from "@/types/game";
import { useGameStore } from "./gameStore";

const makeStation = (overrides: Partial<OilStation> = {}): OilStation => ({
  id: 1,
  oilRemaining: 10_000,
  capacity: 10_000,
  energyConsumption: 10,
  enabled: true,
  purchasePrice: 500,
  ...overrides,
});

const makeContract = (overrides: Partial<EnergyContract> = {}): EnergyContract => ({
  id: 1,
  energyProvided: 10,
  timeRemaining: 100,
  ...overrides,
});

const reset = (overrides: Partial<Parameters<typeof useGameStore.setState>[0]> = {}) => {
  localStorage.clear();
  useGameStore.setState({
    currency: 0,
    oil: 0,
    stations: [],
    contracts: [],
    nextId: 1,
    paused: false,
    experience: 0,
    completedResearch: [],
    autosellTimer: 0,
    ...overrides,
  });
};

beforeEach(() => reset());

describe("initial state", () => {
  it("starts with 1000 currency", () => {
    expect(useGameStore.getInitialState().currency).toBe(1_000);
  });

  it("starts with 0 oil, empty stations and contracts, 0 experience", () => {
    const s = useGameStore.getInitialState();
    expect(s.oil).toBe(0);
    expect(s.stations).toHaveLength(0);
    expect(s.contracts).toHaveLength(0);
    expect(s.experience).toBe(0);
    expect(s.completedResearch).toHaveLength(0);
  });
});

describe("tick", () => {
  it("does nothing when paused", () => {
    reset({ stations: [makeStation()], contracts: [makeContract()], paused: true });
    useGameStore.getState().tick(1);
    expect(useGameStore.getState().oil).toBe(0);
  });

  it("extracts oil when energy is sufficient", () => {
    reset({ stations: [makeStation()], contracts: [makeContract()] });
    useGameStore.getState().tick(1);
    expect(useGameStore.getState().oil).toBeGreaterThan(0);
  });

  it("does not extract oil when energy is insufficient", () => {
    reset({ stations: [makeStation()], contracts: [] });
    useGameStore.getState().tick(1);
    expect(useGameStore.getState().oil).toBe(0);
  });

  it("reduces oilRemaining after extraction", () => {
    reset({ stations: [makeStation()], contracts: [makeContract()] });
    useGameStore.getState().tick(1);
    expect(useGameStore.getState().stations[0]?.oilRemaining).toBeLessThan(10_000);
  });

  it("removes expired contracts", () => {
    reset({ contracts: [makeContract({ timeRemaining: 0.05 })] });
    useGameStore.getState().tick(0.1);
    expect(useGameStore.getState().contracts).toHaveLength(0);
  });

  it("decrements contract timeRemaining each tick", () => {
    reset({ contracts: [makeContract({ timeRemaining: 100 })] });
    useGameStore.getState().tick(1);
    expect(useGameStore.getState().contracts[0]?.timeRemaining).toBeCloseTo(99);
  });

  it("autosell triggers after interval when research #8 complete", () => {
    reset({ oil: 1_000, completedResearch: [8] });
    useGameStore.getState().tick(30);
    expect(useGameStore.getState().oil).toBeLessThan(1_000);
    expect(useGameStore.getState().experience).toBeGreaterThan(0);
  });
});

describe("buyOilStation", () => {
  it("does nothing when not enough currency", () => {
    reset({ currency: 499 });
    useGameStore.getState().buyOilStation();
    expect(useGameStore.getState().stations).toHaveLength(0);
  });

  it("buys station and deducts 500 currency", () => {
    reset({ currency: 500 });
    useGameStore.getState().buyOilStation();
    expect(useGameStore.getState().stations).toHaveLength(1);
    expect(useGameStore.getState().currency).toBe(0);
  });

  it("station starts with full capacity and enabled", () => {
    reset({ currency: 500 });
    useGameStore.getState().buyOilStation();
    const station = useGameStore.getState().stations[0];
    expect(station?.oilRemaining).toBe(10_000);
    expect(station?.enabled).toBe(true);
  });

  it("does not buy station when slot limit is reached", () => {
    const stations = [1, 2, 3, 4, 5].map((id) => makeStation({ id }));
    reset({ currency: 1_000, stations });
    useGameStore.getState().buyOilStation();
    expect(useGameStore.getState().stations).toHaveLength(5);
    expect(useGameStore.getState().currency).toBe(1_000);
  });
});

describe("sellOilStation", () => {
  it("returns 60% of purchase price and removes station", () => {
    reset({ stations: [makeStation()] });
    useGameStore.getState().sellOilStation(1);
    expect(useGameStore.getState().currency).toBe(300);
    expect(useGameStore.getState().stations).toHaveLength(0);
  });

  it("does nothing for unknown id", () => {
    reset({ stations: [makeStation()] });
    useGameStore.getState().sellOilStation(99);
    expect(useGameStore.getState().stations).toHaveLength(1);
  });
});

describe("toggleOilStation", () => {
  it("disables an enabled station", () => {
    reset({ stations: [makeStation({ enabled: true })] });
    useGameStore.getState().toggleOilStation(1);
    expect(useGameStore.getState().stations[0]?.enabled).toBe(false);
  });

  it("enables a disabled station", () => {
    reset({ stations: [makeStation({ enabled: false })] });
    useGameStore.getState().toggleOilStation(1);
    expect(useGameStore.getState().stations[0]?.enabled).toBe(true);
  });
});

describe("buyContract", () => {
  it("does nothing when no enabled stations", () => {
    reset({ currency: 1_000 });
    useGameStore.getState().buyContract();
    expect(useGameStore.getState().contracts).toHaveLength(0);
  });

  it("does nothing when not enough currency", () => {
    reset({ currency: 99, stations: [makeStation()] });
    useGameStore.getState().buyContract();
    expect(useGameStore.getState().contracts).toHaveLength(0);
  });

  it("creates contract with energy matching enabled stations", () => {
    reset({ currency: 1_000, stations: [makeStation({ id: 1 }), makeStation({ id: 2 })] });
    useGameStore.getState().buyContract();
    expect(useGameStore.getState().contracts[0]?.energyProvided).toBe(20);
  });

  it("costs 100 with 1 enabled station", () => {
    reset({ currency: 1_000, stations: [makeStation()] });
    useGameStore.getState().buyContract();
    expect(useGameStore.getState().currency).toBe(900);
  });

  it("costs 180 with 3 enabled stations", () => {
    const stations = [1, 2, 3].map((id) => makeStation({ id }));
    reset({ currency: 1_000, stations });
    useGameStore.getState().buyContract();
    expect(useGameStore.getState().currency).toBe(820);
  });

  it("sets timeRemaining to CONTRACT_DURATION", () => {
    reset({ currency: 1_000, stations: [makeStation()] });
    useGameStore.getState().buyContract();
    expect(useGameStore.getState().contracts[0]?.timeRemaining).toBe(CONTRACT_DURATION);
  });

  it("does not buy contract when slot limit is reached", () => {
    reset({ currency: 1_000, stations: [makeStation()], contracts: [makeContract()] });
    useGameStore.getState().buyContract();
    expect(useGameStore.getState().contracts).toHaveLength(1);
    expect(useGameStore.getState().currency).toBe(1_000);
  });
});

describe("sellOil", () => {
  it("sells 10% of oil", () => {
    reset({ oil: 1_000 });
    useGameStore.getState().sellOil(0.1);
    expect(useGameStore.getState().oil).toBeCloseTo(900);
    expect(useGameStore.getState().currency).toBeCloseTo(100);
  });

  it("earns experience proportional to barrels sold", () => {
    reset({ oil: 1_000 });
    useGameStore.getState().sellOil(1);
    expect(useGameStore.getState().experience).toBeCloseTo(1_000 * EXPERIENCE_PER_BARREL);
  });
});

describe("buyResearch", () => {
  it("does nothing when not enough experience", () => {
    reset({ experience: 99 });
    useGameStore.getState().buyResearch(1);
    expect(useGameStore.getState().completedResearch).toHaveLength(0);
  });

  it("does nothing when prerequisites not met", () => {
    reset({ experience: 1_000 });
    useGameStore.getState().buyResearch(3);
    expect(useGameStore.getState().completedResearch).toHaveLength(0);
  });

  it("does nothing when already completed", () => {
    reset({ experience: 1_000, completedResearch: [1] });
    useGameStore.getState().buyResearch(1);
    expect(useGameStore.getState().completedResearch).toHaveLength(1);
    expect(useGameStore.getState().experience).toBe(1_000);
  });

  it("deducts experience and adds to completedResearch", () => {
    reset({ experience: 100 });
    useGameStore.getState().buyResearch(1);
    expect(useGameStore.getState().completedResearch).toContain(1);
    expect(useGameStore.getState().experience).toBe(0);
  });

  it("research #3 updates capacity of existing stations", () => {
    const station = makeStation({ capacity: 10_000, oilRemaining: 5_000 });
    reset({ experience: 1_000, stations: [station], completedResearch: [1] });
    useGameStore.getState().buyResearch(3);
    expect(useGameStore.getState().stations[0]?.capacity).toBe(15_000);
    expect(useGameStore.getState().stations[0]?.oilRemaining).toBe(5_000);
  });
});

describe("togglePause", () => {
  it("pauses the game", () => {
    reset({ paused: false });
    useGameStore.getState().togglePause();
    expect(useGameStore.getState().paused).toBe(true);
  });

  it("resumes the game", () => {
    reset({ paused: true });
    useGameStore.getState().togglePause();
    expect(useGameStore.getState().paused).toBe(false);
  });
});
