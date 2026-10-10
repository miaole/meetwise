# Receipt — **GAP-UC011-ADV-01 · 主口 `POST /payment/refund-callback` 真接线 + ADV 七类** · Line V · prove

**Status**: **coding+prove done · `EXIT=0`**（post-prove dual PENDING · Ban self-nail · Ban covered · **STOP**）
**Pins（原值）**: haStatus=**NOT_HA** · releaseEvidence=**false** · claimProductionHA=**false** · gR45Closed=**true** · coveredCount=**8** · ms3EqualsR4Closed=**false** · PG-retained · public DELETE stays **503** · UC-011 stays **partial** · ADV stays **gap/case-only** · `GAP-UC011-ADV-01` stays **OPEN**
**Date**: 2026-10-06 ~10:56 CST（Asia/Shanghai · UTC+8）
**Base / PRE_DUAL tip**: `920aee22`（双 PRE-EXEC PASS：mw-e2e-ha `16a1a335` + mw-model-op `920aee22` · REQUEST `d58b05bf`）
**CODE_SHA / prove tip**: `2535b319`（feat commit；attempt#2/attempt#3 跑于此 tip）
**Branch / worktree**: `line/v-uc011-adv-main-mouth` · `/Users/miaole/Desktop/golucky/meetwise-line-v`
**Executed by**: `mw-core`（Line V coding+prove · Ban self-nail · 禁 push）
**Harness / 双 PRE**: `harness/gap-uc011-adv-main-mouth-wiring.md` · PRE-EXEC dual BOTH PASS（e2e-ha C-V1~V6/FT-1~FT-9 · model-op C-1~C-5）

## Mouth

- **主口（本刀落地）**: `POST /payment/refund-callback`（scenarios `:253` 字面契约 · 无 `:id` 段）
- **Path A（Line Z · 不回退）**: `POST /commerce/webhook/refund/:id` —— 两入口**共用同一 `CommerceService.refundWebhook` 单管道**（双审裁决：薄适配 + 单管道；各自守卫方案否决维持）

## Product surface（file:line）

| Layer | Change |
|-------|--------|
| **新增** `apps/api/src/modules/commerce/payment-callback.controller.ts` | `@Controller('payment')` + `@Post('refund-callback')`（:18-27）· **无登录态**（不挂 PrincipalGuard，对齐 `commerce-webhook.controller.ts:4-7` 安全模型）· **薄适配**：body 白名单解构 `{orderId, providerTxn, sig}`（:22-25）→ 缺 orderId 400 `invalid_callback`（:26，先于 HMAC）→ 委托 `refundWebhook(orderId, {providerTxn, sig})`（:27）· 只传三字段 → 额外字段（含金额形）结构性丢弃 = 无金额通道 |
| `apps/api/src/app.module.ts` | 仅注册：import `:15` + controllers 数组插入 `PaymentCallbackController`（`:39`，插入式 · 既有控制器顺序/路径零变动） |
| `apps/api/src/modules/commerce/commerce.service.ts` | **零 diff**（refundWebhook :79-93 语义零改动 · payWebhook/payCallback 零触碰） |
| `packages/db/src/payment.ts` / migrations | **零 diff**（markOrderRefunded CAS/红冲语义零改动 · 零新迁移，0136 已在） |
| **新增** `apps/api/test/uc-e2e-011-refund-callback-adv.proof.ts` | ADV prove（七类 A1–A7 + 新鲜 INV + 跨入口一致性 X + Z 回归合取 ZREG） |
| `package.json` / `apps/api/package.json` / `scripts/run-e2e-isolated.mjs` | 注册 `uc011:refund-callback-adv:prove` 三层隔离壳（同 `uc014:webhook-adv:prove` 先例） |
| 冻结面 | Line V `uc-e2e-011-adv-refund-callback.proof.ts` · Line Z `uc-e2e-011-refund-callback-mouth.proof.ts` · `neg-commerce.proof.ts` · `full.e2e.ts` · SSOT（矩阵/backlog/checklist）——**全部零 diff（git status 实证）** |

## Prove CMD（三层隔离壳）

```
pnpm uc011:refund-callback-adv:prove
  = node scripts/run-e2e-isolated.mjs uc011:refund-callback-adv:prove:raw
  → pnpm -C apps/api prove:uc011-refund-callback-adv
  = node --import @swc-node/register/esm-register test/uc-e2e-011-refund-callback-adv.proof.ts
    （内部末段原样子进程运行 Line Z 冻结 proof：node --import @swc-node/register/esm-register
      test/uc-e2e-011-refund-callback-mouth.proof.ts · 断言零改动 · exit code 作 ZREG 合取项）
```

`PAY_PROVIDER_SECRET` 只经隔离壳/进程环境（`_neg-harness.boot()` 注入，沿 UC014/Z 先例）· 值不入树不入 receipt · 零 live 模型。

## Attempts 台账（C-V5 · 全记录 · Ban retry-to-green）

| # | 时间（CST） | CMD | EXIT | 归因 |
|---|------------|-----|------|------|
| 1 | 2026-10-06 ~10:41 | `pnpm uc011:refund-callback-adv:prove` | **1** | 68 条断言中唯一失败 = prove 自身 INV 结构扫描缺陷：`controller 源无 amount 字段引用` 裸子串扫描命中**注释**中的 `amountCents/units/refundAmount` 字样（产品行为正确：A1–A7+X+ZREG 全 PASS）。修复 = 断言实现改为剥注释后扫代码面（`/amount/i` on stripped source），断言意图（代码无金额通道）不变且更精确。非产品缺陷、非迁就产品弱点（A3 行为断言原样保留全绿）· Z 回归子进程已 41/41 EXIT=0 |
| 2 | 2026-10-06 ~10:52 | `pnpm uc011:refund-callback-adv:prove` | **0** | 68/68 全绿（A1–A7 + INV + X + ZREG）|
| 3 | 2026-10-06 ~10:55 | `pnpm uc011:refund-callback:prove`（Z mouth 独立完整三层壳回归） | **0** | 41/41 全绿 + `LOCAL_ISOLATED_PROOF_RECEIPT file=.tmp/isolated-proof-receipts/2026-10-06T02-55-28-294Z-85586-53491df1-ed4d-481b-accd-04876ec3521d.json` |

日志：`.tmp/prove-adv-attempt1.log` / `.tmp/prove-adv-attempt2.log` / `.tmp/prove-zreg.log` · 进度台账 `.tmp/v-progress.log`。

## ADV 七类逐类（主口 `POST /payment/refund-callback` · attempt#2 全绿）

| id | 注入 | 观察（exact status + named code + DB 快照） | 结果 |
|----|------|---------------------------------------------|------|
| **A1 伪造签名** | 等长错签 / 垃圾短签 / 他单签名 / pay 标签签名（合法单+合法 txn） | 403 `bad_signature` ×4 · 零副作用：status 仍 paid · refund_provider_txn NULL · 桶快照不变 · txn 全局 0 行 | ALL PASS |
| **A2 缺字段（C-V1 逐字段）** | 空 body / 缺 orderId（有 txn+sig）/ 缺 providerTxn / 缺 sig / 仅 sig | 400 `invalid_callback` ×5 · **缺 orderId 400 而非 403（400 判定先于 HMAC，对齐 ：80→:84 现序）** · 零副作用快照 | ALL PASS |
| **A3 夹带金额 DISCLOSED** | body 夹带 `amountCents:1` / `units:999999` / `refundAmount:-500` / `amount:1e9` | **DISCLOSED（结构性）**：字段被白名单丢弃 → 200 `{result:'refunded'}` · 红冲恒等于服务器权威 units=10（夹带值未入通道）· 订单落库 10/9900 不变 · txn 恰 1 行。**显式服务端金额复核比较路径今天不存在，当前保障=结构性（body 白名单无金额通道+服务器权威 units 红冲）；Ban 改口「已实现金额复核」** | ALL PASS |
| **A4 同单重放** | 合法回调首打 + 同单同 txn 重放（快照 before/after-first/after-replay 落日志） | 首 200 `{result:'refunded'}` → 次 200 `{result:'already'}` · **无双退**：avail 恰 −10 一次、units_total 恰 −10 一次、mid==after 快照二致、`refund_provider_txn` 全局恰 1 行（C-V2） | ALL PASS |
| **A5 跨订单 409** | 同 providerTxn 打两张不同订单（两 owner） | 恰一单 `refunded` · 另一单 **409 `order_conflict`（非 5xx）** · `refund_provider_txn` 恰 1 行 · 两账户合计红冲恰一份（A avail −10 · B 快照不变） | ALL PASS |
| **A6 并发恰一次** | `Promise.all` 并发同单同 txn 双回调（快照 before/after 落日志） | 无 5xx · 恰一个 `refunded` + 恰一个 `already` · 无 stuck 终态：status=refunded · txn=注入值 · avail 恰 −10 一次 · txn 全局恰 1 行 | ALL PASS |
| **A7 未知单/冒充 owner** | 幽灵单（合法签名）+ body 夹带 `owner`/`owner_user_id` 攻击者 | **404 具名 body `order_not_found`**（C-V3：与缺失口 404 走具名响应体区分——真口 404.body.error=`order_not_found` vs 缺失口 `POST /payment/definitely-not-a-mouth` 404 无此具名码）· 幽灵单不落库 · txn 0 行 · 冒充字段被丢弃 → 200 refunded 归真 owner · 攻击者 0 桶 | ALL PASS |

## 新鲜 INV（C-V4 · 取代过时 old-INV · 不改 Line V/Z 历史文件）

- 主口已挂载（非 404）：合法单垃圾签 → 403 `bad_signature`（≠ Fastify 兜底裸 404）
- scenarios 字面路径钉死：`@Controller('payment')` + `@Post('refund-callback')` = `POST /payment/refund-callback`
- 管道存在且单管道：service 含 `refundWebhook` · db 含 `markOrderRefunded` · **controller 委托 refundWebhook 且无 `createHmac`/`timingSafeEqual`/`gateway_payment_order_owner`/`markOrderRefunded`（Ban 复制第二套 HMAC/owner/CAS）**
- 注册形态钉死（独立文件 vs 并入，由 prove 钉）：独立 `payment-callback.controller.ts` + `app.module.ts` 注册 `PaymentCallbackController`（未复述 harness 中「全部控制器在 app.module.ts:38 注册」欠精确句）
- 具名码表与实现一致：由 A1–A7/X 全部 exact status + named code 断言 collectively 证明

## 跨入口一致性（model-op C-1）

- **同刺激具名码逐项一致**（主口 vs Path A）：空 body → 双 400 `invalid_callback` · 垃圾签 → 双 403 `bad_signature` · 未知单 → 双 404 `order_not_found` · 跨单同流水 → 双 409 `order_conflict`（同一 CAS 键）
- **跨入口重放（≥1 · 双方向均做）**：dir1 Path A 首退 → 主口重放 `already`（avail 恰 −10 · txn 恰 1 行）；dir2 主口首退 → Path A 重放 `already`（同）。200 形态同码同形（`{result: refunded|already}`）

## Z mouth 回归（EXIT0 必要合取项 · mw-e2e-ha §3 裁决）

- ADV prove 内合取：ZREG 断言 = Line Z 冻结 proof 原样子进程运行 **EXIT=0**（41/41）→ PASS
- 独立完整三层壳复验：`pnpm uc011:refund-callback:prove` **EXIT=0**（41/41 · attempt#3）
- `uc-e2e-011-refund-callback-mouth.proof.ts` 断言**零改动**（git 零 diff 实证）· Path A 不回退

## C-V1~V6 + C-1~C-5 自评

| 条件 | 自评 | 依据 |
|------|------|------|
| C-V1 body 契约钉死 + 逐字段 400 | **满足** | A2 五断言逐字段（含缺 orderId/空 body）+ A3 夹带忽略 + INV 白名单结构断言 |
| C-V2 A4/A6 DB 快照 + 跨口重放 | **满足** | A4/A6 SNAPSHOT 落日志（before/after-first/after-replay）· txn 恰 1 行 · 红冲恰一次；跨口重放双方向（X 段） |
| C-V3 404 具名区分 | **满足** | A7：真口 404 body `order_not_found` vs 缺失口 404 无此具名码（具名响应体断言，非只断 status） |
| C-V4 新鲜 INV + 注册形态 | **满足** | INV 段六断言；注册形态=独立文件+app.module 注册；未复述欠精确句 |
| C-V5 attempts 台账 | **满足** | 上表 3 attempts 全记录含时间戳与归因；attempt#1 未删改 |
| C-V6 密钥面 | **满足** | `PAY_PROVIDER_SECRET` 只经隔离壳/进程环境；不加默认值、不入树不入 receipt；主口零新增 env plumbing |
| C-1 两入口一致性机检 | **满足** | X 段：400/403/404/409 同刺激同码同形 + 双方向跨口重放 `already`（未缺席，无需披露缺席） |
| C-2 主口 body 白名单 | **满足** | controller 只读三字段且只传三字段；A3 金额形字段结构性丢弃；非金额通道 |
| C-3 挂载面最小 diff | **满足** | app.module 仅插入注册（既有顺序/路径零变动）；service 零 diff（无需薄 overload——orderId 存在性校验在 controller 层，契约对齐「controller 只解析/校验 HTTP」）；refundWebhook 语义零改动 |
| C-4 密钥面 | **满足** | 同 C-V6 |
| C-5 attempts 台账 | **满足** | 同 C-V5 |

## HONESTY

- **EXIT0 ≠ covered** · UC-011 stays **partial** · coveredCount=**8** · `GAP-UC011-ADV-01` stays **OPEN** · ADV stays gap/case-only
- 主口浮出后「主口 404」GAP 叙事与「ADV INV 过时」叙事**停用**（PREREQ-6 同型静态废止）；改引本 prove 新鲜 INV
- Line V honesty-of-red nail（`79825b2`）与 Line Z mouth nail（`244b812`）**历史保留原样**，未被推翻、未洗绿
- 审计 residual：主口+管道产品路径 GuardrailHit/安全日志 emit 点 **absent**（AUDIT-OBSERVATION: absent · disclosed-not-blocking · 非 EXIT 门槛 · Ban 假称已接）
- Ban self-nail · post-prove 双审由协调方另派（alone ≠ dual）· coveredCount 翻行/covered-lift 须协调方 nail · 禁 push

## Non-claims

Not covered · not UC-011 flip · not ADV flip · not GAP closed · not §1.1 covered · not HA · not releaseEvidence · not nail · EXIT0 ≠ covered · Line Z nail ≠ 本刀 · Line V nail 历史地位不变 · alone ≠ dual

---

*Receipt · GAP-UC011-ADV-01 · Line V · main mouth wiring · 2026-10-06 · coding+prove done EXIT=0 · STOP — awaiting post-prove dual*
