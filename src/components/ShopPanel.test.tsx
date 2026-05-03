import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { useGameStore } from "@/stores/gameStore";
import type { EnergyContract, OilStation } from "@/types/game";
import { ShopPanel } from "./ShopPanel";

const makeStation = (id: number, overrides: Partial<OilStation> = {}): OilStation => ({
  id,
  oilRemaining: 10_000,
  capacity: 10_000,
  energyConsumption: 10,
  enabled: true,
  purchasePrice: 500,
  ...overrides,
});

const makeContract = (id: number): EnergyContract => ({
  id,
  energyProvided: 10,
  timeRemaining: 100,
});

const reset = (overrides = {}) => {
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

describe("ShopPanel", () => {
  it("station buy button disabled when not enough currency", () => {
    reset({ currency: 499 });
    render(<ShopPanel />);
    expect(screen.getByText(/Купить — 500/)).toBeDisabled();
  });

  it("station buy button enabled when enough currency", () => {
    reset({ currency: 500 });
    render(<ShopPanel />);
    expect(screen.getByText(/Купить — 500/)).toBeEnabled();
  });

  it("buying station deducts 500 currency", async () => {
    reset({ currency: 1_000 });
    render(<ShopPanel />);
    await userEvent.click(screen.getByText(/Купить — 500/));
    expect(useGameStore.getState().stations).toHaveLength(1);
    expect(useGameStore.getState().currency).toBe(500);
  });

  it("station buy button disabled when slot limit reached", () => {
    const stations = [1, 2, 3, 4, 5].map((id) => makeStation(id));
    reset({ currency: 1_000, stations });
    render(<ShopPanel />);
    expect(screen.getByText(/Купить — 500/)).toBeDisabled();
  });

  it("contract buy button disabled when no enabled stations", () => {
    reset({ currency: 1_000 });
    render(<ShopPanel />);
    expect(screen.getByText(/Купить — 100/)).toBeDisabled();
  });

  it("contract cost scales with enabled stations", () => {
    const stations = [makeStation(1), makeStation(2), makeStation(3)];
    reset({ currency: 1_000, stations });
    render(<ShopPanel />);
    expect(screen.getByText(/Купить — 180/)).toBeInTheDocument();
  });

  it("buying contract creates contract with matching energy", async () => {
    reset({ currency: 1_000, stations: [makeStation(1)] });
    render(<ShopPanel />);
    await userEvent.click(screen.getByText(/Купить — 100/));
    expect(useGameStore.getState().contracts[0]?.energyProvided).toBe(10);
    expect(useGameStore.getState().currency).toBe(900);
  });

  it("contract button shows 'Активен' when contract covers all enabled stations", () => {
    reset({ currency: 1_000, stations: [makeStation(1)], contracts: [makeContract(1)] });
    render(<ShopPanel />);
    expect(screen.getByText("Активен")).toBeDisabled();
  });

  it("contract button shows 'Обновить' when contract is insufficient", () => {
    const contract = makeContract(1);
    const stations = [makeStation(1), makeStation(2)];
    reset({ currency: 1_000, stations, contracts: [contract] });
    render(<ShopPanel />);
    expect(screen.getByText(/Обновить — 140/)).toBeEnabled();
  });
});
