import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

describe("Vercel deployment configuration", () => {
  it("publishes the Vite client output and preserves SPA routing", () => {
    const configPath = fileURLToPath(new URL("../vercel.json", import.meta.url));
    const config = JSON.parse(readFileSync(configPath, "utf8")) as {
      outputDirectory?: string;
      rewrites?: Array<{ source?: string; destination?: string }>;
    };

    expect(config.outputDirectory).toBe("dist/public");
    expect(config.rewrites).toContainEqual({
      source: "/(.*)",
      destination: "/index.html",
    });
  });
});
