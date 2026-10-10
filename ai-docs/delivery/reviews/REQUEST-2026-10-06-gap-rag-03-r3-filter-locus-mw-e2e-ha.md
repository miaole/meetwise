# REQUEST — **GAP-RAG-03 · R3 filter-locus ADR + Top-K hard-filter prove** · pre-exec · mw-e2e-ha

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub rewrite **×3 re-PRE** · Ban self-approve · alone ≠ dual · 不代签 peer `mw-rag-route`）
**Rewrite ×3**: **supersedes REQUEST ×2 `c515a8c`**（`c515a8c08aeb904a2579f0d1d38ec4e93aa183c9` · itself superseded `c71d354` → `4c93dc5`）· cites mw-rag-route Re-PRE2 PASS-with-Cond **`4e16dfa`**（`4e16dfa8e9b1459b8401514c9d8252d1e7256c87`）**Cond-1（BLOCKING pre-AUTHORIZE）+ Cond-2..6 addressed** · prior FAIL `0e5c5ed` / `5f8096a` retained · R1–R6 / R3 CRITICAL pins retained · Ban coding · GAP-RAG-03 OPEN
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Expert**: `mw-e2e-ha`
**Peer**: `mw-rag-route`（独立签 · alone ≠ dual）
**Knife**: `harness/gap-rag-03-r3-filter-locus.md` · slice `gap-rag-03-r3-filter-locus.slice.md`
**Parent tip**: origin `feat/mysql-schema-skeleton` @ `20da721`（anchors re-verified · AN-PERF-TEAR sibling **Ban touch** ·Ban touch AN-PRIV-EXT / AN-MOP-Q45 / AN-CIMG-EA / AN-PERF-TEAR files beyond cite）
**Prior REQUESTs**: `c515a8c08aeb904a2579f0d1d38ec4e93aa183c9`（×2 · superseded）· `c71d3547744900d4b6a70e64402a6c9baa40f6f6`（superseded）· `4c93dc5bbd1d4ba56de9c0547fd944b52f72926d`（superseded）
**Date**: 2026-10-06
**Line**: **AN-RAG-R3**（wave AN · re-PRE ×3）

## Pins（retained · 本 stub 不改）

| Pin | Value |
|-----|-------|
| `haStatus` | **NOT_HA** |
| `releaseEvidence` | **false** |
| `claimProductionHA` | **false** |
| `gR45Closed` | **true** |
| `coveredCount` | **8** |
| `ms3EqualsR4Closed` | **false** |
| Stack | **PG-retained** |
| Public DELETE | **503**（stays） |

## 请审什么（mw-e2e-ha · re-PRE ×3 · 仅 `4e16dfa` Cond-1..6 + 保留项未回退）

Line AN-RAG-R3 · GAP-RAG-03 R3 filter-locus。本 stub = **re-PRE rewrite ×3**（supersedes `c515a8c` · cites Re-PRE2 `4e16dfa` 条件）。harness = `harness/gap-rag-03-r3-filter-locus.md`（「Rewrite ×3 note」表 + §3 / §4.1 / §4.2 / §4.3 / §4.4 / §5 / §6）。请审：

1. **Cond-1（BLOCKING · 协调方：AUTHORIZE 前不修 = FAIL）`R3-LEGACY-STATIC-UNREACHABLE` vs `:113` 注释**：定案 = **方案 A**：§4.1 C-2 增 ② 把 `packages/db/src/qbank-generation-retrieval.ts:113` 文档注释改写为**逐字钉死文本**（不含 `annSearchLegacy` / `retrieval-legacy`）；§4.4 断言 = 对该文件**全文原始文本字面计数**（不剥注释 · 不做 import/调用形态匹配）`annSearchLegacy`=0 且 `retrieval-legacy`=0。修复前计数更正为 **3 / 1**（`:113` `:231` `:232` / `:231`）→ 修复后 **0 / 0**（implementer 已在内存中模拟 ①+② 验算，未写盘）；只做 ① 不做 ② = C-2 未落（PC 红），Ban 以放宽断言修复；MUT-4 → ≥2 / 1 红。Ban prove 期间改断言 token / 口径 / 目标文件。
2. **Cond-2 回归补强**：§6 新增 **R-e** `./scripts/with-docker-session.sh env -u MODEL_API_KEY -u MODEL_BASE_URL pnpm qbank-integrity-upgrade:prove`（根 `package.json:429`）EXIT 0（`:256/:362` content_hash 漂移经 `hybridQbankSearch` 被排除 = candidate 语义；兼验 C-1 在非超级用户 migration role 下可应用）；§4.2 新增 **F-LEGACY-NOSCOPE**（无 active · 不传 scope）→ reject `qbank_active_generation_missing` · 0 行 · `R3-LEGACY-UNSCOPED-FAIL-CLOSED`；F-LEGACY* 在激活任何 generation 前跑，前置 `qbank_active_generation_metadata()` 计 0 否则 `FIXTURE_UNREACHABLE`。
3. **Cond-3 R-c 理由**：`rag-generation:prove`（`:433` → `prove:qbank-generation` · `qbank-generation.proof.ts:66`）= 有 active generation 时无 scope 调用 `hybridQbankSearch`，验证无 scope serving 路径，**不涉及 legacy**。
4. **Cond-4 注册 4 处**：§4.1 C-3 `run-e2e-isolated.mjs` `rag03-filter-locus:prove:raw` 登记 `:1262` 依赖表 · `:1450` 列表 · **`:1694` 命令分派**（`['pnpm', ['-C', 'packages/db', 'prove:rag03-filter-locus']]`）· `:2202` migrate 列表。
5. **Cond-5 MUT-4**：只钉 **EXIT 1（3/3）+ 红断言名全部命中**（`R3-LEGACY-STATIC-UNREACHABLE` + `R3-LEGACY-SCOPED-FAIL-CLOSED` + `R3-LEGACY-UNSCOPED-FAIL-CLOSED`，均为确定性红）；legacy 行数不钉，仅记录 `legacyReturned=<n>`（0 亦可）。§5 澄清：MUT「红断言名」= §6「经」所列 proof 断言名，`R3-MUT-*` 为收据标签。
6. **Cond-6 EXPLAIN 口径**：§4.3 披露 EXPLAIN = 参数替换后函数体的顶层计划（`planSource=substituted_body`）≠ live 调用计划（SECURITY DEFINER 不内联 · 参数化/generic plan · 角色不同）；硬门禁只看真实函数调用返回值（P-EXACT 依赖会话 GUC 同样作用于函数内规划，P-HNSW 安全断言与计划无关）；`HNSW_USED` / `HNSW_NOT_EXERCISED` = 替换体观测；收据记 `LIVE_PLAN_NOT_CAPTURED`；Ban 以替换体计划宣称 live 计划。
7. **保留未回退**：R1 ADR（PG-only · 否决 Qdrant / post-Top-K / FULLTEXT）· R2 锚点（`20da721` 再核未变）· C-1 candidate JOIN 移入 `ann` CTE、位于 `ORDER BY :84` / `LIMIT greatest(k*8,40) :85` 之前（新 migration 预期 `0138`）· F-STARVE 修复前 0 → 修复后 5 · F-SCOPE 3 · F-STARVE-RRF 5 · HNSW 显式期望 + EXPLAIN（`R3-HNSW-COMPLETENESS` OPEN）· MUT-1..4 · BASELINE 3/3 EXIT 1 · PC 3/3 EXIT 0 · 每 MUT 3/3 EXIT 1 · R4 CMD `./scripts/with-docker-session.sh env -u MODEL_API_KEY -u MODEL_BASE_URL pnpm rag03-filter-locus:prove` · R6 隔离真 PG+pgvector（`run-e2e-isolated.mjs:1728`）· 回归 R-a..R-e EXIT 0 · Ban 借绿。

Ban MySQL FULLTEXT · Ban Qdrant cutover · Ban wash R2 as R3 · EXIT0 ≠ R3 closed alone · **GAP-RAG-03 stays OPEN** · coveredCount=8 · 不代签 peer `mw-rag-route` · alone ≠ dual。

## Ban

Ban coding（until PRE dual BOTH PASS + coordinator AUTHORIZE）· Ban prove 执行 · Ban self-nail · Ban self-approve（alone ≠ dual）· Ban MySQL FULLTEXT fake-equiv · Ban Qdrant cutover · Ban invent coveredCount · Ban SSOT edit · Ban buy cloud · Ban Meridian · Ban secrets / `.env*` · Ban force-push · Ban claiming PRE PASS · Ban product/infra code（本轮）· Ban commit MUT · Ban 改 HNSW knobs · Ban touch AN-PRIV-EXT/MOP product · HOLD AN-CIMG-EA · Ban Redis cutover · Ban MODEL-OP closed claim · Ban re-open AG/AI/AK · Ban AN-CIMG-EA。

本 stub 不授权 coding / prove / push 冒充执行 / buy cloud；pre-exec dual BOTH PASS 后由协调方 AUTHORIZE 执行；implementer 不自批 · 不代填 Verdict。

## Verdict

**PENDING**（awaiting `mw-e2e-ha` re-PRE · implementer 不得填写）

---

*Stub · re-PRE rewrite ×3 · supersedes c515a8c · Re-PRE2 4e16dfa Cond-1 (BLOCKING) + Cond-2..6 addressed · FAIL 0e5c5ed (R3/R5) · Ban coding · GAP-RAG-03 OPEN · awaiting expert re-PRE dual · STOP*


---

## Rewrite ×3 note · re-PRE（append · do not erase history below）

**re-PRE ×3 · supersedes `c515a8c` · cites Re-PRE2 `4e16dfa`（mw-rag-route PASS · Cond-1 BLOCKING）** · Cond-1 = C-2 同改 `:113` 注释 + 静态断言全文字面计数 0/0（修复前 3/1）· Cond-2 R-e `qbank-integrity-upgrade:prove` + F-LEGACY-NOSCOPE · Cond-3 R-c 理由更正 · Cond-4 注册 4 处含 `:1694` · Cond-5 MUT-4 只钉 EXIT+断言名 · Cond-6 EXPLAIN = substituted body ≠ live plan · R1–R6 / R3 CRITICAL retained · Status stays `draft:awaiting_pre_exec_dual` · Verdict PENDING · Pins unchanged · GAP-RAG-03 OPEN · Ban coding · Ban MySQL/Qdrant/FULLTEXT · alone ≠ dual。本段仅为 rewrite 注记，**不**构成对本稿的 PASS/FAIL；下方历史正文（含 ×2 note 及各 PRE 收据）原样保留。
---

## Rewrite ×2 note · re-PRE（append · do not erase history below）

**re-PRE ×2 · supersedes `c71d354` · cites FAIL `0e5c5ed`** · R3①–⑤ / R5 / Cond1–2 landed in harness §3/§4.1–§4.4/§5/§6 · R1/R2/R4/R6 retained · Status stays `draft:awaiting_pre_exec_dual` · Verdict PENDING · Pins unchanged · GAP-RAG-03 OPEN · Ban coding · Ban MySQL/Qdrant/FULLTEXT · alone ≠ dual。本段仅为 rewrite 注记，**不**构成对本稿的 PASS/FAIL；下方历史正文原样保留。
