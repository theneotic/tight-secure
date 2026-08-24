import { describe, expect, it } from "vitest";
import { passphraseBlueprints, practiceScenarios } from "./Home";

describe("Security Judgment Drill", () => {
  it("contains three self-contained scenarios with exactly one valid safe-response index", () => {
    expect(practiceScenarios).toHaveLength(3);
    for (const scenario of practiceScenarios) {
      expect(scenario.options).toHaveLength(3);
      expect(scenario.answer).toBeGreaterThanOrEqual(0);
      expect(scenario.answer).toBeLessThan(scenario.options.length);
      expect(scenario.explanation.length).toBeGreaterThan(40);
    }
  });
});

describe("Passphrase Blueprint", () => {
  it("contains three safe-practice steps with a valid response index", () => {
    expect(passphraseBlueprints).toHaveLength(3);
    for (const step of passphraseBlueprints) {
      expect(step.options).toHaveLength(3);
      expect(step.answer).toBeGreaterThanOrEqual(0);
      expect(step.answer).toBeLessThan(step.options.length);
      expect(step.explanation.length).toBeGreaterThan(40);
    }
  });
});
