# PERF2 REQUEST — PERF_api 残格两格合卷起草卷·UC-004（career-path）+ UC-015（摄取）分面 PERF_api 延迟收据（docs-only REQUEST 卷·起草落卷即停·沿 PERF_api 三收据刀 #157 同构形）

**Status**: **`draft:awaiting_pre_exec_dual`**（三处钉：本 Status 行 + §8 + 卷尾注·2026-10-26 起草落卷·pre-exec 双审两独立外席待派·alone≠dual·Ban self-approve）· **rev r1 回炉修订落卷（2026-10-26·pre 双审席1 PASS+席2 FAIL 未收敛→协调方裁决回炉·分歧点+裁决+修订清单编号索引=§0.3·Status 值零翻·回炉重审两独立外席再待派）**。

**席位**：PERF2 残格合卷起草席（协调方派单「UC-004/UC-015 PERF_api 残格」总盘小刀 #12-13·两格合卷·认领 coverage-matrix §1.0.2 `:149`/`:151` 两格·与 #157 已落 `:148` 三实例零重叠）。
**基线**：`main` @ `0bd68af96`（fetch 后 origin/main tip 同指亲证·=PR #170 screg-draft 并线点·docs:check **2432=cap 2432 恰等** 本树亲跑 EXIT=0）· 分支 `line/perf2-draft`（建前 `git branch --list "line/perf2*"` 恰零命中·本席 `git worktree add ../meetwise-perf2 -b line/perf2-draft origin/main` 亲立·HEAD 落 `0bd68af96` 亲证）· 工作树 `meetwise-perf2`（仓根同级）。
**必读清单（EXEC 立项前逐件亲读·显式路径）**：`AGENTS.md` → `ai-docs/delivery/e2e-requirement-coverage-matrix.md`（§0.5 强制列 `:47-84` / §1.0.2 分面 `:144-160` / §1.0.3 合计 `:162-166`）→ `ai-docs/delivery/non-happy-path-perf-load-case-matrix.md`（§1.2 PERF 区 `:40-42` / §1.3 摄取/career 区 `:89-:102` / §1.6 伞行 `:150`）→ `ai-docs/delivery/harness/uc-e2e-004-career-path.md`（§1b 抬 covered 缺口清单）→ `ai-docs/delivery/harness/uc-e2e-015-resume-ingest-failures.md`（F1–F5 失败族=本刀旁证零触）→ #157 三收据先例 `apps/api/test/uc-e2e-001-nhp-perf-api.proof.ts` / `uc-e2e-017-nhp-perf-api.proof.ts` → 涉事机制源 `apps/api/src/modules/interview/interview.service.ts` / `interview-assessment.ts` / `apps/api/src/modules/resume/resume.service.ts` / `apps/api/src/modules/quiz/quiz.service.ts` / `packages/ai-graphs/src/career-path.ts` / `packages/domain/src/career.ts`。
**立项出处（不自建 SSOT 行——翻面权归协调方）**：①协调方派单令（总盘小刀 #12-13·「UC-004/UC-015 PERF_api 残格」两格合卷·沿 PERF_api 三收据刀 #157 同构形·「越限沿先例步进承登预授权」随令）；②`e2e-requirement-coverage-matrix.md` §0.5 `:49`「后续每一个 knife / eval / harness / 本表新行或改行**必须**填写下列列」+ §1.0.3 `:166`「后续 knife 改行时必须同步改本表 + `non-happy-path-perf-load-case-matrix.md`；缺列视为未完成 G2/G6」；③#157 三收据刀 additive 注记在树（coverage-matrix `:148`「PERF_api 三收据刀 additive 注记（2026-10-26 协调方派单序第 8 项·沿 NHP-001-PERF-api-01 形…）」+case-matrix `:62`/`:75`/`:86` 三行形）——本卷=同构残格补齐；④结构范本=`harness/nhp-batch-b-REQUEST.md`（§0-§8 形制）+ 收据形=receipts/nhp-011-017-019-perf-api/ 合卷目录先例。

## §0 现状锚（起草席亲读·file:line+blob 逐条 rg/sed/Read/git hash-object 实测 @`0bd68af96`·**EXEC 立项照本节对届时 tip 再重 pin**——基线漂移如实改锚·结论不变则只更行号）

### 0.0 防重双对表

- `git worktree list` 建后 **37** 树实测——`line/perf2*` 恰 1 命中=本席分支；`ls ai-docs/delivery/harness/ | grep perf2` 建前零命中→落卷后唯一同名卷=本卷。
- **#157 零重叠亲证**：`e2e-requirement-coverage-matrix.md` `:148` 行（UC-E2E-011/017/019）「PERF_api 三收据刀 additive 注记」在树逐字亲读=`uc011:nhp-perf-api:prove`/`uc017:nhp-perf-api:prove`/`uc019:nhp-perf-api:prove` 三门 EXIT=0 + case-matrix `:62`（NHP-011-PERF-api-01 行锚 additive 注记）+`:75`/`:86`（NHP-017/019-PERF-api-01 两新行）——**本卷认领 `:149`（UC-004）+`:151`（UC-015）两格·与 :148 三实例行位、case 行、命令面两两不交·零重叠**。
- **在飞交叠复核规则（EXEC 立项日必做）**：本卷起草 turn 产品触面=0（恰 1 新 .md+两 policy 联动件）；EXEC 期触面=两 proof 新文件+双表行内改（coverage-matrix `:149`/`:151` 邻区+case-matrix `:89-:102` 邻区）+runner/两 package.json 注册位+receipts 目录。在飞三线登记：**`line/loadw-exec` @`62f75399d`**（未并 main 亲证 `git merge-base --is-ancestor` 零命中·触 case-matrix NHP-015-LOAD-w-01 行红停注记——其内容与本支 main 基线 `:95` 行同文已并（他路径并线）·与本刀 NHP-015-PERF-api-01 新行 additive 邻区零字面相撞）+ **`line/ag18-draft` @`4c2ea4c9f`** / **`line/campaign-state` @`9f642762d`**（两线对双表各有 84/85 commits·主体已 content 并线·属陈旧长跑线）。届时对各在飞分支执行 `git log -1 -- <文件>` 逐树逐件复核·任一分支顶对任一触面存在 `0bd68af96` 之后新增提交→触停止条件「现场漂移」停手上报。**并线预演令（loadw-exec 线·rev r1 增补）**：本支与 `line/loadw-exec` 届时并线前先 `git merge-tree` 预演并申报（沿 screg 收官并线先例形——merge-tree 预演 EXIT=0 零冲突申报在先·真 merge 兑现在后·两形状并线史既证）·预演冲突或非零 EXIT→停手上报协调方·Ban 就地解冲突。

### 0.1 blob 锚表（`git hash-object` 亲算 @`0bd68af96`）

| 文件 | blob（8 hex·行数） | 关键行锚 |
|---|---|---|
| `ai-docs/delivery/e2e-requirement-coverage-matrix.md` | `54cede58`（522 行） | **§1.0.2 `:149`=UC-E2E-004 PERF_api blind（本刀格 1·「三值 blind 如实·只登记不填绿」批 B 分面登记行）·`:151`=UC-E2E-015 PERF_api blind「413 单点≠负载」（本刀格 2）**·`:146` UC-001 PERF_api 收据先例（case-only 补账形）·`:148` #157 三收据 additive 注记（零重叠凭证）·§0.5 `:47-84` 强制列+列值词汇（`covered` 禁填 `:68`）·§1.0.3 `:166` 双表同步令 |
| `ai-docs/delivery/non-happy-path-perf-load-case-matrix.md` | `24803ac5`（213 行） | `:40` NHP-001-PERF-api-01（收据已落·先例行）·`:62`/`:75`/`:86` NHP-011/017/019-PERF-api-01 三行（#157 形）·**`:88-:96` §1.3 015 区（区头 `:88`·NEG `:92`/BOUND `:93`/FAULT `:94`/LOAD-w `:95` 红停归排期登记/ADV `:96`·行锚 rev r1 对码）**·**:100-:102 004 区（BOUND `:100`/ADV `:101`/FAULT `:102`）**·`:150` NHP-PERF-API-SUITE 伞行（「历史数字不得当当前通过」） |
| `apps/api/src/modules/interview/interview.service.ts` | `a8ae0d15`（918 行） | **`:821`「derive 经 career-path 单节点图执行（@meetwise/ai-graphs·纯本地·零模型调用）」注释句（注释块 `:820-826`·行锚 rev r1 对码）·`:827` generateCareerPath（tx1 guards/评估前置→tx2 begin advisory+lease→derive→tx3 career_path upsert+succeeded 同事务）·`:846` selectCareerPathDerive·`:894` getCareerPath**·`:49-54` fail seam production-off（本刀零触·Ban 动） |
| `apps/api/src/modules/interview/interview.controller.ts` | `d10db4ae`（280 行） | **`:237` `@Post(':id/career-path')`（`@HttpCode(HttpStatus.OK)` 同步 200）·`:243` `@Get(':id/career-path')`** |
| `apps/api/src/modules/interview/interview-assessment.ts` | `603216c5`（104 行） | `:36-39` requireCurrentScorableCards（eligibleCardCount=0→409 fail-closed）·**:94-102 getCareerPathFor（无行→404·有行→GET 重闸 `:99` 409 `insufficient_evidence`）**——GET 终态资格=逐虚拟用户 score_card practice_eligible 种子链（窗外夹具） |
| `packages/ai-graphs/src/career-path.ts` | `568eb7d0`（70 行） | **`:4`「dep = 组合根注入的 `deriveCareerPath`（@meetwise/domain 纯函数·本地计算·无 IO）」·`:55` runCareerPathGraph·`:61` invoke（进程内单节点·零队列零 worker 零外呼）** |
| `packages/domain/src/career.ts` | `57904c57`（190 行） | **`:173-178` deriveCareerPath（冻结签名 (overall, weaknesses)·纯函数·零 IO 零模型）** |
| `apps/api/src/modules/resume/resume.service.ts` | `952482e5`（327 行） | **`:201` upload 文本口·`:211` NUL 剥除·`:213-215` consent 门（`consent_record` purpose='resume_processing' 零行→403 `consent_required`）·`:218` completeIngestion(ingestResume(text))·`:219` 200 {resumeId, status:'ingested'}**·`:43`/`:82` file 链 OCR（`visionOcr` 仅 file 路径·**本链零触**） |
| `apps/api/src/modules/quiz/quiz.service.ts` | `98edbeb2`（140 行） | **`:29` begin·`:38` advisory 锁·`:41` 幂等 alreadyBegun·`:45-48` resume `status='ingested'` 绑定 SELECT（owner+privacy_epoch 取数·锚 rev r1 对码）+`:51-56` resume_quiz CAS 绑定 UPDATE（privacy_epoch·version 递增）·`:60` reserveEntitlement 1.0（不足→402 `insufficient_entitlement`）·`:66` enqueueQuizJob（仅入队·零 worker 消费=零 drain）** |
| `apps/api/src/modules/privacy/privacy.controller.ts` | `0a85debb`（72 行） | `:10` `@Controller('privacy')`·**:15 `@Post('consent')`（purpose 缺省 'resume_processing'）**——UC-015 consent 前置产品路径 |
| `apps/api/test/uc-e2e-001-nhp-perf-api.proof.ts` | `977e0d01`（300 行） | **NHP-001-PERF-api-01 先例形全文件：`:14-17` consent 产品路径逐虚拟用户窗外+桶种子豁免具名·`:52` PERF 常量（N=100 c=10·250/750/1500/0.5%）·`:120-123` live-key in-process self-delete·`:134-139` 0121 ACL 迁移链重放（harness 面·pre-migrate 世界行使）·`:160-167` AbortController 超时形（**未接 fetch 缝如实登记**：`:161` timer abort `ac`·`:164` aborted 检于 `await p` 之后·fetch 悬挂不触发——harness post/get fetch init 无 signal 位 `_neg-harness.ts:288/:304/:317`·本卷 Case timeout 硬顶修正令对照锚）·`:244-246` job 滞队零 drain 断言（bare count 形·本卷 Case 2 `status='queued'` 限定修正令对照锚）·`:247-248` 零模型 ai_model_invocation=0 断言** |
| `apps/api/test/uc-e2e-017-nhp-perf-api.proof.ts` | `0cb14b52`（447 行） | #157 收据形头注（`:1-40`·链嘴/窗外 prep/读法钉/Ban 互洗逐类目）+`:222` prep 窗外制+`:400` 收据 consentTouchpoint 具名申明字段 |
| `apps/api/test/uc-e2e-015-resume-ingest-failures.proof.ts` | `0d0fc91e`（129 行） | F1–F5 失败族（413/422/415/400）——本刀零触只读旁证；**413 单点≠负载**（`:151` 读法原句·本刀不动其义） |
| `apps/api/test/uc-e2e-004-career-path-fault.proof.ts` | `fc9668b5`（461 行） | **`:206-247` 种子链形（GUC `app.principal_user` 逐会话+user_account/interview(completed)/assessment_report(overall=60·dimensions gap 族)/question_rubric/interview_answer_submission/interview_answer_artifact/issued_question_contract/score_request/score_card(practice_eligible·deterministic_total=60) 九件·0100 FK 链全列）**——UC-004 窗外夹具种子范本（本刀零触该文件只读）·**世界一致性（rev r1 重述）：该先例=pre-migrate 世界形（runner pre-migrate 名单 `:4156` 在列·targets 名单 `:2783` 在列·同世界 EXIT=0 史旁证）→本刀 Case 1 九件种子形在该世界已证可种·两形同世界零移植缝** |
| `scripts/run-e2e-isolated.mjs` | `364a4190`（4287 行） | **`:1094-1106` uc001 PERF-api receipt sources（共 17 条目·「14 文件形」draft 笔误 rev r1 对码）·`:1109-1140` 011/017/019 三条（#157 注册形）·`:2814-2820` supported targets 名单（uc004-fault `:2783` 先例位在列）·`:3107` PERF_API_CAPS_CHILD_SRC（wrapper 运行时内联源单源）·`:3268-3275` isolatedCommand caps child 分派·`:4155-4184` pre-migrate 名单（`migrateWithRecovery` 分派 `:4185`·uc004-fault `:4156` 在列+uc001 PERF_api 批 C 形 `:4160-4161`·#157 三条**不入**名单=boot 世界承登注记 `:4164-4168`）**——EXEC 期本刀两 target 沿形 additive 注册（Case 1 pre-migrate 世界入名单·Case 2 boot 世界不入名单） |
| `scripts/ai-docs/public-text-policy.mjs` | `735a1cea`（533 行） | **`:235` `MAX_FILES = 2_432`（届值=cap 恰等零余量）**·`:231-234` CAP-SANCTION 注记链（…2429/2430/2432）——本卷 +1 受管件越限→CAP-SANCTION-2433 起草随刀步进落点 |
| `scripts/ai-docs/public-text-policy.proof.mjs` | `8f189e75`（451 行） | **`:423` fixture `i < 2_432`·`:430` `scannedFiles, 2_432`·`:433` `'ai-docs/f-2432.md'`·`:436` `FILE_LIMIT}:2433`**（四联动点 proof 侧·随 CAP-SANCTION-2433 恰等改 2_433/f-2433.md/:2434） |

### 0.2 认领两格登记（行号+用例名+现值·§1.0.2 亲读逐字）

| 行号 | 用例 | PERF_api 现值（亲读） | 本刀补收据靶 |
|---|---|---|---|
| **`:149`** | **UC-E2E-004（career-path）** | **blind**（批 B 分面登记行：「NHP-004-BOUND-01/ADV-01 case 收据为 BOUND/ADV 面·非 PERF/LOAD 证据——三值 blind 如实·只登记不填绿·无分面收据」） | NHP-004-PERF-api-01 延迟分位 PERF 收据（case-matrix §1.3 additive 新行·格 additive 注记·格值 blind 保持·矩阵侧 blind→case-only 措辞·沿 `:148` #157 同形） |
| **`:151`** | **UC-E2E-015（摄取）** | **blind**（「413 单点≠负载」——BOUND 413 单点面≠PERF 分面） | NHP-015-PERF-api-01 摄取→押题开题链延迟分位 PERF 收据（case-matrix §1.3 additive 新行·格 additive 注记·格值 blind 保持·矩阵侧 blind→case-only 措辞·同上）·**与本行 LOAD_worker 列及 case-matrix `:95` NHP-015-LOAD-w-01（红停归中大工程排期）零交涉**（PERF_api≠LOAD_worker 两形状互不替代） |

### 0.3 rev r1（pre-exec 双审分歧回炉·协调方裁决修订·2026-10-26 落卷）

- **分歧面**：pre-exec 双审两独立外席——席1 **PASS** + 席2 **FAIL**·未收敛→回炉协调方裁决（Ban self-approve 维持·本小节由回炉席按裁决令修订·非本席代裁）。分歧主轴=Case 1 harness 世界的登记形（draft「boot() 形沿四先例零注册非漏登」hedge 对 uc004-fault pre-migrate 先例形的机制吻合度）+行号锚漂移族+timeout 硬顶缝+零 drain 断言措辞。
- **裁决（协调方）**：**UC-004 harness 世界采席2 修复路径 (a)——注册进预迁移世界沿 uc004-fault 先例形**（理由：uc004-fault 同世界 EXIT=0 史旁证·九件种子形已证可种·免 boot 世界 7 迁移重放闭包+scoring_definer_owner role 创建面）；**UC-015 维持 boot 世界**（席2 已核机制真+登记齐）。修订全清单（席2 P1×1+P2×4+席1 P2×3+OBS×3）全采纳零折衷。
- **修订清单编号索引（本卷落点逐条）**：
  1. **[P1]（席2）** Case 1 PERF 注册面改预迁移世界：§1.4 Case 1（runner premigrate 名单第五注册位·沿 uc004-fault targets 名单 `:2783`/pre-migrate 名单 `:4156` 先例形·批 C `:4160-4161` 同名单形·非 #157 boot 形 `:4164-4168`）+§1.1 主链嘴窗外 prep 世界一致性重述（九件种子形=该世界已证可种）+§0.1 runner/uc004-fault 两行锚+§8 边缘精化 0206/0058 ACL 重放族预登（#157「红留痕承登=0206 函数 ACL」coverage-matrix `:148` 同族）。
  2. **[P2-C]** 路由单数对码：`POST/GET /interview/:id/career-path`（interview.controller.ts `:16` `@Controller('interview')`+`:237`/`:243` 对码）——§1.1 主链嘴+§1.4 Case 1 全承接（draft「/interviews/」复数笔误修正）。
  3. **[P2-A]** case-matrix 015 区行锚 `:89/:90/:91`→**`:92/:93/:94`**（§0.1+§3-3 区间锚 `:88-:96` 对码）。
  4. **[P2-B]** 零模型注释锚 `:822-826`→**`:821`**（块 `:820-826`）——§0.1+§1.1 对码。
  5. **[P2 timeout 硬顶]** §1.4 两 Case+§2-6：fetch 接 `AbortSignal` 或 wrapper 级 wall cap——先例 uc001 `:160-167` AbortController 未接 fetch 缝如实登记（`:164` aborted 检于 `await p` 后·fetch init 无 signal 位 `_neg-harness.ts:288/:304/:317`）+本卷修正令。
  6. **[P2 滞队断言]** §1.4 Case 2+§2-6：quiz_job `status='queued'` 限定 count 承载零 drain（bare count 先例形如实对照 uc001 `:244-246`）+残留 worker `docker ps` 披露臂。
  7. **[微]×2**：Case 2 逐字复述 warmup 10 excluded（uc001 `:7` 先例嘴）；§0.0 补 loadw-exec 并线 `git merge-tree` 预演句（沿 screg 收官并线先例形）。
  8. **[OBS]×3**：①consent 全局谓词（resume.service.ts `:213` 无 principal 谓词）——§1.2 如实注记·收据措辞 Ban 申明 per-user 隔离；②§0.1 runner 行「14 文件形」实为 `:1094-1106` 共 17 条目对码；③quiz 绑定锚 `:45-48`+`:51-56` 对码（draft `:52-55` 笔误）。
  9. **[rev]** 本小节（§0.3）+Status 行 rev 注+卷尾注 rev 注。
- **门（rev r1 落卷适用）**：docs:check+public-text-policy:prove+markers 三门亲跑 EXIT 原值随 commit 申报·diff 面恰 1 tracked（本卷）·cap 零步进（rev r1 零新增受管件）。

## §1 红事实（机制链·全部亲证 @`0bd68af96`·「与 X 一致」≠「X 已证」措辞纪律全卷适用）

### 1.1 UC-004（career-path）PERF_api 面读

- **零模型面核（本卷停止条件第一核·亲证通过）**：`interview.service.ts:821`（注释块 `:820-826`·行锚 rev r1 对码）注释逐字「derive 经 career-path 单节点图执行(@meetwise/ai-graphs,纯本地,零模型调用)」；`packages/ai-graphs/src/career-path.ts:4`「dep = 组合根注入的 deriveCareerPath（@meetwise/domain 纯函数，本地计算、无 IO）」；`packages/domain/src/career.ts:178` `deriveCareerPath(overall, weaknesses)` 纯函数（整数域校验+`evaluateLevelPolicy` 分数阶梯+文案组装·零 fetch 零 client 零队列）；全链零 worker dispatch 零 job 入队（单节点图进程内 invoke `career-path.ts:61`）。**主链 keyless 成立·停止条件「主链含模型外呼无法 keyless」不触发**。
- **主链嘴（测量窗冻结）**：`POST /interview/:id/career-path`（**单数 `interview`**·`@Controller('interview')` controller `:16` + `@Post(':id/career-path')` `:237` 对码·draft「/interviews/」复数笔误 rev r1 修正·同步 200：tx1 guards+评估前置（409 `assessment_required`/`insufficient_evidence` fail-closed）→tx2 `ai_graph_run` begin（advisory 锁+lease 120s+version 递增）→derive 纯本地→tx3 `career_path` upsert+active→succeeded 同事务）→ `GET /interview/:id/career-path`（`:243`·200 {readiness, level, milestones} 终态可读·G5 重闸 `interview-assessment.ts:99` 资格=score_card practice_eligible 链）。
- **窗外 prep（逐虚拟用户·夹具豁免具名）·世界一致性重述（rev r1）**：assessment 前置与 G5 资格无法经 keyless 产品路径到达（report 链需模型 worker）→ 沿 `uc-e2e-004-career-path-fault.proof.ts:206-247` IV_CTL 种子形九件（user_account/interview(completed)/assessment_report(overall=60·dimensions 含 gap)/question_rubric/submission/artifact/issued_contract/score_request/score_card(practice_eligible·deterministic_total=60)·0059 GUC `app.principal_user` 逐会话设）·**该九件种子形=pre-migrate 世界已证可种（uc004-fault 本身在 runner pre-migrate 名单 `:4156`/targets 名单 `:2783` 注册·同世界 EXIT=0 史旁证——本刀 Case 1 采同世界（§0.3 rev r1 裁决）·种子形零移植缝）**·**Ban 裸 INSERT 绕产品路径=仅限窗外 prep 面·测量窗全产品 HTTP**。career-path 链零额度触点（generateCareerPath 全文零 reserveEntitlement 亲证）→ **零桶种子如实申明**（≠uc001/015 桶豁免形·零桶即零豁免）。
- **缺列诊断**：`:149` 三值 blind·BOUND/ADV 收据（批 B）为并发/对抗面非延迟分位面·PERF_api 零 case 行零收据 → **blind 实证**。

### 1.2 UC-015（摄取）PERF_api 面读

- **零模型面核（本卷停止条件第二核·亲证通过）**：文本路径 `POST /resume` → `upload()`（`resume.service.ts:201`）→ `uploadInTransaction`：NUL 剥除（`:211`）→consent 门（`:213-215`）→`createResumeWithBlob`（pgp 加密）→`completeIngestion(ingestResume(text))`（`:218`）——`ingestResume`=@meetwise/domain 纯解析器（`domain/src/index.ts:46`·零 IO 零模型）；**OCR/`visionOcr` 仅 file 上传链（`:43`/`:82`）·本链文本路径零触**；`POST /quiz/:id/begin`（`quiz.service.ts:29`）=advisory 锁+幂等+resume `status='ingested'` 绑定+`reserveEntitlement` 1.0+`enqueueQuizJob` 仅入队（`:66`）——零 worker 消费=零 drain（押题生成模型面在 worker·隔离壳内不启动）。**主链 keyless 成立·停止条件不触发**。
- **主链嘴（测量窗冻结）**：`POST /resume`（text 唯一后缀防 dedup 混叠·200 {resumeId, status:'ingested'}）→ `POST /quiz`（200 quizId）→ `POST /quiz/:id/begin`（resume-id header·202 {accepted, jobId}）→ `GET /quiz/:id`（200 created 态可读）——逐虚拟用户。
- **consent 前置（沿 uc001 PERF-api 先例）**：产品路径 `POST /privacy/consent`（purpose='resume_processing'·`:15`）逐虚拟用户·**测量窗外执行不计入分位·非裸 INSERT 非豁免面**（uc001 proof `:14-15`/`:146-148` 先例形同构）·**门语义如实注记（rev r1）**：consent 门=`resume.service.ts:213` `SELECT 1 FROM consent_record WHERE purpose='resume_processing' LIMIT 1`——**purpose 全局存在性谓词·无 principal/owner 限定**（任一用户 consent 行满足全体）→本刀行使形=逐虚拟用户经产品路径 POST consent（先例同构）·**收据措辞 Ban 申明「consent per-user 隔离/逐用户门」——门为全局谓词·隔离义零申明·如实照机制记**。
- **窗外 prep（逐虚拟用户·夹具豁免具名）**：桶种子一枚（`entitlement_bucket` kind='paid' 3.0·沿 uc001 `:149-154` 豁免①具名形·quiz begin 预留 1.0 所需·Ban 裸 INSERT 绕产品路径=仅限窗外 prep 面）。
- **缺列诊断**：`:151` blind「413 单点≠负载」——既有 F1–F5/BOUND 为失败族单点面·NHP-015-LOAD-w-01 为 worker LOAD 形状且红停归排期（case-matrix `:95`）·PERF_api 延迟分位零 case 行零收据 → **blind 实证**。
- **边界钉（防互洗）**：本 case=api HTTP 延迟分位形状·**≠** NHP-015-LOAD-w-01 worker 吞吐/积压形状（红停登记在树·Ban 借本收据冒充 LOAD 收据·Ban 借红停登记 wash 本 case）·**≠** NHP-015-BOUND 413 单点面（读法原句保留）·**≠** NHP-015-ADV 对抗拒面收据。

### 1.3 否决面（三否决·本席起草适用·EXEC 期同纹·命中即停）

1. **Ban invent covered**：两 proof EXIT=0 仅=case 证据；`:149`/`:151` 两格措辞只允许 blind→`case-only` 措辞注记（格值 blind 保持零翻面）·**禁止升 covered/partial**·`coveredCount=8` 零翻转·covered 翻面权归协调方（§0.5 列值词汇 `:68`「本切片不填 covered」沿承）。
2. **Ban live key**：零 `MODEL_API_KEY` 加载/伪造·零 live 外呼·无 Key 面（`e2e:isolated`/`full.e2e`）=blocked 如实登记永不硬跑·est live=0（§6）。
3. **Ban retry-to-green**：任一门红即停如实登记·attempts 台账逐次留痕·禁红后重跑冲销·禁改既有断言凑绿（「为绿改断言」Ban 沿承）。

### 1.4 修法裁决：**两格各补 PERF_api 延迟分位收据（一刀一格·docs+test-only·零产品码触·沿 #157 三收据刀同构形）**

- **Case 1 = `NHP-004-PERF-api-01`**（`apps/api/test/uc-e2e-004-nhp-perf-api.proof.ts` 新文件·独立建·零触 uc004 既有三 proof）：主链嘴=§1.1 冻结链（窗外种子九件→POST `/interview/:id/career-path` 200→GET 200 终态·单数对码 rev r1）·参数=N=100 c=10 warmup=10 runs=3 all-must-pass · 五值=p50≤250ms/p95≤750ms/p99≤1500ms/max(观测披露)/error_rate≤0.5% · nearest-rank client-hrtime · timeout 10s=error（**硬顶令 rev r1：fetch init 接 `AbortSignal`（`signal: ac.signal` 直入 fetch·或 wrapper 级 wall cap 硬计时 race 兜底）——先例缝如实登记：uc001 `:160-167` AbortController `:164` aborted 检于 `await p` 之后·harness fetch init 无 signal 位（`_neg-harness.ts:288/:304/:317`）→fetch 悬挂则 10s 计时不触发·本卷修正令不复发该缝**）· caps Docker 双容器 2cpu/4GiB（NanoCpus=2e9/Memory=4GiB·HostConfig 亲证入收据·PERF_API_CAPS_CHILD_SRC 同源内联 wrapper 落 `.tmp/uc004-perf-api-receipts/`）· 断言形≈10（ISO×3 key self-delete/still-unset/caps enforced + PERF×5 五值三 runs + N×2 ai_graph_run succeeded 恰数+ai_model_invocation=0）· live-key in-process self-delete（uc001 `:120-123` R6 同形）· **注册=runner 五位 additive（receipt sources/targets 名单/isolatedCommand caps child/pre-migrate 名单/resource-caps 条件）——harness 世界=预迁移世界（§0.3 rev r1 协调方裁决·席2 修复路径 (a)）**：target 沿 uc004-fault 先例形双登记（supported targets 名单 `:2783` 先例位+pre-migrate 名单 `:4156` 先例位·本刀 additive 新位）·同世界史旁证=uc004-fault pre-migrate 在列 EXIT=0·批 C `:4160-4161` uc001 PERF_api 同名单形；**非 #157 boot 世界形**（runner `:4164-4168` 承登 #157 三条 world 选择=其 proof sql/01 重建面撞 definer 42501→改 boot 侧 virgin 世界——本 case 九件种子形沿 uc004-fault 已证 pre-migrate 世界可种·**免 boot 世界 7 迁移重放闭包+scoring_definer_owner role 创建面**）；**0206/0058 ACL 重放族如实预登**：proof 内 0206/0058 ACL 重放块承载 app_role 执行面（#157 同族形·coverage-matrix `:148`「红留痕承登=0206 函数 ACL」沿形）——EXEC 期若红=42501 definer 族→harness 面 ACL 缝如实留痕非机制红（§8 边缘精化·attempts 台账逐次留痕）· root package.json ×2 行+api package.json ×1 行。
- **Case 2 = `NHP-015-PERF-api-01`**（`apps/api/test/uc-e2e-015-nhp-perf-api.proof.ts` 新文件·独立建·零触 uc015 既有两 proof）：主链嘴=§1.2 冻结链（窗外 consent 产品路径+桶种子→POST /resume→POST /quiz→POST begin 202→GET /quiz/:id 200）·参数同上（N=100 c=10 warmup=10 runs=3·**warmup 10 excluded 逐字（沿 uc001 `:7` 先例嘴·预热样本不计入分位）**·五值同阈·caps 双容器同源·timeout 10s=error **硬顶令同 Case 1**（AbortSignal 入 fetch init 或 wrapper wall cap·uc001 `:160-167` 缝不复发））· 断言形≈10（ISO×3 + PERF×5 + N×2 quiz_job **`status='queued'` 限定** count 恰数零 drain（**措辞对齐机制 rev r1**：bare count（uc001 `:244-246` 先例形如实对照）不承载「滞队零 drain」义——begin 仅入队零 worker 消费→零 drain 恒等式=queued 限定 count 恰数·非全表行数）+**残留 worker `docker ps` 披露臂**（隔离壳内零 worker 容器在跑·inspect 输出入收据·披露臂非断言臂）+ai_model_invocation=0）· 0121 pgp ACL 迁移链重放（harness 面·uc001 `:134-139` 同形——逐用户 POST /resume blob 加密行使所需·零产品码触零新迁移）· **注册=boot 世界维持（§0.3 rev r1 裁决·席2 已核机制真+登记齐）**：runner 五位 additive（receipt sources 枚举 resume/quiz/privacy 面/targets 名单/isolatedCommand caps child/**pre-migrate 名单零注册**（boot 世界·沿 #157 三先例形 `:4164-4168` 承登注记）/resource-caps 条件）+root ×2+api ×1。
- **双表 additive（§1.0.3 `:166` 双表同步令）**：case-matrix §1.3 additive 新两行（NHP-004-PERF-api-01 插 `:102` NHP-004-FAULT-01 行后·NHP-015-PERF-api-01 插 `:96` NHP-015-ADV-01 行后·旗=**blind→case-only**（executed·EXIT0=case≠covered）措辞·沿 `:75`/`:86` #157 行形）· coverage-matrix `:149`/`:151` 两格 **additive 注记**（格值 blind 保持·「NHP 矩阵侧 blind→case-only 措辞」沿 `:148` uc017 同形注记·格值零翻面）。
- **防洗句（沿 `:148` uc017 司法句逐字镜像）**：「**Ban 借 PERF 收据宣 PERF SLO/生产容量/HA/线上 SLO**」「**EXIT0=case≠covered**」「**Ban 借本收据宣 NHP-PERF-API-SUITE 闭合（实例≠伞·伞行 `:150` 零动）**」· UC-004 专属：「Ban 借本收据宣 `GAP-UC004-E2E-MAIN`/`GRAPH`/`GROWTH`/`FAIL-A3`/`UNCERTAINTY` 收口（本收据=PERF 分面延迟观测·非主路径 e2e 闭环·`uc-e2e-004-career-path.md` §1b 清单原样保留）·Ban 与 NHP-004-BOUND/ADV/FAULT 收据互洗」· UC-015 专属：「Ban 借本收据冒充 NHP-015-LOAD-w-01 收据（红停归排期·两形状互不替代）·Ban 与 NHP-015-ADV/F1–F5 收据互洗·『413 单点≠负载』读法原句保留」。
- **收据面**：tracked gate stdout log=`ai-docs/delivery/receipts/nhp-004-015-perf-api/`（01-gate-uc004/02-gate-uc015 两 log·合卷目录沿 nhp-011-017-019-perf-api 先例）+ `.tmp/uc004-perf-api-receipts/`、`.tmp/uc015-perf-api-receipts/`（perf-receipt.json+_caps-evidence.json 四件套·.tmp 非扫描面）。

## §2 验收断言（pre-exec 双审核对单基面·起草门本 commit 适用+EXEC 预基面届时重 pin·**数字口径以实跑实测为准·熔断阈值即停止条件「验收红不可修」触发面**）

1. **docs:check（红停条款）**：`node scripts/ai-docs/check-docs.mjs` EXIT=0·scanned ≤cap（**届值 2432=cap 2432 恰等零余量亲证**+本卷 harness/perf2-REQUEST.md 受管 1 件=2433 必超→**CAP-SANCTION-2433 起草随刀恰等步进 cap 2432→2433 随本 commit**（协调方派单预授权「越限沿先例步进承登预授权」随令·+1 恰等零多放·沿 uc003x 2410→2411/eslint-ignores 2420→2421/rcload 2429→2430 起草随刀单件恰等先例形·四联动点=policy `.mjs` `MAX_FILES=2_433`+CAP-SANCTION-2433 注记+proof `.mjs` fixture `i<2_433`/`scannedFiles 2_433`/`f-2433.md`/越限错误码 `PTP_FILE_LIMIT:2434` 恰等改·计数预算非内容策略·越限臂 fabricated 数随 cap 联动同步·语义不变强度不减）·终态 scanned **2433=cap 2433 恰等**（rev r1 注：本步进已随起草 commit `b6434ee02` 落卷·届值现读 2433=cap 2433·rev r1 本身零新增受管件零再步进）；**EXEC 期 +2 proof 届值再步进预登=2435**（越限臂联动·沿 2429→2432 rcload EXEC 先例形）·cap 上抬权归协调方）。
2. **PTP proof 联动（cap 步进自证）**：`pnpm public-text-policy:prove` **EXIT=0 12/12**（四联动点恰等改后·越限臂断言形状不变强度不减）。
3. **markers 五类零命中**：本刀改动集新增行五类标记词+行首冲突标记 grep 零命中（词族沿 `i6-239-gates.proof.mjs:154-163` 门口径·词面运行时组装·不复抄卷内防自指·命令与回执入 EXEC 收据）。
4. **diff 面机检**：起草 commit `git diff --numstat <base>` **恰 3 tracked 路径**=本卷 .md+两 policy 联动件（多任何 tracked 路径即停）；EXEC 期 diff 面=本卷+双表行内改+两新 proof+runner+两 package.json+receipts .log（届时逐件登记）。
5. **est live=0**：零实跑零模型外呼零 Key 加载（§6）。
6. **EXEC 预基面（届时重 pin）**：两 proof 隔离 prove EXIT=0 **双 fresh**（实现方恰一次+独立复验恰一次·attempts 台账含红次如实）· 五值三 runs 达标+caps enforced 收据四件套在卷 · **timeout 硬顶核（rev r1）**：两 proof fetch 接 `AbortSignal` 或 wrapper wall cap 在卷（uc001 `:160-167` 缝不复发）· **Case 2 零 drain 断言核（rev r1）**：`status='queued'` 限定 count+`docker ps` 残留 worker 披露臂入收据 · 邻面不回退（`uc001:nhp-perf-api:prove`/`uc017:nhp-perf-api:prove` 先例门复跑恒等绿+`uc015:nhp-adv:prove`/`uc004:nhp-bound:prove` 邻区恒等·按届时 SSOT 口径）· typecheck/lint 按届时五值恰等口径（.mjs 改动零 warning 增量）· 双表 additive 逐件登记 · 任一门红→§8 停止条件。

## §3 范围外（边界清单·越界即 FAIL）

1. **产品码面零触**：`apps/`、`packages/` 产品源零 diff（EXEC 期仅新增 test proof 文件+注册行·沿 uc001/uc011/uc017/uc019 PERF-api 四先例 prove-only 形）。
2. **#157 三实例零触**：coverage-matrix `:148` 行既有 additive 注记+case-matrix `:62`/`:75`/`:86` 三行+三 proof+三注册位零触只读（其收据与本刀零互证零互洗）。
3. **UC-004/UC-015 既有 case 面零触**：uc004 三 proof（mjs/fault/bound/adv）与 uc015 两 proof（ingest-failures/adv）零触只读；case-matrix `:88-:96`/`:100-:102` 既有行措辞零改（本刀仅 additive 新行）；NHP-015-LOAD-w-01 红停登记行零触。
4. **共享 SSOT 零改**：REMAINING-NORTH-STAR-QUEUE / product-campaign-LEDGER / execution-master-checklist / gap-bug-backlog 只读引用——翻面权归协调方。
5. **covered/queue 翻面零预支**：本刀收据不构成 covered 抬升·Ban 预写翻面措辞·`coveredCount=8` 零动。
6. **零迁移零配置**：Ban 新迁移（0121 重放系 harness 面既有链重放非新迁移）Ban 触告警/CI 配置（越界即停）。

## §4 依赖

**①上游已满足**：#157 三收据先例形（proof+注册+收据+双表注记全链在树）+ uc004-fault 种子链形在树 + runner PERF_API_CAPS_CHILD_SRC 单源在树。**②无同文件并发**：起草 turn 恰 3 tracked 零交涉面；EXEC 期触双表 `:149`/`:151`/§1.3 邻区——§0.0 在飞交叠复核必做（loadw-exec/ag18/campaign-state 三线登记）。**③下游**：两格收据供 NHP-PERF-API-SUITE 伞行评估族引用（实例≠伞·评估权归后继刀·本刀 Ban 代评）。

## §5 Ban 列表 + pins

**Ban 列表**：Ban push/force-push（git 写只本 worktree commit）；Ban 自批（pre-exec 双审两独立外席·alone≠dual 不代签）；Ban retry-to-green（§1.3-③）；Ban invent covered（§1.3-①·含升格 partial/借旁证 wash）；Ban live key（§1.3-②·含伪造 Key 面/硬跑 blocked 面）；Ban 触 #157 三实例面与其余 §1.0.2 行（§3-2/§3-3）；Ban 触产品码面/迁移/CI 告警配置（§3-1/§3-6）；Ban 改共享 SSOT（§3-4）；Ban 改既有 proof 断言（两刀 prove 全独立新文件·零增臂零复用既有壳内断言）；Ban 触其他工作树；Ban 伪造已读/已验来源（§0 锚全亲证为本卷前提）；Ban 造 .env*/写 Key 值入树入据；Ban 顺带升级依赖包；Ban 就地归因门矩阵外新红（若现新红→如实登记升级·Ban 借机修）；Ban 借本收据宣 PERF SLO/生产容量/HA/线上 SLO/NHP-PERF-API-SUITE 闭合/UC-004 成长链 GAP 收口/NHP-015-LOAD-w-01 收据（§1.4 防洗句全类目）。

**pins（十一值照抄·零翻转）**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null。

## §6 est live=0（起草 turn·EXEC 期同）

- 起草 turn（本 commit）：est live=**0**——零实跑零模型外呼零 Key 加载·零生产操作·零 secrets·零消耗（EXEC 期两 case 全离线隔离 PG·零模型外呼·`ai_model_invocation=0` 硬断言随 proof·§2-5 承）。

## §7 markers=0（卫生声明）

本刀改动集（本卷 1 .md+两 policy 联动件·起草 turn）**五类标记词+行首冲突标记 grep 零命中**（起草席亲跑·回执随 EXEC 收据留痕·五类词面运行时组装口径·不复抄卷内防自匹配——沿 negbend/reconcile-retry 卷 §7 同形制）。

## §8 STOP（开工三条款 + 停止条件四类）

**STOP · `draft:awaiting_pre_exec_dual`（三处钉：本节+Status 头+卷尾注·同值零翻）· alone≠dual · Dual PASS ≠ 开工（PASS 只过审·开工须协调方明示授权）· EXEC commit 不预 claim post-prove-dual EXIT。** 开工三条款：①pre-exec 双审两外席 **BOTH PASS 落卷**；②**协调方明示 EXEC 授权**（committed SHA 重钉）；③EXEC 立项**不得改 §1.4 修法面与 §5 Ban/pins 与 §1.3 三否决**（改则回炉重审）·立项时照 §0 协议对届时 tip 全量重 pin（行号漂移如实改锚·结论不变只更行号·§0.0 在飞交叠复核必做）。**停止条件（四类+一专项·命中即停手上报·Ban 就地处置）**：
- **主链模型外呼（专项·派单令指定红停面）**：EXEC 期实测两主链任一嘴现真模型外呼（`ai_model_invocation>0`/OCR 触发/provider egress）→ 起草面「零模型 keyless」诊断被证伪 → **红停如实上报协调方**（起草席 §1.1/§1.2 双核亲证零外呼为前提·届时复证推翻即停·Ban 就地改断言凑 keyless）。
- **现场漂移**：届时 tip 对 §0.1 任一锚 blob/机制漂移且结论受疑（两格被他刀改写·career-path 零模型注释/derive 纯函数面变·resume 文本链 consent 门/quiz enqueue 语义变·在飞三线对触面新增提交）→停·重 pin 回炉。
- **机制不满足**：proof 落卷后断言与 §1 红事实推定形不符（如 GET 重闸 409 资格链种子齐仍红·quiz begin 非 202·career-path 非 200 同步）→根因诊断被证伪→停·如实升级协调方回炉（Ban 就地改诊断 Ban 凑绿）。**边缘精化（防机制面误停）**：quiz begin 402 `insufficient_entitlement`=窗外桶种子序错（harness 面·沿 uc019 prep 红次先例·修正种子序非机制红）；0121 ACL 重放族红=harness 面迁移链缝（沿 uc001 红次先例·harness 面修正非机制红）；**Case 1 pre-migrate 世界 0206/0058 ACL 重放族红（interview 隐私栅栏函数面 definer 42501）=harness 面 ACL 缝（#157「红留痕承登=0206 函数 ACL」同族·coverage-matrix `:148`·rev r1 预登 §1.4 Case 1·harness 面修正非机制红·attempts 台账逐次留痕）**。
- **越界需要**：修法诉求超出 §1.4 恰两子刀面（需触产品码/#157 三实例面/covered 翻面/共享 SSOT/迁移/告警配置）→停·另刀或协调方裁决（Ban 就地扩面）。
- **验收红不可修**：§2 任一门红且根因不在本刀交付面（docs:check 超 cap/邻套件新红/typecheck/lint 超）→停·stash 对照亲证基线·如实登记（Ban 借机修）。

---

*PERF2 REQUEST · 2026-10-26 起草 · **STOP=`draft:awaiting_pre_exec_dual`**（三处钉：Status 行+§8+本行）· **rev r1 回炉修订落卷（§0.3·双审分歧协调方裁决：Case 1 预迁移世界沿 uc004-fault 形+Case 2 boot 世界维持·修订清单 9 项全采纳）** · PERF_api 残格两格合卷（总盘小刀 #12-13·协调方派单）· coverage-matrix §1.0.2 `:149`（UC-E2E-004 PERF_api blind）+`:151`（UC-E2E-015 PERF_api blind「413 单点≠负载」）· #157 已落 `:148` UC-011/017/019 三实例零重叠亲证 · 修法=两格各补 PERF_api 延迟分位收据（NHP-004-PERF-api-01 career-path `POST /interview/:id/career-path` 单数→GET 终态·derive 纯本地零模型·pre-migrate 世界 / NHP-015-PERF-api-01 resume 摄取→quiz begin 文本路径零模型·consent 产品路径逐用户窗外沿 uc001 先例·boot 世界维持）· 参数冻结 N=100 c=10 warmup=10 runs=3（warmup 10 excluded）五值 250/750/1500/0.5% max 观测披露 nearest-rank timeout 10s 硬顶（AbortSignal 入 fetch 或 wrapper wall cap）caps Docker 双容器 2cpu/4GiB · 主链 keyless 双核亲证（停止条件「主链含模型外呼无法 keyless」不触发）· §1.3 三否决（Ban invent covered / Ban live key / Ban retry-to-green）· 双表 additive 沿 §1.0.3 `:166` 同步令·防洗句沿 `:148` uc017 司法句 · cap 预算核=届值 2433=cap 恰等（rev r1 零新增受管件零步进）·EXEC 期 +2 proof 预登 2435 · base=origin/main `0bd68af96` · 分支 `line/perf2-draft` · 工作树 `meetwise-perf2` · est live=0 · markers=0 · pins 十一值零翻 · coveredCount=8 不变 · ⛔push · pre-exec 双审两独立外席待派（窄域=本卷全节含 §0.3·alone≠dual·Ban self-approve）*
