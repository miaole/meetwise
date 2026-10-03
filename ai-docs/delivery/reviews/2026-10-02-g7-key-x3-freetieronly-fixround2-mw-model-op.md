# FR2 RE-REVIEW · mw-model-op · G7 Key×3 FreeTierOnly（答 b623f3b FAIL）

**Verdict**: **PASS**  
**Role**: `mw-model-op`  
**Date**: 2026-10-02 (~21:05 PT)  
**Code tip**: `3b7ea46e7eecccabbf40e58a880e97e61877eb0f`  
**Receipt tip reviewed**: `315870e502210ac54a4068ac33aeb12721a64766`（md sync；JSON tipSha 由 `6045a4b0c96871c9650a24b11621d2f896da312d` 钉到 `3b7ea46`）  
**Prove-record SHA**: `05cb79f6d687a693d8b6a44d20d7cf1e25cfaa5d`（**非** `3b7ea46` 祖先）  
**Branch**: `feat/mysql-schema-skeleton`  
**Prior FAIL**: `b623f3bfc6543094e0bfa0b55fb122ebc1daba20`  
**Kind**: offline only · 本审 **未**跑 live trio · Key env unset  

**Pins**: `NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` · `coveredCount=8` · `ms3EqualsR4Closed=false` · **PG-retained** · `r1Closed=false` · TECH_ROLE opt-out ≠ R1

---

## 一句话

b623f3b 的两条 blocker 已闭合：`assertCalibrationModelMatch` 在真实 `planContextBudget`（chat complete/prepare）上拒绝跨模校准；embed/rerank/asr/tts/streams 硬禁用且收据标 **not_run**。本审在 `3b7ea46` 重跑离线 prove 全 EXIT 0；tsc 相对 `685272e` **new=0**。**PASS**（≠ G7 green · trio 仍 1/1/1 · nail=false）。

---

## 05cb79f → 3b7ea46 范围 diff

| 范围 | 结果 |
|------|------|
| `packages/ai-runtime` | **空** |
| `apps/api` | **空** |
| `apps/worker/src/main.ts` / `apps/api/src/main.ts` | **空** |
| `scripts/g7-freetier` + `**/g7*` | **空** |
| 更宽的 `scripts/` | **非空**：`run-e2e-isolated.mjs`（pre-prove PG re-attest）、UC018 backfill、与 G7 无关；`apps/worker/src/checkpoint-principal.ts` 仅类型断言 |

**裁决**：声称的 product-tree（ai-runtime / api / worker main / g7-freetier）**空** → `05cb79f` 上记录的 G7 离线 EXIT **可适用于** `3b7ea46`（rebase 等价，不是第二次官方跑）。本审仍在 `3b7ea46` **重跑**下表，作为独立证据。`scripts/` 差异不影响这些 tsx prove。

---

## Offline proves（本审 @ `3b7ea46` · Key unset）

| CMD | EXIT |
|-----|------|
| `pnpm -C packages/ai-runtime prove:g7-freetier-fix-round2` | **0** |
| `pnpm -C packages/ai-runtime prove:g7-freetier-reprove-guard` | **0** |
| `pnpm -C packages/ai-runtime prove:g7-freetier-reprove-client` | **0** |
| `pnpm -C packages/ai-runtime prove:g7-freetier-reprove-paths` | **0** |
| `pnpm -C packages/ai-runtime prove:context-budget` | **0** |
| `pnpm -C packages/ai-runtime prove:text-endpoint-config` | **0** |
| `pnpm -C apps/web prove:application-start-error` | **0** |
| `node scripts/g7-freetier/redact-gap-evidence.mjs --prove-idempotent`（材料取自 `315870e`） | **0**（两次 sha 相同） |
| `pnpm -C apps/worker prove:nhp-r4-adv-covered`（无 PG） | **1** 打印 `COVERED_PATH_GAP: real Postgres required… skip ≠ pass` · **PINNED_EXPECTED_FAIL**（不是「needs PG」洗绿） |
| `pnpm nhp-r4-adv-covered:prove`（会起 PG） | **not_run** |
| Live trio | **not_run** |

tsc：`pnpm -C packages/ai-runtime exec tsc --noEmit -p .` · 基线 `685272e`（`c5decd9` 之父）unique errors **14** · tip **12** · **new=0**（少 2 条旧 `RequestInfo` TS2552）。收据写 after=14 略旧，但 new=0 成立。

---

## Rulings 1–7

1. **校准**：`openAICompatibleClient` prepare/complete 调 `planContextBudget`（`model-client.ts` ~215）。有 `calibration`/`calibrationBoundModel` 时 `assertCalibrationModelMatch(bound, policy.model)`；跨模抛 `g7_calibration_cross_model_forbidden`。FR2 prove：mismatch **零 fetch**。`planDispatchBudget` 不再是唯一调用点。  
2. **拦截器**：`apps/api/src/main.ts:2` 与 `apps/worker/src/main.ts:9` `import '@meetwise/ai-runtime/g7-bootstrap'`（side-effect，早于 client）。覆盖 `globalThis.fetch`/`WebSocket`、CJS `http`/`https` request+get、可解析时的 `ws`。`voice.ts` 的 ESM `httpsRequest` 是 load snapshot，**先** `assertG7UnguardedPathDisabled`。worker `rawFetch`（~509）调用时走已 patch 的 `fetch`。负面：无 ticket 的 http/https.request → `g7_unguarded_outbound_*_blocked`。  
3. **not_run**：收据 md + JSON `g7HardDisabledTrioSteps` 六项 `not_run`/`g7_hard_disabled`。硬禁用 **抛错**；spy 计数 delta=0（零 fetch）。  
4. **脱敏**：`--prove-idempotent` PASS（同输入同 sha）。非 raw 收据/redacted **无** sk-/Bearer/MODEL_API_KEY= 命中。`actualSpendCny=null`（console 读 0 但 usage 行未到，未写成 0）。  
5. **预留**：`g7-freetier-reprove-guard.ts` 相对 `82981ff` **diff 空**。FR2 prove：失败后 active reservation=0。Fallback 仍 `reserveFor(toModel)` 按新模估价。缺价拒绝。免费 ¥0 仍受 token cap **2_000_000**、call cap **200**、¥ cap **5**（代码常量）。8 进程竞态：**沿用**前次 scratch（同文件未改）· active≤cap · 本轮未再跑。  
6. **Prove/tsc**：上表。NHP 文案与脚本 `console.error` **一致**（COVERED_PATH_GAP，拒 in-memory 假绿）。  
7. **05cb79f 披露**：scoped product-tree **空** → 旧 EXIT 可适用；本审已在 `3b7ea46` 重跑，不依赖「只信旧数字」。

---

## Blockers

无（本 FR2 范围内）。

## Non-blockers

- 更宽 `scripts/` 与 checkpoint 类型补丁（非 G7 行为）  
- 收据 tsc after 写成 14，实测 tip 12（new 仍 0）  
- ESM `node:https` 命名绑定不被 CJS patch（由 hard-disable 挡住）  
- `ws` 未安装时 catch 跳过（stream 路径已 hard-disable）  
- trio / R1 / C-C / nail 仍 OPEN  

## Live 授权条件（非正式授权 · 须用户另批）

1. 新 ledger 路径（`.tmp/g7-ledgers/g7-<pid>-<ts>.ndjson` 或显式 `G7_RUN_COST_LEDGER_PATH`），勿复用旧文件。  
2. Caps 用代码默认：`G7_RUN_COST_CAP_CNY=5` · `G7_RUN_TOKEN_CAP_DEFAULT=2_000_000` · `G7_RUN_CALL_CAP_DEFAULT=200`，除非收据写明覆盖。  
3. allow-ticket **仅** chat completions（`withG7OutboundAllow` 包住 dispatch）。  
4. embed/rerank/asr/tts/streams 保持 hard-disable，收据继续 **not_run**，禁止当 pass。  
5. free-first：`qwen3.8-flash`（或 `G7_FREE_*` 在 `G7_FREE_MODELS` 内）。  
6. `deepseek-v4-pro` 无 `ALLOW_DEEPSEEK_V4_PRO_TEST=1` 则代码拒绝。  
7. 跑完后读控制台；`actualSpendCny` **只**填控制台，禁把估计或 ¥0 占位写成 actual（usage 行未到则保持 null）。  
8. receipt 逐 call `actualModel`。  
9. R1 **OPEN**；`MEETWISE_TECH_ROLE_FAIL_CLOSED=0` 仅 G7 e2e，**不计** R1。  
10. trio EXIT 1/1/1 **≠** G7 green · `releaseEvidence=false` · NOT_HA · PG-retained。

## Non-claims

Not suite green · not HA · not `releaseEvidence=true` · not R1 closed · Dual ≠ live authorize · Ban 伪造 spend

---

Verdict: PASS
