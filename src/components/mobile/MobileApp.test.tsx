import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { STATION_PRICE } from "@/constants/game";
import { useGameStore } from "@/stores/gameStore";
import { MobileApp } from "./MobileApp";

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

describe("MobileApp", () => {
  it("renders BLACKWELL field name in top bar", () => {
    render(<MobileApp />);
    expect(screen.getByText("BLACKWELL")).toBeInTheDocument();
  });

  it("renders both bottom tabs", () => {
    render(<MobileApp />);
    expect(screen.getByRole("button", { name: /СТАНЦИИ/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /R&D/ })).toBeInTheDocument();
  });

  it("switches to R&D tab when clicked, showing research list heading", async () => {
    render(<MobileApp />);
    expect(screen.queryByText(/ИССЛЕДОВАНИЯ$/)).toBeNull();
    const rndTab = screen.getByRole("button", { name: /^R&D/ });
    await userEvent.click(rndTab);
    expect(screen.getByText(/R&D · ИССЛЕДОВАНИЯ/)).toBeInTheDocument();
  });

  it("clicking +КУПИТЬ СТАНЦИЮ in stations list adds station", async () => {
    render(<MobileApp />);
    const buyBtn = screen.getByRole("button", { name: /КУПИТЬ СТАНЦИЮ/ });
    await userEvent.click(buyBtn);
    expect(useGameStore.getState().stations).toHaveLength(1);
  });
});
