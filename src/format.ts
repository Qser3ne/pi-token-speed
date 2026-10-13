/** 粗略估算 token:CJK 字符约 1 token/字,其余约 4 字符/token。 */
export function estimateTokens(text: string): number {
  let cjk = 0;
  let other = 0;
  for (const ch of text) {
    const c = ch.codePointAt(0)!;
    if (
      (c >= 0x4e00 && c <= 0x9fff) ||
      (c >= 0x3400 && c <= 0x4dbf) ||
      (c >= 0x3040 && c <= 0x30ff) ||
      (c >= 0xac00 && c <= 0xd7af) ||
      (c >= 0xff00 && c <= 0xffef) ||
      (c >= 0x3000 && c <= 0x303f)
    ) {
      cjk++;
    } else {
      other++;
    }
  }
  return cjk + other / 4;
}

export function fmt(speed: number): string {
  return speed >= 100 ? speed.toFixed(0) : speed.toFixed(1);
}

export function fmtMs(ms: number): string {
  return ms < 1000 ? `${Math.round(ms)}ms` : `${(ms / 1000).toFixed(1)}s`;
}
