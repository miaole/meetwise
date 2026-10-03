# Harness — **GAP-UC014-026-WEBHOOK-ADV · NHP-014-ADV-01**（支付 webhook 伪造/篡改/重放 ADV 真证据 · docs REQUEST · **`draft:awaiting_pre_exec_dual`** · row stays gap）

**Status**: **`draft:awaiting_pre_exec_dual`**（L0 docs REQUEST only · Ban coding · Ban prove 执行 · Ban push · Ban self-approve · Ban invent a fix · this commit is not coding authorization and is not a prove）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Date**: 2026-10-03
**Base / parent tip**: `origin/feat/mysql-schema-skeleton` **`0345315`** / full `0345315d19c92f038519e6e4b5ebd680f36c6441`（Line K worktree `/Users/miaole/Desktop/golucky/meetwise-line-k` · branch `line/k-next-nhp`）
**Knife**: **NHP-014-ADV-01 / UC-E2E-014·026 ADV 列 · webhook 重放/篡改七类真证据**（一刀一行 · ADV 一列；不是把 `neg:commerce` / `full.e2e` 既有子集断言当七类已全铺）
**Gap id**: **`GAP-UC014-026-WEBHOOK-ADV`**（本刀新具名 · 对应矩阵 ADV gap 读法「重放/篡改七类未全铺」；不改任何既有 gap id）
**Case id**: **`NHP-014-ADV-01`**
**Row**: **`UC-E2E-014 / 026`**（ADV 列）· not UC-E2E-018 · not UC-E2E-052 · not UC-E2E-025 · not UC-E2E-004
**Experts**: `mw-e2e-ha` + `mw-rag-route`（stubs PENDING · Ban self-approve · alone ≠ dual；本行非隐私域——commerce webhook ADV 无 PII/擦除面，故不换 `mw-privacy-int`）
**Authority**: meetwise — docs REQUEST only · Ban secrets / `.env*` · Ban force-push · Ban push · Ban SSOT edit · Ban invent a fix · Ban coding

## 选行（Line K · 一刀一行）

通读两矩阵后全部 status=gap|blind 行已盘点；**排除**：UC-018（D'/D/E/G 线 FINAL · flip-ban 生效）、UC-052（F/G/A' 线 · stays partial）、UC-025（B'/H/B'' 线门锁）、UC-004（C'/C'' 线）。未占用行中无 P0-backlog 具名对等行（GAP-RAG-03 P0 是过滤落点 ADR 方向行、RAG 域 G-R4-5 线密集；GAP-PRIV-* P0 行冻结/占用：DELETE=503 冻结、Qdrant STOPPED、INT-TRANSCRIPT 另包）。据此选 **`NHP-014-ADV-01`**：需求源枚举最全（E-伪造签名/E-篡改金额/E-重放 + A1/A2/A3 + TC-E2E-026-\*）、产品接线真实（`payWebhook` HMAC fail-closed + owner-gateway + exactly-once CAS）、钱路径优先、现有覆盖仅子集且部分依赖 Key → **prove 可落地性最高**。

## Quoted from the files

`non-happy-path-perf-load-case-matrix.md:60` row **`NHP-014-ADV-01`**: `014/026 | ADV | api | webhook 重放/篡改七类 | 幂等+拒 | **gap**→**case-only** | 错签 403 partial 仅子集`。

`e2e-requirement-coverage-matrix.md:119`（§1.0.1）row **`UC-E2E-014 / 026`**: NEG **partial** · FAULT **partial** · BOUND **partial**（入账幂等）· ADV **gap** · 读法「重放/篡改七类未全铺」。`:177`（§1.1）:「主路径 covered-ish；重放/篡改七类未全铺」。

`ai-docs/requirements/use-cases/e2e-scenarios.md` UC-E2E-026（:528 起）: E-伪造签名「验签 fail-closed → 拒绝、不改状态、告警」（:536）· E-篡改金额「验签 + 服务端金额复核 → 双拦不入账」（:537）· E-重放「幂等键去重 + 验签兜底 → 不重复发放」（:538）；验收 A1 伪造签名被拒、PaymentOrder 不变 · A2 篡改金额不入账 · A3 重放不二次发放（:542）；后置「非法回调零副作用，审计落 GuardrailHit/安全日志」（:539）；TC-E2E-026-forged-sig / tamper-amount / replay（:544-546）。UC-E2E-014（:518 起）: A1 重复回调仅充值一次 · A2 金额不符不入账并告警 · 重复/乱序回调幂等键。

`scripts/run-e2e-isolated.mjs` 头注口径:「local green ≠ HA · need multi-instance + fault-inject for releaseEvidence」。

## 现有 prove 缺什么（读源码结论 · 本刀的靶）

- **无专用 uc014 proof**：`apps/api/test/` 无 `uc-e2e-014*`，root/apps `package.json` 无 `uc014` script（grep 0 命中）。七类 ADV 无任何单一机器可复核收据。
- 覆盖散且为**子集**：`apps/api/test/neg-commerce.proof.ts` §4（:277 起「异步 webhook…无鉴权仍 fail-closed + 重放/并发不双入」）已有同单重放（:322-326 credited/already/桶 1/恰 10）、并发双回调（:344-347）、跨订单同 providerTxn 409（:352-359）；`e2e/full.e2e.ts` 有错签 403（:319-320）+ 未知单 404（:321-322）——但 full.e2e 需 `MODEL_API_KEY`，本环境 **blocked**，且两者都**不是** ADV 七类的完整矩阵，也无 PaymentOrder 状态/零副作用的 before-after 快照断言。
- 产品现状（本树读码）：`apps/api/src/modules/commerce/commerce.service.ts:56-68` `payWebhook` = 缺字段 400（:57-58）→ HMAC `timingSafeEqual` fail-closed 403（:59-61）→ owner 由无表权限网关函数读取、查不到单 404（:62-65）→ exactly-once `markOrderAndCredit` CAS（:66-68）。**回调体只有 `{providerTxn, sig}`，无金额通道**——「篡改金额」面今天是结构性的（服务器权威定价），不是已实现的显式金额复核；本刀必须按此如实断言，**不得**改口称「已实现金额复核」。
- 审计后置（GuardrailHit/安全日志）当前无观察点 → prove 只能如实披露 observed/absent，不作 EXIT 门槛（本 case 行期望=「幂等+拒」）。

## ADV 七类注入表（inject what · 恰七类）

| id | 注入什么 | 注入在哪 | 观察什么 |
|----|----------|----------|----------|
| **C1 伪造签名** | 错签/垃圾 sig（合法单+合法 txn） | `POST /commerce/webhook/pay/:id`（无登录态，`commerce-webhook.controller.ts:12`） | 403 `bad_signature` + **零副作用**：PaymentOrder 状态不变、entitlement 桶不变（DB before/after 快照） |
| **C2 缺签名/缺字段** | 缺 `sig` 或缺 `providerTxn` | 同 C1 | 400 `invalid_callback` + 零副作用快照 |
| **C3 篡改金额/夹带金额字段** | 请求体夹带 `amountCents`/篡改 body | 同 C1 | 不入账多额：夹带字段被忽略（或拒），入账单位恒等于产品定价（pack_10=10 / pack_30=30）；如实记录「无金额通道=结构性双拦」而非显式金额复核 |
| **C4 重放合法回调** | 同单同 txn 顺序重放 | 同 C1 | 首 `credited` / 次 `already`；桶恰 1；入账额恰单份 |
| **C5 重放跨订单** | 同 providerTxn 打两张不同订单 | 同 C1 | 恰一笔 credited；另一笔 409 `order_conflict`（非 5xx）；`payment_order.provider_txn` 落库恰 1 行；两账户合计恰一份 |
| **C6 并发/乱序重复回调** | 并发同单同 txn 双回调 | 同 C1 | 恰一个 `credited`；无双入；无 stuck |
| **C7 未知订单/冒充 owner** | 签名对但订单不存在 / body 夹带 owner | 同 C1 | 404 `order_not_found`（签名再对也不入账）；owner 不可伪造（owner-gateway 不信调用方）+ 零副作用快照 |

C1/C2/C3/C7 内嵌 **NEG 面**（业务拒 + 可解释错误码 + 零副作用），满足 G7「必须带 NEG」硬闸。本刀只动 **ADV** 列；NEG/FAULT/BOUND 列保持既有 partial（不动、不翻）；PERF_api / PERF_web / LOAD_worker **显式 blind**（本行无 PERF/LOAD case，Ban 用 n/a 偷关，Ban 用本刀绿 wash PERF/LOAD）。

## Prove CMD（授权后才存在 · 本 docs commit 不添加任何代码）

- 待授权产物：`apps/api/test/uc-e2e-014-026-webhook-adv.proof.ts` + root script `uc014:webhook-adv:prove`（走 `scripts/run-e2e-isolated.mjs` 隔离壳，同 `neg:commerce` 三层包装形态：root `:prove` → `:raw` → apps/api `prove:*`，见 `package.json:95` 先例；复用 `_neg-harness.ts` 惯例）。本 REQUEST 一个代码行都不加。
- Prove 必须：真实起 api + 隔离 PG、真实执行 C1–C7 注入、每类 HTTP 状态码+响应体+DB before/after 快照逐项断言、全输出落 receipt。

## EXIT 契约（含诚实保留路径）

- **EXIT 0 = 七类 ADV 真证据成立**，当且仅当 C1–C7 每类断言全部成立（含零副作用/恰一次 DB 快照）。EXIT 0 也不自动翻行：ADV gap→partial 还须 post-prove dual PASS + 协调方授权，implementer 不自批；**Ban covered**。
- **EXIT 1 = 诚实保留 gap**：任一类做不出/断言不成立（例：夹带金额字段真被采纳入账、或审方要求显式金额不符拒绝路径而产品无此通道、或 C5 并发下出现双行 provider_txn）。prove 须打印 `GAP-UC014-026-WEBHOOK-ADV` 明细（哪类哪断言未证、file:line 依据），如实落 receipt；**保持 gap，Ban invent fix，Ban 把 EXIT1 说成 flake**。
- 与既有 `neg:commerce` / `full.e2e` 断言**互不替代**：它们继续是各自 prove 的子集锚点；本刀不改动这两个文件。
- **attempts 全记录 · Ban retry-to-green**：每次 prove attempt（含中断/失败）逐次记录 EXIT 与时间戳；不得只留绿色 attempt 或循环重跑至绿。

## Receipt 落点

`ai-docs/delivery/receipts/2026-10-03-gap-uc014-026-adv-webhook-nhp-prove.md`（prove 全输出 · EXIT 值 · C1–C7 逐项结果 · DB 快照 · attempt 台账）；如 emit 结构化证据另附同名 `.json`。`releaseEvidence=false` 惯例不变。

## Ban 列表

- **Ban coding**（本 turn docs-only）；**Ban prove 执行**（prove 需 pre-exec dual PASS 后由协调方授权）；**Ban push**。
- **Ban covered**：不写 covered、不翻 `UC-E2E-014/026` 行、不翻 `NHP-014-ADV-01` 行、coveredCount 保持 8。
- **Ban 翻任何 SSOT 行**：矩阵/backlog/checklist 只在 nail 改；本刀零 SSOT edit。
- **Ban 碰 UC-018 / UC-052 / UC-025 / UC-004 任何行/文件**（不 flip UC-018 · UC-052 stays partial · UC-025 门锁生效 · UC-004 归 C'' 线）。
- Ban invent a fix · Ban product code · Ban 把「结构性无金额通道」改口为「已实现金额复核」· Ban 伪造入账/双入 · Ban 改 `neg-commerce.proof.ts` / `full.e2e.ts` 现有断言 · Ban 把 EXIT1 记成 flake/环境问题。
- Ban secrets / `.env*`（`PAY_PROVIDER_SECRET` 只经隔离壳进程环境，值不入树不入 receipt）· Ban force-push · Ban SSOT edit · **Ban self-approve（alone ≠ dual）**。

## Scope

本 REQUEST 只为 `NHP-014-ADV-01` / `UC-E2E-014·026` ADV 列求七类真证据。不 widen：不动 NEG/FAULT/BOUND 列（保持 partial）；不碰 UC-011 refund-callback（`NHP-011-ADV-01` 产品口缺失，归其它刀）；不碰 UC-019 regenerate、UC-033 七类越权（另一套「七类」）；不碰 PERF/LOAD 行；不碰 RAG/R4/R5 行。验收口径以 `e2e-scenarios.md` UC-E2E-014/026 原文为准，不发明新验收标准。

## Pins

NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=**8** · ms3EqualsR4Closed=false · PG-retained · public DELETE stays **503** · row stays gap · STOP

*Harness · NHP-014-ADV-01 · UC-E2E-014·026 ADV · webhook seven-class evidence · awaiting_pre_exec_dual · ADV gap · STOP*
