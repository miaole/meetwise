# 审查归档 — UC-E2E-011 refund-callback 诚实 GAP · mw-e2e-ha

**日期**：2026-09-10（PT；本审独立复跑 ~02:56–02:57 PT）  
**审稿人**：`mw-e2e-ha`（对抗独立审；实现方不自审）  
**切片**：H5 honesty GAP + §1b PREREQ-1…6（refund-callback 产品缺失库存 / 抬 covered 前置）  
**结论**：**pass**（诚实 GAP 钉成立；**禁止**假绿升 covered）  
**是否允许 / 维持 partial**：**是**（矩阵维持 **partial** + P1-2；**禁止**升 **covered** / **done**）  
**releaseEvidence=false** · **Not HA** · **≠ UC-E2E-011 covered** · **本绿 ≠ 全链路 E2E covered** · **R5 green-risk** · **NON-UI** · **无 Key**

## Prove（本审独立复跑）

| CMD | EXIT | 摘要 |
|-----|------|------|
| `pnpm uc011:report-refund:http:prove` | **0** | H1–H5 **51 PASS**；H4/H5 404×3 + static pay-only inventory + **PREREQ-1…6** 已印；`[R5-MARKED-RED]`（pgvector）；receipt `.tmp/isolated-proof-receipts/2026-09-10T09-56-56-505Z-1157193-e01a50d8-e3ae-4f77-aa26-ccc93d7511e6.json`（`releaseEvidence=false` · `exitCode=0` · `target=uc011:report-refund:http:prove:raw` · `outcome=passed`） |
| `pnpm uc011:report-refund:prove` | **0** | R1–R4 **全 PASS**；R4 GAP + §1b PREREQ-2/3/4（db 侧）；R5；receipt `.tmp/isolated-proof-receipts/2026-09-10T09-57-07-411Z-1157802-8eefdbdd-612f-49df-9293-f9b69c30529c.json`（`releaseEvidence=false` · `exitCode=0` · `target=uc011:report-refund:prove:raw` · `outcome=passed`）；印 `GAP-UC011-REFUND-CALLBACK` + `BLOCKED_FOR_FULL_E2E` |
| `pnpm eval-harness-matrix-cite:prove` | **0** | `uc-e2e-011-report-refund` harness+eval 引用矩阵行；钉 partial / ≠covered / releaseEvidence=false / Not HA / refund-callback GAP / §1b refund-callback PREREQ / H5 / entitlement / balance-ui；**matrix: UC-E2E-011 is partial (not covered)**；`does not claim covered` |

### H5 / §1b PREREQ 核对（实测 · 本切片主轴）

| ID | 声称 | 本审结果 |
|----|------|----------|
| **H5 static** | `payment.ts` 仅 create/get/markPaid；无 markOrderRefunded；db index 无 refund re-export；commerce controller/webhook/service **无** refund 路由 | **PASS**（prove 静态读源码断言全绿；本审旁证抽查一致，见下） |
| **H5 HTTP 404×3** | `POST /payment/refund-callback` · `POST /commerce/webhook/refund/:id` · `POST /commerce/orders/:id/refund-callback` → **404** | **PASS**（实测 404；**≠** 产品口已实现） |
| **H5 billing stub** | `apps/web/app/billing`「当前不开放」 | **PASS**（stub；≠ balance-ui covered） |
| **PREREQ-1…6** | §1b#1 抬 covered 前置清单打印；EXIT=0 = honesty only | **PASS**（PREREQ-1…6 全印；明示「非本 prove 已绿」/「不得继续 GAP 叙事假绿」） |
| **H4**（旁证） | refund-callback/wallet/refund-webhook → 404；consumption CHECK **无** refunded | **PASS** |
| **R4**（旁证） | schema 无 consumption.refunded；payment 无 refund API；GAP pin | **PASS** |

### 对抗抽查：payment / commerce **无 refund 口**（防假绿）

| 表面 | 本审读源码结论 |
|------|----------------|
| `packages/db/src/payment.ts` | **仅** `createOrder` / `getOrder` / `markOrderPaidAndCredit`；全文 **无** `markOrderRefunded` / `refundOrder` / `applyRefund` / `status='refunded'` 写入 |
| `packages/db/src/index.ts` | `export { createOrder, getOrder, markOrderPaidAndCredit } from './payment.ts'` — **无** refund re-export |
| `apps/api/.../commerce.controller.ts` | 路由：`products` / `orders` / `orders/:id/pay-callback` / `orders/:id` / `entitlement` — **无** refund-callback |
| `apps/api/.../commerce-webhook.controller.ts` | **仅** `@Post('pay/:id')` — **无** `refund/:id` |
| schema 旁证 | `payment_order` CHECK **含** `refunded`（预留）；`entitlement_consumption` CHECK **不含** refunded — schema 预留 **≠** API |

**裁定**：声称「产品无 refund API/HTTP（payment=create/get/markPaid；commerce=pay-callback only）」**成立**。H5 EXIT=0 **不得**读成 refund-callback 已实现。

## 硬钉（勾选）

- [x] **≠ covered** / **禁止 done**（H5 GAP EXIT=0 ≠ UC-E2E-011 covered；cite 亦钉；矩阵行 **partial**）
- [x] **partial ≠ covered**（本审维持 partial；**禁止**假升）
- [x] **releaseEvidence=false** · Not HA · R5 green-risk（pgvector isolated）
- [x] **未把 H5/PREREQ-1…6 打印写成产品口已落**
- [x] **未把 404 GAP pin 写成退款幂等 / confirmed→refunded 闭环**
- [x] **未把 `GET /commerce/entitlement` 写成 `GET /wallet` covered**
- [x] **未把 `commerce:prove` / `report:prove` / `uc018:abandon:http` 冒充本 UC**
- [x] payment/commerce 抽查：pay-only；无 refund HTTP/API

## 假绿排查（优先：H5 EXIT=0 / PREREQ 打印假升 covered）

| 风险说法 | 裁定 |
|---------|------|
| H5 EXIT=0 / 51 PASS = **covered** / refund-callback 已闭环 | **否** — honesty GAP + PREREQ 清单；最多 **partial**；§1b 仍缺产品口 |
| PREREQ-1…6 已打印 = 产品口已实现 | **否** — PREREQ 是 **implementing** 前置；404 + 静态无 refund API = **仍缺失** |
| `payment_order` CHECK 含 `refunded` = 退款路径已落 | **否** — schema 预留 ≠ API；`payment.ts` 无 paid→refunded 写入；consumption **无** refunded |
| H4/H5 404 = 退款幂等 TC-E2E-011-refund-idem covered | **否** — 断言口 **缺失**；≠ idem 闭环 |
| HTTP entitlement 绿 = wallet / balance-ui covered | **否** — wallet 404；billing「当前不开放」stub |
| isolated/pgvector 绿 = sole-stack / HA / releaseEvidence | **否** — R5 mark-red；receipt `releaseEvidence=false` |

**refund-callback GAP 是否诚实**：**是**。静态 pay-only + HTTP 404×3 + PREREQ-1…6 明示抬 covered 前置，**未**把缺失口写成已实现。  
**partial 是否诚实**：**是**。R1–R4 + H1–H5 可执行合同已绿，足以**维持**矩阵 **partial** + P1-2；缺口仍明示，**未**假升 covered / done。

## 阻塞栏（升 covered / 全链路前必填）

| 阻塞项 | 现状 | 关闭条件 |
|--------|------|----------|
| **PREREQ-1** 支付退款回调产品口 | `POST /payment/refund-callback` / `POST /commerce/webhook/refund/:id` / `…/refund-callback` 均 **404**；commerce 仅 pay-callback / webhook pay | 产品口落地（验签 fail-closed）+ 真 HTTP prove（**禁止**继续用 404 GAP 叙事）后复评 |
| **PREREQ-2** `markOrderRefunded` CAS/幂等 | `payment.ts` 仅 create/get/markPaid；无 paid→refunded 写入；index 无 refund export | `markOrderRefunded`：paid→refunded CAS + 幂等键(支付单号+流水) exactly-once 后复评 |
| **PREREQ-3** Consumption/权益退款迁移 | consumption CHECK **无** refunded；payment_order 仅 schema 预留 | confirmed→refunded（或红冲）与 D1 对齐的可执行迁移 + 断言后复评 |
| **PREREQ-4** TC-E2E-011-refund-idem | 产品口未落；本 prove 仅 GAP pin | 重复回调仅退一次；冲突/越权/缺签 fail-closed 集成断言绿后复评 |
| **PREREQ-5** wallet / balance-ui | `GET /wallet` 404；billing stub「当前不开放」；`GAP-UC011-WALLET` / `GAP-UC011-BALANCE-UI` | wallet 落地或 ADR 降级 entitlement + 退款后余额 UI（Playwright 降次）后复评 |
| **PREREQ-6** H5 GAP 叙事作废条件 | 当前合法：产品口仍缺失故 404 GAP 诚实 | 上列口浮出后 **必须**改刀真 HTTP prove；**禁止**继续用 404 GAP 冒充闭环 |
| fail HTTP mouth / full.e2e 额度回滚 | 无 `POST /interview/:id/fail`；full.e2e 有 quarantine 兜底缺额度业务断言 | 产品 fail 口或 full.e2e 显式 fail→额度回滚进 isolated 后复评 |
| regenerate（UC-E2E-019） | H2 retry→404；quarantined 不可 requeue | UC-019 产品口 + 与退款并发合同后再评；**禁止**借本绿冒充 019 |
| fixture=pgvector → R5 / sole-stack | isolated 仍 pgvector | sole-stack 迁或持续 mark-red；**不因本绿宣称 HA** |

**本切片不因上述阻塞而 block partial**；上述仅 **阻塞升 covered / 宣称全链路 E2E covered / 把 H5 EXIT=0 或 PREREQ 打印写成 refund-callback 产品闭环**。

## 结论与建议

- **pass**；**允许并维持**矩阵 **partial**（P1-2）；**禁止 covered / done**
- H5 诚实：产品 **无** refund API/HTTP（payment=create/get/markPaid；commerce=pay-callback only）— 抽查与 prove 一致
- §1b PREREQ-1…6 清晰为 **抬 covered 前置**，**≠** 已实现；EXIT=0 = honesty pin only
- `releaseEvidence=false` · Not HA · R5；本绿 ≠ 全链路 E2E covered
- 下一刀：实现 PREREQ-1/2（refund HTTP 口 + `markOrderRefunded` CAS）后再改刀真 prove；在此之前矩阵保持 **partial**
- 对照：`harness/uc-e2e-011-report-refund.md` · `eval/uc-e2e-011-report-refund.eval.md` · `apps/api/test/uc-e2e-011-report-refund-http.proof.ts` · `packages/db/test/uc-e2e-011-report-refund.proof.ts` · 矩阵 `UC-E2E-011` / P1-2
