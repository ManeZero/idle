import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useGameStore } from "@/stores/gameStore";
import type { EnergyContract } from "@/types/game";
import { EnergyPanel } from "./EnergyPanel";

const makeContract = (id: number): EnergyContract => ({
  id,
  energyProvided: 10,
});

const reset = (overrides = {}) => {
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

describe("EnergyPanel", () => {
  it("shows 'no active contracts' when empty", () => {
    render(<EnergyPanel />);
    expect(screen.getByText("Нет активных контрактов")).toBeInTheDocument();
  });

  it("shows total energy and contract count", () => {
    reset({ contracts: [makeContract(1), makeContract(2)], contractTime: 85 });
    render(<EnergyPanel />);
    expect(screen.getByText(/20 МВт/)).toBeInTheDocument();
    expect(screen.getByText(/2 контракта/)).toBeInTheDocument();
  });

  it("shows ceiled time remaining", () => {
    reset({ contracts: [makeContract(1)], contractTime: 85.3 });
    render(<EnergyPanel />);
    expect(screen.getByText(/86 сек/)).toBeInTheDocument();
  });

  it("shows singular form for 1 contract", () => {
    reset({ contracts: [makeContract(1)], contractTime: 100 });
    render(<EnergyPanel />);
    expect(screen.getByText(/1 контракт[^а]/)).toBeInTheDocument();
  });
});
