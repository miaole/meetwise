# 审查归档 — R2 classifyJobRoute honesty PREREQ · mw-e2e-ha

**日期**：2026-09-10（PT；本审独立复跑 ~04:58 PT）  
**审稿人**：`mw-e2e-ha`（对抗独立审；**不采信实现方自报**；实现方禁止自批）  
**送审对照**：`reviews/REQUEST-r2-classify-job-route-mw-e2e-ha.md`  
**结论**：**pass**（仅 **R2 honesty PREREQ / fail-closed 诚实登记**）  
**批准范围**：**仅**登记「有合同无生产接线 + apps 零 `classifyJobRoute(` + 产品阻塞成立 + 可执行否定钉」——harness/status/eval/GAP-RAG-02/m4 §R2/G-R4-4/`pnpm r2-classify-job-route-prereq:prove`  
**不批**：**R2 关闭** / 生产 `classifyJobRoute` 已接线 / 路由已生效 / R4 关 / 题域已隔离 / covered / HA / `releaseEvidence=true` / sole cutover / flip default / open DELETE / 规则-only 假 Worker 关 R2 / 把 bind·snapshot 写面或 `rag03-route:prove` 绿写成生产路由生效  
**硬钉**：`releaseEvidence=false` · **Not HA** · **EXIT=0 ≠ R2 closed** · **EXIT=0 ≠ 路由已生效** · **≠ 题域已隔离** · **接线状态：仍无** · **R2 仍开**

---

## 1. 送审对照（不采信 · 独立复核）

| 送审项 | 本审结果 |
|--------|----------|
| REQUEST 自承 PREREQ / 未接线 / 非关 R2 / 非 covered·HA | **属实**；本审独立签核，**非**实现方自批；mw-rag-route 前序 pass **不替代**本域 |
| 前序 G4 dispatch/recheck 已钉 worker 零 classify（旁证） | **属实**（对照 `2026-09-10-g4-dispatch-recheck-prereq-mw-e2e-ha.md`）；本刀为 **R2 域独立** PREREQ，**未**偷偷补接线 |
| `r2-classify-job-route-prereq.proof.ts` | **存在**；静态否定钉：合同 intact + apps 零 classify + 阻塞钉 + R2 NOT closed |
| apps `classifyJobRoute(` | **零** callSites（`apps/api/src` + `apps/worker/src` + `apps/web`：**零**符号引用，含 import/注释） |
| 合同 / domain | **仍在**：`packages/db/src/job-route-decision.ts` export `classifyJobRoute` + bind/snapshot/getSnapshot；db index 再导出；**apps 不消费** |
| recruiter 写面 | revision/bind/snapshot **有**；**不**调 `classifyJobRoute(`；start 仍优雅降级（无 binding） |
| harness / status / eval / GAP-RAG-02 / m4 §R2 / G-R4-4 | **仍钉** R2 NOT closed；有合同无生产接线；G-R2-* / G-R4-4 **仍挡** |
| sole allowlist | **未扩**；仍恰 5（wiring / ping / qdrant-backed / vectorstore-adapter / vectorstore-qdrant）；**无** r2/classify 入表 |

---

## 2. Prove（本审独立复跑 · CMD+EXIT）

| CMD | EXIT | 摘要 / NOTE 硬读法 |
|-----|------|-------------------|
| `pnpm r2-classify-job-route-prereq:prove` | **0** | Inventory + 合同 intact；apps classify **calls=0**；无 route-classify consumer 文件；P-MODEL/P-WORKER/P-API 钉；GAP-RAG-02 / m4 §R2 / G-R4-4 仍开。NOTE：`honesty PREREQ+fail-closed; NO production classifyJobRoute wire; R2 NOT closed; ≠ 路由已生效; releaseEvidence=false` |
| `pnpm g4-production-scoped-retrieve:prove` | **0** | partial P-WIRE 仍在；缺 snapshot 仍 unscoped（R2 后果）。NOTE：`partial P-WIRE; R4 NOT closed; ≠ wrong_track=0; releaseEvidence=false` |
| `pnpm g4-dispatch-recheck-prereq:prove` | **0** | 旁证 R2 零 classify 仍为 dispatch 阻塞之一。NOTE：`honesty PREREQ+fail-closed; NO production dispatch/recheck wire; R4 NOT closed; ≠ wrong_track=0; releaseEvidence=false` |
| `pnpm mysql-stack:r4-domain-isolation:prove` | **0** | E7/等价钉 apps 无 classify；R4 NOT closed。NOTE：`honesty pins only; partial P-WIRE ok; R4 NOT closed; ≠ wrong_track=0; releaseEvidence=false; Not HA` |
| `pnpm conn-stack:r4-domain-isolation:prove` | **0** | 同 body；同上 |
| `pnpm mysql-stack:m4-rag:prove` | **0** | §R2 硬门文档仍钉「无生产接线不得宣称路由生效」；`classifyJobRoute` 合同仍在 |

**硬读法**：**EXIT=0 只证明「未接线」可执行否定钉 + 产品阻塞登记**；**不得**写成 R2 已关、路由已生效、生产 classify 已齐、R4/题域已隔离、covered、HA、`releaseEvidence=true`。

---

## 3. 生产路径独立核验：apps 调用状态

### 3.1 `classifyJobRoute` 调用表（硬）

| 维度 | 独立结果 | 裁定 |
|------|----------|------|
| **`apps/api/src`** | `rg`：`classifyJobRoute` **零**命中（无 import / 无调用 / 无注释引用） | **零消费** |
| **`apps/worker/src`** | 同上 **零**命中；无 `route-classify*` / `job-route-classify*` / `classify-job-route*` consumer 文件名 | **零消费** |
| **`apps/web`** | **零** `classifyJobRoute` | **零消费** |
| **`packages/db` 合同** | `export async function classifyJobRoute` 在 `job-route-decision.ts`；index 再导出 | **定义可在** ≠ apps 接线 |
| **`packages/db/src/recruiter.ts`** | 无 `classifyJobRoute` 字符串；有 revision/bind/snapshot 写面 | **写面 ≠ classify** |
| **证明脚本提及** | 仅 `apps/worker/test/*.proof.ts`（否定钉自身） | **≠ 生产路径** |

→ **apps 调用状态**：**callSites=0**（api+worker+web）· **接线状态：仍无** → 本刀正确为 **PREREQ / 诚实不接线**；**R2 仍开**。

### 3.2 产品阻塞（本审同意「不假接」）

| 阻塞 | 独立核验 |
|------|----------|
| **P-MODEL** `job_route_classify` MODEL-OP typed binding 未实施 | UC `rag-funnel-intent-routing.md` + harness/GAP-RAG-02 仍钉未实施 |
| **P-WORKER** sole 分类 Worker / drain | worker src 零 classify、无 route-classify consumer |
| **P-API** 建岗后触发 classify | api src 零 classify |
| **P-START** 未决仍优雅降级 | recruiter start 文档/路径仍 degrade；强改 fail-closed 会打爆 legacy → 须 classify 先齐 |
| **P-FAKE** 规则-only 假 Worker | 本刀**未**做此假接线 |

### 3.3 对照前序（G4 dispatch PREREQ）

| 前序（dispatch/recheck） | 本刀（R2 classify PREREQ） | 不得偷换 |
|--------------------------|---------------------------|----------|
| 旁证 apps 零 classify | **独立域**再钉零 classify + Inventory + 产品阻塞 | 不得写成「G4 已关所以 R2 可免」 |
| R4 NOT closed | **仍 NOT closed**；G-R4-4 / P-R2 **仍开** | EXIT=0 ≠ 关 R2/R4 |
| 无生产 classify | **仍无**（本审 `rg`） | 不得写成「下一刀已接线」 |

---

## 4. 对抗：假绿面

| 风险说法 | 裁定 |
|---------|------|
| `r2-classify-job-route-prereq:prove` EXIT=0 = **R2 已关 / 路由已生效** | **假绿** — 本绿 = **未接线** 诚实钉 + 产品阻塞 |
| 「合同 `classifyJobRoute` 还在 / recruiter 有 bind·snapshot」= **生产已接线** | **假绿** — apps 零调用；无 classify → 多数无 `route_decided` → bind 空操作 |
| 「`rag03-route:prove` 绿」= **生产路由生效** | **假绿** — prove-shell / 夹具 ≠ apps 组合根（本刀亦未以此关 R2） |
| 「consumer 读了 `getInterviewRouteSnapshot`」= **R2 关** | **假绿** — 只读 partial；写侧 classify 仍缺 → 多数仍 unscoped |
| 「mw-rag-route 已 pass」= **本域可免审 / 可升格 covered·HA** | **假绿** — 双域独立；本审不采信他域代替 |
| 本绿 = covered / HA / `releaseEvidence=true` / sole cutover / R4 关 | **假绿** — 全程钉 false / Not HA；sole **未**扩；R4/G-R4-4 仍开 |
| 「规则-only Worker 无 MODEL-OP 即可关 R2」 | **假绿** — ambiguous/model 路径未闭环；UC 要求 typed binding；本刀**未**批准 |

**假绿风险（残留）**：**中（叙事外推）** — 交付文档自身诚实（未接线 / R2 NOT closed / releaseEvidence=false / Not HA），主要风险是把「PREREQ prove 绿」误读成「classify 已接线或 R2 关」。**只要严格限制批准范围为 honesty PREREQ 登记即可控**。  
**禁止假绿 / 假 covered / 假 HA / `releaseEvidence=true` / 假宣称生产接线 / 假宣称 R2 已关。**

---

## 5. REQUEST 四问（mw-e2e-ha）

| # | 问题 | 本审回答 |
|---|------|----------|
| 1 | 本切片是否错误冒充完整 E2E / covered / HA / `releaseEvidence=true` / R2 已关？ | **否**。prove NOTE / harness / status / eval / GAP-RAG-02 / m4 §R2 / REQUEST 均自钉未接线 · Not HA · releaseEvidence=false · ≠ covered · R2 NOT closed；未检出冒充完整 E2E 或已接线 |
| 2 | EXIT=0 是否被文档明确标红为 **≠ R2 关 / ≠ 路由已生效 / ≠ 题域已隔离**？ | **是**。harness 假绿表、status P1/G-R2、eval、prove OK 行、m4 §R2、GAP-RAG-02 均显式标红 |
| 3 | sole allowlist 是否因本切片扩面？（期望：否） | **否**。独立核验 `SOLE_WIRING_ALLOWLIST` 仍恰 5；无 r2/classify 入表 |
| 4 | 与 G4 并列门是否仍一致钉 R2 PREREQ 开 + R4 NOT closed？ | **一致**。r4 status G-R4-4/P-R2、GAP-RAG-02/04、m4 §R2/§R4、g4 proves 同钉 R2 开 + R4 NOT closed |

---

## 6. 阻塞栏（关 R2 / 宣称路由生效前 · 本审不关）

| 阻塞项 | 现状 | 关闭条件（**未宣称达成**） |
|--------|------|---------------------------|
| **G-R2-1** 生产无 `classifyJobRoute(` | apps api+worker+web **零**调用 | sole 分类 Worker（或等价组合根）实际跑漏斗；规则+模型路径可证 |
| **G-R2-2** `job_route_classify` MODEL-OP binding | **未实施** | MODEL-OP-01 typed binding + 预算/attempt/unknown |
| **G-R2-3** 多数岗 `route_pending` → 无 bind → 无 snapshot | 写面在、classify 缺 | classify → `route_decided` → bind → snapshot 生产闭环 |
| **G-R2-4** start 未决仍优雅降级 | 非 `interview_ineligible_route` | 未决拒启动（须 G-R2-1 先齐；勿提前强改） |
| **G-R2-5 / G-R4-4** 缺 snapshot 仍 unscoped；R2 挡 R4 | G4 partial 读侧仍依赖 snapshot | R2 齐后另刀 fail-closed / full wire |
| **covered / HA / releaseEvidence** | 全程 false / Not HA | **禁止**本绿勾 true |

**本切片不因上述阻塞而 block「honesty PREREQ 登记」**；上述仅 **阻塞宣称 R2 关 / 路由已生效 / 生产 classify 已接线 / R4·题域已隔离 / covered / HA**。

---

## 7. 硬钉勾选

- [x] `releaseEvidence=false` · **Not HA**
- [x] **EXIT=0 ≠ R2 closed** · **EXIT=0 ≠ 路由已生效** · **≠ 题域已隔离**
- [x] **apps 调用状态：零** `classifyJobRoute(`（api+worker+web；已独立 `rg`）
- [x] **接线状态：仍无** · **R2 仍开**（harness/status/GAP-RAG-02/m4 §R2/G-R4-4）
- [x] 诚实不接线：本刀为 PREREQ/清单/钉文，**未**伪装已接线
- [x] sole allowlist **未**因本切片扩面
- [x] 未宣称 covered / HA / `releaseEvidence=true` / sole cutover / flip default
- [x] 批准范围仅 **R2 PREREQ 诚实登记**；**不批接线完成 / R2 关**

---

## 8. 结论与建议

- **裁定：pass**（R2 classifyJobRoute · **honesty PREREQ / fail-closed 登记 only**）
- **批准范围**：登记「有合同无生产接线 + apps 零 classify + 产品阻塞 + 可执行否定钉」及关联 harness/status/eval/GAP-RAG-02/m4 §R2/G-R4-4/`pnpm r2-classify-job-route-prereq:prove`（绿 ≠ 已接线 ≠ R2 关）
- **明确不批**：关 R2、宣称路由已生效、宣称生产 classify 已接线、关 R4/题域已隔离、covered、HA、`releaseEvidence=true`、扩 sole allowlist、规则-only 假 Worker、切 qbank/向量默认
- **下一刀（另切片）**：须先消 P-MODEL + P-WORKER/P-API（typed binding + sole 分类 Worker/API 触发）后再开 **真实生产接线** 送双域审；**本 pass 不得引用为接线完成或 R2 关闭批准**

对照：`REQUEST-r2-classify-job-route-mw-e2e-ha.md` · `apps/worker/test/r2-classify-job-route-prereq.proof.ts` · `packages/db/src/job-route-decision.ts` · `packages/db/src/recruiter.ts` · `apps/{api,worker}/src`（零 classify）· `harness/r2-classify-job-route.md` · `r2-classify-job-route-status.md` · GAP-RAG-02 · `m4-rag-hard-gates.md` §R2 · `r4-domain-isolation-status.md` G-R4-4/P-R2 · 前序 `reviews/2026-09-10-g4-dispatch-recheck-prereq-mw-e2e-ha.md` · 并行 `reviews/2026-09-10-r2-classify-job-route-mw-rag-route.md`
