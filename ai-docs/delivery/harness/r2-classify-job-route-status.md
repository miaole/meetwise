# Status — R2 `classifyJobRoute` 生产接线（GAP-RAG-02 · G4 P-R2）

**状态**：P-MODEL + P-WORKER + P-API + P-LOOP + P-START + **P-FAKE CLOSED（dual-passed）** · **G-R2-5 retrieve-side CLOSED** · **P-LIVE CLOSED（dual-passed structural）** · **P-HARNESS/G-R2-8 AUTHORIZED + SSOT flipped**（standing authorize after dual on `c3092c1` · **≠ await_authorize**）· **R2 structural CLOSED**（classify→bind→snapshot→refuse/allow + dual+authorize+prove）· **R2 NOT closed** as HA / suite / verbal-effective / controlPlane / R4 / FUNNEL · **≠ 路由已生效** · **≠ verbal 生效** · **releaseEvidence=false** · **Not HA** · **≠ R4 / 题域已隔离** · **≠ FUNNEL dual-closed** · **≠ controlPlaneClosed** · **≠ suite green** · **≠ cutover** · **≠ flip default** · **≠ open DELETE** · sole allowlist **恰 5** 不扩 · PG+pgvector+PostgresSaver retained  
**硬句**：**R2 structural CLOSED** ≠ verbal 生效≠ HA ≠ suite ≠ controlPlaneClosed ≠ R4/FUNNEL；**pass ≠ R2 已关 as HA**；禁止口头「生效」；实现方禁止自批；本刀 SSOT flip status = **`post_prove_dual_pass`**（post-prove dual BOTH PASS on prove SHA **`5671982`** · EXIT **6×0**）。  
**对照**：`harness/r2-classify-job-route.md` · `eval/r2-classify-job-route.eval.md` · knife `harness/r2-ssot-flip-real-close.md`  
**P-HARNESS/G-R2-8 pointer**: **authorized + SSOT flipped**（retired `await_authorize`）；pre-exec dual (both pass): `reviews/2026-09-16-r2-p-harness-agree-mw-rag-route.md` · `reviews/2026-09-16-r2-p-harness-agree-mw-e2e-ha.md` · real-close pre-exec dual (both pass on `c3092c1`): `reviews/2026-09-17-r2-ssot-flip-real-close-mw-{e2e-ha,rag-route}.md` · post-prove dual (both pass on `5671982`): `reviews/2026-09-17-r2-ssot-flip-real-close-post-prove-mw-{e2e-ha,rag-route}.md` · `m4-rag-hard-gates.md` §R2 · GAP-RAG-02 · G4 `r4-domain-isolation-status.md` G-R4-4 / P-R2

---

## 1. Proven（本轨已钉 · 静态诚实）

| # | 已证明 | 证据 / CMD | 不得外推 |
|---|--------|------------|----------|
| P1 | **R2 structural CLOSED**（authorize+prove path）· **R2 NOT closed** as HA/suite/verbal/controlPlane/R4/FUNNEL | 本 status；harness §0；m4 §R2；GAP-RAG-02；knife receipt | ≠ verbal 生效；≠ HA；≠ suite；≠ R4/FUNNEL |
| P2 | 合同 `classifyJobRoute` / bind / snapshot / getSnapshot **存在** | `packages/db/src/job-route-decision.ts` + index 导出 | ≠ rag03 绿=生产 |
| P3 | revision 写面：建岗/编辑 → `createJobSemanticRevision(route_pending)` | `recruiter.ts` createJob/updateJob | ≠ 自动 classify |
| P4 | bind/snapshot 写面 + **start lazy re-bind** + **真拒启** | apply/invite bind；start → bind → 无 binding 拒启 / 有 binding → snapshot | ≠ verbal 生效 |
| P5 | **P-WORKER** sole classify；**P-API** api 零 classify + wakeup | `pnpm r2-p-worker-route-classify:prove` · `pnpm r2-p-api-route-classify:prove` | ≠ HA |
| P6 | G4 读侧依赖 snapshot；缺失/非法 snapshot 已 retrieve-side fail-closed（不发 unscoped query） | `pnpm g-r2-5-retrieve-fail-closed:prove` | ≠ R4 关 |
| P7 | 产品：P-MODEL…P-START + **P-FAKE CLOSED（dual-passed）**；**G-R2-5 retrieve-side CLOSED**；**P-LIVE CLOSED（dual-passed）**；**P-HARNESS authorized** | harness §2；`r2-p-live-route-effective:prove` | ≠ 路由已生效；≠ verbal 生效 |
| P8 | 双审收据（P-LIVE + P-HARNESS + real-close） | P-LIVE / P-HARNESS / `2026-09-17-r2-ssot-flip-real-close-mw-*` | REQUEST ≠ self-pass；**禁止自批** |
| P9 | **P-MODEL CLOSED**：`job.route-classify.v1` | `pnpm job-route-classify-binding:prove` | ≠ HA |
| P10 | **P-WORKER CLOSED**：sole consumer + MODEL-OP + `0132` | `pnpm r2-p-worker-route-classify:prove` | ≠ HA |
| P11 | **P-API CLOSED**：wakeup + `0133` | `pnpm r2-p-api-route-classify:prove` | ≠ HA |
| P12 | **P-LOOP CLOSED（dual-passed）**：start lazy re-bind → snapshot | `pnpm r2-p-loop-route-classify:prove`；`2026-09-16-r2-p-loop-route-classify-mw-{model-op,rag-route}` | ≠ verbal 生效 |
| P13 | **P-START CLOSED（dual-passed · 真拒启）**：`interview_ineligible_route`；拒启在 INSERT 前 | `pnpm r2-p-start-route-classify:prove`；`2026-09-16-r2-p-start-route-classify-mw-{model-op,rag-route}` | ≠ verbal 生效 |
| P14 | **P-FAKE CLOSED（dual-passed）**：Inventory F1–F4；sole 钉 `createJobRouteModelClassify` | `pnpm r2-p-fake-route-classify:prove`；`2026-09-16-r2-p-fake-route-classify-mw-{model-op,rag-route}` | ≠ verbal 生效 |
| P15 | **P-LIVE CLOSED（dual-passed）** + **P-HARNESS/G-R2-8 authorized + SSOT flipped**：可测 classify→bind→snapshot→refuse/allow；Key-unset structural；standing authorize after dual on `c3092c1` | `pnpm r2-p-live-route-effective:prove`；P-HARNESS reviews；real-close reviews | **≠ verbal 生效**；≠ HA；≠ suite；≠ controlPlaneClosed；双审仍引用 |

---

## 2. GAP（仍未关闭 · 正交 / remaining-after）

| # | 缺口 | 关闭条件（未宣称达成） | 阻塞切流？ |
|---|------|------------------------|------------|
| G-R2-1 | **生产闭环 wire** | **CLOSED（dual-passed）** | **否** |
| G-R2-2 | **`job_route_classify` MODEL-OP typed binding** | **CLOSED** | **否** |
| G-R2-3 | apply/invite 早于 classify → 无 binding / 无 snapshot | **CLOSED（dual-passed）** | **否** |
| G-R2-4 | start 未决拒启（`interview_ineligible_route`） | **CLOSED（dual-passed）** | **否** |
| G-R2-5 | Worker retrieve 缺 snapshot 仍 unscoped | **retrieve-side CLOSED** | **否** |
| G-R2-6 | **P-FAKE** 规则-only / 缺 MODEL-OP 假绿宣称 | **CLOSED（dual-passed）** | **否** |
| G-R2-7 | **P-LIVE** measurable refuse/allow receipt | **CLOSED（dual-passed structural）** · **仍 ≠ 路由已生效 / verbal** | **否（本缺口）**；verbal ban survives |
| G-R2-8 | **P-HARNESS** harness agree / SSOT flip | **AUTHORIZED + SSOT flipped**（standing authorize after dual `c3092c1`）· knife **`post_prove_dual_pass`** on **`5671982`** | **否（await_authorize retired）**；post-prove dual BOTH PASS |

**Remaining-after（≠ folded into R2 structural close）**: Live Key optional · **R1 next** · R5 fixture · **R4/FUNNEL after R1** · G7 ≠ R2 close · sole **恰 5** 不扩

---

## 3. 与 G4 / HA 关系

| 项 | 裁定 |
|----|------|
| G4 P-R2 | R2 structural path authorized/flipped；**R4 / 题域仍开**；本刀不关 R4 |
| sole allowlist | **恰 5 · 不扩** |
| `releaseEvidence` | **false** |
| HA | **Not HA** |
| controlPlaneClosed | **≠** |
| suite green | **≠** |
| cutover / flip / DELETE | **禁止** |

---

## 4. Prove CMD（诚实钉）

| CMD | 期望 EXIT | 含义 |
|-----|-----------|------|
| `pnpm job-route-classify-binding:prove` | **0** | P-MODEL；**≠ HA** |
| `pnpm r2-p-worker-route-classify:prove` | **0** | P-WORKER；**≠ HA** |
| `pnpm r2-p-api-route-classify:prove` | **0** | P-API；**≠ HA** |
| `pnpm r2-p-loop-route-classify:prove` | **0** | P-LOOP；**≠ verbal 生效** |
| `pnpm r2-p-start-route-classify:prove` | **0** | P-START 真拒启；**≠ verbal 生效** |
| `pnpm r2-p-fake-route-classify:prove` | **0** | P-FAKE dual-passed 仍绿；**≠ verbal 生效** |
| `pnpm r2-p-live-route-effective:prove` | **0** | P-LIVE 可测收据；**≠ verbal 生效** |
| `pnpm r2-classify-job-route-prereq:prove` | **0** | Inventory + P-* ；**R2 NOT closed** as HA/suite/verbal/controlPlane/R4/FUNNEL |
| `pnpm g4-production-scoped-retrieve:prove` | **0** | partial scoped path；R4 仍开 |
| `pnpm g-r2-5-retrieve-fail-closed:prove` | **0** | G-R2-5 retrieve-side；**≠ R4** |
| `pnpm g4-dispatch-recheck-prereq:prove` | **0** | R4 dispatch honesty；**≠ R4 closed** |
| `pnpm mysql-stack:r4-domain-isolation:prove` | **0** | E7：API 零 classify；Worker sole；R4 仍开 |
| `pnpm mysql-stack:m4-rag:prove` | **0** | §R2 文档门 |

---

## 5. Dual-review

| 专家 | REQUEST / receipt | 审什么 |
|------|-------------------|--------|
| `mw-e2e-ha` + `mw-rag-route` | pre-exec `2026-09-17-r2-ssot-flip-real-close-mw-*`（pass on `c3092c1`）· post-prove `…-post-prove-mw-*`（pass on **`5671982`**） | real-close / SSOT flip · **`post_prove_dual_pass`** · Ban假关 · ≠ verbal/HA/suite/R4/FUNNEL |
| `mw-model-op` + `mw-rag-route` | P-LIVE dual **pass** | structural refuse/allow |
| `mw-rag-route` + `mw-e2e-ha` | P-HARNESS dual **pass** | harness agree |
| Prior P-* | see historical REQUEST rows | P-MODEL…P-FAKE |

前序（G4 partial / dispatch honesty，**≠** 本刀关 R4）：`REQUEST-g4-production-scoped-retrieve-*` · `REQUEST-g4-dispatch-recheck-prereq-*`

---

## 6. G7-K1 / real-close honesty（2026-09-17 ~19:50 PT）

| 项 | 裁定 |
|----|------|
| Lifecycle | dual → harness agree → **standing authorize** → **SSOT flip executed** → prove EXIT **6×0** → **post-prove dual BOTH PASS** → **`post_prove_dual_pass`** |
| Prove | `pnpm r2-p-live-route-effective:prove` · prereq · fake · g-r2-5 · related · **≠** verbal route-effective · SHA **`5671982`** |
| R2 | **structural CLOSED** · **R2 NOT closed** as HA/suite/verbal/controlPlane/R4/FUNNEL · `releaseEvidence=false` · **Not HA** · **Ban假关** |
| Knife | `harness/r2-ssot-flip-real-close.md` · status **`post_prove_dual_pass`** · dual on **`5671982`** · ≠ W4 masquerade |

*Status · R2 · SSOT flip post_prove_dual_pass · 2026-09-17 ~19:50 PT · dual on 5671982 · EXIT 6×0 · R2 structural CLOSED · R2 NOT closed as HA/suite/verbal/controlPlane/R4/FUNNEL · releaseEvidence=false · ≠HA · ≠suite · sole 恰5 · Ban假关*
