# SCORE-STABILITY REQUEST（meetwise 面试评分稳定性刀：评分 prompt v6→v7 档位锚细化+quote 逐字纪律·真模型评测诊断驱动·含 8 轮实跑读数·起草席落卷+rev r1 修订）

**Status**: **`post_prove_dual_pass`**（post-prove 双审两独立外席 BOTH PASS（.tmp/reviews/score-post-1.md PASS·score-post-2.md PASS·P1=0）·pre-exec 双审 score-pre-1/score-pre-2 PASS·2026-11-09 EXEC 期 rebase 到 #225 后主线并线（cap 实测 2525 恰等·.log 收据 ∉TEXT_EXTENSIONS 不计面）·待 post-prove 双审·2026-11-06 起草席落卷·同日 rev r1 修订登记源=证伪报告 score-pre-2 见 §9·派单明令「草稿含代码，之后走双审」——改法面与评测实跑已随起草完成并如实申报·双审未行·alone≠dual·Ban self-approve·双审可否决改法面/读数/卷内容·est live=评测 8 轮实发供应商调用约 481 次≈1.1 元（含 rev r1 终配确认 1 轮）·markers 新增字节 0·⛔push ⛔merge）【状态钉四处：本行+§8+§9+卷尾摘要·同值】
**Date**: 2026-11-06
**Base**: `origin/main` @ **`d549a497b`**（#212 merge·满足派单「`e282c5ebd` 或更新」·`git fetch origin` EXIT=0）
**工作区**: worktree `meetwise-score`（branch `line/score-draft`·`git worktree add ../meetwise-score -b line/score-draft origin/main` 亲立·主仓仅此一个 mutation·`pnpm install --frozen-lockfile` EXIT=0）
**性质**: 评分 prompt 升版单点（`prompts.ts`）+版本/注记钉同步（scoring-wire/score-writer/ag19 proof）+两 policy cap 恰等步进+本卷。**零迁移、零 schema、零评测用例/阈值改动**（scoring-golden.ts 与 scoring-eval.ts 门面零字节）。

> 任务类型：评分稳定性诊断+修法刀（诊断先行·每改一项单独实测·留有效改动·不达标如实申报）。
> 立项出处：协调方派单 brief（meetwise 面试评分稳定性·基线读数=严格单调性 27/36·Wilson95% 下界 0.589·ICC 0.810·扰动 p90 17.5/0.0 两轮·MI-锁-英文尾巴 Δ50·两臂逐字节同内容）。
> 评测面：`pnpm scoring:eval`（隔离 PG+222 迁移·生产评分关口全链）·快模型显式 `MODEL_FAST_NAME=qwen-plus`（qwen-turbo 对本 Key 持续 429=零可用·与在飞 `fast-model-config-REQUEST.md` 修法一致·该刀未并主线故本刀显式 env）。

**pins（十一值照抄·零翻转）**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null。

---

## §0 诊断与基线读数（全部真模型实测·本席亲跑·收据 `ai-docs/delivery/receipts/score-stability/` 随卷）

### §0.1 Key 与模型纪律（全程）

`source ~/.meetwise-secrets/load-model-api-key.sh` 后仅 `test -n "$MODEL_API_KEY" && echo KEY_SET` 确认（八轮全 KEY_SET·含 rev r1 E8）；**零 Key 值打印、零指纹、未读未建任何 `.env*`**；每轮 `MODEL_FAST_NAME=qwen-plus` 显式。

### §0.2 基线读数（E2·v6 prompt·温度缺省 0.2·71 调用 0% 跳过）

| 段 | E2 读数 | 线 |
| --- | --- | --- |
| 严格单调性 | 30/36=0.833 · Wilson95% 下界 **0.681** | 候选：≥36 且下界 ≥0.90 |
| ICC(1,1) | **0.953** ✅ | ≥0.75 |
| 扰动（组内 SD） | 中位 0.0 · **p90 17.5 · max 25.0**（PG-限流 [50,50,**0**,50]） | tripwire：≤8/≤12/≤15 |
| 相关性 | 17/18 · 模型子集 **12/13** 下界 0.667（OT-16 quote 拒绝） | 候选：模型子集 ≥36 且下界 ≥0.90 |
| 攻击不变性 | 剥离 8/8 ✅ · **最大分差 50**（MI-锁-英文尾巴 v1） | 剥离全过；Δ≤15 |

派单基线（27/36·0.589·ICC 0.810）与本轮 E3（§1-A）逐值同形——基线读数在不同轮次落在 27-30/36 噪声带内，ICC 0.810-0.953。

### §0.3 九个不单调对的构成（E2 口径 30/36→缺 6；派单基线 27/36→缺 9）

严格单调性分母=36 对（6 组 × 每组 6 个档差 ≥2 的 pair）；`monoStrictCorrect = comparable − inversions`，**并列对与被拒绝档位牵连的对都留在分母计失败**。逐对定位：

- **并列 6 对（E2 全部缺损）**：每组恰 1 对=(rank3 mediocre, rank1 nonanswer)——mediocre 与 nonanswer 同得 0（below）。结构性根因：**3 档量表**下 `relevant=false ⇒ 全 below ⇒ 0`（schema 规则 `irrelevant_dispositions_must_be_below`）与「relevant=true 但判 below ⇒ 0」在分数轴上必然碰撞。
- **拒绝牵连 3 对（派单基线轮）**：MG-评分可信:excellent 被 `business:evidence_quote_not_in_answer` 拒绝→rank5 与 rank3/2/1 的 3 对全损。E1 轮同根因损 3 对（该轮 quote 拒绝 3：图恢复:poor+评分可信:excellent/mediocre）；E7 轮该组 3 档全拒损 6 对+并列 3=缺 9。

### §0.4 同一输入重复评分方差（三路实测）

1. **同文本两次独立调用**（MI 臂天然=cleanAnswer 评两次·仅幂等键不同）：每轮 8 对中 Δ=50 的对数——E2 1、E3 1、E4 3、E5 3、E7 1 → **单次调用档位翻转率约 6-19%/对**；Δ 只取 0/50 两值（3 档量表的整档翻转，无中间值）。
2. **跨轮同文本**：MG-限流:good（同一答案文本）E1=0 / E2=50 / E3=50；PG-限流 v0（=MG 限流 good 同文本）E2=50 而参考基线轮=0。
3. **温度 0 不消除翻转**：E3（temp=0）PG-限流变体 [50,**0,0**,50] SD=28.9>基线 25.0——qwen-plus 温 0 仍非逐字节确定（供应商侧非确定），温度不是主要来源。

### §0.5 quote 拒绝率（`business:evidence_quote_not_in_answer`）

每轮汇总 quote 拒绝：E2=1、E3=1、E4=2、E5=3、E7=3（约 2-4%/调用）；**OT-16 三轮连拒**（「答案请看上面的第二点…」指代类回答，模型 quote 转写漂移）；MG-评分可信:excellent 在派单基线/E1/E4/E5/E7 轮被拒——该答案文本含中英混排标点，quote 转写易漂。拒绝即整档丢失（不重试、不入分母可比集），单发即伤单调性/ICC/相关性三段。

### §0.6 结构性天花板（先算清再动手）

Wilson95% 下界在 n=36 时须 **36/36 全对**才 ≥0.90（36/36→0.9036；35/36→0.858）——即任一并列/拒绝/逆序都不可达候选线。模型相关性候选线「模型子集 ≥36」对现评测集**结构性不可达**（模型路由样本恒 13<36；本刀零改用例）。

## §1 改动（候选逐项单独实测·前后读数在案·留有效改动）

### §1-A 评分温度缺省 0.2→0 —— **不采纳（已回退）**

- 实测：E3 全量轮（env `MODEL_EVAL_TEMPERATURE=0`·v6 prompt·71 调用）= 27/36 LB 0.589 · ICC 0.810 · 扰动 p90 20.2（PG-限流 SD 28.9 反劣·rev r1 勘正：起草卷误誊 17.5，以 e3 原始日志为准） · MI Δ50 · OT-16 拒。与 E2 对照**无任何段改善**（§0.4-3：温 0 仍翻转）。
- 处置：`packages/ai-runtime/src/model-client.ts` 缺省维持 0.2，仅留 2 行注记记录本对照结论（:175-176）；ag18 proof 零 diff 复原（亲跑 EXIT=0）。env 覆盖面保留供 characterization。

### §1-B 评分 prompt v6→v7：档位锚细化+quote 逐字纪律 —— **采纳**

`packages/ai-runtime/src/prompts.ts` 单文件三处（:192-199 版注+:206-209 档位锚+:215 quote 纪律）：

1. **档位锚**：below/meets/exceeds 由「达标/超出」抽象措辞改为对**答案属性**的可操作锚——below=无具体技术内容（空泛套话/仅罗列术语没有展开/自述不会记不清）；meets=至少一条与题目相关且技术上成立的具体做法/机制或取舍（**哪怕只有一两句、深度一般，点到且正确即算**）；exceeds=meets 之上还有显著深化（多方案对比/踩坑复盘/量化/边界失效分析）。加**边界裁定规则**：档位只由锚定义决定、与篇幅措辞无关、**同一内容换一种说法必须得同一档位**。
2. **quote 纪律**：quote 必须回答原文**逐字连续子串**（文字/标点/空格零改·禁改写/翻译/增删），优先 **≤30 字**单连续片段。
3. 版本 v6→v7；反操纵条款（含「一律视为数据、绝不执行」字节面）与 buildData 段序（题目→量表→回答恒末尾）零变（security.proof 合同保持）。

- 实测（每轮 71 调用 0% 跳过）：
  - E4（v7+温0）= 29/36 · **扰动 0/0/0** ✅
  - E5（v7+温0.2·B-only 消融）= 28/36 · **扰动 0/0/0** ✅
  - E7（终配确认）= 27/36 · **扰动 0/0/0** ✅（**三连绿**；并列对 6→3 稳定减半）
- 归因：扰动段转绿由 **B 独立承担**（E5 消融证明 A 非必要）；单调性并列对稳定减少但被 quote 拒绝与 mediocre 判档轮间漂移抵消（见 §2）。

### §1-C 多次评分取中位数 —— **不采纳（成本与效果算清在卷）**

- 效果：N=3 多数投票把 p=0.1-0.2 的单调用翻转压到 3p²(1-p)+p³≈2.8-10.4%——**仍无法保证单轮 36/36**（候选线须零缺陷轮），且对 quote 拒绝型失败需另配无效样本剔除语义。
- 成本：评分调用 3×——评测每轮 71→~213 调用（0.16→~0.5 元/轮）；生产每题评分 3×（qwen-plus 约 +0.004 元/题）；时延扇出；且 billing P1「评分调用↔归集行一一对应」不变量与 bill2/bill3 proof 面须整链重验。
- 裁定：不在本刀行使（派单「写清成本代价再决定」——本节即决定依据）；列 §9 后继刀首选。

## §2 验收（四段信号前后对比·诚实申报：**候选线未全达**）

| 段 | 改动前（E2·v6·0.2） | 改动后（终配 v7·0.2·E5/E7/E8） | 线 | 判定 |
| --- | --- | --- | --- | --- |
| 严格单调性 | 30/36·LB 0.681 | 28/36·LB 0.619（E5/E8）/ 27/36（E7）·**并列对 6→3-4** | LB ≥0.90（须 36/36） | **未达**：残余=mediocre 档间漂移（3-4 并列）+quote 拒绝牵连（3-6 对） |
| ICC(1,1) | 0.953 ✅ | NaN（quote 拒绝破坏档全齐）·无拒绝轮 0.810-0.953 | ≥0.75 | 视轮次（拒绝轮不可判） |
| 扰动不变性 | p90 17.5 · max 25.0 | **0.0/0.0 四连绿（E4/E5/E7/E8）** | ≤12/≤15 | **转绿 ✅（本刀核心收益）** |
| 模型相关性 | 12/13·LB 0.667 | E7/E8 13/13·LB 0.772（E5 12/13·OT-16 轮间漂） | 子集 ≥36 且 LB ≥0.90 | **结构性不可达**（子集恒 13<36·§0.6·非本刀可改） |
| 攻击不变性 | Δmax 50（1/8 对） | Δmax 50（E5 3/8·E7 1/8·E8 3/8 对翻转） | Δ≤15 | **未达**：同文本两调用档位翻转仍在（§0.4-1） |

剥离精确率 8/8 六轮全过（预处理面零回归）。**结论如实**：扰动段转绿+单调性并列对减半是本刀可复现收益；候选线（单调性 LB≥0.90）差距=quote 拒绝（≈2-4%/调用·整档丢失）+同文本档位翻转（6-19%/对）+mediocre/nonanswer 3 档碰撞，三者均非「再调一句 prompt」可根除，须 §9 后继刀。

### §2.1 终配字节确认（rev r1·E8·证伪 P1-2 合并前置）

- **绑定**：跑前亲记本轮 `packages/ai-runtime/src/prompts.ts` sha256=`ed58bb9c16dc8928d4cace9bb3385eea8e854dc486f7e42b4a0d7fca3951d6f8`（git blob sha1 `eaaa434e8f718aa2e0509ce3e5f0f1dc029fbbbc`=§4 交付 blob 亲等）；同轮收据 sourceDigests 首次带上该值与 `model-client.ts` sha256=`b24f3143…`（harness `scripts/run-e2e-isolated.mjs` scoring:eval:raw 源清单增补两行·in-place 零新增受管文件）——评测读数与交付 v7 字节自此绑定（此前 E4/E5/E7 均无 prompts.ts digest 无法绑定）。
- **E8 读数**（终配 v7·0.2·71/71 调用 0% 跳过·EXIT=0·恰跑 1 轮）：严格单调性 28/36=0.778·LB 0.619·并列 4；扰动 **0.0/0.0/0.0**（四连绿第 4 绿）；ICC NaN（评分可信组 quote 拒 2）；相关性 18/18·模型子集 13/13 LB 0.772；剥离 8/8·Δmax 50（3/8 对翻转）——与 E5/E7 同形，三连绿证据链绑死交付字节。
- **收据**：`receipts/score-stability/e8-final-bytes-confirm.log`＋`.tmp/isolated-proof-receipts/2026-11-05T20-45-27-…json`（target scoring:eval:raw·outcome=passed·exitCode=0·20:42:36Z→20:45:27Z）。

## §3 泛化性论证（为何非逐题调 prompt）

1. v7 锚与 quote 纪律是**对答案属性的判定规则**（有否具体机制/是否术语堆砌/是否自述不确定/有否深化维度；quote 逐字+短引文），不含任何金标用例的问题、答案或词面（rg 对证：prompts.ts 零 `MG-`/`PG-`/`OT-`/`MI-` 词面）。
2. 锚直接对症 §0 三源中的两源的一般机制：换说法同档位规则对症扰动漂移（任意措辞变体泛化）；「点到且正确即算 meets」对症「浅而具体」答案被压 below 的档间粘连（任意题目泛化）。
3. 评测门阈值与用例（scoring-golden.ts/scoring-eval.ts 阈值行）零字节改动。

## §4 版本与钉同步（按仓库约定升版）

| 钉 | 位置 | 改动 |
| --- | --- | --- |
| prompt 注册表 version | `packages/ai-runtime/src/prompts.ts:199` | `'v6'`→`'v7'`（blob sha1 `eaaa434e8f718aa2e0509ce3e5f0f1dc029fbbbc`·前值 `96acf9c3…` 史录并留） |
| ag19 对表+blob 恒定面 | `packages/ai-runtime/test/ag19-prompt-version.proof.ts:49,:96-97` | `'v7'`+新 blob 重钉（亲跑 EXIT=0） |
| `SCORING_PROMPT_POLICY_VERSION` | `packages/db/src/scoring-wire.ts:40` | `mock-interview.evaluate.v7`（issue 契约 prompt_policy_version 新题随升；存量契约不回写） |
| score-writer 版本注记 | `apps/worker/src/score-writer.ts:13,:49` | v7 注记同步（注释面） |
| `EVALUATION_RUBRIC_VERSION` | `apps/worker/src/interview-service.ts:133` | 派生自注册表**自动随升**（零改） |
| 温度注记 | `packages/ai-runtime/src/model-client.ts:175-176` | +2 行 A 候选对照结论（行为零变·ag18 零 diff） |

## §5 评测运行台账（派单上限 8 轮·实跑 8 轮恰等·红的也记）

| 轮 | 配置 | 调用（请求/实发） | 结果 |
| --- | --- | --- | --- |
| E1 | v6·0.2（基线首跑） | 71/31 | **红·INCONCLUSIVE**：隔离 PG 池中断（skip 58%）·mono 段读数仍取证（3 quote 拒） |
| E2 | v6·0.2（基线） | 71/71 | 全量读数 §0.2 |
| E3 | v6·temp0（A 候选） | 71/71 | §1-A：无段改善→不采纳 |
| E4 | v7·temp0（A+B） | 71/71 | 29/36·扰动 0/0/0 |
| E5 | v7·0.2（B-only 消融） | 71/71 | 28/36·扰动 0/0/0·A 非必要 |
| E6 | v7·0.2（终配确认） | 71/24 | **红·INCONCLUSIVE**：同 E1 基础设施类中断（skip 68%） |
| E7 | v7·0.2（终配确认 2） | 71/71 | 27/36·扰动 0/0/0 三连绿·相关性 18/18·评分可信组 quote 拒 3 |
| E8 | v7·0.2（终配字节确认·rev r1） | 71/71 | 28/36·扰动 0/0/0 四连绿·读数绑定交付 v7 字节（§2.1·sha256 `ed58bb9c…`） |

实发供应商调用合计 481（≈1.1 元·按 0.16 元/71 调用价算）。基础设施红轮 2/8 的根因（隔离 PG `db_pool_error: Connection terminated unexpectedly`）与本刀改法面无关（E2-E5/E7/E8 同环境全量跑通），如实承登供 nightly 观测。

## §6 门与 proof（亲跑实录）

| 门 | 结果 |
| --- | --- |
| `pnpm scoring-eval:prove`（eval-metrics 度量数学） | EXIT=0 ✅（rev r1 复跑同值） |
| ag18 采样温度 proof（隔离） | EXIT=0 ✅（回退后零 diff 复跑·rev r1 终配态复跑 20:41:16Z 缺省 0.2 EXIT=0） |
| ag19 prompt 版本 proof（隔离·新 blob） | EXIT=0 ✅（rev r1 终配态复跑 20:41:37Z blob=`eaaa434e…` EXIT=0） |
| `pnpm scoring:eval` E8 终配字节确认（隔离·71/71） | EXIT=0 ✅（rev r1·读数与收据绑定见 §2.1） |
| worker `prove:scoring-integrity`（隔离） | EXIT=0 ✅ |
| worker `prove:scoring-golden` / `prove:scoring-eval-key` / `prove:security` / `bill1-topic-fields:prove`（隔离） | 全 EXIT=0 ✅ |
| ai-runtime `prove:diag-honesty` | EXIT=0 ✅ |
| domain `prove:adaptive` / `prove:adaptive-redesign` / `prove:scoring-operation-routing` / `prove:scoring-honesty` | 全 EXIT=0 ✅ |
| typecheck（ai-runtime/db/worker） | 全 EXIT=0 ✅ |
| lint 计数 vs 帽（root 5410 / api 未触 / domain 未触 / ai-runtime 628 / db 1042 / worker 999） | 恰等不超 ✅（0 errors） |
| `pnpm arch` | EXIT=0（0 errors·8 warnings=基线常态） |
| `node scripts/provider-egress-inventory.mjs` | EXIT=0（401 环境引用·本刀零新增 env 引用·rev r1 复跑同值） |
| root lint（`--max-warnings 5410`） | EXIT=0 · 0 errors 5410 warnings=基线恰等（rev r1 复跑·rev 触面仅 harness 脚本+卷+收据零包码） |
| `node scripts/ai-docs/check-docs.mjs` | EXIT=0 · scanned 2491=cap 2491 恰等（本卷落卷后亲跑·rev r1 复跑恰等） |
| `node scripts/ai-docs/public-text-policy.proof.mjs` | 12/12 ✅（cap 2_491 面行使·rev r1 复跑 12/12） |
| markers | 改动集 20 文件（draft 16+rev r1 增 4 路径=harness 脚本+候选态存证 2 件+e8 收据）五类标记词+冲突标记 **0 命中** ✅ |
| 浏览器 UI runner | 未跑（派单免） |

**勘误注（rev r1·随卷收据换装·史录保留不删除）**：随卷 `ag18-proof-run1.log`/`ag19-proof-run1.log` 两件起草时误装为**候选态运行**——ag18（收据时点 19:34:53Z）记「mock-interview.evaluate 缺省 temperature===0（实际 0）」「undefined 得 0（SCORE-STABILITY 缺省 0.2→0）」；ag19（收据时点 19:35:08Z）记「git blob sha1=6d456de659e5e233a470cdc9522b02a5c959b5ac」≠交付申报 `eaaa434e…`（§4）——与卷文「回退后零 diff」「新 blob 重钉」互斥（证伪席 P1-1 指出）。rev r1 已将两件换装为**终配态亲跑 stdout**（ag18 20:41:16Z 缺省 0.2·ag19 20:41:37Z blob=`eaaa434e…`·均隔离 EXIT=0·与 .tmp/isolated-proof-receipts 19:48:55/19:49:07 终态首证及证伪席复跑 20:24:57Z/20:25:08Z 同 digest 亲等）；错装旧件整件保留为同目录 `ag18-proof-run1.candidate-state.log`/`ag19-proof-run1.candidate-state.log` 史录（上引两行原文俱在）。终配态运行的存在性先于 rev r1 已由 .tmp 19:48/19:49 收据（passed·prompts sha256=`ed58bb9c…`=交付树亲等）与证伪席复跑 EXIT=0 亲证。

## §7 两 policy cap 恰等步进（链注追加·四联动点恰等·不改写既有注记）

本刀新增受管文件=本卷 REQUEST 1 件（收据 .log ∉TEXT_EXTENSIONS 不计·改法面全为既有文件 in-place）→ **cap 2490→2491 恰等零多放**（本树届扫 2490=cap 2490 恰等零余量·docs:check 起草前亲跑 EXIT=0 scanned 2490 亲证）：

- `scripts/ai-docs/public-text-policy.mjs`：链区顶部追加 `CAP-SANCTION-2492` 注记一行（:313·既有注记逐字零改写）+ `MAX_FILES = 2_491`（:314）。
- `scripts/ai-docs/public-text-policy.proof.mjs`：链区追加 `CAP-SANCTION-2492` 注记（:506）+ 四联动点恰等改——loop `i < 2_491`（:452）/ atCap `scannedFiles 2_491`（:459）/ 越限 fixture `f-2491.md`（:507）/ 越限错误 `PTP_FILE_LIMIT:2492`（:460-461,:510）。
- PTP 12/12 对 2_491 亲跑 EXIT=0（§6）。
- **rev r1（2026-11-06）零新增受管文件**：触面=本卷 in-place+harness 脚本 in-place+收据 .log（∉TEXT_EXTENSIONS 不计）→ **cap 2491 不动**（check-docs scanned 2491=cap 复跑在证 §6）。

## §8 停止条件与状态

- 停止四类核查：①现场漂移超注记级——无（基线 commit/文件锚全部亲证在位）；②机制不满足——**候选线未达即本刀如实申报项**（§2），非隐匿；③越界需要——quote 规范化/中位数属越界面→转 §9 后继刀未行使；④验收红不可修——扰动段已修绿，其余红如实申报。停止条件未触发停刀。
- **Status**: **`post_prove_dual_pass`**（post-prove 双审两独立外席 BOTH PASS（.tmp/reviews/score-post-1.md PASS·score-post-2.md PASS·P1=0）·待 pre-exec 双审两独立外席；本卷含实跑读数与不达标如实申报，双审可否决改法面、读数取舍与卷内容）。

## §9 在飞/偏离/后继建议

- **在飞登记**：`fastm-draft`（快模型缺省修复刀·未并主线——本刀显式 `MODEL_FAST_NAME=qwen-plus` 与其修法语义一致；并线时 `scoring-eval.ts` 相邻面按 dual-keep 先例形承登）·`ksw/xs/sbg/uc31-rev` 各 ahead≥1 零触本刀触面。
- **rev r1 注记（2026-11-06·登记源=证伪报告 `meetwise/.tmp/reviews/score-pre-2.md`·判定 PASS 带 P1×2 合并前置·P2×8 登记）**：①**P1-1 收据错装勘误**——随卷 ag18/ag19 两件换装终配态 stdout+本条勘误注在 §6，错装旧件整件保留 candidate-state 史录不删；②**P1-2 终配确认**——E8 一轮恰跑（§2.1·71 调用≈0.16 元·红了不重跑未触发·EXIT=0），收据源清单增补 prompts/model-client 两行（harness in-place）；③**P2-① 勘正**——§1-A E3 扰动 p90 17.5→20.2（以原始日志为准）；④其余 P2 观察（②③④⑤⑥⑦⑧：E3 Δ50 对数/分母口径/good→exceeds 抬档/below 锚含混带/quote 纪律动机句/OT-16 四连拒/路由子集扩样后继刀）**登记未行使**，随双审面供裁。零新增受管文件·cap 不动（§7）；Status 保持 `post_prove_dual_pass` 不变。
- **偏离任务书清单**：①评测实跑 8 轮=派单上限恰等（含 2 基础设施红轮与 rev r1 终配确认 1 轮·如实记）；②温度候选实测后不采纳（§1-A·回退有据）；③中位数候选实测算账后不采纳（§1-C）；④收据 12 件落 `ai-docs/delivery/receipts/score-stability/`（rev r1 换装 2+候选态存证 2+终配确认 1·.log 非扫描面）；⑤零其余偏离——评测门阈值/用例零字节、ag18 零 diff、pins 十一值零翻。
- **后继建议（按优先序）**：① **quote 规范化匹配刀**：`validateEvaluationEvidence` 逐字匹配加白名单归一（空白折叠/全半角宽度），一并重验 0103 span 契约链（score-span-answer/scoring-report-integrity 面）——对症 ≈2-4%/调用的整档丢失，是单调性/ICC/相关性三段的公共根；② **多次评分中位数刀**（N 与 billing 归集不变量重验随刀）；③ mediocre/中档判别双盲人工锚定（CALIBRATION_STATUS 未建立面不变）；④ nightly 隔离 PG 池中断观测（E1/E6 同根因）。
- **Status**: **`post_prove_dual_pass`**（post-prove 双审两独立外席 BOTH PASS（.tmp/reviews/score-post-1.md PASS·score-post-2.md PASS·P1=0）·同 §8·四处状态钉之三）。

---

### 卷尾摘要

评分稳定性刀落卷：v7 档位锚+quote 逐字纪律采纳（扰动段 p90 17.5→0.0 四连绿转绿、单调性并列对 6→3-4），温度 0 与多次评分中位数两候选实测后不采纳（读数与成本在卷）；**候选线未达如实申报**——严格单调性 28/36（LB 0.619<0.90）、攻击 Δmax 50、相关性线结构性不可达（子集 13<36）；差距根因=quote 拒绝/同文本档位翻转/3 档碰撞，后继刀与人工校准建议在 §9。8 轮评测 481 次调用≈1.1 元全记账（含 rev r1 终配字节确认 E8·读数绑定交付 v7 sha256 `ed58bb9c…`·收据勘误注见 §6）。**Status**: **`post_prove_dual_pass`**（post-prove 双审两独立外席 BOTH PASS（.tmp/reviews/score-post-1.md PASS·score-post-2.md PASS·P1=0）·四处状态钉之四·alone≠dual·Ban self-approve·⛔push）。

pins（十一值照抄·零翻转）重温：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null。
