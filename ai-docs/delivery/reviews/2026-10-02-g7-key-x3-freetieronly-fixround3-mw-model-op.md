# FR3 RE-REVIEW · mw-model-op · G7 Key×3 FreeTierOnly

**Verdict**: **PASS**（本审独立重跑 @ `b1d7b22` · **≠** G7 green · **≠** dual · FR2 PASS **不**顺延）  
**Role**: `mw-model-op`  
**Date**: 2026-10-02 (~21:20 PT)  
**Prove/code SHA**: `b1d7b22b8773c9a826ae5e15e000465be3d61720`  
**Receipt reviewed**: `3d7063f9335398b776a89327c5131382b8629c55`（docs only · **不是** prove SHA）  
**Branch**: `feat/mysql-schema-skeleton`  
**Kind**: offline only · Key env unset · **未**跑 live trio · **未**跑 `pnpm nhp-r4-adv-covered:prove`  

**Pins**: `NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` · `coveredCount=8` · `ms3EqualsR4Closed=false` · **PG-retained** · `r1Closed=false` · `g7SuiteGreen=false`

**Honesty**: 先前「`05cb79f` 与 `3b7ea46` product-tree diff 为空、可把 tipSha 改到 `3b7ea46` 而不重跑」**不成立**。本审 **不**引用 `05cb79f` 或 FR2 在 `3b7ea46` 的 EXIT 作为本 tip 证据。`offlineProvesAtCodeSha` 只认 `b1d7b22`。

---

## Offline proves（本审 @ `b1d7b22` · keys unset）

| CMD | EXIT |
|-----|------|
| `pnpm -C packages/ai-runtime prove:g7-freetier-fix-round2` | **0** |
| `pnpm -C packages/ai-runtime prove:g7-freetier-reprove-guard` | **0** |
| `pnpm -C packages/ai-runtime prove:g7-freetier-reprove-client` | **0** |
| `pnpm -C packages/ai-runtime prove:g7-freetier-reprove-paths` | **0** |
| `pnpm -C packages/ai-runtime prove:context-budget` | **0** |
| `pnpm -C packages/ai-runtime prove:text-endpoint-config` | **0** |
| `pnpm -C apps/web prove:application-start-error` | **0** |
| `node scripts/g7-freetier/redact-gap-evidence.mjs --prove-idempotent` | **0** |
| `pnpm -C apps/worker prove:nhp-r4-adv-covered`（无 PG） | **1** `COVERED_PATH_GAP: real Postgres required… skip ≠ pass — refusing fake-green with in-memory-only.` · **PINNED_EXPECTED_FAIL**（不是 “needs PG”） |
| `pnpm nhp-r4-adv-covered:prove` / live trio | **not_run** |

tsc `pnpm -C packages/ai-runtime exec tsc --noEmit -p .`：两侧 EXIT 2（既有错误）。基线 `685272edf9fd804c419d6389bf38a6b213d2b77d`（`c5decd9` 之父）unique `file:line:TScode` **14** · tip **12** · **new=0**（少 2 条 `test/g7-freetier-reprove-client.proof.ts` TS2552）。

---

## Rulings 1–6

1. **校准 — PASS。** `planContextBudget`（`model-client.ts` 215–224）在 `calibration` / `calibrationBoundModel` 存在时调用 `assertCalibrationModelMatch`。`openAICompatibleClient.complete` 在 fetch 之前（373，dispatch 在 400）走这条路径，不是只走 `planDispatchBudget`。FR2 prove：`g7_calibration_cross_model_forbidden:qwen-plus->qwen3.8-flash` 且 `fetchCalls=0`。  
2. **拦截器 / 硬禁用 — PASS（残留非 blocker）。** `apps/api/src/main.ts:2` 与 `apps/worker/src/main.ts:9` 在 client 构造前 `import '@meetwise/ai-runtime/g7-bootstrap'`，模块加载即 `installG7OutboundInterceptor`。`G7_FREETIER_REPROVE=1` 时覆盖 `globalThis.fetch` / `WebSocket` 与 CJS `http`/`https` request+get。worker `rawFetch`（`main.ts:509`）是调用时的 `(u, init) => fetch(u, init)`，走已 patch 的 global fetch。embed/rerank/asr/tts/asr_stream/tts_stream 在入口 `assertG7UnguardedPathDisabled` **抛** `g7_path_disabled:<capability>`，不是空成功。spy delta 为 0。ESM `node:https` 命名绑定不被 CJS patch，由硬禁用挡住。  
3. **收据 `3d7063f` — PASS。** 六项 `not_run` / `g7_hard_disabled`。trio OPEN 1/1/1 · `g7SuiteGreen=false` · `nail=false`。`actualSpendCny=null`。pins 含 NOT_HA / releaseEvidence=false / claimProductionHA=false / gR45Closed=true / coveredCount=8 / ms3EqualsR4Closed=false / PG-retained / `r1Closed=false` / tech-role opt-out 仅 G7、不计 R1。`tipShaFull` 与 `offlineProvesAtCodeSha` 均为 `b1d7b22b8773c9a826ae5e15e000465be3d61720`，并写明收据 commit **不是** prove SHA。`3b7ea46` / `05cb79f` 只出现在纠错说明里，不当作本次 prove 指针。脱敏 `--prove-idempotent` EXIT 0；非 raw 扫描 **0** 条 `sk-` / `Bearer` / `MODEL_API_KEY=` / private-key。运行时抛的是 `g7_path_disabled:*`，收据 token `g7_hard_disabled` 是映射标签（收据已披露，未改抛错字符串）。  
4. **预留 — PASS。** `git diff --exit-code 82981ff1f5798f44a40b564031d532f94c842e4d HEAD -- packages/ai-runtime/src/g7-freetier-reprove-guard.ts` **空**（exit 0），故 **未**重跑 8 进程 scratch。同文件先前 scratch：call cap 3、8 进程，结束 active=3，无超发。本 SHA prove：失败后 active=0、无 settled call；fallback `reserveFor(toModel)` 先释放再按新模重留；缺价 `g7_price_book_missing`；免费 ¥0 仍受 token cap `2_000_000` 与 call cap `200`（paths prove 打到 TOKEN_CAP / CALL_CAP）。常量：`G7_RUN_COST_CAP_CNY=5`。  
5. **tsc — PASS。** 见上表。**new=0**。  
6. **套套逻辑已删除。** 旧句 `A('dispatch failure returns non-ok (or throws)', res.ok === false || true);` → 新句 `A('dispatch failure returns non-ok (or throws)', res.ok === false);`（`g7-freetier-fix-round2.proof.ts`，commit `b1d7b22`）。本审重跑该断言 PASS，`|| true` 不在文件中。

## Blockers

无（本 FR3 范围内）。

## Non-blockers

- 拦截器在 `G7_FREETIER_REPROVE` 未置 1 时 no-op  
- ESM `httpsRequest` 快照不 patch（硬禁用先抛）  
- 陈锁 5s 后 `g7_cost_ledger_lock_timeout` fail-closed  
- tsc 仍有既有错误（new=0）  
- trio / R1 / nail 仍 OPEN  

## Live 授权条件（**不是**授权 · 本 PASS **≠** dual）

须另与 `mw-e2e-ha` dual，并经用户另批，才谈 live。条件：

1. 新 ledger 路径（勿复用旧 `G7_RUN_COST_LEDGER_PATH`）。  
2. Caps 用代码默认：`G7_RUN_COST_CAP_CNY=5` · `G7_RUN_TOKEN_CAP_DEFAULT=2_000_000` · `G7_RUN_CALL_CAP_DEFAULT=200`，除非收据写明覆盖。  
3. allow-ticket **仅** chat completions（`withG7OutboundAllow` 包住 dispatch）。  
4. embed/rerank/asr/tts/asr_stream/tts_stream 保持硬禁用，收据继续 **not_run**，禁止当 pass。  
5. free-first：`qwen3.8-flash`（`G7_FREE_MODELS`）。  
6. `deepseek-v4-pro` 无 `ALLOW_DEEPSEEK_V4_PRO_TEST=1` 则 `g7_model_banned_without_approval`。  
7. `actualSpendCny` **只**填控制台；usage 行未到则保持 null。禁止把估计或 ¥0 占位写成 actual。  
8. 逐 call `actualModel`。  
9. R1 **OPEN**。`MEETWISE_TECH_ROLE_FAIL_CLOSED=0` 仅 G7 e2e，**不计** R1。  
10. trio EXIT 1/1/1 **≠** G7 green · `releaseEvidence=false` · NOT_HA · PG-retained。  
11. 本 mw-model-op PASS **单独不够** dual。

## Non-claims

Not G7 green · not suite green · not HA · not `releaseEvidence=true` · not R1 closed · not live authorize · not dual · Ban 伪造 spend · Ban 用 `05cb79f` / `3b7ea46` EXIT 冒充本 SHA

---

Verdict: PASS
