# AG-COST5 — 成本轨第⑤步：AG-08 熔断键按端点∥（MODEL-OP-02 准入/熔断/并发分区键从注册表硬编码 dashscope-main/cn-beijing 改随实际端点+主备分别建种子+claim 后 failover 同 cost scope 预绑定切换〔裁决项③定行使度〕）（B 席六步之⑤ · EXEC REQUEST）

**Status**: **`executed:awaiting_post_prove_dual`**（EXEC 施工席完工停·⛔push·est live=0。pre-exec 双审 rev2 双 PASS+协调方授权开工在案；并线主线 @`12ecb34b`→merge `338e5f1b` 零冲突·三件落值+门矩阵全绿见 §9 EXEC 附记。Ban self-approve · alone≠dual · post 双审未过 ≠ 收官）

**席位**：meetwise 战役 AG 成本轨第⑤步起草席（AG-08 熔断键按端点∥ · EXPERT-REVIEWS §七 :67 成本轨 B 席六步之 **⑤**「⑤AG-08 熔断键按端点∥」——①止血+观测已 nail `6f2ed876`、②迁移 dfcadd9e 收官、③AG-12 已 nail `9d69a5b1`（0184 在链）、④AG-11 三件套+EG-B2 EXEC 在飞（`line/ag-cost4` @`e100a2a7`·0188 已占·STOP=`executed:awaiting_post_prove_dual`）·**⑤=队列下一刀**·系失败语义轨六刀（全收官）与 cost④ reserve/settle 面之外的**模型客户端熔断新面**（AG-08 原案）：本刀「熔断」=0120 MODEL-OP-02 durable 共享熔断（`ai_model_breaker_state`）·与 AG-24 已删 in-process 死代码（circuit-breaker.ts/rate-limit-model.ts·`724d61b5` 主线在链）零关零复活）。
**基线**：`feat/mysql-schema-skeleton` @ **`d68ffe17`**（本工作树 tip·AG-39 nail 收官随翻笔·合并后迁移链深 **187**·`ls packages/db/migrations | wc -l`=187 亲证）。分支 `line/ag-cost5` · 工作树 `meetwise-cost5`（`git worktree add -b line/ag-cost5 d68ffe17` 初建即在本 tip·`git status --short` 除本卷外零输出亲证）。**在飞交叠披露**：cost④（`line/ag-cost4`）已改 `packages/ai-runtime/src/invoke.ts`（reserve LEAST :862 区+settle 解构 :963/:1064 区）未并主线——本刀 invoke.ts 触面（admit 区 :664-:833）与其零同区·并线预合成义务见 §0.3-2。
**防重双对表（亲证 @`d68ffe17`）**：`rg -il "ag-cost5" ai-docs/ packages apps` → 零命中（仅本卷）；`ls ai-docs/delivery/harness/ | grep cost5` → 零同名刀卷（cost1/2/3 卷在案·cost4 卷在 cost4 支线未并线）；`ls packages/db/migrations | sort` 链顶=**0187**（0188=cost④ 支线已实落 `0188_ag11_cost_reserve_least_and_settle_relax.sql`·`git -C meetwise-cost4 ls-tree` 亲证；0190-0199=5B-MIG 在飞实落·`meetwise-b5m` @`7152cd3c` 树链顶 0199 十卷 ls 亲证〔rev2 亲证更正：旧记「0189 拟占零实落/链顶 0184」已失效〕；S4b 树链顶 0181 零实落亲证）→ **本刀迁移号 0200**（EXEC 立项日按主线链顶顺延实测·`scripts/check-migration-version-uniqueness.mjs` 终裁）。→ **停止条件未触发·可落卷**。
**蓝本**：①`ai-docs/delivery/ai-capability-review/EXPERT-REVIEWS.md` **§七 :67 成本轨⑤（修法权威：「⑤AG-08 熔断键按端点∥」）** + **§八 :78**（「成本域：17 条逐条回码全成立·定级零翻案（除 AG-07 见一）·修法两处事故级修正（三/四）」——**⑤ 修法无事故级修正=issues-final :144 原文即字面权威**）+ **§六 :55 EG-B5**（P3「fast/主模型共享 budget scope+admission 键」·相邻独立在册=本刀范围外 §3-3）②同目录 `issues-final.md` AG-08 总览 **:20** + 详情 **:136-145**（复核结论 :138「成立（已核实；"备用无效"结论来自 invoke 流程读码，未实跑）」·源编号 :140「AC-F19」·file:line **:141** 六锚（registry :62-103／0120:52-57／0131:14／invoke.ts:634-646 共享准入在 failover 之前／:656-697 half-open 后 failover 遇 cost policy 不同→model_failover_cost_policy_mismatch／text-endpoint-config.ts:77）·触发例 :142「DeepSeek 主端点故障 → 共享熔断（键名为 dashscope-main）打开 → 百炼备用端点的请求在共享准入阶段同样被拒」·用户影响 :143「主备切换形同虚设，主端点出故障时整站 AI 功能不可用，并叠加 AG-01」·修法 **:144 原文「admission 键改为"端点 profile 的 provider|region"，主备分别建种子；failover 允许在同一 cost scope 内切换到预先绑定的备用价格行。」=本刀修法权威逐字）③同目录 `review-log.md` AC-F19 **:85**（P2 成立·「本次补充：invoke.ts:656-697 claim 之后的 failover 会因为 cost policy 不同被拒」）+ **:152**（AG-08 failover 证据系本次补盲新增）④同目录 `LANDING-INDEX.md` §四 **:35**（「成本侧（AG-08/11/12/14+#48 观测）」刀队列）⑤前序四刀卷：`ag-cost2-migrate-REQUEST.md` **:81**（「AG-11 三件套+补收（成本轨④）/ AG-08 熔断键（⑤）/ EG-B1 unknown ageing：零触」）+ `ag-cost3-REQUEST.md` **:106**（「⑤AG-08 熔断键按端点…：零触」）+ `ag-cost4-REQUEST.md` **§3-1**（「⑤AG-08 熔断键按端点（成本轨下一刀）：breaker/admission 键面零字节——本刀 reserve/settle 面与其零交集」）+ **§0.3-2**（「⑤AG-08 熔断键按端点=队列下一刀（现无在飞支线·本刀与其零文件冲突预期：AG-08 面=breaker/admission 键）」=**本刀正是该后继·四刀让位全数兑现**）⑥AG-24 收官卷（`724d61b5` 主线在链·删 circuit-breaker.ts 131 行+rate-limit-model.ts 162 行+breaker.proof.ts 138 行·并线 commit 自证「failoverModel 生产活导出(interview-service.ts:9/:227+model-cost-governance.proof.ts:10 亲证)零字节零触」=本刀路由面消费锚·死代码面零复活=§5 Ban）⑦形制沿 `ag-cost4-REQUEST.md` / `ag-cost3-REQUEST.md`（§0-§8·Ban/pins 同源誊录见 §5）。

## §0 现状锚（起草席亲读·base `d68ffe17`·file:line 逐条 rg/sed/Read/git ls-tree 实测复核·**EXEC 立项照本节重 pin**——基线漂移如实改锚·结论不变则只更行号）

### 0.1 blob 锚表（@`d68ffe17`·`git ls-tree` 实测·12 位短 blob·EXEC 立项逐条对 blob·漂则重 pin）

| # | 文件 | blob | 角色 |
|---|---|---|---|
| 1 | `packages/ai-runtime/src/model-operation-registry.ts` | `63af556fd166` | **红点①主面**：:62-104 `WIRED_TEXT_OPERATIONS` **七 text op 全部 `admission:{providerAccount:'dashscope-main',region:'cn-beijing',…}` 写死**（:65/:70/:75/:80/:85/:90/:101 七行·issues-final :141 锚「:62-103」实测现界 :62-104——job.route-classify :99-103 系 0131 后在列·微漂结论不变）·:112-118 vision（dashscope-native）·:219 `modelOperationAdmissionKey`（providerAccount\|region\|modelOrRecipe\|operationId 四字段键）·:254 admissionKey 派生——**键面与端点面脱钩=AG-08 命题核心** |
| 2 | `packages/ai-runtime/src/model-admission.ts` | `f2cccc243ed1` | :29-38 `ADMISSION_ERROR_CODES` 八决策→八码映射（:34 `model_circuit_open`/:35 `model_circuit_half_open`/:36 `model_concurrency_exhausted`）·:48-55 `ADMISSION_REFUSAL_RETRYABLE_CODES` 瞬时族六码·:44-45 注释「族外确定性拒绝（…failover cost policy mismatch）维持 failed 终态原样」·:66-74 `resolveModelAdmissionPartition`（**分区=registry `definition.admission` 四字段静态派生·端点无关=红点①机制位**）·:100-119 `admitSharedModelOperation` |
| 3 | `packages/ai-runtime/src/invoke.ts` | `030d273b1dd0` | :139-157 `ModelCallPlan`/`ReadyModelCallPlan` 类型（**件① plan 扩端点身份字段的类型落点**）·:348-364 `costPolicyBinding` 十三字段摘要+:378-380 `sameCostPolicyBinding` 全等·:386-389 `invocationDigest`（**digest 含 costPolicyBinding=件③墙一之源**）·:664 `const admissionPartition = resolveModelAdmissionPartition(spec)`（resolve 相位派生·**先于路由选择 :686**）·:740-763 admit 相位共享准入（:750 `if (admissionPartition)`+:751-753 `admitSharedModelOperation`+:754-761 拒绝臂）·:776-814 半开 follower 路由重试（**:806 `sameCostPolicyBinding` 等值门+:810 `model_failover_cost_policy_mismatch`**·issues-final :141 锚「:656-697」系 GODFN-1a 相位化搬移前旧行号·机制原值·§0.2 登记）·:816-833 本地 admission 拒绝臂（:820-822 码分流）·:865-869 `cost_${decision}` 预算拒绝——**准入三拒绝点=:754-761（共享）/:816-833（本地+超时）/:865-869（预算）**·:293-300 `refuseOrReleaseModelInvocationClaim` 分流 |
| 4 | `packages/ai-runtime/src/text-endpoint-config.ts` | `005c68ccce63` | :22 `TextEndpointProfile` **双 profile 闭集**（`'deepseek-cn-public'\|'dashscope-cn-beijing'`）·:37-40 profile→host/basePath 冻结注册表·:75-79 `resolveTextEndpointConfig`（**:77 `env.MODEL_ENDPOINT_PROFILE?.trim() \|\| 'deepseek-cn-public'`=issues-final :141 第五锚原行恒等**）·:90-101 `resolveTextBackupEndpointConfig`（:92 缺省 `'dashscope-cn-beijing'`）——**端点真身=profile 闭集·registry 键面=dashscope-main/cn-beijing·两套身份互不引用=脱钩实证** |
| 5 | `packages/ai-runtime/src/failover-model.ts` | `57141c576b07` | :11-40 `failoverModel`（:13-29 prepare 链式降级·primary not-ready/异常→试 backup·**纯预派发不读熔断状态**=「路由选择无法感知主端点熔断」机制位·:35 `plan.admit` 本地准入）——生产唯一路由链消费形 |
| 6 | `packages/ai-runtime/src/model-client.ts` | `bef16cbdc2a1` | :41-43 `ModelClient.prepare` 契约（「Pure endpoint selection」）·:641-649 `OpenAICompatibleClient.prepare` 返回形（`{ready,execute,cost,estimateInputTokens}`·**无端点身份字段**=件① 扩形落点·blob 系 AG-38 重钉值·本刀触则合法改写随卷登记）·:611-613 端点解析**三分支**（`cfg.backup===true → resolveTextBackupEndpointConfig()`／`cfg.vision===true → resolveVisionEndpointConfig(cfg.env ?? process.env)`／否则 `resolveTextEndpointConfig()`·rev2 亲证补录 vision 臂）——**端点身份字段仅 text 双 profile 族填充·`cfg.vision===true` plan 不填身份**（vision/dashscope-native 分区 registry 派生零漂·防 vision OCR 生产全断=件① carve-out 锚） |
| 7 | `packages/db/migrations/0120_model_op02_shared_provider_admission_ledger_breaker.sql` | `645a9a7347f9` | :28-44 `ai_model_admission_policy`（PK=provider_account,region,model_or_recipe,operation_id·:38 max_concurrency CHECK 1-1000·:40-41 breaker_threshold/cooldown）·:46-69 种子（**:52-57 文本 6 op 全 `('dashscope-main','cn-beijing',…,4,5,30000)`=issues-final :141 第二锚恒等**·:59 vision·:61-68 八 unwired blocked）·:101-115 `ai_model_breaker_state`（同四字键 PK·phase closed/open/half_open）·:120-130 `ai_model_concurrency_lease`·:132 REVOKE ALL·:140-277 `ai_model_admission_acquire_scoped`（决策码八值：:183 operation_unknown/:187 operation_blocked/:195 project_missing/:199 project_disabled/:217 breaker_open/:230 breaker_half_open_busy/:257 concurrency_exhausted/:272 admitted·:206-233 断路器入场按四字键锁行判相）·:287-386 `ai_model_admission_record_scoped`（:339-366 相位转移）——**主备同键=同熔断行+同并发槽系=红点①DB 侧固化** |
| 8 | `packages/db/migrations/0131_job_route_classify_admission.sql` | `41c86bc4f346` | :13-14 job.route-classify.v1 种子行（`('dashscope-main','cn-beijing','job-route-classifier','job.route-classify.v1','allowed','text-tokens',4,5,30000)`）=issues-final :141 第三锚原行恒等——allowed 种子总账=0120 七行+0131 一行=**8** |
| 9 | `packages/db/src/model-op/model-operation-admission.ts` | `afadd1b5e819` | :18-23 `ModelAdmissionPartition` 四字段接口·:25-37 `ModelAdmissionDecision` 八值 enum·:48-57 `acquireModelAdmission`（九参调 `ai_model_admission_acquire_scoped`·:52 provider/region 直传 partition 字段） |
| 10 | `packages/ai-runtime/src/index.ts` | `e37499b764f0` | :198-199 `failoverModel` 生产活导出（AG-24 保留令·interview-service :227 消费）——本刀零新增导出预期 |
| 11 | `apps/worker/src/interview-service.ts` | `bee3c139648d` | :208-227 `withFailover`（**:216-219 MODEL-OP-02 边界诚实声明原文「端点级（per-provider）failover 与『单一网关统一路由』一并延后到 MODEL-OP-04」=本刀与网关面的边界锚**·:221 primary=endpoint(...)（rev2 勘误 :222→:221）·:225 `isTextBackupEnabled(process.env)` 启用开关·:226 backup=endpoint({backup:true,…})·**:227 `return failoverModel([primary, backup])`=生产唯一路由链构造点**） |
| 12 | `apps/worker/src/interview-consumer.ts` | `27ddbcf1b0e9` | :249-261 瞬时准入拒绝族六码消费白名单（AG-D 刀 C 面「只增」）——本刀零改预期（§5 Ban） |
| 13 | `apps/worker/src/adaptive-interview-service.ts` | `527b927068bc` | :193-194 瞬时码判别（`model_circuit_open`/`model_circuit_half_open`/`model_concurrency_exhausted`/`budget*`）——零改预期 |
| 14 | `apps/worker/src/model-cost-governance.ts` | `f777c642ac88` | :98-125 `endpoint()`（:111 `provider: required(env, \`${prefix}_BILLING_PROVIDER\`…)`·:113 region 同形——**billing 身份=env 逐端点 price row 配置·主备各带 provider/region**=件②种子数据源机制位·本刀零字节） |
| 15 | `docker/env/worker.env.example` | `26fda44652ef` | :141 `MODEL_PRIMARY_BILLING_PROVIDER=dashscope`·:178-180 `MODEL_BACKUP_BILLING_PROVIDER=dashscope`/`MODEL_BACKUP_BILLING_MODEL=qwen-plus`/`MODEL_BACKUP_BILLING_REGION=cn-beijing`——主备 billing 身份 env 族在证（示例值两行同 dashscope·生产可异·故裁决② 种子身份源两选） |
| 16 | `packages/db/migrations/0130_model_invocation_same_key_claim_join.sql` | `239a0b19aea4` | **件③机制墙**：:163-164 `invocation.request_digest <> p_request_digest → 'failed' idempotency_key_payload_mismatch`（**墙一·比对先于一切状态臂含 expired-claimed 重领 :206-217**）·:167-170 cost_scope 等值（墙二·rev2 勘误 :168→:167）·:196-200 `ai_model_register_logical_node_header_scoped` 携 p_provider/p_model/p_region/p_price_revision（**墙三·logical node header 首认冻结**）——digest 含 costPolicyBinding（锚 #3 :386-389）⇒ 同键任何 binding 切换=墙一连环 |
| 17 | `packages/db/migrations/0088_ai_model_invocation_controlled_state_machine.sql` | `cbc07c09e1aa` | :480-580 `ai_model_transition_dispatched_scoped`（**:548-549 `r.provider=h.provider AND r.model=h.model`+`r.region=h.region AND r.price_revision=h.price_revision` 绑定等值四行（reservation vs header）+:550-551 token 等值两行+:553 raise `ai_model_dispatch_cost_reservation_binding_mismatch`**=件③墙四·blob 恒等对 cost4 §0.1 #2） |
| 18 | `packages/ai-runtime/test/model-op02-shared-provider.proof.ts` | `2bbadeb3fc52` | **主回归面**：`rg -c "A\('"` 实测 **24 臂**（rev2 恰数锚勘正·旧 quote-less 口径多计模板名臂 :267 一行）·:78 种子恰数臂 `allowedSeed===8` = **0200 落地必红预声明 carve-out**（§1-件②/§2-3/§5 三条款互锁）·:91-96 partition 构造（dashscope-main/cn-beijing 字面）·:114-160 熔断臂（trip→open→half_open→busy→复位）·:162-190 并发臂（4 槽+第 5 拒）——件①改造后新增端点分域臂同批 |
| 19 | `packages/ai-runtime/test/model-slot-bypass.static.proof.ts` | `daf99bdd9770` | **静态门（同批重钉面）**：`rg -c "A\('"` 实测 **14 臂**（**臂顶格**列零缩进——两空格缩进锚定式零命中·特注）·:70-71 「invoke 只从 spec 派生 admissionPartition」源码正则钉 `/const admissionPartition = resolveModelAdmissionPartition\(spec\);/`+:74 admit 调用守卫钉+:76 分区派生 fail-closed 钉——**件①在 admit 相位叠加端点身份改写时 :70-71 正则是否仍命中=裁决①(a) 落点设计约束（保 :664 原行即钉不破）** |
| 20 | `packages/ai-runtime/test/ag-d-admission.proof.ts` | `19f2c2e55c64` | `rg -c "A\('"` 实测 **23 臂**（rev2 勘正·旧口径多计模板名臂 :160/:191/:226 三行）·:86-92 六码族常量断言（零扩零缩锁）·:131-160 熔断三臂（breakerPartition=`resolveModelAdmissionPartition` 派生 quiz partition）——回归原值面 |
| 21 | `apps/worker/test/ag-d-admission.proof.ts` | `948f252aff9d` | `rg -c "A\('"` 实测 **15 臂**（rev2 勘正·worker 侧同族·0179 释放形）——回归原值面 |
| 22 | `packages/ai-runtime/test/model-slot-bypass.proof.ts` | `516b5d7683f8` | `rg -c "A\('"` 实测 **11 臂**（HC-GAP-009 运行面·无 operation 不写 lease）——零触回归面 |
| 23 | `packages/db/src/index.ts` | `2088940ab788` | :255-259 admission 族导出面——本刀零新增导出预期（cost④ 并线后该 blob 已漂 `7c9c00ed414c`→`2088940ab788`·本树即新值） |
| 24 | `packages/db/migrations/0033_ai_cost_governance.sql` | `2cce40191d81` | :19-24 `ai_cost_budget_policy`（:22 enabled——0120 :192-202 project_missing/project_disabled 决策的判据源）——本刀零字节（0188 已松绑 :35 表级 CHECK 系 cost④ 面） |
| 25 | `packages/db/migrations/0144_db_trigfam_unify.sql` | `29afdf465985` | :441-532 `tf_ai_cost_reserve_text`（:513-514 budget_exhausted 闸=cost④ 已钉现行体）——本刀零字节 |

### 0.2 漂移登记（复核快照=issues-final/review-log 引行 → 现树 `d68ffe17`·全亲读重 pin）

| 快照锚 | 现树重 pin（实测） | 漂移判读 |
|---|---|---|
| issues-final :141「invoke.ts:634-646（共享准入在 failover 之前）」 | :750-763（GODFN-1a 五相位搬移后·:751-753 admitSharedModelOperation 机制原值·共享准入仍先于半开路由重试 :776） | 行号大漂·机制原值 |
| issues-final :141「invoke.ts:656-697（half-open 后 failover→model_failover_cost_policy_mismatch）」 | :776-814（:806 sameCostPolicyBinding 等值门+:810 mismatch 码+:820-822 码放行·机制原值） | 行号大漂·机制原值 |
| issues-final :141「model-operation-registry.ts:62-103」 | :62-104（job.route-classify :99-103 系 0131 后在列） | 微漂·结论不变 |
| issues-final :141「0120:52-57」/「0131:14」/「text-endpoint-config.ts:77」 | 恒等 ✓✓✓（:52-57 六种子行/:14 classify 种子行/:77 缺省 profile 原行） | 零漂 |
| review-log :85「invoke.ts:656-697」 | 同上 :776-814 | 行号漂·机制原值 |
| 快照未列（本席补 pin） | 0130 :163-170/:196-200 三墙·0088 :548-553 墙四（绑定等值 :548-549 对 header 非 invocation 行——**墙四比较基准=ai_model_logical_node_header**（0130 :196-200 首认注册）· reservations 与 header 双向对表）·failover-model :13-29 prepare 不读熔断态·interview-service :216-219 MODEL-OP-04 延后声明·model-slot-bypass.static :70-76 正则钉·五 proof 臂数（`rg -c "A\('"` 口径 **24/14/23/15/11**·rev2 勘正·static 臂顶格特注） | 补 pin |

### 0.3 现势并发登记（强制）

1. **迁移号占用图（顺延规则实测）**：本树链顶=**0187**（0186+0187=AG-39 已并主线·187 文件亲证）；**0188=cost④ 已实落**（`line/ag-cost4` 支线 `0188_ag11_cost_reserve_least_and_settle_relax.sql`·EXEC 在飞 `e100a2a7`·`git ls-tree` 亲证）；**0190-0199=5B-MIG 在飞实落**（`meetwise-b5m` @`7152cd3c` 树链顶 0199·`0190_outbox_consumption_unique_concurrent.sql`→`0199_redundant_index_drop.sql` 十卷 ls 亲证·rev2 协调方裁决在案——旧记「0189 拟占零实落/链顶 0184」失效）；S4b 树链顶 0181 零实落亲证 → **本刀迁移号 0200**（本树主线链顶 0187·0200 空闲亲证；EXEC 立项日按主线链顶顺延实测·若 cost④/5B 已并线或有让位变化 find 实测顺延·`check-migration-version-uniqueness` 终裁）。本刀计划恰 1 新迁移（件② 种子·裁决②(a) 形；**裁决③(b) 行使且裁决②(a) 时 0200=种子单义卷**；若裁决②(b) 行使则 0200 空缺让位如实登记）。**非纯代码刀**（含迁移）。
2. **cost④ EXEC 在飞交叠**：`invoke.ts` 同文件不同区（cost④=:858-871 reserve LEAST 行+:963/:1064 settle 解构；本刀=:664-:833 admit 区+:139-157 类型区）+ `metrics.ts`（cost④ 面·本刀零触预期）。并线预合成义务：本刀 EXEC 立项/收尾各一次 `git merge --no-ff feat/mysql-schema-skeleton`（或反向预合成）·§0 blob 照并线后 tip 重 pin（沿 cost4 §9-1 先例·冲突预期零：两刀 invoke.ts 触区不重叠亲证）。`model-client.ts`（#6·`bef16cbdc2a1`=AG-38 重钉值）本刀件① 触 prepare 返回形即合法改写·随卷登记重锚。
3. **AG-24 死代码面避让**：`724d61b5` 已整删 circuit-breaker.ts（131 行）/rate-limit-model.ts（162 行）/breaker.proof.ts（138 行）+两 prove 门+alert ModelCircuitBreakerOpen 块+死 env 四处——**本刀「熔断」=0120 MODEL-OP-02 durable 共享熔断新面（AG-08 原案）·已删 in-process 旧面零复活零引用零重建**（§5 Ban·`rg "circuit-breaker|rate-limit-model" packages apps` **零活引用**——rev2 亲证 3 处在证皆删除在证非活引用：ai-runtime index.ts :196 删除注释／ag24 proof :132/:133/:137/:174 整删断言／errors index.ts :5 迁移注释）。其 commit 亲证「failoverModel 生产活导出零字节保留」=本刀 #10/#11 锚承继。
4. **跨轨/同族交点**：失败语义轨六刀全收官零文件交集（AG-D 0179 六码族=本刀零扩零缩·裁决③ 两形均不改族）；⑥回灌/显式缓存=后继零触；EG-B1/EG-B3/EG-B4=范围外；**EG-B5**（fast/主共享 budget scope+admission 键·EXPERT :55 P3）=相邻独立在册——本刀键按端点分域后 fast/主若同端点同 operation 仍同键·EG-B5 面零解零恶化·判归其自身刀位（§3-3）。**共享 SSOT 四件**（product-campaign-LEDGER/execution-master-checklist/issues-master/ai-capability-review）零触（刀位图翻面权归协调方）。**MODEL-OP-04 网关面**：interview-service :216-219 延后声明原值零改（§3-1/§5 Ban）。

## §1 红事实 + 修法

### 红事实 A：准入/熔断/并发键=注册表硬编码·与实际端点脱钩（issues-final AG-08 :136-145 第一半·现 pin 全亲证）

| 面 | 锚（@`d68ffe17` 实测） | 事实 |
|---|---|---|
| 键面写死 | registry #1 :62-104 七 text op `admission` 全 `dashscope-main/cn-beijing`（七行逐一） | 分区键 providerAccount\|region 与「请求实际打到哪个端点」零关联 |
| 端点真身 | text-endpoint-config #4 :77 缺省 `deepseek-cn-public`（主）+:92 缺省 `dashscope-cn-beijing`（备） | issues-final :136 标题「不随实际端点（默认 DeepSeek）变化」原话实证：键说 dashscope-main·流量默认走 DeepSeek |
| DB 侧固化 | 0120 #7 :52-57 种子+breaker/concurrency 同四字键（:101-130） | 主备共用同一 `ai_model_breaker_state` 行+同一组并发槽（max_concurrency=4·阈值 5·冷却 30s）=「主备共用一套熔断和并发 4」原话实证 |
| 拒绝连带 | 0120 :213-233（breaker_open/half_open_busy 按键拒绝） | issues-final :142 触发例原值：DeepSeek 故障→共享熔断（键名 dashscope-main）打开→百炼备用端点请求在共享准入阶段同样被拒·:143「主备切换形同虚设…叠加 AG-01」 |
| 第二重脱钩 | model-cost-governance #14 :111/:113 billing provider/region=env 逐端点·0120 种子=静态写死 | 部署侧主备 billing 身份可配（worker.env.example :141/:178-180）·准入键无法随部署变化——种子身份源两选=裁决② |

### 红事实 B：claim 后 failover 被 cost policy 全等门拒绝（issues-final 第二半·机制墙四层本席亲证）

| 面 | 锚（@`d68ffe17` 实测） | 事实 |
|---|---|---|
| 全等门 | invoke #3 :806 `sameCostPolicyBinding(replacement.plan.cost, plan.cost)`（:348-364 十三字段摘要+:378-380 全等）+:810 `model_failover_cost_policy_mismatch` | 备端点 price row 必异 provider/model/region/priceRevision 至少一项→半开路由重试恒拒·:44-45 注释明列族外终态——issues-final :141「claim 之后的 failover 也会因 cost policy 不同被拒」原值 |
| 墙一 digest | 0130 #16 :163-164 digest 不等→`idempotency_key_payload_mismatch` 终态（**先于一切状态臂·含 :206-217 expired-claimed 重领**）+digest 含 costPolicyBinding（invoke :386-389） | 任何「释放后携备端点 binding 重领」与「claim 行 binding 切换后重放」皆撞墙一——**与 AG-09（issues-final :147-156 request digest 不稳定）同承一根** |
| 墙二 scope | 0130 :167-170 cost_scope 等值（rev2 勘误 :168→:167） | 同 cost scope 内切换=蓝本 :144「在同一 cost scope 内」语义的库级既有锚（scope 等值已强制·切价不切账） |
| 墙三 header | 0130 :196-200 header 注册携四 binding 字段（首认冻结） | logical node header 首认主端点 binding·重领携备端点值撞 `logical_node_binding_mismatch` 族 |
| 墙四 transition | 0088 #17 :548-549 绑定等值四行（reservation vs header）+:553 raise | 即便前墙通·派发翻转仍按 reservation↔header 等值校验·备端点 reservation 必 raise `_binding_mismatch` |
| 路由无熔断感知 | failover-model #5 :13-29 prepare 纯函数+interview-service #11 :216-219「端级 per-provider failover…延后到 MODEL-OP-04」 | 主端点熔断时 prepare 仍选主端点 plan（无本地 admit·invoke :828 注释自证）——备端点启用面仅剩 primary prepare 异常/not-ready 一途=「备用端点基本用不上」机制全链 |

### §1-修法（issues-final :144 修法原文逐字为权威·两半分件·EXPERT §七 :67 步⑤题面「熔断键按端点∥」为刀名。迁移 **0200**+TS 增量·历史迁移 0001-0187 零字节。本刀含恰 1 新迁移〔裁决②(a) 形〕）

**件① 准入分区键改随端点（TS·EXPERT :67「熔断键按端点」+issues-final :144 第一半前句「admission 键改为『端点 profile 的 provider|region』」）**：

- `resolveModelAdmissionPartition`（model-admission.ts :66-74）**保持签名与 :664 调用点原行零字节**（保 model-slot-bypass.static :70-71 正则钉不破=裁决①(a) 落点设计约束）；端点身份在 **admit 相位 :750 区叠加**：plan 携带所选端点身份（件① 类型扩形：`ModelCallPlan` ready 臂 invoke.ts :139-157 增可选端点身份字段+model-client.ts :641-649 prepare 返回形填 `cfg.backup===true` 判别值——**仅 text 双 profile 族填充·`cfg.vision===true`（:612 vision 臂）plan 不填端点身份**（分区维持 registry 派生原值·dashscope-native vision 行 0120 :59 零漂·防 vision OCR 生产全断）+failover-model.ts :19 同形）→ admit 相位以 plan 端点身份改写 `admissionPartition.providerAccount|region` 后调 `admitSharedModelOperation`（:751-753）。**分区派生仍服务器派生绝不 caller 供**（model-admission.ts :4-6 头注铁律原值）·端点身份源自 text-endpoint-config profile 闭集/billing env 二选一（裁决②）·绝不由 spec 透传。
- 语义翻面：主端点流量与备端点流量自此分属两个 admission/breaker/concurrency 分区——同 operation 的 `modelOrRecipe|operationId` 不变（四字键后两维保持）·仅 providerAccount|region 两维随端点（issues-final :144「provider|region」原义逐字）。
- **零触面**：无 operation 路径（HC-GAP-009 缝·:664 返回 undefined 原值）·legacy cost-policy-only 路径（不走共享权威原值）·`ADMISSION_ERROR_CODES`/0120 决策码集（端点维度入键不入码·八决策八码原值）·0179 六码族与两消费白名单（#12 :249-261/#13 :193-194 零字节）·**vision/dashscope-native 分区路径**（model-client :612 vision 臂不填身份·0120 :59 vision 行零字节·rev2 增补）。

**件② 主备分别建种子（恰 1 新迁移 0200·issues-final :144 第一半后句「主备分别建种子」）**：

- 0200 `INSERT INTO ai_model_admission_policy … ON CONFLICT DO NOTHING`：七 text op × 主备两端点身份 = **14 行 allowed**（并发 4/阈值 5/冷却 30000 沿 0120 :52-57 原值·meter='text-tokens'）——端点身份值按裁决②：(a) profile id 形（`provider_account='deepseek-cn-public'·region='cn'` 等静态值·0120 :29 CHECK 正则 `^[A-Za-z0-9._-]{1,80}$` 收纳亲证）·**推荐**；(b) billing env 形（值部署可变→静态种子不可行·改 privileged upsert 命令沿 model-cost-governance configure 先例·0200 仅落框架）。
- dashscope-native 既有行（0120 :59 vision+:61-68 八 blocked·0131 :14 classify 主端点行）**零字节**——0131 classify 行与 0200 备端点 classify 行的关系=裁决② 行使时如实登记（备行补齐属 14 行内）。
- registry `admission` 字段（#1 七行）语义降级为「legacy/缺省回退值」并加注释指认端点身份真源（裁决② 定）——**七行字面值零删除**（静态门/proof 兼容）。

**件③ failover 同 cost scope 预绑定切换（issues-final :144 第二半「failover 允许在同一 cost scope 内切换到预先绑定的备用价格行」·裁决项③ 定行使度·墙一/三/四亲证=全量形系 identity 语义手术）**：

- **(b) 有界形（推荐）**：本刀兑现=件①件②全量+第二半数据面与可观测面——「预绑定端点对」**TS 常量对表**〔rev2 协调方单选裁决·原「数据表（或 TS 常量对表）」OR 消解：(b) 形 DB 数据表无读者=死重不采；**对表键=`endpoint profile id × operation_id`**（两端皆静态闭集）·主备 binding 映射留运行时派生（env 可变装不下静态种子的矛盾消解）〕；:806 全等门**语义零改**（mismatch 码 :810 终态原值·AG-D 族外原值）；墙一归一化改形**判归 AG-09 联动刀**（digest 归一化前置·issues-final :147-156 修法领地）·随卷登记承接关系。理由：墙一亲证=任何绕行必改 0130 identity 比较语义=AG-09 面·成本轨⑥与 AG-09 刀可衔接收口·本刀不越权。
- **(a) 全量形（须双审明示方可行使）**：0200 内对 0130 :163 digest 比较器+header 注册 :196-200 落「预绑定对归一化」（digest 计算仍含具体 binding·比较时先归一到对身份；header 允许对内换绑审计行）+0088 :548-549 零改（reservation 与 header 同换行后恒等自洽）——蓝本 :144 字面全兑现·**identity 语义手术·碰 AG-09 在册面**·行使则 §8 停止条件「越界需要」预申明升级为已授权。
- 附带（两形同）：半开路由重试放行面（若行使）写死=「scopeId 等值（墙二原值）+ 四元组属预绑定对白名单」·绝不放宽为任意换绑（Ban 面 §5）。

### 用户口径钉子（⛔ 不得更改）

「**凡是调用大模型的面都必须有合理的处理（缓存/计量/降级）**」——本刀承载其**降级半的可用性面**：主备切换不再形同虚设（熔断/并发按端点分域·issues-final :143「主端点出故障时整站 AI 功能不可用」的连带拒绝面拆除·:142 触发例由 §2-1③ 否证臂直证）+failover 语义边界如实行使（裁决③ 全量或有界·两形均如实登记不虚报）。计量半=①AG-07 止血+②迁移+③AG-12+④AG-11（0188 在飞）已承；缓存半=#48 观测（已落 `6f2ed876`）+⑥显式缓存（后继）。三半之外（预算政策/回灌接线/网关统一路由）各有在案机制·本刀不越权代管。

## §2 验收断言候选（prove 全假体·pre-exec 双审核对单基面·EXEC 立项重 pin·断言力≥3）

1. **端点分域 proof（隔离库真迁移链·沿 model-op02-shared-provider 形·新增臂或扩件）**：①主端点身份分区 admit ok（种子行在·decision=admitted·slot 认领）；②备端点身份分区独立 admit（同 operation 备 profile·独立槽系=**并发 4×2 容量实证**）；③**熔断分域否证臂（本刀承重断言=issues-final :142 触发例直证）**——主端点分区 5×failure trip→`model_circuit_open`·同 operation 备端点分区同刻 admit **ok=true**；④半开互不累及——主分区 half_open 探针被占（`breaker_half_open_busy`）不阻备分区 admit；⑤未知端点身份→`operation_unknown`（种子闭集 fail-closed）；⑥无 operation/legacy 路径零漂（HC-GAP-009 缝原值·slot-bypass 11 臂原值绿）；⑦0179 六码族与消费白名单零扩零缩断言（#20 :86-92 形）；⑧**条件臂（裁决③(b) 行使时方验收·rev2 增补）**：预绑定对 TS 常量对表静态断言——键闭集=`endpoint profile id×operation_id`（七 text op×主备 profile 对全覆盖）·主备 binding 映射唯一运行时派生源（常量遍历+typecheck 级·零 DB 死重）。
2. **件①相位 proof（scripted model·零外呼）**：①operation-scoped+plan 端点身份=备 profile → `admitSharedModelOperation` 收到备分区（fixture 隔离库直查 acquire 参数或槽系归属）；②plan 无端点身份（legacy scripted）→ registry 回退值分区原行为（零漂臂）；③分区派生仍服务器派生（spec 透传端点身份不达分区=负臂）；④**vision 负臂（rev2 增补）**：`cfg.vision===true` plan 端点身份字段不填→admit 收 registry 派生分区（dashscope-native 原值零漂·vision OCR 生产面不受本刀影响）。
3. **静态钉/既有门回归原值**：`model-op02:prove`（**24 原值**既有臂全绿+:78 预声明改写臂〔8→22 或按身份域分计 8+14〕+新增分域臂·收据登记）·`model-slot-bypass.static:prove`（14 臂·:70-71 正则钉**零重钉预期**〔件① 保 :664 原行设计约束亲证〕·若实测必须重钉如实登记原因并保持强度不减）·`ag-d-admission:prove`（ai-runtime **23 臂**+worker **15 臂**原值·rev2 勘正）·`migrate:prove`（0200 全 apply+幂等 skip）·`check-migration-version-uniqueness`（0200 唯一）·`turbo typecheck` 3/3·`docs:check` EXIT=0（cap 以执行日为准·scanned 实测）·markers 五类零命中。数字口径以 EXEC 立项日 rg 实测为准·**偏差熔断**：registry 硬编码行=**7**（#1 :65-:101）·allowed 种子总账=**8**（0120 七+0131 一）·准入三拒绝点=**3**（:754-761/:816-833/:865-869）·决策码=**8**·瞬时族=**6**·五 proof 臂数（`rg -c "A\('"` 口径 **24/14/23/15/11**·static 臂顶格特注·model-op02=24 原值+:78 预声明改写（8→22 或按身份域分计 8+14））·failoverModel 生产构造点=**1**（interview-service :227）——实测≠登记值即停（§8）。

## §3 范围外（边界清单·越界即 FAIL）

1. **MODEL-OP-04 单一网关统一路由**（interview-service :216-219 延后声明原值零改）：路由器熔断感知/全局调度面零触——本刀只分域准入键·不建网关。
2. **AG-09 request digest 不稳定面**（issues-final :147-156）：digest 构成（invoke :386-389）与 0130 :163 比较器零字节〔裁决③(b)〕；(a) 行使时归一化**仅限预绑定对白名单**·AG-09 修法面（检索拆节点/优先回放）零触。
3. **EG-B5**（fast/主共享 budget scope+admission 键·EXPERT :55）：零触零预支——分域后该面状态如实登记不恶化。
4. **AG-D/0179 六码族与消费白名单**（#12 :249-261/#13 :193-194）：零扩零缩零改；`model_failover_cost_policy_mismatch` 终态语义零翻〔裁决③(b)〕。
5. **0120 四表 DDL/PK/SECURITY DEFINER 范式与八决策码集**：零改——本刀只增种子行+TS 分区赋值·决策码端点维度入键不入码。
6. **cost④ 在飞面**（invoke :858-871 LEAST/settle 解构/metrics.ts/0188 内容）：零触零预支·并线预合成让位其已落行（§0.3-2）。
7. **text-endpoint-config profile 闭集与 legacy URL 拒绝面**（:22/:34/:42-46 SSRF 防线）：零字节。
8. **est live=0**：零模型真实外呼·零生产操作·零 secrets（§6）。

## §4 依赖

**前四刀已收官/在飞非闸**：①（`6f2ed876`）②（dfcadd9e·0177）③（`9d69a5b1`·0184）④（`line/ag-cost4` 0188 在飞·面=reserve/settle 与本刀 admit 面零交集·§0.3-2 预合成义务）——本刀无前置未落依赖。**失败语义轨六刀全收官零文件交集**（AG-D 0179 已并线·其六码族=本刀回归原值面）。**下游**：⑥回灌/显式缓存（非闸）·**AG-09 联动刀**（裁决③(b) 承接面=墙一归一化·随卷登记）·MODEL-OP-04 网关（终态面·:216-219 延后声明维持）。

## §5 Ban 列表 + pins（沿 cost1/cost2/cost3/cost4 卷同源·逐字誊 + 本刀面增补）

**Ban 列表**：

Ban push；Ban 自批（双审须独立外席）；Ban retry-to-green；Ban 翻 pins（§5 pins 十一值·含 `actualSpendCny=null` 不翻）；Ban 改共享 SSOT（product-campaign-LEDGER/execution-master-checklist/issues-master/ai-capability-review 四件+INDEX 行与统计只读引用·成本轨刀位行翻面权归协调方）；Ban 触其他工作树；Ban 伪造已读/已验来源；**本刀增补**：Ban 复活 AG-24 已删 in-process breaker 死代码面（circuit-breaker.ts/rate-limit-model.ts/breaker.proof.ts·`rg` 零引用维持·新熔断面=0120 durable 权威唯一）；Ban 分区 caller 供（端点身份服务器派生铁律 model-admission.ts :4-6·spec/调用方透传端点身份直达分区=禁）；Ban `ADMISSION_ERROR_CODES`/0120 八决策码集扩缩（端点维度入键不入码）；Ban 0179 六码族与两消费白名单改（#12/#13 原值）；Ban 动 HC-GAP-009 无 operation 缝与 legacy cost-policy-only 路径生产语义（fail-closed 关闭归 MODEL-OP-03/04·model-admission :13-17 头注原值）；Ban `model_failover_cost_policy_mismatch` 终态语义翻面〔裁决③(b) 原值·(a) 亦仅对预绑定对内归一〕；Ban 预绑定对白名单外任意换绑（(a) 行使时放行面写死=scopeId 等值+四元组属对）；Ban 动 text-endpoint-config profile 闭集/legacy URL 拒绝/transport override 拒绝面（SSRF 防线零字节）；Ban 动 0120 四表 DDL/PK/REVOKE ALL（:132）与 SECURITY DEFINER 范式；Ban 种子行静默改既有 8 行 allowed 总账（0120 :52-59+:61-68+0131 :14 零字节·0200 纯增行）；Ban 静态门重钉降强度（slot-bypass.static 重钉须同断言力·零重钉预期·若实测必须重钉如实登记）；Ban MODEL-OP-04 网关面顺手做（:216-219 声明原值）；Ban cost④ 在飞行零预支（LEAST/settle/metrics/0188 内容）；Ban claim 0186-0199 号位（§0.3-1·0186/0187=AG-39 在链·0188=cost④·0190-0199=5B-MIG 在飞实落 @`7152cd3c`·rev2）·Ban 改历史迁移（0001-0187 零字节·blob 恒等对 §0.1）；Ban 删/改既有 proof 臂语义（新增臂外零改写·**预声明 carve-out=model-op02 :78**：0200 种子 14 行落地后 `allowedSeed===8` 必红〔三条款互锁=本 Ban+§2-3 恰数锚+件② 14 行〕·改写重钉仅限本面·收据登记·强度不减〔沿 cost3 :121 形〕·rev2）；Ban 真实模型外呼（est live=0·fixture/隔离库形）。

**pins（十一值照抄·零翻转）**：

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · 脚注 actualSpendCny=null（本刀 prove 全 假体/隔离库 fixture·零模型外呼·零消耗）

## §6 est live=0

本刀零模型真实外呼：①端点分域 proof=隔离 PG 真迁移链+fixture 断言（沿 model-op02 隔离 runner 形·零外呼零生产库）；②相位 proof=scripted model fixture（零真实 provider）；③回归门=既有 prove 原值重跑。prove 全 假体/静态/隔离库·零生产操作·零 secrets·零消耗（pins 脚注同源·EXEC 收据逐 prove 登记零外呼口径）。

## §7 markers=0（卫生声明）

本刀改动集（恰 1 .md·`ai-docs/delivery/harness/ag-cost5-REQUEST.md`）**五类标记词 grep 零命中**（起草席自检·命令与回执留 prove）。五类标记词不复抄卷内（避免自匹配·沿 cost1/cost2/cost3/cost4 卷 §7 同形制）。

## §8 STOP（开工三条款）+ 用户口径 + 裁决项

**STOP · `draft:awaiting_pre_exec_dual` · alone≠dual。** 起草席写完即停零码动（本刀恰 1 .md）。开工三条款：①预执行双审两外席 **BOTH PASS 落卷**；②**协调方明示授权**；③EXEC 立项**不得改 §1 修法清单与 §5 Ban/pins**（改则回炉重审·立项时照 §0 逐条重 pin·迁移号照 §0.3-1 实测顺延）。**alone≠dual**（单席自验不计双审）· **Dual PASS ≠ 开工**（PASS 只过审·开工须协调方授权）。

**停止条件（四类·命中即停并回报协调方·绝不带病续刀）**：

- **现场漂移**：EXEC 立项 §0 重 pin 时恰数锚实测偏离（registry 硬编码行≠7／allowed 种子总账≠8／准入三拒绝点≠3／决策码≠8／瞬时族≠6／五 proof 臂数（`rg -c "A\('"` 口径）任一≠24/14/23/15/11（model-op02 :78 预声明改写后允许 22 或 8+14 分计〔量纲括注：22=allowedSeed **种子总账** 8 legacy+14 端点分域·**臂总数恒 24 非 22**（:78 系在位改写非增删臂）·post 勘误登记〕·其余四值不容偏差）／failoverModel 生产构造点≠1／链顶≠§0.3-1 登记值／0188 占用方≠cost④／0190-0199 占用方≠5B-MIG〔rev2 登记〕）·或 blob 漂移超出「结论不变只更行号」判读——停·重 pin 复核后请示。
- **机制不满足**：plan 携带端点身份撞 prepare 契约墙（model-client :41-43「Pure endpoint selection」形变受阻·scripted/非 operation seam 破坏）·或 0120 :29-32 CHECK 正则拒收裁决②所选身份值形·或裁决③(a) 行使时 0130/header 归一化撞 PG 函数签名/依赖墙·或 cost④ 并线后 admit 区行号漂移致 §0 重 pin 无法结论不变——停·呈报。
- **越界需要**：修法行使中发现必须动 AG-09 digest 语义/0179 族/MODEL-OP-04 网关面/EG-B5/0120 DDL 才能达成验收——停·绝不越界顺手做·呈报裁决。
- **验收红不可修**：§2 门矩阵既有臂基线红超出已登记项·或新增臂两轮修复不绿且根因在本刀改动面外——停·如实登记上报不洗不 retry-to-green。

**待双审/EXEC 裁决项**：

- **①分区端点化落点（件①授权面）**：(a) admit 相位叠加（:664 原行零字节保静态钉 :70-71·plan 端点身份在 :750 区改写 partition 两维后调 admit·**推荐**——路由选择后才有端点真身·prepare 在 :686 后于 :664）；(b) resolve 相位提前解析（:664 处路由未定·退化为静态=与蓝本相悖·呈报仅供完整性·绝不静默采）。
- **②端点身份源/种子形（件①件②授权面·两形互斥不得混用）**：(a) endpoint profile id 为 providerAccount 身份（`'deepseek-cn-public'`/`'dashscope-cn-beijing'`·region='cn'·静态 0200 种子 14 行·0120 :29 正则收纳亲证·**推荐**——闭集可种子·与「端点 profile」字面逐字）；(b) billing env provider/region（#14 :111/:113 值·部署可变→静态种子不可行· privileged upsert 命令沿 model-cost-governance configure 先例·0200 仅框架）。附带：两形下 `modelOrRecipe|operationId` 两维均沿 registry 原值零变。
- **③failover 半行使度（件③授权面·墙一/三/四亲证=全量形系 identity 语义手术）**：(a) 全量形（0130 :163+header :196-200 对预绑定对归一化·蓝本 :144 字面全兑现·碰 AG-09 在册面·**须双审明示方可行使**）；(b) 有界形（件①件②全量+预绑定对数据面·mismatch 终态与族语义零改·墙一归一化判归 AG-09 联动刀·**推荐**）。附带（两形同）：预绑定对键=`endpoint profile id×operation_id`（静态闭集·rev2 协调方裁决）·主备 binding 映射留运行时派生·数据落 0200〔(a)〕或 TS 常量对表〔(b)·rev2 单选〕。
- **④备端点未启用行为+存量四字键行处置登记（件②授权面·rev2 扩名）**：(a) 种子照建·运行时 plan 无备流量即零触（零状态分叉·**推荐**）；(b) 条件建种（部署态入 DB=第二重配置漂移面·呈报完整性·不采）。**附带存量行处置（rev2 登记）**：0200 落地后旧四字键（dashscope-main/cn-beijing 族）breaker/policy 行=**legacy 回退集**（件① registry admission 字段降级 legacy 回退值·无端点身份路径仍落旧键分区）·**容忍僵尸**（无新流量旧键 breaker 行不清除）+并发 **lease 过期自愈**（0120 :120-130 租约过期自清·不迁不移）+**冷启动重检窗 ≤threshold**（旧键分区若仍有流量·trip 窗以 breaker_threshold=5 为上界）·**部署顺序=迁移先于 TS overlay**（0200 先 apply·件① 代码后上线——防 TS 先行写新键撞种子缺行）。

---

*AG-COST5 REQUEST · 2026-10-14 · draft:awaiting_pre_exec_dual · **rev2**（pre-exec 双审两席 FAIL 全数处置）· 基线 `feat/mysql-schema-skeleton` @`d68ffe17`（起草窗口零前移·worktree 初建即本 tip·链深 187）· 分支 `line/ag-cost5` · 工作树 `meetwise-cost5` · 蓝本=EXPERT-REVIEWS §七 :67 成本轨⑤（修法权威「⑤AG-08 熔断键按端点∥」）+§八 :78（⑤ 无事故级修正=:144 字面权威）+§六 :55 EG-B5（范围外）+ issues-final AG-08 :20/:136-145（:144 修法两半逐字）+ review-log AC-F19 :85/:152 + LANDING-INDEX :35 + cost2 :81/cost3 :106/cost4 §3-1·§0.3-2（四刀让位兑现）+ AG-24 收官面避让（`724d61b5`·死代码零复活）· 范围=件①准入分区键随端点（admit 相位叠加·裁决①②）+件②主备分别建种子（0200·14 行·裁决②④）+件③failover 同 cost scope 预绑定切换（裁决③定行使度·墙一/三/四亲证）· 不含=MODEL-OP-04 网关/AG-09 digest 面/EG-B5/0179 族改/0120 DDL/cost④ 在飞行 · 迁移号 **0200**（0188=cost④ 在飞已实落·0190-0199=5B-MIG 在飞实落 @`7152cd3c`·EXEC 立项日顺延实测）· est live=0 · pins 十一值照抄 · markers=0 · ⛔push · Dual PASS ≠ 开工 · Ban self-approve · alone≠dual*

## rev2 勘误席处置摘要（2026-10-14·pre-exec 双审两席 FAIL 全数处置·docs-only 恰 1 .md 零码动）

处置计数：**7 项指令全数处置+自检 1 项**。逐项（每处亲证后落笔）：

1. **B1 迁移号（协调方裁决）**：`meetwise-b5m` @`7152cd3c`（branch `line/batch5b-mig`）在飞实落 **0190-0199** 十卷（`0190_outbox_consumption_unique_concurrent.sql`→`0199_redundant_index_drop.sql`·ls 亲证）→ 本刀改占 **0200**（本树主线链顶 0187·0200 空闲亲证）；卷内 0190 引用全改（§0.3-1/防重双对表/§1 修法头/件②/件③(a)/§2-3/§5/裁决②③/尾注）；§5 Ban 扩为「claim **0186-0199** 号位」；旧记「0189=5B 拟占零实落/链顶 0184」改「5B 在飞实落 0190-0199」。
2. **席1 B2+席2 P1-2 恰数锚勘正**：旧记 25/14/26/16/11 系 quote-less 口径误计模板字面名臂行——差异源实测=op02 :267（1 行）／ai-runtime ag-d :160/:191/:226（3 行）／worker :132（锚定变体 1 行）。rev2 口径=`rg -c "A\('"`（静态单引名臂·逐文件可复现）：model-op02=**24**／slot-bypass.static=**14**（**臂顶格**列零缩进·两空格缩进锚定式零命中·特注）／ai-runtime ag-d=**23**／worker ag-d=**15**／slot-bypass=**11**。§0.1 #18-22/§0.2/§2-3/§8 熔断基线四处同步。
3. **席1 B3 vision 三分支（件① spec 增补）**：model-client.ts **:611-613** 亲证三分支（`cfg.backup===true → resolveTextBackupEndpointConfig()`／`cfg.vision===true → resolveVisionEndpointConfig(cfg.env ?? process.env)`／否则 `resolveTextEndpointConfig()`）——端点身份字段仅 text 双 profile 族填充·`cfg.vision===true` plan 不填身份（registry 派生分区零漂·防 vision OCR 生产全断）；§2-2 增 ④ vision 负臂；件① 零触面增 vision/dashscope-native 路径。〔注：席1 引 :604-606 实测为 :611-613·三分支机制属实·按亲证行号落卷〕
4. **席2 P1-1 op02 :78 carve-out（预申明）**：:78 臂 `A('迁移种子：8 个 admission=allowed（含 job.route-classify）+ 8 个 admission=blocked…', allowedSeed===8 && blockedSeed===8)` 亲证——0200 种子 14 行落地后 22 必红（三条款互锁=§5 Ban 新增臂外零改写+§2-3 恰数锚+件② 14 行）。沿 cost3 :121 形预声明「改写重钉仅限本面·收据登记·强度不减」落 §5；§2-3 记「24 原值+:78 预声明改写（8→22 或按身份域分计 8+14）」。
5. **席2 P1-3 件③(b) OR 消解（协调方单选裁决：TS 常量对表）**：「数据表（或 TS 常量对表）」→ **TS 常量对表**单选（(b) 形 DB 数据表无读者=死重不采）；对表键改 `endpoint profile id × operation_id`（静态闭集·主备 binding 映射留运行时派生·env 可变装不下静态种子的矛盾消解）；§2-1 增 ⑧ 条件验收臂（裁决③(b) 行使时方验收）。
6. **席2 P2-1 存量行处置登记（裁决④ 扩名）**：旧四字键（dashscope-main/cn-beijing 族）breaker/policy 行=**legacy 回退集容忍僵尸**（件① registry admission 字段降级 legacy 回退值）+并发 **lease 过期自愈**（0120 :120-130 租约过期自清）+**冷启动重检窗 ≤threshold**（breaker_threshold=5 上界·0120 :52-57/:59 亲证）；**部署顺序=迁移先于 TS overlay**（0200 先 apply·件① 代码后上线）。落裁决④ 附带段。
7. **席1 勘误三处**：0130 墙二 :168-170→**:167-170**（:167 `IF invocation.cost_scope_id IS DISTINCT FROM p_cost_scope_id`／:170 `END IF` 亲证）；#11 :222→**:221**（`const primary = endpoint(...)` 亲证行）；§0.3-3 rg「零命中」→**零活引用（3 处在证）**：ai-runtime index.ts :196 删除注释／ag24 proof :132/:133/:137/:174 整删断言／errors index.ts :5 迁移注释（rg 亲证 3 文件 6 行皆删除在证非活引用〔7→6 计数勘正=1+1+4 逐行亲证：errors index :5 一行+ai-runtime index :196 一行+ag24 proof :132/:133/:137/:174 四行·post 勘误登记〕）。
8. **自检**：docs:check EXIT=0（scanned 实测留回执）·markers 五类零命中（改动集 grep·词面运行时组装不落卷面）·STOP=`draft:awaiting_pre_exec_dual` 维持·⛔push·commit=rev2。

## §9 EXEC 附记（2026-10-14·EXEC 施工席·STOP=`executed:awaiting_post_prove_dual`·⛔push）

**并线**：`git merge --no-ff feat/mysql-schema-skeleton`（tip=`12ecb34b` CIW2 nail 收官）→ **merge `338e5f1b`** 零冲突（95 文件·与本刀触面零重叠亲证）·链深 **187** 维持（主线未增迁移·链顶 0187·0188=cost④ 支线仍未并线·0190-0199=5B-MIG 未并线=§0.3-1 登记值全维持）。**§0 全量重 pin**：恰数锚全数实测维持（registry 硬编码=7／allowed 种子=8 legacy 原值／准入三拒绝点=3（:750-763/:816-833/:865-869 现界）／决策码=8／瞬时族=6／五 proof 臂数（`rg -c "A\('"`）=**24/14/23/15/11** 恒等／failoverModel 生产构造点=1（interview-service :227））；25 blob 锚 23 恒等，2 漂移如实登记：`ag-d-admission.proof.ts`（`19f2c2e5`→`9bc8d683`·CIW2 strictNull 最小窄化 1 处）与 `model-slot-bypass.proof.ts`（`516b5d76`→`07e30ce3`·CIW2 冗余恒真条件删 1 行）——**臂数 23/11 不变+断言语义零变=「结论不变」判读成立**（漂移源=主线 `ad78e0ff` union 三红消解，非本刀面）。**迁移号终裁=0200**（EXEC 实测：主线链顶 0187·0200 空闲·`check-migration-version-uniqueness` files=188 violations=0 终裁·协调方裁决在案）。

**裁决落值（全部按 rev2 推荐行使）**：**①(a)** admit 相位叠加——invoke.ts :664 `resolveModelAdmissionPartition(spec)` 原行零字节（静态门 :70-71 正则钉**零重钉亲证**），端点身份在 admit 相位 `if (admissionPartition)` 守卫内经 `withAdmissionEndpointPartition` 纯函数叠加（model-admission.ts 新增，:664 之后 :751 区）后调 `admitSharedModelOperation`（单 await 调用守恒）；**②(a)** endpoint profile id 形——`providerAccount=profile id（'deepseek-cn-public'/'dashscope-cn-beijing'）·region='cn'`（TextEndpointConfig.region 同源·0120 :29-30 CHECK 收纳亲证），0200 种子 14 行静态落库；**③(b)** 有界形——件①件②全量+预绑定对 **TS 常量对表**（registry `MODEL_COST_FAILOVER_PREBOUND_ENDPOINT_KEYS` 14 行字面+`preboundCostFailoverProfiles` 唯一派生纯函数·键闭集=profile id×operation_id·主备 binding 映射留运行时派生）；:806 `sameCostPolicyBinding` 全等门与 `model_failover_cost_policy_mismatch` 终态**语义零改**·0130 墙一/0088 墙四零字节·墙一归一化判归 **AG-09 联动刀**（对表即其消费源·承接关系本笔登记）；**④(a)** 种子照建+存量行处置登记——旧四字键（dashscope-main/cn-beijing 族）=legacy 回退集（registry `admission` 字段注释降级·七行字面零删除）·容忍僵尸+lease 过期自愈（0120 原机制）+冷启动重检窗 ≤threshold=5+**部署顺序=迁移先于 TS overlay**。**P2① vision 先判落值**：model-client.ts 身份填充表达式 `cfg.vision===true` 恒先判不填（即便 backup 同真也不带身份——vision/dashscope-native 分区恒 registry 派生零漂·vision OCR 生产面不受本刀影响；vision+backup 组合生产接线不存在，若未来出现以 vision 分区为准=保守侧）。

**三件落点**：
- **件①**：`packages/ai-runtime/src/model-admission.ts`（+`ModelEndpointAdmissionIdentity` 接口+`withAdmissionEndpointPartition` 纯函数·resolve 头注扩记）·`packages/ai-runtime/src/invoke.ts`（ready 臂+可选 `admissionEndpoint` 字段·**不进 claim 不进 requestDigest**=墙一零字节·admit 相位叠加 1 处）·`packages/ai-runtime/src/model-client.ts`（:611-613 三分支后+身份常量·vision 先判·prepare 返回形填身份）·`packages/ai-runtime/src/failover-model.ts`（:19 无 prepare 回退形显式 `admissionEndpoint: undefined`=legacy 零漂）。
- **件②**：`packages/db/migrations/0200_ag08_admission_partition_per_endpoint_seeds.sql`（新·恰 1 迁移·14 行 allowed ON CONFLICT DO NOTHING·既有 0120/0131 行零字节）+ `packages/ai-runtime/test/model-op02-shared-provider.proof.ts` :78 **carve-out 改写收据**（沿 cost3 :121 形·预申明兑现：`allowedSeed===8+14`·8 legacy+14 端点分域分计·blocked===8 零扩零缩·改写仅限本臂·其余 24 原值臂零改写·强度不减反增）。
- **件③(b)**：`packages/ai-runtime/src/model-operation-registry.ts`（对表 14 行字面+派生纯函数+wired text 头注 legacy 降级注记）。
- **门注册（新 proof 机械必需·随卷登记）**：`packages/ai-runtime/package.json`（+`prove:model-op02-endpoint-partition`）·根 `package.json`（+`model-op02-endpoint-partition:prove`/`:raw` 两 script）·`scripts/run-e2e-isolated.mjs`（receipt sources+validity 列表+migrate 列表+命令分派四处·沿 model-op02 同形 additive）。

**门矩阵全表（§2 门表·全绿·est live=0 全程零外呼）**：

| # | 门 | 结论 | 关键行 |
|---|---|---|---|
| 1 | `model-op02:prove` | **绿 EXIT=0** | 32 臂全 PASS=24 原值+:78 carve-out 改写 1+新增分域臂 7（①主端点 admit②独立槽系 4×2 容量③**熔断分域否证臂**④半开互不累及⑤未知端点 operation_unknown⑥legacy 零漂⑦六码族零扩零缩） |
| 2 | `model-op02-endpoint-partition:prove`（**新**·两轮） | **绿 EXIT=0** | 11 臂全 PASS（⑧对表 5 臂含基数=14 等式+0200 种子 14 行在库+相位①备 profile 分区随动②legacy 零漂③spec 透传负臂④vision 负臂+text 主备身份臂） |
| 3 | `model-op00:prove` | **绿 EXIT=0** | 同 key 并发/冻结 binding/围栏原值 |
| 4 | `ag-d-admission:prove` | **绿 EXIT=0** | ai-runtime 23 原值+worker 15 原值全 PASS |
| 5 | `model-slot-bypass:prove` | **绿 EXIT=0** | 11 原值臂（HC-GAP-009 缝原值） |
| 6 | `model-slot-bypass:static:prove` | **绿 EXIT=0** | 14 原值臂·:70-71 正则钉**零重钉**（件①保 :664 原行设计约束亲证） |
| 7 | `migrate:prove` | **绿 EXIT=0** | applied=**188** skipped=0（0200 全 apply·幂等形在链） |
| 8 | `drift:prove` | **绿 EXIT=0** | schema 无漂移 |
| 9 | `check-migration-version-uniqueness` | **绿 EXIT=0** | files=188 violations=0（0200 唯一·三历史双号豁免维持） |
| 10 | `turbo typecheck --force` | **绿 EXIT=0** | 8/8（两轮·proof 改名后复跑） |
| 11 | `turbo lint --force` | **绿 EXIT=0** | 12/12（ai-runtime 621=cap 621 **未动 cap**·新 proof 两告警修净零残留） |
| 12 | `docs:check` | **绿 EXIT=0** | 80 required+scanned **2069** |
| 13 | markers 五类 | **零命中** | 改动集 11 文件五类标记词（词面不落卷面·§7 同形制）grep 零输出 |

**恰数锚 post-change 复测**：registry 硬编码=7（零删）·allowed 总账=8 legacy+14 新=22（op02 种子臂实证）·准入三拒绝点=3·决策码=8·瞬时族=6·五 proof 臂数原值 24/14/23/15/11 全保（新增臂全数落 op02 新块与新文件·零既有臂语义改写）·failoverModel 构造点=1·链顶 0187+0200=188。**停止条件零命中**。

**连接预算零影响推导（post 勘误登记）**：4×2 独立槽系 vs ha-6 连接预算（稳态账 **76**/帽 **97**·约束 `6P+4≤97`·P=`PGPOOL_MAX`=12·锚 `receipts/ha-6/resource-budget.json`+`docker/compose.ha.yml` :56）**零影响**——①并发槽全数落 `ai_model_concurrency_lease` 行（0120 :120-130）=**租约行不持连接**（acquire/release 经 `ai_model_admission_acquire_scoped` SECURITY DEFINER 函数调用连接即还·不随槽位驻留）；②模型派发为 provider HTTP 外呼=**派发不持池**（外呼窗内零 PG 连接占用）；③连接面恒由 `PGPOOL_MAX=12` 池帽静态封顶=**池帽静态**（槽系 4→4×2 扩容不触 compose/池参数一行）⇒ 连接预算账 76/97 分毫不动。

**部署登记条目（post 勘误登记）**：**违序窗**（件① TS overlay 先于 0200 apply）后果=**fail-closed 全站 AI 停**——代码先行时 plan 携新端点身份（`'deepseek-cn-public'/'cn'` 族）撞种子缺行→`operation_unknown` 确定性拒绝（种子闭集 fail-closed·0120 :183 决策码原值）·MODEL-OP-02 全 text 面（七 op 主备两路）同刻被拒=issues-final :143「整站 AI 功能不可用」面（拒绝而非错路由=保守侧·零脏写）；**迁移先行纯 runbook 约束**——代码层零强制·顺序义务（0200 先 apply·件① 后上线）仅存于部署 runbook（裁决④ 附带段同源·本笔补全其后果面与约束性质登记）。

**陷阱 13 条自检（本刀 ServiceImpl 等价面=ai-runtime src 四文件+registry+两 proof）**：
1. 分区键 caller 供=禁——端点身份仅 model 层 prepare 从冻结 profile 注册表派生，spec 零新字段（③负臂直证）✓
2. :664 resolve 原行零字节（静态门正则钉零重钉亲证）✓
3. admit 单 await 调用守恒+守卫块结构不破（静态门 :74/:79 两臂绿）✓
4. 端点身份不进 claim/requestDigest（墙一/0130 零字节=AG-09 面不越界）✓
5. 八决策码/0179 六码族零扩零缩（码面零改·端点维度入键不入码·⑦臂断言）✓
6. vision 负臂亲证（dashscope-native 分区零漂·OCR 生产面零波及）✓
7. legacy/无 prepare 路径零漂（registry 回退原值·②臂+failover-model 显式 undefined）✓
8. 0120 DDL/PK/REVOKE/SECURITY DEFINER 范式零改（0200 纯 INSERT ON CONFLICT DO NOTHING）✓
9. 既有种子行零字节（0120 :52-68+0131 :14 原值·种子臂 8 legacy 分计直证）✓
10. 对表静态闭集 type 级+遍历双保险（14=7×2 等式臂+prebound 派生臂）✓
11. 无 retry-to-green（新 proof 首跑即绿；lint 两告警系修净非 skip-as-pass）✓
12. est live=0（全 proof fixture/隔离容器/scripted·零真实 provider·零 secrets）✓
13. 零意图文件零残留（tsbuildinfo 构建产物 checkout 还原·改动集 11 文件全为本刀清单内）✓

**est live=0 收据**：门 1/2/3/4/5=隔离 pgvector 容器+fixture（LOCAL_ISOLATED_PROOF_RECEIPT 在案 `.tmp/isolated-proof-receipts/`·release_evidence=false）·**门 7 migrate:prove=隔离容器跑·runner 既有行为不产该收据**（`run-e2e-isolated.mjs` `isolatedReceiptSources` 无 `migrate:prove` 键=零写·post 勘正措辞收窄）·门 6/8/9/12/13=静态扫描·零模型外呼零消耗（pins 脚注 `actualSpendCny=null` 维持）。

**STOP=`executed:awaiting_post_prove_dual`** · ⛔push（push 归主会话批边界）· commit=fix(ai-runtime) AG-COST5 EXEC。

## post 双审勘误登记（2026-10-14·post 两席 BOTH PASS·nail 前勘正席落笔·docs-only 恰 1 .md 零码动·⛔push·Status 维持 `executed:awaiting_post_prove_dual`）

处置计数：**E1 一处+E3 两笔+P2 三则=六处落笔**（本登记节计一处）。逐项（每处亲证后落笔·登记归本席·翻面权仍归 nail 席）：

1. **E1（席1）est-live 收据行措辞收窄**：§9 收据行原「门 1/2/3/4/5/7=…LOCAL_ISOLATED_PROOF_RECEIPT 在案」把门 7 误计入收据在案面——亲证 `scripts/run-e2e-isolated.mjs` `isolatedReceiptSources` **无 `migrate:prove` 键**（:3087 `const sources = isolatedReceiptSources[target]`·无键即零写收据）=门 7 隔离容器跑属实但 runner 既有行为不产该收据。已收窄为「门 1/2/3/4/5=收据在案·门 7 migrate:prove=隔离容器跑·runner 既有行为不产该收据」·est live=0 结论零变（收据有无≠隔离跑否·隔离容器执行事实不受影响）。
2. **E3（席1+席2）§9 增两笔**：①「4×2 槽 vs ha-6 76/97 连接预算零影响」推导一段（租约行不持连接·派发不持池·池帽静态——ha-6 预算锚=`receipts/ha-6/resource-budget.json`+`ha-6-companion-REQUEST.md` :97 稳态账 76/约束 6P+4≤97/P=12+`docker/compose.ha.yml` :56 亲证）；②「违序窗=fail-closed 全站 AI 停·迁移先行纯 runbook 约束」部署登记条目（裁决④ 附带「部署顺序=迁移先于 TS overlay」的后果面与约束性质补全）。
3. **P2-1（席2）§8 括注量纲**：§8 停止条件臂数括注「允许 22 或 8+14 分计」易误读为**臂数**可 22——量纲括注已补（22=allowedSeed 种子总账·臂总数恒 24 非 22）。亲证：`rg -c "A\('"` model-op02=31（单引名臂·含 :78 carve-out 在位改写+新增分域 7）+模板名臂 :273 一行（rev2 勘正同源·单引口径不计）=总臂数 32；:78 系在位改写非增删臂·「24 原值」量纲自洽。
4. **P2-2（席2）「7 行」→「6 行」**：rev2 处置摘要第 7 条「3 文件 7 行」计数误——亲证 `rg -n "circuit-breaker|rate-limit-model" packages apps`=恰 **6** 行（errors/src/index.ts :5 一行+ai-runtime/src/index.ts :196 一行+ag24-langfuse-model.proof.ts :132/:133/:137/:174 四行=1+1+4·原列锚即六行）·已改「3 文件 6 行」。
5. **P2-3（席2）两则登记（零码零文改·纯登记）**：①**vision+backup 谓词优先级**——model-client.ts 两谓词优先级分层亲证：端点解析三元式 **backup 先判**（`cfg.backup===true → resolveTextBackupEndpointConfig()`）·身份填充表达式 **vision 先判**（`cfg.vision===true → admissionEndpoint=undefined`）——vision+backup 同真组合解析落备 profile 而**身份不填**→落 registry 派生 dashscope-native vision 分区（与 §9 裁决落值 P2①「以 vision 分区为准=保守侧」一致零矛盾·组合生产接线不存在维持）；②**⑧对表基数等式可选**——新 proof 对表臂「基数=14 等式」（`keys.length===14`）系冗余可选：operationId 闭集=wired 七 op 全覆盖臂+profile 闭集×(profile×operation_id) 全表唯一臂两臂已唯一蕴含 14=7×2（基数臂非独立承重断言·保留属断言增强非依赖）。
6. **门**：docs:check EXIT=0（本笔后复跑留回执）·markers 五类零命中（本笔改动集 grep·词面运行时组装不落卷面·§7 同形制）·STOP=`executed:awaiting_post_prove_dual` 维持（BOTH PASS 翻面归 nail 席）·⛔push·commit=post errata 登记。
