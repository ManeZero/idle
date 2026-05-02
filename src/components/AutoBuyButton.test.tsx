import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { useGameStore } from "@/stores/gameStore";
import { AutoBuyButton } from "./AutoBuyButton";

const reset = (overrides = {}) => {
  localStorage.clear();
  useGameStore.setState({
    points: 0,
    generatorCount: 0,
    autoBuyUnlocked: false,
    autoBuyEnabled: false,
    ...overrides,
  });
};

beforeEach(() => reset());

describe("AutoBuyButton", () => {
  it("renders nothing when points < 10 000 and not unlocked", () => {
    reset({ points: 9_999 });
    render(<AutoBuyButton />);
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("shows buy button when points >= 10 000", () => {
    reset({ points: 10_000 });
    render(<AutoBuyButton />);
    expect(screen.getByText(/Купить/)).toBeInTheDocument();
  });

  it("buying deducts cost and unlocks", async () => {
    reset({ points: 10_000 });
    render(<AutoBuyButton />);
    await userEvent.click(screen.getByRole("button"));
    expect(useGameStore.getState().autoBuyUnlocked).toBe(true);
    expect(useGameStore.getState().points).toBe(0);
  });

  it("shows ВКЛ toggle when unlocked and enabled", () => {
    reset({ autoBuyUnlocked: true, autoBuyEnabled: true });
    render(<AutoBuyButton />);
    expect(screen.getByText("ВКЛ")).toBeInTheDocument();
  });

  it("shows ВЫКЛ toggle when unlocked and disabled", () => {
    reset({ autoBuyUnlocked: true, autoBuyEnabled: false });
    render(<AutoBuyButton />);
    expect(screen.getByText("ВЫКЛ")).toBeInTheDocument();
  });

  it("clicking toggle switches state", async () => {
    reset({ autoBuyUnlocked: true, autoBuyEnabled: true });
    render(<AutoBuyButton />);
    await userEvent.click(screen.getByRole("button"));
    expect(useGameStore.getState().autoBuyEnabled).toBe(false);
  });
});
