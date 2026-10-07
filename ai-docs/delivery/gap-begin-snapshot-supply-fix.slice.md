# Slice — G7 · **通用 begin 供给面收口产品刀**（Line G7S · docs REQUEST · `draft:awaiting_pre_exec_dual`）

**配套**: harness `harness/gap-begin-snapshot-supply-fix.md`（SSOT 细节/根因锚/候选全文以 harness 为准）· 双审 stub `reviews/REQUEST-2026-10-07-gap-begin-snapshot-supply-fix-mw-e2e-ha.md` + `reviews/REQUEST-2026-10-07-gap-begin-snapshot-supply-fix-mw-model-op.md`
**上游**: F-F EXEC receipt `3da3f0cb`（实跑 code SHA `7ed35f0d` · last_error=adaptive_role_route_missing ×2）→ F-F POST-PROVE dual PASS `d4580d6c`(mw-model-op · 根因归类 H0-alt-5·d=产品供给面) + `0d97d7be`(mw-e2e-ha) → **C-MO-Q1~3 转产品刀硬义务**
**Base**: `origin/feat/mysql-schema-skeleton` `91f1c751`（初 fetch tip `0d97d7be` · turn 内 origin 前进恰一笔 = coordinator F-F nail `91f1c751` docs-only +13/−0 · 码面锚零漂移复算全等）· worktree `/Users/miaole/Desktop/golucky/meetwise-line-g7s` · branch `line/g7s-snapshot-supply`
**本 turn 边界**: docs-only 一次 commit · Ban coding · Ban prove 执行 · Ban live（本 turn 零调用零 Key 加载零 DB 连接）· Ban push · Ban SSOT/backlog 状态翻转 · Ban 碰 sibling 归档/已占用行 · Ban 门弱化回 legacy 兜底 · Ban 洗断言 · Ban self-approve · alone ≠ dual · 本 commit 不预claim 任何 post-commit EXIT

## 范围（REQUEST 要点五条）

1. **根因（双审裁决承卷 · 本席码面亲读复核 @`91f1c751`（=初 fetch `0d97d7be` 码面全等）全中）**：`adaptive_role_route_missing` 三红根因 = **通用 begin 面 route snapshot 结构性零写**——门 `adaptive-role-resolve.ts:35-39/:55-62`（blob `80abbb80`，默认 ON）要求 snapshot 叶；消费点 `interview-consumer.ts:343-356`（blob `7b1b6713`，`:344` `roleFromJobRouteMetadata` 声明后从未赋值=死源）；**全树唯一 snapshot 生产者 = recruiter-flow begin `recruiter.ts:428`**（blob `d06b4f49`；`snapshotInterviewRoute` `job-route-decision.ts:321-344`，blob `a621d8bd`）；通用 begin（`interview.service.ts:192-340`，blob `257718cf`）绑 resume 后 `:337` 入队、零 snapshot 写，interview 自 `create():587` 裸壳起即无 application/job 祖先。**断点一句话**：断在「binding→snapshot」跳的通用面缺位——classify 纵 succeeded（`validateModelRouteOutput` `job-route-classifier.ts:115` 保证 route_decided 必带有效叶），通用面不存在任何通向 `interview_route_snapshot` 的代码路径，结构性无链非链断中段。**新发现（硬约束）**：`0104_job_route_decision.sql:161-173` `application_id/job_id NOT NULL` + FK `application_route_binding` → 通用面现结构无法落行，一切供给候选必涉 DDL 演进；伪造 binding/application = masking Ban。
2. **修复候选（≥2 · 列利弊交双审 · 双审+协调方裁决后方可 EXEC）**：**候选 A（推荐）**=begin 同步供给+前置 eligibility fail-closed 镜像（镜像 recruiter 面 `interview_ineligible_route`）+`:344` 死源并案（决策输入源=resume 派生/quiz 工件/用户显式选 track 留双审裁；Ban 用 resume 强造 job-posting 语义）；**候选 B**=worker start-job 侧补写（供给晚于扣额·悬账面大）；**候选 C**=interview 维度复用 route_pending→classifyJobRoute 异步漏斗（异步竞态恰是现红时序面）；**候选 D（默认不选）**=范围决策通用面不入 adaptive（改 uc018 可观察行为=occupied 行冲突）。**门语义零弱化铁律**：fail-closed 门零改动、缺叶仍拒、默认 ON 零翻转——修的是「供给缺失」非「放松门」。触碰面精确清单（候选 A 版）见 harness §2.5。
3. **prove 方案**：pre-exec dual BOTH PASS → 协调方授权 coding/EXEC → trio 三条 CMD（`pnpm e2e:isolated`/`e2e:ui:isolated`/`verify:e2e-performance`，wiring `package.json:278/:279/:282` @`0afb3bd2` · EXEC 按 tip 重核）**各恰好一次**（iso→ui→perf）· **预算 ≤200**（诚实预披露：修复生效后 uc018 start job 真实 adaptive 全展开，live 面**较 F-F live=2 显著增大**）· Key 只经进程环境 · Ban `.env*` · 七字段逐 attempt 全记录 · 三来源交叉一致；**读取面板扩查（C-MO-Q2）**：EXEC 新增授权查询 `job_route_decision`/`route_consumption_event`/`interview_route_snapshot` 定谳红①，Ban 沿 F-F 四查询就地定谳；收据落 `receipts/gap-begin-snapshot-supply-fix/`（3 per-CMD + SUMMARY）。
4. **EXIT 契约（双向）**：**三绿** → `g7SuiteGreen` 翻转 = 三绿 + post-dual BOTH PASS + 协调方 nail 全链（缺一不可；trio 绿 ≠ suite green）；**仍红** → EXIT=1 原值 + 逐 case 五分类 + 根因假设修正如实登记 → 迭代刀重走 REQUEST（Ban flake 记法 · env-gap/时序不冲销 EXIT=1）。uc018 面只许红转绿 Ban 改断言。
5. **Ban**：门弱化/legacy 兜底回潮（`adaptive-role-resolve.ts` 零触碰）/opt-out=0 记作修复 · 洗断言/改 withhold（blob `13dbfc43` 冻结）/retry-to-green · covered/SSOT 行翻转（nail 阶段才改；GAP P1 `0c6c3287` 不翻）· 已占用行（018/052/025/004/011/014/026/002/001/028/016/017）· **recruiter-flow 面零回归**（`recruiter.ts:428` 唯一生产者链零改）· masking（夹具强造 metadata/伪造 binding）· Key 物料越界。

## Non-claims

Not a pass · not run（本 REQUEST 零实跑）· not fixed · not coding · not trio green · not suite green · not R1 closed · not Disclosure-1 closed · not G6 closed · not R5 retired · not HA · not covered · not `releaseEvidence=true` · not nail · not backlog 状态翻转 · not live（本 turn）· not coordinator authorize · 供给候选 A/B/C/D 未裁决（均为候选非定案）· 红①归因未定谳（留 EXEC 扩查）· `g7SuiteGreen=false` · trio OPEN（EXIT 1/1/1）· `actualSpendCny=null` · alone ≠ dual

## Pins（原值 + retained）

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503 · `g7SuiteGreen=false`（retained · 至三绿+post-dual+协调方 nail）· `r1Closed=false`（retained）· `techRoleFailClosedOptOutG7Only=true`（retained · Disclosure-1 OPEN · C-MO-Q3）· trio OPEN（1/1/1 真实业务红）· GAP-G7K-API-REDS P1 OPEN（`0c6c3287` 登记 · 不翻）· `actualSpendCny=null` · STOP

---
*Slice · G7S 通用 begin 供给面收口产品刀 · 2026-10-07 · `draft:awaiting_pre_exec_dual` · docs-only · 根因=通用 begin 面 snapshot 结构性零写（断点=binding→snapshot 跳通用面缺位）· 候选 A 推荐/B/C/D 交双审 · 门语义零弱化 · trio ×1 各一次 · 预算 ≤200 · C-MO-Q1~3 硬义务 · Ban 假绿/retry-to-green/门弱化/洗断言 · STOP*
