# Slice — **RAG03-C · GAP-RAG-03 exact-K fill 观察刀**（合法非退化夹具真实验证 HNSW 候选返回与 exact-K fill · 多结局诚实 · docs REQUEST · `draft:awaiting_pre_exec_dual`）

**Status**: **`draft:awaiting_pre_exec_dual`**（docs REQUEST only · 本 turn Ban coding · Ban prove 执行 · Ban 碰夹具/产品码/proof · Ban 假关 `:71` · Ban 改共享 SSOT · Ban self-approve · alone ≠ dual · 不预claim 任何 post-commit EXIT/判别结局）
**Pins（原值全抄 · 未动）**: `haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` · `coveredCount=8` · `ms3EqualsR4Closed=false` · **PG-retained** · **公开 DELETE=503** · **`g7SuiteGreen=false`** · **`actualSpendCny=null`**
**Date**: 2026-10-07
**Base**: `origin/feat/mysql-schema-skeleton` **`9265e4d8`**（full `9265e4d8a58eaa064244eb3c5fd02c165e83d8fc`）· worktree `/Users/miaole/Desktop/golucky/meetwise-line-rag03` · branch `line/rag03c-exactk-observe`
**Experts**: `mw-rag-route` + `mw-model-op`（stubs PENDING · alone ≠ dual）
**Authority**: meetwise —— AQ nail（checklist `:1094-1101` @tip · path-exercised closed this knife only · exact-K **NOT claimed** · `hnswReturned=0` · `hnswExactFillObserved=false` · `:71` OPEN）→ RAG03-B 侦察（`:71` 残余=真实面 · exact-K fill 面事实性未行使 · HNSW prove 前置已满足）→ 协调方裁决立本刀（**scoping Ban 合法解除沿 G7W-G golden arm 先例**）→ REQUEST（docs-only）→ pre-exec 双审 → meetwise 授权 EXEC（夹具+prove 一次优先·多结局）→ post-prove 双审 → meetwise 授权 nail。

## One-line

AQ prove（`receipts/aq-gap-rag-03-r3-hnsw-completeness/2026-10-06-aq-hnsw-prove.md` §5）披露 `hnswReturned=0` · `hnswExactFillObserved=false`——HNSW 路径已行使（CC-H1/H2 已闭）但 **exact-K fill 面事实性未行使**：F-STARVE 夹具把批准 in-scope 行构造在 K 近邻窗口之外（`rag03-hnsw-completeness.proof.ts:402-427` · 45 近未批准 dist 0.10–0.54 vs 5 远批准 dist 0.60–0.64），且 candidate JOIN 非同表 Index Scan Filter 使 `iterative_scan` 不越未授权批。本刀（docs REQUEST）预注册**多结局假设族**与**≥2 合法非退化夹具方案**，EXEC 期以真实验证 HNSW 候选返回与 exact-K fill；观测读数入卷后行处置归协调方。**≠ 修复 ≠ 关 `:71` ≠ production HNSW SLO。**

## Products

| Role | Path |
|------|------|
| Harness（假设族+夹具方案+EXIT 契约） | `harness/rag03c-exactk-observe.md` |
| Dual `mw-rag-route` | `reviews/REQUEST-2026-10-08-rag03c-mw-rag-route.md`（空审 stub · PENDING） |
| Dual `mw-model-op` | `reviews/REQUEST-2026-10-08-rag03c-mw-model-op.md`（空审 stub · PENDING） |
| EXEC 面收据落点（授权后） | `receipts/rag03c-exactk-observe/`（本 turn 不建） |

## 假设族（预注册 · 多结局诚实）

| 假设 | 内容 | 预测 | 反例分支 |
|------|------|------|----------|
| **H-E1** | 夹具向量分布退化致 HNSW 候选恒 0 | 非退化分布（批准行穿插首窗）→ `hnswReturned>0` 且 exact-K fill 可观测 | 非退化下仍 =0 → 削弱 |
| **H-E2** | `iterative_scan` 参数面在合法分布下仍不越批（配置面） | 非退化夹具下仍 `=0`/`<K` · 首窗即止形态 | 参数可越批 → 削弱；成立则参数方案**交双审另议**（本刀不改 0139） |
| **H-E3** | 机制性不可观测：JOIN-after-HNSW 结构性排除 same-table Index Scan Filter | 非退化夹具下仍 =0 且 EXPLAIN 双口径无 Filter 形态 | 出现 Filter 形态且返回随分布变化 → 削弱；成立则登记机制事实 · 行处置**升级协调方** |
| 半填充 | `0<hnswReturned<K` | —— | 合法结局 · 如实登记归协调方 |

**判别读数（预注册 · 记录非门禁）**：① EXPLAIN 计划 Index Scan Filter 有无（live+substituted_body 双口径）② `hnswReturned=<n>` 计数 ③ exact-K fill 布尔。E2/E3 同预测不预设可分——EXPLAIN 形态分流=登记非定谳，定谳权归协调方。

## 夹具方案（≥2 对比交双审 · 详见 harness §2）

- **P1（主臂 · 推荐）**：非退化向量分布（批准 in-scope 5 行穿插进 `ef_search=40` 首窗 · 顺序不变量钉死）+ 查询向量与库同分布（承 AQ axis 构造）· K=5 · corpus 60 行 · P-HNSW GUCs。
- **P2（对比臂）**：行数量级提升至 ~2000 行（非退化穿插保持）· P-DEFAULT 自然选 HNSW 双读数。
- **P3（落选登记）**：改共享 schema 换观测（索引/函数/JOIN）→ 触 manifest seal + 共享 migrate 链 → **Ban**。
- **破坏面（两方案同）**：对 0028（application-bound interview）/0100（scoring fact root）体系**零**——proof-local corpus 经既有 DDL/写入函数构造 · 无新 migration · 无共享 DDL/函数/索引/manifest 改动 · migrate 链零新增。时长：P1 ≈ AQ prove 同量级（分钟级）· P2 ingest 分钟级上升（est-not-counter · EXEC 实测落收据）。
- **硬约束**：零生产数据 · **Ban FULLTEXT/Qdrant/MySQL** · PG-retained · safety 面承卷（0 未批准 · 0 越界 · ≤K）· fixture 不可构造 → `FIXTURE_UNREACHABLE` 该 attempt FAIL 回 PRE。

## EXEC 面（授权后 · harness §3 全表）

新 proof `packages/db/test/rag03c-exactk-observe.proof.ts` + 注册四处（packages/db package.json · 根 package.json 双行 · `run-e2e-isolated.mjs` 四处登记 @`9265e4d8` 行号 `:1376`/`:1557`/`:1815`/`:2327` EXEC 期重核）· CMD `./scripts/with-docker-session.sh env -u MODEL_API_KEY -u MODEL_BASE_URL pnpm rag03c-exactk-observe:prove` · attempts P1×3→P2×1 一次成型（执行序固定 · Ban 加跑/择优/retry-to-green）· 零 src/migration 改动机检入收据 · 零模型外呼 · `actualSpendCny=null`。

## EXIT 契约（多结局双向）

EXIT 0 = fixture reachable + safety + EXACT 回归面保持 + 读数全录——**判别读数任意值（含 0/false）不构成红**；红仅限 fixture unreachable / safety 破 / `R3C-PEXACT-EXACT-K` 回归 / `R3C-P1-HNSW-USED` 未达 / 读数缺失。结局路由：E1 候选成立=登记非定谳；E2/E3 形状分流=登记非定谳；半填充=如实登记。**任何结局 ≠ `:71` 关闭 ≠ production HNSW SLO ≠ exact-K claimed ≠ covered flip ≠ HA。** 行处置=观测读数入卷后归协调方裁。

## Ban（硬 Ban 全录）

Ban production SLO 宣称（观测≠SLO）· **Ban 假关 `:71`**（OPEN 不翻 · 登记归本刀 nail · 处置归协调方）· Ban 碰 AQ nail 已闭面（CC-H1/H2/H3 · `0138`/`0139`/`0029`/principal.ts/既有三 proof 零触碰）· Ban 改共享 SSOT（backlog/checklist/matrix 零触碰）· Ban 洗 GAP-RAG-02 `:70` · Ban 生产数据 · Ban FULLTEXT · Ban Qdrant · Ban MySQL · Ban secrets/`.env*` · Ban Meridian · Ban buy cloud · Ban retry-to-green/事后加跑/择优 · Ban 破坏性注入 · Ban self-approve · Ban self-nail · alone ≠ dual · Ban force-push · Ban 本 turn 碰夹具/产品码。

## Non-claims

Not a pass · not run · not coding · not 判别结局定谳 · not `:71` closed · not production HNSW SLO · not exact-K claimed · not AQ 已闭面 touched · not GAP-RAG-02 touched · not covered（coveredCount=8）· not `releaseEvidence=true` · not HA · not nail · not SSOT edit · alone ≠ dual · `g7SuiteGreen=false` · `actualSpendCny=null`

---

*Slice · RAG03-C GAP-RAG-03 exact-K fill 观察刀 · 2026-10-07 · `draft:awaiting_pre_exec_dual` · docs-only · H-E1/H-E2/H-E3 预注册多结局 · 判别读数=EXPLAIN Index Scan Filter 有无+hnswReturned+exact-K 布尔（记录非门禁）· 夹具 P1/P2 交双审 · 0028/0100 破坏面=零 · 硬 Ban 五条全录 · STOP*
