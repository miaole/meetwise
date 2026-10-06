# Harness — **UC-E2E-011 covered-lift-reassess**（Line AF · partial→covered **honest reassessment** · docs REQUEST · **`draft:awaiting_pre_exec_dual`** · Ban fake flip · UC-011 stays **partial**）

**Status**: **`draft:awaiting_pre_exec_dual`**（L0 docs REQUEST only · Ban coding · Ban prove 执行 · Ban covered fake flip · Ban invent covered · Ban wash residuals closed · Ban self-approve）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503 · canHonestlyFlip=**false**（current pin · 本刀只重估、不翻）
**Date**: 2026-10-06
**Base / parent tip**: `origin/feat/mysql-schema-skeleton` **`416b6a5`** / full `416b6a5b5c71d97a1816974c2b174dbf4b9c8cb8`（wave start · sibling Line AD/AE/AG/AH REQUEST commits may land alongside · Ban touch siblings）
**Knife**: **UC-E2E-011 covered-lift-reassess**（Line AF）——在 Line V 主口 CLOSED(wired) nail `5aae104` + Line Z Path A mouth nail 之后，按六列准则（NEG/FAULT/BOUND/ADV/PERF/LOAD · §0.5/§1.0）+ §1.1 业务路径 + §1b 库存 + 残余，**诚实重估** `canHonestlyFlip`；**不是** covered 翻行刀
**Gap id（拟）**: **`GAP-UC011-COVERED-LIFT-REASSESS`**（本刀具名 · 未入 backlog · 登记留给未来 nail）
**Row**: matrix `e2e-requirement-coverage-matrix.md:117`（§1.0.1）· `:148`（§1.0.2 PERF/LOAD）· `:175`（§1.1）· P1-2 `:270` —— **全部只读**
**Style mirror**: `harness/uc-e2e-018-covered-lift-reassess.md`（UC-018 先例 · canHonestlyFlip=false · refuse PERF/LOAD blind）
**Experts**: `mw-e2e-ha` + `mw-model-op`（stubs PENDING · Ban self-approve · alone ≠ dual）
**Authority**: meetwise — docs REQUEST only · Ban SSOT edit · Ban covered flip in REQUEST · Ban self-nail

## 0. Stance

| Statement | Ruling |
|-----------|--------|
| **What this knife is** | docs REQUEST：把 UC-011 当前证据逐列映射到 **已写成文的六列 covered 准则**（`harness/uc-e2e-018-covered-criterion.md` · evaluator `scripts/lib/uc-covered-evaluator.mjs`），产出 **可计算** 的 `canHonestlyFlip` 与 refuse reasons |
| **What this knife is not** | **Not** flip UC-011 / §1.1 to covered · **not** invent covered · **not** wash audit-absent / amount-recheck residual 成 closed · **not** 把 EXIT0 写成 covered · **not** reopen Line V/Z nails · **not** UC-018 knife |
| **Expected result（预判 · 待授权后计算确认）** | **canHonestlyFlip=false**（见 §2 预判表 · 至少 PERF/LOAD blind + ADV 列 case-only + §1b 未关项 + 残余）—— 预判 ≠ 结论，结论以授权后计算为准；**若计算得 true 也 Ban 本刀翻行**（翻行须另刀 + 双审 + 协调方授权） |

## 1. 现状如实陈述（只读 · 证据链）

| 证据 | SHA / 位置 | 结果 | 读法 |
|------|-----------|------|------|
| Line V NHP-011-ADV-01 honesty-of-red | NAIL prove tip `79825b2` · code `3d113c8` | `pnpm uc011:adv:prove` **EXIT 1**（三口 404 · A1/A2 UNREACHABLE） | 历史红 retained · Ban wash |
| Line Z Path A mouth | prove tip `244b812` / `244b81248d33bb85110a5304fff1f3d56de8563a` · CODE `bf1fdb2` · REQUEST `54b2058` | `pnpm uc011:refund-callback:prove` **EXIT 0 · 41/41** · `POST /commerce/webhook/refund/:id` | EXIT0 ≠ covered |
| Line V main mouth wiring | NAIL `5aae104` / `5aae10424277e68edb51c314b00e753e08a20d29` · prove tip `cf34390` / `cf343900c441d3f7e800cabd1fe2944e4c81fd4d` · CODE `2535b31` · REQUEST `d58b05b` | `pnpm uc011:refund-callback-adv:prove` **EXIT 0 · 68/68** · `POST /payment/refund-callback` 真路由 · `GAP-UC011-ADV-01` **CLOSED（wired）** | closed as wired ≠ covered · ADV 列措辞保留 gap/`case-only` |
| **残余 ①** 审计 | matrix `:117` / NAIL `:439` | 主口+管道 GuardrailHit/安全日志 emit 点 **absent**（AUDIT-OBSERVATION: absent · disclosed-not-blocking） | Ban 假称已接 · 审计接线 = 另刀 |
| **残余 ②** 金额显式复核 | matrix `:117` / NAIL `:439` | A3 **DISCLOSED**（白名单无金额通道 + 服务器权威 units 红冲 · 显式服务端金额复核比较路径不存在） | Ban 改口「已实现金额复核」· 属新刀 |
| §1b 库存 | `harness/uc-e2e-011-report-refund.md:63-74` | #1 refund-callback 产品口（Path A + 主口已落）· #2 balance-ui · #3 fail HTTP mouth / full.e2e · #4 regenerate（UC-019）· #5 `GET /wallet` 或 ADR · #6 sole-stack 夹具（原文 MySQL+Qdrant · 现 PG-retained ADR 下须重读 · **Ban** cutover） | 逐项标 DONE / OPEN / 须重读，Ban 一揽子 DONE |

## 2. 六列 canHonestlyFlip 预判表（只读矩阵 @ `416b6a5` · 非结论）

| Column | 矩阵读法 | 具名 NHP | Non-blind? | 预判 refuse reason（evaluator enum） |
|--------|----------|----------|------------|---------------------------------------|
| **NEG** | **partial**（`:117`） | NHP-011-NEG-01 **partial**（NHP `:55`） | YES | `STATUS-NOT-COVERED` |
| **FAULT** | **partial** | NHP-011-FAULT-01 **partial**（`:56`） | YES | `STATUS-NOT-COVERED` |
| **BOUND** | **partial**（幂等误 release） | NHP-011-BOUND-01 **partial**（`:57`） | YES | `STATUS-NOT-COVERED` |
| **ADV** | **gap** / `case-only`（措辞保留 · wired close ≠ 列翻行） | NHP-011-ADV-01 gap→case-only（`:58`） | 待审（wired 证据 vs 列措辞） | `CASE-ONLY` / `STATUS-NOT-COVERED` |
| **PERF** | PERF_api **blind**（`:148`）· PERF_web n/a | 无 NHP-011-PERF-* | **NO** | `MISSING-NHP` · PERF blind |
| **LOAD** | LOAD_worker **blind**（`:148`） | NHP-011-LOAD-w-01 blind→case-only（`:59`） | **NO** | `CASE-ONLY` · LOAD blind |
| §1.1 业务路径 | **partial**（`:175`） | — | — | `S11-NOT-MET` · `OPEN-GAP`（§1b #2–#5 + 残余 ①②） |

**预判**: `canHonestlyFlip=false`；首要 refuse = **PERF/LOAD blind**（与 UC-018 先例同型）+ ADV 列 case-only + §1b/残余 OPEN。

## 3. 可计算性（evaluator 读码 · @ `416b6a5`）

- `scripts/lib/uc-covered-evaluator.mjs:236` `export function evaluate(input)` · `:246` `const requiredMap = input.requiredNhp || UC018_REQUIRED_NHP` → **纯函数已支持 requiredNhp 覆写**，UC-011 可传 `{NEG:['NHP-011-NEG-01'],FAULT:['NHP-011-FAULT-01'],BOUND:['NHP-011-BOUND-01'],ADV:['NHP-011-ADV-01'],PERF:[…],LOAD:['NHP-011-LOAD-w-01']}`（PERF 无具名 NHP → 必 `MISSING-NHP`）。
- `scripts/lib/uc-covered-real-gatherer.mjs:535-537` 正则只匹配 `UC-E2E-018` 行 → **UC-011 real gatherer 不存在**。
- 因此本刀分支：

| 分支 | 内容（授权后） | Ban |
|------|----------------|-----|
| **A · docs-only 手算（默认）** | 按 §2 逐列手算 + 引 evaluator 规则原文（true 分支条件：全列 meetCovered + §1.1 businessPathMet + openGaps=[] + status covered + reasons 空）；产出 refuse reasons 清单 + §1b 逐项状态 + 残余 ①② 原样 | Ban 写 covered · Ban 改 evaluator |
| **B · computed（另授权 · 本 REQUEST 不写码）** | 新增 UC-011 gatherer/输入构造 + 拟 `pnpm uc011:covered-lift-reassess:prove`，调用 **未改动** 的 `evaluate()`（requiredNhp 覆写）；UC-018 evaluator 输出回归不变（`uc018:covered-lift-reassess:prove` 须仍 EXIT 0 且 canHonestlyFlip=false） | Ban constant-false / constant-true · Ban 读 fixture 期望值 · Ban 改 UC-018 结果 |

## 4. 验证契约（仅授权后 · 本 REQUEST 零实跑）

1. Base：执行时 `git fetch` 钉 committed SHA；`5aae104` / `244b812` / `cf34390` / `79825b2` 须为祖先。
2. Branch A 产物：拟 `receipts/2026-10-0X-uc-e2e-011-covered-lift-reassess.md`（手算表 + 引用 · 零 CMD）。
3. Branch B 产物（若授权）：CMD+EXIT+code SHA · canHonestlyFlip 机器输出 · reasons 全列 · Ban retry-to-green。
4. **无论结果**：本刀 **不** 翻 `:117` / `:175` / P1-2 · **不** 改 coveredCount。
5. Ban live（UC-011 面零模型调用）· Ban secrets · Ban `.env*`。

## 5. 行语义 / 状态冻结

- UC-E2E-011 stays **partial** · ADV 列措辞 gap/`case-only` 保留 · PERF/LOAD blind 保留 · coveredCount=**8**
- `GAP-UC011-ADV-01` CLOSED(wired) **不**重开；残余 ①② **不**关
- Line V/Z/Line V-main nails 原样 · Ban 改写 · Ban 用 EXIT0 叙述 covered

## 6. Ban 列表

- Ban coding（本 turn）· Ban prove 执行 · **Ban flipping UC-011 to covered in REQUEST** · **Ban covered fake flip** · Ban invent covered
- **Ban wash residuals closed**（audit absent · amount explicit recheck gap）· Ban 改口「已实现金额复核」/「审计已接」
- Ban EXIT0=covered · Ban reopen GAP-UC011-ADV-01 · Ban wash Line V honesty-of-red
- Ban 改 evaluator 使 true 可达于 UC-011 · Ban constant-false/true · Ban MySQL/Qdrant cutover
- Ban live · Ban buy cloud · Ban Meridian · Ban secrets · Ban force-push · Ban HA claim · Ban SSOT 擅自翻行
- Ban self-approve（alone ≠ dual）· Ban self-nail · Ban 碰 018/052/025 · Ban 碰 Line AD/AE/AG/AH 文件 · Ban 代发 agent 消息

## 7. Non-claims

Not covered · not flipped · not a pass · not run · not computed（Branch B 未授权）· not audit wired · not amount-recheck implemented · not HA · not `releaseEvidence=true` · not nail · EXIT0 ≠ covered · closed(wired) ≠ covered · canHonestlyFlip=false（current pin）· coveredCount=8 · alone ≠ dual

## Pins

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503 · UC-011 partial · canHonestlyFlip=false · STOP

*Harness · UC-E2E-011 covered-lift-reassess · Line AF · 2026-10-06 · draft:awaiting_pre_exec_dual · docs-only · Ban fake flip · Ban invent covered · Ban wash residuals · STOP*
