# REASSESS-E2E REQUEST — UC-E2E-012/024（题级降级 / 补评闭环）矩阵 §1.0.1 `:118` 残余 cell（NEG/BOUND/ADV）三臂隔离收据处置（docs-only REQUEST 卷 · 起草落卷即停）

**Status**: **`executed:awaiting_post_prove_dual`**（2026-10-26 §9-EXEC 翻面 · 前值 `draft:awaiting_pre_exec_dual` 史录保留于 §8/卷尾注不回改 · pre-exec dual r2 双 PASS + 协调方授权落码+行使 · 三 case 门矩阵亲跑全绿 · prove 已行使 · post-dual 双审待派 · alone≠dual）· **STOP=executed（三处钉：本 Status 行 + §2 门矩阵 + §8）** · 本 commit 落码=§9-EXEC 交付面 · EXIT0=case≠covered · 行/列翻面权归协调方。
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503 · g7SuiteGreen=false · est live=0 · r1Closed=false · actualSpendCny=null。
**Date**: 2026-10-26
**Base / parent tip**: `origin/main` **`47f26403bb30debbb4cbe2c3bd99982e9f9ed5ab`**（`git fetch origin` 本 turn 成功 · worktree HEAD 恒等亲证 · 写前复核 tip 未前进）。
**Worktree**: `meetwise-reassess`（仓根同级 worktree · branch `line/reassess-draft` · 本 commit 恰 1 tracked `.md`=本卷）。
**席位**：UC-012/024 补评闭环 e2e 起草席（盘点面读码定稿+修法裁量+起草三责 · 协调方派单 · docs-only）。
**必读清单（EXEC 立项前逐件亲读）**：`AGENTS.md` → `ai-docs/delivery/REMAINING-NORTH-STAR-QUEUE.md`（Phase2 `:28` #12）→ `ai-docs/delivery/e2e-requirement-coverage-matrix.md`（§0.5 `:47` 强制列令 / §1.0.1 `:118` / §1 `:176`）→ `ai-docs/requirements/use-cases/e2e-scenarios.md`（UC-012 `:261-:272` / UC-024 `:274-:295`）→ `ai-docs/delivery/harness/nhp-batch-a-REQUEST.md`（同 row FAULT 认领卷 · `1a8a7977` · Status `closed`）→ 涉事机制源 §0.2 全表 → 形制范本=批 A 在树卷 + 批 C 在飞卷 `line/nhp-c-draft`（残余盘点/已认领排除面结构 · §0.0 亲读登记）。

---

## 认领核对（派单令第 1 工序 · fresh 行号亲点 @`47f26403b`）

- **矩阵行亲点**：`e2e-requirement-coverage-matrix.md`（blob `b0fd13d1`）§1.0.1 **`:118`** `| UC-E2E-012 / 024 | **gap** | **gap** | **gap** | **blind** | 补评闭环未进 HTTP E2E |` · §1 **`:176`** 同 ID 行（现有路径=「worker `adaptive-*:prove`；无独立 e2e 场景」· 覆盖状态=「**gap**→**partial**(graph)」· 备注=「状态机补评闭环未进 HTTP E2E」）。blob 对批 A 派单基线 `47dd6be56`（`0cf6ae18`）已漂移、`:118` 行号与四列字面亲读不变（行内容零翻动亲证）。
- **FAULT cell 已落（非本刀面）**：**NHP-012-FAULT-01** 已由批 A 认领并全链落卷（批 A 卷 §9-EXEC 三 case 之一 · §9-post `closed` · 73/73 EXIT=0 · 类型面修复重行使在卷）——**在树亲证**：proof `apps/worker/test/uc-e2e-012-nhp-fault.proof.ts`（blob `ca096a32`）· wrapper root `package.json:135-136` `uc012:nhp-fault:prove`/`:raw` · worker `apps/worker/package.json:39` `prove:uc012-nhp-fault` · 收据 `ai-docs/delivery/receipts/nhp-012-fault-01/` 在树 · gap id `GAP-UC012-FAULT-01`（批 A 具名认领）。**矩阵 `:118` 四列字面保持无注记原样=批 A 有意零翻动**（EXIT0=case≠covered · 行翻面权归协调方）——FAULT cell 现态读法=**gap / case-only**（case 证据 SSOT=批 A 卷 §9-EXEC/§9-post + 在树收据 · 非矩阵格）。
- **本刀认领（残余 cell）**：`:118` 行 **NEG=gap · BOUND=gap · ADV=blind** 三 cell。盘点席建议三臂「降级触发 / 补评闭环 / 幂等」**按产品码现形定标**（§1 亲证）为：
  | # | case | 认领 cell | 产品码现形定标 |
  |---|------|-----------|----------------|
  | 1 | **`NHP-012-NEG-01`** | **NEG**（gap→case-only） | **降级触发·负输入面**：answer-apply fence 族 + 事件原语 raw-answer 围栏（§0.2 缝 A/B）——负输入具型拒绝 · 降级状态不可被污染 · 零伪造评分事件 |
  | 2 | **`NHP-012-BOUND-01`** | **BOUND**（gap→case-only） | **幂等闸边界**：`event_key` arbiter（replay-returns-existing + ON CONFLICT 收敛 + 键域 kind 前缀零碰撞 + UNIQUE 底闸（0021 partial index · 勘误后 HEAD 唯一底闸））——spec「同题补评只算一次」的产品映射闸（§0.2 缝 C） |
  | 3 | **`NHP-012-ADV-01`** | **ADV**（blind→case-only） | **闭环完成条件·对抗面**：0046 完成闸 bypass 拒绝 + 结算终态配对禁令（§0.2 缝 D）——补评证据在场 ⇒ 对抗直写亦不得落 paid-completed |
- **spec 字面补评闭环 = NOT claimed（本刀停止条件已核 · 非空卷触发）**：spec UC-024 主流程字面件（后台补评 job / `pending_eval→evaluated` 题级状态机 / 报告分 CAS 重算 / `report_ready` 增量更新）**产品未接线**——fresh grep `pending_eval|eval_failed|AnswerEval|re_eval|reeval` 对 `apps/worker/src`+`apps/api/src`+`packages` 产品面 **零命中**（@`47f26403b` 亲跑 · 与批 A §3-D1 结论一致未翻面）。**码面可测注入缝存在**（§0.2 四缝全亲证）→ 不触发「无可测缝不入卷」停止条款；spec 字面 UC-024 面如实登记 NOT claimed（§3-D 系），留产品接线另刀。
- **Gap ids（本批具名认领 · 授权后执行方 grep 复核零既有钉）**：`GAP-UC012-NEG-01` · `GAP-UC012-BOUND-01` · `GAP-UC012-ADV-01`。
- **Experts**：`mw-e2e-ha` + `mw-rag-route`（stubs PENDING · Ban self-approve · alone≠dual · 断言面=终态/事件/围栏/闸语义，非 PII 域不换 privacy-int · 零模型质量断言不换 model-op）。
- **Authority**：meetwise — docs REQUEST only · Ban secrets/`.env*` · Ban force-push · Ban push · Ban SSOT 翻行 · Ban coding · Ban live · Ban fake-green suite。

---

## §0.0 在飞线登记（防重双对表 · 起草 turn 亲证）

- **本刀唯一性**：`git worktree list` 含 `meetwise-reassess` 恰 1 树（branch `line/reassess-draft` @`47f26403b` 本刀独占）；`ls ai-docs/delivery/harness/ | grep -i reassess` 建前零命中 → 落卷后唯一同名 REQUEST=本卷；`grep -rn "NHP-012-NEG\|NHP-012-BOUND\|NHP-012-ADV"` 全 ai-docs 建前零命中（三 case 名本刀首钉）。
- **NHP 批系占位表（`:118` 行互斥核对 · 全部亲读）**：批 A=`:114/:118/:128` 三行（`line/nhp-batch-a-draft` · **已并线落卷 `closed`** · 取 `:118` 行 FAULT cell）；批 B=`line/nhp-batch-b-draft`（**已并线 #146** · mergeCommit `b894cad88` · rev 承登 · 认领 `:115-117`+§1.0.2 `:147-148`+case-matrix `:46-59/:83`）；批 C=`line/nhp-c-draft`（worktree `meetwise-nhp-c` @`aa3f68d92` 在飞 · rev 承登刷新 · 认领 `:120`/`:121`+§1.0.2 `:146`）。**三卷与 `:118` 残余 NEG/BOUND/ADV cell 零重叠**（行级互斥 + 本刀 cell 级切分=同 row 内 FAULT 归批 A、余三 cell 归本刀 · 批 A §1 Row 1「缺列形状（本刀不动）：NEG/BOUND/ADV 留另刀」即本刀出典）。
- **同基线在飞邻线**：`line/clock-e2e-draft`（`meetwise-clock` @`136b66b4d` · rev 承登刷新 · UC-030 族）与本刀同 base 不同 row · 零文件交叠（本刀仅新增 1 harness 文件 · 零触共享 SSOT）。
- **本刀=docs-only 起草卷**：在飞交叠复核对象=§0.1/§0.2 锚 Stability（非触面）——任一锚 blob 对届时 tip 漂移→重 pin 改锚非停（本刀零写触 · 漂移不改结论）；共享 SSOT（matrix/LEDGER/backlog/case-matrix）零写触。
- **EXEC 立项全量重 pin 条款确认（rev 承登）**：立项时照 §8 协议对届时 main 全量重 pin（先并届时 sanctioned 主线再全量重 pin · 结论不变只更行号）· **`:118` 残余 NEG/BOUND/ADV cell 对届时 matrix 重核**——任一 cell 已被他刀认领/闭合 → 对应 case 段降级回归守卫或停 · 归协调方裁；本 §0.0 在飞表=起草时点快照（rev 已刷新：批 B 已并 #146 · 批 C tip `aa3f68d92` · clock `136b66b4d`）· 届期以届时亲读为准。

## §0 锚（blob 亲算 · 本席 `git rev-parse HEAD:<path>` 逐条亲算 @`47f26403b` · 非 {转抄}）

### §0.1 行锚

| 锚 | blob SHA-1 | 钉位 |
|----|------------|------|
| `ai-docs/delivery/e2e-requirement-coverage-matrix.md` | `b0fd13d1f5bcfaac5f85573c05a20823844fe552` | §1.0.1 `:118` · §1 `:176` · §0.5 强制列令 `:47` |
| `ai-docs/requirements/use-cases/e2e-scenarios.md` | `9976f9c38208b34bb13f2ceab3d22f9265e9f7b1` | UC-012 `:261`（TC-E2E-012-degrade `:272`）· UC-024 `:274`（backfill `:290` / idem `:291` / eval-fail `:292` · 勘误：原钉 `:292/:293/:294` 越一行已复点改锚） |
| `ai-docs/delivery/harness/nhp-batch-a-REQUEST.md` | `1a8a7977…`（Status `closed` · 同 row FAULT 出典卷） | §1 Row 1 · §3-D1 · §9-EXEC/§9-post |
| `ai-docs/delivery/REMAINING-NORTH-STAR-QUEUE.md` | `a7d8959a45fe938d44b9a9dcbb17880c0a96289c` | `:28` Phase2 #12 |
| `scripts/ai-docs/public-text-policy.mjs` | 起草钉 `faae2729…` → **届期 `e33818a6d38d83528d5414815462cb6de87ca43b`（cap 锚漂移登记 · 届期亲证）** | 届期 `:149` `MAX_FILES = 2_386`（原钉 `:147` `2_378`@`faae2729` 已漂 · 2386 届值重算承登 · 门预算锚） |

### §0.2 码面锚（产品缝四族 · symbol 级 · 位移按 symbol 重钉）

**缝 A · 降级触发缝（worker 投影面）** — `apps/worker/src/adaptive-lifecycle.ts` blob `db96efec972f6a2f903a256303c6591afbb57ee4`（对批 A 派单基线恒等 · 稳定缝）：

| 行 | 缝 |
|----|----|
| `:490` | `const unscored = last.outcome === 'unscored'`（降级判定） |
| `:522-:526` | generationFailed 臂 `answer_unscored` append · event_key=`answer_unscored:${input.questionId}`（`:526`） |
| `:531-:535` | 主 unscored 臂 `answer_unscored` append · event_key（`:535`） |
| `:536-:544` | unscored 臂下一题 `question_ready` 同事务推进（图不中断 · AG-F 注记 `:536-:537`） |
| `:843`（邻件） | `apps/worker/src/adaptive-interview-service.ts`（`71c9a502…`）`:843` `reason: \`evaluation_${out.error}\``（reason 收敛缝） |
| `:1024`（邻件） | `packages/ai-runtime/src/invoke.ts`（`f6102433` · 批 A 钉恒等）`:1024` catch → `externalOutcome: 'unknown'`（throw≡unknown 收敛） |

**缝 B · NEG 负输入围栏（answer-apply 面）** — 同 `adaptive-lifecycle.ts` + `packages/db/src/interview/interview-question.ts` blob `02605c2d…`：

| 行 | 缝 |
|----|----|
| `:487` | throw `answer_not_applied_to_expected_question`（投影题不匹配） |
| `:496` | throw `answer_identity_lost`（claim 证伪） |
| `:498` | throw `answer_apply_fence_lost`（占用围栏证伪） |
| `interview-question.ts:115-125` | `verifyInterviewAnswerClaim`：status∈('queued','answered')+answer_id+answer_hash 全等才真 |
| `interview-question.ts:128-138` | `markInterviewAnswerApplied`：同 identity 重放=幂等 true · 异 identity=stale |

**缝 C · 幂等闸（事件原语 arbiter）** — `packages/db/src/interview/interview-event.ts` blob `880a1dcb7b4751e061b28207df7699573b712931`：

| 行 | 缝 |
|----|----|
| `:16` | `appendEvent`（原语③ durable ordered event log） |
| `:19-:21` | raw-answer 围栏：payload 顶层 `answer` 键一律拒 `interview_event_raw_answer_fenced` |
| `:22` | `pg_advisory_xact_lock(hashtext(stream))` 同 stream 串行 |
| `:23-:26` | event_key 先查：重复返回既有 seq（**replay-returns-existing** · 零新事件） |
| `:29-:33` | `INSERT…SELECT MAX(seq)+1` + **`ON CONFLICT (stream_key,event_key) WHERE event_key IS NOT NULL DO NOTHING`**（`:32`） |
| `:37-:40` | 冲突后复读返回既有 seq |
| `0021:3` | `packages/db/migrations/0021_interview_question_identity.sql`（`c9060761…`）`uq_interview_event_key` **partial unique index（`WHERE event_key IS NOT NULL`）= HEAD 唯一底闸**（仍被 appendEvent `:32` ON CONFLICT 谓词选用）——**勘误：原「0027:5 `uq_interview_event_key_constraint` 表级底闸」现役表述作废**，0027 约束已于 `packages/db/migrations/0149_money_status_constraints.sql`（`cec80b94…`）`:77` `DROP CONSTRAINT IF EXISTS uq_interview_event_key_constraint` 删除（注释 `:76` 纯冗余消除 · 零重建 · 0027 blob `520d5903…` 恒等 · `@47f26403b` 亲证 0149 已在树） |
| `adaptive-lifecycle.ts:84-:86` | 事件键域注记：`assessment_unavailable:${reason}`（generation_* 前缀）与 `no_eligible_scored_answer`/`evaluation_unscored` 固定键零碰撞——**kind 前缀键域**（`answer_unscored:Q`/`answer_evaluated:Q` 可共存）=arbiter 键域边界 |

**缝 D · 闭环完成条件（DB 完成闸 · 结算完整性）** — `packages/db/migrations/0046_application_assessment_recovery.sql` blob `c41a946638ae0ec22675f7c4186e2a9f2f6542f1`：

| 行 | 缝 |
|----|----|
| `:114-:116` | 注记原文：不许 repair script / 未来 lifecycle 绕过 `answer_unscored` 臂把缺证据改成 paid-completed（**对抗面对象具名**） |
| `:118-:137` | `enforce_interview_scoring_completion_integrity()`：completed 入转换时 EXISTS(`answer_unscored`) ⇒ `:130` `RAISE 'interview_completion_requires_all_answers_scored' ERRCODE='23514'`（全事务回滚） |
| `:139` | 触发器 `trg_interview_scoring_completion_integrity` BEFORE UPDATE OF status ON interview |
| `:144` | `enforce_interview_consumption_terminal_pair()`（scoreless/crashed 评估必须配对 released · 禁 `(failed, reserved)` 直写） |
| 收口引用 | `adaptive-lifecycle.ts:637-:641` AG-F 边界注记（三分支谓词零位移 · 0046 在 DB 层钉死「answer_unscored 在场 ⇒ 禁 completed」）· `:642`/`:647`/`:674-:679` 收口三分支（批 A FAULT case 已行使 fail 臂 · 本刀不重行使） |

---

## §1 红事实与三臂定稿（prove-only · 零产品码 · 沿 uc027/uc028 mark-red 纪律形）

**红事实**：`:118` 行四列 gap/gap/gap/blind（`:176` 「无独立 e2e 场景」）；FAULT cell 唯一具名 case（批 A）；NEG/BOUND/ADV **零具名 case**；spec 字面补评闭环产品零接线（§0.0 认领核对 fresh grep 亲证）；既有旁证 `pnpm adaptive-degrade:prove`（root `:611-612` · 服务形降级 · `apps/worker/package.json:76`）= 非具名旁证零改动互不替代。

**修法形状**（沿批 A Row 1 / NHP-016 先例）：每 cell 一个具名 NHP case = 新 proof 文件 + root wrapper 双行 + worker prove 行 + runner 注册（**prove-only · 零产品码改动** · `apps/*/src`/`packages/*/src` 零 diff 意向）；isolated 真 PG（migrations 齐跑 · `scripts/run-e2e-isolated.mjs`）· **零 live 模型 · 零 MODEL_API_KEY · 零外呼**（`env -u` 三键具名：`MODEL_API_KEY`/`DASHSCOPE_API_KEY`/`DASHSCOPE_COMPAT_BASE_URL`）· 造数经产品路径（Ban 裸 INSERT · 夹具豁免清单沿批 A rev2 ② 形逐项具名入收据）。三 case 互不替代互不借用（Ban 互借关 cell）；行状态/列状态一字不动：EXIT0=case≠covered，升格仅经 coordinator nail；coveredCount=8 不变。

### case-1 `NHP-012-NEG-01`（NEG cell · 缝 A+B · isolated 真 PG + 真产品路径）

- PC = scripted 合法答案走通 answer-apply（对照 · 防假绿）；**N1** 投影题不匹配答案 → `:487` 具型拒；**N2** identity 伪造/陈旧 → `:496` + `verifyInterviewAnswerClaim` 证伪路径；**N3** 围栏占用后异 identity 重答 → `:498` + `markInterviewAnswerApplied` stale 臂（同 identity 重放=幂等 true 断言为对照半臂）；**N4** 事件原语 raw-answer payload → `interview_event_raw_answer_fenced`（`interview-event.ts:19-:21`）。**全臂断言**：具型 code + interview_event 零新增（零 `answer_unscored`/`answer_evaluated` 伪造）+ interview/interview_question 状态零漂。
- **与批 A FAULT case 互斥**：批 A F1–F4=模型侧失败注入；本 case=输入侧负例。零重叠零借用。

### case-2 `NHP-012-BOUND-01`（BOUND cell · 缝 C · isolated 真 PG + 原语级行使）

- **B1** replay-returns-existing：同 event_key 二次 append → 同 seq 返回 · 行数零增（`:23-:26`/`:37-:40`）；**B2** 并发竞态收敛：双并发同 `(stream_key,event_key)` append → 恰 1 行（`:22` advisory 锁 + `:32` ON CONFLICT + 复读收敛）——**双臂须双会话（双 pool client）· 禁同事务自串行冒充并发**；**B3** 键域边界：`answer_unscored:Q` 与 `answer_evaluated:Q` 共存零碰撞（kind 前缀键域 · `:84-:86` 注记同构）——spec 字面 `(interviewId,questionId)` 幂等键若去掉 kind 前缀必与 evaluated 事件碰撞 → **键域边界即产品闸语义**（D2 披露）；**B4** 唯一底闸（勘误后口径）：绕仓储直 INSERT 同键 → **断言口径 errcode-only 23505（Ban 约束名字面断言）**——HEAD 唯一底闸=0021 `:3` partial unique index `uq_interview_event_key`（`WHERE event_key IS NOT NULL`）· 0027 表级约束已于 0149 `:77` 删除（冗余消除·零重建）· **直 INSERT 臂须 owner 角色会话（或 app_role+GUC 就位）防 42501**（仓储先查之下的一致性 · 防御纵深）。
- **与批 A F3 互斥**：批 A F3=drain 循环级二次不重发；本 case=原语级/约束级/并发级边界。零重叠零借用。

### case-3 `NHP-012-ADV-01`（ADV cell · 缝 D · isolated 真 PG · DB 闸对抗行使）

- **A1** 对抗 bypass：`answer_unscored` 在场流上直 UPDATE interview→`completed` → 23514 `interview_completion_requires_all_answers_scored` 全事务回滚（`:118-:139` · `:114-:116` 具名对抗对象=repair script）；**A2** 结算配对 bypass：禁对 `(failed, reserved)` 直写 → `enforce_interview_consumption_terminal_pair`（`:144`）拒——**reserved 行经产品路径 reserve 落（具名入夹具豁免清单 · Ban 裸 INSERT）**；**A3** 正控（防恒红假绿）：同 UPDATE 在零 unscored 流上成功 completed——**夹具前提=entitlement_consumption 无行或 confirmed（防 `invalid_interview_consumption_pair` 假因红 · 0046 同触发器对 completed∧非 confirmed 亦 23514 · 正控臂红因必须归零否则夹具污染非闸语义）**——闸按证据条件触发非按篡改检测；**A4** 重复 bypass 幂等拒 · 零部分写。**语义钉**：补评证据在场 ⇒ 对抗直写亦不得落 paid-completed（spec UC-024 后置「无悬挂」的产品映射闸 · D3 披露）。
- **与批 A F4a 互斥**：批 A F4a=worker 收口 fail 臂产品路径；本 case=DB 闸层对抗 bypass。零重叠零借用。

### D 系披露（mark-red 纪律 · Ban 冒充字面）

| id | 披露 |
|----|------|
| **D1** | spec `AnswerEval=pending_eval/eval_failed` 题级状态机 ≙ 产品 `answer_unscored` interview_event（append-only · event_key 幂等）——**映射披露**（承批 A §3-D1 · fresh 复核未翻面）；spec 字面补评 job/CAS 重算/report 增量=产品零接线 → **NOT claimed**（TC-E2E-024-backfill `:290` 面留产品接线刀 · §0.1 勘误同锚）。 |
| **D2** | spec E-补评幂等「`(interviewId,questionId)` 幂等键·同题只算一次」≙ 产品 **kind 前缀 event_key** arbiter（`answer_unscored:${questionId}` · UNIQUE(stream_key,event_key)）——断言键全用产品真键域 · Ban 宣称字面 spec 键已验。 |
| **D3** | spec UC-024 后置「所有题∈{evaluated,eval_failed}」≙ 产品 0046 完成闸语义（unscored 证据在场 ⇒ 禁 completed + fail 臂 release）——本 case-3 只钉**闸的对抗拒绝面**；「补评后重算并回填」全流程 NOT claimed。 |
| **D4** | spec UC-012 A2「UI 稍后评估」= UI 面零触；E1 transient 重试分支 NOT claimed（NHP-016 Y2 先例同口径）；模型质量归 ai-eval（`:176` 备注原样）。 |

### 缺列形状（本刀不动）

FAULT cell=批 A case-only（零触零 wash）；PERF/LOAD 列零触；case-matrix（`non-happy-path-perf-load-case-matrix.md`）零写触——NHP-012 族 case-matrix 登记=§1.0.3「后续 knife 改行时同步」义务，本刀不改行故不触发；批 A FAULT case 未入 case-matrix 现状如实承登（行改刀时一并补登归协调方）。

## §1.3 否决（防 EXEC 期重开）

- **甲 invent covered**（翻 `:118` 行/写 partial-as-closed/宣称补评闭环已验）：EXIT0≠covered · 翻面权归协调方 → 否决。
- **乙 retry-to-green**（门红重跑冲销/改断言迁就）：attempts 全记录 · EXIT1 诚实保留 → 否决。
- **丙 live key**（真模型外呼/fake provider 冒充闭环）：est live=0 · `env -u` 三键 → 否决。
- **丁 触产品码**（改 adaptive-lifecycle/interview-event/interview-question/0046 或新增迁移「接线」补评闭环）：缺口=断言面缺非码面缺 · 接线归产品刀 → 否决。
- **戊 越行认领**（碰批 A FAULT case 收据/批 B/C 在飞认领行 `:115-117`/`:120`/`:121`/`:146-148`）：行级+cell 级互斥 → 否决。

## §1-交付面（EXEC 期 · 授权后 · 越界即停）

件① `apps/worker/test/uc-e2e-012-nhp-{neg,bound,adv}.proof.ts` 三新件 · 件② root `package.json` 三 wrapper 对（`uc012:nhp-{neg,bound,adv}:prove`+`:raw`）· 件③ `apps/worker/package.json` 三 prove 行 · 件④ `scripts/run-e2e-isolated.mjs` runner 注册（四位沿批 A：SOURCE_PATHS/allowlist/isolatedCommand/pre-migrate 名单——**SOURCE_PATHS 迁移清单 0027→0021 勘误**：以 0021 为唯一底闸钉 · 可加 0149 作删除证据钉 · **四位 + 届期 runner 现状核对第五位 resource-caps**（批 C `aa3f68d92` 五位注册先例形 · 届期对届时 runner 亲核有无后择形））· 件⑤ tracked 收据 `ai-docs/delivery/receipts/nhp-012-{neg,bound,adv}-01/`（implementer pre-commit runs · **not evidence of record**）· 件⑥ egress 清单 additive 九目（三键 × 三 proof · class=test-isolation · 沿批 A `39f56cbb5` 先例形 · **egress 登记与 proof 同 commit 落**——批 A 热修教训承登）。**本 commit（起草落卷）**=恰 1 tracked `.md` 本卷 · 零码零 proof 零注册。

## §2 门矩阵（per-case · pre-dual → prove → post-dual · **Status：`executed:awaiting_post_prove_dual`**〔2026-10-26 §9-EXEC 翻面 · 原值 `draft:awaiting_pre_exec_dual` 史录留痕不回改〕· prove 已行使（§9-EXEC 三 case 全绿 62/62·29/29·45/45）· post-dual 双审待派）

| Row | case / prove 命令（授权后注册） | 证据层 | pre-dual stubs | post-dual stubs | 断言面 |
|-----|--------------------------------|--------|----------------|-----------------|--------|
| 1 | `pnpm uc012:nhp-neg:prove` → `apps/worker/test/uc-e2e-012-nhp-neg.proof.ts` | isolated 真 PG + 真产品路径（PC+N1–N4） | mw-e2e-ha + mw-rag-route | 同左 BOTH PASS | PC+N1–N4 |
| 2 | `pnpm uc012:nhp-bound:prove` → `apps/worker/test/uc-e2e-012-nhp-bound.proof.ts` | isolated 真 PG + 原语/约束级（B1–B4） | 同上 | 同上 BOTH PASS | B1–B4 |
| 3 | `pnpm uc012:nhp-adv:prove` → `apps/worker/test/uc-e2e-012-nhp-adv.proof.ts` | isolated 真 PG + DB 闸对抗（A1–A4） | 同上 | 同上 BOTH PASS | A1–A4 |

**邻门（命令在树亲证 · 非回归 · 题面值以届时实测为准）**：`pnpm uc012:nhp-fault:prove` EXIT=0（root `:135` 在树 · 批 A 题面 73/73）· `pnpm adaptive-degrade:prove` EXIT=0（root `:611` 在树）· `pnpm turbo typecheck` EXIT=0 · `pnpm turbo lint` 全绿恰等帽（root `package.json:8` **5274** · worker `:7` **977** · @`47f26403b` 亲证 · 本刀新增 .ts 面 worker 贴线可能漂移——EXEC 届时实测 · 任一值新增超支即停上报）· `node scripts/ai-docs/check-docs.mjs` EXIT=0 ≤cap **2386**（cap 锚已漂 `faae2729`→`e33818a6` · `:149` 届期亲证 · 届值随令重算）· markers 五类零命中（§7）· `pnpm install --frozen-lockfile` EXIT=0 · PIN 门（proof 内建产品 diff 边界机检 · 沿批 A rev2 守护形：§0.2 四缝族文件 blob 前后全等）。

**EXIT 契约**：EXIT0 = 各 case 全臂绿 + attempts 全记录 + 收据落盘 = **具名 case 真证据 · EXIT0 ≠ covered ≠ suite green ≠ 行/列升格**（升格仅经 coordinator nail additive honesty）· §0.1 `:118`/`:176` 措辞不动 · coveredCount=8 不变 · ≠HA。EXIT1 = 诚实保留（闸被实证可绕/幂等竞态双写/负输入污染降级状态任一被实证=产品缺陷）→ 保留 gap + 缺陷登记 backlog + **Ban retry-to-green · Ban 改断言迁就** · 修复另刀。

**门预算核（起草层 · 亲跑在卷）**：`node scripts/ai-docs/check-docs.mjs` 届值 **EXIT=0 · scanned 2376 ≤ cap 2378**（@`47f26403b` 本席亲跑）；本卷落卷后 **2377 ≤ 2378 零越限**。**cap 锚漂移登记（rev 承登）**：`faae2729`→`e33818a6` · cap 2378→**2386**（`:149` · 届期亲证）· **2386 届值重算：rev turn 亲跑 EXIT=0 · scanned 2377 ≤ 2386**（@本 worktree 亲跑）· EXEC 期对届时 tip 亲算。**EXEC 期预告**：预期 tracked 增量（件①–⑥ ≈ +16 路径 · 受管扫描计入口径届时亲算）将超余量 → 沿 2346→2354→2362→2370→2378 先例需协调方 cap sanction 步进（派单令预授权承登 · **步进值随 EXEC 届时实测亲算后随令落码 · 本席不自裁** · 批 A §9-post 先例形）。

## §3 范围外（越界即 FAIL）

1. `e2e/*.e2e.ts`/full.e2e 专段零触（`:176` 「未进 HTTP E2E」如实保留——本三 case=worker/DB 层 isolated 面 · 非全链 HTTP）；2. 产品码零触（§1.3 丁）；3. 批 A 收据/proof/矩阵注记零触（§1.3 戊）；4. 共享 SSOT 零写触（matrix/LEDGER/backlog/case-matrix · 行翻面权归协调方）；5. 零 live 模型零 CI 改零依赖升级（est live=0 全期）· Ban 触其他工作树。

## §4 依赖

①上游已满足：降级事件面/围栏族/arbiter/0046 闸全在树（§0.2 · 批 A 钉文件 blob 恒等亲证 · 稳定缝）；②无同文件并发：docs-only · §0 锚漂=重 pin 非停 · EXEC 期预期触面（apps/worker/test 新件+root/worker package.json+runner+收据+egress）对在飞分支（批 B/C/clock-e2e 等 §0.0 表）题面复核——**root/worker·api package.json、runner、egress-inventory 系批 B/C 已汇聚共享文件 · EXEC 按 §8 先并届时 sanctioned 主线后 additive 合入（批 B `2d20f876d` dual-keep 先例形）· 行号锚并线后全量重钉**；③无迁移：链顶零增（0046/0021/0027 已在链 · 本刀零迁移面）；④下游：三 cell 翻面归协调方 · spec 字面补评闭环接线归产品刀。

## §5 Ban 列表 + pins

**Ban 列表**：Ban push/force-push（git 写只本 worktree commit）· Ban 自批（pre-exec 双审两独立外席 · alone≠dual）· Ban retry-to-green（§1.3 乙）· Ban invent covered/翻面（§1.3 甲）· Ban live key/模型外呼（§1.3 丙 · est live=0）· Ban 触产品码（§1.3 丁）· Ban 越行认领与批 A/B/C 面触碰（§1.3 戊）· Ban 裸 INSERT 绕产品路径（夹具豁免沿批 A rev2 ② 逐项具名）· Ban 抢迁移号 · Ban 伪造已读/已验来源（§0 锚全亲证为本卷前提）· Ban 就地归因门矩阵外新红 · Ban 造 `.env*`/写 Key 值 · Ban 顺带升级依赖 · Ban 宣称 spec 字面 pending_eval 状态机/补评闭环已验（D1/D3）。

**pins（十二值零翻转 · 与首部 Pins 对称化承登）**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503 · g7SuiteGreen=false · est live=0 · r1Closed=false · actualSpendCny=null。

## §6 est live=0（起草 turn · EXEC 期同）

起草 turn 零实跑零模型外呼零 Key 加载零生产操作零 secrets（本卷 docs-only · 门矩阵行使全离线 isolated wrapper 口径沿承）。

## §7 markers=0（卫生声明 · 亲跑回执）

本刀改动集（本卷 1 `.md`）五类标记词 grep 零命中（起草席亲跑 · 词面运行时组装沿 `scripts/i6-239-gates.proof.mjs` §2-7 同口径：四词逐字符拼接+行首冲突标记正则——**词面绝不复抄入卷防自匹配**；改动集=`git diff --name-only HEAD`∪`git ls-files --others --exclude-standard` 双查 · 零命中 EXIT=0）。

## §8 STOP（开工三条款 + 停止条件四类）

**STOP** · **`executed:awaiting_post_prove_dual`**（2026-10-26 §9-EXEC 翻面 · 前值 `draft:awaiting_pre_exec_dual` 史录保留零字洗 · 三处钉=文首 Status/§2/§8）· pre-exec 双审两独立外席 r2 **BOTH PASS 落卷**＋协调方明示 EXEC 授权（committed SHA 重钉）已兑现；EXEC 立项未改本卷三 case 定稿（§1）/否决结论（§1.3）/Ban+pins（§5）/交付面清单（§1-交付面）· 立项时照 §0 协议对届时 tip（并线 `origin/main` `0246361dd`）全量重 pin（落点见 §9-EXEC）· **残余 cell 现状对届时 matrix `:118` 重核：NEG=gap · BOUND=gap · ADV=blind 三 cell 零被他刀认领/闭合（亲证）→ 三 case 全强度行使非降级**；spec 字面补评闭环 fresh grep 复核产品零接线（D1/D3 维持 NOT claimed）。**停止条件（四类 · 命中即停上报 · Ban 就地处置）——EXEC 期核：四类全未命中**（现场漂移=§0.2 四缝 blob 前后全等亲证；机制不满足=三主门全绿；越界需要=交付面六件内闭环；验收红=lint/docs cap 超支已按批 A §9-post 先例形 EXEC 实测步进落码 · 待协调方追认 · 详见 §9-EXEC）：
- **现场漂移**：届时 tip 对 §0.2 任一缝结论漂移（如 0046 闸被放松/arbiter 被改/围栏码被移/批 A FAULT 收据被洗）→ 停 · 重 pin 回炉。
- **机制不满足**：§2 任一门红且根因在本卷登记结论（如幂等竞态实双写/闸可绕/负输入污染状态）→ 登记结论被证伪 → 停 · 如实升级（Ban 就地改登记凑绿）。
- **越界需要**：修法诉求超 §1-交付面六件（需触产品码/迁移/HTTP e2e/live key/批 A 面）→ 停 · 另刀或协调方裁决。
- **验收红不可修**：§2 任一门红且根因不在本刀交付面（邻 proof 新红/lint 贴面超支/docs:check>cap）→ 停 · stash 对照亲证基线 · 如实登记（cap 步进与 lint 帽处置归协调方 · §2 门预算核承登）。

---

## §9-EXEC（EXEC 落卷 · pre-exec dual r2 双 PASS 放行 + 协调方授权落码+行使 · 2026-10-26 · 三 case 门矩阵亲跑全绿 · 零产品码）

**授权面**：pre-exec 双审 r2 席1/席2 双 PASS（协调方授权落码+行使 · colima 容器可用亲证 `docker info` EXIT=0）。本 EXEC 零产品码意向面：`apps/*/src`/`packages/*/src` 零 diff（§0.2 四缝族 + 批 A proof 九文件 blob 前后全等亲证=PIN 门 · 收据 sourceDigests 内产品文件 sha256 与 merge tip 一致=只读旁证）。

**并线与全量重 pin（§8 落点 · 结论不变只更行号）**：
1. **merge**：`origin/main` **`0246361dd`**（届值含 #146 批B/#147/#148 已 sanctioned 亲并；**#149 批C/#150 在飞如实采未并**——`gh pr list` 亲证 OPEN）· merge EXIT=0 零冲突（merge-tree 预演+实并双证）· `pnpm install --frozen-lockfile` EXIT=0。
2. **matrix**：blob `b0fd13d1`→**`6fc92dd0`**（并线批B注记随树推进）· §1.0.1 **`:118`** 行四列字面恒等（gap/gap/gap/blind 零翻动）· §0.5 强制列令 `:47` 恒等 · §1 同 ID 行 **`:176`→`:177`**（漂移改锚 · 字面恒等「worker `adaptive-*:prove`；无独立 e2e 场景 · gap→partial(graph)」）。
3. **其余行锚恒等**：e2e-scenarios `9976f9c3`（UC-012 `:261-:272` / UC-024 `:274-:295` · backfill `:290`/idem `:291`/eval-fail `:292`）· 批A卷 `1a8a7977` · QUEUE `a7d8959a`（`:28`）。
4. **cap 锚**：`e33818a6` 恒等兑现（`:149` MAX_FILES=2_386 届值亲证 · 零更新漂移）· EXEC 期实测步进 2_386→**2_392**（见 cap 步进段）。
5. **残余 cell 复核（§0.0）**：`:118` 残余 NEG=gap · BOUND=gap · ADV=blind 三 cell 零被他刀认领/闭合（rows `:115-121` 逐行亲读）· `NHP-012-NEG|BOUND|ADV` 全库零既有钉 → **三 case 全强度行使非降级**。
6. **§0.2 四缝 blob 前后全等（PIN 门）**：`db96efec` lifecycle · `71c9a502` service · `f6102433` invoke · `02605c2d` question · `880a1dcb` event · `c9060761` 0021 · `c41a9466` 0046 · `cec80b94` 0149 · `520d5903` 0027 · 批A proof `ca096a32`——commit 前后逐文件亲证恒等 · **spec 字面补评闭环 fresh grep 复核**（`pending_eval|eval_failed|AnswerEval|re_eval|reeval` 对 `apps/*/src`+`packages/*/src` 零命中 · D1/D3 维持 NOT claimed）。

**落地面（件①–⑥ · 本 commit tracked 清单）**：
1. **件①** 三 proof：`apps/worker/test/uc-e2e-012-nhp-neg.proof.ts`（PC 合法 answer-apply 对照 + N1 :487 具型拒 + N2 :496 verify 证伪 + N3 fence re-check 具型拒 + markApplied stale 臂原语直证 + N4 raw-answer 围栏 + 对照半臂×2 + INTEGRITY 五流总账）· `…nhp-bound.proof.ts`（B1 replay-returns-existing + B2a/B2b 双 pool client 双会话真并发恰 1 行 + B3 kind 前缀键域 + B4 直 INSERT errcode-only 23505 + INTEGRITY）· `…nhp-adv.proof.ts`（A1 unscored 在场直写 completed→23514 具名回滚 + A2 reserved 经产品路径直写 failed→23514 配对禁令 + A3 零 unscored 正控同形成功 + A4 重复 bypass 幂等拒零部分写 + INTEGRITY）。
2. **件②** root `package.json` 三 wrapper 对（`uc012:nhp-{neg,bound,adv}:prove` + `:raw` · 批A `:135-136` 同形后插）。
3. **件③** `apps/worker/package.json` 三 prove 行（`prove:uc012-nhp-{neg,bound,adv}`）。
4. **件④** runner 四位 ×3（SOURCE_PATHS 三条目 ≤14·allowlist 三行·isolatedCommand 三臂·pre-migrate 名单三行——**SOURCE_PATHS 迁移清单按 0027→0021 勘误：BOUND=0021+0149 唯一底闸钉 · NEG=0126 围栏 · ADV=0020+0046 闸**）+ **第五位 resource-caps 届期核对=N/A 不注册**（三 case 非 PERF/LOAD 面 · 批A FAULT 同不注册 · 批C `aa3f68d92`→`caf1bef08` 先例仅 PERF-api case 入 caps ternary 亲证）。
5. **件⑤** tracked 收据 `ai-docs/delivery/receipts/nhp-012-{neg,bound,adv}-01/`（各 3 件：docker-info + isolated-receipt.json + gate stdout · implementer pre-commit runs · **not evidence of record**）· `.tmp/` 全次留痕（含红次 11 件）。
6. **件⑥** egress 清单 additive 九目（三键 × 三 proof · `environmentReferences` 358→367 · class=test-isolation · **与 proof 同 commit 落**——批 A 热修教训承登）· `provider-egress:prove` EXIT=0。

**门矩阵亲跑（EXIT 原值如实录 · stdout 留痕 .tmp/ · 中间红次零冲销）**：
- `docker info` **EXIT=0**（colima · 00-docker-info.txt 三收据同源）。
- `pnpm uc012:nhp-neg:prove`：红次 R1-R10 **EXIT=1**（归因台账见下）→ **绿 62/62 · EXIT=0**（attempt11）。
- `pnpm uc012:nhp-bound:prove`：红次 R1 **EXIT=1** → **绿 29/29 · EXIT=0**（attempt2）。
- `pnpm uc012:nhp-adv:prove`：**首跑绿 45/45 · EXIT=0**。
- 邻门：`pnpm uc012:nhp-fault:prove` **73/73 EXIT=0**（批A 零回归）· `pnpm adaptive-degrade:prove` **EXIT=0** · `pnpm turbo typecheck` **EXIT=0** · `pnpm turbo lint` **EXIT=1→0**（cap 步进见下）· `node scripts/ai-docs/check-docs.mjs` **EXIT=1→0**（2392≤2_392）· `pnpm provider-egress:prove` **EXIT=0** · `pnpm install --frozen-lockfile` **EXIT=0** · markers 五类零命中（改动集 10 路径亲跑 · 词面运行时组装）· PIN 门=§0.2 blob 前后全等（上段）。

**红次台账（11 红次归因 · 全 EXEC/夹具/观测面侧 · 零产品缺陷 · 零自修产品码 · 门红 Ban 自修边界守住）**：
- NEG R1（16/57）：具型拒观测面误设 throw-surface——consumer 对非 transient 白名单码走确定性终态臂（`:601-610` catch→`failClaimedInterviewJob`→`markJobFailed` last_error=error.message 字面 + fail-closed release + interview_unavailable 恰一 + drain 返回 'failed' 不 throw）→ 校准为 `interview_job.last_error` 字面钉 + fail-closed 结算断言（观测面校准 · 承登本节）。
- NEG R2（15/62）：N2/N3 注入裸 admin 会话 UPDATE 撞 `interview_privacy_fenced`（0058 `interview_question_privacy_active_write_guard`=无主写手正确拒 · 产品正确行为）→ 注入改 app_role+GUC 会话（021:25 GRANT UPDATE app_role）。
- NEG R3-R7（含 :472 假因红）：N3 :498 可达性考据——drain 前 FOR UPDATE 使 :471 预 verify 撞 `answer_identity_not_claimed`；pg_stat_activity query 文本列 app_role 不可见致检测恒空；fence tx 先行语句即被 X 阻塞或 phase-2 先于 :495 落地（pg_locks blocking-pids 谓词修复检测后亲证占用可见时 :495 re-check 先行=:496）→ **:498 stale 臂要求占用恰落于 :495→:497 子语句窗，外部会话不可确定命中**——校准：N3 drain 级=:495-:496 fence re-check 具型拒 + **:497-:498 stale 臂语义经原语直证**（`markInterviewAnswerApplied(A)=false` + 同 identity 重放幂等 true 对照半臂）——语义面（具型拒/占用不被覆写/零伪造评分事件）零弱化。
- NEG R8-R10：注入会话/时序变体（同 R2/R3 根因族）。
- BOUND R1（1 失败+连接族红）：bigint seq 字面比较（`"1"!==1`）→ `seq::text` 数值化；双会话长开事务窗撞 idle-in-transaction 超时 → 开窗纪律（commit 即放 · 断言移出事务窗外）。
- ADV：零红次。

**cap 步进（EXEC 实测亲算 · 批 A §9-post 先例形 · 待协调方追认）**：
- **docs**：MAX_FILES 2_386→**2_392**（+6 = 收据净增计入受管扫描 · `2392≤2_392` EXIT=0 亲跑）。
- **worker lint**：977→**999**（+22 全部=本刀三 proof 的 `naming-convention`（模型服务键/产品行字段字面——批 A fault proof 同类在场）+ `no-explicit-any`（批 A 同形 `scripted` 记录/MemorySaver 适配）类 · **基线 977=977 恰零余量**（stash 对照亲证）· import/order+unused 可修类已修（28→22））。
- **root lint**：5274→**5296**（同 +22 计入 monorepo 全量 eslint · `5296≤5296` EXIT=0 亲跑）。

**守护兑现**：①壳行 'created'（NEG/ADV 全夹具 + BOUND 壳夹具 · 断言随臂）②夹具豁免逐项具名入收据（②a bucket 种子 · ②c 壳行 · ②N2/②N3 围栏占用窗口并发注入 UPDATE（app_role+GUC · 生效性臂内自证）· ②B2b/②B4 对抗直 INSERT（REQUEST 具名约束级行使）· A1/A3 consumption 无行前提 · A2 reserved=产品路径 reserveEntitlement）③零裸造业务行（resume 产品链→route 链→reserve→enqueue→drain 全产品路径）④env -u 三键具名+egress 九目同 commit ⑤B4 断言口径=errcode-only 23505（Ban 约束名字面 · 0021 唯一底闸 · 0027/0149 勘误承登）⑥Ban wash PIN 入卷（三 case 互不替代互不借用 · 批 A FAULT 面零触）。

**Non-claims**：EXIT0 ≠ covered ≠ suite green ≠ 行/列升格（升格仅经 coordinator nail additive honesty）· `:118`/`:177` 措辞零翻动 · coveredCount=8 不变 · ≠HA · est live=0 · D1/D3（spec 字面 pending_eval 状态机/补评 job/CAS 重算/report 增量 NOT claimed · 产品零接线 fresh 复核）· D2（断言键全用产品真键域 kind 前缀）· D4（UI 面/E1 transient NOT claimed）· N3 观测面校准（:498 子语句窗外部不可确定命中 · stale 臂经原语直证 · 上文台账）· 三 case 互不替代互不借用 · alone ≠ dual · **⛔push ⛔force-push**。

## §9-post 追认承登段（收官席 · cap 三帽追认随令行使 · 2026-10-26 · 本段纯文面 append · STOP=`executed:awaiting_post_prove_dual` 翻面不动 · post-dual 双审待派不变）

- **cap 三帽追认承登（协调方 2026-10-26 追认 · 沿批 A §9-post/`ded20bae6` 先例形）**：来源：批 C 后继补评闭环刀三 proof naming-convention/any 类·stash 对照基线零余量实证·协调方 2026-10-26 追认——EXEC `9c4784bc5` 实测三帽随令落码落注记（恰等零多放）：①docs `scripts/ai-docs/public-text-policy.mjs` MAX_FILES 2_386→**2_392**（`:151`·sanction 注记随刀·「上限经 2346→2354→2362→2370→2378→2386→2392 步进」行同步）+ 越限臂联动 `scripts/ai-docs/public-text-policy.proof.mjs`（fixture 注入 **2_392**·atCap/scannedFiles 同步·超限错误码形 **`PTP_FILE_LIMIT:2393`**·CAP-SANCTION-2392 注记随刀）——`public-text-policy:prove` **12/12 EXIT=0**；②worker lint `apps/worker/package.json` 977→**999**（+22=本刀三 proof `naming-convention` 产品行字段字面+`no-explicit-any` 批 A 同形类·基线 977 恰零余量 stash 对照亲证）；③root lint `package.json` 5274→**5296**（同 +22 计入 monorepo 全量 eslint）。
- **复跑绿（收官席亲跑 · EXIT 原值）**：turbo lint **12/12 EXIT=0**（root 恰 **5296** warnings/0 errors=帽恰等）· turbo typecheck **8/8 EXIT=0** · docs:check **EXIT=0**（scanned **2392**≤cap 2392 恰等零余量）· `public-text-policy:prove` **12/12 EXIT=0** · markers **0 命中**（本刀改动集 3 文件五类标记词+行首冲突标记 grep 亲跑·沿 `i6-239-gates.proof.mjs:154-163` 门口径）——停止条件「复跑仍红」未触发。
- **EXEC `9c4784bc5` 三 case 136 断言全绿承登**：uc012:nhp-neg **62/62** + uc012:nhp-bound **29/29** + uc012:nhp-adv **45/45** = **136/136 · EXIT=0**（§9-EXEC 门矩阵亲跑原值如实承登 · 零产品码）。
- **红次 11 归因承登**：NEG R1-R10 + BOUND R1 共 11 红次全归 EXEC/夹具/观测面侧（归因台账 §9-EXEC「红次台账」在卷 · 零产品缺陷 · 零自修产品码 · 门红 Ban 自修边界守住）。
- **N3 校准入卷**：`:498` stale 臂占用窗落于 `:495→:497` 子语句窗·外部会话不可确定命中→校准为 drain 级 `:495-:496` fence re-check 具型拒 + `:497-:498` stale 臂语义原语直证（`markInterviewAnswerApplied(A)=false` + 同 identity 重放幂等 `true` 对照半臂）· 语义面（具型拒/占用不被覆写/零伪造评分事件）零弱化（§9-EXEC 红次台账 R3-R7 同源承登）。

---


*REASSESS-E2E 记录 · 2026-10-26 起草（STOP=`draft:awaiting_pre_exec_dual` 史录）· 2026-10-26 §9-EXEC 翻面 **STOP=`executed:awaiting_post_prove_dual`**（三处钉：Status 行+§2+§8 · 前值史录保留零字洗）· 并线 base `origin/main` @`0246361dd`（#149/#150 在飞如实采未并）· 分支 `line/reassess-draft` · 工作树 `meetwise-reassess` · 门预算 EXEC 实测步进：docs 2_386→2_392 · worker lint 977→999 · root lint 5274→5296（待协调方追认 · 批 A §9-post 先例形）· 认领=`:118` 残余 NEG/BOUND/ADV 三 cell 全强度行使（FAULT 归批 A case-only 零触）· 三 case 门矩阵亲跑全绿 62/62·29/29·45/45 + 邻门族 EXIT 原值在卷（§9-EXEC）· 三臂按产品码现形定标（降级触发负输入面/幂等闸边界/闭环完成条件对抗面）· spec 字面补评闭环 NOT claimed（产品未接线 fresh 复核 · D1/D3/D4）· 行/列翻面权归协调方（coveredCount=8 零动）· alone≠dual · Ban self-approve · est live=0 · ⛔push ⛔force-push*
