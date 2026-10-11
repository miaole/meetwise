# 审查归档 — UC-E2E-011 HTTP 额度抬 covered 切片 · mw-e2e-ha

**日期**：2026-09-10（PT；本审独立复跑 ~02:29–02:30 PT）  
**审稿人**：`mw-e2e-ha`（对抗独立审；实现方不自审）  
**切片**：HTTP 额度 / `GET /commerce/entitlement`（H1–H4）叠加原 R1–R4  
**结论**：**pass**  
**是否允许 / 维持 partial**：**是**（矩阵维持 **partial** + P1-2；**禁止**升 **covered**）  
**releaseEvidence=false** · **Not HA** · **≠ UC-E2E-011 covered** · **本绿 ≠ 全链路 E2E covered** · **R5 green-risk** · **NON-UI** · **无 Key**

## Prove（本审独立复跑）

| CMD | EXIT | 摘要 |
|-----|------|------|
| `pnpm uc011:report-refund:http:prove` | **0** | H1–H4 **35 PASS**；真 `GET /commerce/entitlement`（鉴权 200 + `availableUnits`；未鉴权 401）；`[R5-MARKED-RED]`（`E2E_PG_IMAGE=pgvector`）；receipt `.tmp/isolated-proof-receipts/2026-09-10T09-29-31-188Z-1081268-baa7a9b8-280d-491b-925c-3860b2648b77.json`（`releaseEvidence=false` · `exitCode=0` · `target=uc011:report-refund:http:prove:raw` · `outcome=passed`）；印 `GAP-UC011-PRIVACY-STUB` + REFUND-CALLBACK / WALLET / BALANCE-UI / FAIL-HTTP-MOUTH / FULL-E2E |
| `pnpm uc011:report-refund:prove` | **0** | R1–R4 **全 PASS**；R5；receipt `.tmp/isolated-proof-receipts/2026-09-10T09-29-42-883Z-1082189-c13a50ce-4ff4-4aa1-b07b-fb588f364472.json`（`releaseEvidence=false` · `exitCode=0` · `target=uc011:report-refund:prove:raw`）；印 `GAP-UC011-REFUND-CALLBACK` + `BLOCKED_FOR_FULL_E2E` |
| `pnpm eval-harness-matrix-cite:prove` | **0** | `uc-e2e-011-report-refund` harness+eval 引用矩阵行；钉 partial / ≠covered / releaseEvidence=false / Not HA / `uc011:report-refund:prove` + `uc011:report-refund:http:prove` / §1b / entitlement / balance-ui / refund-callback GAP；**matrix: UC-E2E-011 is partial (not covered)**；`does not claim covered` |

### H1–H4 核对（实测）

| ID | 声称 | 本审结果 |
|----|------|----------|
| **H1** | fail + **HTTP** `GET /commerce/entitlement`：预留 -1；fail→released 后额度净变 0；二次不双退 | **PASS**（真 GET entitlement；DB failInterviewAndRelease 突变；HTTP 与 DB `availableUnits` 一致） |
| **H2** | quarantine 后 HTTP 额度不退；`GET …/report`=quarantined；`POST …/report/retry`→404 `no_retriable_report` | **PASS**（D1：报告失败默认不退；regenerate→UC-019 BLOCKED 诚实） |
| **H3** | confirmed 上 `releaseConsumption` → `already_confirmed`；HTTP 额度未误退 | **PASS** |
| **H4** | refund-callback / wallet / refund-webhook → **404**；consumption CHECK **无** refunded；entitlement 鉴权门；balance-ui GAP 打印 | **PASS**（404 probes 实测；GAP pins 已印；**≠** 把缺失口写成已实现） |

### R1–R4 核对（原 prove 复跑）

| ID | 本审结果 |
|----|----------|
| R1 / R2 / R3 / R4 | **PASS**（与先前 db 切片一致；R4 仍为 honesty GAP pin，≠退款回调闭环） |

## 硬钉（勾选）

- [x] **≠ covered**（HTTP entitlement 绿 ≠ UC-E2E-011 covered；cite 亦钉；矩阵行 **partial**；§1b 仍缺）
- [x] **禁止升 covered**（本审明确：**不得**因 H1–H4 / 35 PASS 假升）
- [x] **R5 green-risk**（isolated → pgvector；banner 已印；≠ sole-stack / HA）
- [x] **releaseEvidence=false** · Not HA
- [x] 未把 `GET /commerce/entitlement` 写成 `GET /wallet` covered
- [x] 未把 H4/R4 404 / schema GAP 写成退款回调 / refund-idem 已闭环
- [x] 未把 `commerce:prove` / `neg:commerce` / `report:prove` / `uc018:abandon:http` 冒充本 UC
- [x] 未把 `full.e2e` `report_unavailable`+quarantined 兜底写成额度回滚业务断言已挂
- [x] 真口核对：`commerce.controller` `@Get('entitlement')` 存在；**非** stub entitlement 路由
- [x] fail 突变仍走 db `failInterviewAndRelease`（interview controller **无** `@Post(':id/fail')`）→ FAIL-HTTP-MOUTH 缺口诚实
- [x] PRIVACY-STUB ≠ 0058 fence covered

## 假绿排查（优先：HTTP GET entitlement 绿假升 covered + refund-callback GAP 诚实）

| 风险说法 | 裁定 |
|---------|------|
| `uc011:report-refund:http:prove` 绿 = **covered** / 退款回调已闭环 | **否** — HTTP 额度口 + H4 GAP ≠ refund-callback 产品；最多 **partial**；§1b 仍缺 |
| `GET /commerce/entitlement` 绿 = `GET /wallet` covered / balance-ui covered | **否** — entitlement 真口已钉；`GET /wallet` 实测 404；billing 页「当前不开放」stub → `GAP-UC011-WALLET` / `GAP-UC011-BALANCE-UI` |
| H4 EXIT=0（404 probes）= 退款幂等 / confirmed→refunded **已实现** | **否** — honesty pin：断言口 **缺失**（404）+ consumption CHECK **不含** refunded；`payment.ts` 仅 `createOrder`/`getOrder`/`markOrderPaidAndCredit`，**无** refund API；webhook 仅 `@Post('pay/:id')`，**无** `refund/:id` |
| H1 绿 = fail HTTP mouth / full.e2e 额度回滚已关 | **否** — 突变仍 db；断言走 HTTP；`GAP-UC011-FAIL-HTTP-MOUTH` / `GAP-UC011-FULL-E2E`；`full.e2e` 有 quarantine 兜底，OCR 额度断言 ≠ 本 UC 报告失败退款边界 |
| `uc011:report-refund:prove` 绿 = covered | **否** — db 集成 only；先前审已钉；叠加 HTTP 仍 ≠ covered |
| R4/H4 schema「payment_order 含 refunded」= 产品退款路径已落 | **否** — schema 预留 ≠ API；prove 同时钉 consumption **无** refunded + 无迁移 API |
| PRIVACY-STUB + 报告 GET/retry 绿 = 0058 privacy covered | **否** — minimal owner-match stub；明示 ≠ fence covered |
| isolated/pgvector 绿 = sole-stack / HA / releaseEvidence | **否** — R5 mark-red；receipt `releaseEvidence=false` |

**HTTP entitlement 绿是否假升 covered**：**否**。矩阵行 / harness §1b / cite / prove 头注释与 honesty pin 均明示 **partial ≠ covered**；本审 **禁止升 covered**。

**refund-callback GAP 是否诚实**：**是**。H4 实测 `POST /payment/refund-callback`→404、`GET /wallet`→404、`POST /commerce/webhook/refund/:id`→404；旁证：`payment.ts` 无 refund；webhook 仅 pay；billing stub；与 harness 搜码结论 / §1b #1–#2/#5 对齐，**未**把 404 写成产品口已实现。

**partial 是否诚实**：**是**。db R1–R4 + HTTP H1–H4（真 entitlement 额度口径）可执行合同已绿，足以**维持**矩阵 **partial** + P1-2「集成+HTTP 额度 prove 已挂」；缺口仍明示，**未**假升 covered。

## 阻塞栏（升 covered / 全链路前必填）

| 阻塞项 | 现状 | 关闭条件 |
|--------|------|----------|
| 支付退款回调 / `confirmed→refunded` | `POST /payment/refund-callback` 404；`payment.ts` 无 refund API；webhook 无 refund 口；consumption CHECK **无** `refunded`（payment_order schema 仅预留）；R4/H4 仅 GAP pin | 产品路径落库 + CAS/幂等键（支付单号+流水）+ TC-E2E-011-refund-idem 可执行断言后复评 |
| balance-ui | `apps/web/app/billing`「当前不开放」stub；`GET /wallet` 404；`GAP-UC011-BALANCE-UI` | 真余额/退款后展示（wallet 或正式 ADR 降级 entitlement）+ Playwright（降次于 HTTP）后复评 |
| 面试失败用户/编排 HTTP 口 | interview controller **无** `@Post(':id/fail')`；H1 突变走 db；`GAP-UC011-FAIL-HTTP-MOUTH` | 产品 fail 口或 full.e2e 显式 worker fail→额度回滚进 `e2e:isolated` 后复评 |
| `full.e2e` / `e2e:isolated` 额度回滚业务断言 | 有 `report_unavailable`+quarantined 兜底；**缺**本 UC 额度/`ConsumptionRecord` 回滚断言（OCR 额度断言 ≠ 011） | 显式 TC：面试 fail→released+HTTP 净 0；quarantine→confirmed 不退；进 isolated 复跑绿 |
| `GET /wallet` 契约落地 | entitlement 口已钉 ≠ wallet；`GAP-UC011-WALLET` | 落地或正式 ADR 降级为 entitlement 后复评 |
| regenerate（UC-E2E-019） | H2 retry→404 `no_retriable_report`；quarantined 不可 requeue | UC-019 产品口 + 与退款并发合同后再评；**禁止**借本绿冒充 019 |
| fixture=pgvector → R5 / sole-stack | isolated 仍 pgvector；≠ MySQL+Qdrant+Redis | 按 sole-stack 迁或持续 mark-red；**不因本绿宣称 HA** |
| 完整 0058 privacy fence | `_neg-harness` minimal stub（`GAP-UC011-PRIVACY-STUB`） | 载入真实 privacy fence；**禁止**借 stub 宣称隐私 covered |

**本切片不因上述阻塞而 block partial**；上述仅 **阻塞升 covered / 宣称全链路 E2E covered / 把 HTTP entitlement 绿或 404 GAP pin 写成退款回调/wallet/balance-ui 闭环**。

## 结论与建议

- **pass**；**允许并维持**矩阵 **partial**（P1-2）；**禁止 covered**（含：禁止因 HTTP 35 PASS / 真 GET entitlement 绿升阶）
- D1 边界未被写反：面试失败→released+HTTP 净 0（H1/R1）；报告失败默认不退（H2/R2）；confirmed 拒误 release（H3/R3）
- HTTP 合同诚实：真 `@Get('entitlement')`；H1–H3 额度口径；H4 refund/wallet/balance-ui GAP 诚实；§1b 清晰
- 下一刀 P1：支付 `confirmed→refunded` / refund-idem 产品口；并行 fail mouth 或 full.e2e 额度回滚；wallet/balance-ui 或 ADR
- 对照：`harness/uc-e2e-011-report-refund.md` · `eval/uc-e2e-011-report-refund.eval.md` · `apps/api/test/uc-e2e-011-report-refund-http.proof.ts` · `packages/db/test/uc-e2e-011-report-refund.proof.ts` · 矩阵 `UC-E2E-011` / P1-2 · 先前 db 审 `reviews/2026-09-10-uc-e2e-011-mw-e2e-ha.md`
