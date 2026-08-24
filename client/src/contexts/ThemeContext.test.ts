import { describe, expect, it } from "vitest";
import { resolveTheme } from "./ThemeContext";

describe("system-aware theme resolution", () => {
  it("uses the operating system theme when system mode is selected", () => {
    expect(resolveTheme("system", "dark")).toBe("dark");
    expect(resolveTheme("system", "light")).toBe("light");
  });

  it("honors an explicit light or dark choice over the operating system", () => {
    expect(resolveTheme("light", "dark")).toBe("light");
    expect(resolveTheme("dark", "light")).toBe("dark");
  });
});
