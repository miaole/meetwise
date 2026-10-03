# REQUEST — **NHP-014-ADV-01 · UC-E2E-014·026 webhook ADV 真证据** · pre-exec · mw-rag-route

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Expert**: `mw-rag-route`（第二独立审 · 本行非隐私域 → 不换 mw-privacy-int：commerce webhook ADV 无 PII/擦除面）
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

## 请审什么（mw-rag-route 视角 · 独立第二审）

1. **选行与枚举忠实性**：`NHP-014-ADV-01`（矩阵 :60，gap→case-only）+ §1.0.1 `UC-E2E-014/026` ADV gap「重放/篡改七类未全铺」；七类 C1–C7 枚举是否与 `e2e-scenarios.md` UC-E2E-014/026 原文（E-伪造签名/E-篡改金额/E-重放 + A1/A2/A3 + TC-E2E-026-\*）一致，**Ban invent 验收标准**。
2. **诚实路径**：C3「篡改金额」必须按产品事实（`commerce.service.ts:56-68` 回调体无金额通道 = 结构性双拦）如实断言与记录，**Ban** 把结构性事实洗成「已实现服务端金额复核」；审计后置（GuardrailHit）缺席须如实披露，不作 EXIT 门槛、不得沉默。EXIT 1 = 诚实保留 gap（打印 `GAP-UC014-026-WEBHOOK-ADV` 明细），**Ban** 把 EXIT1 说成 flake，**Ban invent fix**。
3. **越界禁令**：本刀不碰 RAG/R2/R4/R5 任何行（`gR45Closed=true` 原值保留；NHP-R4-\* 归 G-R4-5 线群）；不改 `neg-commerce.proof.ts` / `full.e2e.ts` 既有断言；prove 不引入 fake-model、不把连通绿当业务绿；EXIT 0 ≠ covered ≠ ADV 翻行（翻行须 post-prove dual + 协调方授权）。
4. **隔离与密钥卫生**：`scripts/run-e2e-isolated.mjs` 隔离壳三层包装；`PAY_PROVIDER_SECRET` 只经进程环境，Ban secrets/`.env*` 入树入 receipt；`releaseEvidence=false`。
5. **Pins 与禁碰**：Pins 原值（见上表）逐字不变；**Ban 碰 UC-018 / UC-052 / UC-025 / UC-004 任何行/文件**；**Ban retry-to-green**，attempts 全记录（含失败 attempt 的 EXIT 与时间戳）；receipt 落点 `receipts/2026-10-03-gap-uc014-026-adv-webhook-nhp-prove.md`。

Row **`UC-E2E-014/026`** ADV column stays gap. Case `NHP-014-ADV-01` stays gap→case-only. **Ban covered** · coveredCount=8. **Ban 翻任何 SSOT 行**。

本 stub 不授权 coding / prove / push。pre-exec dual PASS 后由协调方授权 prove；implementer 不自批。Dual PASS ≠ coding ≠ nail.

---

*Stub · awaiting expert pre-exec dual · STOP*

---

# PRE-EXEC dual · NHP-014-ADV-01 webhook ADV · mw-rag-route（docs gate only · Ban prove · Ban product edit）

**Reviewed SHA**: `0cf8591b09a6439c25b984235d27bd3d4209f266`（`docs(e2e): REQUEST NHP-014-ADV-01 webhook ADV (pre_dual)`）· 审查基线 worktree `/Users/miaole/Desktop/golucky/meetwise-rv-k-rag-route`（branch `rv/k-rag-route` @ `origin/feat/mysql-schema-skeleton`）
**Scope**: docs gate only——只审 `0cf8591` 引入的 4 个 `.md`（harness / slice / 双审 stubs）；不执行 prove · 不加代码 · 不改产品文件 · 不改 SSOT · 不代签 mw-e2e-ha。

## 0. 提交合规（先决）

- `0cf8591` 为 `origin/feat/mysql-schema-skeleton` HEAD 的祖先（`git merge-base --is-ancestor` OK）；parent tip `0345315d19…` 亦为其祖先（OK）。
- **docs-only 核验**：`git show --name-status` 仅新增 4 个文件——`ai-docs/delivery/gap-uc014-026-adv-webhook-nhp.slice.md`、`ai-docs/delivery/harness/gap-uc014-026-adv-webhook-nhp.md`、`ai-docs/delivery/reviews/REQUEST-2026-10-03-gap-uc014-026-adv-webhook-nhp-mw-e2e-ha.md`、`…-mw-rag-route.md`（+200 行，零删除）。零代码、零 SSOT 文件触碰、零 `.env*`/secrets、零伪 receipt。提交作者 mw-core（REQUEST 方），非自批。

## 1. 检查表（file:line · 只读核验）

| # | 检查项 | 结论 | 证据 |
|---|--------|------|------|
| 1 | 选行=真 gap/blind（引矩阵原文） | PASS | `ai-docs/delivery/non-happy-path-perf-load-case-matrix.md:60` `NHP-014-ADV-01 \| 014/026 \| ADV \| api \| webhook 重放/篡改七类 \| 幂等+拒 \| **gap**→**case-only** \| 错签 403 partial 仅子集`；`ai-docs/delivery/e2e-requirement-coverage-matrix.md:119` UC-E2E-014/026 ADV=**gap**「重放/篡改七类未全铺」；`:177` §1.1「主路径 covered-ish；重放/篡改七类未全铺」 |
| 2 | 排除清单合规 | PASS | UC-018 flip-ban/`canHonestlyFlip=false`（`e2e-requirement-coverage-matrix.md:123`）；UC-052 归 050–052 隐私擦除族 partial/honesty-pin、DELETE=503（`non-happy-path-perf-load-case-matrix.md:95-97`）；UC-025 B'' 线门锁（`e2e-requirement-coverage-matrix.md:125`）；UC-004 整行 gap 归 C'/C''（`:115`） |
| 3 | 与进行中线无重叠 | PASS | 扫描 line-a2/b2/c2/d/e/g/i/l 各 worktree 的 `harness/`+`*.slice.md`：`uc014`/`uc-e2e-014`/`NHP-014-ADV` 0 命中 |
| 4 | 七类↔需求源映射完整、无偷工 | PASS | `ai-docs/requirements/use-cases/e2e-scenarios.md`：C1↔E-伪造签名(:536)+A1(:540)+TC-E2E-026-forged-sig(:544)；C3↔E-篡改金额(:537)+A2(:540)+TC-E2E-026-tamper-amount(:545)+UC-E2E-014 A2 金额不符告警不入账(:523)；C4↔E-重放(:538)+A3(:540)+TC-E2E-026-replay(:546)+UC-E2E-014 A1 重复回调仅一次(:523,:525)；C6↔UC-E2E-014 高并发重复/乱序回调(:520)；C2/C5/C7 为产品接线的 NEG/ADV 扩展族（缺字段 400 / 跨订单 CAS 409 / owner-gateway 404），未发明验收口径 |
| 5 | C3 未缩水为空断言 | PASS | harness 七类表 C3（`harness/gap-uc014-026-adv-webhook-nhp.md:41`）：夹带字段被忽略（或拒）+ 入账单位恒等于产品定价（pack_10=10 / pack_30=30）+ 如实记录「无金额通道=结构性双拦」——非空断言、非洗白 |
| 6 | 产品事实准确（只读） | PASS | `apps/api/src/modules/commerce/commerce.service.ts:56-70` `payWebhook`：缺字段 400(:57)→HMAC `timingSafeEqual` fail-closed 403(:59-61)→owner 经无表权限网关查询、查不到 404(:62-65)→exactly-once `markOrderPaidAndCredit` CAS(:66-68)；**回调体类型仅 `{providerTxn, sig}`，无金额通道**(:56)，金额由服务端 `PRODUCTS` 权威定价(:11-14)；无登录态 controller（`commerce-webhook.controller.ts:12`，不挂 PrincipalGuard） |
| 7 | 「现有覆盖仅子集」论断 | PASS | `apps/api/test/` 无 `uc-e2e-014*`、root/apps `package.json` 无 `uc014` script（grep 0 命中）；`apps/api/test/neg-commerce.proof.ts` §4(:277 起) 同单重放(:322-326)/并发双回调(:344-347)/跨订单同 providerTxn 409+provider_txn 恰 1 行(:352-359) 为子集；`e2e/full.e2e.ts:319-322` 仅错签 403+未知单 404；两者均无 PaymentOrder/entitlement 桶 before-after 零副作用快照断言 |
| 8 | 隔离壳先例与口径 | PASS | root `package.json:95` `neg:commerce` = `node scripts/run-e2e-isolated.mjs neg:commerce`；`scripts/run-e2e-isolated.mjs:12`「local green ≠ HA · need multi-instance + fault-inject for releaseEvidence」 |
| 9 | Pins 原值逐字一致 | PASS | coveredCount=8 与 SSOT nails 一脉（`e2e-requirement-coverage-matrix.md:99-102`）；DELETE=503（`non-happy-path-perf-load-case-matrix.md:95`）；NOT_HA / releaseEvidence=false / claimProductionHA=false / gR45Closed=true / ms3EqualsR4Closed=false / PG-retained 在 stub:4、harness:4、slice:4 三处逐字相同 |
| 10 | 禁碰清单 | PASS | `0cf8591` 未触碰 `neg-commerce.proof.ts` / `full.e2e.ts` / 任何矩阵/backlog/checklist；UC-E2E-014/026 与 NHP-014-ADV-01 矩阵行未被本 commit 修改（:60/:119/:177 原文仍在）；peer stub mw-e2e-ha 仍 PENDING、未被代签 |
| 11 | webhook 域边界 | PASS | 全文不触碰 RAG/R2/R4/R5/题库/TECH_ROLE 域行；scope 显式 not UC-011 refund-callback / UC-019 / UC-033（另一套「七类」）、不碰 PERF/LOAD、不把 commerce ADV 结论外推其它域（harness:76、slice:31） |
| 12 | EXIT 契约诚实 | PASS | EXIT0 仅当 C1–C7 全立且**仍不翻行**（harness:56）；EXIT1=诚实保留 gap+打印 `GAP-UC014-026-WEBHOOK-ADV` 明细（harness:57）；attempts 全记录、Ban retry-to-green（harness:59）；receipt 落点具名（harness:63）；与 `neg:commerce`/`full.e2e` 互不替代（harness:58） |

## 2. 两开放口径裁决（写进 Conditions）

**裁决① C3「篡改金额」：结构断言 vs 显式拒绝路径 → 接受结构断言，附三项硬前置**
- 产品事实：`commerce.service.ts:56` 回调体类型仅 `{providerTxn, sig}`——**不存在金额通道可篡改**；金额由服务端 `PRODUCTS`（:11-14）权威定价。故「篡改金额」面今天是**结构性双拦**（无通道 + 入账单位恒等于定价），不是已实现的显式金额复核。要求 prove 实现一条产品里不存在的「显式金额不符拒绝路径」= invent fix，本审不接受。
- 硬前置（违反任一即裁决失效 → 该项 EXIT1 诚实保留 gap）：
  - (a) prove 全程 **Ban 改口**「已实现金额复核/服务端金额比对」——断言名、注释、receipt 叙述一律不得出现（Ban 列 harness:71 重申生效）；
  - (b) EXP 面须**如实披露**金额通道缺失（结构性双拦）写入 receipt，不得沉默带过；
  - (c) 断言不得为空壳：必须实测请求体夹带 `amountCents` 等字段被忽略（或拒）**且** 入账单位恒等于产品定价（pack_10=10 / pack_30=30）——任一不成立即 EXIT1。

**裁决② 审计观察点（GuardrailHit）缺席：disclosed-not-blocking vs EXIT 门槛 → 判 disclosed-not-blocking，附两项披露硬前置**
- 依据：矩阵行期望=「幂等+拒」（`non-happy-path-perf-load-case-matrix.md:60`）；场景文中审计落 GuardrailHit 是**后置**（`e2e-scenarios.md:539`），且产品当前确无该观察点（harness:33 如实记录）。把缺席的观察点抬成 EXIT 门槛，等于在 prove 里发明产品缺失的实现，违反 Ban invent fix。
- 硬前置：
  - (a) receipt 必须**显式披露**「审计观察点（GuardrailHit/安全日志）absent」字样并给 file:line 依据，**沉默即本审 FAIL trigger**；
  - (b) Ban 借缺席宣称审计已实现/已覆盖；EXIT 值仅由 C1–C7 的幂等+拒断言决定。

## 3. Fail-trigger audit（触发即改判本审 FAIL / 复核）

- 任何 SSOT 行（矩阵/backlog/checklist）edit；任何 product/test 代码行；任何对 `neg-commerce.proof.ts` / `full.e2e.ts` 的改动。
- Pins 任一偏离：coveredCount≠8、DELETE≠503、翻 UC-E2E-014/026 或 NHP-014-ADV-01 行、covered 字样入文。
- 碰 UC-018/052/025/004 任何行/文件；触碰 RAG/R4/R5/题库/TECH_ROLE 域；commerce 结论外推其它域。
- 裁决①前置 (a)/(b)/(c) 任一违反；裁决②前置 (a)/(b) 任一违反（含沉默）。
- EXIT1 被记成 flake/环境问题；retry-to-green；attempts 隐瞒（少记失败 attempt）。
- secrets/`.env*` 入树或入 receipt；implementer 自批或代签 mw-e2e-ha（alone ≠ dual）。

## 4. Blockers

**无**（docs gate 层面零 blocker）。非阻塞观察两条：
1. harness:24 引「验收（:542）」——A1–A3 实际在 `e2e-scenarios.md:540`（:541 关联、:543 测试用例头）。引用行号漂移 2 行，内容一字未错，不构成 substance 错误；prove 落 receipt 时以 :540 为准。
2. harness:31「full.e2e 本环境 blocked」是环境性陈述——其结论「非七类完整矩阵」已由结构性证据（`e2e/full.e2e.ts:319-322` 仅 2 条 webhook 断言、无零副作用快照）独立成立，不依赖 Key 与否。prove 时即使环境有 Key，也不得以跑通 full.e2e 替代本刀七类收据（harness:58 互不替代已锁）。

## 5. Conditions（C-* · prove 授权前须持续成立）

- **C-1** prove 产物仅限 `apps/api/test/uc-e2e-014-026-webhook-adv.proof.ts` + root script `uc014:webhook-adv:prove`（三层隔离壳，同 `package.json:95` 先例）；零其它文件、零产品代码改动。
- **C-2** C1–C7 每类逐项断言：HTTP 状态+响应体错误码+DB before/after 快照（PaymentOrder 状态、entitlement 桶、`payment_order.provider_txn` 行数）；断言不得为空壳/恒真。
- **C-3** 裁决①三前置 (a)(b)(c) 与裁决②两前置 (a)(b) 逐字生效于 prove 正文与 receipt。
- **C-4** EXIT0 也不翻行：ADV 保持 gap；UC-E2E-014/026 与 NHP-014-ADV-01 行的任何状态变化须 post-prove dual PASS + 协调方授权；coveredCount=8 不动；Ban covered。
- **C-5** attempts 台账逐次记录（含失败/中断 attempt 的 EXIT+时间戳）；receipt 落 `ai-docs/delivery/receipts/2026-10-03-gap-uc014-026-adv-webhook-nhp-prove.md`；`PAY_PROVIDER_SECRET` 只经隔离壳进程环境、值不入树不入 receipt；releaseEvidence=false 不变。
- **C-6** dual 完成须 `mw-e2e-ha` 在其自身 stub 独立签署；本审不代签；本 PASS ≠ coding ≠ prove ≠ nail。

## 中文三行摘要

1. `0cf8591` 为 docs-only 四文件新增（祖先+docs-only 核验通过），选行 NHP-014-ADV-01 是真 gap（矩阵 :60/:119/:177 原文核验），排除 018/052/025/004 合规、与进行中线零重叠，Pins 原值、禁碰清单全数成立。
2. 七类 C1–C7 与需求源（E-伪造签名/E-篡改金额/E-重放+A1/A2/A3+TC-E2E-026-*）映射完整无缩水，产品事实（回调体无金额通道/HMAC fail-closed/owner-gateway/exactly-once CAS）逐行只读核验无误。
3. 两口径裁决：C3 结构断言可接受（Ban 改口「已实现金额复核」+ receipt 必须披露金额通道缺失 + 断言不得为空）；审计观察点判 disclosed-not-blocking（receipt 显式披露缺席、不作 EXIT 门槛、沉默即 FAIL trigger）；无 Blocker，PASS 附 Conditions C-1..C-6，prove 待协调方授权 + mw-e2e-ha 独立签署（alone ≠ dual）。

Verdict: PASS
