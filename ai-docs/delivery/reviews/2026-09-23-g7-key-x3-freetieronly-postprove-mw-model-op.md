# POST-PROVE · mw-model-op · G7 Key×3 FreeTierOnly re-prove（Line C）

**Verdict**: **FAIL**  
**Role**: `mw-model-op`（独立 · Ban 实现方自批）  
**Date**: 2026-09-23 (~21:25 PT)  
**Reviewed tip**: `5b2243eb32c65a25a11ea06e5941db1c02e3616f`（receipt tip；含 live coding tip `3424dc19e69cbe96b0a69d57743f4be4ed1988ba`）  
**Branch**: `feat/mysql-schema-skeleton`  
**Live window (cite receipt)**: 2026-09-23 21:11–21:20 PT  
**Kind**: post-prove dual · **offline proves only** · 本审 **未重跑** live trio / 未触碰计费网络  

**Pins**: `NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` · `coveredCount=8` · `ms3EqualsR4Closed=false` · **PG-retained**

---

## 一句话

文本路径 `openAICompatibleClient` 在 `G7_FREETIER_REPROVE=1` 下已接线 guard/ledger/actualModel（offline prove EXIT 0；live 收据称无 FreeTierOnly 403、25×`qwen3.8-flash`）。但 **embed / rerank / ASR / TTS / stream** 等真实出站路径 **绕过** `model-client.ts` guard；共享 ledger **先调用后记账** 可在付费路径上 TOCTOU 超支；`assertCalibrationModelMatch` **未**接入 `planDispatchBudget`。按硬规则 → **FAIL**。

---

## SHAs（full）

| short | full | 角色 |
|-------|------|------|
| `994e83a` | `994e83a0998a35a3d75a5dade91a62244fe43f52` | guard + offline NHP |
| `cc8050d` | `cc8050d5eff3668b5253b386a43dc446462b1313` | model-client / timeout / invoke + client proof |
| `7219f8f` | `7219f8f769dad6d4c448ed41c59f0a40e7f42980` | isolated parent shared ledger |
| `fc8429c` | `fc8429cb554bcc93799979f5f765d931e63c0c74` | run-e2e + live-capability-env free-first |
| `3424dc1` | `3424dc19e69cbe96b0a69d57743f4be4ed1988ba` | TECH_ROLE e2e opt-out + live tip |
| `5b2243e` | `5b2243eb32c65a25a11ea06e5941db1c02e3616f` | **本审 tip** · docs receipt md+json |

（审阅时 `origin/feat/mysql-schema-skeleton` 已有后续 UC018 commits；G7 证据 tip 仍为 `5b2243e`。）

---

## Offline proves（本审重跑 · Key unset）

| CMD | EXIT | 注 |
|-----|------|-----|
| `pnpm -C packages/ai-runtime prove:g7-freetier-reprove-guard` | **0** | 纯离线 NHP |
| `pnpm -C packages/ai-runtime prove:g7-freetier-reprove-client` | **0** | mocked `fetch` · 无 live |
| `pnpm eval-harness-matrix-cite:prove` | **0** | 矩阵 cite · ≠ G7 关 |
| `pnpm -C packages/ai-runtime prove:context-budget` | **0** | 校准/预算静态 |
| `pnpm -C packages/ai-runtime prove:usage-calibration-reconciler` | **1** | `database_target_missing` · **not_run as DB-isolated**（需容器，非本审范围） |
| `pnpm model-op00-usage-reconciler:prove` / `model-invocation-reconcile:prove` | **not_run** | 走 `run-e2e-isolated` · 需本地栈；非 live-model 但超出本刀 offline 面 |
| Live trio | **not_run** | 本审不重跑；cite implementer EXIT 1/1/1 @`3424dc1` |

---

## Rulings 1–5

### 1. Guard 是否覆盖 EVERY 真实 invoke？

**否 → FAIL 主因。**

| 路径 | 出站 | G7 guard？ |
|------|------|------------|
| `openAICompatibleClient.complete`（`model-client.ts:364` 预检 · `:404–417` actualModel+ledger · `:431–448` fallback） | `/chat/completions` | **是**（`G7_FREETIER_REPROVE=1`） |
| OCR `resume-ocr` → 注入的 `ModelClient`（api `ocr-model-client.ts` → `openAICompatibleClient`） | 同上 | **是**（经同一 client） |
| `dashscopeEmbedder`（`embedder.ts:40` `/embeddings`）· worker `main.ts` 接线 | 直 fetch | **否** |
| `dashscopeReranker`（`reranker.ts:28`） | 直 fetch | **否** |
| `dashscopeAsr` / `dashscopeTts`（`voice.ts:433`/`476`） | 直 fetch | **否** |
| `dashscopeStreamingAsr` / `dashscopeStreamingTts`（`voice-stream.ts`） | WebSocket/stream | **否** |

Live 收据称 OCR/voice skipped；但 **embed 仍可在 worker 运行且不入 G7 ledger**。价格簿未声明 `qwen-tts` / `gte-rerank-v2` / `cosyvoice-v1` / `qwen-audio-turbo-latest`——绕过路径可静默计费。

### 2. NDJSON ledger 健全性？

**部分 · 付费路径可超支；免费路径 cap 形同虚设。**

- **锁**：`*.lock` + `open(...,'wx')` 串行化写；整文件重写（非 O_APPEND）。
- **TOCTOU / 先派发后记账**：`model-client` 成功响应后才 `recordG7CallToSharedLedger`；两并发付费调用可同时派发后再有一方 `g7_cost_cap_exceeded`——**供应商侧已花费**。
- **崩溃**：调用成功、写盘前崩溃 → 漏记；写盘中崩溃可能截断文件（无 fsync/原子 rename）。
- **重置**：父进程 `run-e2e-isolated.mjs` / `run-e2e.mjs` 新建 `.tmp/g7-ledgers/g7-<pid>-<ts>.ndjson`；无显式删除旧文件（新 path 即隔离）。
- **不可读**：缺 path → fail-closed；坏 JSON → `JSON.parse` 抛错（非静默 ¥0）。
- **价格簿**：`qwen3.8-*` 标 `freeQuota` · estimate **¥0** → 免费跑永远打不满 ¥5；未知模型在 **已 guard** 路径 `g7_price_book_missing` fail-closed；**未 guard** 路径不适用。
- **校准**：`assertCalibrationModelMatch` 仅 guard 模块 + offline proof；**未**接入 `planDispatchBudget` / `contextBudgetPolicyFromCostPolicy` / invoke——跨模因子复用风险未在派发路径封死。

### 3. Disclosure · `MEETWISE_TECH_ROLE_FAIL_CLOSED=0`

- **何处**：`scripts/e2e-live-capability-env.mjs:39–40`（仅 `G7_FREETIER_REPROVE=1` 且 flag unset）。
- **门控**：`adaptive-role-resolve.ts`——产品默认 ON（unset→fail-closed）；`0` 允许 legacy「技术岗」以免 `adaptive_role_route_missing` 在模型调用前挡 start。
- **产品默认**：仍为 fail-closed ON（`worker.env.example` / R1 product-close）。
- **裁决**：**已 scoped + receipt 披露 + 明示 ≠ R1** → **不单独构成 FAIL**；但 **绝不计入 R1/R2 关闭证据**（若未来洗入 R1 → FAIL）。列为 non-blocker / 纪律钉。

### 4. FreeTierOnly residual？

**精确裁决**：  
**FreeTierOnly（403 `AllocationQuota.FreeTierOnly` / 文本配额挡死）billing residual：在文本 chat 路径证据上可标 CLOSED**（live 收据：无 403、25×`qwen3.8-flash`、无 fallback、有 actualModel 聚合）。  
**冻结 trio / 家族绿 / R1：仍 OPEN**（EXIT 1/1/1 · 三新 gap · TECH_ROLE opt-out ≠ R1 · C-C=false）。  
因本审 FAIL（guard 覆盖不全），**不得**把「FreeTierOnly CLOSED」洗成 suite/G7 总绿。

### 5. Receipt（md+json）？

| 检查 | 结果 |
|------|------|
| per-call / 聚合 actualModel | md 表 + json `modelSummary`（25× qwen3.8-flash · tokens） |
| timestamps | liveWindow PT/UTC 在 |
| redaction | 未见 key 值；仅 `keyFingerprint` 8 hex（cite 已有） |
| `actualSpendCny` | **null**（Ban 伪造 · 控制台未读） |
| 三新 gap | 已登记 |
| pins 字段 | md 叙述含 `releaseEvidence=false` / ≠HA；json **无**完整 pins map——本审 receipt 重钉 pins |
| 诚实性 | trio 仍红 · C-C NO · free≠生产证据 — OK |

---

## Blockers（must-fix before PASS / before trusting another live）

1. **把 G7 guard+ledger 接到所有真实出站**：至少 `embedder.ts` / `reranker.ts` / `voice.ts` / `voice-stream.ts`（或 G7 下强制 disable + fail-closed + receipt `skip_prereq`，且证明零 fetch）。  
2. **Ledger 先预留后派发**（或等价）：读余额→预占→调用→结算；禁「先花再拒」；崩溃/并发证明。  
3. **价格簿对齐**未声明付费能力模型（tts/rerank/asr/…）或显式 skip。  
4. **`assertCalibrationModelMatch` 接入**派发预算路径（或证明 G7 永不挂校准因子）。  
5. 修复后 **offline client/guard prove 扩覆盖** +（授权后）再考虑 live trio。  
6. TECH_ROLE opt-out **永不得**写入 R1 关闭证据。

## Non-blockers

- 文本路径 guard/actualModel/fallback 原因 offline prove EXIT 0  
- Parent 分配共享 ledger path（api+worker 同 path）意图正确  
- FreeTierOnly 403 在文本路径上似已消失（cite live；本审未复跑）  
- 三新非计费 gap 诚实登记  
- `actualSpendCny=null` · Ban 伪造  
- TECH_ROLE 披露且排除 R1（纪律遵守前提下）  
- Pins / PG-retained / residual trio OPEN 诚实  

## Live trio 是否需要本审重跑？

**否（现在）**。应在 blockers 1–4 修复并 offline PASS 后再请授权 live。当前重跑只会重复「文本路径绿、旁路未护、trio 仍红」。

## Non-claims

Not suite green · not HA · not `releaseEvidence=true` · not R1 closed · Dual ≠ coding authorize · free-model ≠ qwen-plus/perf evidence · actual spend unavailable（无控制台）· Ban 伪造

---

Verdict: FAIL
