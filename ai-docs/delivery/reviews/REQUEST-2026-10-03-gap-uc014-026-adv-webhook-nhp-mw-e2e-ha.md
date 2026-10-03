# REQUEST — **NHP-014-ADV-01 · UC-E2E-014·026 webhook ADV 真证据** · pre-exec · mw-e2e-ha

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Expert**: `mw-e2e-ha`
**Knife**: `harness/gap-uc014-026-adv-webhook-nhp.md` · slice `gap-uc014-026-adv-webhook-nhp.slice.md`
**Parent tip**: `0345315`（series open · not a prove tip）
**Date**: 2026-10-03

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

## 请审什么（mw-e2e-ha 视角）

矩阵 `NHP-014-ADV-01` / §1.0.1 `UC-E2E-014/026` ADV **gap**（「重放/篡改七类未全铺」）。本刀 REQUEST 为该行求七类 webhook ADV 可复现真证据。请审：

1. **七类注入可执行性**：C1 伪造签名 / C2 缺字段 / C3 夹带金额字段 / C4 同单重放 / C5 跨订单同 providerTxn / C6 并发乱序重复 / C7 未知单+冒充 owner。注入路径唯一 = `POST /commerce/webhook/pay/:id`（无登录态；`commerce-webhook.controller.ts:12`）；产品事实 = `commerce.service.ts:56-68`（缺字段 400 → HMAC `timingSafeEqual` fail-closed 403 → owner-gateway 404 → exactly-once CAS）。
2. **EXIT 契约**：EXIT 0 = C1–C7 每类 HTTP 状态码+响应体+DB before/after 快照断言全成立（C1/C2/C3/C7 零副作用：PaymentOrder 状态与桶不变；C4–C6 恰一次：桶/额/provider_txn 行数）；任一不成立/做不出 → **EXIT 1 诚实保留 gap**。EXIT 0 也不自动翻行：ADV gap→partial 还须 post-prove dual + 协调方授权。
3. **诚实失败路径**：C3 必须如实按「结构性无金额通道」断言，**Ban** 改口「已实现金额复核」；审计后置（GuardrailHit）只披露 observed/absent，不作 EXIT 门槛（case 行期望=幂等+拒）。EXIT1 打印 `GAP-UC014-026-WEBHOOK-ADV` 明细；**Ban** 把 EXIT1 说成 flake。
4. **隔离与安全**：prove 走 `scripts/run-e2e-isolated.mjs` 隔离壳（同 `neg:commerce` 三层包装，`package.json:95` 先例）；`PAY_PROVIDER_SECRET` 只经隔离壳进程环境，Ban secrets/`.env*` 入树入 receipt；`releaseEvidence=false`。
5. **口径与既有 prove 关系**：`neg-commerce.proof.ts` §4（重放/并发/跨订单子集）与 `full.e2e.ts`（错签 403/未知单 404，Key-blocked）与本刀收据**互不替代**；本刀不改这两个文件。receipt 落点 `receipts/2026-10-03-gap-uc014-026-adv-webhook-nhp-prove.md`。
6. **G7 列闸**：NEG 内嵌 C1/C2/C3/C7（拒+错误码+零副作用）；NEG/FAULT/BOUND 保持既有 partial 不动；PERF/LOAD 显式 blind（Ban n/a 偷关、Ban wash）。

Row **`UC-E2E-014/026`** ADV column stays gap. Case `NHP-014-ADV-01` stays gap→case-only. **Ban covered** · coveredCount=8. **Ban 翻任何 SSOT 行**。**Ban 碰 UC-018 / UC-052 / UC-025 / UC-004 任何行/文件**（UC-052 stays partial）。**Ban retry-to-green · attempts 全记录**。

本 stub 不授权 coding / prove / push。pre-exec dual PASS 后由协调方授权 prove；implementer 不自批。Dual PASS ≠ coding ≠ nail.

---

*Stub · awaiting expert pre-exec dual · STOP*

---

# PRE-EXEC dual · NHP-014-ADV-01 webhook ADV · mw-e2e-ha（docs gate only · Ban prove · Ban product edit）

**Reviewed SHA**: `0cf8591`（`0cf8591b09a6439c25b984235d27bd3d4209f266`，= origin tip；ancestor-of-origin 核实通过；docs-only 恰 4 新增 md：slice + harness + 两 stub，零代码/零 SSOT 改动，`git show --name-status` 全 A）
**Reviewer**: `mw-e2e-ha` · adversarial evidence-honesty · 本签只覆盖本 stub 视角；mw-rag-route stub 未签、不代签（alone ≠ dual）。本 PASS ≠ prove 授权 ≠ coding 授权 ≠ 翻行。

## 检查表（file:line 证据 · 全部实读源码/SSOT 核实）

| # | 项 | 证据 | 结论 |
|---|----|------|------|
| 1 | docs-only 4 md、无 SSOT edit | `git show --name-status 0cf8591`：A×4（slice/harness/两 stub） | PASS |
| 2 | 矩阵行引用忠实 | `ai-docs/delivery/non-happy-path-perf-load-case-matrix.md:60`（014/026·ADV·幂等+拒·gap→case-only·错签 403 partial 仅子集）；`e2e-requirement-coverage-matrix.md:119`（§1.0.1 NEG/FAULT/BOUND partial · ADV gap）；`:177`（§1.1「主路径 covered-ish；重放/篡改七类未全铺」） | PASS |
| 3 | scenarios 原文引用忠实 | `ai-docs/requirements/use-cases/e2e-scenarios.md` UC-E2E-026 :536 E-伪造签名 / :537 E-篡改金额 / :538 E-重放 / :539 后置 GuardrailHit / :542 A1-A3 / :544-546 TC-E2E-026-*；UC-E2E-014 :518-523（A1/A2/A3 + TC-idem/amount） | PASS |
| 4 | 产品事实①验签链 | `apps/api/src/modules/commerce/commerce.service.ts:57`（400 invalid_callback）· `:59-61`（HMAC+`timingSafeEqual`，`:60` `!secret` fail-closed → 403 bad_signature）· `:62-64` owner 走 `asGateway` 无表权限函数 · `:65`（404 签名再对也不入账）· `:66-68` CAS → credited/already/409 | PASS |
| 5 | 产品事实②无登录态入口 | `apps/api/src/modules/commerce/commerce-webhook.controller.ts:12` `@Post('pay/:id')`，controller 不挂 PrincipalGuard | PASS |
| 6 | 产品事实③exactly-once CAS | `packages/db/src/payment.ts:59-93`：`UPDATE...WHERE status='created' AND NOT EXISTS(claimed provider_txn)` + partial global UNIQUE + savepoint 23505→`conflict`；同单同 txn 重放→`already`——C4/C5/C6 断言可机检 | PASS |
| 7 | 产品事实④C3 结构性无金额通道 | `commerce.service.ts:56` 回调体类型 `{providerTxn?, sig?}`；`:24-31` createOrder 金额/units 由服务端 `PRODUCTS` 目录派生（`:12-13` pack_10=10/pack_30=30）；webhook 路径无任何金额读取 | PASS |
| 8 | 审计观察点缺席属实 | 全仓 grep `GuardrailHit`（*.ts/*.sql，除 node_modules）零命中；webhook 路径无安全日志 emit 点 | PASS |
| 9 | 现状覆盖=子集、无专用 uc014 prove | `apps/api/test/` 无 `uc-e2e-014*`；root/apps package.json 无 `uc014` script；`apps/api/test/neg-commerce.proof.ts` §4 :277 起（缺 sig 400 :282-284、冒充 owner :315、重放 :320-325、并发 :344-347、跨订单 409+provider_txn 1 行 :352-359）确为子集且无零副作用 before/after 快照；`e2e/full.e2e.ts:319-322` 错签 403/未知单 404（Key-blocked 声明为环境相关、非本刀承重） | PASS |
| 10 | 隔离壳先例 | `package.json:95` `"neg:commerce": "node scripts/run-e2e-isolated.mjs neg:commerce"`；`scripts/run-e2e-isolated.mjs` :2053-2064 动态端口（`-p 127.0.0.1::5432` + `docker port` 解析）+ 随机容器 + 迁移；头注「local green ≠ HA · need multi-instance + fault-inject for releaseEvidence」 | PASS |
| 11 | EXIT 契约可机检 | harness「EXIT 契约」节：C1-C7 每类 HTTP 码+错误体（`invalid_callback`/`bad_signature`/`order_not_found`/`order_conflict`/`credited`/`already`）+ DB before/after（C1/C2/C3/C7 零副作用；C4-C6 恰一次：桶 delta、units==目录价、provider_txn 行数）；EXIT1 打印 `GAP-UC014-026-WEBHOOK-ADV` 明细 | PASS（附 C-4 一处具体化要求） |
| 12 | G7 列闸 | NEG 内嵌 C1/C2/C3/C7（业务拒+错误码+零副作用）满足「缺 NEG+PERF 列不得合入」（`execution-master-checklist.md:73`）；PERF_api/PERF_web/LOAD_worker（`e2e-requirement-coverage-matrix.md:64-66`）对本行无 case → harness 写**显式 blind** 非 n/a | PASS |
| 13 | Pins 原值 | 与 `PARALLEL-DISPATCH-2026-10-02.md:3` 及矩阵 pins 块逐字一致（NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · DELETE=503） | PASS |
| 14 | 禁碰与不翻行 | commit 未触 UC-018/052/025/004 行/文件；两 stub/harness/slice 均钉 row stays gap、EXIT 0 ≠ 翻行、Ban covered、Ban 改 `neg-commerce.proof.ts`/`full.e2e.ts` | PASS |

## 两开放口径裁决（写进 Conditions）

**① C3「篡改金额」：裁结构性断言为诚实 EXIT-0 可达路径；不要求显式金额不符拒绝路径。**
依据：产品回调体结构性无金额通道（`commerce.service.ts:56` 仅 `{providerTxn, sig}`；金额/units 由服务端目录派生 `:24-31`），「篡改金额不入账」这一安全性质今天由「无通道 + 服务端权威定价」**真实成立**。要求显式比较拒绝路径 = 要求改产品 = Ban 改产品迁就 prove；若协调方口径改为要求显式路径，唯一诚实出口是 **EXIT 1 保留 gap**，不得现场改产品凑绿。但结构性断言必须带牙（见 C-2）：夹带字段忽略 + DB units==目录价逐单断言 + receipt 显式 DISCLOSED「显式金额复核路径今天不存在」，**Ban** 任何「已实现金额复核」表述。

**② 审计观察点（GuardrailHit/安全日志）：裁 disclosed-not-blocking，不作 EXIT 门槛；缺席必须显式记录，不得沉默。**
依据：EXIT 门槛基准 = case 矩阵行期望「幂等+拒」（`non-happy-path-perf-load-case-matrix.md:60`），七类拒/幂等行为可完全机检；GuardrailHit 是 scenarios 后置（`e2e-scenarios.md:539`）且产品今天无观察点（全仓零命中）。把缺席升格为 EXIT 门槛会把「产品缺审计接线」与「ADV 证据刀」混为一谈——但缺席是真实产品 gap，必须披露并带进翻行评估（见 C-3）。若协调方后续升格为门槛，同样只走 EXIT 1，不走 wash。

## Fail-trigger audit（出现任一 → 本审改 FAIL / prove 判不成立）

1. C3 receipt/矩阵出现「已实现金额复核」「服务端金额复核已实现」类表述；或为凑 C3 改产品加金额通道。
2. EXIT1 被记为 flake/环境问题；attempts 台账缺次（只留绿色 attempt）；循环重跑至绿（retry-to-green）。
3. C5 出现双行 provider_txn 或双账户入账仍报绿；零副作用断言（C1/C2/C3/C7）缺 DB before/after 快照。
4. PERF/LOAD 写 n/a 而非显式 blind；用本刀绿 wash PERF/LOAD 或 NEG/FAULT/BOUND 列。
5. Pins 改口、coveredCount≠8、任何 SSOT 行翻转、covered 字样写入、触碰 UC-018/052/025/004 行/文件、改 `neg-commerce.proof.ts`/`full.e2e.ts` 既有断言。
6. secrets/`.env*` 入树或入 receipt；`PAY_PROVIDER_SECRET` 未经隔离壳进程环境注入。
7. dual PASS 前执行 prove；或 implementer 自批/self-approve；或以本 PASS 冒充双签。

## Blockers

无（docs gate 层面无阻断缺陷）。 prove 执行前置未决项仅剩：mw-rag-route stub 独立签署（不代签）+ 协调方授权 go。

## Conditions

- **C-1 授权链**：prove 仅在 pre-exec dual（mw-e2e-ha + mw-rag-route 各自独立签）+ 协调方授权后执行；implementer 不自批；alone ≠ dual；本 PASS 不授权 coding/prove/push。
- **C-2 C3 结构性契约**：prove 须逐单断言夹带 `amountCents`/额外字段被忽略 + DB `entitlement_bucket` units == 目录价（pack_10=10 `commerce.service.ts:12` · pack_30=30 `:13`）；receipt 必须含显式 DISCLOSED 行「显式服务端金额复核比较路径今天不存在，当前保障=结构性（无金额通道+服务端权威定价）」并附 file:line；Ban「已实现金额复核」表述；口径若改为显式路径 → EXIT 1 唯一出口。
- **C-3 审计观察点披露**：每个拒绝类（C1/C2/C3/C7）receipt 打 `AUDIT-OBSERVATION: absent|observed`（附 file:line 依据，当前预期 absent）；缺席作为具名 residual 带进 post-prove dual 与任何 gap→partial 翻行注记（「审计后置未接线」）；Ban 宣称告警/GuardrailHit 已实现；非 EXIT 门槛，升格权在协调方。
- **C-4 断言具体化**：C6「无 stuck」须落为具体 DB 终态断言（双回调完成后 `payment_order.status='paid'` AND `provider_txn`=注入 txn AND 桶 delta=1），不得留模糊措辞；C5 须含 `payment_order.provider_txn` 恰 1 行 + 两账户合计恰单份。
- **C-5 隔离与密钥卫生**：沿用 `run-e2e-isolated` 三层包装（root `:prove` → isolated 壳 → apps/api `:raw`/prove，`package.json:95` 先例）+ 动态端口/随机容器/迁移；`PAY_PROVIDER_SECRET` 只经进程环境；Ban secrets/`.env*` 入树入 receipt；`releaseEvidence=false` 不变。
- **C-6 EXIT1 诚实路径**：任一类做不出 → EXIT 1 + 打印 `GAP-UC014-026-WEBHOOK-ADV`（哪类哪断言未证 + file:line）+ receipt `ai-docs/delivery/receipts/2026-10-03-gap-uc014-026-adv-webhook-nhp-prove.md`；attempts 全记录（EXIT+时间戳）；Ban retry-to-green；Ban flake 标签；Ban invent fix。
- **C-7 互不替代与禁碰**：本 prove 不替代 `neg:commerce` §4 / `full.e2e` 子集锚点，不改该两文件；Ban 碰 UC-018/052/025/004 行/文件；NEG/FAULT/BOUND 列保持既有 partial 不动；PERF/LOAD 显式 blind；Pins 原值逐字保留；coveredCount=8；row `UC-E2E-014/026` ADV stays gap、case stays gap→case-only；EXIT 0 ≠ 翻行 ≠ covered（翻行须 post-prove dual + 协调方授权）。

## 中文摘要（3 行）

1. REQUEST `0cf8591` docs-only 恰 4 md，矩阵/scenarios/产品事实逐条 file:line 实核属实（验签链 400/403/404/409、CAS exactly-once、回调体无金额通道、GuardrailHit 全仓零命中），EXIT 契约七类逐项可机检，隔离壳/Pins/G7 列闸/禁碰全部合规。
2. 口径①裁结构性断言为诚实 EXIT-0 路径（不要求显式金额拒绝路径、Ban 改产品迁就 prove，但 receipt 须披露「显式复核不存在」）；口径②裁审计观察点 disclosed-not-blocking（缺席显式记录并作翻行 residual，非 EXIT 门槛）。
3. 无 Blockers；7 条 Conditions（C-1~C-7）随prove 执行强制；本 PASS 仅 docs gate 单侧签，mw-rag-route 须独立签署、prove 须协调方授权，EXIT 0 ≠ 翻行 ≠ covered。

Verdict: PASS
