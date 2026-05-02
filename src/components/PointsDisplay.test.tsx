import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useGameStore } from "@/stores/gameStore";
import { PointsDisplay } from "./PointsDisplay";

beforeEach(() => {
  localStorage.clear();
  useGameStore.setState({
    points: 0,
    generatorCount: 0,
    autoBuyUnlocked: false,
    autoBuyEnabled: false,
  });
});

describe("PointsDisplay", () => {
  it("shows 0.0 points initially", () => {
    render(<PointsDisplay />);
    expect(screen.getByText("0.0")).toBeInTheDocument();
  });

  it("shows updated points from store", () => {
    useGameStore.setState({ points: 42.5 });
    render(<PointsDisplay />);
    expect(screen.getByText("42.5")).toBeInTheDocument();
  });

  it("shows 0.0 / сек with no generators", () => {
    render(<PointsDisplay />);
    expect(screen.getByText("0.0 / сек")).toBeInTheDocument();
  });

  it("shows correct pps with generators", () => {
    useGameStore.setState({ generatorCount: 3 });
    render(<PointsDisplay />);
    expect(screen.getByText("3.0 / сек")).toBeInTheDocument();
  });
});
