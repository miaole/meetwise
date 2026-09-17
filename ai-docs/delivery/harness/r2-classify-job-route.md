# Harness / 评测集 — R2 `classifyJobRoute` 生产接线（GAP-RAG-02 · G4 PREREQ）

**releaseEvidence=false** · **Not HA** · **本绿 ≠ R2 已关** · **≠ 路由已生效**（P-HARNESS pre-exec dual pass；SSOT/prove await authorize）· **≠ verbal 生效** · **≠ 题域已隔离 / R4**  
**对照**：`m4-rag-hard-gates.md` §R2 · `gap-bug-backlog.md` GAP-RAG-02 · `harness/r2-classify-job-route-status.md` · `eval/r2-classify-job-route.eval.md` · G4 `r4-domain-isolation` P-R2
**P-HARNESS/G-R2-8 pointer**: `pre_exec_dual_pass` / `await_authorize`; reviews (both pass): `reviews/2026-09-16-r2-p-harness-agree-mw-rag-route.md` · `reviews/2026-09-16-r2-p-harness-agree-mw-e2e-ha.md`  
**待审专家（P-LIVE）**：`mw-model-op` + `mw-rag-route`（双域；实现方禁止自批）· 前序 P-MODEL / P-WORKER / P-API / P-LOOP / P-START / **P-FAKE（dual-passed）**；G-R2-5 retrieve-side CLOSED

---

## 0. 本切片验收立场（先读）

| 声明 | 裁定 |
|------|------|
| **R2 是否已关？** | **否。** P-MODEL…P-START + **P-FAKE（dual-passed）** + G-R2-5 retrieve-side 已齐；P-LIVE / P-HARNESS 双域文档审均 pass（G-R2-8 `pre_exec_dual_pass`），但 SSOT pointer flip / any prove **await separate authorize**。R2 overall 仍开。**禁止**本刀 prove 绿 = claim R2 fully closed。 |
| **本刀做什么？** | **P-LIVE**：可复跑 classify→bind→snapshot→**refuse/allow** 收据（CMD+EXIT）；**优先 Key-unset fail-closed structural**（rules-unique ALLOW + 真拒启 REFUSE；model 路径 known_not_sent）；禁口头「生效」 |
| **可关闭？** | R2 仅当：前序 closed（含 P-FAKE dual-passed）+ **P-LIVE 双审通过** + harness 同意；**本刀 prove 绿 ≠ claim R2 fully closed** / **≠ claim route-effective** until separate authorize after dual-review + harness gates |
| **证据** | `releaseEvidence=false`；Not HA；≠ sole cutover；≠ flip default；≠ open DELETE；≠ 宣称 R4 / 题域已隔离；≠ verbal 生效 |

专家先审 **P-LIVE 可测收据是否够格**；通过后仍 **不**宣称 R2 closed，除非 harness 关闸条件全齐。

---

## 1. Inventory — `classifyJobRoute` 应跑在何处（sole / Worker）

| # | 落点 | 合同 / 现状 | 本刀裁定 |
|---|------|-------------|---------|
| I1 | **建岗 / 编辑语义字段** | `packages/db/src/recruiter.ts` `createJob` / `updateJob` → `createJobSemanticRevision`（`route_pending`） | **已有** revision 写面；**不**在此同步 classify |
| I2 | **分类 Worker（sole）** | UC-RAG-FUNNEL-03：规则唯一命中 0 次模型；否则 `job_route_classify` 最多 1 次 → `route_decided` / `route_unresolved` | **P-WORKER CLOSED**：`route-classify-consumer.ts` → `classifyJobRoute` + **`createJobRouteModelClassify`**；**P-FAKE dual-passed** |
| I3 | **API 组合根（wakeup）** | `apps/api` recruiter createJob 后 enqueue / wakeup | **P-API CLOSED**：`notifyWorkerJobWakeup` + `0133`；API **零** classify |
| I4 | **申请 / 受邀 bind** | `bindApplicationRoute` 只绑最新 `route_decided`；未决 → `route_not_decided` | **写面在**；apply/invite 仍一次 bind |
| I5 | **面试启动 snapshot** | start **lazy re-bind** → 无 binding **拒启** `interview_ineligible_route` → 有 binding 才 `snapshotInterviewRoute` | **P-LOOP + P-START CLOSED（dual-passed）**；**P-LIVE** 钉 refuse/allow 可测 |
| I6 | **Worker 消费（retrieve scope）** | `getInterviewRouteSnapshot` → 主叶 scope；缺失/非法 snapshot → `route_snapshot_missing` degraded denial，绝不 unscoped | **G-R2-5 retrieve-side CLOSED** |

**权威合同**：`packages/db/src/job-route-decision.ts`（`snapshotInterviewRoute`：无 binding → 调用方**必须**拒绝启动）。本地 `rag03-route:prove` ≠ 生产接线 / ≠ 路由已生效。

---

## 1b. Inventory — 假绿面（P-FAKE · dual-passed · F1–F4）

| # | 面 | 允许？ | 裁定 |
|---|----|--------|------|
| F1 | `packages/db/test/job-route-decision.proof.ts`（rag03）注入 fake `modelClassify` | **仅** isolation proof | ≠ 生产 Worker；≠ 路由已生效 |
| F2 | rag04/rag05 rule-path seam（model 被调则 throw） | **仅** proof | ≠ 生产；≠ R2 关 |
| F3 | 文档/口头「规则-only Worker = R2 绿」 | **禁止** | 假绿表驳回 |
| F4 | apps 内 `classifyJobRoute(` 而无 `createJobRouteModelClassify` | **禁止**（须=0） | 旁路=假绿 |

Legitimate UC：`rule_unique_leaf` → `modelCalls=0` 发生在 **已** MODEL-OP 绑定的 sole Worker 调用 `classifyJobRoute` **之后** = **不是** P-FAKE；**是** P-LIVE Key-unset ALLOW structural。

---

## 1c. P-LIVE 可测面（L-* · Key-unset structural）

| ID | 面 | 期望 | Key？ |
|----|----|------|------|
| L-CLASSIFY | Worker sole + API wakeup | classify 仅 Worker；API 零 classify | 无（drain/wakeup） |
| L-BIND | apply/invite + start lazy re-bind | `bindApplicationRoute` | 无 |
| L-SNAPSHOT | start 有 binding → snapshot | immutable snapshot | 无 |
| L-REFUSE | 无 binding → `interview_ineligible_route` | 拒启在 INSERT 前 | 无 |
| L-ALLOW | 有 binding → `started` + snapshot | rules-unique 可 `modelCalls:0` | **无**（Key-unset） |
| L-MODEL-FC | model 路径缺 Key | `known_not_sent` fail-closed | Key-unset |

**禁止**：口头「生效」；把 live Key invoke 假绿写成收据；把 isolation rag03 绿写成生产生效。

---

## 2. 产品阻塞（为何 R2 **仍不关** · 不假接线 · fail-closed）

| ID | 阻塞 | 事实 |
|----|------|------|
| **P-MODEL** | `job_route_classify` → registry `job.route-classify.v1` | **CLOSED（dual-passed）** |
| **P-WORKER** | sole 分类 Worker / drain `route_pending` | **CLOSED（dual-passed）** |
| **P-API** | 建岗后触发分类（enqueue/wakeup） | **CLOSED（dual-passed）** |
| **P-LOOP** | classify→bind→snapshot 生产闭环可证 | **CLOSED（dual-passed）** |
| **P-START** | 未决路由应拒启动（`interview_ineligible_route`） | **CLOSED（dual-passed · 真拒启）** |
| **P-FAKE** | 规则-only 伪 Worker / 缺 MODEL-OP 路径冒充生产接线 | **CLOSED（dual-passed）** |
| **P-LIVE** | live 路由已生效可测收据（refuse/allow · Key-unset） | **dual receipts pass; P-HARNESS `pre_exec_dual_pass` / `await_authorize`**：`pnpm r2-p-live-route-effective:prove` remains separately authorized；**≠ claim R2** / **≠ claim route-effective** |

**R2 仍 NOT closed**：P-LIVE / P-HARNESS 双域文档审均 pass，但 SSOT pointer flip 与 prove **await separate authorize**；禁止宣称「路由已生效」/ verbal 生效。任何 prove 绿 ≠ claim R2 fully closed.

---

## 3. 测什么（P-LIVE prove）

| ID | 测什么 | 期望 |
|----|--------|------|
| **E1** | harness / status / eval / REQUEST / prove 脚本存在 | 路径存在 |
| **E2** | 文档钉 `R2 NOT closed` / `≠ 路由已生效` / Key-unset / `releaseEvidence=false` · Not HA；P-LIVE dual 收据齐；仍 ≠ 路由已生效 | 命中 |
| **E3** | Inventory I1–I6 + L-* refuse/allow | 命中 |
| **E4** | 静态：sole consumer `createJobRouteModelClassify`；apps 无缺 MODEL-OP 的 classify；api=0 | 命中 |
| **E5** | Key-unset：binding fail-closed；rules-unique `modelCalls:0` | 命中 |
| **E6** | REFUSE 在 INSERT 前；ALLOW 需 snapshot | 命中 |
| **E7** | 假绿表禁口头生效 / rag03≠生产生效 | 命中 |
| **E8** | 前序 P-* dual-passed（含 P-FAKE）；P-LIVE wire；R2 NOT closed overall | 命中 |
| **E9** | GAP-RAG-02 / m4 §R2 / G4 P-R2 仍开 overall（P-LIVE dual / harness）；≠ 伪关 R4 | 命中 |
| **E10** | REQUEST 自钉非 pass / 禁止自批 | 命中 |

---

## 4. 命令与期望 EXIT

| CMD | 期望 EXIT | 含义（诚实） |
|-----|-----------|--------------|
| `pnpm job-route-classify-binding:prove` | **0** | P-MODEL；**≠ R2 关** |
| `pnpm r2-p-worker-route-classify:prove` | **0** | P-WORKER；**≠ R2 关** |
| `pnpm r2-p-api-route-classify:prove` | **0** | P-API；**≠ R2 关** |
| `pnpm r2-p-loop-route-classify:prove` | **0** | P-LOOP；**≠ R2 关** |
| `pnpm r2-p-start-route-classify:prove` | **0** | P-START 真拒启；**≠ claim R2** |
| `pnpm r2-p-fake-route-classify:prove` | **0** | P-FAKE dual-passed 仍绿；**≠ claim R2** |
| `pnpm r2-p-live-route-effective:prove` | **0** | P-LIVE 可测收据；**≠ claim R2** / **≠ claim route-effective** until dual-review + harness |
| `pnpm r2-classify-job-route-prereq:prove` | **0** | Inventory + P-* ；R2 NOT closed overall |
| `pnpm g4-production-scoped-retrieve:prove` | **0** | partial scoped path；R4 仍开 |
| `pnpm g-r2-5-retrieve-fail-closed:prove` | **0** | G-R2-5 retrieve-side；**≠ R2 关** |
| `pnpm g4-dispatch-recheck-prereq:prove` | **0** | 旁证 R2 仍为 dispatch 阻塞之一 |
| `pnpm mysql-stack:r4-domain-isolation:prove` | **0** | G4 E7：API 零 classify；Worker sole；R2 仍开 |
| `pnpm mysql-stack:m4-rag:prove` | **0** | §R2 硬门文档仍在 |

---

## 5. 假绿表（禁止）

| 假绿说法 | 驳回 |
|----------|------|
| 「recruiter 有 bind/snapshot 所以 R2 已接线 / 路由已生效」 | R2 overall 仍开（P-LIVE dual / harness） |
| 「rag03-route:prove 绿 = 生产路由生效」 | prove-shell / PG 夹具；≠ apps 组合根 |
| 「consumer 读了 getInterviewRouteSnapshot = R2 关」 | 只读；G-R2-5 虽 retrieve-side fail-closed，R2 overall 仍开 |
| 「规则-only Worker 无 MODEL-OP = 可关 R2」 | **P-FAKE**（已 dual-passed 禁） |
| 「P-LIVE prove 绿 = R2 关 / 路由已生效」 | prove 绿 ≠ dual-review receipts ≠ harness 关闸 |
| 「口头说生效 / verbal 生效」 | **禁止**；仅 CMD+EXIT 收据 |
| 「live Key 未配但宣称 model 路径已生效」 | Key-unset 须 fail-closed；不得假绿 |

---

## 6. 本刀范围 / 非目标

**本刀做了（P-LIVE）**：可测 classify→bind→snapshot→refuse/allow 收据（Key-unset structural）；`pnpm r2-p-live-route-effective:prove`；REQUEST 双审；文档诚实钉 R2 NOT closed。

**前序已做**：P-MODEL / P-WORKER / P-API / P-LOOP / P-START / **P-FAKE（dual-passed）** / G-R2-5 retrieve-side。

**非目标（仍禁）**：
- 不在 API 内联 `classifyJobRoute` / 不发明第二分类路径  
- 不要求 / 不假绿 live Key invoke  
- 不关 R1 / R4 / R2 overall；不切 qbank / 向量；不 flip default；不开 DELETE  
- `releaseEvidence=false`；Not HA；≠ verbal 生效；**本刀 ≠ claim R2 fully closed** / **≠ claim route-effective** until separate authorize after dual-review + harness gates
