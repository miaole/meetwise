# FIX-ROUND RE-REVIEW · mw-model-op · G7 Key×3 FreeTierOnly（答 d70cb58 FAIL）

**Verdict**: **FAIL**  
**Role**: `mw-model-op`  
**Date**: 2026-09-23 (~21:50 PT)  
**Reviewed tip**: `2a980c37f5e2b945b7c42dcee2994f7eb1503764`  
**Code tip**: `82981ff1f5798f44a40b564031d532f94c842e4d`  
**Receipt move**: `1868290e7ea31b5fa864eb9275335e0602927f7d`  
**Branch**: `feat/mysql-schema-skeleton`  
**Prior FAIL**: `d70cb58934a5ece8bcd22c18efabfa305c0717cd`  
**Kind**: offline-only re-review · **未重跑** live trio · Key env unset for proves  

**Pins**: `NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` · `coveredCount=8` · `ms3EqualsR4Closed=false` · **PG-retained**

---

## 一句话

侧路 hard-disable + chat reserve-before-dispatch + 并发 call-cap 无超支 + tsc **无新增** —— 进步明显；但 **`assertCalibrationModelMatch` 未挂在真实 invoke/`planContextBudget` 派发路径**（仅 `planDispatchBudget`，生产 chat 不用它），且 **fix-round 收据未诚实披露 trio 因 G7 hard-disable 收缩 embed/rerank/voice** → **FAIL**。

---

## Offline proves（本审重跑 · Key unset）

| CMD | EXIT |
|-----|------|
| `pnpm -C packages/ai-runtime prove:g7-freetier-reprove-guard` | **0** |
| `pnpm -C packages/ai-runtime prove:g7-freetier-reprove-client` | **0** |
| `pnpm -C packages/ai-runtime prove:g7-freetier-reprove-paths` | **0** |
| `pnpm -C packages/ai-runtime prove:context-budget` | **0** |
| `pnpm -C packages/ai-runtime prove:text-endpoint-config` | **0** |
| `pnpm -C apps/web prove:application-start-error` | **0** |
| `pnpm eval-harness-matrix-cite:prove` | **0** |
| `pnpm nhp-r4-adv-covered:prove` | **1**（需 PG / LIVE_PG；**recorded not passed** · ≠ G7 gate） |
| Live trio | **not_run** |

Scratch（未提交）：8 进程并发 `reserveG7CallOnSharedLedger` · `G7_RUN_CALL_CAP=3` → 终态 `active≤3` · **无超支** · `RACE_TEST_OK`。

---

## Rulings (a)–(e)

### (a) 出站是否仍 bypass？

**模型侧路径：硬禁用/聊天护栏基本闭合；拦截器声明不完整。**

| 路径 | 控制 | 零 fetch？ |
|------|------|-----------|
| chat `openAICompatibleClient` | `assertModelAllowed` + `reserveG7*` **先于** dispatch + `withG7OutboundAllow` | 仅 ticket 内 |
| `embedder` / `reranker` / `voice` ASR·TTS / `voice-stream` | 入口 `assertG7UnguardedPathDisabled` → `g7_path_disabled:*` **抛错**（非空结果） | **是**（在 assert 之后才有 fetch/WS） |
| OCR | 经 `openAICompatibleClient` | 同 chat |

**拦截器局限（证据）**：
- 只 patch `globalThis.fetch` + `globalThis.WebSocket`（`g7-outbound-interceptor.ts`）。
- **不**包装 `http`/`https.request`、`undici` 预绑定 fetch、`ws` 包（若未来改用）。
- **`installG7OutboundInterceptor` 未在 api/worker 入口提前安装**——仅 `model-client.ts` 首次 G7 `complete()` 时安装。`apps/worker/src/main.ts:508` `rawFetch=(u,init)=>fetch(u,init)` 为调用时解析；安装前可出站（CRAG web，非模型）；安装后无 ticket 则 fail-closed。
- paths prove **负面测试真实**：无 ticket `fetch` → `g7_unguarded_outbound_fetch_blocked:`（EXIT 0 断言）。

**裁决**：d70cb58 所指模型旁路（embed/rerank/voice）已硬禁；拦截器≠全覆盖。**(a) 模型旁路项通过；拦截器缺口作 residual / 条件**，单独不构成与 (c)(d) 同级的主 FAIL，但 live 授权须要求入口早安装。

### (b) Reserve 竞态？

**通过（¥/call/token 在锁内拒绝；并发 scratch 无超支）。**

- `withG7LedgerLock`：`open(lock,'wx')`；持锁读-改-写整文件；EEXIST 忙等 5s 后 `g7_cost_ledger_lock_timeout`（崩溃残留锁 → **fail-closed**，不超支，但可卡住 run）。
- `reserveG7CallOnSharedLedger`：价格簿缺失拒绝；累加 **settled+reserved+estimate** 对 ¥cap；**token/call cap 对免费模型仍生效**（¥0 不豁免）。
- Fallback：`reserveFor(toModel)` 先 release 再按**新模型**价重 reserve（`model-client.ts`）。
- Scratch：8 workers × 尝试 reserve · callCap=3 → final `active=3` · 无 overshoot。

### (c) Calibration 是否在真实派发路径？

**否 → FAIL 主因之一。**

- `assertCalibrationModelMatch` 挂在 `planDispatchBudget`（`context-budget.ts:273+`），且 G7 下缺 bound/dispatch 会抛。
- **真实 chat 路径** `openAICompatibleClient` / `invoke` 使用 **`planContextBudget`（`model-client.ts`）**，该函数 **无** calibration 模型匹配断言。
- 生产 `apps/worker` / `invoke.ts` **无** `planDispatchBudget(` 调用（仅 proof + domain 注释「应由 runtime 映射」）。
- 因此实现方「REAL dispatch path」主张 **不成立**——证明里绿 ≠ 派发路径承重。

### (d) Hard-disable 是否收缩 trio？是否披露？

**收缩：是。披露：不足 → FAIL。**

- `full.e2e.ts` 含 voice 闭环（键缺失则 `voice_unavailable` review）；OCR 类似；worker qbank `budgetedQbankEmbedding` → `embedder.embed` 在 G7 下会 **抛** `g7_path_disabled:embed`（非静默空向量）。
- Fix-round SSOT 收据（`ai-docs/delivery/receipts/g7-key-x3-freetieronly-reprove/2026-09-23-line-c-step3-g7-freetier-live-receipt.md`）**未**把「G7 下 embed/rerank/voice hard-disable ⇒ trio 这些步 not_run/capability-fail-closed」写成明确 disclosure；易被读成路径能力与非 G7 相同。
- 硬禁是 **loud error**（paths prove），不是假绿空结果——行为诚实，**文档披露不足**。

### (e) tsc 基线 vs tip

| 基线 | SHA | unique `file:line:TScode` |
|------|-----|---------------------------|
| 用户指定 `c5decd9^` | `685272edf9fd804c419d6389bf38a6b213d2b77d` | **14** |
| 代码父 `82981ff^`=`c5decd9` | `c5decd924ca96b2c217e008d0d1b65bbef252179` | **14** |
| Tip | `2a980c37f5e2b945b7c42dcee2994f7eb1503764` | **12** |

- **New vs `c5decd9`：0**  
- **New vs `685272e`（路径归一化后）：0**（tip 还修掉 2 条 `g7-freetier-reprove-client` `RequestInfo` TS2552）  
- CMD：`pnpm -C packages/ai-runtime exec tsc --noEmit -p .` · tip/base 均 EXIT 2（存量错误；**无新增**）

**(e) 通过。**

---

## Blockers（PASS 前 must-fix）

1. **把 `assertCalibrationModelMatch`（或等价）接到真实 chat 预算路径**：`planContextBudget` 与/或 `invoke`/`prepare` 在应用校准因子前；或证明 G7 运行时 **永不**注入 `calibration` 到 chat 预算并加 fail-closed 断言 + prove。  
2. **收据/harness 明确披露** G7 hard-disable 导致 embed/rerank/ASR/TTS/stream **不在 trio 证据面**（not_run / capability fail-closed），Ban 隐含「全能力已练」。  
3. （live 前强烈建议）**api+worker 入口在构造任何 client / RawFetch 之前** `installG7OutboundInterceptor`；文档写明不覆盖 `http`/`https`/`ws` 包。  
4. 修收据 full SHA 笔误：文中曾写 `82981ff86e57…`，实际为 `82981ff1f5798f44a40b564031d532f94c842e4d`。

## Non-blockers

- Chat reserve/finalize/release + fallback 重 reserve  
- 侧路 hard-disable loud + paths/client/guard prove EXIT 0  
- 并发 call-cap scratch 无超支；免费模型 token/call cap 仍生效  
- pins / `r1Closed=false` / `techRoleFailClosedOptOutG7Only=true` / `actualSpendCny=null` 在 SSOT JSON  
- tsc 零新增  
- nhp-r4 EXIT 1 已记录 · ≠本刀 gate  

## Live re-run？

**现在不要。** 待 blockers 1–2（建议含 3）关闭且本角色 offline re-PASS 后，再请授权 live。届时条件草稿（非正式授权）：fresh ledger path；¥5 + token/call caps；allow-ticket 仅 chat；free-first；Ban deepseek-v4-pro；console actualSpend 只写控制台；per-call model；R1 OPEN；TECH_ROLE opt-out 排除 R1；披露 shrink 面。

## Non-claims

Not suite green · not HA · not `releaseEvidence=true` · not R1 closed · Dual ≠ authorize live · Ban 伪造 spend · Ban 洗 d70cb58

---

Verdict: FAIL
