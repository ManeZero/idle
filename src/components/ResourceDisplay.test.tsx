import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { useGameStore } from "@/stores/gameStore";
import type { EnergyContract, OilStation } from "@/types/game";
import { ResourceDisplay } from "./ResourceDisplay";

const makeStation = (enabled: boolean, id = 1): OilStation => ({
  id,
  oilRemaining: 10_000,
  capacity: 10_000,
  energyConsumption: 10,
  enabled,
  purchasePrice: 500,
});
const makeContract = (id = 1): EnergyContract => ({
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

describe("ResourceDisplay", () => {
  it("shows currency", () => {
    reset({ currency: 1_000 });
    render(<ResourceDisplay />);
    expect(screen.getByText("1.00K")).toBeInTheDocument();
  });

  it("shows oil amount", () => {
    reset({ oil: 500 });
    render(<ResourceDisplay />);
    expect(screen.getByText("500.0")).toBeInTheDocument();
  });

  it("shows energy supply and demand", () => {
    reset({ stations: [makeStation(true)], contracts: [makeContract()] });
    render(<ResourceDisplay />);
    expect(screen.getByText("10 / 10 МВт")).toBeInTheDocument();
  });

  it("energy row has danger class when supply < demand", () => {
    reset({ stations: [makeStation(true)], contracts: [] });
    render(<ResourceDisplay />);
    expect(document.querySelector(".resource-row--danger")).toBeTruthy();
  });

  it("energy row has no danger class when supply >= demand", () => {
    reset({ stations: [makeStation(true)], contracts: [makeContract()] });
    render(<ResourceDisplay />);
    expect(document.querySelector(".resource-row--danger")).toBeNull();
  });

  it("sell 10% button calls sellOil(0.1)", async () => {
    reset({ oil: 1_000 });
    render(<ResourceDisplay />);
    await userEvent.click(screen.getByText("Продать 10%"));
    expect(useGameStore.getState().oil).toBeCloseTo(900);
  });

  it("sell 100% button calls sellOil(1)", async () => {
    reset({ oil: 1_000 });
    render(<ResourceDisplay />);
    await userEvent.click(screen.getByText("Продать 100%"));
    expect(useGameStore.getState().oil).toBeCloseTo(0);
  });
});
