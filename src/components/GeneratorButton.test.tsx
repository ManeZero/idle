import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { useGameStore } from "@/stores/gameStore";
import { GeneratorButton } from "./GeneratorButton";

beforeEach(() => {
  localStorage.clear();
  useGameStore.setState({ points: 0, generatorCount: 0 });
});

describe("GeneratorButton", () => {
  it("shows cost of first generator", () => {
    render(<GeneratorButton />);
    expect(screen.getByText("Купить — 100 очков")).toBeInTheDocument();
  });

  it("button is disabled when not enough points", () => {
    useGameStore.setState({ points: 50 });
    render(<GeneratorButton />);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("button is enabled when enough points", () => {
    useGameStore.setState({ points: 100 });
    render(<GeneratorButton />);
    expect(screen.getByRole("button")).toBeEnabled();
  });

  it("buying increases generator count", async () => {
    useGameStore.setState({ points: 100 });
    render(<GeneratorButton />);
    await userEvent.click(screen.getByRole("button"));
    expect(useGameStore.getState().generatorCount).toBe(1);
  });

  it("shows count of owned generators", () => {
    useGameStore.setState({ generatorCount: 2 });
    render(<GeneratorButton />);
    expect(screen.getByText("куплено: 2")).toBeInTheDocument();
  });
});
