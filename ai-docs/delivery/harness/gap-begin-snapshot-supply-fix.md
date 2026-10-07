# Harness — G7S · **通用 begin 供给面收口产品刀**（Line G7S · docs REQUEST · `draft:awaiting_pre_exec_dual` · F-F 甄别 + model-op 双审裁决的根因修复刀 · ≠ 修复 ≠ trio 翻绿）

**Status**: **`draft:awaiting_pre_exec_dual`**（docs REQUEST only · Ban coding · Ban prove 执行 · Ban 实跑 · Ban live（本 turn 零调用零 Key 加载零 DB 连接）· Ban push · Ban fake green · Ban `g7SuiteGreen=true` · Ban 洗绿/Ban retry-to-green · Ban 为绿改产品（修复方案仅登记 · EXEC 期 coding 须 pre-exec dual BOTH PASS + 协调方授权）· Ban 门弱化回 legacy 兜底 · Ban 碰已占用行 · Ban self-approve · alone ≠ dual · 本 commit 不预claim 任何 post-commit EXIT）
**Date**: 2026-10-07
**Line**: **G7S**（F-F post-dual BOTH PASS `d4580d6c`(mw-model-op) + `0d97d7be`(mw-e2e-ha) 之后的根因修复产品刀；G7R 三红 EXIT 1/1/1 与 GAP-G7K-API-REDS P1 OPEN retained）
**授权链**: F-F EXEC receipt `3da3f0cb`（实跑 code SHA `7ed35f0d`）→ F-F POST-PROVE dual PASS（mw-model-op `d4580d6c` · 根因归类裁决 H0-alt-5·d=**产品供给面缺口** + mw-e2e-ha `0d97d7be` · C-HA-FF-1~8 全兑现）→ **C-MO-Q1~3 转产品刀 REQUEST 硬义务** → 本 REQUEST（docs-only）→ **pre-exec dual BOTH PASS（mw-e2e-ha + mw-model-op）→ 协调方授权 coding/EXEC**。双审 PASS ≠ 本 stub 自批 ≠ EXEC 授权。
**输入事实（只读在案引用）**：F-F 四查询读数（`last_error=adaptive_role_route_missing` ×2 / classify succeeded ×2 / `ai_invocation_trace`=2 / interview failed=2 · 525 ok 轮 + 32 仪器错误行如实）；Q1=2/Q4=2 唯一自洽归因 = **uc018 通用面 ×2**（两 project uc018 均死于 `full.e2e.ts:139` abandon 409，其 begin 202 + 额度断言全过 = start job 必曾成功入队）；红① recruiting-bound ×2 begin 未入队（application-start 层 `interview_ineligible_route`，`recruiter.ts:399-410`）张力维持回协调方（C-MO-Q2）。
**Base**: `origin/feat/mysql-schema-skeleton` **`91f1c751`**（full `91f1c751eaa30a4352d0708a02dc1048128c88a1` · fetch 后实测 tip；初 fetch tip `0d97d7be`，turn 内 origin 前进恰一笔 = coordinator F-F nail `91f1c751`（docs-only · `execution-master-checklist.md`+`gap-bug-backlog.md` append-only +13/−0 · 恰登记本刀义务「修复=新 REQUEST+双审+EXEC (C-MO-Q1~3)」）→ 本 REQUEST rebase 重钉至 `91f1c751`；nail 仅 ai-docs 两文件，§1 全部码面 blob 锚按新 tip 复算**零漂移**（`80abbb80`/`7b1b6713`/`257718cf`/`a621d8bd`/`d06b4f49`/`0afb3bd2`/`13dbfc43` 全等））· worktree `/Users/miaole/Desktop/golucky/meetwise-line-g7s` · branch `line/g7s-snapshot-supply`
**Pins（原值全抄 · 未动）**: `haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` · `coveredCount=8` · `ms3EqualsR4Closed=false` · **PG-retained** · **公开 DELETE=503**
**Retained（本刀零翻转）**: **`g7SuiteGreen=false`** · `r1Closed=false` · `techRoleFailClosedOptOutG7Only=true` · Disclosure-1 **OPEN**（C-MO-Q3：保持 OPEN 至供给面实际修复）· trio **OPEN**（EXIT 1/1/1 真实业务红）· GAP-G7K-API-REDS **P1 OPEN**（`0c6c3287` 登记 · 本刀不翻 backlog 状态）· **`actualSpendCny=null`**

---

## 0. 本 turn 只读纪律声明（Ban coding / Ban prove 的证据来源披露）

本 REQUEST 的设计**零实跑、零 live 调用、零 Key 加载、零 DB 连接、零产品码改动**，证据全部来自只读：**(a)** 本 worktree git 只读源码亲读（行号一律 @`91f1c751`——rebase 重钉 tip；码面与初 fetch tip `0d97d7be` 全等（nail 仅 ai-docs），锚文件 blob `git hash-object` 亲算在卷）；**(b)** F-F 收据 + 双审 POST 段（同树在案）引用；**(c)** G7K/G7R committed 收据链引用。不发明任何未在案明细；码面行号 EXEC 期按当 tip 重核回填。

## 1. 根因（model-op 双审裁决 · 本席码面亲读复核 @`91f1c751`（=初 fetch tip `0d97d7be` 码面全等）全中）

**双审裁决原文引用（F-F POST mw-model-op `d4580d6c` §C.2/§C.3）**：「『classify succeeded 而 snapshot 缺叶』定谳=产品供给面缺口非夹具缺口」；修复排序 = **产品刀（通用 begin 供给面收口——门语义零弱化）＞夹具刀（仅红①时序面合法）＞opt-out=0+披露（仅临时·never R1）**；一律 Ban 门弱化回 legacy 兜底。

### 1.1 门与传播链（blob 亲算锚）

| 环 | file:line @`91f1c751` | blob | 内容 |
|---|---|---|---|
| 门开关 | `apps/worker/src/adaptive-role-resolve.ts:35-39` | `80abbb80` | `isTechRoleFailClosedEnabled`：unset/blank → **ON**（默认 ON；仅精确 `0\|false\|off` → legacy） |
| 门本体 | 同上 `:55-62` | `80abbb80` | `fromRoute = roleFromRouteSnapshot ?? roleFromJobRouteMetadata`；flag ON 且双缺 → `throw adaptive_role_route_missing`（`:59-61`） |
| legacy 兜底 | 同上 `:63` | `80abbb80` | 仅 flag OFF 走 `roleFromDeps ?? LEGACY_TECH_ROLE_DEFAULT`（`:15` `'技术岗'`）；`:23-28` 明文 roleFromDeps **不**满足门 |
| 消费点 | `apps/worker/src/interview-consumer.ts:248-253` | `7b1b6713` | start job 处理前 `getInterviewRouteSnapshot` 装载（G-R2-5 retrieve 共用读侧） |
| 死源 | 同上 `:343-344` | `7b1b6713` | `roleFromRouteSnapshot`/`roleFromJobRouteMetadata` 声明；`:345-350` 仅 snapshot 面赋值，**`:344` 全文件仅 `:344`/`:353` 两笔 = 声明后从未赋值（死源）** |
| resolver 调用 | 同上 `:351-356` | `7b1b6713` | `:356` `startAdaptiveInterview` **之前** resolve → throw 传播 `:370-381` catch-all → `failClaimedInterviewJob :155-168` → `markJobFailed`（`packages/db/src/interview-jobs.ts:214-217` `last_error=error.slice(0,500)`）→ `terminalizeUnsettledInterview :77-96`（`:93` SSE `interview_unavailable{kind:start,reason:job_failed}`） |

### 1.2 供给链全景（classify→bind→snapshot→consume 四跳 · 唯一生产者）

| 跳 | 环节 | 位置 | 说明 |
|---|---|---|---|
| ① classify | worker `route-classify-consumer.ts:29-39`（blob `223b7f09`）→ `classifyJobRoute`（`packages/db/src/job-route-decision.ts:169-260`，blob `a621d8bd`） | job 维度 | rules(0 外发)→seam(≤1 外发)→`validateModelRouteOutput`（`packages/domain/src/job-route-classifier.ts:115`，blob `79ceded8`；`allocs.length<1 → invalid_schema` `:123` + 叶正则/taxonomy/bps 合计 10000 `:129-139`）→ `writeRouteDecided` `:253-258`。**route_decided 决策必带 ≥1 有效叶 →「有 snapshot 而叶空」产品链不可达**（双审裁决 · 本席复读全中） |
| ② bind | `bindApplicationRoute`（`job-route-decision.ts:285-313`）← recruiter.ts `:148`/`:342`/`:399`（blob `d06b4f49`） | **application 维度** | 复制最新 route_decided allocations → `application_route_binding`；**三个调用点全部在 recruiter-flow** |
| ③ snapshot | `snapshotInterviewRoute`（`job-route-decision.ts:321-344`，INSERT 见 `:332-336`） | **唯一生产者 = `recruiter.ts:428`**（recruiter beginInterview 事务内；`:429-432` `no_binding` → throw `interview_ineligible_route` 回滚） | 全树唯一调用点（grep 机检 + api 侧 `interview.service.ts` 全文 0 笔引用，blob `257718cf`） |
| ④ consume | `getInterviewRouteSnapshot`（`job-route-decision.ts:354-369`）→ worker 门（§1.1） | interview 维度 | 读 `interview_route_snapshot` |

### 1.3 断点定位（REQUEST 硬交付 · 一句话）

**classify→snapshot 链的断点在「binding→snapshot」跳的通用面缺位：`snapshotInterviewRoute` 全树仅 `recruiter.ts:428` 一处调用（且前置要求 recruiter-flow 的 `application_route_binding` 行），通用 `begin()`（`apps/api/src/modules/interview/interview.service.ts:192-340`）从幂等检查 `:307-326`、扣额 `:328-334` 到入队 `:337` 之间零 snapshot 写，且通用 interview 自 `create():587` 裸壳 INSERT 起即无 `application_id`/`job_id` 祖先（begin `:295` 还显式要求 `application_id IS NULL`）——classify 纵然 succeeded（`job_route_decision` 已落 route_decided），其 allocations 在通用面上**不存在任何一条通向 `interview_route_snapshot` 的代码路径**：非「链断在中段」，而是「该面结构性无链」（结构性零写）。**

三证据：(a) F-F Q1 两行 `adaptive_role_route_missing` 与 Q4 两行 failed 唯一自洽归因 uc018 通用面 ×2（双审 §C.2）；(b) `validateModelRouteOutput` 使「有 snapshot 而叶空」不可达 → throw 只能来自 snapshot 行不存在；(c) 死源 `:344` 为第二处供给缺口（OB-MO-P1）。

**DDL 硬约束发现（本席新增 · 影响全部供给候选）**：`packages/db/migrations/0104_job_route_decision.sql:161-173`——`interview_route_snapshot.application_id text NOT NULL` + `job_id text NOT NULL` + `FOREIGN KEY (application_id) REFERENCES application_route_binding(application_id)` + `allocations` CHECK（1..4 叶）+ `status` CHECK（仅 `'interview_snapshotted'`）。**通用面 interview（无 application/job）现结构下无法落行**；任何 snapshot 供给候选必涉 DDL 演进（新 migration 放宽/新表/新 decision-kind），且**伪造 `application_route_binding`/application 行 = 捏造产品不可能状态 = masking，Ban**。

## 2. 修复方案候选（≥2 · 列利弊交双审 · 双审 + 协调方裁决后方可 EXEC）

**门语义零弱化铁律（全候选通用）**：`adaptive-role-resolve.ts` fail-closed 门零改动——snapshot 缺行/缺叶仍拒；`MEETWISE_TECH_ROLE_FAIL_CLOSED` 默认 ON 零翻转；**修的是「供给缺失」，不是「放松门」**。Ban 产品码内任何回 legacy `'技术岗'` 兜底的路径（重新打开 G-R4-3/R1 刻意关闭的静默桶）。`:344` 死源（接线或删除）随选中候选并案处置（OB-MO-P1）。

### 候选 A（本刀推荐候选）：begin 同步供给 + 前置 eligibility fail-closed 镜像 + 死源并案

begin 事务内为通用面 interview 产出真实 route 决策并落 `interview_route_snapshot`（复用 §1.2 四跳语义），随后才 `reserveEntitlement`/`enqueueInterviewJob`；无决策/歧义/供给失败 → begin 同步 409 fail-closed（镜像 recruiter 面 `interview_ineligible_route`，`recruiter.ts:410`/`:429-432` 先例）。**必含 DDL 演进**（§1.3 硬约束）。
- **决策输入源（双审首责 · 本刀不预claim）**：通用面当前码面仅有 resume 结构化 facts / sourceQuizId 工件 / （无 job posting）——classify 输入源须产品定谳（resume 派生 vs quiz 工件 vs 用户显式选 track）；**Ban 用 resume 内容强造 job-posting 语义**（masking 风险，须双审裁）；规则层（0 外发）优先于模型外发（预算面）。
- **利**：唯一根因修复；门语义零动；begin 202 契约保持（uc018 既有断言「begin 202 + 额度 -1」零改 = occupied 行只红转绿）；供给先于扣额/入队，失败即回滚零悬账；与 recruiter 面同构（同一 snapshot 表同一读侧）。
- **弊**：DDL 演进面（0104 表 NOT NULL/FK/CHECK）；begin 路径新增决策步骤（若走模型 = live 面增大、若走规则 = 覆盖面问题：歧义即 409，产品 UX 代价）；classify 输入源语义需产品裁决。
- **触碰面精确清单（候选 A · EXEC 期以双审裁决版为准）**：`packages/db/migrations/01xx_*.sql`（新 migration：通用面 snapshot 落行结构）+ `packages/db/src/job-route-decision.ts`（通用面决策+snapshot 写函数；既有 recruiter 函数零改）+ `packages/db/src/index.ts`（导出）+ `apps/api/src/modules/interview/interview.service.ts`（begin 事务供给步骤 + fail-closed 409 错误码）+ `apps/worker/src/interview-consumer.ts:344`（死源接线或删除）+ 必要时 `packages/domain/src/job-route-classifier.ts`（若复用规则层）。**零触碰**：`recruiter.ts`（唯一既有生产者零回归）、`adaptive-role-resolve.ts`（门零动）、`route-classify-consumer.ts`、`0104` 既有行（新 migration 追加不翻历史）。

### 候选 B：worker start-job 侧补写

worker 领 start job 发现无 snapshot 时，在同一处理流内先跑供给步骤落 snapshot 再 resolve role；仍无决策 → 门照常 throw（门零动）。
- **利**：API 契约零改；供给点紧邻消费点。
- **弊**：供给晚于扣额（begin 已 `reserveEntitlement`，失败走退款/`failClaimedInterviewJob` 链，悬账面大）；job lease 内新增模型/DB 延迟；写侧从 API 移到 worker 破坏「snapshot 在启动事务写」的既有结构语义（`job-route-decision.ts:317-319` 注释）；重试/幂等面复杂化；同样必涉 DDL 演进。

### 候选 C：begin 前置 classify（interview 维度复用 route_pending→classifyJobRoute 异步漏斗）

为 interview 建语义修订入 `route_pending`，由 route-classify-consumer 异步分类后落 snapshot，start job 消费。
- **利**：完全镜像既有漏斗状态机与 sticky 语义。
- **弊**：**异步竞态恰是现红时序面**（start job 可能先于 classify 被 claim → 照 throw）；interview→job_posting 语义修订映射结构不存在（需 DDL + 新输入源）；复杂度最高；不满足「供给先于消费」。

### 候选 D（默认不选）：显式范围决策（通用面不入 adaptive）

begin 对无 route 源的通用面同步 409 / 改走非 adaptive 流——把 throw 从 worker 异步面提前到 begin 同步面（双审 §C.3 提及的形态之一）。
- **Ban 依**：改 uc018 等已占用用例的可观察行为 = 须改其断言 = occupied 行零触碰铁律冲突；单独成立时不构成 trio 翻绿路径。仅当双审 + 协调方显式裁定 product-scope 变更合法时重开。

**排序（沿双审裁决）**：A ＞ B ＞ C ＞ D；夹具刀不在本刀（仅红①时序面合法——recruiting-bound「等 route_decided 再 begin」若需要，属独立夹具 REQUEST；通用面强造 metadata = masking Ban）；opt-out=0 仅 G7 临时 + Disclosure-1 持续披露 + never R1 + **Ban 记作修复**（C-MO-Q3）。

## 3. prove 方案（修复 EXEC 后 trio 复跑 · pre-exec dual BOTH PASS + 协调方授权后执行）

1. **三 CMD 各恰好一次**（iso→ui→perf）：`pnpm e2e:isolated`（wiring `package.json:278`，blob `0afb3bd2`）/ `pnpm e2e:ui:isolated`（`:279`）/ `pnpm verify:e2e-performance`（`:282`）；EXEC 按当 tip 重核 wiring 行号回填（C-HA 惯例）。committed SHA 重钉 + frozen-lockfile + 独立 worktree；单条 CMD 内部重试按自身契约算一次 attempt（Ban 临时调高）；**七字段逐 attempt 全记录**（CMD 原文/EXIT/时间戳/实跑 code SHA/Key presence name-only/关键输出/预算），退出码/machine receipt/原始 log 三来源交叉一致。
2. **预算 ≤200 次 live 调用**（沿 G7K/G7R 口径）；**诚实预披露：修复生效后 live 面较 F-F（live=2）显著增大**——uc018 start job 由秒抛改为真实 adaptive 生成（competency planning + question generation 全展开 ×2 project ×2 CMD 面）；额度上限以协调方 EXEC 指令为准，超限即停如实记中止（不洗 not_run）；voice/OCR/ASR/TTS capability skip = 0 调用 ≠ green；**`actualSpendCny=null` 沿 I 线**（无计价数据源 · Ban invented spend）。
3. **Key 卫生沿 G7K/G7R C-K6/C-MO-5/6 全量**：Key 只经进程环境（`~/.meetwise-secrets/load-model-api-key.sh` loader name-only）· **Ban 写任何 `.env*`** · `.env*` 三文件 ABSENT presence 逐 attempt 记录 · Ban Key 值/fingerprint 入 receipt/log/commit。
4. **读取面板扩查（C-MO-Q2 硬义务）**：EXEC 期在 F-F 四查询基础上新增授权查询——`job_route_decision`（route_decided 分布）/ `route_consumption_event`（binding/snapshot 事件流）/ `interview_route_snapshot`（行分布）——用于红①归因（classify succeeded revision vs begin 时序）与修复生效面读数；**Ban 沿用 F-F 四查询读数就地定谳红①**。查询面板与 keep-window 机制沿 F-F sidecar 先例（SELECT-only 白名单 · Ban `interview_job.payload` / `ai_invocation_trace.output`），EXEC 指令落字。
5. **收据落点**：`receipts/gap-begin-snapshot-supply-fix/`（3 per-CMD + SUMMARY，含修复生效定谳段与红①归因段）。

## 4. EXIT 契约（双向 · 沿 G7R/G7K）

- **三绿** → trio 翻绿收据成立；**`g7SuiteGreen` 翻转 = 三绿 + post-dual BOTH PASS + 协调方 nail 全链**（缺一不可；trio 绿 ≠ suite green——G6 OPEN / R5-MARKED-RED / Disclosure-1 OPEN / GAP P1 独立核算）。
- **仍红** → EXIT=1 原值 + 逐 case 五分类明细 + 根因假设修正如实登记 → 迭代刀重走 REQUEST；**Ban flake 记法（env-gap/时序可定性 FAIL 原因但不冲销 EXIT=1）· Ban retry-to-green · Ban 只留绿 attempt · Ban 假绿**。uc018 面（trio UI 面经过的已占用用例）只许「红转绿」，**Ban 改其断言**。
- 本 REQUEST（docs turn）不预claim 任何 post-commit EXIT。

## 5. Ban 清单（本 turn 与 EXEC 默认 plan 全量）

1. **Ban coding**（本 turn docs-only；EXEC 期 coding 须 pre-exec dual BOTH PASS + 协调方授权，触碰面按 §2 候选裁决版）。
2. **Ban 门弱化/legacy 兜底回潮**：`adaptive-role-resolve.ts` 门语义/默认 ON 零改动；Ban 产品码内回 `'技术岗'` 静默桶；Ban 借 `roleFromDeps` 绕门；Ban `MEETWISE_TECH_ROLE_FAIL_CLOSED=0` 记作修复（仅 G7 临时 opt-out + 持续披露 + never R1）。
3. **Ban 洗断言/假绿**：Ban 为绿改 spec 断言（occupied 行 018/052/025/004/011/014/026/002/001/028/016/017 面零触碰——trio UI 面经过部分用例，只许红转绿）；Ban 改 withhold 机制（`run-e2e-isolated.mjs` blob `13dbfc43` 冻结）；Ban retry-to-green/Ban flake 记法。
4. **Ban covered/SSOT 行翻转**（nail 阶段才改）；GAP-G7K-API-REDS backlog 状态行（`0c6c3287` 登记）不翻；sibling 归档（AC/AD/U/L/G7B/G7K/G7R/F-F）零改写。
5. **Ban recruiter-flow 面回归**：`recruiter.ts:428` 唯一既有 snapshot 生产者及其 bind/snapshot/409 fail-closed 链零改动零回归（EXEC 收据须含 recruiter 面零回归读数）。
6. **Ban masking**：Ban 为通用面强造 route metadata/夹具造数（捏造产品不可能状态）；Ban 伪造 application/binding 行。
7. **Ban Key 物料越界 / Ban push / Ban self-approve / alone ≠ dual**。

## 6. Non-claims

Not a pass · not run（本 REQUEST 零实跑）· not fixed · not coding · not root-cause re-adjudicated（根因归类承 F-F 双审裁决 · 子面归属 DDL/输入源留双审 + 协调方）· not trio green · not suite green · not R1 closed · not Disclosure-1 closed · not G6 closed · not R5 retired · not HA · not covered · not releaseEvidence=true · not nail · not backlog 状态翻转 · not live（本 turn）· not coordinator authorize · 供给候选未裁决（A/B/C/D 均为候选非定案）· `g7SuiteGreen=false` · trio OPEN · `actualSpendCny=null` · alone ≠ dual

---
*Harness · G7S 通用 begin 供给面收口产品刀 · 2026-10-07 · `draft:awaiting_pre_exec_dual` · docs-only · 断点=通用面 binding→snapshot 跳结构性缺位（唯一生产者 recruiter.ts:428）· 候选 A 推荐/B/C/D 列弊交双审 · 门语义零弱化铁律 · trio ×1 各一次 · 预算 ≤200 · C-MO-Q1~3 硬义务随卷 · STOP*
