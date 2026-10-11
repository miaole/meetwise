# 审查归档 — **MODEL-OP real reconciler wiring** · **post-prove** · mw-e2e-ha

**日期**：2026-09-17 ~19:47 PT（post-prove 独立复跑）  
**审稿人**：`mw-e2e-ha`（对抗独立审 · **不采信**实现方自报 EXIT；本审 **独立复跑** 3 CMD · **未跑** `worker-wakeup-redis:prove` · **未读** `.env*` · **未触** Meridian · **未**自写 `post_prove_dual_pass`）  
**送审**：`reviews/REQUEST-2026-09-17-model-op-real-reconciler-wiring-post-prove-mw-e2e-ha.md`  
**对照（全文只读）**：
- `receipts/2026-09-17-model-op-real-reconciler-wiring-prove.md`（实现方 CMD+EXIT）
- `harness/model-op-real-reconciler-wiring.md`（**`executed:awaiting_post_prove_dual`** · Ban self-write）
- `eval/model-op-real-reconciler-wiring.eval.md` · `model-op-real-reconciler-wiring.slice.md`
- Prep dual：`reviews/2026-09-17-model-op-real-reconciler-wiring-mw-e2e-ha.md`（pass · 执行前文档闸）
- Prior W5 边界：`reviews/2026-09-17-w5-model-op-dual-reconciler-wakeup-mw-e2e-ha.md` · `harness/w5-model-op-dual-reconciler-wakeup.md`（**≠W5**）
- Spot：`apps/worker/src/main.ts` · `apps/worker/src/usage-calibration-reconcile.ts` · `w0-w8-workflow-status.md` MODEL-OP-wire 行
**配对**：`REQUEST-2026-09-17-model-op-real-reconciler-wiring-post-prove-mw-rag-route.md`（**须独立签**；冲突取更严；**本审不代签 / 不等待**）  
**结论**：**pass**（scope = **post-prove**）  
**批准范围**：**仅**同意本刀 coding+prove 面在本环境独立复跑诚实绿：dual reconciler（invocation retained + usage-calibration **newly wired**）worker drain/stop/ready · PG LISTEN/NOTIFY **provisional retained** · Redis **deferred / not STOPPED** · 3× prove EXIT=0 · knife 仍 **`executed:awaiting_post_prove_dual`** · `releaseEvidence=false` · **≠HA** · Ban false green / MODEL-OP fake green / SLO forge · **≠W5 masquerade**  
**不批**：MODEL-OP closed · reconciler/wakeup **cutover** · 删 PG LISTEN · Redis production cutover · SLO/HA/suite/`releaseEvidence=true` · 实现方自批 · 本域 pass = dual 齐 · 自写/升格 `post_prove_dual_pass` · W5 redo · MySQL/Qdrant reopen  
**硬钉**：**≠W5** · PG LISTEN retained · Ban delete listener · Redis deferred ≠ STOPPED · Ban Redis cutover claim · Ban假绿/SLO · Dual prep ≠ already-wired masquerade · Ban self-approve `dual_pass` · `releaseEvidence=false` · **≠HA** · redis-wakeup **not run (deferred)** honesty OK · 须配对 `mw-rag-route` 独立 · awaiting dual

---

## 0. 结论表（范围钉死）

| 项 | 裁定 |
|----|------|
| **Verdict** | **pass** |
| **Scope** | **post-prove** — NOT MODEL-OP closed · NOT cutover · NOT SLO green · NOT HA · NOT suite · NOT Redis cutover · NOT W5 redo · NOT self-written `post_prove_dual_pass` |
| 实现方自批 / REQUEST 预写 | **无效 / 拒绝**；本审独立裁定 |
| Knife status | 仍 **`executed:awaiting_post_prove_dual`** · 实现方 **未**自写 `post_prove_dual_pass` · **本审亦不写** |
| 独立复跑 3 CMD | **EXIT 0 / 0 / 0**（与实现方表一致；仍以本审为准） |
| redis-wakeup | **not run**（deferred）· honesty OK · ≠ cutover |
| Prod wakeup | **PG LISTEN/NOTIFY provisional retained** · Ban delete |
| Redis wake | **Deferred · not STOPPED** · Ban cutover claim |
| Dual reconciler wiring | **诚实** — invocation retained + usage-calibration wired（drain/stop/ready · gateway enum）· ≠ MODEL-OP closed |
| `releaseEvidence` | **false** |
| HA / suite / SLO | **≠HA** · **≠suite** · Ban假绿 / Ban forge SLO |
| ≠ W5 | **硬钉** — W5 = docs honesty closed；本刀 = separate coding+prove |
| Blockers（本域 post-prove） | **无阻塞**（见 §5；配对域独立；cutover / SLO / dual 升格仍禁） |

---

## 1. HEAD / 已读 / 对照

| 角色 | 路径 | 观察 |
|------|------|------|
| REQUEST（本域 post-prove） | `REQUEST-…-post-prove-mw-e2e-ha.md` | Q1–Q5；硬钉完整；禁自批；prove EXIT=0 表；await dual |
| Receipt | `receipts/…-prove.md` | 实现方 CMD+EXIT 0/0/0 · redis not run · Ban self-write |
| Harness | `harness/model-op-real-reconciler-wiring.md` | **`executed:awaiting_post_prove_dual`** · pins 齐 · Ban self-write |
| Prep prior | `…-wiring-mw-e2e-ha.md` | pass · 执行前文档闸 · Dual prep ≠ coding this prep（当时） |
| W5 prior | `…-w5-…-mw-e2e-ha.md` | W5 docs `post_prove_dual_pass` · **≠** 本刀 coding auth |
| Spot main.ts | `apps/worker/src/main.ts` | `startWorkerJobWakeupListener` **retained** · Redis Streams flag-off additive · dual reconciler start + ready + SIGTERM stop |
| Spot usage | `apps/worker/src/usage-calibration-reconcile.ts` | `runDrainLoop` · gateway owners · honesty pins in header |
| Pair REQUEST | `REQUEST-…-post-prove-mw-rag-route.md` | 已备；本审 **不代签** |

### 1.1 HEAD（brief）

| 项 | 值 |
|----|-----|
| Claimed SHA_B（wire+prove） | **`6cd621c`** · `feat(model-op-wire): wire dual reconciler + prove (awaiting_post_prove_dual)` |
| Prep SHA_A | **`d92d42b`** · `docs(delivery): nail MODEL-OP-wire prep as post_prove_dual_pass` |
| Observed HEAD（本审时） | **`42f77c1`** · `docs(delivery): nail north-star for R4/FUNNEL rem post_prove_dual_pass` |
| Ancestry | **`6cd621c` is ancestor of HEAD** · **`d92d42b` is ancestor of HEAD** · 其后 docs（G7 Key×3 REQUEST open · R4/FUNNEL north-star nail）**不改变**本刀 post-prove 证据面 |
| 本审动作 | **独立复跑** 3 prove · **未跑** redis-wakeup · **未读** `.env*` · **未触** Meridian · **未改** harness status · 仅写本 review |

### 1.2 ≠W5 边界（对抗钉死）

| 面 | W5（已关 docs） | 本刀 MODEL-OP-wire（post-prove） |
|----|-----------------|----------------------------------|
| 性质 | docs honesty · dual reconciler/wakeup **honesty** | **separate** coding+prove · real worker wiring |
| 状态 | **`post_prove_dual_pass`** on `25833fc` | **`executed:awaiting_post_prove_dual`**（await experts） |
| Dual PASS 含义 | ≠ authorize coding / cutover | 本域 post-prove **pass** ≠ dual 齐 · ≠ 自写 `post_prove_dual_pass` · ≠ MODEL-OP closed |
| 可批范围（本审） | （已归档）docs-only | **仅** post-prove 诚实绿 · **不批** cutover / SLO / HA |

**裁定**：送审 artefacts **未**把本刀写成 W5 redo / W5 已授权 cutover / 假绿升格。≠W5 边界清楚。

---

## 2. 独立复跑 CMD+EXIT（权威 · 不采信自报）

复跑时刻：2026-09-17 ~19:47 PT · cwd `/workspace/meetwise` · **未加载** API keys（prove 不要求）· **未读** `.env*` · 日志：`.tmp/model-op-wire-post-prove-ha/`。

| # | CMD | EXIT | 关键 NOTE（本审日志） | 诚实读法（硬钉） |
|---|-----|------|------------------------|------------------|
| 1 | `pnpm model-invocation-reconcile:prove` | **0** | isolated PG · migrations applied · proof PASS · `LOCAL_ISOLATED_PROOF_RECEIPT … release_evidence=false` · `[R5-MARKED-RED]` | ≠ MODEL-OP closed · ≠ SLO · ≠ cutover · ≠ HA |
| 2 | `pnpm model-op00-usage-reconciler:prove` | **0** | usage-calibration-reconciler 七类矩阵 PASS · `release_evidence=false` · `[R5-MARKED-RED]` | ≠ MODEL-OP closed · ≠ SLO · ≠ cutover · ≠ HA |
| 3 | `pnpm worker-wakeup:prove` | **0** | LISTEN lifecycle · channel/payload · reconnect · stop · migrate triggers PASS | PG LISTEN retained · ≠ Redis cutover |
| — | `pnpm worker-wakeup-redis:prove` | **not run** | 本审 **故意不跑**（deferred） | deferred honesty OK · ≠ STOPPED · ≠ cutover |

**对照实现方自报**：3/3 EXIT=0 与 receipt/REQUEST 表一致。**仍不采信自报作为唯一依据**——本表以本审复跑为准。

**未跑（禁 / deferred · 已核对）**：`worker-wakeup-redis:prove` · HA prove · suite · Meridian · 任何 `.env*` / secrets 加载。

---

## 3. REQUEST Q1–Q5（对抗答）

| # | 问题 | 本审答 | 对抗要点 |
|---|------|--------|----------|
| **Q1** | 抽查/复跑至少 usage-reconciler + worker-wakeup，附 CMD+EXIT？ | **已做 · 且扩至 3/3** | §2：`model-invocation-reconcile:prove` **0** · `model-op00-usage-reconciler:prove` **0** · `worker-wakeup:prove` **0**。EXIT=0 **≠** MODEL-OP closed / SLO / cutover / HA |
| **Q2** | usage-calibration worker wiring 是否诚实（drain/stop/ready · gateway enum · ≠ claim MODEL-OP closed）？ | **是（诚实）** | `usage-calibration-reconcile.ts`：`runDrainLoop` + `gatewayUsageCalibrationOwners`；`main.ts`：start · `workerReady` 含 `usageCalibrationReconcileLoop.ready()` · SIGTERM `stop()`。**Ban** 把 wiring green 读成 MODEL-OP closed / cutover / SLO |
| **Q3** | PG LISTEN 是否仍保留 · Redis 是否仍 deferred/not STOPPED？ | **是（硬钉）** | `startWorkerJobWakeupListener` **仍在**；Redis Streams = `MEETWISE_WAKEUP_REDIS_STREAMS` flag-off additive · **never replaces** PG LISTEN。**Ban** delete listener · **Ban** Redis cutover claim · **Ban** claim STOPPED |
| **Q4** | 是否同意 status 保持 **`executed:awaiting_post_prove_dual`**（实现方未自写 `post_prove_dual_pass`）？ | **同意（硬钉）** | harness/slice/eval/SSOT 均仍 awaiting。实现方 **未**自写。本审 **pass ≠** 代写/升格 `post_prove_dual_pass` · **须**配对 `mw-rag-route` 独立后才可 dual |
| **Q5** | 是否引入 secrets / `.env*` / W5 masquerade / HA/suite/`releaseEvidence=true`？ | **否（期望满足）** | 本审未读 `.env*` · 未发明 secrets · **≠W5** · `releaseEvidence=false` · **≠HA** · **≠suite** · Ban假绿 |

---

## 4. Spot 诚实核对（PG LISTEN · dual reconciler）

### 4.1 PG LISTEN retained

| 证据 | 裁定 |
|------|------|
| `main.ts`：`startWorkerJobWakeupListener(...)` | **retained** |
| 注释：Redis「never replaces the PG LISTEN session above」 | **诚实** |
| `worker-wakeup:prove` EXIT=0 | LISTEN lifecycle 绿 · **≠** Redis cutover |
| Ban delete listener | **仍有效** |

### 4.2 Dual reconciler wiring

| Face | 证据 | 诚实读法 |
|------|------|----------|
| model-invocation | `runModelInvocationReconciler` · ready · stop | retained · prove EXIT=0 ≠ closed |
| usage-calibration | **new** `runUsageCalibrationReconciler` · ready · stop · gateway enum / 0134 | newly wired · prove EXIT=0 ≠ closed |
| Dual prep ≠ already-wired masquerade | prep dual 仅文档闸；coding via standing authorize after `0137f39` / SHA_A `d92d42b` | **未**把 prep dual 冒充「早已 wired」 |

### 4.3 Redis deferred

| 项 | 裁定 |
|----|------|
| Redis Streams wakeup | flag-off additive · **deferred** |
| not STOPPED | **confirmed** — orthogonal under PG-retained · **≠** canceled incorrectly |
| `worker-wakeup-redis:prove` | **not run** · honesty OK |
| Ban Redis cutover claim | **仍有效** |

---

## 5. Blockers / 非目标

| 类 | 状态 |
|----|------|
| 本域 post-prove blockers | **none** |
| Knife status 升格 `post_prove_dual_pass` | **仍禁本审自写** — awaiting pair |
| Reconciler / Redis wake **cutover** | **仍禁** |
| 删 PG LISTEN | **仍禁** |
| SLO forge / HA / suite / MODEL-OP fake green | **仍禁** |
| 配对 `mw-rag-route` | **须独立** · 本审不代签 |
| W5 | **已关 docs** · 本刀 **≠** redo / masquerade |

---

## 6. 签名 / Non-claims / Confirm

**Verdict**：**pass**（scope = **post-prove**）  
**Signed**：`mw-e2e-ha` · 2026-09-17 ~19:47 PT  
**Pair**：`mw-rag-route` **独立** · 不代签 · 不代写 `post_prove_dual_pass`

**Confirm**：
- **≠W5** · **confirmed**
- PG LISTEN/NOTIFY **provisional retained** · Ban delete listener · **confirmed**
- Redis **deferred · not STOPPED** · Ban Redis cutover claim · redis-wakeup **not run** honesty OK · **confirmed**
- Ban假绿 / Ban forge SLO / MODEL-OP fake green · **confirmed**
- Dual prep ≠ already-wired masquerade · **confirmed**
- Ban self-approve `dual_pass` · knife 仍 `executed:awaiting_post_prove_dual` · **confirmed**
- `releaseEvidence=false` · **≠HA** · **≠suite** · **confirmed**
- awaiting dual · pair `mw-rag-route` independently · **confirmed**

**Non-claims**：Not W5 redo · not MODEL-OP closed · not reconciler/wakeup cutover · not Redis cutover · not SLO green · not HA · not suite · not `releaseEvidence=true` · not self-written `post_prove_dual_pass` · not this-domain pass = dual 齐 · not MySQL/Qdrant reopen · not secrets / `.env*`

---

*Review · mw-e2e-ha · MODEL-OP real reconciler wiring post-prove · 2026-09-17 (~19:47 PT) · Verdict=pass · scope=post-prove · CMD+EXIT 0/0/0 · redis-wakeup not run (deferred) · ≠W5 · PG LISTEN retained · Redis deferred · Ban假绿 · releaseEvidence=false · ≠HA · Ban self-approve dual_pass · awaiting dual · SHA_B 6cd621c · prep d92d42b · HEAD 42f77c1 · pair mw-rag-route independently*
