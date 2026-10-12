# Meetwise AI/Agent 能力复核 · 统一问题清单（issues-final）

- 代码基线：`<外部只读快照>/meetwise-latest`（落地形式调整·原文本机快照径），commit `2fab7946`，只读复核，没有运行代码。
- 复核日期：2026-10-12（Asia/Shanghai）。
- 新增问题共 38 条（AG-01–AG-38）：P0 0 / P1 7 / P2 9 / P3 22。另有 18 个聚类已在产品审计总表中，只引用编号，不计入新增（见文末）。
- 与 `issues-final.csv` 一一对应（同一份数据源生成）。“交叉印证路数”= 5 份原始报告中独立发现该问题的报告数；本次补盲新发现的记为 0。
- 维度取值：RAG / 记忆 / 工具 / Prompt / 缓存 / 上下文 / 编排运行时 / 产品契合 / 成本。

## 总览

| 编号 | 严重度 | 维度 | 标题 | 路数 | 关联总表 |
|---|---|---|---|---|---|
| AG-01 | P1 | 编排运行时 | 派发前准入拒绝（熔断打开/并发槽满/预算耗尽）被写成固定幂等键的 failed 终态，30 秒的瞬时熔断会永久杀死在途面试与报告 | 0 | #10、#4、#116 |
| AG-02 | P1 | 产品契合 | 单次出题失败（schema/业务校验/critique 不过/供应商 unknown）或跨场撞题，都会让整场面试提前结束；没有重试和换题，而且按现有账本设计“换个键重试”也会被拒 | 3 | #44、#10 |
| AG-03 | P1 | 编排运行时 | 报告幂等键固定为 `${interviewId}:report`，账本对 failed/unknown 做终态重放，所以自动重试和手动重试都不会再调用模型，只会把同一个失败重放到隔离 | 3 | #229、#20、#10 |
| AG-04 | P1 | 编排运行时 | 图运行中的任何异常（DB 超时、checkpoint 写失败、瞬时网络错误）都会被当成终态：面试失败并退款。节点没有 retryPolicy，也不区分瞬时和确定性错误 | 2 | #4 |
| AG-05 | P1 | 编排运行时 | “评分已写入 checkpoint、出题还没完成”时 worker 崩溃，重试会走 alreadyApplied 分支直接跳过 invoke，图永远不会推进到下一题 | 2 | #2、#8 |
| AG-06 | P1 | 成本 | 模型返回非法 JSON、空 content，或被 max_tokens 截断时，结果一律记为 transient/unknown：预算冻结在预留态，并且计入熔断失败 | 2 | #10 |
| AG-07 | P1 | 成本 | 用量校准对账每小时把全部历史调用重新写一遍观测行，每 60 秒还要对所有曾经调用过的 owner 做一次全量扫描；算出的因子又没有回灌（见 AG-12） | 1 | — |
| AG-08 | P2 | 编排运行时 | 共享准入/熔断键在注册表里写死为 dashscope-main/cn-beijing，不随实际端点（默认 DeepSeek）变化。主备共用一套熔断和并发 4；claim 之后的 failover 也会因 cost policy 不同被拒，备用端点基本用不上 | 1 | — |
| AG-09 | P2 | 编排运行时 | 重放时 request digest 不稳定（RAG/web 素材、prompt 文本、价格版本都进了 digest），同一个键遇到不同 digest 会直接返回 idempotency_key_payload_mismatch 终态，把可恢复的崩溃变成整场失败 | 2 | #7 |
| AG-10 | P2 | 产品契合 | C 端面试如果全部跳过或 unresolved，仍会全额确认扣费并入队报告，而报告因为没有分数必然失败，重试多少次都一样 | 1 | #229、#20 |
| AG-11 | P2 | 成本 | 成本预留按每个端点的静态 MAX_INPUT_TOKENS 预留，而不是用派发前估算；DB 触发器还强制“预留量 = 上限”，结构上改不了 | 1 | #116、#10 |
| AG-12 | P2 | 上下文 | token 估算器 utf8-bytes-v1 对中文高估约 3.7 倍（实测）；校准因子算出来了，但生产路径从不回灌到 costPolicy | 2 | — |
| AG-13 | P2 | RAG | CRAG 直接用原始 cosine（1−distance）配合未校准的固定阈值 0.7/0.3/0.5，查询串里还拼了“难度N”；中间档会额外触发 web 或深检索 | 2 | #79、#77、#80、#38 |
| AG-14 | P2 | 成本 | usage 结算口径不一致：usage 整体缺失时按上限多记，usage 存在但缺字段时按 0 少记；RAG embedding 没有 usage 时按 16000 token 结算 | 1 | #49 |
| AG-15 | P2 | 编排运行时 | 图运行时可观测性不足：没有“thread 停在非 interrupt、非 END 节点”的卡死检测；ai_graph_run 没有 current_node/last_error/checkpoint_id | 1 | #8 |
| AG-16 | P2 | 编排运行时 | 上述 P1 运行时故障路径都没有确定性 proof：eval 后崩溃、节点瞬时异常、报告重试是否真的再调模型、准入拒绝后重试、recursionLimit 是否生效、旧 checkpoint resume | 1 | #98、#99 |
| AG-17 | P3 | Prompt | 结构化输出只用 response_format=json_object，schema 只写在 prompt 里；schema 失败不重试但照常计费；span 名 schema_retry 暗示有重试，实际没有 | 2 | — |
| AG-18 | P3 | Prompt | 采样温度：出题、OCR、路由分类都没设温度（用供应商默认），路由分类是约束性任务却没钉低温；MODEL_EVAL_TEMPERATURE 填了非法值会变成 NaN，序列化后是 temperature:null | 2 | — |
| AG-19 | P3 | Prompt | prompt 版本没有落库也没有打点（注释称落 ai_prompt_versions，但这张表没有写入方）；无法按版本归因成本和质量 | 1 | #14 |
| AG-20 | P3 | 上下文 | 上下文工程与记忆治理原语（planDispatchBudget 组件裁剪、CTX-05 压缩、MEM-02/03 摘要、MEM-07 围栏、MEM-09 生命周期、MEM-11/14 召回）都只被 index 导出和 proof 引用，生产派发链路零调用 | 2 | #51、#217 |
| AG-21 | P3 | 上下文 | 截断与预算两套口径：截断按 UTF-16 码元（2 万/1.2 万/1.6 万/8 千），预算按 UTF-8 字节；RAG 素材有 420→600/1600→8000 三层截断 | 1 | — |
| AG-22 | P3 | 成本 | 约束性短任务（路由分类、押题、诊断、报告）都走主力模型；fast 模型默认名 qwen-turbo、主模型默认名 qwen-plus，而默认端点 profile 是 DeepSeek，没有“profile × 模型名”的兼容校验 | 1 | #91 |
| AG-23 | P3 | 缓存 | 生产 enforce 模式下，RAG 查询 embedding 绕过进程内缓存（作者有意为之，以免缓存命中时重复预留），而可枚举的“能力×难度”查询串每次都要付费 embed | 1 | #171 |
| AG-24 | P3 | 成本 | 成本与观测小项汇总：Langfuse 的 model 字段填的是 service 名、没有 cached 和成本；RAG 旧预留函数不绑定价格 revision；G7 回退估算对图片数组取 .length；进程内限流/熔断残留 | 1 | #72、#172、#210 |
| AG-25 | P3 | 编排运行时 | genQuestion 重放时，节点内的非模型副作用（本地 ANN、web 或深检索外呼、进度事件、wasAsked 查询）会重新执行 | 1 | #165 |
| AG-26 | P3 | 编排运行时 | start 重试在没有 pending 时走 invoke({})，非 null 输入会从 START 重新跑：plan 节点用 initMind 把 turn 归零，而 transcript 保留 | 2 | — |
| AG-27 | P3 | 编排运行时 | recursionLimit 写在 compile() 上，LangGraph 1.4.7 会静默忽略，实际生效的是默认值 25；当前单段 invoke 不超过约 5 步，暂时安全 | 2 | — |
| AG-28 | P3 | 编排运行时 | 迟到的 job 会让已终止的 ai_graph_run“复活”（acquire 不检查状态，直接置 active）；放弃之后 queued 的 job 不会被取消，答案 claim 也不检查面试状态 | 1 | #8、#1、#12 |
| AG-29 | P3 | 编排运行时 | session 级 advisory lock 解锁失败会被 catch 吞掉，连接带着锁回到共享池；queued job 被反复 requeue 时没有 attempts 上限 | 2 | #9、#4 |
| AG-30 | P3 | 编排运行时 | checkpoint 永不清理：transcript reducer 是 concat，每轮整块写新的 blob 版本；终态面试的 checkpoint 只有隐私擦除才会删除 | 2 | #8 |
| AG-31 | P3 | 编排运行时 | 图版本没有持久化标记（release 只出现在 observer 里），旧 checkpoint 没有兼容闸或迁移函数 | 2 | — |
| AG-32 | P3 | 编排运行时 | interrupt 输入一旦非法就结束整场；语音预览路径 voice-turn.ts 用原始转写字符串 resume，与 {answerId} 契约不兼容；voice-adaptive.proof 用假 submit(string) 跑绿，掩盖了契约差异 | 1 | #69、#73 |
| AG-33 | P3 | 编排运行时 | PrincipalBoundCheckpointPool 每次 saver 查询都要额外做 4 次 SET + 4 次清理，共 8 次往返 | 1 | — |
| AG-34 | P3 | 编排运行时 | 每个在飞 job 在整个 invoke 期间（几十秒）都独占一条锁连接，投影和心跳还要从同一个池取连接 | 2 | #9 |
| AG-35 | P3 | 编排运行时 | 遗留 API 仍然导出：buildMockInterviewGraph 会把原始答案写进 state，buildMockInterviewRunner 会调用 cp.setup()（DDL），db.acquireLease/releaseLease 按 thread_id 更新、不带 graph_name | 2 | #170 |
| AG-36 | P3 | 编排运行时 | packages/db 直接钉死 @langchain/langgraph-checkpoint 1.1.3，不走 catalog；0043 手抄 vendor migrations，运行时没有版本自检 | 1 | — |
| AG-37 | P3 | RAG | 检索侧的 weighted-deficit 每个 job 都从 0 开始，而一个 job 只出一题，所以多叶子岗位的检索恒定落在权重最大的那个叶子上，按轮配额从来不会收敛 | 0 | #197、#202 |
| AG-38 | P3 | 工具 | 请求体从不带 tools/tool_choice（没有原生 function calling）；ai-runtime 里的 runToolLoop 有界工具循环只导出，生产零调用。主面试回路用代码前置检索是合理的，但开放问答类场景缺少只读工具层 | 1 | — |

## 逐条详情

### AG-01【P1·编排运行时】派发前准入拒绝（熔断打开/并发槽满/预算耗尽）被写成固定幂等键的 failed 终态，30 秒的瞬时熔断会永久杀死在途面试与报告

- **复核结论**：成立（本次新增；机制已核实，触发频率推断）
- **交叉印证路数**：0（本次补盲新发现）
- **源编号**：本次新增；关联 AC-F14/AC-F19、LG-04
- **file:line**：packages/ai-runtime/src/invoke.ts:634-646（共享准入拒绝→failModelInvocationClaim）；packages/db/migrations/0130_model_invocation_same_key_claim_join.sql:179-180（failed 终态重放）、:135-145（同逻辑节点换新键也被拒）；packages/db/migrations/0120_model_op02_shared_provider_admission_ledger_breaker.sql:52-57（每 operation 并发 4、阈值 5、冷却 30s）；apps/worker/src/adaptive-interview-service.ts:150-175
- **触发例子**：供应商抖动，同一 operation 连续 5 次 5xx/超时，熔断打开 30 秒。这 30 秒内所有用户的出题调用被准入拒绝，账本写成 failed。这些面试的出题键 `${threadId}:ask:t${turn}:0` 永久变成 failed，重试也只会重放失败，于是整场 generation_unavailable。报告键 `${interviewId}:report` 同理永远失败。另一种触发：部署 ≥2 个 worker 副本，或调高 WORKER_INTERVIEW_GLOBAL_INFLIGHT，平台级并发超过 4 就返回 model_concurrency_exhausted。
- **用户影响**：一次几十秒的供应商故障，会让这段时间内所有在面用户的面试同时结束（C 端退额度，B 端申请进入可重试终态），报告也无法自愈。高峰期并发一超就批量误杀。
- **修法**：① 准入拒绝属于 known-not-sent，应释放 claim（删除或标记为 retryable_refused），不能写成 failed 终态。② 或者在 claim 之前先做准入，拒绝时直接返回可重试错误，由 job 退避后重排（配合 #4 的 next_attempt_at）。③ 熔断期间的出题、报告请求排队等待，不要 fail-closed。
- **关联审计总表编号**：#10、#4、#116

### AG-02【P1·产品契合】单次出题失败（schema/业务校验/critique 不过/供应商 unknown）或跨场撞题，都会让整场面试提前结束；没有重试和换题，而且按现有账本设计“换个键重试”也会被拒

- **复核结论**：成立（已核实）
- **交叉印证路数**：3（agent-capability、product-fit、ai-cost-context）
- **源编号**：AI-01、PF-F-08、AC-F16、AC-F11、AC-F7（部分）
- **file:line**：packages/ai-graphs/src/adaptive-interview/nodes/generate-question.ts:14-26,64-81；apps/worker/src/adaptive-interview-service.ts:86-91（attempt≠0 拒绝）、:167-175（错误→unavailable）、:178-187（wasAsked→duplicate_question）；packages/ai-graphs/src/adaptive-interview/nodes/evaluate-answer.ts:66-89（unscored→concluded）；packages/db/migrations/0130_model_invocation_same_key_claim_join.sql:135-145（同 businessRevision 的新键被 logical_node 拒绝）
- **触发例子**：第 8 轮出题时，模型生成的题与用户三个月前某场的题归一化后完全相同 → duplicate_question → failClosed → concluded=true，整场结束。或者模型返回的 JSON 少一个字段 → zod 失败 → 整场结束。
- **用户影响**：用户看到面试“莫名其妙结束”；前面 7 轮的出题、评分成本作废。练得越勤、题库越小，越容易撞题。
- **修法**：① 撞题、引文不合法、schema 不过这类确定性失败，允许受预算约束的 1 次重试。注意要同时换 idempotencyKey 和 operation.businessRevision（例如 `:ask:t8:r1`），否则 0085/0130 的逻辑节点槽位会拒绝。② 把本场和近 N 场已问题面（归一化短串）放进 userData，作为避重清单。③ 重试仍失败时换 competency 继续，不要结束整场。
- **关联审计总表编号**：#44、#10

### AG-03【P1·编排运行时】报告幂等键固定为 `${interviewId}:report`，账本对 failed/unknown 做终态重放，所以自动重试和手动重试都不会再调用模型，只会把同一个失败重放到隔离

- **复核结论**：成立（已核实；原 LR-F8 定 P2，此处上调）
- **交叉印证路数**：3（langgraph-deep-review、lg-runtime、ai-cost-context）
- **源编号**：LG-05、LR-F8、AC-F17（报告部分）、LG-06（缓存重放部分）
- **file:line**：apps/worker/src/main.ts:173（report key）；packages/ai-runtime/src/invoke.ts:601-623（claim 返回 cached/failed/unknown 均为终态）；packages/db/migrations/0130_model_invocation_same_key_claim_join.sql:163-164,179-180；apps/worker/src/interview-service.ts:291-311（validateReportContent 在 businessValidate 内，失败记 failed）
- **触发例子**：报告第一次因为“段落重复”被 validateReportContent 拒绝，账本记为 failed。sweep 重排和用户点“重试”时 claim 直接返回 failed，不发请求，循环到 quarantined（即 #229 描述的死路）。如果第一次超时被记为 unknown，也会永远冻结。
- **用户影响**：产品承诺的“失败自动重试、可手动重试”实际不生效：一次失败就意味着报告永远出不来。不过不会重复扣费。
- **修法**：报告调用的 idempotencyKey 和 businessRevision 都带上 attempt，形如 `:report:a${n}`，并设上限（如 3 次）。“不重复扣费”在 interview 结算维度保证，不依赖模型调用键。unknown 状态先走 #10 的处置流程。
- **关联审计总表编号**：#229、#20、#10

### AG-04【P1·编排运行时】图运行中的任何异常（DB 超时、checkpoint 写失败、瞬时网络错误）都会被当成终态：面试失败并退款。节点没有 retryPolicy，也不区分瞬时和确定性错误

- **复核结论**：成立（已核实）
- **交叉印证路数**：2（langgraph-deep-review、lg-runtime）
- **源编号**：LG-04、LR-F3
- **file:line**：apps/worker/src/interview-consumer.ts:376-387（只有 graph_fence_lost 会 requeue，其余一律 failClaimedInterviewJob）、:156-169；packages/ai-graphs/src/adaptive-interview/graph.ts:30-57（addNode 未配 retryPolicy）；LangGraph 1.4.7 graph/state.d.ts:42,72,88（支持 retryPolicy）
- **触发例子**：答题 job 执行到 putWrites 时遇到 statement_timeout 15s，或 PG 主从切换 1 秒，抛错后整场面试被标为 failed 并退额度。
- **用户影响**：基础设施的小抖动直接表现为“面试失败”，C 端用户要重开，B 端候选人要重考。
- **修法**：consumer 按错误分类处理：PG 连接类、超时类、ECONNRESET 走 requeue，带退避和 attempts 上限（配合 #4）；只有确定性业务错误才终态化。纯计算节点（plan/decide）可以配 LangGraph retryPolicy。
- **关联审计总表编号**：#4

### AG-05【P1·编排运行时】“评分已写入 checkpoint、出题还没完成”时 worker 崩溃，重试会走 alreadyApplied 分支直接跳过 invoke，图永远不会推进到下一题

- **复核结论**：成立（已核实；LangGraph 默认 durability=async、每个 superstep 都写 checkpoint，已对照 1.4.7 源码确认）
- **交叉印证路数**：2（langgraph-deep-review、lg-runtime）
- **源编号**：LG-03、LR-F1
- **file:line**：apps/worker/src/adaptive-lifecycle.ts:240-251（以最后一条 transcript 的 questionId 判断 alreadyApplied，跳过 invoke）、:258-261（done 取决于 snap.next）、:310-317（只有存在 next 才发 question_ready）；@langchain/langgraph 1.4.7 dist/pregel/index.js:891、loop.js:796
- **触发例子**：evalAnswer 这个 superstep 已写入 checkpoint（transcript 已含本题），genQuestion 在等模型时 worker 被 SIGKILL。reaper 重排后，lifecycle 判定 alreadyApplied，不再 invoke。snap.next=[genQuestion] 非空，所以 done=false，但也不发 question_ready。用户等不到下一题，大约 30 分钟后预留被对账回收，面试变成 abandoned。
- **用户影响**：用户卡在“等待下一题”直到超时，体验上就是面试丢了。监控也没有任何告警（见 AG-15）。
- **修法**：alreadyApplied 时检查 snap.next：非空且没有 pending interrupt，就 invoke(null, cfg) 续跑到下一个 interrupt。补一个“eval 后崩溃”的确定性 proof（MemorySaver + 注入抛错）。
- **关联审计总表编号**：#2、#8

### AG-06【P1·成本】模型返回非法 JSON、空 content，或被 max_tokens 截断时，结果一律记为 transient/unknown：预算冻结在预留态，并且计入熔断失败

- **复核结论**：成立（已核实）
- **交叉印证路数**：2（ai-cost-context；agent-capability 的 AI-01 提到 JSON 失败但没有指出 unknown 分类）
- **源编号**：AC-F14、AI-01（部分）
- **file:line**：packages/ai-runtime/src/model-client.ts:446-448（无 content→unknown）、:471/:473（JSON.parse 在 try 内）、:523（非 HTTP 异常→transient unknown）；packages/ai-runtime/src/invoke.ts:795,817-831（unknown + breaker failure）
- **触发例子**：报告输出较长被截断成半个 JSON → JSON.parse 抛 SyntaxError → unknown。这笔调用的预留额度不释放（#10），熔断计一次失败。连续 5 次就会触发 AG-01 的雪崩。
- **用户影响**：月度预算被“幽灵预留”逐步占满，最终误报 budget_exhausted；格式问题会被放大成全站熔断。
- **修法**：收到 HTTP 200 且有 usage 时，把 JSON 解析失败、截断（finish_reason=length）归为“已执行、确定性失败”：按实际 usage 结算，记 failed（或可重试），不计入熔断。只有网络层不确定才记 unknown。
- **关联审计总表编号**：#10

### AG-07【P1·成本】用量校准对账每小时把全部历史调用重新写一遍观测行，每 60 秒还要对所有曾经调用过的 owner 做一次全量扫描；算出的因子又没有回灌（见 AG-12）

- **复核结论**：成立（已核实）
- **交叉印证路数**：1（ai-cost-context）
- **源编号**：AC-F20
- **file:line**：apps/worker/src/usage-calibration-reconcile.ts:18-24（小时桶 batch）、:32-56（逐 owner）、:61-63（60s）；packages/ai-runtime/src/usage-calibration-reconciler.ts:103-140（读全部历史配对，逐条 INSERT）；packages/db/migrations/0119_*.sql:399-413（PK 含 batch）、:438-470（配对函数没有时间窗）；0134（owner 枚举没有时间窗）
- **触发例子**：1 万用户 × 平均 100 次历史调用 = 100 万配对。每分钟发起 100 万次 INSERT … ON CONFLICT DO NOTHING，每小时实际新增 100 万行，一天 2400 万行，并且随历史线性增长。
- **用户影响**：上线一段时间后 DB 膨胀、worker 对账事务越来越长，拖累主链路连接池；而产出（校准因子）没有被任何地方使用。
- **修法**：加水位线，只处理 completed_at > 上次水位的增量；观测表 PK 去掉 batch；因子改为全局 (service, model) 聚合。在回灌落地前，可以先降频到每天一次，或者干脆关掉。
- **关联审计总表编号**：—

### AG-08【P2·编排运行时】共享准入/熔断键在注册表里写死为 dashscope-main/cn-beijing，不随实际端点（默认 DeepSeek）变化。主备共用一套熔断和并发 4；claim 之后的 failover 也会因 cost policy 不同被拒，备用端点基本用不上

- **复核结论**：成立（已核实；“备用无效”结论来自 invoke 流程读码，未实跑）
- **交叉印证路数**：1（ai-cost-context）+ 本次补充 failover 证据
- **源编号**：AC-F19
- **file:line**：packages/ai-runtime/src/model-operation-registry.ts:62-103；packages/db/migrations/0120_model_op02_shared_provider_admission_ledger_breaker.sql:52-57；0131_job_route_classify_admission.sql:14；packages/ai-runtime/src/invoke.ts:634-646（共享准入在 failover 之前）、:656-697（half-open 后 failover 遇到 cost policy 不同→model_failover_cost_policy_mismatch）；packages/ai-runtime/src/text-endpoint-config.ts:77
- **触发例子**：DeepSeek 主端点故障 → 共享熔断（键名为 dashscope-main）打开 → 百炼备用端点的请求在共享准入阶段同样被拒。
- **用户影响**：主备切换形同虚设，主端点出故障时整站 AI 功能不可用，并叠加 AG-01。
- **修法**：admission 键改为“端点 profile 的 provider|region”，主备分别建种子；failover 允许在同一 cost scope 内切换到预先绑定的备用价格行。
- **关联审计总表编号**：—

### AG-09【P2·编排运行时】重放时 request digest 不稳定（RAG/web 素材、prompt 文本、价格版本都进了 digest），同一个键遇到不同 digest 会直接返回 idempotency_key_payload_mismatch 终态，把可恢复的崩溃变成整场失败

- **复核结论**：成立（digest 构成与 SQL 分支已核实；web 结果的非确定性属推断）
- **交叉印证路数**：2（lg-runtime、langgraph-deep-review 的 LG-06）
- **源编号**：LR-F2、LG-06（部分）
- **file:line**：packages/ai-runtime/src/model-client.ts:530-553（digest 含 rag/system/temperature/costPolicy）；apps/worker/src/adaptive-interview-service.ts:118-162；packages/db/migrations/0130_model_invocation_same_key_claim_join.sql:163-164
- **触发例子**：出题成功后、checkpoint 写入前 worker 被杀。重放时 web 检索多抓到一个源，digest 变了 → payload_mismatch → 整场 generation_unavailable。滚动发布时改了 prompt，在途 thread 的重放同样会 mismatch。
- **用户影响**：崩溃恢复和发布期间，在途面试会被批量误杀。
- **修法**：把检索拆成独立节点，素材 ref 存进 state，生成节点只从 state 读取，保证重放时输入确定；或者对 succeeded 的同逻辑节点优先回放已有结果，不再比较 digest。
- **关联审计总表编号**：#7

### AG-10【P2·产品契合】C 端面试如果全部跳过或 unresolved，仍会全额确认扣费并入队报告，而报告因为没有分数必然失败，重试多少次都一样

- **复核结论**：成立（已核实）
- **交叉印证路数**：1（product-fit）
- **源编号**：PF-F-12
- **file:line**：apps/worker/src/adaptive-lifecycle.ts:359-372（unscored=0 且 eligible=0 时：completeInterviewAndConfirm，C 端 unbound 时 enqueueReport）；apps/worker/src/main.ts:175-180
- **触发例子**：用户 5 题都点“跳过” → 面试完成并扣 1 次额度 → 报告页一直显示“生成失败，重试”。
- **用户影响**：付了钱拿不到任何产出，而且“重试”按钮是无效承诺。
- **修法**：eligible=0 时直接生成确定性的“证据不足”报告（不调模型），或者 C 端也退款；report_unavailable 要区分可重试和不可重试。
- **关联审计总表编号**：#229、#20

### AG-11【P2·成本】成本预留按每个端点的静态 MAX_INPUT_TOKENS 预留，而不是用派发前估算；DB 触发器还强制“预留量 = 上限”，结构上改不了

- **复核结论**：成立（已核实；放大倍数取决于部署 env）
- **交叉印证路数**：1（ai-cost-context）
- **源编号**：AC-F3
- **file:line**：packages/ai-runtime/src/invoke.ts:742-746；packages/db/migrations/0088_*.sql:162（r.input_tokens_reserved=h.max_input_tokens）、:550；apps/worker/src/model-cost-governance.ts:102-106
- **触发例子**：MAX_INPUT_TOKENS=64k 时，一次只有几百 token 的报告调用也冻结 64k 的额度。
- **用户影响**：并发一高，月度预算就被虚占，提前触发 budget_exhausted，之后经 AG-01 变成面试失败。
- **修法**：预留改为 min(上限, 派发前估算)（估算本身是上界）；或者按 operation 分别配置上限。触发器的等值约束要一起改。
- **关联审计总表编号**：#116、#10

### AG-12【P2·上下文】token 估算器 utf8-bytes-v1 对中文高估约 3.7 倍（实测）；校准因子算出来了，但生产路径从不回灌到 costPolicy

- **复核结论**：成立（已核实；本次用 Qwen2.5 tokenizer 实测 interviewer.ask 的 system：2245 字节 / 606 token）
- **交叉印证路数**：2（ai-cost-context、agent-capability AI-04）
- **源编号**：AC-F4、AI-04（估算部分）
- **file:line**：packages/ai-runtime/src/model-client.ts:170-178（byteEstimate）、:242-252；apps 内 rg `calibration:` 无赋值（只有 context-budget.ts:209 和 usage-reconciliation.ts 的类型/计算）
- **触发例子**：2 万字中文简历事实估算约 6 万“token”，实际约 1.5 万；如果 MAX_INPUT_TOKENS 配成 32k，请求会被 model_context_budget_exceeded 直接拒掉。
- **用户影响**：长简历、长作答会被误判超预算而失败；同时放大 AG-11 的预留虚占。
- **修法**：改用 CJK 加权估算器（如中文 1.0 token/字、ASCII 字节/3），或者把对账因子按 model 回灌到 policy.calibration（planContextBudget 已经支持）。
- **关联审计总表编号**：—

### AG-13【P2·RAG】CRAG 直接用原始 cosine（1−distance）配合未校准的固定阈值 0.7/0.3/0.5，查询串里还拼了“难度N”；中间档会额外触发 web 或深检索

- **复核结论**：成立（口径和阈值已核实；分数分布与 web 回退比例属推断，需要线上 histogram）
- **交叉印证路数**：2（ai-cost-context、agent-capability AI-05）
- **源编号**：AC-F10、AI-05（部分）
- **file:line**：packages/domain/src/crag.ts:29-40；packages/db/src/qbank-generation-retrieval.ts:197-212（score=max(0,1−distance)）；apps/worker/src/adaptive-interview-service.ts:120
- **触发例子**：competency=Redis，query=“Redis 难度3”，命中题目的 cosine 约 0.55 → augment_web → 多一次 web 抓取，prompt 多约 1600 字素材。
- **用户影响**：检索质量和成本都没有依据；难度控制几乎全靠模型自觉。
- **修法**：query 去掉“难度N”，难度改为过滤或重排条件；用离线 holdout 拟合阈值并版本化；记录 verdict.action 的分布指标。
- **关联审计总表编号**：#79、#77、#80、#38

### AG-14【P2·成本】usage 结算口径不一致：usage 整体缺失时按上限多记，usage 存在但缺字段时按 0 少记；RAG embedding 没有 usage 时按 16000 token 结算

- **复核结论**：成立（已核实）
- **交叉印证路数**：1（ai-cost-context）
- **源编号**：AC-F15
- **file:line**：packages/ai-runtime/src/invoke.ts:339-347（validUsage 回退为上限）；packages/ai-runtime/src/model-client.ts:452（?? 0）；apps/worker/src/rag-cost-governance.ts:127
- **触发例子**：供应商响应里有 usage 但缺 prompt_tokens → 本次按 0 结算，校准样本也被污染。
- **用户影响**：账本偏差方向不定，对账和预算告警都不可信。
- **修法**：缺字段时统一视为 usage_missing，按上限结算并打标；embedding 读供应商 usage 或按估算上界结算。
- **关联审计总表编号**：#49

### AG-15【P2·编排运行时】图运行时可观测性不足：没有“thread 停在非 interrupt、非 END 节点”的卡死检测；ai_graph_run 没有 current_node/last_error/checkpoint_id

- **复核结论**：成立（已核实）
- **交叉印证路数**：1（langgraph-deep-review）
- **源编号**：LG-20
- **file:line**：packages/ai-graphs/src/adaptive-interview/graph.ts:19-29（observer 只记节点名/turn/耗时）；packages/db/src/interview-graph-lease.ts（没有错误字段）；apps/worker/src/interview-consumer.ts:156-169
- **触发例子**：AG-05 那种卡死的面试，监控上看不到任何信号，只能等用户投诉。
- **用户影响**：P1 级运行时故障无法被发现，也无法定位。
- **修法**：ai_graph_run 增加 current_node/last_error_code/last_checkpoint_id；周期扫描 next 非空、没有 interrupt、N 分钟没有 job 的 thread，打指标并自动 invoke(null)。
- **关联审计总表编号**：#8

### AG-16【P2·编排运行时】上述 P1 运行时故障路径都没有确定性 proof：eval 后崩溃、节点瞬时异常、报告重试是否真的再调模型、准入拒绝后重试、recursionLimit 是否生效、旧 checkpoint resume

- **复核结论**：成立（已核实；voice-adaptive.proof.ts 已补读：只用假 start/submit 缝，不经过真实图契约）
- **交叉印证路数**：1（langgraph-deep-review）
- **源编号**：LG-21
- **file:line**：apps/worker/test/adaptive-lifecycle.proof.ts:56（只覆盖 awaitAnswer 之后的重放）；apps/worker/test/voice-adaptive.proof.ts（假 seam）；.github/workflows/ci.yml:219
- **触发例子**：AG-01/03/04/05 这些问题在 CI 全绿的情况下也会存在。
- **用户影响**：回归无法发现，修复后也无法证明已修好。
- **修法**：为每个 P1 补一个 MemorySaver + 注入抛错的确定性 proof，再补一套 PG 集成 proof。
- **关联审计总表编号**：#98、#99

### AG-17【P3·Prompt】结构化输出只用 response_format=json_object，schema 只写在 prompt 里；schema 失败不重试但照常计费；span 名 schema_retry 暗示有重试，实际没有

- **复核结论**：成立（已核实）
- **交叉印证路数**：2（ai-cost-context、agent-capability AI-06）
- **源编号**：AC-F7、AI-06（部分）
- **file:line**：packages/ai-runtime/src/model-client.ts:415；packages/ai-runtime/src/invoke.ts:154（never automatically retried）、:927（span 名 schema_retry）
- **触发例子**：评估少返回 hasHook → zod 失败 → 本题 unscored → 整场结束（见 AG-02）。
- **用户影响**：token 已付费但没有产出；排障时 span 名误导。
- **修法**：支持的模型改用 json_schema(strict)；span 改名为 schema_invalid；重试策略见 AG-02。
- **关联审计总表编号**：—

### AG-18【P3·Prompt】采样温度：出题、OCR、路由分类都没设温度（用供应商默认），路由分类是约束性任务却没钉低温；MODEL_EVAL_TEMPERATURE 填了非法值会变成 NaN，序列化后是 temperature:null

- **复核结论**：成立（已核实；对拒分率的影响属推断）
- **交叉印证路数**：2（ai-cost-context、agent-capability）
- **源编号**：AC-F9、AI-06（部分）
- **file:line**：packages/ai-runtime/src/model-client.ts:154-158（SERVICE_TEMPERATURE 只有 3 项）、:416
- **触发例子**：route-classify 要求整数比例和为 10000，在默认高温下更容易输出不合规而被拒。
- **用户影响**：分类稳定性差，出题风格随供应商默认值漂移。
- **修法**：route-classify 和 vision 设 0–0.1；env 解析时校验是否为有限数，非法就启动失败。
- **关联审计总表编号**：—

### AG-19【P3·Prompt】prompt 版本没有落库也没有打点（注释称落 ai_prompt_versions，但这张表没有写入方）；无法按版本归因成本和质量

- **复核结论**：部分成立（落库/打点缺失属实；“catalog 版本号过时”一项不成立：catalog 已标 @deprecated 且零调用方）
- **交叉印证路数**：1（ai-cost-context）
- **源编号**：AC-F8
- **file:line**：packages/ai-runtime/src/prompts.ts:2-3,124-127；packages/ai-runtime/src/catalog/index.ts:13；rg ai_prompt_versions 只命中注释
- **触发例子**：灰度改了 evaluate prompt 后，无法区分分数分布变化来自哪个版本。
- **用户影响**：prompt 迭代没有数据支撑。
- **修法**：invoke spec 带上 promptVersion，写入 ai_model_invocation、trace 和 metric 标签。
- **关联审计总表编号**：#14

### AG-20【P3·上下文】上下文工程与记忆治理原语（planDispatchBudget 组件裁剪、CTX-05 压缩、MEM-02/03 摘要、MEM-07 围栏、MEM-09 生命周期、MEM-11/14 召回）都只被 index 导出和 proof 引用，生产派发链路零调用

- **复核结论**：成立（已核实，rg 排除 test/proof 后没有调用方）
- **交叉印证路数**：2（agent-capability AI-03/AI-04、ai-cost-context AC-F5）
- **源编号**：AI-03、AI-04（裁剪部分）、AC-F5
- **file:line**：packages/ai-runtime/src/context-budget.ts:183,276；packages/ai-runtime/src/index.ts:74；packages/domain/src/mem07-injection-fence.ts:53；packages/domain/src/mem09-lifecycle-triggers.ts:28,210；apps/worker/src/memory-service.ts:1-33
- **触发例子**：超预算时生产路径只会整单拒绝（model_context_budget_exceeded），不会裁剪 RAG 后再发；DATA_BOUNDARY_RULE 有两份文案并存。
- **用户影响**：目前每次调用都是单轮，暂时没有直接的用户影响；但设计文档会让人误以为已有长期记忆与压缩能力，维护成本也高。
- **修法**：二选一：接线（在 promptedModel 里映射 components，先裁剪再派发），或者明确标为实验性代码并移出 index 导出；边界规则收敛为一份。
- **关联审计总表编号**：#51、#217

### AG-21【P3·上下文】截断与预算两套口径：截断按 UTF-16 码元（2 万/1.2 万/1.6 万/8 千），预算按 UTF-8 字节；RAG 素材有 420→600/1600→8000 三层截断

- **复核结论**：成立（已核实）
- **交叉印证路数**：1（ai-cost-context）
- **源编号**：AC-F6
- **file:line**：packages/ai-runtime/src/model-client.ts:109-113,126-136；apps/worker/src/adaptive-interview-service.ts:138,145；packages/db/src/qbank-generation-retrieval.ts:198
- **触发例子**：截断放行了 2 万中文字符，但字节预算判定超限（约 6 万），整单被拒。
- **用户影响**：调参容易误判；超长输入是整单失败，而不是截掉后段。
- **修法**：截断上限由 policy.maxInputTokens 反推，统一使用同一个估算器。
- **关联审计总表编号**：—

### AG-22【P3·成本】约束性短任务（路由分类、押题、诊断、报告）都走主力模型；fast 模型默认名 qwen-turbo、主模型默认名 qwen-plus，而默认端点 profile 是 DeepSeek，没有“profile × 模型名”的兼容校验

- **复核结论**：成立（路由走主模型已核实；模型名与端点不兼容取决于部署 env，属推断）
- **交叉印证路数**：1（ai-cost-context）
- **源编号**：AC-F18
- **file:line**：apps/worker/src/main.ts:501-502,629-634；packages/ai-runtime/src/text-endpoint-config.ts:67,77；apps/worker/src/model-cost-governance.ts:144-145；apps/worker/src/interview-service.ts:194-195
- **触发例子**：部署时只设了 MODEL_ENDPOINT_PROFILE 默认值而没有设 MODEL_NAME → 向 DeepSeek 发 model=qwen-plus → 第一次调用 4xx。
- **用户影响**：单价偏高；配置错位要到运行期才暴露。
- **修法**：路由分类改用 fastModel 且 temperature=0；启动时断言 profile 支持该模型名。
- **关联审计总表编号**：#91

### AG-23【P3·缓存】生产 enforce 模式下，RAG 查询 embedding 绕过进程内缓存（作者有意为之，以免缓存命中时重复预留），而可枚举的“能力×难度”查询串每次都要付费 embed

- **复核结论**：成立（已核实，属有意取舍）
- **交叉印证路数**：1（ai-cost-context）
- **源编号**：AC-F21
- **file:line**：apps/worker/src/main.ts:539,560-563；apps/worker/src/rag-cost-governance.ts:41-43
- **触发例子**：Redis 结果缓存 TTL 120s 过期后，同一个“Redis 难度3”又要付费 embed，并预留 16000 token。
- **用户影响**：小额成本浪费。
- **修法**：离线预计算固定查询向量；或者在 budgetedQbankEmbedding 内部先查缓存，未命中再预留。
- **关联审计总表编号**：#171

### AG-24【P3·成本】成本与观测小项汇总：Langfuse 的 model 字段填的是 service 名、没有 cached 和成本；RAG 旧预留函数不绑定价格 revision；G7 回退估算对图片数组取 .length；进程内限流/熔断残留

- **复核结论**：部分成立（已核实各子项；“embedder 注释写 1024”一项不成立，现注释没有写 1024）
- **交叉印证路数**：1（ai-cost-context）
- **源编号**：AC-F22（除 ASR/TTS 外）、AC-F13
- **file:line**：packages/ai-runtime/src/langfuse-v5.ts:169-171；apps/worker/src/rag-cost-governance.ts:110-113；packages/ai-runtime/src/model-client.ts:400；packages/ai-runtime/src/circuit-breaker.ts
- **触发例子**：在 Langfuse 里按模型统计成本，看到的全是 service 名。
- **用户影响**：成本归因不准；价格切换时 RAG 账本会被“隐式改价”。
- **修法**：上报真实 model 与 cached/cost；RAG 预留改为 0083 风格的 revision 绑定；删除残留实现。
- **关联审计总表编号**：#72、#172、#210

### AG-25【P3·编排运行时】genQuestion 重放时，节点内的非模型副作用（本地 ANN、web 或深检索外呼、进度事件、wasAsked 查询）会重新执行

- **复核结论**：部分成立（机制已核实；目前只在崩溃重放路径上触发，原 P2 下调）
- **交叉印证路数**：1（langgraph-deep-review）
- **源编号**：LG-17
- **file:line**：apps/worker/src/adaptive-interview-service.ts:113-121,150-165,178-187
- **触发例子**：修好 AG-05 后从断点续跑 genQuestion，会再做一次 deepResearch，并重复发 next_question 进度帧。
- **用户影响**：外部检索成本翻倍；进度条重复显示。
- **修法**：检索结果按 attemptKey 缓存，或者拆成独立节点存进 state（与 AG-09 一起修）。
- **关联审计总表编号**：#165

### AG-26【P3·编排运行时】start 重试在没有 pending 时走 invoke({})，非 null 输入会从 START 重新跑：plan 节点用 initMind 把 turn 归零，而 transcript 保留

- **复核结论**：成立（已对照 LangGraph 1.4.7 loop.js _first 语义核实）
- **交叉印证路数**：2（langgraph-deep-review、lg-runtime）
- **源编号**：LG-18、LR-F6
- **file:line**：apps/worker/src/adaptive-lifecycle.ts:204-208；packages/ai-graphs/src/adaptive-interview/nodes/plan.ts（initMind）；@langchain/langgraph dist/pregel/loop.js（_first：非 null 输入写入 START 通道）
- **触发例子**：start 在 genQuestion 中途被 kill，reaper 重排后重新走 plan，turn=0 的出题键命中上次的 failed，整场结束。
- **用户影响**：首题阶段的崩溃不可恢复。
- **修法**：先看 snap.next：非空就 invoke(null) 续跑；只有全新 thread 才 invoke({})。
- **关联审计总表编号**：—

### AG-27【P3·编排运行时】recursionLimit 写在 compile() 上，LangGraph 1.4.7 会静默忽略，实际生效的是默认值 25；当前单段 invoke 不超过约 5 步，暂时安全

- **复核结论**：成立（已核实：dist/graph/state.js:432 的 compile 只解构 checkpointer/store/cache/interrupt*/name/description/transformers）
- **交叉印证路数**：2（langgraph-deep-review、lg-runtime 的 F11）
- **源编号**：LG-14、LR-F11（recursionLimit 子项；其“64 生效”的前提不成立）
- **file:line**：packages/ai-graphs/src/adaptive-interview/graph.ts:57；@langchain/langgraph 1.4.7 dist/graph/state.js:432、dist/pregel/utils/config.js:36
- **触发例子**：将来在 decide→conclude 之间加循环节点时，会在第 25 步而不是预期的 64 步抛 GraphRecursionError。
- **用户影响**：目前没有影响，属于隐性陷阱。
- **修法**：改为 invoke(input, { ...cfg, recursionLimit })，并加断言测试。
- **关联审计总表编号**：—

### AG-28【P3·编排运行时】迟到的 job 会让已终止的 ai_graph_run“复活”（acquire 不检查状态，直接置 active）；放弃之后 queued 的 job 不会被取消，答案 claim 也不检查面试状态

- **复核结论**：成立（已核实；原 P2，因为后续投影有 fence 和终态拦截、实际危害小，下调）
- **交叉印证路数**：1（langgraph-deep-review）
- **源编号**：LG-08
- **file:line**：packages/db/src/interview-graph-lease.ts:40-46；packages/db/src/commerce.ts:265-311；packages/db/src/interview-question.ts:99-109
- **触发例子**：用户放弃面试后，队列里还有一个 answer job，被领取后把 run 置为 active，并跑一次图。
- **用户影响**：ai_graph_run 状态失真，并产生一次多余的模型调用。
- **修法**：acquire 时拒绝终态 run；abandon 时在同一事务里取消该面试的 queued job。
- **关联审计总表编号**：#8、#1、#12

### AG-29【P3·编排运行时】session 级 advisory lock 解锁失败会被 catch 吞掉，连接带着锁回到共享池；queued job 被反复 requeue 时没有 attempts 上限

- **复核结论**：成立（代码已核实；触发需要网络或连接异常，属推断）
- **交叉印证路数**：2（langgraph-deep-review、lg-runtime）
- **源编号**：LG-10、LR-F5
- **file:line**：packages/db/src/interview-graph-lease.ts:18-23,54-56；packages/db/src/interview-jobs.ts:121-147,222
- **触发例子**：unlock 那一刻连接抖动，锁残留在池化连接上，这场面试之后每个 job 都拿不到锁，一直 requeue。
- **用户影响**：个别面试活锁，直到连接被回收。
- **修法**：unlock 失败时调用 release(err) 销毁连接；requeue 计数并设上限；或者改为事务级锁 + CAS。
- **关联审计总表编号**：#9、#4

### AG-30【P3·编排运行时】checkpoint 永不清理：transcript reducer 是 concat，每轮整块写新的 blob 版本；终态面试的 checkpoint 只有隐私擦除才会删除

- **复核结论**：成立（已核实；原文按 120 轮估算 TB 级，但软预算约 10–17 题，量级偏高，故下调）
- **交叉印证路数**：2（langgraph-deep-review、lg-runtime）
- **源编号**：LG-12、LR-F10
- **file:line**：packages/ai-graphs/src/adaptive-interview/state.ts:123；packages/db/migrations/0048_checkpoint_physical_erasure.sql:429-433（唯一删除路径）
- **触发例子**：每场约 15 轮，transcript blob 写约 15 版，累计 O(n²) 字节。
- **用户影响**：存储持续增长，题面、评分、critique 的留存超出业务必要期限。
- **修法**：面试终态后异步把 thread 精简为最后一个 checkpoint 或整体删除；设置保留期任务。
- **关联审计总表编号**：#8

### AG-31【P3·编排运行时】图版本没有持久化标记（release 只出现在 observer 里），旧 checkpoint 没有兼容闸或迁移函数

- **复核结论**：成立（已核实缺机制；在途面试时长短、可以排空，原 P2 下调）
- **交叉印证路数**：2（langgraph-deep-review、lg-runtime）
- **源编号**：LG-13、LR-F7
- **file:line**：packages/ai-graphs/src/adaptive-interview/graph.ts:27；packages/ai-graphs/src/adaptive-interview/state.ts:131-138
- **触发例子**：拆分 awaitAnswer 节点后发版，停在旧 interrupt 上的面试 resume 时找不到节点，触发 AG-04 整场失败。
- **用户影响**：发布可能批量误伤在途面试。
- **修法**：checkpoint metadata 写入 graph_version，worker 按版本选择 builder，或在 resume 前跑 state 迁移；发布前检查在途版本分布。
- **关联审计总表编号**：—

### AG-32【P3·编排运行时】interrupt 输入一旦非法就结束整场；语音预览路径 voice-turn.ts 用原始转写字符串 resume，与 {answerId} 契约不兼容；voice-adaptive.proof 用假 submit(string) 跑绿，掩盖了契约差异

- **复核结论**：成立（已核实；voice-turn 只被没有生产调用方的 previewVoiceAnswerTurn 使用，原 P2 下调）
- **交叉印证路数**：1（langgraph-deep-review）+ 本次补读 proof
- **源编号**：LG-15、本次补盲
- **file:line**：packages/ai-graphs/src/adaptive-interview/nodes/await-answer.ts:32-38；packages/ai-graphs/src/voice-turn.ts:16；apps/worker/src/voice-adaptive.ts:17-18,38；apps/worker/test/voice-adaptive.proof.ts
- **触发例子**：语音模式一旦接上 voice-turn，第一题作答就会因为 answer_reference_invalid 结束整场；而 CI 里的 voice-adaptive:prove 仍然是绿的。
- **用户影响**：目前没有生产影响（语音走 ASR→文本 /turn）；但这是语音上线时的必踩坑。
- **修法**：删除或改写 voice-turn，统一走 answerId；proof 改为调用真实 submitAdaptiveAnswer；非法 resume 返回可重试错误，不要直接 concluded。
- **关联审计总表编号**：#69、#73

### AG-33【P3·编排运行时】PrincipalBoundCheckpointPool 每次 saver 查询都要额外做 4 次 SET + 4 次清理，共 8 次往返

- **复核结论**：成立（已核实往返次数；延迟影响属推断）
- **交叉印证路数**：1（langgraph-deep-review）
- **源编号**：LG-16
- **file:line**：apps/worker/src/checkpoint-principal.ts:67-83,136-163
- **触发例子**：一次答题 invoke 约 5 个 superstep，每步有多次 saver 查询，跨可用区时每题多出几百毫秒。
- **用户影响**：首字延迟增加。
- **修法**：用单条 SELECT set_config(...),set_config(...) 合并设置和清理。
- **关联审计总表编号**：—

### AG-34【P3·编排运行时】每个在飞 job 在整个 invoke 期间（几十秒）都独占一条锁连接，投影和心跳还要从同一个池取连接

- **复核结论**：成立（推断，需压测）
- **交叉印证路数**：2（langgraph-deep-review、lg-runtime 的 F11）
- **源编号**：LG-19、LR-F11（连接子项）
- **file:line**：packages/db/src/interview-graph-lease.ts:18,55-56；apps/worker/src/interview-dispatch-fairness.ts:10-13
- **触发例子**：把 globalInflight 调到接近 PGPOOL_MAX 时，心跳续租取不到连接 → 租约过期 → reaper 接管 → 雪崩式重试。
- **用户影响**：扩并发时容易出现级联故障。
- **修法**：锁会话用独立的小池，并限制并发 ≤ 锁池 max。
- **关联审计总表编号**：#9

### AG-35【P3·编排运行时】遗留 API 仍然导出：buildMockInterviewGraph 会把原始答案写进 state，buildMockInterviewRunner 会调用 cp.setup()（DDL），db.acquireLease/releaseLease 按 thread_id 更新、不带 graph_name

- **复核结论**：成立（已核实，当前零调用）
- **交叉印证路数**：2（langgraph-deep-review、lg-runtime）
- **源编号**：LG-22、LR-F11（legacy 子项）
- **file:line**：packages/ai-graphs/src/mock-interview.ts:15-21；apps/worker/src/main.ts:137-141；packages/db/src/index.ts:55-64
- **触发例子**：新人误用 acquireLease，跨图篡改了 career-path 的租约。
- **用户影响**：潜在的误用风险。
- **修法**：删除，或改为 retired 时直接抛错。
- **关联审计总表编号**：#170

### AG-36【P3·编排运行时】packages/db 直接钉死 @langchain/langgraph-checkpoint 1.1.3，不走 catalog；0043 手抄 vendor migrations，运行时没有版本自检

- **复核结论**：成立（已核实，当前 lockfile 一致）
- **交叉印证路数**：1（langgraph-deep-review）
- **源编号**：LG-23
- **file:line**：pnpm-workspace.yaml:14-17；packages/db/package.json:97-98；packages/db/migrations/0043_langgraph_checkpoint_least_privilege.sql:1-4
- **触发例子**：升级 checkpoint-postgres 时 vendor 新增了列，0043 没有跟进，运行期 SQL 报错。
- **用户影响**：升级时的风险。
- **修法**：启动时校验 checkpoint_migrations 的最大版本；db 包改用 catalog。
- **关联审计总表编号**：—

### AG-37【P3·RAG】检索侧的 weighted-deficit 每个 job 都从 0 开始，而一个 job 只出一题，所以多叶子岗位的检索恒定落在权重最大的那个叶子上，按轮配额从来不会收敛

- **复核结论**：成立（本次新增，已核实）
- **交叉印证路数**：0（本次补盲新发现）
- **源编号**：本次新增（qbank-*.ts 补读）
- **file:line**：apps/worker/src/interview-consumer.ts:257-273（每次 claim 初始化 trackLocalDeficit 为全 0）；packages/domain/src/job-route-classifier.ts:204-216（nextWeightedDeficitLeaf）；apps/worker/src/qbank-track-local-retrieve.ts:405-470
- **触发例子**：岗位路由为 backend 6000bps / ai_app 4000bps，每一题的 fundamental 检索都只会落在 backend 叶子的题库。
- **用户影响**：多方向岗位的题目覆盖偏科；和 #197 的“planner 只取 allocations[0]”症状相同，但根因不同。
- **修法**：把 deficit 持久化到图 state 或 interview 表，每题更新。
- **关联审计总表编号**：#197、#202

### AG-38【P3·工具】请求体从不带 tools/tool_choice（没有原生 function calling）；ai-runtime 里的 runToolLoop 有界工具循环只导出，生产零调用。主面试回路用代码前置检索是合理的，但开放问答类场景缺少只读工具层

- **复核结论**：部分成立（“全仓没有工具循环”不准确：runToolLoop 存在但未接线）
- **交叉印证路数**：1（agent-capability）
- **源编号**：AI-07
- **file:line**：packages/ai-runtime/src/model-client.ts:404-421；packages/ai-runtime/src/tools.ts:44；packages/ai-runtime/src/index.ts:219
- **触发例子**：将来做“成长顾问对话”时，只能把所有上下文一次性塞进 prompt。
- **用户影响**：目前没有影响，属于能力缺口。
- **修法**：需要开放问答时再基于 runToolLoop 做只读工具层，并设计多步 invoke 的幂等。
- **关联审计总表编号**：—

## 已在审计总表中的问题（只引用编号，不计入新增）

| 总表编号 | 问题 | 本次涉及的源编号 | 交叉印证路数 | 复核结论与证据 | 定级意见 |
|---|---|---|---|---|---|
| #44 | 出题模型看不到上一题的作答、证据和弱点，“追问”实际上是同能力换一道泛题 | LG-01、PF-F-02、AC-F11（部分）、agent-capability 正文 | 4 | 成立：adaptive-interview-service.ts:150-162 的 promptedModel 只传 {competency,difficulty,kind,resumeFacts:[]}；generate-question.ts:59 的 asked 只给 critique 用 | 建议总表从 P2 升到 P1（自适应追问是 C 端核心卖点） |
| #196 | 简历正文不进面试模型：planner 只拿到字面串，ask 传 resumeFacts:[] | LG-02、PF-F-03、AC-F11（部分）、agent-capability 正文 | 4 | 成立：adaptive-lifecycle.ts:196-197；adaptive-interview-service.ts:150-162；state.ts:67-75 只有一个布尔位 | 维持总表 P2；在用户已同意的用途内允许运行时注入（PF-F-13 的权衡） |
| #40、#20 | ScoreCard 生产无写入方，报告/评估整链空转 | PF-F-01 | 1 | 成立：main.ts:175-180 读 listScorableScoreCards | 维持 P0 |
| #203、#206、#252 | 跨场弱项记忆：名称精确匹配、无衰减、实际恒空 | AI-02、PF-F-10、AC-F12 | 3 | 成立：memory-store.ts:47-56 SELECT DISTINCT 无时间窗；adaptive-interview-service.ts:66-71 normalizeQuestion 精确匹配；依赖 #204 才会有数据 | 维持 |
| #2 | 用户暂停超过约 30 分钟，预留被对账回收，面试变成 abandoned | LG-07、PF-F-06 | 2 | 成立（触发属推断）：commerce.ts:26 DEFAULT_LEASE_SECONDS=1800；interview-consumer.ts:221-238 只在 job 运行期间续租；commerce-reconcile.ts:25-70 | 建议总表从 P3 升到 P2（PF-F-06 原定 P1 偏高） |
| #8 | 自适应图的 ai_graph_run 永远写不到终态 | LG-09、LR-F10（部分） | 2 | 成立：interview-graph-lease.ts:81-86 release 无条件写 waiting_user | 维持 |
| #7 | checkpoint 写不受图版本 fence 保护 | LG-11、LR-F4 | 2 | 成立：fence 只在投影侧，saver 写只靠 advisory lock | 维持 |
| #256 | 没有“提前结束并出报告” | PF-F-07 | 1 | 成立 | 维持 |
| #50、#204 | 报告只喂分数数组；成长链生产无人调用，报告更新后下游不联动 | PF-F-09、LG-06（下游联动部分） | 2 | 成立：interview-service.ts:301 只传分数 | 维持 |
| #271、#197、#258 | B 端岗位面试扣候选人额度；JD 与能力要求不进 planner | PF-F-11 | 1 | 成立：interview-consumer.ts:355 只取 allocations[0].leafTrackId | 维持 |
| #238、#133、#259 | 多简历/多身份：同时只能有一场，无目标岗位输入 | PF-F-05 | 1 | 成立 | 维持 |
| #77、#79、#38 | 难度自适应信号粗：题库只有 3/4 两档，检索只拼“难度N”、只服务 fundamental | PF-F-04、AI-05、AC-F10（query 部分） | 3 | 成立（效果弱属推断）：adaptive-interview-service.ts:118-121 | 维持；CRAG 阈值未校准另立 AG-13 |
| #48、#49 | 输入缓存零收益、cached_tokens 不计量、价格本没有缓存价 | AC-F1、AC-F2、agent-capability 缓存段 | 2 | 部分成立：本次用 Qwen2.5 tokenizer 实测 8 个 system 前缀为 172–670 token，全部低于百炼 1024 门槛（百炼官方文档已核实：显式/隐式缓存最少 1024 token，隐式命中按 20% 计价）；但默认端点是 DeepSeek，其官方文档写的是按“缓存前缀单元”整体匹配并会自动检测公共前缀落盘，没有写 1024 门槛，也没有写 64 token 粒度，所以“DeepSeek 下零收益”无法判定 | 维持 P3；先接 cached_tokens / prompt_cache_hit_tokens 观测再下结论 |
| #9 | session 级 advisory lock 与 PgBouncer 事务池冲突 | LR-F11（部分） | 1 | 成立（仓库里没有 pgbouncer 配置，属推断） | 维持 |
| #213 | 诊断全有或全无：一条改写不接地就整份作废 | AC-F17（诊断部分） | 1 | 成立：interview-service.ts:240-255 | 维持 |
| #72 | ASR/TTS 不经过 invoke，没有额度预留和成本记账 | AC-F22（语音子项） | 1 | 成立 | 维持 |
| #210 | 押题分数是伪分（40+20n） | AC-F22（子项） | 1 | 成立 | 维持 |
| #196、#44、#50 | 隐私最小化在“已同意用途”内也过度收紧（产品权衡） | PF-F-13 | 1 | 部分成立：持久化最小化本身正确，问题在于把运行时推理输入也一并去掉了；结论已并入 #196/#44/#50 | 不单列 |
