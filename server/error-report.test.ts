import { expect, test, vi } from "vitest";
import { logFailure } from "./error-report";

test("logFailure writes the label, context, and error message", () => {
  const log = vi.spyOn(console, "error").mockImplementation(() => undefined);
  logFailure("Kanban project folder not saved:", new Error("EACCES /Users/alice"), "project-123");
  expect(log).toHaveBeenCalledWith("Kanban project folder not saved:", "project-123", "EACCES /Users/alice");
  log.mockRestore();
});

test("logFailure handles non-Error failures", () => {
  const log = vi.spyOn(console, "error").mockImplementation(() => undefined);
  logFailure("Flowly operation failed:", "bad result");
  expect(log).toHaveBeenCalledWith("Flowly operation failed:", "bad result");
  log.mockRestore();
});

test("daemon code logs failures only through logFailure", async () => {
  const { readdir, readFile } = await import("node:fs/promises");
  const { join } = await import("node:path");
  const root = join(__dirname, "..");
  const files = ["index.server.ts", ...(await readdir(join(root, "server"), { recursive: true })).map((f) => join("server", String(f)))].filter(
    (f) => f.endsWith(".ts") && !f.endsWith(".test.ts") && f !== join("server", "error-report.ts"),
  );
  const offenders: string[] = [];
  for (const file of files) {
    const text = await readFile(join(root, file), "utf8");
    text.split("\n").forEach((line, i) => {
      if (line.includes("console.error(")) offenders.push(`${file}:${i + 1}`);
    });
  }
  expect(offenders).toEqual([]);
});
