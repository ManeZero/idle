import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { useGameStore } from "@/stores/gameStore";
import { ResearchPanel } from "./ResearchPanel";

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

describe("ResearchPanel", () => {
  it("shows all 8 research items", () => {
    render(<ResearchPanel />);
    expect(screen.getByText("Опытный бурильщик")).toBeInTheDocument();
    expect(screen.getByText("Нефтепровод")).toBeInTheDocument();
  });

  it("buy button disabled when not enough experience", () => {
    reset({ experience: 99 });
    render(<ResearchPanel />);
    expect(screen.getByText(/^100 оп\./)).toBeDisabled();
  });

  it("buy button enabled when enough experience and prereqs met", () => {
    reset({ experience: 100 });
    render(<ResearchPanel />);
    expect(screen.getByText(/^100 оп\./)).toBeEnabled();
  });

  it("research #3 locked until #1 completed", () => {
    reset({ experience: 1_000 });
    render(<ResearchPanel />);
    expect(screen.getByText(/^300 оп\./)).toBeDisabled();
  });

  it("research #3 available after #1 completed", () => {
    reset({ experience: 1_000, completedResearch: [1] });
    render(<ResearchPanel />);
    expect(screen.getByText(/^300 оп\./)).toBeEnabled();
  });

  it("buying research deducts experience and marks completed", async () => {
    reset({ experience: 100 });
    render(<ResearchPanel />);
    await userEvent.click(screen.getByText(/^100 оп\./));
    expect(useGameStore.getState().completedResearch).toContain(1);
    expect(useGameStore.getState().experience).toBe(0);
  });

  it("shows 'Изучено' for completed research", () => {
    reset({ completedResearch: [1] });
    render(<ResearchPanel />);
    expect(screen.getAllByText("Изучено")).toHaveLength(1);
  });

  it("shows missing prerequisite name", () => {
    reset({ experience: 1_000 });
    render(<ResearchPanel />);
    expect(screen.getByText(/Нужно:.*Опытный бурильщик/)).toBeInTheDocument();
  });
});
