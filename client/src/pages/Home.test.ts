import { describe, expect, it } from "vitest";
import { analysePassword } from "./Home";

describe("local password analysis", () => {
  it("flags a common sequential password as weak", () => {
    const result = analysePassword("Password1234");

    expect(result.score).toBeLessThan(35);
    expect(result.label).toBe("Weak");
    expect(result.checks.find(check => check.label === "No common password match")?.pass).toBe(false);
  });

  it("recognizes a long mixed passphrase without a common pattern", () => {
    const result = analysePassword("Harbor-mint-47-Window");

    expect(result.score).toBeGreaterThanOrEqual(75);
    expect(result.checks.find(check => check.label === "12 or more characters")?.pass).toBe(true);
    expect(result.checks.find(check => check.label === "No common password match")?.pass).toBe(true);
  });
});
