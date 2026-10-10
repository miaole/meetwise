# Harness — UC-E2E-010 SSE 断线重连 / Last-Event-ID 续传（eval-first · partial ladder）

**releaseEvidence=false** · **Not HA** · **本绿 ≠ 全链路 E2E covered** · **≠ UC-E2E-010 covered**  
**对照矩阵行**：`UC-E2E-010`  
**对照建议补集**：`e2e-requirement-coverage-matrix.md` §3 P1-1  
**对照需求**：`e2e-scenarios.md` UC-E2E-010 · A1/A2/A3 · E-replay  
**对照领域**：`cend-mock-interview.md` UC-INT-06  
**MODEL_API_KEY**：**不需要**（本 prove 不调 live 模型；账本 seed + HTTP SSE catch-up）

---

## 0. 立场（先读）

| 声明 | 裁定 |
|------|------|
| 现有覆盖 | helpers/`sse.ts` + `stream-window` + `last-event-id:unit:prove` / `sse-slot:prove` / `api:validate` 子集 → 矩阵已是 **partial**；**不得**写 covered |
| 本切片 | 可执行 **R1–R4** + **R-mid**（wave #4：mid-interview live hold→live-tail→abort→LED）HTTP；+ **R-authz**；+ **G-GAP** honesty pin |
| 层证明（cite，≠本 UC） | `e2e/helpers/sse.ts`；`pnpm last-event-id:unit:prove`；`pnpm sse-slot:prove`；`stream-window.spec.ts`（UI 窗口 ≠ 断线续传） |
| 假绿禁令 | 不得把 unit/slot/stream-window/本绿写成「UC-E2E-010 covered」或「full.e2e 已含断线续传」 |
| 本绿≠全链路 E2E covered | **必须钉死**，直至 `full.e2e` / `e2e:isolated` 显式 mid-interview 断线→续传 + A3 无双扣 |
| fixture | 经 `run-e2e-isolated` → **pgvector** → **green-risk / R5** |

专家：`mw-e2e-ha`（+ **privacy** 因 R-authz 越权订阅）。禁止作者自签 covered。

---

## 1. 测什么（R1–R4 + GAP 可执行合同）

| ID | 场景 | 期望 | 执行体 |
|----|------|------|--------|
| **R1** | 全量 catch-up 后 abort（模拟断线） | HTTP SSE 重放 seq=[1,2,3] | `apps/api/test/uc-e2e-010-sse-resume.proof.ts` |
| **R2** | 断线窗口内账本续写 → `Last-Event-ID=3` 重连 | 仅 seq=[4,5]；无 1..3 重复（A2 / E-replay） | 同上 |
| **R3** | 中位游标 `Last-Event-ID=2` | 仅 seq=[3,4,5] | 同上 |
| **R4** | 已追上 `Last-Event-ID=5` | SSE 200 + 空 ids + hold `: ping`（非错误空） | 同上 |
| **R-mid** | mid-interview：**hold 开着**时账本续写→live-tail 收到新 seq→abort→断线窗口再写→`Last-Event-ID` 仅续传漏段 | live 收 [6,7]；resume 仅 [8,9]；无 Key | 同上（wave #4） |
| **R-authz** | 他人 principal 订流 | **404**（RLS / not_found_or_forbidden） | 同上 |
| **G-GAP** | A3 kill+无双扣 / full.e2e / UI / 0058 / 跨副本 | 打印 `GAP-UC010-*`（含 PRIVACY-STUB / 0058 / CROSS-REPLICA）；EXIT=0 仅=诚实钉 ≠ covered | 同上 |

### 明确不测 / BLOCKED（本 harness · 抬 covered 见 §1b）

| 非目标 | 原因 |
|--------|------|
| `full.e2e.ts` / `e2e:isolated` 面试进行中真断网 | 未接线；需 Key/worker 长链路；**R-mid ≠ full.e2e** |
| A3 中途 kill 进程 + 无双扣费 / seq 无洞 | 需 worker + commerce；本 prove 不碰额度 |
| Playwright UI 断线重连 | **降次**；`stream-window` 是 10k 窗口压力 ≠ 断线续传 |
| `last-event-id` 非法游标 400 | 已由 `last-event-id:unit:prove` + `api:validate` 覆盖；本 harness **cite** 不重复冒充 |
| 跨副本 SSE 槽 | `HC-GAP-008`；`sse-slot:prove` 仅进程内 |
| 完整 0058 privacy fence | `_neg-harness` 未载 0058；本 prove 用 **minimal stub**（`GAP-UC010-PRIVACY-STUB`） |

---

## 1b. 抬到 covered 还缺（HTTP/product path · 非仅 GAP 标签）

> partial ≠ done。下列是北星「全链路零遗漏」要关的路径，**不是**本 prove 已绿项。**禁止**因 R1–R4 / **R-mid** 绿而升 covered。

| # | 抬到 **covered** 仍缺 | 对应验收 / 缺口 |
|---|------------------------|-----------------|
| 1 | `full.e2e.ts` / `e2e:isolated` **显式** mid-interview SSE kill→`Last-Event-ID` 续传（真面试链路 / Key+worker） | A1/A2 · `GAP-UC010-FULL-E2E` |
| 2 | A3：进程 kill + **无双扣费** + seq 无洞（worker+commerce 可执行断言） | A3 · `GAP-UC010-A3-KILL-BILLING` |
| 3 | Playwright UI 断线重连（次层；不可单独升 covered） | UI · `GAP-UC010-UI` |
| 4 | 载入真实 **0058** privacy fence（去 `_neg-harness` minimal stub）+ 擦除/越权合同 | privacy · `GAP-UC010-PRIVACY-0058` |
| 5 | 跨副本 SSE 槽合同（`HC-GAP-008`；非仅进程内 `sse-slot:prove`） | slot · `GAP-UC010-CROSS-REPLICA` |
| 6 | sole-stack 夹具替换默认 pgvector isolated，去掉 **R5 green-risk** | 矩阵 §0 / R5 |
| — | ~~HTTP mid-interview live hold→live-tail→abort→LED resume~~ **CLOSED（本波 partial 阶 · R-mid）** | was mid-interview HTTP 面 · **已挂** `uc010:sse-resume:prove` R-mid（仍 ≠ covered；≠ full.e2e） |

**本切片已关 §1b 上表「HTTP mid-interview live-tail→LED」阶（R-mid）**；仍明确不做：#1 full.e2e；#2 A3 billing；#3 UI；#4 0058 去 stub；#5 跨副本；#6 sole-stack；把 R1–R4/R-mid / unit/slot/helpers 绿写成 covered；把矩阵升 covered。

---

## 2. 命令与期望 EXIT

| CMD | 期望 EXIT | 含义（诚实） |
|-----|-----------|--------------|
| `pnpm uc010:sse-resume:prove` | **0** | R1–R4 + **R-mid** + R-authz + G-GAP；**本绿 ≠ 全链路 E2E covered**；fixture=pgvector → green-risk / R5 |
| `pnpm uc010:sse-resume:prove:raw`（仅经 isolated 子进程） | **0** | raw：`pnpm -C apps/api prove:uc010-sse-resume` |
| `pnpm last-event-id:unit:prove` / `pnpm sse-slot:prove` | **0** | **层旁证**；≠本 UC 业务 covered |
| `pnpm eval-harness-matrix-cite:prove` | **0** | 静态：harness+eval 引用 `UC-E2E-010`；≠业务 covered |

```bash
cd /workspace/meetwise
# 无需 MODEL_API_KEY；需 Docker disposable PG（run-e2e-isolated）
pnpm uc010:sse-resume:prove ; echo EXIT=$?
pnpm eval-harness-matrix-cite:prove ; echo EXIT=$?
```

执行体：`apps/api/test/uc-e2e-010-sse-resume.proof.ts`  
入口：`package.json` → `uc010:sse-resume:prove` → `scripts/run-e2e-isolated.mjs uc010:sse-resume:prove:raw`

**旁证（≠本 UC 断线业务验收）**：`pnpm last-event-id:unit:prove`；`pnpm sse-slot:prove`；`e2e/helpers/sse.ts`；`api:validate` SSE 子集；`stream-window.spec.ts`。

---

## 3. 假绿标红

| 若有人说… | 正确读法 |
|-----------|----------|
| 「last-event-id:unit / sse-slot 绿了所以 010 covered」 | **假绿**。层证明 ≠ 断线→续传业务 |
| 「stream-window 绿 = 010 covered」 | **假绿**。UI 10k 窗口 ≠ 断线 Last-Event-ID 续传 |
| 「helpers/sse 有 last-event-id 所以关闭」 | **假绿**。helper ≠ 验收场景 |
| 「uc010:sse-resume:prove 绿 = covered」 | **假绿**。最多 **partial**；R-mid≠full.e2e；缺 A3 无双扣 / UI / 0058 / 跨副本 |
| 「G-GAP EXIT=0 = A3 已闭环」 | **假绿**。G-GAP 是诚实钉 |
| 「R-mid 绿 = full.e2e mid-interview covered」 | **假绿**。R-mid = NON-UI HTTP ledger live-tail；无 Key/worker |
| 「api:validate 单事件空 catch-up = 断线续传」 | **假绿**。缺多 seq 断线窗口续写后重连 |

---

## 4. 矩阵锚点

| ID | 状态（有执行体绿后） | 本 harness |
|----|----------------------|------------|
| UC-E2E-010 | **partial**（R1–R4 + **R-mid** HTTP resume）；**≠ covered** | `harness/uc-e2e-010-sse-resume.md` |
| 评测说明 | `eval/uc-e2e-010-sse-resume.eval.md` | 引用矩阵行 ID |
| P1-1 | HTTP 断线→LED + **R-mid** live-tail prove 已挂；full.e2e / A3 kill / UI / 0058 / 跨副本仍缺（§1b） | 见矩阵 §3 |

## 5. 审查勾选（mw-e2e-ha · dual-review ready）

- [ ] 主路径为 NON-UI HTTP R1–R4 + **R-mid**；Playwright 未作 primary
- [ ] 未把 prove 绿 / unit/slot/helpers/stream-window 写成 **UC-E2E-010 covered**
- [ ] 矩阵行为 **partial**；**非** covered；§1b 抬 covered 清单非空
- [ ] R-mid 读作 HTTP ledger live-tail 阶，**≠** full.e2e mid-interview / A3 billing
- [ ] 0058 stub / 跨副本仍 GAP；privacy spot 不放水升 covered
- [ ] `pnpm uc010:sse-resume:prove` 已接线并记 CMD/EXIT；releaseEvidence=false · Not HA
