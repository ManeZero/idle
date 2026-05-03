import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { useGameStore } from "@/stores/gameStore";
import type { OilStation } from "@/types/game";
import { OilStationCard } from "./OilStationCard";

const makeStation = (overrides: Partial<OilStation> = {}): OilStation => ({
  id: 1,
  oilRemaining: 10_000,
  capacity: 10_000,
  energyConsumption: 10,
  enabled: true,
  purchasePrice: 500,
  ...overrides,
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

describe("OilStationCard", () => {
  it("shows production rate and fill percent", () => {
    const station = makeStation({ oilRemaining: 5_000 });
    render(<OilStationCard station={station} />);
    expect(screen.getByText(/5\.0 барр\.\/сек · 50% ёмкости/)).toBeInTheDocument();
  });

  it("shows energy consumption", () => {
    render(<OilStationCard station={makeStation()} />);
    expect(screen.getByText("10 МВт")).toBeInTheDocument();
  });

  it("toggle button calls toggleOilStation", async () => {
    const station = makeStation({ enabled: true });
    reset({ stations: [station] });
    render(<OilStationCard station={station} />);
    await userEvent.click(screen.getByText("ВКЛ"));
    expect(useGameStore.getState().stations[0]?.enabled).toBe(false);
  });

  it("sell button calls sellOilStation", async () => {
    const station = makeStation();
    reset({ stations: [station] });
    render(<OilStationCard station={station} />);
    await userEvent.click(screen.getByText(/Продать/));
    expect(useGameStore.getState().stations).toHaveLength(0);
    expect(useGameStore.getState().currency).toBe(300);
  });
});
