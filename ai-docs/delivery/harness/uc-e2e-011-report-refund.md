# Harness — UC-E2E-011 报告失败退款 + 计费边界（eval-first · partial ladder）

**releaseEvidence=false** · **Not HA** · **本绿 ≠ 全链路 E2E covered** · **≠ UC-E2E-011 covered**  
**对照矩阵行**：`UC-E2E-011`  
**对照建议补集**：`e2e-requirement-coverage-matrix.md` §3 P1-2  
**对照需求**：`e2e-scenarios.md` UC-E2E-011 · D1（1 额度=一场面试）· E1/E2/E4  
**MODEL_API_KEY**：**不需要**（db 集成 + HTTP 额度口均不调 live 模型）

---

## 0. 立场（先读）

| 声明 | 裁定 |
|------|------|
| 现有覆盖 | `full.e2e.ts` 有 `report_unavailable`+quarantined 兜底；**NON-UI** `uc011:report-refund:prove` + `uc011:report-refund:http:prove` → 矩阵 **partial** |
| 本切片 | 可执行 **R1–R3** 集成 + **R4** honesty GAP（含 §1b 静态库存）+ **H1–H3** HTTP 额度断言 + **H4** refund/wallet/balance-ui GAP + **H5** §1b refund-callback 抬 covered 前置 |
| D1 口径 | `reserved→confirmed` @ `Interview.completed`；**报告 job 失败默认不退款**；仅面试 `failed/abandoned` → `released` |
| 另轨 | `commerce:prove` / `neg:commerce` / `report:prove` / `uc018:abandon:http` **≠** 本 UC 专用计费边界验收（可旁证，勿冒充） |
| 假绿禁令 | 不得把本绿写成「e2e:isolated 已断言退款」或「UC-E2E-011 covered」 |
| 本绿≠全链路 E2E covered | **必须钉死**，直至 refund-callback 产品口 + balance-ui + full.e2e 额度回滚闭环 |

专家：`mw-e2e-ha` + 计费域第二审（`privacy` 不强制；**model-op / commerce 账本**审阅人优先）。禁止作者自签 covered。

---

## 1. 测什么（R1–R4 + HTTP H* 可执行合同）

| ID | 场景 | 期望 | 执行体 |
|----|------|------|--------|
| **R1** | `active`+reserved → `failInterviewAndRelease` | `Interview=failed`；`entitlement_consumption=released`；额度净变 0；二次 fail 幂等 | `packages/db/test/uc-e2e-011-report-refund.proof.ts` |
| **R2** | complete+confirm → report poison-pill → quarantined | interview 仍 `completed`；consumption 仍 `confirmed`；额度**不**回补；quarantined 不可 `requeueFailedReport`（regenerate→UC-019 BLOCKED） | 同上 |
| **R3** | completed+confirmed 上 `releaseConsumption` | `error already_confirmed`；consumption/额度不变（无 confirmed→released） | 同上 |
| **R4** | honesty GAP | schema CHECK **无** consumption.`refunded`；打印 `GAP-UC011-REFUND-CALLBACK`；EXIT=0 仅=诚实钉 ≠ 退款回调 covered | 同上 |
| **H1** | fail + **HTTP** `GET /commerce/entitlement` | 预留后 HTTP -1；fail→released 后 HTTP 额度净变 0；二次不双退 | `apps/api/test/uc-e2e-011-report-refund-http.proof.ts` |
| **H2** | quarantine 后 HTTP 额度不退 | confirm 后 HTTP 不变；quarantine 后仍不变；`GET …/report`=quarantined；`POST …/report/retry`→404 `no_retriable_report` | 同上 |
| **H3** | 误 release + HTTP 额度 | already_confirmed；HTTP 额度未误退 | 同上 |
| **H4** | honesty probe | `POST /payment/refund-callback` / `GET /wallet` / `POST /commerce/webhook/refund/:id` → **404**；payment_order CHECK 有 refunded 但无 API；billing stub → balance-ui GAP | 同上 |

**搜码结论（本波）**

| 路径 | 结论 |
|------|------|
| `GET /commerce/entitlement` | **已存在** — CommerceController；本波 HTTP prove 打真口钉额度 |
| `POST /payment/refund-callback` · `GET /wallet` | **产品缺失** — 契约在 scenarios，运行时 404；H4 honesty |
| `POST /commerce/webhook/refund/:id` | **缺失** — webhook 仅 `pay/:id` |
| `payment.ts` markOrderRefunded / confirmed→refunded | **缺失** — 仅 createOrder/getOrder/markOrderPaidAndCredit；payment_order schema 预留 `refunded` 无迁移 API |
| `POST /interview/:id/fail` | **缺失** — fail 仅 worker/`failInterviewAndRelease`；H1 突变走 db、断言走 HTTP |
| `apps/web/app/billing` | **stub** — 「当前不开放」；无余额 UI → `GAP-UC011-BALANCE-UI` |

### 明确不测 / BLOCKED（本 harness · 抬 covered 见 §1b）

| 非目标 | 原因 |
|--------|------|
| 支付退款回调幂等（TC-E2E-011-refund-idem） | 产品口未落；H4/R4 GAP |
| balance-ui（TC-E2E-011-balance-ui） | billing stub；e2e UI only |
| `full.e2e` 额度回滚业务断言 | 有隔离无回滚；未进本 prove |
| regenerate 免费重生成入口 | UC-E2E-019；H2 retry 404 已钉 BLOCKED |
| `report_unavailable` SSE | `report:prove` / worker 另轨旁证 ≠ 本计费边界 |
| UC-018 abandon HTTP | 另轨 release 口；勿冒充本 UC fail 路径 |

---

## 1b. 抬到 covered 还缺（HTTP/product path · 非仅 GAP 标签）

> partial ≠ done。下列是北星「全链路零遗漏」要关的路径，**不是**本 prove 已绿项。**禁止**因 H1–H4 绿而升 covered。

| # | 抬到 **covered** 仍缺 | 对应验收 / 缺口 |
|---|------------------------|-----------------|
| 1 | **支付退款回调产品口**：`POST /payment/refund-callback`（或等价 webhook）+ `payment_order`/`ConsumptionRecord` confirmed→refunded（或红冲）CAS + 幂等键（支付单号+流水）集成证明 | E3 / A3 · `GAP-UC011-REFUND-CALLBACK` |
| 2 | **balance-ui**：退款/释放后余额展示正确（`GET /wallet` 或 billing 真页 + Playwright）；非 preview stub | TC-E2E-011-balance-ui · `GAP-UC011-BALANCE-UI` |
| 3 | 面试失败**用户/编排 HTTP 口**（或 full.e2e 显式 worker fail→额度回滚场景进 `e2e:isolated`） | E1 / A1 · `GAP-UC011-FAIL-HTTP-MOUTH` / `GAP-UC011-FULL-E2E` |
| 4 | regenerate 入口闭环（UC-E2E-019；quarantined 可恢复或产品口径 ADR） | A2 · UC-019 |
| 5 | 契约 `GET /wallet` 落地或正式 ADR 降级为 `GET /commerce/entitlement`（本 prove 已钉 entitlement ≠ wallet covered） | 关联契约 · `GAP-UC011-WALLET` |
| 6 | sole-stack 夹具（MySQL+Qdrant+Redis）替换默认 pgvector isolated，去掉 **R5 green-risk** 后才可讨论发布级 covered | 矩阵 §0 / R5 |

**本切片明确不做**：上表实现；把旁证 prove 绿写成 covered；把矩阵升 covered。

---

## 2. 命令与期望 EXIT

| CMD | 期望 EXIT | 含义（诚实） |
|-----|-----------|--------------|
| `pnpm uc011:report-refund:prove` | **0** | R1–R3 集成绿 + R4 honesty pin；**本绿 ≠ 全链路 E2E covered**；fixture=pgvector → green-risk / R5 |
| `pnpm uc011:report-refund:http:prove` | **0** | H1–H3 HTTP 额度断言 + H4 refund/wallet/balance-ui GAP + **H5 §1b refund-callback 抬 covered 前置**；**仍 ≠ covered**；privacy stub pin；R5 |
| `pnpm uc011:report-refund:prove:raw` / `…:http:prove:raw`（仅经 isolated 子进程） | **0** | raw：`pnpm -C packages/db prove:uc011-report-refund` / `pnpm -C apps/api prove:uc011-report-refund-http` |
| `pnpm eval-harness-matrix-cite:prove` | **0** | 静态：harness+eval 引用 `UC-E2E-011`；≠业务 covered |

```bash
cd /workspace/meetwise
# 无需 MODEL_API_KEY；需 Docker disposable PG（run-e2e-isolated）
pnpm uc011:report-refund:prove ; echo EXIT=$?
pnpm uc011:report-refund:http:prove ; echo EXIT=$?
pnpm eval-harness-matrix-cite:prove ; echo EXIT=$?
```

执行体：  
- db：`packages/db/test/uc-e2e-011-report-refund.proof.ts`  
- HTTP：`apps/api/test/uc-e2e-011-report-refund-http.proof.ts`  

入口：`package.json` → `uc011:report-refund:prove` / `uc011:report-refund:http:prove` → `scripts/run-e2e-isolated.mjs …:raw`

**旁证（≠本 UC 验收）**：`pnpm commerce:prove`；`pnpm report:prove`（quarantine+`report_unavailable`）；`full.e2e.ts` 报告隔离兜底；`uc018:abandon:http:prove`（放弃退还另轨）。

---

## 3. 假绿标红

| 若有人说… | 正确读法 |
|-----------|----------|
| 「full.e2e report_unavailable 绿了所以 011 covered」 | **假绿**。有隔离 **缺**额度回滚断言 |
| 「commerce:prove 绿了所以 011 covered」 | **假绿**。另轨 ≠ UC-E2E-011 R1–R3/H* |
| 「uc011:report-refund:prove 绿 = covered」 | **假绿**。最多 **partial**；缺支付退款回调 / balance-ui / full.e2e |
| 「uc011:report-refund:http:prove 绿 = covered / 退款回调已闭环」 | **假绿**。HTTP 额度口 + H4/H5 GAP ≠ refund-callback 产品；仍缺 §1b |
| 「R4/H4/H5 EXIT=0 = 退款幂等已闭环」 | **假绿**。是 GAP 诚实钉 + 抬 covered 前置清单，≠ TC-E2E-011-refund-idem covered |
| 「H5 打印了 PREREQ = 产品口已实现」 | **假绿**。PREREQ 是 implementing 清单；404 + 静态无 refund API = 仍缺失 |
| 「GET /commerce/entitlement = GET /wallet covered」 | **假绿**。entitlement 口已钉 ≠ wallet 契约落地 |

---

## 4. 矩阵锚点

| ID | 状态（有执行体绿后） | 本 harness |
|----|----------------------|------------|
| UC-E2E-011 | **partial**（R1–R4 + H1–H5）；**≠ covered** | `harness/uc-e2e-011-report-refund.md` |
| 评测说明 | `eval/uc-e2e-011-report-refund.eval.md` | 引用矩阵行 ID |
| P1-2 | 集成+HTTP 额度 prove 已挂；退款回调/balance-ui/full.e2e/regenerate 仍缺 | 见矩阵 §3 · harness §1b |

## 5. 审查

- `mw-e2e-ha`：确认未把 partial 写成 covered；确认 `本绿≠全链路 E2E covered`；确认 H4 未把 404 写成退款口已实现
- 计费/账本第二域（model-op 或 commerce 审阅人）：确认 D1（报告失败不退）与 R1/H1（面试失败退）边界未被写反
