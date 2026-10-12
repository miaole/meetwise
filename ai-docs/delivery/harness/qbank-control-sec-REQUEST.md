# QBANK-CONTROL-SEC REQUEST（qbank 控制面鉴权收口小刀 · AG-41 全部+AG-43 调度半+AG-42 五函数+P5 缺号项 · SQL 主体·新迁移 0176+）

**Status**: **`draft:awaiting_pre_exec_dual`**（docs-only 起草·落卷即停·零码动·恰 1 .md·本卷即改动集全部）。

**席位**：qbank 控制面鉴权收口小刀起草席（AG-39~43 验证席定谳后·协调方刀映射承接·北星 loop）。
**基线**：`feat/mysql-schema-skeleton` @ `4fabecc3`（主线 tip·`git log -1` 实测 2026-10-12 19:09:12 +0800·INDEX 第十一节验证卷）。分支 `line/qbank-control-sec`·工作树 `meetwise-qsec`（仓根同级 worktree·`git worktree add ../meetwise-qsec -b line/qbank-control-sec` 本起草席已立·建前 worktree list + branch 双查实测不存在）。
**立项出处（三层蓝本·不自建 SSOT 行——刀映射行翻面权归协调方）**：①`issues-final.md` AG-41 `:500-509`（P2·0146 GUC 鉴权+GRANT app_role+failed 缺 epoch 守卫）/AG-42 `:511-520`（P3·双空 GUC 跨赛道）/AG-43 `:522-531`（P3·`__system_qbank__` 审计归因+释放函数无调度）+`qbank-acl.md` 全文（P1 `:51`/P4 `:54`/P5 `:55`/P6 `:56`/P7 `:57`+§3 权限实现与 GRANT/REVOKE 演进史 `:27-38`+§4 发布退役与 0146 释放存储 `:40-47`）；②`LANDING-INDEX.md` §11 `:85` 刀映射定谳①（「qbank 控制面鉴权收口（SQL-only）收 AG-41 全部+AG-43 调度半（显式解除 Ban）+AG-42（5 函数删双空放行）+P5 缺号项顺手」——本刀收编面即此）+§9 `:69` P5 缺号项（qbank-acl P1-P7→AG 映射 P5 被丢·未获 AG 编号·归 AG-41 同族小刀顺手清理或明示豁免）；③验证席 tip `270a863c` 亲证定谳（§11 `:83-84`：AG-41 安全面全部核实——0146 系复活 0029 旧 GUC 模式的漏网新函数·修法模板=0066:162-165 同族手术先例；AG-42 放行面实为 5 函数非 1；AG-43「无调度」系设计内 Ban 非疏漏·修法须显式解除 0146 Ban）。

## §0 现状锚（起草席亲读·base `4fabecc3`·file:line 逐条 rg/sed/awk/git ls-tree 实测复核·**EXEC 立项照本节重 pin**——基线漂移如实改锚·结论不变则只更行号）

### 0.0 防重双对表（已终局·强制项）

- `git worktree list`：14 树实测（主仓+5e/aga/agb/agc/authz/blite/cost1/e2sc/i263/i6/entpay/parity2/ttlwire）——**无 qsec 树**。
- `git branch -a | grep -i -E "qsec|qbank-control"` EXIT=1——**无 line/qbank-control-sec 分支**。
- `rg -l "qbank-control-sec|qsec" ai-docs/delivery/harness/` EXIT=1 **零同名刀卷**。→ **停止条件未触发·可建树落卷**。

### 0.1 blob 锚表（`git ls-tree HEAD` 亲算·全 @`4fabecc3`）

| 文件 | blob | 关键行锚 |
|---|---|---|
| `packages/db/migrations/0146_qbank_partition_lifecycle.sql` | `c9982ea1`（全 40 hex：`c9982ea1ec4136a4e6dc26f82f1ef63bdbd6e4b5`·全 62 行） | `:8-11` 头注（**`:9` 「例程为手动运维例程（无自动调度·Ban 自动清理调度）」=AG-43 调度半 Ban 原文**）·`:13` storage_released_at 列·`:15-59` `qbank_release_retired_generation_storage`（`:17` SECURITY DEFINER·`:22-25` 守卫1 GUC 断言（`:23` `current_setting('app.principal_user')<>'__system_qbank__'` 拒）·`:26-34` 守卫2 state∈retired/failed·`:35-39` 守卫3 非 active 指针·`:40-45` 守卫4 epoch（**:43 `IF st='retired' AND snap_epoch>=now_epoch`——仅 retired·failed 无 epoch 守卫**）·`:46-49` 守卫5 幂等门·`:55-56` DETACH+DROP·`:58` 落 storage_released_at）·`:61-62` REVOKE FROM PUBLIC+**GRANT EXECUTE TO app_role** |
| `packages/db/migrations/0066_qbank_control_executor.sql` | `1e3f21f8` | `:12-18` `qbank_control_executor` 角色定义（NOLOGIN NOINHERIT NOBYPASSRLS）·`:22-25` 收回 app_role 全部 qbank 表写权限·**:90-93** doctrine 注释原文（「Control functions are called only after SET LOCAL ROLE qbank_control_executor. Do not use current_setting('app.principal_user') for authorization inside SECURITY DEFINER functions: the executable grant is the authorization boundary.」）·**:162-165** 手术先例（REVOKE prepare/validate/activate/fail 四函数 FROM PUBLIC, app_role+GRANT TO qbank_control_executor） |
| `packages/db/migrations/0067_qbank_control_plane_read_boundary.sql` | `5188d0c2` | **:36-38** 边界条款原文（「Request roles must never read the controlled corpus directly…qbank_is_curator() is legacy, GUC-based routing context and cannot be an authorization root for raw source/chunk reads.」）·`:39-44` REVOKE SELECT 十表+候选视图 FROM PUBLIC, app_role |
| `packages/db/migrations/0106_qbank_track_local_serving_scope.sql` | `412eb975`（全 367 行） | `:23-45` 头注（**:27-28**「returns NULL when unset -- which is the legacy no-filter path, keeping rag-generation:prove (which calls retrieval without any scope) green」=双空放行分支的自认存续理由）·五函数定义 `:55`（ann_search）/`:94`（lexical_search）/`:134`（distances）/`:170`（evidence）/`:208`（question_evidence）·**双空放行分支五处**：`:75-81`/`:121-127`/`:159-165`/`:196-202`/`:247-253`（每支形=（两 GUC 皆 NULLIF 后为空）OR（皆非空且 g.taxonomy_version/g.serving_scope_id 与之相等）·每支 6 处 current_setting）·`:280-289` 五函数 REVOKE PUBLIC+GRANT app_role·`:358-367` qbank_retrieval_plan(_event) owner RLS 策略（current_setting 比对·**非本刀面**） |
| `packages/db/migrations/0144_db_trigfam_unify.sql` | `29afdf46` | `:619-657` `tf_qbank_generation_ann_search`（**ann_search 现行权威 SQL 体**·内含双空放行分支 `:640-647`）·`:659-667` `qbank_generation_ann_search` 重定义为 SECURITY DEFINER thin delegator（`:667` `SELECT * FROM public.tf_qbank_generation_ann_search(...)`）·`:674-701` `tf_is_generation_control_definer`（definer 白名单单一真相源 15 成员·0144 §5 簇③-b 注释 `:671-673`「后续新增 definer 成员=改本列表」）·`:714-716` tf_ 函数 ACL（`:716` tf_ann GRANT qbank_control_definer） |
| `packages/db/migrations/0070_qbank_low_privilege_control_definer_rls.sql` | `1a8d19ac` | `:20-38` `qbank_is_generation_control_definer()` 原始形（current_user IN proowner 白名单四成员·definer 断言先例）·`:40-43` GRANT EXECUTE TO app_role+executor（RLS 谓词求值需） |
| `packages/db/migrations/0013_qbank_source.sql` | `54204325` | `:32-35` `qbank_is_curator()`（读 GUC 比对 qbank_curator 表）·`:63-77` 遗留 GUC 策略三支（p_src_read `:63-67`·p_src_propose `:70-72`·p_src_review `:75-77`）——**P5 挂表之一** |
| `packages/db/migrations/0029_qbank_generation_hybrid_retrieval.sql` | `bb2d58ff` | `:45-54` 遗留 GUC 策略四支（p_qbank_chunk_read/insert 用 qbank_is_curator `:45-47`·update/delete USING(false) 硬拒 `:50-54`）——**P5 挂表之二**（后两支非 GUC） |
| `packages/db/migrations/0031_qbank_question_artifact_rag.sql` | `27e11fbd` | `:21-25` p_qbank_question_read（qbank_is_curator）/p_qbank_question_write（`current_setting('app.principal_user')='__system_qbank__'`）·`:40-44` p_qbank_question_chunk_read/write 同形——**P5 挂表之三** |
| `packages/db/src/principal.ts` | `c31cbac0` | **:981-990** asPrincipal docblock doctrine（「This GUC is a tenant-routing context, not a cryptographic identity root…Destructive SECURITY DEFINER capabilities must therefore use a separately provisioned executor plus a verified authorization assertion, never treat app.principal_user alone as proof of user authorization.」关键句 `:985-986`）·**:991-998** asPrincipal 本体（`:995` SET LOCAL ROLE app_role+`:996` set_config('app.principal_user')——**自设 GUC 通道**）·`:1240-1251` asQbankControlExecutor（`:1244` SET LOCAL ROLE qbank_control_executor·调度/调用方先例） |
| `packages/db/src/qbank/qbank-curation.ts` | `e617a824` | `:48-58` reviewSource UPDATE 块（`:51-53` 注释自认「audit attribution only; PostgreSQL role grants, not this GUC, decide who may perform the update」·`:55` `reviewed_by=coalesce(nullif(current_setting('app.principal_user',true),''),'__system_qbank__')`）——**AG-43 审核人半·范围外登记** |
| `packages/db/src/qbank/qbank-generation-retrieval.ts` | `cd9bcb97` | `:56-64` setServingScope（`:58` 注释「Unset (no scope) keeps the legacy no-filter path」·`:60-61` scope===undefined 即 return 不设 GUC）·`:44-53` validateServingScope 双正则 |
| `packages/db/test/dbhy1.proof.ts` | `b7fb0c70` | `:385` release helper=**攻击路径演示本体**（`set_config('app.principal_user','__system_qbank__',false)` 后直调释放函数）·`:388-393` expectRejected+SQLSTATE 映射·P5 族 13 臂 `:395-433`（P5-2 epoch 守卫臂 `:405`·P5-6 evidence 双空返回 2 行臂 `:416`·P5-11 非 `__system_qbank__` 拒绝臂 `:422-426`·P5-12 failed 回收臂 `:429-432`）·`:424` 无 GUC 直调 |
| `apps/worker/src/qbank-generation.ts` | `a74fe089` | `:167-178`/`:196-206` 等 asQbankControlExecutor 域形（灌库代码走 SET LOCAL ROLE executor 先例） |
| `apps/worker/src/main.ts` | `00ba4084` | `:271-310` qbank 启动构建流（一次性·`:292` seed/reconciled 日志形·`:310` generation 状态日志形——**打点形先例**）·`:708-709`+`:771-772` usage-calibration/model-invocation reconciler 接线形（**调度形 A 先例锚**）·`:236-249` Prometheus gauge 面（打点备选形） |
| `apps/worker/test/qbank-generation.proof.ts` | `2c2035e3`（611 行·rg --text） | =0106 头注所称 `rag-generation:prove` 本体（`n:prove`→`prove:qbank-generation`）·`:527-551` 直调 ann/evidence/question_evidence **不设 scope GUC**（走双空无过滤路径——AG-42 形选的 proof 随锚面） |
| `packages/db/test/rag04-track-local-retrieval.proof.ts` | `102a1399` | `:331-346` 设 scope GUC 的正反面臂（「仅设一 GUC→0 行」fail-closed 半边语义已在 proof 在场）——修法②的语义近邻 |
| `ai-docs/delivery/ai-capability-review/issues-final.md` | `dac7f58c` | AG-41 `:500-509`·AG-42 `:511-520`·AG-43 `:522-531`（蓝本一） |
| `ai-docs/delivery/ai-capability-review/qbank-acl.md` | `04b79936` | P1/P4/P5/P6/P7 `:51/:54-57`·§3 `:27-38`·§4 `:40-47`（蓝本二·源探索卷） |
| `ai-docs/delivery/ai-capability-review/LANDING-INDEX.md` | `948fc7c7` | §9 `:69` P5 缺号项·§11 `:81-86` 刀映射定谳（蓝本三·只读引用） |

### 0.2 漂移登记（派单文字 vs 实测·如实改述·结论零变·非停止条件）

1. **ann_search 现行权威体在 0144 非 0106**：issues-final AG-42 file:line 引 `0106:73-82`（ann 双空支原始落点）——实测 ann 的现行 SQL 体已于 0144 TRIGFAM 统一刀迁入 `tf_qbank_generation_ann_search`（`:619-657`·双空支 `:640-647`）·`qbank_generation_ann_search` 本体 `:659-667` 已是 thin delegator；其余四函数（lexical/distances/evidence/question_evidence）现行体仍在 0106（`:94-303` 各自 CREATE 段·零后继迁移重定义·rg 全目录实证）。**新迁移镜像基准=ann 取 0144 tf_ 体·余四取 0106 体**——双空放行分支五处在场结论零变。
2. **「16 处 GUC 引用」口径差**：派单作「0106:73-82+:194-205 等 16 处」——实测 0106 内 current_setting/set_config 字面共 38 处（头注 4 处 `:23/:25/:37/:39`+双空支族 30 处（5 支×6）+retrieval_plan RLS 策略 4 处 `:360/:361/:366/:367`）·另 0144 tf_ 体内 6 处。行锚与分支数（5 函数 5 支）与定谳吻合·仅计数口径不同·如实登记。
3. **qbank-curation.ts 行锚小漂**：派单/蓝本作 `:52-55`——实测 reviewSource 块 `:48-58`（coalesce 臂 `:55`）。该面（AG-43 审核人半）本刀范围外·仅登记。
4. **principal.ts 行锚微调**：派单作 `:984-989/:991-997`——实测 docblock `:981-990`（关键句 `:985-986`）/asPrincipal 本体 `:991-998`（SET LOCAL ROLE `:995`·set_config `:996`）。逐位吻合级微调。
5. **`principal.ts:43` 非 asPrincipal 面**：派单红事实链末项「failed 无 epoch 守卫 :43」——实测 `:43` 系 0146:43（epoch 守卫 retired-only 行）非 principal.ts 行·按 0146:43 钉。

### 0.3 迁移号裁定登记（协调方裁定链·在案引用）

`packages/db/migrations/` 实测 **171 个 .sql**（0001-0169 共 169 号−空号 0164+重号三组各一 0143×2/0152×2/0160×2=171·ls+uniq 亲数）。协调方编号分配裁定（ag-c-requeue-REQUEST rev2 E1 在案）：**billing 0170-0173 / 刀 B（ag-b-classify·`0174_ag06_settled_failed_usage_source.sql` 已落 agb 树实测）/ 刀 C（ag-c-requeue 计划 0175）/ 本刀=0176 起**。主线 4fabecc3 树内 0170+ 零命中实测（rg --fixed-strings 零文件）。重号/空号历史不改（rev2 E4 同款纪律）。

## §1 红事实（全 @`4fabecc3` 实测·机制链逐环机证）

### 1.1 AG-41：0146 释放函数复活 GUC 鉴权（P2·安全面）

机制链五环：①`:61-62` `GRANT EXECUTE … TO app_role`——运行时请求角色持有执行权（对照 0066:162-165 四控制函数 0066 年已收口的同族面·0146 系漏网新函数·验证席定谳原文「复活 0029 旧 GUC 模式的漏网新函数」）；②`:22-25` 函数内唯一鉴权门=`current_setting('app.principal_user')='__system_qbank__'` GUC 断言——而 asPrincipal 本身（principal.ts:991-998·`:995-996`）就是「SET LOCAL ROLE app_role+set_config 该 GUC」的通道，即**任一 app_role 连接可自设该值**（principal.ts:985-986 doctrine 自认「tenant-routing context, not a cryptographic identity root」）；③`:17` SECURITY DEFINER——通过断言后以 proowner 身份执行；④`:55-56` 实害=DDL `DETACH PARTITION+DROP TABLE`（行级 DELETE 被 0029 触发器焊死·清理必走 DETACH·不可降级）；⑤**边界条款直接违反**：0066:90-93 明文「Do not use current_setting('app.principal_user') for authorization inside SECURITY DEFINER functions: the executable grant is the authorization boundary」+0067:36-38「cannot be an authorization root」。利用形在 proof 里即自证：dbhy1.proof.ts:385 helper 正是「set_config 伪造+直调」形状（证明与攻击同构）。**影响界如实**：目标限 retired/failed 且非 active（`:26-39`）·retired 须 epoch 已前进（`:40-45`）·元数据行不抹（`:57-58`）——但 **failed 代无 epoch 守卫**（`:43` 守卫仅 `st='retired'` 限定）且这是运行时角色可触发的 DDL 入口。

### 1.2 AG-42：五函数双空放行（P3·纵深防御缺口）

五函数=ann/lexical/distances/evidence/question_evidence（0106:55/:94/:134/:170/:208·全 SECURITY DEFINER 授 app_role）。每体 WHERE 内同形双空支：**（serving_scope GUC 与 taxonomy GUC 经 NULLIF 后皆空）→ 不做赛道过滤直接放行**（0106:75-81/:121-127/:159-165/:196-202/:247-253+ann 现行镜像 0144:640-647）。半边语义已 fail-closed（仅设其一→0 行·0106:30-32 头注+rag04 proof `:341/:346` 臂在场）·唯双空支是遗留放行面。存续理由系作者自认：0106:27-28 头注明言该支为保 `rag-generation:prove`（=apps/worker/test/qbank-generation.proof.ts·`:527-551` 三函数直调零 set_config）green。应用层：qbank-generation-retrieval.ts:56-64 `setServingScope` 对 scope===undefined 静默不设 GUC（`:58` 注释自认 no-filter path）——但生产 worker 链由 qbank-retrieve-scope.ts+interview-consumer.ts 保证必设 scope 且要求 trackLocal（qbank-acl §3:38）。**实害界如实**：当前生产不可达·系库内无硬闸的纵深防御缺口（issues-final AG-42 同款定性「依赖应用层保证必传 scope·库内无硬闸」）。

### 1.3 AG-43 调度半：设计内 Ban 原文+全仓零调用方（P3·运维）

0146:9 原文逐字：「例程为手动运维例程（无自动调度·**Ban 自动清理调度**）」——**设计内 Ban 非疏漏**（验证席定谳§11:84）。调用方机证：`rg qbank_release_retired_generation_storage` 全仓（packages/apps/scripts·--glob '!*.sql'）恰 2 命中=dbhy1.proof.ts:385/:424（proof 专用）——**生产调用点=0**。后果：retired/failed 分区无界增长（qbank-acl P7·「存储持续增长·依赖人工运维易遗漏」）。调度先例实测：worker 侧 runDrainLoop 形常驻 reconciler 三席在位（usage-calibration-reconcile.ts:5-6「一拍=枚举→逐 owner·整拍不抛（drain-loop 要求）」+main.ts:708-709/:771-772 接线+启停登记）；qbank 自身构建流=main.ts:271-310 **启动一次性**（非周期·`:302-310` 构建结果日志形）。打点先例：`:292`/`:310` console.log 结构化形+`:236-249` Prometheus gauge 面。

### 1.4 P5 缺号项：遗留 GUC 策略挂表（推断级低危·INDEX §9:69）

休眠策略三簇九支仍挂表：0013:63-77（p_src_read/p_src_propose/p_src_review·current_setting+qbank_is_curator 混合）+0029:45-47（p_qbank_chunk_read/insert·qbank_is_curator）+0031:21-25 与 :40-44（p_qbank_question(_chunk)_read/write·qbank_is_curator+`current_setting='__system_qbank__'`）。**rg 全迁移目录实证：零后继迁移 DROP 此九支**（0066:22-25 只收表权限未摘策略）。现状休眠机理：app_role 已无表权限→策略谓词无求值机会；**风险=未来任何 re-GRANT 表权限即复活「伪造 GUC 即读写」面**（qbank_is_curator 本体=0013:32-35 读 GUC 比对·0087:19-30 镜像加固仅 search_path 未改 GUC 根）。处置两形（裁决项④）：清理（DROP 遗留支+按 0068:220 `USING(false)` append-only 硬拒族形或真空收口）vs 显式豁免登记（INDEX §9 已登记休眠态+re-GRANT 风险·本卷复述即可零 DDL）。

### 1-修法四件（SQL 主体·新迁移 0176+·历史迁移 0001-0169 零字节·沿 ag-b/ag-c 卷「逐字镜像+最小增量」纪律）

- **① AG-41 收口（修法模板=0066:162-165 同族手术先例）**：新迁移 0176 内 `CREATE OR REPLACE FUNCTION qbank_release_retired_generation_storage` 逐字镜像 0146:15-59 体·仅改三处：（a）**守卫1（`:22-25`）整段删除 GUC 断言**·替换为 definer/角色断言（形沿 0070:20-38+0144:677-701 tf_ 白名单单一真相源族先例——推荐=体内断言 `current_user` ∈ definer 白名单或 `='qbank_control_executor'`；**子形呈报**：纯执行授权边界形（0066 四函数同形·零函数内断言·doctrine 原文即「executable grant is the authorization boundary」）——两形均满足「删除对 app.principal_user 的依赖」·双审裁）；（b）`REVOKE ALL ON FUNCTION … FROM PUBLIC, app_role`+`GRANT EXECUTE … TO qbank_control_executor`（沿 0066:162-165 逐字形）；（c）failed 代 epoch 守卫**补齐或明示豁免**（裁决项⑤——豁免理由候选：failed 代无重激活路径（重激活系 retired 专属·qbank-acl §4:42）·非回滚资产·epoch 守卫语义不适用；补齐形=对称纵深无功能损失）。
- **② AG-42 五函数删双空放行（形选=裁决项①）**：新迁移内五函数镜像改 WHERE——**形 A=双空报错**（两 GUC 经 NULLIF 后任一为空即 `RAISE EXCEPTION`（SQL 函数体 plpgsql 化·沿仓内 0124 RAG 平面「principal 为空直接报错」先例·qbank-acl §5:46 记载）=硬闸）或 **形 B=删放行分支**（WHERE 仅留「皆非空且相等」臂→双空=0 行静默）。镜像基准：ann=0144:625-657 tf_ 体（delegator :659-667 零改）·余四=0106 各自体。REVOKE/GRANT ACL 面逐字镜像（0106:280-289·app_role 读面不动——本刀收的是控制面不是读面）。
- **③ AG-43 调度半（Ban 解除=裁决项③·调度形=裁决项②）**：前提=协调方**明示解除 0146:9「Ban 自动清理调度」条款**（设计内 Ban·沿刀协议显式呈报·EXEC 不得先行）；受控调度两形：**形 A=worker 常驻 reconciler**（沿 usage-calibration-reconcile 同形·runDrainLoop 拍·一拍=枚举可释放代→逐代经 asQbankControlExecutor 调释放函数→整拍不抛+逐代 catch·main.ts 接线两处+启停登记·**TS 码面突破 SQL-only 主体如实呈报**）或 **形 B=既有启动构建流机会式调用**（main.ts:271-310 qbank 构建收尾处追加一次 sweep——TS 触点最小·但仅启动跑·兑现度低）。**未释放代打点**：结构化日志（沿 :292/:310 形）或 gauge（沿 :236-249 面）·与调度形同裁。
- **④ P5 处置（裁决项④）**：清理形=新迁移内 DROP 九支遗留策略+按需补硬拒支（沿 0029:50-54 USING(false) 族形）；豁免形=零 DDL·INDEX §9 登记即终（本卷 §1.4 已复述机制与风险）。

## §2 验收断言候选（pre-exec 双审核对单基面·断言力≥3）

1. **新 proof（沿 dbhy1.proof.ts 隔离库+A() 计数形·住地 `packages/db/test/` EXEC 定名）**：①executor-only 拒绝臂——`SET LOCAL ROLE app_role`（或同等非授权角色会话）后调释放函数→`insufficient_privilege`（42501·沿 dbhy1:388-393 SQLSTATE 映射形）；②definer 断言臂（若①修法采断言形）——伪造 `app.principal_user` GUC 后 app_role 调用仍拒（**原 P5-11 攻击路径的反向证明**）；③failed 代守卫臂（若裁决⑤采补齐形——epoch 未前进 failed 释放被拒；若采豁免形——卷内登记+failed 可释臂维持 dbhy1 P5-12 原值）；④双空臂（按裁决①形选——形 A：不设 GUC 调五函数逐一报错；形 B：双空→0 行·半边（仅设其一）→0 行回归）；⑤五函数逐一覆盖（ann 经 delegator 面）。
2. **dbhy1 既有 proof 回归原值（如实登记随锚面）**：P5 族 13 臂中 **P5-6（`:416` evidence 双空返回 2 行）与 P5-11（`:422-426` GUC 守卫拒绝）系旧语义依赖臂**——刀后须随锚：evi helper 补 `set_config('app.qbank_serving_scope'/'app.qbank_taxonomy_version')`（沿 rag04:331-332 形·proof 件=刀施工面非生产码）+P5-11 由 §2-1① executor-only 拒绝臂替代；**其余 11 臂原值对账**（P5-1/2/3/4/5/7/8/9/10/12/13 零翻）。同登记：apps/worker/test/qbank-generation.proof.ts:527-551 直调臂按形选随锚（形 A 报错臂替换·形 B 0 行断言）·`prove:qbank-generation` 门复跑 EXIT=0。
3. **迁移纪律**：`git diff` 历史迁移 0001-0169 **零字节**+恰一新文件 0176+（若调度采形 A/B 则增对应 TS 触点文件·与 blob 锚对照入收据）；`packages/db/sql/` 影子面零改（qbank 函数不在影子面·rg `qbank_release|qbank_generation_ann` 零命中实测）；0066/0067/0146/0106/0144 五迁移 blob 逐字节不变（§0.1 锚表对账）；重号/空号历史维持。
4. **typecheck 不适用（如实登记·非断言缺位）**：本刀主体=SQL 迁移+proof——若裁决②采 TS 调度触点则该触点 `turbo typecheck` 补入断言；纯 SQL 形下零 TS 生产码改动·typecheck 面自然恒等。

## §3 范围外（边界清单·越界即 FAIL）

1. **AG-39**（无私有题库·大型产品改造·挂用户排期——INDEX §11:85 刀映射③）。
2. **AG-43 审核人半**（qbank-curation.ts:48-58 `__system_qbank__` coalesce——单行搭车项·INDEX §11:85 刀映射②登记·**本刀不收**·qbank-curation.ts 零字节）。
3. **AG-37 pin 修**（同批另办·INDEX §11:86 附带——principal 域 pin 锚漂移非本刀面）。
4. **检索语义/RAG 读面**：五函数 ACL（app_role 读面）零动·0106:358-367 retrieval_plan owner RLS 策略零动·G-R4-5 闭面零波及（不碰 active 代/serving scope 匹配语义本体/cache epoch——AG-42 改的是双空**放行门**不是匹配臂）·候选视图/缓存面零触。
5. **生产 consumer/应用层**：interview-consumer.ts/qbank-retrieve-scope.ts/qbank-generation-retrieval.ts 零字节（纵深防御收口在库内·应用层保证链维持现状）；principal.ts/asPrincipal 零字节（doctrine 面只读）。
6. **其余 0106 GUC 引用**：头注 4 处+RLS 策略 4 处非本刀面（§0.2-2 口径）。
7. est live=0（§6）·共享 SSOT 只读（§5）。

## §4 依赖

**零未决硬依赖**：①AG-41 修法①自足（0146 现势零他刀登记·14 树实测+迁移目录 0170+ 零命中）；②迁移号 0176+ 无交点（billing 0170-0173/刀 B 0174 已落/刀 C 0175 计划·协调方裁定链 §0.3 在案）；③AG-43 调度半依赖修法①先落（executor-only 后调度调用方才可经 asQbankControlExecutor——同迁移内先①后③序即可·非跨刀依赖）；④既有 proof 基线现成（dbhy1 P5 族 13 臂+rag04+worker qbank-generation prove 可复跑对账）。下游：AG-39 产品刀不受本刀阻塞（本刀零 schema 面新增）。

## §5 Ban 列表 + pins（沿 ttl-wire/ag-c 卷同源逐字誊 + 本刀面增补）

**Ban 列表**：

Ban push；Ban 自批（双审须独立外席）；Ban retry-to-green；Ban 翻 pins（§5 pins 十一值·含 `actualSpendCny=null` 不翻）；Ban 改共享 SSOT（product-campaign-LEDGER/execution-master-checklist/issues-master/ai-capability-review 四件+INDEX 行与统计只读引用·刀映射行翻面权归协调方）；Ban 触其他工作树；Ban 伪造来源；**本刀增补**：Ban 历史迁移零字节改（0001-0169·重号 0143×2/0152×2/0160×2+空号 0164 历史不改·只加 0176+ 新迁移）；Ban 动 0066/0067 原文（doctrine/边界条款只读·修法以新迁移镜像落·**不回改原迁移**）；Ban 动 0146/0106/0144 原文（同镜像纪律·blob 锚 §0.1 对账）；**Ban 自动清理调度未解除前先行**（0146:9 设计内 Ban 维持至裁决项③协调方明示解除——EXEC 席不得以「修法③在卷」为由先行施工调度面）；Ban 动五函数 ACL 读面（REVOKE app_role 读权=另刀·本刀只收控制面）；Ban 动 0106:358-367 retrieval_plan RLS 策略与 G-R4-5 闭面；Ban 触生产 consumer/检索语义应用层（interview-consumer.ts/qbank-retrieve-scope.ts/qbank-generation-retrieval.ts/principal.ts 零字节）；Ban 触 AG-43 审核人半（qbank-curation.ts 零字节·搭车项另登）；Ban 触 AG-39/AG-37 面；Ban 顺带升级依赖包（DEPS-AUDIT 域）。

**pins（十一值照抄·零翻转）**：

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · 脚注 actualSpendCny=null（本刀 prove 全隔离库/静态断言·零模型外呼·零消耗）

## §6 est live=0

本刀零模型真实外呼：新 proof/dbhy1 回归/rag04 复跑=隔离库 db prove（沿 dbhy1 既设隔离容器形）·调度形施工后的触发验证=本地假拍/静态断言（不触生产）——零生产操作·零 secrets·零消耗（pins 脚注同源·EXEC 收据逐 prove 登记零外呼口径）。

## §7 markers=0（卫生声明）

本刀改动集（恰 1 .md·`ai-docs/delivery/harness/qbank-control-sec-REQUEST.md`）**五类标记词 grep 零命中**（起草席自检·命令与回执留 prove）。五类标记词不复抄卷内（避免自匹配·沿 ttl-wire/authz-harden 卷 §7 同形制）。

## §8 STOP（开工三条款+五裁决项）

**STOP · `draft:awaiting_pre_exec_dual` · alone≠dual。** 起草席写完即停零码动（本刀恰 1 .md）。开工三条款：①预执行双审两外席 **BOTH PASS 落卷**；②**协调方明示授权**（INDEX §11 刀映射定谳=立项蓝本·本卷非授权本身）；③EXEC 立项**不得改 §1 修法清单与 §5 Ban/pins**（改则回炉重审·立项时照 §0 逐条重 pin——含 §0.2 五项漂移登记如实在案）。**alone≠dual**（单席自验不计双审）· **Dual PASS ≠ 开工**（PASS 只过审·开工须协调方授权）。

**待双审/协调方/EXEC 裁决项**：

1. **AG-42 形选**：形 A=双空报错（硬闸·fail-closed 彻底·沿 0124 RAG principal 空值报错先例·但五函数 SQL 体须 plpgsql 化·worker qbank-generation prove 直调臂随锚面较大）vs 形 B=删放行分支（双空→0 行·最小镜像手术·静默失败语义靠 proof 兜）——issues-final 修法原文两形并列（「函数直接报错；或删除双空放行旧分支」）·推荐 A（库内硬闸才是「库内无硬闸」缺口的直接兑子）·如实呈报两形 proof 随锚成本差。
2. **调度形**：形 A=worker 常驻 reconciler（周期兑现·打点入拍·沿 usage-calibration-reconcile 先例·**TS 码面突破 SQL-only 主体·如实呈报**）vs 形 B=启动构建流机会式调用（触点最小·仅启动跑·兑现度低）——推荐 A·SQL-only 纯度与「受控调度」兑现度的权衡呈协调方裁。
3. **解除 0146:9 Ban**：设计内 Ban 非疏漏（验证席定谳）——**须协调方明示呈报批准后**修法③调度面方可施工（Ban 解除记录入卷 append·不回改 0146 原文）。
4. **P5 处置**：清理形（DROP 九支遗留策略+硬拒族形收口·手术小·消灭 re-GRANT 复活面）vs 显式豁免登记形（零 DDL·INDEX §9+本卷 §1.4 双登记即终）——推荐清理（INDEX §11:85 原文「P5 缺号项顺手清理」向）·豁免形亦为定谳认可的合法终态。
5. **failed 代 epoch 守卫**：补齐形（对称纵深·`IF st IN ('retired','failed') AND snap_epoch>=now_epoch`——**注意语义**：failed 半成品若属当前 epoch 会被挡·须确认无「构建失败即重灌同代」路径受挫）vs 明示豁免形（卷内登记理由：failed 无重激活路径·非回滚资产·epoch 守卫语义（回滚窗口）不适用·dbhy1 P5-12 臂维持原值）——推荐豁免+登记（派单裁决项措辞「补齐或明示裁决」两可·issues-final AG-41 用户影响栏仅记「failed 代缺少 epoch 守卫」事实·豁免零行为面变化）。
6. **守卫1 替代子形**（修法①内呈报）：definer/角色断言形（0070/0144 tf_ 白名单族先例·纵深多一层）vs 纯执行授权边界形（0066 四函数同形·零函数内断言·doctrine 原文自洽）——两形均满足「删 GUC 依赖+executor-only」·双审裁。

---

*QBANK-CONTROL-SEC REQUEST · 2026-10-12 · draft:awaiting_pre_exec_dual · base `feat/mysql-schema-skeleton` @`4fabecc3`（git log -1 实测 2026-10-12 19:09:12 +0800·INDEX 第十一节验证卷）· 分支 `line/qbank-control-sec` · 工作树 `meetwise-qsec`（git worktree add 本起草席立·建前 worktree list+branch 双查不存在）· 立项三层蓝本=issues-final AG-41/42/43（:500-531）+qbank-acl 全文（P1/P4/P5/P6/P7+§3 演进史+§4 发布退役）+LANDING-INDEX §9:69 P5 缺号项+§11:81-86 刀映射定谳① · 防重双对表过（14 树无 qsec·branch EXIT=1·harness 零同名卷）· 红事实=AG-41 五环机制链（0146:61-62 GRANT app_role+:22-25 GUC 断言+:17 DEFINER+:55-56 DETACH/DROP vs 0066:90-93/0067:36-38 边界条款+principal.ts:985-986 doctrine+:991-998 自设通道·failed 无 epoch 守卫 :43·proof 即攻击演示 :385）+AG-42 五函数双空支五处（0106:75-81/:121-127/:159-165/:196-202/:247-253+ann 现行权威体 0144:640-647 漂移登记）+AG-43 调度 Ban 原文（0146:9）+全仓零调用方（rg 恰 dbhy1:385/:424）+P5 九支策略挂表（0013:63-77/0029:45-47/0031:21-25+:40-44 零后继 DROP 实证）· 修法四件（①REVOKE+executor-only 沿 0066:162-165+definer 断言②五函数双空收口（形选）③受控调度+打点（Ban 显式解除呈报+形选）④P5 清理或豁免）· 新迁移 0176+（billing 0170-0173/刀B 0174/刀C 0175 裁定链·171 .sql 亲数）· 断言候选四条（新 proof 五臂族+dbhy1 回归 11 臂原值/2 臂随锚+迁移纪律+typecheck 不适用如实登记）· est live=0 · pins 十一值照抄 · markers=0 · ⛔push · Dual PASS ≠ 开工 · Ban self-approve · alone≠dual · **勘误 rev1（2026-10-11·预执行双审 BOTH PASS 后勘误席 E1-E3 erratum 裁定落卷）**：E1 P5 计数八→九支·全卷四节五处（§1.4 两处+§1-修法④+§8-裁决项④+尾注·证据=0013:63/:69/:73 三支+0029:45/:48 两支+0031:21/:23/:41/:43 四支·§1.4 枚举九名完备·0029:52/:54 USING(false) 两支卷自身已排除）·E2 dbhy1 四臂锚随迁（P5-2 :397→:405·P5-6 :404→:416·P5-11 :419-423→:422-426·P5-12 :425-427→:429-432·§2-2 同引同步）·E3 零星锚校准七项（qbank-curation coalesce :54→:55·usage-calibration 引文 :15-17→:5-6·0066 doctrine :89-93→:90-93·0106 头注 :28-30→:27-28·principal 关键句 :984-986→:985-986·0067 REVOKE 九表→十表·0146 全 63 行→62 行）——纯锚/计数勘误·结论零变·STOP 与 §8-③ 冻结维持·Status 维持 `draft:awaiting_pre_exec_dual`·markers=0*
