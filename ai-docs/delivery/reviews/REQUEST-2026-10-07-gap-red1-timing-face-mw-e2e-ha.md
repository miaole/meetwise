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
