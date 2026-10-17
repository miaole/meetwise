# Meetwise 计费改造：按“每个话题的交互”计费——最终版（已交叉复核）

> **最终版（已交叉复核，2026-10-12）**。本文件自包含：现状、复核结论、设计、SQL 草案、异常分支、影响范围、待拍板点（§11·rev1 已三态化）都在这里，不需要再看其他文档。
> **rev1（2026-10-12）**：对齐现 tip（`133acba6`·验证席定谳 tip 漂移已核）——B 端章按 B271/i2b/b110 三战役现状改写（§3.8/风险 K/§7 P4+步⑧·企业付费 B271 片2 已落·held 守卫 i2b `d4e51105`·P0 注册赠送已落 b110 `91c686d9` 删除·人日下调）；用户裁决全文落卷（LANDING-INDEX 第十二节四问 `a62e8fa3` + 深夜扩权 `b24f3f4e` + 第十三节二则 `133acba6`·§11 三态化）；扩张包新增 §3.10–§3.14；五条承重 pin 重锚（begin `interview.service.ts:256-268`/收尾 `adaptive-lifecycle.ts:442-488`/commerce `:251-257`/recruiting `recruiter.ts:592-607`/#31 `:54-62`·开工 tip 实测）；迁移草案重排 0170–0173。附记见 §14。
> 源码：`<外部只读快照>/meetwise-latest`（落地形式调整·原文本机快照径） @ `2fab7946`，只读；未改仓库、未 commit、未碰 Meridian。审计依据：`<外部审计总表>/issues-master.csv`（外部件·不入仓）、`<外部探索卷>/explore/ai-cost-context.md`（外部件）。
> 复核方式：A 代码事实、B 账本与异常、C 产品与公平，三路各自读源码；再由独立专家对照源码逐条交叉复核。只有核住的才写成定论。
> 标注：**【已核实】** = 本次读码确认（附 file:line）；**【推断】** = 设计或推论，未起库、未实跑；**【无法核实】** = 本次条件下查不到（汇总在 §13）。
> 历史版本：v1（按题型定分）`README.v1.md`；v2 复核前 `README.v2-prereview.md`；逐条复核记录 `review-v2.md`（这三份只留在盒子上）。

---

## 0. 大白话总结

- **用户的想法**：一道题一来一回就结束扣 1 分；来回好几轮扣 2 或 3 分。
- **复核后最重要的发现**（都已对照源码；行锚已按 rev1 tip `133acba6` 重 pin）：
  1. **“轮数”几乎全由系统决定，不是用户造成的。** 用户没有“主动追问”的入口；多出来的轮次只有两种来源：系统追问（决策器决定，核心能力最多追 3 次、非核心 2 次）和澄清（用户答非所问时系统让重答，每题最多 1 次）【已核实 `packages/domain/src/adaptive-interview.ts:48,90,149-155,318-319`】。系统还会因为“答得好、想深挖”而追问（`probe_deepen_strong`，`:48`）。所以 v2 原公式“按轮数定档”实际是在**按系统决定收钱，并且答得好的人反而多付**。原结论“按用户自己造成的交互量定档”不成立。
  2. **代码里根本不存在“invoke 内部重试”。** 派发后超时、断连、5xx 一律记为 unknown，绝不自动重发；tracer 里的 attempt 只是 0（未派发）/1（已派发）的阶段标记，不是重试次数【已核实 `packages/ai-runtime/src/invoke.ts:5-8,154-156`；`apps/worker/src/adaptive-interview-service.ts:340-346`】。原设计里的 `attempt_no` 列、“重试不计费”规则和示例 T2“超时后内部重试成功”都不成立，已删除。
  3. **出题失败会直接结束整场面试，不是“这题作废、接着考”。** 生成失败、重复题、引文不合法、critique 不过，都会 failClosed 并 `concluded=true`【已核实 `packages/ai-graphs/src/adaptive-interview/nodes/generate-question.ts:14-22,68-80`】；收尾时只要没有“未评分”的答案，就按**完成并全额确认**扣费【已核实 `apps/worker/src/adaptive-lifecycle.ts:462-475`】。这是一个现存问题：系统原因提前结束，用户照样全额付费。
  4. **0020 触发器早就被改写过两次。** 0046 已经把 failed 纳入校验，0144 又把函数体搬到 `tf_interview_consumption_terminal_pair`【已核实 `0046:144-173`、`0144:365-411`】。原文“需要把触发器扩到 failed”是错的；新迁移必须改 0144 的 `tf_` 函数，不能照抄 0020 的旧函数体。
  5. **租约过期回收不只是“进程崩了”，也包括“用户不点放弃、直接走人”。** 对账代码的注释写明“被回收的面试预留=用户中途弃”【已核实 `apps/worker/src/commerce-reconcile.ts:39`】。租约只在 worker 处理任务时续约【已核实 `apps/worker/src/interview-consumer.ts:300,309`】。原设计“租约过期一律全退”会让“做完 9 个话题后直接关页面”的用户一分不付（漏扣）。
  6. **评分引文核验失败和用户答非所问，在图里看起来一模一样。** 都是 `relevant=false, score=0`，都会吃掉每题唯一的一次澄清机会【已核实 `adaptive-interview-service.ts:551,567-572`；`adaptive-interview.ts:155,318-319`】。要把它算成“系统原因不计费”，必须先把原因透传出来。
- **推荐（大白话）**：
  - **默认方案（已裁采纳·十二节裁决①）**：**每个话题固定 1 分**（话题 = 一个主问题加上系统对它的追问和澄清），**系统追问、澄清都不加钱**，单场封顶 6 分（初值·影子期复核终值）。这句话能讲清楚：“每个话题 1 分，单场最多 6 分，系统出错不收钱。”
  - “聊得多付得多”只对**用户主动发起的额外交互**收费（“请再追问我一轮”入口·已裁新增·§3.11），因为那是用户自己的选择。现状该入口不存在【已核实：决策只来自 `decideNext`，`packages/ai-graphs/src/adaptive-interview/nodes/decide.ts:7-35`】。
  - 原 v2 的“轮数 + 长度”公式备选**已废**（裁决①采纳默认方案；§3.5 仅存档）。
  - token 永远不直接定价，只用于成本对账和告警。
  - 用户原则（十二节扩权·`b24f3f4e`）：**“凡是调用大模型的面都必须有合理的处理”**——全部 16 个模型操作逐一给计费/治理方式，零“调模型却无处理”暗面，见 §3.14 覆盖表；扩张包（押题/诊断/OCR 积分制·主动追问入口·深度研究 premium·积分明细列表）见 §3.10–§3.13。

---

## 1. 现状链路（全部对照源码）

### 1.1 收入侧（用户积分）——行锚按 rev1 tip `133acba6` 重 pin
| 环节 | 现状 | 位置 | 核实 |
|---|---|---|---|
| 额度桶 | `entitlement_bucket`：kind 为 gift/trial/paid/**enterprise**（enterprise=0156 B271 扩值·trial=注册赠送已落 0154）；容量 CHECK；FIFO 扣 | `packages/db/migrations/0001_baseline.sql:93-106`；`0156`；`0154` | 已核实 |
| 消费 saga | `entitlement_consumption`：`UNIQUE(owner,idempotency_key)`；reserved/confirmed/partial_confirmed/released；带租约 | `0001_baseline.sql:109-122` | 已核实 |
| 预留 / 确认 / 释放 | reserve 全有全无；confirm 按比例分账（前 n-1 桶 r2 比例舍入+尾桶吸收差额）并同事务写 outbox；release 全退；文件已移径 `db/src/commerce/` | `packages/db/src/commerce/commerce.ts:43-103, 167-219, 221-249` | 已核实 |
| 确认的舍入 | `settled = r2(units_requested × ratio)`；ratio<1 记 partial_confirmed | `commerce.ts:183,193` | 已核实 |
| 面试扣费点 | begin **双路**（B271 片2）：`applicationId` 非空走 `reserveEntitlementForApplication`（企业桶·0157 payer 路由），否则 C 端本人 `reserveEntitlement(c, owner, id, 'mock_interview', 1.0)`；键 = interviewId | `apps/api/src/modules/interview/interview.service.ts:256-268` | 已核实 |
| 额度不足分码 | 企业不足 ⇒ **409** `enterprise_insufficient_balance`；C 端本人不足 ⇒ **402** `insufficient_entitlement` | `interview.service.ts:260-268` | 已核实 |
| 完成收口 | `completeInterviewAndConfirm` 固定 ratio=1；**遇到 partial_confirmed 直接抛错** | `commerce.ts:251-257` | 已核实 |
| 失败 / 放弃收口 | `failInterviewAndRelease`、`abandonInterviewAndRelease` 都是全退 | `commerce.ts:286-352, 353-403` | 已核实 |
| 终态配对触发器 | 现行函数体：completed 只配 confirmed；abandoned/failed 只配 released；0144 注明 partial 配对缺口 `GAP-COMM-PARTIAL-PAIR` 另裁 | `0020:26-64` → `0046:144-173` → `0144:365-411` | 已核实 |
| 收尾判定 | 无未评分且有有效分 → 完成扣费；无未评分且零有效分 → **仍完成扣费**+B 端标 `assessment_unavailable`（可重试终态）；有未评分 → 失败全退 | `apps/worker/src/adaptive-lifecycle.ts:442-488` | 已核实 |
| 对账 | 租约过期回收（C 端置 abandoned，B 端走 failed 配对+`assessment_unavailable` 事件）+ outbox 入 `settlement_ledger`（每笔只入一次） | `commerce.ts:432-500`；`commerce-reconcile.ts:39-68` | 已核实 |
| 续约 | 只在 worker 处理面试任务时续约，默认租约 1800 秒 | `interview-consumer.ts:300,309`；`commerce.ts:33` | 已核实 |
| 同键不同 units 被静默吞（#31） | reserve 幂等闸 | `commerce.ts:54-62`；issues-master #31 仍存在 | 已核实 |
| 已售单位 | 支付回调建 paid 桶，1 单位 = 1 场，有效期 365 天（文件已移径）；trial 桶=注册赠送（1.00 单位/365 天·每用户一桶·b110 已落）；enterprise 桶=对公充值（0156 offline 双录） | `packages/db/src/commerce/payment.ts:100`；`packages/db/sql/23_api_gateway.sql:36-43`；`0156`；issues #228 | 已核实 |

### 1.2 成本侧（平台花的模型钱）——和用户积分完全两本账
| 表 | 关键列 | 位置 | 核实 |
|---|---|---|---|
| `ai_model_invocation` | PK(owner,idempotency_key)；status ∈ claimed/dispatching/succeeded/failed/unknown；error_code；input/output_tokens；service；request_id；**没有 interview_id / question_id / attempt 列** | `0037_ai_model_invocation_durable_claim.sql:7-31` | 已核实 |
| 补列 | `logical_node_key_digest`（`0085:10`）、`estimate_input_tokens`（`0119:25-27`） | — | 已核实 |
| `ai_invocation_trace` | PK(owner,idempotency_key)；output；service、input/output_tokens（0011）；request_id（0014）；estimate_input_tokens（0090）；同样没有面试/题目列 | `0001_baseline.sql:55-61`；`0011`；`0014:4`；`0090:4` | 已核实 |
| 写痕迹 | `INSERT … ON CONFLICT DO NOTHING`，usage 缺失写 NULL；只在输出校验通过时写 | `packages/ai-runtime/src/invoke.ts:359-367` | 已核实 |
| `ai_cost_reservation` | 月度预算的预留与实际；unknown 由 0056/0057 的对账函数置位 | `0033:38-60`；`0056:25-26`；`0057:62-63` | 已核实 |

### 1.3 能否按“面试 + 题目”归集——只能拆字符串
| 调用 | 幂等键 | 能归到哪 | 位置 | 核实 |
|---|---|---|---|---|
| 能力规划 | `${threadId}:plan` | 面试 | `adaptive-interview-service.ts:276` | 已核实 |
| 出题 | `${threadId}:ask:t${turn}:0`（`:0` 写死，attempt≠0 直接拒绝；grounded refs 闸拒绝与判重 re-roll 另有 `:gr${n}`/`:r${n}` 有界重试键——均为图内显式分支，不是 invoke 内部重试） | 面试 + turn，没有 question_id | `adaptive-interview-service.ts:340-346, 444-446, 452, 492` | 已核实 |
| 评分 | `${threadId}:eval:q:${questionId}:v:${stateVersion}:t:${turn}`，再按答案摘要派生 | 面试 + question_id + turn | `adaptive-interview-service.ts:541`；`apps/worker/src/interview-service.ts:127-128` | 已核实 |
| threadId | `privacyInterviewId: threadId`，即 threadId = interviewId | — | `adaptive-interview-service.ts:276,425` | 已核实 |
| logical_node_key | `${registryVersion}:${operationId}:${businessRevision}`，只存 digest | 不是题目维度 | `model-operation-registry.ts:253`；`0085:10` | 已核实 |
| 操作清单 | 规划、出题、评分、押题、简历诊断、报告叙述等，均 `maxDispatches: 1` | — | `model-operation-registry.ts:64-100` | 已核实 |
| 题目表 | `interview_question`：question_id、state_version、turn、qkind、status、answer_id；没有话题/父题/消耗列 | — | `0021_interview_question_identity.sql:6-22` | 已核实 |

- **澄清和追问都会生成新的 question_id**：`issueQuestionId(stateVersion, turn, clarifyAttempts)`，stateVersion 每次 +1；澄清时 turn 也 +1【已核实 `generate-question.ts:10-11,93`；`adaptive-interview.ts:318-319`】。所以“一道题”在系统里是**一串 question_id**，需要补 `topic_id`。
- **出题键没有 question_id**，只能拆出 turn 再去 `interview_question.turn` 反查【已核实】。
- RAG / embedding / rerank 的调用和题目没有稳定的键关系【推断】。

### 1.4 自适应机制（决定“轮数”从哪来）
| 事实 | 位置 | 核实 |
|---|---|---|
| 决策产出 `mode: 'probe' \| 'pivot'`，原因含 `probe_weak`、`probe_deepen_strong`、`pivot_*` | `adaptive-interview.ts:48,90` | 已核实 |
| 追问上限：核心能力 3，非核心 2 | `adaptive-interview.ts:149-151,159` | 已核实 |
| 澄清：每题最多 1 次（`MAX_CLARIFY=1`），只在“非作答”时触发；主动跳过直接换题 | `adaptive-interview.ts:155,318-319` | 已核实 |
| 澄清复用上一题文本，不调模型 | `generate-question.ts:47-57` | 已核实 |
| 引文核验失败 → 返回 `relevant=false, score=0`，图走澄清，与用户答非所问不可区分（评分操纵剥离同形） | `adaptive-interview-service.ts:534,551,567-572`；`interview-service.ts:316` | 已核实 |
| 难度 1..5 随表现调整 | `adaptive-interview.ts:157,232-233` | 已核实 |
| 话题数由系统决定：软预算可上调（`SOFT_BUDGET_RAISE_STEP=4`），绝对上限默认 120 轮 | `adaptive-interview.ts:100,102,399-421` | 已核实 |

### 1.5 token 数据质量
- 估算器 `utf8-bytes-v1` = UTF-8 字节数，是真实 token 的保守上界【已核实 `packages/ai-runtime/src/model-client.ts:74,176`、`context-budget.ts:136`、`usage-reconciliation.ts:5,27,43`】。中文一字 3 字节，因此会明显高估；“约 2–3 倍”这个倍数【推断，取决于分词器】。
- **F15 口径不一致**【已核实】：usage 缺失时 `validUsage` 回退到上限（多记）`invoke.ts:335-343`；模型管道 usage 解析用 `?? 0`（少记）`model-client.ts:662-670`；痕迹写 NULL `invoke.ts:359-367`；RAG embedding 缺 usage 时按 16,000 记 `rag-cost-governance.ts:44`。详见 `ai-cost-context.md:168-180`。F15 与 AG 战役 AG-14 同案（刀 B 折叠·billing 侧只消费其产物）。

---

## 2. 方案评估

### 2.1 风险总表（复核后）
| # | 风险 | 说明 | 核实 |
|---|---|---|---|
| A | 归集缺字段 | §1.3，只能拆字符串 | 已核实 |
| B | **轮数由系统决定** | 追问由决策器发起，含“答得好就深挖”；用户没有主动加轮的入口；澄清只因非作答触发 | 已核实机制；用户观感为推断 |
| C | 模型啰嗦、换模型改价 | 输出 token 由我们的 prompt 和模型决定 | 推断 |
| D | 估算器高估 / usage 缺失（F15） | 不能作为对外账单依据 | 已核实 |
| E | 系统原因混入 | unknown、schema/业务失败、引文核验失败补答、报告重试 | 已核实这些路径存在；**不存在自动重试** |
| F | 出题失败结束整场且全额扣费 | 现存问题，新方案必须改 | 已核实 |
| G | 租约过期 = 崩溃或用户走人 | 新模式若一律全退会漏扣 | 已核实 |
| H | 引文失败与答非所问不可分 | 要透传原因 | 已核实 |
| I | 现存触发器只允许 completed↔confirmed | 部分结算需要改 `tf_` 函数和 `completeInterviewAndConfirm` | 已核实 |
| J | 单位口径 | **已裁解除（十二节裁决②）**：1 单位 = 1 场不变·按比例结算·零存量换算（§3.3） | 预留逻辑已核实；裁决落卷 |
| K | B 端重开再扣（rev1 改写） | 「扣候选人」已不成立——B271 片2 企业付费已落（begin 双路 `interview.service.ts:256-268`·C 402/B 409）；「零有效分可重试再扣」被 i2b held 守卫收窄（绑定面试 completed 的 held 终态不可重试·`recruiting/recruiter.ts:553-565`）；**残面=「重开再扣」仍成立但改扣企业**：重开生成新 interview id → 新预留键（`recruiting/recruiter.ts:592-607`）→ application 幂等未落（P4） | 已核实（#271 残面） |
| L | 语音无成本记账 | ASR/TTS 无预留（#72）；处理=§3.14 至少 recordUsage 入 0171 归集账本 | 已核实（issues #72） |

### 2.2 方案对比（“话题固定 1 分”列已裁采纳·十二节裁决①）
| 维度 | 按场（现状） | v1 按题型 | **话题固定 1 分（已裁采纳）** | v2 原公式（轮数+长度·已废） |
|---|---|---|---|---|
| 事前可知 | 完全 | 出题即知 | 话题开始即知 | 只知当前档 |
| 只为自己的选择付费 | 是 | 否（题型系统选） | 话题数系统选，封顶兜底 | **否（追问/澄清系统选）** |
| 惩罚认真作答 | 否 | 否 | 否 | **是**（答得好被深挖、长答案加价） |
| 可解释 | 强 | 强 | 强 | 中 |
| 工程量 | — | 中 | 中（归集可简化） | 高 |

---

## 3. 推荐方案

### 3.1 计费单位：话题
- 话题 = 一个 pivot 主问题 + 其后同一能力上的 probe 追问 + 澄清重答。在 `interview_question` 补 `topic_id`（填主问题的 question_id）和 `ask_mode`【推断】。
- 每个话题只计一次：`topic_charge` 主键 `(owner, interview_id, topic_id)`。

### 3.2 计什么、不计什么（已裁·十二节裁决①/③）
| 情形 | 计费 | 依据 |
|---|---|---|
| 话题出了题、用户至少有 1 次有效作答（含跳过以外的作答） | 1 分 | 已裁（裁决①）；`adaptive-interview.ts:318` |
| 系统追问、澄清重答 | 不加分 | 已裁（裁决①）；轮数由系统决定（§1.4，已核实） |
| 用户主动跳过（skipped）且无其他作答 | **已裁：0 分**（裁决③） | `adaptive-interview.ts:318` |
| 出题失败（含 unknown、duplicate、引文不合法、critique 失败） | **已裁：当前话题 0 分；整场随之结束，按已完成话题结算**（裁决③“系统原因提前结束=已完成话题照收”） | `generate-question.ts:14-22,68-80` |
| 评分失败（unscored） | **已裁：该话题 0 分、已完成话题照计**（裁决③）——收尾从“失败全退”改为“按话题部分结算”，终态仍 failed 但配对 partial_confirmed | `adaptive-lifecycle.ts:481-488` |
| 引文核验失败引起的补答 | 不加分（默认方案本来就不按轮计） | `adaptive-interview-service.ts:551` |
| 规划、检索、embedding、rerank、报告生成及重试 | 永不计入（C 端用户侧）；企业私有题库 RAG 分账见 §3.14 | registry `:64-100`；十三节裁决① |
| 超过单场封顶 | `counted_capped`，0 分 | 已裁（封顶 6·裁决①） |

### 3.3 封顶与单位（已裁·十二节裁决①/②）
- 单场封顶**已裁初值 6 分**（裁决①；按“普通一场的话题数”设，影子期复核终值=唯一残面开放点）。
- 开场：方案②下**仍按 1.00 单位 = 1 场预留**（begin 双路现状零改·`interview.service.ts:253-269`），封顶只进收尾比例；余额 < 1.00 单位返回 402（C 端）/ 企业不足 409（B 端·现状分码保持）。
- **单位换算已裁（裁决②·方案②按比例）**：1 单位 = 1 场不变，话题分只用于在 1 场内按比例结算——`settled = r2(requested × LEAST(Σ, cap) / cap)`，Σ=已计话题总分、cap=6。零存量换算、零兼容风险（**上线步⑦“存量换算”删除**）。方案①（1 单位 = N 分·存量×N 换算）**作废**。“分”在②下是展示与比例概念，账本单位仍是“场单位”【推断：分母 cap 固定·分子由 topic_charge 聚合·公式与既有 `commerce.ts:183` 同形】。

### 3.4 透明度
- 开场：规则 + “本场最多 6 分”。答题中：当前已计话题数。结束：逐话题明细（话题、作答次数、是否计费、未计原因）。
- 不需要“跨档前提示”（默认方案没有档位）。
- 逐笔账单可见性（用户/企业双端·积分明细列表）独立成节：见 §3.13（吸收 v1 F11 余额展示）。

### 3.5 备选：v2 原公式（**已废·裁决①采纳默认方案·仅存档**）
- 原公式：R = 话题内计费作答轮数；L = 作答总长度（平台计数器 meter-v1）；X = R + ⌊L/600⌋×0.5；X≤1.5→1 分，≤3→2 分，>3→3 分；系统追问引起的轮数最多计 2 轮。
- 复核发现的问题【机制已核实，后果为推断】：
  1. 回答一次系统追问就 R=2 → 2 分；因为 `probe_deepen_strong`，答得好的人更容易被追问、多付。
  2. “系统追问最多计 2 轮”几乎不起作用：非核心能力本来最多就追 2 次，核心 3 次（`adaptive-interview.ts:19,144`）。
  3. 一个认真的 1,200 字回答 X=2 → 2 分，长度直接罚认真作答；⌊L/600⌋ 在 599/600 字处跳档。
  4. 原文“故意一句话作答可以少付”不准确：非作答会触发澄清（+1 轮，反而多付）；真正能少付的是主动跳过（`adaptive-interview.ts:298`）。
  5. 原文“用户原因澄清计轮”：澄清只因“非作答”触发，相当于对“答不上来”加价，对练习产品不友好。
- 如果仍要用：只计**用户主动发起**的额外轮次（需新增产品入口），长度不计费，最多 +1 分。

### 3.6 为什么不按 token 收【前 3 条推断，第 4 条已核实】
1. token 大头来自 prompt、上下文、检索材料和模型输出，用户控制不了。
2. 换模型就换价格。
3. 用户看不懂 token。
4. 估算器高估、F15 口径不一，不能作为账单依据（§1.5）。

### 3.7 出题来源（RAG vs 生成）不计入用户价格
| 题型 | 出题路径 | 模型调用 | 检索 | 位置 | 核实 |
|---|---|---|---|---|---|
| grounded 且有简历画像 | 固定模板，不调模型 | 0 | 无 | `adaptive-interview-service.ts:97-110` | 已核实 |
| grounded 无简历画像 | 图里降级为 fundamental | 见下 | 见下 | `generate-question.ts:43-45` | 已核实 |
| fundamental | 先 CRAG 本地检索（低置信再 deepResearch/webExplore），摘录只作素材喂给生成，**不直接出库里原题** | 1 次 `interview.question-generation.v1` | 本地 qbank；低置信加外部 | `adaptive-interview-service.ts:118-162`；`packages/domain/src/crag.ts:57-79` | 已核实 |
| scenario / behavioral | 纯生成，空素材 | 1 次 | 无 | `adaptive-interview-service.ts:117-121` | 已核实 |
| 澄清重发 | 复用原题文本 | 0 | 无 | `generate-question.ts:54-57` | 已核实 |
| 照搬原文 / 引用不合法 / critique 失败 | fail-closed，**整场结束** | 已花 1 次 | — | `adaptive-interview-service.ts:155-159,186-193`；`generate-question.ts:66-80` | 已核实 |
- 结论【已核实】：不存在“RAG 命中直接出题、不调模型”的便宜路径；本地摘录每条最多 600 字（`:138`），外部材料预算 1,600（`:145`）。走 RAG 的 fundamental 题反而最贵，grounded 模板题最便宜（0 token）。
- 各路径 token 量级只能【推断】，代码没有固定上限（成本策略默认上限 1,000,000：`apps/worker/src/model-cost-governance.ts:102-103`）。
- 决策：来源成本由平台吸收，摊进每分单价，用成本/收入比告警控制尾部【推断】。理由：用户控制不了题型和检索命中（`adaptive-interview.ts:90`；`crag.ts:75-77`，已核实）；按来源收会出现“题库越全用户付越多”的反向激励【推断】。
- 若想体现高成本，只做用户主动选择的“深度研究面试”整场加价【推断】。

### 3.8 B 端（rev1 按现 tip 改写：企业付费 B271 片2 已落·held 守卫 i2b 已落）
- 企业付费已落【已核实】：begin 双路——`applicationId` 非空走 `reserveEntitlementForApplication` 企业桶（`packages/db/src/commerce/commerce.ts:105-166`；0157 `payer_user_id`=`job_application.recruiter_user_id` 投影固化·候选人桶零读写），否则 C 端本人 `reserveEntitlement` 原路【已核实 `apps/api/src/modules/interview/interview.service.ts:256-268`】；分码 企业不足 **409** / C 端本人 **402**（`:260-268`）。`apps/api/src/modules/recruiter/recruiter.service.ts:15` 的“候选人用自己额度池”注释系 B271 前残句，现状以 begin 双路为准（该文件不动扣费行为）。
- 「零有效分可重试再扣」被收窄【已核实】：零有效分 B 端仍“完成并扣费”且 application 标 `assessment_unavailable` 可重试终态（`apps/worker/src/adaptive-lifecycle.ts:465-479`），但该终态再开时被 i2b held 守卫拦截——绑定面试 `completed`（held 终态）⇒ 409 `application_held_not_retryable`（`packages/db/src/recruiting/recruiter.ts:553-565`）；`failed` 绑定面试不命中守卫、走既有恢复通路。
- 残面=「重开再扣」仍成立但改扣企业【已核实】：重开 application 生成新 interview id + `interview_attempt+1`（`recruiting/recruiter.ts:592-607`），预留键 = interviewId ⇒ 对同一 application 的重开会**再预留一次（企业桶）**；application 维度幂等未落。
- 推荐【推断】：B 端按场计价（企业桶 1.00 单位/场·已落），按话题计量只作报表；候选人永不扣已成立（begin 双路·候选人桶零读写）；剩余刀=同一 application 的重开不得新扣（预留键改为 application 维度或企业侧幂等·P4 残面 2–4 人日）。

### 3.9 兜底
- 开关 `billing.interaction.enabled` 关闭即回到按场。
- 任一话题计量缺失 → **已裁：该话题 0 分**（十二节裁决③“计量缺失 0 分·不确定就不收”）。

### 3.10 扩张包：押题 / 简历诊断 / OCR 改积分制（已裁·十二节裁决④）
- 现状【已核实】：三者今天都**不扣用户积分**——押题 `interview.quiz-generation.v1`（registry `model-operation-registry.ts:79`·派发 `apps/worker/src/interview-service.ts:245`）、简历诊断 `resume.diagnosis.v1`（`:84`·`interview-service.ts:281`）、OCR 预览 `resume.ocr.v1`（`:114`·调用 `apps/api/src/modules/resume/resume.service.ts:118`·image-unit 预留/确认/释放面已包住 visionOcr：`apps/api/src/modules/resume/ocr-model-client.ts:41`）；`interview-service.ts` 零 entitlement 调用。
- 已裁处理【推断】：同步改积分制——押题/诊断按次扣积分（初值各 1 分/次·定价影子期校准），OCR 预览的 image-unit 面并入同一积分口径；同走 entitlement 桶，`recordUsage` 入 0171 归集账本（§6.5）；逐笔进积分明细列表（§3.13）。

### 3.11 扩张包：用户主动追问计费入口（已裁·十二节裁决④）
- 现状【已核实】：“主动追问”入口不存在——决策只来自 `decideNext`（`packages/ai-graphs/src/adaptive-interview/nodes/decide.ts:7-35`），“聊得多付得多”没有合法落点。
- 已裁处理【推断】：新增用户主动发起的额外交互（面试中/报告后“请再追问我一轮”）——按次计费（初值 1 分/次），begin 之外做按次预留（幂等键 = `interviewId:followup:n`），入 `topic_charge`/consumption 同链记账，逐笔进 §3.13 明细。这是唯一“为自己的选择付费”的加价面。

### 3.12 扩张包：深度研究面试 premium（已裁·十二节裁决④）
- 现状【已核实】：research skills 含 `'deep.research'`（有界多源 allowlist 取证·每场技能上限 1 次：`apps/worker/src/interview-research-skills.ts:15,45`）；§3.7 的“深度研究整场加价”备选由此转正。
- 已裁处理【推断】：深度研究面试作为 premium 增值模式**整场加价**（如 2 单位/场·影子期定价），开场预留即按 premium 单价；token 永不计价（§3.6）；逐笔进 §3.13 明细。

### 3.13 积分明细列表（必做·升 P1 面·已裁·十三节裁决②）
- 用户端与企业端**各一**，逐笔可见：时间 / 场景（面试·话题·押题·诊断·深度研究等）/ 扣分 / 退回 / 余额。
- 数据源=三账本【已核实表名】：`entitlement_consumption`（场/预留·`0001_baseline.sql:109-122`）+ `topic_charge`（话题·0172 §6.3）+ `question_usage_ledger`（成本归集·0171 §6.2）。
- API【推断】：`GET /billing/ledger`（分页·用户本人）+ 企业维度（按 `payer_user_id` 过滤·0157 已落列）；前端明细页；吸收 v1 F11 的余额展示（`GET /billing/balance`）。透明度承诺（§3.4）的账面落点。

### 3.14 全模型调用面覆盖表（用户令·十二节扩权 `b24f3f4e`：凡是调用大模型的面都必须有合理的处理）
**RAG 分账原则（十三节裁决①）**：企业私有题库的 RAG 检索**可消耗企业积分**（计费面·与题库分层设计“私有优先”联动）；平台公共题库（内部自建）**不消耗用户与企业任何积分**（维持平台吸收）。下表 RAG 行据此拆分：私有 RAG=企业计费·公共 RAG=平台吸收。

| 调用面 | 现状（file:line·已核实） | 处理方式 |
|---|---|---|
| 能力规划 `interview.competency-planning.v1` | registry `:64`；`adaptive-interview-service.ts:276` | 平台吸收（§3.2 永不计入） |
| 出题 `interview.question-generation.v1` | registry `:69`；`adaptive-interview-service.ts:340-346,492` | **话题计费核心**（§3.2·1 分/话题） |
| 评分 `interview.answer-scoring.v1` | registry `:74`；`adaptive-interview-service.ts:541` | **话题计费核心**（出题+有效作答即计·评分不另扣） |
| 报告 `report.narrative.v1` | registry `:89`；`interview-service.ts:340` | 话题计费覆盖（完成收口含报告·不另扣·#229 随收口改结算） |
| 押题 `interview.quiz-generation.v1` | registry `:79`；`interview-service.ts:245` | 积分制（§3.10） |
| 诊断 `resume.diagnosis.v1` | registry `:84`；`interview-service.ts:281` | 积分制（§3.10） |
| OCR `resume.ocr.v1` | registry `:114`；`resume.service.ts:118` | 积分制（§3.10·image-unit 并轨） |
| 深度研究 `deep.research` | `interview-research-skills.ts:15,45` | premium 整场加价（§3.12） |
| B 端追问/报告问答 | 未落码（产品规划面） | 问答侧随产品落地定（沿 AG-38 工具边界·INDEX 十二节） |
| C 端成长顾问 | 未落码（产品规划面） | 同上 |
| 语音 ASR `voice.asr.v1` / `voice.asr-stream.v1` | registry `:128,:162`；`packages/ai-runtime/src/interview-voice-seams.ts:42-44` | **#72 记账缺口**：至少 `recordUsage` 入 0171 归集（风险 L）；对用户计费随产品定 |
| 语音 TTS `voice.tts.v1` / `voice.tts-stream.v1` | registry `:133,:167`；`interview-voice-seams.ts:54-56` | 同上（#72） |
| `voice.signed-download.v1` | registry `:172` | 非模型调用（下载签名）·零成本面·登记即可 |
| RAG embedding `qbank.embedding-build.v1` / `embedding-query.v1` | registry `:147,:152`；成本策略 `apps/worker/src/rag-cost-governance.ts:44` | **分账**：公共题库=平台吸收（缺 usage 按 16,000 上界·F15）；私有题库=企业积分（RAG 分账原则） |
| RAG rerank `qbank.rerank.v1` | registry `:157` | 同上（分账） |
| CRAG 检索规划 `buildCragPlannerQuery` | `adaptive-interview-service.ts:157-159`；`packages/domain/src/crag.ts:57-79` | 平台吸收（检索规划·§3.7 来源不计价） |
| 岗位路由 `job.route-classify.v1` | registry `:100` | 平台吸收（内部路由·非用户面） |

- 覆盖完备性：registry 全量 16 个模型操作逐一在列（`grep -c "operationId: '" model-operation-registry.ts` = 16·已核实），外加未注册的 deep.research 技能与两个未落码问答面——**零“调用模型却无计费处理”暗面**。

---

## 4. 异常分支（复核后）

| 分支 | 现状 | 新模式处理 | 依据 / 核实 |
|---|---|---|---|
| 用户点放弃 | 全退 | **已裁（裁决③）：已关闭的话题照计，进行中话题不计**；要改 `abandonInterviewAndRelease`（现在只会 release） | `commerce.ts:353-403`，已核实；规则已裁 |
| 用户直接走人（租约过期） | sweep 全退；C 端置 abandoned，B 端置 failed | **已裁（裁决③）：按已关闭话题结算**（与“放弃”一致），不能一律全退；sweep 要从“UPDATE…released”改为“结算或释放”二选一 | `commerce.ts:432-500`；`commerce-reconcile.ts:39-68`，已核实 |
| 进程崩溃 | 同上（无法区分崩溃和走人） | **已裁（裁决③）：同上统一按已关闭话题结算**，不新增判据；若日后要对崩溃全退，需新增“最后一次用户作答时间 vs 任务心跳”判据（归 AG 失败语义轨另议） | 推断 |
| 出题失败 | 整场结束，按完成全额扣 | **已裁（裁决③）：当前话题 0 分，按已关闭话题结算**；全为 0 则全退 | `generate-question.ts:14-22`；`adaptive-lifecycle.ts:462-479`，已核实 |
| 评分失败（unscored） | 整场失败全退 | **已裁（裁决③）：该话题 0 分、已完成话题照计**——收尾改“按话题部分结算”，终态仍 failed 但配对 partial_confirmed | `adaptive-lifecycle.ts:480-488`，已核实 |
| 零有效分完成 | 完成并全额扣 | 按话题计；全部跳过的话题（已裁 0 分）则全退 | `adaptive-lifecycle.ts:465-479`，已核实 |
| 引文核验失败补答 | 与答非所问不可区分 | 默认方案不受影响；备选方案必须透传 `clarify_cause` | 已核实 |
| 崩溃重放 | 调用幂等键 PK 去重 | `topic_charge` PK 去重；关闭话题时锁定 consumption 行 | `0037:26`，已核实 |
| “invoke 内部重试” | **不存在**（派发后失败即 unknown） | 无需处理 | `invoke.ts:7,154`，已核实 |
| unknown | 出题 unknown → 整场结束；评分 unknown → unscored | 同上两行 | 已核实 |
| 熔断 / 准入拒绝 | 未派发即拒；半开 route-retry 只在准入阶段，最多 2 次 | 不计；若导致出题失败，按“出题失败” | `invoke.ts:659-714`，已核实 |
| usage 缺失（F15） | 三种口径 | 不影响积分；成本侧统一按上限并打 `usage_missing` | 已核实 |
| 报告重试 | 报告不扣费；但完成时已全额确认（#229） | 不计；完成判据随新方案改为“话题结算” | issues #229，已核实 |
| 开场额度不足 | C 402 / 企业 409（begin 双路分码） | **已裁（裁决②）：仍按 1.00 单位=1 场预留零改**；余额 <1.00 ⇒ C 402 / 企业 409（现状分码保持） | `interview.service.ts:260-268`，已核实 |
| 同键不同 units（#31） | 静默返回旧预留 | 改成报错（409） | `commerce.ts:54-62`，已核实 |
| B 端重开 | 新 interview id → 再预留（B271 后改扣企业桶） | 企业付费已落（B271 片2）+ 剩 application 维度幂等（P4 残面） | `recruiting/recruiter.ts:592-607`，已核实；方案推断 |

---

## 5. 一场面试示例（默认方案，封顶 6 分）【推断】

用户 u1；方案②（1 单位 = 1 场、按比例结算）为例：预留 1.00 单位 = 6 分。

| 步骤 | 事件 | topic_charge | 说明 |
|---|---|---|---|
| begin | reserve(iv1, 1.00) | — | C1 reserved |
| T1 | 主问题 Q1，用户答 | (T1, 1 分, counted) | 决策 pivot 时关闭 T1 |
| T2 | Q2 → 用户答非所问 → 澄清 Q3 → 用户补答 → 系统追问 Q4 → 用户答 | (T2, 1 分, counted) | 澄清和追问都不加分 |
| T3 | Q5 出题时 duplicate_question | (T3, 0, waived, generation_failed) | 整场随之结束 |
| 收尾 | Σ=2 分 | — | confirm 2/6 = 0.33 单位 → `partial_confirmed`，settled = r2(1.00×2/6) = 0.33 |

- 舍入：按比例会产生 0.33 这类值；**单位已裁方案②（裁决②）**——“分”只是展示与比例概念，账本单位仍是场单位，`confirmConsumptionUnits(units)` 按绝对值结算（units = r2(requested × LEAST(Σ,cap)/cap)）；**触发器比对必须用同一公式 `r2(requested × LEAST(Σ,cap)/cap)`**（§6.4·0173），否则触发器会误报【推断，舍入公式已核实 `commerce.ts:183,193`】。

---

## 6. 表 / 迁移 / 函数 / 触发器（草案）【推断】

> 迁移号重排 **0170–0173**（rev1·验证席 INDEX 第七节定谳）：原草案 0152–0155 已被占用——现仓 `0152`×2（`consent_revoke_grant`/`resume_soft_delete_fence`）、`0153_account_deletion_column`、`0154_trial_bucket_grant`（b110 注册赠送）、`0155_recruiter_approval_gate`，现最大 `0169_auth_user_session.sql`（均已核实）。仓内已有重号先例（0143×2/0152×2/0160×2·缺 0164），**勿再添重号**。

### 6.1 0170：题目表补话题
```sql
ALTER TABLE interview_question
  ADD COLUMN topic_id text,
  ADD COLUMN ask_mode text CHECK (ask_mode IN ('pivot','probe','clarify')),
  ADD COLUMN clarify_cause text CHECK (clarify_cause IS NULL OR clarify_cause IN ('non_answer','quote_unverifiable'));
CREATE INDEX ix_iq_topic ON interview_question(owner_user_id, interview_id, topic_id);
```
- `topic_id`：主问题填自己的 question_id，追问和澄清填主问题的。旧行为空 = 不按话题计费。
- `ask_mode`：来自决策 `mode`（`adaptive-interview.ts:90`）或澄清分支（`decide.ts:17-24`）。
- `clarify_cause`：区分用户答非所问和引文核验失败；需要 `assess` 返回一个原因字段（`adaptive-interview-service.ts:551,567-572`）。

### 6.2 0171：消耗归集表（只做成本侧和审计，不参与默认方案定价；§3.13 明细列表数据源之一）
```sql
CREATE TABLE question_usage_ledger (
  owner_user_id text NOT NULL,
  invocation_key text NOT NULL,
  interview_id text NOT NULL,
  question_id text,
  topic_id text,
  operation_id text NOT NULL,
  cause text NOT NULL CHECK (cause IN ('system_ask','system_score','system_plan','retrieval','report',
                                       'generation_failed','unknown','admission_rejected','user_answer')),
  answer_len integer CHECK (answer_len IS NULL OR answer_len >= 0),
  meter_version text,
  input_tokens integer, output_tokens integer, estimate_input_tokens integer,
  usage_source text NOT NULL CHECK (usage_source IN ('provider','estimate','missing','not_applicable')),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (owner_user_id, invocation_key)
);
```
- 相对原稿的更正：删掉 `attempt_no`、`system_retry`、`replay` 和 `billable` 列（不存在自动重试；计费只看 `topic_charge`）。主键与 `ai_model_invocation` 一致，崩溃重放天然去重。
- RLS：ENABLE + FORCE + owner 策略；只授 SELECT、INSERT。

### 6.3 0172：话题计费表与面试计费列（§3.13 明细列表数据源之一）
```sql
ALTER TABLE interview
  ADD COLUMN billing_mode text NOT NULL DEFAULT 'per_session'
    CHECK (billing_mode IN ('per_session','per_topic_capped')),
  ADD COLUMN billing_cap_units numeric(12,2),
  ADD COLUMN billing_rule_version text,
  ADD CONSTRAINT ck_interview_cap CHECK (
    (billing_mode='per_session' AND billing_cap_units IS NULL)
 OR (billing_mode='per_topic_capped' AND billing_cap_units > 0 AND billing_rule_version IS NOT NULL));

CREATE TABLE topic_charge (
  owner_user_id text NOT NULL,
  interview_id text NOT NULL,
  topic_id text NOT NULL,
  answers smallint NOT NULL CHECK (answers >= 0),
  units numeric(12,2) NOT NULL CHECK (units >= 0 AND units <= 3),
  status text NOT NULL CHECK (status IN ('counted','counted_capped','waived')),
  reason text,
  rule_version text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (owner_user_id, interview_id, topic_id),
  CHECK (status = 'counted' OR units = 0)
);
```
- 相对原稿的更正：`billing_cap_units` 原来可为空，而 PostgreSQL 的 `LEAST(x, NULL)` 会忽略 NULL，导致封顶校验静默失效，所以加了 `ck_interview_cap`。`counted_capped`、`waived` 都必须是 0 分。
- `units <= 3` 保留给备选方案；默认方案恒为 1。

### 6.4 0173：改现行触发器函数（不是 0020 的旧函数体；比较式已裁方案②）
```sql
CREATE OR REPLACE FUNCTION public.tf_interview_consumption_terminal_pair(
  p_old public.interview, p_new public.interview) RETURNS void
LANGUAGE plpgsql AS $$
DECLARE cs text; settled numeric; requested numeric; counted numeric;
BEGIN
  IF p_new.status NOT IN ('completed','abandoned','failed') THEN RETURN; END IF;
  SELECT status, units_settled, units_requested INTO cs, settled, requested FROM entitlement_consumption
   WHERE owner_user_id=p_new.owner_user_id AND idempotency_key=p_new.id LIMIT 1;
  IF cs IS NULL THEN RETURN; END IF;
  IF p_new.billing_mode = 'per_session' THEN            -- 0144 原逻辑逐字保留
    IF p_new.status='completed' AND cs <> 'confirmed' THEN
      RAISE EXCEPTION 'invalid_interview_consumption_pair: completed requires confirmed, got %', cs USING ERRCODE='23514';
    END IF;
    IF p_new.status IN ('abandoned','failed') AND cs <> 'released' THEN
      RAISE EXCEPTION 'invalid_interview_consumption_pair: % requires released, got %', p_new.status, cs USING ERRCODE='23514';
    END IF;
    RETURN;
  END IF;
  SELECT COALESCE(SUM(units) FILTER (WHERE status='counted'),0) INTO counted
    FROM topic_charge WHERE owner_user_id=p_new.owner_user_id AND interview_id=p_new.id;
  IF counted = 0 THEN
    IF cs <> 'released' THEN RAISE EXCEPTION 'zero_usage_requires_release' USING ERRCODE='23514'; END IF;
  ELSIF cs NOT IN ('confirmed','partial_confirmed')
    OR settled <> r2(requested * LEAST(counted, p_new.billing_cap_units) / p_new.billing_cap_units) THEN
    RAISE EXCEPTION 'topic_settled_mismatch' USING ERRCODE='23514';
  END IF;
END $$;
```
- 外层 `enforce_interview_consumption_terminal_pair()` 和触发器 `BEFORE INSERT OR UPDATE OF status` 都不用改；failed 早已在 0046 纳入【已核实】。
- 新模式下 failed、abandoned 只要有已计话题就要求已确认：规则变更（失败也收已完成话题的钱）**已裁（裁决③：系统原因提前结束=已完成话题照收）**；若日后要改“failed 一律全退”，在新分支开头加 `IF p_new.status='failed' THEN 要求 released`。
- **比较式已裁方案②（裁决②）**：`settled = r2(requested × LEAST(counted, cap) / cap)`（requested=units_requested·cap=`billing_cap_units`·与 confirm 分账公式同形：`commerce.ts:183,193`·已核实）；应用侧 `confirmConsumptionUnits` 与触发器必须用同一公式，否则误报。
- 要保留 0144 的 `GRANT EXECUTE … TO PUBLIC` 语义（CREATE OR REPLACE 不会改 ACL，已核实 0144 用的就是该签名）。

### 6.5 函数
| 函数 | 作用 | 并发 / 幂等 |
|---|---|---|
| `closeTopic(c, owner, iv, topicId)` | 汇总话题，写 `topic_charge`；按累计判断是否 counted_capped | **先 `SELECT … FROM entitlement_consumption … FOR UPDATE`** 串行化同一场的关闭，防两个话题同时读到“未封顶”；PK 冲突忽略 |
| `confirmConsumptionUnits(c, owner, key, units)` | 按绝对值部分结算；units = 预留额时记 confirmed | 终态幂等；复用大余数法 |
| `completeInterviewAndConfirm` | 新模式下按 `r2(requested × LEAST(Σ,cap)/cap)` 结算（裁决②）；允许 partial_confirmed（现在会抛错） | 同前 |
| `abandonInterviewAndRelease`、`sweepExpiredReservations` | 新模式下 Σ>0 改走部分结算，Σ=0 才 release | 现在 sweep 是一条 UPDATE 直接置 released，要拆分 |
| `reserveEntitlement` | 同键不同 units 报错（#31） | — |
| `recordUsage` | 写 0171 归集行（成本侧；§3.14 语音/RAG 等记账缺口的最低入账面） | PK 冲突忽略 |

### 6.6 接入点
- 决策写 `topic_id/ask_mode`：`packages/ai-graphs/src/adaptive-interview/nodes/decide.ts:17-35`、`generate-question.ts:88-100`。
- 评分透传 `clarify_cause`：`apps/worker/src/adaptive-interview-service.ts:551,567-572`。
- 换话题 / 结束时 `closeTopic`；完成收尾：`apps/worker/src/adaptive-lifecycle.ts:442-488`；对账：`apps/worker/src/commerce-reconcile.ts:39-68`。
- API：begin 预留（双路零改·裁决②）`interview.service.ts:256-268`；事件带 `topicId/topicsCounted`；`GET /interviews/:id/charges`；**`GET /billing/ledger`（+企业维度·§3.13 积分明细列表·升 P1）**。

---

## 7. 改动影响范围（同步见 change-list.csv）

| 类别 | 对象（file:line） | 改动 | 影响 | 破坏兼容 | 回滚 |
|---|---|---|---|---|---|
| 模块 | `packages/db/src/commerce/commerce.ts:43-103,167-249,251-257,286-403,432-500` | 绝对值部分结算；完成允许 partial；放弃和 sweep 按话题结算；#31 | 高 | 是（放弃/走人不再全退） | flag |
| 模块 | `packages/ai-runtime/src/invoke.ts:335-367`、`model-client.ts:662-670`、`rag-cost-governance.ts:44` | F15 统一 usage_missing（不再做 attempt 透出） | 中 | 否 | 代码回退 |
| 迁移 | 0170 `interview_question` 加 topic_id/ask_mode/clarify_cause（`0021:6-22`） | 新列 | 中 | 否 | 列不用 |
| 迁移 | 0171 `question_usage_ledger`（成本侧） | 新表 | 中 | 否 | 停写 |
| 迁移 | 0172 `topic_charge`、interview 计费列 + CHECK | 新表新列，默认 per_session | 中 | 否 | 默认即旧行为 |
| 触发器 | 0173 改 `tf_interview_consumption_terminal_pair`（`0144:365-411`） | 新模式校验（方案②比较式） | 高 | 否（旧分支逐字保留） | 恢复 0144 函数体 |
| worker | `adaptive-interview-service.ts:551,567-572`；`decide.ts:17-35`；`generate-question.ts:14-22,88-100` | clarify_cause、topic、出题失败按话题结算 | 高 | 否（flag） | flag |
| worker | `adaptive-lifecycle.ts:442-488`；`commerce-reconcile.ts:39-68` | closeTopic、收尾、sweep 结算 | 高 | 是 | flag |
| API | `interview.service.ts:256-268`；`packages/contracts/src/index.ts` | 事件字段、话题明细接口、`GET /billing/ledger`（§3.13） | 中 | 否 | 字段忽略 |
| 前端 | `apps/web/app/pricing/page.tsx`、`apps/web/app/billing/actions.ts`、面试页、报告页 | 规则公示、话题计数、明细、双端积分明细页（§3.13） | 高 | 是（对外承诺） | flag + 文案 |
| B 端 | `interview.service.ts:256-268`（企业桶已落·B271 片2）；残面 `recruiting/recruiter.ts:592-607` application 幂等；`adaptive-lifecycle.ts:465-479` 报表 | 企业桶扣费已落；剩 application 维度幂等+话题报表 | 中 | 否（幂等补刀） | 企业 flag |
| 对账 | `commerce.ts:432-500` + 新巡检 settled = r2(requested×LEAST(Σ,cap)/cap)；成本/收入比 | 新巡检 | 高 | 否 | 只告警 |
| 测试 | commerce 单测、触发器测试、`apps/web/e2e-ui/uc018-abandon.spec.ts`（放弃全退断言） | 按 flag 参数化；新增封顶并发、sweep 结算、出题失败结算 | 中 | 是（旧断言） | 参数化 |
| 存量 | `payment.ts:100` paid 桶（1 单位 = 1 场） | **已裁②：不换算（零存量换算·裁决②）** | 高 | 否 | ②零风险 |
| 运营财务客服 | 规则公示、协议、收入确认按话题 | — | 高 | 是 | 公告回退 |

上线顺序：① 只加不改（0170–0172，默认 per_session）→ ② F15 → ③ 影子计量 2 周（只算不扣，看每场话题数分布、计费与成本相关性）→ ④ 0173 上线、巡检告警 → ⑤ 内部账号 → ⑥ 新开场按 5%→20%→50%→100% 灰度，进行中面试不切换 → ⑦ B 端残面单独开关（**原步⑦“存量换算”已删**——裁决②方案②零换算；原步⑧“B 端单独开关”改写为企业桶扣费已落（B271 片2）后的残面刀：application 维度幂等+话题报表）。回滚：关 enabled，新场回到按场；旧分支永远可用。

工作量【推断】：P0 注册赠送 **已删除**（b110 `91c686d9` 已落·0154 trial 桶 1.00 单位/365 天）；P1 话题字段 + clarify_cause + F15 + 积分明细列表（§3.13·升 P1 面）4–7；P2 影子计量 3–4（另 2 周观察）；P3 话题结算、触发器、放弃/sweep/出题失败收口、前端 7–10；P4 B 端残面 2–4（企业付费已落·剩 application 幂等+报表·**由 8–15 下调**）；扩张包 §3.10–§3.12（押题/诊断/OCR 积分制+主动追问入口+深度研究 premium）+6–10 人日入 P3/P4 段；测试文档客服 3–4。C 端合计约 16–23 人日（默认方案去掉了轮数/长度计量和 attempt 落表·P0 已落删除）。

依赖（issues-master，已核实条目存在）：#229（P1 完成即全额确认）、#271（B 端重复扣费——片2 企业桶已落·残面 application 幂等）、#10（unknown 预算冻结）、#26（比例结算是死代码——方案②下转活）、#31、#72（语音记账缺口→§3.14）、F15（=AG-14 同案·刀 B 折叠·billing 只消费其产物）、F16（单次生成失败终止整场）；#228（注册赠送）**已落 b110** 移出依赖；#40（评分卡依赖）**已解除**（score-writer S1/S2 接线）移出。

---

## 8. 产品与公平（复核后）

| 议题 | 结论 | 核实 |
|---|---|---|
| 按轮数收费 | 不推荐作为默认：轮数由系统决定，且会让答得好的人多付 | 机制已核实；观感推断 |
| 系统追问计费上限“≤2 轮” | 约等于不设上限（非核心本来最多 2 次） | 已核实 |
| 按作答长度收费 | 不推荐：直接惩罚认真作答，599/600 字跳档 | 推断 |
| 刷量 | 默认方案下用户无法刷高或刷低单题价格；只能通过跳过拿 0 分（若采纳） | 推断 |
| 来源成本由平台吸收 | 维持：用户控制不了，且按来源收有反向激励 | 机制已核实；动机推断 |
| 封顶 | 必须有；话题数由系统决定（软预算可上调），没有封顶总价不可控 | 已核实 `adaptive-interview.ts:100-102` |
| C 端口径 | 话题 1 分 + 单场封顶 + 系统出错不收 | 推断 |
| B 端口径 | 按场（企业桶·已落），话题计量只做报表；候选人不扣（已成立） | 企业桶已落已核实（B271 片2·begin 双路）；报表为推断 |

竞品（2026-10-12 WebSearch 核实，价格以页面为准）：
- Final Round AI：订阅制，$25/月（年付）、$60/月（季付）、$90/月（月付），含 AI 模拟面试 — https://www.finalroundai.com/blog/final-round-ai-pricing
- Yoodli：免费 5 次；Pro $8/月（年付，每周最多 10 次）；Advanced $20/月不限次；超过 30 秒的练习算 1 次 — https://yoodli.ai/pricing
- EngMock：积分包，1 积分 = 1 场 45/60 分钟面试，约 $1.50–2.00/场 — https://engmock.com/pricing
- InterviewFocus：每场模拟面试固定 100 积分，简历分析 20 积分，月度积分不结转 — https://interviewfocus.com/pricing/individuals/
- 结论：查到的产品都按**场次 / 次数 / 订阅**计费，没有查到按单题交互浮动计价的产品【已核实上述 4 家；“行业普遍如此”为推断】。所以“按话题”已经比竞品细，再按轮数浮动缺少先例。
- “通用 AI 助手的 C 端多按消息条数，token 只用于开发者 API”、“B 端面试 SaaS 多按席位 / 场次 / 年费”：本次未逐一核实【推断】。

一句话测试：“每个话题 1 分，单场最多 N 分；系统出错的话题不收钱。”

---

## 9. 风险与兜底
| 风险 | 兜底 | 核实 |
|---|---|---|
| 话题数被系统拉长 | 单场封顶；影子期观察话题数分布 | 推断 |
| 走人与崩溃无法区分 | 统一按已关闭话题结算；崩溃全退需新判据 | 现状已核实；方案推断 |
| 关闭话题并发越过封顶 | closeTopic 锁 consumption 行；触发器 LEAST 兜底；cap 非空 CHECK | 推断 |
| 结算与明细不一致 | 0173 触发器硬拦（方案②比较式） | 推断 |
| 舍入不一致 | 统一比较式 `r2(requested×LEAST(Σ,cap)/cap)`（已裁②·应用与触发器同式） | 舍入逻辑已核实 |
| 单位口径混乱 | **已裁②：1 单位=1 场·按比例结算·零存量换算** | 已裁（裁决②） |
| 收入波动 | 影子期；封顶 | 推断 |
| 总兜底 | 关开关回按场 | 推断 |

---

## 10. 复核纠错清单（相对 v2 复核前版本）
| # | 原结论 | 复核结论 | 证据 | 判定 |
|---|---|---|---|---|
| 1 | invoke 内部重试产生消耗，用 attempt_no>0 剔除 | 不存在自动重试；attempt 是 0/1 阶段标记 | `invoke.ts:7,154,581-930`；`adaptive-interview-service.ts:86-91` | 推翻（已核实） |
| 2 | 示例 T2“超时后内部重试成功” | 超时 = unknown → 出题失败 → 整场结束 | 同上；`generate-question.ts:14-22` | 推翻（已核实） |
| 3 | 出题失败 → 该话题 waived，面试继续 | 整场结束；现状按完成全额扣 | `generate-question.ts:66-80`；`adaptive-lifecycle.ts:358-365` | 推翻（已核实） |
| 4 | 0155 改 0020 触发器并“扩到 failed” | failed 已在 0046 纳入；现行函数在 0144 的 `tf_` | `0046:144-173`；`0144:363-402` | 推翻（已核实） |
| 5 | 租约过期 = 崩溃 → 全退 | 也代表用户走人；全退会漏扣 | `commerce-reconcile.ts:29-35`；`interview-consumer.ts:224,233` | 推翻（已核实） |
| 6 | 按用户自己造成的交互量（轮数）定档 | 轮数由系统决定；答得好被深挖 | `adaptive-interview.ts:19,48,140,144,297-306` | 推翻（已核实），改为话题固定 1 分 |
| 7 | 系统追问计费最多 2 轮可避免风险 B | 非核心本来最多 2 次，几乎不起作用 | `adaptive-interview.ts:19,144` | 推翻（已核实） |
| 8 | 故意一句话作答可少付 | 非作答触发澄清反而 +1 轮；跳过才少 | `adaptive-interview.ts:297-301` | 更正（已核实） |
| 9 | 引文核验失败补答可识别为 system_clarify | 与答非所问不可区分，需透传原因 | `adaptive-interview-service.ts:219-220` | 更正（已核实） |
| 10 | `completeInterviewAndConfirm` 新模式“同前” | 现在遇 partial 抛错，必须改 | `commerce.ts:165-169` | 更正（已核实） |
| 11 | `billing_cap_units` 可空 | LEAST 忽略 NULL，封顶校验失效；加 CHECK | PG 语义；草案 SQL | 更正（推断，未起库） |
| 12 | closeTopic 只靠 PK 幂等 | 需锁 consumption 行防并发越过封顶 | `commerce.ts:102`（同类 FOR UPDATE 模式） | 补充（推断） |
| 13 | 中文高估 2–3 倍 | 方向对，倍数未核实 | `model-client.ts:170-178` | 降为推断 |
| 14 | 行号 | `:96-109`→`97-110`；`:131-136`→`137-142`；`:139`→`145`；`:154-158`→`155-159`；`:183-191`→`167-193`；`0001:109-124`→`109-122`；F15 `model-client.ts:463-464` 位于 G7 收尾分支 `455-469`；`0057:63` 是 `ai_cost_reservation` 而非 invocation | 逐行回读 | 更正（已核实） |
| 15 | B 端“重开不再新预留” | 现状会再扣（新 interview id）；零有效分也扣 | `recruiter.ts:443-448`；`adaptive-lifecycle.ts:361-366` | 更正：这是方案，不是现状（已核实） |
| 16 | 竞品做法为行业常识 | 4 家已联网核实，均按场次/订阅 | §8 链接 | 升为已核实（部分） |
| 17 | RAG 不是便宜路径、来源不计费 | 维持 | `adaptive-interview-service.ts:118-162`；`crag.ts:57-79` | 维持（已核实） |
| 18 | 出题键只有 turn、评分键有 question_id、表无面试列 | 维持；另确认澄清/追问都发新 question_id | `generate-question.ts:88-92` | 维持（已核实） |
| 19 | F15 三种口径 | 维持，另补 RAG 16,000 | `invoke.ts:334-343`；`model-client.ts:463-464`；`rag-cost-governance.ts:44` | 维持（已核实） |
| 20 | 单位：开场预留 10 分 | 现 1 单位 = 1 场，直接预留 10 会让存量用户开不了场 | `interview.service.ts:304`；`payment.ts:85` | 补充（已核实现状） |

---

## 11. 待拍板（rev1 三态化：已裁 / 已答 / 仍开放）

| # | 项 | 状态 | 落值 / 依据 |
|---|---|---|---|
| 1 | 默认方案（话题 1 分·追问澄清不加分）vs 轮数浮动 | **已裁**（裁决①） | 采纳默认方案；v2 备选已废（§3.5 仅存档） |
| 2 | 话题定义（主问题 + 同能力追问 + 澄清） | **仍开放** | §3.1 待用户认可（唯一未裁产品项） |
| 3 | 单场封顶 | **已裁初值**（裁决①） | 初值 6·影子期复核终值（唯一残面开放点） |
| 4 | 单位：①换算 vs ②按比例 | **已裁**（裁决②） | 方案②按比例·`r2(requested×LEAST(Σ,cap)/cap)`·零存量换算（步⑦删） |
| 5 | 主动跳过话题收否 | **已裁**（裁决③） | 0 分 |
| 6 | 系统原因提前结束照收 vs 全退 | **已裁**（裁决③） | 已完成话题照收 |
| 7 | 放弃/走人已关闭话题照收 | **已裁**（裁决③） | 已关闭话题照收·进行中不收 |
| 8 | 崩溃 vs 走人区分 | **已裁**（裁决③） | 不区分·统一按已关闭话题结算·不新增判据（崩溃判据归 AG 失败语义轨另议） |
| 9 | 计量缺失 0 分/1 分 | **已裁**（裁决③） | 0 分（不确定就不收） |
| 10 | 额外可计费交互 | **已裁**（裁决④） | 新增“用户主动追问”计费入口（§3.11） |
| 11 | 注册赠送 | **已答**（现状落地） | b110 `91c686d9` 已落：trial 1.00 单位/365 天·每用户一桶（0154·`23_api_gateway.sql:36-43`） |
| 12 | B 端只按场+企业付+application 幂等 | **已答**（现状落地） | B271 片2 已落：企业桶+begin 双路+409/402 分码（§3.8）；残面 application 幂等→P4 |
| 13 | 押题/诊断/OCR 积分制 | **已裁**（裁决④） | 同步改积分制（§3.10） |
| 14 | 深度研究面试增值 | **已裁**（裁决④） | 纳入 premium 模式（§3.12） |
| 15 | 来源不计价 | **已裁**（裁决④维持） | 平台吸收维持（§3.7/§3.14） |

- 三态口径：**已裁**=用户 2026-10-12 裁决①–④（LANDING-INDEX 第十二/十三节）；**已答**=现状落地先答（b110/B271/AG）；**仍开放**=待用户。全模型调用面覆盖原则（用户令）见 §3.14。

---

## 12. 关键文件索引
- 收入侧：`packages/db/src/commerce/commerce.ts`、`packages/db/src/commerce/payment.ts`、`packages/db/migrations/0001_baseline.sql`、`0020`/`0046`/`0144`、`apps/worker/src/commerce-reconcile.ts`、`apps/worker/src/adaptive-lifecycle.ts`、`apps/api/src/modules/interview/interview.service.ts`
- 成本侧：`0037`、`0085`、`0119`、`packages/ai-runtime/src/invoke.ts`、`model-client.ts`、`model-operation-registry.ts`
- 出题与决策：`apps/worker/src/adaptive-interview-service.ts`、`apps/worker/src/interview-service.ts`、`packages/domain/src/adaptive-interview.ts`、`packages/domain/src/crag.ts`、`packages/ai-graphs/src/adaptive-interview/nodes/*.ts`
- B 端：`packages/db/src/recruiting/recruiter.ts`、`apps/api/src/modules/recruiter/recruiter.service.ts`

---

## 13. 无法核实清单
1. 各出题路径的真实 token 量级和相对成本（需要生产 usage 数据；代码无固定上限）。
2. utf8-bytes 对中文的高估倍数（取决于供应商分词器）。
3. 新 SQL（0170–0173）能否在真实库上通过迁移和触发器测试（本次只读，未起库）。
4. 每场面试的典型话题数分布、封顶取值是否合适（需影子期数据）。
5. 用户对各方案的接受度、投诉率（需用户研究）。
6. 通用 AI 助手 C 端按消息计费、B 端面试 SaaS 按席位/场次计费的“行业普遍做法”（只核了 4 家 C 端面试产品）。
7. 方案对“消费者知情权”等合规要求的满足程度（非法律意见）。
8. issues-master 中 #229、#271 等条目描述的线上实际发生频次。

---

## 14. rev1 附记（2026-10-12·rev 席）
- 本 rev 对齐现 tip `133acba6`（LANDING-INDEX 第七节验证定谳 + 第十二/十三节用户裁决，三份裁决 commit `a62e8fa3`/`b24f3f4e`/`133acba6` 全数落卷）。蓝本三层（INDEX 七至十三节 / issues-final AG-14=F15 / §11 原 15 项）全精读后动笔。
- 六任务落点：①B 端章改写（§3.8 全节重写·风险 K·§7 B 端/P4 行·步⑧→⑦；企业付费 B271 片2 已落·held 守卫 i2b `d4e51105`·P0 注册赠送已落 b110 `91c686d9` 删除·人日下调）；②迁移草案全文重排 0170–0173（§6 四件·0152–0155 占用已核实）；③五条承重 pin 重锚：begin `interview.service.ts:256-268` / 收尾 `adaptive-lifecycle.ts:442-488` / commerce `:251-257` / recruiting `recruiter.ts:592-607` / #31 `:54-62`（开工 tip 实测·零翻案·`commerce.ts`/`recruiter.ts` 移径 `commerce/`、`recruiting/` 已随锚更正）；④裁决落卷（§3.2/§3.3/§4 待拍板列改已裁·§5/§6.4 比较式统一 `r2(requested×LEAST(Σ,cap)/cap)`·步⑦删除·§11 三态表）；⑤扩张包 §3.10–§3.12 + 全模型调用面覆盖表 §3.14（registry 16 操作逐一给处理·零暗面）；⑥RAG 分账原则+积分明细列表 §3.13（升 P1·双端逐笔·三账本·`GET /billing/ledger`·吸收 v1 F11）。
- 未动面：§10 复核纠错清单系对 v2 复核前版本的历史审计记录，零触（pins 零翻）；§3.6–§3.7/§8 竞品等快照基线（`2fab7946`）锚点维持原状（其结论经 INDEX 第八节审计维持）；Non-claims 三标注体系（已核实/推断/无法核实）全程维持。
- 仍开放面：话题定义认可（§11-2）+ 封顶终值（影子期）；两者外全部 15 项待拍板已收口为已裁/已答。

---

## 15. 审计复核关闭注记（2026-10-17·BF 设计决策条目·append-only）

> 外部全量审计（基准 `7d71a64`）§4b「计费文档：§11 待拍板+需先改项」7 条 BF 设计决策条目（BF-F/H/I/J/139/220/422·外审卷面载体=`README.md` §4b 表与 `dispatch/mw-core.md` §一「已修可关闭」）经三席独立复核 VERDICT=CONFIRMED（已修）；本节为计费文档域仓内台账收口注记面——每条一行 append·形沿 `ai-docs/delivery/ai-capability-review/issues-final.md` :532 AG-43 翻面注记先例·本节外零字节改动。

- 【BF-F 审计复核关闭注记 2026-10-17·三席独立复核 VERDICT=CONFIRMED（已修）·证据：packages/ai-graphs/src/adaptive-interview/nodes/generate-question.ts:96-117 重试族（QUESTION_GENERATION_REROLL_FAMILY 帽内换 competency 顺延·不 failClosed 整场）+failClosed 仅全序耗尽真终场（:117）+apps/worker/src/adaptive-lifecycle.ts failInterviewAndRelease 调用（:75/:648 亲证·释放预留绝不全额扣·本体在 packages/db/src/commerce/commerce.ts（adaptive-lifecycle.ts :6 import·:75/:648 系 adaptive-lifecycle.ts 调用点）；外审卷面指认 :597-599（基线 `7d71a64` 补偿预留块）·现行漂至 :646-648（failInterviewAndRelease 调用 :648·另 :75 臂）·机制结论绝不全额扣维持不变）·审计 mw-core 一节 2026-10-17 复核确认关闭】
- 【BF-H 审计复核关闭注记 2026-10-17·三席独立复核 VERDICT=CONFIRMED（已修）·证据：packages/ai-graphs/src/adaptive-interview/state.ts:78/:121/:198 `clarifyCause?: 'non_answer' | 'quote_unverifiable'` 三处拆分透传（引文核验失败与答非所问不再并为不可分）·审计 mw-core 一节 2026-10-17 复核确认关闭】
- 【BF-I 审计复核关闭注记 2026-10-17·三席独立复核 VERDICT=CONFIRMED（已修）·证据：packages/db/migrations/0173_tf_interview_consumption_terminal_pair.sql:50-72 触发器对（per_session 分支原逻辑逐字保留+per_topic 分支 partial 允许/zero_usage_requires_release/topic_settled_mismatch）+packages/db/src/commerce/commerce.ts:343-346 应用侧对偶注·审计 mw-core 一节 2026-10-17 复核确认关闭】
- 【BF-J 审计复核关闭注记 2026-10-17·三席独立复核 VERDICT=CONFIRMED（已修）·证据：packages/db/migrations/0172_topic_charge.sql:10 场单位口径（「单位恒场单位·方案②零存量换算·裁决②」卷头注）+packages/db/src/commerce/commerce.ts:319 `r2(requested * Math.min(sum, cap) / cap)` 同口径实现·审计 mw-core 一节 2026-10-17 复核确认关闭】
- 【BF-139 审计复核关闭注记 2026-10-17·三席独立复核 VERDICT=CONFIRMED（已修）·证据：packages/db/src/commerce/commerce.ts:236-269 `confirmConsumptionUnits` 按绝对值结算（幂等 noop 不重扣+:269 `confirmed`/`partial_confirmed` 终态判定）+尾桶吸收差额分账·审计 mw-core 一节 2026-10-17 复核确认关闭】
- 【BF-220 审计复核关闭注记 2026-10-17·三席独立复核 VERDICT=CONFIRMED（已修）·证据：packages/db/migrations/0172_topic_charge.sql:36-37 `ck_interview_cap` 双谓词（per_session ⇒ cap NULL ∨ per_topic_capped ⇒ cap>0 且 rule_version 非空·NULL 封顶失效面收口）·审计 mw-core 一节 2026-10-17 复核确认关闭】
- 【BF-422 审计复核关闭注记 2026-10-17·三席独立复核 VERDICT=CONFIRMED（已修）·证据：packages/db/src/commerce/commerce.ts:341-373 `completeInterviewAndConfirm` 新模式接受 `partial_confirmed`（:343-346 billing P3 修法⑤注·partial 拒绝面仅 per_session 分支保留）+:372-373 per_session 分支保留 `interview_settlement_not_fully_confirmed` 抛错·审计 mw-core 一节 2026-10-17 复核确认关闭】
