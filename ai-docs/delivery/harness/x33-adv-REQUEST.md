# X33-ADV REQUEST — NHP-033-ADV-01 七类越权补集起草卷·case-matrix `:105`（UC-E2E-033 ADV 列·七类未齐残余）（docs-only REQUEST 卷·起草落卷即停）

**Status**: **`draft:awaiting_pre_exec_dual`**（起草落卷即停 · pre-exec 双审两独立外席待派 · alone≠dual · Ban self-approve）· **STOP=draft（三处钉：本 Status 行 + §8 + 卷尾）** · 本 commit 零产品码零 prove 落码（EXEC 期触面见 §2-3）· 本卷不预 claim 任何 covered 升格（EXIT0=case≠covered·coveredCount=8 零动）。

**席位**：NHP-033-ADV-01 七类补集起草席（docs-only 起草·协调方派·总盘派单序第 6 项·与 UC 专属线/批 A/B/C 已并线卷行级互斥）。
**基线**：`origin/main` @ **`d1a947e3d`**（full `d1a947e3dcc019b66816548adfd340b631bac9c4` · `git fetch origin` 本 turn 成功 · 分支 `line/x33-adv-draft` 零独有 commit · worktree `meetwise-x33`）· `node scripts/ai-docs/check-docs.mjs` 本树亲跑 **EXIT=0 · scanned 2409**（≤ cap 2409 恰等零余量 · §2-1 预算核）。
**必读清单（EXEC 立项前逐件亲读·显式路径）**：`AGENTS.md` → `ai-docs/delivery/e2e-covered-path-backlog.md`（`:49` 执行序第 6 项「UC-033 七类/worker 余项」）→ `ai-docs/delivery/e2e-requirement-coverage-matrix.md`（§0.5 `:47` 强制列 / §1.0.1 `:130` / §1.0.2 `:152` / §1.0.3 `:166` 双表同步令 / §3 `:275` P1-7）→ `ai-docs/delivery/non-happy-path-perf-load-case-matrix.md`（用例 SSOT `:104-:107`）→ `ai-docs/delivery/harness/uc-e2e-033-cross-user-authz.md`（§1b `:65` 七类未齐抬 covered 缺口）→ `ai-docs/requirements/use-cases/e2e-scenarios.md`（UC-033 `:425`）→ `ai-docs/requirements/use-case-conventions.md`（§4 `:54-59` 七类图例与硬规则）→ 既有 proof 家族 `apps/api/test/uc-e2e-033-cross-user-authz.proof.ts`（X1–X11/W1·零触只读）→ 隔离壳先例 `apps/api/test/uc-e2e-025-nhp-bound-isolated.proof.ts`（`07077d30`）。
**立项出处（不自建 SSOT 行——翻面权归协调方）**：①`non-happy-path-perf-load-case-matrix.md:105` **NHP-033-ADV-01**（「七类越权未齐补集 · 系统化矩阵 · **partial**（未齐）· harness §1b」·本 turn 亲读逐字）；②`e2e-covered-path-backlog.md:49` 执行序第 6 项；③`harness/uc-e2e-033-cross-user-authz.md:65` §1b 第 3 项（`GAP-UC033-SEVEN-CLASS`·系统化七类齐备缺口具名）；④既有 proof `:335` G-GAP pin 同钉；⑤协调方派单（总盘派单序第 6 项）。

---

## 认领核对 · 七类逐类对树亲点（本卷核心盘点 · 每类对 `uc-e2e-033-cross-user-authz.proof.ts` @`aedb88d2`（345 行）逐臂亲点·图例沿 `use-case-conventions.md:56`）

| 类 | 对树行使证据（file:line 亲点） | 判定 |
|---|---|---|
| **正**（正常） | 对照臂：X2 `:146-148`（userA list 见己 resume）· X7 `:207-208`（userA principal→IV_ACT 1 行）· X8 `:226-228`（userA export 含 IV_ACT）· W1 `:239-240`（userA→interview_job 1 行） | **已行使**（对照臂形） |
| **异**（异常/fail-closed） | X7 `:200-215`（无/错 principal→interview/resume/resume_quiz 0 行 fail-closed）· W1 `:233-237`（interview_job RLS 0 行）· X9 `:266-279`（event/report/entitlement/notification/career_path 五表 0 行） | **已行使** |
| **特**（特殊/边界/空） | X2 `:141-144`（list RLS 空集边界）· X11 `:311-328`（404 体零泄露边界·owner/内容摘要反断言） | **已行使** |
| **逃**（逃逸通道） | **零臂**——X11 `:327` 自钉「cache/trace 全路径仍 GAP」；harness `:50` 非目标行 `GAP-UC033-CACHE-TRACE`（缓存键/trace/批 job 全路径 principal 注入未系统化钉） | **缺臂** |
| **并**（高并发） | burst 子集=X10 `:293-309`（16 并行**只读 GET** all-404·`:308` 自钉「≠七类齐」）；**写路径竞态格零臂**（越权写∥属主 CAS 并发无专用格） | burst 已行使（归 BOUND 列 `:106`）· **竞态专用格缺臂** |
| **复**（复杂/跨聚合） | **零臂**——X 族无跨聚合专用格；邻刀 uc016 N3（`uc-e2e-016-nhp-neg.proof.ts:11`）系 own-shell bind 他人 resume 409 单口·UC-016 行 NEG 面·reason 级可分 | **缺臂** |
| **刁**（刁钻/对抗/注入） | X1–X6 `:118-197`（跨用户 begin/turn/assessment/report/events/transcript/abandon + resume + orders + quiz/diagnosis + B-C 跨线 + recruiter/admin role-gate）· X11 leak 反断言 | **已行使**（本 ADV 列主面） |

**结论**：七类四已行使（正/异/特/刁）· 三缺臂（**逃专用格 / 复跨聚合格 / 并竞态格**）——与 harness `:65` §1b 第 3 项及 proof `:335` G-GAP pin「高并发越权竞态/复杂跨聚合/逃逸通道专用格齐备」逐字互证。**补集=恰此三类 · 非零残余 → 入卷**。

---

## §0 现状锚（起草席亲读·file:line+blob 逐条 Read/git rev-parse 亲算 @`d1a947e3d`·**EXEC 立项照本节对届时 tip 再重 pin**——基线漂移如实改锚·结论不变则只更行号）

### 0.0 防重双对表 + 在飞交叠登记

- `git worktree list` 本 turn **34 树**实测——`line/x33-adv-draft` 恰 1 命中=本席；`ls ai-docs/delivery/harness/ | grep x33` 落卷前**零命中** → 落卷后唯一同名卷=本卷。
- **在飞交叠复核规则（EXEC 立项日必做）**：本卷起草 turn 产品触面=0（docs-only .md 1+policy 两 script 数值联动）；EXEC 期触面=隔离 prove 新文件+注册行（root/apps-api package.json）+runner 注册位（`scripts/run-e2e-isolated.mjs` 五位）+egress additive 登记+双表行内改（case-matrix `:105` 邻区+矩阵 `:130` 邻区）。届时对各在飞分支 `git log -1 -- <触面文件>` 逐树逐件复核，任一分支顶对任一触面存在 `d1a947e3d` 之后新增提交 → 触停止条件「现场漂移」停手上报。

### 0.1 blob 锚表（`git rev-parse <tip>:<path>` 亲算·8 hex）

| 文件 | blob（行数） | 关键行锚 |
|---|---|---|
| `ai-docs/delivery/non-happy-path-perf-load-case-matrix.md` | `c71bf78b`（204） | **`:105` NHP-033-ADV-01（partial（未齐）·本卷认领 cell）**·`:104` NEG（partial·X1–X11）·`:106` BOUND（X10）·`:107` FAULT（blind→case-only·W1≠闭环） |
| `ai-docs/delivery/e2e-requirement-coverage-matrix.md` | `28048fce` | §1.0.1 **`:130`**（UC-033 四列 partial·「七类未齐；W1≠闭环；X10≠容量 SLO」）·§1.0.2 `:152`（分面 PERF gap/blind×2·本卷零触）·§2 `:190`（执行行）·§3 `:275`（P1-7）·§1.0.3 `:166` 双表同步令 |
| `ai-docs/delivery/harness/uc-e2e-033-cross-user-authz.md` | `8a6aa3a3`（134） | **§1b `:65` 第 3 项（七类齐备缺口·`GAP-UC033-SEVEN-CLASS`）**·`:50`（CACHE-TRACE 非目标）·`:51`（高并发竞态非目标）·§3 `:109-110`（X10/X11 假绿标红行） |
| `apps/api/test/uc-e2e-033-cross-user-authz.proof.ts` | `aedb88d2`（345） | X1–X6 `:118-197` · X7 `:199-215` · X8 `:217-229` · W1 `:231-262` · X9 `:264-291` · X10 `:293-309` · X11 `:311-328` · **G-GAP `:330-341`（`:335` SEVEN-CLASS pin）** |
| `ai-docs/delivery/e2e-covered-path-backlog.md` | `05a76401` | `:49` 执行序第 6 项「UC-033 七类/worker 余项」 |
| `ai-docs/requirements/use-case-conventions.md` | `1a10368a` | §4 `:54-59` 七类图例（正/异/特/逃/并/复/刁）+「缺 逃逸通道/高并发/刁钻 任一即不合格」 |
| `ai-docs/requirements/use-cases/e2e-scenarios.md` | `9976f9c3` | UC-033 `:425`（A1–A4 验收·全路径注入 HTTP/worker/checkpointer/缓存键/trace/批 job·RLS 0 行→404） |
| `scripts/ai-docs/public-text-policy.mjs` | `96942dfc` | `:169` `MAX_FILES = 2_409`（cap 亲证 · §2-1 预算核）· `:111-:112` 注记栈顶（2406→2409） |
| `scripts/ai-docs/public-text-policy.proof.mjs` | `8ddccfb9` | 越限臂 `:372`（`i < 2_409`）· `:379`（atCap 2_409）· `:380-:382`（2410 注记+`f-2409.md`）· `:385`（`PTP_FILE_LIMIT:2410` deepEqual） |

### 0.2 码面锚（产品缝 · 按缺臂类分列 · 期望值逐条对码亲证 @`d1a947e3d`）

**Case 1 · 并·竞态格（越权写∥属主 CAS 并发专用格）**

| 锚 | blob（行数） | 钉位（期望值对码） |
|----|------------|------|
| `apps/api/src/modules/interview/interview.service.ts` | `a8ae0d15a`（918） | abandon `:644-668`：`:650` `pg_advisory_xact_lock(['abandon',id])` 折叠同端点 · `:651-652` RLS `SELECT status` 0 行→**404 `not_found_or_forbidden`** · `:658` `abandonInterviewAndRelease`（consumption 行 FOR UPDATE+条件状态 CAS·`:648-649` 注记亲读）· `:659` 返回 `{abandoned:true, released, alreadyAbandoned}`——B 并行越权 abandon 臂恒 404 且**永不触 `:658`**（owner=`requireOwnerUserId(principal)` `:646`=B 自身→RLS 0 行先行）；turn 守卫 `:453-457`（0 行→404 fail-closed） |
| `apps/api/src/modules/quiz/quiz.service.ts` | `98edbeb2`（140） | begin `:38` advisory `['quiz-begin',id]` 串行化 · `:39` RLS 0 行→**404 `not_found_or_forbidden`** · `:41-42` 幂等 alreadyBegun 同 jobId 零双扣——B 越权 begin 在锁后 0 行即出·A 自身并发 begin 单胜者（advisory 序）+二次 begin alreadyBegun |
| `apps/api/src/modules/diagnosis/diagnosis.service.ts` | `2c7c882e`（113） | begin `:35-36`（advisory+404 同构 quiz） |

**Case 2 · 复·跨聚合格（越权拒面×跨聚合账本零扰动）**

| 锚 | blob（行数） | 钉位（期望值对码） |
|----|------------|------|
| `apps/api/src/modules/quiz/quiz.service.ts` | `98edbeb2` | 跨聚合引用面 `:43-49`：resume `SELECT … WHERE id=$1 AND owner_user_id=$2 AND status='ingested'`（owner 谓词=resumeFilter）→ 他人 resume rowCount≠1 → **409 `resume_not_found_or_not_ready`**·零绑定（`:54-60` CAS `resume_id IS NULL` 守卫未达）·零消费（reserve `:60` 在 bind 后）·零 job 行（`:66` enqueue 未达） |
| `apps/api/src/modules/diagnosis/diagnosis.service.ts` | `2c7c882e` | `:45-47` 409 同构 · `:56` CAS · `:64` reserve 后置 |
| 账本审计面 | — | B 全口 sweep 后 DB 断言：consumption/entitlement_bucket/interview_job/notification/career_path/interview_event/ai_report 七聚合+**quiz_job/diagnosis_job 两表（quiz/diagnosis begin 写面直接落点——本刀 X1 越权 begin 零 job 行与臂族 1 begin 竞态的 DB 级对账面·缺此两表则 begin 写面审计漏底）** 九面 owner 恒 A·B 主体零行指向 A 聚合·A 行集合字节稳定（沿批 C N8 净账审计先例形） |

**Case 3 · 逃·逃逸通道格（缓存键/会话/trace·job 绑定）**

| 锚 | blob（行数） | 钉位（期望值对码） |
|----|------------|------|
| `apps/api/src/platform/principal.guard.ts` | `50b38bc58`（112） | statusCache `:31` **键=uid**（60s TTL）· `:35` evict 收播逐 uid · `:46-61` accountState 缓存读/回填代次 TOCTOU 守卫 · Bearer 臂 `:92-99`：`accountState` → `:94` `account_inactive`（禁用即时）· `:97-99` jti 会话查 `session_revoked` · **dev-header 臂 `:104-109` 绕过 statusCache**（`req.principal=user; return true`）→ 本格须走 **Bearer 产品口主体**（`tokenFor` Bearer 臂先例=X3 `:161` 同 proof 在树） |
| `packages/db/migrations/0189_api_harden_shared_state.sql` | — | `:13/:152` user_account UPDATE→`pg_notify('meetwise_principal_evict_v1',{t:'uid',k:NEW.id})` 同事务广播——A status 翻 disabled → A 下一请求 **401 `account_inactive`** 即时·B 缓存项不被 A 的 evict 冲刷（键=uid 逐主体·跨主体零窜扰） |
| `apps/api/src/platform/auth-session.ts` | `ad1004e76`（91） | sessionCache `:29` **键=jti** · `:73-84` isSessionActive fail-closed（行缺失→false）· `:56-66` revokeSession 同语句 CTE pg_notify+本地 evict——B logout 仅 evict B 己 jti·A 会话零扰（jti 键逐会话） |
| `apps/api/src/modules/auth/auth.controller.ts` | `dea7229f2`（37） | `:20-26` login 公开口 · `:29-35` logout 过 PrincipalGuard（吊销当前主体会话）——C2 臂经 **signup/login/logout 产品口**取 jti Bearer（非裸 signToken·harness `tokenFor` `9768b3238:26` 系无 jti legacy 形·如实登记） |
| trace·job 绑定面 | `a8ae0d15a` | `:418` reqId 随 payload 入队（trace.request_id 全链一跳）——B 授权臂产生 job 行 `owner_user_id=B` 恒成立+B 越权臂零 job 行+A 的 job payload reqId 不现于 B 行（W1 `:231-262` 系**读面** RLS 0 行+source pin·本臂系**写面绑定**·reason 级可分）；**live worker drain/checkpointer 不 claimed**（A3=`GAP-UC033-WORKER-LIVE`·FAULT 行 `:107` 域·本刀零触） |

### 0.3 认领 cell 登记（行号+用例名+现值·亲读逐字）

| 行号 | 用例名 | 现列值（亲读） | 本刀补 |
|---|---|---|---|
| **case-matrix `:105`** | **NHP-033-ADV-01** | **partial**（未齐）· 既有锚 harness §1b | **七类补集=逃/复/并竞态三臂族**（具名 case·新 proof 文件·partial 措辞保留+收据入账·EXIT0=case≠covered）；GAP-UC033-SEVEN-CLASS 翻面权归协调方 |
| 矩阵 `:130` | UC-E2E-033 | 四列 partial（「七类未齐」自钉） | ADV 列收据注 additive·其余三列零触 |
| 矩阵 `:152` / case-matrix `:104/:106/:107` | NEG/BOUND/FAULT/分面 | partial/partial/blind→case-only/gap·blind | **零触**（§1.3 逐项否决留痕） |

---

## §1 修法（恰 1 具名 case=`NHP-033-ADV-01` · 三臂族一 proof · 沿 uc015-nhp-adv/uc016-nhp-neg 先例形 · 零产品码触 · 零 invent covered · 零 live key）

**修法形状**：新 proof `apps/api/test/uc-e2e-033-nhp-adv.proof.ts`（隔离真 PG+Nest createApp+listen(0)+fetch 真 HTTP 三层壳·沿 `07077d30` 先例）+ apps/api package.json 注册行 + root package.json 双行（`:prove`/`:prove:raw`）+ runner 注册位（`scripts/run-e2e-isolated.mjs`：SOURCE_PATHS/allowlist/isolatedCommand/pre-migrate 名单——**四位全登记**·批 A 第四位+批 C 第五位教训承登）+ egress 环境引用登记（`ai-docs/architecture/ai/provider-egress-inventory.json` additive·新 proof×实际出现词名·class=test-isolation·沿 uc028 `10b920521`/批 C 先例形·漏登即 CI `environment_reference_unregistered` 红）· **prove-only · `apps/*/src`/`packages/*/src` 零 diff 意向**；isolated 真 PG · 零 MODEL_API_KEY · 零外呼；**既有 `uc-e2e-033-cross-user-authz.proof.ts` X 族+harness 零触**（X 族 G-GAP 五钉零洗——SEVEN-CLASS 翻面权归协调方·本刀收据供其评估非自翻）；收据 `.tmp/uc033-nhp-adv-receipts/` + tracked `ai-docs/delivery/receipts/uc033-nhp-adv/`（implementer pre-commit runs · not evidence of record）。行/列状态一字不动：EXIT0=case≠covered，coveredCount=8 不变。

### Case · `NHP-033-ADV-01`（UC-033 ADV 补集 · 三臂族）

- **需求源**：`e2e-scenarios.md:425`（UC-033「全路径注入（HTTP/worker/checkpointer/缓存键/trace/批 job）」+A1–A4）+ harness `:65` §1b 第 3 项三类缺口具名。
- **证据层**：isolated 真 PG+真 HTTP（三层壳）；C1/C2 子臂主体 **provenance 钉=signup 产品口新建主体**（真 `hashPassword` 哈希+`auth_user_session` jti 会话行·`dea7229f2:20-35` signup/login/logout 产品路径·非裸 token 夹具非假哈希行）；harness userA/userB 假哈希种子（`_neg-harness.ts:267-270` `'scrypt$x$y'` 字面·零 jti 会话行）**仅限越权臂 dev-header 主体**（X 族 `h.U()` 形·reason 级同源可分·不得充产品口臂主体）。
- **臂族 1（并·竞态格）**：PC=A 自身并发对照（**A 先真预留**——begin 产品口或沿 `uc-e2e-018-user-abandon-http` `reserveEntitlement` 库面同 CAS 种子形·无真预留则 abandon 走空壳支路 `released='noop'`（`commerce.ts:519`）·PC 断言失真；A 双 abandon 并行→恰一 `released` 真退·另臂 `alreadyAbandoned` `:659`·净账恰退一次=A 桶净 0 增量；A∥A begin quiz→单胜者+二次 alreadyBegun 同 jobId 恰 1 job 行 `:41-42`）；R1=B≥16 并行越权**写** mix（abandon/turn/begin ∥ A 自身 abandon/begin 交错）→ B 臂全 **404 `not_found_or_forbidden`**（`interview.service:651-652/:455-456`+`quiz.service:38-39`）·**期望按真实返回钉死**（沿 uc016 N7「期望按真实返回钉死」形·Ban 按想象码面断言）·**B turn 臂数上界=单进程令牌桶预算 ≤`TURN_RL.capacity`（30·`interview.service:33`）减余量**——超预算 turn 臂 429 `too_many_requests` 属预算语义非授权语义·断言分口·Ban 误判授权红；与 X10 只读 GET burst reason 级可分（写面 CAS/租约竞态 vs 并行读）；R2=竞态后净账审计：B 主体零 consumption 零 job 行零 release·A 聚合 job 行数/kind 稳定·A 桶字节稳定。
- **臂族 2（复·跨聚格）**：X1=B own-shell（经产品口 `POST /quiz`+`POST /diagnosis` created）bind **userA resume**（RID）begin → 双口 **409 `resume_not_found_or_not_ready`**（`quiz.service:43-49`/`diagnosis.service:45-47`）·DB 断言壳 `resume_id` 仍 NULL（零绑定）·零消费零 job 行；X2=越权全口 sweep（X 族具名口复行使）**窗口语义钉**——sweep 窗口前对 A 九面聚合取行集快照→sweep→窗口后复取逐行比对（「A 行集合字节稳定」=**sweep 窗口前后两快照相等**·非全程冻结断言）后账本审计（consumption/entitlement_bucket/interview_job/notification/career_path/interview_event/ai_report+**quiz_job/diagnosis_job 两表（begin 写面直接落点）**·owner 恒 A·B 零行指向 A·A 行集合前后快照字节稳定）——与 uc016 N3（own-shell 单口 bind 时点 409·UC-016 行）reason 级可分（本臂=账本完整性审计面）。
- **臂族 3（逃·逃逸通道格）**：E1=缓存键跨主体隔离（**壳 setup=boot() 后 additive 重载 `packages/db/migrations/0189_api_harden_shared_state.sql`**（expand-only 幂等——0189 头注自钉「幂等重放零 diff」·沿 X 族 `:107-116` ALTER additive 先例形·`_neg-harness` 基线迁移单零 0189·重载动作具名入 §5 豁免枚举）→壳先断 LISTEN 健康（沿 api-harden W0 `whenHealthy()` 形）→A 经 login 口 Bearer 暖 statusCache→夹具翻 A `status='disabled'`（0189 `:152` 广播·**夹具豁免具名**=status 翻面种子·沿 `cf1e570b` 壳种先例形）→**广播窗有界轮询断言**（沿 api-harden W1 `:156-178` <1s 形·步进轮询上限 1s 非裸 sleep）内 A 下一请求 **401 `account_inactive`**（`principal.guard:94`）·**假红失败模式预登记**：LISTEN 不健康致广播未达→产品语义走 `principal.guard:17` 60s TTL 兜底上界——轮询窗超时且 LISTEN 不健康=环境假红如实登记停判（非产品缺陷·Ban 判缺陷）·LISTEN 健康而窗超=真红上报；B 全程 200 不受扰·B→A 资源仍 404·**E1 末尾对称 UPDATE 复活 A**（status 翻面种子同族双向·A 复 active 请求复 200——E1/E2 时序解耦·E2 的 A 零扰断言不受 E1 disabled 残留污染））；E2=会话缓存 jti 键隔离（B signup/login→logout 产品口→B 下一请求 **401 `session_revoked`**（`:97-99`）·A 的 Bearer 请求零扰·A logout 不 evict B）；E3=trace/job 写面绑定（B 授权臂主体=signup 产品口新建（trial 桶 1.00 随 `0154_trial_bucket_grant` gateway signup 自动发放——沿 `trial-grant.proof.ts` 先例形·**零新豁免零裸 INSERT 桶种子**）→其 begin→job 行 `owner_user_id=B` DB 断言·B 越权臂零 job 行·A job payload reqId 零现于 B 行）。
- **非替代申明**：X1–X11/W1（`aedb88d2`）=旁证零改动互不替代（X10 只读 burst≠本刀写竞态·X9 读 0 行≠本刀写绑定·X11 体不泄露≠本刀缓存键全路径）；uc010 NHP-010-ADV-01（LED 跨用户注入）=UC-010 行已行使·本刀零触该缝（§1.3）；A3 live worker drain=FAULT 行域零触。

---

## §1.3 否决表（落选项诚实留痕 · 含停止条件登记 · 与盘点表互补）

| 落选项 | 否决/登记理由 |
|---|---|
| NEG 列（case-matrix `:104`·X1–X11 已行使 partial） | X 族已系统化覆盖 NEG/读面——**非本 ADV cell 残余**·零触。 |
| BOUND 列（`:106` X10 burst） | 已行使 partial·PERF 容量语义≠ADV 补集——零触（X10≠容量 SLO 留 PERF 后刀）。 |
| **FAULT 列（`:107` A3 live worker）** | **停止条件登记：本地不可测**——live worker/checkpointer drain 需 live worker 注入（W1=DB RLS+source pin 诚实子集·矩阵自钉 `GAP-UC033-WORKER-LIVE`）→ 不硬造断言·零触。 |
| full.e2e 独立 UC033 场景 | `GAP-UC033-FULL-E2E`（harness `:52`·full.e2e B RLS=旁证）→ 出本刀（矩阵域·后刀）。 |
| sole-stack 夹具/R5 | 矩阵 §0/R5 域（harness §1b 第 5 项）→ 出本刀。 |
| LED 跨用户重放/越权订阅复用 | uc010 `NHP-010-ADV-01` 已行使（case-only·批 B 收据在卷）——同缝再臂=**wash**·Ban 互借。 |
| PERF 分面（矩阵 `:152`） | X10≠SLO·单机≠容量（批 A/B 同 veto）→ 留后刀。 |
| SEVEN-CLASS GAP pin 就地翻面 | 翻面权归协调方（本卷 Ban 触 harness 文件·收据 additive 供评估）·Ban 自翻。 |

---

## §2 验收门矩阵（pre-exec 双审核对单基面 · 起草门 4 门本 commit 适用 + EXEC 预基面届时重 pin · **数字口径以实跑实测为准·熔断阈值即停止条件「验收红不可修」触发面**）

1. **docs:check（红停条款）+ cap 预算核（亲算·越限沿先例步进承登预授权条款本刀触发）**：`node scripts/ai-docs/check-docs.mjs` EXIT=0 · 本树起草前亲跑 **EXIT=0 · scanned 2409**（stdout 亲读）· cap=**2409**（`public-text-policy.mjs:169` `MAX_FILES = 2_409` 亲证）——**2409=cap 恰等零余量**·本卷新文件 +1 → **2410 > 2409 必越** → 沿派单预授权「越限沿先例步进承登」**+8=2409→2417**（+8 二十四先例形·2208 起二十三 +8 先例+2394·其间 2392/2397/2402/2405/2406/2409 恰等变体如实登记·快速链·授权随令）：①`public-text-policy.mjs:169` `2_409→2_417`+注记两行置顶插 `:111` 前（沿 2406→2409 注记形·栈历史零洗）；②`public-text-policy.proof.mjs` 越限臂六处联动 `:372`（`i<2_409→2_417`）·`:379`（atCap 2_409→2_417）·`:380-:381`（「第 2410 个」→「第 2418 个」+`PTP_FILE_LIMIT:2410→:2418`）·`:382`（`f-2409.md→f-2417.md`）·`:385`（deepEqual `:2410→:2418`）+CAP-SANCTION-2417 注记置顶；③**语义申明：计数预算联动零门语义变更·越限臂 fabricated 数随 cap 联动同步·proof 强度不减**·本树 `public-text-policy.proof.mjs` 亲跑 12/12 EXIT=0（2417/2418 双值全行使）·起草树终态 **2410 ≤ 2417**；EXEC 期 +1 proof=2411 ≤ 2417（若 EXEC 期在飞并线致 tree 实测 >2417 → 触「验收红不可修」停手上报·Ban 就地再改 cap）。
2. **markers 五类零命中 + est live=0**：本刀改动集五类标记词（词面运行时组装口径 `scripts/i6-239-gates.proof.mjs:159-163`·不复抄卷内防自指）+行首冲突标记严格形 grep 零命中（起草席亲跑·回执入 EXEC 收据）· est live=0（§6）。
3. **diff 面机检**：起草 commit `git diff --numstat <base>` **恰 3 tracked 路径**=本卷 .md+`public-text-policy.mjs`+`public-text-policy.proof.mjs`；EXEC 期 diff 面=本卷+新 proof+注册行（root/apps-api package.json）+runner 注册位+egress additive 登记+双表行内改（case-matrix `:105` 邻区+矩阵 `:130` 邻区）+tracked 收据 `ai-docs/delivery/receipts/uc033-nhp-adv/`（`.log` 非 TEXT_EXTENSIONS 不计受管扫描·沿批 C 形）——届时逐件登记·多任何未登记 tracked 路径即停。
4. **EXEC 预基面（届时重 pin）**：`pnpm uc033:nhp-adv:prove` EXIT=0 **双 fresh**（实现方恰一次+独立复验恰一次·attempts 台账含红次如实）· 邻面不回退（`uc033:cross-user-authz:prove` X 族全绿恒等+`neg:auth`/`neg:bend` 按届时 SSOT 口径）· 双表同步 diff 逐件登记（§1.0.3 `:166` 令）· **lint 帽承登预置**：EXEC 期新 proof 如添 no-explicit-any/naming warning → 沿批 C §9-post 双帽恰等步进先例形·协调方 sanction 面·非本起草刀落码 · 任一门红 → §8 停止条件。
5. **行/列冻结**：EXIT0=case≠covered · case-matrix `:105` 与矩阵 `:130` 措辞仅允许「partial 保留+收据注」诚实登记 · coveredCount=8 零翻转 · Ban 借本收据宣七类已齐/UC-033 covered/SEVEN-CLASS 已翻（翻面权归协调方）· Ban 借收据 wash X10/BOUND/PERF。

## §3 范围外（越界即 FAIL）

1. **产品码面零触**：`apps/`、`packages/` 产品源零 diff（EXEC 期仅新增 test prove 文件+注册行+runner 注册位·沿 uc015/uc016/批 C prove-only 先例）。
2. **既有 uc033 家族零触**：`apps/api/test/uc-e2e-033-cross-user-authz.proof.ts`+`harness/uc-e2e-033-cross-user-authz.md`+eval 引用面——只读（X 族 G-GAP 五钉零洗零改）。
3. **其余 UC-033 列零触**：NEG `:104`/BOUND `:106`/FAULT `:107`/矩阵 `:152` 分面（§1.3 逐项留痕）；uc010 SSE-ADV 面、批 A/B/C 已并线卷、各 UC 专属线触面只读。
4. **共享 SSOT 零改**：REMAINING-NORTH-STAR-QUEUE / product-campaign-LEDGER / execution-master-checklist / gap-bug-backlog 只读引用——翻面权归协调方。
5. **covered/queue 翻面零预支** · **零迁移零配置零 Key**（0189 触发器系既有迁移零改·C1 夹具仅 DB 种子翻面沿豁免具名先例）。

## §4 依赖

**①上游已满足**：三缺臂类注入缝全在树（§0.2 blob 亲算·期望值逐条对码）+ 三层隔离壳先例（`07077d30`）+ Bearer 臂先例（X3 `:161` 同 proof）+ 产品口 signup/login/logout 在树（`dea7229f2`）+ 0189 广播触发器在树。**②同文件并发**：起草 turn 恰 1 新 .md+policy 两 script 数值联动零交涉面；EXEC 期触 case-matrix `:105` 邻区与矩阵 `:130` 邻区——§0.0 在飞交叠复核必做。**③下游**：三类补集收据供 SEVEN-CLASS 翻面评估与 covered-lift 族引用（评估权归后继刀·本刀 Ban 代评）。

## §5 Ban 列表 + pins

**Ban 列表**：Ban push/force-push（git 写只本 worktree commit）；Ban 自批（pre-exec 双审两独立外席·alone≠dual）；Ban retry-to-green（红即停·attempts 台账·Ban 改断言迁就）；Ban invent covered（含升格 partial/借旁证 wash/实例宣伞/自翻 SEVEN-CLASS）；Ban live key（零 Key 面硬跑·est live=0）；Ban 触产品码面/迁移/CI 告警配置（cap 值外数值联动按 §2-1 预授权形·越值红停上报）；Ban 触既有 X 族 proof/harness/NEG-BOUND-FAULT 列/uc010 SSE-ADV 面/共享 SSOT；Ban 裸 INSERT 绕产品路径（豁免=隔离夹具种子逐项具名入收据·枚举完备 **rev 回炉补全**：consent 种子（`uc-e2e-001-nhp-adv.proof.ts:264` 先例形）+壳行种子含状态钉（`cf1e570b` 先例形）+C1 A-status 翻面种子含 E1 末对称复活 UPDATE（0189 广播行使面·同族双向）+**0189 壳内 additive 重载动作**（expand-only 幂等 DDL 重放·非产品路径 DML）+**C1/C2 主体 provenance 具名**=signup 产品口新建主体（真哈希+jti 会话行·`_neg-harness.ts:267-270` 假哈希主体仅限越权 dev-header 臂）+**E3 B 授权臂桶**=signup trial 1.00 随 `0154_trial_bucket_grant` 产品口自动发放（`trial-grant.proof.ts` 先例形·改走 B 桶种子/放款路径即枚举外须回炉）+**臂族 1 A 预留种子**（若不走产品 begin——沿 `uc-e2e-018-user-abandon-http` `reserveEntitlement` 库面同 CAS 种子形·`:118` 亲点）——枚举外裸 INSERT 即违本 Ban·新增豁免须先回炉修订本卷）；Ban 就地归因门矩阵外新红（如实登记升级）；Ban 伪造已读/已验来源（§0 全亲证为本卷前提）；Ban 造 .env*/写 Key 值入树入据；Ban 顺带升级依赖包。

**pins（十一值照抄·零翻转）**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null。

## §6 est live=0（起草 turn·EXEC 期同）

起草 turn（本 commit）：est live=**0**——零实跑零模型外呼零 Key 加载零生产操作零 secrets 零消耗（EXEC 期隔离 PG·零 MODEL_API_KEY 零 drain 零 live worker·§2-4 承）。

## §7 markers=0（卫生声明）

本刀改动集（本卷 1 .md+policy 两 script 数值联动·起草 turn）五类标记词 + conflict-marker grep **零命中**（起草席亲跑·回执随 EXEC 收据留痕·词面运行时组装口径·不复抄卷内防自匹配——沿批 C §7 同形制）。

## §8 STOP（开工三条款 + 停止条件四类）

**STOP · `draft:awaiting_pre_exec_dual`（三处钉：本节 + Status 行 + 卷尾·起草落卷即停）· alone≠dual · 开工三条款=①pre-exec 双审 BOTH PASS 落卷 ②协调方明示 EXEC 授权（含 §2-1 cap 步进承登追认）③§1 修法面/§5 Ban/pins/§1.3 否决面零改动·§0 对开工 tip 全量重 pin——三者未齐前 EXEC 不得落码。** 停止条件（四类·命中即停手上报·Ban 就地处置）：
- **现场漂移**：届时 tip 对 §0.1/§0.2 任一锚 blob/机制漂移且结论受疑（case-matrix `:105` 列值被他刀改写 · 三缺臂类被邻刀行使（X 族扩臂/SEVEN-CLASS 被翻）· 404/409/`account_inactive`/`session_revoked` 码面漂移）→ 停·重 pin 回炉。
- **机制不满足**：EXEC 期新臂收据与 §0.2 对码期望不符（越权写非 404 · 他人 resume 非零绑定 · evict 广播跨主体窜扰 · B 行现 A 的 reqId）→ 根因诊断被证伪 → 停·如实升级（**产品缺陷=EXIT1 诚实保留+backlog 登记 · Ban retry-to-green**）。
- **越界需要**：修法诉求超出 §1 恰 1 case 三臂族面（需触产品码/X 族 proof/NEG-BOUND-FAULT 列/covered 翻面/共享 SSOT/迁移/cap 再步）→ 停·另刀或协调方裁决。
- **验收红不可修**：§2 任一门红且根因不在本刀交付面（docs:check >2417 / 邻套件新红 / typecheck/lint 超）→ 停·stash 对照亲证基线·如实登记（Ban 借机修）。

## §9 状态

**`draft:awaiting_pre_exec_dual`**（2026-10-27 起草落卷 · pre-exec 双审两独立外席待派 · alone≠dual · Ban self-approve）· 卷 draft ≠ covered ≠ 矩阵列升格（coveredCount=8 零翻转 · EXIT0=case≠covered）· 状态翻面权归协调方 · ⛔push ⛔force-push。

---

*X33-ADV REQUEST · 2026-10-27 起草落卷 · **STOP=`draft:awaiting_pre_exec_dual`**（三处钉：Status 行+§8+本行）· NHP-033-ADV-01 七类越权补集（case-matrix `:105`）· 七类逐类对树亲点=四已行使（正=对照臂 X2/X7/X8/W1 · 异=X7/W1/X9 fail-closed · 特=X2 空集+X11 体不泄露 · 刁=X1–X6 对抗主面）+三缺臂（**逃=缓存键/会话/trace·job 通道零臂 · 复=跨聚合格零臂 · 并=写路径竞态格零臂〔X10 只读 burst≠竞态〕**）· 补集=恰此三类·非零残余入卷 · 修法=恰 1 具名 case 三臂族新 proof（`uc033:nhp-adv`·沿 uc015/uc016 先例形）· 零产品码触·X 族+harness 零触·G-GAP 五钉零洗（SEVEN-CLASS 翻面权归协调方）· §1.3 否决含停止条件登记（A3 live worker 本地不可测 · LED 跨用户缝归 uc010 · full.e2e/sole-stack/PERF 出域）· cap 预算=届树亲跑 **2409=cap 恰等零余量+1 必越 → +8 步进 2409→2417 落码**（二十四先例形·越限臂 2_417/2418 联动·起草树终态 2410≤2417·EXEC 期 2411≤2417）· merge base=`origin/main` `d1a947e3d`（#155 SSE-ADV 并线后）· 分支 `line/x33-adv-draft` · 工作树 `meetwise-x33` · est live=0 · markers=0 · pins 十一值零翻 · coveredCount=8 不变 · releaseEvidence=false · ≠HA · ⛔push*
