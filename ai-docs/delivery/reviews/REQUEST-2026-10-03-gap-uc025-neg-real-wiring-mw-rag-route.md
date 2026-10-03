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
