# Harness — G7 · **GAP-G7K-API-REDS 修复刀**（Line G7R · docs REQUEST · **`draft:awaiting_pre_exec_dual`** · trio 翻绿最后一公里 · ≠ suite green）

**Status**: **`draft:awaiting_pre_exec_dual`**（docs REQUEST only · Ban coding · Ban prove 执行 · Ban trio 实跑 · Ban live 本次零调用零 Key 加载 · Ban push · Ban fake green · Ban `g7SuiteGreen=true` · Ban 洗绿/Ban retry-to-green · Ban 改 withhold 机制 · Ban 为绿改语义/洗断言 · Ban self-approve · alone ≠ dual · 本 commit 不预claim 任何 post-commit EXIT）
**Date**: 2026-10-07
**Line**: **G7R**（G7K nail `0c6c3287` 登记 **GAP-G7K-API-REDS** P1 OPEN——真实产品缺陷面、suite 翻绿的最后一公里）
**授权链（待走）**：G7R REQUEST（本 commit）→ pre-exec dual **mw-e2e-ha + mw-model-op BOTH PASS** → 协调方授权 EXEC（含 env 注入值/修复面裁定，EXEC 时下达）→ 才允许在独立 worktree 实跑 trio 三条 CMD（各 ×1）。**本 commit 不预claim 任何 post-commit EXIT；双审 PASS 本身 ≠ EXEC 授权。**
**Knife 定位**：G7K trio 带 Key 新鲜跑（EXEC `f02602cb` · 实跑 code SHA `8c6860e3` · POST dual `c290cdfc`/`54b7ad19` BOTH PASS · nail `0c6c3287`）**三 gate 全解除后首次真实业务执行**，暴露 **EXIT 1/1/1 真实业务红**：①recruiting-bound bind 路径 ×2（`waitForURL(/\/interview\/iv_…\?applicationId=app_/)` 30s timeout @ spec `:96`，proof `e2e-ui-isolated.md` F1/F2）；②uc018-abandon 200↔409 ×2（abandon proxy Expected 200 / Received 409 @ spec `:139`，F3/F4）；③iso/perf HTTP 红面 case 名 by-design withheld（wrapper stderr 契约 · `failureClass=api`）。G7B C8 按「随 live 解锁刀复核」复核仍红 → 转 **api 类候选真实缺陷**；G7K 双审对①②同根性标注「候选解读非断言」→ **本刀 REQUEST 先做只读诊断定根因，再定修复面**。
**Pins（原值全抄 · 未动）**: `haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` · `coveredCount=8` · `ms3EqualsR4Closed=false` · **PG-retained** · **公开 DELETE=503**
**Retained（至三绿 + post-dual + 协调方 nail 前不翻转）**: **`g7SuiteGreen=false`** · `r1Closed=false` · `techRoleFailClosedOptOutG7Only=true` · Disclosure-1 **OPEN** · trio **OPEN**（EXIT 1/1/1 · 失败性质=真实业务红）· GAP-G7K-API-REDS **P1 OPEN**（`0c6c3287` 登记 · 本刀不翻 SSOT 状态）· `actualSpendCny=null`
**Base**: `origin/feat/mysql-schema-skeleton` **`7b28a492`** / full `7b28a4926f4608d068eefc357866322754d587fb`（2026-10-07 fetch 后实测 tip · docs `NAIL c-b-audit erratum post_prove_dual_pass`）· worktree `/Users/miaole/Desktop/golucky/meetwise-line-g7r` · branch `line/g7r-api-reds-fix`

---

## 0. 本 turn 只读诊断纪律声明（Ban coding 的证据来源披露）

本 REQUEST 的诊断**零实跑、零 live 调用、零 Key 加载**，证据全部来自只读：**(a)** 本 worktree git 只读源码亲读（行号/blob 一律 @`7b28a492`）；**(b)** G7K 已 commit 收据（`receipts/g7-trio-keyed/` 4 文件）；**(c)** G7K EXEC 期磁盘工件（未入 git）：G7K worktree `apps/web/test-results/*/error-context.md`（Playwright 失败页快照）与 `.tmp/g7k-keyed-20261007/02-e2e-ui-isolated.log`（reporter 原文 · G7K POST dual `54b7ad19` §A 同源引用在案）。引文均过「无 Key 值」自查；不发明任何未在案的明细。

## 1. 三红根因假设（逐红 · file:line + blob @`7b28a492` + G7K 收据引用）

### 红① recruiting-bound bind 路径 ×2 —— F1/F2

**现象（G7K proof）**：`[chromium]`/`[mobile]` `e2e-ui/recruiting-bound.spec.ts:56` ×2，`TimeoutError: page.waitForURL: Timeout 30000ms exceeded` @ `:96`（blob `de4991e6`）；`:94`「开始面试」按钮 visible **已通过**（G7K 收据 `e2e-ui-isolated.md` F1/F2 · log `:55`/`:121`）。35.3s/35.6s（=30s 超时窗口 + 前置），×2 project 确定性复现。

**UI 面断点（磁盘工件亲证）**：`error-context.md`（chromium）页快照显示候选人停在 `/jobs`，根错误边界「**出错了** · 页面遇到一个错误,可以重试 · 错误标识 190419086」已渲染 → `startApplicationAction`（`apps/web/app/jobs/actions.ts` blob `67b8928b` `:33-49`）**throw**（非 402 redirect、非容忍集），`redirect(body.redirectTo)` 永不发生 → `waitForURL` 必然超时。throw 点为两条非 ok 分支之一：`application_start_failed_<status>[:subclass]`（`:38-41` · `application-start-error.ts` blob `f9ca2214`）或 `application_interview_begin_failed_<status>`（`:47`）。

**API 面根因链（首选假设 H1-a）**：`POST /applications/:id/start` → **409 `interview_ineligible_route`**（`apps/api/src/modules/jobs/applications.service.ts` blob `9a17cfe4` `:42-46`）← `startApplicationInterview` 无 route binding fail-closed（`packages/db/src/recruiter.ts` blob `d06b4f49` `:394-410`「R2 P-START 真拒启：无 binding → interview_ineligible_route（fail-closed；不创建 interview）」）← `bindApplicationRoute` 只绑 `route_decided`（`packages/db/src/job-route-decision.ts` blob `a621d8bd` `:285-313` `:295` `route_not_decided`）← **该岗位 revision 停在 route_pending 或 sticky route_unresolved**。
spec 岗位（title `浏览器绑定岗位-*` · competencies `高并发/幂等/限流`）**零 rule 信号命中**（`packages/domain/src/job-route-classifier.ts` blob `79ceded8` `:56-66` RULE_SIGNALS · `:96-100` 0 或 ≥2 命中→null）→ 必走**模型路径**：`classifyJobRoute`（`job-route-decision.ts:169-260`）→ `createJobRouteModelClassify`（`packages/ai-runtime/src/job-route-classify.ts` blob `3b1e7081` `:144-207`）。该 seam 任何失败都落 `knownNotSent(...)`（`:130-132` · `:179-195` catch-all）→ `route_unresolved` **sticky 终态、同 (job,revision) 永不重发**（`job-route-decision.ts` 模块头 `:14`「dispatched_unknown / known_not_sent / validation_rejected 是 sticky 终态，永不自动重试」）→ binding 永远不可能落 → start 409 **确定性**复现（×2 project 非竞态的最好解释）。唯一 Worker drain：`apps/worker/src/route-classify-consumer.ts` blob `223b7f09`（`drainRouteClassifyOnce` 失败仅 console.error → 输出面被 withhold）。
排除面：quota 0 复发（G7K 三 log `FreeTierOnly/AllocationQuota` 0 hit）；`resume_not_ready` 不成立（`:72` 解析完成 wait 已过、start 用 `eligibleResumes[0]`）；`binding_invalid` 不成立（首启无旧绑定）；`stale_quiz` 不成立（`actions.ts` begin 不带 quiz-id header → `interview.service.ts:209-222` sourceQuizId 块整段跳过）。

**次选假设 H1-b（如实保留）**：`/interview/:id/begin` 同步非 ok（`application_interview_begin_failed_*`）。begin 同步 409 面仅 terminal-guard/quiz 块/privacy guard（`interview.service.ts` blob `257718cf` `:203-243`），新会话均不触发——置信度低于 H1-a，EXEC 实测甄别。

### 红② uc018-abandon 200↔409 ×2 —— F3/F4

**现象（G7K proof）**：`[chromium]`/`[mobile]` `e2e-ui/uc018-abandon.spec.ts:68` ×2，`Error: UI abandon proxy → 200 · Expected: 200 / Received: 409` @ `:139`（blob `3309dc38`；log `:93-94`/`:159-160`）。**1.6s/2.5s 极速失败**；create（`:100-108`）→ begin（`:110-124` 202 + 额度 -1 断言）均已通过。

**决定性证据（磁盘工件亲证）**：`error-context.md`（chromium）页快照：abandon 确认弹窗下方 **「已结束」状态徽标已渲染** + alert「**面试启动/处理遇到问题,已停止**…」+「重新开始面试」按钮 + toast **`interview_not_active`** → 即 begin 后 worker 图**秒级 fail-closed**（interview → `failed` 终态经 SSE 推达页面）→ abandon 命中 `apps/api/src/modules/interview/interview.service.ts:557-559` `st==='completed'||st==='failed'` → **409 `interview_not_active`**（与 toast 逐字吻合）。1.6s 内完成「取队→图执行→真生成」不可能（真实生成 ≥数秒），**毫秒级 provider/配置快速失败才能解释**。
**产品面自证该竞态**：`scripts/run-e2e-ui.mjs` blob `aa86fb3f` `:136-138` 专用注释：「`E2E_UI_SKIP_WORKER=1`：只启 api+web（不启 worker）。用于 UC018 UI abandon 等『预留下立刻点放弃』专用钉——**避免 worker 秒级 fail-closed 把会话打成 failed，与 UI 放弃点击竞态**。默认仍启 worker」——G7K 默认 worker ON，竞态秒输。G7K「候选同根」解读由此升级为**有证据的强假设**（仍非断言，EXEC 实测定谳）。

### 红③ iso HTTP 红面 case 名 withheld（CMD1 + CMD3 同源）

**withhold 契约（源码亲读 · 本刀零绕过）**：`scripts/run-e2e-isolated.mjs` blob `13dbfc43` `runFullE2E` `:2084-2098`——child **stderr 永不转存或回显**（`:2093` `child.stderr.on('data', () => {})`）、stdout 仅内存固定格式解析；断言失败时 prose 只写 stderr（`e2e/helpers/assert.ts` blob `975fbb38` `console.error('✗', msg)` + stdout `E2E_FAILURE class=<cat> code=assertion`），wrapper 只上浮 `E2E_FAILURE_CLASS class=…`（`e2e/helpers/failure-class.mjs` `lastE2EFailureClass:277-284`）。G7K POST dual `54b7ad19` §D 已裁决「by-design withhold 如实呈现 · PASS」。**Ban 改 withhold 机制本身。**

**合法三角定位（本 turn 已完成 · 零发明）**：CMD1 machine receipt `reviewLedger=[capability:image_ocr_unavailable, capability:voice_unavailable]` —— 两枚 capability skip 分别 record 于 `e2e/full.e2e.ts:58`（OCR）与 `:153`（voice，blob `7d65d0f3`）→ **执行已越过 `:153`** → UC018 abandon 块（`:86-139`，含 `:111` abandon→200 断言）与主面试 create（`:142-146`）**在 CMD1 已 PASS** → iso 红面在 `:154` 之后、`class=api`、业务窗口 ≈15s（G7K machine receipt `durationMs=38541`）。
→ 排除：`:210`/`:248`/`:256`（显式 `'worker'` 类）、`:205`（`interview_terminal_timeout` worker 类）——若走到它们 failureClass 应为 worker 非 api。
→ **首选候选**：`full.e2e.ts:199` `A(questions >= 1, …)`（默认类 **api**，`assert.ts` defaultClass='api'）——主面试 drive（`:187`）遇 worker 图秒级 fail-closed → 终态事件先行、`questions=0` → 断言红 → `process.exit(1)`。与红② 同一根因、时间线吻合（HTTP-only 前段数秒 + 一次 fast-fail drive）。
→ 次选候选：`:333` `POST /applications/:id/start` 期望 200/started 的断言（红① 的 HTTP 镜像）——但其前 `:199` 已先红，仅在红① 根因已除而主 drive 仍红时才会成为实际红面。
CMD3（`verify:e2e-performance`）HTTP 步 = 同一 `full.e2e.ts` 复跑（build 97152ms/migrate 15006ms EXIT0 后 HTTP 步 31792ms EXIT1 class=api · G7K SUMMARY），同根不独立。

### 三红共同最上游候选（单一根因收敛 · H0）

**H0（文本 chat 模型调用秒败）**：`resolveTextEndpointConfig`（`packages/ai-runtime/src/text-endpoint-config.ts` blob `005c68cc`）**默认 profile=`deepseek-cn-public`（`:77` → host `api.deepseek.com`，`:37-40`）而默认 model=`qwen-plus`（`:67` F4 注释自述「缺省模型名统一 qwen-plus」）**——`MODEL_API_KEY` 之外若未显式供给 `MODEL_NAME`/`MODEL_ENDPOINT_PROFILE`，chat 调用打 `api.deepseek.com` 报 `model: qwen-plus`，DeepSeek 公网无此模型 → provider 快速拒绝 → 级联出：route classify → known_not_sent → sticky unresolved（红①）；interview 图 fail-closed → failed（红②·红③）。G7K 协调方 Key 探针「HTTP 200 可用」为 name-only 存在性探测，**不等于 endpoint↔model 配对可用**——此缝隙如实登记。
**H0 竞争假设（同判 EXEC 甄别）**：H0-alt-1 Key 所属 provider 与默认 profile 错配（若 Key 为 DashScope/百炼 → 默认 deepseek 端点 401）；H0-alt-2 model-admission/cost-governance pre-dispatch 拒绝（`job-route-classify.ts:113-128` PRE_DISPATCH_KNOWN_NOT_SENT 族，如 `model_not_configured`/`deterministic_refusal`）；H0-alt-3 worker 进程 env 传递缺口。三者与 H0 共享同一可观察面（fast-fail + known_not_sent 族），**EXEC 一次实跑 + 收据即可甄别**（甄别手段见 §3，不改 withhold）。

**根因假设一句话版**：红①=岗位路由 classify 模型路径秒败落 sticky `route_unresolved` → start 409 `interview_ineligible_route` → server action throw → 错误边界 → URL 永不跳转；红②=begin 后 worker 图秒级 fail-closed 置 `failed` → abandon 撞 `interview_not_active` 409（专用 knob 注释自证该竞态面）；红③=主面试 drive 0 题 fast-fail 撞 `full.e2e.ts:199` api 类断言（withhold 契约内经 reviewLedger 三角定位，非发明）；三者共同最上游候选 H0=默认 endpoint↔model 配对不一致致文本 chat 调用秒败。

## 2. 修复方案候选（逐红 · 按根因归类 · Ban 为绿改语义/洗断言）

| 红面 | 候选 | 归类 | 触碰面 | 本刀处置 |
|------|------|------|--------|----------|
| 红①+红②+红③ 共根 | **F-A env 补齐（首选）**：EXEC 进程环境显式注入与 Key provider 匹配的 `MODEL_ENDPOINT_PROFILE`/`MODEL_NAME`（允许集内值 · 由协调方 EXEC 指令下达 · 非 agent 发明；name-only+非敏感配置值可入收据，Key 值绝不） | **env-gap** | 零代码零夹具零 `package.json` | 本 REQUEST 预披露；EXEC 实测甄别 H0 vs H0-alt |
| 共根 | **F-B 产品默认配对修复（若实测证实默认必败）**：`text-endpoint-config.ts` 默认 profile↔默认 model 一致化（或启动期 fail-fast 配对校验，缺配即 `text_endpoint_pair_invalid` 类早败，不静默错配） | **产品缺陷** | `packages/ai-runtime/src/text-endpoint-config.ts`（blob `005c68cc`）± api/worker 启动校验面 | **另刀 coding**：须独立 REQUEST + 双审 + EXEC 授权；本刀只登记方案与触碰面，不实现 |
| 红② | **F-C 夹具侧专用 knob（备选，不推荐）**：`E2E_UI_SKIP_WORKER=1`（`run-e2e-ui.mjs:136-138` 既有专用钉）隔离 fail-closed 竞态 | **测试夹具/prove 契约** | runner env（零代码） | 仅当 F-A/F-B 落地后竞态仍不可赢时，由协调方显式另批；prove 契约变化须收据全披露；UC018 断言（UI 触发→同 HTTP 合同）语义零改，Ban 借 knob 洗语义 |
| 红① | **F-D spec 侧改动**（放宽 waitForURL/加重试/改断言） | ~~夹具~~ | — | **否决**：Ban 为绿改语义/洗断言；spec 断言零触碰 |
| 红③ | **F-E 为取 case 名改 withhold 机制**（回显 stderr/落盘 stdout） | — | — | **否决**：Ban 改 withhold 机制本身（`run-e2e-isolated.mjs:2084-2098` 冻结）；case 名甄别只走 §3 合法途径 |
| 红③ | **F-F 独立诊断 attempt（若修复后仍红）**：独立命名的一次观察跑（预期红 · 独立 EXIT/attempt 记录 · 不替代 trio ×1 · 不冲销任何 EXIT） | 诊断 | 零代码 | 默认计划**不含**；须协调方 EXEC 指令显式批准并计入预算 ≤200；Ban 借诊断跑 retry-to-green |

**触碰面清单汇总（EXEC 默认 plan）**：零产品代码、零夹具、零 `package.json`、零 `run-e2e*.mjs`、零 spec、零 SSOT；唯一变化 = 进程环境（Key loader + 协调方下达的 endpoint/model 配置名值）。**若 EXEC 实测定谳 H0-alt-2/H0-alt-3 或 F-B 成立**：修复走新刀，本 knife 收据如实记 red→迭代，不拖尾。

## 3. prove 方案（EXEC 期 · 授权后方可行）

1. **前置**：pre-exec dual（mw-e2e-ha + mw-model-op）BOTH PASS → **协调方 EXEC 显式授权**（含：env 注入值裁定（F-A 值域）、是否批准 F-C/F-F、committed SHA 重钉）。双审 PASS ≠ EXEC 授权；G7K U4 先例不自动携带。
2. **环境**：fetch 后独立 worktree（默认复用本刀 worktree `/Users/miaole/Desktop/golucky/meetwise-line-g7r` · branch `line/g7r-api-reds-fix`；EXEC 重钉 committed SHA 为准）→ `pnpm install --frozen-lockfile`（EXIT 记录）。
3. **Key 卫生（硬 · 沿 G7K C-K6 全量）**：Key 只经进程环境 `source ~/.meetwise-secrets/load-model-api-key.sh`；**Ban 写任何 `.env*`**；Ban Key 值/fingerprint 入 receipt/log/commit/截图；探针 name-only；原始 log 落 worktree `.tmp/`（不入 git）。
4. **trio 三条 CMD 各恰好一次**（建议序 iso → ui → perf · 与 G7K 同序）：`pnpm e2e:isolated`（wiring `package.json` `e2e:isolated`，G7K @`8c6860e3` 实测 `:276`）· `pnpm e2e:ui:isolated`（`:277`）· `verify:e2e-performance`（`:280`）——EXEC 时按当 tip 重核行号回填。单条 CMD 内部既有重试按自身契约算一次 attempt（配置原值披露 · Ban 临时调高重试/并发/超时）。**每 attempt 七字段全记录**：CMD 原文 + EXIT 原值 + 起止时间戳 + 实跑 code SHA（receipt commit ≠ 实跑 SHA）+ worktree/branch + install/环境探针（docker/chromium/pnpm/node + `.env*` 三文件 ABSENT presence + `MODEL_ENDPOINT_PROFILE`/`MODEL_NAME` name-only set 探针）+ 逐 case FAIL 明细（case 名/原因/五分类 api/fixture/env-gap/frontend/provider）。CMD1/CMD3 退出码、machine receipt（`.tmp/e2e-receipts/*.json`）、原始 log 三来源交叉一致才可引用。
5. **预算**：沿 G7K 口径**上限 200 次 live 调用**。诚实偏差披露：G7K 结构估 <120 是在 **bind 失败、真实生成面未展开**下测得；本刀若 F-A 生效，recruiting-bound ×2 将首次跑完整 6 题×2 project 真实旅程、CMD1 三条 `driveInterviewToTerminal` 全程生成——**live 面较 G7K 增大**，结构估仍 <200 但余量收窄；额度上限以协调方 EXEC 指令为准，超限即停如实记中止（不洗 not_run）。voice/OCR/ASR/TTS 无 DASHSCOPE key → honest capability skip = 0 调用。**`actualSpendCny=null` 沿 I 线**（Ban invented spend）。
6. **红③ case 名甄别（EXEC · withhold 契约内）**：修复生效 → CMD1 EXIT=0 自证（无需 case 名）；仍红 → (a) machine receipt `failureClass`/`reviewLedger`+本 harness §1③ 三角法重算；(b) 如需 case 级名，仅走 F-F（协调方显式批准的独立诊断 attempt）。**Ban 改 wrapper、Ban 发明 case 名。**
7. **收据落点**：`ai-docs/delivery/receipts/gap-g7k-api-reds-fix/`——3 per-CMD（`e2e-isolated.md`/`e2e-ui-isolated.md`/`verify-e2e-performance.md`）+ `SUMMARY.md`（EXIT 表 + 逐条一句话原因 + 根因假设定谳（H0/H0-alt-1/H0-alt-2/H0-alt-3 之一，附证据）+ Pins/Retained 原值 + `g7SuiteGreen=false` 保持声明 + evidenceOfRecord/SSOT 登记**留 nail 阶段**）。归档收据（AC/AD/U/L/G7B/G7K）零改写。
8. **EXIT 契约（诚实双向）**：**三条全绿** → trio 翻绿收据成立；**`g7SuiteGreen` 翻转 = 三绿 + post-dual BOTH PASS + 协调方 nail 全链**（缺一不可；单条绿 ≠ trio 绿；trio 绿 ≠ suite green——G6 OPEN/R5-MARKED-RED/Disclosure-1 OPEN 独立核算）。**任一仍红** → EXIT=1 原值 + 逐 case 明细 + 根因假设修正如实登记（红不洗、flake 记法 Ban、env-gap 可定性为 FAIL 原因但不冲销 EXIT=1），修复面重走 REQUEST（迭代刀），trio 保持 OPEN。

## 4. Ban 清单（本 REQUEST turn · EXEC 期延续项随文标注）

- **Ban coding**：本 turn 零产品代码/零脚本/零夹具/零 `package.json` 改动；EXEC 期同禁（除非 F-B 另刀获独立授权）。
- **Ban prove 执行**：本 turn 零 trio 实跑、零 live 调用、零 Key 加载（Key 文件与 loader 存在性 = name-only）。
- **Ban push / force-push**：git 写操作只在本 worktree 一次 docs commit。
- **Ban SSOT / covered 行翻转**：`gap-bug-backlog.md`/`execution-master-checklist.md`/覆盖矩阵/north-star 零触碰（nail 阶段才改）；`coveredCount=8` 不动；**GAP-G7K-API-REDS 的 backlog 状态行（`0c6c3287` 登记 P1 OPEN）不翻**——修复定谳由协调方 nail 落字。
- **Ban 洗绿 / Ban retry-to-green / Ban flake 记法**：红了不重跑冲销、Ban 只留绿 attempt、env-gap 不冲销 EXIT=1；F-F 诊断跑独立记账，Ban 借它达成「看起来重试到绿」。
- **Ban 改 withhold 机制**：`run-e2e-isolated.mjs:2084-2098` stderr 契约冻结；Ban 为取明细开假面。
- **Ban 为绿改语义/洗断言**：spec 断言零触碰（F-D 否决）；F-C 若被批准亦不改 UC018 断言本体。
- **Ban 碰已占用行 / sibling 产物**：G7K 收据 lifecycle `executed:awaiting_post_prove_dual`→已 nail 冻结；AC/AD/U/L/G7B 归档零改写。
- **Ban self-approve**：pre-exec dual = mw-e2e-ha + mw-model-op 两方独立签署（alone ≠ dual · 不代签 peer）；本 REQUEST 即被审对象。
- **Ban Key 物料**：Ban `.env*`、Ban 值/fingerprint 入树入据、Ban agent 自造/改写 Key 或 endpoint/model 配置值（F-A 值由协调方下达）。

## 5. Pins（原值）+ Retained

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

**Retained**: `g7SuiteGreen=false`（翻转 = 三绿 + post-dual BOTH + 协调方 nail）· `r1Closed=false` · `techRoleFailClosedOptOutG7Only=true` · Disclosure-1 OPEN · trio OPEN（EXIT 1/1/1 · 真实业务红）· GAP-G7K-API-REDS P1 OPEN（`0c6c3287`）· `actualSpendCny=null`

## 6. 诚实条款（硬钉）

1. EXIT 全部如实；**EXIT=0 ≠ covered ≠ suite green ≠ HA ≠ SLO/LOAD ≠ 0 BUG ≠ fixed ≠ R1 closed ≠ G6 closed**；not_run ≠ pass；skip ≠ pass；capability skip ≠ voice/OCR green。
2. 根因假设是**假设**：本 harness §1 全部为「证据支持的候选」，非断言；定谳只由 EXEC 实测 + 收据落字；**Ban 把假设当结论写进任何收据**。
3. F-A 若生效即翻绿，**翻绿 ≠ 证明 H0**（env 补齐对多个 H0-alt 同样有效）；定谳表述须按收据证据强度措辞（「与 H0 一致」≠「H0 已证」）。
4. 本 commit（REQUEST）不预claim 任何 post-commit EXIT；收据在授权实跑后由被授权执行另行落盘，本文档零预填。
5. ERRATUM 措辞冻结沿用：FreeTierOnly **观察**=`3424dc1` · **消除轮**=`82981ff` · Ban shorthand `quota-403=82981ff`。

## 7. Non-claims

Not a pass · not run（本 REQUEST 零实跑）· not fixed · not root-cause-proven（假设非断言）· not suite green · not trio green · not family green · not R1 closed · not Disclosure-1 closed · not G6 closed · not R5 retired · not HA · not SLO/LOAD · not covered · not `releaseEvidence=true` · not nail · not SSOT flip（GAP-G7K-API-REDS 状态不翻）· not new evidence（本 turn 只读）· not live（本 turn）· not coordinator authorize（待 EXEC）· Key set ≠ auto green · env 补齐 ≠ H0 定谳 · `g7SuiteGreen=false` · `r1Closed=false` · trio OPEN · `actualSpendCny=null` · alone ≠ dual

## Pins

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503 · `g7SuiteGreen=false` · `r1Closed=false` · `techRoleFailClosedOptOutG7Only=true` · Disclosure-1 OPEN · trio OPEN · GAP-G7K-API-REDS P1 OPEN · STOP（awaiting pre-exec dual + 协调方 EXEC 授权）

---

*Harness · GAP-G7K-API-REDS 修复刀 · Line G7R · 2026-10-07 · draft:awaiting_pre_exec_dual · docs REQUEST only · 三红根因假设（红①sticky route_unresolved→start 409 · 红②worker 秒级 fail-closed→abandon 409 · 红③主 drive 0 题→:199 api 断言）· 共同最上游候选 H0 默认 endpoint↔model 配对不一致 · 修复候选 F-A env（首选）/F-B 产品另刀/F-C knob 备选/F-D·F-E 否决 · trio ×1 各一次 · 预算 ≤200（诚实披露：修复后 live 面较 G7K 增大）· g7SuiteGreen=false 至三绿+post-dual+nail · Ban 假绿/retry-to-green/改 withhold/洗断言 · actualSpendCny=null · STOP*
