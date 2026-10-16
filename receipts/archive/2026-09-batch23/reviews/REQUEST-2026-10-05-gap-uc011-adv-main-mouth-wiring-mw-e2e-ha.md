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

---

## POST-PROVE dual review — mw-e2e-ha（adversarial evidence-honesty）· 2026-10-02

**Reviewed**: `cf34390`（full `cf343900c441d3f7e800cabd1fe2944e4c81fd4d`）= `2535b31`（full `2535b319b3f4552a385df9321f0845dca5d30489` · feat 6 files +513/−2）+ receipt 1 file。origin 同补丁 cherry-pick 已核：`40a4f6c2`/`a8640846` 与 `2535b319`/`cf343900` 包内容零差异（其间仅一条无关 ledger doc commit）。Worktree `/Users/miaole/Desktop/golucky/meetwise-rv-vp-e2e-ha` · branch `rv/vp-e2e-ha`（自 `line/v-uc011-adv-main-mouth`）。本审 = POST-PROVE dual：**fresh re-run 独立执行 + 证据诚实性审计**；零 product/prove edit · 零 SSOT edit · alone ≠ dual · 不代签 mw-model-op（其审并行，本审未读其结论）。

### 1. Fresh re-run（C-DUAL-FROM-FRESH · 恰好一次 · 禁重试）

| 步骤 | CMD | 结果 |
|------|-----|------|
| 安装 | `pnpm install --frozen-lockfile` | **EXIT=0**（14.3s · pnpm v10.18.0 · 锁文件逐字冻结） |
| prove | `pnpm uc011:refund-callback-adv:prove`（三层隔离壳 · 随机容器+动态端口 · pgvector/pgvector:pg16） | **EXIT=0 · 68/68 全绿**（0 FAIL 行 · INV/A1–A7/X/ZREG 十类全 ALL PASS · 内嵌 ZREG 子进程 41/41 EXIT=0） |

- 镜像 digest 比对：本地 `pgvector/pgvector:pg16` RepoDigests 含 `docker.m.daocloud.io/pgvector/pgvector@sha256:7b822b0a…199b90a`——同 digest，通过。
- 与实现方 attempt#2 声称（68/68 EXIT=0 @`2535b31`）**一致，无重大发现**。fresh run 关键 PASS 逐条落日志：A2「缺 orderId（有 txn+sig）→ 400 invalid_callback（非 403 · 400 判定先于 HMAC）」· A4「refund_provider_txn 全局恰 1 行」+ SNAPSHOT 三帧 `paid/sum=10 → refunded/sum=0 → after-replay 与 after-first 二致` · A5「跨订单重放 → 409 order_conflict（非 5xx）」· A7「命名区分(具名 body): 真口 404.body.error=order_not_found · 缺失口无此具名码」· X dir1/dir2 双方向跨口重放均 `already` + 红冲恰一次。fresh run 零改动工作树（`git status` 干净 · `.tmp` 不入树）。

### 2. 包完整性（6+1 申报文件 · 冻结面零 diff）

`git diff --name-only 920aee22..cf343900` = 恰 7 文件（feat 6：controller/app.module/proof/apps-api package.json/root package.json/run-e2e-isolated.mjs + receipt 1）——与申报 6+1 逐字一致，零超纲文件。零 diff 实证：`commerce.service.ts` / `packages/db/src/payment.ts` / `commerce-webhook.controller.ts`（薄适配红线）；Line Z 冻结 `uc-e2e-011-refund-callback-mouth.proof.ts`、Line V 历史 `uc-e2e-011-adv-refund-callback.proof.ts`、SSOT（slice/harness/矩阵面）；UC-002/004/014/018/025/026（`apps/api/test/` 全目录 diff 仅新增 adv proof 一个文件）。`app.module.ts` diff 仅 +import 与 controllers 数组插入（既有顺序零变动）；controller 33 行薄适配：白名单解构 `{orderId,providerTxn,sig}` → 缺 orderId 400 `invalid_callback`（先于 HMAC）→ 委托 `refundWebhook`，无 PrincipalGuard/无 HMAC 复制/无 owner 查询/无 CAS 复制。

### 3. attempt#1→#2 演进裁决（非 retry-to-green wash）

- attempt#1 原始日志（`.tmp/prove-adv-attempt1.log`，实现方树落盘，本审已读）：**恰 1 条 FAIL** = `[INV] Ban 金额通道: controller 源无 amount 字段引用（白名单结构性）`——prove 自身裸子串扫描命中 controller **注释**中 `amountCents/units/refundAmount` 字样（该注释在已提交的 2535b319 controller :26 在树）；A1–A7+X+ZREG 全 PASS，内嵌 Z 口 41/41 EXIT=0。68 条断言、1 失败——与 receipt 台账逐字吻合，无剪裁。
- 修复面核实：fix 仅动 prove 扫描实现——新增 `stripComments`（proof.ts:67）+ 断言改 `!/amount/i.test(stripComments(ctrlSrc))`（proof.ts:199-200），断言名同步改「代码面（剥注释后）」；**A3 行为断言原样**（夹带字段忽略/权威 units=10/落库 9900 不变——attempt#1 与 attempt#2 日志 A3 全 PASS 均在，fresh run 亦全 PASS）。剥注释不可能隐藏真实代码引用，扫描反而更精确（注释非可执行面）——断言意图（代码无金额通道）不变。
- 裁决：**一次修复演进、全台账、产品代码两 attempt 间零改动**（单 impl commit · 失败在 prove 自身静态扫描非产品行为），沿 P/R 线先例口径——**非 retry-to-green wash**。且本审 fresh re-run 于同一 tip 零改动复现 68/68 EXIT=0，独立排除「反复跑到闪绿」。

### 4. 条件裁决（本审 pre-exec C-V1~V6 + FT-1~FT-9 逐条）

| 条件 | 裁决 | 依据（file:line · fresh run 实证） |
|------|------|------|
| C-V1 body 契约钉死 + 逐字段 400 | **满足** | proof.ts:248-260 五断言（空 body/缺 orderId/缺 providerTxn/缺 sig/仅 sig → 400 `invalid_callback`）+ :251 缺 orderId 400 非 403（先于 HMAC）；fresh run PASS |
| C-V2 A4/A6 DB 快照 + txn 恰 1 行 | **满足** | proof.ts:302-308 SNAPSHOT 三帧落日志 + :311-316 恰 −10 一次/txn 恰 1 行；A6 :348-361 并发恰一次；跨口重放双方向 :420-443（超出「可作强化断言」下限，非违约） |
| C-V3 404 具名区分（不得只断 status） | **满足** | proof.ts:373-377：真口 `404.body.error=order_not_found` vs `POST /payment/definitely-not-a-mouth` 404 无此具名码 |
| C-V4 新鲜 INV + 注册形态钉死 | **满足** | proof.ts:178-208 七断言（挂载 probe 403≠404 :205-207 · 管道存在/单管道/无复制守卫 · 注册形态=独立文件+app.module 注册 :202-203）；未复述 pre-exec 指出的「全部控制器在 app.module.ts:38 注册」欠精确句（receipt :69 明示） |
| C-V5 attempts 全台账不剪裁 | **满足** | receipt :44-48 三 attempts 含时间戳/EXIT/归因；attempt#1 EXIT=1 未删改（落盘日志交叉吻合）；EXIT1 未记 flake |
| C-V6 密钥进程环境 | **满足** | `PAY_PROVIDER_SECRET` 赋值在 fresh 日志/receipt/proof 均 0 命中；proof.ts:46 明示只经隔离壳进程 env；主口零新增 env plumbing（controller/proof 无 env 读取新增） |
| FT-1 适配层长业务逻辑 | 未命中 | controller 仅字段存在性校验+委托；INV 断言 Ban createHmac/timingSafeEqual/gateway_payment_order_owner/markOrderRefunded（proof.ts:196-198） |
| FT-2 签名丢 orderId/反查单 | 未命中 | HMAC 载荷 `${orderId}:${txn}:refunded`（proof.ts:131）；A1 他单签名→403（:225-226）；service 委托形参不含反查 |
| FT-3 挂 PrincipalGuard | 未命中 | controller 无守卫，对齐 commerce-webhook.controller.ts:4-7 无登录态模型 |
| FT-4 Z proof 被改/合取缺席 | 未命中 | `uc-e2e-011-refund-callback-mouth.proof.ts` 零 diff；ZREG=EXIT0 合取项（proof.ts:448-449）；fresh run ZREG 41/41 |
| FT-5 EXIT0 写成 covered | 未命中 | receipt Status=coding+prove done · GAP-UC011-ADV-01 stays OPEN · coveredCount=8 · UC-011 stays partial · Non-claims 段逐字保留 |
| FT-6 retry-to-green/attempts 剪裁 | 未命中 | 见 §3 演进裁决 |
| FT-7 审计 residual 假称已接/当隐藏门槛 | 未命中 | AUDIT-OBSERVATION: absent（0 emit 点）如实披露 disclosed-not-blocking（receipt :104）；AUDIT_LINE 非断言不作 EXIT 门槛（proof.ts:82-88） |
| FT-8 改历史 proof/SSOT/服务语义/新迁移 | 未命中 | §2 零 diff 清单；包内零迁移文件 |
| FT-9 冒充字面契约 | 未命中 | `@Controller('payment')`+`@Post('refund-callback')`=`POST /payment/refund-callback` 字面（scenarios :253）；INV 钉死注册形态 |

### 5. Blockers

**无（none）。** fresh re-run 独立复现 68/68 EXIT=0 · 包完整性零超纲 · 冻结面零 diff · 演进为一次修复演进非 wash · C-V1~V6 全满足 · FT-1~FT-9 零命中 · 审计 residual（GuardrailHit absent）如实具名披露（disclosed-not-blocking）。

### 6. Conditions（非阻塞 · 后续须维持）

- **CON-1** 审计 residual「主口+管道 GuardrailHit/安全日志 emit 点 absent」保持具名 OPEN，后续接线审计时不得回溯宣称本刀已接。
- **CON-2** EXIT0≠covered 地位不变：`GAP-UC011-ADV-01` 关闭 / coveredCount 翻行 / ADV 翻行须协调方 nail + 双审，本 PASS 不构成任何 covered 授权。
- **CON-3** A3 口径维持 DISCLOSED 结构性（白名单无金额通道+权威 units 红冲）；引入显式服务端金额复核属新刀，不得回写本 receipt 措辞。
- **CON-4** mw-model-op POST-PROVE 独立裁决未在本审视野内（并行）；本 PASS 仅 e2e-ha 单侧，dual 收口由协调方汇总（alone ≠ dual）。

### 7. 三行中文摘要

1. 本审独立 fresh re-run（`pnpm install --frozen-lockfile` EXIT=0 → `pnpm uc011:refund-callback-adv:prove` 恰好一次）**EXIT=0 · 68/68 全绿**（内嵌 Z 口回归 41/41），A1–A7+INV+X+ZREG 十类全 PASS，与实现方 attempt#2 声称一致，无重大发现；镜像 digest 与 daocloud 源比对一致。
2. 包完整性：恰 6+1 文件零超纲；service/payment/webhook 冻结面、Line V/Z 历史 proof、SSOT、UC-002/004/014/018/025/026 全零 diff；controller 33 行薄适配（白名单三字段+缺 orderId 400 先于 HMAC+纯委托）；attempt#1 唯一失败=prove 自身裸扫描误伤注释、修复仅剥注释扫代码面且 A3 行为断言原样——一次修复演进、全台账、非 retry-to-green wash。
3. C-V1~V6 全满足、FT-1~FT-9 零命中、审计 residual absent 如实披露；EXIT0≠covered、`GAP-UC011-ADV-01` stays OPEN、coveredCount=8、UC-011 stays partial；alone ≠ dual，不代签 mw-model-op，本审为 e2e-ha 单侧 PASS，dual 收口归协调方。

**Verdict: PASS**
