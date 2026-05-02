import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { useGameStore } from "@/stores/gameStore";
import { PauseButton } from "./PauseButton";

const reset = (overrides = {}) => {
  localStorage.clear();
  useGameStore.setState({
    points: 0,
    generatorCount: 0,
    autoBuyUnlocked: false,
    autoBuyEnabled: false,
    autoBuyUpgradeCount: 0,
    paused: false,
    ...overrides,
  });
};

beforeEach(() => reset());

describe("PauseButton", () => {
  it("shows Пауза when game is running", () => {
    reset({ paused: false });
    render(<PauseButton />);
    expect(screen.getByText("Пауза")).toBeInTheDocument();
  });

  it("shows Продолжить when game is paused", () => {
    reset({ paused: true });
    render(<PauseButton />);
    expect(screen.getByText("Продолжить")).toBeInTheDocument();
  });

  it("clicking pauses the game", async () => {
    reset({ paused: false });
    render(<PauseButton />);
    await userEvent.click(screen.getByRole("button"));
    expect(useGameStore.getState().paused).toBe(true);
  });

  it("clicking resumes the game", async () => {
    reset({ paused: true });
    render(<PauseButton />);
    await userEvent.click(screen.getByRole("button"));
    expect(useGameStore.getState().paused).toBe(false);
  });
});
