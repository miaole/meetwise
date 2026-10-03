# REQUEST — **GAP-UC025-NEG-01 real wiring** · pre-exec · mw-rag-route

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Expert**: `mw-rag-route`
**Knife**: `harness/gap-uc025-neg-real-wiring.md` · slice `gap-uc025-neg-real-wiring.slice.md`
**Parent tip**: `f3cf84c`（series open · not a prove tip · B' FINAL `76d2bc3` 已在祖先链）
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

Gap id **`GAP-UC025-NEG-01`** stays **OPEN**. Row **`UC-E2E-025`** stays gap. NEG column only. Do not claim UC-025 closed. Do not flip UC-018. UC-052 stays **partial**. Do not change the UC-004 row or the flake row.

Dual PASS ≠ coding ≠ nail · No coding is authorized by this stub. 预执行双审 PASS 后由协调方另行授权 coding；本 stub 不授权跑 prove、不授权改 `apps/api/test/uc-e2e-025-nhp-neg.proof.mjs`。

刀 B'' 范围一句话：`interview.controller.ts begin()` 真收 quiz 工件入参 + `interview.service.ts begin()` 真校验并抛真实 stale-quiz `HttpException`（扣额度/入队前）+ `0007_resume_quiz.sql` 非破坏补过期锚点列；proof 一字不改；prove 契约前 EXIT 1 → 真接线后预期诚实 EXIT 0，且 EXIT 0 ≠ covered。

---

*Stub · awaiting expert pre-exec dual · STOP*

# PRE-EXEC dual · GAP-UC025-NEG-01 real wiring · mw-rag-route（docs gate only · Ban prove · Ban product edit）

**Reviewer**: `mw-rag-route`（adversarial RAG/route/题库隔离 reviewer · 禁自批 · alone ≠ dual · 不代签 mw-e2e-ha）
**被审 SHA**: `8084f09`（`8084f0948aa86dcba09771ca141288ee918c9aa0` · `docs(e2e): REQUEST GAP-UC025-NEG-01 real wiring (pre_dual)`）· 审查基线 tip `f44d8da` · worktree `/Users/miaole/Desktop/golucky/meetwise-rv-b2-rag-route`（branch `rv/b2-rag-route` @ `origin/feat/mysql-schema-skeleton`）
**审查方式**: 只读源码 + 只读 receipt/矩阵 + git 只读验证；本回合未跑任何 prove（Ban prove）、未改任何产品/proof/SSOT 文件；git 写操作仅限本 worktree 本 commit。

## 0. 提交形态验证（docs gate）

- [x] `8084f09` 为审查基线 tip `f44d8da` 的祖先（`git merge-base --is-ancestor` OK）。
- [x] `git show --name-status 8084f09`：仅 4 个**新增** md（全 A，无 M/D，+202/-0）——`ai-docs/delivery/gap-uc025-neg-real-wiring.slice.md`、`ai-docs/delivery/harness/gap-uc025-neg-real-wiring.md`、`ai-docs/delivery/reviews/REQUEST-2026-10-03-gap-uc025-neg-real-wiring-mw-e2e-ha.md`、`ai-docs/delivery/reviews/REQUEST-2026-10-03-gap-uc025-neg-real-wiring-mw-rag-route.md`。零代码、零 proof、零 SSOT 改动。
- [x] B' FINAL `76d2bc3`（`76d2bc3fb5fb15b5a08aa5f769fc19cfa6a09a77`）与基座 `f3cf84c`（`f3cf84ccbd6ff0341fe198aa4cadd8cff417e69b`）均为 `8084f09` 祖先——stub「B' FINAL 已在祖先链」属实。
- [x] 措辞备注（非阻断）：`8084f09` 的直接 git parent 是 `97d8889`（A' flake teed-oneshot REQUEST commit）；两 stub「Parent tip: `f3cf84c`」系刀基座语义。所有承重祖先声明均验证为真。

## 1. 检查表（file:line 证据）

| # | 检查项 | 结论 | 证据 |
|---|--------|------|------|
| 1 | proof 门 1（acceptsQuiz）机制描述属实 | PASS | `apps/api/test/uc-e2e-025-nhp-neg.proof.mjs:58` `acceptsQuiz=/quiz-id\|quizId\|sourceQuiz\|source_quiz/` 测于 controller+service begin 签名**首个**匹配（:38-42 `begin\s*\([^)]*\)`）；harness §Why L21-24 引用一致 |
| 2 | proof 门 2（realStaleReject）机制描述属实 | PASS | proof :35-36 `STALE_THROW_RE`（5 token）+ :44-48 `beginRegion`=自 `begin(principal` 起 4500 字符 + :59；harness L25 一致 |
| 3 | 今日两门均 false（EXIT 1） | PASS | `interview.controller.ts:22` begin 签名无 quiz 标识；`interview.service.ts:178` begin 签名无 quiz 标识；receipt `ai-docs/delivery/receipts/uc-e2e-025-nhp/2026-10-02-uc025-nhp-neg-prove.md` 记 CMD/EXIT=1/`0271ee4`/acceptsQuiz=false/realStaleReject=false |
| 4 | `pnpm uc025:nhp-neg:prove` 命令接线可复现 | PASS | 根 `package.json:148` = `node apps/api/test/uc-e2e-025-nhp-neg.proof.mjs`；EXIT 分叉 proof :71-76（0）/ :79-84（1） |
| 5 | resume_quiz 无新鲜度锚点列属实 | PASS | `packages/db/migrations/0007_resume_quiz.sql` CREATE TABLE（:5 起）无 expires_at/fresh_until/stale_after；:26 `lease_expires_at` 为 worker lease 列，proof :63 `\bexpires_at\b` 不命中之（`\b` 不跨 `_`），quizHasExpiry=false 属实 |
| 6 | contracts 无 stale token 属实 | PASS | `packages/contracts/src/index.ts` 三 token 零命中（proof :69 为非门打印项） |
| 7 | acceptsQuiz 真路径定义（非布尔洗绿） | PASS | harness L48：真=HTTP 真入参→controller 解析→service 活路径消费（owner-scoped 读 `resume_quiz`）；NOT real 明列（parse 不读/常量折叠/插串命中正则）；L50 Ban stub/boolean wash/proof edit |
| 8 | realStaleReject 真路径定义（真抛非吞） | PASS | harness L49：真=对持久化锚点过期→begin 真实执行路径抛真实 `HttpException`（stale token+真实 status）；NOT real=死旗标抛/布尔翻 true/永不执行处放错误串/改正则；scope 表 #2（L40）：抛点在 begin 体前段、**扣额度/入队之前**（stale 输入不得耗额度） |
| 9 | stale 判定诚实（持久化锚点非内存标志） | PASS | scope 表 #3（L41）：新增持久化锚点列（如 `expires_at`），写锚点在工件 ready 时点（quiz worker/`quiz.service.ts`）属真路径；「读时硬编码 `now()+N` ≠ anchor，wash-adjacent → 按 stub 拒」明文 |
| 10 | 错误码契约写死可断言 | PASS | scope 表 #2：token `stale_quiz`（或 proof 认可 token）+ 真实 HTTP status `CONFLICT`/`GONE`，落于 begin 体 4500 字符窗（proof :44-48 可断言）；见 C-3 收敛唯一 token/status |
| 11 | proof 绕过预留 = 无 | PASS | harness Ban#2（L78）+ slice Ban（L41）：改 proof 正则/布尔=Ban；harness L59 自爆条款「proof 必须 unmodified 翻绿，否则接线不真——停手上报，禁改 proof」；stub L25 不授权跑 prove、不授权改 proof |
| 12 | 接线后 prove 变绿需双审+证据 | PASS | harness L57（receipt 记实际 EXIT，不预claim）+ L71-72（wiring prove receipt 落点 + post-prove dual 两专家各一新文件，不覆写 pre-exec stub）；EXIT 0 ≠ covered ≠ nail ≠ SSOT flip（L15/L60） |
| 13 | 题库/route 边界不扩大 | PASS | 工件来源锁 `resume_quiz`（scope #2/#3），owner-scoped 读镜像 `quiz.service.ts` 形状（`quiz.service.ts:20`/:44 `owner_user_id`+RLS 实证）；begin 无 quiz 工件保持今日 resume-only 语义（L40 尾），Ban 改强制入参（harness Ban#8 L84）；无 TECH_ROLE/UC-052 检索面引用（仅 Not/Ban 守卫语） |
| 14 | 禁碰清单 | PASS | harness L44 not-in-scope（proof/SSOT/UC-018/UC-052/UC-004/flake/FAULT/BOUND/ADV/旧 `uc025:stale-quiz-expiry:prove` pin）+ Ban#4/#5/#6（L80-82）；矩阵 `e2e-requirement-coverage-matrix.md:125`（UC-E2E-025 行仍 **gap**）与 :369（B' FINAL NAIL 注）本 commit 未触碰（docs-only 4 md 实证） |
| 15 | Pins 原值 | PASS | stub L4/L12-21、harness L4/L89、slice L4：NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=**8** · ms3EqualsR4Closed=false · PG-retained · public DELETE=**503**；GAP-UC025-NEG-01 **OPEN**、row **gap**、UC-018/UC-052 partial 未动口 |
| 16 | 非 UI prove 契约可复现（附命令） | PASS | CMD=`pnpm uc025:nhp-neg:prove`（静态读源，无需 DB/server）；接线前 EXIT=1（receipt 实证）；真接线后预期诚实 EXIT=0；旧 `uc025:stale-quiz-expiry:prove` EXIT 0 明文≠本案（harness L61、proof :81、receipt） |
| 17 | B' 门锁承接一致 | PASS | B' slice `gap-uc025-neg-product-wiring.slice.md:40,52`（FINAL NAIL · "A future wiring knife needs a new REQUEST" · EXIT 1 locked）→ B'' 即该 new REQUEST；B' 矩阵 diff 为纯 additive 注（`76d2bc3` 实查），未翻行 |

## 2. Fail-trigger audit

- 改 proof 正则/布尔洗绿预留？→ **无**。两文档明令 Ban（harness L78、slice L41），L59 自爆条款兜底。
- 布尔/可空参数翻 true 替代真接线？→ **无**。harness L48-50 NOT-real 清单；scope #1 要求「real request field flows into the service call」，#2 要求活路径 owner-scoped 读 + 真抛。
- catch 吞异常 / 仅前置校验做样子？→ **无**。要求真实 `HttpException` 于 begin 体前段（4500 窗内）且在扣额度/入队之前；「死旗标抛」列入 NOT-real。
- 内存标志替代持久化锚点？→ **无**。scope #3 要求持久化锚点列、ready 时写锚点；读时硬编码 `now()+N` 明文 wash-adjacent 拒收。
- covered / SSOT 洗绿？→ **无**。EXIT 0 ≠ covered ≠ nail ≠ SSOT flip（L15/L60）；post-prove dual 前 GAP 不关；row 不自动升格（slice L46）。
- 边界扩大？→ **无**。quiz 工件可选（不强制）Ban widen（Ban#8）；`resume_quiz` owner-scoped 只读；无 TECH_ROLE/UC-052/UC-018/UC-004/flake/FAULT/BOUND/ADV 触碰；旧 pin 不冒领（Ban#9）。
- alone 签 dual？→ **否**。本段仅 mw-rag-route 单专家预审；peer stub（mw-e2e-ha，PENDING）未代签；dual 有效性以两专家各自 append 为准。

**Fail-trigger 命中：0。**

## 3. Blockers

无。

## 4. Conditions（C-* · 授权 coding 后必须满足，违反即 post-prove dual FAIL 依据）

- **C-1（proof 可见面放置 · 首匹配截断陷阱）**: proof `beginSignature` 取各文件**首个** `/begin\s*\([^)]*\)/` 匹配，`[^)]*` 在首个 `)` 截断——controller 首匹配实为 `begin(@Param('id')`（`interview.controller.ts:22`），故 `@Headers('quiz-id')` 等装饰器若置于 `@Param('id')`/`@Req()` **之后**不会命中门 1；harness L39 的 `@Headers('quiz-id')` 举例仅在 quiz 标识居**首参**时可行。可靠路径：service `begin(...)` 签名（无嵌套括号、全文被捕获，`interview.service.ts:178`）新增 quizId 形参。实现方必须以**未改 proof** 实测打印 `acceptsQuiz=true` 后才算接线完成；若发现必须改 proof 才能绿，按 harness L59 停手上报，禁改 proof。
- **C-2（迁移非破坏）**: 新鲜度锚点列优先走**新增**非破坏迁移 + `sql/20_resume_quiz.sql` 同形镜像（scope #3 已预留该选项，文件头 :3 自证镜像规则）；禁止对已应用迁移 `0007_resume_quiz.sql` 原地重写历史、禁止任何 DROP。
- **C-3（错误码契约收敛）**: 从 proof 认可的 5 token 中收敛唯一对外 token+status（建议 `stale_quiz` + `CONFLICT`），在 wiring prove receipt 记实值供后续 HTTP 断言；不得双 token 混发。
- **C-4（额度序）**: stale 拒绝必须先于 entitlement reservation 与入队写；receipt 记录该顺序的代码位置证据（file:line）。
- **C-5（EXIT 纪律）**: 接线后 prove 若 EXIT=0，receipt 记**实际** EXIT 与打印的 `acceptsQuiz`/`realStaleReject` 值；不预claim、不据此动矩阵/SSOT/coveredCount=8；post-prove dual 由两专家各起新文件，本 stub append-only 不覆写。
- **C-6（旧行为保持）**: 无 quiz 工件的 begin 请求行为与今日一致（resume-only 语义）；旧 `uc025:stale-quiz-expiry:prove` pin 及其 EXIT 0 不并入本案证据。

## 5. 非阻断观察

- slice Products 表（L22）引用 receipt 文件名写作 `2026-10-02-uc025-neg-prove.md`，实际为 `2026-10-02-uc025-nhp-neg-prove.md`（笔误，指向对象唯一可辨）。
- 两 stub「Parent tip: `f3cf84c`」与直接 git parent `97d8889` 的措辞差（见 §0）；承重祖先声明全部验证为真。

## 6. 中文三行摘要

1. B'' REQUEST `8084f09` 纯 docs（4 新增 md）：把 acceptsQuiz/realStaleReject 定义成真 HTTP 入参透传 + 对**持久化**新鲜度锚点在 begin 体前段（扣额度/入队前）真抛 `HttpException(stale_quiz, CONFLICT/GONE)`，并明令 Ban 改 proof 正则/布尔洗绿、stub/死旗标/插串/读时硬编码 `now()+N`，门锁 EXIT 1 保留、EXIT 0 ≠ covered ≠ nail ≠ SSOT flip，Pins 与行保持原值未动口。
2. 对照源码逐条核实全部属实：proof 两门机制与 4500 字符窗、`package.json:148` 接线、controller/service begin 现状、`resume_quiz` 无锚点列（`lease_expires_at` 不误命中）、contracts 无 stale token、EXIT 1 receipt@`0271ee4`、`quiz.service.ts` owner-scoped 形状、B' 门锁与矩阵行未动——fail-trigger 红线零命中，无 proof 绕过预留。
3. 条件放行：C-1 防 proof 首匹配截断陷阱（quiz 标识须落在未改 proof 实际读取文本内，否则停手上报）、C-2 锚点走新增迁移+`sql/20` 镜像、C-3 token/status 收敛、C-4 额度序、C-5 EXIT 纪律、C-6 旧行为保持；alone ≠ dual，本 PASS 待 mw-e2e-ha 同审后方成 dual，不代签、不授权 coding、不跑 prove、不 push。

Verdict: PASS

---

# POST-PROVE dual · **GAP-UC025-NEG-01 real wiring** · mw-rag-route（独立复验 · 禁自批 · alone ≠ dual · 不代签 mw-e2e-ha）

**Reviewer**: `mw-rag-route`（adversarial RAG/route/题库隔离 reviewer）
**被审包**: branch `origin/line/b2-uc025-wiring` · tip **`6e5252a`**（`6e5252ad57304352198b614dd4e3d14de128f04a`）= `6cbaf04`（真接线，5 文件 +40/−6，author mw-core）+ `6e5252a`（2 receipts）；REQUEST `8084f09`（origin main，与分支 `cfc0c28` 同文）；预执行双审：rag `8613a3a` PASS + e2e-ha `36f583a` PASS（两 commit 均实证在库，`8613a3a` 版 review 文件末行 `Verdict: PASS` 实查）。
**审查 worktree**: `/Users/miaole/Desktop/golucky/meetwise-rv-b2p-rag-route`（branch `rv/b2p-rag-route` @ `origin/line/b2-uc025-wiring` · 一切 git 写操作仅在本 worktree 本 commit · 禁 push）。
**审查方式**: git 只读 diff 验证 + 源码 file:line 静态核查 + **fresh re-run 恰好一次**（`pnpm install --frozen-lockfile` 后首跑即录 EXIT，无重试、无 wash）。

## 0. 包完整性（C-DUAL-FROM-FRESH 前置）

- [x] `git log --oneline cfc0c28..6e5252a` = 恰 2 commit（`6cbaf04` 真接线 + `6e5252a` receipts），无夹带。
- [x] **proof 零改动**: `git diff f44d8da 6cbaf04 -- apps/api/test/uc-e2e-025-nhp-neg.proof.mjs` = **0 字节**；`cfc0c28..6e5252a` 全包范围该文件 diff 亦 **0 字节**。改 proof = 直接 FAIL → 未触发。
- [x] 实现范围 `cfc0c28..6cbaf04` = 恰好申报的 5 文件 +40/−6：`apps/api/src/modules/interview/interview.controller.ts`（+6/−2）、`apps/api/src/modules/interview/interview.service.ts`（+20/−1）、`apps/worker/src/quiz-lifecycle.ts`（+9/−3）、`packages/db/migrations/0135_resume_quiz_freshness_anchor.sql`（新增 +6）、`packages/db/sql/20_resume_quiz.sql`（+1）；`cfc0c28..6e5252a` 另仅 +2 receipts（pre-wiring / real-wiring prove）。零越界文件。
- [x] `0007_resume_quiz.sql` **零 diff**（0 字节、0 commit）、全包 diff 无任何新增 DROP 语句（仅注释文字提及「绝不 DROP」）。
- [x] 矩阵 / SSOT / `coveredCount=8` / UC-018 / UC-052 / UC-004 / flake 行：全包 diff 零触碰。

## 1. Fresh re-run（C-DUAL-FROM-FRESH · 恰好一次）

- **环境**: node v22.19.0 · pnpm 10.18.0 · worktree HEAD `6e5252ad5730…` · `pnpm install --frozen-lockfile` → Done（attempts=1 安装）。
- **CMD**: `pnpm uc025:nhp-neg:prove`（root `package.json:148` = `node apps/api/test/uc-e2e-025-nhp-neg.proof.mjs`）
- **EXIT**: **0**（`PROCESS_EXIT=0` · 第 1 次尝试即得，attempts=1，禁重试条款遵守）
- **实测读数**（与 real-wiring receipt 的 verbatim 记录**逐字一致**）:
  - `inventory acceptsQuiz=true realStaleReject=true resume_quiz_expiry_column=false`
  - `contracts_stale_token=false`
  - `PASS  NHP-025-NEG-01  interview begin throws a stale-quiz HttpException` / `ROW_STILL_GAP … matrix not flipped`（行保持 gap，未升格）
- **比对结论**: fresh EXIT 0 == receipt 声称 EXIT 0（attempts=1 一致）；两处诚实读数（`resume_quiz_expiry_column=false` 读 0007、`contracts_stale_token=false` 读 contracts）均为 proof 非门项（门 = `acceptsQuiz && realReject`，proof :71），不构成矛盾。

## 2. 预执行 binding 条件逐条裁决

| 条件 | 裁决 | 证据（file:line） |
|------|------|-------------------|
| **rag C-1**：未改 proof 实测 acceptsQuiz=true（service 首匹配=完整签名）；quiz 标识走 service 第 5 形参 | **MET** | proof diff 双区间 0 字节（§0）；fresh 实测 acceptsQuiz=true；service 全文**首个** `begin(` 匹配 = `interview.service.ts:179` 完整 5 参签名 `begin(principal, id, resumeId, requestId?, sourceQuizId?)`（无嵌套括号，`[^)]*` 不截断——pre-exec C-1 警示的 controller 首匹配截断陷阱被可靠路径规避）；controller `interview.controller.ts:24` `@Headers('quiz-id') quizId?: string` 透传为第 5 实参，双窗口均命中 |
| **rag C-2 / e2e-ha C-1**：迁移走新增非破坏迁移 + 20 镜像；0007 未动、无 DROP；已迁移库与新库都得到锚点列 | **MET** | 新增 `packages/db/migrations/0135_resume_quiz_freshness_anchor.sql:6` = `ALTER TABLE resume_quiz ADD COLUMN IF NOT EXISTS expires_at timestamptz`（非破坏、无 DROP）；`packages/db/sql/20_resume_quiz.sql:16` 镜像补列（新库重放得同列）；`0007` 零 diff 零 commit（已迁移库不重写历史）；已迁移库经 0135 得列 + service `:206-207` `expires_at != null` 才判过期（NULL 旧工件不假拒）；worker ready CAS 同事务写真锚点（`quiz-lifecycle.ts:54-58`） |
| **rag C-3**：token/status 收敛唯一 stale_quiz+CONFLICT，receipt 记实际值 | **MET** | 唯一对外 token/status = `throw new HttpException({ error: 'stale_quiz' }, HttpStatus.CONFLICT)` @ `interview.service.ts:209`（409）；begin 路径无第二 stale token 混发（缺工件/非本人工件走独立语义 `not_found_or_forbidden` 404 @ `:203-204`，非 stale 族）；receipt `2026-10-03-uc025-nhp-neg-real-wiring-prove.md` Honesty notes 记实值「stale_quiz + 409 CONFLICT」 |
| **rag C-4**：stale 拒绝先于扣额度（reserveEntitlement）与入队（enqueueInterviewJob）；receipt 记代码位置 | **MET** | 顺序实证（同一 begin 事务体内）：advisory lock `:184` → `FOR UPDATE` `:185` → `interview_not_active` 守卫 `:192-194` → **stale 块 `:199-210`（throw @ `:209`）** → resume 绑定 `:218` 起 → `reserveEntitlement` `:271` → `enqueueInterviewJob` `:279`；begin 体内唯一 catch `:272-275` 只映射 `insufficient_entitlement`→402 且其余原样重抛、位于 stale 检查**之后**——无任何 catch 吞该 throw；receipt Honesty notes 记录上述位置与顺序 |
| **rag C-5**（pre-exec 原条目，一并裁决）：EXIT 纪律——receipt 记实际 EXIT 与读数、不预claim、不动矩阵/SSOT/coveredCount、post-prove dual 不覆写 stub | **MET** | receipt 记实际 `EXIT: 0（PROCESS_EXIT=0 · attempts=1）` 与 acceptsQuiz/realStaleReject 实值，无预claim措辞；§0 实证矩阵/SSOT/coveredCount=8 零触碰；本 POST-PROVE 段为 append-only 追加于 stub 之后，stub 原文一字未动 |
| **rag C-6**：无 quiz 工件时 begin 行为与今日一致（sourceQuizId 缺省整块跳过） | **MET** | `if (sourceQuizId)` @ `interview.service.ts:199` 整块守卫：header 缺省 → controller 形参 `quizId?: string` 缺省 undefined → service 第 5 形参 falsy → 不读 `resume_quiz`、不强制、不做 widen，resume-only 语义与接线前一致；controller `:21` 注释自证该行为契约 |

**6/6 MET，0 UNMET。**

## 3. Fail-trigger audit（红线逐条）

- 改 proof 正则/布尔洗绿？→ **否**（双区间 diff 0 字节；fresh 复跑用未改 proof 命中 EXIT 0）。
- stub / 死旗标 throw / 插串命中正则 / 布尔翻 true？→ **否**：真 HTTP header → 真形参透传 → owner-scoped SQL 真读 `status,expires_at` → 对**持久化锚点**真比较 → 真 `HttpException`；worker 侧 ready CAS 同事务写真 `expires_at`（非读时硬编码 `now()+N` 冒充锚点）。
- catch 吞异常？→ **否**（§2 C-4 证据：唯一 catch 在 stale 检查之后且仅映射 402、其余重抛）。
- 顺序造假（先扣额度再校验）？→ **否**（stale throw `:209` < `reserveEntitlement` `:271` < `enqueueInterviewJob` `:279`，stale 输入不耗额度不入队）。
- widen（quiz 改强制入参）？→ **否**（可选 header、缺省整块跳过）。
- owner-scoped 缺失？→ **否**（`db.asPrincipal(principal,…)` RLS 事务内 + SQL 显式 `owner_user_id=$2`，与 `quiz.service.ts` 形状一致）。
- SSOT / 矩阵 / coveredCount / UC-018 / UC-052 / UC-004 / flake 触碰？→ **否**（§0 diff 实证）。
- 冒领旧 `uc025:stale-quiz-expiry:prove` EXIT 0？→ **否**（receipt 明文「与本案无关」）。
- alone 冒签 dual？→ **否**（本段仅 mw-rag-route 单专家；mw-e2e-ha post-prove 段未代签、未覆写）。

**Fail-trigger 命中：0。**

## 4. Blockers

无。

## 5. Conditions（C-* · 移交后续回合 · 违反即追责依据）

- **C-A（dual 完成条件）**: `GAP-UC025-NEG-01` 的 OPEN→关闭须待 **mw-e2e-ha 的 post-prove dual 同审 PASS**（alone ≠ dual）；本 PASS 不代签、不免除 peer 审。
- **C-B（行保持）**: EXIT 0 = case pass ≠ covered ≠ nail ≠ SSOT flip；`UC-E2E-025` 行保持 **gap**（§1.0.1 NEG 列），FAULT/BOUND/ADV 保持 not-run；`coveredCount=8` 不动；Pins 原值不改口。
- **C-C（contracts 未登记）**: `contracts_stale_token=false` 为诚实读数（`packages/contracts` 未登记 stale token）；后续 HTTP 断言若需 contracts 层登记，须另立 REQUEST，不得在本刀顺手改。
- **C-D（TTL 产品决策留痕）**: 新鲜度窗口 `QUIZ_FRESH_TTL_MS=7d`（`quiz-lifecycle.ts:17`）为产品决策常量，调整须改代码并留痕，不得以数据/配置漂移绕过审查。
- **C-E（本审边界）**: 本审未改任何产品/proof/SSOT 文件；git 写操作仅限本 worktree 本 commit（review 文件 append）；禁 push。

## 6. 中文三行摘要

1. 被审包 `origin/line/b2-uc025-wiring` tip `6e5252a` 包完整性实证：恰 2 commit、实现范围恰 5 文件 +40/−6、proof `uc-e2e-025-nhp-neg.proof.mjs` 双区间 diff 0 字节、`0007` 零 diff、无 DROP、矩阵/SSOT/coveredCount=8 零触碰。
2. fresh re-run 恰好一次（`pnpm install --frozen-lockfile` 后首跑）：`pnpm uc025:nhp-neg:prove` → **EXIT=0**、acceptsQuiz=true、realStaleReject=true，与 real-wiring receipt 逐字一致；静态核查 stale_quiz throw（`interview.service.ts:209`）位于 `interview_not_active` 守卫后、resume 绑定前、先于 `reserveEntitlement`(:271)/`enqueueInterviewJob`(:279)，唯一 catch 不吞、owner-scoped（RLS+`owner_user_id`）、0135 非破坏迁移 + `sql/20` 镜像双路得锚点列、NULL 锚点不假拒、无工件时整块跳过行为不变——预执行 6 条件全 MET，fail-trigger 红线零命中。
3. Verdict **PASS**（mw-rag-route 单专家 post-prove dual）：`GAP-UC025-NEG-01` 关闭与 `UC-E2E-025` 行升格仍待 mw-e2e-ha 同审（alone ≠ dual，不代签），EXIT 0 ≠ covered ≠ nail ≠ SSOT flip；本审 append-only、不 push、无 Blockers。

Verdict: PASS
