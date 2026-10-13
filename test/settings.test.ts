import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { normalizeSettings, loadSettings, DEFAULT_SETTINGS } from "../src/settings.ts";

const tempAgentDir = (files: Record<string, string> = {}): string => {
  const dir = mkdtempSync(join(tmpdir(), "pts-settings-"));
  for (const [name, content] of Object.entries(files)) writeFileSync(join(dir, name), content);
  return dir;
};

test("normalizeSettings applies all defaults for empty object", () => {
  assert.deepEqual(normalizeSettings({}), {
    windowMs: 2000,
    renderIntervalMs: 250,
    minElapsedMs: 300,
    longWindowMs: 600_000,
    ttftSamples: 5,
  });
  assert.deepEqual(normalizeSettings(undefined), DEFAULT_SETTINGS);
});

test("normalizeSettings accepts valid overrides", () => {
  const s = normalizeSettings({ windowMs: 5000, renderIntervalMs: 100, minElapsedMs: 500, longWindowMs: 60000, ttftSamples: 10 });
  assert.equal(s.windowMs, 5000);
  assert.equal(s.renderIntervalMs, 100);
  assert.equal(s.minElapsedMs, 500);
  assert.equal(s.longWindowMs, 60000);
  assert.equal(s.ttftSamples, 10);
});

test("normalizeSettings falls back to defaults for invalid values", () => {
  const s = normalizeSettings({ windowMs: -1, renderIntervalMs: "x", minElapsedMs: NaN, longWindowMs: 0, ttftSamples: 2.5 });
  assert.deepEqual(s, DEFAULT_SETTINGS);
});

test("loadSettings: missing file is not broken", () => {
  const loaded = loadSettings(tempAgentDir());
  assert.equal(loaded.broken, false);
  assert.deepEqual(loaded.settings, DEFAULT_SETTINGS);
});

test("loadSettings reads pi-token-speed.json", () => {
  const dir = tempAgentDir({ "pi-token-speed.json": JSON.stringify({ windowMs: 4000 }) });
  const loaded = loadSettings(dir);
  assert.equal(loaded.broken, false);
  assert.equal(loaded.settings.windowMs, 4000);
});

test("loadSettings: invalid JSON is broken and yields defaults", () => {
  const loaded = loadSettings(tempAgentDir({ "pi-token-speed.json": "{nope" }));
  assert.equal(loaded.broken, true);
  assert.deepEqual(loaded.settings, DEFAULT_SETTINGS);
});
