import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { useGameStore } from "@/stores/gameStore";
import { AutoBuyUpgradeButton } from "./AutoBuyUpgradeButton";

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

describe("AutoBuyUpgradeButton", () => {
  it("renders nothing when generatorCount < 2000", () => {
    reset({ generatorCount: 1_999 });
    render(<AutoBuyUpgradeButton />);
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("renders when generatorCount >= 2000", () => {
    reset({ generatorCount: 2_000 });
    render(<AutoBuyUpgradeButton />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("button is disabled when not enough points", () => {
    reset({ generatorCount: 2_000, points: 99_999 });
    render(<AutoBuyUpgradeButton />);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("button is enabled when enough points", () => {
    reset({ generatorCount: 2_000, points: 100_000 });
    render(<AutoBuyUpgradeButton />);
    expect(screen.getByRole("button")).toBeEnabled();
  });

  it("1st purchase: deducts 100 000, upgradeCount = 1, button shows 110 000", async () => {
    reset({ generatorCount: 2_000, points: 500_000 });
    render(<AutoBuyUpgradeButton />);
    await userEvent.click(screen.getByRole("button"));
    expect(useGameStore.getState().autoBuyUpgradeCount).toBe(1);
    expect(useGameStore.getState().points).toBe(400_000);
    expect(screen.getByText(/110\.00K/)).toBeInTheDocument();
  });

  it("2nd purchase: deducts 110 000, upgradeCount = 2, button shows 120 000", async () => {
    reset({ generatorCount: 2_000, points: 500_000, autoBuyUpgradeCount: 1 });
    render(<AutoBuyUpgradeButton />);
    await userEvent.click(screen.getByRole("button"));
    expect(useGameStore.getState().autoBuyUpgradeCount).toBe(2);
    expect(useGameStore.getState().points).toBe(390_000);
    expect(screen.getByText(/120\.00K/)).toBeInTheDocument();
  });

  it("3rd purchase: deducts 120 000, upgradeCount = 3, button shows 130 000", async () => {
    reset({ generatorCount: 2_000, points: 500_000, autoBuyUpgradeCount: 2 });
    render(<AutoBuyUpgradeButton />);
    await userEvent.click(screen.getByRole("button"));
    expect(useGameStore.getState().autoBuyUpgradeCount).toBe(3);
    expect(useGameStore.getState().points).toBe(380_000);
    expect(screen.getByText(/130\.00K/)).toBeInTheDocument();
  });
});
