# Harness — **GAP-UC011-ADV-01 · 主口真接线 + ADV 证据**（Line V · docs REQUEST · **`draft:awaiting_pre_exec_dual`** · Ban coding · Ban prove · Ban push · Ban self-approve）

**Status**: **`draft:awaiting_pre_exec_dual`**（L0 docs REQUEST only · Ban coding · Ban prove 执行 · Ban push · Ban self-approve · alone ≠ dual · 本 commit 不是 coding 授权也不是 prove · pre-exec 双审 PASS 后由协调方授权 coding）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Date**: 2026-10-05
**Base / parent tip**: `feat/mysql-schema-skeleton` **`6b878da`** / full `6b878dad09ac77c8b248dd27c13cb38a670f4dad`（本地 HEAD = origin tip · `git fetch origin` EXIT=0 无新对象 · worktree `/Users/miaole/Desktop/golucky/meetwise-line-v` · branch `line/v-uc011-adv-main-mouth`）
**Knife**: **GAP-UC011-ADV-01 · scenarios 主口 `POST /payment/refund-callback` 真接线 + 主口 ADV 七类真证据**（协调方优先级 #1 · Z 线 `a356d66` 只钉了 Path A mouth · CODE `bf1fdb2` · **EXIT0≠covered · 主口仍 404 · ADV INV 过时 = 本刀**）
**Gap id**: **`GAP-UC011-ADV-01`**（stays OPEN · Line V nail 明示 · 本刀求真证据，**不预 claim 关闭**）
**Case id**: **GAP-UC011-ADV-01 main-mouth wiring**（主口 + ADV；非重开 Line V honesty-of-red nail）
**Row**: **`UC-E2E-011`** · not UC-E2E-018 · not UC-E2E-052 · not UC-E2E-025 · not UC-E2E-004 · not UC-E2E-014/026 · not UC-E2E-002
**Experts**: `mw-e2e-ha` + `mw-model-op`（commerce/支付域 · stubs PENDING · Ban self-approve · alone ≠ dual）
**Authority**: meetwise — docs REQUEST only · Ban secrets / `.env*` · Ban force-push · Ban push · Ban SSOT edit · Ban coding product · Ban prove 执行（pre-exec dual PASS 后由协调方授权）

## 现状如实陈述（先读证据 · 行号按本树 `6b878da`）

**主口 404 原因 = 路由缺失，非 guard 关闭**：

- 全仓 `apps/api/src` **无任何绑定 `/payment/*` 的控制器**（grep `@Controller(` 对 `payment|wallet` 零命中）；全部 HTTP 控制器在 `app.module.ts:38` 显式注册，清单中无 payment 控制器 → `POST /payment/refund-callback` 落 Fastify 兜底 **404 = 口不存在**。
- **非 guard 关闭**：同类回调口 `CommerceWebhookController`（`commerce-webhook.controller.ts:8`）**本来就无 PrincipalGuard**——头注明示「独立无登录态控制器……鉴权靠 HMAC 验签（service 内 fail-closed）+ owner 从 DB 查」。主口缺 = 纯路由缺失；接线方案必须沿用同一安全模型（无登录态 + HMAC fail-closed），**Ban** 挂 PrincipalGuard 冒充「接线」。
- Line V ADV probe（`apps/api/test/uc-e2e-011-adv-refund-callback.proof.ts:132`）实测 `/payment/refund-callback` 404，H4（`harness/uc-e2e-011-report-refund.md:37`）三口 404 一致。

**Z 线 Path A mouth 已落（不回退、不重写）**：

- `POST /commerce/webhook/refund/:id` @ `commerce-webhook.controller.ts:19-23` → `CommerceService.refundWebhook` @ `commerce.service.ts:79-93`：缺字段 **400 `invalid_callback`**（:80）→ HMAC `${id}:${providerTxn}:refunded` + `timingSafeEqual`、密钥缺失 fail-closed **403 `bad_signature`**（:81-84）→ owner 由无表权限网关函数 `gateway_payment_order_owner` 读取、查不到单 **404 `order_not_found`**（:85-88）→ **exactly-once CAS** `markOrderRefunded`（:89）→ **409 `order_conflict`** / **200 `{result: refunded|already}`**（:90-92）。
- `markOrderRefunded` @ `packages/db/src/payment.ts:104`：SAVEPOINT + `status='paid'` CAS + `refund_provider_txn` NOT EXISTS 防重（23505→conflict）+ FIFO 红冲 entitlement bucket；migration `0136_payment_order_refund_provider_txn.sql` 已落。
- Line Z NAIL（`a356d66`）：prove tip `244b812` · CODE `bf1fdb2` · REQUEST `54b2058` · `pnpm uc011:refund-callback:prove` **EXIT=0 · 41/41** · post dual `938adee`+`ef980e3` BOTH PASS · **EXIT0≠covered · UC-011 stays partial · coveredCount=8 · ADV OPEN**。

**ADV INV 过时（本刀必须以新 prove 覆盖）**：

- `apps/api/test/uc-e2e-011-adv-refund-callback.proof.ts:86-94` Line V INV 三条断言——「payment.ts 无 markOrderRefunded」「webhook 仅 pay/:id 无 refund 路由」「commerce.service 无 refundCallback/refundWebhook」——在 Z 线 CODE `bf1fdb2` 落地后**全部不再为真**；`uc011:adv:prove` 今日重跑将不再复现 Line V 的 5/5 INV 形态。
- Line V NAIL（tip `79825b2` · `pnpm uc011:adv:prove` EXIT 1 · honesty-of-red · 三口 404 · A1/A2 UNREACHABLE）= **历史证据保留原样**（其断言在其 nailed tip 上成立）；本刀 **Ban 重写/删除该 proof 文件与该 nail**；过时 INV 由本刀新 ADV prove 的**新鲜 INV**（口已挂载 + 具名码 + 管道存在）取代作证据，old-INV 语义「产品口未落」已由 Z 线事实 superseded——**Ban** 借此宣称 Line V nail 被「推翻」或「洗绿」。

**结论**：主口 = 路由缺失（可接线）；ADV 七类在主口/等价口上的真证据 = 缺（主口 404 使伪造签名/重放/跨订单攻击面在 scenarios 字面契约口上不可达；Z mouth 仅钉了 Path A 的 M1/M2/400/403/404 基线，未铺满七类）。本刀求：**主口真接线 + 主口 ADV 七类 prove + Z mouth 回归**的 docs REQUEST 授权。本 turn **零代码、零 prove**。

## Quoted from the files

- `e2e-scenarios.md`（`requirements/use-cases/`）UC-E2E-011：E3 退款幂等「退款回调重复 → 幂等键 ON CONFLICT DO NOTHING → 仅退一次」（`:248`）；验收 A3「重复退款回调仅退一次」（`:251`）；契约 **`POST /payment/refund-callback`**、`GET /wallet`（`:253`）；TC-E2E-011-refund-idem（`:258`）。
- 矩阵 `e2e-requirement-coverage-matrix.md:117` row `UC-E2E-011`：NEG partial · FAULT partial · BOUND partial · **ADV gap/`case-only`**；读法明示「主口 `/payment/refund-callback` **仍 404** · Path A 等价口已落 · 主口 404 / ADV INV 过时 = **后续刀** · 行状态不动仍 partial」。
- `gap-bug-backlog.md` Line Z NAIL 段：Residual「scenarios 主口 `POST /payment/refund-callback` **仍 404** · ADV INV 过时 = **后续刀** · Ban 顺手洗绿」；`GAP-UC011-ADV-01` stays **OPEN**。
- `harness/uc-e2e-011-report-refund.md:37`（H4）三口 404；`:69` §1b#1 refund-callback 产品口 = 抬 covered 前置。
- UC014 先例 `harness/gap-uc014-026-adv-webhook-nhp.md`：七类注入表 C1–C7 + 三层隔离壳 + 审计后置 GuardrailHit **disclosed-not-blocking**（`AUDIT-OBSERVATION: absent` · 非 EXIT 门槛）。

## 主口接线方案（本刀合同 · 授权后才写码 · 本 commit 不写）

### 合同（锚定 scenarios `:253` 原文 · 非发明）

| 项 | 合同 |
|----|------|
| HTTP 口 | **`POST /payment/refund-callback`** 字面落地（scenarios 契约名 · 口已挂载 ≠ 404）。**Ban 借口改其他 commerce 路径**：本刀靶就是主口本身；Z 线已用「等价 webhook」口径落了 Path A mouth，本刀不得再发明第三个等价路径冒充主口 |
| 无 path id 的契约差异 | scenarios 主口**无 `:id` 段**；现管道 HMAC 载荷 `${id}:${providerTxn}:refunded` 绑定订单 id。**拟**：主口 body 携带 `{ orderId, providerTxn, sig }`（缺任一 → **400 `invalid_callback`**），controller 解出 id 后**委托同一 `refundWebhook` 管道**；签名仍绑定 id，fail-closed 结构不弱化。**Ban** 改为「从 providerTxn 反查单」——那会移除签名↔订单绑定，属安全降级。body 形态最终由实现裁、prove 钉死 |
| 与 Z mouth 的关系（交双审裁） | **推荐：两条入口共用同一 service 管道**（`refundWebhook` 单管道：400/403/404/CAS/409/200 全链路只此一份），主口 = 薄 controller 适配层（id 来源 path→body）；**各自守卫方案否决**——复制 HMAC/owner/CAS 逻辑属安全关键重复面，且两入口行为漂移不可机检。双审若另有裁，须在 POST 审批注并进 prove 断言 |
| 守卫/安全模型 | 主口**无登录态**（PSP 回调无 user session · 对齐 `commerce-webhook.controller.ts:4-7` 头注）：**不挂 PrincipalGuard**；鉴权 = HMAC fail-closed（密钥缺失 fail-closed）+ owner-gateway（不信调用方）+ CAS exactly-once。Ban 挂登录态冒充接线 |
| 具名码 | 全表沿用 Line Z B-1 pins（同 `commerce.service.ts` 现行实现）：400 `invalid_callback` · 403 `bad_signature` · 404 `order_not_found`（≠ mouth-missing）· 409 `order_conflict` · 200 `{result: refunded|already}` · amount **DISCLOSED**。**Ban any-non-404-4xx-as-sig-evidence** |
| DB | **零新迁移**（`refund_provider_txn` migration 0136 已在）；`markOrderRefunded` CAS/红冲不改语义 |
| 静态废止条件 | 主口浮出后 **禁止**继续用「主口 404」GAP 叙事冒充未接线（PREREQ-6 同型）；「ADV INV 过时」叙事同步废止，改引新 prove |

### 拟 file 清单（授权后 coding 的精确范围 · docs commit 零行）

| 文件 | 动作 |
|------|------|
| `apps/api/src/modules/commerce/payment-callback.controller.ts` | **新增**（或并入 `commerce-webhook.controller.ts` 由实现裁 · prove 钉死）——`@Post('refund-callback')` 薄适配：body 取 id → 委托 `refundWebhook`；无登录态 |
| `apps/api/src/modules/commerce/commerce.service.ts` | **仅在需要时**加 body-id 薄 overload/适配；**Ban** 改 `payWebhook`/`payCallback`/`refundWebhook` 既有 HMAC 标签、owner-gateway、CAS 语义 |
| `apps/api/src/app.module.ts` | 仅当新增独立控制器文件时注册 |
| `apps/api/test/uc-e2e-011-refund-callback-adv.proof.ts` | **新增** ADV prove（七类 + 回归 + 新鲜 INV） |
| `apps/api/package.json` / root `package.json` / `scripts/run-e2e-isolated.mjs` | 注册 `uc011:refund-callback-adv:prove` 三层隔离壳 |
| **Ban** | migration / db schema；`uc-e2e-011-adv-refund-callback.proof.ts`（Line V 历史证据冻结）；`neg-commerce.proof.ts` / `full.e2e.ts` 既有断言；其他 commerce 路径改名 |

## ADV prove（授权后才执行 · 本 commit 不跑）

**CMD 拟 `pnpm uc011:refund-callback-adv:prove`**（隔离壳三层，同 `uc014:webhook-adv:prove` 先例：root `:prove` → `:prove:raw` → apps/api `prove:uc011-refund-callback-adv` · 走 `scripts/run-e2e-isolated.mjs` 真 api + 隔离 PG · 零 live 模型 · `PAY_PROVIDER_SECRET` 只经隔离壳进程环境，值不入树不入 receipt）。

### ADV 七类注入表（inject what · 恰七类 · 打**主口** `/payment/refund-callback`）

| id | 注入什么 | 观察什么（机检 exact status + named code） |
|----|----------|--------------------------------------------|
| **A1 伪造签名** | 错签/垃圾 sig（合法单+合法 txn） | **403 `bad_signature`** + 零副作用：payment_order 仍 paid、bucket/consumption 快照不变 |
| **A2 缺字段** | 缺 `sig` / 缺 `providerTxn` / 缺 `orderId` / 空 body | **400 `invalid_callback`** + 零副作用快照 |
| **A3 夹带金额结构断言** | body 夹带 `amountCents`/`units`/`refundAmount` | **DISCLOSED**：无金额通道，夹带字段被忽略，红冲单位恒等于产品定价（pack_10=10 / pack_30=30）；Ban 改口「已实现显式金额复核」 |
| **A4 同单重放** | 合法回调首打 + 同单同 txn 重放 | 首 **200 `{result:'refunded'}`** → 次 **200 `{result:'already'}`**；无双退：红冲恰一次、ConsumptionRecord/bucket 快照二致 |
| **A5 跨订单 409** | 同 providerTxn 打两张不同订单 | 恰一单 `refunded`；另一单 **409 `order_conflict`**（非 5xx）；`refund_provider_txn` 恰 1 行；两账户合计红冲恰一份 |
| **A6 并发恰一次** | 并发同单同 txn 双回调 | 恰一次红冲、无双退、无 stuck（对齐 neg-commerce/uc014 C6 口径） |
| **A7 未知单** | 签名对但订单不存在 / body 夹带 owner | **404 `order_not_found`**（签名再对也不入账；≠ mouth-missing 404）；owner 不可伪造（owner-gateway 不信调用方） |

- **新鲜 INV**（取代过时 old-INV 作证据 · 不改 old 文件）：主口已挂载（非 404）· `refundWebhook`/`markOrderRefunded` 管道存在 · 具名码表与实现一致。
- **审计 residual**（沿 K/UC014 线口径）：GuardrailHit/安全日志无观察点 → prove 如实打印 `AUDIT-OBSERVATION: absent`，**disclosed-not-blocking · 不作 EXIT 门槛**；Ban 假称审计已接。
- **Z mouth 回归**：`pnpm uc011:refund-callback:prove`（Line Z · 41/41）须在本刀 coding 后**重跑保持 EXIT 0**——Path A mouth 不因主口落地而回退；Ban 修 Z mouth 断言迁就、Ban 改 `uc-e2e-011-refund-callback-mouth.proof.ts`。

## EXIT 契约（含诚实失败路径）

- **EXIT 0** = 七类 A1–A7 断言全绿（每类 exact HTTP status + named code + DB before/after 快照）+ 新鲜 INV 全绿 + Z mouth 回归 EXIT 0。EXIT 0 **≠ covered** · **≠ ADV 自动翻 partial/covered** · **≠ 关 `GAP-UC011-ADV-01`**（关闭须 post-prove dual PASS + 协调方 nail）· **≠ §1.1 covered** · **≠ covered-lift**。coveredCount=**8** 不变。
- **EXIT 1** = 诚实保留：任一类做不出/断言不成立（例：主口仍 404、夹带金额被采纳入账、并发出现双红冲）。prove 须打印 `GAP-UC011-ADV-01` 明细（哪类哪断言未证 · file:line 依据），如实落 receipt；**EXIT1 保留 OPEN** · **attempts 全记录**（每次 attempt 含中断/失败逐次记录 EXIT 与时间戳）· **Ban retry-to-green**（不得只留绿色 attempt 或循环重跑至绿）· **Ban 修 prove 迁就** · **Ban 把 EXIT1 说成 flake/环境问题**。

## 与 Line Z / Line V 的边界（硬钉）

- Line Z Path A mouth（`POST /commerce/webhook/refund/:id` · tip `244b812` · EXIT0 41/41）**保留不回退**；本刀主口落地后两入口并存，回归必跑。
- Line V honesty-of-red nail（tip `79825b2` · EXIT 1）**历史保留原样**；Ban 重写其 proof/nail；Ban 宣称被推翻或洗绿。
- **禁把 Z mouth EXIT0 洗成 covered**；主口 EXIT0 同样 ≠ covered；`GAP-UC011-REFUND-CALLBACK` 的关闭状态由协调方 nail 裁（本刀不预 claim）。
- ADV 列翻 status（gap→partial/covered）= 独立 covered-lift/协调方 nail；本刀 Ban。

## 行语义（冻结 · 本 REQUEST 与后续 coding 均不翻行）

- `UC-E2E-011` 整行 stays **partial**（coveredCount=8 不动）直至独立 covered-lift + dual + 协调方 nail。
- `GAP-UC011-ADV-01` stays **OPEN**（本 REQUEST 不预 claim CLOSED）。
- `GAP-UC011-REFUND-CALLBACK` 行状态不动（Line Z nail 保留）。
- ADV 列 stays **gap**/`case-only`（本刀不洗）。
- Ban 翻 §1.1 covered · Ban invent covered · Ban SSOT edit（本 docs REQUEST 阶段零矩阵/backlog/checklist diff）。
- **Ban 碰 UC-018 / UC-052 / UC-025 / UC-004 / UC-014/026 / UC-002 任何行/文件**。

## Ban 列表

- **Ban coding product**（本 turn docs-only）；**Ban prove 执行**；**Ban push**；Ban force-push；Ban secrets / `.env*`（`PAY_PROVIDER_SECRET` 只经隔离壳进程环境）。
- **禁把 Z mouth EXIT0 洗成 covered**；Ban covered · Ban invent covered · Ban flip §1.1 covered · Ban 把主口 EXIT0/回归绿写成 UC-011 covered 或 ADV covered。
- Ban covered/翻 SSOT 行（矩阵/backlog/checklist 只在 nail 改；本刀零 SSOT edit）。
- Ban 借口改其他 commerce 路径冒充主口；Ban 第三等价路径；Ban 挂 PrincipalGuard 冒充接线；Ban 从 providerTxn 反查单弱化签名绑定；Ban 复制守卫（各自守卫方案）未裁先写。
- Ban 改 Line V `uc-e2e-011-adv-refund-callback.proof.ts` / Line Z `uc-e2e-011-refund-callback-mouth.proof.ts` / `neg-commerce.proof.ts` / `full.e2e.ts`；Ban 改 payWebhook/payCallback/refundWebhook 既有 HMAC/CAS 语义；Ban 新迁移。
- Ban 碰 UC-018/052/025/004/014/026/002；Ban live 模型；Ban Meridian · Ban HA cloud buy · Ban self-approve（alone ≠ dual）· Ban self-nail；Ban 借本刀关 balance-ui / wallet / UC-019 / PERF blind；Ban audit residual 假称已接（absent = disclosed-not-blocking）。

## Scope / Not

只做 `GAP-UC011-ADV-01` 主口真接线 + ADV 七类真证据 + Z mouth 回归 的 docs REQUEST。Not covered-lift。Not ADV 列翻行。Not balance-ui。Not wallet。Not UC-018/052/025/004/014/026/002。Not PERF/LOAD。不发明新验收标准——以 scenarios E3/A3/契约 `:253` + UC014 七类先例 + Line Z B-1 pins 原文为准。

## Non-claims

Not a pass · not run · not coded · not covered · not ADV partial/covered · not 主口已落（本 commit）· not ADV INV 已修（本 commit）· not HA · not releaseEvidence · not nail · EXIT0 ≠ covered · alone ≠ dual · Line Z nail ≠ 本刀 · Line V nail 历史地位不变

## Pins

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503 · UC-011 stays partial · ADV stays gap/case-only · STOP

---

*Harness · GAP-UC011-ADV-01 · Line V · main mouth wiring · 2026-10-05 · draft:awaiting_pre_exec_dual · Ban coding · Ban prove · Ban push · Ban wash · EXIT0≠covered · releaseEvidence=false · STOP*
