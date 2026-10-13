# 题库（qbank）设计与权限调查 — meetwise-latest @ 2fab7946

范围：只读源码，未改仓库、未 commit、未碰 Meridian。路径均相对仓库根，迁移在 `packages/db/migrations/`。

## 0. 一句话结论
**只有一个题库：平台公共题库（全局、单租户）。** 源码里**不存在**"企业自建题库"。表里没有 org/tenant/company 列（`rg org_id|tenant|enterprise` 在 qbank 迁移和代码里都搜不到，只出现在缓存注释中）。"生成题"不进题库，只作为单场面试的私有记录存起来。题与题之间的隔离靠"题域/岗位赛道（serving_scope / leaf_track）"，**不按租户隔离**。

## 1. 题库分类与表

| 类别 | 表（迁移） | 关键列 | 谁写 | 谁读 |
|---|---|---|---|---|
| 平台公共题库：源/审核 | `qbank_curator`(0013:19)、`qbank_source`(0013:40) | source: `kind∈{official_doc,question_bank,manual}`、`status∈{pending,approved,rejected}`、`added_by`、`reviewed_by`、`content_hash` | 0013 时任何主体都能提议 pending、只有 curator 能审核；**0066:23 起收回 app_role 的写权限**，只有 `qbank_control_executor` 能写 | 0067:39 起 app_role 不能直接 SELECT，只能走 SECURITY DEFINER 检索函数 |
| 公共题库：池/块 | `qbank_pool_entry`(0013:109)、`qbank_chunk`(0029:30)、`qbank_chunk_serving_scope`(0097) | `ref_id`、`source_id`、`content_hash`、`serving_scope_id`、`taxonomy_version` | executor（0066:66-72）；只追加，0068:220 收回 UPDATE/DELETE | 同上 |
| 公共题库：题目实体 | `qbank_question`(0031:9)、`qbank_question_chunk`(0031:27) | `state∈{draft,published,retired}`、`competency`、`difficulty`；chunk 的 `role/ordinal/required` | executor / control definer（0066:84-88、0071:47-54） | 只能经 `qbank_generation_question_evidence` 读 |
| 向量代（generation） | `qbank_embedding_recipe`、`qbank_vector_generation`(0029:~107)、`qbank_active_generation`（单例）、`qbank_generation_chunk`（按 generation_id 做 LIST 分区，带 HNSW 索引）、`qbank_corpus_epoch` | `state∈{building,validated,active,retired,failed}`、`storage_released_at`(0146) | executor | 元数据：`qbank_active_generation_metadata()`（0067:~50） |
| 旧通道 | `vector_chunk` kind='qbank'，owner=`__system_qbank__`；视图 `qbank_retrieval_candidate`(0013:146)、`qbank_visible_ref`(0016:63) | `kind`、`owner_user_id` | 0066:34-45：app_role 不能写 kind='qbank' 的行，只有 executor 能写 | — |
| 生成题（题库未命中时由 LLM 生成） | `question_plan`、`question_plan_event`、`question_issue_provenance`(0110:47/84/101)；`interview_question.review_status`(0110) | `owner_user_id`（候选人本人）、`origin='llm_qbank_miss'`、`rubric_id`（只能引用已发布的评分标准） | 候选人主体（RLS 限定 owner，0110:156-172） | 只有 owner 能读；**不回流到题库** |
| 检索计划 | `qbank_retrieval_plan(_event)`(0106:303/330) | `owner_user_id`、`leaf_track_id`、`generation_id` | owner（0106:358-366） | owner |
| 企业自建题库 | **不存在** | — | — | — |

## 2. C 端 / B 端各检索什么
- 检索入口：`apps/worker/src/interview-consumer.ts:254-284`。它读取 `getInterviewRouteSnapshot`（只查 `interview_route_snapshot`，见 `packages/db/src/job-route-decision.ts:355-361`），由 `decideRouteSnapshotRetrieve` 判定（`apps/worker/src/qbank-retrieve-scope.ts:68-74`）。找不到快照时返回 `degradedRetrieval('route_snapshot_missing')`，不会退化成不带范围的检索。
- **B 端（通过岗位投递的面试）**：`interview_route_snapshot` 有 `application_id/job_id` 两列（0104:161-173），由 recruiter 启动事务写入。检索的是**同一个全局公共题库**的 active 代，范围限定在岗位路由选出的 leaf 赛道（`serving_scope_id`）。企业不会有自己的题。
- **C 端（练习面试，application_id IS NULL）**：开始面试时只写 `candidate_profile_route_snapshot`（`apps/api/src/modules/interview/interview.service.ts:297-300`，`packages/db/src/candidate-route.ts:~95`）。这张表只给"角色门"兜底读（`candidate-route.ts:108-113` 的注释写明"检索面不走本函数"；`interview-consumer.ts:354`）。**所以 C 端检索拿不到快照，结果是 route_snapshot_missing，降级成不使用题库**（已核实，见问题 P2）。
- 企业题库会不会被 C 端或其他企业检索到：不会，因为企业题库根本不存在。所有人共用一份公共题库，按赛道而不是按租户过滤。

## 3. 权限实现
- **角色**：`app_role`（请求 / worker 运行时）；`qbank_control_executor`（NOLOGIN NOINHERIT NOBYPASSRLS，0066:12-18，0067:15-34 会清掉它的所有角色成员关系）；control definer（`qbank_is_generation_control_definer()`，0070/0071/0087）。灌库代码走 `asQbankControlExecutor`（`apps/worker/src/qbank-generation.ts:166-239`），即 SET LOCAL ROLE。
- **GRANT/REVOKE 演进**：0013/0029/0031 先给 app_role 授写权，用 GUC `app.principal_user='__system_qbank__'` 或 `qbank_is_curator()` 判权限。→ 0066:22-25 收回 app_role 对所有 qbank 表的写权限；0066:163-165 把 prepare/validate/activate/fail 四个函数的执行权从 app_role 收回，只授给 executor，并明确规定"不得在 DEFINER 内用 GUC 鉴权"（0066:90-93）。→ 0067:39-44 收回 app_role 对原始表和候选视图的 SELECT，并注明 "qbank_is_curator() 是 GUC 路由上下文，不能当鉴权根"。
- **RLS**：表都开了 ENABLE+FORCE。旧的 GUC 策略还留着（0013:63-77、0029:45-54、0031:21-25），但 app_role 已没有表权限，这些策略实际不起作用。真正生效的是 executor 策略（0066:42-88）、definer 策略（0071:47-54、0087:68-78）和候选视图读策略（0068:143-203）。
- **触发器**：source 状态机和关键列不可改（0013:79-95）；进池前必须 approved（0013:132-144）；chunk 进池前要求源已 approved（0029:56）；generation_chunk 只能写 building 代（0097:92-118）。
- **数据面函数**（SECURITY DEFINER，授给 app_role）：`qbank_generation_ann_search / lexical_search / distances / evidence / question_evidence`，以及 `qbank_active_generation_metadata`。
- **向量检索的 WHERE 条件**（0106:55-92、208-277）：
  - 只在 `generation = 当前 active 指针且 state='active'` 的代里查，并且 `g.visible`；
  - 赛道过滤：`(serving_scope GUC 和 taxonomy GUC 都为空)` **或** `(两者都非空，且 g.taxonomy_version / g.serving_scope_id 与之相等)`；
  - 先召回 ANN 的 `k*8`（至少 40），再 JOIN `qbank_retrieval_candidate`（源仍为 approved）；
  - question_evidence 还要求 `q.state='published'`，content_hash 与候选一致，题目的块必须返回完整（1 个 prompt、≥1 个 rubric、≥2 个 required）。
- **应用层过滤**：`packages/db/src/qbank-generation-retrieval.ts:59-65` 校验 scope 后执行 `set_config(...,true)`；scope 为 undefined 时**不设置 GUC，走无过滤路径**。worker 侧由 `qbank-retrieve-scope.ts` 和 `interview-consumer.ts:259-283` 保证不会发出无 scope 的查询；生产环境要求 trackLocal（`:276-280`）。API 守卫禁止 HTTP 主体冒充 `__system*`（`apps/api/src/platform/principal.guard.ts:44-65`）。

## 4. 发布 / 退役与生成题
- 源：pending →(curator/executor)→ approved / rejected；approved → rejected 即撤回，题会从候选视图里立即消失（0013:146-150）。
- 向量代：building →（`qbank_prepare_generation_partition` 建分区和 HNSW）→ validate（校验块数一致且 corpus_epoch 没变）→ activate（旧 active 改为 retired，切换单例指针，cache_epoch+1）（0066:94-160）。retired 代在 epoch 没变时可以重新激活，用于回滚。
- **0146 释放存储**：`qbank_release_retired_generation_storage`（0146:15-62）只处理 retired/failed、非 active、epoch 已前进、尚未释放过的代，执行 DETACH+DROP 分区并写 `storage_released_at`。属于手动运维，代码里没有调用方（只在 `packages/db/test/dbhy1.proof.ts:382` 出现）。
- 题目实体 `qbank_question.state` 有 retired 状态，检索只放行 published。
- **生成题入库路径**：题库没有合格题时，走 `question_plan` 状态机（`packages/db/src/qbank-miss.ts:83/121/269`）→ 写 `interview_question`，标 `review_status='review_required'`，不计入 B 端总分，再写一条 provenance。**不写回任何 qbank_* 表**，所以生成题不会被别人检索到。
- **RAG 源 ACL 与题库的关系**：通用 RAG（0032 起，schema 为 rag_control/rag_runtime）是另一个平面，和题库无关（0032:3-4）。它有 `visibility=private/global` 加 owner，WHERE 条件见 0124:~73-78：`(private AND owner=principal) OR (global AND provenance approved)`；principal 为空时直接报错（0124）。两套系统的执行角色互相收回了权限（0073:33、0079:9-14）。也就是说，"按用户私有"只存在于 RAG 平面，题库平面一律全局。

## 5. 发现的问题
| # | 问题 | 状态 | 严重度 | 位置 |
|---|---|---|---|---|
| P1 | 0146 的释放函数又回到用 GUC 鉴权：它 `GRANT EXECUTE TO app_role`，只判断 `current_setting('app.principal_user')='__system_qbank__'`。app_role 的任何连接都能自己执行 set_config 伪造这个值，然后以 DEFINER（属主）身份 DETACH+DROP 分区。这违反了 0066:90-93 / 0067:36-38 定下的"执行授权才是边界、GUC 不可作鉴权根"原则，而且没有授给 executor。目前影响有限：只能删 retired/failed 且 epoch 已前进的代，回滚本来也不可能；但 failed 代没有 epoch 守卫，而且这是一个可被运行时角色触发的 DDL 入口 | 已核实（代码），利用条件属推断 | 中 | 0146:20-23, 0146:61-62 |
| P2 | C 端练习面试检索不到题库：通用开始面试只写 `candidate_profile_route_snapshot`，检索却只读 `interview_route_snapshot`，结果是 route_snapshot_missing → 降级（不用题库） | 已核实 | 高（产品功能问题） | interview.service.ts:297-300；interview-consumer.ts:254-262；candidate-route.ts:108-112；job-route-decision.ts:355-361 |
| P3 | 没有企业 / 租户题库，也没有 org 维度。如果产品承诺"企业自建题库 / 企业私有题"，现有设计做不到 | 已核实（搜索为空） | 高（与产品是否一致待确认） | 0013/0029/0031 表结构 |
| P4 | 检索函数在 serving_scope / taxonomy 两个 GUC 都为空时**不做赛道过滤**（保留了旧路径），隔离靠应用层保证一定会设置 scope；`setServingScope(undefined)` 会静默走无过滤路径 | 已核实 | 中低（只是赛道串题，所有内容本来都公开，不会泄露租户数据） | 0106:73-82；qbank-generation-retrieval.ts:59-61 |
| P5 | 遗留的 GUC 策略（`qbank_is_curator`、`principal_user='__system_qbank__'`）还挂在表上。目前 app_role 没有表权限所以不生效，但以后如果有人重新 GRANT，会立刻变成伪造 GUC 就能读写的漏洞 | 推断 | 低 | 0013:63-77；0029:45-54；0031:21-25 |
| P6 | `reviewSource` 在没有主体时用 coalesce 把审核人记成 `__system_qbank__`，审计会显示成"系统"，看不出真实操作人 | 已核实 | 低 | packages/db/src/qbank-curation.ts:52-55 |
| P7 | 0146 的释放函数没有调用方或调度，retired/failed 分区仍会无限增长，要等人手动执行 | 已核实 | 低（运维） | 0146:9；全仓只在 proof 里引用 |

## 6. 一段话讲清楚
平台维护**一份**公共题库：内容先提议、再审核，审核通过才进池；切块、向量化成一个新"代"，校验通过后整体切换为当前代，旧代退役，用 0146 可以手动删掉退役代的存储。面试出题时，worker 只能调几个固定的数据库函数，在当前代里按"岗位赛道"找题，只返回仍审核通过、已发布、证据完整的题。B 端面试的赛道来自岗位路由；C 端练习面试现在拿不到赛道，所以不出库题。题库没命中时由 LLM 生成题，生成题只属于这场面试和这位候选人，不进题库，也不计入 B 端分数。没有企业私有题库这一层。按人私有的隔离只在另一套通用 RAG 文档系统里有。
