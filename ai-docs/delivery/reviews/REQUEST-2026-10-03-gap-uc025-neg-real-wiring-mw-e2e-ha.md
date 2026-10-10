# REQUEST — **GAP-UC025-NEG-01 real wiring** · pre-exec · mw-e2e-ha

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Expert**: `mw-e2e-ha`
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

---

# PRE-EXEC dual · GAP-UC025-NEG-01 real wiring · mw-e2e-ha（docs gate only · Ban prove · Ban product edit）

**被审 REQUEST**: `8084f0948aa86dcba09771ca141288ee918c9aa0`（`docs(e2e): REQUEST GAP-UC025-NEG-01 real wiring (pre_dual)`）
**审查基线**: origin/feat/mysql-schema-skeleton tip `f44d8da`；`8084f09` 经 `git merge-base --is-ancestor` 验证为 HEAD 祖先（ANCESTOR_OK）。
**docs-only 验证**: `git show --stat 8084f09` = 4 文件 / +202 / -0，全部位于 `ai-docs/delivery/`（slice · harness · 两份 expert stub）；零产品代码、零 proof、零 SSOT、零 receipts 改动。
**审查者**: mw-e2e-ha（adversarial evidence-honesty · 独立审，未读 mw-rag-route 的 PRE-EXEC 结论 · alone ≠ dual · 本段仅 docs gate，Ban prove run as delivery evidence、Ban coding、Ban product edit、Ban 改共享 SSOT）。
**可复现证据（reviewer 实测，只读静态脚本，非交付 prove receipt）**: 在审查 worktree 于 `f44d8da` 跑 `node apps/api/test/uc-e2e-025-nhp-neg.proof.mjs`（即 root `package.json:148` 的 `uc025:nhp-neg:prove` 目标）→ 实际 **EXIT=1**，打印 `acceptsQuiz=false realStaleReject=false resume_quiz_expiry_column=false contracts_stale_token=false` + `ROW_STILL_GAP` + `CMD=pnpm uc025:nhp-neg:prove EXIT=1`。与 harness「today」事实逐条相符。

## 检查表（file:line 证据，全部在本 worktree 实读核验）

| # | 审查项 | 证据 | 结论 |
|---|--------|------|------|
| 1 | docs-only、`8084f09` 为 HEAD 祖先 | `git show --stat 8084f09`（4 文件 +202/-0 全 docs）；`merge-base --is-ancestor` OK | ✅ |
| 2 | prove 命令可复现且接线位置属实 | root `package.json:148` `"uc025:nhp-neg:prove": "node apps/api/test/uc-e2e-025-nhp-neg.proof.mjs"`（harness `harness/gap-uc025-neg-real-wiring.md:19` 引 :148 精确）；reviewer 实测 EXIT=1 | ✅ |
| 3 | EXIT 契约「接线前 1」写清且属实 | `harness/gap-uc025-neg-real-wiring.md:54-56`（before wiring → EXIT **1**，unwired mark，诚实）；proof `apps/api/test/uc-e2e-025-nhp-neg.proof.mjs:79-84` GAP 分支 `process.exit(1)`；实测 EXIT=1 | ✅ |
| 4 | EXIT 契约「接线后 0」为预期诚实、不预claim | `harness:57`「expected honest · Receipt records the actual EXIT; no pre-claiming」；`slice:35`「receipt 记实际 EXIT，不预claim」；全篇仅「预期/expected」措辞，无任何预填 EXIT 0 receipt | ✅ |
| 5 | 双门为 proof 实算、保留为真路径断言（未被删除/未被「设置」） | proof:58-59（`acceptsQuiz`/`realReject` 由正则测真实源码算出）；`harness:46-50` 真路径定义 + 「Nobody "sets" them. The only honest route to EXIT 0 is the real product code」 | ✅ |
| 6 | 禁改 proof / 禁洗绿（正则、布尔、stub、死旗标、串匹配） | `harness:78-79`（Ban #2/#3）+ `harness:59`「The proof file must produce this flip unmodified. …stop and report; do not edit the proof」；`slice:37`「若发现必须改 proof 才能绿，即说明接线不真——停手上报，禁改 proof」；`slice:41` Ban 列表同义全覆盖 | ✅ |
| 7 | EXIT 0 ≠ covered ≠ nail ≠ SSOT flip；变绿须 post-prove 双审 | `harness:60`「An honest EXIT 0 does not close GAP-UC025-NEG-01 and does not touch the matrix. Close requires the post-prove dual on its own; covered requires the row's covered criterion」；`harness:72` post dual 为新文件；`slice:12`「EXIT 0 ≠ covered ≠ nail ≠ SSOT flip」 | ✅ |
| 8 | 与 B' 门锁一致（EXIT 1 锁至真接线；B'' 即 B' 预告的「future wiring knife = new REQUEST」） | B' `harness/gap-uc025-neg-product-wiring.md:31/68/88`「STAYS EXIT 1 until `acceptsQuiz` and `realStaleReject` are both real product wiring」+ :35「An honest later EXIT 0, if the real wiring exists, is still not covered」；SSOT `e2e-requirement-coverage-matrix.md:369`「A future wiring knife needs a new REQUEST」 | ✅ |
| 9 | 现状事实无造假（acceptsQuiz/realStaleReject=false 的源码依据） | controller `interview.controller.ts:20-23` begin 无 quiz 工件（grep `quiz-id|quizId|sourceQuiz|source_quiz` 于两文件零命中）；service `interview.service.ts:178` `begin(principal, id, resumeId, requestId?)`（proof `begin(principal` 首次出现即定义处，region 锚定有效）；begin 体 178-226 仅 7 个非 stale 错误码（missing_resume_id/invalid_resume_id/not_found_or_forbidden/interview_not_active/interview_resume_binding_conflict/legacy_resume_reference_unavailable/interview_resume_binding_unavailable），与 `harness:25` 所列一致 | ✅ |
| 10 | 迁移/契约旁证属实 | `packages/db/migrations/0007_resume_quiz.sql:5-14` `resume_quiz` 无 expires_at/fresh_until/stale_after（:26 `lease_expires_at` 属 `quiz_job`，不在 resume_quiz 块、且 `\b` 不命中）；`packages/contracts/src/index.ts` 无 stale token；与 proof 实测输出一致 | ✅ |
| 11 | stale 拒绝真路径：真 HttpException · begin 主路径 · 先于扣额度/入队 · 错误码可断言 | `harness:40`（scope #2：throw 真实 `HttpException`，token `stale_quiz`（proof 可接受集，proof:35-36），CONFLICT/GONE，begin 体前段、before entitlement reservation and queue write、quota 不得被 stale 输入消耗；且置于 proof 4500 字符 region 内）；`harness:42` contracts 可选登记（非门）；`harness:48-49`「on the path a real request reaches」+ NOT-real 清单（死旗标/布尔翻 true/永不执行位/改正则） | ✅（catch 吞异常未逐字点名，见 C-2） |
| 12 | Ban widen（quiz 不强制、保留 resume-only 语义） | `harness:40` 末句 + `harness:84`（Ban #8）；`harness:44` explicit not-in-scope（proof/SSOT/UC-018/052/004/flake/FAULT·BOUND·ADV/旧 stale-quiz-expiry 钉） | ✅ |
| 13 | 禁碰行/文件/计数 | `harness:81`（Ban #5 UC-018/052/004/flake）+ `harness:80`（Ban #4 covered/SSOT/coveredCount≠8）+ `slice:41`；`8084f09` diff 实证未触碰任何矩阵/产品/proof 文件 | ✅ |
| 14 | 旧钉不冒领 | `harness:61` + `harness:85`（Ban #9）+ `slice:41`；proof:81 打印同款 NOTE | ✅ |
| 15 | Pins 原值一致 | stub:4,12-21 / slice:4 / harness:4,89 = `haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503`，与 SSOT matrix:125,369 及 B' harness:89 逐字一致 | ✅ |
| 16 | 行保持（GAP OPEN · row gap） | stub:23、slice:45-46、harness:8-9；SSOT `e2e-requirement-coverage-matrix.md:125` UC-E2E-025 = gap/gap/gap/blind · GAP-UC025-NEG-01 stays OPEN | ✅ |
| 17 | dual≠coding、Ban self-approve、先例一致（stub append 不覆写） | stub:25、slice:3、harness:3,73、harness:83（Ban #7）；旧 receipt `receipts/uc-e2e-025-nhp/2026-10-02-uc025-nhp-neg-prove.md:4-6`（EXIT 1 @ `0271ee4`）未被本 commit 改动 | ✅ |

## Fail-trigger audit（逐项排查，均未触发）

- 预claim EXIT 0 / 预填 receipt → 无（全篇「预期/expected」措辞；receipt 落点注明 dated at run time，`harness:69-71`）。
- 授权改 proof / 删门 / 布尔洗绿 → 无（Ban #2/#3 + 「flip unmodified」硬条款，harness:59）。
- 删除或改写 `acceptsQuiz`/`realStaleReject` 语义 → 无（双门保留为 proof 实算真路径断言，与 B' 门锁同源同义）。
- 借 B'' 顺带碰 UC-018/052/004/flake/coveredCount/DELETE=503/SSOT → 无（diff 实证 4 docs 文件）。
- 冒领旧 `uc025:stale-quiz-expiry:prove` EXIT 0 → 无（Ban #9 显式）。
- 把 quiz 工件改强制入参（widen）→ 无（显式 Ban + 保留 resume-only 语义）。
- Pins 漂移 → 无（三份文档 + SSOT 逐字一致）。
- 把 dual PASS 写成 coding 授权 → 无（stub:25 / slice:3 / harness:3 三处显式否认）。

## Blockers

无。REQUEST 文档事实与源码、proof 实测、B' 门锁、SSOT 现状全部对得上；EXIT 契约可复现且诚实。

## Conditions（C-*，coding/post-prove 阶段必须满足，非本 docs gate 的 FAIL 项）

- **C-1（迁移锚点落法）**: 新鲜度锚点必须让**已迁移过的库**也具备该列——优先采用 harness:41 已列的「new non-destructive migration（`ADD COLUMN IF NOT EXISTS`）+ 更新镜像 `packages/db/sql/20_resume_quiz.sql`」；若原地改 `0007_resume_quiz.sql` 的 CREATE 块，已应用 0007 的库不会获得该列（repo 有 `tsx src/migrate-cli.ts` runner，迁移按次应用），service 引用不存在列 = 500 崩溃而非诚实 stale 拒绝。注意镜像文件是 `DROP TABLE … CASCADE` 重放型（`packages/db/sql/20_resume_quiz.sql:4`），非运行时安全迁移，不得混用。锚点须写于工件 `ready` 处（quiz worker / `quiz.service.ts`），read 期硬编码 `now()+N` 按 harness:41 判 stub 拒收。
- **C-2（post-prove 双审必查项）**: 静态 proof（正则，proof:58-59）分辨不了「解析但从不消费」「throw 被局部 try/catch 吞」。post-prove 双审（新文件，`harness:72`）必须核实：① stale throw 位于 begin 主路径、从 throw 到 HTTP 边界之间无局部 catch 吞（全局 exception filter 转换可接受）；② quiz 工件入参被 service 真消费（owner-scoped 读 `resume_quiz` 行），非仅解析；③ throw 确在扣额度/入队之前（真实顺序，非注释声明）。
- **C-3（EXIT 0 之后）**: 真接线后的 receipt 记实际 EXIT + code SHA + 双门实测值；EXIT 0 不关 `GAP-UC025-NEG-01`、不升 `UC-E2E-025` 行、不动 coveredCount=8；关闭须其自身 post-prove dual，升格须行自身 covered 准则（FAULT/BOUND/ADV 保持 not-run，ADV 保持 blind）。
- **C-4（文档卫生，非实质）**: stub/harness 的「Parent tip: `f3cf84c`」与 git 实际父提交差一位（`8084f09` 父为 `97d8889`，Line A' 无关文件；`f3cf84c` 为再上一位）。材料性声明——`f3cf84c` 与 B' FINAL `76d2bc3` 均在祖先链——已实测为真，故不构成 FAIL；后续 stub 请在提交时点引用精确 tip SHA。

## 中文三行摘要

1. `8084f09` 纯 docs（4 文件 +202/-0，零代码零 SSOT），其 EXIT 契约「接线前 1 / 真接线后预期诚实 0」与 B' 门锁（EXIT 1 锁至真接线、诚实 EXIT 0 仍非 covered）完全一致，`acceptsQuiz`/`realStaleReject` 双门保留为 proof 实算的真路径断言，未被删除或改写。
2. 复现实测：`package.json:148` 接线属实，reviewer 于 `f44d8da` 实跑证明脚本 EXIT=1（acceptsQuiz=false · realStaleReject=false · resume_quiz_expiry_column=false · contracts_stale_token=false），harness 逐条源码事实（两 begin 签名、7 个非 stale 错误码、迁移无过期列、契约无 token、旧 receipt EXIT 1 @ `0271ee4`）全部核验相符；receipt 记实际 EXIT 不预claim，禁改 proof 与「须改 proof 即停手上报」条款齐备，wash-green（改正则/布尔/stub/死旗标/串匹配）明令禁止。
3. 无 Blocker；附条件 C-1 迁移锚点须覆盖已迁移库（新非破坏迁移+镜像，防 500 假拒绝）、C-2 post-prove 双审须查主路径无 catch 吞与入参真消费且先于扣额度、C-3 EXIT 0 不关 GAP 不升行、C-4 父 tip 标注差一位（材料性声明已验证为真）；Verdict PASS，本段仅 docs gate，不授权 coding/prove，不代签 mw-rag-route。

Verdict: PASS

---

# POST-PROVE dual — GAP-UC025-NEG-01 real wiring · mw-e2e-ha（append-only · 独立复验）

**Status**: **POST-PROVE dual PASS**（独立复验 · 不信任实现方摘要 · alone ≠ dual · 不代签 mw-rag-route）
**被审包 tip**: `6e5252a`（`line/b2-uc025-wiring` 已推 origin）· 被审接线 commit `6cbaf04`（author mw-core）· 预收据 `cfc0c28` · base `f3cf84c` · REQUEST 双审基线 `8084f09`（见 C-5）
**Reviewer worktree**: `rv/b2p-e2e-ha` @ `6e5252a`（fresh worktree · 本审零写代码文件）
**Date**: 2026-10-03

## 1. 包完整性（cmd+exit 复现）

- `git diff f3cf84c cfc0c28 --name-status` → 恰 4 docs（slice/harness/两 pre-exec review stub），零代码。EXIT 0。
- `git diff cfc0c28 6cbaf04 --name-status` → **恰好申报 5 文件**：`interview.controller.ts`（M）、`interview.service.ts`（M）、`quiz-lifecycle.ts`（M）、`migrations/0135_resume_quiz_freshness_anchor.sql`（A）、`sql/20_resume_quiz.sql`（M）。无其他。EXIT 0。
- `git diff 6cbaf04 6e5252a --name-status` → 恰 2 receipts（pre-wiring + real-wiring）。EXIT 0。
- **proof 洗绿检查**：`git diff f44d8da 6cbaf04 -- apps/api/test/uc-e2e-025-nhp-neg.proof.mjs` = **空**；且全包 `f3cf84c 6e5252a` 同路径亦空。**proof 一字未动**。
- SSOT 零 diff（全包）：`e2e-requirement-coverage-matrix.md` / `e2e-covered-path-backlog.md` / `execution-master-checklist.md` / `production-backlog.md` / `gap-bug-backlog.md` 全空。矩阵未升行、coveredCount=8 未动、GAP-UC025-NEG-01 在 backlog:203 仍 **stays OPEN**。

## 2. fresh re-run（C-DUAL-FROM-FRESH · 恰好一次 · 禁重试已遵守）

- 前置：worktree 内 `pnpm install --frozen-lockfile` EXIT 0。
- **CMD**: `pnpm uc025:nhp-neg:prove`（runner = `node apps/api/test/uc-e2e-025-nhp-neg.proof.mjs`）
- **实测 EXIT = 0**（PROCESS_EXIT=0 · 第 1 次尝试 · 无重试 · attempts=1）
- 关键输出（本机 worktree @ `6e5252a` 实跑逐行）：
  - `releaseEvidence=false · haStatus=NOT_HA · claimProductionHA=false · coveredCount=8 · PG-retained · DELETE=503`
  - `inventory acceptsQuiz=true realStaleReject=true resume_quiz_expiry_column=false`
  - `contracts_stale_token=false`
  - `PASS  NHP-025-NEG-01  interview begin throws a stale-quiz HttpException`
  - `ROW_STILL_GAP  UC-E2E-025 §1.0.1 NEG was not flipped. The row is still gap.`
- 与 receipt `2026-10-03-uc025-nhp-neg-real-wiring-prove.md` 比对：**EXIT 0 == 0**，双门读数逐项一致，两非门读数（`resume_quiz_expiry_column=false` / `contracts_stale_token=false`）也逐项一致 → **可复现，无 wash**。pre-receipt（EXIT 1 @ `cfc0c28`，acceptsQuiz=false/realStaleReject=false）与 post-receipt 构成诚实前后对偶。

## 3. evidence-honesty 核查（reviewer 亲读代码，不信摘要）

- **stale throw 位置**：`interview.service.ts:209` `throw new HttpException({ error: 'stale_quiz' }, HttpStatus.CONFLICT)`，位于 `db.asPrincipal` 事务体内 begin 主路径：`interview_not_active` 守卫(:191)之后、resume 绑定块(:228-248)之前、**先于** `reserveEntitlement`(:271) 与 `enqueueInterviewJob`(:279)。✅
- **无局部 catch 吞**：begin 体内唯一 try/catch(:271-275) 只映射 `insufficient_entitlement`→402 且 `throw e` 原样重抛，且位于 :209 **之后**，物理上接不到该 throw；controller begin handler(:20-22) 直返 promise，controller 全部 try/catch 均在 SSE/TTS 端点(63-284)，不涉 begin → 异常直达 Nest 异常层 = 真 409。✅
- **入参真消费（非解析即弃）**：owner-scoped 真读 `SELECT status, expires_at FROM resume_quiz WHERE id=$1 AND owner_user_id=$2`(:200-203)，RLS 事务内；status!=='ready' 或 expires_at≤now 才拒。controller `@Headers('quiz-id')` 真透传 service 第 5 形参。✅
- **NULL 不假拒（pre-exec C-1）**：`quizExpired = expires_at != null && …`(:206-207) —— NULL 锚点不判过期，已迁移库旧工件/无锚点不被 500/假拒。✅
- **锚点写入（worker 侧）**：`quiz-lifecycle.ts` ready CAS 同事务写 `expires_at=now()+QUIZ_FRESH_TTL_MS(7d)`，被 abandon/并发改态则 0 行回滚不交付。✅
- **迁移三径**：`0135` = `ADD COLUMN IF NOT EXISTS`（非破坏，无 DROP）→ 已迁移库增量得锚点列；`0007_resume_quiz.sql` 全包零 diff（禁原地重写被遵守）；`sql/20_resume_quiz.sql` 镜像补列（重放型新库同得列）。✅
- **receipts verbatim**：两 receipt 均记实际值（pre=1/post=0）、attempts=1 无重试声明、SHA 齐全、输出块与 proof 真实打印格式一致；`Not a close` 一节显式不关 GAP、不升行、不动 coveredCount —— **无 preclaim**。✅

## 4. Fail-trigger audit

| Trigger | 结果 |
|---|---|
| 改 proof 洗绿 | 无（全包零 diff） |
| 改 SSOT/矩阵升行/coveredCount 动 | 无（五 SSOT 文件零 diff，backlog GAP 仍 OPEN） |
| preclaim（EXIT 0 写成 covered/关 GAP/升行） | 无（receipt `Not a close` + ROW_STILL_GAP 实打印） |
| 局部 catch 吞 stale throw | 无（唯一 catch 映射 insufficient_entitlement 且原样重抛，位于 throw 之后） |
| 原地重写 0007 | 无（零 diff；走 0135 增量 + 20 镜像） |
| stub/死旗标/布尔翻转 | 无（双门 regex 命中真实源码：controller+service 签名含 quiz-id/quizId，service 体真 throw） |
| fresh EXIT 与 receipt 不一致 | 无（0 == 0，双门逐项一致） |
| 重试/wash | 无（恰好一次，首跑即得） |

## 5. Blockers

无。

## 6. Conditions（C-*）

- **C-1（pre-exec C-1 · 本审已验证满足）**: 锚点列双径覆盖（0135 增量 + 20 镜像）、NULL 不当过期拒。已逐条验证为真；后续改动不得回退。
- **C-2（pre-exec C-2 · 本审已验证满足）**: stale throw 主路径无吞、入参 owner-scoped 真消费、先于扣额度/入队。已逐条验证为真。
- **C-3（pre-exec C-3 · 保持）**: EXIT 0 ≠ covered ≠ nail ≠ 关 GAP。`GAP-UC025-NEG-01` 仍 OPEN，其 OPEN→关闭属 nail 阶段协调方授权，实现方未擅关（本审确认）；`UC-E2E-025` 行保持 gap；FAULT/BOUND/ADV 保持 not-run。
- **C-5（本审新增 · 文档卫生非实质）**: 申报称预执行双审 `8613a3a`(rag)+`36f583a`(e2e-ha) 在 "origin main"；实测两 commit（含 REQUEST `8084f09`）位于 `origin/feat/mysql-schema-skeleton`，origin/main 历史从未含该 review 路径（main 疑 squash 合入）。**材料性声明已验证为真**（两 commit 存在、均 `Verdict: PASS`、内容与本刀对应），故比照 pre-exec C-4 先例不构成 FAIL；后续申报请引用精确分支+SHA。

## 中文三行摘要

1. 独立复验 `6e5252a` 包：接线 commit 恰 5 文件、proof 与五 SSOT 全包零 diff，fresh 恰一次实跑 `pnpm uc025:nhp-neg:prove` EXIT=0（acceptsQuiz=true · realStaleReject=true · ROW_STILL_GAP），与 receipt EXIT 0 及双门读数逐项一致，无重试无 wash。
2. 亲读源码验证：`stale_quiz` 409 真抛于 `interview.service.ts:209` 主路径，先于扣额度(:271)/入队(:279)，唯一 catch 只映射 insufficient_entitlement 且原样重抛；controller quiz-id 真收真透传，owner-scoped 真读 resume_quiz，worker ready 同事务写 7d expires_at；0135 非破坏 + 0007 零改 + 20 镜像，NULL 锚点不假拒已迁移库。
3. 无 Blocker；九项 pins 原值、GAP-UC025-NEG-01 仍 OPEN 未被实现方擅关（关闭属 nail 阶段协调方）、EXIT 0 不升行不关 GAP；附 C-5 文档卫生条件（预执行双审 commit 实在 `origin/feat/mysql-schema-skeleton` 而非申报的 origin main，材料性为真不构成 FAIL）；Verdict PASS，alone ≠ dual，不代签 mw-rag-route。

Verdict: PASS
