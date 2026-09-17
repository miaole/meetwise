# Harness — UC-E2E-040–043 B 端批匹配/题库/席位（eval-first · honest batch-gap / mark-red）

**releaseEvidence=false** · **Not HA** · **本绿 ≠ 全链路 E2E covered** · **≠ UC-E2E-040–043 covered**  
**对照矩阵行**：`UC-E2E-040–043`  
**对照建议补集**：`e2e-requirement-coverage-matrix.md` §3 P1-3  
**对照需求**：`e2e-scenarios.md` UC-E2E-040（BatchJob partial_failed）· UC-E2E-041（题库导入 partial_failed）· UC-E2E-042（双签/PII）· UC-E2E-043（席位 CAS）· D4  
**对照旁证（≠ covered）**：`e2e/full.e2e.ts` 岗位幂等+投递+绑定面试 · UI `recruiting-bound.spec.ts` · `pnpm recruiter:prove` · `neg:bend` · `qbank-ingest`（RAG ≠ UC-041）  
**MODEL_API_KEY**：**不需要**（静态 inventory + GAP mark-red；不调 live 模型；不跑 HTTP / e2e:isolated 全链）

---

## 0. 立场（先读）

| 声明 | 裁定 |
|------|------|
| 现有覆盖 | 矩阵 **partial**：单岗位绑定闭环有（full.e2e + recruiting-bound）；**批任务 / 题库导入 / 席位 CAS = gap** |
| 本切片 | 可执行 **S1–S5** 静态库存 + **G-GAP-*** honesty mark-red；矩阵保持 **partial**；**不得**写 partial-as-closed / covered |
| 执行层 | **NON-UI** 静态 inventory（apps/api test）；**不**扩 BatchJob/SeatLedger 实现冒充闭环 |
| 假绿禁令 | 不得把 full.e2e 岗位绑定 / recruiting-bound / recruiter:prove / qbank-ingest / 本绿写成「批匹配/题库导入/席位 CAS 已通」或「UC-E2E-040–043 covered」 |
| 本绿≠全链路 E2E covered | **必须钉死**；EXIT=0 = 诚实钉缺口 ≠ A1 batch/import/seat 产品/E2E 闭环 |
| fixture | 经 `run-e2e-isolated` → **pgvector** → **green-risk / R5**（静态体不读写业务表；banner 仍可能出现） |

专家：`mw-e2e-ha` + `mw-privacy-int`（B-C）或 `mw-model-op`。禁止作者自签 covered。

---

## 1. 测什么（S1–S5 + G-GAP 可执行合同）

| ID | 场景（UC 映射） | 期望 | 执行体 |
|----|-----------------|------|--------|
| **S1** | Recruiter HTTP 库存 | `recruiter` 有 jobs/candidates/invite；**无** batch/match/seat/qbank-import 路由 | `apps/api/test/uc-e2e-040-043-batch-qbank-seat.proof.mjs` |
| **S2** | 表库存 | migrations **无** `batch_job` / `seat_ledger`/`seat_quota` / `question_bank_item` CREATE | 同上 |
| **S3** | 旁证≠本 UC | `qbank-ingest` ≠ UC-041；privacy `partial_failed` ≠ BatchJob | 同上 |
| **S4** | e2e 旁证边界 | `full.e2e` / `recruiting-bound` 有绑定闭环；**无** UC-E2E-040–043 / TC 钉 | 同上 |
| **S5** | Spec vs load | scenarios 定义 040–043 + D4；`status-machine.md` **未**载 BatchJob/SeatLedger/QuestionBankItem；bend-recruiting TARGET | 同上 |
| **G-GAP-1** | UC-040 · TC-batch/partial | 打印 `GAP-UC040-BATCH-PARTIAL` | 同上 |
| **G-GAP-2** | UC-041 · TC-import-partial | 打印 `GAP-UC041-IMPORT-PARTIAL` | 同上 |
| **G-GAP-3** | UC-042 · TC-dual-sign | 打印 `GAP-UC042-DUAL-SIGN` | 同上 |
| **G-GAP-4** | UC-043 · TC-seat-race | 打印 `GAP-UC043-SEAT-CAS` | 同上 |
| **G-GAP-5** | D4 载重 | 打印 `GAP-UC040-043-D4-STATUS` | 同上 |
| **G-GAP-6** | E2E 场景缺席 | 打印 `GAP-UC040-043-E2E` | 同上 |

**产品若浮出（fail-closed）**：若 recruiter 已挂 batch/seat/import 路由、或 D4 表/状态机已载、或 e2e 钉 UC-040–043，本 prove **拒 EXIT=0**；须另刀产品闭环 prove（TC-E2E-040–043）。

**明确不测 / BLOCKED（本 harness）**

| 非目标 | 原因 |
|--------|------|
| BatchJob partial_failed HTTP/saga | 产品未接线；`GAP-UC040-BATCH-PARTIAL` |
| B 端题库文件导入 partial_failed | 产品未接线；`GAP-UC041-IMPORT-PARTIAL` |
| QuestionBankItem 双签 CAS | 产品未接线；`GAP-UC042-DUAL-SIGN` |
| SeatLedger 并发占席无超卖 | 产品未接线；`GAP-UC043-SEAT-CAS` |
| 扩 D4 状态机 + 表 + HTTP 实现 | eval-first honesty；**不**本切片扩实现冒充闭环 |
| 云 / HA / releaseEvidence | Not HA · releaseEvidence=false |

---

## 1b. 抬到 covered 还缺（HTTP/product path · 非仅 GAP 标签）

> partial/gap/honesty-pin **≠ done**。下列是北星「全链路零遗漏」要关的产品/E2E 路径，不是本 prove 已绿项。

| # | 抬到 **covered** 仍缺（HTTP / product） | 对应验收 |
|---|------------------------------------------|----------|
| 1 | D4：将 `BatchJob` / `QuestionBankItem` / `SeatLedger` 纳入 `status-machine` 载重 + 契约定义（裁决 in-scope） | D4 前置 |
| 2 | `BatchJob` HTTP：上传候选人集+JD → `queued→running→completed|partial_failed`；子任务幂等键 `(batchId, candidateId)`；部分失败可重跑不重复落账 | UC-040 A1–A2 · TC-E2E-040-batch / partial |
| 3 | 批任务跨租户 RLS 0 行（独立于单岗位 RLS 旁证） | UC-040 A3 · TC-E2E-040-rls |
| 4 | B 端题库**文件**导入：混合合法/非法行 → `partial_failed` + draft 入库 + 非法行明细；重复导入幂等 | UC-041 A1/A3 · TC-E2E-041-* |
| 5 | `QuestionBankItem`：`draft→enriched→pinned→adopted` 双签 CAS；同人双签不计第二票；PII 泛化；pinned 不可变 | UC-042 A1–A3 · TC-E2E-042-* |
| 6 | `SeatLedger`：`used < total` CAS；并发占最后一席恰一人成功；耗尽拒；移除回补 | UC-043 A1–A3 · TC-E2E-043-* |
| 7 | `e2e/*.e2e.ts`（或 full.e2e 专段）+ 隔离 HTTP：批/导入/席位最小集；不得把单岗位绑定冒充本行 covered | TC 全套 |
| 8 | sole-stack 夹具（MySQL+Qdrant+Redis）替换默认 pgvector isolated，去掉 **R5 green-risk** 后才可讨论发布级 covered | 矩阵 §0 / R5 |

**本切片明确不做**：上表实现；把 full.e2e 绑定 / recruiting-bound / qbank-ingest 绿写成 covered；把矩阵升 covered / 假 partial-closed。

---

## 2. 命令与期望 EXIT

| CMD | 期望 EXIT | 含义（诚实） |
|-----|-----------|--------------|
| `pnpm uc040-043:batch-qbank-seat:prove` | **0** | S1–S5 库存绿 + G-GAP-* 诚实钉；**本绿 ≠ UC-E2E-040–043 covered**；矩阵保持 **partial** + batch gaps；fixture banner → **green-risk / R5** |
| `pnpm uc040-043:batch-qbank-seat:prove:raw`（仅经 isolated 子进程） | **0** | raw：`pnpm -C apps/api prove:uc040-043-batch-qbank-seat` |
| `pnpm eval-harness-matrix-cite:prove` | **0** | 静态：harness+eval 引用 `UC-E2E-040–043`；≠业务 covered |
| `pnpm recruiter:prove` / `neg:bend` / full.e2e 绑定段 | **0**（旁证） | 单岗位/RLS；**≠** 批匹配/导入/席位 CAS |

```bash
cd /workspace/meetwise
# 无需 MODEL_API_KEY；静态 inventory（isolated 包装对齐 siblings CMD 形态）
pnpm uc040-043:batch-qbank-seat:prove ; echo EXIT=$?
pnpm eval-harness-matrix-cite:prove ; echo EXIT=$?
```

执行体：`apps/api/test/uc-e2e-040-043-batch-qbank-seat.proof.mjs`  
入口：`package.json` → `uc040-043:batch-qbank-seat:prove` → `scripts/run-e2e-isolated.mjs uc040-043:batch-qbank-seat:prove:raw`

**旁证（≠本 UC 验收）**：`e2e/full.e2e.ts` recruiting binding；`apps/web/e2e-ui/recruiting-bound.spec.ts`；`pnpm recruiter:prove`；`pnpm neg:bend`；`packages/db/src/qbank-ingest.ts`。

---

## 3. 假绿标红

| 若有人说… | 正确读法 |
|-----------|----------|
| 「full.e2e 岗位绑定绿了所以 040–043 covered」 | **假绿**。单岗位绑定 ≠ BatchJob / 题库导入 / 席位 CAS |
| 「recruiting-bound.spec 绿 = 批匹配 covered」 | **假绿**。UI 绑定浅层 ≠ 批任务 saga |
| 「qbank-ingest / qbank:prove 绿 = UC-041 导入」 | **假绿**。RAG 语料灌库 ≠ B 端 HR 文件导入 partial_failed |
| 「privacy partial_failed = BatchJob partial_failed」 | **假绿**。删除目标态 ≠ 批匹配状态机 |
| 「uc040-043:…:prove 绿 = covered / partial-closed」 | **假绿**。EXIT=0 = **honest gap mark-red**；矩阵保持 **partial** + batch gaps |
| 「G-GAP EXIT=0 = A1 批/导入/席位已闭环」 | **假绿**。GAP 表示未闭环；D4 未载重 |
| 「bend-recruiting 写了席位所以实现已通」 | **假绿**。TARGET 规格 ≠ 代码 CAS prove |

---

## 4. 矩阵锚点

| ID | 状态（有执行体绿后） | 本 harness |
|----|----------------------|------------|
| UC-E2E-040–043 | **partial**（单岗位绑定）+ 批/导入/席位 **gap**（honest pin）；**≠ covered** | `harness/uc-e2e-040-043-batch-qbank-seat.md` |
| 评测说明 | `eval/uc-e2e-040-043-batch-qbank-seat.eval.md` | 引用矩阵行 ID |
| P1-3 | 静态 GAP mark-red 已挂；批/导入/席位 HTTP 仍缺（见 §1b） | 见矩阵 §3 |
