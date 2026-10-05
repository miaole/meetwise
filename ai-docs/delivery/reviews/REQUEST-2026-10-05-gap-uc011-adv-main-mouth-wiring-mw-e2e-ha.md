# REQUEST — **GAP-UC011-ADV-01 · main mouth wiring + ADV** · pre-exec · mw-e2e-ha

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Expert**: `mw-e2e-ha`
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

## 请审什么（mw-e2e-ha · evidence-honesty / EXIT 契约焦点）

Line V · `GAP-UC011-ADV-01` 主口真接线 + ADV 证据（协调方优先级 #1）。Z 线 `a356d66` 只钉了 Path A mouth（CODE `bf1fdb2` · EXIT0≠covered）；主口 `POST /payment/refund-callback` 仍 404（本树读码 = 路由缺失，无 `/payment` 控制器 · 非 guard 关闭）；ADV INV 过时（Line V proof `:86-94`）。请审：

1. **主口接线合同**：薄 controller 适配 + 委托 `refundWebhook` 既有管道（400/403/404/CAS/409/200 单管道）；**推荐共用管道、否决各自守卫**——两入口关系交你裁；body 携带 `{orderId, providerTxn, sig}`（无 path id 契约差异 · Ban 从 providerTxn 反查单弱化签名绑定）；无登录态 + HMAC fail-closed + owner-gateway（Ban 挂 PrincipalGuard 冒充接线）；**Ban 借口改其他 commerce 路径**冒充主口。
2. **ADV 七类 + 回归**：A1 403 `bad_signature` / A2 400 `invalid_callback` / A3 夹带金额 DISCLOSED 结构断言 / A4 同单重放 `refunded`→`already` 无双退 / A5 跨订单 409 `order_conflict` / A6 并发恰一次 / A7 未知单 404 `order_not_found`（≠ mouth-missing）；拟 CMD `uc011:refund-callback-adv:prove` 隔离壳三层（同 `uc014:webhook-adv:prove` 先例）；**Z mouth 回归** `uc011:refund-callback:prove` 须保持 EXIT 0（Path A 不回退 · Ban 修其断言迁就）。
3. **EXIT 契约与诚实失败路径**：EXIT0 ≠ covered ≠ ADV 翻行 ≠ 关 `GAP-UC011-ADV-01`；EXIT1 保留 OPEN · attempts 全记录 · **Ban retry-to-green** · Ban 把 EXIT1 记成 flake；审计 residual（GuardrailHit absent）沿 K/UC014 口径 **disclosed-not-blocking** · 不作 EXIT 门槛 · Ban 假称已接。
4. **历史证据边界**：Line V honesty-of-red nail（tip `79825b2`）与 Line Z mouth nail（tip `244b812`）历史保留原样 · Ban 重写/删除 · Ban 宣称被推翻；**禁把 Z mouth EXIT0 洗成 covered**；新鲜 INV 取代过时 old-INV 作证据，不碰旧文件。
5. **边界**：Ban coding product/prove 本 stub；Ban 碰 UC-018/052/025/004/014/026/002；Ban SSOT edit；Ban live；Ban secrets/`.env*`；Ban self-approve（alone ≠ dual）。

Row `UC-E2E-011` stays **partial** · ADV stays **gap/case-only** · `GAP-UC011-ADV-01` stays **OPEN**（本刀不预 claim 关闭）· Ban covered. Dual PASS ≠ coding ≠ prove ≠ nail.

---

*Stub · awaiting expert pre-exec dual · STOP*

---

## PRE-EXEC dual review — mw-e2e-ha（adversarial evidence-honesty）· 2026-10-02

**Reviewed**: `d58b05b`（full `d58b05bf56ab33efd3312786e3958302bdb923c5` · docs-only：4 新增 md · 0 修改 · 0 删除 · 零 SSOT diff——`git diff --name-status d58b05b^ d58b05b` 全 `A`）。Worktree `/Users/miaole/Desktop/golucky/meetwise-rv-v-e2e-ha` · branch `rv/v-e2e-ha`（自 `origin/feat/mysql-schema-skeleton`，`merge-base --is-ancestor d58b05b HEAD` EXIT 0）。本审 = PRE-EXEC dual docs gate only：零 coding · 零 prove 执行 · 零 product edit · 零 SSOT edit。alone ≠ dual · 不代签 mw-model-op。

### 1. 检查表（独立复核 · 均为本审自跑命令 + 读码，非转抄）

| # | 项 | 独立证据 | 结论 |
|---|----|----------|------|
| V1 | **主口 404 = 路由缺失，非 guard 关闭** | `grep -rn "@Controller(" apps/api/src` 共 18 个控制器，前缀集 {commerce, commerce/webhook, metrics, privacy, notifications, auth, recruiter, health, resume, quiz, roles, admin, profile, interview, jobs, applications, legal, diagnosis}——**无 `payment` 前缀**；`grep -rniE "/payment"` 于 `apps/api/src` 零路由命中；`app.module.ts:38` controllers 数组 15 项无 payment 控制器；`main.ts:33-59` 三 hook 仅 request-id / body 封顶(413) / metrics——**无鉴权 hook、无路由重写、无 global prefix** → `POST /payment/refund-callback` 落 Fastify 兜底 404 = 口不存在。对照：同类口 `CommerceWebhookController`（`commerce-webhook.controller.ts:8`）本来就无 PrincipalGuard（头注 :4-7 明示 HMAC fail-closed + owner 从 DB 查）→ 若 guard 关闭该口模式不成立，404 论断归因**路由缺失**成立 | **成立** |
| V2 | 管道读码与 harness 引用一致 | `refundWebhook` @ `commerce.service.ts:79-93`：400 `invalid_callback`(:80) → HMAC `${id}:${providerTxn}:refunded` + `timingSafeEqual` + 密钥缺失 fail-closed 403 `bad_signature`(:81-84) → owner `gateway_payment_order_owner` 无表权限网关(:85-87) → 404 `order_not_found`(:88) → `markOrderRefunded` CAS(:89) → 409 `order_conflict`(:91) → 200 `{result: refunded|already}`(:92)。`markOrderRefunded` @ `packages/db/src/payment.ts:104`：SAVEPOINT + `status='paid'` CAS + `refund_provider_txn` NOT EXISTS（23505→conflict）+ FIFO 红冲 + 不足回滚 conflict；migration `0136_payment_order_refund_provider_txn.sql` 在树 | **成立** |
| V3 | Z 线钉 `a356d66` | commit message 逐字：CODE `bf1fdb2` · prove tip `244b812` · REQUEST `54b2058` · EXIT 0 41/41 · post dual `938adee`+`ef980e3` BOTH PASS · **EXIT0≠covered** · UC-011 stays partial · coveredCount=8 · **ADV / GAP-UC011-ADV-01 stays OPEN** · 主口仍 404 = 后续刀。四个历史 tip（79825b2 / 244b812 / bf1fdb2 / 54b2058）`git cat-file -t` 全部在树 | **成立** |
| V4 | ADV INV 过时论断 | `apps/api/test/uc-e2e-011-adv-refund-callback.proof.ts:86-94` 五条 INV 中四条（payment.ts 无 markOrderRefunded / webhook 无 refund 路由 / commerce.controller 无 refund 面 / service 无 refundWebhook）在 `bf1fdb2` 后已不再为真（V2 读码反证）；probe MOUTHS `:132` 含 `/payment/refund-callback` | **成立** |
| V5 | docs-only + 零 SSOT | `git diff --name-status d58b05b^ d58b05b` = 4×`A`（harness/slice/两 stub）；矩阵/backlog/checklist 零 diff；矩阵 `:117` 行与 backlog `:463-495` 段原样未动 | **成立** |
| V6 | prove 基建先例 | `uc011:refund-callback:prove`（root `package.json:134-135` → `run-e2e-isolated.mjs` → `prove:uc011-refund-callback-mouth`）三层壳在；`uc014:webhook-adv:prove`（`:148-149`）先例在；`uc011:refund-callback-adv:prove` **未注册**（正确——docs 阶段零行）；`scripts/run-e2e-isolated.mjs` 在 | **成立** |
| V7 | UC014 先例口径 | `harness/gap-uc014-026-adv-webhook-nhp.md:39-45` 七类 C1–C7（每类 exact status + named code + DB before/after 快照）；`:51` 三层隔离壳；`:33` 审计后置 GuardrailHit「无观察点 → prove 只能如实披露 observed/absent，**不作 EXIT 门槛**」 | **成立** |
| V8 | scenarios 契约锚 | `ai-docs/requirements/use-cases/e2e-scenarios.md`：E3(:248) / A3(:251) / 契约 `POST /payment/refund-callback`、`GET /wallet`(:253) / TC(:256-259) 逐字在；无 path `:id` 段——body 契约差异属实非发明 | **成立** |
| V9 | Pins 原值 | stub/harness/slice 三处一致：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · DELETE=503——与 Z 钉 pins 逐字同 | **成立** |
| V10 | 禁碰边界 | Ban 清单覆盖：Line V `uc-e2e-011-adv-refund-callback.proof.ts` / Line Z `uc-e2e-011-refund-callback-mouth.proof.ts`（在树确认存在）/ `neg-commerce.proof.ts` / `full.e2e.ts` / payWebhook·payCallback·refundWebhook 语义 / 新迁移 / UC-018·052·025·004·014·026·002 / SSOT / secrets·`.env*` / live | **成立** |

精度备注（非阻塞）：harness §现状首句「全部 HTTP 控制器在 `app.module.ts:38` 显式注册」欠精确——quiz/interview/diagnosis 三控制器经各自 feature module（`quiz.module.ts:7` / `interview.module.ts:15` / `diagnosis.module.ts:7`）注册。对 V1 结论零影响：无论注册与否，全仓不存在任何 payment 控制器。编码时若主口走独立控制器文件，须按所选注册路径落 INV，勿复述此欠精确句。

### 2. 接线方案裁决（REQUEST 推荐共用管道 vs 各自守卫）

**裁决：采纳共用单管道（两入口 → 同一 `refundWebhook` 管道），否决各自守卫。** 理由：

1. **安全关键面唯一化**。HMAC fail-closed + owner-gateway + CAS exactly-once 是本口全部安全语义；复制一份即产生第二条不可机检对齐的实现漂移面——任一入口语义漂移（如一边改 HMAC 标签、一边忘）会让 Z 钉 41/41 与 ADV 七类证据互不覆盖。单管道下 Z 回归硬门槛才对主口有传递力。
2. **签名绑定不弱化**（对 body `{orderId, providerTxn, sig}` 的裁决）：id 仍进 HMAC 载荷 `${orderId}:${providerTxn}:refunded`，签名↔订单绑定保持；**Ban 从 providerTxn 反查单维持否决**——反查会使「对 id 签的名」可用于反查出的另一单，属真实安全降级，非风格分歧。薄适配层 = body 取 id → 委托，零业务逻辑；`commerce.service.ts` 仅允许 body-id 薄 overload，Ban 动 `refundWebhook` 既有标签/owner/CAS 语义——边界已钉死，裁决通过。
3. **守卫模型**：主口无登录态正确（PSP 回调无 session · scenarios :253 契约无鉴权段 · 对齐 `commerce-webhook.controller.ts:4-7` 先例）；挂 PrincipalGuard 冒充接线 = 破坏契约口本身，Ban 正确。**非阻塞观察**：两入口共享同一签名空间（同载荷格式，Path A 的合法 sig 在主口同样合法）——不引入超出单管道自身幂等（A4 `already` / A5 409）的新攻击面，可接受；ADV prove 可选加「跨口重放仍 `already` / 无双退」作强化断言，不作 EXIT 要求。
4. **前置顺序**：400 缺字段判定先于 HMAC（对齐 :80 → :84 现序），空 body/缺 orderId 必须 400 而非 403——prove 须钉此序，防「把 400 当签名证据」类偷换（对齐 Ban any-non-404-4xx-as-sig-evidence）。

### 3. Z mouth 回归硬门槛裁决（EXIT0 合取项）

**裁决：成立，维持为 EXIT0 必要合取项。** `EXIT 0 = A1–A7 全绿 + 新鲜 INV 全绿 + pnpm uc011:refund-callback:prove 保持 EXIT 0`：

- 本刀向**同一 controller/service/module 注册面**增第二条路由，Path A 回归是真实风险而非仪式；Z 钉的活证据（41/41）必须在主口落地后复验存活。回归作为合取项是「Path A 不回退」唯一可机检的保障形式。
- 诚实失败路径完整：回归失败 → EXIT 1 → attempts 全记录 → **Ban 修 Z mouth 断言迁就**（`uc-e2e-011-refund-callback-mouth.proof.ts` 冻结）、Ban flake 洗、Ban retry-to-green。环境性失败同样落 EXIT 1 明细（file:line），不许当 pass。门槛与诚实出路自洽，通过。

### 4. ADV 七类机检性 + EXIT 契约

七类 A1–A7 与 UC014 C1–C7 一一映射（A2 增主口特有缺 `orderId` 维度 · A4 为 refunded/already 语义对偶），每类钉 exact status + named code + DB before/after 快照 → **可机检**。A3 夹带金额 = 结构断言（无金额通道 · 夹带字段忽略 · 红冲单位恒等于 pack_10=10/pack_30=30），Ban 改口「显式金额复核」与 UC014 C3 口径同。A7 的 404 `order_not_found` 以**具名 body** 区别于 mouth-missing 404（C-V3）。EXIT0 ≠ covered ≠ ADV 翻行 ≠ 关 GAP ≠ covered-lift；EXIT1 保留 OPEN · attempts 全记录；静态废止条件（口浮出后禁再用「主口 404」叙事 · old-INV 由新鲜 INV 取代而不碰历史文件）——全部与 `a356d66` 钉文及 K/UC014 口径一致，无洗绿通道。审计 residual（GuardrailHit absent）= disclosed-not-blocking、非 EXIT 门槛、Ban 假称已接——逐字对齐 UC014 先例 `:33`。

### 5. Fail-trigger audit（后续 coding/prove 阶段命中任一即本审翻 FAIL 依据）

- **FT-1** 适配层长出业务逻辑（自做 HMAC/owner 查询/校验超出字段存在性）→ 薄适配违约。
- **FT-2** 签名载荷不含 orderId，或引入 providerTxn 反查单 → 签名绑定弱化。
- **FT-3** 主口挂 PrincipalGuard / 任何登录态。
- **FT-4** Z mouth 回归缺席 EXIT 合取、或改 `uc-e2e-011-refund-callback-mouth.proof.ts` 使其通过。
- **FT-5** EXIT0 写成 covered / ADV 翻行 / 关 `GAP-UC011-ADV-01` / coveredCount≠8 / §1.1 翻 covered。
- **FT-6** retry-to-green、attempts 删改、EXIT1 记 flake。
- **FT-7** 审计 residual 假称已接，或反手当隐藏 EXIT 门槛。
- **FT-8** 改 Line V/Z 历史 proof、SSOT diff、碰 UC-018/052/025/004/014/026/002、改 payWebhook/payCallback/refundWebhook 语义、新迁移。
- **FT-9** 第三等价路径/改其他 commerce 路径冒充 `POST /payment/refund-callback` 字面契约。

### 6. Blockers

**无（none）。** docs REQUEST 事实引用逐条复核成立、接线合同自洽、EXIT 契约含诚实失败路径、边界与 pins 与 Z 钉一致。pre-exec dual 可放行至协调方授权 coding（仍 alone ≠ dual：须 mw-model-op 独立 PASS）。

### 7. Conditions（非阻塞 · coding/prove 阶段须满足）

- **C-V1** prove 必须把最终 body 契约钉死：`{orderId, providerTxn, sig}` 形态 + 缺任一字段（含缺 orderId/空 body）→ 400 `invalid_callback` 逐字段断言；「body 形态由实现裁」不得漂过 prove 未钉。
- **C-V2** A4/A6 断言必须带 DB 快照：`refund_provider_txn` 恰 1 行、红冲 delta 恰一单 units、bucket/consumption before/after 二致；跨口重放（Path A 首打 → 主口重放）可作强化断言，非 EXIT 要求。
- **C-V3** 404 `order_not_found` 与 mouth-missing 404 的区分必须走具名响应体断言，不得只断 status。
- **C-V4** 新鲜 INV 必须断言 scenarios 字面路径 `POST /payment/refund-callback` 已挂载（非 404）且具名码表与实现一致；注册形态（独立文件 vs 并入 `commerce-webhook.controller.ts`）由 prove 钉死，勿复述 harness 中「全部控制器在 app.module.ts:38 注册」欠精确句。
- **C-V5** attempts 台账须含 Z mouth 回归任何 EXIT1 的时间戳与归因；不得裁剪 attempt 记录。
- **C-V6** `PAY_PROVIDER_SECRET` 只经隔离壳进程环境；值不入树不入 receipt（对齐 UC014）。

### 8. 三行中文摘要

1. 主口 404 论断独立复核成立：全仓无 `/payment` 控制器、`app.module.ts:38` 无 payment 项、`main.ts` 无鉴权 hook/路由重写——纯路由缺失非 guard 关闭；harness/slice 全部行号引用（service :79-93、payment.ts :104、INV :86-94、probe :132、矩阵 :117、scenarios :248-258）逐一读码核实无误。
2. 裁决两项：接线采纳 REQUEST 推荐——两入口共用 `refundWebhook` 单管道、主口为薄 body 适配层、签名仍绑 orderId、Ban 反查单维持；Z mouth 回归（EXIT0）作为新 prove EXIT0 必要合取项成立，诚实失败路径（EXIT1 保留 OPEN · attempts 全记录 · Ban retry-to-green）自洽。
3. 无 Blockers；六条 Conditions（C-V1~C-V6）与九条 Fail-triggers（FT-1~FT-9）随刀执行；EXIT0≠covered、UC-011 stays partial、ADV stays gap/case-only、`GAP-UC011-ADV-01` stays OPEN、coveredCount=8 不动；alone ≠ dual，不代签 mw-model-op，是否 coding 由协调方在双审齐后授权。

**Verdict: PASS**
