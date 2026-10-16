# 评测证明 — UC-E2E-027 人工复核申诉（honest gap/blocked / mark-red）

**日期**：2026-09-10（PT）  
**releaseEvidence=false** · **Not HA** · **本绿 ≠ 全链路 E2E covered** · **≠ UC-E2E-027 covered**  
**对照 harness**：`ai-docs/delivery/harness/uc-e2e-027-manual-review-appeal.md`  
**对照矩阵行**：`UC-E2E-027`  
**旁证（cite ≠ covered）**：qbank `ReviewDecision` · `SelectiveReviewDecision` · resume `needs_review` · web「人工复核还没开放」  
**待审专家**：`mw-e2e-ha` + `meetwise honesty` 或 `mw-privacy-int`

---

## 1. 用途

eval-first：交付 **可执行** 静态库存 + GAP/blocked mark-red（`apps/api` 文件扫描），**无 `MODEL_API_KEY`**，**无 fake API**，**不假装闭环**。  
主钉：**S1–S5**（无 ManualReview HTTP/表/模块；旁证边界；TARGET 规格 vs 未接线）→ **G-GAP-***（APPEAL-OPEN / OVERTURN-CAS / IDEMPOTENT / LEASE-EFFECT0 / D3-STATUS / E2E）。  
对齐需求 TC：`TC-E2E-027-appeal` · `TC-E2E-027-overturn`（本切片仅诚实钉缺席，**不**宣称 TC 已绿）。  
**禁止**因本文件 / prove 绿而把矩阵写成 `covered` 或假 `partial`-closed。矩阵保持 **gap** / **blocked**（产品未接线）。  
**本绿 ≠ 全链路 E2E covered**；fixture=pgvector → **green-risk / R5**。  
不得把 qbank 审核 / SelectiveReview / needs_review 冒充本 UC covered。

抬到 covered 的 HTTP/product 清单见 harness **§1b**（非本 eval 已关闭项）。

---

## 2. 执行记录（实现方自跑；非专家签核）

| CMD | 期望 EXIT | 实测 | 读法 |
|-----|-----------|------|------|
| `pnpm uc027:manual-review-appeal:prove` | **0** | **0**（2026-09-10 ~02:12 PT；S1–S5+G-GAP 6 pins；receipt `.tmp/isolated-proof-receipts/2026-09-10T09-12-28-539Z-…`；R5 banner 已印；GAP-UC027-APPEAL-OPEN / OVERTURN-CAS / IDEMPOTENT / LEASE-EFFECT0 / D3-STATUS / E2E） | S1–S5 + G-GAP 诚实钉 → 矩阵保持 **gap** / **blocked**；≠ covered；**green-risk / R5**；无 fake API |
| `pnpm eval-harness-matrix-cite:prove` | **0** | **0**（2026-09-10 ~02:12 PT；含 uc-e2e-027 unit + matrix gap/blocked 钉） | harness+eval 引用矩阵行；≠业务 covered |
| qbank / selective / needs_review | **0** | 旁证（既有） | 旁证 ≠ UC covered |

复跑：

```bash
cd /workspace/meetwise
# 无 MODEL_API_KEY；静态 inventory（isolated 包装）；禁止 fake API
pnpm uc027:manual-review-appeal:prove ; echo EXIT=$?
pnpm eval-harness-matrix-cite:prove ; echo EXIT=$?
```

执行体：`apps/api/test/uc-e2e-027-manual-review-appeal.proof.mjs`

---

## 3. 条目 ↔ prove 映射

| Harness ID | Prove 断言（摘要） | 关闭 UC covered？ |
|------------|-------------------|-------------------|
| S1 | 无 appeal/manual-review 模块与 HTTP 路由 | **否**（反证未接线） |
| S2 | 无 ManualReview 域表 CREATE | 否 |
| S3 | qbank/Selective/needs_review 旁证边界 | 否 |
| S4 | e2e 无 UC-027 场景 | 否 |
| S5 | scenarios + TARGET design vs unwired | 否 |
| G-GAP-1 | GAP-UC027-APPEAL-OPEN | 否（EXIT=0≠闭环） |
| G-GAP-2 | GAP-UC027-OVERTURN-CAS | 否 |
| G-GAP-3 | GAP-UC027-IDEMPOTENT | 否 |
| G-GAP-4 | GAP-UC027-LEASE-EFFECT0 | 否 |
| G-GAP-5 | GAP-UC027-D3-STATUS | 否 |
| G-GAP-6 | GAP-UC027-E2E | 否 |

**BLOCKED（仍 gap 于产品/E2E）**：见 harness §1b — D3 schema 落地、申诉 HTTP、领取/双审、overturn CAS、幂等、lease、E2E、sole-stack 夹具。

---

## 4. 假绿标红（审查勾选）

- [ ] 未把 prove 绿写成 **UC-E2E-027 covered**
- [ ] 未把 qbank ReviewDecision / SelectiveReview / needs_review 冒充本 UC covered（旁证 ≠ covered）
- [ ] 未造 fake appeal API / 未假装产品闭环
- [ ] 未把 isolated/pgvector 绿写成 sole-stack / HA
- [ ] 矩阵保持 **gap** / **blocked**（honest；非假 covered / 非假 partial-closed）
- [ ] 钉 `本绿≠全链路 E2E covered` / `releaseEvidence=false` / `Not HA`
- [ ] G-GAP EXIT=0 读作诚实钉，非 A1 申诉闭环
- [ ] harness §1b「抬到 covered 还缺」已列 HTTP/product 路径（非仅 GAP 标签）

## 5. 专家请回答

1. S1–S5 + G-GAP 是否足以支撑矩阵保持 **gap** / **blocked**（honest mark-red；仍明示 ≠ covered）？  
2. 下一刀应优先 **D3 schema+申诉 HTTP（A1）**，还是先 **AssessmentVersion CAS 效应面（A2）**（在现无表上两者皆 blocked）？  
3. 结论写入 `reviews/`，含「仍 ≠ covered / 仍 gap/blocked」明示；`mw-e2e-ha` + honesty/privacy。
