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

---

## PRE-EXEC dual 审查段 · mw-model-op（model-op/自适应域焦点 · docs gate only · 2026-10-07 append）

**被审**：REQUEST `14f507e9`（`docs(e2e): REQUEST adaptive early-stop face (pre_dual)` · 本地主线 `feat/mysql-schema-skeleton` rebase 后链段）。审查 worktree `/Users/miaole/Desktop/golucky/meetwise-rv-g7v-model-op` · branch `rv/g7v-model-op` 锚在被审 REQUEST 本体=本审 commit 为其**直子**（沿 G7U PRE 先例 `db208386`→被审 REQUEST）。范围=恰 `bbc361fa..14f507e9`。**锚定事实如实记录**：本地主线 tip 已前进至 `93b3c215`（G7W REQUEST·golden 冷启+api face discriminator）位于被审 REQUEST **之上**——不在本审范围、不黏连归咎；`origin/main=c4244470` 落后本地主线（origin push 间歇堵·G7U-post/G7V 段本地在链·如实）。本审恰 0 prove · 0 coding · 0 live · 0 Key 值读取 · 0 DB 连接 · 0 产品 edit · 0 SSOT edit。

### A. 机检（本席自跑 · 命令 + EXIT 可复现）

1. **祖先链**：`git merge-base --is-ancestor <c> 14f507e9` EXIT=0 ×7——`bbc361fa`(G7U nail)·`7e76e6c1`+`79936f44`(G7U POST dual BOTH PASS)·`c9e262a5`(G7U EXEC 收据)·`bde3ab25`(路线甲夹具)·`db208386`+`74c4d1f4`(G7U PRE dual)。单链成立，授权链闭合（C-HA-P1 指名后继=本 REQUEST）。
2. **docs-only**：`git show 14f507e9 --numstat` = 恰 4 `.md`（slice + harness + 双 stub）+222/−0；删除行合计=0；非 md 命中=0。零产品码、零 spec、零 SSOT diff。
3. **blob 链 16/16 亲算全等**（`git ls-tree 14f507e9` 逐面对号 harness §1.2）：`71d1bd0d` view-model · `a9214288` interview-state · `b7e5ab3d` business-events · `2e691d0f` adaptive-interview · `0a6eeda8` interview-control-signals · `f0220c82` interview-signal-conclude · `288eb311` adaptive-lifecycle · `7c4b0d39` signal-conclude-event · `6a942e8e` interview-consumer · `fbea8aeb` interview.service · `18004851` interview.controller · `a64784e8` commerce · `af02699a` recruiting-bound.spec · `69ca4633` prompts(实路径 `packages/ai-runtime/src/prompts.ts` · 文档仅书 blob 无路径·无锚误) · `a7cb43cc` adaptive-interview-service · `24f0eed5` commerce-reconcile(实路径 `apps/worker/src/`)。
4. **SSOT**：`git diff bbc361fa 14f507e9 -- ai-docs/delivery/north-star-hard-gates.md` = 0 行。
5. **wiring**：`package.json` blob `0afb3bd2` ✓；`:278/:279/:282` 三行亲读对号（`e2e:isolated` / `e2e:ui:isolated` / `verify:e2e-performance`）。
6. **收据在卷**：`receipts/gap-red1-timing-face/`（4 文件：00-summary/01-cmd1-iso/02-cmd2-ui/03-cmd3-perf）+ `receipts/gap-route-classify-quality/` 实存。
7. **v2 零触碰机检（本席独立）**：`git show 430d4c84 --name-only` = 恰 3 文件（`packages/ai-runtime/src/prompts.ts` + `sealed-job-route-classify-binding.ts` + `r2-p-worker-route-classify.proof.ts`）；对早停链五文件族 grep 命中=0。

### B. 早停触发链源码核验（只读实码 · 逐环对号 @`14f507e9` ≡ `bbc361fa` 码面）

- **常量**（`interview-control-signals.ts:35-46`）：`WEAK_MIN_PROBED=2`(:35) · `WEAK_MIN_TURNS=4`(:37) · `WEAK_CONFIDENCE_CEILING=0.35`(:39) · `SIGNAL_CONF_ENOUGH=0.7`(:41) · `THRASH_MIN_SAMPLES=4`(:42) / `FLIPS=3`(:43) / `PIVOTS=3`(:44) · `SCORE_HIGH=70`/`SCORE_LOW=40`(:45-46)。`adaptive-interview.ts`：`MIN_EARLY_TURNS=2`(:107) · `EARLY_WEAK_ABORTS=2`(:108) · `THRASH_PIVOTS=3`(:109) · `CONF_ENOUGH=0.7`(:132) · `CONF_WEAK=0.4`(:133) · `SOFT_BUDGET_RAISE_STEP=4`(:102)。全对号。
- **信号弱条件**（`:99-103`）：`!anyStrong && scores.length≥2 && probed.length≥2 && turn≥4 && probed.every(confidence<0.35)`——与 REQUEST 表述逐字同构；旧 checkpoint 无轨迹 fail-closed 为 none（`:96`）✓。
- **decideNext**（`adaptive-interview.ts:412-430`）：`:412` safety_ceiling 先赢 → `:415-416` signal weak → `conclude('early_weak')` → `:417` thrashing → `:420-421` 覆盖路径 early_weak（`turn≥2 && resolvedStrong===0 && unresolved+offRamp≥2 && probed≥2`）→ `:429-430` 覆盖路径 thrashing。策略注释「确定性、可解释；模型不得写停续」**实码在 `:388`**（REQUEST 书 `:393`=行号漂移·勘误见 F 节 · blob `2e691d0f` 全等）。
- **投影**：`signal-conclude-event.ts:24-26`（投影 null 不写）；`interview-signal-conclude.ts:64-74` fail-closed null / 丢 score/band 字段 · `:87`「禁止等级/招聘措辞」 · `:88-93` 文案（early_weak=「练习因持续偏弱或多次未决提前结束（自适应控制流，不是能力等级或招聘结论）」）✓。
- **三结算分支**（`adaptive-lifecycle.ts`）：证据 SQL `:319-332`——**unscored=count(`answer_unscored` 事件)** · **eligible=证据齐全的 `answer_evaluated`（hash+competency+stateVersion+outcome≠unresolved+score∈[0,100]）**；`:339-341` unscored=0&eligible>0 → complete+`enqueueReport`；`:342-356` unscored=0&eligible=0 → complete+`markApplicationNoEligibleScore`（unbound→enqueueReport `:352-353`）+ `assessment_unavailable:no_eligible_scored_answer`(`:355`·**已确认消费不释放**)；`:357-364` **unscored>0 → `failInterviewAndRelease`(`:361`)** + `markApplicationAssessmentUnavailable` + `assessment_unavailable:evaluation_unscored`(`:364`·补偿释放)。全对号。
- **释放本体**：`commerce.ts:198` `failInterviewAndRelease`（释放预留+置 failed 同事务·release error≠not_found 即 throw 回滚）；`:265` `abandonInterviewAndRelease`；用户主动放弃对照 `interview.service.ts:562-577`（completed/failed→409 `:573-574`）。✓
- **UI 面**：`view-model.ts:8-13` 早停 copy（early_weak 精确串在 `:10`）· `:66` report_unavailable（已扣费降级）· `:68` assessment_unavailable（「…本次预留额度已释放」）；`interview-state.ts:52` TERMINAL_PHASES；`business-events.ts:54-55`「不得与 report_unavailable 混用；后者的面试已经完成并扣费」+ `:58` session_concluded strict 载荷拒绝 score/band。✓
- **spec 面**（`recruiting-bound.spec.ts` blob `af02699a`）：`:48-55` `waitForTerminalOrAnswer`（终态正则 `:49` `/面试完成 · 综合评分|报告暂不可用/`——**确未含早停终态面**）· `:182` 12-turn 循环 · `:185` 固定脚本化答案（逐字对号）· `:189`/`:193` 终态断言 · `:194` finalize=200 poll · `:196-199` B 端「评分暂不可用」+「已完成」count=0。✓
- **分类器结构性必拒**（`job-route-classifier.ts`）：`:139` bps 和=10000 · `:144` reasonCodes 非空=conflict · `:149-152` gap=top1−(top2‖10000)：**单叶@10000 → gap=0 → margin 恒 conflict（≠0 于 `:151`，或 =0 但 <`JOB_ROUTE_MARGIN_THRESHOLD_BPS=1000`(`:37`) 于 `:152`）**；`:35-36` MIN_ALLOCATION=500/CONFIDENCE=7000。单叶死路=结构性，亲算成立。
- **供给端**：`adaptive-interview-service.ts:47-59` `planCompetencies`（规划失败→默认集 `:56` 优雅降级）；`initMind` `:173-184`（difficulty 中性 2 `:180` · confidence 恒 0 起 `:178`）；`interview-consumer.ts:340-355` 角色由 route snapshot 解析（G7S 供给链）。✓

### C. 分叉诊断裁决（本审首责）

**C.1 可达性使能论断——成立（码面独立复算非承抄）**。链路：v1 单叶@10000 → gap=0 → margin 恒 conflict（`:151`/`:152` 二选一必中）→ classify validator 结构性必拒 → sticky `route_unresolved` → bound begin 409 → 旅程 begin 即死 → **早停面不可达**（G7S/G7T/G7U 三刀基线一致在卷）。v2（`430d4c84`）=prompts+binding 版本+proof 恰 3 文件，早停链五文件族命中=0（A.7 机检）——**「v2 零改动早停阈值/评分语义/decideNext」成立**。且早停双开火路径均硬性要求 probed≥2（`:101` · `:420`），v2 恒≥2 叶正是该门可满足的必要输入形状。**定性=可达性使能、非参数错配，本席裁定成立。**

**C.2「spec 固定脚本化答案无法为多门能力供证」语义裁决——成立且被结构强化**。三重码面依据：(i) `initMind` confidence 恒 0 起、只累积本场证据（`:178` + `adaptive-interview-service.ts:61-64` 反 confirmation-bias 注释明示「绝不影响多难多有信心」）；(ii) 单条 canned answer ×12 轮无法对 ≥2 门能力产生**差异化深化证据**，HOOK_CAP=0.6（`:139`）更把高分封顶在够强线下逼继续 probe；(iii) OFFRAMP_LOW=2（`:138`）连续低分强制下车——控制流**设计目标即对证据贫乏会话诚实收尾**。故：早停在脚本化弱候选上开火=**产品对低质量输入的设计内正确响应**（分支 A 语义）；同时该 spec 夹具**本就不是有效作答者模拟器**（输入设计局限）——两者不矛盾且同真：期望终态串先于该旅程面存在、未覆盖早停终态。**「预期输入」定性成立。**

**C.3 A/B 裁决倾向——倾向 A（断言校准刀），B 收窄为附判据的活分支**。倾向 A 的增量理由（码面）：即便出题供给完美落在 route 叶域内，固定 canned answer 依然无法产生深化证据——**供给错配对观测到的开火既不必要也非最简解释**（Occam + 设计语义双指 A）。B 触发判据据此收窄：EXEC 甄别须示出 `question_ready` competency/qkind 分布**系统性离域**（题面与 route 叶域错位）且评分轨迹呈可归因于错配的一致性低分——**仅「分数低」不构成 B 触发**（分数低正是 A 语义下预期输入的结果）。定谳权=EXEC 甄别三读数+双审+协调方（Ban 预选 retained——本倾向不构成预选、不构成 EXEC 授权）。**三读数无论何分支必须随 EXEC 收据**（A 的定谳亦须甄别背书·REQUEST 要点 4/harness §3.5 已自缚·本席确认强制）。

### D. 双结算分支方差 · 校准断言形态裁决（交审点·本席裁定）

**裁定=结构化多臂分支容忍（非单臂钉死、非宽正则）**。码面依据：结算由证据计数分派（B 节 SQL），G7U 两轮 4 project 样本实证双臂并存（chromium=unscored>0→释放 `assessment_unavailable`；mobile=unscored=0&eligible>0→complete+扣费→`report_unavailable`）。分支 A 校准刀断言形态应为三层：

1. **定锚层（无条件断言）**：早停 copy 精确串（`view-model.ts:10` 原文逐字）+ `session_concluded` 语义（非终态投影·不写 band 不发明分数）+ 早停终态在双 project 到达。
2. **分支守卫层（按实达终相分臂）**：`assessment_unavailable` 臂→`:68` 文案（含「额度已释放」）+ application 可重试读数；`report_unavailable` 臂→`:66` 文案（**已扣费**·`business-events.ts:55` 语义「面试已经完成并扣费」Ban 写「已释放」）；**第三臂=`no_eligible_scored_answer`（已确认消费不释放）码面可达**——覆盖路径开火时可全为 unresolved 作答（`outcome='unresolved'` 有分但不 eligible `:329`、unscored=0）→ G7U 未观测但非不可能，校准断言族应将其列为许可结算面（或 EXEC 实证其夹具不可达后收窄）。
3. **禁则**：Ban 单臂钉死掩盖方差（G7U 4/4 样本实证双臂）；Ban 宽正则「任意文案皆可」；Ban race 式 OR 正则把非早停完成也判绿；各臂须各绑 `:339-365` 结算语义+钱面后果（释放 vs 已扣费 vs 已消费不释放）逐字如实。
4. **结算敏感断言面 EXEC 实证回填**：`:194` finalize=200 poll 仅报告终相才发生、`:196-198` B 端「评分暂不可用」仅在 `markApplicationAssessmentUnavailable`/`markApplicationNoEligibleScore` 臂成立（report 臂无 application mark）——此两面随臂而异，EXEC 实证回填、Ban 预claim（harness 分支 A 风险 (c) 采纳并升格为本席条件 C-MO-V2）。

### E. `interview_event` 准入白名单裁决（与 mw-e2e-ha 共批 · 本席半批）

**附条件批准（本席半·alone≠dual 须 mw-e2e-ha 显式共批方生效）**。实码核验：`question_ready`/`answer_evaluated`/`answer_unscored`/`clarification_needed` payload **均含 `question`/`hint` 题面原文**（`adaptive-lifecycle.ts:158-161/:257-260/:262-265/:278-281`）——题面文本面**不在批准之列**。批准面=冻结表达式白名单（仅元数据）：`kind`、`created_at`、`payload->>'competency'`、`payload->>'qkind'`、`payload->>'turn'`、`payload->>'outcome'`、`payload->>'score'`、`payload->>'reason'`、`payload->>'concludeReason'->>'code'`、`payload->>'concludeReason'->>'turn'`。**Ban**：`payload->>'question'`/`payload->>'hint'`/整列 `payload` 选择、`ai_invocation_trace.output`、`interview_job.payload`、任何写语句、评分原文与 Key 物料入 receipt/log/commit。甄别三读数（competency/qkind 分布、score 轨迹、conclude turn）在批准面内**信息完备**——文本面对甄别零增量、纯增暴露。cap 沿 G7U EXEC 定值（60s/周期 1s · EXEC 按当 tip 重核 committed · 超时=诚实 FAIL）· stream_key 限本测自家 interview 流。

### F. 勘误（非阻断 · 记录在卷）

`adaptive-interview.ts`「模型不得写停续；确定性、可解释」策略注释：harness §1.2 与 slice 书 `:393`，**实码 `:388`**（blob `2e691d0f` 全等·纯行号漂移；`:393` 实为 `weakCited` 行）。blob 锚为准、内容零误；REQUEST §0 已自设「EXEC 期按当 tip 重核回填」钩——本席裁定非阻断，EXEC 回填时一并更正（C-MO-V5）。其余抽验行锚（412-430/35-46/107-109/132-133/198/265/562-577/150-152/46-56/66/68/48-56/182-186/189/193/88-93/52/54-55/340-355）全部对号。

### G. 审查检查表（stub「请审什么」十项 → 裁决）

| # | 项 | 裁决 |
|---|---|---|
| 1 | 触发链阈值语义独立复算 | **PASS**（B 节全链亲核 · blob 16/16 · 阈值逐值亲读 · :388 勘误记卷） |
| 2 | G7T v2 关联复核（首责） | **PASS**（C.1/C.2 · 430d4c84 零触碰机检 · 单叶结构性必拒亲算 · 可达性使能定性成立） |
| 3 | 分支 A 边界 | **PASS 附条件**（D 节断言形态三禁则 · C-MO-V2/V4 · Ban 洗早停为正常完成 retained） |
| 4 | 分支 B 边界 | **PASS**（C.3 触发判据收窄=系统性离域 · 修喂入不修刹车 · sticky/门/闸零松动 · G7T v2 本体零回滚 retained） |
| 5 | 两分支并列无预选 | **PASS**（harness §2 对称呈现复核 · 本席倾向 A= tendency 非定谳非预选 · 甄别随卷强制） |
| 6 | 甄别面只读白名单共批 | **附条件批准 · 本席半批**（E 节冻结表达式 · 文本面 Ban · alone≠dual 须 mw-e2e-ha 共批） |
| 7 | trio 复跑纪律 | **PASS**（wiring `:278/:279/:282`@`0afb3bd2` 亲核 · 三 CMD 各恰一次 · CMD2 14P/0F/10S 或同等口径留双审定） |
| 8 | EXIT 契约双向 | **PASS**（仍红→EXIT=1 原值+五分类→迭代刀重走 · trio 绿≠suite green · g7SuiteGreen 翻转三前提 retained） |
| 9 | 预算与 Key 卫生 | **PASS**（≤200 live · `actualSpendCny=null` · loader name-only · Ban `.env*` · ABSENT presence 逐 attempt） |
| 10 | 本 turn 边界 | **PASS**（docs-only 机检 A.2 · Ban 清单全量在卷 · sibling 收据/withhold/占用行零触碰由 A.2 范围恰 4 md 直接证得） |

### H. Fail-trigger audit（十二项 · 全未触发）

①docs-turn coding（A.2 证伪）②改产品迁就断言（零产品码 diff+blob 全等）③改断言迁就缺陷/预选分支（spec 零 diff·A/B 并列）④洗早停为正常完成（Non-claims 明示·文案锚原样）⑤masking/伪造（零实跑零写入）⑥SSOT/backlog 翻转·碰占用行·sibling 归档（SSOT diff=0·范围恰 4 md）⑦洗绿/假绿/`g7SuiteGreen=true`（retained false）⑧Key 物料越界（零 live 零 Key·loader name-only 引用）⑨push（无 push·origin 落后如实）⑩self-approve/代签（作者 mw-core≠本席·本审仅半签）⑪预claim post-commit EXIT（stub 自缚+Non-claims）⑫码面推断冒充运行时读数（harness §0 明示运行时构成零证据·本席复核无运行时断言）。

### I. Blockers：0

### J. Conditions（C-MO-V1~V7 · 转 EXEC 落字逐项兑现）

- **C-MO-V1** 甄别三读数随卷强制（无论 A/B）：`question_ready` competency/qkind 分布 vs route 叶域 + `answer_evaluated` score 轨迹跨 competency + `session_concluded` turn vs `WEAK_MIN_TURNS=4`；B 触发判据=**系统性离域**（C.3 收窄版），仅低分不触发 B；A 定谳亦须甄别背书。
- **C-MO-V2** 分支 A 校准断言形态=D 节三层结构（定锚/分支守卫/禁则）+ 第三臂（`no_eligible_scored_answer`）处置显式落字 + `:194`/`:196-198` 结算敏感面 EXEC 实证回填 Ban 预claim；产品码 blob 链前=链后全等机检强制（十六面为基线集·EXEC 按 tip 重核）。
- **C-MO-V3** `interview_event` 白名单按 E 节冻结表达式版实施；本席半批须 mw-e2e-ha 显式共批方生效（alone≠dual）；Ban 文本面/整列 payload/写语句/`ai_invocation_trace.output` retained。
- **C-MO-V4** 早停语义零触碰全分支：阈值族（`WEAK_MIN_*`/`MIN_EARLY_TURNS`/`EARLY_WEAK_ABORTS`/`THRASH_*`）、投影 fail-closed（`:4-8`）、文案（「不是能力等级或招聘结论」）、结算分派（`:339-365`）零改动；Ban 洗早停为正常完成；G7T v2 本体（`430d4c84` 面）零回滚。
- **C-MO-V5** 行号勘误 `:393`→`:388` 及全锚 EXEC 期按当 tip 重核回填（blob 锚为准）。
- **C-MO-V6** trio 三 CMD 各恰一次 · attempts 全记录 · Ban retry-to-green/flake 记法/只留绿 attempt · 预算 ≤200 live 超限即停如实记中止 · Key loader name-only · `.env*` ABSENT 逐 attempt 记录 · 收据落 `receipts/gap-adaptive-early-stop/`（含甄别段+分支定谳段）。
- **C-MO-V7** Pins 十值+retained 零翻转（见 K）；残留面（golden 冷启/api 面 G7S 同形/真实用户未决窗口残余）处置权归协调方·Ban 黏连归咎本刀。

### K. Pins 十值 + retained 零翻转（本审确认）

`haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` · `coveredCount=8` · `ms3EqualsR4Closed=false` · **PG-retained** · 公开 DELETE=503 · **`g7SuiteGreen=false`** · **`actualSpendCny=null`**；retained：trio OPEN（G7U 后 1/1/1·真测 EXIT 1/1/1）· 红① STILL OPEN（构成=时序面 e2e 清除·残留=本刀指名面）· golden(chromium) env/候选归协调方 · api 面 G7S 同形 retained · 真实用户 0–2s 未决窗口残余（C-HA-5/C-HA-P3 原样）· `r1Closed=false` · Disclosure-1 OPEN · GAP-G7K-API-REDS P1 OPEN（`0c6c3287` 不翻）· `techRoleFailClosedOptOutG7Only=true`。

### L. alone ≠ dual · 三行中文摘要 · Verdict

本 PASS 仅为 **mw-model-op PRE-EXEC 半签**：≠EXEC 授权 ≠分支定谳（A/B 仍并列·EXEC 甄别+双审+协调方定谳）≠`interview_event` 白名单生效（须 mw-e2e-ha 共批）≠任何 Pin 翻转≠不代签并行 peer mw-e2e-ha。EXEC 前提=pre-exec dual BOTH PASS+协调方授权+C-MO-V1~V7 逐项兑现。

三行中文摘要：
1. 机检全过：祖先链 EXIT=0 ×7、docs-only 恰 4 md +222/−0、blob 16/16 亲算全等、SSOT 零 diff，被审 REQUEST 诚实零实跑零预claim，勘误一处（策略注释 :393 实码 :388·非阻断）。
2. 分叉裁决：可达性使能论断与「固定脚本化答案无法供证=预期输入」均码面成立（v2 `430d4c84` 零触碰早停链机检证实·单叶 gap=0 结构性必拒亲算），本席倾向分支 A（断言校准），B 收窄为「系统性离域」判据的活分支，甄别三读数随卷强制。
3. 断言形态裁定=多臂分支容忍（定锚+守卫+禁则，第三臂 no_eligible_scored_answer 码面可达须落字），interview_event 白名单附冻结表达式条件半批，0 Blocker、7 Conditions、Pins 十值+retained 零翻转。

append-only 机检：本段为纯追加；前 9402B md5 `50556aa39e61482a6b7916bbbdcec92c` 逐字节保全（PENDING footer 原样）。禁 push。本审恰 0 prove 0 coding 0 live 0 Key 值读取 0 DB 连接 0 产品 edit 0 SSOT edit。

Verdict: PASS
