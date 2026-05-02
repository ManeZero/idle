import { beforeEach, describe, expect, it } from "vitest";
import { useGameStore } from "./gameStore";

const reset = (overrides = {}) => {
  localStorage.clear();
  useGameStore.setState({
    points: 0,
    generatorCount: 0,
    autoBuyUnlocked: false,
    autoBuyEnabled: false,
    autoBuyUpgradeCount: 0,
    paused: false,
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

  it("starts with 0 upgrade count and unpaused", () => {
    expect(useGameStore.getInitialState().autoBuyUpgradeCount).toBe(0);
    expect(useGameStore.getInitialState().paused).toBe(false);
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

  it("does nothing when paused", () => {
    reset({ generatorCount: 5, paused: true });
    useGameStore.getState().tick(1);
    expect(useGameStore.getState().points).toBe(0);
  });

  it("auto-buys 1 generator when no upgrades", () => {
    reset({ points: 200, autoBuyUnlocked: true, autoBuyEnabled: true });
    useGameStore.getState().tick(0);
    expect(useGameStore.getState().generatorCount).toBe(1);
    expect(useGameStore.getState().points).toBe(100);
  });

  it("auto-buys 2 generators at once after 1 upgrade", () => {
    reset({ points: 500, autoBuyUnlocked: true, autoBuyEnabled: true, autoBuyUpgradeCount: 1 });
    useGameStore.getState().tick(0);
    expect(useGameStore.getState().generatorCount).toBe(2);
    expect(useGameStore.getState().points).toBe(300);
  });

  it("auto-buys 3 generators at once after 2 upgrades", () => {
    reset({ points: 500, autoBuyUnlocked: true, autoBuyEnabled: true, autoBuyUpgradeCount: 2 });
    useGameStore.getState().tick(0);
    expect(useGameStore.getState().generatorCount).toBe(3);
    expect(useGameStore.getState().points).toBe(200);
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

describe("buyAutoBuyUpgrade", () => {
  it("does nothing when not enough points", () => {
    reset({ points: 99_999 });
    useGameStore.getState().buyAutoBuyUpgrade();
    expect(useGameStore.getState().autoBuyUpgradeCount).toBe(0);
  });

  it("1st purchase: deducts 100 000, upgradeCount becomes 1", () => {
    reset({ points: 500_000 });
    useGameStore.getState().buyAutoBuyUpgrade();
    expect(useGameStore.getState().autoBuyUpgradeCount).toBe(1);
    expect(useGameStore.getState().points).toBe(400_000);
  });

  it("2nd purchase: deducts 110 000, upgradeCount becomes 2", () => {
    reset({ points: 500_000, autoBuyUpgradeCount: 1 });
    useGameStore.getState().buyAutoBuyUpgrade();
    expect(useGameStore.getState().autoBuyUpgradeCount).toBe(2);
    expect(useGameStore.getState().points).toBe(390_000);
  });

  it("3rd purchase: deducts 120 000, upgradeCount becomes 3", () => {
    reset({ points: 500_000, autoBuyUpgradeCount: 2 });
    useGameStore.getState().buyAutoBuyUpgrade();
    expect(useGameStore.getState().autoBuyUpgradeCount).toBe(3);
    expect(useGameStore.getState().points).toBe(380_000);
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
