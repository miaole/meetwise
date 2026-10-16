# Harness — UC-E2E-028 trace/账本失败不阻塞（eval-first · honest gap / mark-red）

**releaseEvidence=false** · **Not HA** · **本绿 ≠ 全链路 E2E covered** · **≠ UC-E2E-028 covered**  
**对照矩阵行**：`UC-E2E-028`  
**对照建议补集**：`e2e-requirement-coverage-matrix.md` §3 P1-10（本切片新增）  
**对照需求**：`e2e-scenarios.md` UC-E2E-028 · A1 注入 trace 写失败业务仍 completed+额度 confirmed · A2 对账补写 · A3 业务真相写失败必须阻塞 · TC-E2E-028-trace-fail / recon / truth-block  
**对照旁证（≠ covered）**：`report-bulkhead.proof.ts`（报告舱壁）· `releaseSharedAdmissionBestEffort` · `reqid:prove` / `estimate-threading-invoke` · `model-invocation-reconcile:prove` · spec `ai-safety-system.md` best-effort 行  
**MODEL_API_KEY**：**不需要**（静态 inventory + GAP mark-red；不调 live 模型；不跑 HTTP / e2e:isolated 全链）

---

## 0. 立场（先读）

| 声明 | 裁定 |
|------|------|
| 现有覆盖 | 矩阵原 **gap**（无专用）。搜码：`persistTrace` **存在**且 INSERT `ai_invocation_trace`，但与 `settleAiTextCost` / `completeModelInvocation` **同事务**；失败 → `external_outcome_unknown`（**非** fail-open） |
| 本切片 | 可执行 **S1–S5** 静态库存 + **G-GAP-*** honesty mark-red；矩阵保持 **gap**（honest）；**不得**写 partial-as-closed / covered |
| 执行层 | **NON-UI** 静态 inventory（apps/api test）；**不**改 invoke 实现冒充闭环 |
| 假绿禁令 | 不得把 report-bulkhead / admission best-effort / usage reconciler / 本绿写成「trace 失败不阻塞已通」或「UC-E2E-028 covered」 |
| 本绿≠全链路 E2E covered | **必须钉死**；EXIT=0 = 诚实钉缺口 ≠ A1/A2/A3 产品/E2E 闭环 |
| fixture | 经 `run-e2e-isolated` → **pgvector** → **green-risk / R5**（静态体不读写业务表；banner 仍可能出现） |

专家：`mw-e2e-ha` + `mw-model-op`。禁止作者自签 covered。

---

## 1. 测什么（S1–S5 + G-GAP 可执行合同）

| ID | 场景（UC 映射） | 期望 | 执行体 |
|----|-----------------|------|--------|
| **S1** | persistTrace 库存 | `persistTrace` + INSERT `ai_invocation_trace`；注释钉「无条件写入」 | `apps/api/test/uc-e2e-028-trace-ledger-fail-open.proof.mjs` |
| **S2** | 同事务耦合 | persistTrace 与 settle/complete 同 region；catch → `external_outcome_unknown`；**无** `.catch` fail-open 包装 | 同上 |
| **S3** | 无补写队列 | invoke / worker 无 missing-trace rewrite/recon 符号；usage-calibration ≠ UC-028 | 同上 |
| **S4** | 无 e2e 场景 | `e2e/*.e2e.ts` / `full.e2e.ts` **无** UC-E2E-028 / TC-E2E-028 | 同上 |
| **S5** | Spec vs code | ai-safety best-effort + UC-028「不回滚」；report-bulkhead 旁证在且不宣称 UC-028 | 同上 |
| **G-GAP-1** | A1 · TC-trace-fail | 打印 `GAP-UC028-FAIL-OPEN` | 同上 |
| **G-GAP-2** | A2 · TC-recon | 打印 `GAP-UC028-RECON` | 同上 |
| **G-GAP-3** | A3 · TC-truth-block | 打印 `GAP-UC028-TRUTH-BLOCK-E2E` | 同上 |
| **G-GAP-4** | 注入夹具 | 打印 `GAP-UC028-INJECT` | 同上 |

**产品若浮出（fail-closed）**：若 settle region 已 `.catch` 旁路 persistTrace、或出现 rewrite 队列、或 e2e 钉 UC-028，本 prove **拒 EXIT=0**；须另刀 fail-open isolation prove（TC-E2E-028-*）。

**明确不测 / BLOCKED（本 harness）**

| 非目标 | 原因 |
|--------|------|
| 注入 trace INSERT 失败下面试 completed | 产品未隔离；`GAP-UC028-FAIL-OPEN` / `INJECT` |
| 缺失 trace 对账补写 | 无队列；`GAP-UC028-RECON` |
| A3 对照 E2E（真相失败阻塞 vs trace 不阻塞） | 仅 inventory；`GAP-UC028-TRUTH-BLOCK-E2E` |
| 改 invoke 把 persistTrace 拆出事务 | eval-first honesty；**不**本切片扩实现冒充闭环 |
| 云 / HA / releaseEvidence | Not HA · releaseEvidence=false |

---

## 1b. 抬到 covered 还缺（HTTP/product path · 非仅 GAP 标签）

> partial/gap/honesty-pin **≠ done**。下列是北星「全链路零遗漏」要关的产品/E2E 路径，不是本 prove 已绿项。

| # | 抬到 **covered** 仍缺（HTTP / product） | 对应验收 |
|---|------------------------------------------|----------|
| 1 | `persistTrace` **旁路** best-effort：与 settle/complete **分事务**；INSERT 失败只记降级 metric/标记，**不**回滚已成功校验的业务结果、**不**改写为 `external_outcome_unknown` | A1 · TC-E2E-028-trace-fail |
| 2 | 故障注入 harness：强制 `ai_invocation_trace` 写失败（权限/约束/mock client）→ 面试仍 `completed`、额度仍 `confirmed` | A1 |
| 3 | missing-trace **重写队列 / 标记缺失** + 以 `interview_event`（事件账本）为准的事后对账补写路径 + prove | A2 · TC-E2E-028-recon |
| 4 | 对照 E2E：业务真相（钱/状态）写失败 **必须**阻塞；与 trace 旁路失败对照断言（防混淆） | A3 · TC-E2E-028-truth-block |
| 5 | `e2e/*.e2e.ts`（或 full.e2e 专段）经隔离 HTTP/worker：注入 → 终态 + 额度；并扫日志无二次扣费 | TC 全套 |
| 6 | 不得把 **report 舱壁** / Langfuse noop / admission best-effort 冒充本 UC | 假绿禁令 |
| 7 | sole-stack 夹具（MySQL+Qdrant+Redis）替换默认 pgvector isolated，去掉 **R5 green-risk** 后才可讨论发布级 covered | 矩阵 §0 / R5 |

**本切片明确不做**：上表实现；把旁证 prove 绿写成 covered；把矩阵升 partial-closed / covered。

---

## 2. 命令与期望 EXIT

| CMD | 期望 EXIT | 含义（诚实） |
|-----|-----------|--------------|
| `pnpm uc028:trace-fail-open:prove` | **0** | S1–S5 库存绿 + G-GAP-* 诚实钉；**本绿 ≠ UC-E2E-028 covered**；矩阵保持 **gap**；fixture banner → **green-risk / R5** |
| `pnpm uc028:trace-fail-open:prove:raw`（仅经 isolated 子进程） | **0** | raw：`pnpm -C apps/api prove:uc028-trace-fail-open` |
| `pnpm eval-harness-matrix-cite:prove` | **0** | 静态：harness+eval 引用 `UC-E2E-028`；≠业务 covered |
| `pnpm report:prove` / worker report-bulkhead / `reqid:prove` | **0**（旁证） | 报告舱壁 / reqId 落库；**≠** trace fail-open |

```bash
cd /workspace/meetwise
# 无需 MODEL_API_KEY；静态 inventory（isolated 包装对齐 siblings CMD 形态）
pnpm uc028:trace-fail-open:prove ; echo EXIT=$?
pnpm eval-harness-matrix-cite:prove ; echo EXIT=$?
```

执行体：`apps/api/test/uc-e2e-028-trace-ledger-fail-open.proof.mjs`  
入口：`package.json` → `uc028:trace-fail-open:prove` → `scripts/run-e2e-isolated.mjs uc028:trace-fail-open:prove:raw`

**旁证（≠本 UC 验收）**：`apps/worker/test/report-bulkhead.proof.ts`；`releaseSharedAdmissionBestEffort`；`pnpm reqid:prove`；`estimate-threading-invoke`；`model-invocation-reconcile:prove`。

---

## 3. 假绿标红

| 若有人说… | 正确读法 |
|-----------|----------|
| 「report-bulkhead 绿了所以 028 covered」 | **假绿**。报告舱壁 ≠ `ai_invocation_trace` 写失败不阻塞 |
| 「admission best-effort / Langfuse noop = fail-open」 | **假绿**。并发槽/分析层 ≠ 自库 trace 旁路隔离 |
| 「usage-calibration-reconciler 绿 = A2 补写」 | **假绿**。token 校准 ≠ missing-trace 对账补写 |
| 「uc028:trace-fail-open:prove 绿 = covered / partial-closed」 | **假绿**。EXIT=0 = **honest gap mark-red**；矩阵保持 **gap** |
| 「G-GAP EXIT=0 = A1 fail-open 已闭环」 | **假绿**。GAP 表示未闭环；代码仍同事务耦合 |
| 「spec 写了 best-effort 所以实现已通」 | **假绿**。规格 ≠ 代码隔离 prove |

---

## 4. 矩阵锚点

| ID | 状态（有执行体绿后） | 本 harness |
|----|----------------------|------------|
| UC-E2E-028 | **gap**（honest；S1–S5 + G-GAP pin）；**≠ covered**；**≠** 假 partial-closed | `harness/uc-e2e-028-trace-ledger-fail-open.md` |
| 评测说明 | `eval/uc-e2e-028-trace-ledger-fail-open.eval.md` | 引用矩阵行 ID |
| P1-10 | 静态 GAP mark-red 已挂；fail-open 旁路 + 注入 + recon + A3 E2E 仍缺（见 §1b） | 见矩阵 §3 |

