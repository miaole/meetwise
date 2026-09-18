# 对抗第二审 — UC-E2E-011 refund-callback GAP · mw-model-op

**日期**：2026-09-10（PT）  
**结论**：**pass**（**honesty / §1b PREREQ 对抗审**；矩阵保持 **partial**；**禁止 covered**）  
**releaseEvidence=false** · Not HA · 本绿 ≠ UC-E2E-011 covered · ≠ refund-callback 已实现  
**域**：计费/退款 E2E（privacy 已域拒；本审 MODEL-OP/commerce）  
**前序**：`2026-09-10-uc-e2e-011-mw-model-op-spot.md` · `2026-09-10-uc-e2e-011-http-entitlement-mw-model-op-spot.md`

## Prove（亲自复跑）
| CMD | EXIT | Receipt |
|-----|------|---------|
| `pnpm uc011:report-refund:prove` | **0** | `…09-57-46…adfb787c…`（R1–R4 + §1b db PREREQ） |
| `pnpm uc011:report-refund:http:prove` | **0**（51 PASS） | `…09-57-53…45c00e7c…`（H1–H5） |

fixture=`pgvector` → **R5 green-risk** · `release_evidence=false`

## 对抗核对：H5 诚实 GAP

| 攻击读法 | 证据 | 裁定 |
|----------|------|------|
| H5 绿 = refund-callback 已实现 | `POST /payment/refund-callback` / webhook refund / orders/:id/refund-callback → **404×3**；controller 无 refund 路由；payment.ts 无 markOrderRefunded | **驳回** → 假绿 |
| payment_order CHECK 有 `refunded` = API 已通 | H4/H5：CHECK 预留；**无** paid→refunded 写入；consumption CHECK **不含** refunded | **驳回** → schema 预留 ≠ 产品口 |
| pay-callback 旁证 = 退款对称口 | H5：有 pay-callback；**无** refund 对称口 | **驳回** |
| H5 EXIT=0 = covered | prove 自钉 `EXIT=0 ≠ covered / ≠ refund-callback 已实现`；PREREQ-6 作废条件 | **诚实** |

**裁定**：H5 **诚实 GAP 成立**。未发现把缺失口写成已实现。

## 对抗核对：§1b PREREQ

打印 **PREREQ-1…6**（implementing 清单）：HTTP 退款口 · markOrderRefunded CAS/幂等 · consumption 退款迁移 · refund-idem TC · wallet/balance-ui · 产品口浮出后须改刀真 prove。

| 攻击读法 | 裁定 |
|----------|------|
| 「打印了 PREREQ = 产品口已实现」 | **假绿**（harness 已禁；H5 文案「非本 prove 已绿」） |
| 「R4/H4/H5 绿可升 covered」 | **假绿**；§1b#1 未闭环则矩阵必须 **partial** |

**裁定**：§1b PREREQ 作为 **抬 covered 前置清单**清晰且与代码库存一致；**不得**当完成证明。

## 矩阵
保持 **partial**。**禁止**假 covered。抬 covered 最低门槛 = §1b#1 PREREQ-1…4 真实现 + 可执行 refund-idem prove（非 404 GAP）。

## 仍缺（挡 covered）
1. `POST /payment/refund-callback`（或 webhook refund）验签 fail-closed  
2. `markOrderRefunded` paid→refunded CAS + 幂等键 exactly-once  
3. ConsumptionRecord confirmed→refunded/红冲（对齐 D1）  
4. TC-E2E-011-refund-idem；wallet/balance-ui；fail mouth；full.e2e  

## 对照
- harness §1b · H5：`ai-docs/delivery/harness/uc-e2e-011-report-refund.md`
- eval：`ai-docs/delivery/eval/uc-e2e-011-report-refund.eval.md`
