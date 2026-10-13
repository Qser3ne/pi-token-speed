import { readFileSync } from "node:fs";
import { join } from "node:path";

export interface TokenSpeedSettings {
  /** 瞬时速度滑动窗口(ms)。 */
  windowMs: number;
  /** 渲染定时器间隔(ms)。 */
  renderIntervalMs: number;
  /** 首个 token 起算低于该时长不显示速度(ms)。 */
  minElapsedMs: number;
  /** 长窗口(ms):汇总最近这段时间内已完成消息的平均速度。 */
  longWindowMs: number;
  /** TTFT 取最近 N 次请求的平均值。 */
  ttftSamples: number;
}

export const DEFAULT_SETTINGS: TokenSpeedSettings = {
  windowMs: 2000,
  renderIntervalMs: 250,
  minElapsedMs: 300,
  longWindowMs: 10 * 60 * 1000,
  ttftSamples: 5,
};

const positiveNumber = (value: unknown, fallback: number): number =>
  typeof value === "number" && Number.isFinite(value) && value > 0 ? value : fallback;

const positiveInteger = (value: unknown, fallback: number): number =>
  typeof value === "number" && Number.isInteger(value) && value > 0 ? value : fallback;

export function normalizeSettings(raw: unknown): TokenSpeedSettings {
  const source = (raw !== null && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  return {
    windowMs: positiveNumber(source.windowMs, DEFAULT_SETTINGS.windowMs),
    renderIntervalMs: positiveNumber(source.renderIntervalMs, DEFAULT_SETTINGS.renderIntervalMs),
    minElapsedMs: positiveNumber(source.minElapsedMs, DEFAULT_SETTINGS.minElapsedMs),
    longWindowMs: positiveNumber(source.longWindowMs, DEFAULT_SETTINGS.longWindowMs),
    ttftSamples: positiveInteger(source.ttftSamples, DEFAULT_SETTINGS.ttftSamples),
  };
}

export function loadSettings(agentDir: string): { settings: TokenSpeedSettings; broken: boolean } {
  let text: string;
  try {
    text = readFileSync(join(agentDir, "pi-token-speed.json"), "utf8");
  } catch {
    // Missing or unreadable file: not "broken" — the file is optional.
    return { settings: normalizeSettings(undefined), broken: false };
  }
  try {
    return { settings: normalizeSettings(JSON.parse(text)), broken: false };
  } catch {
    return { settings: normalizeSettings(undefined), broken: true };
  }
}
