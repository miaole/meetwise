# Receipt — GODFN-1d · AppError 统一刀 EXEC（mw-core）

**Date**: 2026-10-07（Asia/Shanghai）
**Line/Knife**: GODFN-1d · EXEC 席 `mw-core`（作者 `git -c user.name=mw-core -c user.email=mw-core@meetwise.local`）
**蓝本**: REQUEST rev2 @ `86627721`（`ai-docs/delivery/harness/godfn-1d-exec.md` 唯一蓝本）· 已 nail 设计 `ai-docs/delivery/harness/godfn-decompose.md` @37705a3e（§1 #9 形态 / §2.4 / §4 / §5.4 / §7.3）
**Worktree**: `meetwise-line-godfn1d` · branch `line/godfn-1d-apperror` · **执行起点 = rebase 后 tip `86627721`**（父链 `6da98526` → 1c 主线 tip `493fc3b8` · §7.3 串行前置 1c 已兑现：worktree 已 rebase 至含 1c 主线，REQUEST rev2 落于其上）
**Lifecycle**: `draft_rev2:awaiting_pre_exec_dual` →（协调方 EXEC 授权）→ 本刀执行 → **`exec:awaiting_post_prove_dual`（本收据 · STOP）**
**Ban self-approve** · alone ≠ dual · post-dual 归协调方+双席
**前置交付**: `receipts/godfn-decompose/1d-consumers.md`（动码前落盘 · tip 亲测 30 处/19 文件全列+13 处负测面+五键补入·本目录存同文副本）

---

## 0. Pins 十一值（设计 §4 逐字照抄 · 本刀不改口）

`haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` · `coveredCount=8` · `ms3EqualsR4Closed=false` · **PG-retained** · 公开 DELETE=**503** · `g7SuiteGreen=false` · `r1Closed=false` · 脚注 `actualSpendCny=null` · GAP-DEBT-BE-GODFN 保持 P1 OPEN。

## 1. 交付面（diff face · 30 文件，+122/−92）

**新分类面（1 文件 + index 导出）**：
- `packages/db/src/errors.ts` **新**：`AppError extends Error { code }`（message 默认=code 串——错误码字符串本体零变·message 轨读者恒同兼容）+ `asErr(e)`（`any` 可选链的对象视图，非对象→undefined）+ `errCode(e)`（AppError.code ∪ 结构 `.code` string 探测 ≡ 现行 `e?.code ===` 字面判定逐点等价）。落位 EXEC 裁定=设计候选 `packages/db/src/errors.ts`（api/worker/ai-runtime 皆已依赖 @meetwise/db，零新依赖边）。`packages/db/src/index.ts` +2 导出行。

**30 处 `catch (<ident>: any)` → `catch (…: unknown)` 全消**（逐位点对账=1d-consumers.md §1 表，此处按面归组）：

| 面 | 文件（位点数） | 收窄形态 |
|---|---|---|
| api 服务 code 轨 | auth.service:32 · commerce.service:32 · diagnosis.service:60 · quiz.service:57 · resume.service:53/:99 · interview.service:305/:501 | `errCode(e) === …` 判定零变；resume:100/interview:501 三属性/双码表达式经 `asErr` 视图原样保形（`e.requested/e.available/e.status` 读数走视图） |
| api interview 五 catch（1c 现树位） | interview.service:157 · interview-voice:30/:73 | 收窄；`String(e?.message)` → `String(asErr(e)?.message)`（**msg 轨判定原样 retain**） |
| worker consumer 族 | interview-consumer:82/:163/:188/:374/:408/:427 · diagnosis-consumer:36 · quiz-consumer:36 · report-worker:47 · commerce-reconcile:57 · interview-service:299 | consumer:82 **三属性原样表达**（`reason`/`code`/`status` 全经视图逐字保形·rethrow 用原 catch 值保错误身份）；:188/:47 msg 轨 retain；:374/:57/:36/:40 code 轨 `errCode`；:427/:299 折叠走视图；:163/:408 无判定仅收窄 |
| db 否定式 | payment.ts:76/:119 · resume.ts:114 | `errCode(e) !== '23505'` → **照抛分支保形（禁吞 PG 错误身份）**；savepoint 结构零触碰 |
| ai-runtime | circuit-breaker:121 · tools:31 · voice:446/:488 | breaker 见 §2；tools/voice 折叠与 instanceof 分派走视图/原样（External* instanceof 对 unknown 直用） |
| smoke | adaptive-attack.ts:67 | 观测面收窄（`String(asErr(e)?.message)`） |

**测试桩随形对齐（断言零改 · 1c「IO 桩随形对齐」先例）**：`failover-price-policy.proof.ts:249/:293` · `model-cost-governance.proof.ts:230` 三处 `throw new Error('model_circuit_half_open')` → `throw new AppError('model_circuit_half_open')`（producer 通道迁移后的等价输入对齐；R 断言逐字零改——prove:failover-price-policy/prove:model-cost EXIT=0 复跑闭环）。

**g7 车道字节冻结豁免实录（rev2 席2 处方①）**：`packages/ai-runtime/src/model-client.ts` **零 diff**（:508 `msg.startsWith('g7_')` / :520 `error.message.startsWith('g7_')` 两位点 message 轨判定原样·禁换判定通道条款遵守；该两位点所在 catch 亲测均非 `:any`，无 narrow 面，故全文件零触碰）。g7_ 族 ~27 抛点零触碰（Ban：把 g7_ 前缀族错误改码）。

**Ban 面遵守**：零迁移/零 SSOT/零 G7 判定面（豁免条款外）·错误分类语义零变（判定结果/映射面等价·否定式照抛保 PG 身份·voice:453 惰性 tautology 原样保留禁修活——:453 真臂与 :454 无条件抛两臂同效·判定不可观测·仅判定通道按单一分类面归一）·controller/路由契约/HTTP 状态码/错误码字符串零变·payments savepoint/advisory/FOR UPDATE/幂等键零触碰。

## 2. 双轨收敛（设计 §2.4 · g7 豁免后的迁移面）

| 车道 | producer → AppError | 消费方判定 | 保形论证 |
|---|---|---|---|
| breaker/half-open | circuit-breaker.ts:56 `throw new AppError('model_circuit_half_open')`（message=code 零变） | breaker:122 → `errCode(error) === 'model_circuit_half_open'`（**精确等·禁前缀化**）；invoke.ts:200 isHalfOpenFollower → 同式 | 闭世界审计：全树该串 throw 仅 :56（:43/:96 为结构化 outcome；model-admission.ts:35/:96 为映射表→outcome 非抛；invoke:685 `new Error(plan.error)` 不流经两判定面）；近邻变体 :85 `model_circuit_half_open_admission_required` 不同串恒不匹配（保形） |
| cloud 双轨 | 7 抛点 → AppError（cloud-smoke-fc:29 · cloud-test-fc:33 · cloud-test-serial:70 · cloud-test-run-ledger:46 · cloud-readiness:55 · cloud-smoke-runner:92/:97；code=message=原串零变） | 漏斗判定表达式**逐字节原样**（cloud-smoke-fc:79/:96 · cloud-test-fc:104/:120 · cloud-readiness:281-289 · cloud-test-serial:509/:513） | **fc_⊂smoke_ 分层漏斗保形**：漏斗（smoke→cloudSmokeFailure · serial→cloudTestSerialFailure · fc→failedReceipt/fixedFailure）即本车道单一分类面；其内层 code 探测（cloud-readiness:283-285）原已是 code 轨保持原样；**判读通道保留 message 轨的 pin 证据**=cloud-test-serial.proof.ts:70-73 以 plain Error 钉 (unknown)→string 契约 + cloud-readiness.proof.ts:28-30 钉探测层 + cloud-*-fc.proof 钉 handler 收据 code 串——换通道须改既存断言=Ban 洗红面，故收敛落在 producer 身份面（AppError 化·message=code → 现行 message 判定对 AppError 恒同结果） |
| voice（asr_malformed） | native-response-guard.ts `requireNonEmptyText` 2 throw → AppError（同文件 requireRecord/requireFiniteVector/requireHttpsUrl **零触碰**；全树唯一 src 消费者=voice.ts:445） | voice.ts:453 → `errCode(error) === 'asr_malformed'` · **:454 无条件 `throw error` 原样保留（惰性位点禁修活）** | tautology 等价论证：:453 真臂 `throw error` ≡ :454 无条件 `throw error`——判定结果不可观测，通道迁移与 producer 迁移均可证零可观察差异；api interview-voice:78 的 `String(e?.message) === 'asr_malformed'` retain 位点不受扰（AppError.message=code） |
| model-client（g7） | **零触碰** | **零触碰** | g7 车道字节冻结豁免（§1） |
| 保留 msg 轨位点（登记零处置） | — | interview-voice:31/:33/:35/:76/:78/:80/:85 · report-worker:48 · interview-consumer:189 · interview.service:158 | 1c 后漂移位点+设计迁移名单外位点：catch 收窄但判定通道原样（producer 链 AppError 化不在本刀名单·借刀夹带 Ban）；mapAnswerLedgerError:103 折叠为**参数面**（设计 §6 余量）零触碰 |

## 3. blob 演进对照（三钉条款 §3.5 · interview.service 本刀必触）

- `apps/api/src/modules/interview/interview.service.ts`：**旧 blob `bf17ea6c`（=1c 后树内 blob·本刀执行起点 HEAD `86627721` 树）→ 新 blob `6e50ea48`**（三 catch 收窄+asErr/errCode 导入；行为等价门=neg:interview 97/97 + uc018-http/adv + uc019 + uc002×2 + uc004-fault 全绿）。
- `packages/db/src/payment.ts`：旧 `f9119a9c` → 新 `e11d0690`（两 catch 收窄；门=uc011-report-refund-http 50/50 + commerce-reconcile + neg:commerce base≡red 同签名）。
- 另两钉未触：`scripts/run-e2e-isolated.mjs`、`packages/ai-runtime/src/text-endpoint-config.ts` 零改动。`model-client.ts` 零改动（g7 车道豁免·§1）。

## 4. prove 全键终态（§5.4 全量 · EXIT=0 或 base 同红零回归）

**协议**：runner 键经 `node scripts/run-e2e-isolated.mjs <target>`（每键一次性 disposable pgvector:pg16 隔离容器+nonce attestation+按名单 152 迁移预放·migrate 名单含 model-op02/claim-join/model-cost/failover-price-policy/四 consumer/reconcile 等本刀全部 migrate 键）；非 DB 纯桩键（failover/voice×4/cloud×5/api voice×3）直接 `pnpm -C <pkg> run <key>`。容器计：post 23 + base 对照 7 = 30 只（`--rm` 随 runner 自拆）。

**est live 链记账**：本执行环境零 live provider key（name-only 核查同 1c 收据口径）·本面全键为桩/DB 证明面 → **est live 模型调用 = 0（≤25/run ✓）· 零 .env 写 · Key name-only**。trio 三键不在 §5.4 1d 键面（设计 §5.4 无 trio 列），未执行未记账。

### 4.1 直接键（13 · 全 EXIT=0）

| 键 | 包 | EXIT |
|---|---|---|
| prove:failover | ai-runtime | **0** |
| prove:voice-reliability / prove:vstream / prove:voice-stream-preview / prove:interview-voice-seams | ai-runtime | **0**×4 |
| prove:cloud-readiness / prove:cloud-smoke-fc / prove:cloud-test-fc / prove:cloud-test-ledger / prove:cloud-test-serial | worker | **0**×5 |
| prove:voice-timeout / prove:voice-operation-policy / prove:voice-cancel-http | api | **0**×3 |

### 4.2 runner 键（25 · 绿 19 + base≡red 6）

| 键（runner target） | base @86627721 | post 本刀 | 判 |
|---|---|---|---|
| model-op02:prove:raw | —（绿锚沿 1b/1c 面） | **EXIT=0** | 绿（half-open 桩 AppError 对齐闭环） |
| runtime:claim-join:prove:raw | — | **EXIT=0** | 绿 |
| model-cost:prove:raw | — | **EXIT=0** | 绿（:230 桩对齐闭环） |
| failover-price-policy:prove:raw | — | **EXIT=0** | 绿（:249/:293 桩对齐闭环·cost-policy 冻结特例口零触碰） |
| neg:auth | — | **EXIT=0** | 绿（23505 email_taken 面零变） |
| neg:commerce | EXIT=1（7/83） | EXIT=1（7/83） | **base≡red**（本刀内 base 复跑·PASS/FAIL 签名逐行 IDENTICAL） |
| neg:resume | EXIT=1（12/87） | EXIT=1（12/87） | **base≡red**（同上 IDENTICAL） |
| neg:input | EXIT=1（4/135） | EXIT=1（4/135） | **base≡red**（同上 IDENTICAL） |
| neg:interview | —（1c 终态 97/97 绿锚） | **EXIT=0（97/97）** | 绿（interview.service 三 catch 面+consumer 面回归零） |
| neg:all | EXIT=1 | EXIT=1 | **base≡red**（本刀内 base 复跑·签名 IDENTICAL·同一 neg:commerce 红 lane 中止点） |
| uc002:http / uc002:adv | — | **EXIT=0**×2 | 绿（13 负路径全绿） |
| uc004:career-path | EXIT=1 | EXIT=1 | **base≡red**（本刀内 base 复跑·S2/S3/G-GAP 三失败 IDENTICAL·gap-pin 退役态） |
| uc004:career-path-fault | — | **EXIT=0** | 绿 |
| uc011:report-refund:http | — | **EXIT=0**（50/50） | 绿（payment 23505 否定式双位点门·interview uc 列与 payment 列同键计一次执行） |
| uc018:abandon:http / uc018:adv / uc019:report-regenerate:http | — | **EXIT=0**×3 | 绿（interview_release_failed/interview_abandon_conflict 409 映射面零变） |
| uc025:stale-quiz-expiry | EXIT=1 | EXIT=1 | **base≡red**（本刀内 base 复跑·S1/S3/S4/G-GAP 四失败 IDENTICAL·1c 收据 §7 预存红 lane 同集互证·设计自钉退役态） |
| interview:prove:raw | EXIT=1（7 FAIL） | EXIT=1（7 FAIL） | **base≡red**（本刀内 base 复跑·签名 IDENTICAL——自适应图投影族预存红·graph_fence_lost requeue 面在 FAIL 集外的 PASS 行内同态） |
| quiz:prove:raw / diagnosis:prove:raw / report:prove:raw | — | **EXIT=0**×3 | 绿（legacy_resume_reference_unresolved 分类面零变） |
| commerce-reconcile:prove:raw | — | **EXIT=0** | 绿（双码否定式软置面零变） |
| model-invocation-reconcile:prove:raw | — | **EXIT=0** | 绿 |

**合计**：§5.4 键面 38 键位（direct 13 + runner 25）= **32 EXIT=0 + 6 base≡red（全账·签名级 IDENTICAL·零洗红）**。stale-quiz-expiry 接替绿键 nhp 族与 1c 收据一致沿用（本刀未触其断言面）。

### 4.3 13 处 `e?.code` 零行为变·负测面映射（设计 §2.4 新增断言面=「负测 proves 即断言面」）

| 位点（1d-consumers.md §5） | 覆盖键（本刀终态） |
|---|---|
| auth.service:33（23505） | neg:auth EXIT=0 |
| commerce.service:33（idempotency_key_conflict） | neg:commerce base≡red 同签名（位点所在绿行 PASS 态逐行一致） |
| diagnosis.service:61 / quiz.service:58 / resume.service:100（insufficient_entitlement） | neg:resume/neg:input 同签名 + prove:report/quiz/diagnosis EXIT=0 |
| interview.service:306（insufficient_entitlement） | neg:interview 97/97 |
| interview.service:502（双码→409） | uc018:abandon-http + uc018:adv EXIT=0 |
| resume.service:54/:58/:63（415/422/OCR 重定向） | neg:input 同签名 + prove:report EXIT=0 |
| diagnosis-consumer:40 / quiz-consumer:40（legacy_resume_reference_unresolved） | diagnosis:prove:raw + quiz:prove:raw EXIT=0 |
| interview-consumer:378（graph_fence_lost） | interview:prove:raw base≡red 同签名（requeue/retry 面 PASS 行逐行一致） |

否定式 4 处（payment:77/:120 · db resume:115 · commerce-reconcile:60）照抛分支：uc011-report-refund-http 50/50 + commerce-reconcile + prove:report 绿·非 23505/非两码输入照抛身份零吞。consumer:83 三属性（reason/code/status）：terminalizeUnsettledInterview 面=interview:prove:raw base≡red 同签名内 PASS 行一致 + 构形原样（§1）。

## 5. attempts 台账（全账 · 无 retry-to-green）

| # | 面 | 现象 | 处置 | 终态 |
|---|---|---|---|---|
| 1 | 全仓 `catch (:any)` 消零 | — | 30 位点收窄（§1） | `grep -rn "catch (<ident>: *any)"` 五 src 面 = **0 命中** |
| 2 | worker tsc | 收窄后 4 处 `{}`↔string 折叠类型失配（diagnosis/quiz-consumer、report-worker、interview-service:299） | `(err?.message ?? 'err') as string` 形态铸（运行时逐点同值：`??` 保 nullish 语义·非 string message 现网 producer 不存在·与 interview-consumer:159 既有 `(error as any)` 惯例同族） | worker src 仅剩 2 处 base 预存红（adaptive-lifecycle:136 · production-equivalent-funnel-08-eval:282·stash base 复测同在） |
| 3 | ai-runtime tsc | interview-voice-seams.ts:67/:77 TS7006 ×4 | stash base 复测**同 4 处 base 预存红**（本刀零触碰该文件）·零新增 | base 同红 |
| 4 | api tsc | resume.service:164/:244 TS2347 ×2 | stash base 复测同 2 处（:163/:243·本刀 +1 行位移）·零新增 | base 同红 |
| 5 | neg:commerce/resume/input/all + uc004:career-path + uc025:stale-quiz-expiry + interview:prove:raw | EXIT=1 | 每键本刀内 **base 复跑对照**（同 runner 同协议）·PASS/FAIL 签名 `sort|uniq -c` diff **IDENTICAL** ×7 | base≡red 零回归（预存红 lane·非洗红·零断言改写） |
| 6 | prove:model-op02 首跑 | `database_config_invalid:database_target_missing` | 裸跑缺隔离 env——改经 `run-e2e-isolated.mjs` 隔离门（1c 同协议） | EXIT=0 |
| 7 | pnpm 首跑 | 依赖未装 | `pnpm install --frozen-lockfile` | 后续全键正常 |
| 8 | smoke/adaptive-attack.ts | 收窄后需 `asErr` | 动态 `await import('@meetwise/db')` 随该文件既有动态 import 惯例 | 编译面干净（该 smoke 需 live key·env-blocked·不在 §5.4 键面·零运行） |

## 6. 双席勘误落账（协调方授权内更正）

1. **EXEC 哈希引用更正**：REQUEST rev2（`86627721`）§Status 文内「1c EXEC @6f7e13cb 已完成落地主线 493fc3b8」——`6f7e13cb` 为误引，1c EXEC 实 commit = **`bbf9a962`**（主线 `493fc3b8` 为其 nail；`git log origin/feat/mysql-schema-skeleton` 亲证）。1d-consumers.md §0 已同步落字。
2. **rebase 后五 catch 复测**：rev2 预告「interview.service 五 catch 1c 后实位 facade :157/:305/:501+interview-voice.ts :30/:73」——本刀 rebase 后 tip `86627721` 亲测**五点全部守恒**（形态=catch(:any)×5·1d-consumers.md §0 表）。
3. **计数漂移披露**：设计纪元「30 处/18 文件」→ 本 tip 实测 **30 处/19 文件**（1c 拆 interview.service 5→3+2 生成 interview-voice.ts 新文件·处数守恒·文件数 +1）；1d-consumers.md §1 对账表逐位点落字。
4. **位点补全披露（rev2 处方②的落盘补全）**：tip 现树 msg 轨位点较设计纪元名单新增 report-worker:48 · interview-consumer:189 · interview-voice 七位点（1c 机械迁出）——全列 1d-consumers.md §2 并钉 retain 处置；cloud 漏斗保形的判读通道保留 pin 证据（proof 三文件行级）已落 §2/本收据 §2。

## 7. 零回归佐证（面外静态键）

tsc 三包 src 面 base≡red 对账（§5.2-4）·`git diff --name-only | grep model-client` = 空（g7 车道字节冻结实证）·e2e 三钉 blob 零触碰（§3）。

## 8. STOP

本刀 EXEC 完成 → **`exec:awaiting_post_prove_dual`**。push = `origin line/godfn-1d-apperror`（commit 作者 mw-core）。post-dual 前置：①双席审本收据（§1 收窄面/§2 车道保形论证/§4 全键终态/§5 台账/§6 勘误）②预存红 6 lane 如需翻绿须另刀（非本刀范围）③est live=0 无持钥复跑项（trio 不在 §5.4 1d 键面）。Ban self-approve · alone ≠ dual。

---

*GODFN-1d EXEC receipt · 2026-10-07 · mw-core · base `86627721`（rebase 后 tip）→ 执行树（30 文件 +122/−92）· 30 处 catch(:any) 消零 · g7 车道字节冻结零 diff · 32 绿 + 6 base≡red（IDENTICAL）· est live 模型调用=0 · pins 十一值照抄 · exec:awaiting_post_prove_dual · STOP*
