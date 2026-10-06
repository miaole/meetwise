# REQUEST — **GAP-RAG-03 · R3 filter-locus ADR + Top-K hard-filter prove** · pre-exec · mw-rag-route

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub rewrite **×3 re-PRE** · Ban self-approve · alone ≠ dual · 不代签 peer `mw-e2e-ha`）
**Rewrite ×3**: **supersedes REQUEST ×2 `c515a8c`**（`c515a8c08aeb904a2579f0d1d38ec4e93aa183c9` · itself superseded `c71d354` → `4c93dc5`）· cites mw-rag-route Re-PRE2 PASS-with-Cond **`4e16dfa`**（`4e16dfa8e9b1459b8401514c9d8252d1e7256c87`）**Cond-1（BLOCKING pre-AUTHORIZE）+ Cond-2..6 addressed** · prior FAIL `0e5c5ed` / `5f8096a` retained · R1–R6 / R3 CRITICAL pins retained · Ban coding · GAP-RAG-03 OPEN
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Expert**: `mw-rag-route`
**Peer**: `mw-e2e-ha`（独立签 · alone ≠ dual）
**Knife**: `harness/gap-rag-03-r3-filter-locus.md` · slice `gap-rag-03-r3-filter-locus.slice.md`
**Parent tip**: origin `feat/mysql-schema-skeleton` @ `20da721`（anchors re-verified · AN-PERF-TEAR sibling **Ban touch** ·Ban touch AN-PRIV-EXT / AN-MOP-Q45 / AN-CIMG-EA）
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

## 请审什么（mw-rag-route · re-PRE ×3 · 仅 `4e16dfa` Cond-1..6 + 保留项未回退）

Line AN-RAG-R3 · GAP-RAG-03 R3 filter-locus。本 stub = **re-PRE rewrite ×3**（supersedes `c515a8c` · cites Re-PRE2 `4e16dfa` 条件）。harness = `harness/gap-rag-03-r3-filter-locus.md`（「Rewrite ×3 note」表 + §3 / §4.1 / §4.2 / §4.3 / §4.4 / §5 / §6）。请审：

1. **Cond-1（BLOCKING · 协调方：AUTHORIZE 前不修 = FAIL）`R3-LEGACY-STATIC-UNREACHABLE` vs `:113` 注释**：定案 = **方案 A**：§4.1 C-2 增 ② 把 `packages/db/src/qbank-generation-retrieval.ts:113` 文档注释改写为**逐字钉死文本**（不含 `annSearchLegacy` / `retrieval-legacy`）；§4.4 断言 = 对该文件**全文原始文本字面计数**（不剥注释 · 不做 import/调用形态匹配）`annSearchLegacy`=0 且 `retrieval-legacy`=0。修复前计数更正为 **3 / 1**（`:113` `:231` `:232` / `:231`）→ 修复后 **0 / 0**（implementer 已在内存中模拟 ①+② 验算，未写盘）；只做 ① 不做 ② = C-2 未落（PC 红），Ban 以放宽断言修复；MUT-4 → ≥2 / 1 红。Ban prove 期间改断言 token / 口径 / 目标文件。
2. **Cond-2 回归补强**：§6 新增 **R-e** `./scripts/with-docker-session.sh env -u MODEL_API_KEY -u MODEL_BASE_URL pnpm qbank-integrity-upgrade:prove`（根 `package.json:429`）EXIT 0（`:256/:362` content_hash 漂移经 `hybridQbankSearch` 被排除 = candidate 语义；兼验 C-1 在非超级用户 migration role 下可应用）；§4.2 新增 **F-LEGACY-NOSCOPE**（无 active · 不传 scope）→ reject `qbank_active_generation_missing` · 0 行 · `R3-LEGACY-UNSCOPED-FAIL-CLOSED`；F-LEGACY* 在激活任何 generation 前跑，前置 `qbank_active_generation_metadata()` 计 0 否则 `FIXTURE_UNREACHABLE`。
3. **Cond-3 R-c 理由**：`rag-generation:prove`（`:433` → `prove:qbank-generation` · `qbank-generation.proof.ts:66`）= 有 active generation 时无 scope 调用 `hybridQbankSearch`，验证无 scope serving 路径，**不涉及 legacy**。
4. **Cond-4 注册 4 处**：§4.1 C-3 `run-e2e-isolated.mjs` `rag03-filter-locus:prove:raw` 登记 `:1262` 依赖表 · `:1450` 列表 · **`:1694` 命令分派**（`['pnpm', ['-C', 'packages/db', 'prove:rag03-filter-locus']]`）· `:2202` migrate 列表。
5. **Cond-5 MUT-4**：只钉 **EXIT 1（3/3）+ 红断言名全部命中**（`R3-LEGACY-STATIC-UNREACHABLE` + `R3-LEGACY-SCOPED-FAIL-CLOSED` + `R3-LEGACY-UNSCOPED-FAIL-CLOSED`，均为确定性红）；legacy 行数不钉，仅记录 `legacyReturned=<n>`（0 亦可）。§5 澄清：MUT「红断言名」= §6「经」所列 proof 断言名，`R3-MUT-*` 为收据标签。
6. **Cond-6 EXPLAIN 口径**：§4.3 披露 EXPLAIN = 参数替换后函数体的顶层计划（`planSource=substituted_body`）≠ live 调用计划（SECURITY DEFINER 不内联 · 参数化/generic plan · 角色不同）；硬门禁只看真实函数调用返回值（P-EXACT 依赖会话 GUC 同样作用于函数内规划，P-HNSW 安全断言与计划无关）；`HNSW_USED` / `HNSW_NOT_EXERCISED` = 替换体观测；收据记 `LIVE_PLAN_NOT_CAPTURED`；Ban 以替换体计划宣称 live 计划。
7. **保留未回退**：R1 ADR（PG-only · 否决 Qdrant / post-Top-K / FULLTEXT）· R2 锚点（`20da721` 再核未变）· C-1 candidate JOIN 移入 `ann` CTE、位于 `ORDER BY :84` / `LIMIT greatest(k*8,40) :85` 之前（新 migration 预期 `0138`）· F-STARVE 修复前 0 → 修复后 5 · F-SCOPE 3 · F-STARVE-RRF 5 · HNSW 显式期望 + EXPLAIN（`R3-HNSW-COMPLETENESS` OPEN）· MUT-1..4 · BASELINE 3/3 EXIT 1 · PC 3/3 EXIT 0 · 每 MUT 3/3 EXIT 1 · R4 CMD `./scripts/with-docker-session.sh env -u MODEL_API_KEY -u MODEL_BASE_URL pnpm rag03-filter-locus:prove` · R6 隔离真 PG+pgvector（`run-e2e-isolated.mjs:1728`）· 回归 R-a..R-e EXIT 0 · Ban 借绿。

Ban MySQL FULLTEXT · Ban Qdrant cutover · Ban wash R2 as R3 · EXIT0 ≠ R3 closed alone · **GAP-RAG-03 stays OPEN** · coveredCount=8 · 不代签 peer `mw-e2e-ha` · alone ≠ dual。

## Ban

Ban coding（until PRE dual BOTH PASS + coordinator AUTHORIZE）· Ban prove 执行 · Ban self-nail · Ban self-approve（alone ≠ dual）· Ban MySQL FULLTEXT fake-equiv · Ban Qdrant cutover · Ban wash R2 as R3 · Ban SSOT edit · Ban buy cloud · Ban Meridian · Ban secrets / `.env*` · Ban force-push · Ban claiming PRE PASS · Ban product/infra code（本轮）· Ban commit MUT · Ban 改 HNSW knobs · Ban touch AN-PRIV-EXT/MOP product · HOLD AN-CIMG-EA · Ban Redis cutover · Ban MODEL-OP closed claim · Ban re-open AG/AI/AK · Ban AN-CIMG-EA。

本 stub 不授权 coding / prove / push 冒充执行 / buy cloud；pre-exec dual BOTH PASS 后由协调方 AUTHORIZE 执行；implementer 不自批 · 不代填 Verdict。

## Verdict

**PENDING**（awaiting `mw-rag-route` re-PRE · implementer 不得填写）

---

*Stub · re-PRE rewrite ×3 · supersedes c515a8c · Re-PRE2 4e16dfa Cond-1 (BLOCKING) + Cond-2..6 addressed · FAIL 0e5c5ed (R3/R5) · Ban coding · GAP-RAG-03 OPEN · awaiting expert re-PRE dual · STOP*


---

## Rewrite ×3 note · re-PRE（append · do not erase history below）

**re-PRE ×3 · supersedes `c515a8c` · cites Re-PRE2 `4e16dfa`（mw-rag-route PASS · Cond-1 BLOCKING）** · Cond-1 = C-2 同改 `:113` 注释 + 静态断言全文字面计数 0/0（修复前 3/1）· Cond-2 R-e `qbank-integrity-upgrade:prove` + F-LEGACY-NOSCOPE · Cond-3 R-c 理由更正 · Cond-4 注册 4 处含 `:1694` · Cond-5 MUT-4 只钉 EXIT+断言名 · Cond-6 EXPLAIN = substituted body ≠ live plan · R1–R6 / R3 CRITICAL retained · Status stays `draft:awaiting_pre_exec_dual` · Verdict PENDING · Pins unchanged · GAP-RAG-03 OPEN · Ban coding · Ban MySQL/Qdrant/FULLTEXT · alone ≠ dual。本段仅为 rewrite 注记，**不**构成对本稿的 PASS/FAIL；下方历史正文（含 ×2 note 及各 PRE 收据）原样保留。
---

## Rewrite ×2 note · re-PRE（append · do not erase history below）

**re-PRE ×2 · supersedes `c71d354` · cites FAIL `0e5c5ed`** · R3①–⑤ / R5 / Cond1–2 landed in harness §3/§4.1–§4.4/§5/§6 · R1/R2/R4/R6 retained · Status stays `draft:awaiting_pre_exec_dual` · Verdict PENDING · Pins unchanged · GAP-RAG-03 OPEN · Ban coding · Ban MySQL/Qdrant/FULLTEXT · alone ≠ dual。本段仅为 rewrite 注记，**不**构成对本稿的 PASS/FAIL；下方历史正文原样保留。

---

## Rewrite note · re-PRE（append · do not erase FAIL section below）

**re-PRE · supersedes `4c93dc5` · cites FAIL `5f8096a`** · R1–R6 landed in harness/slice · Status stays `draft:awaiting_pre_exec_dual` · Pins unchanged · GAP-RAG-03 OPEN · Ban coding · Ban MySQL FULLTEXT · Ban Qdrant cutover · alone ≠ dual。

下方 Historical FAIL 正文 **原样保留不擦除**；本段仅为 rewrite 注记，**不**构成对本稿的 PASS/FAIL。

---

## PRE-EXEC @4c93dc5 · mw-rag-route

**时间**：2026-10-06 20:18 +08:00
**REQUEST**：`4c93dc5bbd1d4ba56de9c0547fd944b52f72926d`（只改 4 个 docs：harness +68、slice +25、两个 stub 各 +45；docs-only，是 origin tip 的祖先）
**审查基**：临时 worktree `/tmp/mwrr-d269761`（detached；源码读于 `d269761`）· 仅本 box · 只读，无 prove · 未读 `.env*` · 无 live 模型调用
**范围**：独立审查，不代签 mw-e2e-ha · alone ≠ dual

### 已满足

- Ban MySQL FULLTEXT / `MATCH … AGAINST` 假等价（harness `:34`、`:56`）；Ban Qdrant cutover 声称（`:35`）；Ban 把 R2 structural CLOSED 洗成 R3 closed（`:36`）。
- backlog `:71` GAP-RAG-03 保持 OPEN，零 SSOT 改动（`:49-51`）；EXIT0 ≠ R3 closed（`:44`）；Pins 保留（`:4`、`:66`）；未声称 covered。

### 阻断项

**R1 · ADR 没有定案，且候选项含 Qdrant，与 PG-only 冲突。** harness `:28` 的候选为「Qdrant payload filter **或** 关系元数据 join」+「Qdrant 全文 **或** 应用 BM25」，并写「PG-retained 下不强制切栈」，把选择推给 PRE（`:42`）。按 `adr-postgres-retained.md:11-12`，Postgres / pgvector 是唯一向量真相，`@meetwise/qdrant-store` 只是历史原型；Qdrant payload filter / 全文属于新增 Qdrant 路径，被 pin 禁止。
**修复**：ADR 只在 PG 内定案。过滤落点 = SECURITY DEFINER SQL 内、`ORDER BY g.embedding <=> p_embedding` / `LIMIT` 之前的 WHERE 谓词（scope + taxonomy + `visible` + 候选批准）。明确否决 Qdrant payload / 全文以及「Top-K 之后再过滤」。词法通道保持 `to_tsvector('simple', qbank_search_terms(…))`（`0106:112-119`）；若要 BM25，也须在 PG 内实现。backlog `:71` 目标文字里的 Qdrant 选项须在 ADR 中书面写明「在 PG-retained 下不采用」。

**R2 · 现状锚点没有行号，且未核到真实代码。** `:22` 只列函数名。已核实的锚点：
- `packages/db/src/qbank-generation-retrieval.ts:60-65`：`setServingScope` 以 SET LOCAL 写两个 GUC。
- 同文件 `:221-275`：`hybridQbankSearch`。其中 `:227` 设 scope；`:229-233` 在无 active generation 时走 `annSearchLegacy`（**不读 scope**）；`:239` 计算候选数 n；`:255-257` RRF 融合后 `slice(0, k)`。
- `packages/db/migrations/0106_qbank_track_local_serving_scope.sql:55-92`：`qbank_generation_ann_search`。scope 谓词 `:74-83` 位于内层 `ORDER BY` `:84` / `LIMIT greatest(k*8,40)` `:85` 之前；但 `qbank_retrieval_candidate`（批准源）JOIN 在 `:88-89`，位于内层 LIMIT **之后**；外层 `LIMIT k` 在 `:91`。
- lexical：`0106:94-131`（scope 谓词 `:120-128`，在 `ORDER BY` `:130` / `LIMIT` `:131` 之前）。
- distances：`0106:134` 起。
- HNSW 部分索引：`0029_qbank_generation_hybrid_retrieval.sql:205`（`USING hnsw (embedding vector_cosine_ops) WHERE visible`）。
- 候选视图：`0068_qbank_content_fact_immutability.sql:111` 起。
**修复**：把以上锚点逐条写入 harness，并以此作为「过滤在 LIMIT K 之前」主张的依据。

**R3 · Top-K 饥饿与旁路未分析，期望值未钉。** 以下三处都可能让结果少于 K 或绕过过滤，REQUEST 均未提及：
- (a) 批准源过滤（candidate JOIN）落在内层 `LIMIT k*8` 之后（`0106:85-91`）。若最近的 ≥40 行来自未批准源，即使存在合规行，结果也会少于 K，且没有信号。
- (b) pgvector HNSW 遇到选择性 WHERE 时是先扫索引、后过滤（受 `hnsw.ef_search` 限制）。scope 很窄时可能静默少于 K。仓库内未见 `ef_search` / `iterative_scan` 设置，fixture 镜像 `pgvector/pgvector:pg16` 也未钉 pgvector 版本。
- (c) legacy 回退 `:229-233` 完全不应用 scope。
**修复**：钉死期望值：
- K=5、scope 内仅 3 行 → 精确返回 3 行，且 0 条越界。
- 最近的 N（>40）行全在 scope 外 / 未批准，合规行距离更远 → 期望返回数按 ADR 设计钉死（保证返回 K，或声明降级并给出精确值）。
- 声明 pgvector 版本，以及 `ef_search` / iterative scan 策略。
- legacy 回退在带 scope 时须 fail-closed，或说明为何不可达，并给出断言。

**R4 · LOOP §3③（`NORTH-STAR-EXECUTION-LOOP.md:81`）：命令与期望 EXIT 未钉。** `:42` 写「具名 R3 hard-filter prove（PRE dual 裁定…）」，没有脚本名、没有 attempts、没有每条命令的期望 EXIT。
**修复**：给出脚本名（例如 `rag03-filter-locus:prove`，经 `run-e2e-isolated.mjs`，按 C4 增量登记）、完整 wrapper 命令、attempts、期望 EXIT 0，以及各变异期望 EXIT≠0。

**R5 · 没有正控、变异与具名回归。**
**修复**：
- 正控：scope 内多行按距离排序返回、数量 = K。
- 变异 1：把 scope 谓词移到 LIMIT 之后（外层包一层再过滤）→ 越界行出现或数量不足 → EXIT≠0，并钉死红断言名。
- 变异 2：删去 taxonomy 谓词 → 跨 taxonomy 行出现 → EXIT≠0。
- 具名回归及期望 EXIT 0：`rag04-track-local:prove`、`rag03-route:prove`、`rag-generation:prove`、`qbank-pipeline:prove`，并写明 Ban 借这些绿当本刀证据。

**R6 · 证据层与隔离依据未声明。**
**修复**：
- 证据层：`run-e2e-isolated.mjs` 隔离真 PG + pgvector（Ban fake DB）；宿主类沿用 Linux-native-Docker-Engine。
- 隔离依据：检索函数都是 SECURITY DEFINER（会绕过 RLS），所以隔离依靠函数体内的显式谓词（active generation、`visible`、scope / taxonomy、批准源）；qbank 是共享题库，不存在 owner 维度，须写明「租户隔离不适用，scope 隔离以显式谓词为准」。若 ADR 认为需要 owner 维度，须给出谓词或 RLS 设计。
- 声明不引入 MySQL / Qdrant / FULLTEXT 代码路径，并加静态断言。

### 结论

上述 6 项阻断未解除前不得进入 coding / prove。GAP-RAG-03（backlog `:71`）保持 OPEN；PG-retained（Postgres / pgvector / PostgresSaver），禁止 MySQL runtime / Qdrant / MemorySaver / FULLTEXT。Pins 未变：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · public DELETE=503。本审不代签 mw-e2e-ha；alone ≠ dual；coding 须双方 PASS 加协调方 AUTHORIZE。

Verdict: FAIL

## Re-PRE @c71d354

**时间**：2026-10-06 20:28 +08:00
**REWRITE**：`c71d3547744900d4b6a70e64402a6c9baa40f6f6`（supersedes `4c93dc5`，引用我方 FAIL `5f8096a` R1–R6）。fetch 后确认在 origin，是祖先；只改 4 个 docs（harness +104/-33、slice、两个 stub）。
**审查基**：临时 worktree `/tmp/mwrr-553cfc5` @ origin tip（`9e2abd0` → `7e97dc3`；本线 harness 与源码在 `a1f3614..` 区间无变化）· 仅本 box · 只读，无 prove · 未读 `.env*` · 无 live 模型调用
**本文件历史段**：`## PRE-EXEC @4c93dc5` 正文与 `5f8096a` 逐字一致（diff 为空）；core 表头 / Rewrite note 未改动。
**Peer**：mw-e2e-ha 同线收据仍为 PENDING stub（`...-mw-e2e-ha.md:3`、`:48`），无结论可引；不代签 · alone ≠ dual。

### 逐项核对（harness = `harness/gap-rag-03-r3-filter-locus.md`）

- **R1 · 已解除。** §2 ADR 定案（`:41-46`）：落点为 SECURITY DEFINER 函数体内、`ORDER BY <=>` / `ts_rank` 与 `LIMIT` **之前**的 WHERE，谓词列表含 active / `visible` / scope / taxonomy / 批准源 `qbank_retrieval_candidate`（`:43`）。明确否决 Qdrant payload、应用层 post-Top-K、MySQL `MATCH … AGAINST`（`:43-44`）；backlog `:71` 中的 Qdrant 选项书面不采用（`:46`），与 `adr-postgres-retained.md:11-12` 对齐（`:37`、`:48`）。没有残留 Qdrant 选项。
- **R2 · 已解除。** 锚点逐条对源码核实无误：`qbank-generation-retrieval.ts:60-65`、`:221-275`、`:227`、`:229-233`、`:239`、`:255-257`；`0106:55-92`，其中 scope `:74-83`、内层 `ORDER BY :84`、`LIMIT greatest(k*8,40) :85`、candidate JOIN `:88-89`、外层 `LIMIT k :91`；lexical `:94-131`（scope `:120-128`，candidate JOIN 在 `:115`，位于 `LIMIT :131` 之前，即 `:57`「同块」属实）；`0029:205`；`0068:111`。harness `:56`、`:62` 也如实承认 ANN 的 candidate JOIN 在内层 LIMIT 之后。
- **R3 · 未解除，阻断（关键项）。**
  - ① harness 认出了缺陷，但**没有承诺修复，也没有钉预期**。`:69` 只写「ADR 修复方向 = 将批准源谓词移入内层 LIMIT 之前（授权后编码）」，并对「最近 >40 行全部未批准」这一场景写「prove 记录实际返回数」「修复前不得假装保证 K」。这不是钉死的期望值。没有说明本刀授权后的编码范围是否包含 `0106` ANN 的 candidate 前移（新 migration），也没有给该场景钉修复前基线和修复后精确值。§2 `:43` 把批准源列为「LIMIT 前谓词」，§3 `:62` 与 §4 `:69` 却仍把 LIMIT 后 JOIN 当作「已知风险」保留，两处自相矛盾。按这份计划，即使 prove 全绿，ANN 通道仍是 post-filter。
  - ② HNSW 只做了限制声明（`:70`）。这个方向可接受，但没有和 ① 联动：即使把 candidate 谓词前移，HNSW 先索引后过滤（`hnsw.ef_search` 默认 40）在「最近 40+ 未批准」场景下仍可能返回少于 K。另外，小 fixture 下规划器可能直接走顺序扫描，根本没触发 HNSW，绿了也不说明问题。须钉：pgvector 版本下限，以及 `SET LOCAL hnsw.iterative_scan` / `ef_search` 的取值，或者显式声明「此场景期望 = 实际批准且 in-scope 行数 N，并以 EXPLAIN 证明走了（或没走）HNSW」。二者择一定案。
  - ③ legacy `:229-233` 有 fail-closed 期望（`:71`）✓。但现状代码在「无 active generation 且已设 scope」时**可以**走到 legacy（`qbank-generation-retrieval.ts:227-233`），所以该断言在不改码时必然红。harness 没说该修复是否在本刀编码范围内，也没有钉 fixture 和修复前 / 后 EXIT。
  - K=5、仅 3 行 in-scope → 恰 3 行、0 越界，已钉（`:68`）✓。
  - **修复**：
    1. 写明授权后编码范围 = `0106` ANN 内层（`:72-85`）加入 `qbank_retrieval_candidate` / 批准源谓词，位置在 `ORDER BY` / `LIMIT` 之前（新 migration），并对 legacy 做 fail-closed。
    2. 钉 fixture：例如 45 条最近的 in-scope 未批准行，加 5 条较远的 in-scope 已批准行，K=5。修复前基线如实记录（预期 <5），修复后精确 = 5 行已批准、0 未批准、0 越界。
    3. HNSW 联动按 ② 定案。
    4. legacy fixture（无 active + scope）修复后的精确 EXIT / 返回。
- **R4 · 已解除。** 命令 `./scripts/with-docker-session.sh env -u MODEL_API_KEY -u MODEL_BASE_URL pnpm rag03-filter-locus:prove`（`:78`）；脚本名唯一（新增，授权后登记，`:83`、`:89`）；attempts 3（`:85`）；正控 EXIT 0、变异 EXIT ≠0（`:87-88`）。条件：须写明 3/3 EXIT 0 为通过要求（见条件 1）。
- **R5 · 部分解除，阻断（随 R3）。**
  - 已具备：正控（`:97`）；变异 1「scope 移到 LIMIT 后」与变异 2「删 taxonomy」，均 EXIT ≠0 并有拟定断言名（`:98-99`）；回归 R-a..R-d 带 wrapper，期望 EXIT 0（`:100-103`），四个脚本已在根 `package.json` 核实存在（`:240` / `:238` / `:431` / `:425`）；Ban 借绿（`:105`）。
  - 缺：**变异 3「candidate / 批准源 JOIN 移回内层 LIMIT 之后」→ EXIT ≠0**，以及 legacy 可达性变异。这两项依赖 R3 的修复承诺，目前无从定义。
- **R6 · 已解除。** 隔离真 PG + pgvector，`pgvector/pgvector:pg16`（`:111`，与 `run-e2e-isolated.mjs:1716` 一致）；Linux-native（`:112`）；隔离依据 = SECURITY DEFINER 函数体内的显式 WHERE，不依赖 RLS；共享题库无 owner 租户维，租户隔离不适用（`:113`）；不引入 MySQL / Qdrant / FULLTEXT 路径，并有静态断言（`:114`）。
- **其他**：GAP-RAG-03 backlog `:71` 保持 OPEN（`:13`、`:118`）；Ban wash R2 as R3（`:18`、`:126`）；Pins 未变（`:4`、`:137`）。

### 非阻塞条件（随下次 rewrite 一并处理）

1. attempts=3 的通过要求写明为 3/3 EXIT 0；变异每次 EXIT ≠0，且红断言名须命中。
2. prove 收据须记录 `SELECT extversion FROM pg_extension WHERE extname='vector'` 以及关键查询的 EXPLAIN。

### 结论

R1 / R2 / R4 / R6 已解除；**R3 未解除**：ANN 的 candidate JOIN 仍在内层 `LIMIT greatest(k*8,40)` 之后（`0106:85` → `:88-89`）；rewrite 只写了「修复方向」，未纳入编码范围、未钉修复后精确值；HNSW 与 legacy 的预期没有与修复联动。**R5 部分解除**：缺 candidate 移回 LIMIT 后的变异。GAP-RAG-03 保持 OPEN。Pins 未变：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained（Postgres / pgvector / PostgresSaver）· Ban MySQL runtime / Qdrant / MemorySaver · public DELETE=503。coding 仍禁止，须双方 PASS 加协调方 AUTHORIZE；不代签 mw-e2e-ha。

Verdict: FAIL

## Re-PRE2 @c515a8c

**时间**：2026-10-06 20:51 +08:00
**REWRITE ×2**：`c515a8c08aeb904a2579f0d1d38ec4e93aa183c9`（supersedes `c71d354`，引用我方 Re-PRE FAIL `0e5c5ed`）。fetch 后确认在 origin，是祖先；只改 4 个 docs（harness、slice、两个 stub）。`0e5c5ed..c515a8c` 区间没有 `packages/`、`apps/`、`scripts/` 源码改动。
**审查基**：临时 worktree `/tmp/mwrr-re-pre2` @ `c515a8c` · 仅本 box · 只读，无 prove · 未读 `.env*` · 无 live 模型调用
**本文件历史段**：`## PRE-EXEC @4c93dc5` 起至 `## Re-PRE @c71d354` 结尾，与 `0e5c5ed` 逐字一致（diff 为空）；core 表头 / 「Rewrite ×2 note」未改动。
**Peer**：mw-e2e-ha 同线收据仍为 PENDING stub，无结论可引；不代签 · alone ≠ dual。

### 我方前次收据更正（如实披露）

- **`0e5c5ed` R3③ 的前提有误。** 我当时写「现状代码在无 active generation 且已设 scope 时可以走到 legacy」，复核后结论是**到不了**：`activeQbankGeneration` 在 `qbank-generation-retrieval.ts:114-120` 中，若元数据函数缺失则抛 `qbank_active_generation_metadata_missing`，若 `rowCount !== 1` 则抛 `qbank_active_generation_missing`；返回类型是非可选的 `Promise<QbankActiveGeneration>`。因此 `:229` 的 `if (!active)` 永远不成立。rewrite ×2 §4.4（`:109`）的更正成立。
- `0e5c5ed` 把 lexical candidate JOIN 记为 `0106:115`，实际在 `:116`（`:115` 是 `JOIN qbank_chunk`）。rewrite `:61` 写的 `:116` 正确。

### 逐项核对（harness = `harness/gap-rag-03-r3-filter-locus.md` @ `c515a8c`）

- **C-1 ANN candidate 前移 · 已解除。**
  - 范围：`:74` 已纳入本刀编码范围（AUTHORIZE 后执行，`:70`），新增 migration `<NNNN>_qbank_ann_candidate_before_limit.sql`，预期编号 0138。tip 末号确为 `0137_privacy_external_sink_confirmation_guard.sql`；若编号被他线先占，按顺延处理并在收据披露。
  - SQL：`CREATE OR REPLACE` 同签名、同 `SECURITY DEFINER`、同 `SET search_path`（与 `0106:55-61` 核对一致）。唯一变化是把 `JOIN qbank_retrieval_candidate` 移入 `ann` CTE，紧随 `0106:73` 的 `JOIN qbank_generation_chunk … AND g.visible`，位于 `ORDER BY :84` 与 `LIMIT greatest(k*8,40) :85` 之前；外层删去 `:89`。这样批准源过滤确实发生在 ORDER BY / LIMIT 之前。
  - manifest 不变的理由与 `0106:14-21` 头注机理一致。
  - lexical 路径：`0106:116` 的 candidate JOIN 与 `:120-128` 的 scope 都在 `:130` / `:131` 之前，已合规，本刀不改（`:61`、`:78`）。
  - `retrieval-store.ts:58-63` 走同一个 `qbank_generation_ann_search`，修复同时覆盖（`:59`）。
  - Postgres only：Ban MySQL / Qdrant / FULLTEXT（`:78`、`:162`）。
- **C-2 删除 legacy 死分支 · 已解除（「死代码」属实）。** 调用链逐一核查：
  - `annSearchLegacy` 在本文件内只出现在 `:231-232`（另有 `:113` 一处文档注释）。
  - `hybridQbankSearch` 的全部调用方都先经过 `:228` 的 `activeQbankGeneration`：生产 `qbank-retrieval-cache.ts:276`；proof 包括 `rag04-track-local-retrieval.proof.ts:318`、`qbank-pipeline.proof.ts:55`、`qbank-generation.proof.ts:66`、`qbank-integrity-upgrade.proof.ts:256/:362`、`qbank-retrieval-eval-pg.proof.ts:77/:138`。
  - 无 active 的情形（首次启动、generation 表为空、pre-0029 库）都在 `:228` 抛错，不会进入 legacy。
  - 其他直接调用 `annSearchLegacy` 的地方（`retrieval-store.ts:65` 非 qbank 分支、`vectorstore.proof.ts`、smoke `rag-demo.ts:61`、`rag-adversarial-pg-eval.ts:146`）都不经 `hybridQbankSearch`，本刀不动（`:78`）。
  - 所以删除不改变行为：删除前后都抛 `qbank_active_generation_missing`。fail-closed 结果已钉为 F-LEGACY 的 reject 与 0 行（`:89`）；proof 整体修复前 EXIT 1、修复后 EXIT 0（`:111`）。
- **F-STARVE · 已解除。** `:87`：45 条 in-scope 未批准（dist 0.10–0.54），加 5 条 in-scope 已批准（0.60–0.64），加 10 条 out-of-scope 已批准（0.01–0.05），K=5，dense 模式。我按源码复算：
  - dense 模式 `n=k`（`:239`），SQL 端 `k=least(5,50)=5`（`0106:63`），内层 LIMIT 为 40；out-of-scope 行先被 scope 过滤掉，内层取到的 40 行全是未批准 → 修复前精确 0 行。修复后为精确 5 行，全部批准、0 越界。
  - F-STARVE-RRF 对照组：`n=min(200, max(40,40))=40`（`MAX_CANDIDATES=200` 在 `:14`），SQL `k=40`，内层 LIMIT 320 → 5 行。复算一致。
  - fixture 若无法构造，记 `FIXTURE_UNREACHABLE`，不算绿（`:93`）。
- **`:43` 与 `:62/:69` 的矛盾 · 已解除。** `:66` 明确 §2 是目标态，§3 是 tip 现状缺陷 D-ANN-1，由 §4.1 在本刀内修复，不再作为「保留风险」。
- **HNSW · 已解除（残项 OPEN 并有防误读机制）。**
  - `:97-105` 定案：不改 knobs；P-EXACT（`enable_indexscan` / `enable_bitmapscan` 关闭，EXPLAIN 证明计划树不含 `qgc_hnsw_visible_`）作为门禁，要求精确 5 行。
  - P-DEFAULT 只记录 `HNSW_USED`；P-HNSW 只钉安全性，并记录 `hnswReturned`。`R3-HNSW-COMPLETENESS` 保持 OPEN（`:13`、`:103`、`:181`、`:185`）。
  - 索引名前缀 `qgc_hnsw_visible_` 与 `0029:203` 一致，分区表见 `0029:146`。
  - 收据必录 `extversion`、image digest、`hnsw.ef_search`、三计划 EXPLAIN JSON（`:153`）。
- **MUT-3 / MUT-4 · 已解除。** `:144-145`：两者各 3/3 EXIT 1，且须命中具名红断言；MUT 禁止 commit，跑完 `git diff --exit-code` 须为 0（`:137`）。
- **3/3 · 已解除。** `:125-129`，通过 = 3/3 命中期望；BASELINE 3/3 EXIT 1（`:127`）；执行顺序已钉（`:130`）。
- **保留项没有回退**：
  - R1 ADR（`:43-50`）、R2 锚点（`:52-64`）、R4 命令（`:118`）、R6 隔离（`:157-162`）。
  - 镜像 `run-e2e-isolated.mjs:1728` 已核实。
  - 回归 R-a..R-d 期望 EXIT 0，wrapper 带 `env -u`（`:146-149`）；根 `package.json` 中 `rag03-route:prove :238`、`rag04-track-local:prove :240`、`qbank-pipeline:prove :427`、`rag-generation:prove :433` 均已核实存在。
  - GAP-RAG-03 保持 OPEN（`:13`、`:166`）；Pins 未变（`:4`、`:185`）。

### 新阻断

无（下面条件 1 必须在 AUTHORIZE 前修正，但它不触及 R1–R6 的实质，修法唯一且是机械性的）。

### 条件

1. **【执行前必改】静态断言与 C-2 范围冲突。** `R3-LEGACY-STATIC-UNREACHABLE` 要求本文件中 `annSearchLegacy` 出现次数为 0（`:89`、`:110`），但 C-2 只删 `:229-233`、「其余不变」（`:75`），而 `qbank-generation-retrieval.ts:113` 的文档注释里也有 `annSearchLegacy`。当前文件中计数为 3，不是 `:111` 所写的「得 1」；按现稿修复后仍为 1，PC 必然红。修法二选一：C-2 同时改写 `:113` 注释；或把断言收窄到代码形态，例如 `import('./retrieval-legacy` 或 `annSearchLegacy(` 调用。同时更正修复前计数。禁止在 prove 期间临时改断言来过关。
2. **回归补强。** C-1 改动了 ANN SQL，而 `qbank-integrity-upgrade:prove`（根 `package.json:429`；`qbank-integrity-upgrade.proof.ts:256/:362` 经 `hybridQbankSearch` 断言 content_hash 漂移被排除，正是 candidate 视图语义）不在 R-a..R-d 中，建议加入，期望 EXIT 0。另外，现有 proof 中没有任何一个断言 `qbank_active_generation_missing`，无 active 情形只有新 proof 的 F-LEGACY 覆盖；建议加一个不设 scope 的无 active 变体。
3. **R-c 理由更正**（`:148`）。`rag-generation:prove`（`prove:qbank-generation`）是在有 active generation 时无 scope 调用 `hybridQbankSearch`（`qbank-generation.proof.ts:66`），验证的是无 scope 的 serving 路径，不涉及 legacy。
4. **C-3 注册位置不全**（`:76`）。`run-e2e-isolated.mjs` 中 `rag04-track-local:prove:raw` 实际出现在四处：`:1262`、`:1450`、`:1694`（命令分派）、`:2202`。新 target 须同样登记四处。
5. **MUT-4 的「返回 ≥1 legacy 行」**（`:145`）依赖 `vector_chunk` 行在 legacy RLS / `qbank_visible_ref` 下可见。建议只钉 EXIT 1 与红断言名，行数仅作记录；或在 fixture 中证明这些行可见。
6. **EXPLAIN 取的是目录中函数体参数替换后的计划**（`:105`），可能与函数实际执行时的计划不同。收据中须注明这一点。

### 结论

R3（C-1、C-2、F-STARVE、矛盾、HNSW 联动）与 R5（MUT-3、MUT-4、3/3、收据必录项）均已解除；R1 / R2 / R4 / R6 没有回退；我方 `0e5c5ed` 中「legacy 可达」的判断有误，已更正。无新阻断；6 条条件中条件 1 须在 AUTHORIZE 前修正。本 PASS 仅为 mw-rag-route 单方 re-PRE：alone ≠ dual，不代签 mw-e2e-ha。coding 仍禁止，须双方 PASS 加协调方 AUTHORIZE。GAP-RAG-03 与 `R3-HNSW-COMPLETENESS` 保持 OPEN。Pins：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained（Postgres / pgvector / PostgresSaver）· Ban MySQL runtime / Qdrant / MemorySaver · public DELETE=503。

Verdict: PASS
