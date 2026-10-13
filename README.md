# pi-token-speed

A [pi](https://github.com/earendil-works/pi-coding-agent) extension that shows the live
token generation speed (tok/s) and time-to-first-token (TTFT) in the TUI statusline.
It publishes under the status key `token-speed`, so `@narumitw/pi-statusline` picks it up
automatically.

Statusline preview:

```
⚡ ~42.3 tok/s · TTFT 820ms · 38.1 tok/s
```

- `~42.3 tok/s` — instantaneous speed while streaming (sliding window, estimated from deltas);
  after the message ends it becomes the message average, using the provider's real
  `usage.output` when available (`~` is dropped when the count is exact)
- `TTFT 820ms` — average time-to-first-token over the last 5 requests
- `38.1 tok/s` — aggregate speed of all messages completed in the last 10 minutes
  (generation time only; idle and tool-execution time are excluded)

## How it works

- Estimates tokens from `text` / `thinking` / `toolcall` deltas (CJK ≈ 1 token/char,
  other text ≈ 4 chars/token) and computes speed over a sliding window starting at the
  first token, so first-packet latency is not counted.
- A fixed-rate timer re-renders while streaming, so the number decays naturally when the
  stream stalls instead of freezing on a stale value.
- If a proxy buffers the whole response and emits it at once (first-to-last delta gap
  shorter than `minElapsedMs`), the speed is meaningless and `--` is shown.
- Statistics are per assistant message, so tool-execution time is naturally excluded.
- Does nothing outside the TUI (print / json / rpc modes).

## Install

```bash
pi install /path/to/pi-token-speed
```

## Configure (optional)

Create `~/.pi/agent/pi-token-speed.json`. Every field is optional; invalid values fall
back to the default. Settings are read on session start.

```json
{
  "windowMs": 2000,
  "renderIntervalMs": 250,
  "minElapsedMs": 300,
  "longWindowMs": 600000,
  "ttftSamples": 5
}
```

| Field | Default | Meaning |
|---|---|---|
| `windowMs` | `2000` | sliding window for the instantaneous speed |
| `renderIntervalMs` | `250` | statusline re-render interval while streaming |
| `minElapsedMs` | `300` | below this time since the first token, no speed is shown |
| `longWindowMs` | `600000` | window for the aggregate speed of completed messages |
| `ttftSamples` | `5` | number of recent requests averaged for TTFT |

## Development

```bash
npm install
npm test
npm run typecheck
```

## Uninstall

```bash
pi remove pi-token-speed
```
