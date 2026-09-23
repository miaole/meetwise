# Harness / 评测集 — R4 题域隔离（GAP-RAG-04 · G4）

**releaseEvidence=false** · **Not HA** · **本绿 ≠ 已迁 / ≠ cutover** · **pass ≠ R4/FUNNEL/G-R4-5 all closed** · **EG3 / 题域 isolation product face closed under authorize**（`domainIsolationClosed=true` · `eg3ProductClosed=true`）· **R4/FUNNEL product face closed under authorize**（`r4ProductClosed=true` · `funnelProductClosed=true`）· **EG4 / wrong-track product face closed under authorize**（`eg4ProductClosed=true` · `wrongTrackProductClosed=true`）· **EG5 / product SSOT product face closed under authorize**（`eg5ProductClosed=true` · `productSsotFlipped=true`）· **≠ invent coveredCount** · **≠ wrong_track=0 invent** · **MS3 ≠ R4** · **gR45Closed=false**  
**对照**：`m4-rag-hard-gates.md` §R4 · `gap-bug-backlog.md` GAP-RAG-04 · `harness/r4-domain-isolation-status.md` · `eval/r4-domain-isolation.eval.md`  
**待审专家**：`mw-rag-route` + `mw-e2e-ha`（双域；实现方禁止自批）

---

## 0. 本切片验收立场（先读）

| 声明 | 裁定 |
|------|------|
| **R4 是否已关？** | **否。G-R4-5 STILL OPEN · gR45Closed=false。** EG3 / 题域 isolation product face **closed under authorize**（`domainIsolationClosed=true` · `eg3ProductClosed=true`）· R4/FUNNEL product face **closed under authorize**（`r4ProductClosed=true` · `funnelProductClosed=true`）· EG4 / wrong-track product face **closed under authorize**（`eg4ProductClosed=true` · `wrongTrackProductClosed=true` · knife `g-r4-5-eg4-wrong-track-product-close`）· EG5 / product SSOT product face **closed under authorize**（`eg5ProductClosed=true` · `productSsotFlipped=true` · knife `g-r4-5-eg5-product-ssot-product-close`）。本 harness 仍钉「≠ G-R4-5 all closed · ≠ invent coveredCount · ≠ wrong_track=0 invent · MS3 ≠ R4 · Ban flip gR45Closed」；**不得**把 prove EXIT=0 写成 G-R4-5 all closed |
| **可关闭的子切片？** | **partial P-WIRE**（scoped call path）可登记；**仍非** wrong_track=0 / R4 关。产品未就绪时 **禁止假绿关闸** |
| **R1 / R2** | **PREREQ 仍开**：R1 legacy「技术岗」默认仍在；R2 **wire 已齐** / **overall NOT closed**（≠ 路由已生效；P-LIVE dual 收据齐；仍 ≠ 路由已生效）；缺 snapshot → retrieve-side fail-closed（G-R2-5） |
| **RAG-FUNNEL-01 metadata** | **PREREQ 仍开**：无独立 `MetadataReviewReceipt` serving；01A 源码密封 ≠ 01 关闭 |
| **Worker 检索（partial）** | `localRetrieve` → `cachedQbankSearch(..., scope?)`：snapshot 主叶 scope；缺失/非法 snapshot → `route_snapshot_missing` degraded denial，**不再 unscoped**；**仍不**调用 `dispatchTrackLocalRetrieval`（无 plan+recheck） |
| **合同 seam** | `dispatchTrackLocalRetrieval` + `pnpm rag04-track-local:prove` = **prove-shell / PG 夹具**；**≠** 生产 full wire；属 **R5 假绿家族** |
| **默认生产行为** | R2 未齐时多数 job 可能无 snapshot；此时 Worker local retrieve **fail-closed**（不发 unscoped query），role 默认「技术岗」与 full dispatch/recheck 仍使 **R4 未关闭**；有 snapshot 时主叶硬过滤（≠ per-turn planner leaf） |
| **证据** | `releaseEvidence=false`；Not HA；≠ sole cutover；≠ flip default；**≠ wrong_track=0** |

专家先审 **本评测集是否够格当 R4 诚实门**；通过后仍 **不**宣称 R4 closed。

---

## 1. 库存（当前 R4 / domain isolation proves）

### 1.1 合同 / prove-shell（存在 ≠ 生产隔离）

| 入口 | 测什么 | 诚实读法 |
|------|--------|----------|
| `pnpm rag04-track-local:prove` | track-local dispatch + serving_scope 硬过滤 + recheck（真 PG） | **prove-shell**；R5-MARKED-RED 夹具族；**≠ 生产 Worker 接线**；绿 ≠ R4 关 |
| `packages/db/src/qbank-track-local-retrieval.ts` | `dispatchTrackLocalRetrieval` seam | 合同代码；Worker **未消费** |
| `packages/db/src/qbank-generation-retrieval.ts` | GUC `app.qbank_serving_scope` + hybrid | R3 落点；生产 **可**传 optional scope（partial） |
| `pnpm g4-production-scoped-retrieve:prove` | resolver unit + 静态 partial wire | **partial P-WIRE**；绿 ≠ R4 关；≠ wrong_track=0 |
| `pnpm g4-dispatch-recheck-prereq:prove` | 静态：Worker 零 dispatch；合同 seam+recheck 仍在；产品阻塞钉 | **honesty PREREQ**；绿 ≠ full wire；≠ R4 关 |
| `pnpm r2-classify-job-route-prereq:prove` | 静态：Inventory + API=0 / Worker sole；wire 齐后仍钉 overall NOT closed | **R2 honesty PREREQ**；绿 ≠ R2 关；≠ 路由已生效 |
| `pnpm rag03-route:prove` / `rag05-qbank-miss:prove` / `rag06-route-scope-cache:prove` | 路由/miss/cache 合同 | 同族 PG 夹具；≠ 生产 routed serving |
| `pnpm mysql-stack:m4-rag:prove` | R1–R5 硬门文档静态钉（含「EG3 domainIsolationClosed=true under authorize · R4/FUNNEL/G-R4-5 all STILL OPEN」） | conn-only；**≠** 隔离已证 |
| `pnpm r1-tech-role-fail-closed:prove` | R1 flag/legacy 合同 | **零** wrong_track 断言；≠ R4 |

### 1.2 生产路径（当前 GAP 事实）

| 路径 | 现状 |
|------|------|
| `apps/worker/src/main.ts` `localRetrieve` | `cachedQbankSearch(..., scope?)` **转发** optional scope；**无** `dispatchTrackLocalRetrieval` |
| `apps/worker/src/qbank-retrieve-scope.ts` | snapshot 主叶 → `QbankServingScopeInput` / explicit retrieve decision | partial；缺失/非法 snapshot → degraded fail-closed |
| `apps/worker/src/interview-consumer.ts` | 每 job 读 snapshot → `decideRouteSnapshotRetrieve` → scoped retrieve 或 degraded denial；**不**调 dispatch |
| `apps/worker/src/adaptive-role-resolve.ts` | R1；默认 legacy「技术岗」 |
| `packages/db/src/recruiter.ts` | revision/bind/snapshot 写面；classify **不**在 recruiter 内联（Worker sole）；R2 overall 仍开 → 不得宣称路由已生效 |
| `classifyJobRoute` | Worker sole + API wakeup（R2 wire）；**overall NOT closed** / ≠ 路由已生效；本 R4 仍依赖 snapshot 消费 |

### 1.3 明确不测 / 不得冒充

| 非目标 | 原因 |
|--------|------|
| 生产读面 `wrong_track=0` | **R4 关闭条件**；本切片未达 |
| 伪造/缺失 metadata、未知分类、并发改岗、旧 checkpoint、cache 回放零跨域 | 关闭条件全集；需生产接线 + 迁栈夹具 |
| 宣称「题域已隔离」 | **假绿**；本 prove 绿只证钉在位 |
| 以 `rag04-track-local:prove` 绿关 R4 | **假绿**（prove-shell + R5 夹具） |
| 切 qbank / 向量真相 / sole default | M4/M5 门；R4 未关前 **不得切** |
| HA / releaseEvidence=true | 禁止 |

---

## 2. PREREQ（fail-closed · 产品未就绪则不得关 R4）

关闭 R4 **之前**必须同时满足（本切片 **登记为未满足**）：

| ID | PREREQ | 现状 |
|----|--------|------|
| **P-R1** | R1：生产不再依赖 legacy「技术岗」默认，且 flag-on 有组合根证据 | **未关**（`GAP-RAG-01`；默认 flag-off） |
| **P-R2** | R2：生产路径实际跑 `classifyJobRoute` → bind → immutable snapshot；Worker **消费** snapshot 而非猜桶 | **未关 overall**（`GAP-RAG-02`；**wire 已齐**：P-MODEL…P-START/P-FAKE dual-passed + G-R2-5；**≠ 路由已生效**；P-LIVE dual 收据齐；仍 ≠ 路由已生效；`r2-classify-job-route-prereq:prove` 诚实钉） |
| **P-META** | RAG-FUNNEL-01：独立 `MetadataReviewReceipt` serving + 完整 facets + 标准部署 handoff | **未关**（01A ≠ 01） |
| **P-WIRE** | Worker `localRetrieve` 经 `cachedQbankSearch(..., scope)`（snapshot 主叶）**或** full `dispatchTrackLocalRetrieval`（plan+recheck） | **partial**：scoped call + 缺 snapshot fail-closed 已接线（G-R2-5）；**full** dispatch/recheck / per-turn leaf 未齐（`g4-dispatch-recheck-prereq:prove` 诚实钉：本刀仍因产品阻塞 **不接线**） |
| **P-FIX** | wrong_track=0 证明不在假绿 pgvector 默认夹具上冒充 sole-stack / 发布 | R5/G2 仍开；rag04 仍 PG isolation |

任一 PREREQ 未满足 → **R4 保持 NOT closed**；本 prove **必须**继续钉否定句。

---

## 3. 测什么（本 prove 必须覆盖 · 诚实钉）

| ID | 测什么 | 期望 |
|----|--------|------|
| **E1** | harness / status / eval / prove 脚本存在 | 路径存在 |
| **E2** | 文档钉 `EG3 domainIsolationClosed=true under authorize · R4/FUNNEL/G-R4-5 all STILL OPEN` / `不宣称题域已隔离` / `pass ≠ R4 已关` | 正则命中 |
| **E3** | 文档钉 PREREQ：R1、R2、MetadataReviewReceipt / RAG-FUNNEL-01、P-WIRE partial/full | 命中 |
| **E4** | 文档钉 `releaseEvidence=false` · Not HA · 本绿≠已迁 · ≠ sole cutover | 命中 |
| **E5** | 库存列出 `rag04-track-local:prove` 且标 **≠ 生产 / ≠ R4 关** | 命中 |
| **E6** | 静态：`main.ts` 转发 `scope` 入 `cachedQbankSearch`；**无** `dispatchTrackLocalRetrieval`；consumer 调 `decideRouteSnapshotRetrieve` + degraded denial | partial P-WIRE 钉（≠ R4 关） |
| **E7** | 静态：`apps/api` **零** `classifyJobRoute(`；Worker sole + wakeup；R2 status 仍钉 **NOT closed** / ≠ 路由已生效 | 命中（≠ R2 关） |
| **E8** | 静态：track-local seam 文件仍存在（合同未删） | 存在 |
| **E9** | gap-bug-backlog GAP-RAG-04 指向本 harness；m4 §R4 仍钉 NOT closed | 命中 |
| **E10** | 禁止假绿句：不得在 harness/status 无否定语境下写「题域已隔离」为已关结论 | 否定句保留 |

---

## 4. 命令与期望 EXIT

| CMD | 期望 EXIT | 含义（诚实） |
|-----|-----------|--------------|
| `pnpm mysql-stack:r4-domain-isolation:prove` | **0** | E1–E10 静态诚实钉可跑；**≠ R4 已关**；**≠ 题域已隔离** |
| `pnpm conn-stack:r4-domain-isolation:prove` | **0** | 同上（body） |
| `pnpm mysql-stack:m4-rag:prove` | **0** | M4 硬门仍含 R4 NOT closed；≠ RAG 切流 |
| `pnpm r1-tech-role-fail-closed:prove` | **0** | R1 合同仍绿；≠ R1/R4 关 |
| `pnpm g4-production-scoped-retrieve:prove` | **0** | partial P-WIRE unit+静态；**≠ R4 关**；**≠ wrong_track=0** |
| `pnpm g-r2-5-retrieve-fail-closed:prove` | **0** | G-R2-5 retrieve-side fail-closed；**≠ R2/R4 关** |
| `pnpm g4-dispatch-recheck-prereq:prove` | **0** | dispatch/recheck **未接线** PREREQ+阻塞钉；**≠ full wire**；**≠ R4 关** |

可选旁证（**不**纳入本切片关闭条件；缺则不得写入「生产隔离已证」）：

| CMD | 读法 |
|-----|------|
| `pnpm rag04-track-local:prove` | prove-shell 合同仍可跑；**R5 假绿族**；绿 ≠ R4 |

---

## 5. 假绿标红清单（审查必勾）

| 若有人说… | 正确读法 |
|-----------|----------|
| 「r4-domain-isolation:prove 绿了所以题域已隔离」 | **假绿**。本绿 = PREREQ+否定钉 |
| 「rag04 绿了所以 R4 关了」 | **假绿**。prove-shell + 非生产接线 + R5 夹具 |
| 「snapshotInterviewRoute 在 recruiter 里所以路由已生效」 | **假绿 / R2**。wire 虽齐，overall NOT closed / ≠ 路由已生效；retrieve fail-closed ≠ 路由已生效 |
| 「role 已参数化所以题域隔离好了」 | **假绿 / R1≠R4**。role 字符串 ≠ track 硬过滤 |
| 「main 传了 scope 所以题域已隔离 / R4 关了」 | **假绿**。partial P-WIRE ≠ wrong_track=0；缺 snapshot 虽已 fail-closed，仍无 dispatch/recheck |
| 「g4-dispatch-recheck-prereq:prove 绿了所以 dispatch 已齐 / R4 关了」 | **假绿**。本绿 = **未接线** 诚实钉 + 产品阻塞；≠ full wire |
| 「g4-production-scoped-retrieve:prove 绿 = R4 关」 | **假绿**。只证 partial wire + 否定钉 |
| 「m4-rag:prove 绿 = RAG/题域切流」 | **假绿**（BUG-FAKE-CONN） |
| 「Metadata 01A 密封 = 可关 R4」 | **假绿**。缺 MetadataReviewReceipt serving |

---

## 6. 代码与文档锚点

| 路径 | 角色 |
|------|------|
| `ai-docs/delivery/harness/r4-domain-isolation.md` | 本 harness |
| `ai-docs/delivery/harness/r4-domain-isolation-status.md` | Proven vs GAP |
| `ai-docs/delivery/eval/r4-domain-isolation.eval.md` | 评测证明材料 |
| `scripts/conn-stack/mysql-stack.r4-domain-isolation.proof.mjs` | 静态 prove body |
| `scripts/mysql-stack.r4-domain-isolation.proof.mjs` | S4 forwarder |
| `ai-docs/delivery/m4-rag-hard-gates.md` §R4 | 硬门否定句 |
| `ai-docs/delivery/gap-bug-backlog.md` GAP-RAG-04 | 缺口登记 |
| `packages/db/src/qbank-track-local-retrieval.ts` | 合同 seam（未生产接线） |
| `apps/worker/src/main.ts` | 生产 optional-scope 检索（partial P-WIRE） |
| `apps/worker/src/qbank-retrieve-scope.ts` | snapshot → serving scope helper |
| `apps/worker/src/interview-consumer.ts` | 每 job 解析 scope 闭包 |
| `reviews/REQUEST-g4-production-scoped-retrieve-mw-rag-route.md` | 本刀双审（rag） |
| `reviews/REQUEST-g4-production-scoped-retrieve-mw-e2e-ha.md` | 前序 partial P-WIRE 双审（e2e-ha） |
| `apps/worker/test/g-r2-5-retrieve-fail-closed.proof.ts` | G-R2-5 可执行 fail-closed prove |
| `reviews/REQUEST-g-r2-5-retrieve-fail-closed-mw-rag-route.md` | 本刀双审（rag-route） |
| `reviews/REQUEST-g-r2-5-retrieve-fail-closed-mw-e2e-ha.md` | 本刀双审（e2e-ha） |
| `reviews/REQUEST-2026-09-16-g4-dispatch-recheck-FOLLOW-mw-rag-route.md` | FOLLOW 双审（rag-route · pre-exec） |
| `reviews/REQUEST-2026-09-16-g4-dispatch-recheck-FOLLOW-mw-e2e-ha.md` | FOLLOW 双审（e2e-ha · pre-exec） |
| `reviews/REQUEST-2026-09-16-r4-real-wire-mw-rag-route.md` | REAL-WIRE 双审（rag-route · pre-exec）→ `2026-09-16-r4-real-wire-mw-rag-route.md` **pass · correctly NOT wiring** |
| `reviews/REQUEST-2026-09-16-r4-real-wire-mw-e2e-ha.md` | REAL-WIRE 双审（e2e-ha · pre-exec）→ `2026-09-16-r4-real-wire-mw-e2e-ha.md` **pass · correctly NOT wiring** |
| `harness/r4-p-planner.md` | P-PLANNER **`post_prove_dual_pass`（unit only）**；dispatch 仍未接线；≠ R4 关 |
| `reviews/2026-09-16-r4-p-planner-post-prove-mw-rag-route.md` | P-PLANNER post-prove **pass**（unit only） |
| `reviews/2026-09-16-r4-p-planner-post-prove-mw-e2e-ha.md` | P-PLANNER post-prove **pass**（unit only） |
| `harness/r4-real-wire-impl.md` | **下一刀** REAL-WIRE-IMPL（`REQUEST-ready` / `not_run:pre_dual_review` · await dual） |

---


---

## 6b. FOLLOW knife — G4 dispatch/recheck recheck（2026-09-16 · **post-prove**）

**本刀名**：R4 / G4 **dispatch-recheck FOLLOW**（honesty recheck · **不接线**）  
**硬闸**：`north-star-hard-gates.md` **已生效**（文档闸）；非happy prove **不笼统开跑**。  
**流程**：harness/eval → pre-exec REQUEST → **独立双审 pass** → honesty subset prove（EXIT=0）→ **post-prove REQUEST**（再审）。实现方 **禁止自批** · **EXIT=0 ≠ R4 关**。

### 6b.1 相对 2026-09-10 dual-pass 的差距盘点

| # | 项 | 09-10 时 | 2026-09-16 现状 | FOLLOW 读法 |
|---|----|----------|-----------------|-------------|
| D1 | 缺 snapshot retrieve | 仍 unscoped（P-FAILCLOSED 阻塞） | **G-R2-5 retrieve-side CLOSED**（`route_snapshot_missing` → degraded；不发 unscoped） | 旧 REQUEST 的 P-FAILCLOSED **过时**；不得再写「缺 snapshot 仍 unscoped」 |
| D2 | R2 classify wire | apps 零 classify | **wire 已齐**（Worker sole + API wakeup + P-LOOP/START/FAKE dual-passed） | **overall 仍 NOT closed**（≠ 路由已生效；P-LIVE dual 收据齐；仍 ≠ 路由已生效） |
| D3 | partial P-WIRE | scoped call 已双审 | 仍 partial（主叶 scope） | ≠ R4 关；≠ wrong_track=0 |
| D4 | full `dispatchTrackLocalRetrieval` + recheck | Worker **零**调用 | **仍零**（`rg` / prove 钉） | **仍正确不接线** |
| D5 | per-turn planner → `RetrievalPlan` | 无 | **unit 组装已 dual-close；Worker src 仍零 planner→retrieve** | P-PLANNER unit 后续已关；full wire 仍未接 |
| D6 | wrong_track=0 / NHP-R4-ADV-01 | NOT closed | **仍 gap/blocked** | 禁假绿关闸 |
| D7 | 09-10 dual pass 范围 | honesty PREREQ 登记 only | 收据仍有效 **仅限当时范围**；**不**覆盖 FOLLOW 后事实表 | FOLLOW 须 **新 REQUEST** 再审 |

### 6b.2 产品阻塞（为何 FOLLOW 仍 **不** full-wire · fail-closed）

| ID | 阻塞 | 现状 |
|----|------|------|
| **P-PLANNER** | Worker 图无 per-turn `InterviewPlannerOutput` → `RetrievalPlan` | **后续 CLOSED（unit）**；仍未进 retrieve；禁假造 plan |
| **P-R2** | R2 overall NOT closed / ≠ 路由已生效 | **仍开**（wire≠closed） |
| **P-FAKEPLAN** | 把主叶硬塞进 `RetrievalPlan` 而无 generation/recipe/planner | **禁止**（假绿） |
| **P-FAILCLOSED**（retrieve） | 缺 snapshot unscoped | **CLOSED（G-R2-5 dual-passed）** — 不再作为「不接线」理由 |
| **P-WT0** | 生产 wrong_track=0 | **未证** |

→ **裁定**：FOLLOW = 刷新诚实钉 + 双审 REQUEST；**不**实现 full dispatch/recheck；**不**宣称 R4 / 题域已隔离。

### 6b.3 非快乐路径列（NHP-R4 · 或显式 blind/gap）

| 列 | Case ID | 旗 | 期望（结构） | 本刀 |
|----|---------|----|--------------|------|
| NEG | NHP-R4-NEG-01 | **partial** | 缺/非法 snapshot → `route_snapshot_missing` + degraded；不进 unscoped | 引 G-R2-5；≠ R4 关 |
| FAULT | NHP-R4-FAULT-01 | **gap**/blind | 生产路径出现 `recheck_failed` / seam recheck 可观测 | **无生产 recheck**；合同 seam 仅 proof |
| BOUND | NHP-R4-BOUND-01 | **partial**/honesty | 有 snapshot 仅 primary max-bps leaf；非 per-turn leaf | 静态钉；≠ full wire |
| ADV | NHP-R4-ADV-01 | **partial**/honesty-pin | wrong_track=0 跨域 | **≠ covered**；≠ R4 closed（case-matrix §1.5） |
| PERF | NHP-R4-PERF-01 | **blind** | 隔离检索 P95 收据 | 未建；禁 pgvector 机械绿 |
| LOAD | NHP-RAG-LOAD-01 | **blind** | 检索并发收据 | 见 NHP 总册；≠ 发布 SLO |

对照：`non-happy-path-perf-load-case-matrix.md` §1.5 · `harness/non-happy-path-perf-load-matrix.md`。  
**硬闸生效 ≠** 本表已执行；本 FOLLOW **不跑** NHP prove 笼统绿关。

### 6b.4 Honesty prove subset（pre-exec dual 后 · **已跑** · EXIT 见下）

| CMD | 期望 EXIT | 实测（2026-09-16 ~04:46–04:47 PT · HEAD `639134f`） | 读法 |
|-----|-----------|------------------------------------------------------|------|
| `pnpm g4-dispatch-recheck-prereq:prove` | **0** | **0** | 未接线 + 阻塞钉；**≠ full wire**；**≠ R4 关** |
| `pnpm g-r2-5-retrieve-fail-closed:prove` | **0** | **0** | retrieve-side；≠ R2/R4 关 |
| `pnpm g4-production-scoped-retrieve:prove` | **0** | **0** | partial；≠ wrong_track=0 |
| `pnpm r2-classify-job-route-prereq:prove` | **0** | **0** | R2 overall NOT closed；≠ 路由已生效 |
| `pnpm mysql-stack:r4-domain-isolation:prove` | **0** | **0** | 诚实钉；≠ 题域已隔离 |
| `pnpm mysql-stack:m4-rag:prove` | **0** | **0** | §R4 NOT closed 仍在 |

收据：`.tmp/r4-follow-post-prove-20260916/` · 详 `eval/r4-domain-isolation.eval.md` §6.3 · `r4-domain-isolation-status.md` §6.1。  
**MODEL_API_KEY**：本 FOLLOW **不要求**；fail-closed / 静态钉优先；无 Key ≠ 假绿。  
**仍未接线**：Worker **零** `dispatchTrackLocalRetrieval(`；无 planner→`RetrievalPlan`。

### 6b.5 REQUEST

| 阶段 | 专家 | 路径 | 状态 |
|------|------|------|------|
| pre-exec | `mw-rag-route` | `reviews/REQUEST-2026-09-16-g4-dispatch-recheck-FOLLOW-mw-rag-route.md` | dual-pass → `2026-09-16-g4-dispatch-recheck-FOLLOW-mw-rag-route.md` |
| pre-exec | `mw-e2e-ha` | `reviews/REQUEST-2026-09-16-g4-dispatch-recheck-FOLLOW-mw-e2e-ha.md` | dual-pass → `2026-09-16-g4-dispatch-recheck-FOLLOW-mw-e2e-ha.md` |
| **post-prove** | `mw-rag-route` | `reviews/REQUEST-2026-09-16-g4-dispatch-recheck-FOLLOW-post-prove-mw-rag-route.md` | dual-pass → `2026-09-16-g4-dispatch-recheck-FOLLOW-post-prove-mw-rag-route.md` |
| **post-prove** | `mw-e2e-ha` | `reviews/REQUEST-2026-09-16-g4-dispatch-recheck-FOLLOW-post-prove-mw-e2e-ha.md` | dual-pass → `2026-09-16-g4-dispatch-recheck-FOLLOW-post-prove-mw-e2e-ha.md` |

前序（**≠** R4 关 / **≠** 自动放行 full wire）：`REQUEST-g4-dispatch-recheck-prereq-*`（09-10）· `REQUEST-g-r2-5-retrieve-fail-closed-*` · NHP 矩阵文档闸。


---

## 6c. R4-REAL-WIRE knife — 真接线 inventory（2026-09-16 · **pre-exec dual-passed · correctly NOT wiring**）

**本刀名**：R4 / G4 **REAL-WIRE**（`dispatchTrackLocalRetrieval` + recheck + planner 消费 · **真接线评估**）  
**前序**：FOLLOW honesty **post-prove dual-passed**（`2026-09-16-g4-dispatch-recheck-FOLLOW-post-prove-mw-{rag-route,e2e-ha}.md`）· **≠** 本刀授权 coding / prove 绿关  
**硬闸**：`north-star-hard-gates.md` 文档闸；实现方 **禁止自批**；`releaseEvidence=false` · Not HA · **≠ flip default** · **≠ open DELETE**  
**本刀裁定（实现方）**：**产品风险高 → 停在 harness + REQUEST**；**await dual before code/prove**；**不**假造 `RetrievalPlan`。

### 6c.1 最小诚实接线路径（intended wire · 未实施）

| 步 | 组件 | 意图行为 | 现状 |
|----|------|----------|------|
| W1 | `InterviewPlannerOutput`（per-turn） | 图内输出 `{leafTrackId, competencyId, difficulty}`，经 `validatePlannerOutput` 相对 snapshot | **P-PLANNER CLOSED（unit）**；**REAL-WIRE 已消费** assemble→dispatch |
| W2 | `RetrievalPlan` 组装 | 冻结 `snapshotId` / `routeScopeDigest` / leaf / taxonomy / competency / difficulty / **generationId** / **recipeId** / policyVersion | **unit 组装器已 dual-close；仍未进生产 retrieve**；缺 generation/recipe = 禁硬塞（P-FAKEPLAN） |
| W3 | `dispatchTrackLocalRetrieval(pool, owner, plan, deps)` | validate → freeze/CAS → `cachedQbankSearch(..., scope)` → `recheckHitsAtLeaf` → served / recheck_failed | 合同 seam **在**；Worker **CALL_SITES≥1**（REAL-WIRE-IMPL） |
| W4 | Worker 消费点 | `interview-consumer` / `trackLocal` → `retrieveViaDispatchTrackLocal`；处理 `served` / `recheck_failed` / `rejected` / `replayed` | **已接线**（REAL-WIRE-IMPL）；缺 snapshot **G-R2-5 fail-closed** |
| W5 | recheck fail-closed | `recheck_failed` → **不**回退兄弟叶 / unscoped / legacy_unrouted；不写 question_ready | 仅合同 seam；**生产无** recheck 观测（NHP-R4-FAULT-01 gap） |
| W6 | 证明面 | 静态调用点 + 生产 wrong_track=0（ADV）+ NHP 六列 | 调用点 **CALL_SITES≥1**（REAL-WIRE-IMPL）；ADV unit+map **dual-close**（§6f）；LIVE_PG **`post_prove_dual_pass`（honesty only）**（§6g）；**LIVE_PG_GAP dual receipts landed（honesty）**；仍 ≠ covered |

### 6c.2 假绿风险（审查必勾）

| 风险 | 为何假绿 | 本刀对策 |
|------|----------|----------|
| **P-FAKEPLAN** | 把 snapshot **主叶**硬塞进 `RetrievalPlan`（无 planner / generation / recipe）冒充 full wire | **禁止**；本刀不接线 |
| 「Worker 出现一次 `dispatchTrackLocalRetrieval(` = R4 关」 | 调用点 ≠ wrong_track=0 ≠ 题域已隔离 | 钉：wire 绿 ≠ R4 关；ADV 仍 gap |
| 「FOLLOW dual-pass = 可真接线」 | FOLLOW 只批 honesty / 仍不接线 | 本刀 **新** REQUEST；不继承 FOLLOW 批准范围 |
| 「rag04 / g4-dispatch-recheck-prereq 绿 = 已齐」 | prove-shell / **未接线** 钉 | 标红保留 |
| 破坏 G-R2-5 | 缺 snapshot 又回 unscoped | 真接线后仍须 fail-closed |
| flip default / open DELETE / HA / `releaseEvidence=true` | 越权切流 | **禁止** |
| 实现方自批 dual | 硬门 | 须 `mw-rag-route` + `mw-e2e-ha` |

### 6c.3 产品阻塞（inventory 审查时；P-PLANNER 后续已 unit-close）

| ID | 阻塞 | 现状 | 挡接线？ |
|----|------|------|----------|
| **P-PLANNER** | 无 per-turn `InterviewPlannerOutput` → retrieve | **CLOSED（unit）**；仍未进 retrieve | **否**（不再挡打开 impl 刀；接线本身仍待） |
| **P-FAKEPLAN** | 主叶硬造 plan | **禁令仍在** | **是** |
| **P-R2** | overall NOT closed / ≠ 路由已生效 | **仍开**（wire≠closed） | **是**（关闸并列） |
| **P-R1** | legacy「技术岗」默认 | **仍开** | **是**（R4 关闸 PREREQ） |
| **P-META** | MetadataReviewReceipt / RAG-FUNNEL-01 | **仍开** | **是** |
| **P-WT0** / G-R4-2 | wrong_track=0 | **未证** | **是**（关 R4；≠ 仅接线） |
| G-R4-1 | full dispatch/recheck / per-turn leaf | **仍 gap** | 本刀目标；阻塞未解则不假接 |

→ **裁定**：inventory + NHP 列刷新 + **pre-exec dual REQUEST**；**不**改 `apps/worker/src`；**不**跑 prove 绿关本刀；**await dual**。

### 6c.4 NHP-R4 列（本刀读法 · 相对 FOLLOW 无升格）

| 列 | Case ID | 旗 | REAL-WIRE 期望（若将来接线） | 本刀 |
|----|---------|----|------------------------------|------|
| NEG | NHP-R4-NEG-01 | **partial** | 缺 snapshot 仍 `route_snapshot_missing`；dispatch `rejected:snapshot_missing` 同族 | 引 G-R2-5；**不**改旗为 covered |
| FAULT | NHP-R4-FAULT-01 | **gap**/blind | 生产可观测 `recheck_failed` | **仍 gap**（无生产 recheck） |
| BOUND | NHP-R4-BOUND-01 | **partial**/honesty | 从「仅主叶」升到 per-turn leaf ∈ allocations | **仍 partial**（未接线） |
| ADV | NHP-R4-ADV-01 | **partial**/honesty-pin | wrong_track=0 | **≠ covered**；ADV `post_prove_dual_pass`（§6f）；LIVE_PG §6g `post_prove_dual_pass`（honesty only）；**LIVE_PG_GAP dual receipts landed（honesty）**；≠ R4 关 |
| PERF | NHP-R4-PERF-01 | **blind** | 隔离 P95 收据 | **blind**；禁 pgvector 机械绿 |
| LOAD | NHP-RAG-LOAD-01 | **blind** | 检索并发收据 | **blind**；≠ 发布 SLO |

### 6c.5 Prove / 命令（本刀 **不跑** 绿关）

| CMD | 本刀期望 | 读法 |
|-----|----------|------|
| （无新 REAL-WIRE prove） | **not_run:pre_dual_review** | 双审前禁止绿关 |
| 既有 honesty subset（FOLLOW） | 可旁证仍绿 | **≠** REAL-WIRE 已齐；**≠** R4 关 |
| `pnpm g4-dispatch-recheck-prereq:prove` | 仍期望 **0**（零调用钉） | 本刀 **未**改 Worker → 钉应仍成立 |

### 6c.6 REQUEST（pre-exec dual）

| 专家 | 路径 | 状态 |
|------|------|------|
| `mw-rag-route` | `reviews/REQUEST-2026-09-16-r4-real-wire-mw-rag-route.md` → `2026-09-16-r4-real-wire-mw-rag-route.md` | **pass**（inventory + **正确不接线**；≠ coding） |
| `mw-e2e-ha` | `reviews/REQUEST-2026-09-16-r4-real-wire-mw-e2e-ha.md` → `2026-09-16-r4-real-wire-mw-e2e-ha.md` | **pass**（同上；≠ R4 关） |

**已批范围**：inventory 诚实 + **本刀正确不接线** + 将来有条件接线规则（须真 planner + 完整 plan 字段 + G-R2-5 + 单独 wrong_track=0）。**未批**：coding · R4 关 · P-FAKEPLAN。  
**历史 next**：P-PLANNER（§6d）`post_prove_dual_pass`（unit）；REAL-WIRE-IMPL（§6e）`post_prove_dual_pass`（wire honesty）；ADV（§6f）`post_prove_dual_pass`（ADV honesty）；LIVE_PG（§6g）`post_prove_dual_pass`（honesty only）。**当前**：R4 仍 NOT closed；NHP-R4-ADV-01 仍 **partial ≠ covered**；parallel covered path 另刀。


## 6d. P-PLANNER knife — true planner（2026-09-16 · **post_prove_dual_pass · unit only**）

**本刀名**：R4 **P-PLANNER**（true per-turn planner unit）  
**状态**：`post_prove_dual_pass`（unit only）  
**证据**：`reviews/2026-09-16-r4-p-planner-post-prove-mw-rag-route.md` · `reviews/2026-09-16-r4-p-planner-post-prove-mw-e2e-ha.md`（均 **pass**）  
**已批边界**：`InterviewPlannerOutput` → validate → 完整 `RetrievalPlan`（generationId/recipeId）unit 合同；P-FAKEPLAN 禁；G-R2-5 保留。  
**未批 / 仍开**：Worker retrieve dispatch **仍未接线**；**≠ R4 closed**；**≠ wrong_track=0**；**≠ full P-WIRE**；`releaseEvidence=false` · Not HA。

| 项 | 裁定 |
|----|------|
| P-PLANNER | **CLOSED（unit）** / `post_prove_dual_pass` |
| dispatch | **仍零** Worker 消费 |
| retrieve | **仍** primary leaf + G-R2-5 |
| R4 | **仍 NOT closed** |
| next | **REAL-WIRE-IMPL post-prove dual**（§6e） |

## 6e. REAL-WIRE-IMPL knife — Worker retrieve 真接线（2026-09-16 · **`post_prove_dual_pass` · wire honesty only**）

**状态**：`post_prove_dual_pass`（wire honesty only）  
**前序**：P-PLANNER **CLOSED（unit）**；pre-exec dual **pass**；meetwise authorize coding+prove。  
**验收链**：planner output → `validatePlannerOutput` → assemble 完整 `RetrievalPlan`（**generationId/recipeId**）→ `dispatchTrackLocalRetrieval` → recheck。  
**硬钉**：保留 **G-R2-5**；禁 **P-FAKEPLAN**；`recheck_failed` **fail-closed**；接线绿 **≠ R4 closed ≠ wrong_track=0**（ADV 单独）。  
**实现锚点**：`apps/worker/src/qbank-track-local-retrieve.ts`（CALL_SITES≥1）；consumer `trackLocal`；main factory。

| 产物 | 路径 / 状态 |
|------|-------------|
| harness | `harness/r4-real-wire-impl.md`（implemented） |
| slice | `r4-real-wire-impl.slice.md` |
| eval | `eval/r4-real-wire-impl.eval.md` |
| prove | `pnpm r4-real-wire-impl:prove` |
| post-prove REQUEST · rag | `reviews/REQUEST-2026-09-16-r4-real-wire-impl-post-prove-mw-rag-route.md` |
| post-prove REQUEST · e2e | `reviews/REQUEST-2026-09-16-r4-real-wire-impl-post-prove-mw-e2e-ha.md` |

→ **REAL-WIRE-IMPL dual-closed（wire honesty）**；**R4 仍 NOT closed**；ADV = §6f `post_prove_dual_pass`；LIVE_PG = §6g `post_prove_dual_pass`（honesty only）。

## 6f. wrong_track=0 ADV knife — 对抗跨域（2026-09-16 · **`post_prove_dual_pass` · ADV honesty only**）

**本刀名**：R4 **wrong_track=0 ADV**（NHP-R4-ADV-01）  
**状态**：`post_prove_dual_pass`（**ADV honesty only**）  
**证据**：`reviews/2026-09-16-r4-wrong-track-adv-post-prove-mw-rag-route.md` · `reviews/2026-09-16-r4-wrong-track-adv-post-prove-mw-e2e-ha.md`（均 **pass · ADV honesty only**）  
**硬钉**：**wire 绿 ≠ ADV closed ≠ wrong_track=0 production covered**；**ADV 绿 ≠ R4 closed**；NHP-R4-ADV-01 = **partial**/honesty-pin **≠ covered**；**LIVE_PG_GAP dual receipts landed（honesty · §6g）**；仍 ≠ covered ≠ HA；G7 draft **≠** success。  
**验收摘要**：在 wired retrieve 上落地 wrong_track assert + `pnpm r4-wrong-track-adv:prove` EXIT=0（伪造/缺失 metadata、未知分类、并发改岗、旧 checkpoint、cache 回放 → unit+map fail-closed）；保留 G-R2-5 / recheck fail-closed；禁 P-FAKEPLAN。全量 live Worker+PG ADV prove 面 → **§6g `post_prove_dual_pass`（honesty only）**。

| 产物 | 路径 / 状态 |
|------|-------------|
| harness | `harness/r4-wrong-track-adv.md`（`post_prove_dual_pass` · ADV honesty only） |
| slice | `r4-wrong-track-adv.slice.md` |
| eval | `eval/r4-wrong-track-adv.eval.md` |
| prove | `pnpm r4-wrong-track-adv:prove` **EXIT=0** |
| post-prove · rag | `reviews/2026-09-16-r4-wrong-track-adv-post-prove-mw-rag-route.md` · **pass** |
| post-prove · e2e | `reviews/2026-09-16-r4-wrong-track-adv-post-prove-mw-e2e-ha.md` · **pass** |

→ **ADV dual-closed（honesty only）**；**R4 仍 NOT closed**；NHP-R4-ADV-01 **≠ covered**；LIVE_PG = §6g `post_prove_dual_pass`（honesty only）。

## 6g. LIVE_PG full-path ADV knife — 关 LIVE_PG_GAP（2026-09-16 · **`post_prove_dual_pass` · honesty only**）

**本刀名**：R4 **wrong_track=0 ADV · LIVE_PG**（关 A3 **LIVE_PG_GAP**）  
**状态**：**`post_prove_dual_pass`（honesty only）**  
**证据**：`reviews/2026-09-16-r4-wrong-track-adv-live-pg-post-prove-mw-rag-route.md` · `reviews/2026-09-16-r4-wrong-track-adv-live-pg-post-prove-mw-e2e-ha.md`（均 **pass · honesty only**）  
**硬钉**：**禁宣称 R4 closed**；**LIVE_PG_GAP dual receipts landed（honesty）** · 仍 ≠ covered ≠ HA；unit ADV ≠ covered；NHP-R4-ADV-01 仍 **partial**（本刀 dual **不**自动升 covered）；G7 draft **≠** success；`releaseEvidence=false` · Not HA；sole allowlist **未翻**；R5 green-risk / pgvector-legacy fixture honesty **保留**。  
**验收摘要**：在 **live wired path**（`retrieveViaDispatchTrackLocal` + 真 PG）上对抗 wrong_track=0 — cache poison / 并发改岗 / metadata 篡改 / 伪造·缺失 metadata / 未知分类 / 旧 checkpoint → **零跨域出题**；**非** unit-only map。prove EXIT=0；`:prove:raw` no-PG EXIT=1。保留 G-R2-5 / recheck fail-closed；禁 P-FAKEPLAN。

| 产物 | 路径 / 状态 |
|------|-------------|
| harness | `harness/r4-wrong-track-adv-live-pg.md`（`post_prove_dual_pass` · honesty only） |
| slice | `r4-wrong-track-adv-live-pg.slice.md` |
| eval | `eval/r4-wrong-track-adv-live-pg.eval.md` |
| prove | `apps/worker/test/r4-wrong-track-adv-live-pg.proof.ts` · `pnpm r4-wrong-track-adv-live-pg:prove` EXIT=0 · `:prove:raw` EXIT=1 |
| post-prove · rag | `reviews/2026-09-16-r4-wrong-track-adv-live-pg-post-prove-mw-rag-route.md` · **pass** |
| post-prove · e2e | `reviews/2026-09-16-r4-wrong-track-adv-live-pg-post-prove-mw-e2e-ha.md` · **pass** |

→ **LIVE_PG dual-closed（honesty only）**；**R4 仍 NOT closed**；**LIVE_PG_GAP dual receipts landed（honesty）** · 仍 ≠ covered ≠ HA；NHP-R4-ADV-01 **仍 partial**。


## 7. 非目标 / 禁止宣称

- **不宣称题域隔离已关 / R4 closed**  
- **不切** qbank 生产路径 / 向量真相 / Worker 出题默认  
- **不**把本 prove 写成 covered / HA / sole cutover / flip default  
- `releaseEvidence=false`；实现方 **禁止自批**；须 `mw-rag-route` + `mw-e2e-ha` 独立审  
