# REQUEST — **G7V 旅程自适应早停面产品刀**（诚实分叉两分支并列：断言校准刀 vs 产品修复刀 · ≠ 修复 ≠ trio 翻绿）· pre-exec · mw-model-op

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503 · `g7SuiteGreen=false` · `actualSpendCny=null`
**Expert**: `mw-model-op`
**Knife**: `harness/gap-adaptive-early-stop.md` · slice `gap-adaptive-early-stop.slice.md`
**上游**: G7U EXEC（路线甲夹具 `dbed8a6f` · 红① begin 时序面 e2e 清除证据成立 · 清除判据未达 11P/3F/10S · **残留红后移=旅程自适应早停面 ×2**）→ G7U post-prove dual BOTH PASS（mw-e2e-ha `C-HA-P1`：任何产品侧修复须新 REQUEST 重走双审 · C-HA-P4 残留面 4/4 样本复现）→ 协调方派刀 G7V · **G7T 关联在卷**：G7T v2（`430d4c84` · prompts `69ca4633`）classify 分布 p.v1 单叶死路 → p.v2 恒 ≥2 叶减法 few-shot——本刀指名面（早停）恰在 v2+夹具对齐后**首次暴露**
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

## 请审什么（mw-model-op · 早停阈值语义 / G7T v2 关联复核 / 供给-评分错配甄别 / 模型面纪律）

Line G7V · **旅程自适应早停面产品刀**（G7U EXEC 残红后移面的独立 REQUEST）。请审：

1. **早停触发链阈值语义（码面硬读数独立复算）**：`decideNext` 双开火路径——**信号弱**（`interview-control-signals.ts` blob `0a6eeda8`：`WEAK_MIN_PROBED=2`/`WEAK_MIN_TURNS=4`/`WEAK_CONFIDENCE_CEILING=0.35`/`SIGNAL_CONF_ENOUGH=0.7` · 无任何能力够强 + score 样本 ≥2 + 已探 ≥2 + turn ≥4 + 已探全弱；旧 checkpoint 无轨迹 fail-closed 为 none 不开火）与**覆盖路径**（`adaptive-interview.ts:420-421` blob `2e691d0f`：turn≥`MIN_EARLY_TURNS=2` + resolvedStrong=0 + aborts≥`EARLY_WEAK_ABORTS=2` + probed≥2）→ `conclude('early_weak')` → `session_concluded` 投影（`signal-conclude-event.ts` `7c4b0d39` + `interview-signal-conclude.ts` `f0220c82` · **不写 band 不发明分数 · 其他 conclude 码 fail-closed 为 null · 恰一条**）→ done 块三结算分支（`adaptive-lifecycle.ts:340-367` blob `288eb311` · unscored>0 → `failInterviewAndRelease` `commerce.ts:198` 补偿释放）。请独立复算 blob 链与阈值；「模型不得写停续」（`adaptive-interview.ts:393` 策略注释）——早停是确定性控制流非模型自由裁量，本语义在两分支下零触碰。
2. **G7T v2 关联分析复核（本审首责）**：harness §1.3 关联定性=「可达性使能，非参数错配」——v2 前 p.v1 单叶 @10000=validator（`job-route-classifier.ts:150-152`）结构性必拒 → sticky `route_unresolved` → begin 409 → 早停面不可达；v2 后恒 ≥2 叶 → 早停双路径均要求 probed≥2 → v2 是可达的**必要使能**但零改动早停阈值/评分语义/`decideNext`。请裁决该定性是否成立；**反假设（分支 B 候选）**：v2 改变 route 叶分布 → 检索 scope/出题域随之变化 → 若出题与 route 叶错配（离域题）→ 评分系统性低分 → 控制流被错误喂入弱信号 = 缺陷症状——此反假设本 REQUEST 不预判定，交 EXEC 期甄别三读数定谳（`question_ready` competency/qkind 分布 / `answer_evaluated` score 轨迹 / `session_concluded.turn` vs `WEAK_MIN_TURNS`）；Ban 码面推断冒充运行时读数。
3. **分支 A 边界（断言校准 · Ban 改产品迁就断言）**：早停定性=产品正确行为（脚本化弱候选诚实早停 + 额度正确补偿释放 + application 可重试）→ spec 校准刀期早停控制流本体零触碰（阈值/文案/投影/结算分派）；**Ban 洗早停为「正常完成」**（`session_concluded` 投影「不是能力等级或招聘结论 · 不写 band 不发明分数」语义与 `view-model.ts:9-12` blob `71d1bd0d` 文案零触碰）；早停文案措辞纪律（`interview-signal-conclude.ts:87` 「禁止等级/招聘措辞」）为校准断言文案的锚。
4. **分支 B 边界（若甄别触发 · 产品修复刀）**：候选触碰面=`adaptive-interview-service.ts`（blob `a7cb43cc`）出题供给面 / 评分 prompt 面 / route 叶→检索 scope 映射面；spec 断言零改动、**Ban 改断言迁就缺陷**；Ban 关停早停/放宽阈值让脚本旅程「通过」（修的是喂入不是刹车）；Ban 波及真实弱候选的诚实早停语义；sticky/门/闸（`adaptive-role-resolve.ts` `80abbb80` · `job-route-classifier.ts` `79ceded8` · `job-route-decision.ts` sticky 永不自动重试）全分支零松动；**G7T v2 本体零回滚**（classify 质量修复面已 live 复证绿 · Ban 借早停刀回改 p.v2）。
5. **两分支并列无预选（Ban 预选）**：harness §2 是否对称完整呈现 A/B 定性/触碰面/prove/风险；码面初判倾向 A 但运行时证据为零——A/B 定谳权=EXEC 甄别证据 + 双审 + 协调方；**甄别读数无论何分支必须随 EXEC 收据**（A 的定谳也需它背书）。
6. **甄别面只读白名单（与 mw-e2e-ha 共批）**：EXEC 甄别沿 G7U sidecar 四面族先例，拟扩 `interview_event`（kind/payload 元数据面）准入——**是否批准由本席与 mw-e2e-ha 显式共裁**；Ban `ai_invocation_trace.output`、Ban `interview_job.payload`、Ban 任何写语句、Ban 评分原文/Key 物料入 receipt/log/commit。
7. **trio 复跑纪律（harness §3）**：三 CMD 各恰好一次（iso→ui→perf · wiring `:278/:279/:282` @`0afb3bd2` · EXEC 按 tip 重核回填）；committed SHA 重钉 + frozen-lockfile + 独立 worktree；单 CMD 内部重试按自身契约算一次 attempt；**CMD2 主证**=分支 A recruiting-bound 双 project PASS（**14P/0F/10S 或同等**）/分支 B 旅程正常终态且早停不开火 + 早停域产品 proofs 零回归；CMD1/CMD3 读数如实（api 面 G7S 同形 / golden 冷启面=另刀边界 Ban 黏连归咎）；七字段逐 attempt 全记录；三来源交叉一致；live 面（出题/评分/classify 调用）按 CMD 契约计数，Ban 分拆计数洗预算。
8. **EXIT 契约双向（harness §3.4）**：指名面清除 → 本刀收据成立；**trio 绿 ≠ suite green**——`g7SuiteGreen` 翻转 = 三绿 + post-dual BOTH PASS + 协调方 nail 全链（缺一不可）；仍红 → EXIT=1 原值 + 五分类 + 根因假设修正如实登记 → 迭代刀重走 REQUEST；**Ban 假绿 · Ban flake 记法 · Ban retry-to-green · Ban 只留绿 attempt**。
9. **预算与 Key 卫生**：≤200 次 live 调用（沿 G7K/G7R/G7S/G7T/G7U 口径）；超限即停如实记中止（不洗 not_run）；`actualSpendCny=null` 沿 I 线；Key 只经进程环境（`~/.meetwise-secrets/load-model-api-key.sh` loader source name-only）· Ban `.env*` · Ban Key 值/fingerprint 入 receipt/log/commit · `.env*` ABSENT presence 逐 attempt 记录。
10. **边界（本 REQUEST turn）**：docs-only 一次 commit；Ban coding · Ban prove 执行 · Ban push · Ban SSOT/backlog 状态翻转（`0c6c3287` 不翻）· Ban 碰已占用行/sibling 归档（uc018 `full.e2e.ts` `7d65d0f3` 零 diff · 红③ `:203` C-MO-P3 另刀 · G7K/G7R/G7S/G7T/G7U 收据 lifecycle 冻结）· Ban 改 withhold 机制（`run-e2e-isolated.mjs` blob `13dbfc43` 冻结）· **Ban 为绿弱化断言**。

Trio stays **OPEN**（G7U 后 `1/1/1` retained）。`g7SuiteGreen=false`. `actualSpendCny=null`. 红① STILL OPEN（残留=本刀指名面）。**两分支并列 · Ban 预选** · 早停=确定性控制流非模型裁量 · G7T v2 本体零回滚 · 甄别读数先行随卷 · **Ban 洗早停为正常完成 · Ban 假绿叙事**。

本 stub 不授权 coding / prove 执行 / trio 实跑 / live / push；pre-exec dual PASS 后由协调方 EXEC 授权（含分支裁决与甄别白名单批准）；implementer 不自批；本 PASS（如落）仅为 model-op 半签，mw-e2e-ha stub 不代签。

---

*REQUEST stub · G7V 旅程自适应早停面刀 · Line G7V · 2026-10-07 · PENDING awaiting mw-e2e-ha + mw-model-op pre-exec dual · alone ≠ dual · 禁 push · STOP*
