# M4 — RAG / 向量硬门（R1–R5）

> **2026-09-17 (~01:15 PT) · STOPPED / superseded by PG-retained direction**  
> Meetwise ruling (**hard**): **NO** MySQL business-DB cutover · **NO** Qdrant vector cutover.  
> Retained truth stack: **Postgres (+pgvector + PostgresSaver / RLS / mig 0043)**.  
> Former sole-stack claim **MySQL + Qdrant + Redis** is **superseded** for relational + vector portions.  
> **Redis wake** remains separately evaluable (orthogonal; not canceled by this ruling).  
> Prior status preserved below; **do not delete**. Ban further sole MySQL-relational / sole Qdrant-vector cutover from this artifact.  
> `releaseEvidence=false` · ≠HA · ≠suite green · Dual PASS ≠ authorize coding.

**Prior status (historical)**: gates draft · R1–R5 actionable under former sole stack (R1–R4 product gates remain relevant; stack/Qdrant-required/MySQL-relational claims superseded)


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
| 题域 / RAG | **EG3 domainIsolationClosed under authorize**；**R4·FUNNEL product close authorized attempt · honest non-flip**（`r4ProductClosed=false`）；**≠ R4/FUNNEL/G-R4-5 product closed**；**不宣称 RAG 已切流**；**pass ≠ cutover** |
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
| **Worker「技术岗」硬编码（R1）** | 静默硬编码已收口：`adaptive-role-resolve.ts` + `MEETWISE_TECH_ROLE_FAIL_CLOSED`（**产品默认 ON**=缺 route → `adaptive_role_route_missing`；精确 `0/false/off`=legacy opt-out · `defaultFlipped=true`）。`main.ts` 不再注入 `role: '技术岗'`。**R1 product closed under G-R4-3/R1 product-close authorize**（awaiting post-prove dual · Ban self-nail）· R2 **structural CLOSED** retained · **R2 NOT closed** as HA/suite/verbal/controlPlane/R4/FUNNEL · **不宣称 R4** · `releaseEvidence=false` · ≠HA。 |
| **classifyJobRoute / route snapshot（R2）** | 合同实现：`packages/db/src/job-route-decision.ts`（`classifyJobRoute`、`snapshotInterviewRoute`、`getInterviewRouteSnapshot`；表 `interview_route_snapshot`）。导出：`packages/db/src/index.ts`。revision/bind/snapshot 写面 + **P-LOOP** start lazy re-bind；`job.route-classify.v1` **P-MODEL CLOSED**；sole Worker **P-WORKER CLOSED**；**P-API CLOSED**（wakeup + `0133`；`apps/api` 零 classify）；**P-LOOP + P-START + P-FAKE CLOSED（dual-passed）**；**P-LIVE CLOSED（dual-passed）**（G-R2-7 Key-unset structural classify→bind→snapshot→refuse/allow）；**P-HARNESS/G-R2-8 authorized + SSOT flipped**（retired `await_authorize` · standing authorize after dual on `c3092c1`）。**不得宣称路由生效** / ≠ verbal 生效；**R2 structural CLOSED** · **R2 NOT closed** as HA/suite/verbal/controlPlane/R4/FUNNEL。本地 RAG-03/04/05 ≠ 生产。`docker/env/worker.env.example` 文档化 HMAC。诚实钉：`pnpm r2-p-live-route-effective:prove` · `pnpm r2-p-fake-route-classify:prove` · `pnpm r2-p-start-route-classify:prove` · `pnpm r2-p-loop-route-classify:prove` · `pnpm r2-p-api-route-classify:prove` · `pnpm r2-p-worker-route-classify:prove` · `pnpm r2-classify-job-route-prereq:prove`。 |
| **qbank_serving_scope + hybrid（R3）** | GUC 落点：`packages/db/src/qbank-generation-retrieval.ts` `setServingScope` → `set_config('app.qbank_serving_scope' / 'app.qbank_taxonomy_version', …, true)`；`hybridQbankSearch` 在 dense/lexical/RRF 前调用。词法通道仍绑 PG：`packages/db/migrations/0029_qbank_generation_hybrid_retrieval.sql` / `0106_qbank_track_local_serving_scope.sql`（`to_tsvector('simple', qbank_search_terms(…))` + `plainto_tsquery`）。Track-local seam：`packages/db/src/qbank-track-local-retrieval.ts`（`dispatchTrackLocalRetrieval` → `cachedQbankSearch(…, scope)`）。**禁止**用 MySQL FULLTEXT 冒充该 `to_tsvector` 过滤语义。 |
| **题域隔离（R4）** | **EG3 / 题域 isolation product face closed under authorize**（`domainIsolationClosed=true` · `eg3ProductClosed=true`）· track-local REAL-WIRE + G-R2-5 retained · **R4·FUNNEL product close authorized attempt**（`harness/g-r4-5-r4-funnel-product-close.md` · `executed:awaiting_post_prove_dual` · EXIT 2×0 · evidence insufficient → `r4ProductClosed=false` · `funnelProductClosed=false` · coveredCount **0** Ban invent · Ban假关）· **≠ R4/FUNNEL product closed** · **≠ gR45Closed** · **≠ invent coveredCount** · **≠ wrong_track=0 invent** · **MS3 ≠ R4** · 显式 **M4/M5 门** retained · `releaseEvidence=false` · ≠HA · knife EG3 `harness/g-r4-5-eg3-domain-isolation-product-close.md` · knife R4·FUNNEL `harness/g-r4-5-r4-funnel-product-close.md`。 |
| **pgvector 夹具（R5）** | `packages/db/src/retrieval-store.ts` / `retrieval-legacy.ts`（生产向量 ops / `annSearch` / `annSearchLegacy`）。Prove 仍绑 pgvector：`packages/db/test/vectorstore.proof.ts` + `pnpm vectorstore:prove`；`scripts/run-e2e-isolated.mjs`（`E2E_PG_IMAGE` 默认 `pgvector/pgvector:pg16`）；`apps/worker/test/qbank-retrieval-eval-pg.proof.ts` 等。**假绿风险**：本地绿 ≠ RAG 已迁；M5 前须换 Qdrant/新夹具或标红退役。 |
| **擦除 sink 先例（向量切流前置）** | 关系库侧先例：`packages/db/migrations/0125_memory_vector_chunk_erasure.sql` + `packages/db/src/memory-vector-chunk-erasure.ts` + `pnpm memory-vector-chunk-erasure:prove`（`privacy_deletion_target.sink='memory_vector_chunk'`）。迁 Qdrant 后须登记 **Qdrant as erasure sink**：删后 **recall=0** + **逐 sink receipt**；receipt 形状与关系库 ledger 对齐前 **不得切向量真相**。**元数据留关系库**。 |

**结论**：本切片 = 硬门 only。向量真相 / pgvector serving / qbank 生产路径 / Worker 技术岗 / route 生产接线 **代码不切**；目标设计按 MySQL+Qdrant+Redis sole stack 对齐。

---

## 2. R1 — Worker「技术岗」硬编码

| 现状 | 门（可行动） | 关闭条件 |
|------|--------------|----------|
| 静默 `role: '技术岗'` / `?? '技术岗'` 已收口到 `apps/worker/src/adaptive-role-resolve.ts`；`main.ts` 不再注入硬编码；`interview-consumer.ts` 经 `resolveAdaptiveInterviewRole`；**产品默认 fail-closed ON**（`docker/env/worker.env.example=1`） | 生产默认不再依赖 legacy「技术岗」；legacy 仅显式 `0/false/off` opt-out · PR1-B combo-root evidence retained | **R1 product closed** under `harness/g-r4-3-r1-product-close.md`（standing authorize · flip · `pnpm r4-pr1-product-close:prove` · `executed:awaiting_post_prove_dual` · Ban self-nail `post_prove_dual_pass`）· `pnpm r1-tech-role-fail-closed:prove` 仍证合同（`releaseEvidence=false`；**≠ R4/题域 closed** · ≠HA） |

**GAP-RAG-01**：**R1 product closed under authorize**（`harness/g-r4-3-r1-product-close.md` · `defaultFlipped=true` · `failClosedDefaultStill0=false` · `gR43ProductClosed=true` / `r1ProductClosed=true` on dedicated receipt · status `executed:awaiting_post_prove_dual` · Ban self-nail）。合同 harness + prove **可跑**（`harness/r1-tech-role-fail-closed.md` · `pnpm r1-tech-role-fail-closed:prove`）。R2 **structural CLOSED** retained · **R2 NOT closed** as HA/suite/verbal/controlPlane/R4/FUNNEL；**不宣称题域隔离已关（R4）** · **G-R4-5 / EG1–EG6 STILL OPEN** · `releaseEvidence=false` · ≠HA。

---

## 3. R2 — `classifyJobRoute` / route snapshot 生产接线

| 现状 | 门（可行动） | 关闭条件（本切片 **未关**） |
|------|--------------|---------------------------|
| `classifyJobRoute` / `snapshotInterviewRoute` / `getInterviewRouteSnapshot` 有合同与 isolation proof | **无生产接线不得宣称路由生效** | application 启动事务绑定有效 `JobRouteDecision`；interview 同事务复制 immutable `InterviewRouteSnapshot`；Worker 消费 snapshot 而非固定「技术岗」 |

**本切片**：只钉「生产接线」缺口；**不接线**、不宣称 RAG-FUNNEL-03/04 生产已生效。

**G4 / R2 诚实钉（2026-09-17 SSOT flip）**：`harness/r2-classify-job-route.md` · status · eval · knife `harness/r2-ssot-flip-real-close.md` · `pnpm r2-p-live-route-effective:prove` · `pnpm r2-p-fake-route-classify:prove` · `pnpm r2-p-start-route-classify:prove` · `pnpm r2-p-loop-route-classify:prove` · `pnpm r2-p-api-route-classify:prove` · `pnpm r2-p-worker-route-classify:prove` · `pnpm r2-classify-job-route-prereq:prove`（**prove 绿 ≠ HA / suite / verbal 生效**；**≠ 路由已生效**；P-MODEL + P-WORKER + P-API + P-LOOP + P-START + **P-FAKE CLOSED（dual-passed）**；**P-LIVE CLOSED（dual-passed）** + **P-HARNESS/G-R2-8 authorized + SSOT flipped** → **R2 structural CLOSED** · **R2 NOT closed** as HA/suite/verbal/controlPlane/R4/FUNNEL；双审引用 `reviews/2026-09-16-r2-p-harness-agree-mw-{rag-route,e2e-ha}.md` · `reviews/2026-09-17-r2-ssot-flip-real-close-mw-{e2e-ha,rag-route}.md` · post-prove `reviews/2026-09-17-r2-ssot-flip-real-close-post-prove-mw-{e2e-ha,rag-route}.md`（**`post_prove_dual_pass`** on **`5671982`**）。）对照 **GAP-RAG-02**。

---

## 4. R3 — `qbank_serving_scope` + hybrid 过滤落点（离开 `to_tsvector`）

| 现状 | 门（可行动） | 关闭条件（本切片 **未关**） |
|------|--------------|---------------------------|
| hybrid 过滤经 GUC `app.qbank_serving_scope` 在 SECURITY DEFINER SQL **ORDER BY/LIMIT 前**硬过滤；词法通道 = `to_tsvector` + `qbank_search_terms` | 向量/检索切流前必须定案：**过滤落点**（Qdrant payload filter / 关系元数据 join）+ **词法等价物**（Qdrant 全文或应用 BM25 等） | 书面定案 + prove：scope 过滤仍在 Top-K 前；**禁止用 MySQL FULLTEXT 冒充**原 `to_tsvector` 等价 |

**硬禁**：MySQL `FULLTEXT` / `MATCH … AGAINST` **不是** `to_tsvector('simple', qbank_search_terms(…))` 的假等价；不得以此关闭 R3。

**本切片**：只定门禁语言；**不改** `hybridQbankSearch` / 0029/0106 生产 SQL。

---

## 5. R4 — EG3 / 题域 isolation product face closed under authorize · R4·FUNNEL product close authorized attempt (honest non-flip) · R4/FUNNEL/G-R4-5 all STILL OPEN → 显式 M4/M5 门

| 现状 | 门（可行动） | 关闭条件（本切片 **未关**） |
|------|--------------|---------------------------|
| track-local REAL-WIRE + G-R2-5 retrieve-side CLOSED retained；**EG3 / 题域 isolation product face closed under authorize**（`domainIsolationClosed=true` · `eg3ProductClosed=true` · `harness/g-r4-5-eg3-domain-isolation-product-close.md` · tip nail `7be1a55` · `post_prove_dual_pass`）；**R4·FUNNEL product close authorized attempt · honest non-flip**（`harness/g-r4-5-r4-funnel-product-close.md` · `executed:awaiting_post_prove_dual` · `r4ProductClosed=false` · coveredCount **0** Ban invent）；prior EG3 evidence tip `62c0e2f` retained | **显式 M4/M5 门**：`gR45Closed=false` · **≠ R4/FUNNEL product all closed** · **≠ invent coveredCount / FUNNEL-01…08 covered** · **≠ wrong_track=0 invent** · **MS3 ≠ R4** · 未满足前 **不得切题库/向量真相** | 题域 isolation product face closed under authorize；不得宣称 R4/FUNNEL/G-R4-5 all closed / invent coveredCount / wash prior tips · `releaseEvidence=false` · ≠HA |

**本切片**：**EG3 / 题域 isolation product face closed under authorize**（`domainIsolationClosed=true` · `eg3ProductClosed=true`）；**R4·FUNNEL product close authorized attempt · honest non-flip**（`r4ProductClosed=false` · `funnelProductClosed=false` · coveredCount **0** Ban invent · Ban假关）；**R4/FUNNEL product STILL OPEN** · **G-R4-5 STILL OPEN**（`gR45Closed=false`）· Ban invent coveredCount · Ban wash EG3 `7be1a55`/`5b3c854` or R1 `9fec7c7`/`72233a0` or FUNNEL rem/SSOT/EXPLICIT into R4/FUNNEL product closed · **partial scoped retrieve ≠ R4/FUNNEL product closed**。

**G4 诚实钉 + product-close under authorize（2026-09-23）**：`harness/g-r4-5-eg3-domain-isolation-product-close.md` · `harness/g-r4-5-r4-funnel-product-close.md` · `harness/r4-domain-isolation.md` · status · `pnpm r4-eg3-domain-isolation-product-close:prove` · `pnpm r4-funnel-product-close:prove` · `pnpm mysql-stack:r4-domain-isolation:prove`（**EG3 face closed**；**R4·FUNNEL authorized attempt · honest non-flip**；**prove 绿 ≠ R4/FUNNEL product closed**；**≠ invent coveredCount**；**≠ wrong_track=0 invent**）。对照 **GAP-RAG-04**。

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
