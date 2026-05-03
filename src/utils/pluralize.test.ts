import { describe, expect, it } from "vitest";
import { pluralizeRu } from "./pluralize";

const forms: [string, string, string] = ["контракт", "контракта", "контрактов"];

describe("pluralizeRu", () => {
  it("returns one form for 1", () => {
    expect(pluralizeRu(1, forms)).toBe("контракт");
  });

  it("returns few form for 2, 3, 4", () => {
    expect(pluralizeRu(2, forms)).toBe("контракта");
    expect(pluralizeRu(3, forms)).toBe("контракта");
    expect(pluralizeRu(4, forms)).toBe("контракта");
  });

  it("returns many form for 5–20", () => {
    expect(pluralizeRu(5, forms)).toBe("контрактов");
    expect(pluralizeRu(11, forms)).toBe("контрактов");
    expect(pluralizeRu(12, forms)).toBe("контрактов");
    expect(pluralizeRu(20, forms)).toBe("контрактов");
  });

  it("handles teens correctly (11–14 always many)", () => {
    expect(pluralizeRu(11, forms)).toBe("контрактов");
    expect(pluralizeRu(14, forms)).toBe("контрактов");
  });

  it("returns one form for 21, 31, 101", () => {
    expect(pluralizeRu(21, forms)).toBe("контракт");
    expect(pluralizeRu(31, forms)).toBe("контракт");
    expect(pluralizeRu(101, forms)).toBe("контракт");
  });

  it("returns few form for 22, 23, 24", () => {
    expect(pluralizeRu(22, forms)).toBe("контракта");
    expect(pluralizeRu(23, forms)).toBe("контракта");
    expect(pluralizeRu(24, forms)).toBe("контракта");
  });

  it("returns many form for 0", () => {
    expect(pluralizeRu(0, forms)).toBe("контрактов");
  });
});
