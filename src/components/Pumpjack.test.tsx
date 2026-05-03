import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Pumpjack } from "./Pumpjack";

describe("Pumpjack", () => {
  it("renders an SVG", () => {
    const { container } = render(<Pumpjack />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("starts animation classes when running", () => {
    const { container } = render(<Pumpjack running={true} />);
    expect(container.querySelector(".pump-arm")).toBeInTheDocument();
    expect(container.querySelector(".pump-rod")).toBeInTheDocument();
  });

  it("omits animation classes when not running", () => {
    const { container } = render(<Pumpjack running={false} />);
    expect(container.querySelector(".pump-arm")).not.toBeInTheDocument();
    expect(container.querySelector(".pump-rod")).not.toBeInTheDocument();
  });
});
