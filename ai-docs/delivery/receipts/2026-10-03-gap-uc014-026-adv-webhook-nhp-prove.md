# Receipt — **GAP-UC014-026-WEBHOOK-ADV · NHP-014-ADV-01** · UC-E2E-014/026 ADV 七类 webhook 真证据 · prove

**Status**: **coding+prove done · `EXIT=0`**（post-prove dual PENDING · 本 receipt 不翻行 · Ban covered · STOP）
**Pins（原值逐字保留）**: haStatus=**NOT_HA** · releaseEvidence=**false** · claimProductionHA=**false** · gR45Closed=**true** · coveredCount=**8** · ms3EqualsR4Closed=**false** · PG-retained · public DELETE stays **503** · row `UC-E2E-014/026` ADV **stays gap** · case `NHP-014-ADV-01` stays gap→case-only
**Date**: 2026-10-03
**Branch / worktree**: `line/k-next-nhp` @ `b790b45`（基线）→ 本 prove commit（worktree `/Users/miaole/Desktop/golucky/meetwise-line-k` · 未 push）
**Executed by**: `mw-core`（实现方 · 接手前执行者未写任何代码，本刀 coding+prove 从零落地 · 禁自批）
**Harness**: `ai-docs/delivery/harness/gap-uc014-026-adv-webhook-nhp.md`（pre-exec dual PASS：mw-e2e-ha + mw-rag-route 各自独立签署 @0cf8591）+ 协调方授权
**产品事实基线**: `apps/api/src/modules/commerce/commerce.service.ts:56-70` · `packages/db/src/payment.ts:59-93` · `commerce-webhook.controller.ts:11-16`（均 @`b790b45`，本刀零产品代码改动，行号在本 commit 仍有效）

## Prove CMD（三层注册）

```
pnpm run uc014:webhook-adv:prove
  = node scripts/run-e2e-isolated.mjs uc014:webhook-adv:prove:raw   # root package.json（层1 · 隔离壳）
  → shell allowlist+dispatch → pnpm -C apps/api prove:uc014-webhook-adv   # root :raw（层2）· shell 层
  = node --import @swc-node/register/esm-register test/uc-e2e-014-026-webhook-adv.proof.ts   # apps/api（层3）
```

产物（对应 pre-exec dual Conditions C-1/mw-rag-route）：
- `apps/api/test/uc-e2e-014-026-webhook-adv.proof.ts`（新增 · 47 条断言）
- root `package.json`：`uc014:webhook-adv:prove` + `uc014:webhook-adv:prove:raw`（层1/层2）
- `apps/api/package.json`：`prove:uc014-webhook-adv`（层3）
- `scripts/run-e2e-isolated.mjs`：**仅注册**——allowlist 数组加 `'uc014:webhook-adv:prove:raw'` 一项 + dispatch 三元链加一个目标臂（与 uc015/uc010 等既有条目同形态），零行为改动、不影响任何其它 target。此为隔离壳门禁的注册机制本身（无它则 `unsupported_e2e_target`），先例即 uc018/uc025/uc028 全部在此门禁注册；非产品代码、非 SSOT。

## 隔离与密钥卫生（Conditions C-5）

- 随机容器 `meetwise-e2e-55608-1791032735003` · 动态端口 `127.0.0.1:57289`（`-p 127.0.0.1::5432`）· 用毕 `docker rm -f`（exit 后 0 残留容器）。
- 迁移白名单：`_neg-harness.ts` boot() 按固定文件名单加载（01–23 sql + migrations 0037/0038/0039/0046），与 `neg:commerce` 同壳同名单；本 target 未加入 shell 的 `migrateWithRecovery` 名单（harness 自建 schema，同 neg:commerce 先例）。
- `PAY_PROVIDER_SECRET` 只经**进程环境**（`_neg-harness.ts` boot() 内 `process.env` 注入测试常量），不入库、不入 `.env*`、不入树、不入本 receipt。
- `assertIsolatedTestTarget(pool)` 门禁通过（一次性容器，绝不触碰开发库）。
- 环境记录（pull log · binding 条件9）：docker daemon 29.1.3；legacy fixture 镜像 `pgvector/pgvector:pg16` 本地已在（早前经 `docker.m.daocloud.io` 拉取），`docker inspect` 双镜像 ID 一致 `sha256:7b822b0aac60967beb1ea5e576b8602c94c300a157d187f385ae3e0da199b90a`，canonical tag `pgvector/pgvector:pg16` 的 RepoDigests 同时含 `pgvector/pgvector@sha256:7b822b0a…` 与 mirror `docker.m.daocloud.io/pgvector/pgvector@sha256:7b822b0a…` —— **digest 比对一致、canonical tag 已在位**，本次运行直接命中本地镜像，无新 pull、无 digest 漂移。
- `releaseEvidence=false` · NOT_HA · local green ≠ HA（runner 头注口径原样打出）。

## EXIT 值

**EXIT = 0**（C1–C7 全部成立 · 47/47 断言 PASS · 0 FAIL）。按 harness EXIT 契约：EXIT 0 仅证明七类 ADV 真证据成立；**不翻行、不 covered**（coveredCount=8 不动），ADV gap→partial 须 post-prove dual PASS + 协调方授权。

## C1–C7 逐类结果（HTTP 码 · 响应体 · DB 快照）

| 类 | 注入 | HTTP | 响应体 | DB 快照断言（全 PASS） |
|----|------|------|--------|------------------------|
| **C1 伪造签名** | 合法单 ADV_C1+txn，等长 hex 错签 / 短垃圾 sig / 他单签名 | **403** ×3 | `bad_signature` ×3 | 零副作用 6 断言：status 仍 `created`、`provider_txn` 仍 NULL、units/amount 10/9900 不变、桶数/合计不变、txn 全局 0 行 |
| **C2 缺字段** | 空 body / 缺 sig / 缺 providerTxn | **400** ×3 | `invalid_callback` ×3 | 零副作用 3 断言：status `created`+txn NULL、桶数/合计不变、txn 全局 0 行 |
| **C3 夹带金额**（结构性） | 合法回调体夹带 `amountCents:1`/`units:999999`/`amount:-500`（pack_10）；`amountCents:999999`/`units:1`（pack_30） | **200** ×2 | `credited` ×2 | 夹带字段被忽略；入账单位恒等于目录定价 **pack_10=10 / pack_30=30**（桶 delta 恰 +10/+30）；订单落库 units/amount 仍 10/9900、30/24900；每单 txn 恰 1 行 |
| **C4 同单重放** | ADV_C4 同 txn 顺序两次 | **200 / 200** | `credited` → `already` | 桶恰 +1、入账恰单份 10、txn 全局恰 1 行、终态 `status=paid` 且 `provider_txn=注入 txn` |
| **C5 跨订单同 txn** | 同 `advC5Txn` 打 ADV_C5A（成功）再 ADV_C5B（重放） | **200 / 409** | `credited` / `order_conflict`（非 5xx） | `provider_txn` 全局**恰 1 行**且归属第一张订单；B 仍 `created`+txn NULL；两账户合计**恰单份 10**（A=10, B=0） |
| **C6 并发恰一次** | ADV_C6 同单同 txn `Promise.all` 双回调 | **200 / 200**（无 5xx） | 恰一个 `credited` + 一个 `already` | 无 stuck 具名终态（C-4）：`payment_order.status='paid'` ∧ `provider_txn=注入 txn` ∧ 桶 delta=1 且恰单份 10 ∧ txn 全局恰 1 行无双行 |
| **C7 未知单/冒充 owner** | (a) 不存在订单（签名对该 id 合法）；(b) body 夹带 `owner`/`owner_user_id='advAttacker'` | **404** / **200** | `order_not_found` / `credited` | (a) 零副作用：幽灵单不落库、txn 全局 0 行、幽灵 owner 0 桶；(b) owner 不可伪造：攻击者 0 桶 0 合计、真 owner 恰 +10、订单 paid 且流水归属真 owner |

47 条断言逐条全绿（输出全文见文末附录）；`FAIL` 计数 **0**。

## C3 口径（裁决① · 结构性断言）

- **DISCLOSED**（prove 正文原样打印）：显式服务端金额复核比较路径今天不存在，当前保障=结构性（无金额通道+服务端权威定价）。依据 `commerce.service.ts:56`（回调体类型仅 `{providerTxn, sig}`，无金额字段）+ `:11-14`（PRODUCTS 服务端权威定价）；webhook 路径无任何金额读取。
- 断言带牙（非空壳）：夹带字段实测被忽略（回调 200 credited，非拒绝路径也非采纳）+ 入账单位逐单恒等于目录定价（pack_10=10 / pack_30=30，夹带 999999/1/1¢ 均未出现在任何落库列）。
- 本 receipt 与 proof 全文**无**「已实现金额复核 / 服务端金额复核已实现」类表述；未为凑 C3 改任何产品代码。

## AUDIT-OBSERVATION 逐类（裁决② · disclosed-not-blocking）

每个拒绝类 prove 正文逐条打印（`apps/api/test/uc-e2e-014-026-webhook-adv.proof.ts:67-75` AUDIT_LINE · 运行时扫描 webhook 产品路径源码交叉核验）：

| 类 | 值 | 依据（file:line） |
|----|----|--------------------|
| C1 | **AUDIT-OBSERVATION: absent** | `commerce.service.ts:56-70`（payWebhook 无任何 GuardrailHit/审计落库/安全日志 emit 点）+ `commerce-webhook.controller.ts:11-16`；运行时扫描 0 命中；pre-exec dual 全仓 grep `GuardrailHit`=0 命中 |
| C2 | **AUDIT-OBSERVATION: absent** | 同上 |
| C3 | **AUDIT-OBSERVATION: absent** | 同上 |
| C7 | **AUDIT-OBSERVATION: absent** | 同上 |

缺席处理：作为具名 residual **「审计后置未接线」（GuardrailHit/安全日志观察点今天不存在）** 带进 post-prove dual 与任何 gap→partial 翻行注记；未宣称告警/审计已实现；EXIT 仅由 C1–C7 决定（缺席非 EXIT 门槛，升格权在协调方）。

## F3 快照落点（fail-trigger#3：零副作用 before/after + exactly-once 终态快照的代码位置）

`apps/api/test/uc-e2e-014-026-webhook-adv.proof.ts`（行号 @本 commit）：
- 快照工具：`:88-96`（orderRow/bucketCount/bucketSum/txnRows，特权 pool 直查）
- C1 零副作用 before/after：`:128-141`（before :131 · after :135-141）
- C2 零副作用 before/after：`:149-160`
- C3 逐单入账==目录定价：`:172-187`
- C4 恰一次终态：`:196-207`（txn 恰 1 行 :205 · `status=paid`+txn 归属 :207）
- C5 恰 1 行 + 合计恰单份：`:212-227`（:222-226）
- C6 无 stuck 具名 DB 终态：`:241-246`（`status='paid'` :243 · `provider_txn`=注入 txn :244 · 桶 delta=1 恰单份 :245 · txn 恰 1 行 :246）
- C7 零副作用 + owner 不可伪造终态：`:254-270`

## Attempts 台账（全记录 · 无 retry-to-green）

| # | 开始（本地 -0700） | 结束 | CMD | EXIT | 备注 |
|---|--------------------|------|-----|------|------|
| 1 | 2026-10-03T06:05:34 | 2026-10-03T06:05:41 | `pnpm run uc014:webhook-adv:prove` | **0** | 首跑即绿 · 47/47 PASS · 无中断/失败 attempt · 无重跑 |

（无 EXIT1 attempt；若有将逐次记录且不记 flake——本刀无需援引该路径。）

## binding 条件自评（1–9）

1. **C3 结构断言口径** — 遵守。结构性断言 + DISCLOSED 披露 + 非空断言（夹带忽略 + 目录定价逐单断言）；无改口表述；做实，未触发 EXIT1。
2. **审计观察点 disclosed-not-blocking** — 遵守。C1/C2/C3/C7 逐类 `AUDIT-OBSERVATION: absent` + file:line；具名 residual「审计后置未接线」；无沉默；未宣称审计已覆盖；EXIT 仅由 C1–C7 决定。
3. **断言具体化** — 遵守。C6 无 stuck 落为 4 条 DB 终态断言（:243-246）；C5 provider_txn 恰 1 行 + 两账户合计恰单份（:222-226）；C1–C7 逐项 HTTP+错误码+DB 快照，47 条非空壳。
4. **隔离与密钥卫生** — 遵守。三层包装 + 随机容器/动态端口/迁移白名单（harness 固定名单）；`PAY_PROVIDER_SECRET` 只走进程环境；不入库不入 .env；`releaseEvidence=false`。
5. **attempts 全台账** — 遵守。恰 1 次 attempt（EXIT=0），无 retry-to-green，无隐瞒。
6. **互不替代与禁碰** — 遵守。`neg-commerce.proof.ts` / `full.e2e.ts` 零改动（git status 可证）；UC-018/052/025/004 行与文件零触碰；EXIT 0 不翻行不 covered；coveredCount=8；SSOT（矩阵/backlog/checklist）零触碰。
7. **Pins 原值** — 遵守。haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503（未触任何 pin 承载文件）。
8. **非阻塞修正** — 已做。harness 引 A1–A3 `:542` 改 `:540@b790b45`（实测 `e2e-scenarios.md:540`=「**验收**：A1…A2…A3…」行；原内容一字未错，仅行号漂移），并注记修正来源；产品/矩阵引用行号均附 @SHA（@`b790b45`）。
9. **镜像 digest** — 遵守。mirror 拉取的 pgvector:pg16 与 canonical tag 同 ID 同 RepoDigest（`sha256:7b822b0a…`），canonical tag 在位，pull/inspect 记录见「隔离与密钥卫生」节。

## 与既有 prove 的关系（互不替代）

`neg-commerce.proof.ts` §4 与 `e2e/full.e2e.ts` 的 webhook 子集断言继续是各自 prove 的锚点，本刀未改这两个文件；本 receipt 是独立的七类矩阵收据（含零副作用/恰一次 before-after 快照），不以其替代本刀，也不以本刀替代它们。

## 局限（诚实保留 · 非 gap 翻转依据）

- 单实例 + 单容器：**NOT_HA**；本绿不证明多实例竞争/fault-inject 面（`releaseEvidence=false` 维持）。
- 审计后置（GuardrailHit/安全日志）absent（见上），属产品 residual，非本 prove 门槛。
- C3 保障=结构性（无金额通道+服务端权威定价）；显式金额比较拒绝路径今天不存在，如实披露，未发明。

## 附录 — prove 全输出（stdout 原样 · 47 PASS / 0 FAIL / 4 AUDIT-OBSERVATION / 2 DISCLOSED）

```
PINS: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503 · row stays gap
EXIT 契约: EXIT 0 ⇔ C1–C7 全立；任一不成立 → EXIT 1 诚实保留 gap。EXIT 0 ≠ 翻行 ≠ covered。
PASS  [C1] 伪造签名(等长 hex) → 403 bad_signature
PASS  [C1] 垃圾短签名 → 403 bad_signature
PASS  [C1] 他单签名打到本单 → 403 bad_signature
PASS  [C1] 零副作用: 订单 status 仍 created
PASS  [C1] 零副作用: provider_txn 仍 NULL（未落流水）
PASS  [C1] 零副作用: 订单 units/amount 不变(10/9900)
PASS  [C1] 零副作用: entitlement 桶数/合计不变
PASS  [C1] 零副作用: provider_txn 全局 0 行
AUDIT-OBSERVATION: absent class=C1 basis=apps/api/src/modules/commerce/commerce.service.ts:56-70 + commerce-webhook.controller.ts:11-16 (runtime scan of webhook product path: 0 GuardrailHit/audit-log/security-log emit points; pre-exec dual 全仓 grep GuardrailHit=0 命中) — disclosed-not-blocking，非 EXIT 门槛；缺席作具名 residual「审计后置未接线」带进 post-prove dual。
PASS  [C2] 空 body → 400 invalid_callback
PASS  [C2] 缺 sig → 400 invalid_callback
PASS  [C2] 缺 providerTxn → 400 invalid_callback
PASS  [C2] 零副作用: 订单 status 仍 created + provider_txn 仍 NULL
PASS  [C2] 零副作用: 桶数/合计不变
PASS  [C2] 零副作用: provider_txn 全局 0 行
AUDIT-OBSERVATION: absent class=C2 （basis 同上）
DISCLOSED: 显式服务端金额复核比较路径今天不存在，当前保障=结构性（无金额通道+服务端权威定价）。
DISCLOSED: 依据 commerce.service.ts:56（回调体类型仅 {providerTxn, sig}，无金额字段）+ :11-14（PRODUCTS 服务端权威定价）；webhook 路径无任何金额读取。
PASS  [C3] 夹带 amountCents/units/amount → 字段被忽略, 回调 200 credited
PASS  [C3] 入账单位恒等于目录定价 pack_10=10（夹带 999999 未入账）
PASS  [C3] 订单落库 units/amount 仍目录权威 10/9900（夹带值未落库）
PASS  [C3] pack_30 夹带 amountCents=999999/units=1 → 忽略, 200 credited
PASS  [C3] 入账单位恒等于目录定价 pack_30=30（夹带 1 未入账）
PASS  [C3] 订单落库 units/amount 仍目录权威 30/24900
PASS  [C3] 结构性双拦: 全局无第二条流水（每单恰 1 行 txn）
AUDIT-OBSERVATION: absent class=C3 （basis 同上）
PASS  [C4] 首次回调 → 200 credited
PASS  [C4] 重放回调 → 200 already（幂等去重，不双入）
PASS  [C4] 桶恰 +1（不重复入账）
PASS  [C4] 入账额恰单份 10
PASS  [C4] provider_txn 全局恰 1 行
PASS  [C4] 终态: status=paid 且 provider_txn=注入 txn
PASS  [C5] 第一张订单 → 200 credited
PASS  [C5] 跨订单重放 → 409 order_conflict（非 5xx）
PASS  [C5] provider_txn 全局恰 1 行
PASS  [C5] 唯一流水归属第一张订单（B 仍 created + provider_txn NULL）
PASS  [C5] 两账户合计恰单份 10（A=10, B=0）
PASS  [C6] 并发双回调 → 无 5xx（都 200）
PASS  [C6] 恰一个 credited（CAS 裁决，不双结算）
PASS  [C6] 另一个为 already（幂等收敛）
PASS  [C6] 无 stuck 终态: payment_order.status=paid
PASS  [C6] 无 stuck 终态: provider_txn=注入 txn
PASS  [C6] 无 stuck 终态: 桶 delta=1 且入账恰单份 10
PASS  [C6] 无 stuck 终态: provider_txn 全局恰 1 行（无双行）
PASS  [C7] 未知订单(合法签名) → 404 order_not_found
PASS  [C7] 零副作用: 幽灵单不落库
PASS  [C7] 零副作用: provider_txn 全局 0 行
PASS  [C7] 零副作用: 幽灵 owner 无桶
PASS  [C7] body 夹带 owner 冒充 → owner 不可伪造, 入账真 owner
PASS  [C7] 攻击者 advAttacker 0 桶（冒充无效）
PASS  [C7] 真 owner 入账恰单份 10
PASS  [C7] 终态: 订单 paid 且流水归属真订单
AUDIT-OBSERVATION: absent class=C7 （basis 同上）

断言合计: 47 条, 失败 0 条
  C1: ALL PASS / C2: ALL PASS / C3: ALL PASS / C4: ALL PASS / C5: ALL PASS / C6: ALL PASS / C7: ALL PASS

EXIT=0 — C1–C7 七类 webhook ADV 真证据全部成立（47 条断言全绿）。
EXIT 0 ≠ 翻行 ≠ covered：ADV gap→partial 须 post-prove dual PASS + 协调方授权；coveredCount=8 不动。
releaseEvidence=false · NOT_HA · local green ≠ HA · need multi-instance + fault-inject for releaseEvidence.
```

（shell 层输出：`E2E isolated PostgreSQL: meetwise-e2e-55608-1791032735003 on 127.0.0.1:57289` · R5-MARKED-RED banner 原样打出。）

---

*Receipt · GAP-UC014-026-WEBHOOK-ADV · NHP-014-ADV-01 · UC-E2E-014·026 ADV 七类 · EXIT=0 · row stays gap · coveredCount=8 · STOP——post-prove 双审由协调方另派，禁自批。*
