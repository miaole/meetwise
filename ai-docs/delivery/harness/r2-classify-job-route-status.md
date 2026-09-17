# Status — R2 `classifyJobRoute` 生产接线（GAP-RAG-02 · G4 P-R2）

**状态**：P-MODEL + P-WORKER + P-API + P-LOOP + P-START + **P-FAKE CLOSED（dual-passed）** · **G-R2-5 retrieve-side CLOSED** · **P-LIVE CLOSED pending dual-review → dual receipts pass → harness agree → await authorize（G-R2-7 lifecycle pin；≠ 路由已生效）** · **R2 NOT closed** · **≠ 路由已生效**（P-HARNESS `pre_exec_dual_pass`；SSOT/prove await authorize）· **≠ verbal 生效** · **releaseEvidence=false** · **Not HA** · **≠ R4 / 题域已隔离** · **≠ cutover** · **≠ flip default** · **≠ open DELETE**  
**硬句**：**pass ≠ R2 已关**；**本绿 ≠ 路由已生效**；**P-LIVE CLOSED pending dual-review / dual receipts pass ≠ claim R2 fully closed / ≠ verbal 生效** until separate authorize after dual-review + harness agree；禁止口头「生效」；实现方禁止自批。  
**对照**：`harness/r2-classify-job-route.md` · `eval/r2-classify-job-route.eval.md`
**P-HARNESS/G-R2-8 pointer**: `pre_exec_dual_pass` / `await_authorize`; reviews (both pass): `reviews/2026-09-16-r2-p-harness-agree-mw-rag-route.md` · `reviews/2026-09-16-r2-p-harness-agree-mw-e2e-ha.md` · `m4-rag-hard-gates.md` §R2 · GAP-RAG-02 · G4 `r4-domain-isolation-status.md` G-R4-4 / P-R2

---

## 1. Proven（本轨已钉 · 静态诚实）

| # | 已证明 | 证据 / CMD | 不得外推 |
|---|--------|------------|----------|
| P1 | **R2 NOT closed** 显式钉 | 本 status；harness §0；m4 §R2；GAP-RAG-02 | ≠ 即将关闭；不得宣称路由生效 / verbal 生效 |
| P2 | 合同 `classifyJobRoute` / bind / snapshot / getSnapshot **存在** | `packages/db/src/job-route-decision.ts` + index 导出 | ≠ rag03 绿=生产 |
| P3 | revision 写面：建岗/编辑 → `createJobSemanticRevision(route_pending)` | `recruiter.ts` createJob/updateJob | ≠ 自动 classify |
| P4 | bind/snapshot 写面 + **start lazy re-bind** + **真拒启** | apply/invite bind；start → bind → 无 binding 拒启 / 有 binding → snapshot | ≠ claim R2；≠ 路由已生效 |
| P5 | **P-WORKER** sole classify；**P-API** api 零 classify + wakeup | `pnpm r2-p-worker-route-classify:prove` · `pnpm r2-p-api-route-classify:prove` | ≠ R2 关 |
| P6 | G4 读侧依赖 snapshot；缺失/非法 snapshot 已 retrieve-side fail-closed（不发 unscoped query） | `pnpm g-r2-5-retrieve-fail-closed:prove` | ≠ R2 关 |
| P7 | 产品：P-MODEL…P-START + **P-FAKE CLOSED（dual-passed）**；**G-R2-5 retrieve-side CLOSED**；**P-LIVE CLOSED pending dual-review → dual receipts pass → await authorize** | harness §2；`r2-p-live-route-effective:prove` | R2 仍 NOT closed；≠ 路由已生效；≠ verbal 生效 |
| P8 | 双审 REQUEST 已备（P-LIVE） | `reviews/REQUEST-r2-p-live-route-effective-mw-{model-op,rag-route}` | REQUEST ≠ pass；实现方未自批；**禁止自批** |
| P9 | **P-MODEL CLOSED**：`job.route-classify.v1` | `pnpm job-route-classify-binding:prove` | ≠ R2 关 |
| P10 | **P-WORKER CLOSED**：sole consumer + MODEL-OP + `0132` | `pnpm r2-p-worker-route-classify:prove` | ≠ R2 关 |
| P11 | **P-API CLOSED**：wakeup + `0133` | `pnpm r2-p-api-route-classify:prove` | ≠ R2 关 |
| P12 | **P-LOOP CLOSED（dual-passed）**：start lazy re-bind → snapshot | `pnpm r2-p-loop-route-classify:prove`；`2026-09-16-r2-p-loop-route-classify-mw-{model-op,rag-route}` | ≠ R2 关 |
| P13 | **P-START CLOSED（dual-passed · 真拒启）**：`interview_ineligible_route`；拒启在 INSERT 前 | `pnpm r2-p-start-route-classify:prove`；`2026-09-16-r2-p-start-route-classify-mw-{model-op,rag-route}` | ≠ claim R2；≠ 路由已生效 |
| P14 | **P-FAKE CLOSED（dual-passed）**：Inventory F1–F4；sole 钉 `createJobRouteModelClassify` | `pnpm r2-p-fake-route-classify:prove`；`2026-09-16-r2-p-fake-route-classify-mw-{model-op,rag-route}` | ≠ claim R2；≠ 路由已生效 |
| P15 | **P-LIVE CLOSED pending dual-review → dual receipts pass；P-HARNESS `pre_exec_dual_pass` / `await_authorize`**：可测 classify→bind→snapshot→refuse/allow；Key-unset structural（无 live Key 要求） | `pnpm r2-p-live-route-effective:prove`；P-HARNESS reviews `reviews/2026-09-16-r2-p-harness-agree-mw-{rag-route,e2e-ha}.md` | **≠ claim R2**；≠ claim route-effective；SSOT/prove await separate authorize；≠ verbal 生效 |

---

## 2. GAP（仍未关闭 · R2）

| # | 缺口 | 关闭条件（未宣称达成） | 阻塞切流？ |
|---|------|------------------------|------------|
| G-R2-1 | **生产闭环 wire** | **CLOSED（dual-passed）**：Worker sole + API wakeup + start lazy re-bind → snapshot | **否**（wire 齐；R2 仍被 P-LIVE dual / harness 挡） |
| G-R2-2 | **`job_route_classify` MODEL-OP typed binding** | **CLOSED**（`job.route-classify.v1`） | **否** |
| G-R2-3 | apply/invite 早于 classify → 无 binding / 无 snapshot | **CLOSED（dual-passed）**：start lazy re-bind 关闭该竞态 | **否** |
| G-R2-4 | start 未决拒启（`interview_ineligible_route`） | **CLOSED（dual-passed）** | **否（本缺口）** |
| G-R2-5 | Worker retrieve 缺 snapshot 仍 unscoped | **retrieve-side CLOSED** | **否（本缺口）**；R2 overall 仍被 P-LIVE dual / harness 挡 |
| G-R2-6 | **P-FAKE** 规则-only / 缺 MODEL-OP 假绿宣称 | **CLOSED（dual-passed）** | **否（本缺口）** |
| G-R2-7 | **P-LIVE** measurable refuse/allow receipt（Key-unset structural · 候选 live-effective 收据） | **P-LIVE CLOSED pending dual-review → dual receipts pass；P-HARNESS `pre_exec_dual_pass` / `await_authorize`**；**仍 ≠ 路由已生效**；SSOT/prove await separate authorize | **是**（至 separate authorize；R2 仍 NOT closed） |

---

## 3. 与 G4 / HA 关系

| 项 | 裁定 |
|----|------|
| G4 P-R2 | **仍开**（R2 NOT closed：P-LIVE + P-HARNESS dual pass；SSOT/prove await separate authorize）；本刀不关 R4 |
| sole allowlist | **不扩** |
| `releaseEvidence` | **false** |
| HA | **Not HA** |
| cutover / flip / DELETE | **禁止** |

---

## 4. Prove CMD（诚实钉）

| CMD | 期望 EXIT | 含义 |
|-----|-----------|------|
| `pnpm job-route-classify-binding:prove` | **0** | P-MODEL；**≠ R2 关** |
| `pnpm r2-p-worker-route-classify:prove` | **0** | P-WORKER；**≠ R2 关** |
| `pnpm r2-p-api-route-classify:prove` | **0** | P-API；**≠ R2 关** |
| `pnpm r2-p-loop-route-classify:prove` | **0** | P-LOOP；**≠ R2 关** |
| `pnpm r2-p-start-route-classify:prove` | **0** | P-START 真拒启；**≠ claim R2** |
| `pnpm r2-p-fake-route-classify:prove` | **0** | P-FAKE dual-passed 仍绿；**≠ claim R2** |
| `pnpm r2-p-live-route-effective:prove` | **0** | P-LIVE 可测收据；**≠ claim R2** / **≠ claim route-effective** until dual-review + harness；**≠ verbal 生效** |
| `pnpm r2-classify-job-route-prereq:prove` | **0** | Inventory + P-* ；R2 NOT closed overall |
| `pnpm g4-production-scoped-retrieve:prove` | **0** | partial scoped path；R4 仍开 |
| `pnpm g-r2-5-retrieve-fail-closed:prove` | **0** | G-R2-5 retrieve-side；**≠ R2 关** |
| `pnpm g4-dispatch-recheck-prereq:prove` | **0** | R2 仍为 dispatch 阻塞 |
| `pnpm mysql-stack:r4-domain-isolation:prove` | **0** | E7：API 零 classify；Worker sole；R2 仍开 |
| `pnpm mysql-stack:m4-rag:prove` | **0** | §R2 文档门 |

---

## 5. Dual-review

| 专家 | REQUEST | 审什么 |
|------|---------|--------|
| `mw-model-op` | `reviews/REQUEST-r2-p-live-route-effective-mw-model-op.md` | **P-LIVE**：Key-unset fail-closed；rules-unique ALLOW；MODEL-OP 无假绿；≠ claim R2 |
| `mw-rag-route` | `reviews/REQUEST-r2-p-live-route-effective-mw-rag-route.md` | classify→bind→snapshot→refuse/allow；G-R2-7；R2 overall 仍开 / harness 关闸 |
| `mw-model-op`（前序 P-FAKE） | `2026-09-16-r2-p-fake-route-classify-mw-model-op.md` | P-FAKE（**pass**） |
| `mw-rag-route`（前序 P-FAKE） | `2026-09-16-r2-p-fake-route-classify-mw-rag-route.md` | P-FAKE（**pass**） |
| `mw-model-op`（前序 P-START） | `2026-09-16-r2-p-start-route-classify-mw-model-op.md` | P-START 真拒启（**pass**） |
| `mw-rag-route`（前序 P-START） | `2026-09-16-r2-p-start-route-classify-mw-rag-route.md` | P-START（**pass**） |
| `mw-model-op`（前序） | `reviews/REQUEST-r2-p-loop-route-classify-mw-model-op.md` | P-LOOP lazy re-bind（**pass** 2026-09-16） |
| `mw-rag-route`（前序） | `reviews/REQUEST-r2-p-loop-route-classify-mw-rag-route.md` | P-LOOP（**pass** 2026-09-16） |
| `mw-model-op`（前序） | `reviews/REQUEST-r2-p-api-route-classify-mw-model-op.md` | P-API wakeup |
| `mw-rag-route`（前序） | `reviews/REQUEST-r2-p-api-route-classify-mw-rag-route.md` | P-API |
| `mw-model-op`（前序） | `reviews/REQUEST-r2-p-worker-route-classify-mw-model-op.md` | P-WORKER |
| `mw-rag-route`（前序） | `reviews/REQUEST-r2-p-worker-route-classify-mw-rag-route.md` | P-WORKER |
| `mw-model-op`（前序） | `reviews/REQUEST-r2-p-model-job-route-classify-mw-model-op.md` | P-MODEL |
| `mw-rag-route`（前序） | `reviews/REQUEST-r2-p-model-job-route-classify-mw-rag-route.md` | P-MODEL |
| `mw-rag-route`（前序） | `reviews/REQUEST-r2-classify-job-route-mw-rag-route.md` | Inventory honesty PREREQ |
| `mw-e2e-ha`（前序） | `reviews/REQUEST-r2-classify-job-route-mw-e2e-ha.md` | EXIT=0 ≠ R2 关 ≠ 题域已隔离 |

前序（G4 partial / dispatch honesty，**≠** 本刀关 R2）：`REQUEST-g4-production-scoped-retrieve-*` · `REQUEST-g4-dispatch-recheck-prereq-*`

---

## 6. G7-K1 lifecycle honesty（2026-09-16 ~19:48 PT）

| 项 | 裁定 |
|----|------|
| Lifecycle pin | **P-LIVE CLOSED pending dual-review → dual receipts pass → harness agree → await authorize** |
| Prove | `pnpm r2-p-live-route-effective:prove` EXIT reflects lifecycle pin · **≠** verbal route-effective |
| R2 | **NOT closed** · **≠ 路由已生效** · `releaseEvidence=false` · **Not HA** |
| Knife | `harness/g7-k1-r2-p-live-status-lifecycle.md` · dual pre-exec **pass** · meetwise authorize docs+prove |

*Status · R2 · G7-K1 lifecycle pin aligned · 2026-09-16 ~19:48 PT · R2 NOT closed · releaseEvidence=false · ≠HA*
