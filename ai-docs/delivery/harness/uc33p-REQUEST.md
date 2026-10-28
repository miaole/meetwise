# UC33P REQUEST — UC-033 PERF_api（X10≠SLO）起草卷·NHP-033-PERF-api-01 越权面合法用户 begin 链延迟收据（docs-only REQUEST 卷·起草落卷即停·沿 PERF_api 家族形：uc001 `:146` → #157 三实例 `:148` → PERF2 双实例 `:149`/`:151` · 本刀认领 `:152`）

**Status**: **`draft:awaiting_pre_exec_dual`**（起草落卷即停·pre-exec 双审两独立外席待派·alone≠dual·Ban self-approve·EXEC/翻面权全归协调方）。

**席位**：UC-033 PERF_api（X10≠SLO）起草席（docs-only 起草·协调方派单·总盘 P2 小刀·「本刀第五实例」系派单令原文承登·树面实例链如实并载=case-matrix 既有六行 NHP-PERF-api-01（`uc001` `:40`/`uc011` `:62`/`uc017` `:75`/`uc019` `:87`/`uc015` `:98`/`uc004` `:105`）+本刀 EXEC 期新增第七行·实例计数口径归协调方）。
**基线**：`main` 工作树 @ **`c8f8effff`**（origin/main tip 同指亲证·=PR #175 x17-adv 并线点·`git fetch origin` 本 turn EXIT=0·`git worktree add ../meetwise-uc33p -b line/uc33p-draft origin/main` 亲立·HEAD 落 `c8f8effff` 亲证）· `node scripts/ai-docs/check-docs.mjs` 本树亲跑 **EXIT=0 · scanned 2439**（≤ cap 2439 恰等零余量·§2-1 预算核）。
**必读清单（EXEC 立项前逐件亲读·显式路径）**：`AGENTS.md` → `ai-docs/delivery/e2e-requirement-coverage-matrix.md`（§0.5 强制列 `:47-84` / §1.0.2 分面 `:144-155` / §1.0.3 合计 `:162-166` / §1.0.1 `:130` / §2 `:190` / §3 `:275`）→ `ai-docs/delivery/non-happy-path-perf-load-case-matrix.md`（§1.2 PERF 区 `:40-:42` / §1.4 UC-033 区 `:115-:118` / §1.6 伞行 `:150`）→ `ai-docs/delivery/harness/uc-e2e-033-cross-user-authz.md`（§1b 七类缺口清单）→ `ai-docs/requirements/use-cases/e2e-scenarios.md`（UC-033 `:425` A1–A4）→ 家族先例 proof `apps/api/test/uc-e2e-001-nhp-perf-api.proof.ts`（300 行）/ `uc-e2e-011-nhp-perf-api.proof.ts`（427 行·begin 主链 PERF 先例）/ `uc-e2e-015-nhp-perf-api.proof.ts`（timeout 硬顶 rev r2 修正形）→ 同 UC 既有 proof `apps/api/test/uc-e2e-033-cross-user-authz.proof.ts`（X1–X11/W1·X10 `:293-309`）/ `uc-e2e-033-nhp-adv.proof.ts`（三臂族 61 断言·PC begin 真预留臂 `:302-316`）→ 涉事机制源 `apps/api/src/modules/interview/interview.service.ts` / `interview.controller.ts` / `packages/db/src/routing/candidate-route.ts` / `packages/db/src/interview/interview-jobs.ts` / `apps/api/src/modules/resume/resume.service.ts` / `privacy/privacy.controller.ts` / `commerce/commerce.controller.ts`。
**立项出处（不自建 SSOT 行——翻面权归协调方）**：①协调方派单令（总盘 P2 小刀·「UC-033 PERF_api（X10≠SLO）」·沿 PERF_api 家族形·#157 三实例 uc011/017/019 + PERF2 双实例 uc004/015 先例·「越限沿常设预授权恰等步进预登」随令）；②`e2e-requirement-coverage-matrix.md` §0.5 `:49`「后续每一个 knife / eval / harness / 本表新行或改行**必须**填写下列列」+ §1.0.3 `:166`「后续 knife 改行时必须同步改本表 + `non-happy-path-perf-load-case-matrix.md`；缺列视为未完成 G2/G6」；③**matrix `:152` 亲读逐字**=`| UC-E2E-033（越权） | **gap**（X10≠SLO） | **blind** | **blind** | burst ≠ 容量 |`——PERF_api 格 gap 批注「X10≠SLO」语义=X10 burst（16 并行越权 GET 全 404·X 族 proof `:293-309`）为**拒绝面稳定性行使·非延迟分位/容量 SLO 测量**→本刀补该缺口；④X33-ADV REQUEST §1.3 否决表「PERF 分面（矩阵 `:152`）| X10≠SLO·单机≠容量（批 A/B 同 veto）→ **留后刀**」在树——本刀=该后刀；⑤家族先例链三收据刀全在树（uc001 `:146`+case `:40` / #157 `:148`+case `:62`/`:75`/`:87` / PERF2 `:149`/`:151`+case `:98`/`:105`·REQUEST=`harness/perf2-REQUEST.md`）——本卷=同构续刀。

---

## §0 现状锚（起草席亲读·file:line+blob 逐条 rg/sed/Read/git hash-object 实测 @`c8f8effff`·**EXEC 立项照本节对届时 tip 再重 pin**——基线漂移如实改锚·结论不变则只更行号）

### 0.0 防重双对表 + 在飞交叠登记

- `git worktree list` 建后 **41** 树实测——`line/uc33p*` 恰 1 命中=本席分支；`ls ai-docs/delivery/harness/ | grep uc33p` 落卷前零命中→落卷后唯一同名卷=本卷。
- **家族零重叠亲证**：coverage-matrix §1.0.2 PERF_api 列四先例行逐行亲读=`:146`（UC-001·case-only 收据已落）/`:148`（UC-011/017/019·#157 三收据 additive 注记在树逐字亲读=三门 EXIT=0+「EXIT0=case≠covered · Ban 借 PERF 收据宣 NHP-PERF-API-SUITE 闭合（实例≠伞）」司法句）/`:149`（UC-004·PERF2 §1.4 Case 1+收口注记）/`:151`（UC-015·PERF2 §1.4 Case 2+收口注记）——**本卷认领 `:152`（UC-E2E-033·gap（X10≠SLO））·与 `:146`/`:148`/`:149`/`:151` 四行位、case-matrix 六既有 PERF 行、命令面（`uc001|uc011|uc017|uc019|uc004|uc015:nhp-perf-api:prove` 六门 vs 本刀 `uc033:nhp-perf-api:prove`）两两不交·零重叠**。
- **在飞交叠复核规则（EXEC 立项日必做）**：本卷起草 turn 产品触面=0（恰 1 新 .md+两 policy 数值联动件）；EXEC 期触面=隔离 prove 新文件+runner 五位注册（`scripts/run-e2e-isolated.mjs` receipt sources/supported targets/isolatedCommand caps child/resource-caps 条件/**pre-migrate 名单零注册**）+root/api 两 package.json 注册行+egress manifest additive+双表行内改（coverage-matrix `:152` 格注记邻区+case-matrix `:115-:118` 邻区 additive 新行）+receipts 目录。届时对各在飞分支（`origin/line/*` 未并集合）执行 `git log -1 -- <触面文件>` 逐树逐件复核——**两 policy 脚本与 runner 注册区系高并线争用面**（#157/#162/#163/#164/#165/#174/#175 七度 dual-keep 先证·合并树取大/恰等步进沿常设预授权）·任一分支顶对任一触面存在 `c8f8effff` 之后新增提交→触停止条件「现场漂移」停手上报。

### 0.1 blob 锚表（`git hash-object` 亲算 @`c8f8effff`）

| 文件 | blob（8 hex·行数） | 关键行锚 |
|---|---|---|
| `ai-docs/delivery/e2e-requirement-coverage-matrix.md` | `9f482f71`（522 行） | **§1.0.2 `:152`=UC-E2E-033 PERF_api 格 `gap`（X10≠SLO）（本刀格·认领 cell·批注语义=X10 burst 拒绝面≠延迟分位 SLO）**·`:148` #157 三收据 additive 注记（先例行·零重叠凭证）·`:149`/`:151` PERF2 收口注记（先例行·零重叠凭证）·`:146` UC-001 case-only 先例（收据补账形）·§0.5 `:47-84` 强制列+列值词汇（`covered` 禁填）·§1.0.3 `:166` 双表同步令·`:130`（UC-033 §1.0.1 行·ADV 列 X33 收据注·**本刀零触**）·`:190`/`:275`（P1-7·**本刀零触**） |
| `ai-docs/delivery/non-happy-path-perf-load-case-matrix.md` | `150f6f9c`（216 行） | **`:115` NEG/`:116` ADV/`:117` BOUND（`partial`/`gap`(PERF)·X10「稳定拒；≠容量 SLO」）/`:118` FAULT 四行（§1.4 UC-033 区·`:110` 区头）——`:118` 行后=本刀 EXEC 期 additive 新行落点（NHP-033-PERF-api-01·落 `:119`）**·`:40` uc001 PERF 行（家族行形先例）·`:62`/`:75`/`:87` #157 三行·`:98`/`:105` PERF2 两行·`:150` NHP-PERF-API-SUITE 伞行（「历史数字不得当当前通过」·**零动**） |
| `apps/api/src/modules/interview/interview.service.ts` | `a8ae0d15`（918 行） | **`:94-96` beginInterviewCore 头注（「begin 端点（C 端练习·原路径）与 applications.start 合一事务共用本函数」）·`:102` 函数体·`:122` `pg_advisory_xact_lock(['begin',id])`·`:126` 状态机守卫（终态不可复活二次扣额）·`:255-256` `reserveEntitlement(c, owner, id, 'mock_interview', 1.0)`（预留 1.0·402 分码）·`:285` `enqueueInterviewJob(c, owner, id, 'start', startPayload, 0)`——全链零 fetch 零 client 零模型零队列外呼亲证（rg MODEL_BASE_URL/invokeModel/callModel 零命中）** |
| `apps/api/src/modules/interview/interview.controller.ts` | `d10db4ae`（280 行） | **`:21`「开始面试:扣额度 + 入队 start job(长编排在 worker 跑,api 薄)。202 已受理」注释钉·`:28-30` `@Post(':id/begin')` + `@HttpCode(202)` + begin(principal,id,@Headers('resume-id'),reqId,quizId,targetRole,focus)·`:162-165` `@Post()` create（200 空壳 created·begin 才扣额度跑图）** |
| `packages/db/src/routing/candidate-route.ts` | `20fcae6a`（137 行） | **`:37`「派生输入 = 简历解密原文（owner-scoped；零外发零模型）；输出只有 leaf + sha256 digest」注释钉·`:39` supplyCandidateProfileRoute（begin 事务内同步供给·幂等回读+decryptResumeBlob+classifyCandidateProfileByRule 纯规则·undecided→409 `candidate_route_undecided` fail-closed）——begin 链 route 供给零模型第二亲证** |
| `packages/db/src/interview/interview-jobs.ts` | `7401cc04`（401 行） | **`:25` `MAX_INTERVIEW_PER_OWNER_QUEUED = 3`（per-owner queued 背压闸·超→429 `interview_queue_saturated`·本刀每虚拟用户恰 1 begin=depth 1≤3 不触发·如实注记入收据）·`:32` enqueueInterviewJob（幂等键 owner+interview+kind+seq）·`:96` 纯 INSERT interview_job** |
| `apps/api/src/modules/resume/resume.service.ts` | `952482e5`（327 行） | `:201` upload 文本口·`:211` NUL 剥除·**:213-214 consent 门（`SELECT 1 FROM consent_record WHERE purpose='resume_processing' LIMIT 1` 全局存在性谓词+403 `consent_required`）**·`:218` completeIngestion(ingestResume(text))（@meetwise/domain 纯解析器零模型）——consent 前置语义=产品路径 POST consent 逐虚拟用户（测量窗外·门=全局谓词·Ban 申明 per-user 隔离·PERF2 rev r1 OBS 同族承登） |
| `apps/api/src/modules/privacy/privacy.controller.ts` | `0a85debb`（72 行） | `:15` `@Post('consent')`（purpose 缺省 'resume_processing'）——consent 前置产品路径 |
| `apps/api/src/modules/commerce/commerce.controller.ts` | `6eaf29b7`（95 行） | `:63` `@Get('entitlement')`（wallet 钉口·200 `availableUnits`）——预留可见读回嘴（uc011 PERF 链③同形） |
| `apps/api/test/uc-e2e-001-nhp-perf-api.proof.ts` | `977e0d01`（300 行） | 家族先例形全文件：`:14-17` consent 产品路径逐虚拟用户窗外+桶种子豁免①具名·`:52` PERF 常量（N=100 c=10·250/750/1500/0.5%）·`:120-123` live-key in-process self-delete·`:134-139` 0121 pgp ACL 重放·`:149-154` 桶种子 INSERT paid 3.0·`:160-167` AbortController 缝（aborted 检于 `await p` 后·**本刀 timeout 硬顶修正令对照锚**）·`:244-248` 零 drain/零模型断言 |
| `apps/api/test/uc-e2e-011-nhp-perf-api.proof.ts` | `e6677456`（427 行） | **begin 主链 PERF 先例（#157·boot 世界）**：begin 链夹具 preamble（0064/0049 绑定触发器终态形+0142 重放+0206/0058 twin ACL GRANT·harness sql/01 重建 app_role 抹 ACL 教训承登 PIN 行）·prep=POST /interview（reused=false）+route 预供给回读臂+桶种子·测量窗=begin 202→abandon→entitlement——**本刀窗形差异=无 abandon（残队形·见 §1.4 防互洗）** |
| `apps/api/test/uc-e2e-015-nhp-perf-api.proof.ts` | （blob EXEC 立项日重 pin） | **timeout 硬顶 rev r2 修正形**：`:202-219` proof-local fetch `signal: ac.signal` 直入 fetch init + wrapper 级 wall-cap race 兜底（`_neg-harness` 助手无 signal 形参不可达·uc001 `:160-167` 缝不复发）——本刀 timeout 硬顶承此形 |
| `apps/api/test/uc-e2e-033-nhp-adv.proof.ts` | `ecbf39af`（580 行） | 同 UC 先例（61 断言双 fresh·X33-ADV 卷）·**:302-316 PC 臂=A 产品 begin 真预留（interview begin 产品口 202 accepted+jobId·consumption reserved 1 行+桶 5.0−1.0=4.0·job payload requestId）——本刀主链嘴同款同形在树旁证**·`:66-:68`/`:71-:98`/`:101-:126`/`:130-:243` 壳内 additive 重放族（0121+0058/0206 twin ACL+begin 链面五列/v64/0049/0142+0154+0189）——本刀取其 0121+begin 链面+0206/0058 三族·**0154/0189 两族零触**（无 signup 签名臂无广播臂） |
| `apps/api/test/uc-e2e-033-cross-user-authz.proof.ts` | `aedb88d2`（345 行） | X10 `:293-309`（16 并行越权 GET 全 404=「X10≠SLO」批注对象·**本刀零触只读**·两形状互不替代）·X1-X9/X11/W1 零触 |
| `ai-docs/delivery/harness/x33-adv-REQUEST.md` | `d277e817`（205 行） | §1.3 否决表「PERF 分面（矩阵 `:152`）| X10≠SLO·单机≠容量（批 A/B 同 veto）→ **留后刀**」——本刀立项出处④ |
| `scripts/run-e2e-isolated.mjs` | `7e13321e`（4340 行） | **`:1094-:1160` PERF receipt sources 六键（uc001/011/017/019/004/015·EXEC 期 additive 第七键）·`:2849-:2862` supported targets PERF 区（additive 一行）·`:3146` `PERF_API_CAPS_CHILD_SRC` 单源·`:3226-:3230` 五 const（EXEC 期 additive `UC033_PERF_API_CAPS_CHILD` 第六 const·参数化复用零触既有）·`:3311-:3323` isolatedCommand caps child 分派（additive 一支）·`:4174-:4177` resourceCapArgs 条件（additive 一 target）·`:4212-:4218` #157 boot 世界 world 选择承登注记（本刀同族：pre-migrate 名单零注册）** |
| `scripts/ai-docs/public-text-policy.mjs` | `bf267242`（541 行） | **`:243` `MAX_FILES = 2_439`（cap 亲证·届值=X17-ADV 收官并线 CAP-SANCTION-2439 步进）——本卷起草 +1=2440 必越→CAP-SANCTION-2440 起草随刀恰等步进（§2-1）** |
| `scripts/ai-docs/public-text-policy.proof.mjs` | `68d01b39`（457 行） | **四联动点亲点=`:428`（`i < 2_439`）·`:435`（`atCap.scannedFiles, 2_439`）·`:438`（`'ai-docs/f-2439.md'`）·`:441`（`FILE_LIMIT}:2440`）——随 CAP-SANCTION-2440 恰等改 2_440/f-2440.md/:2441** |
| `ai-docs/architecture/ai/provider-egress-inventory.json` | （EXEC 立项日重 pin） | `environmentReferences`=**392**（届值亲点·perf2 EXEC 390+后刀 additive 2）——EXEC 期 +2（MODEL_API_KEY/MODEL_BASE_URL × 本 proof·class=test-isolation·沿 uc001-015 六 PERF 先例形）→ 394 恰等 |

### 0.2 认领 cell 登记（行号+用例名+现值·§1.0.2/§1.4 亲读逐字）

| 行号 | 用例 | 现值（亲读） | 本刀补收据靶 |
|---|---|---|---|
| **matrix §1.0.2 `:152`** | **UC-E2E-033（越权）** | PERF_api=**gap**（X10≠SLO）·PERF_web=blind·LOAD_worker=blind·读法「burst ≠ 容量」 | NHP-033-PERF-api-01 合法用户 begin 链延迟分位 PERF 收据（case-matrix §1.4 additive 新行·格 **additive 注记**·格值 **gap 保持零翻面**·沿 `:148` #157 同形注记·「NHP 矩阵侧 blind→case-only 措辞」）·**本行 PERF_web/LOAD_worker 两列零交涉**（分面互不替代） |
| **case-matrix `:115-:118`** | NHP-033-NEG/ADV/BOUND/FAULT 四行 | partial / partial（未齐）/ partial·gap(PERF) / blind→case-only | **四行零触**；EXEC 期 `:118` FAULT 行后 additive 新一行=NHP-033-PERF-api-01（落 `:119`·§1.4 区内）·BOUND 行「gap(PERF)」批注由本收据供证**该行措辞零改**（X10 拒绝面仍归 BOUND·Ban 互洗 §1.4） |
| matrix `:130` / `:190` / `:275` | §1.0.1 行 / §2 执行行 / P1-7 | 四列 partial（X33 ADV 收据注在卷） | **零触**（七类/WORKER-LIVE/FULL-E2E 与 PERF 分面 reason 级可分·翻面权归协调方） |

---

## §1 红事实（机制链·全部亲证 @`c8f8effff`·「与 X 一致」≠「X 已证」措辞纪律全卷适用）

### 1.1 UC-033 PERF_api 面读·零模型面核（本卷停止条件第一核·**亲证通过**）

- **主链嘴（测量窗冻结·合法用户 begin 链同步面）**：`POST /interview/:id/begin`（controller `:28-30`·`@HttpCode(202)`·resume-id header）→ `beginInterviewCore`（service `:102`）：advisory 锁（`:122`）→状态机守卫（`:126` 终态不可复活）→隐私围栏（`assertInterviewPrivacyActive` owner 谓词）→resume 绑定（owned∧ingested CHECK 触发器承载）→`reserveEntitlement(owner, id, 'mock_interview', 1.0)`（`:256`）→`supplyCandidateProfileRoute`（candidate-route.ts `:39`·**「零外发零模型」注释钉 `:37`**·decrypt+纯规则 classify+sha256 digest·进程内）→`enqueueInterviewJob('start')`（`:285`·纯 INSERT `interview-jobs.ts:96`）→202 `{accepted:true, jobId}`。**测量窗第二嘴**：`GET /commerce/entitlement`（commerce.controller `:63`·200 `availableUnits`=种子−1.0 预留可见·uc011 PERF 链③ wallet 钉口同形）。
- **零模型判定（停止条件「主链含模型外呼无法 keyless」核）**：begin 全链（守卫/绑定/扣额/route 供给/入队）**零 fetch 零模型 client 零 provider egress**（rg `MODEL_BASE_URL|invokeModel|callModel|modelClient` 于 interview.service.ts/candidate-route.ts/interview-jobs.ts 零命中亲证）；模型工=worker 侧 start job 长编排（controller `:21` 注释钉「长编排在 worker 跑,api 薄」）·隔离壳内零 worker 启动=零 drain。**主链 keyless 成立·停止条件不触发**（EXEC 期实测推翻即红停·§8 专项）。
- **背压闸披露**：`MAX_INTERVIEW_PER_OWNER_QUEUED=3`（interview-jobs.ts `:25`·超→429 `interview_queue_saturated`）——本刀每虚拟用户恰 1 begin → per-owner queued depth=1≤3·429 不触发·如实注记入收据（防 EXEC 期误判授权红）。
- **X10 批注语义亲点**：X 族 proof `:293-309` X10=8 path×2 fan-out≈**16 并行越权 GET** all-404——拒绝面稳定性行使·**零延迟分位零负载参数零 SLO 阈值**→matrix `:152`「X10≠SLO」批注实证·本刀补=**合法用户（授权正臂）begin 链**延迟分位·与 X10 越权负臂 reason 级可分（正/负两臂共用同一授权面 RLS/围栏路径）。

### 1.2 窗外 prep（逐虚拟用户·测量窗外不计入分位·豁免逐项具名）

1. **consent 前置（沿 uc001 PERF-api 先例）**：产品路径 `POST /privacy/consent`（200·purpose='resume_processing'·privacy.controller `:15`）——**门语义如实注记**：consent 门=`resume.service.ts:213` purpose 全局存在性谓词（无 principal/owner 限定·任一用户 consent 行满足全体）→本刀行使形=逐虚拟用户经产品路径 POST consent（先例同构）·**收据措辞 Ban 申明「consent per-user 隔离」**（PERF2 §1.2 rev r1 OBS 同族承登）。
2. **resume 产品路径（X33 adv 夹具形·SEED_FAIL 即红）**：`POST /resume`（text 唯一后缀防 dedup 混叠·200 `{resumeId,status:'ingested'}`·owned∧ingested·consent 门被真实行使·0121 pgp ACL 重放=harness 面既有链重放·uc001 `:134-139`/x33-adv ① 同形·零产品码触零新迁移）。
3. **interview 壳产品嘴（X33 E3 B3 臂同款·uc011 prep 同形）**：`POST /interview`（200 `{interviewId}`·`reused=false` 断言·0206/0058 twin ACL 重放承载 create 复用查询 `interview_privacy_active_read` app_role 执行面·uc011 `:196-:204`/x33-adv ①b①c 同族）。
4. **桶种子（豁免①具名·uc001 `:149-154` 先例形）**：`INSERT INTO entitlement_bucket(owner_user_id, kind, units_total, expires_at) VALUES ( principal, 'paid', 3.0, now()+'300 days')`——begin 预留 1.0 预算·**Ban 裸 INSERT 绕产品路径=仅限窗外 prep 面·测量窗全产品 HTTP**。零 signup 主体（harness h.U() dev-header 字符串 principal·uc001 虚拟用户同形）→**0154 trial/0189 广播两重放族零触**（x33-adv 五族取三·§0.1）。
- route 供给=begin 事务内真实 classify 面（产品 resume 原文解密+纯规则·零模型）——**≠uc011 route 预供给回读臂形**（彼=夹具 resume 无 blob·须预供给幂等回读避解密；本=产品 blob 真行使）·差异如实入收据。

### 1.3 否决面（三否决·本席起草适用·EXEC 期同纹·命中即停）

1. **Ban invent covered**：proof EXIT=0 仅=case 证据；`:152` 格措辞只允许 gap→`case-only` 措辞注记（**格值 gap 保持零翻面**）·case-matrix 新行 blind→case-only 措辞·**禁止升 covered/partial**·`coveredCount=8` 零翻转·covered/SEVEN-CLASS 翻面权归协调方。
2. **Ban live key**：零 `MODEL_API_KEY` 加载/伪造·零 live 外呼·无 Key 面（`e2e:isolated`/`full.e2e`）=blocked 如实登记永不硬跑·est live=0（§6）。
3. **Ban retry-to-green**：任一门红即停如实登记·attempts 台账逐次留痕·禁红后重跑冲销·禁改既有断言凑绿。

### 1.4 修法裁决：**恰一格补 PERF_api 延迟分位收据（一刀一格·docs+test-only·零产品码触·沿 #157/PERF2 同构形）**

- **Case = `NHP-033-PERF-api-01`**（`apps/api/test/uc-e2e-033-nhp-perf-api.proof.ts` 新文件·独立建·**零触 uc033 既有两 proof**（cross-user-authz `aedb88d2`/nhp-adv `ecbf39af` 零改零借臂））：主链嘴=§1.1 冻结链（窗外 prep 四件→POST `/interview/:id/begin` 202→GET `/commerce/entitlement` 200 预留可见）·参数=N=100 c=10 warmup=10 excluded runs=3 all-must-pass（**warmup 10 excluded 逐字·沿 uc001 `:7` 先例嘴·预热样本不计入分位**）·五值=p50≤250ms/p95≤750ms/p99≤1500ms/max（观测值披露）/error_rate≤0.5% · nearest-rank client-hrtime · timeout 10s=error（**硬顶（PERF2 P2-2 修正后形）：proof-local fetch `signal: ac.signal` 直入 fetch init + wrapper 级 wall-cap race 兜底（`h.base` 直 fetch·`_neg-harness` post/req 无 signal 形参不可达·uc001 `:160-167` 缝不复发**）· caps Docker 双容器 2cpu/4GiB（NanoCpus=2e9/Memory=4GiB·HostConfig inspect 亲证入收据·`UC033_PERF_API_CAPS_CHILD = PERF_API_CAPS_CHILD_SRC('uc033', 'test/uc-e2e-033-nhp-perf-api.proof.ts')` 参数化复用·零触既有五 const·wrapper 运行时内联落 `.tmp/uc033-perf-api-receipts/`）· 断言形≈10（ISO×3 key self-delete/still-unset-after-boot/caps enforced + PERF×5 五值三 runs + N×2 interview_job **`status='queued'` 限定** count 恰数=runs×(N+warmup) 承载零 drain（PERF2 rev r1 修正形·bare count 不承载滞队义）+ai_model_invocation=0）· live-key in-process self-delete（uc001 `:120-123` R6 同形）。
- **注册=boot 世界（沿 #157 三先例/uc011/uc015 同族形）**：runner 五位 additive——receipt sources 第七键+supported targets 一行+isolatedCommand caps child 一支+resourceCapArgs 条件一 target+**pre-migrate 名单零注册**（boot 世界·world 选择承登注记随行沿 runner `:4212-:4218` #157 同族：本 proof begin 链隐私栅栏函数面在 boot 侧 virgin 世界由 boot() 新立=零 definer 断供面·proof 内 0206/0058/0121 ACL 重放块承载 app_role 执行面）·root package.json ×2 行（`uc033:nhp-perf-api:prove`/`:prove:raw`）+api package.json ×1 行（`prove:uc033-nhp-perf-api`）。
- **壳内 additive 重放族（真相=迁移链·逐项具名入收据·零产品码触零新迁移）**：①0121 pgp ACL（产品 /resume blob 加密行使）；②begin 链面补齐（interview `resume_privacy_epoch`/`application_attempt` 列+interview_job v64 约束+`ck_interview_application_binding_complete`+0049 绑定触发器终态形+0142 迁移重放·uc011 preamble 逐族同形）；③0206/0058 twin ACL 重放（create/begin 隐私栅栏函数 app_role GRANT）。**EXEC 期若红=42501 definer 族→harness 面 ACL 缝如实留痕非机制红**（#157「红留痕承登=0206 函数 ACL」coverage-matrix `:148` 同族·attempts 台账逐次留痕）。
- **与 uc011 收据防互洗（形状 reason 级可分）**：uc011 链=begin→abandon→entitlement **净零循环**（released 回补·零 consent 触点·夹具 resume INSERT+route 预供给回读臂·钱生命周期面）；本链=begin→entitlement **残队形**（零 abandon·job 滞队 queued 恰数·consent/resume/create 产品路径全链·route 真实 classify 面·越权面合法用户正臂）——两收据形状/链嘴数/终点态三重可分·**Ban 互借互洗**。
- **双表 additive（§1.0.3 `:166` 双表同步令）**：case-matrix §1.4 `:118` FAULT 行后 additive 新一行（NHP-033-PERF-api-01·旗=**blind→case-only**（executed·EXIT0=case≠covered）措辞·沿 `:75`/`:87` #157 行形）· coverage-matrix `:152` 格 **additive 注记**（格值 gap 保持·「NHP 矩阵侧 blind→case-only 措辞」沿 `:148` 同形·格值零翻面）·BOUND 行 `:117`「gap(PERF)」批注供证但**措辞零改**。
- **防洗句（沿 `:148` uc017 司法句逐字镜像）**：「**Ban 借 PERF 收据宣 PERF SLO/生产容量/HA/线上 SLO**」「**EXIT0=case≠covered**」「**Ban 借本收据宣 NHP-PERF-API-SUITE 闭合（实例≠伞·伞行 `:150` 零动）**」· UC-033 专属：「**Ban 借本收据冒充 NHP-033-BOUND-01 X10 burst 收据**（X10=16 并行越权 GET 拒绝面·本收据=合法用户 begin 链延迟分位·两形状互不替代）」「**Ban 与 NHP-033-ADV-01 写竞态收据互洗**（并臂竞态格≠延迟分位）」「**Ban 与 NHP-011-PERF-api-01 收据互洗**（净零循环≠残队形）」「**Ban 借本收据宣七类已齐/SEVEN-CLASS 翻面/`GAP-UC033-WORKER-LIVE`/`GAP-UC033-FULL-E2E` 收口**（本收据=PERF 分面·七类/live worker/full.e2e 缺口原样保留·harness §1b 清单零动）」。
- **收据面**：tracked gate stdout log=`ai-docs/delivery/receipts/nhp-033-perf-api/`（01-gate-uc033 log·`.log` ∈非扫描扩展名不计 cap·沿家族先形）+ `.tmp/uc033-perf-api-receipts/`（perf-receipt.json+_caps-evidence.json+_caps-child.source.mjs·.tmp 非扫描面）。

## §2 验收断言（pre-exec 双审核对单基面·起草门本 commit 适用+EXEC 预基面届时重 pin·**数字口径以实跑实测为准·熔断阈值即停止条件「验收红不可修」触发面**）

1. **docs:check（红停条款）**：`node scripts/ai-docs/check-docs.mjs` EXIT=0·scanned ≤cap（**届值 2439=cap 2439 恰等零余量亲证**+本卷 harness/uc33p-REQUEST.md 受管 1 件=2440 必超→**CAP-SANCTION-2440 起草随刀恰等步进 cap 2439→2440 随本 commit**（协调方派单预授权「越限沿常设预授权恰等步进」随令·+1 恰等零多放·沿 perf2 CAP-SANCTION-2433 起草随刀单件恰等先例形·四联动点=policy `.mjs` `:243` `MAX_FILES = 2_440`+CAP-SANCTION-2440 注记+proof `.mjs` `:428` `i < 2_440`/`:435` `scannedFiles 2_440`/`:438` `f-2440.md`/`:441` 越限错误码 `PTP_FILE_LIMIT:2441` 恰等改·计数预算非内容策略·越限臂 fabricated 数随 cap 联动同步·语义不变强度不减）·终态 scanned **2440=cap 2440 恰等**；**EXEC 期 +1 proof 届值预登=2441**（若另有 `.txt` 收据件∈TEXT_EXTENSIONS 如实加算·越限沿常设预授权恰等步进·届时实测 scanned 取算）·cap 上抬权归协调方）。
2. **PTP proof 联动（cap 步进自证）**：`pnpm public-text-policy:prove` **EXIT=0 12/12**（四联动点恰等改后·越限臂断言形状不变强度不减）。
3. **markers 五类零命中**：本刀改动集新增行五类标记词+行首冲突标记 grep 零命中（词族沿 `i6-239-gates.proof.mjs` 门口径·词面运行时组装·不复抄卷内防自指·命令与回执入 EXEC 收据）。
4. **diff 面机检**：起草 commit `git diff --numstat <base>` **恰 3 tracked 路径**=本卷 .md+两 policy 联动件（多任何 tracked 路径即停）；EXEC 期 diff 面=本卷+新 proof+runner 五位+两 package.json+egress manifest+双表行内改+receipts .log（届时逐件登记）。
5. **est live=0**：零实跑零模型外呼零 Key 加载（§6）。
6. **EXEC 预基面（届时重 pin）**：`pnpm uc033:nhp-perf-api:prove` EXIT=0 **双 fresh**（实现方恰一次+独立复验恰一次·attempts 台账含红次如实）· 五值三 runs 达标+caps enforced 收据四件套在卷 · **timeout 硬顶核**：proof-local fetch 接 `AbortSignal`+wrapper wall-cap race 在卷（uc001 `:160-167` 缝不复发）· **零 drain 断言核**：interview_job `status='queued'` 限定 count 恰数+ai_model_invocation=0 · **背压闸注记核**：per-owner depth=1≤3 无 429 在卷 · 邻面不回退（`uc033:nhp-adv:prove`/`uc033:cross-user-authz:prove`/`uc011:nhp-perf-api:prove`/`uc015:nhp-perf-api:prove` 先例门复跑恒等绿·按届时 SSOT 口径）· typecheck/lint 按届时五值恰等口径（.mjs 改动零 warning 增量）· 双表 additive 逐件登记 · 任一门红→§8 停止条件。

## §3 范围外（边界清单·越界即 FAIL）

1. **产品码面零触**：`apps/`、`packages/` 产品源零 diff（EXEC 期仅新增 test proof 文件+注册行·沿 uc001/uc011/uc017/uc019/uc004/uc015 六先例 prove-only 形）。
2. **UC-033 既有 case 面零触**：`uc-e2e-033-cross-user-authz.proof.ts`（X1–X11/W1·X10 零触只读）+`uc-e2e-033-nhp-adv.proof.ts`（三臂族）+`harness/uc-e2e-033-cross-user-authz.md`（§1b 清单）+eval 引用面零触只读（其收据与本刀零互证零互洗）。
3. **家族先例零触**：#157 三实例（coverage-matrix `:148` 行+case `:62`/`:75`/`:87` 三行+三 proof+三注册位）与 PERF2 两实例（`:149`/`:151` 两格+case `:98`/`:105` 两行+两 proof）零触只读；`NHP-PERF-API-SUITE` 伞行 `:150` 零动（实例≠伞·评估权归后继刀）。
4. **共享 SSOT 零改**：REMAINING-NORTH-STAR-QUEUE / product-campaign-LEDGER / execution-master-checklist / gap-bug-backlog / e2e-covered-path-backlog 只读引用——翻面权归协调方。
5. **covered/queue 翻面零预支**：本刀收据不构成 covered 抬升·Ban 预写翻面措辞·`coveredCount=8` 零动·SEVEN-CLASS/WORKER-LIVE/FULL-E2E 缺口零预支收口。
6. **零迁移零配置**：Ban 新迁移（0121/0142 重放系 harness 面既有链重放非新迁移）Ban 触告警/CI 配置（越界即停）。

## §4 依赖

**①上游已满足**：PERF_api 家族先例形全链在树（uc001/#157/PERF2 七 proof+注册+收据+双表注记）+ 同 UC 两 proof 在树（X33 adv PC begin 真预留臂=本刀主链嘴同款在树旁证 `ecbf39af:302-316`）+ runner `PERF_API_CAPS_CHILD_SRC` 单源在树 + X33-ADV §1.3「PERF 留后刀」否决登记在树。**②无同文件并发**：起草 turn 恰 3 tracked 零交涉面；EXEC 期触双表 `:152` 格/§1.4 `:115-:118` 邻区+runner 注册区+两 policy——§0.0 在飞交叠复核必做（两 policy/runner 系高并线争用面·七度 dual-keep 先证）。**③下游**：本格收据供 NHP-PERF-API-SUITE 伞行评估族引用（实例≠伞·评估权归后继刀·本刀 Ban 代评）；BOUND 行 gap(PERF) 批注供证（措辞零改权归协调方）。

## §5 Ban 列表 + pins

**Ban 列表**：Ban push/force-push（git 写只本 worktree commit）；Ban 自批（pre-exec 双审两独立外席·alone≠dual 不代签）；Ban retry-to-green（§1.3-③）；Ban invent covered（§1.3-①·含升格 partial/借旁证 wash/七类宣齐/SEVEN-CLASS 自翻）；Ban live key（§1.3-②·含伪造 Key 面/硬跑 blocked 面）；Ban 触 #157/PERF2 先例面与 uc033 既有两 proof/harness §1b（§3-2/§3-3）；Ban 触产品码面/迁移/CI 告警配置（§3-1/§3-6）；Ban 改共享 SSOT（§3-4）；Ban 改既有 proof 断言（本刀 prove 全独立新文件·零增臂零复用既有壳内断言）；Ban 触其他工作树；Ban 伪造已读/已验来源（§0 锚全亲证为本卷前提）；Ban 造 .env*/写 Key 值入树入据；Ban 顺带升级依赖包；Ban 就地归因门矩阵外新红（若现新红→如实登记升级·Ban 借机修）；Ban 裸 INSERT 绕产品路径（豁免=窗外 prep 逐项具名：桶种子①+壳内 additive DDL 重放族三件·测量窗全产品 HTTP·枚举外裸 INSERT 即违本 Ban·新增豁免须先回炉修订本卷）；Ban 借本收据宣 PERF SLO/生产容量/HA/线上 SLO/NHP-PERF-API-SUITE 闭合/X10 burst 收据/NHP-033-ADV-01 收据/NHP-011-PERF-api-01 收据/七类齐/WORKER-LIVE 收口/FULL-E2E 收口（§1.4 防洗句全类目）。

**pins（十一值照抄·零翻转）**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null。

## §6 est live=0（起草 turn·EXEC 期同）

- 起草 turn（本 commit）：est live=**0**——零实跑零模型外呼零 Key 加载·零生产操作·零 secrets·零消耗（EXEC 期全离线隔离 PG·零模型外呼·`ai_model_invocation=0` 硬断言随 proof·§2-5 承）。

## §7 markers=0（卫生声明）

本刀改动集（本卷 1 .md+两 policy 联动件·起草 turn）**五类标记词+行首冲突标记 grep 零命中**（起草席亲跑·回执随 EXEC 收据留痕·五类词面运行时组装口径·不复抄卷内防自匹配——沿 negbend/reconcile-retry/perf2 卷 §7 同形制）。

## §8 STOP（开工三条款 + 停止条件四类+一专项）

**STOP · `draft:awaiting_pre_exec_dual`**（起草落卷即停·本值三处钉：本节+Status 头+卷尾注·同值零漂·**alone≠dual**·Dual PASS ≠ 开工（PASS 只过审·开工须协调方明示授权——committed SHA 重钉）·EXEC commit 不预 claim post-prove-dual EXIT。） 开工三条款：①pre-exec 双审两外席 **BOTH PASS 落卷**；②**协调方明示 EXEC 授权**（committed SHA 重钉+越限恰等步进预授权随令）；③EXEC 立项**不得改 §1.4 修法面与 §5 Ban/pins 与 §1.3 三否决**（改则回炉重审）·立项时照 §0 协议对届时 tip 全量重 pin（行号漂移如实改锚·结论不变只更行号·§0.0 在飞交叠复核必做）。**停止条件（四类+一专项·命中即停手上报·Ban 就地处置）**：
- **主链模型外呼（专项·派单令指定红停面）**：EXEC 期实测主链任一嘴现真模型外呼（`ai_model_invocation>0`/provider egress/decrypt 链外呼）→ 起草面「零模型 keyless」诊断被证伪 → **红停如实上报协调方**（起草席 §1.1 面核亲证零外呼为前提·届时复证推翻即停·Ban 就地改断言凑 keyless）。
- **现场漂移**：届时 tip 对 §0.1 任一锚 blob/机制漂移且结论受疑（`:152` 格被他刀改写·begin 链 reserve/route 供给/入队语义变·consent 门/背压闸值变·在飞线对触面新增提交）→停·重 pin 回炉。
- **机制不满足**：proof 落卷后断言与 §1 红事实推定形不符（begin 非 202·entitlement 读回非预留值·route 供给 409 `candidate_route_undecided` 种子齐仍红）→根因诊断被证伪→停·如实升级协调方回炉（Ban 就地改诊断 Ban 凑绿）。**边缘精化（防机制面误停）**：0121/0206/0058 ACL 重放族红（42501 definer 族）=harness 面 ACL 缝（#157「红留痕承登=0206 函数 ACL」同族·harness 面修正非机制红·attempts 台账逐次留痕）；402 `insufficient_entitlement`=窗外桶种子序错（harness 面·沿 uc019 prep 红次先例·修正种子序非机制红）；429 `interview_queue_saturated`=链形违本卷冻结（每用户恰 1 begin）非产品红·如实回炉。
- **越界需要**：修法诉求超出 §1.4 恰一子刀面（需触产品码/uc033 既有 proof/家族先例面/covered 翻面/共享 SSOT/迁移/告警配置）→停·另刀或协调方裁决（Ban 就地扩面）。
- **验收红不可修**：§2 任一门红且根因不在本刀交付面（docs:check 超 cap/邻套件新红/typecheck/lint 超）→停·stash 对照亲证基线·如实登记（Ban 借机修）。

---

*UC33P REQUEST · 2026-10-26 起草落卷 · **STOP=`draft:awaiting_pre_exec_dual`**（三处钉：Status 行+§8+本行·同值·pre-exec 双审两独立外席待派·alone≠dual·Ban self-approve）· UC-033 PERF_api（X10≠SLO）残格刀（总盘 P2 小刀·协调方派单·沿 PERF_api 家族形·先例链 uc001 `:146` → #157 三实例 `:148` → PERF2 双实例 `:149`/`:151`·家族零重叠亲证在 §0.0）· 认领=m§1.0.2 `:152` UC-E2E-033 PERF_api 格 gap（X10≠SLO）+case-matrix §1.4 `:118` 后 additive 新行（NHP-033-PERF-api-01·落 `:119`）· 修法=一格补 PERF_api 延迟分位收据（`uc033:nhp-perf-api:prove`·主链嘴=合法用户 begin 链：窗外 prep consent/resume/interview create 产品路径+桶种子豁免①→POST `/interview/:id/begin` 202→GET `/commerce/entitlement` 200 预留可见·boot 世界·pre-migrate 名单零注册承登）· 参数冻结 N=100 c=10 warmup=10 excluded runs=3 五值 250/750/1500/0.5% max 观测披露 nearest-rank timeout 10s 硬顶（proof-local AbortSignal 入 fetch+wrapper wall-cap race·PERF2 P2-2 修正后形）caps Docker 双容器 2cpu/4GiB · 主链 keyless 亲证（beginInterviewCore 守卫→reserve 1.0→route 供给零外发零模型钉→入队纯 INSERT·模型工=worker 侧零 drain·**停止条件「主链含模型外呼无法 keyless」不触发**）· X10≠SLO 批注语义=越权 GET burst 拒绝面≠延迟分位（X 族 `:293-309` 零触）· §1.3 三否决（Ban invent covered/Ban live key/Ban retry-to-green）· 防洗句沿 `:148` uc017 司法句+UC-033 专属五类 · 双表 additive 沿 §1.0.3 `:166` 同步令·格值 gap 保持零翻面·coveredCount=8 零动 · cap 预算核=届值 2439=cap 恰等零余量·起草 +1 必越→**CAP-SANCTION-2440 起草随刀恰等步进 2439→2440**（四联动点恰等改随本 commit·沿 CAP-SANCTION-2433 先例形）·EXEC 期 +1 proof 预登 2441 · egress +2 预登（392→394·test-isolation 六先例形）· base=origin/main `c8f8effff`（#175 x17-adv 并线点）· 分支 `line/uc33p-draft` · 工作树 `meetwise-uc33p` · est live=0 · markers=0 · pins 十一值零翻 · ⛔push · pre-exec 双审两独立外席待派（窄域=本卷全节·alone≠dual·Ban self-approve）*
