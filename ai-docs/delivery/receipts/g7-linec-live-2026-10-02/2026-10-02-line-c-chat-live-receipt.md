# Line C LIVE — G7 allow-ticket chat-only

**Code SHA actually run**: `542c0646d1635b0a3a28c5d821ad50bc6ea625a3` (`542c064`)
**Porcelain at run**: clean
**This receipt commit is not the code SHA.**

## CMD|EXIT

| CMD | EXIT |
|-----|------|
| `packages/ai-runtime/node_modules/.bin/tsx /tmp/g7-linec-live.mts` (cwd `packages/ai-runtime`; env names only, no secrets) | **0** |

Window: 2026-10-02 21:27:52–21:27:55 PT.

Existing path: `openAICompatibleClient().complete` under `G7_FREETIER_REPROVE=1` with `withG7OutboundAllow` around chat completions only. No runner/config change was required; caps and hard-disable are already on this SHA. `pnpm e2e:isolated` / ui / performance were **not** re-run (worker would enter embed/rerank). Trio stays **1/1/1**.

## Model

- Chat call that happened: `actualModel=qwen3.8-flash` (provider field). in=190 out=37. evidenceClass=`free_quota_wiring_only`. callId `d03cf49a-c513-4412-93b8-1c48ab90d21a`. chat fetch delta=1.
- `deepseek-v4-pro`: `ALLOW_DEEPSEEK_V4_PRO_TEST` **unset**. Guard and client both `g7_model_banned_without_approval:deepseek-v4-pro`. fetch delta=0. Not bypassed.
- Free-first id is the repo id `qwen3.8-flash`. Paid fallback off (`G7_PAID_FALLBACK_ENABLED=0`).

## Spend

- New ledger: `.tmp/g7-ledgers/2026-10-02-linec-live-chat.ndjson` (gitignored). Not the 2026-09-23 ledger.
- Caps: ¥5 / 2_000_000 tokens / 200 calls. Observed 1 settled call, 227 tokens. Stopped before exceeding.
- `estimatedCostCny=0` is the free-quota price-book estimate only.
- **actualSpendCny=null**. Console was not read. No invented spend. No reused prior spend figures.
- keyFingerprint=`d26808ef` only. Key loaded from the existing secrets loader. Value not recorded.

## not_run (not called)

embed, rerank, asr, tts, asr_stream, tts_stream — `not_run` / `g7_hard_disabled`. Not pass.

## Pins

NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · covered not written · PG-retained · public DELETE=503 · R1 OPEN · `MEETWISE_TECH_ROLE_FAIL_CLOSED` unset this run · TECH_ROLE=0 is not R1 · trio OPEN 1/1/1 · g7SuiteGreen=false · nail=false · not G7 green.

## STOP

Post-live dual required: mw-model-op + mw-e2e-ha. No self-approve. No SSOT nail (matrix, backlog, checklist untouched).
