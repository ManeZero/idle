import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { useGameStore } from "@/stores/gameStore";
import type { EnergyContract } from "@/types/game";
import { ShopPanel } from "./ShopPanel";

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
    ...overrides,
  });
};

beforeEach(() => reset());

describe("ShopPanel", () => {
  it("station buy button disabled when not enough currency", () => {
    reset({ currency: 499 });
    render(<ShopPanel />);
    const buttons = screen.getAllByRole("button");
    expect(buttons[0]).toBeDisabled();
  });

  it("station buy button enabled when enough currency", () => {
    reset({ currency: 500 });
    render(<ShopPanel />);
    const buttons = screen.getAllByRole("button");
    expect(buttons[0]).toBeEnabled();
  });

  it("buying station deducts 500 currency", async () => {
    reset({ currency: 1_000 });
    render(<ShopPanel />);
    await userEvent.click(screen.getByText(/Купить — 500/));
    expect(useGameStore.getState().stations).toHaveLength(1);
    expect(useGameStore.getState().currency).toBe(500);
  });

  it("contract cost escalates with active contracts", () => {
    reset({ currency: 1_000, contracts: [makeContract(1)] });
    render(<ShopPanel />);
    expect(screen.getByText(/Купить — 110/)).toBeInTheDocument();
  });

  it("buying contract deducts correct cost", async () => {
    reset({ currency: 1_000 });
    render(<ShopPanel />);
    await userEvent.click(screen.getByText(/Купить — 100/));
    expect(useGameStore.getState().contracts).toHaveLength(1);
    expect(useGameStore.getState().currency).toBe(900);
  });
});
