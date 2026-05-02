import { beforeEach, describe, expect, it } from "vitest";
import { useGameStore } from "./gameStore";

const reset = (overrides = {}) => {
  localStorage.clear();
  useGameStore.setState({
    points: 0,
    generatorCount: 0,
    autoBuyUnlocked: false,
    autoBuyEnabled: false,
    ...overrides,
  });
};

beforeEach(() => reset());

describe("initial state", () => {
  it("starts with 100 points", () => {
    expect(useGameStore.getInitialState().points).toBe(100);
  });

  it("starts with 0 generators", () => {
    expect(useGameStore.getInitialState().generatorCount).toBe(0);
  });

  it("starts with auto-buy locked and disabled", () => {
    expect(useGameStore.getInitialState().autoBuyUnlocked).toBe(false);
    expect(useGameStore.getInitialState().autoBuyEnabled).toBe(false);
  });
});

describe("tick", () => {
  it("adds no points when no generators", () => {
    useGameStore.getState().tick(1);
    expect(useGameStore.getState().points).toBe(0);
  });

  it("adds 1 point per second per generator", () => {
    reset({ generatorCount: 1 });
    useGameStore.getState().tick(1);
    expect(useGameStore.getState().points).toBe(1);
  });

  it("scales with delta time", () => {
    reset({ generatorCount: 1 });
    useGameStore.getState().tick(0.1);
    expect(useGameStore.getState().points).toBeCloseTo(0.1);
  });

  it("scales with generator count", () => {
    reset({ generatorCount: 3 });
    useGameStore.getState().tick(1);
    expect(useGameStore.getState().points).toBe(3);
  });

  it("auto-buys when unlocked, enabled, and affordable", () => {
    reset({ points: 200, autoBuyUnlocked: true, autoBuyEnabled: true });
    useGameStore.getState().tick(0);
    expect(useGameStore.getState().generatorCount).toBe(1);
    expect(useGameStore.getState().points).toBe(100);
  });

  it("does not auto-buy when disabled", () => {
    reset({ points: 200, autoBuyUnlocked: true, autoBuyEnabled: false });
    useGameStore.getState().tick(0);
    expect(useGameStore.getState().generatorCount).toBe(0);
  });

  it("does not auto-buy when not unlocked", () => {
    reset({ points: 200, autoBuyUnlocked: false, autoBuyEnabled: true });
    useGameStore.getState().tick(0);
    expect(useGameStore.getState().generatorCount).toBe(0);
  });
});

describe("buyGenerator", () => {
  it("does nothing when not enough points", () => {
    reset({ points: 50 });
    useGameStore.getState().buyGenerator();
    expect(useGameStore.getState().generatorCount).toBe(0);
    expect(useGameStore.getState().points).toBe(50);
  });

  it("buys generator and deducts 100 points", () => {
    reset({ points: 100 });
    useGameStore.getState().buyGenerator();
    expect(useGameStore.getState().generatorCount).toBe(1);
    expect(useGameStore.getState().points).toBe(0);
  });

  it("always costs 100 regardless of count", () => {
    reset({ points: 1000, generatorCount: 5 });
    useGameStore.getState().buyGenerator();
    expect(useGameStore.getState().points).toBe(900);
  });
});

describe("buyAutoBuy", () => {
  it("does nothing when not enough points", () => {
    reset({ points: 9_999 });
    useGameStore.getState().buyAutoBuy();
    expect(useGameStore.getState().autoBuyUnlocked).toBe(false);
  });

  it("unlocks and deducts 10 000 points", () => {
    reset({ points: 10_000 });
    useGameStore.getState().buyAutoBuy();
    expect(useGameStore.getState().autoBuyUnlocked).toBe(true);
    expect(useGameStore.getState().autoBuyEnabled).toBe(true);
    expect(useGameStore.getState().points).toBe(0);
  });

  it("cannot be bought twice", () => {
    reset({ points: 20_000, autoBuyUnlocked: true });
    useGameStore.getState().buyAutoBuy();
    expect(useGameStore.getState().points).toBe(20_000);
  });
});

describe("toggleAutoBuy", () => {
  it("toggles enabled to disabled", () => {
    reset({ autoBuyUnlocked: true, autoBuyEnabled: true });
    useGameStore.getState().toggleAutoBuy();
    expect(useGameStore.getState().autoBuyEnabled).toBe(false);
  });

  it("toggles disabled to enabled", () => {
    reset({ autoBuyUnlocked: true, autoBuyEnabled: false });
    useGameStore.getState().toggleAutoBuy();
    expect(useGameStore.getState().autoBuyEnabled).toBe(true);
  });
});
