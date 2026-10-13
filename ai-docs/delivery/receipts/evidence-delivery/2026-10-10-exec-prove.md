# EVIDENCE-DELIVERY EXEC 收据 — 逐题评分证据四断口接线（S1+S2+S4·A1 主刀）· A1+A2+C1 接线债审计

- 席位：EVIDENCE-DELIVERY EXEC（`eviddel-exec`）· 2026-10-10
- 工作树：`meetwise-eviddel`（仓根同级 worktree·branch `line/evidence-delivery`·base `5e1e7fde` → **rebase feat/mysql-schema-skeleton tip `df12a054` 干净通过**（2 commits docs-only 重放：`f037a1a4`+rev2→`a6403205`）·`pnpm install --frozen-lockfile` EXIT=0）
- 唯一蓝本：`ai-docs/delivery/harness/evidence-delivery-REQUEST.md` rev2（`draft_rev2:pre_exec_dual_PASS`·双席 BOTH PASS·EXEC 授权在卷）
- 范围=§3 C1-C13 逐条·**S3 缓行零触**（learning/career/`:77` 框架句零字节）·**零迁移**·**零 live 外呼**（est live=0·actualSpendCny=null·0 Key 值接触·.env* ABSENT）·**组件测试 Ban 遵守**（零新建 React harness·逐题点评投影=纯函数 `apps/web/lib/report/turn-annotations.ts`·prove 面只测纯函数+静态源断言）
- 交付后状态：REQUEST 状态行 append-only → `executed:awaiting_post_prove_dual`（post-prove dual 未做·alone≠dual·Ban self-approve）

---

## 1. 逐条改动落位表（file:line=落地后行号·全程亲读）

| # | 切片 | 文件:行 | 落位 |
|---|---|---|---|
| C1 | S1 | `packages/ai-graphs/src/adaptive-interview/state.ts:31-38` | Turn 增 `evidence?: string[]`（模型判据 criterion 列表·注明「模型判据非用户原文·quote 逐字引文永不入 checkpoint/transcript」沿 :16-20 投影纪律句式） |
| C2 | S1 | `packages/ai-graphs/src/adaptive-interview/nodes/evaluate-answer.ts:161-181` | answered 分支 transcript 条目增 `evidence` 直投影（:179-180 注释）；clarify（:103-133）/unresolved（:134-155）沿现状不写（键缺省） |
| C3 | S1 | `apps/worker/src/adaptive-lifecycle.ts:301` | transcript 本地结构类型增 `evidence?: string[]` |
| C4 | S1 | `apps/worker/src/adaptive-lifecycle.ts:330-334`（generationFailed 臂） | answer_evaluated payload 增 `evidence: last.evidence`（缺省=undefined 不进 JSONB·注释在卷） |
| C5 | S1 | `apps/worker/src/adaptive-lifecycle.ts:367-371`（主路径） | 同 C4 |
| C6 | S1 | `apps/web/lib/stream/business-events.ts:33-45` | answer_evaluated data 增 `evidence: z.array(z.string()).max(6).optional()`+**P4 注释「沿 EvalSchema max(6)（apps/worker/src/interview-service.ts:40 权威源·不引入跨包共享常量·写读双端同刀）」**；optional=历史事件 catch-up 重放兼容 |
| C7 | S2 | `apps/api/src/modules/interview/interview-report.ts:87-94` | transcriptView 投影增 `evidence`（`Array.isArray(p.evidence) ? p.evidence.filter(typeof string).slice(0,6) : []`·历史缺键=空数组）+**P4 注释「沿 EvalSchema max(6)（…:40 权威源·不引入跨包共享常量）」** |
| C8 | S2 | `apps/web/lib/report/turn-annotations.ts`（**新建·P3 形态钉死**）+`apps/web/app/report/[id]/page.tsx:18,242-279` | 投影纯函数 `projectTurnAnnotations(turns)`（沿 `lib/interview/turn-submission.ts` 纯函数先例）导出 TranscriptTurn/TurnAnnotation·**note 空⇒undefined·score null⇒undefined**；page.tsx AssessmentSection **薄消费**（Promise.all 双取 assessment+transcript·`GET /interview/:id/transcript` web 首次接线）·AbilityBar 维度条沿 assessment 面不动（维度总览≠逐题点评语义分离）·AnnotationCard `note?…:null` 天然隐藏=**P2 回退隐藏零新造文案** |
| C9 | S2 | `packages/domain/src/assessment.ts:5-9,55-62` | Dimension.evidence **可选化**+deriveAssessment **停写两固定串**（字段退役路线·tsc 门收束）；:30/:35 question.slice(0,40) 回退零触；**SCORE-WRITER D5 冻结面（scoring-aggregation.ts deriveScoreCardAssessmentLegacy·:205 evidence 文案 legacy parity 三钉(ii)）零触**——见漂移表 D9 |
| C10 | S2 | `apps/web/app/report/[id]/page.tsx` | d.evidence/d.dimension 冒充消费随 C8 退役（web-logic.proof 源断言钉死零回归）；assessment_report 旧行残键零迁移零回填 |
| C11 | S4 | `apps/worker/src/interview-service.ts:295-306,317` | **evaluateAnswer 删除**（生产零调用·#159 同形）+段头注释留档（EVIDENCE-DELIVERY S4·生产路径=adaptive assess→invokeEvaluationOnce）+**键字符集约束注释归档指向存续面**（`/^[A-Za-z0-9][A-Za-z0-9._:-]{0,255}$/`·存续强制面=invoke registry fail-closed·invokeEvaluationOnce baseIdempotencyKey 同受辖）；**isStoredEvidence 保留**——见漂移表 D11（「删后孤死」前提失效） |
| C12 | S4 | `apps/worker/test/scoring-report-integrity.proof.ts:14,46-67,69-77,132-136`+`apps/worker/test/context-stress.proof.ts:21,156-165` | 两文件改直吃导出面 `invokeEvaluationOnce`·断言语义逐条对位零弱化：**P1 回和兑现**——首次成功断言原始 schema 值（dispositions 带 quote·无 quoteSha256/start）+**span+hash 记录形断言落缓存命中重放调用**（replayRecord.start===0·end>0·quoteSha256.length===64·quote===undefined）；`:56-58`→现 :68-70 DB trace 断言原值不动（trace 不存 quote 原文·只存 span+hash·两答案两幂等实体）；quote 拒绝重放断言升级为**落库机器码精确形状**（failed+`business_validation_failed`·0088 稳定 ASCII 纪律·严格强于旧 unscored-any）；供应商不可用→failed 带可审计原因 |
| C13 | prove | `ai-docs/delivery/receipts/evidence-delivery/`（本目录·10 个 prove 日志原样在卷） | EXIT 原值/attempts 全账/est live=0 见 §3；manifest 本档 §3+§4 即账（无独立 run-manifest.json——沿 SCORE-WRITER S2 先例以 EXEC 收据 md+日志为账） |

**P4 兑现**：C6/C7 各一行注释「沿 EvalSchema max(6)（apps/worker/src/interview-service.ts:40 权威源）」——不引入跨包共享常量·三处（:40/:C6/:C7）未来单独漂移=后续刀面不预支。

**§4 prove 面**：S1 出②=interview.proof 新增 `②+` 节（payload->evidence jsonb 逐元素相等+`?'quote'` false+既有 9 键零删改·57 PASS 全绿）；S1 出①=web-logic.proof EVIDENCE-DELIVERY 节三断言（带 evidence 帧保真/历史形状帧仍解析/max(6) fail-closed）；S2 出③=api validate EVDEL fixture 三断言（turns[].evidence 在场/历史形状=[]/响应面零 quote·evidenceRecords 键）；S2 出④=web-logic.proof 投影纯函数断言（P2 四串零出现+空 evidence⇒note 不渲染+无卡无数值+源级退役断言）。

---

## 2. 锚点漂移表（base `5e1e7fde` → rebase 后 tip `df12a054`·全锚 rg 重定位亲读）

主线在 base 后落了 **#52 v6 评分重构 + EXTREV-1 SCORE-WRITER S1/S2 + SCOR-02/03 + RESUME-GROUNDING + 0142 route fail-closed** 等刀，REQUEST（写于 5e1e7fde）锚点漂移如下（**全部语义重定位成功·零 STOP**）：

| REQUEST 锚（@base） | 实位（@df12a054 落地后） | 漂移内容与处置 |
|---|---|---|
| interview-service.ts :19-23 ScoreEvidenceSchema {criterion,quote} | :20-24 | **v6**：`{criterionId,disposition,quote}`·C12 断言按 v6 形状对位（P1 原文「{criterion,quote} 形」对应今 {criterionId,disposition,quote}） |
| :34-46 EvalSchema `evidence min(1).max(6)`（:36 权威源） | :37-56（**max(6) @:40**） | 字段更名 `dispositions`·P4 注释权威源锚定 :40 |
| :64-73 validateEvaluationEvidence（:67 quote 逐字） | :88-102（:96） | +criterion 量表白名单门（v6）·语义不变 |
| :79-83 span+hash 替换 | toEvidenceRecord :109-112 | 同形 |
| :85-87 isStoredEvidence / 唯一消费面 :284 | :114-116 / **消费面 :312 `evaluateOutcomeFromValue`** | **D11（关键漂移）**：v6 抽出 `evaluateOutcomeFromValue`（:309-320·「evaluateAnswer / 自适应 assess 共用单源」）——isStoredEvidence 唯一消费面从 evaluateAnswer:284 **漂移至 evaluateOutcomeFromValue:312**，而后者是**自适应 assess 活面**（adaptive-interview-service.ts:420 消费·at-least-once 重放缓存命中即记录形入参）。**「删后孤死」前提失效→保留不删**（删=砍活面缓存重放形闸·toEvidenceRecord 对无 quote 入参 indexOf(undefined)=-1 即腐）。REQUEST C11 文字（:85-87/:284）按 base 原文冻结不改·本漂移如实记档 |
| :133-150 invokeEvaluationOnce | :164-182 | 同形（+criteria 参数） |
| :270-287 evaluateAnswer | :322-332（删除前） | v6 下已是薄包装·按处方删除+归档注释 |
| :263-268 键字符集约束注释 | :295-301（删除前） | 归档注记指向存续面（C11 兑现） |
| adaptive-interview-service.ts :251-258/:268-270 | :392-436（assess@:392·invoke@:404·evaluateOutcomeFromValue@:420） | v6 重构·零触 |
| evaluate-answer.ts answered transcript :153-171（clarify :102-128/unresolved :131-151/:153-154 ingestAssessment） | :161-181（:103-133/:134-155/:157） | Turn 已带 `dispositions`（SCORE-WRITER S2）·C2 只增 evidence |
| state.ts Turn :12-32（:16-21 纪律） | :13-45（:16-20·dispositions :31-37） | 同上·C1 只增 evidence |
| domain/adaptive-interview.ts evidence slice(-6) :195-208 | :195-212（:209） | 零触 |
| adaptive-lifecycle.ts :252-254/:276-279/:310-313 | :298-302/:330-334/:367-371 | transcript 类型已带 dispositions·C3-C5 只增 evidence |
| sse-pump.ts :64/:73 | :64/:73 | 未漂·零触（payload 直通语义未改·sse-push-notify+last-event-id 双证 EXIT=0） |
| business-events.ts answer_evaluated :33-42 | :33-45 | C6 落位后行 |
| interview-report.ts transcriptView :58-92（:64-79 SQL/:81-82 ScoreCard/:86-89 投影） | :59-95（:63-80/:82-83/:87-94） | SCOR-02 已切（score=ScoreCard deterministic_total·无卡 null）·C7 只增 evidence |
| interview.controller.ts :195-197 GET :id/transcript | :197-199 | 未漂·web 首次接线（C8） |
| report/[id]/page.tsx :243-253/:249/:250/:234-241/:73/:77 | :259-279 落位前 :262-270/:265/:266/:250-257/:79/:83 | 未漂（页面 v5 形制保留）·C8/C10 落位 |
| assessment.ts 两固定串 :49-54（实锚 :53）·slice(0,40) :42/:47 | :58（ retired）·:30/:35 | C9 落位；**D9**：第二处同文案写手=`scoring-aggregation.ts:205`（deriveScoreCardAssessmentLegacy·**SCORE-WRITER rev2 D5 三钉(ii) 形状冻结+legacy parity**）→归 SCORE-WRITER 域零触（§2.1 Ban）·四串零出现断言限两退役源文件（assessment.ts+page.tsx）+投影渲染路径·D5 冻结面不在断言范围（ prescription C9 锚=assessment.ts 面） |
| AnnotationCard note?…:null（:33） | note 块 :37-41 | 语义同·天然隐藏兑现 P2 |
| scoring-report-integrity 消费 :14/:47/:48/:52/:69/:71/:126/:128（:56-58 DB trace） | 同位（C12 改后行号见 §1） | 未漂 |
| context-stress 消费 :21/:154 | :21/:156/:161 | +2 漂 |
| SCOR-02 :305-309（web-logic.proof.ts） | **web-logic.proof.ts 无 SCOR-02 字样**（:300-315 为 SSE 重连节） | **O-b 型**：锚位无对应内容·纪律实体在 interview-report.ts:81-83 注释+score null 投影+transcriptView fail-closed（本收据 §1 C8 以「score null⇒undefined·无卡无数值」断言兑现其语义） |
| turn-submission.ts 纯函数先例 | apps/web/lib/interview/turn-submission.ts | 在·C8 沿用 |
| 0126 围栏 apps/api/.../interview-event.ts:20-24 | packages/db/src/interview/interview-event.ts:18-21 | 整文件迁 db 包·evidence 数组非 answer 键不触 |
| recruiter.ts :291-293 `?& ARRAY` | packages/db/src/recruiting/recruiter.ts:292 | 未漂语义·加键零破坏（?& 只查列键在场）亲证 |
| dashboard :32 承诺 | :32 | 未漂·零触（S2 后承诺为真） |
| interview.proof.ts :43 scriptedModelClient 形制 | :45 | 同形·§4.1 沿用 |
| prompts.ts :85-101 evaluate v5 | :111 `mock-interview.evaluate v6` | v6 契约（criterionId+disposition+quote）·evidence 带出语义不变（criterion 判据=今 criterionId 列表） |
| evaluateOutcomeFromValue（REQUEST 未载·主线新面） | interview-service.ts:309-320 | C12 回和断言与其交互见 §1 C12/D11 |

## 3. prove EXIT 原值表（全部 scripted/fake seam·est live=0·actualSpendCny=null·0 Key 值接触·Ban retry-to-green）

| 键 | 结果（终版亲跑·日志在卷） | 判读 |
|---|---|---|
| `apps/web` typecheck | **EXIT=0** | 零新增红 |
| `apps/web` prove（web-logic.proof.ts） | **EXIT=0·269 PASS**（含 EVIDENCE-DELIVERY 新节 13 断言全 PASS） | S1 出①+S2 出④全绿；两处首跑 FAIL 为**本席断言自身笔误**（lineOf 缺席返回 -1 被 `!` 取反成 false+assessment.ts 注释误引退役串字面）——修正断言实现非弱化语义·修后全绿（attempts 全账） |
| `packages/domain` prove:scoring-honesty | **EXIT=0**（21 scenarios·deriveAssessment overall 面行使） | C9 可选化零回归 |
| `pnpm interview:prove`（§4.1 主证·新 `②+` 节） | **EXIT=0·57 PASS** | evidence jsonb 逐元素相等+quote 不出闸+9 键零删改全 PASS |
| `pnpm api:validate`（§4.3 出③·EVDEL fixture） | **EXIT=0·204 PASS**（含新 3 断言） | attempts 全账：①首跑 fence 红（EVDEL 用 created 态 interview·fence 拒）→改 completed fixture；②个人总览 `answered===3` 被 userA 名下新 answered 行打红（我的 fixture 干扰既有断言）→EVDEL 改专有 owner `eviddelUser`；③seed 池化连接残留跨用户 principal→专用 client 重绑；④seed principal 与 owner 笔误→修正。四次均为**代码修正后重跑**（非盲目 retry-to-green）·逐次差异如上 |
| `pnpm neg:interview` | **EXIT=0·97 条全绿** | 零回归 |
| `pnpm last-event-id:unit:prove` | **EXIT=0** | 零回归（§4.2 证人） |
| `pnpm sse-push:notify:prove` | **EXIT=0·35 PASS** | payload 直通语义未改零回归（§4.2 证人） |
| `pnpm scoring-integrity:prove`（C12 主证） | **EXIT=1·10 PASS+1 FAIL**（①c graph 段） | **FAIL=既有 base 红·非本刀新增**：pristine df12a054 对照亲跑（stash 全量暂存后重跑·日志 `2026-10-10-scoring-integrity-pristine-base.log` 在卷）同段同位同形红（debug 亲证 degraded=`generation_generation_unavailable`·generation 域非本刀面）。**主线在先登记佐证**：SCORE-WRITER S2 EXEC（commit `50cb3238`）已原样登记「scoring-integrity:prove EXIT=1 既有 base 红逐字节同形（①c）」。C12 全部可执行断言（①/①b 10 项·含 P1 双形断言+落库机器码重放形状）全 PASS；①c 后段（②③）因既有红阻断不可达——其断言语义已由可执行面覆盖（quote_repair_exhausted 首呼=①b PASS·failed 落库码=①b 重放 PASS）。**Ban 扩权遵守**：generation 域红不修（非本刀面） |
| `pnpm stress:prove`（C12 辅证） | **EXIT=1·14 PASS+7 FAIL** | **7 FAIL=既有 base 红·非本刀新增**：主线在先登记佐证同上（SCORE-WRITER S2「context-stress 与 pristine 恰同 7 FAIL 同形（既有环境红如实）」·本席 7 FAIL 集合与其登记逐条同形）；pristine 对照 attempt 亦在卷（`2026-10-10-stress-pristine-attempt2-timeout.log`·base 连完整性都不达——`bounded_command_timeout`）。根因归类：D/E 段=consumer/graph 链既有 fixture 滞后（0142 route supply 类·interview.proof.ts:83-89 在先登记同根因）；`真实截断→below` 段=**既有 proof fixture 缺陷**（echo 正则 `/内容过长已截断-\[a-z0-9\]+\]$/` 只认小写·而主线 nonce=randomBytes(8).base64url 含大写/`_`/`-`·:610 亲读——非本刀断言语义·本刀该断言与 base 逐字同形）。C12 重写面可执行断言中 `用户伪造…档位 meets` **PASS**（invokeEvaluationOnce 直吃行使成功） |

**markers=0**（git diff 全文件冲突标记 rg 零命中）·**est live=0**·**零迁移**·**零 secrets**（secrets:check 未触发·无 .env 变更）·**pins 十一值零翻转**（haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null）。

## 4. §8 观察项勘误节（rev2 预登记逐条誊入）

- **O-a 键数勘误**：answer_evaluated payload 既有键集=**9 键含 question**（questionId/stateVersion/answerId/answerHash/turn/score/outcome/competency/question·本收据 §1 C4/C5 落位行亲录+interview.proof `②+` 节 9 键在场断言行使）。Ban7「8 键」/C4「7+1」为 base 原文冻结不改·勘误在此。
- **O-b #159 锚仓外**：`issues-master.md:309` 在仓外（本仓无 issues-master.md·rg 亲证零命中）——经 SOP 佐证面（extreview-fix-campaign-SOP.md 逐字誊录）承接·行号未亲证·如实记。
- **O-c SCORE-WRITER 对称引用条款**：彼刀后续落地时对称引本刀 commit·行号漂 ± 亲读复核。本刀对彼域（scoring-aggregation.ts:205 D5 冻结面·score-writer.ts·loadSummary）零字节零触（git diff 亲证）。
- **O-d 两审计锚勘误复核属实**：evaluate-answer 审计锚 :131→实位 :154（@base 亲验）·rebase 后 ingestAssessment 调用=:157（v6 重构再漂·如实记）；assessment.ts 审计锚 :57-58→实位 :53（@base）→rebase 后 :58（C9 退役前）——两勘误属实维持。

## 5. 新增漂移登记（rebase 期发现·rev2 未预载）

- **D9（C9 第二写手）**：两固定串在主线存在第二处写手 `scoring-aggregation.ts:205`（deriveScoreCardAssessmentLegacy·SCORE-WRITER D5 三钉(ii) 形状冻结+legacy parity 钉死）→**保留零触**（§2.1 Ban SCORE-WRITER 面）。C9 处置收束为：deriveAssessment（REQUEST 锚面）停写+字段可选化；四串零出现断言范围=两退役源文件+投影渲染路径（D5 冻结面文件不在退役断言集·其 parity 文案属彼刀钉·如实声明）。
- **D11（C11 isStoredEvidence 非孤死）**：消费面 :284→:312（evaluateOutcomeFromValue·adaptive assess 活面缓存命中形闸）→**保留**。「同 commit 删孤死 isStoredEvidence」的前提（删后孤死）在 df12a054 失效·按处方自身逻辑（删因孤死）不删；删 evaluateAnswer 照旧。零行为影响面：toEvidenceRecord/persistedEvaluation/ScoreEvidenceRecord 全保留原状。
- **D-evid（C12 重放形状事实升级）**：v6 下失败重放经 durable claim 返回**落库机器码** `business_validation_failed`（db model-invocation.ts:104 亲读·0088 稳定 ASCII），非首呼的可读 `business:evidence_quote_not_in_answer`——C12 重放断言按机器码精确形状落位（严格强于旧 unscored-any·零弱化）。

## 6. Non-claims 重申

本刀≠评分体系完成（ScoreCard writer 彼刀）；≠A2 真实化（GROWTH-REAL 后继刀·本刀零触）；evidence=criterion 判据≠quote 引文（quote 以 span+hash 留 trace·永不出 invoke 边界——P1 重放断言即此边界行使）；报告页改吃 transcript≠报告叙述升级；SSE 带 evidence≠实时页点评 UI（interview-state 归约零改）；删 evaluateAnswer≠评分路径变更。**完工≠收口**：post-prove dual 未做（alone≠dual·Ban self-approve）。
