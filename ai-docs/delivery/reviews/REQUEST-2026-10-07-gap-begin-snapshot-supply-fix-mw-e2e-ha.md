# REQUEST — **通用 begin 供给面收口产品刀**（adaptive_role_route_missing 三红根因修复方案 + trio 复跑方案 · ≠ suite green）· pre-exec · mw-e2e-ha

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503 · `g7SuiteGreen=false` · `r1Closed=false` · `techRoleFailClosedOptOutG7Only=true`
**Expert**: `mw-e2e-ha`
**Knife**: `harness/gap-begin-snapshot-supply-fix.md` · slice `gap-begin-snapshot-supply-fix.slice.md`
**上游**: F-F EXEC receipt `3da3f0cb`（实跑 code SHA `7ed35f0d` · last_error=adaptive_role_route_missing ×2）· F-F POST-PROVE dual PASS `d4580d6c`(mw-model-op · 根因归类 H0-alt-5·d=产品供给面) + `0d97d7be`(mw-e2e-ha) · **C-MO-Q1~3 转本刀硬义务**
**Base tip**: `91f1c751`（`origin/feat/mysql-schema-skeleton` fetch 后实测 tip · 初 fetch `0d97d7be` · turn 内 origin 前进恰一笔 = coordinator F-F nail `91f1c751` docs-only · 码面锚零漂移 · not a prove tip · 实跑 code SHA 以 EXEC 期 worktree HEAD 实测为准）
**Date**: 2026-10-07
**Line**: **G7S**

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
| `r1Closed` / Disclosure-1 | **false / OPEN**（retained · C-MO-Q3：OPEN 至供给面实际修复） |
| Trio | **OPEN**（EXIT 1/1/1 真实业务红 retained） |
| GAP-G7K-API-REDS | **P1 OPEN**（`0c6c3287` 登记 · 本刀不翻 backlog 状态） |
| `actualSpendCny` | **null**（沿 I 线 · Ban invented spend） |

## 请审什么（mw-e2e-ha · e2e 纪律 / 诚实性 / HA 口径）

Line G7S · **通用 begin 供给面收口产品刀**（F-F 甄别 + model-op 双审裁决根因的修复 REQUEST）。请审：

1. **根因承卷与码面复核（harness §1）**：`adaptive_role_route_missing` 三红根因 = 通用 begin 面 route snapshot 结构性零写——门 `adaptive-role-resolve.ts:35-39/:55-62`（blob `80abbb80` 默认 ON）+ 消费点 `interview-consumer.ts:343-356`（blob `7b1b6713` · `:344` `roleFromJobRouteMetadata` 死源）+ 全树唯一 snapshot 生产者 `recruiter.ts:428`（blob `d06b4f49`）+ 通用 begin `interview.service.ts:192-340`（blob `257718cf`）`:337` 入队零 snapshot 写、`create():587` 裸壳无 application/job 祖先；断点=「binding→snapshot」跳通用面缺位（结构性无链非链断中段）；`validateModelRouteOutput`（`job-route-classifier.ts:115`，blob `79ceded8`）保证 route_decided 必带有效叶 → 「有 snapshot 而叶空」不可达。行号/blob EXEC 期按当 tip 重核。
2. **修复候选归类与触碰面（harness §2 · C-MO-Q1 承接）**：候选 A（begin 同步供给+前置 eligibility fail-closed 镜像+死源并案 · 本刀推荐）/ B（worker 侧补写）/ C（interview 维度异步漏斗）/ D（范围决策 · 默认不选）利弊是否如实；**门语义零弱化铁律**（fail-closed 门零改动 · 缺叶仍拒 · 修「供给缺失」非「放松门」）；**DDL 硬约束发现**（`0104_job_route_decision.sql:161-173` `application_id/job_id NOT NULL`+FK → 供给候选必涉 DDL 演进；伪造 binding/application = masking Ban）；夹具刀仅红①时序面合法、通用面强造 metadata=masking Ban；opt-out=0 仅 G7 临时 · never R1 · Ban 记作修复。
3. **trio 复跑纪律（harness §3 · G7K C-K1~C-K8 / G7R C-HA-1~8 沿用）**：三条 CMD（`pnpm e2e:isolated`/`e2e:ui:isolated`/`verify:e2e-performance`，wiring `package.json:278/:279/:282` @blob `0afb3bd2` · EXEC 按 tip 重核回填）**各恰好一次**（iso→ui→perf）；单条 CMD 内部重试按自身契约算一次 attempt；七字段逐 attempt 全记录；退出码/machine receipt/原始 log 三来源交叉一致；withhold 机制零触碰（`run-e2e-isolated.mjs` blob `13dbfc43` 冻结）。
4. **预算诚实（harness §3.2）**：上限沿 G7K/G7R **≤200 次 live 调用**；**修复生效后 live 面较 F-F（live=2）显著增大**（uc018 start job 秒抛改真实 adaptive 全展开 ×2 project ×2 CMD 面）——偏差已预披露；超限即停如实记中止；voice/OCR/ASR/TTS capability skip = 0 调用 ≠ green；`actualSpendCny=null` 沿 I 线。
5. **读取面板扩查（C-MO-Q2 硬义务）**：EXEC 期新增授权查询 `job_route_decision`/`route_consumption_event`/`interview_route_snapshot`（SELECT-only 白名单 · Ban `interview_job.payload`/`ai_invocation_trace.output`）定谳红①归因；**Ban 沿 F-F 四查询读数就地定谳红①**；sidecar/keep-window 机制沿 F-F 先例由协调方 EXEC 落字。
6. **EXIT 契约双向（harness §4）**：三绿 → **`g7SuiteGreen` 翻转 = 三绿 + post-dual BOTH PASS + 协调方 nail 全链**（缺一不可；trio 绿 ≠ suite green）；仍红 → EXIT=1 原值 + 逐 case 五分类明细 + 根因假设修正如实登记 → 迭代刀重走 REQUEST；**Ban 假绿 · Ban flake 记法 · Ban retry-to-green · Ban 只留绿 attempt**；uc018 面（trio UI 面经过的已占用用例）只许「红转绿」Ban 改其断言。
7. **边界（本 REQUEST turn）**：docs-only 一次 commit；Ban coding · Ban prove 执行 · Ban push/force-push · Ban SSOT/backlog 状态翻转（GAP P1 `0c6c3287` 不翻 · nail 阶段才落字）· Ban 碰已占用行（018/052/025/004/011/014/026/002/001/028/016/017）/sibling 归档（AC/AD/U/L/G7B/G7K/G7R/F-F 零改写）· **Ban recruiter-flow 面回归**（`recruiter.ts:428` 唯一生产者链零改动）。

Trio stays **OPEN**（EXIT 1/1/1 真实业务红）。`g7SuiteGreen=false`. Disclosure-1 **OPEN**（C-MO-Q3）. **门语义零弱化** · 供给候选未裁决（A/B/C/D 均为候选）· **Ban 假绿叙事** · Ban 洗断言。

本 stub 不授权 coding / prove 执行 / trio 实跑 / live / push；pre-exec dual PASS 后由协调方授权 coding/EXEC；implementer 不自批；本 PASS（如落）仅为 e2e-ha 半签，mw-model-op stub 不代签。

---

*REQUEST stub · 通用 begin 供给面收口产品刀 · Line G7S · 2026-10-07 · PENDING awaiting mw-e2e-ha + mw-model-op pre-exec dual · alone ≠ dual · 禁 push · STOP*
