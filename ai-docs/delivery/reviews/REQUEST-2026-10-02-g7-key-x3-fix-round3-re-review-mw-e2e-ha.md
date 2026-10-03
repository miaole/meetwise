# FIX-ROUND3 RE-REVIEW · mw-e2e-ha · Line C G7 Key×3（答 `952f0fd`）

- reviewer: mw-e2e-ha（不代签 mw-model-op）
- reviewedAt: 2026-10-02 21:12 PT
- proveSha / codeUnderTest: `b1d7b22b8773c9a826ae5e15e000465be3d61720`（`b1d7b22`）
- receiptCommit: `3d7063f9335398b776a89327c5131382b8629c55`（`3d7063f`）
- priorFail: `952f0fdb5c778652f28b9d4d507928ab0049f66e`（`REQUEST-2026-09-23-g7-key-x3-fix-round2-re-review-mw-e2e-ha.md`）
- runner: worktree `/workspace/mw-rv-g7fr3` detached @ `b1d7b22` · `pnpm install --frozen-lockfile` · 未起 docker/postgres · 未跑 live e2e / nhp · 未读 `.env*` · 未触 Meridian
- 本审离线 EXIT 全部记在 runner SHA `b1d7b22`。回执 `3d7063f` 的 tip/offline 指针也指向该 SHA（receipt commit ≠ prove SHA，已写明）。

## 一句话

上一轮 blocker（假 content-identical + 把 run-at `05cb79f` 的 EXIT 指到 `3b7ea46`）在 `3d7063f` 已撤回并改指 `b1d7b22`；`|| true`  tautology 在 `b1d7b22` 已删。本审于 `b1d7b22` 重跑离线 prove 均为 EXIT 0（nhp 未跑，仍 PINNED）。residual CLOSED 仅 quota-403。trio OPEN 1/1/1。C-C OPEN。不是 G7 green。

## Ancestry / on-origin

| SHA | full | on origin/feat/mysql-schema-skeleton | note |
|---|---|---|---|
| `b1d7b22` | `b1d7b22b8773c9a826ae5e15e000465be3d61720` | yes | Prove SHA。只改 `g7-freetier-fix-round2.proof.ts`（去 tautology） |
| `3d7063f` | `3d7063f9335398b776a89327c5131382b8629c55` | yes | 回执 JSON/MD。`b1d7b22` 的后代；只改 tip/offline 指针 + honesty 字段 |
| `952f0fd` | `952f0fdb5c778652f28b9d4d507928ab0049f66e` | yes | 本审上一轮 FAIL |
| `3b7ea46` | `3b7ea46e7eecccabbf40e58a880e97e61877eb0f` | yes | 旧 FR2 代码尖（已被诚实撤回） |
| `05cb79f` | `05cb79f6d687a693d8b6a44d20d7cf1e25cfaa5d` | **no** | 旧 run-at；仍非 `3b7ea46`/`b1d7b22` 祖先 |
| `6045a4b` | `6045a4b0c96871c9650a24b11621d2f896da312d` | yes | 上一轮假 retarget（content-identical） |

`git merge-base --is-ancestor b1d7b22 3d7063f` = yes。`3b7ea46..b1d7b22` 产品改动仅 `packages/ai-runtime/test/g7-freetier-fix-round2.proof.ts`（其余为 docs/reviews）。`05cb79f..3b7ea46` 排除 docs 仍 7 产品文件（与 FAIL 轮一致）；本轮回执不再声称 identical。

## Ledger SHA 裁定（原 BLOCKER）

回执 `3d7063f`：

- `tipShaFull` / `tipShaShort` = `b1d7b22…` / `b1d7b22`
- `offlineProvesAtCodeSha` = `b1d7b22b8773c9a826ae5e15e000465be3d61720`
- `proveTipHonesty.ranAtCodeSha` = 同上；`receiptCommitIsNotProveSha: true`
- `integration[]` / `offlineProves[]` 无单独内嵌旧 SHA；由上列 tip/offline 字段统一归属
- 文中出现的 `05cb79f` / `3b7ea46` 仅在撤回叙事（`rebaseNote` / `proveTipHonesty` / MD「Prove-tip honesty」），**不是**当前 EXIT 的归属

**裁定：ledger 归因 blocker 已关。** 无「`offlineProvesAtCodeSha=3b7ea46` 而日志 body 写 `05cb79f`」；也无把 `b1d7b22` 指针配上 `05cb79f` 日志。新鲜 EXIT 0 在 `3b7ea46` 不能升格旧日志——本轮也不再那么主张。

## content-identical 裁定

- `6045a4b` 旧 `rebaseNote`「content-identical code tree」在 `3d7063f` **已删除**
- 新 `rebaseNote` / MD 明确写：`05cb79f vs 3b7ea46 is not the same product tree`；列出 7 文件 +201/−26
- 全回执 JSON+MD：`content-identical` / `content identical` 字符串匹配数 = **0**（非「留着当活主张」）

**裁定：假 content-identical 已撤回。**

## Tautology 裁定

`b1d7b22` diff：

- 删：`A('…', res.ok === false || true)`
- 换：`A('dispatch failure returns non-ok (or throws)', res.ok === false)`（可失败；throw 亦非 pass）

`git grep '|| true' b1d7b22 -- …/g7-freetier-fix-round2.proof.ts` 空。本审重跑该 prove：该行 PASS，且 `fetchCalls=0` / release `active==0,calls==0`。

**裁定：tautology 已去。**

## CMD|EXIT（本审 · offline @ `b1d7b22`）

| CMD | EXIT | note |
|---|---:|---|
| `pnpm install --frozen-lockfile` | 0 | worktree `b1d7b22` |
| `pnpm -C packages/ai-runtime prove:g7-freetier-fix-round2` | 0 | 含 `res.ok === false`；factor 535→300；dispatch release |
| `pnpm -C packages/ai-runtime prove:g7-freetier-reprove-guard` | 0 | |
| `pnpm -C packages/ai-runtime prove:g7-freetier-reprove-client` | 0 | |
| `pnpm -C packages/ai-runtime prove:g7-freetier-reprove-paths` | 0 | 抛 `g7_path_disabled:*` |
| `pnpm -C packages/ai-runtime prove:context-budget` | 0 | |
| `pnpm -C packages/ai-runtime prove:text-endpoint-config` | 0 | |
| `pnpm -C apps/web prove:application-start-error` | 0 | |
| `node scripts/eval-harness-matrix-cite.proof.mjs` | 0 | 静态 · 无 PG |
| `node scripts/g7-freetier/redact-gap-evidence.mjs --prove-idempotent` | 0 | gap raw 在 `b1d7b22` 树（自 `77588e9` 起）；两跑摘要一致 |
| `pnpm -C apps/worker prove:nhp-r4-adv-covered` | **未跑** | 仍需 PG；回执保持 `PINNED_EXPECTED_FAIL` / `COVERED_PATH_GAP`，未洗成 0 |
| `pnpm exec tsc --noEmit -p packages/ai-runtime/tsconfig.json` | 2 | `error TS` **14** 条；无一落在 FR2 文件。未另建基线，不声称 new=0 |
| `pnpm exec tsc --noEmit -p apps/web/tsconfig.json` | 0 | 0 条 `error TS` |

## Wording / pins

- residual CLOSED = **仅** quota-403 根因移除（`freeTierOnlyResidual.reason`）；≠ G7 suite green
- trio OPEN **1/1/1**（isolated / ui / perf 皆 exit 1）
- C-C OPEN（`ccConfirmed: false`）
- 无 G7 green（`g7SuiteGreen: false` · `nail: false`）
- Pins：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503 · free≠prod qwen-plus≠perf · alone≠dual
- Disclosure-1 仍钉 `MEETWISE_TECH_ROLE_FAIL_CLOSED=0`（不计 R1）

## Conditions（非 FAIL 因）

1. Runtime 抛 `g7_path_disabled:<capability>`；回执 not_run 行仍写 mapped label `g7_hard_disabled`（`g7HardDisabledEmission.emitted=false`）— token 不一致已披露，未改 outbound 契约。
2. trio / C-C / Disclosure-1 仍 OPEN / 钉住。
3. PASS ≠ G7 green；本审不升格 live / nail。

## Blockers

无。原 ledger 归因 + 假 content-identical + tautology 三项均已关；本审离线 prove 与回执声明的 prove SHA 一致且 EXIT 诚实。

## 三行中文摘要

1. 回执把 offline/tip 改指真正跑过的 `b1d7b22`，撤回假 content-identical；`|| true` 已删。
2. 本审在 `b1d7b22` 离线重跑（含 redact 幂等）EXIT 0；nhp 未跑、仍 PINNED。
3. residual 只关 quota-403；trio/C-C 仍 OPEN；这不是 G7 green。

Verdict: PASS
