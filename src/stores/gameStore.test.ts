import { beforeEach, describe, expect, it } from "vitest";
import { CONTRACT_DURATION } from "@/constants/game";
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
  ...overrides,
});

const reset = (overrides: Partial<Parameters<typeof useGameStore.setState>[0]> = {}) => {
  localStorage.clear();
  useGameStore.setState({
    currency: 0,
    oil: 0,
    stations: [],
    contracts: [],
    contractTime: 0,
    nextId: 1,
    paused: false,
    ...overrides,
  });
};

beforeEach(() => reset());

describe("initial state", () => {
  it("starts with 1000 currency", () => {
    expect(useGameStore.getInitialState().currency).toBe(1_000);
  });

  it("starts with 0 oil, empty stations, contracts and contractTime", () => {
    const s = useGameStore.getInitialState();
    expect(s.oil).toBe(0);
    expect(s.stations).toHaveLength(0);
    expect(s.contracts).toHaveLength(0);
    expect(s.contractTime).toBe(0);
  });
});

describe("tick", () => {
  it("does nothing when paused", () => {
    reset({
      stations: [makeStation()],
      contracts: [makeContract()],
      contractTime: 100,
      paused: true,
    });
    useGameStore.getState().tick(1);
    expect(useGameStore.getState().oil).toBe(0);
  });

  it("extracts oil when energy is sufficient", () => {
    reset({ stations: [makeStation()], contracts: [makeContract()], contractTime: 100 });
    useGameStore.getState().tick(1);
    expect(useGameStore.getState().oil).toBeGreaterThan(0);
  });

  it("does not extract oil when energy is insufficient", () => {
    reset({ stations: [makeStation()], contracts: [] });
    useGameStore.getState().tick(1);
    expect(useGameStore.getState().oil).toBe(0);
  });

  it("reduces oilRemaining after extraction", () => {
    reset({ stations: [makeStation()], contracts: [makeContract()], contractTime: 100 });
    useGameStore.getState().tick(1);
    expect(useGameStore.getState().stations[0]?.oilRemaining).toBeLessThan(10_000);
  });

  it("clears contracts and resets contractTime when timer expires", () => {
    reset({ contracts: [makeContract()], contractTime: 0.05 });
    useGameStore.getState().tick(0.1);
    expect(useGameStore.getState().contracts).toHaveLength(0);
    expect(useGameStore.getState().contractTime).toBe(0);
  });

  it("decrements contractTime each tick", () => {
    reset({ contracts: [makeContract()], contractTime: 100 });
    useGameStore.getState().tick(1);
    expect(useGameStore.getState().contractTime).toBeCloseTo(99);
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
  it("does nothing when not enough currency", () => {
    reset({ currency: 99 });
    useGameStore.getState().buyContract();
    expect(useGameStore.getState().contracts).toHaveLength(0);
  });

  it("1st contract costs 100 currency", () => {
    reset({ currency: 1_000 });
    useGameStore.getState().buyContract();
    expect(useGameStore.getState().contracts).toHaveLength(1);
    expect(useGameStore.getState().currency).toBe(900);
  });

  it("sets contractTime to CONTRACT_DURATION on first buy", () => {
    reset({ currency: 1_000 });
    useGameStore.getState().buyContract();
    expect(useGameStore.getState().contractTime).toBe(CONTRACT_DURATION);
  });

  it("adds CONTRACT_DURATION to contractTime on second buy", () => {
    reset({ currency: 1_000, contracts: [makeContract()], contractTime: CONTRACT_DURATION });
    useGameStore.getState().buyContract();
    expect(useGameStore.getState().contractTime).toBe(CONTRACT_DURATION * 2);
  });

  it("2nd contract costs 110 currency", () => {
    reset({ currency: 1_000, contracts: [makeContract()], contractTime: 100 });
    useGameStore.getState().buyContract();
    expect(useGameStore.getState().currency).toBe(890);
  });

  it("3rd contract costs 120 currency", () => {
    reset({
      currency: 1_000,
      contracts: [makeContract({ id: 1 }), makeContract({ id: 2 })],
      contractTime: 100,
    });
    useGameStore.getState().buyContract();
    expect(useGameStore.getState().currency).toBe(880);
  });

  it("does not buy contract when slot limit is reached", () => {
    const contracts = [1, 2, 3, 4, 5].map((id) => makeContract({ id }));
    reset({ currency: 1_000, contracts, contractTime: 100 });
    useGameStore.getState().buyContract();
    expect(useGameStore.getState().contracts).toHaveLength(5);
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

  it("sells 50% of oil", () => {
    reset({ oil: 1_000 });
    useGameStore.getState().sellOil(0.5);
    expect(useGameStore.getState().oil).toBeCloseTo(500);
    expect(useGameStore.getState().currency).toBeCloseTo(500);
  });

  it("sells 100% of oil", () => {
    reset({ oil: 1_000 });
    useGameStore.getState().sellOil(1);
    expect(useGameStore.getState().oil).toBeCloseTo(0);
    expect(useGameStore.getState().currency).toBeCloseTo(1_000);
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
