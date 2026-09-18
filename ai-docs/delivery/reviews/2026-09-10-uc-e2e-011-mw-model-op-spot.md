# 审查归档 — UC-E2E-011 账本/计费 spot · mw-model-op

**日期**：2026-09-10（PT）  
**结论**：**pass**（**partial ladder / spot**；**≠ covered**）  
**releaseEvidence=false** · Not HA · 本绿 ≠ 全链路 E2E covered · ≠ UC-E2E-011 covered

## Prove（亲自）
| CMD | EXIT |
|-----|------|
| `pnpm uc011:report-refund:prove` | **0** |

收据：`.tmp/isolated-proof-receipts/2026-09-10T08-17-46-967Z-763547-5201b48c-31e9-4506-8763-cde97b6fb046.json`（`release_evidence=false`）  
fixture=`pgvector` → **R5 green-risk**（≠ sole-stack migrated）

## D1「1额度=1场」边界（面试失败退 vs 报告失败不退）

| 场景 | 期望（D1 / UC-E2E-011） | prove | 假绿？ |
|------|-------------------------|-------|--------|
| R1 面试失败 | `failed` + `reserved→released` + 额度净变 0 | PASS | **否**（在 partial 叙事下） |
| R2 报告 quarantine | interview 仍 `completed`；consumption 仍 `confirmed`；额度不回补 | PASS | **否**（明确不退，未写成退款成功） |
| R3 误退 | `already_confirmed`；无 confirmed→released | PASS | **否** |

**裁定**：在 harness「partial / ≠ covered」口径下，**未发现把边界写反或用旁证冒充本 UC 的假绿**。若有人把本 EXIT=0 写成 **UC-E2E-011 covered** / 「e2e:isolated 已断言退款」→ **升假绿**。

## R4 `GAP-UC011-REFUND-CALLBACK` 诚实钉

- schema CHECK **含** `confirmed`/`released`，**不含** `refunded`
- 运行时打印 `GAP_PIN: GAP-UC011-REFUND-CALLBACK`（payment 无 refund-callback / confirmed→refunded API）
- EXIT=0 **仅=诚实钉**，≠ TC-E2E-011-refund-idem / 支付退款回调闭环

**裁定**：**诚实钉成立**。把 R4 绿读成退款幂等已 covered → **假绿**。

## 仍缺（不挡本 spot pass；挡 covered）

- 支付 `confirmed→refunded` 回调幂等（E3）
- HTTP / `full.e2e` 额度断言、balance-ui
- regenerate 产品口（UC-019；R2 仅钉 quarantined 不可 requeue）
- sole-stack 夹具（当前 pgvector R5）

## 对照
- harness：`ai-docs/delivery/harness/uc-e2e-011-report-refund.md`
- eval：`ai-docs/delivery/eval/uc-e2e-011-report-refund.eval.md`
- 需求：`e2e-scenarios.md` UC-E2E-011 · D1 · E1/E2/E4
