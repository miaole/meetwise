# G5 SCOR-S3 EXEC 收据 · 残面收尾刀（项2 只读 practice_eligible 收窄 + 项3 GET 重闸）

- **席**: g5-exec（EXEC · 实现不自批 · alone ≠ dual · post-prove 双审待并行）
- **分支/基**: `line/g5-scor-s3` · rebase `feat/mysql-schema-skeleton`（tip `20186718`）· REQUEST `ai-docs/delivery/harness/g5-scor-s3-REQUEST.md`
- **Date**: 2026-10-11 · est live=0（零模型外呼·零 Key 接触·零 secrets·隔离 PG 即用即灭）· markers=0（改动集+0161 grep exit=1 亲证）
- **门禁总账**: 见同目录 `2026-10-11-gates.log`（12 门 EXIT 全绿·docs:check 预存红如实）

---

## 一、rebase 漂移表

| 项 | 值 |
| --- | --- |
| 主线 tip 实测 | `20186718`（feat/mysql-schema-skeleton） |
| 分支 merge-base | `20186718`（= 主线 tip） |
| rebase 结果 | `Current branch line/g5-scor-s3 is up to date.` —— **零重定位·零冲突·漂移=0** |
| G1 @3d61c091（scor-parity 57+0158+ADR accepted） | 已在主线史实，本刀零触零翻（⑦ 门复跑旁证） |

## 二、项2 逐条 file:line（只读 practice_eligible 收窄）

| # | 面 | 落点 | 改动 |
| --- | --- | --- | --- |
| 1 | SQL 收窄迁移 | `packages/db/migrations/0161_practice_only_read_narrowing.sql`（新建·编号无冲突：现树 0160 双号并存=h3 已登记史实，0161 空闲） | CREATE OR REPLACE `scoring_aggregate_interview_scores(text)`（0103:301-327 同形，四处 FILTER `:315/:316/:318/:320` 双态→`practice_eligible` 单态）+ `scoring_list_scorable_score_cards(text)`（0103:330-355 同形，`:348` 双态→单态）；权限四件套沿 0103 原值（OWNER scoring_definer_owner / REVOKE PUBLIC,scoring_worker_executor / GRANT app_role）；0103 原文零字节（Ban 复写兑现） |
| 2 | TS 谓词（D1） | `packages/domain/src/scoring-fact-root.ts:74-90` | 新增 `isPracticeReadableScoreCard`（practice 单态）；`isScoreCardScorable`（:70-73）双态本体零触（状态机/写路径/用途门单一真相） |
| 3 | derive 复用点 | `packages/domain/src/scoring-aggregation.ts:13,159,195`（doc :152-156,:188-192） | 两 filter 换 practice-only 谓词；TS 向 SQL 对齐 |
| 4 | honesty 复用点 | `packages/domain/src/scoring-honesty.ts:10,163`（doc :156-161） | `practiceOverallFromScoreCards` 换 practice-only 谓词（practice 名实一致） |
| 5 | 导出面 | `packages/domain/src/index.ts:226-232` | `isPracticeReadableScoreCard` additive 导出 |
| 6 | db 读面类型 | `packages/db/src/scoring/scoring-aggregation.ts:50-60,95-101` | `ScorableScoreCardRow.status` 收窄 `'practice_eligible'` 单态（写路径 `WriteFinalScoreCardInput.targetStatus` :32 双态零触） |
| 7 | 消费面 | `packages/db/src/growth-generation.ts:44` · `apps/worker/src/main.ts:172-189` | **零字节零 diff**（§1 行3 默认验收兑现；仅 status 无关映射）。披露：`worker main.ts:176` 注释仍写「仅 practice_eligible/b_review_eligible」——收窄后该注释对读面描述过时（非代码语义），如实留痕未动以免扩 diff |
| 8 | 断言面（D3） | `packages/db/test/scor-02.proof.ts:119-136`（翻转 :122）·`:409-459`（F1c 新增） | 见下第三节 |

## 三、D1-D3 EXEC 落卷

### D1 收窄形制（双审裁点「删 b_review_eligible 或保留单列」→ 裁：读面删·本体保留）
**裁定：TS 走「新增 practice-only 谓词 + 读面调用点单点替换」，`isScoreCardScorable` 双态本体零触；SQL 0161 两函数同刀同收单态；db 读面类型同收。** 依据（逐锚实测）：
- `scor-01.proof.ts:236-237` 有双态 join 断言 `=== 'practice_eligible,b_review_eligible'`（scor-01 零翻门）——本体收窄必翻；
- `packages/contracts/src/index.ts:1255` 钉 `isScoreCardScorable` 为「专用终态 writer 可写的目标态」门（S2 写路径面，§2 零触）；
- `scoring-operation-routing.ts:466-470` `canReportConsume` 复用本体作用途门（其 doc :464-465 明示双态用途门语义，S2 域零触）。
→ 本体收窄=最小波及面假象、实际波及三面零触域；谓词替换=读面三调用点（158/:193/:161）+类型收窄即闭环，scor-01/contracts/routing 全零翻。b_review_eligible 在读面被删（删=读面不可见），在状态机/写路径/用途门面保留单列（ADR :57 B 端门零松动）。TS 向 SQL 对齐（0161 单态）。

### D2 GET 失败返回语义 + 复核落点
**裁定：① 语义 = assessment GET → 409 `no_scorable_cards`（对齐 POST assessment `interview-assessment.ts:55` 既有信封映射，即 REQUEST 所指 :38 原映射）；career-path GET → 409 `insufficient_evidence`（对齐 POST career-path `interview.service.ts:758-764` 既有先例）。零新增响应码、零新增信封键（两码皆为既有码的既有 HTTP 面）。② 复核落点 = persisted 读后校验**（guard → 读 persisted 行 → 无行保持 404 语义原值 → 有行才在事务内重跑诚实闸 `aggregateInterviewScores`，`eligibleCardCount===0` → fail-closed 409 绝不发失配行）。
- 读后校验而非读前短路的实测依据：`neg-interview.proof.ts:396-403/:424-427` 既有断言钉「GET 未生成 → 404 not_found」——读前短路必翻 97 原值门；且失配缺口只在 persisted 行存在时成立（ADR :39 面），无行=未生成 ≠ 失配。
- 复核单源 = 0161 收窄后 `aggregateInterviewScores`（REQUEST §1 行5 指名单源；eligible=practice 单态，superseded/fenced 外层排除天然继承）。
- 落点：`apps/api/src/modules/interview/interview-assessment.ts:26-40`（G5 注记+`requireCurrentScorableCards` helper :36-40）·`:61-71`（getAssessmentFor 读后校验 :66）·`:73-81`（getCareerPathFor 读后校验 :78）；controller :211/:242 两路由零触。

### D3 翻转形制（Ban 删断言）
**裁定：原断言原位翻 + 就地注记逐值披露（base pin + 原值 + 收窄依据），Ban 删除；全仓翻转清单如下（零静默）：**
| 断言 | 文件:line | 原值 | 新值 |
| --- | --- | --- | --- |
| C 端评估消费面（practice 80+b_review 100） | `scor-02.proof.ts:119-127` | overall=90 | overall=80 + eligibleCount=1 + nonScorableCount=1（就地注记 @base 20186718） |
| honesty「可评分卡聚合」 | `scoring-honesty.proof.ts:42-49` | overall=90 | overall=80（就地注记）+ 新增 practice 单卡正测 |
| honesty 汇总行字面量 | `scoring-honesty.proof.ts:133` | `21 scenarios` | `22 scenarios`（+1 断言同步·非断言弱化） |

新增断言（只增不弱化）：`scor-02.proof.ts` D3 段 practice 单卡正测 + F1c 五条（写路径双态零触正测×2 / 收窄聚合 / 收窄读面单态 / fenced 负测）+ neg:interview 五条（§四）。honesty `:101-104` junior/mid 面零翻实测 PASS（停止条件 (a) 的 honesty 触发面未触发）。

## 四、项3 GET 重闸 prove 接线（§1 行6）

`apps/api/test/neg-interview.proof.ts` additive：
- harness 新增 `scoring_aggregate_interview_scores` 窄复刻 stub（函数体逐字同 0161 收窄后；既有 list 复刻件仍 0103 原文——其消费路径 POST assessment 本 proof 不触，注释逐块如实标注）；
- 夹具：IV_G5OK（practice 卡+assessment_report ready+career_path）/ IV_G5F（fenced 卡+两 persisted 行）/ IV_G5B（仅 b_review 卡+assessment_report）；
- 断言五条：GET assessment 正测 200 原值 / fenced → 409 `no_scorable_cards` / 仅 b_review → 409 `no_scorable_cards`；GET career-path 正测 200 原值 / fenced → 409 `insufficient_evidence`。97 原值零翻（gate 打印 102 全绿 = 97+5；`A(` 计数 98→103 佐证）。

## 五、EXIT 表（attempts 一次优先·零 retry-to-green）

| 门 | 结果 | 原值对照 |
| --- | --- | --- |
| db/domain/api/worker tsc 逐位置集 | 120=120 IDENTICAL | 预存红零新增（改动文件零命中） |
| web typecheck | EXIT=0 | 绿 |
| web:prove | EXIT=0 | 绿 |
| scoring-honesty proof | EXIT=0（22 scenarios） | 21 原值零翻 + 1 新增 |
| scor-02:prove | EXIT=0 | 原断言面零删（D3 翻转+新增除外）·F1 practice 夹具原值绿 |
| scor-01:prove | EXIT=0 | 零翻（:237 双态 join 原值绿） |
| scor03-evidence-conflict:prove | EXIT=0 | 零翻 |
| scor-parity:prove | EXIT=0 | 57 断言面零翻（PARITY_COUNTS 全同族）·文件零字节 |
| migrate:prove | EXIT=0 | 0161 入链 fresh+幂等 skip+零数据丢失 |
| neg:interview | EXIT=0（102） | 97 原值零翻 + 5 新增 |
| interview:prove | EXIT=0 | 绿（写卡链/评估链） |
| growth:prove | EXIT=0 | 绿 |
| docs:check | 红=预存 | PTP_FILE_LIMIT:4402（G1 登记 cap 2048 vs 4327；4327→4402 增量属 G1 后已落主线 docs，非本刀；托管根不含 receipts/，本刀计入增量=+1（0161）·基 4401→4402 实测·cap 未动·零语义恶化） |

## 六、停止条件三查（REQUEST §7）

- **(a) 消费面隐含依赖超披露面**：未触发。`growth-generation.ts:44`/`worker main.ts:172-189` 零字节零 diff；翻转全清单=D3 表两断言+1 字面量（读面直接断言，非隐含依赖）；honesty :101-104 junior/mid 面实测零翻。pre-exec 审计另核：privacy-erasure-http（GET 走删除后 fenced 面 guard 先 404）/uc-033（跨权 404）/uc-004（无行 404 面）/validate/unstube/scor-00-http-db（无 GET persisted assessment 行）均不触新闸。
- **(b) GET 失配合法中间态无语义可裁**：未触发。persisted 行 + 资格空 = fence/supersede/撤权结果（ADR :39 明示吸收方向），非合法中间态；fail-closed 409 语义有既定先例可对齐（各自 POST 面）。
- **(c) 0161 编号冲突/0160 双号再漂**：未触发。0161 空闲实测；0160 双号维持 h3 登记史实零触。

## 七、范围外核查（§2 逐条）

S2 写路径/公式/状态机（`SCORE_CARD_STATUSES` 十态、transitions、`write_final/record/supersede/adjudicate`、prompt policy）零字节（`git diff --stat` 空亲证）· scor-parity+0158 零字节零翻 · 0160 两文件零触 · SSE 合同/isTerminal:265/web scoring-honesty:36-56/report 页相位零触 · applications.service/recruiter surface 零触 · migrate.ts 排序机制零触 · SSOT 零触 · controller :211/:242 路由零触。

## 八、Non-claims（§6 如实）

- 读面收窄 ≠ B 端校准推进（CalibrationRelease+人工复核门原文零松动，`b_review_eligible` 进入条件不变）。
- GET 重闸 ≠ C 端页面相位切换（项1 完整 C 端可见性切换仍留 ADR `:85` 未闭合账）。
- 两可收项落卷 ≠ ADR-0020 四项全闭合（项1/项4 显式排除留账·ADR 状态段 append 如实）。
- 收窄 ≠ 历史 `b_review_eligible` 卡数据处置决议（存量卡处置归校准期/另刀·本刀只定义读面不可见）。
- est live=0 ≠ 零成本主张外延。

## 九、Pins（§5 十一值照抄零翻转）

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE /privacy/interview-data/:id=503 · g7SuiteGreen=false · actualSpendCny=null · r1Closed=false

## 十、下一步

post-prove 双审（awaiting_post_prove_dual）→ meetwise 授权 nail。implementer 不自批 · alone ≠ dual · ⛔push · ⛔动主线 · STOP。
