# Harness eval — UC-E2E-001 黄金路径（eval-first · partial / blocked）

**releaseEvidence=false** · **≠HA** / **Not HA** · **本绿 ≠ sole-stack migrated** · **本文件 ≠ covered**  
**对照矩阵行**：`UC-E2E-001` · **§1.0 盲区** NEG=**blind** · FAULT=**partial** · ADV=**blind** · PERF=**blind**（黄金路径 = 快乐路径盲区；happy-only 绿=假绿）  
**硬闸**：`north-star-hard-gates.md` G1–G6；后续 knife 必须带 NEG+PERF 列  
**对照需求**：`requirements/use-cases/e2e-scenarios.md` · UC-E2E-001  
**对照建议补集**：`e2e-requirement-coverage-matrix.md` §3 P0-3  
**对照 inventory**：`harness/e2e-full-suite.inventory.md` §A · `e2e-case-inventory.md`（R5 家族）  
**fixture**：默认 `E2E_PG_IMAGE=pgvector/pgvector:pg16` → **green-risk / R5**（BUG-FAKE-R5 / BUG-E2E-ISO）  
**MODEL_API_KEY**：前置硬门；缺 Key → **blocked**（禁止 skip-as-pass / 假绿）  
**待审专家**：`mw-e2e-ha`

---

## 0. 立场

| 声明 | 裁定 |
|------|------|
| 覆盖状态（矩阵） | **partial** / **blocked**(无 Key) — **禁止**升格为 `covered` |
| 真业务路径 | HTTP：`pnpm e2e:isolated` → `e2e/full.e2e.ts`（fetch/SSE）；UI 浅层：`pnpm e2e:ui:isolated` → `apps/web/e2e-ui/golden.spec.ts` |
| 夹具 | 宽 isolated **仍绑 pgvector**；即使业务断言 EXIT=0，也只能记 **green-risk**，**不得**写 sole-stack / MySQL+Qdrant 已迁 |
| 本切片 | **仅**钉 FULL 命令、前置、期望 EXIT 读法、假绿禁令；**不跑**无 Key 全量 E2E；**不发明假绿** |
| A5 / report_ready | 矩阵已诚实：缺成长档案字段断言；isolated worker 注入故障下主面试终态未必 `report_ready` |

---

## 1. FULL 命令（可复制）

```bash
cd /workspace/meetwise   # 或本机 clone 根

# 前置探测（不打印 Key 值）
if [ -n "${MODEL_API_KEY:-}" ]; then echo 'MODEL_API_KEY=set'; else echo 'MODEL_API_KEY=unset → BLOCKED'; fi

# R5 夹具默认（勿当作 sole-stack 真相）
# E2E_PG_IMAGE 默认 = pgvector/pgvector:pg16  （见 scripts/run-e2e-isolated.mjs）

# —— 无 Key：禁止硬跑；记 blocked ——
# pnpm e2e:isolated          # DO NOT run without Key
# pnpm e2e:ui:isolated       # DO NOT run without Key (same provider gate via runner)

# —— 有 live MODEL_API_KEY 时（Docker 可用；isolated 自启 PG 夹具）——
pnpm e2e:isolated ; echo "CMD=pnpm e2e:isolated EXIT=$?"
pnpm e2e:ui:isolated ; echo "CMD=pnpm e2e:ui:isolated EXIT=$?"

# 静态 cite（本 harness 存在性 + Key/fixture/blocked 诚实钉；≠ 业务 covered）
pnpm eval-uc-e2e-001-002-cite:prove ; echo "CMD=pnpm eval-uc-e2e-001-002-cite:prove EXIT=$?"
```

包装链：

| pnpm 脚本 | 实际入口 |
|-----------|----------|
| `e2e:isolated` | `node scripts/run-e2e-isolated.mjs e2e:prove` → `scripts/run-e2e.mjs` → `e2e/full.e2e.ts` |
| `e2e:ui:isolated` | `node scripts/run-e2e-isolated.mjs e2e:ui` → Playwright `apps/web/e2e-ui/`（含 `golden.spec.ts`） |

Key 门（`run-e2e.mjs`）：缺 `MODEL_API_KEY` → `tagE2EFailure('provider', 'live_provider_key_missing')` **立即失败**，不降级假绿。

**本切片诚实 prove（无 Key / 不跑 live）**：

```bash
pnpm uc001:live-blocked:prove ; echo "CMD=pnpm uc001:live-blocked:prove EXIT=$?"
# EXIT=0 = 钉 blocked(无 Key) + runner fail-closed · ≠ green live · ≠ covered
```

---

## 1a. blocked(无 Key) — 诚实钉（本切片可执行）

| 声明 | 裁定 |
|------|------|
| 本环境 `MODEL_API_KEY` | **unset**（仅 env 名探测；不读 `.env` 值；不发明 Key） |
| live 全量 | **blocked**(无 Key) — **禁止**硬跑 `pnpm e2e:isolated` / `e2e:ui:isolated` 冒充绿 |
| 若误跑 | runner **fail-closed**：`live_provider_key_missing` → 非 0（**不是** skip-as-pass） |
| 本 prove | `pnpm uc001:live-blocked:prove` → **EXIT=0** = 文档+源码诚实钉「blocked」；**≠** live E2E 绿；**≠** UC-E2E-001 covered |
| 矩阵 | 保持 **partial** / **blocked**(无 Key)；**禁止**升 `covered` |
| releaseEvidence | **false** · **Not HA** · 永不 fake-green |

假绿禁令（本节）：「无 Key 跳过=pass」「cite/prove 绿=live covered」「blocked 写成 partial-closed」。

---

## 1b. 抬到 covered 还缺（Key 到位后的真链路 · 非本 prove）

> blocked/honesty-pin **≠ done**。下列是把 UC-E2E-001 从 **blocked**(无 Key) 抬向可讨论 covered 的北星路径——**不是**本 prove 已绿项。

| # | 抬到 **covered** 仍缺 | 命令 / 路径 |
|---|----------------------|-------------|
| 1 | **live `MODEL_API_KEY` 到位**（真实 provider；禁止假 Key / E2E_FAKE_MODEL） | 环境前置 |
| 2 | HTTP/SSE 黄金路径全量：鉴权→简历→交易→面试→报告 | `pnpm e2e:isolated` → `e2e/full.e2e.ts` |
| 3 | （可选浅层）UI cookie/导航 | `pnpm e2e:ui:isolated` → `golden.spec.ts`（≠ A1–A5 全量） |
| 4 | A1–A5 需求缺口关闭（含 A5 成长档案 `report_id`；`report_ready` 在无故障注入下可断言） | 见 §3 |
| 5 | sole-stack 夹具替换默认 pgvector，去掉 **R5 green-risk** 后才可讨论发布级 covered | 矩阵 §0 / R5 |

**本切片明确不做**：跑 live e2e；发明 Key；把矩阵升 covered；把本 prove EXIT=0 写成 live 绿。

---

## 2. 前置 / 期望 EXIT 读法

| 条件 | 命令 | 期望 EXIT | 读法 |
|------|------|-----------|------|
| **无** `MODEL_API_KEY` | `pnpm e2e:isolated` / `e2e:ui:isolated` | **勿跑**；若误跑 → 非 0（`live_provider_key_missing`） | 矩阵保持 **blocked**(无 Key)；**禁止**记 pass |
| **有** live Key + Docker | `pnpm e2e:isolated` | **0** = HTTP/SSE 黄金路径机械通过（仍须标 fixture） | **partial** + **green-risk / R5**；**本绿≠sole-stack migrated** |
| **有** Key | `pnpm e2e:ui:isolated` | **0** = UI 浅层 cookie/导航绿 | 次层；≠ 全量 A1–A5；同 R5 夹具风险 |
| 任意 | `pnpm eval-uc-e2e-001-002-cite:prove` | **0** | 静态：harness/eval 存在并钉诚实语；**≠** live E2E |
| **无** Key | `pnpm uc001:live-blocked:prove` | **0** | 诚实钉 blocked(无 Key)+fail-closed 源码；**≠** green live；**≠** covered |

**本环境探测（实现方）**：`MODEL_API_KEY=unset` → 全量 `e2e:isolated` **blocked**（未跑、不发明绿）。

---

## 3. 验收合同对照（需求 A1–A5 · 诚实缺口）

| ID | 需求验收 | 现执行体覆盖 | 关闭 UC-E2E-001？ |
|----|----------|--------------|------------------|
| A1 | 押题 8–12 题计数 | `full.e2e.ts` 结构面部分 | **否**（partial） |
| A2 | `answer_evaluated` + seq 连续 | SSE helpers + full 路径 | **否** |
| A3 | completed 后额度 confirmed | commerce 路径部分 | **否** |
| A4 | `report_ready` + 评分/差距 | isolated 故障注入下未必 | **否** |
| A5 | 成长档案 `report_id` 字段 | **缺** | **否** |

UI `golden.spec.ts`：登录→`/resume`/`/interviews` 导航与 cookie 鉴权浅层 — **不是** A1–A5 全量。

---

## 4. 假绿标红

| 若有人说… | 正确读法 |
|-----------|----------|
| 「`e2e:isolated` EXIT=0 所以 sole-stack / RAG 已迁」 | **假绿**。fixture=pgvector → **green-risk / R5** |
| 「无 Key 跳过也算绿」 | **假绿**。正确状态 = **blocked** |
| 「本 harness/eval 写了所以 covered」 | **假绿**。文档 ≠ 执行体升格；矩阵保持 **partial**/blocked |
| 「UI golden 绿 = UC-E2E-001 关闭」 | **假绿**。浅层导航 ≠ A1–A5 |
| 「mysql-stack ping 绿含黄金路径」 | **假绿**。conn-only；见 inventory §F |

---

## 5. 矩阵锚点

| ID | 状态（本切片后） | 本 harness |
|----|------------------|------------|
| UC-E2E-001 | **partial** / **blocked**(无 Key)；fixture=pgvector → green-risk | `harness/uc-e2e-001-golden-path.eval.md` |
| 评测笔记 | `eval/uc-e2e-001-golden-path.eval.md` | 交叉引用矩阵 |

## 6. 审查勾选（mw-e2e-ha）

- [ ] 未把无 Key 记成 pass / covered  
- [ ] 未把 EXIT=0（若有 Key）写成 sole-stack migrated  
- [ ] 未把 `uc001:live-blocked:prove` EXIT=0 写成 live E2E 绿  
- [ ] 矩阵行仍为 **partial**/blocked，非假 covered  
- [ ] releaseEvidence=false · Not HA  
- [ ] 本绿≠sole-stack migrated / R5 green-risk 已钉  
- [ ] §1a blocked(无 Key) + §1b 抬 covered（Key→`e2e:isolated`/`full.e2e`）已钉
