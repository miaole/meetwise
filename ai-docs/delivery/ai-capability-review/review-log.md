# 复核日志（review-log）

- 范围：agent-capability-benchmark.md（AI-01–07 及正文结论）、langgraph-deep-review.md（LG-01–23）、explore/lg-runtime.md（F1–F11，记为 LR-F1–F11）、explore/product-fit.md（F-01–F-13，记为 PF-F-01–13）、explore/ai-cost-context.md（F1–F22，记为 AC-F1–F22，含第二轮修正）。
- 方法：逐条回到 commit 2fab7946 的源码 file:line 读码复核；LangGraph 相关推断对照 npm 包 @langchain/langgraph 1.4.7、checkpoint-postgres 1.0.4、checkpoint 1.1.3 的 dist 源码；缓存相关对照百炼与 DeepSeek 官方文档（2026-10-12 抓取）；token 数用 HuggingFace 上的 Qwen2.5-7B-Instruct 与 DeepSeek-V3 tokenizer.json 离线实测。
- 结论取值：成立 / 部分成立 / 不成立 / 无法从代码判定。“复核定级”为“—”表示已归入审计总表编号，以总表定级为准。
- 原始条目共 77 行（AI 7 + LG 23 + LR 11 + PF 13 + AC 22 = 76，另加 1 条正文推断结论）。

## 一、逐条结论

| 源编号 | 原定级 | 复核结论 | 复核定级 | 归并到 | 理由 / 证据 |
|---|---|---|---|---|---|
| AI-01 | P1 | 成立 | P1 | AG-02 | generate-question.ts:14-26,64-81；adaptive-interview-service.ts:86-91,167-187。补充：AI-01 说“JSON 失败 fail-closed”没错，但根因是 JSON 解析失败被记为 unknown，另立 AG-06 |
| AI-02 | P2 | 成立 | —（总表 #203/#206 已定） | #203/#206/#252 | memory-store.ts:47-56；adaptive-interview-service.ts:66-71 |
| AI-03 | P3 | 成立 | P3 | AG-20 | rg 排除 test/proof 后，mem*/memory-* 原语在 apps 中零调用 |
| AI-04 | P3 | 成立（高估倍数比原文更严重） | P2（估算部分）/P3（裁剪部分） | AG-12、AG-20 | 原文“约高估 2–3 倍”；本次用 Qwen2.5 tokenizer 实测 interviewer.ask 的 system 为 2245 字节对 606 token，约 3.7 倍 |
| AI-05 | P2 | 成立 | —/P2 | #79/#77/#202、AG-13 | adaptive-interview-service.ts:118-121；crag.ts:29-40；qbank-generation-retrieval.ts:197-212 |
| AI-06 | P3 | 成立 | P3 | AG-17、AG-18 | model-client.ts:154-158,415；invoke.ts:927 |
| AI-07 | P3 | 部分成立 | P3 | AG-38 | 请求体确实没有 tools，但 tools.ts:44 存在 runToolLoop（只导出、零生产调用），“全仓没有工具循环”的表述不准确 |
| AI 正文“缓存可省 25–35% 输入费” | — | 无法从代码判定 | — | #48 | 这是推断值；百炼下前缀不足 1024，实际可能接近 0；DeepSeek 下取决于线上命中率 |
| LG-01 | P1 | 成立 | P1（建议总表 #44 上调） | #44 | 见总表引用表 |
| LG-02 | P2 | 成立 | P2 | #196 | adaptive-lifecycle.ts:196-197；state.ts:67-75 |
| LG-03 | P1 | 成立 | P1 | AG-05 | adaptive-lifecycle.ts:240-261,310-317；LangGraph 1.4.7 loop.js:796 每个 superstep 都写 checkpoint（durability 默认 async，index.js:891） |
| LG-04 | P1 | 成立 | P1 | AG-04 | interview-consumer.ts:376-387 |
| LG-05 | P1 | 成立 | P1 | AG-03 | main.ts:173；0130:179-180。原文问“是否即 #196”：不是，#196 是简历问题；与 #229 相关但根因不同 |
| LG-06 | P2 | 部分成立 | — | AG-03（重放部分）、#204/#186（下游联动部分） | (1) 报告成功后重试拿到 cached：属实，但目前没有“重新生成”入口，只有失败重试；(2) 职业路径不联动：由 #204 覆盖 |
| LG-07 | P1 | 成立（触发属推断） | P2 | #2 | commerce.ts:26；interview-consumer.ts:221-238 |
| LG-08 | P2 | 成立 | P3 | AG-28 | interview-graph-lease.ts:40-46。后续投影有 fence 和面试终态拦截，实际危害小，下调 |
| LG-09 | P2 | 成立 | — | #8 | interview-graph-lease.ts:81-86 |
| LG-10 | P2 | 成立（代码），触发属推断 | P3 | AG-29 | interview-graph-lease.ts:54-56 |
| LG-11 | P2 | 成立 | — | #7 | 原文已自注为对 A.5 的引用 |
| LG-12 | P2 | 成立 | P3 | AG-30 | state.ts:123；0048:429-433。原文按 120 轮估算“TB 级/月”，但软预算约 10–17 题，量级高估 |
| LG-13 | P2 | 成立 | P3 | AG-31 | graph.ts:27 的 release 只出现在 observer 中 |
| LG-14 | P3 | 成立 | P3 | AG-27 | 对照 LangGraph 1.4.7 dist/graph/state.js:432：compile 不接受 recursionLimit |
| LG-15 | P2 | 成立 | P3 | AG-32 | await-answer.ts:32-38；voice-turn.ts:16 只在无生产调用方的预览路径上；本次补读 voice-adaptive.proof.ts，确认它用的是假 seam |
| LG-16 | P3 | 成立 | P3 | AG-33 | checkpoint-principal.ts:67-83,136-163，每次查询额外 8 次往返 |
| LG-17 | P2 | 部分成立 | P3 | AG-25 | 只在崩溃重放路径上触发 |
| LG-18 | P3 | 成立 | P3 | AG-26 | LangGraph 1.4.7 loop.js 的 _first：非 null 输入写入 START 通道，重新开始一轮执行 |
| LG-19 | P3 | 成立（推断） | P3 | AG-34 | interview-graph-lease.ts:18,55-56 |
| LG-20 | P2 | 成立 | P2 | AG-15 | graph.ts:19-29 |
| LG-21 | P2 | 成立 | P2 | AG-16 | voice-adaptive.proof.ts 已补读：fake start/submit(string)，不经过 answerId 契约 |
| LG-22 | P3 | 成立 | P3 | AG-35 | mock-interview.ts:15-21；db/index.ts:55-64 |
| LG-23 | P3 | 成立 | P3 | AG-36 | pnpm-workspace.yaml:14-17；packages/db/package.json:97-98 |
| LR-F1 | P1 | 成立 | P1 | AG-05 | 同 LG-03 |
| LR-F2 | P1 | 成立（机制），触发属推断 | P2 | AG-09 | model-client.ts:530-553；0130:163-164。要等 AG-05 修复后的续跑或 start 重投才会触发，频率低于 LR-F1 |
| LR-F3 | P1 | 成立 | P1 | AG-04 | 同 LG-04 |
| LR-F4 | P2 | 成立 | — | #7 | — |
| LR-F5 | P2 | 成立（代码） | P3 | AG-29 | interview-jobs.ts:121-147,222：queued 的 requeue 不受 attempts 限制 |
| LR-F6 | P2 | 部分成立 | P3 | AG-26 | “concluded/failed 线程上 invoke({}) 从 START 重开”机制成立；但终态面试的 job 会在 consumer 的 reference gate（interview-consumer.ts:202）被拦下，实际触发面窄 |
| LR-F7 | P2 | 成立 | P3 | AG-31 | — |
| LR-F8 | P2 | 成立 | P1（上调） | AG-03 | 报告“失败自动重试/手动重试”是产品明确承诺，现实现完全不生效 |
| LR-F9 | P3 | 不成立（就现状而言） | — | — | rg redactOutput：评分路径不设置；只有 resume-ocr.ts:141 和 job-route-classify.ts:171 设置。属于防回归建议，不是现存缺陷 |
| LR-F10 | P3 | 成立 | P3 | AG-30、#8 | — |
| LR-F11 | P3 | 部分成立 | P3 | AG-35/AG-27/AG-34/#9 | legacy、连接占用、PgBouncer 成立；“recursionLimit=64 生效、interrupt 会重置计数”的前提不成立（被忽略，实际是 25）；“Command(resume) 打到非 interrupt 状态会被忽略并续跑”无法从代码判定，需要运行 |
| PF-F-01 | P0 | 成立 | — | #40/#20 | — |
| PF-F-02 | P1 | 成立 | P1（建议 #44 上调） | #44 | — |
| PF-F-03 | P1 | 成立 | — | #196 | — |
| PF-F-04 | P2 | 部分成立 | — | #77/#79/#38 | 机制成立；“用户难以感知越答越难”属推断，没有评测 |
| PF-F-05 | P2 | 成立 | — | #238/#133/#259 | — |
| PF-F-06 | P1 | 成立（触发属推断） | P2 | #2 | 有意设计 + 退额度，P1 偏高 |
| PF-F-07 | P1 | 成立 | — | #256 | — |
| PF-F-08 | P1 | 成立 | P1 | AG-02 | — |
| PF-F-09 | P1 | 成立 | — | #50/#204 | — |
| PF-F-10 | P2 | 成立 | — | #203/#206/#252 | — |
| PF-F-11 | P0/P1 | 成立 | — | #271/#197/#258 | — |
| PF-F-12 | P2 | 成立 | P2 | AG-10 | adaptive-lifecycle.ts:359-372 |
| PF-F-13 | P3 | 部分成立（产品权衡） | — | #196/#44/#50 | 持久化最小化本身正确，问题出在运行时推理输入 |
| AC-F1 | P2→P2 | 部分成立 | — | #48 | 百炼：实测全部前缀低于 1024（官方文档已核实阈值和 20% 计价），结论成立；DeepSeek 默认 profile：官方文档没有 1024 门槛，也没有“64 token 粒度”，按前缀单元匹配并自动检测公共前缀，“零收益”无法判定 |
| AC-F2 | P2 | 成立 | — | #48/#49 | model-client.ts:406,452 只读 prompt_tokens/completion_tokens；DeepSeek 字段名 prompt_cache_hit_tokens 已由官方文档核实（原文标“推断”） |
| AC-F3 | P2 | 成立 | P2 | AG-11 | invoke.ts:742-746；0088:162 |
| AC-F4 | P2 | 成立 | P2 | AG-12 | 实测约 3.7 倍 |
| AC-F5 | P2 | 成立 | P3 | AG-20 | 目前是单轮调用，没有用户影响 |
| AC-F6 | P3 | 成立 | P3 | AG-21 | — |
| AC-F7 | P2 | 成立 | P3 | AG-17（+AG-02） | 失败结束整场的后果归入 AG-02 |
| AC-F8 | P3 | 部分成立 | P3 | AG-19 | catalog 已标 @deprecated、零调用方，“版本号过时”不成立 |
| AC-F9 | P3 | 成立 | P3 | AG-18 | — |
| AC-F10 | P2 | 成立（阈值），分布属推断 | P2 | AG-13（+#79） | — |
| AC-F11 | P2 | 成立 | — | AG-02、#44/#196 | — |
| AC-F12 | P3 | 成立 | — | #203/#206 | — |
| AC-F13 | P3 | 成立 | P3 | AG-24 | model-client.ts:400，只影响 G7 测试路径 |
| AC-F14 | P1 | 成立 | P1 | AG-06 | model-client.ts:446-448,471-473,523 |
| AC-F15 | P2 | 成立 | P2 | AG-14 | invoke.ts:339-347；model-client.ts:452；rag-cost-governance.ts:127 |
| AC-F16 | P1 | 成立 | P1 | AG-02 | — |
| AC-F17 | P2 | 部分成立 | P1（报告部分） | AG-03、#213 | 更正：validateReportContent 在 invoke 的 businessValidate 内（interview-service.ts:291-311），不是在 invoke 之外抛错；结果一样记为 failed；“重排后只回放失败”经 0130:179-180 核实成立（原文标“推断”） |
| AC-F18 | P2 | 成立（部分推断） | P3 | AG-22 | 路由分类调用量小，成本影响有限 |
| AC-F19 | P2 | 成立 | P2 | AG-08 | 本次补充：invoke.ts:656-697 claim 之后的 failover 会因为 cost policy 不同被拒 |
| AC-F20 | P1 | 成立 | P1 | AG-07 | usage-calibration-reconciler.ts:103-140；0119:399-413 |
| AC-F21 | P3 | 成立（有意取舍） | P3 | AG-23 | main.ts:560-563 的作者注释说明了原因 |
| AC-F22 | P2/P3 | 部分成立 | P3 | AG-24、#72、#210 | “embedder.ts 注释写 1024”不成立（现注释是“生产默认值；维度必须由冻结评测集…决定”） |

## 二、被否定或部分否定的条目（单列）

| 源编号 | 结论 | 被否定的部分 / 原因 |
|---|---|---|
| AI-07 | 部分成立 | 请求体确实没有 tools，但 tools.ts:44 存在 runToolLoop（只导出、零生产调用），“全仓没有工具循环”的表述不准确 |
| AI 正文“缓存可省 25–35% 输入费” | 无法从代码判定 | 这是推断值；百炼下前缀不足 1024，实际可能接近 0；DeepSeek 下取决于线上命中率 |
| LG-06 | 部分成立 | (1) 报告成功后重试拿到 cached：属实，但目前没有“重新生成”入口，只有失败重试；(2) 职业路径不联动：由 #204 覆盖 |
| LG-17 | 部分成立 | 只在崩溃重放路径上触发 |
| LR-F6 | 部分成立 | “concluded/failed 线程上 invoke({}) 从 START 重开”机制成立；但终态面试的 job 会在 consumer 的 reference gate（interview-consumer.ts:202）被拦下，实际触发面窄 |
| LR-F9 | 不成立（就现状而言） | rg redactOutput：评分路径不设置；只有 resume-ocr.ts:141 和 job-route-classify.ts:171 设置。属于防回归建议，不是现存缺陷 |
| LR-F11 | 部分成立 | legacy、连接占用、PgBouncer 成立；“recursionLimit=64 生效、interrupt 会重置计数”的前提不成立（被忽略，实际是 25）；“Command(resume) 打到非 interrupt 状态会被忽略并续跑”无法从代码判定，需要运行 |
| PF-F-04 | 部分成立 | 机制成立；“用户难以感知越答越难”属推断，没有评测 |
| PF-F-13 | 部分成立（产品权衡） | 持久化最小化本身正确，问题出在运行时推理输入 |
| AC-F1 | 部分成立 | 百炼：实测全部前缀低于 1024（官方文档已核实阈值和 20% 计价），结论成立；DeepSeek 默认 profile：官方文档没有 1024 门槛，也没有“64 token 粒度”，按前缀单元匹配并自动检测公共前缀，“零收益”无法判定 |
| AC-F8 | 部分成立 | catalog 已标 @deprecated、零调用方，“版本号过时”不成立 |
| AC-F17 | 部分成立 | 更正：validateReportContent 在 invoke 的 businessValidate 内（interview-service.ts:291-311），不是在 invoke 之外抛错；结果一样记为 failed；“重排后只回放失败”经 0130:179-180 核实成立（原文标“推断”） |
| AC-F22 | 部分成立 | “embedder.ts 注释写 1024”不成立（现注释是“生产默认值；维度必须由冻结评测集…决定”） |

## 三、定级调整（原定级 → 复核定级）

| 源编号 | 原定级 | 复核定级 | 理由 |
|---|---|---|---|
| AI-04 | P3 | P2（估算部分）/P3（裁剪部分） | 原文“约高估 2–3 倍”；本次用 Qwen2.5 tokenizer 实测 interviewer.ask 的 system 为 2245 字节对 606 token，约 3.7 倍 |
| LG-07 | P1 | P2 | commerce.ts:26；interview-consumer.ts:221-238 |
| LG-08 | P2 | P3 | interview-graph-lease.ts:40-46。后续投影有 fence 和面试终态拦截，实际危害小，下调 |
| LG-10 | P2 | P3 | interview-graph-lease.ts:54-56 |
| LG-12 | P2 | P3 | state.ts:123；0048:429-433。原文按 120 轮估算“TB 级/月”，但软预算约 10–17 题，量级高估 |
| LG-13 | P2 | P3 | graph.ts:27 的 release 只出现在 observer 中 |
| LG-15 | P2 | P3 | await-answer.ts:32-38；voice-turn.ts:16 只在无生产调用方的预览路径上；本次补读 voice-adaptive.proof.ts，确认它用的是假 seam |
| LG-17 | P2 | P3 | 只在崩溃重放路径上触发 |
| LR-F2 | P1 | P2 | model-client.ts:530-553；0130:163-164。要等 AG-05 修复后的续跑或 start 重投才会触发，频率低于 LR-F1 |
| LR-F5 | P2 | P3 | interview-jobs.ts:121-147,222：queued 的 requeue 不受 attempts 限制 |
| LR-F6 | P2 | P3 | “concluded/failed 线程上 invoke({}) 从 START 重开”机制成立；但终态面试的 job 会在 consumer 的 reference gate（interview-consumer.ts:202）被拦下，实际触发面窄 |
| LR-F7 | P2 | P3 | — |
| LR-F8 | P2 | P1（上调） | 报告“失败自动重试/手动重试”是产品明确承诺，现实现完全不生效 |
| PF-F-06 | P1 | P2 | 有意设计 + 退额度，P1 偏高 |
| AC-F5 | P2 | P3 | 目前是单轮调用，没有用户影响 |
| AC-F7 | P2 | P3 | 失败结束整场的后果归入 AG-02 |
| AC-F17 | P2 | P1（报告部分） | 更正：validateReportContent 在 invoke 的 businessValidate 内（interview-service.ts:291-311），不是在 invoke 之外抛错；结果一样记为 failed；“重排后只回放失败”经 0130:179-180 核实成立（原文标“推断”） |
| AC-F18 | P2 | P3 | 路由分类调用量小，成本影响有限 |

## 四、推断类结论的外部核对

| 推断 | 核对来源 | 结论 |
|---|---|---|
| LangGraph 每个 superstep 都写 checkpoint | @langchain/langgraph 1.4.7 dist/pregel/index.js:891（durability 默认 "async"）、loop.js:796（非 "exit" 时每步都 put） | 成立；async 模式下崩溃时最新一步的 checkpoint 可能丢失 |
| recursionLimit 写在 compile() 上被忽略 | dist/graph/state.js:432 compile 只解构 checkpointer/store/cache/interruptBefore/interruptAfter/name/description/transformers；默认值 25 见 pregel/utils/config.js:36 | 成立 |
| invoke({}) 会从 START 重开 | dist/pregel/loop.js 的 _first：非 null、非 Command 输入映射到 START 通道并丢弃待执行任务 | 成立 |
| Command(resume) 打到非 interrupt 状态的行为 | loop.js 的 isResuming 判定可读，但具体效果取决于 pending writes | 无法从代码判定，需要运行 |
| 百炼缓存门槛 1024 token、隐式命中按 20% 计价 | help.aliyun.com/zh/model-studio/context-cache（显式/隐式缓存最少 1024 token；隐式 cached_token 为 input 单价的 20%；显式创建 125%、命中 10%；usage.prompt_tokens_details.cached_tokens） | 成立 |
| DeepSeek 缓存 64 token 粒度 | api-docs.deepseek.com/zh-cn/guides/kv_cache（现行文档：按“缓存前缀单元”整体匹配，会在请求结束位置、检测到的公共前缀和固定 token 间隔处落盘；字段为 prompt_cache_hit_tokens / prompt_cache_miss_tokens） | 无法核实：现行文档没有写 64 token 粒度，也没有写最小门槛 |
| system 前缀 token 数（原文为经验估算约 620） | 本次用 Qwen2.5 tokenizer 实测：evaluate 670、ask 606、route-classify 474、diagnosis 374、vision 230、report 182、quiz 176、planner 172；DeepSeek-V3 tokenizer 为 167–629 | 成立（全部低于 1024）；qwen-plus 线上分词器与开源 Qwen2.5 可能略有差异 |

## 五、补盲阅读记录

- `apps/worker/src/interview-consumer.ts`（通读到 :448）：确认 AG-04 的错误分类、AG-37 的 deficit 每次 claim 归零（:257-273）。
- `apps/worker/src/adaptive-lifecycle.ts`（通读）：确认 AG-05、AG-10、AG-26；recordAskedQuestions 只在 done 时写（:386-388），所以中途失败的场次不计入跨场判重，这是合理的。
- `apps/worker/src/memory-service.ts`、`packages/db/src/memory-store.ts`：确认 #203/#206；没有新问题。
- `qbank-*.ts`（worker 6 个、db 10 个）：重点读了 qbank-track-local-retrieve.ts、qbank-planner-retrieval-plan.ts、qbank-generation-retrieval.ts、domain qbank-track-local-retrieval.ts / job-route-classifier.ts → 新增 AG-37；planner 的 competency 是自由文本（≤64 字符），可以通过 validatePlannerOutput；其余文件主要是缓存、摄取、epoch 治理，没有发现新的 AI 能力问题（#78 已覆盖精确哈希去重）。
- 迁移 0048（物理擦除，checkpoint 唯一删除路径 :429-433）、0085（逻辑节点 dispatch slot 一旦派发永不释放，:3-7）、0088（预留等值触发器 :162、fail_claim :581-620）、0130（claim 最新定义；:135-145 同逻辑节点换新键也会被 logical_node 拒绝）、0144（触发器函数族收敛，与 AI 运行时无关；GRANT PUBLIC 已由 #150 覆盖）。
- 由 0085/0130 得出的对修法的重要修正：AI-01、AC-F7、AC-F16、LG-05 建议的“换一个幂等键重试”只有在 operation.businessRevision 也一起变化时才有效。出题的 businessRevision 是 `${threadId}:ask:t${turn}`（adaptive-interview-service.ts:151），报告是 `${interviewId}:report`。
- `apps/worker/test/voice-adaptive.proof.ts` + `apps/worker/src/voice-adaptive.ts`：proof 注入的是假 start/submit(answer: string)，与真实 submitAdaptiveAnswer 的 {questionId, answerId} 契约不一致，所以 CI 绿不能说明语音路径可用（并入 AG-32）。
- 本次新增（原 5 份报告都没有）：AG-01（准入拒绝写成 failed 终态，P1）、AG-37（检索 deficit 归零，P3），以及 AG-08 里补充的 failover 证据。

## 六、自检记录（2026-10-12）

- md/csv 对账：issues-final.csv 有 38 行，issues-final.md 有 38 个详情标题和 38 行总览表；编号、严重度、维度、标题逐条一致（脚本比对 0 差异）；维度取值都在 9 个枚举内。
- 编号连续：AG-01–AG-38，无缺号、无重号。
- 随机抽 10 条回读源码（seed=20261012，抽中 AG-01/02/03/04/05/06/13/15/27/37），逐条重新打印 file:line，与结论一致：
  - AG-01：invoke.ts:634-640 准入失败调用 failModelInvocationClaim；0130:179-180 failed 终态；0120:52-57 种子为 4/5/30000。
  - AG-02：generate-question.ts:14-26 failClosed 置 concluded:true；service :86-91 attempt≠0 拒绝；:178-187 duplicate_question。
  - AG-03：main.ts:173 固定 `${interviewId}:report`；invoke.ts:615-616 cached/failed/unknown 均为终态。
  - AG-04：interview-consumer.ts:376-387 只有 graph_fence_lost 会 requeue。
  - AG-05：adaptive-lifecycle.ts:240-261 alreadyApplied 时 snap=before、不 invoke；done 取决于 snap.next。
  - AG-06：model-client.ts:446-448 无 content→unknown；invoke.ts 的 unknown 分支 markAiCostUnknown 并以 'failure' 释放准入。
  - AG-13：qbank-generation-retrieval.ts:210 score=max(0,1−distance)；crag.ts:30 阈值 0.7/0.3/0.5。
  - AG-15：graph.ts:19-29 observer 只记 graph/node/turn/stateVersion/release。
  - AG-27：graph.ts:57 vs LangGraph dist/graph/state.js:432；默认值 25（pregel/utils/config.js:36）。
  - AG-37：interview-consumer.ts:257-258 每次 claim 把 deficit 初始化为全 0。
