# POST-prove review — Line AN-RAG-R3 · GAP-RAG-03 R3 filter-locus · mw-e2e-ha

**Verdict**: **PASS**（mw-e2e-ha 单方 POST · **alone ≠ dual** · 无阻塞 · NB-1..5 见 §6）
**Reviewer**: mw-e2e-ha · 2026-10-06 21:20–21:25 CST（UTC+8）
**PROVE_SHA**: `7c67b4a`（receipt）· **CODE_SHA**: `ac03f30`（C-1+C-2 · mig `0138`）· C-3 `264e1d7` · REQUEST `8d52138` · PRE rag `d83c561` · PRE e2e `eb8fb09`
**Tip mapping**: 本审时 `origin/feat/mysql-schema-skeleton` = `b5633f0`。`git diff --name-only ac03f30 b5633f0` 中非 `ai-docs/` 路径 = **0**（`7c67b4a` + `b5633f0` 均为 docs-only 叠在 CODE 之上）。全部 prove 在 detached worktree **@ `ac03f30`**（产品码）执行，非 docs tip。
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503 · g7SuiteGreen=false · **GAP-RAG-03 OPEN**（backlog `:71` 不翻）· **R3-HNSW-COMPLETENESS OPEN**

## 1. 独立复跑（CMD + EXIT · 本人实跑 · 未采信实施方矩阵）

Wrapper 全部 = `./scripts/with-docker-session.sh env -u MODEL_API_KEY -u MODEL_BASE_URL pnpm <script>`；image `pgvector/pgvector:pg16` · PostgreSQL 16.15 · pgvector extversion **0.8.7** · `hnsw.ef_search=40`（默认）。

| Cell | SHA | script | start CST | EXIT | 红/关键 |
|------|-----|--------|-----------|------|---------|
| PC-1 | `ac03f30` | `rag03-filter-locus:prove` | 21:20:47 | **0** | 12 green（含 `R3-STARVE-EXACT-K` ×3 = 5 · `R3-SCOPE-EXACT` = 3 · static 0/0 · LEGACY ×2 reject `qbank_active_generation_missing`）|
| PC-2 | `ac03f30` | 同上 | 21:21:00 | **0** | — |
| PC-3 | `ac03f30` | 同上 | 21:21:13 | **0** | — |
| BASELINE-1 | `264e1d7` | 同上 | 21:23:06 | **1** | `R3-LEGACY-STATIC-UNREACHABLE` (3/1) · `R3-STARVE-EXACT-K` (0, hybrid + direct) · `R3-STARVE-HASH-DRIFT-EXACT-K` (0) |
| MUT-3-1（candidate JOIN 移回内层 LIMIT 后 · 本地临时编辑 · `git checkout` 复原 · `git diff --exit-code` EXIT 0） | `ac03f30`+local | 同上 | 21:24:16 | **1** | `R3-STARVE-EXACT-K` (0) + `R3-STARVE-HASH-DRIFT-EXACT-K` |
| MUT-2-1（删 `g.taxonomy_version = …` · 同复原 EXIT 0） | `ac03f30`+local | 同上 | 21:24:37 | **1** | `R3-SCOPE-EXACT` (5 × `r3s_outtax_*`) + `R3-SCOPE-NO-CROSS-TAXONOMY` (5) |
| R-a | `ac03f30` | `rag04-track-local:prove` | 21:21:47 | **0** | — |
| **R-b** | `ac03f30` | `rag03-route:prove` | 21:21:35 | **1** | `FAIL 未决岗位 start 不抛、返回 started，但 interview snapshot 行 = 0（优雅降级）`（唯一红）|
| R-b @C-3 | `264e1d7` | `rag03-route:prove` | 21:22:54 | **1** | 同一条唯一红 |
| R-b @base | `70cba94` | `rag03-route:prove` | 21:22:42 | **1** | 同一条唯一红 |
| R-c | `ac03f30` | `rag-generation:prove` | 21:21:59 | **0** | — |
| R-d | `ac03f30` | `qbank-pipeline:prove` | 21:22:11 | **0** | — |
| R-e | `ac03f30` | `qbank-integrity-upgrade:prove` | 21:22:24 | **0** | — |

未复跑（配额收尾 · 采信实施方 3/3 日志并披露）：BASELINE-2/3 · MUT-1 ×3 · MUT-2/3 第 2–3 次 · MUT-4 ×3。本人 1× 抽样与实施方日志红名一致，无矛盾。worktree 复跑后 `git status` 干净；无 MUT 提交。

## 2. R-b ruling（必裁）

**REQUEST 原文**（`8d52138` harness §6 `:178`）：「**回归 R-b** | 同 wrapper `pnpm rag03-route:prove`（`:238`）| EXIT **0**」；§6 `:183`：「Ban 借 R-a..R-e 绿当本刀 R3 关闭证据」；§5 `:156`「通过 = 3/3 命中期望 EXIT」（针对 BASELINE/PC/MUT 格；回归格 ×1）。

**裁定 = 预先存在 · 不在本刀范围 · 披露 · 不阻塞本 POST**。依据（本人独立核）：
1. 同一条且唯一一条断言在 base `70cba94`、C-3 `264e1d7`、CODE `ac03f30` 三点均红（EXIT 1/1/1），其余断言全绿 → 本刀引入的 delta = 0。
2. 失败断言在 `packages/db/test/job-route-decision.proof.ts:230-239`（⑦ 未决岗位 `startApplicationInterview` → `interview_route_snapshot`），代码路径 `packages/db/src/recruiter.ts`；`git diff 70cba94 ac03f30` 不触及该 proof 与 `recruiter.ts`，`recruiter.ts` 不引用 `hybridQbankSearch` / `qbank_generation_ann_search` / legacy。本刀产品改动仅 `0138` + `qbank-generation-retrieval.ts`。
3. R-b 在 REQUEST 中的作用是「回归」（本刀不打坏 rag03-route），该目的由 delta-equivalence 满足；它不是 R3 证据格（`:183`）。
**但**：R-b ≠ 绿 · 不得记为 EXIT 0 · `rag03-route:prove` 自身存在预先缺陷，须协调方另开线（本审不定根因 · 不开票 · 不改码）。nail 文本须原样写「R-b EXIT 1 pre-existing @70cba94」。

## 3. 静态 / 结构核

- **C-1**：`diff 0106:55-92 vs 0138:32-69` = 恰 2 行：`+ JOIN qbank_retrieval_candidate candidate ON candidate.ref_id=g.ref_id` 位于 `ann` CTE 内、`ORDER BY g.embedding <=> p_embedding` / `LIMIT greatest(k*8,40)` **之前**；外层 JOIN 删除，保留 `ORDER BY a.dist LIMIT k`。签名 / `RETURNS` / `LANGUAGE sql STABLE SECURITY DEFINER` / `SET search_path = public, pg_temp` 不变。✔
- **C-2 / Cond-1**：`qbank-generation-retrieval.ts` 全文字面计数 `annSearchLegacy`/`retrieval-legacy`：`264e1d7` = **3/1** → `ac03f30` = **0/0**（`grep -o | wc -l`，不剥注释）。`:229-233` 死分支删除；`activeQbankGeneration` 两处 throw 保留、永不返回 falsy。✔
- **:113 NB-2 wording**：落地文本 ≠ `8d52138` §4.1 C-2 ② 钉死逐字文本（偏离）。核：钉死文本称 legacy 检索「只经 retrieval-store.ts 的非 qbank 分支」为**事实错误**（`retrieval-store.ts:14` 导出 `annSearchLegacy`；`vectorstore.proof.ts:73` 以 `'qbank'` 直调）；peer `d83c561` PRE 已 NB 此措辞。落地文本事实正确、零行为变化、不含两禁用 token。**接受为披露偏离**（见 NB-1：「coordinator NB-2」授权仅见于实施方 receipt / harness §11 自述，git 内无协调方原文，nail 前须协调方确认）。
- **Ban path**：`git diff 70cba94 ac03f30` 新增行匹配 `mysql|qdrant|fulltext|against` 仅 Ban 注释/字符串与 JS `String.match` → **零** MySQL / Qdrant / FULLTEXT 代码路径。✔ 本审不 invent covered/HA。

## 4. Fixture 裁定

- **F-STARVE revoke-before-build**：接受。`rag03-filter-locus.proof.ts:127-180`：45 源经 control-executor `UPDATE qbank_source … 'rejected'` 撤销（与 handoff-closure 同路径），之后 epoch 读取 → builder 事实集额外含这 45 ref → 与生产 builder（`apps/worker/src/qbank-generation.ts:328`）同形 INSERT → `qbank_validate_generation` + `qbank_activate_generation` 全部照常；**无 trigger 禁用**。每 attempt 可达性自检（PC-1 实测 `revoked=45 · visibleUnapproved=45 · candidateUnapproved=0`）。满足 §4.2「只经既有 DDL/写入函数构造 · Ban 直写绕过 trigger」。语义 = builder 事实集与当前批准漂移（生产 builder 自身不产生 → D-ANN-1 为纵深防线），已在 receipt 披露，非冒充。
- **F-STARVE-HASH trigger-disable**：**不计入门禁 / 不计 covered**。`:419-423` 以超级用户 `ALTER TABLE qbank_chunk DISABLE TRIGGER USER` 构造 content 漂移，字面违反 §4.2「Ban 直写绕过 trigger」—— 但它是 REQUEST 外的附加 fixture（实施方称 coordinator NB-1），不替代任何钉死 fixture；钉死门禁 F-STARVE 不用该 seam。接受为**补充证据（模拟类 · 同 rag04 ⑥b）**，其多出的红名不影响 MUT 红名命中判定。
- **MUT-2 name mapping**：接受。harness `:174` 仅给标签 `R3-MUT-NO-TAXONOMY`（无「经」断言名），`:160` 定义「红断言名 = 『经』所列 proof 断言名」→ 映射至 `R3-SCOPE-EXACT` + `R3-SCOPE-NO-CROSS-TAXONOMY` 合理；本人 MUT-2-1 实测二者均红（5 条 `r3s_outtax_*` 越 taxonomy 泄漏），非空变异。
- **HNSW**：PC-1 实测 `P-HNSW HNSW_NOT_EXERCISED hnswReturned=5 planSource=substituted_body` · `LIVE_PLAN_NOT_CAPTURED` → 修复后 HNSW 完整性**未观测** → **R3-HNSW-COMPLETENESS OPEN**（诚实 · 未宣称满 K）。`R3-HNSW-SAFETY` 绿仅为安全断言。

## 5. 判定

钉死格本人复核：PC 3/3 EXIT 0 · BASELINE EXIT 1（红名 = 钉死 `R3-STARVE-EXACT-K` + `R3-LEGACY-STATIC-UNREACHABLE` 命中）· MUT-2/MUT-3 EXIT 1 红名命中 · R-a/c/d/e EXIT 0 · R-b EXIT 1 = 预先存在（§2）。C-1/C-2/Cond-1 静态全符。**无阻塞 → PASS**。

## 6. NB（非阻塞 · 须 nail 前处理/披露）

- **NB-1**：`:113` 偏离钉死文本、F-STARVE-HASH 附加，均以「coordinator NB-1/NB-2（21:05 CST FYI）」为授权，git 内无协调方原文 → nail 前协调方书面确认。
- **NB-2**：`attempt-ledger.txt` 末行 `BASE 70cba94 rag03-route … EXIT=SEE_CORRECTION (… real exit below)` 其下**无**更正行 → ledger 缺该格 EXIT；本人独立实跑 `70cba94` EXIT **1** 补证（log 仍有 `ELIFECYCLE … exit code 1`）。建议实施方补 ledger（docs-only）。
- **NB-3**：`rag03-route:prove` ⑦ 预先缺陷须另开线；在其修复前 R-b 不可记绿。
- **NB-4**：静态断言仍单文件范围（peer `d83c561` NB 同）。
- **NB-5**：本人仅抽样 MUT-2/MUT-3 ×1，MUT-1/MUT-4 依赖实施方 3/3 日志。

## 7. Peer · dual · Ban

- Peer `mw-rag-route`：PRE `d83c561` PASS（cite · **not co-sign**）；本审时 origin 上**无** peer POST 提交 → POST dual **未成**（alone ≠ dual）。
- **Ban nail**：直至 POST BOTH PASS + 协调方 AUTHORIZE；本审不 AUTHORIZE nail、不写 `post_prove_dual_pass`。
- **Ban coding**（本线及 PERF 线仍有效）· Ban buy cloud · Never Meridian · 未触 PERF-TEAR。
- covered ≠ EXIT 0 · EXIT 0 ≠ R3 closed · GAP-RAG-03 **OPEN** · R3-HNSW-COMPLETENESS **OPEN** · releaseEvidence=false · NOT_HA · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · DELETE=503 · g7SuiteGreen=false · gR45Closed=true · claimProductionHA=false。

*POST review · mw-e2e-ha · AN-RAG-R3 @CODE ac03f30 / PROVE 7c67b4a · PASS · 无阻塞 · R-b pre-existing @70cba94 (disclosed, not green) · alone ≠ dual · Ban nail · STOP*
