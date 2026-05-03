import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useGameStore } from "@/stores/gameStore";
import type { EnergyContract } from "@/types/game";
import { EnergyPanel } from "./EnergyPanel";

const makeContract = (overrides: Partial<EnergyContract> = {}): EnergyContract => ({
  id: 1,
  energyProvided: 10,
  timeRemaining: 100,
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

describe("EnergyPanel", () => {
  it("shows 'no active contract' when empty", () => {
    render(<EnergyPanel />);
    expect(screen.getByText("Нет активного контракта")).toBeInTheDocument();
  });

  it("shows energy and time for single contract", () => {
    reset({ contracts: [makeContract({ energyProvided: 40, timeRemaining: 85 })] });
    render(<EnergyPanel />);
    expect(screen.getByText("40 МВт · 85 сек")).toBeInTheDocument();
  });

  it("shows ceiled time remaining", () => {
    reset({ contracts: [makeContract({ timeRemaining: 85.3 })] });
    render(<EnergyPanel />);
    expect(screen.getByText(/86 сек/)).toBeInTheDocument();
  });

  it("shows each of two contracts separately", () => {
    reset({
      contracts: [
        makeContract({ id: 1, energyProvided: 40, timeRemaining: 50 }),
        makeContract({ id: 2, energyProvided: 50, timeRemaining: 80 }),
      ],
    });
    render(<EnergyPanel />);
    expect(screen.getByText("40 МВт · 50 сек")).toBeInTheDocument();
    expect(screen.getByText("50 МВт · 80 сек")).toBeInTheDocument();
  });
});
