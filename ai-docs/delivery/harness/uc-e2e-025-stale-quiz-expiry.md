# Harness — UC-E2E-025 押题产物过期作面试输入（eval-first · honest gap / mark-red）

**releaseEvidence=false** · **Not HA** · **本绿 ≠ 全链路 E2E covered** · **≠ UC-E2E-025 covered**  
**对照矩阵行**：`UC-E2E-025`  
**对照建议补集**：`e2e-requirement-coverage-matrix.md` §3 P1-8  
**对照需求**：`e2e-scenarios.md` UC-E2E-025 · A1 失效产物开面试被拒 + 重押题入口 · A2 resumeVersion 失配拦截 · TC-E2E-025-stale-quiz / TC-E2E-025-version-mismatch  
**对照旁证（≠ covered）**：`pnpm quiz:prove`（押题图本身）· `full.e2e.ts` quiz 终态 · `resume-derivative-reference`（简历引用守卫 ≠ 过期作面试输入）  
**MODEL_API_KEY**：**不需要**（静态 inventory + GAP mark-red；不调 live 模型；不跑 HTTP 开面）

---

## 0. 立场（先读）

| 声明 | 裁定 |
|------|------|
| 现有覆盖 | 矩阵原 **gap**（无）；搜码：`interview.begin` 仅 `resume-id`，**不**接 `quizId`；`resume_quiz` **无** `expires_at` / 新鲜度列；面试 start **无** 押题产物版本 pin |
| 本切片 | 可执行 **S1–S4** 静态库存 + **G-GAP-*** honesty mark-red；矩阵保持 **gap**（honest）；**不得**写 partial-as-closed / covered |
| 执行层 | **NON-UI** 静态 inventory（apps/api test）；**不**扩生产 reject/accept 实现冒充闭环 |
| 假绿禁令 | 不得把 `quiz:prove` 绿 / full.e2e quiz 终态 / 本绿写成「过期作面试输入已拒」或「UC-E2E-025 covered」 |
| 本绿≠全链路 E2E covered | **必须钉死**；EXIT=0 = 诚实钉缺口 ≠ A1/A2 产品闭环 |
| fixture | 经 `run-e2e-isolated` → **pgvector** → **green-risk / R5**（静态体不读写业务表；banner 仍可能出现） |

专家：`mw-e2e-ha` + `mw-rag-route`（quiz 域）。禁止作者自签 covered。

---

## 1. 测什么（S1–S4 + G-GAP 可执行合同）

| ID | 场景（UC 映射） | 期望 | 执行体 |
|----|-----------------|------|--------|
| **S1** | begin 签名库存 | `interview.controller`/`service` begin **无** `quizId`；仅 `resumeId` | `apps/api/test/uc-e2e-025-stale-quiz-expiry.proof.mjs` |
| **S2** | 产物表新鲜度列 | `0007_resume_quiz.sql` `resume_quiz` **无** `expires_at` | 同上 |
| **S3** | 错误码库存 | contracts / interview.service **无** `stale_quiz` / `quiz_expired` / `resume_version_mismatch`（面试输入面） | 同上 |
| **S4** | begin 不联 resume_quiz | `interview.service` begin 路径 **无** `resume_quiz` 查询/join | 同上 |
| **G-GAP-1** | A1 / TC-E2E-025-stale-quiz | 打印 `GAP-UC025-STALE-REJECT`：无过期产物开面试拒绝路径 | 同上 |
| **G-GAP-2** | A2 / TC-E2E-025-version-mismatch | 打印 `GAP-UC025-VERSION-PIN`：无 resumeVersion / 产物版本 pin | 同上 |
| **G-GAP-3** | 逃逸·重生成入口 | 打印 `GAP-UC025-REGEN-ENTRY`：失效拒绝后无重押题引导接线 | 同上 |
| **G-GAP-4** | accept 诚实面 | 打印 `GAP-UC025-ACCEPT-FRESH`：无「新鲜产物+版本 pin → 允许开面」accept 路径可证 | 同上 |

**产品若浮出（fail-closed）**：若 begin 已接 quizId / 已查 resume_quiz 新鲜度，本 prove **拒 EXIT=0**（不得继续用 gap 叙事）；须另刀 reject/accept HTTP prove。

**明确不测 / BLOCKED（本 harness）**

| 非目标 | 原因 |
|--------|------|
| HTTP 注入过期产物开面试被拒 | 产品未接线；`GAP-UC025-STALE-REJECT` |
| resumeVersion 失配 HTTP 拦截 | 产品未接线；`GAP-UC025-VERSION-PIN` |
| 重押题入口 UI / SSE | `GAP-UC025-REGEN-ENTRY` |
| 扩 `resume_quiz.expires_at` / begin 校验实现 | eval-first honesty；**不**本切片扩实现冒充闭环 |
| 云 / HA / releaseEvidence | Not HA · releaseEvidence=false |

---

## 2. 命令与期望 EXIT

| CMD | 期望 EXIT | 含义（诚实） |
|-----|-----------|--------------|
| `pnpm uc025:stale-quiz-expiry:prove` | **0** | S1–S4 库存绿 + G-GAP-* 诚实钉；**本绿 ≠ UC-E2E-025 covered**；矩阵保持 **gap**；fixture banner → **green-risk / R5** |
| `pnpm uc025:stale-quiz-expiry:prove:raw`（仅经 isolated 子进程） | **0** | raw：`pnpm -C apps/api prove:uc025-stale-quiz-expiry` |
| `pnpm eval-harness-matrix-cite:prove` | **0** | 静态：harness+eval 引用 `UC-E2E-025`；≠业务 covered |
| `pnpm quiz:prove` | **0**（旁证） | 押题图本身；**≠** 过期作面试输入 |

```bash
cd /workspace/meetwise
# 无需 MODEL_API_KEY；静态 inventory（isolated 包装对齐 siblings CMD 形态）
pnpm uc025:stale-quiz-expiry:prove ; echo EXIT=$?
pnpm eval-harness-matrix-cite:prove ; echo EXIT=$?
```

执行体：`apps/api/test/uc-e2e-025-stale-quiz-expiry.proof.mjs`  
入口：`package.json` → `uc025:stale-quiz-expiry:prove` → `scripts/run-e2e-isolated.mjs uc025:stale-quiz-expiry:prove:raw`

**旁证（≠本 UC 验收）**：`pnpm quiz:prove`；`e2e/full.e2e.ts` quiz 终态；`resume-derivative-reference` prove。

---

## 3. 假绿标红

| 若有人说… | 正确读法 |
|-----------|----------|
| 「quiz:prove 绿了所以 025 covered」 | **假绿**。押题生成图 ≠ 过期产物作面试输入守卫 |
| 「full.e2e quiz_ready 绿 = 025」 | **假绿**。终态可达 ≠ 过期拒绝 / 版本 pin |
| 「uc025:stale-quiz-expiry:prove 绿 = covered / partial-closed」 | **假绿**。EXIT=0 = **honest gap mark-red**；矩阵保持 **gap** |
| 「G-GAP EXIT=0 = A1/A2 已闭环」 | **假绿**。GAP 表示未闭环 |
| 「简历 derivative reference 绿 = 025」 | **假绿**。epoch/引用守卫 ≠ 产物新鲜度作面试输入 |

---

## 4. 矩阵锚点

| ID | 状态（有执行体绿后） | 本 harness |
|----|----------------------|------------|
| UC-E2E-025 | **gap**（honest；S1–S4 + G-GAP pin）；**≠ covered**；**≠** 假 partial-closed | `harness/uc-e2e-025-stale-quiz-expiry.md` |
| 评测说明 | `eval/uc-e2e-025-stale-quiz-expiry.eval.md` | 引用矩阵行 ID |
| P1-8 | 静态 GAP mark-red 已挂；reject/accept HTTP 产品闭环仍缺 | 见矩阵 §3 |

## 5. 审查

- `mw-e2e-ha`：确认未把 gap/prove 绿写成 covered；确认钉 **R5 green-risk**；确认 `quiz:prove`/full.e2e 标旁证 ≠ covered
- `mw-rag-route`（quiz 域）：确认押题产物→面试输入新鲜度/版本 pin 仍缺；不把 resume-quiz 图绿冒充跨图编排守卫
