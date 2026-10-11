# E2E-SCENE-BATCH2 — 隐私升 LIVE + 同意撤回 E2E 场景（处方 7-④/⑤ · full.e2e 第 10 段 · 件1 report_ready 被闸登记 · EXEC REQUEST）

**Status**: **`draft:awaiting_pre_exec_dual`**（起草席落卷即停·恰 1 .md 零码动。EXEC/任何实施须预执行双审两外席 PASS + meetwise 明示授权 · **Ban self-approve** · **alone≠dual** · Dual PASS ≠ 开工 · ⛔push）

**席位**：E2E 场景第二批起草席（北星 loop · E2E 覆盖缺口盘点处方 7 中期补场景三件·前置闸逐一实测后收编判定=**部分被闸**：件2+件3 可收一张卷·件1 结构性被闸登记移交）。
**基线**：`feat/mysql-schema-skeleton` @ `388e5f7b`（主线 tip·`git log -1` 实测=merge(i5-caliber) 口径诚实化九件 nail·post-prove 双席 BOTH PASS）。分支 `line/e2e-scene-batch2` · 工作树 `meetwise-e2s2`（`git worktree add /Users/miaole/Desktop/golucky/meetwise-e2s2 -b line/e2e-scene-batch2` 本起草席已立·建前实查均不存在：`git worktree list` 九树无 e2s2·目录 `ls` NOT_EXISTS）。
**防重双对表（亲证）**：`rg -l "e2e-scene|scene-batch2" ai-docs/delivery/harness/ ai-docs/delivery/execution-master-checklist.md` → **EXIT=1 零命中**（harness 目录与 checklist 双零·本树 base 实测）。**第一批卷界线划清**：`e2e-scene-409-REQUEST.md`（选岗/身份 409/误判三场）在 `meetwise-e2sc` 工作树分支 `line/e2e-scene-409` @`b1bc72cc`·**未并主线**（`git log --all --grep` 亲证）——判定**非竞品**：议题面（路由分类器/begin 409）与本卷（隐私擦除/同意撤回）零重叠；插入锚不交叠（409 卷插 `:388` 后·本卷第 10 段落卷尾 `:488` 后）；用户 tag 不撞（409 卷 e2e4_/e2e5_/e2e6_·本卷 R5 用 e2e7_+主用户复用）。若 409 卷先并·卷尾行号随演重 pin（§8 重 pin 条款）。
**蓝本**：①处方 7 中期三件候选（①report_ready 主通路/④隐私升 LIVE/⑤同意撤回·前置闸现状逐一实测=本卷 §0）②形制沿 `ai-docs/delivery/harness/e2e-scene-409-REQUEST.md`（同席同形·Ban/pins 同源誊录见 §5）③场景先例=`apps/api/test/privacy-erasure-http.proof.ts`（UNSTUB-ERASE rev2 全形·preview 202 形/escape 前后读零形/410 扫形）+ g7fix1 DB 直连 SELECT-only 形（`e2e/full.e2e.ts:408-419` 区）。

## §0 现状锚（起草席亲读·base `388e5f7b`·file:line 逐条 sed/rg/实跑复核·**EXEC 立项照本节重 pin**——基线漂移如实改锚·结论不变则只更行号）

### 0.1 三件候选现状总表（逐件实测·2026-10-11）

| 件 | 处方前提 | 实测定谳 | 判定 |
|---|---|---|---|
| ① report_ready 主通路 LIVE 场景 | 「#40 40c 已收口（批1 SCORE S3）→闸解除·E2E_REPORT_FAIL_ALL=1 注入使报告成功只能走 7a 兜底臂（run-e2e.mjs:129 结构性）」 | 注入真实存在（`scripts/run-e2e.mjs:129` 无条件 `E2E_REPORT_FAIL_ALL:'1'`·worker 侧 `apps/worker/src/main.ts:147-152` isolated-only fail-closed）**但与可达性正交**——真闸=0126 双写围栏下明文 /turn 家族结构性零 ScoreCard（§0.2 六步闸链）·撤注入亦不可达；#40 40c 收口真实（`interview.service.ts:484` score_request 与 0092 账本同事务原子已落）但只在 **preview submit 路径**（`interview.controller.ts:43-56` PublicPreviewControlledWriteGuard·「不入队 plaintext /turn job」原文）·生产写路由换轨未落 | **被闸出·登记移交**（§0.2） |
| ④ 隐私升 LIVE 场景（full.e2e 第 10 段） | 「privacy-erasure:http:prove（DELETE=503 pin 时代）→擦除前后读零并成 full.e2e 段」 | **两分定谳**：interview-data 公开 DELETE **仍 503**（`privacy.service.ts:66-75` eraseInterviewData 恒 throw SERVICE_UNAVAILABLE·seat-1 裁定·proof :94-100/:119-120/:219-220 三拍）——**pin 仍准**；resume-data DELETE **已升 LIVE 202 软删**（`privacy.service.ts:89-111` deleteResumeData·mode=logical+purgePending:true·UNSTUB-ERASE rev2 同刀落·proof :76-83 行使）——不在 503 pin 立法域（随演登记·§5 pins 不翻）；preview 围栏面套件内可达（`public-preview.ts:50-53` assertPublicPreviewWritesClosed 在 MEETWISE_PUBLIC_PREVIEW 未设时**通过**·runner 零 env 需求·HMAC 键回落 AUTH_SECRET `:130-136`） | **可收编**（§1 R4） |
| ⑤ 同意撤回场景 | 「#81 已闭（I2 落面·consent 域）→闸解除·撤回零场景」 | 闸解除亲证：撤回端点在握（`privacy.controller.ts:30-33` DELETE /privacy/consent→`privacy.service.ts:41-47` withdrawConsent·G4「撤回=停止后续使用·已落 checkpoint/事件不回溯清除」）·状态读在握（`:21-26` GET consent）·撤回后门在握（`resume.service.ts:95-96/:202-203` 两处 403 consent_required 硬门）·#81/D6-D7 已闭随 I2（i4 卷 :25/:90 亲证）。授予面 e2e 已有两处（`full.e2e.ts:37-40` 主用户·`:360-361` trial 用户·仅 POST 断言）·**撤回/状态读/撤回后门全卷零场景**=缺口坐实 | **可收编**（§1 R5） |

### 0.2 件1 被闸定谳（六步闸链·全 file:line 亲读·**处方背景漂移如实登记**）

1. **公开生产作答=明文 /turn**：`interview.controller.ts:36-40` POST /turn 是唯一生产答题路由；canonical /answers 路由（`:43-56`）= preview 门控（MEETWISE_PUBLIC_PREVIEW=1 才开·写 0092 rehearsal 账本·**原文「不是 INT-TRANSCRIPT-01 生产 cutover，也不入队 plaintext /turn job」**）。
2. **0126 互斥**：`packages/db/migrations/0126_interview_answer_dual_write_fence.sql` 铁律——账本 artifact 占位身份禁止明文 /turn job 带 answer·两族机械互斥。
3. **明文族无 score_request**：`apps/worker/src/score-writer.ts:65-67`「0126 双写围栏：明文 /turn 家族结构性无 score_request → 静默跳过（no_request）」；score_request 唯一生产创建点=`interview.service.ts:484`（preview submit 同事务）。
4. **零卡**：无 score_request → `writeScoreCardAfterProjection` skip → 全程零 scorable ScoreCard。
5. **报告恒 unavailable**：报告图序 generate 在前 validate 在后（`packages/ai-graphs/src/report.ts:69-76`）——FAIL_ALL 注入在 generate 抛（post-provider·`main.ts:200-207`）·空卡在 validate 抛 `score_aggregate_empty`（`packages/domain/src/assessment.ts:28` `if (scores.length === 0) fail('score_aggregate_empty')`）——**两臂殊途同归 markReportFailed→quarantined→report_unavailable**。撤掉 run-e2e.mjs:129 注入·report_ready 依旧结构性不可达。
6. **0082 hold 正交**：`packages/db/migrations/0082_b_side_score_calibration_hold.sql:9-28` 只钉 B 端 job_application（score=NULL+assessment_unavailable）·`applications.service.ts:107/:118` finalize 常量臂 `outcome:'assessment_unavailable' as const`——**C 端 unbound 面试的 report_ready 与 0082 无关·0082 非闸体**（处方「0082 score hold 语义下 report_ready 可达形态」实测定谳=hold 不构闸·闸在 §0.2-1..5）。

**播种逃逸路径双否**：(a) DB 播卡需 0092 五环链——`score_card` 五重 NOT NULL FK（interview_answer_artifact/interview_answer_submission/score_request/issued_question_contract/question_rubric·`0100_scoring_fact_root.sql:157-176`）+ epoch/契约绑定·重实现账本族不成比例·Ban；(b) MEETWISE_PUBLIC_PREVIEW=1 开 /answers 真卡路径——preview 不入队 /turn job（lifecycle 不前进→无终态→报告不入队）+ 0126 禁同身份混写·结构性不可行。
**移交条款**：report_ready 主通路 E2E 场景**随 INT-TRANSCRIPT-01 cutover 刀开卷**（届时生产作答走 0092 账本族·score_request 随提交同事务原子创建·卡落→报告 validate 过→report_ready 全链真跑·「报告自洽断言沿既有 7 段形」两臂 `full.e2e.ts:220` 现成）。本卷 Ban 偷开（§5）。

### 0.3 件2 DELETE 语义随演定谳（pins 读法登记）

- interview-data 公开 DELETE：`privacy.service.ts:66-75` 恒 503 `interview_erasure_authorization_not_available`（0125 只闭 memory_vector_chunk·inventory §4.2 user_memory/ai_invocation_trace/外部 sink 未齐·issuer 组合根缺位）——**「公开 DELETE=503」pin 值不翻·语义域=interview-data 面·本卷 R4-B 正面行使**。
- resume-data DELETE：`privacy.service.ts:89-111` 遍历 owner 全部 active 态简历逐份走 0152 受审墓碑函数（同事务·任一失败整体回滚）→202 mode=logical+purgePending:true+resumesFenced；空集→202 resumesFenced:0 同形幂等。**不撒谎边界**：本地围栏≠物理清除（purgePending 恒真直至 S2 简历轨闭合·响应永不携带完成态字段）。
- 围栏读门全链：list 过滤（`resume.service.ts:217-226` erasure_fenced/erased 排除）→ 0063 active-read RLS 覆盖 resume_blob+resume_profile（`0063_resume_active_content_read_gate.sql:52+`·父行须 status='ingested'）→ profile 0 行→404（`resume.service.ts:308-316`）→ export 过滤（`privacy.service.ts:52` NOT IN erasure_fenced,erased「数据可携不含已删数据」）→ 物理行仍在（0153 墓碑 status='erasure_fenced'·SELECT 可证）。
- API 级先例全形：`apps/api/test/privacy-erasure-http.proof.ts`（preview 202 形 :151-165·跨 owner 404 :204-214·escape 前后读零+410 扫 :373-435·原始幂等键只落 64-hex HMAC :222-232）。**本卷缺口价值**：proof 是裸 app fixture（直插 interview·无真旅程）——full.e2e 第 10 段把该面升到真栈（真 worker 在跑·真同意史·真简历旅程后）·覆盖矩阵 SSOT 旅程卷零隐私擦除行。

### 0.4 件3 撤回面现状

- 三端点：POST consent（`:19-28` 幂等·已同意不重插行·回 policyVersion）·GET consentStatus（`:30-33`）·DELETE withdrawConsent（`:41-47` 行删除·`{withdrawn:true,purpose,policyVersion}`）。
- 撤回后行为面：文本上传门（`resume.service.ts:202-203`）/OCR 门（`:95-96`）→ 403 `{error:'consent_required',purpose:'resume_processing'}`；**既有数据不回溯**（profile 读不查 consent·撤回≠擦除=Non-claims 定谳面·本卷 R5 显式断言）。
- worker 侧 personalization 门（`apps/worker/src/adaptive-lifecycle.ts:192` purpose='interview_personalization' facts 池）=独立 purpose·**本卷零触**（DB 读面归 resume-grounding.proof·行使需真旅程成本不成立）。
- 缺口：`rg -n "withdraw|DELETE /privacy/consent|consentStatus" e2e/` 零命中·`e2e/helpers/resume.ts:12-19` 仅 POST 授予形。
- 界线：#81 剩余面（policy_version 升版通用化/四 purpose 白名单/语音同意/导出补全·TASK-SOP-v2.md:79 批4）**不在本卷**——本卷只收撤回行为 E2E 面。

### 0.5 缺口证实（full.e2e.ts 全卷亲读）

全卷 496 行：`rg -n "privacy/|withdraw|erasure|consent" e2e/full.e2e.ts` 仅命中授予面两处（:37/:360）与 consent-capture 诊断账（:35-39 等）——隐私擦除/撤回/状态读/围栏读门全卷零断言。`ai-docs/delivery/e2e-requirement-coverage-matrix.md` 无对应行（登记建议见 §2-6）。

## §1 场景设计（两场·全落 `e2e/full.e2e.ts` 卷尾第 10 段追加·产品码+scripts 零字节·file:line 实锚·EXEC 立项重 pin）

**插入锚**：`e2e/full.e2e.ts:488`（scorelessBound if/else 臂收口）之后、`:490`（`reviews.emitSummary()`）之前——全卷所有简历/面试依赖断言已完成·擦除面后置零扰动。
**公共形**：主用户复用（H）+R5 独立新注册用户（`e2e7_${tag}`·零 begin 零额度依赖）。DB 断言沿 g7fix1 先例 pg Client 直连（PG* env contract 同形·**SELECT-only**·连接 finally 释放·缺 env 即 throw）。

### R4 隐私升 LIVE 面（主用户·A/B 两臂·零额外 live）

**R4-A resume-data 全量软删面**：
1. 前置读 `GET /resume`（`resume.controller.ts:30` list）→ resumes 含 resumeId（主旅程既有产物·软删前在册证据）；
2. `DELETE /privacy/resume-data` → **202** ∧ `mode==='logical'` ∧ `purgePending===true` ∧ `resumesFenced>=1` ∧ requestId 字段在场（§0.3 不撒谎边界如实断言·**Ban 断言「已擦除/完成态」**）；
3. 同键重放 DELETE → 202 ∧ `resumesFenced===0`（空集同形幂等·不建第二份账）；
4. list 重读 → resumes **零含** resumeId（S1 即时可见面）；
5. `GET /resume/:resumeId/profile`（既有 helper getResumeProfile）→ **404**（0063 active-read RLS 0 行→404·`resume.service.ts:315`）；
6. `GET /privacy/export` → export.resumes 零含 resumeId（数据可携不含已删）；
7. DB 直连：`resume WHERE id=resumeId` 恰 1 行 ∧ `status='erasure_fenced'` ∧ `erasure_requested_at IS NOT NULL`——**「列表过滤 ≠ 物理删除」诚实记账**（行仍在·purge 归 S2）。

**R4-B interview 预览围栏面**：
1. `POST /interview` → 新 id ∧ `reused===false`（主用户既有面试全终态·create 三过滤不复用）——**零 begin·零 live**；
2. `DELETE /privacy/interview-data/:id`（带 Idempotency-Key）→ **503** ∧ error=`interview_erasure_authorization_not_available`——**503 pin 正面行使**（重放仍 503 不建账·proof :96-100 同形）；
3. `POST /privacy/erasure-preview`（scope=interview_data·subjectId=新 id·Idempotency-Key）→ **202** ∧ `status==='local_fenced'` ∧ `editionLabel==='预览版'` ∧ `productionSloClaimed===false` ∧ `completeness==='preview_incomplete'` ∧ sinks 数组 ≥22（user_memory=honest_unresolved 形）；
4. `GET /privacy/erasure-preview/:requestId` → 200 ∧ 同 requestId；
5. 围栏后端点扫 → 全 **410 interview_privacy_fenced**：GET interview / POST begin / POST abandon / GET events / GET report / POST report/retry / GET report/export / GET transcript / POST turn（合法 TurnDto 体抵达 guard·proof :247-256 同形）/ POST feedback——**EXEC 重 pin 每端点 guard 先行序**（DTO 管道先于方法体·非法体 400 到不了围栏·体形照 proof）+ C 端 list 不含该 id；
6. DB 直连围栏零写证：interview_event（stream_key）/ai_report/question_feedback/interview_job 四表按该 id 计数**全 0**（410 扫描后仍零增长=前后读零定谳面）。

### R5 同意撤回面（独立用户 e2e7_·零 live）

1. `POST /privacy/consent`（purpose=resume_processing）→ 200 ∧ `recorded===true` ∧ policyVersion 非空字符串；
2. `GET /privacy/consent?purpose=resume_processing` → `consented===true`；
3. `uploadTextResume`（语料自拟合成简历·纯本地摄取零模型）→ 200 ∧ resumeId；
4. `DELETE /privacy/consent?purpose=resume_processing` → 200 ∧ `withdrawn===true`；
5. GET status → `consented===false`；
6. 重上传 → **403** ∧ `error==='consent_required'`（`:202-203` 门·额度零泄漏如实记账）；
7. **撤回≠擦除定谳面**：`GET /resume/:resumeId/profile` → 仍 200 ∧ structured 非空（已落数据不回溯·Non-claims 行为证）；
8. 重授予 POST consent → 200 → GET status true；
9. 再上传 → 200 ∧ resumeId 在场（**恢复面·如实断言 deduped 复用同 id 形**·Ban 假称新建）。

**断言力**：两场合计显式 `A()` 断言 ≥23（R4-A=7 / R4-B=6 / R5=10）·下界 ≥20。**禁 skip-as-pass**：零新增 test.skip·零 capability 记录（新段全行使·不依赖 OCR/语音 Key 面）·DB 断言零行即 FAIL。

## §2 验收断言候选（pre-exec 双审核对单基面·EXEC 立项重 pin）

1. **S1 全卷绿含新段**：`pnpm e2e:isolated` EXIT=0·既有断言面零丢失（nail 基线 91=e2e-assert-refresh 卷 :131 终值·409 卷并线则 +10——EXEC 时点 assertionCount ≥「EXEC 实测基线+20」为下界·照重 pin 实测为准）·reviewLedger capability 类仍恰 2（image_ocr_unavailable+voice_unavailable）·无新增 skip 类记录。
2. **两场行为断言逐位落码**：R4-A-1..7 / R4-B-1..6 / R5-1..9 全行使·零跳过。
3. **断言力下界**：新增显式断言 ≥20·其中 HTTP 行为断言 ≥14·DB 直连 SELECT-only 断言 ≥3（R4-A-7+R4-B-6+锚内重 pin 面）；零 test.skip·零既有断言删除/弱化（`git diff` 既有 A() 位逐字保留）。
4. **不撒谎边界入收据**：R4 收据如实载「软删受理≠物理清除·purgePending 恒真·物理行在（R4-A-7）」·Ban 写「已擦除/删除完成」；503 pin 正面行使行（R4-B-2）与 resume-data 202 两分读法（§0.3）入收据。
5. **markers=0（§7）+ est live（§6）双声明入收据**；冲突标记门 grep=0；LIVE 协议三条款（§4）履行实录。
6. **登记建议（本刀 SSOT 只读·登记归协调方）**：覆盖矩阵建议新增两行——「隐私擦除用户侧（resume-data 软删+preview 围栏）」=full.e2e 第 10 段（本刀后）+interview-data 生产 DELETE residual（503 冻结随 issuer 刀）；「同意撤回（#81 行为面）」=full.e2e 第 10 段 R5（本刀后）+#81 policy_version/四 purpose 白名单 residual（批4 剩余面）。report_ready 主通路缺口登记=INT-TRANSCRIPT-01 cutover 前结构性不可达（§0.2）·移交 cutover 刀。Ban 直接改矩阵。

## §3 范围外（边界清单·越界即 FAIL）

1. **产品码零改**：apps/api / apps/worker / apps/web / packages / scripts 全域零 diff——修法全落 `e2e/full.e2e.ts` 单文件追加段（零新 helper·复用既有 uploadTextResume/getResumeProfile/signupOrLogin import 面）。consent/privacy 语义零字节触碰。
2. **interview-data 生产 DELETE 零触**：503 冻结面（issuer 组合根）为他刀立法域——本卷只正面行使 503 现状·Ban 开闸 Ban 绕行。
3. **件1 report_ready 零偷开**：本卷零 score_card/score_request/preview-submit 写入面（§0.2 双否逃逸皆 Ban）——该场景归 INT-TRANSCRIPT-01 cutover 刀。
4. **#81 剩余面零触**（§0.4 界线）：policy_version 升版/四 purpose 白名单/语音同意（voice_capture）/导出补全——批4 另卷；R5 只行使 resume_processing 撤回行为面。personalization 门零触。
5. **OCR/语音 capability 跳过面不动**：既有 ⊘ 披露口径照旧。
6. **SSOT 只读**：execution-master-checklist / product-campaign-LEDGER / issues-master / e2e-requirement-coverage-matrix 行与统计零改（引用只读·§2-6 登记建议只落本卷）。
7. **零迁移零新库表**；零 secrets 入库（模型 Key 仅进程 env 运行时态）。
8. **断言口径诚实**：R5 恢复上传 deduped 复用形如实断言；R4 软删物理行在如实记账；既有 S1 主体 live 消耗照旧非本卷新增（§6）。

## §4 依赖

- **立项/EXEC 码面依赖：零硬闸**——触面文件（`e2e/full.e2e.ts` 单文件）主线在握·preview/HMAC 门在套件 env 现状即可达（§0.3·runner 零改动）·可即期 EXEC 立项。
- **LIVE 面协议（照 e2e-scene-409 §4 同条款）**：跑 `e2e:isolated` 真供应商面须 **`MODEL_API_KEY` 只经 loader（`~/.meetwise-secrets/load-model-api-key.sh`）source 注入进程环境** + **`E2E_SKIP_DOTENV=1`**（`scripts/run-e2e.mjs:17-19` 已落码钩·防仓根 .env 残留物回灌）+ **禁 .env 回灌** + 键值零打印零入卷；`scripts/run-e2e.mjs:48` 缺 Key 即 throw fail-closed（`live_provider_key_missing`）·Ban 假服务开关（`scripts/e2e-fake-service-flags.mjs` 门照旧）。
- **裸跑禁令**：验收一律锁 isolated wrapper 口径（`e2e:isolated`）·禁裸跑直呼冒充验收。
- **DB 断言环境**：PG* env 由 isolated runner 注入（g7fix1 同 contract）·缺 env 即 throw（fail-closed·Ban 静默跳过 DB 断言）。
- 无前置刀；409 卷（e2sc 树）非前置（并线仅涉行号/tag 重 pin·§8）。

## §5 Ban 列表 + pins（沿 e2e-scene-409 卷 §5 同源誊录 + 本卷增补）

**Ban 列表**：

Ban push；Ban 自批（双审须独立外席）；Ban retry-to-green；Ban 翻 pins（§5 pins 十一值·含 `actualSpendCny=null` 与 `公开 DELETE=503` 不翻——后者按 §0.3 两分读法如实登记·resume-data 202 升面不在 pin 立法域）；Ban 改共享 SSOT（product-campaign-LEDGER/batch-residual-plan/execution-master-checklist/issues-master/e2e-requirement-coverage-matrix 行与统计只读引用）；Ban 迁移越权（本卷零迁移）；Ban 触其他工作树（含 meetwise-e2sc 409 卷·meetwise-qp v4 卷）；Ban 伪造已问/已验来源；**本卷增补**：Ban 产品码改动（§3-1·api/worker/web/packages/scripts 零 diff）；Ban skip-as-pass（零新增 test.skip·零断言删除·断言力只增不弱）；Ban DB 断言静默跳过（PG* env 缺失即 throw·零行即 FAIL）·Ban DB 直连写入（本卷 DB 面严格 SELECT-only·与 runner seedAdmin 先例分域）；Ban 件1 越闸（report_ready 场景/播种卡/preview-submit 逃逸皆禁·§0.2 双否）；Ban 断言完成态谎言（软删面 Ban「已擦除/物理清除/完成态」断言·purgePending 恒真如实）；Ban interview-data 生产 DELETE 开闸尝试；Ban 擦除段前移（R4-A 须在卷尾全部简历依赖断言之后·任何前移破坏既有面即 FAIL）；Ban 合法 DTO 体缺省（410 扫描端点须体形抵达 guard·Ban 拿 400 冒充 410）；Ban R5 假称新建（恢复上传 deduped 复用形如实）；Ban .env 回灌与键值打印/secrets 入卷；Ban 以本卷 EXIT=0 宣称 LIVE 全绿（既有披露口径照旧）。

**pins（十一值照抄·零翻转）**：

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · 脚注 actualSpendCny=null（账面无实值记录照抄不翻·本卷 est live=0 见 §6——套件主体消耗照 EXEC 收据另账如实记账·不冒充零消耗）

## §6 est live（逐场申报·照 G7Y 口径）

本卷新增段 LIVE 增量 = **0 场量级**：R4-A（软删/读门/导出/DB SELECT）零模型零 begin；R4-B（新面试**不 begin**/围栏/410 扫/DB 计数）零模型零额度；R5（同意三态+文本上传·纯本地摄取）零模型零额度。套件主体（既有断言面）真供应商消耗随 S1 全卷跑照旧·非本卷新增。实耗照 EXEC 收据逐跑如实另账（不冒充·不预估入账）；零生产操作；secrets 面=loader 注入进程 env 运行时态（§4）。

## §7 markers=0（卫生声明）

本卷改动集（恰 1 .md·`ai-docs/delivery/harness/e2e-scene-batch2-REQUEST.md`）五类标记词 grep 零命中（起草席自检·命令与回执留 prove）。五类标记词不复抄卷内（避免自匹配·沿 409/diag/e2e-assert-refresh 卷同形制）。

## §8 STOP（开工三条款）

**STOP · `draft:awaiting_pre_exec_dual` · alone≠dual。** 起草席写完即停零码动（本卷恰 1 .md）。开工三条款：①预执行双审两外席 **BOTH PASS 落卷**；②**协调方明示授权**；③EXEC 立项**不得改 §1 场景清单与 §5 Ban/pins**（改则回炉重审·立项时照 §0 逐条重 pin·件1 被闸登记与 §0.3 两分读法必随卷落收据）。**alone≠dual**（单席自验不计双审）· **Dual PASS ≠ 开工**（PASS 只过审·开工须协调方授权）。

**登记建议（pre-exec 双审可核）**：①本卷立项关联处方 7 中期三件（④⑤收编·①被闸登记）——盘点三向判定=部分被闸；②件1 六步闸链（§0.2）随本卷入账·INT-TRANSCRIPT-01 cutover 刀立项时引本卷 §0.2 开 report_ready 场景卷·届时「报告自洽断言沿既有 7 段形」两臂现成（full.e2e.ts:220）；③处方背景漂移（「FAIL_ALL 注入是唯一闸」不完整·0082 非闸体）已 §0.1/§0.2 如实登记；④409 卷并线后本卷卷尾锚/tag 照 §8 重 pin 零回炉。

---

*E2E-SCENE-BATCH2 REQUEST · 2026-10-11 · draft:awaiting_pre_exec_dual · base `feat/mysql-schema-skeleton` @`388e5f7b` · 分支 `line/e2e-scene-batch2` · 工作树 `meetwise-e2s2` · 蓝本=处方 7 中期三件（④⑤①）+ 形制 e2e-scene-409-REQUEST（Ban/pins 同源誊录）+ 场景先例 privacy-erasure-http.proof（UNSTUB-ERASE rev2 全形）/g7fix1 DB 直连 SELECT-only 形 · 收编判定=部分被闸：R4 隐私升 LIVE（resume-data 全量软删 202 两态+interview 预览围栏前后读零+503 pin 正面行使）+R5 同意撤回（授予→撤回→403 门→撤回≠擦除→恢复·三态全链）两场落 full.e2e 第 10 段·件1 report_ready 主通路被闸登记（六步闸链=0126 互斥→零卡→score_aggregate_empty·与 FAIL_ALL 注入正交·0082 非闸体·移交 INT-TRANSCRIPT-01 cutover 刀）· 产品码+scripts 零字节 · 新增断言 ≥23（下界 20）· est live=0 场量级（零 begin 零模型·主体另账）· pins 十一值照抄 · markers=0 · ⛔push · Dual PASS ≠ 开工 · Ban self-approve · alone≠dual*
