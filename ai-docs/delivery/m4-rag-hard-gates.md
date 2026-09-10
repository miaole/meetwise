# M4 — RAG / 向量硬门（R1–R5）

**状态**：gates draft · **releaseEvidence=false** · Not HA · 不宣称 controlPlaneClosed  
**栈裁定**：**MySQL + Qdrant + Redis** 为架构 **当前唯一真相**（sole stack）；本文件把 ADR R1–R5 写成 **可行动硬门**，不是旧栈对照 memoir。  
**本切片范围（协调方已确认）**：**仅硬门文档覆盖 R1–R5** + 静态 `mysql-stack:m4-rag:prove`；**不切向量真相** / **不切 pgvector serving** / **不切 qbank 生产路径**；**不宣称题域隔离已关**；**不宣称 RAG 已切流 / cutover**。  
**实现方不自批切流**：合入/切流前须独立审查 + 相关 prove 退出码；本里程碑 **禁止自批 cutover**。  
**硬句**：**pass ≠ cutover**；**本绿 ≠ 已迁**；本 prove 绿 **≠** 向量已迁 **≠** RAG 已切流。

关联：`ai-docs/delivery/adr-mysql-qdrant-local.md`（RAG / 路由硬缺口 R1–R5；M4/M5 门禁）。

---

## 0. 本切片硬钉（静态 prove 会匹配）

| 钉 | 裁定 |
|----|------|
| M4 本切片交付 | **仅硬门文档覆盖 R1–R5** + 静态 `mysql-stack:m4-rag:prove` |
| 向量 / serving / qbank | **不切向量真相**；**不切 pgvector serving**；**不切 qbank 生产路径**（`retrieval-store` / `hybridQbankSearch` / `annSearch` 等代码本切片不动） |
| 题域 / RAG | **不宣称题域隔离已关**；**不宣称 RAG 已切流**；**pass ≠ cutover** |
| 擦除 | **Qdrant as erasure sink**（删后 **recall=0** + **逐 sink receipt**）须在向量切流前证明；**metadata stays relational** |
| 证据 | `releaseEvidence=false`；Not HA；不勾 `controlPlaneClosed=true` |
| 栈 | **MySQL+Qdrant+Redis sole stack**；**cutover blocked until proves** |

中文钉死：

- **仅硬门文档覆盖 R1–R5**
- **不切向量真相**
- **不切 pgvector serving**
- **不切 qbank 生产路径**
- **不宣称题域隔离已关**
- **不宣称 RAG 已切流**
- **pass ≠ cutover**
- **本绿 ≠ 已迁**
- **MySQL+Qdrant+Redis sole stack**
- **禁止用 MySQL FULLTEXT 冒充** `to_tsvector` 等价
- **Qdrant as erasure sink**（recall=0 + 逐 sink receipt）
- **metadata stays relational**

---

## 1. 现有代码入口（本切片不改；活门非 memoir）

下列为 **切流前须保留并重新证明的生产路径**；本切片 **只钉门，不切代码**。

| 面 | 代码位置 / 行为（保留至切流批准） |
|----|----------------|
| **Worker「技术岗」硬编码（R1）** | `apps/worker/src/main.ts`：adaptive 依赖注入 `role: '技术岗'`。`apps/worker/src/interview-consumer.ts`：`startAdaptiveInterview(life, adaptive.role ?? '技术岗', …)`。生产启动图仍固定技术岗，非通用多题域出题就绪。 |
| **classifyJobRoute / route snapshot（R2）** | 合同实现：`packages/db/src/job-route-decision.ts`（`classifyJobRoute`、`snapshotInterviewRoute`、`getInterviewRouteSnapshot`；表 `interview_route_snapshot`）。导出：`packages/db/src/index.ts`。**生产 Worker/API 启动路径未接线** routed serving；本地 RAG-03/04/05 proof 不是生产接线。`docker/env/worker.env.example` 仅文档化 HMAC 等 env 依赖。 |
| **qbank_serving_scope + hybrid（R3）** | GUC 落点：`packages/db/src/qbank-generation-retrieval.ts` `setServingScope` → `set_config('app.qbank_serving_scope' / 'app.qbank_taxonomy_version', …, true)`；`hybridQbankSearch` 在 dense/lexical/RRF 前调用。词法通道仍绑 PG：`packages/db/migrations/0029_qbank_generation_hybrid_retrieval.sql` / `0106_qbank_track_local_serving_scope.sql`（`to_tsvector('simple', qbank_search_terms(…))` + `plainto_tsquery`）。Track-local seam：`packages/db/src/qbank-track-local-retrieval.ts`（`dispatchTrackLocalRetrieval` → `cachedQbankSearch(…, scope)`）。**禁止**用 MySQL FULLTEXT 冒充该 `to_tsvector` 过滤语义。 |
| **题域隔离（R4）** | 目标 seam 在 `qbank-track-local-retrieval.ts` / RAG-FUNNEL 合同 proof；**生产 Worker 仍固定技术岗、无 track 硬过滤** → **题域隔离 NOT closed**。显式 **M4/M5 门**：未证明隔离前不得切题库/向量真相。 |
| **pgvector 夹具（R5）** | `packages/db/src/retrieval-store.ts` / `retrieval-legacy.ts`（生产向量 ops / `annSearch` / `annSearchLegacy`）。Prove 仍绑 pgvector：`packages/db/test/vectorstore.proof.ts` + `pnpm vectorstore:prove`；`scripts/run-e2e-isolated.mjs`（`E2E_PG_IMAGE` 默认 `pgvector/pgvector:pg16`）；`apps/worker/test/qbank-retrieval-eval-pg.proof.ts` 等。**假绿风险**：本地绿 ≠ RAG 已迁；M5 前须换 Qdrant/新夹具或标红退役。 |
| **擦除 sink 先例（向量切流前置）** | 关系库侧先例：`packages/db/migrations/0125_memory_vector_chunk_erasure.sql` + `packages/db/src/memory-vector-chunk-erasure.ts` + `pnpm memory-vector-chunk-erasure:prove`（`privacy_deletion_target.sink='memory_vector_chunk'`）。迁 Qdrant 后须登记 **Qdrant as erasure sink**：删后 **recall=0** + **逐 sink receipt**；receipt 形状与关系库 ledger 对齐前 **不得切向量真相**。**元数据留关系库**。 |

**结论**：本切片 = 硬门 only。向量真相 / pgvector serving / qbank 生产路径 / Worker 技术岗 / route 生产接线 **代码不切**；目标设计按 MySQL+Qdrant+Redis sole stack 对齐。

---

## 2. R1 — Worker「技术岗」硬编码

| 现状 | 门（可行动） | 关闭条件（本切片 **未关**） |
|------|--------------|---------------------------|
| `main.ts` / `interview-consumer.ts` 固定或默认 `技术岗` | 去掉硬编码或改为从 **已接线** route snapshot / job metadata **参数化** 前，**不得**宣称通用出题路径就绪 | 生产启动图不再依赖字面量「技术岗」；缺 route 时 fail-closed（不猜桶） |

**本切片**：只登记缺口；**不改** Worker 出题路径。

---

## 3. R2 — `classifyJobRoute` / route snapshot 生产接线

| 现状 | 门（可行动） | 关闭条件（本切片 **未关**） |
|------|--------------|---------------------------|
| `classifyJobRoute` / `snapshotInterviewRoute` / `getInterviewRouteSnapshot` 有合同与 isolation proof | **无生产接线不得宣称路由生效** | application 启动事务绑定有效 `JobRouteDecision`；interview 同事务复制 immutable `InterviewRouteSnapshot`；Worker 消费 snapshot 而非固定「技术岗」 |

**本切片**：只钉「生产接线」缺口；**不接线**、不宣称 RAG-FUNNEL-03/04 生产已生效。

---

## 4. R3 — `qbank_serving_scope` + hybrid 过滤落点（离开 `to_tsvector`）

| 现状 | 门（可行动） | 关闭条件（本切片 **未关**） |
|------|--------------|---------------------------|
| hybrid 过滤经 GUC `app.qbank_serving_scope` 在 SECURITY DEFINER SQL **ORDER BY/LIMIT 前**硬过滤；词法通道 = `to_tsvector` + `qbank_search_terms` | 向量/检索切流前必须定案：**过滤落点**（Qdrant payload filter / 关系元数据 join）+ **词法等价物**（Qdrant 全文或应用 BM25 等） | 书面定案 + prove：scope 过滤仍在 Top-K 前；**禁止用 MySQL FULLTEXT 冒充**原 `to_tsvector` 等价 |

**硬禁**：MySQL `FULLTEXT` / `MATCH … AGAINST` **不是** `to_tsvector('simple', qbank_search_terms(…))` 的假等价；不得以此关闭 R3。

**本切片**：只定门禁语言；**不改** `hybridQbankSearch` / 0029/0106 生产 SQL。

---

## 5. R4 — 题域隔离 NOT closed → 显式 M4/M5 门

| 现状 | 门（可行动） | 关闭条件（本切片 **未关**） |
|------|--------------|---------------------------|
| track-local seam / wrong_track=0 合同存在于 proof，**非**生产 Worker 接线 | **显式 M4/M5 门**：未证明题域隔离前 **不得切题库/向量真相** | 生产读面 `wrong_track=0`；伪造/缺失 metadata、分类未知、岗位并发修改、旧 checkpoint、cache 回放均零跨域出题；**不宣称题域隔离已关** 直至独立 prove + 专家审 |

**本切片**：**题域隔离 NOT closed**；文档与 prove 必须保留该否定句。

---

## 6. R5 — 仍绑 pgvector 夹具 → 假绿风险（直至 Qdrant fixtures）

| 现状 | 门（可行动） | 关闭条件（夹具换新属 **M5**；本切片 **未关**） |
|------|--------------|-----------------------------------------------|
| `vectorstore:prove` / `run-e2e-isolated` / 多条 qbank·memory prove 仍起临时 **pgvector** 集群 | **M5 前假绿风险**：须换 Qdrant/新夹具或标红退役；**本地绿 ≠ RAG 已迁** | 关键 RAG/向量 prove 不再默认依赖 `pgvector/pgvector:*`；或明确标红「legacy fixture，不得当迁栈证据」 |

**本切片**：钉假绿风险；**不换夹具**、不删 `vectorstore:prove`、不切 `retrieval-store`。

---

## 7. Qdrant 擦除 sink + 元数据留关系库（向量切流前置）

ADR 隐私等价强制：向量/题库 chunk 删除后，**Qdrant 必须仍是可证明的擦除 sink**。

| 要求 | 裁定 |
|------|------|
| 删后召回 | **recall=0**（同 owner / 同 ref 再检索不得命中） |
| 回执 | **逐 sink receipt**；形状与关系库 `privacy_deletion_target` ledger 对齐（先例：`0125` / `memory-vector-chunk-erasure`） |
| 元数据 | **metadata stays relational**（原文/状态机/ACL/擦除账本留 MySQL；Qdrant 只持向量+允许的 payload ref） |
| 切流 | receipt 形状未对齐 + sink prove 未绿前 **不得切向量真相** |

**本切片**：只登记门；不实现 Qdrant client、不改 `0125`、不切向量真相。

---

## 8. 非目标 / 禁止宣称

- **不切向量真相** / **不切 pgvector serving** / **不切 qbank 生产路径**。
- **不宣称题域隔离已关**；**不宣称 RAG 已切流**；**pass ≠ cutover**；**本绿 ≠ 已迁**。
- 不以 MySQL FULLTEXT 冒充 `to_tsvector` 等价关闭 R3。
- 不以 `vectorstore:prove` / e2e-isolated 绿当作 Qdrant 已迁（R5 假绿）。
- 不以 legacy `compose.dev.yml` 双跑为产品计划；**MySQL+Qdrant+Redis sole stack**。
- `releaseEvidence=false`；Not HA；不勾 `controlPlaneClosed=true`；**禁止自批 cutover**；**cutover blocked until proves**。

---

## 9. 静态 prove

```bash
pnpm mysql-stack:m4-rag:prove
# ≡ node scripts/mysql-stack.m4-rag.skeleton.proof.mjs
```

期望：文件存在 + 本文钉死 R1–R5 / sole stack / 不切向量真相 / releaseEvidence=false / Not HA / 本绿≠已迁；并确认生产路径文件仍在（未误切）。EXIT=0 **仅**表示硬门文档骨架绿，**≠** RAG/向量 cutover。
