# REQUEST — **GAP-UC011-ADV-01 · main mouth wiring + ADV** · pre-exec · mw-model-op

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Expert**: `mw-model-op`（commerce/支付域）
**Knife**: `harness/gap-uc011-adv-main-mouth-wiring.md` · slice `gap-uc011-adv-main-mouth-wiring.slice.md`
**Parent tip**: `6b878da`（full `6b878dad09ac77c8b248dd27c13cb38a670f4dad` · feat/mysql-schema-skeleton = origin tip）
**Date**: 2026-10-05

## Pins（retained · 本 stub 不改）

| Pin | Value |
|-----|-------|
| `haStatus` | **NOT_HA** |
| `releaseEvidence` | **false** |
| `claimProductionHA` | **false** |
| `gR45Closed` | **true** |
| `coveredCount` | **8** |
| `ms3EqualsR4Closed` | **false** |
| Stack | **PG-retained** |
| Public DELETE | **503**（stays） |

## 请审什么（mw-model-op · 计费/回调/支付域 · 零模型调用边界）

Line V · `GAP-UC011-ADV-01` 主口真接线 + ADV 证据（协调方优先级 #1）。Z 线 `a356d66` 只钉了 Path A mouth（CODE `bf1fdb2` · EXIT0≠covered）；主口 `POST /payment/refund-callback` 仍 404（本树读码 = 路由缺失 · 非 guard 关闭）；ADV INV 过时。请审：

1. **管道共用与安全模型（支付域焦点）**：主口薄适配 + 委托 `refundWebhook` **同一管道**（HMAC `${id}:${txn}:refunded` fail-closed · `gateway_payment_order_owner` owner-gateway · `markOrderRefunded` CAS + `refund_provider_txn` NOT EXISTS + 23505→409 + FIFO 红冲）——推荐共用管道、否决各自守卫（复制 HMAC/owner/CAS = 安全关键重复面），交你裁；Ban 挂 PrincipalGuard；Ban 从 providerTxn 反查单弱化签名↔订单绑定；Ban 改 payWebhook/payCallback/refundWebhook 既有语义；Ban 借口改其他 commerce 路径。
2. **七类 ADV 攻击面覆盖**：403/400/DISCLOSED/`already` 无双退/409 跨订单/并发恰一次/404 未知单——断言须机检 exact status + named code + DB before/after 快照（含红冲恰一次、`refund_provider_txn` 恰 1 行）；A3 夹带金额须如实 DISCLOSED（无金额通道 = 结构性，Ban 改口「已实现金额复核」）。
3. **EXIT0 ≠ covered**：EXIT0 ≠ ADV 翻行 ≠ 关 `GAP-UC011-ADV-01` ≠ §1.1 covered；EXIT1 保留 OPEN · attempts 全记录 · Ban retry-to-green；审计 residual（GuardrailHit absent）disclosed-not-blocking（K/UC014 口径）。
4. **历史证据边界**：Line V（`79825b2`）/ Line Z（`244b812`）nail 历史保留 · Ban 重写；**禁把 Z mouth EXIT0 洗成 covered**；Z mouth 回归须保持 EXIT 0。
5. **零模型调用**：本刀为支付回调主口接线 + ADV prove，实现/prove 不调 live 模型；model-op 审预算面零影响 + **Ban 借刀改 model-client**；计费域关注 paid→refunded CAS / exactly-once / 无双退不因主口第二入口破坏（两入口打到同一 CAS 键）。
6. **边界**：Ban coding product/prove 本 stub；Ban 碰 UC-018/052/025/004/014/026/002；Ban SSOT edit；Ban live；Ban secrets/`.env*`；Ban self-approve（alone ≠ dual）。

Row `UC-E2E-011` stays **partial** · ADV stays **gap/case-only** · `GAP-UC011-ADV-01` stays **OPEN**（本刀不预 claim 关闭）· Ban covered. Dual PASS ≠ coding ≠ prove ≠ nail.

---

*Stub · awaiting expert pre-exec dual · STOP*

---

# PRE-EXEC DUAL REVIEW — **mw-model-op**（commerce/支付域 · Line V · GAP-UC011-ADV-01 main mouth wiring）

**Status**: **pre_exec_dual_pass**（mw-model-op 单签 · **alone ≠ dual** · 不代签 mw-e2e-ha · 本签 ≠ coding 授权 ≠ prove 授权 ≠ nail · 协调方凭双签授权）
**Reviewed REQUEST commit**: `d58b05b`（full `d58b05bf56ab33efd3312786e3958302bdb923c5` · origin tip · 本审 worktree `/Users/miaole/Desktop/golucky/meetwise-rv-v-model-op` · branch `rv/v-model-op`）
**Date**: 2026-10-02 · **Reviewer**: `mw-model-op` · **Ban self-approve**（implementer = mw-core，非本人）

## 0. 事实核（可复现证据 · 本树 `d58b05bf` 只读）

- **docs-only**：`git diff-tree d58b05bf` 恰 4 文件全 `.md`（slice / harness / 两 stub · 均 `ai-docs/delivery/`），零代码/零脚本/零迁移/零 SSOT（矩阵 `e2e-requirement-coverage-matrix.md`、`gap-bug-backlog.md`、`execution-master-checklist.md` 本 commit 零 diff）；`git merge-base --is-ancestor d58b05bf origin/feat/mysql-schema-skeleton` = true（origin tip）。
- **主口 404 = 路由缺失（非 guard 关闭）**：`app.module.ts:38` controllers 清单无 payment 控制器；`grep -rn "@Controller(" apps/api/src | grep -Ei "payment|wallet"` 零命中；`CommerceWebhookController` 头注（`commerce-webhook.controller.ts:4-7`）明示「独立无登录态控制器……鉴权靠 HMAC 验签（service 内 fail-closed）+ owner 从 DB 查」——harness 现状陈述逐条属实。
- **Z 线管道源码逐行核对（与 harness 合同表一致）**：`@Post('refund/:id')` @ `commerce-webhook.controller.ts:19-23` → `refundWebhook` @ `commerce.service.ts:79-93`：缺字段 400 `invalid_callback`（:80）→ HMAC `createHmac('sha256', secret).update(\`${id}:${providerTxn}:refunded\`)` + `timingSafeEqual`、`!secret` fail-closed 403 `bad_signature`（:81-84）→ owner 经 `gateway_payment_order_owner` 无表权限网关、查不到单 404 `order_not_found`（:85-88）→ `markOrderRefunded`（:89）→ 409 `order_conflict` / 200 `{result: refunded|already}`（:90-92）；body 仅 `{providerTxn, sig}` **无金额通道（DISCLOSED 结构性）**。
- **exactly-once CAS**：`markOrderRefunded` @ `packages/db/src/payment.ts:104`：SAVEPOINT `payment_refund_txn_claim` + `status='paid'` CAS + `NOT EXISTS (SELECT … refund_provider_txn=$3)` 跨单禁重 + 23505→`conflict` + FIFO 红冲 `entitlement_bucket`（可用额度不足 → ROLLBACK 恰一、无半退）；migration `0136_payment_order_refund_provider_txn.sql` 已在 → **零新迁移成立**。
- **old-INV 过时属实**：`uc-e2e-011-adv-refund-callback.proof.ts:86-94` 三条 INV（payment.ts 无 markOrderRefunded / webhook 无 refund 路由 / service 无 refundWebhook）在本树**全部已不再为真**；`:132` MOUTHS 含 `/payment/refund-callback`。harness「新鲜 INV 取代、不改旧文件」方案与「Ban 宣称 Line V nail 被推翻」边界正确。
- **Z mouth 回归硬门槛可执行**：root `package.json:134` `uc011:refund-callback:prove`（三层隔离壳）与 `apps/api/test/uc-e2e-011-refund-callback-mouth.proof.ts` 均在；Z proof 头部自钉「EXIT 0 ≠ covered · coveredCount=8 不变」。
- **零模型路径（结构性核）**：commerce 模块 import 仅 `node:crypto`/`@nestjs/common`/`@meetwise/db`/db.service；`grep -iE "model|openai|anthropic|llm|chat"` 于 `apps/api/src/modules/commerce/*.ts` 零命中；`payment.ts` 零 model/spend/cost/cny 引用 → 退款管道 = 纯 HMAC + owner-gateway + CAS + units 红冲，**无任何模型调用面**；`actualSpendCny` 全仓唯一写入点 `packages/ai-runtime/src/g7-freetier-reprove-guard.ts:329` 保持 `null`，本刀 file 清单不触碰 ai-runtime。
- **两本账分离（D1 口径沿 K/Z 线）**：退款红冲只碰 `payment_order` + `entitlement_bucket`（**units**）；计费账本在 `ai_cost_*`（reserve/settle microCny）——两账零交集，主口第二入口不引入任何金额/计费通道。

## 1. 审查检查表（model-op/支付域六维）

| # | 维度 | 结论 | 依据 |
|---|------|------|------|
| 1 | 零模型调用/零 live | **PASS** | 管道纯 HMAC+CAS（§0 结构核）；prove 走 `run-e2e-isolated.mjs` 真 api + 隔离 PG，零 live 模型；file 清单不含 model-client/ai-runtime → Ban 借刀改 model-client 可执行 |
| 2 | 两本账边界 | **PASS** | units 红冲 vs `ai_cost_*` 计费账本分离；A3 红冲单位恒等于产品定价（pack_10=10/pack_30=30）与 UC014 C3 口径（`gap-uc014-026-adv-webhook-nhp.md:41`「无金额通道=结构性双拦」）一致；A1/A2 零副作用快照 + A4 红冲恰一次/快照二致 + A5 `refund_provider_txn` 恰 1 行/两账户合计恰一份——账本净变 0 / 恰一份断言齐备 |
| 3 | 主口接线与 Path A 管道共用（交我裁） | **PASS · 裁 = 共用管道** | 推荐「薄 controller 适配 + 委托同一 `refundWebhook`」成立：签名仍绑定 order id（body `{orderId, providerTxn, sig}` 只改 id 来源 path→body，sig↔订单绑定不弱化）；复制 HMAC/owner/CAS 属安全关键重复面且两入口漂移不可机检 → **各自守卫方案否决维持**；两入口打到同一 CAS 键（`payment_order.id` + `refund_provider_txn` partial UNIQUE）→ 主口第二入口不能绕过 exactly-once/无双退；Ban 第三等价路径 / Ban 改 payWebhook/payCallback/refundWebhook 语义 / Ban 借口改其他 commerce 路径与价格簿（`PRODUCTS` @ `commerce.service.ts:11-14` 不动）已钉 |
| 4 | ADV 七类金额相关断言口径 | **PASS** | A3 DISCLOSED = 结构性无金额通道 + Ban 改口「已实现金额复核」，与 K 线 C3 原文一致，无口径漂移；Ban any-non-404-4xx-as-sig-evidence 沿用 B-1 pins |
| 5 | Pins 原值 / 行语义 | **PASS** | stub/harness/slice 三文件 pins 与矩阵 nail（`:117`/`:414`/backlog `:494`）逐项一致：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · DELETE=503；UC-011 stays partial · ADV stays gap/case-only · GAP-UC011-ADV-01 stays OPEN · **本 commit 零 SSOT diff 实证** |
| 6 | EXIT 契约/历史证据/诚实失败 | **PASS** | EXIT0 ≠ covered ≠ ADV 翻行 ≠ 关 gap ≠ §1.1 covered（Z proof 头部同口径自钉）；EXIT1 保留 OPEN + attempts 全记录 + Ban retry-to-green；audit residual（GuardrailHit absent）disclosed-not-blocking 不作 EXIT 门槛（UC014 harness `:33` 先例）；Line V `79825b2` / Line Z `244b812` 历史 nail 保留 Ban 重写；Z mouth 回归 EXIT0 硬门槛 + Ban 改其 proof |

## 2. Fail-trigger audit（触发即 FAIL 的红线 · 逐条查）

| 红线 | 触发？ |
|------|--------|
| 本 commit 含 coding/prove/脚本/migration | **未触发**（docs-only 4 .md 实证） |
| 本 commit 触 SSOT（矩阵/backlog/checklist） | **未触发**（零 diff） |
| 主口方案挂 PrincipalGuard / 登录态 | **未触发**（合同明示无登录态 + HMAC fail-closed + owner-gateway） |
| body-id 弱化签名↔订单绑定 / providerTxn 反查单 | **未触发**（HMAC 载荷仍 `${id}:${txn}:refunded`，合同明文 Ban） |
| 把 Z mouth EXIT0 洗成 covered / 预 claim 关 ADV / 翻 UC-011 | **未触发**（三文件 + EXIT 契约全钉 EXIT0≠covered · stays OPEN/partial） |
| 金额通道混入 / A3 改口金额复核 | **未触发**（DISCLOSED 结构性 + Ban 改口） |
| 零模型/live/secrets 边界 | **未触发**（PAY_PROVIDER_SECRET 只经隔离壳进程环境 · Ban `.env*` · Ban live） |
| 自批 / 代签 peer | **未触发**（本文 = mw-model-op 单签 pre-exec；mw-e2e-ha stub 未签，不代签） |

## 3. Blockers

**无**。未发现阻断 PRE-EXEC 授权的事实、口径或边界问题。

## 4. Conditions（C-* · 非阻断 · 进 coding/prove 阶段执行或披露）

- **C-1 两入口语义一致性机检**：ADV prove 须对同刺激断言主口与 Path A mouth 具名码逐项一致（400/403/404/409/200 同码同形）；并至少含一条**跨入口重放**（首退经任一入口、重放经另一入口 → `already` + 红冲恰一次）——此为 E3/A3 幂等标准在两入口共用管道上的直接应用，非新验收；若不做，receipt 须如实披露其缺席（disclosed-not-blocking，不翻 EXIT）。
- **C-2 主口 body 白名单**：controller 只读 `{orderId, providerTxn, sig}`；任何额外字段（含金额形字段）结构性忽略（A3 口径），新 body 形态不得成为金额通道；prove 钉死 body 形态。
- **C-3 挂载面最小 diff**：`app.module.ts` 若需改动仅限注册新控制器，不得变更任何既有控制器挂载顺序/路径；service 侧仅允许 body-id 薄 overload/适配，`refundWebhook` 现行 HMAC 标签/owner-gateway/CAS 语义零改动（改即 FAIL）。
- **C-4 密钥面**：`PAY_PROVIDER_SECRET` 只经隔离壳进程环境；不加默认值、不入树、不入 receipt；主口不新增任何 env plumbing。
- **C-5 attempts 台账**：prove 每次 attempt（含中断/失败）逐次记录 EXIT + 时间戳；EXIT1 明细（哪类哪断言未证 · file:line）落 receipt；Ban retry-to-green。

## 5. 摘要（中文三行）

1. `d58b05b` 实证 docs-only（4 个 .md、零 SSOT/代码/迁移），现状陈述（主口 404=路由缺失、old-INV 过时、Z 线管道 pins）经源码逐行核对全部属实；管道 = 纯 HMAC fail-closed + owner-gateway + exactly-once CAS + units 红冲，零模型调用面，`actualSpendCny=null` 不受影响，两本账（units vs `ai_cost_*`）零交集。
2. 裁定：主口薄适配 + 委托同一 `refundWebhook` 单管道（各自守卫方案否决）——签名↔订单绑定不弱化、两入口同 CAS 键保 exactly-once/无双退；ADV 七类 A1–A7 与 UC014 C1–C7 口径一致，A3 金额 DISCLOSED 结构性如实；Z mouth 回归 EXIT0 硬门槛可执行，历史 nail 保留不洗。
3. 无 Blockers；C-1 跨入口重放一致性机检等 5 条非阻断 Conditions 进 coding 阶段；EXIT0≠covered，UC-011 stays partial、ADV/gap stays OPEN、coveredCount=8，本签 alone ≠ dual 不代签 mw-e2e-ha。

Verdict: PASS

---

# POST-PROVE DUAL REVIEW — **mw-model-op**（commerce/支付域 · Line V · GAP-UC011-ADV-01 main mouth wiring · POST-PROVE）

**Status**: **post_prove_dual_pass**（mw-model-op 单签 · **alone ≠ dual** · 不代签 mw-e2e-ha · 本签 ≠ covered ≠ nail · 协调方凭双签定夺）
**Reviewed package**: `line/v-uc011-adv-main-mouth` @ `cf34390`（full `cf343900c441d3f7e800cabd1fe2944e4c81fd4d`；feat tip `2535b319` + prove receipt；PRE_DUAL base `920aee22`）
**Review worktree**: `/Users/miaole/Desktop/golucky/meetwise-rv-vp-model-op`（branch `rv/vp-model-op` · 本 commit 后禁 push）
**Date**: 2026-10-02 · **Reviewer**: `mw-model-op` · **Ban self-approve**（implementer = mw-core，非本人）

## 0. 包完整性（可复现证据 · `git diff 920aee22..cf34390`）

- **恰 6+1 文件**：`--name-status` = A `payment-callback.controller.ts` · A `uc-e2e-011-refund-callback-adv.proof.ts` · M `app.module.ts` · M `apps/api/package.json` · M `package.json` · M `scripts/run-e2e-isolated.mjs` + A prove receipt `2026-10-06-gap-uc011-adv-main-mouth-wiring-prove.md`。无其他。
- **管道语义零改动（红线实证）**：`git diff 920aee22..cf34390 -- apps/api/src/modules/commerce/commerce.service.ts apps/api/src/modules/commerce/commerce-webhook.controller.ts` = **0 行**；`packages/db/src/payment.ts` 含于冻结面 diff = **0 行**——`refundWebhook`/`markOrderRefunded`（HMAC 标签/owner-gateway/CAS/23505→409/FIFO 红冲）逐字节原样，model-op C-3「改即 FAIL」红线未触发。薄适配成立：controller 源码逐行核对 = 白名单解构 `{orderId,providerTxn,sig}`（:27-29）→ 缺 orderId 400 `invalid_callback`（:30，先于 HMAC）→ 委托同一 `refundWebhook`（:31），无 `createHmac`/`timingSafeEqual`/`gateway_payment_order_owner`/`markOrderRefunded`/`amount` 代码面引用（剥注释后核）。
- **`app.module.ts` 仅插注册**：1 行 import + controllers 数组插入 `PaymentCallbackController`（既有控制器顺序/路径零变动）；三层壳注册逐行核对为纯增量（root `package.json` +2 行、`apps/api/package.json` +1 行、`run-e2e-isolated.mjs` 白名单 +1 项与 `isolatedCommand` +2 行分支）。
- **零模型调用/零 live（结构性核）**：退款管道 = 纯 HMAC + CAS + units 红冲；ADV proof 无任何模型引用面；`_neg-harness.boot()` 显式 `delete MODEL_API_KEY/MODEL_BASE_URL`（负路径不触付费 provider）；`packages/ai-runtime` 本包 diff = **0 行** → `actualSpendCny`（全仓唯一写入点 `g7-freetier-reprove-guard.ts:329`）保持 `null` 不受影响。
- **SSOT/冻结面零 diff**：矩阵/backlog/checklist + Line V `uc-e2e-011-adv-refund-callback.proof.ts` + Line Z `uc-e2e-011-refund-callback-mouth.proof.ts` + `_neg-harness.ts` = **0 行**；worktree `git status` 干净（prove 产物不入树）。

## 1. Fresh re-run（本审独立复跑 · 恰一次 · 禁重试遵守）

| 步骤 | 命令 | EXIT | 结果 |
|------|------|------|------|
| 1 | `pnpm install --frozen-lockfile` | **0** | 10.5s，lockfile 冻结无改动 |
| 2 | `pnpm uc011:refund-callback-adv:prove`（三层隔离壳 · **恰一次**） | **0** | **68/68 全绿**（INV + A1–A7 + X + ZREG 全类 ALL PASS）；末段子进程原样运行 Line Z 冻结 proof **41/41 EXIT=0**；全日志 PASS 109 条 / FAIL 0 条（68+41） |

- 复跑日志留档 `/tmp/mw-vp-model-op-prove.log`；`AUDIT-OBSERVATION: absent` ×5（GuardrailHit/audit-log/security-log emit 点 0 处 · disclosed-not-blocking · 具名 residual 如实带进本审）。
- receipt attempts 台账（#1 EXIT=1 → #2 EXIT=0 → #3 Z 独立壳 EXIT=0）与 prove 侧修复叙事（INV 裸子串扫描误伤注释 `amountCents/units/refundAmount` 字样 → 改剥注释后扫代码面 `/amount/i`，断言意图不变更精确、产品零触碰、A3 行为断言原样保留）与本树代码现状互证成立：现有注释仍含 amount 字样、代码面无——attempt#1 必然复现失败，#2 必然通过。**非 retry-to-green**（代码变更 + 归因披露 + 断言保留，非改产品迁就/重跑洗白），C-5/C-V5 台账未裁剪。

## 2. C-1 跨入口一致性裁决（本审核心 · 真实达成，非缺席披露）

**裁决：真实达成（MET）**。两层证据：

1. **结构性（代码面）**：主口缺 orderId 校验后原样委托同一 `refundWebhook` 单管道 → 403/404/409/200 形态在两入口**按构造一致**；唯一新增 400 分支（缺 orderId）复用同名码 `invalid_callback` 同形 `{error}`，先于 HMAC 的顺序与 service :80 既有顺序对齐。
2. **机检（fresh re-run X 段全绿，逐条 PASS）**：
   - 同刺激具名码逐项一致：空 body → 双 400 `invalid_callback`；垃圾签 → 双 403 `bad_signature`；未知单 → 双 404 `order_not_found`；跨单同流水 → 主口 409（A5 w2）= Path A 409（X cP）`order_conflict` 同一 CAS 键；
   - 跨口重放**双方向均做**（超出 C-1 ≥1 下限）：dir1 Path A 首退 200 `refunded` → 主口重放 200 `already`（avail 恰 −10 · txn 全局恰 1 行）；dir2 主口首退 → Path A 重放 `already`（同）；
   - 200 同码同形 `{result: refunded|already}` 两入口断言齐备（A4 主口 + X dir1/dir2 Path A 侧 + ZREG 41/41 原样回归）。

实现方声称「未缺席」**属实**：X 段断言存在于 proof 源码（:397-444）且 fresh re-run 逐条 PASS，无需走「披露缺席」降级路径。

## 3. 两本账（A4/A6 · D1 口径沿 K/Z · fresh re-run 快照实录）

- **A4 顺序重放**：快照 before `{buckets:1,sum:10,avail:10,order:paid}` → after-first `{sum:0,avail:0,refunded}` → after-replay **逐字段二致**；首 200 `refunded` / 次 200 `already`；`refund_provider_txn` 全局恰 1 行（C-V2）。
- **A6 并发恰一次**：`Promise.all` 双回调无 5xx、恰 1 个 `refunded` + 恰 1 个 `already`（CAS 裁决）；after 快照 `{sum:0,avail:0,refunded}` · avail 恰 −10 一次 · txn 恰 1 行 · 无 stuck 终态。
- **账本净变断言保留**：拒绝类（A1/A2/A7 幽灵）`eqSnap` before/after 桶/合计/可用三恒等 + status/refund_provider_txn 零变；units 红冲账（`payment_order`+`entitlement_bucket`）与计费账（`ai_cost_*` microCny）零交集，主口第二入口不引入金额/计费通道；`actualSpendCny=null` 不受影响（§0 ai-runtime 0 diff）。

## 4. 条件裁决（model-op C-1~C-5 + e2e-ha C-V1~V6 · 逐条）

| 条件 | 裁决 | 依据（fresh re-run / 本树实证） |
|------|------|------|
| **C-1** 两入口一致性机检（同码同形 + 跨口重放） | **MET** | §2：X 段 400/403/404/409 全绿 + 双方向跨口重放 already + 红冲恰一次；单管道结构一致 |
| **C-2** 主口 body 白名单 `{orderId,providerTxn,sig}` | **MET** | controller 只读三字段只传三字段（:27-31）；A3 夹带 `amountCents/units/refundAmount/amount` 结构性丢弃 → 红冲恒等于权威 units=10；INV 剥注释扫代码面无 amount 引用；非金额通道 |
| **C-3** 挂载面最小 diff · service 语义零改动 | **MET** | app.module 仅插入注册（§0）；service/webhook/payment.ts 全 0 diff——`refundWebhook` HMAC 标签/owner-gateway/CAS 语义逐字节原样；红线未触发 |
| **C-4** 密钥面（只经隔离壳进程环境） | **MET** | `PAY_PROVIDER_SECRET` 仅经 `boot()` process.env 注入（树内 `PAY_SECRET` 常量为既有 harness fixture，本包 0 diff）；无新增默认值/env plumbing；receipt 无密钥值 |
| **C-5** attempts 台账全记录 · Ban retry-to-green | **MET** | 3 attempts 带时间戳+EXIT+归因；EXIT1 明细（哪断言/file:line）落 receipt；#1→#2 为 prove 侧披露修复非洗白（§1）；本审复跑恰一次遵守禁重试 |
| **C-V1** body 契约钉死 + 逐字段 400 | **MET** | A2 五断言（空 body/缺 orderId/缺 providerTxn/缺 sig/仅 sig）全 400 `invalid_callback`；缺 orderId 400 先于 HMAC（非 403）经 :30 与 :80 现序实证 |
| **C-V2** A4/A6 DB 快照 + txn 恰 1 行 + 红冲恰一单 | **MET** | §3 快照实录落日志；跨口重放作强化断言已做（超 C-V2「非 EXIT 要求」下限） |
| **C-V3** 404 具名响应体区分（非只断 status） | **MET** | A7：真口 404.body.error=`order_not_found` vs 缺失口 `POST /payment/definitely-not-a-mouth` 404 无具名码，双断言在 proof :374-377 |
| **C-V4** 新鲜 INV：字面路径挂载非 404 + 具名码表一致 + 注册形态钉死 | **MET** | INV 探针合法单垃圾签 → 403（≠裸 404）；`@Controller('payment')+@Post('refund-callback')` = MAIN 字面路径全类 exact status 断言 collectively 证具名码表；注册形态=独立文件+app.module 注册；未复述「全部控制器在 app.module.ts:38」欠精确句 |
| **C-V5** Z 回归任何 EXIT1 入台账 · 不裁剪 | **MET** | 无 Z 回归 EXIT1 发生（attempt#1 时 ZREG 子进程已 41/41 EXIT=0 · attempt#3 独立壳 41/41）；3 attempts 无裁剪 |
| **C-V6** `PAY_PROVIDER_SECRET` 不入树不入 receipt | **MET** | 同 C-4；receipt/proof 无密钥值 |

## 5. Fail-trigger 红线复查（POST-PROVE 侧）

- 管道语义改动 / 复制第二套守卫 / providerTxn 反查单 / PrincipalGuard 挂载：**均未触发**（§0 逐行实证）。
- Z mouth EXIT0 洗成 covered / 翻 UC-011 / 预 claim 关 GAP / coveredCount 变动：**未触发**（receipt + proof HONESTY 双钉 EXIT0≠covered · stays partial/OPEN · coveredCount=8；fresh re-run 尾部 HONESTY 行原样输出）。
- Line V `79825b2` / Line Z `244b812` 历史 nail：**保留原样未重写**（冻结面 0 diff）。
- 审计 residual：`AUDIT-OBSERVATION: absent`（主口+管道 0 个 GuardrailHit/审计 emit 点）——**如实具名 residual「审计后置未接线」，disclosed-not-blocking，Ban 假称已接**。

## 6. Blockers

**无**。未发现阻断 POST-PROVE dual 的事实、口径或边界问题。

## 7. Conditions（非阻断 · 留存）

- **N-1** EXIT0 ≠ covered ≠ ADV 翻行 ≠ 关 `GAP-UC011-ADV-01` ≠ §1.1 covered；coveredCount=8 / UC-011 partial / ADV gap/case-only / gap OPEN 的任何翻行须经协调方独立 nail（本签不构成）。
- **N-2** 审计 residual「主口+管道 GuardrailHit/安全日志/审计落库 emit 点 absent」保持具名披露（K/UC014 口径），后续接线另刀。
- **N-3** 本审为 POST-PROVE dual 之 mw-model-op 半签；mw-e2e-ha 侧裁决由其独立作出，**alone ≠ dual，本签不代签、不预设其结论**。

## 8. 摘要（中文三行）

1. `cf34390` 包完整性实证：恰 6+1 文件，`refundWebhook`/`markOrderRefunded` 管道零 diff（红线未触发），app.module 仅插注册，SSOT/冻结面/`_neg-harness` 全 0 diff，零模型调用零 live，`actualSpendCny=null` 不受影响，两本账零交集。
2. fresh re-run 恰一次 `pnpm uc011:refund-callback-adv:prove` EXIT=0：68/68 全绿 + ZREG 原样 41/41；C-1 跨入口一致性**真实达成**——400/403/404/409 同刺激同码同形 + 双方向跨口重放 `already` + 红冲恰一次；A4/A6 快照实录红冲恰一单、txn 恰 1 行；attempt#1 EXIT=1 为 prove 侧扫描缺陷已披露修复，非 retry-to-green。
3. model-op C-1~C-5 与 e2e-ha C-V1~V6 共 11 条逐条 MET，无 Blockers；EXIT0≠covered，UC-011 stays partial、`GAP-UC011-ADV-01` stays OPEN、coveredCount=8，本签 alone ≠ dual 不代签 mw-e2e-ha，禁 push。

Verdict: PASS
