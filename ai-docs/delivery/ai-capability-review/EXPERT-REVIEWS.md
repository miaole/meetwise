# AG 复核 · 双专家评审意见书合成卷（落地 2026-10-12·tip f547444e 对照）

> 两席专家（A=编排运行时/失败语义/LangGraph·B=成本/计费/LLM 工程）对 final 三件的独立评审。双席深验证（另两席）已定谳：七条 P1 六仍成立+AG-02 部分缓解·文档零误。本卷=两份意见书的**全量约束合成**（定级修正/事故级修法勘误/新发现/刀计划）·为修复立项的唯一权威蓝本补充。

## 一、定级修正（两位专家合议）

| 条 | 原级 | 专家裁定 | 依据 |
|---|---|---|---|
| AG-01 | P1 | **P1 维持且文档说保守了** | 并发 4 与熔断均**全平台跨用户跨副本**（0120 槽位 PK 无 owner·inflight 仅进程本地·interview-dispatch-fairness.ts:10-13）——中等并发下必然事件非推断 |
| AG-07 | P1 | **降 P2**（A 席） | 运维定时炸弹非用户面急性缺陷·可配置降频即愈·文档 Top10 自己排第 7 与 P1 标签矛盾 |
| AG-10 | P2 | 维持 P2（borderline P1） | B 端 bound 走 markApplicationNoEligibleScore 可重试终态·仅 C 端 unbound 受害（lifecycle :359-372） |
| AG-27 | P3 | 恰当 | compile 不解构 recursionLimit·默认 25·当前单段 ≤5 superstep |

## 二、开工前必须勘误的三处事故级修法修正（blocking）

1. **EG-A1（报告 attempt 源·AG-03 刀 blocking）**：`requeueReportForManualRetry` 把 `ai_report.attempts` 重置 0（report.ts:59-63·#229 D2 已决语义）——若 `:report:a${n}` 键的 n 取自该列，手动重试后 n 归零→同键同 digest 命中旧 failed 行→0130:179-180 重放失败→**AG-03 换形式原样复现**。修法：attempt 源必须单调（独立派发序号列或入队探 max 后缀）·manual retry 只重置 job 层预算。
2. **requeue 上限执行点缺失（AG-04 刀 blocking）**：`attempts` 只在 claim 自增（interview-jobs.ts:123）·上限判定仅覆盖 running+expired（:128/:250-253）·**queued 零闸**——照文档原文实现=5s 一拍无界热循环。修法三件同刀：①requeue 调用点判 attempts≥MAX→markJobFailed+terminalize；②claim queued 谓词加闸或 reaper 加 queued 超限扫（二选一）；③`next_attempt_at` 列（#4）升**硬依赖**·报告队列有全套范本（report.ts:53/:71-84·2^n 封顶 300s+quarantined+reason `max_attempts_exceeded`）·新终态 reason=`retry_exhausted` 入 terminalizeUnsettledInterview 事件分诊。
3. **重试预留放大（AG-02/03 刀约束）**：每次重试各冻结一份静态 max 预留（0088 等值触发器）——上限必须设且与 AG-11 预留改革联动·否则 3 连重试×64k 自己撞 budget_exhausted 回流 AG-01。

## 三、AG-11 修法事故修正（B 席·照原文执行会出事故）

被两条账本不变量挡死：①0036 `ai_cost_settle_text` 的 `actual>reserved` 异常→估算误差变 AG-06 式幽灵预留（比现状更糟）；②0083:44-58 重放 binding_mismatch。且 AG-12 是前置（byteEstimate 现状下 CJK 长输入 min=max 零改善）。正确形状=**三件套+补收**：
- 新迁移 `CREATE OR REPLACE FUNCTION ai_model_invocation_state_guard()` 逐字镜像 0088 仅 :162 等值谓词改 `≤`（触发器自动生效）
- settle 放宽为 `actual ≤ header max`·超额部分行内扩并打 `overage` 标记·预算月检查只告警不拒绝（钱已花·拒绝搁浅账本）
- 预留传参改 `LEAST(max, refine(estimate))`·估算器版本+因子版本随 claim 冻结（防重放漂移）·parity-b2 静态钉需同批更新

## 四、统一结算状态机（B 席·AG-06 真正代码面）

```
refused（准入/预留/prepare 拒绝）→ 零外呼零钱·breaker no_signal·claim 释放可重试
sent ─┬─ settled          200+usage 有效+输出合法：钱=实际·breaker success
      ├─ settled_failed   200+usage 有效+确定性输出失败(JSON/schema/business/截断)：钱=实际·breaker success·允许换 revision 重试
      └── unknown         仅网络层不确定：钱=冻结·breaker failure·进对账队列
```
- model-client outcome 现只有 `known_not_executed|unknown`·**缺 known_executed**——JSON.parse 抛错的 catch（:471-473→现 :688-690）必须把已到手 usage 带出（管道改造点=dispatchOnce 返回与 parse 之间）·截断补读 finish_reason==='length'·usage 缺失归并既有 provider_usage_invalid 不新造语义
- **invoke 成功相位已有完全同形先例**（schema_validation_failed 路径：settle 真实 token+breaker success）——AG-06 修法本质是路由接线非新机制·与「绝不重复花钱」pins 零张力且消除幽灵预留
- AG-14 折叠进解析层：usage 缺失/字段缺失统一 usage_missing 按上限打标·绝不按 0·打标行被校准配对剔除（口径 1 现状会污染 AG-12 因子=max/estimate 假样本）

## 五、invoke(null) 续跑四边界（A 席·1.4.7 dist 逐行验证）

①全新 thread 上 invoke(null) 抛 EmptyInputError——必须先 getState 判非空（「先看 snap.next」已含）；②基线 `snap = alreadyApplied ? before : …` 必须改为**续跑后重读**（否则 next/done/投影用陈旧快照）；③守卫用现成 pendingQuestion()（lifecycle :42-46）；④残余窗口如实披露：崩溃在 provider 调用**期间**→invocation 已 dispatching→120s 后 reconciler 转 unknown（never retries）→续跑拿到确定性 unavailable 快速终态——**本修法把 30 分钟挂死变确定性失败、把派发前窗口变真正续跑**·是正确进步非全窗口复活·后者恰是 pins 要求的行为。

## 六、专家新发现（九条 EG）

| 编号 | 级 | 域 | 摘要 |
|---|---|---|---|
| EG-A1 | P2 | 编排 | 报告手动重试 attempts 重置击穿 :a{n} 键（见二-1） |
| EG-A2 | P2 | 编排 | queued 路径无 attempts 终态（见二-2·AG-04 刀验收项） |
| EG-A3 | P3 | 运维 | 滚动发布 30s grace vs 全 owner 枚举 tick→SIGKILL→120s 租约红rive·runbook 明示排空等待 |
| EG-A4 | P3 | 参数 | admission 槽租约 60s 短于执行超时→长生成期瞬时超卖·AG-01 排队实现不得以槽租约为存活真相 |
| EG-B1 | P2 | 成本 | **unknown 预留零清算出口**——比 AG-14 更根本的账本不可信源·修法=unknown ageing 对账器（N 天按上限结算打 audit reason）与状态机同批 |
| EG-B2 | P2 | 成本 | `ai_cost_actual_exceeds_reservation` 是所有估算修法共用地雷（见三） |
| EG-B3 | P3 | 成本 | ai_model_fee_ledger best-effort 写+零读取+零对账——补 diff 对账或明示放弃钱职责 |
| EG-B4 | P3 | 成本 | RAG embedding 走旧 reserveAiCost（latest-price·无 revision 绑定）与 0083 原则双轨 |
| EG-B5 | P3 | 成本 | fast/主模型共享 budget scope+admission 键——主档打满时轻任务同拒·fast 无独立护栏 |

## 七、合并修复刀计划（两专家合议·全协议 REQUEST→双审→EXEC→post-prove→nail）

**失败语义轨（A 席六刀·依赖序）**：
- **刀 A**：AG-05+AG-26+确定性 proof（lifecycle 续跑+getState 重读+MemorySaver 注入崩溃）——零账本触面·最小风险·建立 invoke(null) proof 模板
- **刀 B**：AG-06（model-client 分类+接线既有 settled-failed 臂·usage 带出 catch·finish_reason）——先于一切重试刀（否则重试风暴搅浑验证窗口）
- **刀 C**：AG-04+#4+EG-A2（next_attempt_at 迁移照报告队列形制+consumer errCode 白名单分类+queued 超限终态 retry_exhausted）
- **刀 D**：AG-01（准入拒绝去终态化：预 claim 准入或 refusal 释放 claim·0130:203-215 expired-claimed 重领有现成落点）——骑刀 C 骨架
- **刀 E**：AG-03+EG-A1（报告单调派发序号+:a{n} 键/revision+手动重试 proof）
- **刀 F**：AG-02 残面（schema/critique/business 失败有界 re-roll·复用 62747d74 参数化骨架·耗尽换 competency 不终场）——骑刀 B+预留上限

**成本轨（B 席六步）**：①AG-07 止血开关（env·60s 硬编码需发版）∥#48 cached_tokens 观测（区分字段缺席≠零）→②AG-07 迁移三件套（观测表去重+PK 去 batch·配对/枚举加窗+水位线·因子 max(old,增量) 合并保上界）+90 天保留期→③AG-12 CJK 加权估算器（claim 冻结参数）→④AG-11 三件套+补收（EG-B2 一并）→⑤AG-08 熔断键按端点∥→⑥视③数据定回灌/显式缓存（后者前置=改 nonce 围栏渲染）。

**AG-15** 卡死检测=刀 A 伴行观测或独立小刀·**AG-16** proof 摊进各刀（每刀自带确定性 proof 系仓内纪律）。

**跨轨硬约束**：AG-10 守卫（eligible=0 不入 doomed report）**必须与刀 E 的重试开关同批或先行**——否则 doomed report 从烧一次变每次真烧。

**缓存结论补强（B 席）**：8 前缀=全部 service（REGISTRY 恰 8·生产全单轮）·renderPrompt 的 nonce 数据围栏在 user 首 token 分叉·**机械封死一切未来前缀缓存**——显式缓存前置=改渲染结构（固定围栏名/数据进 system）。DeepSeek 侧先观测正确·补字段缺席≠零细节。

## 八、意见书总判合议

- 编排域：文档可信度**高·可直接作落地蓝本底稿**·零机制性错误·两关键推断（换键连 revision·invoke(null) 语义）经 dist 逐行验证+在产刀实证（62747d74 跑真迁移真隔离 PG）。
- 成本域：17 条逐条回码全成立·定级零翻案（除 AG-07 见一）·修法两处事故级修正（三/四）。
- 账本工程总评（B 席）：claim 冻结/价格快照/状态机触发器骨架罕见严谨·系统性盲区三处=估算与结算不变量从未对齐（EG-B2）·unknown 有入口无出口（EG-B1）·第二钱账本无对账（EG-B3）——修此三条比修任何单条 P2 更提升账本可信度。
