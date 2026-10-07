# REQUEST — **G7U 红① begin/异步 classify 时序面刀**（两路线并列：夹具等待刀 vs 未决 202+异步补供给 · ≠ 修复 ≠ trio 翻绿）· pre-exec · mw-e2e-ha

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503 · `g7SuiteGreen=false` · `actualSpendCny=null`
**Expert**: `mw-e2e-ha`
**Knife**: `harness/gap-red1-timing-face.md` · slice `gap-red1-timing-face.slice.md`
**上游**: G7T EXEC（v2 `430d4c84` + 收据 `7979cd20` · sidecar 时序面定谳）→ G7T POST dual BOTH PASS（mw-rag-route `69e2a5e3` + mw-model-op `7b34f9a8`）→ **C-MO-P1**（时序面须新 REQUEST+双审+协调方授权）· G7S `harness/gap-begin-snapshot-supply-fix.md:79` 预留（「等 route_decided 再 begin…属独立夹具 REQUEST」）
**Base tip**: `7b34f9a8`（`origin/feat/mysql-schema-skeleton` fetch 后实测 tip · not a prove tip · 实跑 code SHA 以 EXEC 期 worktree HEAD 实测为准）
**Date**: 2026-10-07
**Line**: **G7U**

## Pins（retained · 本 stub 不改）

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
| `g7SuiteGreen` | **false**（retained · 至三绿 + post-dual + 协调方 nail · Ban flip true） |
| `actualSpendCny` | **null**（retained） |
| Trio | **OPEN**（G7T 后 `1/−/−` · CMD2 EXIT=1 ×2 attempts 如实 retained） |
| 红① | **STILL OPEN**（构成已变：classify 面绿 · 时序面残留 = 本刀指名面） |
| GAP-G7K-API-REDS | **P1 OPEN**（`0c6c3287` 登记 · 不翻 backlog 状态） |

## 请审什么（mw-e2e-ha · e2e 纪律 / 夹具合法性 / 诚实性 / withhold 边界）

Line G7U · **红① begin/异步 classify 时序面刀**（G7T EXEC sidecar 定谳残留面的独立 REQUEST · C-MO-P1 + G7S `:79` 双预留闭合）。请审：

1. **根因承卷与证据强度（harness §0/§1）**：本 REQUEST 零实跑零 live 零 Key 加载；证据 = git 只读 @`7b34f9a8`（行号+blob 亲算：spec `de4991e6` / recruiter `d06b4f49` / route-classify-consumer `223b7f09` / job-route-decision `a621d8bd` / validator `79ceded8` / 门 `80abbb80` / interview.service `fbea8aeb` / candidate-route `8bf8e9bd` / applications.service `9a17cfe4` / full.e2e `7d65d0f3` / package.json `0afb3bd2` / prompts `69ca4633`）+ G7T EXEC committed 收据（sidecar 时间线：publish +5s decided、begin 差 0–2s、consumption=0/snapshot=0 贯穿）。「spec publish→begin ≈5–6s」为收据内 spec 推算值（自标）——Ban 把推算当硬读数；**拒因勘误**（`candidate_route_undecided`=G7S 通用面前移先例 vs 红① 实际致死=`interview_ineligible_route` bound 面）请独立复算确认面归属。
2. **路线甲夹具合法性（本审首责）**：spec 内只读等待步骤的边界——既有断言零改动零删除（`:96` waitForURL 原样 · EXEC 收据须「既有断言行逐行全等 + 仅新增等待步骤」机检）；**观测通道裁决**：产品 API 初判无 route 决策暴露 → spec 内 SELECT-only DB 轮询（沿 G7T EXEC sidecar 白名单先例 · Ban payload/`ai_invocation_trace.output`）是否批准为 e2e 合法形态（双审显式批准权在本席与 mw-model-op）；超时语义=诚实 FAIL 五分类（Ban 静默 skip · Ban 无限等待 · Ban begin 409 后重试点击）；**Ban masking**（只读轮询合法 · 伪造 decision/binding/snapshot 行非法）。
3. **路线乙产品语义演进边界**：(a)~(f) 零影响论证义务清单完备性（uc018「begin 202 + 额度 -1」断言零影响/幂等零回归/RLS 授权不弱化/**fail-closed 门零弱化——未决 202=受理后补非跳过校验**/sticky 死端显式化/SSE 窗口语义）；触碰面候选与零触碰面（`adaptive-role-resolve.ts`/`job-route-classifier.ts`/`recruiter.ts:428` 生产者语义/uc018 断言 blob `7d65d0f3` 零 diff）是否闭合；范围裁定（仅 bound 面 vs 双面同构 202）——本席与 mw-model-op 共裁。
4. **两路线并列无预选（Ban 预选）**：harness §2 是否对称完整呈现甲/乙触碰面/prove/风险/对既有钉影响；真实用户 0–2s 未决窗口残余（甲不清除）的诚实披露是否到位；backlog 立行决定权归协调方（Ban 本刀自翻）。
5. **trio 复跑纪律（harness §3）**：三 CMD 各恰好一次（iso→ui→perf · wiring `:278/:279/:282` @`0afb3bd2` · EXEC 按 tip 重核回填）；committed SHA 重钉 + frozen-lockfile + 独立 worktree；单 CMD 内部重试按自身契约算一次 attempt（Ban 临时调高）；**CMD2 主证=红①清除 14P/0F/10S 或同等**（10S=capability skip ≠ green）；sidecar SELECT-only 时间线判据（甲：decided 先于 begin + consumption/snapshot 落行；乙：202 后 decided→补 snapshot→入队事件流）；CMD1/CMD3 读数如实（红③ `full.e2e.ts:203`=C-MO-P3 另刀零触碰 · 非本刀红五分类归因 Ban 黏连归咎）；七字段逐 attempt 全记录；退出码/machine receipt/原始 log 三来源交叉一致。
6. **EXIT 契约双向（harness §4）**：红①清除 → 指名面收据成立；**trio 绿 ≠ suite green**——`g7SuiteGreen` 翻转 = 三绿 + post-dual BOTH PASS + 协调方 nail 全链（缺一不可）；仍红 → EXIT=1 原值 + 五分类 + 根因假设修正如实登记 → 迭代刀重走 REQUEST；**Ban 假绿 · Ban flake 记法（时序竞差可定性 FAIL 原因但不冲销 EXIT=1）· Ban retry-to-green · Ban 只留绿 attempt**。
7. **预算与 Key 卫生**：≤200 次 live 调用（沿 G7K/G7R/G7S/G7T 口径）；超限即停如实记中止（不洗 not_run）；`actualSpendCny=null` 沿 I 线；Key 只经进程环境（loader name-only）· Ban `.env*` · Ban Key 值/fingerprint 入 receipt/log/commit · `.env*` ABSENT presence 逐 attempt 记录。
8. **边界（本 REQUEST turn）**：docs-only 一次 commit；Ban coding · Ban prove 执行 · Ban push/force-push · Ban SSOT/backlog 状态翻转（GAP-G7K-API-REDS `0c6c3287` 状态行不翻 · nail 阶段才落字）· Ban 碰已占用行/sibling 归档（G7K/G7R/G7S/G7T 收据 lifecycle 冻结 · 零改写）· Ban 改 withhold 机制（`run-e2e-isolated.mjs` blob `13dbfc43` 冻结）。

Trio stays **OPEN**（G7T 后 `1/−/−` · CMD2 ×2 attempts 如实）。`g7SuiteGreen=false`. `actualSpendCny=null`. 红① STILL OPEN（时序面构成）。**两路线并列 · Ban 预选** · 夹具对齐 ≠ 产品修复 · **Ban masking · Ban 假绿叙事**。

本 stub 不授权 coding / prove 执行 / trio 实跑 / live / push；pre-exec dual PASS 后由协调方 EXEC 授权（含路线裁决与观测通道批准）；implementer 不自批；本 PASS（如落）仅为 e2e-ha 半签，mw-model-op stub 不代签。

---

*REQUEST stub · G7U 红① 时序面刀 · Line G7U · 2026-10-07 · PENDING awaiting mw-e2e-ha + mw-model-op pre-exec dual · alone ≠ dual · 禁 push · STOP*

---

# PRE-EXEC dual 审查 — mw-e2e-ha（adversarial evidence-honesty · e2e/时序焦点）· 2026-10-07

**被审对象**: REQUEST commit `4279595c`（`docs(e2e): REQUEST red1 timing face (pre_dual)` · 本地主线上 rebase 链 tip · origin push 间歇堵如实记录在案 · 审查 base=主线 tip 本 commit）· harness `gap-red1-timing-face.md` + slice + 本 stub + peer stub（4 md · +223/−0）
**本审边界**: PRE-EXEC docs gate only · 0 prove run · 0 coding · 0 产品 edit · 0 SSOT edit · 0 Key 值读取 · 0 DB 连接 · 0 live · 独立 worktree `/Users/miaole/Desktop/golucky/meetwise-rv-g7u-e2e-ha`（branch `rv/g7u-e2e-ha`）· Ban self-approve · alone ≠ dual · 不代签 mw-model-op · 禁 push

## 0. 机检记录（append-only 保全）

本 stub 追加前 = **7312 bytes · md5 `11927b0fc21a145db32cb0d2010cf181`**（含末行斜体 footer 逐字节保全；本段为纯追加，前缀零改写零删改）。

## 1. 检查表（机械核验 · 全 PASS）

| # | 项 | 结果 |
|---|---|---|
| 1 | REQUEST 祖先链 | PASS — `7979cd20`(G7T EXEC 收据) → `69e2a5e3`+`7b34f9a8`(POST dual BOTH PASS · C-MO-P1) → `d230f0df`(nail) → **`4279595c`**(本 REQUEST) 单链线性 · C-MO-P1 指名后继成立 · G7S `harness/gap-begin-snapshot-supply-fix.md:79` 预留逐字核验（「夹具刀不在本刀（仅红①时序面合法——recruiting-bound『等 route_decided 再 begin』若需要，属独立夹具 REQUEST…）」实读在 `:79`）——双预留闭合成立 |
| 2 | docs-only | PASS — REQUEST commit 恰 4 新增 .md +223/−0；全距 `7b34f9a8..4279595c` 仅 6 md（4 REQUEST + 2 nail 文档）零产品码零 SSOT 零 spec 零 migration |
| 3 | blob 亲算 ×11 | PASS — `de4991e6`(recruiting-bound.spec) / `d06b4f49`(recruiter.ts) / `223b7f09`(route-classify-consumer) / `a621d8bd`(job-route-decision) / **`79ceded8` 实测= `packages/domain/src/job-route-classifier.ts`**（harness 引文件名不引路径，无歧义） / `80abbb80`(adaptive-role-resolve) / `fbea8aeb`(interview.service) / `8bf8e9bd`(candidate-route) / `9a17cfe4`(applications.service) / `7d65d0f3`(full.e2e) / `0afb3bd2`(package.json) —— 逐一 `git rev-parse` 实测全等 |
| 4 | 行号锚 | PASS — `recruiter.ts:394-398` R2 P-LOOP/P-START 注释块（:399 `bindApplicationRoute` · **`:410` `return { status: 'interview_ineligible_route' }` 逐字在卷** · `:428` `snapshotInterviewRoute` · `:429-431` no_binding throw）；`applications.service.ts:42-46` `interview_ineligible_route` → `HttpStatus.CONFLICT` 409 实读；`interview.service.ts:332-335` 通用面 `application_id IS NULL` → `candidate_route_undecided` 409 实读（`:328-331` 注释自证「recruiter.ts:428 唯一生产者」与本刀口径互证）；`route-classify-consumer.ts:62-63` `intervalMs = 5000` 实读；`job-route-decision.ts:14` sticky 永不自动重试 / `:179-180` `already_decided`/`already_unresolved` noop / `:253-258` `writeRouteDecided` 实读；spec `:95` begin 点击一次性 / `:96` waitForURL 30s / `:102-104` `GET /applications` 仅读 `id/status/interview_id` 实读；wiring `package.json:278/:279/:282` 三 CMD 实读 |
| 5 | G7T sidecar 定谳承卷 | PASS — 收据 02 实读：chromium `20:57:08` `route_pending×1` → `20:57:13` `result_validated`+`route_decided×1`（publish+5s）；mobile `20:58:03`→`20:58:08` 同形；begin 时点 `~20:57:12-14`/`~20:58:06-08` 均标「spec 内推算」（证据强度如实）；`consumption=0 snapshot=0` 贯穿至 `20:59:03` 末读；EXIT=1 ×2 `12P/2F/10S` —— harness §1.1/§1.3 承卷与收据逐值一致，推算/硬事实分离纪律成立（§0 声明） |
| 6 | 观测通道初判复核 | PASS — `grep -rn` `apps/api/src` 全量：**无任何 controller/service 暴露 route decision/attempt_outcome**（零命中实测量化在卷）——harness §2-甲 (a)「产品 API 无 route 决策暴露」初判独立复核成立；spec `:102` 通道响应形 `{id,status,interview_id}` 与 harness 引用一致 |
| 7 | 两路线对称呈现 / Ban 预选 | PASS — harness §2 甲/乙触碰面/prove/风险/钉影响四维对称并列；§2-排序显式「不排序不预选」并如实引 G7S POST 先例与 C-MO-P1 措辞；Non-claims 含 not 路线裁决 |
| 8 | Pins 原值 | PASS — 十值 + retained 与本 stub §Pins 表逐值全等：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · DELETE=503 · **`g7SuiteGreen=false`** · **`actualSpendCny=null`**；trio OPEN（`1/−/−`）· 红① STILL OPEN（时序面构成）· GAP P1 OPEN（`0c6c3287` 不翻）· r1Closed=false · Disclosure-1 OPEN |
| 9 | 红① 清除判据 | PASS — CMD2 **14P/0F/10S 或同等**与现基线 12P/2F/10S 自洽（12+2=14）；10S=capability skip ≠ green 口径保持；CMD1/CMD3 读数沿 G7S EXEC `a9bc4bcf` EXIT 1/1/1 retained、本刀 trio 三 CMD 各恰好一次真测 |
| 10 | 拒因勘误 | PASS — 协调方指令措辞 `candidate_route_undecided`（通用面）与红① 实际致死 `interview_ineligible_route`（bound 面）的归属差经本席码面独立复算确认（检查表 #4 双面实读）；REQUEST 主动勘误随卷（§1.2）= 诚实性正面项 |

## 2. 路线甲裁决（夹具刀 · 本审首责）：**批准（附条件）** · spec 内 SELECT-only DB 轮询 = e2e 合法新形态

**三件套裁决：够，但须加本席两条边界条件后为「充分」**：

1. **SELECT-only 白名单**：批准，但冻结面 = G7T EXEC sidecar 白名单**逐列同形**——`job_semantic_revision.status` / `job_route_decision.attempt_outcome` / `route_consumption_event` / `interview_route_snapshot` 四表；Ban `interview_job.payload`、Ban `ai_invocation_trace.output`、Ban 任何非 SELECT 语句（harness §5.4 masking 边界「只读轮询合法，任何写入非法」本席背书）。EXEC 收据须含轮询 SQL 逐条原文在卷（本席复核面）。
2. **cap ≤N 秒（建议 ≤60s）**：批准。决策到达实测恒 +5s（G7T 双 project 5s 整），60s 上界 ≈ 12× 余量；**N 定值 EXEC 入收据**；轮询周期 1–2s。沿 peer stub 第 2 条关切（模型延迟方差）：Ban 以 N 调小制造 flake、Ban 以 timeout 语义洗 FAIL——本席一并采纳为双侧约束。
3. **超时 = 诚实 FAIL（五分类）**：批准。Ban 静默 skip / Ban 无限等待 / Ban begin 409 后重试点击（begin 一次性语义保持）——三禁缺一即本批准失效。
4. **「夹具对齐产品真实时序」定性裁决：诚实成立**。产品自有 `recruiter.ts:394` R2 P-LOOP 注释自证竞态为已知面（apply/invite 处已关一道、start 处留窗）；夹具等待只是把 begin 点击放到产品设计意图的可成交时点，**断言谓词零变化**（变的是夹具到达时点）——不属 masking、不属断言弱化。但「夹具对齐 ≠ 产品修复」残余必须随卷：真实用户 0–2s 未决窗口点击 begin 仍得 409「出错了」（无重试引导），该观察如实入 EXEC 收据、backlog 立行决定权归协调方（harness §2-甲风险 (c) 已如实自报，本席认可其处置路径）。

## 3. 路线乙裁决（产品面）：**可裁（附硬门）** · 范围裁定 = **仅 bound 面，非双面同构**

**(a)~(f) 论证义务可满足性逐项**（双审首责范围内本席半裁，门语义终裁权留 mw-model-op）：

- **(a) uc018**：实读裁决——uc018 断言面（`full.e2e.ts:101` begin→202 / `:105` 额度 −1 / `:126` abandon 后 409）在**通用面试 begin 面**（`/interview/:id/begin`）；红① bound 面 = application-start（`/applications/:id/start`）。**范围裁定仅 bound 面后，(a) 退化为 uc018 所在面零触碰**（blob `7d65d0f3` 全文件零 diff 机检强制，见 OB-HA-4）。附加硬门：EXEC 落字前须交**额度时序映射**（bound 面哪次调用在哪个事务 `reserveEntitlement`——本席实读 `recruiter.ts:390-433` startApplicationInterview 窗口内无 reserveEntitlement 调用，bound 流扣额时点必须在裁决定稿前显式落字，Ban 以「未读到」当「不存在」）。
- **(b) 幂等**：可满足（awaiting 窗口重复 begin → 同 interview 零双扣零双入队）——但 awaiting 态 begin 行为（再 202？幂等锚？start job 只入队一次？）须 EXEC 裁决版显式落字，Ban 留白。
- **(c) RLS/授权**：可满足（awaiting 行 owner 谓词 + worker 补供给 owner-scoped 读解密沿 `candidate-route.ts` `8bf8e9bd` 既有纪律）。
- **(d) fail-closed 门零弱化**：可满足且结构上有据——「受理后补 ≠ 跳过校验」可由既有门序结构背书：`job-route-decision.ts:15`「binding 只可绑 route_decided 的版本」实读在卷 → 补供给只能发生在 decided 之后 → 门序（worker 门 `80abbb80` 零动 + validator `79ceded8` 零动 + sticky `:14` 零私改）与补供给**天然序兼容**；`recruiter.ts:428` snapshot 唯一生产者语义保持为强制机检项。
- **(e) sticky 死端显式化**：**最重义务 · 硬门**。classify sticky（`validation_rejected`/`known_not_sent`/`dispatched_unknown` 永不自动重试）→ awaiting interview 永不完成的终态语义（状态/SSE/额度退款路径）**必须在 EXEC 裁决触碰面定稿前完整落字**；Ban 静默挂起、Ban 给 sticky 加自动重试。若 (e) 落不了字 = 路线乙本刀不可 EXEC。
- **(f) SSE 窗口语义**：可满足——202 返回 interviewId 后 start job 延迟入队期间 `/interview` 页等待语义须产品定谳；Ban 以 `interview_unavailable` 洗等待窗。

**范围裁定（本席裁决 · 交协调方确认）：仅 bound 面**（application-start `interview_ineligible_route`）；通用面 `candidate_route_undecided` **维持 G7S fail-closed 409 零触碰**。依据三条（码面实读）：
1. **证据面**：G7T sidecar 定谳时间线全部在 bound 面（binding 零落 → `recruiter.ts:410` 致死）；C-MO-P1 指名残留面 = recruiting-bound 时序面；通用面无本刀证据。
2. **时序面不存在的面不必「修」**：通用面已有 begin 同步供给（`interview.service.ts:332` `supplyCandidateProfileRoute` 同事务 · C-MO-S1 rule 层 0 外发）——**无异步竞差窗口**；其 409 = 真无路由态而非时序态；且该面无 pending 异步 classify 可供「后补」——202 受理后无供给者（除非另增异步入队 = 更大产品变更），「受理后补」语义在通用面**结构上不成立**。
3. **occupancy 爆炸半径**：uc018 断言就在通用 begin 面上——双面同构把 uc018 自身语义卷进触碰半径，义务 (a) 从「零触碰机检」恶化为「近旁重论证」；仅 bound 面则 uc018 所在面完整出圈。G7S POST 先例（产品刀通用收口已落通用面）与「拒的本体零消失」语义在通用面继续成立。

双面同构诉求若EXEC 期重提 = 超出本 REQUEST 裁决范围 = 须新 REQUEST 重走双审（Ban 借本刀顺手扩面）。

## 4. 既有断言零改动 + trio 纪律

- 路线甲：`:96` waitForURL 30s 等既有断言**逐行全等 + 仅新增等待步骤**机检 = EXEC 收据强制项（harness §2-甲已列，本席升格为 PASS 前提）；产品码全链 §1.2 十一面 blob 链前=链后全等机检强制。
- 路线乙：`full.e2e.ts` blob `7d65d0f3` **全文件**零 diff（OB-HA-4）；红③ `:203` = C-MO-P3 另刀零触碰。
- trio：三 CMD 各恰好一次（iso→ui→perf）；七字段逐 attempt 全记录；三来源交叉一致；attempts 全记录 Ban retry-to-green / Ban 只留绿 attempt / Ban flake 记法（时序竞差可定性 FAIL 原因但不冲销 EXIT=1）——双向 EXIT 契约本席背书。

## 5. Fail-trigger audit（本审反向核查 · 零触发）

1. 路线预选？——零触发（§2 对称并列 + 排序段显式弃权 + Non-claims 双写）。
2. masking 洗白？——零触发（§5.4 只读/写入边界 + 甲 Ban 改产品 + 乙补供给走 decided 后门序）。
3. 断言弱化/洗绿？——零触发（两路线零改动义务 + CMD2 14P/0F/10S 主证 + trio 绿 ≠ suite green 全链条件）。
4. 证据诚实性？——零触发且正面：5–6s 推算值自标不冒充硬读数（§0）；拒因勘误主动随卷；甲风险 (c) 产品残余如实自报不揽功。
5. Pins/backlog/SSOT 越界？——零触发（十值原值 + `0c6c3287` 不翻 + sibling 归档零改写 + withhold `13dbfc43` 冻结）。
6. 授权链？——零缺口（C-MO-P1 + G7S `:79` 双预留 → 本 REQUEST · EXEC 前置 = pre-exec dual BOTH PASS + 协调方授权，本 PASS 不预授）。

## 6. Blockers

**0 Blocker。**

## 7. Conditions（C-HA-* · EXEC 前置/EXEC 期强制）

- **C-HA-1**（甲 · 轮询白名单冻结）：spec 内 DB 轮询 SELECT 逐条原文入 EXEC 收据；白名单 = G7T sidecar 四面（`job_semantic_revision.status`/`job_route_decision.attempt_outcome`/`route_consumption_event`/`interview_route_snapshot`）逐列同形；Ban `interview_job.payload`/`ai_invocation_trace.output`/任何写语句； Ban 夹具等待步骤演变为断言放宽。
- **C-HA-2**（甲 · 连接物料纪律）：spec 直连 DB 的连接物料只经 isolated runner（`run-e2e-isolated.mjs` `13dbfc43` 冻结）既有 env 契约；Ban 新 `.env*`、Ban 物料/Key 入 receipt/log/commit。
- **C-HA-3**（甲 · N 与超时）：N 定值 EXEC 入收据（≤60s 建议值 · 轮询 1–2s）；超时=诚实 FAIL 五分类；Ban 静默 skip/Ban 无限等待/Ban begin 409 后重试点击/Ban 以 N 调参制造或掩盖 flake（双侧约束 · 采纳 peer 关切）；CMD2 墙钟增量如实记。
- **C-HA-4**（甲 · 机检双强制）：「既有断言行逐行全等 + 仅新增等待步骤」+ 产品码 §1.2 全链 blob 链前=链后全等，两项机检进 EXEC 收据；甲观测通道 (a)(b) 均不成立时退回重设计（Ban 就地改产品兜底——harness §2-甲原文本席背书）。
- **C-HA-5**（甲 · 诚实披露随卷）：「夹具对齐 ≠ 产品修复；真实用户 0–2s 未决窗口仍 409」披露原文入 EXEC 收据；backlog 立行权归协调方（Ban 本刀自翻）。
- **C-HA-6**（乙 · 硬门三件）：EXEC 裁决触碰面定稿前必须落字——(α) bound 面额度时序映射（哪次调用哪个事务 `reserveEntitlement` · 本席实读 startApplicationInterview 窗口无扣额调用 · Ban 以「未读到」当「不存在」）；(β) sticky 死端终态设计（awaiting 永不完成的状态/SSE/退款路径 · Ban 静默挂起 Ban 自动重试）；(γ) SSE 等待窗产品定谳（Ban `interview_unavailable` 洗窗）。三件任一缺 = 乙不可 coding。
- **C-HA-7**（乙 · 范围锁）：**仅 bound 面**（本席裁决 · 协调方确认后生效）；通用面 `candidate_route_undecided` fail-closed 409 零触碰维持 G7S 语义；双面同构重提 = 新 REQUEST 重走双审。
- **C-HA-8**（乙 · 机检）：`full.e2e.ts` blob `7d65d0f3` 全文件零 diff + `adaptive-role-resolve.ts` `80abbb80`/`job-route-classifier.ts` `79ceded8` 零 diff + `recruiter.ts:428` snapshot 唯一生产者语义保持（补供给仍走 `snapshotInterviewRoute` 同一结构）+ additive-only DDL，全部进 EXEC 收据。
- **C-HA-9**（通用 · alone ≠ dual）：本 PASS 仅为 mw-e2e-ha 半签，不代签 mw-model-op；EXEC 前置 = pre-exec dual BOTH PASS + 协调方授权（含路线裁决与观测通道终批）。
- **C-HA-10**（通用 · Pins 零翻转）：`g7SuiteGreen=false` · trio OPEN · `actualSpendCny=null` · GAP P1 OPEN · r1Closed=false · Disclosure-1 OPEN 全 retained 至 post-dual + 协调方 nail 全链。

## 8. 三行中文摘要

1. 本 REQUEST（`4279595c` · 恰 4 md docs-only）机检全过：祖先链（C-MO-P1 + G7S `:79` 双预留）成立，blob ×11 与行号锚逐一亲算全中，G7T sidecar 定谳与拒因勘误（bound 面 `interview_ineligible_route` · 410 实读）经本席独立复算确认，两路线对称并列零预选、Pins 十值原值零翻转。
2. 路线甲批准（附条件）：spec 内 SELECT-only DB 轮询裁为 e2e 合法新形态，三件套（白名单冻结+cap+超时诚实 FAIL）加连接物料纪律与双机检后充分；「夹具对齐产品真实时序」定性诚实成立，产品残余（真实用户 0–2s 窗口仍 409）须随卷披露、backlog 权归协调方。
3. 路线乙可裁但范围裁定 = **仅 bound 面**（通用面无时序竞差、无后补供给者、且 uc018 就在其断言面上——双面同构不裁）；(a)~(f) 义务可满足但三硬门（额度时序映射/sticky 死端终态/SSE 窗口定谳）落字前禁 coding。0 Blocker · 10 Conditions · alone ≠ dual · EXEC 仍须 mw-model-op 半签 + 协调方授权。

*PRE-EXEC dual review · mw-e2e-ha · adversarial evidence-honesty · 2026-10-07 · 被审 `4279595c` · 审查 worktree `meetwise-rv-g7u-e2e-ha` · 本审 0 prove 0 coding 0 产品 edit 0 SSOT edit 0 Key 读取 0 DB 连接 · append-only 机检：前 7312B md5 11927b0fc21a145db32cb0d2010cf181 逐字节保全 · alone ≠ dual · 不代签 mw-model-op · 禁 push*

Verdict: PASS
