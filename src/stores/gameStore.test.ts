import { beforeEach, describe, expect, it } from "vitest";
import { useGameStore } from "./gameStore";

beforeEach(() => {
  localStorage.clear();
  useGameStore.setState({ points: 0, generatorCount: 0 });
});

describe("initial state", () => {
  it("starts with 100 points", () => {
    expect(useGameStore.getInitialState().points).toBe(100);
  });

  it("starts with 0 generators", () => {
    expect(useGameStore.getInitialState().generatorCount).toBe(0);
  });
});

describe("tick", () => {
  it("adds no points when no generators", () => {
    useGameStore.getState().tick(1);
    expect(useGameStore.getState().points).toBe(0);
  });

  it("adds 1 point per second per generator", () => {
    useGameStore.setState({ generatorCount: 1 });
    useGameStore.getState().tick(1);
    expect(useGameStore.getState().points).toBe(1);
  });

  it("scales with delta time", () => {
    useGameStore.setState({ generatorCount: 1 });
    useGameStore.getState().tick(0.1);
    expect(useGameStore.getState().points).toBeCloseTo(0.1);
  });

  it("scales with generator count", () => {
    useGameStore.setState({ generatorCount: 3 });
    useGameStore.getState().tick(1);
    expect(useGameStore.getState().points).toBe(3);
  });
});

describe("buyGenerator", () => {
  it("does nothing when not enough points", () => {
    useGameStore.setState({ points: 50 });
    useGameStore.getState().buyGenerator();
    expect(useGameStore.getState().generatorCount).toBe(0);
    expect(useGameStore.getState().points).toBe(50);
  });

  it("buys generator and deducts cost", () => {
    useGameStore.setState({ points: 100 });
    useGameStore.getState().buyGenerator();
    expect(useGameStore.getState().generatorCount).toBe(1);
    expect(useGameStore.getState().points).toBe(0);
  });

  it("second generator costs more than first", () => {
    useGameStore.setState({ points: 1000, generatorCount: 0 });
    useGameStore.getState().buyGenerator();
    const afterFirst = useGameStore.getState().points;
    useGameStore.getState().buyGenerator();
    const afterSecond = useGameStore.getState().points;
    expect(afterFirst - afterSecond).toBeGreaterThan(100);
  });
});
