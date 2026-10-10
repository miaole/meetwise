# 评测证明 — R4 / GAP-RAG-04 题域隔离诚实钉

**日期**：2026-09-10（PT）  
**releaseEvidence=false** · **Not HA** · **pass ≠ R4 已关** · **本绿 ≠ 题域已隔离** · **≠ sole cutover**  
**对照 harness**：`ai-docs/delivery/harness/r4-domain-isolation.md`  
**对照 status**：`ai-docs/delivery/harness/r4-domain-isolation-status.md`  
**对照硬门**：`ai-docs/delivery/m4-rag-hard-gates.md` §R4  
**对照缺口**：`ai-docs/delivery/gap-bug-backlog.md` GAP-RAG-04  
**待审专家**：`mw-rag-route` + `mw-e2e-ha`（双域；实现方禁止自批）

---

## 1. 本文件用途

交付「**如何验收本切片**」的评测证明材料：库存、PREREQ、命令、期望 EXIT、假绿标红。  
**产品未就绪 → 不关 R4**；本切片只登记诚实钉。  
**不得**把本文或 prove 绿写成「题域已隔离」。

---

## 2. 评测集执行记录（实现方自跑；非专家签核）

| CMD | 期望 EXIT | 实测 EXIT（实现方） | 读法 |
|-----|-----------|---------------------|------|
| `pnpm mysql-stack:r4-domain-isolation:prove` | **0** | **0**（2026-09-10 PT · 实现方） | E1–E10 钉可执行；**≠ R4 closed** |
| `pnpm conn-stack:r4-domain-isolation:prove` | **0** | **0**（同 body） | 同上 |
| `pnpm mysql-stack:m4-rag:prove` | **0** | **0**（2026-09-10 PT · 实现方） | M4 硬门；R4 NOT closed 仍在 |
| `pnpm r1-tech-role-fail-closed:prove` | **0** | **0**（2026-09-10 PT · 实现方） | R1 合同；≠ R4 |
| `pnpm g4-production-scoped-retrieve:prove` | **0** | **0**（2026-09-10 ~04:00 PT · 实现方） | partial P-WIRE；**≠ R4 关**；**≠ wrong_track=0** |
| `pnpm g4-dispatch-recheck-prereq:prove` | **0** | **0**（2026-09-10 ~04:17 PT · 实现方） | dispatch/recheck **未接线** honesty PREREQ；**≠ full wire**；**≠ R4 关** |

复跑：

```bash
cd /workspace/meetwise
pnpm mysql-stack:r4-domain-isolation:prove ; echo EXIT=$?
pnpm conn-stack:r4-domain-isolation:prove ; echo EXIT=$?
pnpm mysql-stack:m4-rag:prove ; echo EXIT=$?
pnpm r1-tech-role-fail-closed:prove ; echo EXIT=$?
pnpm g4-production-scoped-retrieve:prove ; echo EXIT=$?
pnpm g4-dispatch-recheck-prereq:prove ; echo EXIT=$?
```

---

## 3. 条目 ↔ prove 映射

| Harness ID | Prove 断言（摘要） | 关闭 R4？ |
|------------|-------------------|-----------|
| E1 | harness/status/eval/prove 存在 | 否 |
| E2 | NOT closed / 不宣称题域已隔离 | 否（刻意否定） |
| E3 | PREREQ R1/R2/metadata/P-WIRE partial | 否 |
| E4 | releaseEvidence=false · Not HA | 否 |
| E5 | rag04 库存 + ≠ 生产 | 否 |
| E6 | main.ts 转发 scope；无 dispatchTrackLocalRetrieval；consumer 解析 scope | 否（partial P-WIRE；≠ R4 关） |
| E7 | api 零 classify；Worker sole；R2 NOT closed / ≠ 路由已生效 | 否（钉 R2 overall；旁证 `r2-classify-job-route-prereq:prove`） |
| E8 | track-local seam 文件存在 | 否 |
| E9 | GAP-RAG-04 + m4 §R4 指针 | 否 |
| E10 | 无假绿「已关」结论句 | 否 |

执行体：`scripts/conn-stack/mysql-stack.r4-domain-isolation.proof.mjs`

---

## 4. 假绿标红（审查勾选）

- [ ] 未把 prove 绿写成 **R4 已关 / 题域已隔离**
- [ ] 未把 `rag04-track-local:prove` 绿写成生产隔离
- [ ] 未把 `snapshotInterviewRoute` / bind 写面写成 **R2 分类已生产接线**
- [ ] 未把 role 参数化写成 track 硬过滤
- [ ] 未把 partial scoped retrieve / `g4-production-scoped-retrieve:prove` 绿写成 **题域已隔离 / R4 关 / wrong_track=0**
- [ ] 未把 `g4-dispatch-recheck-prereq:prove` 绿写成 **dispatch/recheck 已齐 / R4 关 / 题域已隔离**
- [ ] 未把 `m4-rag:prove` 绿写成 RAG/题域切流
- [ ] 未切 / 未弱化 qbank 生产路径作为本切片「关闭证据」
- [ ] 未宣称 HA / releaseEvidence=true / sole cutover / flip default

---

## 5. 矩阵 / 登记引用

| 引用 | ID / 节 |
|------|---------|
| gap-bug-backlog | GAP-RAG-04 |
| m4-rag-hard-gates | §R4 |
| r5-retirement-sole-stack-status | G4 |
| PRD / funnel | PRD-TEST-016 · RAG-FUNNEL-01…06（关闭条件上游） |

---

## 6. FOLLOW recheck（2026-09-16 · **post-prove dual-passed**）

**立场**：硬闸文档已生效；pre-exec dual **passed** → honesty subset 已复跑（EXIT=0）；**仍 ≠ R4 关 / ≠ 题域已隔离**。  
**不等同**：09-10 dispatch-recheck dual-pass；G-R2-5 dual-pass；R2 wire dual-pass；**本绿 ≠ R4 closed**。

### 6.1 差距诚实勾选（实现方自认 · 非专家签核）

- [x] 缺 snapshot 已 fail-closed（G-R2-5）— 旧「仍 unscoped」过时
- [x] R2 wire 已齐 / overall NOT closed / ≠ 路由已生效
- [x] Worker 仍零 `dispatchTrackLocalRetrieval(` / 无 per-turn planner→RetrievalPlan
- [x] wrong_track=0 / NHP-R4-ADV-01 仍 gap/blocked
- [x] pre-exec dual **passed**（`2026-09-16-g4-dispatch-recheck-FOLLOW-mw-{rag-route,e2e-ha}.md`）
- [x] honesty subset **EXIT=0**（~04:47 PT）— 读法见 §6.3
- [x] **post-prove dual-passed**（`2026-09-16-g4-dispatch-recheck-FOLLOW-post-prove-mw-{rag-route,e2e-ha}.md`）— 读法：≠ R4 关 / ≠ full wire
- [x] 未宣称 R4 / 题域已隔离 / full P-WIRE / covered / HA（FOLLOW 范围）

### 6.2 NHP-R4 列（登记 · case-only/gap/blind）

| 列 | Case | 旗 | 关闭 R4？ |
|----|------|----|-----------|
| NEG | NHP-R4-NEG-01 | partial（G-R2-5） | 否 |
| FAULT | NHP-R4-FAULT-01 | gap/blind（无生产 recheck） | 否 |
| BOUND | NHP-R4-BOUND-01 | partial/honesty（主叶 only） | 否 |
| ADV | NHP-R4-ADV-01 | gap/blocked | 否 |
| PERF | NHP-R4-PERF-01 | blind | 否 |
| LOAD | NHP-RAG-LOAD-01 | blind | 否 |

### 6.3 Post-prove CMD+EXIT（实现方自跑 · **非**专家签核 · **≠ R4 关**）

见 harness §6b.4 / status §6.1；收据：`.tmp/r4-follow-post-prove-20260916/` · HEAD `639134f` · ~04:46–04:47 PT。

| CMD | 期望 | 本 FOLLOW 实测 | 读法 |
|-----|------|----------------|------|
| `pnpm g4-dispatch-recheck-prereq:prove` | 0 | **0**（2026-09-16 ~04:46 PT） | ≠ full wire · ≠ R4 关 |
| `pnpm g-r2-5-retrieve-fail-closed:prove` | 0 | **0**（2026-09-16 ~04:47 PT） | ≠ R2/R4 关 |
| `pnpm g4-production-scoped-retrieve:prove` | 0 | **0**（2026-09-16 ~04:47 PT） | partial ≠ wrong_track=0 |
| `pnpm r2-classify-job-route-prereq:prove` | 0 | **0**（2026-09-16 ~04:47 PT） | R2 overall NOT closed · ≠ 路由已生效 |
| `pnpm mysql-stack:r4-domain-isolation:prove` | 0 | **0**（2026-09-16 ~04:47 PT） | ≠ 题域已隔离 |
| `pnpm mysql-stack:m4-rag:prove` | 0 | **0**（2026-09-16 ~04:47 PT） | §R4 NOT closed |

### 6.4 REQUEST

**pre-exec（已 dual-pass · ≠ R4 关）**

- `reviews/REQUEST-2026-09-16-g4-dispatch-recheck-FOLLOW-mw-rag-route.md` → `2026-09-16-g4-dispatch-recheck-FOLLOW-mw-rag-route.md`
- `reviews/REQUEST-2026-09-16-g4-dispatch-recheck-FOLLOW-mw-e2e-ha.md` → `2026-09-16-g4-dispatch-recheck-FOLLOW-mw-e2e-ha.md`

**post-prove（dual-passed · ≠ R4 关）**

- `reviews/REQUEST-2026-09-16-g4-dispatch-recheck-FOLLOW-post-prove-mw-rag-route.md` → `2026-09-16-g4-dispatch-recheck-FOLLOW-post-prove-mw-rag-route.md`
- `reviews/REQUEST-2026-09-16-g4-dispatch-recheck-FOLLOW-post-prove-mw-e2e-ha.md` → `2026-09-16-g4-dispatch-recheck-FOLLOW-post-prove-mw-e2e-ha.md`

## 7. R4-REAL-WIRE（2026-09-16 · **pre-exec dual-passed · correctly NOT wiring**）

**立场**：FOLLOW post-prove dual **passed** ≠ 授权真接线。本刀 = 最小诚实 wire 库存 + 假绿风险 + NHP 列 + REQUEST。  
**实现方裁定**：**产品风险高（P-PLANNER 主挡）→ 不 coding / 不 prove 绿关**。  
**dual 结果**：**pass**（`2026-09-16-r4-real-wire-mw-{rag-route,e2e-ha}.md`）= **correctly NOT wiring**；**≠** coding 授权 · **≠** R4 关。  
**下一刀**：**P-PLANNER**（§8）。

### 7.1 库存勾选（实现方自认 · 非专家签核）

- [x] intended wire 路径已写（harness §6c.1：W1–W6）
- [x] 假绿风险表已写（§6c.2 · 含 P-FAKEPLAN）
- [x] 产品阻塞表已写（§6c.3 · P-PLANNER / P-R2 / P-R1 / P-META / P-WT0）
- [x] NHP-R4 NEG/FAULT/BOUND/ADV/PERF/LOAD **未升格**（仍 partial/gap/blind）
- [x] Worker **仍零** `dispatchTrackLocalRetrieval(`（本刀未改代码）
- [x] dual **passed**（正确不接线）— **仍禁止** coding / 仍禁止宣称 R4 关 / full wire（须 P-PLANNER + 另授权）
- [x] 未宣称题域已隔离 / wrong_track=0 / HA / `releaseEvidence=true`

### 7.2 NHP-R4（本刀）

| 列 | Case | 旗 | 关闭 R4？ |
|----|------|----|-----------|
| NEG | NHP-R4-NEG-01 | partial | 否 |
| FAULT | NHP-R4-FAULT-01 | gap/blind | 否 |
| BOUND | NHP-R4-BOUND-01 | partial/honesty | 否 |
| ADV | NHP-R4-ADV-01 | gap/blocked | 否 |
| PERF | NHP-R4-PERF-01 | blind | 否 |
| LOAD | NHP-RAG-LOAD-01 | blind | 否 |

### 7.3 CMD

| CMD | 本刀 | 读法 |
|-----|------|------|
| REAL-WIRE prove | **not_run:pre_dual_review**（无新 prove） | 双审前禁绿关 |
| honesty subset（旁证） | 不作为本刀关闭证据 | ≠ REAL-WIRE 齐 ≠ R4 关 |

### 7.4 REQUEST

- `reviews/REQUEST-2026-09-16-r4-real-wire-mw-rag-route.md` → `2026-09-16-r4-real-wire-mw-rag-route.md`（**pass · correctly NOT wiring**）
- `reviews/REQUEST-2026-09-16-r4-real-wire-mw-e2e-ha.md` → `2026-09-16-r4-real-wire-mw-e2e-ha.md`（**pass · correctly NOT wiring**）

## 8. P-PLANNER（2026-09-16 ~05:10 PT · **REQUEST-ready / not_run:pre_dual_review**）

**立场**：REAL-WIRE dual 确认主挡 **P-PLANNER** → 本刀 = true planner **验收门文档**（标准 + gap + 冻结 CMD + REQUEST）。  
**禁止**：Worker coding · prove 绿关 · P-FAKEPLAN · 宣称 R4/planner 已关。  
**对照**：`harness/r4-p-planner.md` · `eval/r4-p-planner.eval.md` · `r4-p-planner.slice.md` · 父 harness §6d。

### 8.1 勾选（实现方自认 · 非专家签核）

- [x] true-planner 标准已写（含 generationId/recipeId · 禁 P-FAKEPLAN · 保留 G-R2-5 · wire≠R4 closed）
- [x] gap 库存诚实（Worker 无 planner→retrieve；无生产 planner prove 绿路径可宣称）
- [x] CMD 冻结 **not_run:pre_dual_review**；本刀 **零代码 · 零 prove**
- [x] NHP-R4 **未升格 covered**
- [ ] dual 未齐 — 禁止宣称验收门已关 / 禁止自动授权 coding
- [x] R4 **仍 NOT closed**；REAL-WIRE **仍正确不接线**；`releaseEvidence=false`

### 8.2 REQUEST

- `reviews/REQUEST-2026-09-16-r4-p-planner-mw-rag-route.md`（**待审**）
- `reviews/REQUEST-2026-09-16-r4-p-planner-mw-e2e-ha.md`（**待审**）
