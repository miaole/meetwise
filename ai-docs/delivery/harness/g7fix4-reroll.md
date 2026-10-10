# G7FIX-4R — duplicate re-roll 根因刀（判重后果语义·首撞即死改有界换题）

**状态**：`draft_rev5:pre_exec_dual_PASS → exec:awaiting_post_prove_dual`（rev4 席1 三处逐字落位·rev3 声明与工件背离已消除）（rev3 席2 自纠三处方实际落字：pins r1Closed 恢复·avoid 注入三处删除·缓存回放路径校准——rev2 声称已落但 body 零改动·席2 抓出） · base = 主线 `e2834082` · 分支 `line/g7fix4-contract`（树上 HEAD `ed84a22d`·G7FIX-4 产品面对称标记已落 `07218104`/nail `37035c3d`——本文全部 file:line 以 HEAD 树亲证） · 立项依据 = G7FIX-3 EXEC 定谳（RUN 1 四元组 reason=`generation_duplicate_question`·同 run 先 concluding 面试 conclude 写 episode→第二题生成撞判重→终态死）+ G7FIX-4 nail 裁定（g7fix4-contract.md §5 Non-claims「本刀 ≠ duplicate re-roll 根因刀（另立）」——与本刀正交产品面可并行）。

## 1. 根因链码面亲证（全链 file:line·HEAD 树逐行核过）

判重后果语义过严 = 「首撞即判死·单 attempt 无 re-roll」，链条五段：

1. **判重读面**：`apps/worker/src/adaptive-interview-service.ts:178-180`——出题成功后确定性查重 `duplicate = await wasAsked(d.pool, d.owner, out.value.q)`（:180）→ `apps/worker/src/memory-service.ts:12-14` `wasAsked` 直通 `episodeSeen` → `packages/db/src/memory-store.ts:35-42` SQL `kind='episode'` 归一化精确匹配（:38-40·`owner_user_id` 租户硬过滤在 WHERE）·归一化=`normalizeQuestion`（:29-31 collapse 空白+trim+lower·**唯一真相·绝无语义/向量**）。
2. **episode 写入源（撞题机制）**：`apps/worker/src/adaptive-lifecycle.ts:386-388`——仅 `done`（conclude）时 `recordAskedQuestions`（memory-service.ts:20-26）把本场题面落 episode；故同 run/跨会话**先 concluding 的面试**已写 episode，后场生成同题（同能力种子易复现）即命中。
3. **判死点（根因手术位）**：`apps/worker/src/adaptive-interview-service.ts:186-187`——`if (duplicate) return unavailableGeneration('duplicate_question', {...})`，**一次命中即弃整场**。
4. **无 re-roll 的结构闸**：同文件 :86-91 `attempt !== 0` → `unavailableGeneration('attempt_replay_forbidden')`（图恒传 0，generate-question.ts:64）；:147-149 注释自证「One logical question node has exactly one provider attempt…cannot create a second :d1 request」；idempotencyKey 恒 `${threadId}:ask:t${turn}:0`（:151,:166）——判重是 invoke **返回后**的确定性检查，撞上后无任何换题通路。
5. **判死后果消费面**：`unavailableGeneration`（packages/domain/src/question-generation.ts:54-63·origin='unavailable'·'duplicate_question' 在错误码表 :13）→ 图节点 `packages/ai-graphs/src/adaptive-interview/nodes/generate-question.ts:66-68` `failClosed(state, provenance, 'generation_'+error)`= **`generation_duplicate_question`**（failClosed :14-26：`concluded:true`+`degraded`+`pending:null`；graph.ts:52 concluded→conclude）→ worker `apps/worker/src/adaptive-lifecycle.ts:23-40` `generationFailureOf`（origin==='unavailable' → reason=`generation_${errorCode}` :26-31）→ `writeGenerationUnavailable`（:47-77）：`failInterviewAndRelease`（:53）+ `markApplicationAssessmentUnavailable`（:60·G7FIX-4 对称标记）+ 事件 `assessment_unavailable:${reason}`（:65-68）/unbound 面 `interview_unavailable:terminal`（:71-75）。start 面 :205-218 / answer 面 :273-287 同 consumed。G7FIX-5 EXEC 四元组实证（terminal=assessment_unavailable·status=200·outcome=assessment_unavailable·reason=generation_duplicate_question）。

## 2. 修法：re-roll 语义设计（判重命中→换题替代判死）

**语义**：判重命中（§1.3 :186-187）不再首撞即 `unavailableGeneration`——先在 worker seam 内做**有界 re-roll**（重新经 invoke 生成替代题目并复检判重），上限内得到非重复题面则正常 `modelGeneration` 出题（整场继续）；**撞满上限仍重复 → 维持现判死不变**（fail-closed 语义从「首撞即死」收窄为「撞满上限才死」·非放宽验证·只改后果）。边界与上限：

1. **上限**：常量 `MAX_DUPLICATE_REROLL = 2`（单 turn 生成调用总数 ≤3 含初诊）·per-turn 计数·跨 turn 不累计·无循环放大。耗尽 → `unavailableGeneration('duplicate_question')` 原样（provenance 携带耗尽轨迹）。
2. **re-roll 必须同时换键+revision（DB/registry 契约三反证）**：同键 → invoke 缓存回放**同题**（packages/db/migrations/0088_….sql:424-426（invoke.ts:883-911 系标记写入侧非回放面））·同 revision 异键 → logical node header `canonical_invocation_mismatch` 判死（packages/db/migrations/0088_ai_model_invocation_controlled_state_machine.sql:272·claim 失败链 :383-409）·同键异 payload → `idempotency_key_payload_mismatch`（0088:417）。故 re-roll k 次用 `idempotencyKey` 与 `operation.businessRevision` 同步后缀 `${threadId}:ask:t${turn}:r${k}`（registry 自证「any retry requires a new revision and therefore a new, auditable node」model-operation-registry.ts:243·resolveModelOperation :245-263·每个 re-roll=独立可审计计费节点·interview.question-generation.v1 maxDispatches:1 :69-72 逐节点照旧）。
3. **复检面**：每次 re-roll 产出重过全既有确定性闸（verbatim 版权 :156·引文 :157-158/:188-193·schema :154）+ `wasAsked` 复检——**判重唯一真相仍是精确归一化**（memory-store.ts:27-31·不引入语义相似）。
4. **provenance 轨迹**：packages/domain/src/question-generation.ts:24-31 `QuestionGenerationProvenance` 增 **optional 字段**（如 `reroll?: number`·类型级零迁移零 SSOT）；re-roll 成功与耗尽判死均落轨迹，终态时随 provenance 自入 `assessment_unavailable` payload（adaptive-lifecycle.ts:65-68 零改自带）。
5. **保守面字节零改**：`duplicate_check_failed`（:181-184 记忆不可用→无法验证唯一性→仍判死）·`attempt_replay_forbidden`（:86-91）·provider/schema/business 分类判死（:167-175）·图节点 critique 判死（generate-question.ts:69-80）——全部不触；re-roll 完全封闭在 `retrieveAndGenerate` seam（:82-196）内部，图/lifecycle 契约零感知。

## 3. 产品语义影响评估

- **candidate 体验**：现面（G7FIX-4 后）判死=正向可重试终态（assessment_unavailable→mark-then-recover retry 新 interview·G7FIX-5 EXEC a4/a5 亲证），但候选人中途被终态打断+须手动重开整场；re-roll 后单次撞题 run 内自愈换题、零感知。G7FIX-3 EXEC 实证的第二题撞第一题 episode 面即此刀消解面。
- **计费**：判死面走 failInterviewAndRelease 释放/退款（adaptive-lifecycle.ts:377-380 注释+commerce 释放通路·G7FIX-4 §1.3 亲证）；re-roll 后面试正常 complete → 正常完成计费路径·无退款面变化；新增成本=每 turn ≤2 次 text-quality 生成调用·有界·各为独立 logical node 走既有 cost scope/meter（text-tokens）分账自动覆盖·无新账面。
- **安全性**：零 fail-closed 放宽（provider 错误/版权/引文/记忆不可用闸全保留）；判重仍精确归一化+owner 硬过滤（无语义误挡·无跨租户）；re-roll 全程可审计（每 roll 独立 header/invocation 行+provenance 轨迹）；失控面=模型连续同题→上限耗尽→仍判死·不弱化。

## 4. prove 策略（判重命中→re-roll→新题目成功断言）

新 prove script（apps/worker·命名仿 `prove:adaptive-life` → `prove:g7fix4-reroll`）·**全离线 scripted-model+fixture-PG·est live=0**（Ban 上限仅约束若协调方另令 live 冒烟：≤25 含 boundLoop）：

1. **主断言（命中→re-roll→新题成功）**：seed owner+episode（content=归一化 S1）→ scripted model 初诊返 S1、re-roll 返 S2 → `retrieveAndGenerate` 返 `ok===true` ∧ `normalizeQuestion(q)≠S1` ∧ invoke 计数===2 ∧ 第二次键/revision=`:r1` 后缀 ∧ provenance 带 reroll 轨迹 ∧ 无 unavailable；
2. **耗尽回归**：model 恒返 S1 → 上限到 → `unavailableGeneration('duplicate_question')` ∧ `generationFailureOf` 映射 reason=`generation_duplicate_question` 不变（判死面形状回归）；
3. **fail-closed 保留**：wasAsked throw→generation_unavailable·attempt=1→attempt_replay_forbidden·provider 错误分类判死——三面零位移；
4. **DB/registry 契约负证**：同 revision 异键→`logical_node_canonical_invocation_mismatch`（0088:272 设计约束 DB 层坐实）·新 revision 形过 `resolveModelOperation`（ok·logicalNodeKey 相异·revision pattern）；
5. **事件面回归**：判死事件键仍 `assessment_unavailable:generation_duplicate_question`（consumer 分流/键族零碰撞零改）；
6. **neg**：`prove:adaptive-life`+memory.proof+adaptive-degrade 既有键全绿零弱化·tsc 与 base 全等零新增。

## 5. 分批切片

- **S1（本刀主体）**：worker seam re-roll（:178-187 改写+上限常量）+ domain provenance optional 字段 + §4 全键 prove——恰两文件（adaptive-interview-service.ts + question-generation.ts）·零图零 lifecycle 零 DB 零 e2e；
- **S2（另裁后续）**：critique 场内 duplicate 面（generate-question.ts:69-80·ai-graphs 跨包）同语义化——本刀不做·登记 residual；
- **S3（协调方）**：e2e:isolated/G7TRIO 全景对 re-roll 面的观测键与判读——本刀外。

## 6. Ban

零迁移零 SSOT · G7 判定面零触（writeGenerationUnavailable/markApplicationAssessmentUnavailable/事件分流/finalize 契约/recruiter 恢复通路字节零改）· Key name-only · est live ≤25 · 图节点 attempt 契约零触（:86-91 语义不动）· 判重唯一真相不引入语义·**零 avoid prompt 注入**（cap+精确复检独立保证·avoid 提示仅引导非判重）/向量（memory-store.ts:27-31）· pins 十一值照抄（haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false）+脚注 actualSpendCny=null · 实现不自批·alone≠dual。

## 7. 验收

diff 面（恰 §5.S1 两文件）+ §4 prove 全键 EXIT 原值 + neg 全绿零弱化 + tsc 零新增 + 收据 `ai-docs/delivery/receipts/g7fix4-reroll/`。

## 8. Non-claims

本刀 ≠ G7FIX-4 finalize 契约刀（已落）≠ critique 场内判重语义（S2 另裁）≠ G7 收官 ≠ g7SuiteGreen 翻转 ≠ 判重/记忆读取语义改动（只改判重命中后的后果·不改何时算重复）。


---

## erratum（rev3 席1/席2 双审处方落实·d03e7b3b 事故级修正）

- pins 十值补回 r1Closed=false·actualSpendCny 退脚注。
- avoid prompt 注入三处正文删除（cap+精确复检独立保证·省第三文件）。
- 缓存回放引证校准：invoke.ts:615 'cached' 返回原 output·0088:424-426 replayable 标记写入侧。
- 计费引证 :377-380 释放/退款面（rev1 :359-361 系 completeInterviewAndConfirm 成功路径·本就错引）。
