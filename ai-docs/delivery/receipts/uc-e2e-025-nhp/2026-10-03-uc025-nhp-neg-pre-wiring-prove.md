# GAP-UC025-NEG-01 real wiring · pre-wiring prove receipt（接线前留证）

**Column**: NEG (UC-E2E-025 §1.0.1 first NHP column only) · case NHP-025-NEG-01
**Phase**: BEFORE real wiring（刀 B'' coding 落地前 · harness `harness/gap-uc025-neg-real-wiring.md` EXIT 契约前半）
**CMD**: `pnpm uc025:nhp-neg:prove`
**EXIT**: **1**（实际值 · PROCESS_EXIT=1 · 无重试 · 无 wash）
**Code / runner SHA**: `cfc0c28` / `cfc0c2883299433a5ee7a48ef42fe9ff04065b2e`（worktree `line/b2-uc025-wiring`，即 REQUEST docs commit；接线代码 commit `6cbaf04` 尚未存在）
**Ran at**: that SHA（worktree HEAD）
**Date**: 2026-10-03（knife B'' coding+prove 阶段，接线代码落盘之前）

## Proof output（verbatim）

```
UC-E2E-025 NHP-025-NEG-01 stale quiz as interview input (NEG column only)
releaseEvidence=false · haStatus=NOT_HA · claimProductionHA=false · coveredCount=8 · PG-retained · DELETE=503
Not FAULT · Not BOUND · Not ADV · no nail · matrix not edited
inventory acceptsQuiz=false realStaleReject=false resume_quiz_expiry_column=false
contracts_stale_token=false
GAP  GAP-UC025-NEG-01  NHP-025-NEG-01 product reject unwired: interview begin does not take a quiz artifact and does not throw a stale-quiz error
ROW_STILL_GAP  UC-E2E-025 §1.0.1 NEG remains gap. The row is still gap.
NOTE  pnpm uc025:stale-quiz-expiry:prove EXIT 0 is the older mark-red pin and is not this case passing
NOTE  do not read this non-zero as a product refusal. Refusal is not implemented.

CMD=pnpm uc025:nhp-neg:prove EXIT=1
```

pnpm wrapper 另打 `ELIFECYCLE Command failed with exit code 1`（与 EXIT 1 同源）。

## Meaning

EXIT 1 = 未接线标记（诚实），非产品拒绝、非 covered、非 nail。此刻 `acceptsQuiz=false · realStaleReject=false`：interview begin 不收 quiz 工件、不抛 stale-quiz HttpException。与 2026-10-02 `0271ee4` 首次 EXIT 1 receipt 的判定一致。

## Pins

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503

STOP · row stays gap · 等待接线后对偶 receipt（`2026-10-03-uc025-nhp-neg-real-wiring-prove.md`）。
