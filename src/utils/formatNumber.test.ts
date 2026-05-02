import { formatNumber } from "./formatNumber";

describe("formatNumber", () => {
  it("shows 1 decimal below 1000 by default", () => {
    expect(formatNumber(0)).toBe("0.0");
    expect(formatNumber(99.5)).toBe("99.5");
    expect(formatNumber(999.9)).toBe("999.9");
  });

  it("shows 0 decimals when specified", () => {
    expect(formatNumber(100, 0)).toBe("100");
    expect(formatNumber(999, 0)).toBe("999");
  });

  it("formats thousands as K", () => {
    expect(formatNumber(1000)).toBe("1.00K");
    expect(formatNumber(1500)).toBe("1.50K");
    expect(formatNumber(999_999)).toBe("1000.00K");
  });

  it("uses scientific notation from 1 million", () => {
    expect(formatNumber(1_000_000)).toBe("1.00e6");
    expect(formatNumber(2_500_000)).toBe("2.50e6");
    expect(formatNumber(1_000_000_000)).toBe("1.00e9");
    expect(formatNumber(1_000_000_000_000)).toBe("1.00e12");
  });
});
