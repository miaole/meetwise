# 审查归档 — UC-E2E-011 HTTP 额度账本 spot · mw-model-op

**日期**：2026-09-10（PT）  
**结论**：**pass**（**partial / HTTP entitlement spot**；**≠ covered**）  
**releaseEvidence=false** · Not HA · 本绿 ≠ 全链路 E2E covered · ≠ UC-E2E-011 covered  
**对照**：DB 集成 spot `reviews/2026-09-10-uc-e2e-011-mw-model-op-spot.md`（仍有效；本切片加 HTTP 口）

## Prove（亲自）
| CMD | EXIT |
|-----|------|
| `pnpm uc011:report-refund:http:prove` | **0**（35 PASS） |

收据：`.tmp/isolated-proof-receipts/2026-09-10T09-29-16-253Z-1079515-347d63a9-1bb1-42a2-9251-deffd08e8ade.json`（`release_evidence=false`）  
fixture=`pgvector` → **R5 green-risk**

## 核对项

### 1) HTTP 额度净变 / 不双退是否假绿
| 场景 | 结果 | 假绿？ |
|------|------|--------|
| H1 fail→released；`GET /commerce/entitlement` 净变 0；二次 fail 额度不变 | PASS | **否**（partial 下；fail 仍走 db `failInterviewAndRelease`，非用户 fail HTTP 口） |
| H2 quarantine 后 HTTP 额度不回补；retry→404 | PASS | **否**（与 D1 报告失败不退一致） |
| H3 confirmed 上 release→already_confirmed；HTTP 额度不变 | PASS | **否** |

**裁定**：HTTP 额度读口断言 **非假绿**（在 ≠covered / 仍 partial 叙事下）。若写成「fail HTTP mouth / full.e2e / refund-callback 已闭环」或 **covered** → **升假绿**。

### 2) refund-callback GAP 诚实
- `POST /payment/refund-callback` → **404**
- `GET /wallet` → **404**；webhook refund → **404**
- `entitlement_consumption` CHECK **不含** `refunded`（不伪造）
- 打印 `GAP-UC011-REFUND-CALLBACK` / WALLET / BALANCE-UI / FAIL-HTTP-MOUTH / FULL-E2E

**裁定**：**诚实钉成立**。H4 EXIT=0 ≠ 退款回调 / wallet / balance-ui covered。

## 与 D1 / 前序 DB spot
与 UC-011 DB R1–R4 及 D1「1额度=1场；报告失败不退」**一致**；本切片补强 HTTP `GET /commerce/entitlement` 读一致性，**不**关闭支付退款产品口。

## 矩阵
保持 **partial**。禁止升 covered。

## 仍缺（挡 covered）
- 支付 refund-callback 幂等 + confirmed→refunded API
- balance-ui / GET /wallet 契约落地
- 用户 fail HTTP 口；full.e2e 额度回滚
- regenerate（UC-019）；sole-stack 夹具

## 对照
- harness/eval：`uc-e2e-011-report-refund`（含 H1–H4）
- 需求：`e2e-scenarios.md` UC-E2E-011 · D1 · E1/E2/E4
