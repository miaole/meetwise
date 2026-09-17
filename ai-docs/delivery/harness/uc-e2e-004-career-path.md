# Harness — UC-E2E-004 career-path 全链路（eval-first · honest gap / mark-red）

**releaseEvidence=false** · **Not HA** · **本绿 ≠ 全链路 E2E covered** · **≠ UC-E2E-004 covered**  
**对照矩阵行**：`UC-E2E-004`  
**对照建议补集**：`e2e-requirement-coverage-matrix.md` §3 P1-9（本切片新增）  
**对照需求**：`e2e-scenarios.md` UC-E2E-004 · A1 能力曲线≥2 维 · A2 成长档案 career-path 关联 · A3 失败降级+重试+额度不变 · TC-E2E-004-main / fail / uncertainty  
**对照旁证（≠ covered）**：`neg:interview` career-path 409/404/401 · `packages/domain` `deriveCareerPath` / `scor-00-honesty:prove` · `report:prove` / `graph:prove`（他图）· `apps/api/test/validate.ts` 局部 HTTP · web `report/[id]` GET 渲染  
**MODEL_API_KEY**：**不需要**（静态 inventory + GAP mark-red；不调 live 模型；不跑 HTTP 开面 / e2e:isolated 全链）

---

## 0. 立场（先读）

| 声明 | 裁定 |
|------|------|
| 现有覆盖 | 矩阵原 **gap**（无 `e2e/*.e2e.ts`；worker graph prove 另轨）。搜码：HTTP POST/GET `career-path` **存在**，但是 **同步** `deriveCareerPath`（确定性派生），**不是** `AiGraphRun(career-path)`；`packages/ai-graphs` **无** career-path 图文件 |
| 本切片 | 可执行 **S1–S5** 静态库存 + **G-GAP-*** honesty mark-red；矩阵保持 **gap**（honest）；**不得**写 partial-as-closed / covered |
| 执行层 | **NON-UI** 静态 inventory（apps/api test）；**不**扩 LangGraph / GrowthTimeline 实现冒充闭环 |
| 假绿禁令 | 不得把 `report:prove` / `graph:prove` / `neg:interview` / `validate.ts` / 本绿写成「career-path 全链路已通」或「UC-E2E-004 covered」 |
| 本绿≠全链路 E2E covered | **必须钉死**；EXIT=0 = 诚实钉缺口 ≠ A1/A2/A3 产品/E2E 闭环 |
| fixture | 经 `run-e2e-isolated` → **pgvector** → **green-risk / R5**（静态体不读写业务表；banner 仍可能出现） |

专家：`mw-e2e-ha` + `mw-rag-route`（或 `model-op`：图编排/消费面）。禁止作者自签 covered。

---

## 1. 测什么（S1–S5 + G-GAP 可执行合同）

| ID | 场景（UC 映射） | 期望 | 执行体 |
|----|-----------------|------|--------|
| **S1** | HTTP 路由库存 | controller POST/GET `:id/career-path`；service `generateCareerPath` / `getCareerPath` | `apps/api/test/uc-e2e-004-career-path.proof.mjs` |
| **S2** | HTTP=确定性派生 | `generateCareerPath` 调 `deriveCareerPath` + INSERT `career_path`；**无** AiGraphRun/worker dispatch | 同上 |
| **S3** | 无 career-path 图 | `packages/ai-graphs/src` **无** career-path 文件；index **不** export；`report` 图旁证仍在 | 同上 |
| **S4** | 成长链缺口 | generate **不**写 CapabilityProfile/GrowthTimeline；`profile.growth` **不** join `career_path` | 同上 |
| **S5** | 无 e2e 场景 | `e2e/*.e2e.ts` / `full.e2e.ts` **无** UC-E2E-004 / career-path 覆盖声称 | 同上 |
| **G-GAP-1** | A1/A2 · TC-main | 打印 `GAP-UC004-E2E-MAIN`：无 HTTP/SSE e2e 主路径 | 同上 |
| **G-GAP-2** | 图编排 | 打印 `GAP-UC004-GRAPH`：无 AiGraphRun(career-path) | 同上 |
| **G-GAP-3** | A1/A2 成长落点 | 打印 `GAP-UC004-GROWTH-A1A2`：无曲线≥2 维 / 档案关联落点 | 同上 |
| **G-GAP-4** | A3 · TC-fail | 打印 `GAP-UC004-FAIL-A3`：无失败降级+额度 E2E | 同上 |
| **G-GAP-5** | uncertainty | 打印 `GAP-UC004-UNCERTAINTY`：双校验/不确定性拒收入 e2e 未证（质量归 ai-eval） | 同上 |

**产品若浮出（fail-closed）**：若已落 career-path 图文件 / generate 接 AiGraphRun / 写 GrowthTimeline，本 prove **拒 EXIT=0**（不得继续用 gap 叙事）；须另刀 HTTP/E2E prove（TC-E2E-004-*）。

**明确不测 / BLOCKED（本 harness）**

| 非目标 | 原因 |
|--------|------|
| `e2e:isolated` TC-E2E-004-main（A1/A2） | 产品图链未齐；`GAP-UC004-E2E-MAIN` |
| AiGraphRun(career-path) worker prove | 无图文件；`GAP-UC004-GRAPH`（`report:prove` 旁证≠本图） |
| GrowthTimeline / CapabilityProfile 写入 | 未接线；`GAP-UC004-GROWTH-A1A2` |
| 失败降级 UI + 额度不变 | `GAP-UC004-FAIL-A3` |
| 不确定性双校验 HTTP | `GAP-UC004-UNCERTAINTY`（模型质量另轨 ai-eval） |
| 扩 career-path.graph.ts / 成长链实现 | eval-first honesty；**不**本切片扩实现冒充闭环 |
| 云 / HA / releaseEvidence | Not HA · releaseEvidence=false |

---

## 1b. 抬到 covered 还缺（HTTP/product path · 非仅 GAP 标签）

> partial/gap/honesty-pin **≠ done**。下列是北星「全链路零遗漏」要关的产品/E2E 路径，不是本 prove 已绿项。

| # | 抬到 **covered** 仍缺（HTTP / product） | 对应验收 |
|---|------------------------------------------|----------|
| 1 | 新建 `e2e/*.e2e.ts`（或 `full.e2e` 专段）经隔离 HTTP：鉴权→有评估→`POST /interview/:id/career-path`→`GET` 回读确定字段 | TC-E2E-004-main |
| 2 | 落 `career-path` LangGraph（或**书面降级** ADR：正式承认 HTTP=derive，并改写 UC 验收）+ worker `AiGraphRun` created→active→succeeded/failed prove | 主流程 §2–4；E-gen-fail |
| 3 | 成功路径更新/关联 **CapabilityProfile / GrowthTimeline**（或等价成长档案确定字段），且 `GET /profile/growth`（或契约等价）可断言 career-path 关联记录 | A2 |
| 4 | 能力曲线 **≥2 维度** 数据点的确定字段断言（非仅 milestones 数组非空） | A1 |
| 5 | 图失败注入：`AiGraphRun=failed` + 用户可见降级文案 + 重试入口 + **额度净变 0**（D1；与 glossary 计费口径对齐）的 HTTP/E2E | A3 · TC-E2E-004-fail |
| 6 | 业务双校验「保留不确定性」拒收路径（不入库/可重生成）— e2e 只钉闸；模型措辞归 **ai-eval** | E-validate-fail · TC-uncertainty |
| 7 | UI：成长档案页「生成职业路径」触发 + 路径图/曲线渲染（`e2e:ui:isolated` 次层；不可单独升 covered） | 触发/后置渲染 |
| 8 | sole-stack 夹具（MySQL+Qdrant+Redis）替换默认 pgvector isolated，去掉 **R5 green-risk** 后才可讨论发布级 covered | 矩阵 §0 / R5 |

**本切片明确不做**：上表实现；把旁证 prove 绿写成 covered；把矩阵升 partial-closed / covered。

---

## 2. 命令与期望 EXIT

| CMD | 期望 EXIT | 含义（诚实） |
|-----|-----------|--------------|
| `pnpm uc004:career-path:prove` | **0** | S1–S5 库存绿 + G-GAP-* 诚实钉；**本绿 ≠ UC-E2E-004 covered**；矩阵保持 **gap**；fixture banner → **green-risk / R5** |
| `pnpm uc004:career-path:prove:raw`（仅经 isolated 子进程） | **0** | raw：`pnpm -C apps/api prove:uc004-career-path` |
| `pnpm eval-harness-matrix-cite:prove` | **0** | 静态：harness+eval 引用 `UC-E2E-004`；≠业务 covered |
| `pnpm report:prove` / `neg:interview` / `scor-00-honesty:prove` | **0**（旁证） | 他图/负例/域闸；**≠** career-path 全链路 |

```bash
cd /workspace/meetwise
# 无需 MODEL_API_KEY；静态 inventory（isolated 包装对齐 siblings CMD 形态）
pnpm uc004:career-path:prove ; echo EXIT=$?
pnpm eval-harness-matrix-cite:prove ; echo EXIT=$?
```

执行体：`apps/api/test/uc-e2e-004-career-path.proof.mjs`  
入口：`package.json` → `uc004:career-path:prove` → `scripts/run-e2e-isolated.mjs uc004:career-path:prove:raw`

**旁证（≠本 UC 验收）**：`pnpm neg:interview`；`pnpm scor-00-honesty:prove`；`pnpm report:prove`；`apps/api/test/validate.ts` career-path 段；web report GET。

---

## 3. 假绿标红

| 若有人说… | 正确读法 |
|-----------|----------|
| 「report:prove / graph:prove 绿了所以 004 covered」 | **假绿**。他图 / report 舱壁 ≠ career-path 全链路 |
| 「neg:interview career-path 409 绿 = 004」 | **假绿**。前置负例 ≠ A1/A2/A3 E2E |
| 「validate.ts POST career-path 200 = covered」 | **假绿**。局部 validate ≠ 隔离 e2e 全链 / 成长档案落点 |
| 「deriveCareerPath / scor-00-honesty 绿 = 图已通」 | **假绿**。域确定性派生 ≠ AiGraphRun(career-path) |
| 「uc004:career-path:prove 绿 = covered / partial-closed」 | **假绿**。EXIT=0 = **honest gap mark-red**；矩阵保持 **gap** |
| 「G-GAP EXIT=0 = A1/A2/A3 已闭环」 | **假绿**。GAP 表示未闭环 |
| 「web report 页能显示 milestones = 004」 | **假绿**。GET 渲染旁证 ≠ 生成全链 / 成长关联 / 失败降级 |

---

## 4. 矩阵锚点

| ID | 状态（有执行体绿后） | 本 harness |
|----|----------------------|------------|
| UC-E2E-004 | **gap**（honest；S1–S5 + G-GAP pin）；**≠ covered**；**≠** 假 partial-closed | `harness/uc-e2e-004-career-path.md` |
| 评测说明 | `eval/uc-e2e-004-career-path.eval.md` | 引用矩阵行 ID |
| P1-9 | 静态 GAP mark-red 已挂；HTTP/E2E 全链 + 图 + 成长落点仍缺（见 §1b） | 见矩阵 §3 |

## 5. 审查

- `mw-e2e-ha`：确认未把 gap/prove 绿写成 covered；确认钉 **R5 green-risk**；确认旁证标 ≠ covered；确认 §1b「抬到 covered 还缺」非空
- `mw-rag-route` 或 `model-op`：确认 career-path 图缺席 / HTTP=derive 诚实；不把 report/quiz 图绿冒充本 UC；确认成长档案数据源仍是 assessment_report
