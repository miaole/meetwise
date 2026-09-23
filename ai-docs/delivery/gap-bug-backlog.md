# Gap / Bug Backlog — P0/P1（PG-retained overlay 2026-09-17）

> **2026-09-17 (~01:15 PT) · stack overlay**: retained truth = **Postgres (+pgvector + PostgresSaver)**. Former sole-stack **MySQL + Qdrant + Redis** relational+vector claims **superseded**. See `adr-postgres-retained.md`. Redis wake still separately evaluable. `releaseEvidence=false` · ≠HA · ≠suite green.

> **2026-09-17 (~01:20 PT) · workflow SSOT (W0–W8)**: **W0** PG retained → **W1** PG redundant/obsolete inventory (**ZERO deletes** · REQUEST-ready · `harness/w1-pg-redundant-table-inventory.md`) → dual → later **W1b** (not open) → **W2…W8** (not open). Ban DROP in W1 · Dual PASS ≠ authorize deletes.

**状态**：inventory draft · **releaseEvidence=false** · **Not HA** · 不宣称 `controlPlaneClosed=true`  
**栈裁定（HISTORICAL overlay）**：**MySQL + Qdrant + Redis** 曾为唯一真相叙事 — **SUPERSEDED** for relational+vector; retained = **Postgres (+pgvector + PostgresSaver)**；实现方不自批。  
**范围**：从 ADR（隐私不倒退 / R1–R5 / Q1–Q5）、M2–M5、reviews、execution-master-checklist / remediation-register **抽样硬缺口**、已知运行时钉、open PR #101–#107 上下文合成。  
**非目标**：本文件不实现修复；不 dump 整份 checklist；无 regret memoir / 双跑产品计划叙事。

关联：`north-star-hard-gates.md` · `north-star-ha.md` · `e2e-requirement-coverage-matrix.md` · `adr-mysql-qdrant-local.md` · `m2-tenant-authorization-model.md` · `m2-tenant-prototype-impl.md` · `m3-queue-wakeup-selection.md` · `m3-redis-wakeup-prototype.md` · `m4-rag-hard-gates.md` · `m4-qdrant-prototype-impl.md` · `m5-pgvector-fixture-retirement-plan.md` · `production-readiness-remediation-register.md` · `execution-master-checklist.md` · `reviews/2026-09-10-tenant-enforcement-mw-privacy-int.md`

### In-flight 标记（勿当已关）

| 标记 | 含义 | 证据面 |
|------|------|--------|
| **INFLIGHT:tenant-conditional** | 应用层 tenant 原型已合入路径 + prove 绿；mw-privacy-int **conditional**；**≠ RLS 等价 / ≠ cutover** | `packages/db/src/tenant/` · `pnpm --filter @meetwise/db tenant-enforcement:prove` · review `2026-09-10-tenant-enforcement-mw-privacy-int.md` · harness `harness/tenant-enforcement.prototype.md` |
| **STOPPED:mysql-schema-prove** | **STOPPED / superseded by PG-retained**（was INFLIGHT）· MySQL schema skeleton remains historical; **Ban** replace-PG business tables · EXIT=0 ≠ cutover | harness `mysql-schema.skeleton.md` · review `2026-09-10-mysql-schema-mw-e2e-ha.md` **conditional** · `adr-postgres-retained.md` |
| **INFLIGHT:redis-wakeup-wip** | Redis Streams wakeup **additive** 原型 + flag 默认关；**不切生产 LISTEN/NOTIFY**；Q4 reconciler 仍挡 · **still separately evaluable under PG-retained**（not canceled） | `m3-redis-wakeup-prototype.md` · `pnpm worker-wakeup-redis:prove` · harness `harness/redis-streams-wakeup.prototype.md` |
| **STOPPED:qdrant-store-wip** | **STOPPED / superseded by PG-retained**（was INFLIGHT）· vector stays **pgvector**; Ban Qdrant-as-required sole vector · prototype may remain historical | `m4-qdrant-prototype-impl.md` · harness `qdrant-store.prototype.md` · `adr-postgres-retained.md` |
| **STOPPED:pr-docs-gates** | **STOPPED / superseded by PG-retained** for MySQL+Qdrant cutover docs direction（was INFLIGHT #106/#107）· history kept | #106 M0–M4 gates · #107 M5 retirement plan · successor `adr-postgres-retained.md` / `pg-retained-checkpoint-postgres-saver` |
| **INFLIGHT:pr-model-op-calib** | Open PR **#102** — calibration → dispatch budget + worker reconciler 接线候选；**≠ Q4 双门已关 / ≠ cutover** | `feat/model-op00-calibration-dispatch` |
| **INFLIGHT:pr-privacy-prove** | Open PR **#103/#104** — mem00-int00 prove-path honesty + lease-takeover digest 对齐；**不宣称控制面已关**；公开 DELETE 仍 503 | `chore/mem00-int00-prove-path` · `fix/privacy-authorization-lease-takeover` |

### Open PR 上下文（可见 · 非合入授权）

| PR | 标题（摘要） | 与本 backlog 关系 |
|----|--------------|-------------------|
| #101 | docs: align §1.1 lean CD | 运行时真相 / lean CD 叙事对齐；不关隐私/RAG/队列硬门 |
| #102 | feat(model-op00): calibration dispatch + worker | **INFLIGHT:pr-model-op-calib**；碰 Q4 / MODEL-OP reconciler 主链 |
| #103 | chore(mem00-int00): prove-path without claiming CP closed | **INFLIGHT:pr-privacy-prove**；INT/MEM control plane honesty |
| #104 | fix(privacy): lease-takeover proof target set | **INFLIGHT:pr-privacy-prove**；privacy-authorization prove 假红修复 |
| #105 | docs(cloud): test RDS/Tair public access ack | 云测 dataplane 诚实登记；≠ HA / ≠ releaseEvidence |
| #106 | docs: MySQL+Qdrant+Redis M0–M4 gates | **INFLIGHT:pr-docs-gates**；ADR/R/Q 门文档 |
| #107 | docs: M5 pgvector fixture retirement plan | **INFLIGHT:pr-docs-gates**；R5 假绿退役计划 |

---

## A. 需求 / 产品设计缺口

| ID | P0/P1 | 现状 | 目标 | 归属域 | 拟切片 | 所需 harness 路径 |
|----|-------|------|------|--------|--------|-------------------|
| GAP-PRIV-01 | P0 | 应用层 tenant 原型 additive + prove 绿；审查 **conditional**；授权根仍为 PG RLS / `asPrincipal`+`set_config`；**应用层 tenant ≠ RLS** | 写清并 prove MySQL 时代显式强制（非 optional filter）+ 跨 owner fail-closed；privacy 清单 prove 绿前 **MUST NOT abandon RLS** | privacy | M2 等价强制设计→prove 对齐 ADR 清单；接线 PR 另审 | `ai-docs/delivery/harness/tenant-enforcement.prototype.md`；切流前另需 `pnpm privacy-authorization:prove` / `crypto:prove` / erasure* |
| GAP-PRIV-02 | P0 | 公开 `DELETE /privacy/interview-data/:id` **必须保持 503**（冻结）；0129 仅预览盘点、`preview_incomplete` | 独立 prove + 专家审批准前 **不得放开**；放开时须 issuer/lease + 逐 sink receipt + 删后 read=0 | privacy | 保持 503 pin；INT-TRANSCRIPT-01 / erasure HTTP 切流另包 | `pnpm privacy-erasure:http:prove`（含 DELETE=503 pin）；`harness/privacy-erasure-http-503-pin.md`；`eval/privacy-erasure-http-503-pin.eval.md`；`privacy-erasure-preview:*` |
| GAP-PRIV-03 | P0 | **INT-TRANSCRIPT** 控制面未关：00 ◐（issuer/账本合同本地）；01 blocked；legacy `/turn` 仍可写明文 job payload；不得宣称完整面试记录 / 控制面已关 | 01：同一部署迁移装 canonical artifact + target resolver + deletion ledger + 逐 sink receipt + 删后 read=0；真实 HTTP/SSE 组合根；此前真实 write disabled | privacy / product | INT-TRANSCRIPT-01 release gates（依赖 00）；dual-write cutover 切断明文 payload | checklist `INT-TRANSCRIPT-00/01` prove 路径；`pnpm int-answer-dual-write-fence:prove`；`mem00-int00:prove-path`（#103） |
| GAP-PRIV-04 | P0 | 向量/题库 chunk 擦除：关系库有 `memory_vector_chunk` 先例；Qdrant **尚未**登记为可证明擦除 sink。**P15** subject erase + countable receipt + recall=0 已钉；**P16** schema/mapping + fail-closed PREREQ 已钉（`g5-ledger-map:prove`）— **仍 ≠ 0091 可写/对齐** / 公开 DELETE 仍 503 | Qdrant **as erasure sink**：删后 **recall=0** + **逐 sink receipt** **对齐 0091 ledger**；metadata stays relational；对齐前 **不得切向量真相** | privacy / rag | M4+ erasure sink 合同对齐 → privacy+rag 双审 | `harness/qdrant-g5-erasure-ledger.md` · `harness/qdrant-g5-ledger-map.md` · `harness/qdrant-store.prototype.md`；`pnpm qdrant-store:g5-erasure:prove`；`pnpm qdrant-store:g5-ledger-map:prove`；`pnpm memory-vector-chunk-erasure:prove` |
| GAP-RAG-01 | P0 | **R1 product closed under authorize**（G-R4-3 / R1 product-close knife · `executed:awaiting_post_prove_dual` · Ban self-nail `post_prove_dual_pass`）。`MEETWISE_TECH_ROLE_FAIL_CLOSED` **产品默认 ON**（`defaultFlipped=true` · `failClosedDefaultStill0=false`）；缺 route → `adaptive_role_route_missing`；精确 `0/false/off` = legacy opt-out。PR1-B combo-root + PR1-C no-legacy evidence retained。**≠ R4/FUNNEL/题域/G-R4-5/EG closed** · `releaseEvidence=false` · ≠HA | 产品默认 fail-closed；legacy 仅显式 opt-out；不得宣称 R4/题域已关 | rag / product | post-prove dual BOTH PASS before lifecycle nail · Dual PASS ≠ next R4/FUNNEL auto-authorize | `harness/g-r4-3-r1-product-close.md`；`harness/r1-tech-role-fail-closed.md`；`pnpm r4-pr1-product-close:prove`；`pnpm r1-tech-role-fail-closed:prove` |
| GAP-RAG-02 | P0 | `classifyJobRoute` / route snapshot **生产闭环 wire 已齐** + **P-START 真拒启（dual-passed）** + **P-FAKE CLOSED（dual-passed）** + **P-LIVE CLOSED（dual-passed structural）** + **P-HARNESS/G-R2-8 authorized + SSOT flipped**（retired `await_authorize` · standing authorize after dual on `c3092c1`）— **R2 structural CLOSED**（classify→bind→snapshot→refuse/allow + dual+authorize+prove）；**R2 仍 NOT closed** as HA/suite/verbal/controlPlane/R4/FUNNEL；P-MODEL+P-WORKER+P-API+P-LOOP+P-START+P-FAKE CLOSED（dual-passed）；G-R2-5 retrieve-side CLOSED；P-LIVE：Key-unset structural → **≠ 路由已生效** / ≠ verbal 生效；本地 RAG-03/04/05 ≠ 生产；knife **`post_prove_dual_pass`** on **`5671982`** · EXIT **6×0** | P-LIVE + P-HARNESS + real-close pre-exec + post-prove 双审已 pass；SSOT flipped under standing authorize；不得假称路由已生效 / verbal 生效 / HA / suite / controlPlaneClosed；Ban假关 | rag | remaining-after：**R1 next** · R4/FUNNEL after R1 · Live Key/G7/R5 orthogonal；不伪关题域隔离；Ban false green | `harness/r2-classify-job-route.md`；`harness/r2-ssot-flip-real-close.md`；`pnpm r2-p-live-route-effective:prove`；`pnpm r2-p-fake-route-classify:prove`；`pnpm r2-p-start-route-classify:prove`；`pnpm r2-p-loop-route-classify:prove`；`pnpm r2-p-api-route-classify:prove`；`pnpm r2-p-worker-route-classify:prove`；`pnpm r2-classify-job-route-prereq:prove`；`reviews/2026-09-17-r2-ssot-flip-real-close-mw-{e2e-ha,rag-route}.md`；`reviews/2026-09-17-r2-ssot-flip-real-close-post-prove-mw-{e2e-ha,rag-route}.md`；现有 `rag03-route:prove` 须换夹具或标红（R5） |
| GAP-RAG-03 | P0 | `qbank_serving_scope` + hybrid 过滤落在 PG GUC + `to_tsvector` — **R3**；**禁止 MySQL FULLTEXT 冒充** | 定案过滤落点（Qdrant payload / 关系元数据 join）+ 词法等价（Qdrant 全文或应用 BM25）；Top-K 前硬过滤 prove | rag / schema | R3 过滤落点 ADR 补丁 + prove | hybrid/qbank prove 换 Qdrant 夹具；禁 FULLTEXT 假等价门 |
| GAP-RAG-04 | P0 | **EG3 / 题域 isolation product face closed under authorize**（`domainIsolationClosed=true` · `eg3ProductClosed=true` · G-R4-5/EG3 product-close knife · tip nail `7be1a55` · prove `5b3c854` · `post_prove_dual_pass`）。**G-R4-5 / R4·FUNNEL product close authorized attempt（ARCHIVE · Do NOT rewrite）**（knife `harness/g-r4-5-r4-funnel-product-close.md` · REQUEST `da185d9` · prove `139dac9` · nail `1c2ed8c` · `post_prove_dual_pass` · EXIT 2×0 · **evidence insufficient** → `r4ProductClosed=false` · `funnelProductClosed=false` · coveredCount **was 0** · pin `evidence_insufficient_coveredCount_zero` · Ban假关）· **G-R4-5 / R4·FUNNEL product-close reassess（CLOSED lifecycle · tip nail `2b38e18` · prove `14e9e2c` · `post_prove_dual_pass` · ARCHIVE-align）**（knife `harness/g-r4-5-r4-funnel-product-close-reassess.md` · EXIT 2×0 · live matrix coveredCount **8** · 02A…08 covered · `canHonestlyFlip=true` → **`r4ProductClosed=true` · `funnelProductClosed=true` · `productCloseFlipped=true`** · **`gR45Closed=false`** default do NOT auto-flip · Ban invent · Ban wash Batch4b/`f802f02`/`0e58386` · Ban wash ARCHIVE prior non-flip · Ban假关）· **G-R4-5 / EG4 wrong-track product close REQUEST now open**（knife `harness/g-r4-5-eg4-wrong-track-product-close.md` · `REQUEST-ready / not_run:pre_dual` · base tip `2b38e18` · `eg4ProductClosed=false` · `wrongTrackProductClosed=false` · if evidence sufficient → honest flip else honest non-flip · **Ban** flip `gR45Closed`/r4/funnel this knife · Ban wash EG4 evidence tip `3cefebf`/dual `ec90b6d` into product closed without prove · Ban closing EG1/2/5/6 · Ban假关 · Ban Dual PASS=coding）。track-local REAL-WIRE + G-R2-5 retrieve-side CLOSED retained · prior EG4 evidence tip `3cefebf` / dual `ec90b6d` retained OPEN evidence · prior EG3 evidence tip `62c0e2f` / dual `c18e28f` retained OPEN evidence。**R4/FUNNEL product face closed under authorize** · **EG4/wrong_track product STILL OPEN** · **≠ gR45Closed** · **≠ invent coveredCount** · **≠ wrong_track=0 invent as product closed** · **MS3 ≠ R4 closed** · `releaseEvidence=false` · ≠HA | 题域 isolation product face closed under authorize；R4·FUNNEL product close prior attempt **archived honest non-flip**（coveredCount was 0）；reassess **honest flip** after Batch4b coveredCount=8 under authorize · tip nail `2b38e18` · `gR45Closed` still false；EG4 wrong-track product-close REQUEST open · covering/evidence ≠ product closed；不得宣称 EG4/wrong_track/G-R4-5 product closed / invent coveredCount / MS3=R4 / wash EG4 evidence or R4·FUNNEL tips without prove · Ban flip gR45Closed/r4/funnel this knife | rag / product | post-prove dual BOTH PASS before lifecycle nail · Dual PASS ≠ next knife auto-authorize · Ban wash EG4 `3cefebf`/`ec90b6d` · Ban wash EG3 `7be1a55`/`5b3c854` · Ban wash R1 `9fec7c7`/`72233a0` · Ban wash FUNNEL rem/SSOT/EXPLICIT · Ban wash Batch4b `f802f02`/`0e58386` · Ban wash prior non-flip `da185d9`/`139dac9`/`1c2ed8c` · Ban wash reassess `2b38e18`/`14e9e2c` into EG4/gR45 · Ban flip gR45Closed/r4/funnel · Ban closing EG1/2/5/6 | `harness/g-r4-5-eg4-wrong-track-product-close.md`；`harness/g-r4-5-r4-funnel-product-close-reassess.md`；`harness/g-r4-5-r4-funnel-product-close.md`（archived prior non-flip）；`harness/g-r4-5-eg3-domain-isolation-product-close.md`；`harness/g-r4-5-eg4-true-evidence-impl.md`；`harness/r4-domain-isolation.md`；proposed `pnpm r4-eg4-wrong-track-product-close:prove` or extend `pnpm r4-eg4-wrong-track-product:prove`；`pnpm r4-funnel-product-close:prove`；`pnpm r4-eg3-domain-isolation-product-close:prove`；`pnpm mysql-stack:r4-domain-isolation:prove`；`m4-rag-hard-gates.md` §R4 |
| GAP-RAG-05 | P1 | 无生产 RAG 语义/LLM 意图分类器；CRAG/researchBoundary ≠ router（PRD-TEST-017 / RAG-FUNNEL-07/08） | 规则→轻量枚举→人工澄清漏斗；分类只建议 allowlisted track，不授读权 | rag / product | 在 R4 硬过滤关闭后条件实施 | 受控评测 harness（待建）；不得替代 R4 |
| GAP-MOP-01 | P0 | Wakeup 生产仍 **LISTEN/NOTIFY** `meetwise_worker_wakeup_v1` — **Q1**；Redis Streams 仅 flag 关旁路原型 **INFLIGHT:redis-wakeup-wip** | 选型已钉 Streams 优选；切流须 wakeup prove + 周期 reconcile；**本绿 ≠ 已迁** | model-op | M3 切流包（非本选型切片）：flag 默认关→审后开；保留 reconcile | `harness/redis-streams-wakeup.prototype.md`；`pnpm worker-wakeup:prove`（旧）标红或换夹具 |
| GAP-MOP-02 | P0 | Claim 仍多路径 PG `FOR UPDATE SKIP LOCKED` — **Q2**；advisory `pg_advisory_*` — **Q3** | MySQL 8 同语义 claim **或** Streams 仅 wake/outbox；跨进程租约 Redis `SET NX PX`+fence；须 claim/锁 prove | model-op / schema | M3 claim/lease 实现切片（选型后） | claim multi-consumer prove；锁互斥/过期/fence prove（待建） |
| GAP-MOP-03 | P0 | MODEL-OP **双 reconciler** 门 — **Q4/Q5**：`model-invocation-reconcile` **与** `usageCalibrationReconciler` 同列；worker loop **wired under MODEL-OP-wire** (`executed:awaiting_post_prove_dual`) · prove EXIT 同列绿 **禁止**宣称 MODEL-OP/SLO/cutover 已关；#102 域 cutover 仍须独立审 | worker wiring + 双 prove 同列 · **≠** MODEL-OP fake green · **≠** Redis cutover · PG LISTEN retained | model-op | post-prove dual；Ban self-write post_prove_dual_pass；cutover 另 REQUEST | `pnpm model-invocation-reconcile:prove`；`pnpm model-op00-usage-reconciler:prove`；`harness/model-op-real-reconciler-wiring.md` |
| GAP-PROD-01 | P0 | PRD-TEST-015 / SCOR：无冻结 rubric/cohort/calibration；B 端数值分暂停；依赖 INT-TRANSCRIPT 事实根 | 先 INT-TRANSCRIPT-00/01；再 SCOR-01…08 IssuedQuestionContract + AnswerVersion；校准前无排序/自动决策 | product / privacy | EXEC-01 / SCOR 包（前置 INT） | scor/int transcript prove；公开写门 inventory |
| GAP-PROD-02 | P0 | C/B 产品审计 P0：申请↔面试无不可替代绑定；同意边界；B 端浏览器闭环不足（`product-readiness-c-b-audit` P0-CB-01…03） | application-bound session/snapshot；目的限定同意/撤回；三主体浏览器矩阵进 CI | product / e2e | P0-CB-01→02→03 顺序 | 浏览器 E2E harness + 现有 HTTP/数据门 |
| GAP-PROD-03 | P1 | 企业 tenant/席位/账单、ATS 流程、职位透明度、评分公平性等未接线（C/B P1 表） | 未完成项销售/权限标「未提供」；落地须独立 UC+审 | product | 商业化扩面（P0 清零后） | 按 UC 分域 prove |
| GAP-SCH-01 | P1 | **STOPPED / superseded by PG-retained** — MySQL schema skeleton historical（was INFLIGHT:mysql-schema-prove）；~130 PG mig / RLS retained as truth · **Ban** MySQL sole relational cutover | Keep Postgres business schema + RLS; no MySQL replace-PG | schema | closed-as-direction · see `adr-postgres-retained.md` | `harness/mysql-schema.skeleton.md`（STOPPED） |

---

## B. 遗留 BUG / 假绿 / 审查阻塞

| ID | P0/P1 | 现状 | 目标 | 归属域 | 拟切片 | 所需 harness 路径 |
|----|-------|------|------|--------|--------|-------------------|
| BUG-PRIV-503 | P0 | **公开 DELETE=503 必须保持**直至独立 prove+专家审；任何「删除已闭环」叙事均为假 | 维持 HTTP 503 pin；预览路径不得写成生产 SLO / completed | privacy | 冻结项（非功能开发）；放开仅经审 | `pnpm privacy-erasure:http:prove`；preview prove `productionSloClaimed=false` |
| BUG-PRIV-TENANT | P0 | 误把「每次查询注入 `owner_user_id`」或 tenant helpers 写成已替代 RLS → **授权根静默降级**风险；审查仍挡 cutover | 文档/代码评论钉死 tenant≠RLS；接线绕开 `set_config` 的 PR **block** | privacy | 活门守护 + 审查清单 | `harness/tenant-enforcement.prototype.md`；`git diff` principal.ts 空变更门 |
| BUG-FAKE-R5 | P0 | **SUPERSEDED cutover reading (2026-09-17)** — under PG-retained, pgvector **is** vector truth; local prove green still **≠** product RAG/R4 closed / HA / suite green. Former "must retire pgvector for Qdrant" direction **STOPPED**. | Honesty: prove EXIT=0 ≠ R4/FUNNEL/HA/suite; Ban Qdrant-required cutover | rag / e2e | direction STOPPED · harness `r5-*` / `m5-*` pinned STOPPED | `harness/r5-pgvector-fixture-mark-red.md`（STOPPED）· `m5-pgvector-fixture-retirement-plan.md`（STOPPED）· `adr-postgres-retained.md` |
| BUG-FAKE-QBANK-EVAL | P1 | `qbank-retrieval-eval-pg` / `rag-adversarial-pg-eval` 易被误读为生产检索质量（PRD-TEST-003/004）；长问句 lexical AND→0 命中等已暴露 | 改名 legacy 或重建为当前 generation schema；真实 embed 显式旗；词法 AND/OR 单列决策 | rag / e2e | 评测诚实化 + R5 标红同列 | `qbank-retrieval-eval:prove:raw`；adversarial pg-eval |
| BUG-FAKE-CONN | P0 | mysql-stack skeleton/ping/m2/m3/m4/m5 **文档/连通绿** 被误写成队列/RAG/隐私/reconciler **已迁** | 所有 sole-stack prove 输出钉 **本绿≠已迁 / pass≠cutover**；审查拒绝叙事越权 | e2e / model-op / rag / privacy | 静态钉已在各 `mysql-stack:*:prove`；持续守门 | `pnpm mysql-stack:{skeleton,ping,m2-tenant,m3-queue,m4-rag,m5-fixtures}:prove` |
| BUG-NOTIFY-REC | P0 | 生产 wakeup 仍依赖 **lossy NOTIFY**；reconcile 未在 sole stack 证明 → 漏唤醒窗口 | Redis Streams hint + **强制** periodic reconcile；旧 `worker-wakeup:prove` 迁栈后标红 | model-op | 与 GAP-MOP-01/03 同列切流 | `harness/redis-streams-wakeup.prototype.md`；双 reconciler prove |
| BUG-REV-COND | P0 | mw-privacy-int 对 tenant 雏形结论 **conditional**：允许合入 additive，**切流/放弃 RLS 仍 block** | 切流前 ADR 隐私 prove 清单全绿 + 四专家审；禁止自批 | privacy | 审查阻塞项（流程） | review `reviews/2026-09-10-tenant-enforcement-mw-privacy-int.md` |
| BUG-CP-CLAIM | P0 | checklist / PR 易越权勾 `controlPlaneClosed` 或宣称 INT-TRANSCRIPT / MEM 控制面已关（#103 正防此类） | 保持未关；prove-path honesty；`releaseEvidence=false` | privacy / product | 文档/清单诚实标注 ◐ | `pnpm mem00-int00:prove-path`（#103） |
| BUG-RAG-FULLTEXT | P0 | 若有人以 MySQL FULLTEXT / `MATCH…AGAINST` 「等价」关闭 R3 → **假绿关闸** | 书面禁令 + prove 拒绝 FULLTEXT 冒充 `to_tsvector('simple', qbank_search_terms(…))` | rag / schema | R3 定案门禁测试 | m4 静态 prove 钉「禁止 FULLTEXT」；后续 hybrid prove |
| BUG-SCORE-LEGACY | P0 | 历史公开伪评分路径已 410/止血，但可比评分/校准未建；题目均分不可作同尺度排名（PRD-TEST-001/015） | 保持 B 端 `assessment_unavailable` / 无自动决策直至 SCOR+校准 | product / e2e | 与 GAP-PROD-01 同列；防回归 | `pnpm scor-00:http:prove`；公开写门 prove |
| BUG-E2E-ISO | P1 | 宽 `e2e:isolated` / performance suite 默认绑同一 pgvector 镜像；云 serial runner 拒绝 migration/vector 全套（PRD-TEST-008）；无 `MODEL_API_KEY` → family **blocked**（`g6-e2e-iso-blocked` honesty） | 夹具拆分：关系面 MySQL、向量面 Qdrant；云故障证据另轨；**G6 still OPEN**（cite ≠ G6 closed ≠ R5 retired ≠ family green） | e2e | R5 退役阶段 3–4；云 profile 另 FINDING；G7-K3 cite align | `g6-e2e-iso-blocked` honesty pin（`harness/g6-e2e-iso-blocked.md` · `pnpm g6-e2e-iso-blocked:prove`）；`scripts/run-e2e-isolated.mjs`；`run-e2e-performance-suite.mjs` |

---

## C. 行统计与维护

| 区段 | 行数（数据行） |
|------|----------------|
| A. 需求/产品设计缺口 | **16** |
| B. 遗留 BUG/假绿/审查阻塞 | **11** |
| **合计 P0/P1 库存行** | **27** |

| 优先级拆分（合计 27） | 计数 |
|----------------------|------|
| P0 | 22 |
| P1 | 5 |

**In-flight 覆盖（非另计关闭）**：tenant-conditional · redis-wakeup-wip（orthogonal under PG-retained）· pr-model-op-calib (#102) · pr-privacy-prove (#103/#104)。  
**STOPPED 2026-09-17（PG-retained）**：mysql-schema-prove · qdrant-store-wip · pr-docs-gates (#106/#107 MySQL+Qdrant cutover docs)。

**复制**：`.tmp/pg-mysql-pivot/gap-bug-backlog.md`（与本文同文；pivot 工作区便利副本）。

**纪律**：更新本表时保持 `releaseEvidence=false` / Not HA / sole stack / DELETE=503 冻结 / 本绿≠已迁；新假绿入口优先进 **B**；新产品未接线优先进 **A**。
