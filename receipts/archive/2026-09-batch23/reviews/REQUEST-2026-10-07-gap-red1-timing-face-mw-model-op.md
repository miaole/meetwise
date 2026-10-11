# REQUEST — **G7U 红① begin/异步 classify 时序面刀**（两路线并列：夹具等待刀 vs 未决 202+异步补供给 · ≠ 修复 ≠ trio 翻绿）· pre-exec · mw-model-op

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503 · `g7SuiteGreen=false` · `actualSpendCny=null`
**Expert**: `mw-model-op`
**Knife**: `harness/gap-red1-timing-face.md` · slice `gap-red1-timing-face.slice.md`
**上游**: 本席 G7T POST-PROVE PASS **C-MO-P1**（「时序面残留：任何修复（独立夹具刀『等 route_decided 再 begin』或产品面消费时序变更）须新 REQUEST+双审+协调方授权；Ban 无授权改夹具、Ban 为绿弱化断言」）· G7T EXEC sidecar 时间线（`7979cd20` 收据 02：publish +5s `result_validated`/`route_decided` · begin 差 0–2s · consumption=0/snapshot=0 贯穿）· G7S `harness/gap-begin-snapshot-supply-fix.md:79` 预留（「夹具刀不在本刀（仅红①时序面合法——recruiting-bound『等 route_decided 再 begin』若需要，属独立夹具 REQUEST…）」）
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

## 请审什么（mw-model-op · 模型消费时序 / 门语义 / 产品语义演进面）

Line G7U · **红① begin/异步 classify 时序面刀**（本席 G7T POST C-MO-P1 指名的独立 REQUEST）。请审：

1. **根因承卷（本席定谳复读）**：classify 质量面已由 G7T v2 修复并 live 复证绿（`validation_rejected ×2` → `result_validated ×2` · validator blob `79ceded8` 闸零改动 · 本席 G7T POST C-MO-G1 兑现承卷）；残留红①=**「begin 早于异步 classify 完成」时序面**（本席 C-MO-P1 定谳措辞）——worker consumer 轮询 5000ms（`route-classify-consumer.ts:62-63` blob `223b7f09`）+ 模型延迟 ≈5s ≥ spec publish→begin ≈5–6s → 0–2s 竞差先 begin 后 decided → `route_consumption_event=0`/`interview_route_snapshot=0`（sidecar 末读硬事实）。请独立复算 blob 链（`de4991e6`/`d06b4f49`/`223b7f09`/`a621d8bd`/`79ceded8`/`80abbb80`/`fbea8aeb`/`8bf8e9bd`/`9a17cfe4`/`7d65d0f3`/`0afb3bd2`）与拒因勘误面归属（红① bound 面 `interview_ineligible_route` vs G7S 通用面前移先例 `candidate_route_undecided`）。
2. **路线甲边界（Ban 改产品）**：夹具等待刀产品码全链 blob 链前=链后全等机检是否闭合；等待上限 N 与超时=诚实 FAIL 语义；**classify 决策时间分布的概率性**——轮询等待上界 N 的取值须容纳模型延迟方差（G7T v2 实测 +5s · 方差面如实登记），Ban 以 N 调小制造 flake、Ban 以 timeout 语义洗 FAIL。
3. **路线乙产品语义演进（本审首责）**：未决 409 → **202 accepted + 异步补供给**——(a)~(f) 零影响论证义务清单完备性逐项审：uc018「begin 202 + 额度 -1」断言零影响（**扣额时序须仍在 begin 同步 `reserveEntitlement`** · Ban 移完成时点）/幂等零回归（awaiting 窗口重复 begin 零双扣零双入队）/RLS 授权不弱化（awaiting 行 owner 谓词 · worker 补供给 owner-scoped 读解密沿 `candidate-route.ts` 纪律）/**fail-closed 门零弱化**（`adaptive-role-resolve.ts` blob `80abbb80` 门与默认 ON 零动 · `validateModelRouteOutput` blob `79ceded8` 零动 · **未决 202 是「受理后补」非「跳过校验」**）/sticky 死端显式化（`route_unresolved` sticky `:179-180` 永不自动重试语义零私改 · awaiting interview 永不完成的终态语义须显式设计 · Ban 静默挂起）/SSE 窗口语义产品定谳（Ban 以 `interview_unavailable` 洗等待窗）；worker 补供给完成路径（`route-classify-consumer.ts` decided 后补 snapshot 再入队 start job）与 `recruiter.ts:428` snapshot 唯一生产者语义保持的兼容性；范围裁定（仅 bound 面 vs 双面同构 202）——本席与 mw-e2e-ha 共裁。
4. **两路线并列无预选（Ban 预选）**：harness §2 对称完整性；与 G7S POST 排序先例（产品刀＞夹具刀）及本席 C-MO-P1 措辞（两形态并列合法）的一致性核对——本 REQUEST 不排序不预选，裁决权归双审 + 协调方。
5. **trio 复跑纪律（harness §3）**：三 CMD 各恰好一次（iso→ui→perf · wiring `:278/:279/:282` @`0afb3bd2` · EXEC 按 tip 重核回填）；committed SHA 重钉 + frozen-lockfile + 独立 worktree；单 CMD 内部重试按自身契约算一次 attempt；**CMD2 主证=红①清除 14P/0F/10S 或同等**；sidecar SELECT-only 白名单时间线判据（Ban `interview_job.payload` / `ai_invocation_trace.output` 沿 G7T EXEC 先例）；CMD1/CMD3 读数如实（红③ `full.e2e.ts:203`=C-MO-P3 另刀零触碰）；七字段逐 attempt 全记录；三来源交叉一致。
6. **EXIT 契约双向（harness §4）**：红①清除 → 指名面收据成立；**trio 绿 ≠ suite green**——`g7SuiteGreen` 翻转 = 三绿 + post-dual BOTH PASS + 协调方 nail 全链（缺一不可）；仍红 → EXIT=1 原值 + 五分类 + 根因假设修正如实登记 → 迭代刀重走 REQUEST；**Ban 假绿 · Ban flake 记法 · Ban retry-to-green · Ban 只留绿 attempt**。
7. **预算与 Key 卫生**：≤200 次 live 调用（沿 G7K/G7R/G7S/G7T 口径）；超限即停如实记中止；`actualSpendCny=null`；Key 只经进程环境（`~/.meetwise-secrets/load-model-api-key.sh` loader name-only）· Ban `.env*` · Ban Key 值/fingerprint 入 receipt/log/commit。
8. **边界（本 REQUEST turn）**：docs-only 一次 commit；Ban coding · Ban prove 执行 · Ban push · Ban SSOT/backlog 状态翻转（`0c6c3287` 不翻）· Ban 碰已占用行/sibling 归档 · Ban 改 withhold 机制（`13dbfc43` 冻结）· **Ban 为绿弱化断言（C-MO-P1 随卷）**。

Trio stays **OPEN**（G7T 后 `1/−/−` · CMD2 ×2 attempts 如实）。`g7SuiteGreen=false`. `actualSpendCny=null`. 红① STILL OPEN（时序面构成）。**两路线并列 · Ban 预选** · 门语义/质量闸/sticky 三零动 · 未决 202=受理后补非跳过校验 · **Ban masking · Ban 假绿叙事**。

本 stub 不授权 coding / prove 执行 / trio 实跑 / live / push；pre-exec dual PASS 后由协调方 EXEC 授权（含路线裁决）；implementer 不自批；本 PASS（如落）仅为 model-op 半签，mw-e2e-ha stub 不代签。

---

*REQUEST stub · G7U 红① 时序面刀 · Line G7U · 2026-10-07 · PENDING awaiting mw-e2e-ha + mw-model-op pre-exec dual · alone ≠ dual · 禁 push · STOP*

---

# PRE-EXEC dual 审查段 — mw-model-op（model-op/产品语义焦点 · docs gate only · append-only）

**审查方**: `mw-model-op`（独立 · 不自批 · alone ≠ dual · 不代签 mw-e2e-ha）· **Date**: 2026-10-07 · **被审**: G7U REQUEST `4279595c`（本地主线 tip · 全名 `4279595c34b12f23bfbc15b5887f624182925354`）· **审查 worktree**: `/Users/miaole/Desktop/golucky/meetwise-rv-g7u-model-op` · branch `rv/g7u-model-op`（作者 mw-model-op · 禁 push）· **本审 0 prove run 0 coding 0 产品 edit 0 SSOT edit 0 live 0 Key 值读取 0 DB 连接**（全部证据=git 只读亲读 + blob 亲算 + 在案收据引用）。

## A. 机械核验（命令 + EXIT + 可复现证据）

1. **ancestry**: `git worktree add … -b rv/g7u-model-op 4279595c` EXIT=0；`git merge-base --is-ancestor` 逐点 EXIT=0：父 `d230f0df`（G7T nail）✓ · `7b34f9a8`（G7T POST dual PASS，C-MO-P1 出处）✓ · `8c92b344`（G7T REQUEST）✓ · `c4546f7b`（G7S nail）✓——C-MO-P1 + G7S `harness/gap-begin-snapshot-supply-fix.md:79` 双预留闭合成立（:79 逐字复读：「夹具刀不在本刀（仅红①时序面合法——recruiting-bound『等 route_decided 再 begin』若需要，属独立夹具 REQUEST…）」——本 REQUEST 即该独立 REQUEST）。
2. **docs-only**: `git diff-tree --name-status -r 4279595c` = 恰 4 新增 `.md`（slice 21 行 / harness 104 行 / 双审 stub 各 49 行）· numstat +223/−0 · 零产品码零 SSOT 零 receipts ✓。
3. **blob 亲算 ×11 全等**（`git hash-object` 实测）：spec `de4991e633fb10b7…` ✓ · recruiter `d06b4f4933414853…` ✓ · consumer `223b7f0951ebf182…` ✓ · job-route-decision `a621d8bdcb4d3c45…` ✓ · classifier(=validator 闸) `79ceded84977bef0…` @`packages/domain/src/job-route-classifier.ts` ✓ · 门 `80abbb80b8607c08…` @`apps/worker/src/adaptive-role-resolve.ts` ✓ · interview.service `fbea8aebb1b912ed…` ✓ · candidate-route `8bf8e9bd9b0d3780…` ✓ · applications.service `9a17cfe4546aec75…` ✓ · full.e2e `7d65d0f35e392422…` ✓ · package.json `0afb3bd2080bb49c…` ✓。harness §1.2 行号逐一对号（R2 P-LOOP `:394`/P-START `:396`/bind `:399`/`:410` 拒返/snapshot `:428`/belt-and-suspenders `:431`；409 映射 `applications.service.ts:42-46`；消费轮询 `consumer :62-63` intervalMs=5000；sticky `job-route-decision.ts:14` 模块契约 + `:179-180` `already_unresolved` noop + `:253-258` writeRouteDecided）。
4. **拒因勘误裁定：勘误成立**。红① 致死点实读确认 = bound 面 `recruiter.ts:410` return `interview_ineligible_route` → `applications.service.ts:42-46` → HTTP 409（controller `@HttpCode(HttpStatus.OK)` 的 start 端点内 HttpException(CONFLICT)）；协调方措辞 `candidate_route_undecided` 实为 G7S 通用面（`interview.service.ts:330-336` · blob `fbea8aeb`/`8bf8e9bd`）先例。两拒因同属「未决即拒」fail-closed 前移族，但**消费面不同构**（见 C 节裁决）。REQUEST/harness 随卷勘误如实，未掩盖面归属差 ✓。
5. **append-only 机检**: 本 stub 追加前 7611B md5 `443d7231d1f7d682a52c7679fb83578f`；追加后逐字节前缀保全（含上节 PENDING footer 原样）；末行=本 Verdict 行。

## B. 检查表（REQUEST 八项逐审）

| # | 项 | 裁定 |
|---|---|---|
| 1 | 根因承卷 + blob 复算 + 拒因勘误 | **PASS**（A.3/A.4 全等成立；0–2s 竞差=sidecar 硬事实+推算自标分层诚实） |
| 2 | 路线甲边界（Ban 改产品·N·超时诚实 FAIL） | **PASS with C-MO-U6**（本席半批 SELECT-only 轮询形态·cap/variance 钉 EXEC） |
| 3 | 路线乙 (a)~(f) 论证义务完备性 | **PASS with C-MO-U1/U2/U4/U5**（六义务可满足·三处须 EXEC 落字钉·见 C 节） |
| 4 | 两路线并列 Ban 预选 | **PASS**（harness §2 对称呈现·G7S 排序先例标注「非本席裁决」·REQUEST 零裁决权表述一致） |
| 5 | trio 复跑纪律 | **PASS**（×1 各一次·七字段·三来源交叉·CMD2 主证 14P/0F/10S 或同等·sidecar 白名单 Ban payload/output 沿 G7T 先例） |
| 6 | EXIT 契约双向 | **PASS**（trio 绿 ≠ suite green 全链门·仍红 EXIT=1 原值+五分类·Ban flake/retry-to-green/只留绿/假绿） |
| 7 | 预算 + Key 卫生 | **PASS**（≤200 沿四刀口径·超限即停不洗·loader name-only·Ban `.env*`·`actualSpendCny=null`） |
| 8 | turn 边界（docs-only·Ban 清单） | **PASS**（八 Ban 全在卷·occupied 行零触碰 `7d65d0f3` 零 diff·withhold `13dbfc43` 冻结·backlog `0c6c3287` 不翻） |

## C. 路线乙产品语义裁决（本审核心）

**总裁定：六项零影响论证义务可满足——路线乙作为 REQUEST 呈现合法，PASS；但三处载荷点必须 EXEC 落字钉后方可 coding（C-MO-U1/U2/U4），一处终态诚实性钉（C-MO-U5）。** 依据（全部码面实读）：

1. **(a) uc018 额度时序——可满足，但须钉「额度锚不变式」（C-MO-U1）**。实读定谳：uc018 断言（`e2e/full.e2e.ts:101/:103-105`·blob `7d65d0f3`）行使的是 **interview begin 端点**（`POST /interview/:id/begin` → 202 + 额度 -1 + abandon released），**非** applications start 端点（`applications/:id/start` controller `@HttpCode(OK)` → **HTTP 200**·`startApplicationInterview` 全函数零 `reserveEntitlement` 引用）。两面的额度扣减都同步发生在 `interview.service.ts:340` begin 事务内（`:338` 402 映射注释·throw 即回滚零悬账）。故 (a) 本身与路线乙零张力。**但** harness 路线乙完成路径措辞「decided 后补 snapshot **再入队 start job**」存在潜在额度绕通形状：若补供给路径对额度未预留的 awaiting 面试直接入队 start job（消费模型调用），即绕通账本。钉：**任何 enqueue start job 的路径，事务内或其前必有已预留 entitlement**；EXEC 二选一：(i) 补供给只补 bind+snapshot、入队仍留在额度锚定的 interview begin（awaiting begin 须无扣额无入队 aware·见 4）；(ii) 202 受理事务同步 reserveEntitlement、interview begin 对 awaiting 幂等不双扣；(iii) 无额度入队 = Ban。此钉与 B'' 先例同族规则逐字同源：`interview.service.ts:208/:229/:248`「在**扣额度与入队之前**抛真实 HttpException」——B'' 的「无效输入不得消费额度」在 G7U 语境延伸为「未消费受理不得绕通额度」。
2. **(b) 幂等——可满足**。既有机件在卷：interview begin `alreadyBegun` 幂等（existing start job → 零双扣零双入队）·applications start `reused 同一 interviewId`（`full.e2e.ts` 状态机断言）。awaiting 窗口只是幂等锚前新增一个 pre-anchor 状态，EXEC 论证须把 awaiting-repeat-begin 纳入同一机件。
3. **(c) RLS——可满足**。awaiting 行 owner 谓词 + worker 补供给 owner-scoped 读解密沿 `candidate-route.ts`（blob `8bf8e9bd`）既有纪律；新结构 DDL 沿 G7S 0142 additive-only 先例（零 DROP 零放宽既有五表）。
4. **(d) fail-closed 门零弱化——可满足，须钉 binding 不变量延伸（C-MO-U2）**。「受理后补非跳过校验」实质成立：门（`adaptive-role-resolve.ts` blob `80abbb80`·缺行/缺叶仍 throw）与质量闸（blob `79ceded8`）零触碰，202 只推迟**消费**不豁免**校验**。但补供给完成路径必须逐字沿用模块契约 `job-route-decision.ts:14`「binding 只可绑 route_decided 的版本」——Ban 从非 decided 状态写 binding/snapshot；「`recruiter.ts:428` 唯一生产者」EXEC 落字定义为**唯一结构生产者**（`snapshotInterviewRoute` 函数唯一实现，调用点可增至 worker 完成路径），start-tx 点 `:431` belt-and-suspenders throw 原样。
5. **(e) sticky 死端——可满足，须钉终态诚实性（C-MO-U5）**。sticky 契约实读确认（`:14` 三终态永不自动重试 + `:179-180` noop）。机件在卷：`releaseConsumption`（`commerce.ts:138`·abandon/fail 路径 `:200/:267` 在用·uc018 abandon→released 即该机件的 live 证明）与 `interview_unavailable` 降级终态（`web-logic.proof.ts:408-409` degraded+显式出口）。设计 (i)（额度锚留在 begin）下 awaiting 死端=零资金移动的壳显式失败态，(e) 简化为状态+披露；若采 (ii) 须显式退款路径。**诚实性钉**：既有 `interview_unavailable` 展示带 retry 出口——route-sticky 死端复用该形状时 retry 将确定性复入死态，EXEC 须判别该出口的诚实性（指引文案不得暗示可恢复），Ban 静默挂起 Ban 自动重试。
6. **(f) SSE 窗口——可满足，产品定谳 EXEC 落字**。实读：`interview-state.ts` ALL_PHASES 无 awaiting-supply 相位；`interview_unavailable` 语义=worker 失败终态，**Ban 用它洗等待窗**（harness 已 Ban·维持）。202→interviewId→/interview 的窗口须新相位或显式非终态等待+诚实文案，EXEC 裁决版落字。
7. **范围裁决（与 mw-e2e-ha 共裁·本席半裁=仅 bound 面）**：**C-MO-U3**。理由三点：(1) 红① 致死点仅 bound 面（`:410`→409 实读确认）；(2) 通用面 409 `candidate_route_undecided` 是 G7S C-MO-S4 刚完成双审 PASS 的在案裁决（拒因前移·拒的本体零消失·同事务回滚零悬账）——本刀翻转它=无新伤害证据下重开在案裁决，且把 (a)~(f) 负担倍增到 uc018 正在行使的端点族上；(3) 两拒因「同构」仅在族层面成立，账本/消费面不同构（通用面 409 先于扣额入队原子阻断；bound 面 409 在壳创建层、额度尚未入局）。双面同构 202 须另立 REQUEST + 全套义务 + 显式重裁 C-MO-S4。
8. **awaiting-begin awareness 缺口（C-MO-U4）**：路线乙 bound-only 下，202 受理后客户端旅程仍会走向 bound interview 的 interview begin——现该分支（`application_id != null`）跳过供给**无条件扣额+入队**：对 awaiting 面试 begin = 烧额度 + 入队即败（worker 门 throw）= 恰是路线乙必须消灭的悬账形状换位重生。故 EXEC 裁决版触碰面须重列（interview.service bound 分支 awaiting-aware 或产品码内客户端闸），Ban 以「触碰面清单未列」为由漏改。
9. **occupied 面相容性核验**：路线乙 202 只作用于未决分支；decided 路径行为零变 → `full.e2e.ts` 状态机断言（start → 200 `started`+redirectTo·begin → 202）不需改动即继续成立，与 `7d65d0f3` 零 diff 钉相容 ✓。

## D. 路线甲测试语义裁决（model-op 视角）

1. **观测通道实读确认**：`listMyApplications`（`recruiter.ts:153-162`）返 `id/job_id/interview_id/resume_id/status/score/source/job_title`——**零 route 决策暴露**；spec `:102` 旁证通道同形。产品 API 通道 (a) 判死成立 → SELECT-only DB 轮询 (b) 为唯一只读通道。
2. **本席半批（C-MO-U6）**：spec 内 SELECT-only DB 轮询作为夹具观测形态**产品语义面可批**——只读产品自产状态、零写入零强造=不构成 masking；白名单沿 G7T sidecar 先例（`job_semantic_revision.status` / `job_route_decision.attempt_outcome` / 时间戳列），Ban `interview_job.payload` / `ai_invocation_trace.output`（模型输出/Key 物料不入 spec 日志）。**形态最终批准权与 mw-e2e-ha 共裁，两席任一不批则甲退回重设计**（harness §2 甲已自设此门，姿态正确）。
3. **cap 与方差**：轮询 1–2s·上限 N ≤60s EXEC 定值入收据；G7T v2 实测决策 = publish+5s 双样本（方差面仅两样本，如实登记非硬分布）；60s 给 >10x 余量。**超时=诚实 FAIL**（五分类 env/fixture 面归类）·Ban 调小 N 制造 flake ·Ban timeout 语义洗 FAIL ·Ban begin 409 后重试点击（begin 一次性语义保持——产品 409 文案「请待…再试」暗示重试但错误边界 UI 无重试路径，此残余属 §2 甲风险 (c) 披露义务，backlog 立行权归协调方）。
4. **诚实性残余在卷**：甲=夹具对齐≠产品修复，真实用户 0–2s 窗口残余如实披露（harness §2 甲风险 (c) 自报到位·非洗绿——e2e 谓词未变，变的是夹具到达时点）。

## E. prove 契约 / 预算报备 / Key 卫生 / Pins 对照

1. **prove 契约**：trio ×1 各一次（wiring `package.json:278/:279/:282` 实读✓·EXEC 按 tip 重核回填）·committed SHA 重钉+frozen-lockfile+独立 worktree·七字段逐 attempt·三来源交叉·attempts 全记录·Ban retry-to-green 全套在卷。**CMD1/CMD3 retained 1/1/1 待真测**——G7T 后 trio 构成 `1/−/−`，CMD2 ×2 attempts 如实 retained；本刀 EXEC 后 trio 才产生新 attempt 行，EXEC 前不得预claim 任何读数。**本审预算报备：恰 0 prove run 0 live 0 DB 连接 0 Key 值读取**（≤200 为 EXEC 预算口径非本审支出）。
2. **Key 卫生**：loader name-only 进程环境·Ban `.env*`（presence 逐 attempt 记录）·Ban Key 值/fingerprint 入 receipt/log/commit·sidecar 白名单 Ban output/payload 列——全在卷 ✓。
3. **Pins 原值对照（十值+retained·零翻转）**：haStatus=NOT_HA ✓ · releaseEvidence=false ✓ · claimProductionHA=false ✓ · gR45Closed=true ✓ · coveredCount=8 ✓ · ms3EqualsR4Closed=false ✓ · PG-retained ✓ · DELETE=503 ✓ · `g7SuiteGreen=false` ✓ · `actualSpendCny=null` ✓ · trio OPEN ✓ · 红① STILL OPEN（时序面构成）✓ · GAP-G7K-API-REDS P1 OPEN（`0c6c3287` 不翻）✓ —— slice/harness/stub 三文件口径逐值一致，零翻转 ✓。

## F. Fail-trigger audit（触发即 FAIL 项 · 逐项未触发）

预选路线→未触发（两路线对称·零排序）｜202=跳过校验的弱化定义→未触发（受理后补+门零触碰清单）｜扣额移完成时点→未触发（(a) 明文 Ban·残缺口以 C-MO-U1 钉补）｜uc018/occupied 断言触碰→未触发（`7d65d0f3` 零 diff 钉）｜blob/行号失实→未触发（×11 全等+行号对号）｜ancestry 断裂→未触发（四点 is-ancestor EXIT=0）｜sticky 自动重试私改→未触发（三零动）｜masking（夹具强造 metadata/伪造行）→未触发（Ban 双写·只读轮询与写入显式切分）｜retry-to-green/假绿→未触发（EXIT 契约双向+四 Ban）｜self-approve/代签→未触发（PENDING footer 原样保全·本段仅 mw-model-op 半签·不代签 mw-e2e-ha）｜SSOT/backlog 翻转→未触发。

## G. Blockers

**0 Blocker。**

## H. Conditions（C-MO-U1~U6 · 转 EXEC 裁决版落字后逐项兑现核验）

- **C-MO-U1（额度锚不变式）**：EXEC 落字——任何 enqueue start job 路径事务内或其前必有已预留 entitlement；补供给完成路径限 (i) 只补 bind+snapshot（入队留在额度锚定的 interview begin）或 (ii) 202 受理事务同步 reserveEntitlement（begin 幂等不双扣）；无额度入队=Ban。
- **C-MO-U2（binding 不变量延伸）**：补供给完成路径逐字沿用「binding 只可绑 route_decided 的版本」；Ban 非 decided 写 binding/snapshot；`snapshotInterviewRoute` 唯一结构生产者定义落字（调用点可增）；`:431` belt-and-suspenders 原样。
- **C-MO-U3（范围=仅 bound 面）**：路线乙 EXEC 只触 bound 面 `interview_ineligible_route`；通用面 `candidate_route_undecided` 409 维持 G7S C-MO-S4 已裁决语义零触碰；双面同构 202 另立 REQUEST+全套义务+显式重裁。本席半裁·与 mw-e2e-ha 共裁后协调方定案。
- **C-MO-U4（awaiting-begin awareness）**：awaiting 面试的 interview begin（bound 分支）语义 EXEC 落字（无扣额无入队显式 awaiting 响应或产品码内客户端闸）；触碰面清单据实重列；Ban 202 后直 begin 烧额度入队即败。
- **C-MO-U5（sticky 死端+SSE 终态诚实）**：awaiting+sticky → 显式终态（零额度壳显式失败态或沿 `releaseConsumption`）；retry 出口诚实性判别（不暗示可恢复）；Ban 静默挂起/自动重试/以 `interview_unavailable` 洗等待窗；SSE 等待相位产品定谳落字。
- **C-MO-U6（路线甲观测通道+cap）**：本席半批 spec 内 SELECT-only DB 轮询（白名单三列族·Ban payload/output·零写入）；N ≤60s EXEC 定值入收据+方差如实（双样本 +5s 非硬分布）；超时=诚实 FAIL 五分类；Ban 调 N 制造 flake/timeout 洗 FAIL/begin 409 后重试点击；形态最终批准与 mw-e2e-ha 共裁，任一不批甲退回重设计。

## I. 三行中文摘要

1. G7U REQUEST `4279595c`（恰 4 .md +223/−0 docs-only · 四点 ancestry 全通 · blob ×11 亲算全等 · 行号逐一对号）拒因勘误成立：红① 致死=bound 面 `interview_ineligible_route`（`recruiter.ts:410`→`applications.service.ts:42-46` 409），`candidate_route_undecided` 系 G7S 通用面先例，两拒因族同构而消费面不同构。
2. 路线乙六义务**可满足**：额度锚不变式、binding 不变量延伸、仅 bound 面范围、awaiting-begin awareness、sticky 死端+SSE 诚实五钉（C-MO-U1~U5）转 EXEC 落字后 coding；路线甲 SELECT-only 轮询本席半批（C-MO-U6·形态与 mw-e2e-ha 共裁）·cap/超时诚实 FAIL 姿态合规。
3. 0 Blocker · Pins 十值+retained 零翻转 · 本审恰 0 prove 0 coding 0 live 0 Key 值读取 0 DB 连接 · alone≠dual 本 PASS 仅为 mw-model-op 半签≠EXEC 授权≠路线定案≠任何 Pin 翻转 · EXEC 须 BOTH PASS+协调方授权+C-MO-U1~U6 兑现 · 禁 push。

*PRE-EXEC dual 审查段 · mw-model-op · G7U · 2026-10-07 · 半签不代签 · 禁 push*

Verdict: PASS

---

# POST-PROVE dual 审查段（EXEC 后 · mw-model-op · model-op/额度面焦点 · 只认命令+EXIT+可复现证据）

**被审包**：G7U EXEC 链 = spec 刀 `bde3ab25`（实跑 commit `dbed8a6f`，二者 spec blob 亲算全等 `af02699a`）+ 收据 `c9e262a5`（恰 4 .md）· 基座 = PRE dual BOTH PASS（mw-e2e-ha `74c4d1f4` + mw-model-op `db208386`）+ 协调方路线甲（夹具刀）EXEC 授权 · 本席独立 worktree `rv/g7up-model-op` @`c9e262a5` · 审查日 2026-10-07。

## A. 包完整性机检（全亲算）

1. **文件计数**：PRE-dual tip `db208386`→tip `c9e262a5` EXEC 段恰 **1 spec（`apps/web/e2e-ui/recruiting-bound.spec.ts` · 纯插入 +72/−0 · numstat 亲测 · 删除行 grep=0 实测）+ 4 收据 .md**（00-summary/01-cmd1-iso/02-cmd2-ui/03-cmd3-perf）；全 REQUEST `4279595c`→tip 范围恰 7 文件 = 2 PRE 审查 .md + 4 EXEC 收据 + 1 spec——**零产品码 diff**（`db208386..c9e262a5` 非 `ai-docs/` 非 `e2e-ui/` 文件命中=0 实测）。
2. **spec 纯插入**：+72/−0（`git diff --numstat db208386 bde3ab25` 亲测）· 既有断言行逐行零触碰（含 `:96` waitForURL 与终态断言串原样）——Ban 断言放宽守住。
3. **SSOT 零 diff**：`ai-docs/delivery/north-star-hard-gates.md`（及 north-star-ha.md/coverage-matrix）`db208386..c9e262a5` diff 空（wc -l=0 亲测）——SSOT/backlog 零翻转。
4. **本席 PRE 段 append-only 保全**：`aa8bbdad` 版审查文件（25184B · md5 `2bf0026e8fc02fcd7c04a38178e3e0f6`）与 tip 内容**全等**（diff 空 亲测）——PRE 段逐字节未动，本段为纯追加。
5. **产品码 blob 链本席独立重算 12/12 全等**：`recruiter.ts` d06b4f49 · `route-classify-consumer.ts` 223b7f09 · `job-route-decision.ts` a621d8bd · `job-route-classifier.ts` 79ceded8 · `adaptive-role-resolve.ts` 80abbb80 · `interview.service.ts` fbea8aeb · `candidate-route.ts` 8bf8e9bd · `applications.service.ts` 9a17cfe4 · `e2e/full.e2e.ts` 7d65d0f3 · `package.json` 0afb3bd2 · `run-e2e-isolated.mjs` 13dbfc43 · `prompts.ts` 69ca4633（全部 `git hash-object` 亲算 @tip）——产品语义零变更结构背书。

## B. 路线甲相关核验（本席域视角 · 逐项）

1. **轮询 SELECT-only（C-MO-U6 Ban 面）**：committed spec 轮询亲读——SELECT 列族 = `job_posting.id`（仅 join/WHERE 键）+ `job_semantic_revision(status,created_at,revision)` + `job_route_decision(route_outcome,attempt_outcome,created_at,revision)`；**零 `interview_job.payload` 零 `ai_invocation_trace.output` 零写语句**（diff 全文亲读）；console 输出仅时延/revision_status/attempt_outcome/ISO 时间戳非敏感列——Ban payload/output 入日志守住；白名单族与 G7T sidecar 先例（`gap-route-classify-quality/02`：`job_route_decision(attempt_outcome,…)`/`job_semantic_revision(status)`/Ban payload+output+写查询）**同表同族**。连接物料只经 runner 既有 `PG*` env 契约（`run-e2e-isolated.mjs:1983-1986` baseEnv+:2308 动态 PGPORT 亲读，与 fixture 读取面同款）· pg 驱动经 `packages/db` 声明依赖 createRequire 解析（零 manifest 改动 · package.json blob 0afb3bd2 背书）。
2. **cap=60s EXEC 定值**：`ROUTE_DECIDED_WAIT_CAP_MS=60_000` committed 一次成型（blob `af02699a` 亲读）· 周期 1000ms · 超时=console.error+throw **诚实 FAIL**（无静默 skip · 无 begin 重试 · 无调参）；EXEC 与本席 re-run 均 **cap 未被行使**（观测最大 4.7s/4.7s）。
3. **红① 清除后旅程推进的额度面观察（早停「额度已释放」E-WARM 语义 × 扣额时序一致性）**：链上证据 = route_decided ×2 **先于** begin → begin 全过（零 409 · 旧 `:96` 30s waitForURL 死窗签名 **0 命中** grep 实测）→ 面试页 ×2 到达 → 旅程真实展开 → 自适应提前结束（early_weak「练习因持续偏弱或多次未决提前结束」）→ chromium 面 alert「没有得到足够可信的评分证据，**本次预留额度已释放**。岗位面试可从『我的投递』重新开始」（本席 re-run error-context.md 亲读 · 与 EXEC Receipt 02 逐字同形）。**额度时序一致性码面锚（本席 PRE C-MO-U1 锚点 @tip 复读）**：bound 面供给（`recruiter.ts` R2 P-LOOP bind 重试 :399 + `:428` snapshotInterviewRoute 唯一生产者 · 均在启动事务内）**先于**扣额（`interview.service.ts:339-346` reserveEntitlement 于 begin 事务 · `:342` 402 映射 · throw 即回滚零悬账）；早停释放走 `abandonInterviewAndRelease`（`interview.service.ts:562-577`「退还预留额度(不漏扣)」· commerce saga release 对接）→ `apps/web/lib/view-model.ts:68`「额度已释放」文案**仅在释放路径返回后呈现**且含显式重启出口 = E-WARM 语义诚实成立；mobile 面「面试已完成,但报告暂时无法生成」= `view-model.ts:66` 降级报告面同链异文案，两者皆终态非死胡同。**边界如实登记（OB 非阻断）**：EXEC 与本席 re-run 均无 DB consumption/snapshot 账本时间线（EXEC sidecar 8 miss/9 tick-timeout 仪器缺口在卷 · 本席审纪不另起 sidecar）——额度面观察止于 **UI 文案+码面锚层**，DB 账本层未观测，留后继。
4. **route_decided 后 begin 全过 = G7S 供给链 UI 面 live 复证**：EXEC decided→begin ×2（decision_created_at 22:35:34.093Z / 22:38:39.030Z）+ 本席 re-run ×2（23:03:53.695Z / 23:07:03.439Z），attempt_outcome 均 `result_validated`——「供给先于扣额」序在 bound 面 **×4 累计 live 复证**；通用面 G7S C-MO-S4 已裁决 409 语义零触碰（产品码 blob 12/12 全等背书）。

## C. fresh re-run（本席 · 恰好一次 · 禁重试）

| 字段 | 值 |
|---|---|
| CMD 原文 | `pnpm run e2e:ui:isolated`（wiring `package.json:279` @`0afb3bd2` 亲读）· worktree `rv/g7up-model-op` @`c9e262a5` · 依赖 `pnpm install --frozen-lockfile` 预置（非 e2e 重试） |
| EXIT | **1**（`G7UP-RV-cmd2-ui-EXIT=1` log tally · UI 面 e2e:ui 无 LOCAL_E2E_RECEIPT 同口径） |
| tally | **11 passed / 3 failed / 10 skipped (6.8m)** —— 与 EXEC CMD2 **11P/3F/10S 同形同值**（EXEC 7.3m） |
| 时间戳（UTC） | ~23:00Z → ~23:12Z（log mtime 量级 · next build 首建后真跑） |
| Key presence（name-only） | `MODEL_API_KEY=set`（loader source 注入进程环境 · KEY-PRESENT 探针在卷）· `MODEL_ENDPOINT_PROFILE=dashscope-cn-beijing` · `MODEL_NAME=qwen-plus` · `.env*` ABSENT · 零 Key 值/零 fingerprint 入 log/commit |
| fixture 读数 | `[g7u-fixture] route_decided observed` ×2：3020ms wait + 1714ms publish 偏移 ≈4.73s（chromium）· 3024ms + 1694ms ≈4.72s（mobile）· 均 `result_validated`——与 EXEC 4.0s/4.7s 同族，cap 未行使 |
| 失败三点同位 | recruiting-bound chromium/mobile ×2 @`waitForTerminalOrAnswer`（spec :52 ← :183 · 与 EXEC 同锚同 ~2.8m 量级）+ golden(chromium):10 `textarea[name="text"]` toBeVisible 20s（env/冷启候选同形）· 页面态亲读：「练习因持续偏弱或多次未决提前结束」×2 + 「本次预留额度已释放…重新开始」（chromium）+ 「面试已完成,但报告暂时无法生成」（mobile）——**与 EXEC 残留面逐字同形** |
| 禁重试 | 恰好一次 · EXIT=1 原值记账 · 本席 re-run live 估 ≤40（est-not-counter）· `actualSpendCny=null` |

**re-run 裁定**：EXEC CMD2 主证读数（11P/3F/10S · 残留=旅程自适应提前结束 ×2 + golden ×1 · fixture decided ×2 先于 begin · 死窗零现）**独立复现成立**——EXEC 收据诚实性经本席二次实测背书。

## D. 五钉休眠裁决（如实登记）

- **C-MO-U1~U5（路线乙五钉）→ 休眠钉（dormant）随卷保留**：协调方裁决路线甲 · 产品零触碰使乙专属义务（额度锚不变式 / binding 不变量延伸+唯一结构生产者 / 仅 bound 面范围 / awaiting-begin awareness / sticky 死端终态+SSE 等待窗定谳）**全部未触发未兑现**——本 PRE H 节 C-MO-U1~U5 定义逐字有效；**若未来走路线乙（202 受理后补），五钉须全量兑现后方可 coding，缺一即乙禁 coding**。
- **C-MO-U6（路线甲观测通道+cap）→ 已兑现转正（非休眠）**：SELECT-only 白名单 + cap60s EXEC 定值 + 超时诚实 FAIL + 方差双样本（EXEC 4.0s/4.7s + 本席 4.73s/4.72s · 与 G7T「+5s 轮询量子」相容）+ Ban 调 N/timeout 洗 FAIL/begin 409 后重试点击全守住——本席逐项复核**兑现成立**。

## E. Fail-trigger audit（十二项关键触发器 · 全未触发）

改产品→未触发（blob 12/12 亲算全等）｜断言放宽→未触发（+72/−0 纯插入亲测 · 终态断言串原样 · 页面文案与断言串不一致未被用作放宽理由）｜masking/强造状态→未触发（只读 SELECT 零写入 · 白名单族亲读）｜retry-to-green/假绿→未触发（EXEC 三 CMD 各计 attempt 一次+误发档全记录 · 本席恰一次 EXIT=1 原值记账）｜SSOT/backlog 翻转→未触发（SSOT diff 空）｜self-approve/自批→未触发（本席审 EXEC 非自批 · 禁自批纪律守住）｜代签→未触发（alone≠dual · 不代签并行 mw-e2e-ha）｜Key/`.env*` 违规→未触发（name-only · loader source · ABSENT 复核）｜额度绕通→未触发（begin 锚 reserveEntitlement 原位 · 产品码零动 · 早停释放路径原样）｜Pins/retained 翻转→未触发（`g7SuiteGreen=false` · trio OPEN 1/1/1 · `actualSpendCny=null` · haStatus=NOT_HA · GAP 状态 retained）｜ancestry/blob 失实→未触发（dbed8a6f≡bde3ab25 spec blob 亲算全等）｜预算超限→未触发（EXEC est ≤60 ≪ 200 · 本席 +est ≤40）。

## F. Blockers / Conditions

**Blockers：0。**

**Conditions（随卷保留）：**
1. C-MO-U1~U5 休眠钉随卷（未来路线乙须全量兑现，缺一乙禁 coding）。
2. 残留红面（旅程自适应提前结束 ×2 + golden 冷启候选 ×1 + api 面 G7S 同形 ×2）**非本刀授权域** · 精确归因与 backlog 立案权归协调方 · C-HA-5 披露随卷：**夹具对齐≠产品修复**，真实用户 0–2s 未决窗点击 begin 仍得 409 `interview_ineligible_route` fail-closed（无重试引导）。
3. 红① GAP 状态 **retained = STILL OPEN（构成再变）**：begin 时序面清除证据成立（×2 EXEC + ×2 本席 re-run 独立复证）· 协调方清除判据（14P/0F/10S 或同等）**未达**（11P/3F/10S ×2）· trio OPEN 1/1/1 · `g7SuiteGreen=false` · Pins 十值+retained 零翻转 · `actualSpendCny=null`。
4. 额度面 **DB 账本层观测缺口**（EXEC sidecar 仪器缺口同族 · 本席未另起 sidecar）留后继，不阻断本裁。
5. 本席 re-run 单次预算入账（live est ≤40 · est-not-counter）· 后继任何 CMD 重跑须另获授权。

## G. 三行中文摘要

1. G7U EXEC 路线甲夹具刀（`bde3ab25`≡实跑 `dbed8a6f` · 纯插入 +72/−0 · 产品码 blob 12/12 本席亲算全等 · SSOT 零 diff · 本席 PRE 段 25184B 逐字节保全）包完整性机检全过：恰 1 spec + 4 收据，零产品码零断言改动。
2. 路线甲核验成立：SELECT-only 白名单族（零 payload/output 零写入）· cap=60s 定值未行使 · route_decided 先于 begin ×4（EXEC ×2 + 本席 re-run ×2）=G7S 供给先于扣额链 UI 面 live 复证 · 早停「额度已释放」与 `abandonInterviewAndRelease` 释放路径及 begin 锚扣额时序一致（E-WARM 语义诚实 · DB 账本层缺口如实登记 OB）。
3. 本席 fresh re-run 恰一次：**11P/3F/10S · EXIT=1 与 EXEC 同形同值**（残留=旅程自适应提前结束 ×2 + golden ×1 · 死窗零现）· C-MO-U6 兑现转正 · C-MO-U1~U5 休眠钉随卷（未来路线乙须全量兑现）· 0 Blocker 5 Conditions · 红① STILL OPEN（判据未达 · trio OPEN）· 本 PASS 仅为 mw-model-op POST-PROVE 半签≠dual 定谳≠任何 Pin 翻转 · 禁 push。

*POST-PROVE dual 审查段 · mw-model-op · G7U · 2026-10-07 · 半签不代签（不代签 mw-e2e-ha）· 禁 push*

Verdict: PASS
