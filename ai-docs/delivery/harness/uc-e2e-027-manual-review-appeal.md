# Harness — UC-E2E-027 人工复核申诉（eval-first · honest gap/blocked / mark-red）

**releaseEvidence=false** · **Not HA** · **本绿 ≠ 全链路 E2E covered** · **≠ UC-E2E-027 covered**  
**对照矩阵行**：`UC-E2E-027`  
**对照建议补集**：`e2e-requirement-coverage-matrix.md` §3 P1-11  
**对照需求**：`e2e-scenarios.md` UC-E2E-027 · A1 申诉→open · A2 overturned CAS 新 AssessmentVersion · A3 重复申诉幂等 · A4 过期 lease effect=0 · TC-E2E-027-appeal / overturn  
**对照规格（TARGET ≠ covered）**：`status-machine.md` ManualReview · `architecture/ai/human-review-design.md`（运行时表/API/UI=0）  
**对照旁证（≠ covered）**：`qbank_source` `ReviewDecision` · `SelectiveReviewDecision` · resume `needs_review` · web「人工复核还没开放」  
**MODEL_API_KEY**：**不需要**（静态 inventory + GAP mark-red；不调 live 模型；不跑 HTTP / e2e:isolated 全链；**无 fake API / 不假装闭环**）

---

## 0. 立场（先读）

| 声明 | 裁定 |
|------|------|
| 现有覆盖 | 矩阵 **gap** / **blocked**（产品未接线）。搜码：无 ManualReview 模块/HTTP/表；无 e2e TC-027 |
| 本切片 | 可执行 **S1–S5** 静态库存 + **G-GAP-*** honesty mark-red；矩阵保持 **gap** / **blocked**；**不得**写 partial-as-closed / covered |
| 执行层 | **NON-UI** 静态 inventory（apps/api test）；**不**扩 ManualReview 实现冒充闭环 |
| 假绿禁令 | 不得把 qbank 审核 / SelectiveReview / needs_review / 本绿写成「人工申诉复核已通」或「UC-E2E-027 covered」 |
| 本绿≠全链路 E2E covered | **必须钉死**；EXIT=0 = 诚实钉缺口 ≠ A1–A4 产品/E2E 闭环 |
| fixture | 经 `run-e2e-isolated` → **pgvector** → **green-risk / R5**（静态体不读写业务表；banner 仍可能出现） |

专家：`mw-e2e-ha` + `meetwise honesty` 或 `mw-privacy-int`。禁止作者自签 covered。

---

## 1. 测什么（S1–S5 + G-GAP 可执行合同）

| ID | 场景（UC 映射） | 期望 | 执行体 |
|----|-----------------|------|--------|
| **S1** | HTTP/模块库存 | 无 `appeal` / `manual-review` / `human-review` 模块与 controller 路由 | `apps/api/test/uc-e2e-027-manual-review-appeal.proof.mjs` |
| **S2** | 表库存 | migrations **无** `manual_review` / `review_decision` / `review_effect` / `review_assignment` / evidence|audit CREATE | 同上 |
| **S3** | 旁证≠本 UC | qbank `ReviewDecision` · SelectiveReview · resume `needs_review` **不**宣称 UC-027 | 同上 |
| **S4** | e2e 缺席 | `e2e/*.ts` / `full.e2e` **无** UC-E2E-027 / TC-E2E-027 | 同上 |
| **S5** | Spec vs product | scenarios 定义 027；status-machine + human-review-design **TARGET**；web「还没开放」 | 同上 |
| **G-GAP-1** | A1 · TC-appeal | 打印 `GAP-UC027-APPEAL-OPEN` | 同上 |
| **G-GAP-2** | A2 · TC-overturn | 打印 `GAP-UC027-OVERTURN-CAS` | 同上 |
| **G-GAP-3** | A3 幂等 | 打印 `GAP-UC027-IDEMPOTENT` | 同上 |
| **G-GAP-4** | A4 lease | 打印 `GAP-UC027-LEASE-EFFECT0` | 同上 |
| **G-GAP-5** | D3 TARGET | 打印 `GAP-UC027-D3-STATUS` | 同上 |
| **G-GAP-6** | E2E 缺席 | 打印 `GAP-UC027-E2E` | 同上 |

**产品若浮出（fail-closed）**：若已挂 appeal/ManualReview 路由、表、模块、或 e2e 钉 UC-027，本 prove **拒 EXIT=0**；须另刀产品闭环 prove（TC-E2E-027-*）。

**明确不测 / BLOCKED（本 harness）**

| 非目标 | 原因 |
|--------|------|
| 提申诉 → ManualReview open HTTP | 产品未接线；`GAP-UC027-APPEAL-OPEN` |
| overturned → AssessmentVersion CAS | 产品未接线；`GAP-UC027-OVERTURN-CAS` |
| 重复申诉幂等 / lease effect=0 | 产品未接线；`GAP-UC027-IDEMPOTENT` / `LEASE-EFFECT0` |
| 扩 ManualReview 表+API+UI 实现 | eval-first honesty；**不**本切片扩实现冒充闭环 |
| 云 / HA / releaseEvidence | Not HA · releaseEvidence=false |
| fake API / pretend closed | **禁止** |

---

## 1b. 抬到 covered 还缺（HTTP/product path · 非仅 GAP 标签）

> gap/blocked/honesty-pin **≠ done**。下列是北星「全链路零遗漏」要关的产品/E2E 路径，不是本 prove 已绿项。

| # | 抬到 **covered** 仍缺（HTTP / product） | 对应验收 / UC 依赖 |
|---|------------------------------------------|-------------------|
| 1 | D3：将 `ManualReview`（+ `ReviewEvidenceSnapshot` / `ReviewAssignment` / `ReviewDecision` / `ReviewEffect` / `ReviewAccessAudit`）从 TARGET 落到可迁移 schema + `status-machine` 运行时载重（非仅设计文档） | D3 前置 · human-review-design |
| 2 | C 端申诉 HTTP：对 `AssessmentReport` / 单题分提申诉 → `ManualReview open`（subject+purpose+principal+幂等键+证据 snapshot 冻结） | A1 · TC-E2E-027-appeal |
| 3 | 审核员领取/冻结：`open→claimed→evidence_frozen`（capability + CAS lease）；越权读/领/决/effect = 0（RLS） | E-越权 · UC-033 旁证不够，须本域钉 |
| 4 | 单审/双审 policy → append-only `ReviewDecision`；候选人映射 `upheld` / `overturned` / `inconclusive`（≠ 案件 status） | A1 结论可见 |
| 5 | `ReviewEffect` + expected subject version CAS → **恰一次**新 `AssessmentVersion`（禁止覆盖原评分）+ 审计原因 | A2 · TC-E2E-027-overturn |
| 6 | 同对象幂等键：重复申诉仅一条 open | A3 |
| 7 | 过期 assignment lease：陈旧 token 决定 / effect = 0；snapshot/consent 失效 → `voided` | A4 · E-同意失效 |
| 8 | `e2e/*.e2e.ts`（或 full.e2e 专段）+ 隔离 HTTP：appeal→open→overturn CAS；不得把 qbank 审核 / needs_review 冒充本行 covered | TC 全套 |
| 9 | 依赖澄清：B 端 `DecisionRecord` / 招聘最终决定 ≠ 本 UC 申诉改判；qbank_source 审批状态机不迁入 ManualReview | human-review-design §1 |
| 10 | sole-stack 夹具（MySQL+Qdrant+Redis）替换默认 pgvector isolated，去掉 **R5 green-risk** 后才可讨论发布级 covered | 矩阵 §0 / R5 |

**本切片明确不做**：上表实现；把 qbank/SelectiveReview/needs_review/文案绿写成 covered；把矩阵升 covered / 假 partial-closed；造 fake appeal API。

---

## 2. 命令与期望 EXIT

| CMD | 期望 EXIT | 含义（诚实） |
|-----|-----------|--------------|
| `pnpm uc027:manual-review-appeal:prove` | **0** | S1–S5 库存绿 + G-GAP-* 诚实钉；**本绿 ≠ UC-E2E-027 covered**；矩阵保持 **gap** / **blocked**；fixture banner → **green-risk / R5** |
| `pnpm uc027:manual-review-appeal:prove:raw`（仅经 isolated 子进程） | **0** | raw：`pnpm -C apps/api prove:uc027-manual-review-appeal` |
| `pnpm eval-harness-matrix-cite:prove` | **0** | 静态：harness+eval 引用 `UC-E2E-027`；≠业务 covered |
| qbank / scoring selective / resume needs_review | **0**（旁证） | **≠** ManualReview 申诉闭环 |

```bash
cd /workspace/meetwise
# 无需 MODEL_API_KEY；静态 inventory（isolated 包装对齐 siblings CMD 形态）
pnpm uc027:manual-review-appeal:prove ; echo EXIT=$?
pnpm eval-harness-matrix-cite:prove ; echo EXIT=$?
```

执行体：`apps/api/test/uc-e2e-027-manual-review-appeal.proof.mjs`  
入口：`package.json` → `uc027:manual-review-appeal:prove` → `scripts/run-e2e-isolated.mjs uc027:manual-review-appeal:prove:raw`

**旁证（≠本 UC 验收）**：`packages/db/src/qbank-curation.ts` ReviewDecision；`packages/domain/src/scoring-operation-routing.ts` SelectiveReviewDecision；`packages/db/src/resume.ts` needs_review；`apps/web/app/recruiter/how-it-works/page.tsx`「人工复核还没开放」。

---

## 3. 假绿标红

| 若有人说… | 正确读法 |
|-----------|----------|
| 「qbank ReviewDecision / rag-generation 绿了所以 027 covered」 | **假绿**。题库源审批 ≠ ManualReview 评分申诉 |
| 「SelectiveReviewDecision = 人工复核」 | **假绿**。评分路由 review\|skip ≠ 申诉案件 |
| 「resume needs_review = 申诉 open」 | **假绿**。OCR 待审标记 ≠ ManualReview 案件机 |
| 「web 写了人工复核所以产品已通」 | **假绿**。文案「还没开放」= honesty，非闭环 |
| 「uc027:…:prove 绿 = covered / partial-closed」 | **假绿**。EXIT=0 = **honest gap/blocked mark-red**；矩阵保持 **gap** / **blocked** |
| 「G-GAP EXIT=0 = A1 申诉已闭环」 | **假绿**。GAP 表示未接线；无 fake API |
| 「status-machine 有 ManualReview 表所以已实现」 | **假绿**。TARGET 规格 ≠ 运行时表/API |

---

## 4. 矩阵锚点

| ID | 状态（有执行体绿后） | 本 harness |
|----|----------------------|------------|
| UC-E2E-027 | **gap** / **blocked**（honest；产品未接线；S1–S5 + G-GAP pin）；**≠ covered**；**≠** 假 partial-closed | `harness/uc-e2e-027-manual-review-appeal.md` |
| 评测说明 | `eval/uc-e2e-027-manual-review-appeal.eval.md` | 引用矩阵行 ID |
| P1-11 | 静态 GAP mark-red 已挂；ManualReview HTTP/表/E2E 仍缺（见 §1b） | 见矩阵 §3 |
