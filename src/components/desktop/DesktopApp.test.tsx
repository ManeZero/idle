import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { STATION_PRICE } from "@/constants/game";
import { useGameStore } from "@/stores/gameStore";
import { DesktopApp } from "./DesktopApp";

const reset = (overrides = {}) => {
  localStorage.clear();
  useGameStore.setState({
    currency: STATION_PRICE * 2,
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

describe("DesktopApp", () => {
  it("renders the schematic title", () => {
    render(<DesktopApp />);
    expect(screen.getByText(/МЕСТОРОЖДЕНИЕ «BLACKWELL»/)).toBeInTheDocument();
  });

  it("renders the R&D tree heading", () => {
    render(<DesktopApp />);
    expect(screen.getByText(/Дерево R&D/)).toBeInTheDocument();
  });

  it("buying a station from the bottom bar adds it to the store", async () => {
    render(<DesktopApp />);
    const buyBtn = screen.getByRole("button", { name: new RegExp(`КУПИТЬ \\$${STATION_PRICE}`) });
    await userEvent.click(buyBtn);
    expect(useGameStore.getState().stations).toHaveLength(1);
  });

  it("pause button toggles paused state", async () => {
    render(<DesktopApp />);
    const pauseBtn = screen.getByRole("button", { name: /ПАУЗА/ });
    await userEvent.click(pauseBtn);
    expect(useGameStore.getState().paused).toBe(true);
  });
});
