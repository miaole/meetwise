# REQUEST — **G7V 旅程自适应早停面产品刀**（诚实分叉两分支并列：断言校准刀 vs 产品修复刀 · ≠ 修复 ≠ trio 翻绿）· pre-exec · mw-e2e-ha

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503 · `g7SuiteGreen=false` · `actualSpendCny=null`
**Expert**: `mw-e2e-ha`
**Knife**: `harness/gap-adaptive-early-stop.md` · slice `gap-adaptive-early-stop.slice.md`
**上游**: G7U EXEC（路线甲夹具 `dbed8a6f` · 红① begin 时序面 e2e 清除证据成立 · 清除判据未达 11P/3F/10S · 残留红后移=旅程自适应早停面 ×2 + golden ×1）→ G7U post-prove dual BOTH PASS（mw-e2e-ha `C-HA-P1`：「旅程自适应早停面 ×2、golden 冷启面、api 面 G7S 同形、真实用户 0–2s 产品残余——全部归协调方裁决处置；任何产品侧修复须新 REQUEST 重走双审」· C-HA-P4 残留面 4/4 样本复现=确定性旅程面）→ 协调方派刀 G7V
**Base tip**: `bbc361fa`（`origin/feat/mysql-schema-skeleton` fetch 后实测 tip · not a prove tip · 实跑 code SHA 以 EXEC 期 worktree HEAD 实测为准）
**Date**: 2026-10-07
**Line**: **G7V**

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
| Trio | **OPEN**（G7U 后 `1/1/1` · EXEC 真测 EXIT 1/1/1 · CMD2 11P/3F/10S retained） |
| 红① | **STILL OPEN**（构成再变：时序面 e2e 清除证据成立 · **用例残留=旅程自适应早停面=本刀指名面**） |
| golden(chromium) | **env/候选**（G7U post-prove 第二样本 PASS 反证非确定性 · 归因处置归协调方 · 不在本刀） |
| GAP-G7K-API-REDS | **P1 OPEN**（`0c6c3287` 登记 · 不翻 backlog 状态） |

## 请审什么（mw-e2e-ha · e2e 纪律 / 断言校准合法性 / 诚实性 / withhold 边界）

Line G7V · **旅程自适应早停面产品刀**（G7U EXEC 残红后移面的独立 REQUEST · C-HA-P1 指名后继）。请审：

1. **诊断承卷与证据强度（harness §0/§1）**：本 REQUEST 零实跑零 live 零 Key 加载；证据 = git 只读 @`bbc361fa`（行号 + blob 亲算十六面：`view-model.ts` `71d1bd0d` / `interview-state.ts` `a9214288` / `business-events.ts` `b7e5ab3d` / `adaptive-interview.ts` `2e691d0f` / `interview-control-signals.ts` `0a6eeda8` / `interview-signal-conclude.ts` `f0220c82` / `adaptive-lifecycle.ts` `288eb311` / `signal-conclude-event.ts` `7c4b0d39` / `interview-consumer.ts` `6a942e8e` / `interview.service.ts` `fbea8aeb` / `interview.controller.ts` `18004851` / `commerce.ts` `a64784e8` / `recruiting-bound.spec.ts` `af02699a` / `prompts.ts` `69ca4633` / `adaptive-interview-service.ts` `a7cb43cc` / `commerce-reconcile.ts` `24f0eed5`）+ G7U/G7T EXEC committed 收据。**触发链阈值（probed≥2 · turn≥4 · 全弱 <0.35 · 零强 <0.7 · aborts≥2）为码面硬读数；「旅程为何开火」的运行时构成（评分轨迹/出题分布/开火时点）本 turn 零证据**——Ban 把码面推断冒充运行时读数，EXEC 期甄别（§3.3）补证。
2. **分支 A 断言校准合法性（本审首责）**：早停定性=产品正确行为 → spec 校准刀的边界——**校准 vs 弱化的界线**：校准必须以 harness §1.2 码面结算语义为锚（`adaptive-lifecycle.ts:340-367` 三结算分支 + `view-model.ts:66/:68` 降级面），Ban 文案级漂移、Ban 断言放宽到「任意文案皆可」；**Ban 改产品迁就断言**（产品码 blob 链前=链后全等机检强制）；**Ban 洗早停为「正常完成」**（校准目标=诚实降级终态，非翻绿叙事——早停是控制流终态，`session_concluded` 投影「不是能力等级或招聘结论 · 不写 band 不发明分数」语义零触碰）；既有非终态断言（URL binding / `GET /applications` 旁证 / B 端隐私面）零触碰。
3. **双结算分支方差断言形态**：G7U 两轮 4 project 样本呈现两种结算分支（chromium=释放 `assessment_unavailable` 补偿 · mobile=报告暂不可用 `report_unavailable` 已扣费）——校准断言须如实容纳同族早停双分支（按积分证据计数分派，`adaptive-lifecycle.ts:340-367`），Ban 只断言单一分支掩盖方差、Ban race 式宽正则洗掉真实回归；finalize 语义（早停后 `/applications/:id/finalize` 读数）EXEC 实证回填，Ban 预claim。
4. **G7U 夹具面冻结（C-HA-P5 延续）**：`waitForRouteDecided` 轮询夹具不重跑、不调 cap、不扩白名单；本刀 spec 再触碰（分支 A 校准）与 G7U 夹具面的叠加边界——夹具等待步骤+新增早停断言的并存形态是否需要重批，请显式裁决；withhold 机制（`run-e2e-isolated.mjs` `13dbfc43`）冻结。
5. **EXEC 期甄别面（A/B 分叉定谳 · 本 REQUEST 不预选）**：三读数（`question_ready` competency/qkind 分布 + `answer_evaluated` score 轨迹 + `session_concluded.turn` vs `WEAK_MIN_TURNS`）判别「脚本答案本身弱」（→A）vs「出题供给与 route 叶错配致弱」（→B）；**`interview_event` 是否准入只读白名单须本席与 mw-model-op 显式批准**（沿 G7U 四面族先例 · Ban `ai_invocation_trace.output` · Ban 任何写语句）；**无论裁决何分支，甄别读数必须随 EXEC 收据**（A 的定谳也需它背书）；Ban 缺陷定性未定谳前抢跑任一分支实施。
6. **分支 B 边界（若甄别触发）**：产品修复刀重走 REQUEST；spec 断言零改动、Ban 改断言迁就缺陷；Ban 关停早停控制流本体（阈值/文案/投影零触碰——修的是喂入不是刹车）；Ban 波及真实弱候选的诚实早停。
7. **trio 复跑纪律（harness §3）**：三 CMD 各恰好一次（iso→ui→perf · wiring `:278/:279/:282` @`0afb3bd2` · EXEC 按 tip 重核回填）；committed SHA 重钉 + frozen-lockfile + 独立 worktree；单 CMD 内部重试按自身契约算一次 attempt（Ban 临时调高）；**CMD2 主证**=分支 A recruiting-bound 双 project PASS（**14P/0F/10S 或同等** · 现基线 11P/3F + golden 冷启方差 1 · 或同等口径由双审定）/分支 B 旅程正常终态且早停不开火；CMD1/CMD3 读数如实（api 面 G7S 同形 / golden 冷启面=另刀边界 Ban 黏连归咎）；七字段逐 attempt 全记录；三来源交叉一致。
8. **EXIT 契约双向（harness §3.4）**：指名面清除 → 本刀收据成立；**trio 绿 ≠ suite green**——`g7SuiteGreen` 翻转 = 三绿 + post-dual BOTH PASS + 协调方 nail 全链（缺一不可）；仍红 → EXIT=1 原值 + 五分类 + 根因假设修正如实登记 → 迭代刀重走 REQUEST；**Ban 假绿 · Ban flake 记法 · Ban retry-to-green · Ban 只留绿 attempt**。
9. **预算与 Key 卫生**：≤200 次 live 调用（沿 G7K/G7R/G7S/G7T/G7U 口径）；超限即停如实记中止（不洗 not_run）；`actualSpendCny=null` 沿 I 线；Key 只经进程环境（loader source name-only）· Ban `.env*` · Ban Key 值/fingerprint 入 receipt/log/commit · `.env*` ABSENT presence 逐 attempt 记录。
10. **边界（本 REQUEST turn）**：docs-only 一次 commit；Ban coding · Ban prove 执行 · Ban push/force-push · Ban SSOT/backlog 状态翻转（GAP-G7K-API-REDS `0c6c3287` 状态行不翻 · nail 阶段才落字）· Ban 碰已占用行/sibling 归档（uc018 `full.e2e.ts` `7d65d0f3` 零 diff · 红③ `:203` C-MO-P3 另刀 · G7K/G7R/G7S/G7T/G7U 收据 lifecycle 冻结）· Ban 改 withhold 机制。

Trio stays **OPEN**（G7U 后 `1/1/1` retained）。`g7SuiteGreen=false`. `actualSpendCny=null`. 红① STILL OPEN（残留=本刀指名面）。**两分支并列 · Ban 预选** · 断言校准 ≠ 断言弱化 · 夹具对齐 ≠ 产品修复（G7U 披露延续）· **Ban 洗早停为正常完成 · Ban masking · Ban 假绿叙事**。

本 stub 不授权 coding / prove 执行 / trio 实跑 / live / push；pre-exec dual PASS 后由协调方 EXEC 授权（含分支裁决与甄别白名单批准）；implementer 不自批；本 PASS（如落）仅为 e2e-ha 半签，mw-model-op stub 不代签。

---

*REQUEST stub · G7V 旅程自适应早停面刀 · Line G7V · 2026-10-07 · PENDING awaiting mw-e2e-ha + mw-model-op pre-exec dual · alone ≠ dual · 禁 push · STOP*
