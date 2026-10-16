# FIX-ROUND RE-REVIEW · mw-e2e-ha · Line C G7 Key×3 FreeTierOnly（答 post-prove conditions + d70cb58）

**Role**: mw-e2e-ha（对抗证据诚实性 · **不替** mw-model-op 签字 · alone≠dual）  
**Kind**: offline-only fix-round re-review（PASS=证据诚实/分类，**≠G7 绿灯**）  
**Date**: 2026-09-23 ~21:51 PT  
**Reviewed tip**: `2a980c3` / `2a980c37f5e2b945b7c42dcee2994f7eb1503764`  
**Code tip**: `82981ff` / `82981ff1f5798f44a40b564031d532f94c842e4d`  
**Receipt SSOT move**: `1868290` / `1868290e7ea31b5fa864eb9275335e0602927f7d`  
**Prior e2e-ha PASS**: `add7422` + `fee9533`（conditions）  
**Paired model-op（cite only · 不代签）**: `d70cb58` FAIL · tip 上另有 `b623f3b` fix-round FAIL 文件  
**Branch**: `feat/mysql-schema-skeleton` · Repo `/workspace/meetwise` only · Ban Meridian · Ban `.env*` · Ban product edits · Ban live LLM

**Pins（强制）**: `haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` · `coveredCount=8` · `ms3EqualsR4Closed=false` · **PG-retained** · trio **OPEN 1/1/1** · **C-C OPEN** · free≠prod≠perf · alone≠dual

---

## 一句话

侧路 hard-disable + chat reserve-before-dispatch + UI-409 子类 + Disclosure-1 pin + docs 指针 SSOT + offline proves EXIT 0 + tsc **零新增** —— 进步真实；但 **(i) 未提交 raw/redacted 日志使三 GAP 分类不可第三方复核 → BLOCKER**；**(ii) trio 会计无 `not_run(g7_hard_disabled)`**；零 fetch spy / 派发失败后 release 证明不足；SSOT md **错误 full SHA**；校准断言挂在 **未接入 chat 的** `planDispatchBudget`（真实路径 `planContextBudget`）——与 model-op 独立 FAIL 同向，**本审不代签**。→ **FAIL**。

---

## CMD|EXIT（本审实际 · offline）

| CMD | EXIT |
|-----|------|
| `git fetch` + ancestry checks (`2a980c3`/`82981ff`/`1868290`/`c5decd9`/`3424dc1`/`d70cb58`) | 0 · all on `origin/feat/mysql-schema-skeleton` |
| `git worktree add /workspace/mw-rv-2a980c3 2a980c3` | 0 |
| `pnpm install --frozen-lockfile`（worktree） | 0 |
| `pnpm -C packages/ai-runtime prove:g7-freetier-reprove-guard` | **0** |
| `pnpm -C packages/ai-runtime prove:g7-freetier-reprove-client` | **0** |
| `pnpm -C packages/ai-runtime prove:g7-freetier-reprove-paths` | **0** |
| `pnpm -C packages/ai-runtime prove:context-budget` | **0** |
| `pnpm -C packages/ai-runtime prove:text-endpoint-config` | **0** |
| `pnpm -C apps/web prove:application-start-error` | **0** |
| `pnpm eval-harness-matrix-cite:prove` | **0** |
| `pnpm nhp-r4-adv-covered:prove`（`run-e2e-isolated` · 本机 docker 隔离 PG · **未**复用共享 DB） | **1**（隔离 PG **已起**；失败为 L8/C1–C3 honesty pins，**不是**单纯 `database_target_missing`；收据「needs PG / not_run」表述过窄） |
| `pnpm -C apps/web exec tsc --noEmit` @`2a980c3` | **0** |
| `pnpm -C packages/ai-runtime exec tsc --noEmit` @`2a980c3` | **2**（存量 14 raw / 12 unique `file:line:TScode`） |
| 同命令 @`c5decd9^`=`685272e` 基线 | **2**（16 raw / 14 unique） |
| tsc diff tip − 基线 **new errors** | **0**（tip 还消掉 2× client `TS2552`） |
| Live trio | **not_run**（Ban） |
| `git worktree remove` mw-rv-2a980c3 + mw-rv-c5decd9p | 0 |

Porcelain：prove/tsc 前后 worktree 无产品脏文件（tsc 曾触 `tsconfig.tsbuildinfo` · 已丢弃未提交）。

---

## 1) Ancestry / product files since `3424dc1`

| short | full | class | product? |
|-------|------|-------|----------|
| `82981ff` | `82981ff1f5798f44a40b564031d532f94c842e4d` | ai-runtime guard/interceptor/embed/rerank/voice/context-budget/model-client + paths proof；web application-start-error | **YES** |
| `1868290` | `1868290e7ea31b5fa864eb9275335e0602927f7d` | SSOT → `ai-docs/delivery/receipts/g7-key-x3-freetieronly-reprove/`；docs/ 指针 | docs |
| `2a980c3` | `2a980c37f5e2b945b7c42dcee2994f7eb1503764` | tip retarget to 82981ff | docs |
| `c5decd9` 等 | （UC052/UC018 旁路提交） | 非本刀 G7 产品 | 旁路 |

---

## 2) Prior conditions 复查

| Condition | 结果 | Cite |
|-----------|------|------|
| Receipt SSOT 单源 + docs 指针无分歧数据 | **部分** | `docs/delivery/line-c-step3-g7-freetier-live-receipt.json` 仅 `{pointer,ssot}` ✓；**但** SSOT md L47 写 `82981ff86e57186ab65669f315fb90c5f0a74eb0` ≠ git `82981ff1f5798f44a40b564031d532f94c842e4d`（json `tipShaFull` 正确）→ **SSOT 内 md/json 分歧** |
| UI-409 子类入 throw/log + prove | **PASS** | `apps/web/lib/jobs/application-start-error.ts`；`apps/web/app/jobs/actions.ts:31-33` `applicationStartFailureMessage` + `console.error`；prove 钉死四子类 EXIT 0 |
| Disclosure-1 pin | **PASS** | receipt json `disclosure1` + md §Disclosure-1；产品默认仍 fail-closed ON：`apps/worker/src/adaptive-role-resolve.ts:35-38`（unset→`return true`） |
| 措辞：residual CLOSED=quota 403 removed；trio OPEN 1/1/1；C-C OPEN；无「G7 green」 | **PASS** | json `freeTierOnlyResidual.reason` + `notImplied`；`pins.g7SuiteGreen=false`；`trio` exits 1/1/1；`ccConfirmed=false` |

---

## 3) Model-op blockers（本审读源 · 不代签）

### Guard / hard-disable / zero-fetch

- 入口 hard-disable：`assertG7UnguardedPathDisabled` → `g7_path_disabled:*`（`g7-freetier-reprove-guard.ts:413-415`）；挂在 `embedder.ts` / `reranker.ts` / `voice.ts` ASR·TTS / `voice-stream.ts`（含 fake stream）。
- `G7_FREETIER_REPROVE` unset → guard **不启用**（`isG7FreetierReproveEnabled` 仅 `=== '1'`）——测试旗标语义，非生产 fail-open 回归。
- 拦截器：`g7-outbound-interceptor.ts` 仅 patch `fetch`+`WebSocket`；**不**盖 `https.request`（voice 非流式用 node:https）——依赖入口 assert 先抛。
- 安装时机：仅 `model-client` G7 `complete()` 时 `installG7OutboundInterceptor`（`model-client.ts:361`），非 api/worker 启动即装。
- **零 fetch spy**：`g7-freetier-reprove-paths.proof.ts` 断言抛错文案 + 无 ticket fetch 拦截；**没有**「embed/rerank/voice 路径 fetch spy `called===0`」断言。→ **blocker 证明未闭合**。

### Ledger reserve-before-dispatch

- 代码序：`reserveFor(activeModel)` @`model-client.ts:417` **先于** `withG7OutboundAllow(() => dispatchOnce)` @`:421`；错误路径 `releaseG7ReservationOnSharedLedger` @`:426/:461/:486/:491`。
- Prove：paths 有 cap refuse + happy finalize；**无**「reserve → dispatch 失败 → reservation 仍被 release/记账」的 client 级测试。→ **证明缺口**。

### Calibration → `planDispatchBudget`

- `planDispatchBudget` **确实**调用 `assertCalibrationModelMatch`（`context-budget.ts:274-289`）；`estimateContextTokens` 经 `refineEstimate` **消费** `calibration.factor`（`:141`）；`context-budget.proof.ts` 校准后 `renderedInputTokens ≤` 未校准。
- **但是**：生产 chat 走 `planContextBudget`（`model-client.ts:213+` / `:355`），该函数 **无** calibration 模型匹配、也 **不** 调 `planDispatchBudget`。仓库内 `planDispatchBudget(` 调用者 = proofs only。→ 对 d70cb58「接入派发预算路径」**字面挂到错误函数 = 证据洗白风险**（与 tip 上 model-op fix-round 独立 FAIL 同向；**alone≠dual**）。

---

## 4) Rulings 请求

### (i) Raw logs digests-only

- JSON `liveLogDigests[]` **存在**；本机 `meetwise-lineC/.tmp/g7-step3/*` sha256 **与 JSON 一致**（可本地复核，不可第三方复算）。
- `.tmp/` 在根 `.gitignore:15`；**无**已提交 REDACTED 摘录；**无** G7 专用确定性 redaction 脚本产出物（仅有通用 `scripts/e2e-platform/secret-redaction.mjs`）。
- `modelSummary`（25× `qwen3.8-flash`）**已**进 JSON → 模型账本侧可作 **CONDITION**。
- 三 GAP（`PROVENANCE…` / `UI-APPLICATION-START-409` / `REPORT-MAX-ATTEMPTS`）在 fix-round 收据仅列 ID；失败行仍锚未提交 `.tmp`（例如 UI `live-e2e-ui-isolated.log:43` `application_start_failed_409` **无**子类——live 早于 subclass 接线）。**无 redacted 提交 → 三 GAP 分类对第三方不可复核 → BLOCKER**。

### (ii) Hard-disable 须 trio `not_run(g7_hard_disabled)`

- 代码有 `G7_DISABLED_PATHS`，**无** trio/harness 会计步骤把 embed/rerank/voice 记为 `not_run` / `reason: g7_hard_disabled`。
- SSOT 收据 **未**写「这些路径未进入 trio 证据面 / 勿当全能力绿」。
- → **未满足**；计入 blockers（与 model-op shrink-disclosure 同向，不代签）。

---

## Blockers（本审 PASS 前）

1. **(i)** 为每条所引 GAP 失败行 + per-call ledger 提交 **REDACTED** 摘录（或不可变 artifact URL），并附 raw+redacted digests + 确定性 redaction 脚本；digests-only 不够。  
2. **(ii)** trio/harness/收据显式 `not_run`（`g7_hard_disabled`）覆盖 embed/rerank/ASR/TTS/stream；覆盖声明写清 unexercised。  
3. 零-fetch spy：hard-disable 路径断言 `fetch`/`https.request`/`WebSocket` **调用次数=0**。  
4. Client prove：reserve 后 dispatch 失败 → reservation **released/accounted**。  
5. 校准：接到真实 chat 预算路径（`planContextBudget`/`invoke`）**或** G7 下 fail-closed「永不注入 calibration」+ prove（本项与 model-op 对齐描述，**等他们对齐全票**）。  
6. 修正 SSOT md 错误 full SHA（`82981ff1f579…`）。  
7. nhp 收据注记改为「isolated 下 EXIT 1 = honesty pins」，勿写成单纯 needs-PG not_run。

## Conditions / Non-blockers

- UI-409 子类接线 + offline prove EXIT 0（gap 根因仍 OPEN）  
- Disclosure-1 已 pin；生产 fail-closed 默认 ON @`adaptive-role-resolve.ts:35-38`  
- docs/ 指针无数据副本  
- 措辞未宣称 G7 green；trio/C-C OPEN；pins 诚实  
- offline guard/client/paths/context-budget/text-endpoint/application-start-error EXIT 0  
- tsc web 0；ai-runtime **零新增** vs `c5decd9^`  
- FreeTierOnly residual CLOSED **仅**=「quota 403 根因移除」≠ suite/trio/C-C/nail  

## Non-claims

Not suite green · not HA · not `releaseEvidence=true` · not R1 closed · Ban 伪造 spend · Ban 洗 d70cb58 · **不代签** mw-model-op · alone≠dual · free≠prod≠perf

---

## 三行中文摘要

1. 本 fix-round 代码方向对（hard-disable / reserve-before / UI-409 / Disclosure pin），offline 绿且 tsc 无新增，但证据面与证明面未闭合。  
2. 未提交 redacted 日志使三 GAP 不可复核（BLOCKER）；trio 未记 `g7_hard_disabled` not_run；校准挂错路径；SSOT md SHA 笔误。  
3. 裁决 **FAIL**（≠G7 绿判决）；pins 全钉；不代签 model-op。

Verdict: FAIL
