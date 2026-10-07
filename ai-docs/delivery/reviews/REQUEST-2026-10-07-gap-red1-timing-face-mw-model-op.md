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
