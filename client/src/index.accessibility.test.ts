import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const indexHtmlPath = fileURLToPath(new URL("../index.html", import.meta.url));

describe("viewport accessibility", () => {
  it("does not restrict browser zoom through the viewport meta tag", () => {
    const html = readFileSync(indexHtmlPath, "utf8");

    expect(html).toContain('name="viewport"');
    expect(html).not.toMatch(/maximum-scale\s*=/i);
    expect(html).not.toMatch(/user-scalable\s*=\s*["']?no/i);
  });
});
