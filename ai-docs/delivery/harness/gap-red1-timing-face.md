# Harness — G7U · **红① begin/异步 classify 时序面刀**（Line G7U · docs REQUEST · `draft:awaiting_pre_exec_dual` · G7T EXEC sidecar 定谳 + G7S `:79` 预留的独立 REQUEST · 两路线并列交双审 · ≠ 修复 ≠ trio 翻绿）

**Status**: **`draft:awaiting_pre_exec_dual`**（docs REQUEST only · Ban coding · Ban prove 执行 · Ban 实跑 · Ban live（本 turn 零调用零 Key 加载零 DB 连接）· Ban push · Ban fake green · Ban `g7SuiteGreen=true` · Ban 洗绿/Ban retry-to-green · Ban 预选路线（甲/乙并列交双审裁 · 本 REQUEST 零裁决权）· 路线甲 Ban 改产品 · 路线乙 Ban 弱化 fail-closed 门语义 · Ban 夹具强造 route metadata（=masking）· Ban self-approve · alone ≠ dual · 本 commit 不预claim 任何 post-commit EXIT）
**Date**: 2026-10-07
**Line**: **G7U**（G7T POST-PROVE dual BOTH PASS 的 **C-MO-P1** 指名后继：「时序面残留：任何修复（独立夹具刀『等 route_decided 再 begin』或产品面消费时序变更）须新 REQUEST+双审+协调方授权」——本 REQUEST 即该独立 REQUEST；与 G7S `harness/gap-begin-snapshot-supply-fix.md:79` 预留（「夹具刀不在本刀（仅红①时序面合法——recruiting-bound『等 route_decided 再 begin』若需要，属独立夹具 REQUEST…）」逐字闭合）
**授权链**: G7T EXEC（v2 `430d4c84` + 收据 `7979cd20` · sidecar 时序面定谳）→ G7T POST-PROVE dual PASS（mw-rag-route `69e2a5e3` + mw-model-op `7b34f9a8` · C-MO-P1~P4 转后继）→ coordinator G7T nail `7b34f9a8` → **本 REQUEST（docs-only）→ pre-exec dual BOTH PASS（mw-e2e-ha + mw-model-op）→ 协调方授权 coding/EXEC**。双审 PASS ≠ 本 stub 自批 ≠ EXEC 授权 ≠ 路线预选。
**输入事实（只读在案引用）**：G7T EXEC receipt `receipts/gap-route-classify-quality/02-cmd2-ui-attempt2.md` sidecar 时间线——chromium 20:57:08Z `route_pending×1`（发布）→ **20:57:13Z `result_validated` + `route_decided×1`**（publish + 5s：consumer 轮询 5000ms + 模型延迟）→ ~20:57:12–14Z（spec 内推算 · 收据自标）begin 点击 → **binding 零落**；mobile 同形（20:58:03Z pending → 20:58:08Z `result_validated×2` · begin 差 0–2s）；`route_consumption_event=0` / `interview_route_snapshot=0` 贯穿至 20:59:03Z 末读。CMD2 `pnpm e2e:ui:isolated` EXIT=1 ×2（12P/2F/10S · 失败均=红① recruiting-bound ×2 · `:96:14` 30s waitForURL 超时）。classify 质量面已由 G7T v2 修复并 live 复证翻绿（`validation_rejected ×2` → `result_validated ×2` · 零拒分）——**残留红① 纯粹是时序面**。
**Base**: `origin/feat/mysql-schema-skeleton` **`7b34f9a8`**（full `7b34f9a845074c3a046c563c147b40953c369ecd` · fetch 后实测 tip = 预期 ≥`7b34f9a8` 恰等 · 无 turn 内 origin 前进 · tip 即 coordinator G7T nail）· worktree `/Users/miaole/Desktop/golucky/meetwise-line-g7u` · branch `line/g7u-timing-face`
**Pins（原值全抄 · 未动）**: `haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` · `coveredCount=8` · `ms3EqualsR4Closed=false` · **PG-retained** · **公开 DELETE=503**
**Retained（本刀零翻转）**: **`g7SuiteGreen=false`** · trio **OPEN**（G7T 后构成 `1/−/−` · CMD2 EXIT=1 ×2 attempts 如实 · CMD1/CMD3 读数沿 G7S EXEC `a9bc4bcf` EXIT 1/1/1 retained）· 红① **STILL OPEN**（构成已变：classify 面绿 · **时序面残留** = 本刀指名面）· 红③ `e2e/full.e2e.ts:203` 断言面 **另刀 C-MO-P3**（本刀零触碰）· `r1Closed=false` · Disclosure-1 **OPEN** · GAP-G7K-API-REDS **P1 OPEN**（`0c6c3287` 登记 · 不翻 backlog 状态）· `techRoleFailClosedOptOutG7Only=true` · **`actualSpendCny=null`**

---

## 0. 本 turn 只读纪律声明（Ban coding / Ban prove 的证据来源披露）

本 REQUEST 的设计**零实跑、零 live 调用、零 Key 加载、零 DB 连接、零产品码改动、零 spec 改动**，证据全部来自只读：**(a)** 本 worktree git 只读源码亲读（行号一律 @`7b34f9a8`；关键码面 blob `git hash-object` 亲算在卷 §1.2）；**(b)** G7T EXEC 收据 + G7T POST 双审 + G7S REQUEST `:79` 预留（同树在案）引用；**(c)** G7S EXEC/POST、G7R/G7K committed 收据链引用。不发明任何未在案明细；码面行号 EXEC 期按当 tip 重核回填。**spec publish→begin ≈5–6s 步进为 G7T EXEC 收据内 spec 推算值（收据自标）——本 REQUEST 沿用其证据强度标注（推断非硬读数），硬事实=sidecar 决策时间戳 + consumption/snapshot=0 + 30s 超时签名。**

## 1. 根因（G7T EXEC sidecar 时间线定谳承卷 + 本席码面亲读复核 @`7b34f9a8` 全中）

### 1.1 已定谳层（G7T POST dual · 本刀承卷不再重裁）

红① recruiting-bound ×2 的 classify **质量面已修复**（G7T v2 `430d4c84`：`validation_rejected ×2` → `result_validated ×2` · 零 conflict/low_confidence/taxonomy_invalid · `job-route-classifier.ts` blob `79ceded8` 闸零改动）。**残留红① =「begin 早于异步 classify 完成」时序面**（G7T POST C-MO-P1 定谳措辞）：worker consumer **5000ms 轮询 + 模型延迟 ≈5s ≥ spec publish→begin 步进 ≈5–6s** → 双 project 均以 **0–2s 竞差先 begin 后 decided** → begin 是一次性动作（409 后 spec 无重试路径），决策晚到 1–2s 无法被该次 begin 消费 → `route_consumption_event=0`/`interview_route_snapshot=0` 贯穿全程（sidecar 末读硬事实）→ 错误边界「出错了」→ `recruiting-bound.spec.ts:96` 30s `waitForURL` 超时（blob `de4991e6`）。

### 1.2 竞态链码面锚（blob 亲算 @`7b34f9a8`）

| 环 | file:line | blob | 内容 |
|---|---|---|---|
| 发布触发 | `packages/db/src/recruiter.ts`（createJob 语义修订入 `route_pending`） | `d06b4f49` | 建岗 → `job_semantic_revision(route_pending)` → worker classify 漏斗起点 |
| classify 消费 | `apps/worker/src/route-classify-consumer.ts:62-63` | `223b7f09` | `runRouteClassifyConsumer(d, intervalMs = 5000)`——**轮询周期 5000ms** |
| classify 本体 | `packages/db/src/job-route-decision.ts:169-260`（`writeRouteDecided :253-258`） | `a621d8bd` | rules(0 外发)→seam(≤1 外发)→模型→过闸→`route_decided`；失败 → sticky `route_unresolved`（`:14` 模块头「sticky 终态，永不自动重试」· `:179-180` `already_unresolved` noop） |
| begin 复绑 | `packages/db/src/recruiter.ts:396-410` | `d06b4f49` | `:396` 注释「R2 P-LOOP：启动前再试 bind（关闭 apply/invite 早于 classify 的竞态）」→ `:399` `bindApplicationRoute` → `:410` 无 binding → `{status:'interview_ineligible_route'}`（fail-closed · 不创建 interview） |
| snapshot 供给 | `packages/db/src/recruiter.ts:428`（`snapshotInterviewRoute` 全树唯一生产者 · `:429-432` no_binding throw 回滚） | `d06b4f49` | 仅 decided 已到（binding 已落）才可达 |
| 409 映射 | `apps/api/src/modules/jobs/applications.service.ts:42-46` | `9a17cfe4` | `interview_ineligible_route` → HTTP 409（application-start 层拒因前移先例） |
| UI 死窗 | `apps/web/e2e-ui/recruiting-bound.spec.ts:93-96`（`:95` begin 点击一次性 · `:96` waitForURL 30s） | `de4991e6` | 409 → server action throw → 错误边界「出错了」（G7R POST A8 页快照在案）→ 30s 超时 |

**拒因勘误（如实随卷 · 本席主动登记）**：协调方指令措辞「begin 供给面新 409 `candidate_route_undecided`（G7S 落的新拒因前移语义）」与在案 EXEC 定谳存在**面归属差**——红① recruiting-bound 走 **bound 面**（application-start → `recruiter.ts:410`），实际致死拒因 = **`interview_ineligible_route`**（409 映射 `applications.service.ts:42-46`）；`candidate_route_undecided`（`apps/api/src/modules/interview/interview.service.ts:330-336` · blob `fbea8aeb` + `packages/db/src/candidate-route.ts` · blob `8bf8e9bd` · C-MO-S4 事务序）是 G7S 落的**通用面**（`application_id IS NULL`）拒因前移先例。两拒因同属「未决即拒」fail-closed 前移族、语义同构；本 REQUEST 两路线的范围表述按码面实况写清，路线乙的裁定范围（仅 bound 面 vs 双面同构）显式交双审裁。

### 1.3 时序定量（承 G7T EXEC · 证据强度如实）

- 决策到达：publish **+5s**（轮询 5000ms 上界 + 模型延迟；sidecar 实测两 project 均 5s 整）。
- begin 到达：publish **≈5–6s**（spec 步进推算 · 收据自标）→ 竞差 **0–2s**，begin 先到。
- 本质：begin 复绑（`:399`）是 classify 决策的**最后一次消费机会**，其前置等待为零；R2 P-LOOP 注释自证该竞态是已知面（apply/invite 处已关一道、start 处仍有窗口）。

## 2. 修复方案候选（两路线并列 · Ban 预选 · 列触碰面/prove/风险/对既有钉影响 交双审裁 · 双审 + 协调方裁决后方可 EXEC）

**全路线通用铁律**：worker fail-closed 角色门（`adaptive-role-resolve.ts` blob `80abbb80`）零改动——缺行/缺叶仍拒；`validateModelRouteOutput`（blob `79ceded8`）质量闸零松动；sticky `route_unresolved` 永不自动重试语义零私改（G7T §5.5）；已占用行断言零触碰（uc018 `e2e/full.e2e.ts` blob `7d65d0f3` 零 diff · 红③ `:203` = C-MO-P3 另刀）；withhold 机制（`run-e2e-isolated.mjs` blob `13dbfc43`）零触碰。

### 路线甲（夹具刀）：spec 侧造数时序修正——publish 后等待 classify decided 再 begin

**定义**：`recruiting-bound.spec.ts` 在 begin 点击（`:95`）前新增「等 route_decided」只读等待步骤（轮询 route 决策可观测面，short-poll ≤N 秒）；**Ban 改产品**。属「测试夹具对齐产品真实时序」——产品语义零变更，spec 只是把 begin 点击放到产品设计意图的可成交时点（decided 之后），使 trio 能考察下游完整旅程（6 题真实模型面）。

- **触碰面精确清单**：恰 `apps/web/e2e-ui/recruiting-bound.spec.ts`（blob `de4991e6`）一文件——begin 前新增等待步骤；**既有断言零改动零删除零弱化**（`:96` waitForURL 30s 原样保留；EXEC 收据须含「既有断言行逐行全等 + 仅新增等待步骤」机检）。产品码全链零触碰（EXEC 收据含 §1.2 产品面 blob 链前=链后全等机检）。
- **观测通道（EXEC 期甄别 · 双审首责）**：(a) 既有产品 API 是否暴露 route 决策状态——初判 `GET /applications`（spec `:102` 已用旁证通道）仅返 `id/status/interview_id`，**无 route 决策暴露**；若确认无 → (b) spec 内 SELECT-only DB 轮询，沿 G7T EXEC sidecar 白名单先例（`job_semantic_revision.status` / `job_route_decision.attempt_outcome` · Ban `interview_job.payload` / `ai_invocation_trace.output` · 只读零写）。**spec 内直连 DB 为 e2e 形态新增，须双审显式批准后方可 EXEC**；两通道均不成立时本路线退回重设计（Ban 就地改产品兜底）。
- **edge（等待上限与超时语义）**：轮询周期 1–2s、总上限 N 秒（建议 ≤60s · EXEC 定值入收据）；**超时 = spec 诚实 FAIL**（五分类按 env/fixture 面归类），Ban 静默 skip、Ban 无限等待（suite 挂死）、Ban begin 409 后重试点击（begin 一次性语义保持）；fresh-run 每 run 随机后缀建新岗 → 无 sticky 存量负担（G7T 既有结论承卷）。
- **prove 方案**：trio 复跑 CMD2 主证（§3）；sidecar 时间线读数=decided 时间戳先于 begin 时间戳、`route_consumption_event` ≥1/project、`interview_route_snapshot` ≥2。
- **风险**：(a) 轮询等待使 CMD2 墙钟 +最多 N 秒（预算/时长如实记）；(b) 观测通道若走 spec 内 DB 轮询，形态合法性依赖双审批准；(c) **诚实性残余：夹具对齐 ≠ 产品修复**——真实用户在 0–2s 未决窗口点击 begin 仍得 409「出错了」（无重试引导），该产品面观察如实披露于 EXEC 收据，是否立 backlog 行交协调方（Ban 本刀自翻 backlog）。
- **对既有钉的影响**：零断言改动（occupied 行零触碰）；产品语义零变更 → 无 uc018/幂等/额度面论证负担；红① 清除读数 = e2e face 翻绿，产品时序残余以披露形式在卷（非洗绿——e2e 断言的谓词未变，变的是夹具到达时点）。

### 路线乙（产品面）：begin 消费时序语义变更——未决 409 改 **202 accepted + 异步补供给**

**定义**：begin 对 route 未决不再同步 409 fail-closed 拒绝，改 **202 accepted + 异步补供给**——begin 受理面试（保留面试壳 + 幂等锚），worker/classify decided 后由补供给路径落 snapshot 再入队 start job。属「产品对未决窗口的宽容」，是产品语义演进。

- **触碰面精确清单（候选 · EXEC 按双审裁决版）**：`packages/db/src/recruiter.ts`（`startApplication :396-431` 未决分支改 awaiting 面延后 bind/snapshot）；`apps/api/src/modules/jobs/applications.service.ts:42-46`（`interview_ineligible_route` 409 → 202 语义）；`packages/db/src/candidate-route.ts` + `apps/api/src/modules/interview/interview.service.ts:330-336`（通用面 `candidate_route_undecided` 是否同构 202——**范围交双审裁：仅 bound 面 vs 双面同构**）；`apps/worker/src/route-classify-consumer.ts`（`writeRouteDecided` 后补 snapshot + 入队 start job 的完成路径）；必要新 migration（awaiting 状态/延迟入队结构 · **additive-only** 铁律）。**零触碰**：`adaptive-role-resolve.ts`（门零动）/ `job-route-classifier.ts`（闸零动）/ `recruiter.ts:428` snapshot 唯一生产者语义保持（补供给仍走 `snapshotInterviewRoute` 同一结构）/ uc018 断言（blob `7d65d0f3` 零 diff）。
- **零影响论证义务（沿 B'' begin 语义先例 · 双审首责）**：B'' = GAP-UC025-NEG-01 begin 真收 quiz-id + `stale_quiz` 409 前移接线（coverage matrix `:125` 在案 · 双审 `a2519e0`+`62683e6`）——同类 begin 语义演进须逐项论证零影响：(a) **uc018 断言零影响**：「begin 202 + 额度 -1」必须原样成立 → **扣额时序须仍在 begin 事务内同步 `reserveEntitlement`**（Ban 移到完成时点）；(b) **幂等零回归**：awaiting 窗口内重复 begin → 幂等 202 同 interview（零双扣零双入队）；(c) **RLS/授权不弱化**：awaiting 行 owner 谓词、worker 补供给完成路径 owner-scoped 读解密同 `candidate-route.ts` 既有纪律；(d) **fail-closed 门零弱化**：worker 角色门缺行/缺叶仍拒——**未决 202 是「受理后补」非「跳过校验」**；(e) **sticky 死端显式化**：classify `validation_rejected`/`known_not_sent` sticky（`:179-180` 永不自动重试）→ awaiting interview 永不完成的产品终态语义（状态/SSE `interview_unavailable`/额度退款路径）必须显式设计——Ban 静默挂起、Ban 给 sticky 加自动重试（本 REQUEST 不预claim 该设计，EXEC 裁决版落字）；(f) **SSE/UX 窗口语义**：202 返回 interviewId 后、start job 延迟入队期间 `/interview` 页 SSE 的等待语义须产品定谳（Ban 以 `interview_unavailable` 洗等待窗）。
- **prove 方案**：trio 复跑 CMD2 主证（§3）+ CMD1 iso 面 uc018「begin 202 + 额度 -1」读数如实（回归主证）；产品 proof（worker route-classify proofs / 幂等 / 额度 / awaiting 补供给死端）按裁决触碰面 EXEC 期定；sidecar 读数=202 后 decided → 补 snapshot → 入队 start job 全链事件流。
- **风险**：触碰面最大（API+DB+worker 三层 + DDL）；异步状态机/退款死端/UX 窗口三面新语义；`recruiter.ts` 被触碰 → G7S 供给链零回归论证负担（`recruiter.ts:428` 语义保持机检）；预算面与甲同（≤200）。
- **对既有钉的影响**：uc018 断言零触碰但**近旁**（begin 202 语义正是 uc018 断言面）→ (a)~(f) 论证义务最重；红① 清除读数 = 产品面真修复（真实用户未决窗口也不再 409）；Disclosure-1/G6/R5 独立核算不受影响。

### 排序

**本 REQUEST 不排序不预选**（Ban 预选）——两路线并列完整呈现，交 mw-e2e-ha + mw-model-op 双审 + 协调方裁决。既有在案语义参考（非本席裁决）：G7S POST 排序先例 = 产品刀（通用收口）＞夹具刀（仅红①时序面合法）；G7T POST C-MO-P1 措辞 = 「独立夹具刀…或产品面消费时序变更」两形态并列为合法后继。裁决后果：选甲 → EXEC 触碰面=恰 spec 一文件；选乙 → EXEC 须按 (a)~(f) 论证清单逐项落字后方可 coding。

## 3. prove 方案（选定路线 EXEC 后 trio 复跑 · pre-exec dual BOTH PASS + 协调方授权后执行）

1. **trio 复跑三 CMD 各恰好一次**（iso→ui→perf）：`pnpm e2e:isolated`（wiring `package.json:278`，blob `0afb3bd2`）/ `pnpm e2e:ui:isolated`（`:279`）/ `pnpm verify:e2e-performance`（`:282`）；EXEC 按当 tip 重核 wiring 行号回填；committed SHA 重钉 + frozen-lockfile + 独立 worktree；单条 CMD 内部重试按自身契约算一次 attempt（Ban 临时调高）；**七字段逐 attempt 全记录**（CMD 原文/EXIT/时间戳/实跑 code SHA/Key presence name-only/关键输出/预算），退出码/machine receipt/原始 log 三来源交叉一致。
2. **CMD2 主证（红①清除判据）**：recruiting-bound 双 project PASS → **14P/0F/10S 或同等**（10S=capability skip ≠ green 沿既有口径）；sidecar SELECT-only 白名单轮询（沿 G7T EXEC 先例 · 2s 周期 · 时间线在卷）证明时序面修复读数（甲：decided 先于 begin + consumption/snapshot 落行；乙：202 后 decided→补 snapshot→入队事件流）。
3. **CMD1/CMD3 读数如实**：红③ `full.e2e.ts:203` 断言面=C-MO-P3 另刀零触碰；非本刀指名面的红 → 逐 case 五分类归因，Ban 黏连归咎本刀。
4. **attempts 全记录 · Ban retry-to-green**：EXIT 原值逐档留档；仍红 → EXIT=1 原值 + 五分类 + 根因假设修正如实登记 → 迭代刀重走 REQUEST；Ban flake 记法（时序竞差可定性 FAIL 原因但不冲销 EXIT=1）· Ban 只留绿 attempt · Ban 假绿。
5. **预算与 Key 卫生**：≤200 次 live 调用（沿 G7K/G7R/G7S/G7T 口径）；超限即停如实记中止（不洗 not_run）；**`actualSpendCny=null`**（无计价数据源 · Ban invented spend）；Key 只经进程环境（`~/.meetwise-secrets/load-model-api-key.sh` loader name-only）· **Ban 写任何 `.env*`** · `.env*` ABSENT presence 逐 attempt 记录 · Ban Key 值/fingerprint 入 receipt/log/commit。
6. **收据落点**：`receipts/gap-red1-timing-face/`（3 per-CMD + SUMMARY + 时序面定谳段 + sidecar 时间线）。

## 4. EXIT 契约（双向）

- **红①清除**（CMD2 recruiting-bound 双 project PASS）→ 本刀指名面收据成立；**trio 翻绿 ≠ suite green**——`g7SuiteGreen` 翻转 = 三绿 + post-dual BOTH PASS + 协调方 nail 全链（缺一不可；G6 OPEN / R5-MARKED-RED / Disclosure-1 OPEN / GAP P1 独立核算）。
- **仍红** → EXIT=1 原值 + 逐 case 五分类明细 + 根因假设修正如实登记 → 迭代刀重走 REQUEST；**Ban flake 记法 · Ban retry-to-green · Ban 只留绿 attempt · Ban 假绿**；recruiting-bound 既有断言（`:96` waitForURL 等）零触碰（甲的等待步骤为**新增**非改写）。
- 本 REQUEST（docs turn）不预claim 任何 post-commit EXIT、不预claim 路线裁决结果。

## 5. Ban 清单（本 turn 与 EXEC 默认 plan 全量）

1. **Ban coding**（本 turn docs-only；EXEC 期 coding 须 pre-exec dual BOTH PASS + 协调方授权，触碰面按双审裁决版路线）。
2. **路线甲 Ban 改产品**：EXEC 期产品码全链 blob 链前=链后全等机检强制；Ban 借夹具刀顺手改产品语义；Ban 夹具等待步骤演变为断言放宽。
3. **路线乙 Ban 弱化 fail-closed 门语义**：`adaptive-role-resolve.ts` 门/默认 ON、`validateModelRouteOutput` 闸、sticky 永不自动重试，三者零改动零松动；**未决 202 是「受理后补」非「跳过校验」**——EXEC 收据须逐项论证 RLS/授权/扣额时序不弱化（§2 乙 (a)~(f) 清单）；Ban 静默挂起 awaiting 死端。
4. **Ban masking**：夹具强造 route metadata / 伪造 decision/binding/snapshot 行 / 测试侧直插 route_decided = 捏造产品不可能状态；**只读轮询合法，任何写入非法**。
5. **Ban covered/SSOT 行翻转**（nail 阶段才改）；GAP-G7K-API-REDS backlog 状态行（`0c6c3287` 登记）不翻；本刀不自行立红① 时序残余 backlog 行（§2 甲风险 (c) 交协调方）；sibling 归档（G7K/G7R/G7S/G7T/F-F 等）零改写。
6. **Ban 碰已占用行**：uc018 `e2e/full.e2e.ts`（blob `7d65d0f3`）零 diff；红③ `:203` 断言面（C-MO-P3 另刀）零触碰；occupied 断言面（018/052/025/004/011/014/026/002/001/028/016/017）零触碰；withhold 机制（`13dbfc43`）冻结。
7. **Ban 洗绿**：retry-to-green / flake 记法 / 只留绿 attempt / 假绿 / `g7SuiteGreen=true` 未达全链即写。
8. **Ban Key 物料越界 / Ban push / Ban self-approve / alone ≠ dual**。

## 6. Non-claims

Not a pass · not run（本 REQUEST 零实跑）· not fixed · not coding · not 路线裁决（甲/乙并列 · 双审 + 协调方裁决权 · 本席 Ban 预选）· not 观测通道定谳（spec 内 DB 轮询合法性留双审）· not trio green · not suite green · not R1 closed · not Disclosure-1 closed · not G6 closed · not R5 retired · not HA · not covered · not `releaseEvidence=true` · not nail · not backlog 状态翻转 · not live（本 turn）· not coordinator authorize · 红③ C-MO-P3 不在本刀 · 真实用户未决窗口产品残余处置（backlog 立行与否）不在本刀 · `g7SuiteGreen=false` · trio OPEN（`1/−/−` · CMD2 ×2 attempts 如实 retained）· 红① STILL OPEN（时序面构成）· `actualSpendCny=null` · alone ≠ dual

---
*Harness · G7U 红① begin/异步 classify 时序面刀 · 2026-10-07 · `draft:awaiting_pre_exec_dual` · docs-only · 定谳承卷=worker 轮询 5000ms + classify 延迟 ≈5s ≥ spec publish→begin ≈5–6s → 0–2s 竞差先 begin 后 decided → consumption=0/snapshot=0 → bound 面 `interview_ineligible_route` 409（候选面 `candidate_route_undecided` 为 G7S 前移先例 · 勘误随卷）→ 30s 超时 · 路线甲=夹具等待刀（Ban 改产品 · 观测通道双审裁）／路线乙=未决 202+异步补供给（沿 B'' 先例 · (a)~(f) 零影响论证义务 · Ban 弱化门语义）并列交双审 · trio ×1 各一次 · CMD2 主证 14P/0F/10S 或同等 · 预算 ≤200 · C-MO-P1 + G7S `:79` 双预留闭合 · STOP*
