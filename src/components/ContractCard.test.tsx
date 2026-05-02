import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { EnergyContract } from "@/types/game";
import { ContractCard } from "./ContractCard";

const makeContract = (overrides: Partial<EnergyContract> = {}): EnergyContract => ({
  id: 1,
  energyProvided: 10,
  timeRemaining: 100,
  ...overrides,
});

describe("ContractCard", () => {
  it("shows energy provided", () => {
    render(<ContractCard contract={makeContract()} />);
    expect(screen.getByText("+10 МВт")).toBeInTheDocument();
  });

  it("shows remaining time ceiled", () => {
    render(<ContractCard contract={makeContract({ timeRemaining: 45.3 })} />);
    expect(screen.getByText("46 сек")).toBeInTheDocument();
  });
});
