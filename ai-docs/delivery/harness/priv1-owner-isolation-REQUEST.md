# PRIV1 · GAP-PRIV-01 owner 隔离实证 REQUEST（候选 A prove · backlog `:57` · PG-retained）

**Status**: `post_prove_dual_pass`（post-prove 双审两独立外席 BOTH PASS（.tmp/reviews/priv1-post-1.md/priv1-post-2.md 在库·rev r3 修订在卷·priv1 并线 PR #224）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null
**Date**: 2026-11-06
**Rev**: r3（post-prove 证伪修订：证伪报告三 P1 全修·源=`meetwise/.tmp/reviews/priv1-post-2.md` FAIL（P0=0 P1=3 P2=4·按其 §7 修订清单执行）·见 §0-R3/§9-R3 · r2=EXEC 期 rebase 并线+r1 复审四条 P2 吸收 · 见 §9-R2 · r1=pre-exec dual 审后修订 · 见 §0-R1/§9-R1）
**Base / parent tip**: 本支基=`origin/main` `db0dc8bfe`（#214）·r2 期 tip=`a8b20cb51`·r3 期零 rebase（`git fetch origin` 零位移·origin/main 仍 `db0dc8bfe` 届值实测）·r3 期 tip=本卷 §9-R3 台账 commit
**Authority**: meetwise — 起草并实现刀（本卷随码起草 · 状态停在 `draft:awaiting_pre_exec_dual` · pre-exec dual BOTH PASS + 协调方 AUTHORIZE 前不 push · implementer 禁自批 · alone ≠ dual）
**Line**: PRIV01（GAP-PRIV-01 owner 隔离实证 · 立卷刀 `line/priv01-nail` 先行 · 本刀=候选 A 实施起草）

## §0 现状

**backlog 原文**（`ai-docs/delivery/gap-bug-backlog.md:57`）：

> GAP-PRIV-01 | P0 | 应用层 tenant 原型 additive + prove 绿；审查 **conditional**；授权根仍为 PG RLS / `asPrincipal`+`set_config`；**应用层 tenant ≠ RLS** | 写清并 prove MySQL 时代显式强制（非 optional filter）+ 跨 owner fail-closed；privacy 清单 prove 绿前 **MUST NOT abandon RLS** | … | `ai-docs/delivery/harness/tenant-enforcement.prototype.md`…

立卷刀（`ai-docs/delivery/gap-bug-backlog.md:779` · harness `gap-priv-01-tenant-rls.md`）已裁定：R-B 为原义重心（验收=跨 **owner** fail-closed 非 org 维度）、候选 A 主体裁可（owner 隔离矩阵 6 项 + RLS 内省 3 项 · 证隔离非修隔离）、候选 B 默认 Ban、**候选 A prove 实施仍待后续授权**——本刀即该实施。

**普查复核结论（如实）**：`.tmp/residual-census-a-1105.md:75` 「候选 A 的 owner 隔离实证 prove 尚未实施」**与代码一致**，无已覆盖误判。佐证：`packages/db/test/tenant-wiring.manifest.ts:13` 自钉「The E5 DB-layer half (GUC unset → 0 rows default deny) **belongs to PRIV01-A candidate A isolation prove**」——仓库 SSOT 亲证该面明确留给本刀。

**已有覆盖（各证各面 · 不互抵）**：

| 已有 proof | 覆盖面 | 与候选 A 的关系 |
|---|---|---|
| `packages/db/test/tenant-wiring-neg.proof.ts`（PRIV01-C · P3） | notification 接线面跨 owner N1–N7（含 N5 冒充 INSERT 42501=RLS 根 behind app layer） | 单表·接线面，非全矩阵非内省 |
| `packages/db/test/tenant-wiring-e5.proof.ts`（P2） | E5 应用层半（静态契约·manifest 机检） | 自钉 DB 层半不在此 |
| `packages/db/test/tenant-enforcement.proof.ts` | `packages/db/src/tenant/` helper 静态 fail-closed | 原型面 · 审查 conditional 未解除 |
| `packages/db/test/privacy-authorization.proof.ts` | 授权签发器/jti/sink receipt 面 | 同库不同面 · 不覆盖 RLS 矩阵 |
| `packages/db/test/memory-vector-chunk-erasure.proof.ts` 等 | 向量面行级擦除 | `:60` 面 · cite-only 零借 |
| `pnpm uc033:cross-user-authz:prove` | 跨用户授权 HTTP 面 | 授权链面 · 不覆盖 RLS 内省 |

**缺口**：候选 A 的隔离实证面——跨 owner 访问矩阵（SELECT/INSERT/UPDATE/DELETE + GUC 缺省 deny + 角色逃逸面 + 应用层守卫机理）与真 PG `pg_policies`/`pg_class` 内省——**零实现**。

**与立卷 REQUEST 的两处事实偏差（如实收窄披露）**：

1. **consumption_record 已死**：立卷时点 0001 DO 循环五表含 `consumption_record`；`0145_dead_table_jsonb_deprecate.sql:19` 已 `DROP TABLE IF EXISTS consumption_record CASCADE`（死表退役刀）。本刀 canonical family 取**存活**七表（interview/ai_graph_run/interview_event/ai_invocation_trace/user_memory/vector_chunk/notification），I1/I2 对不存在的表断言无意义。
2. **tenant/org 记录性内省收窄**：立卷 §3 期待「information_schema 断言无 tenant_id/org_id/workspace 类列」；实测 `0186_qbank_org_owner_columns.sql:49/:63/:77/:93` 为 B 端企业题库合规加了 5 个 `org_id` 列（qbank_source/qbank_chunk/qbank_question/qbank_generation_chunk/qbank_org_curator）。故 T1 改为：断言**零 RLS 策略以 tenant/org 为隔离谓词**（实测 0）+ canonical owner 族内零 tenant/org 列（实测 0）+ 列普查如实入 receipt——企业 org 列是 B 端作用域扩展、不是用户隔离根替代，两头叙事（「已有租户隔离」/「隔离缺陷实锤」）均不写。
3. fetch 两连败（HTTP/2 与 HTTP/1.1 同文）——origin/main 无位移，如实采本值。

## §0-R1 rev r1 修订现状（两份 pre-exec 审查登记 · 2026-11-06）

r0 起草刀收两路 pre-exec 审查：`meetwise/.tmp/reviews/priv1-pre-1.md`（**PASS** · 无 P0/P1 · P2×5 不阻塞）与 `meetwise/.tmp/reviews/priv1-pre-2.md`（**FAIL** · P0=0 · P1=2 · P2=4，按其 §7 修订建议执行本刀 rev r1）。证伪路两 P1 实测成立，r0 proof 对两类真实破坏满绿（40/40）：

1. **interview_event 双盲**：r0 行为矩阵只触 interview/user_memory 两表；I2 是「任一策略含 owner 谓词子串即过」的 SOME 语义——把 `interview_event` 的 `p_owner`（app_role 唯一生效策略）整条删除（MUT-A2）或恒真化（MUT-E），r0 proof 仍 40/40 绿，被 `interview_event_scoring_definer`（TO scoring_definer_owner 的伴生策略）代偿；且 MUT-E 世界实测 app_role（GUC=owner-A）能读到 owner-B 的 interview_event 行（n=1）＝真实泄漏满绿放行。ai_graph_run 无 ALL 型伴生策略故 MUT-A 红、interview_event 有故绿——落点偏差反证代偿结构。
2. **新表漏 RLS 零抓捕**：MUT-F 新迁移建带 owner 列、零 RLS、零策略的表 → r0 proof EXIT=0 满绿。且缺口不是未来时：全迁移链普查（r1 复测一致）带 `owner_user_id` 列的表 107 张、其中 104 张已开 RLS、**3 张零 RLS 零策略**：`ai_model_concurrency_lease`、`ai_model_fee_ledger`、`ai_model_invocation_transition_permit`（0120/0088 创建）。

**三张表的权限与数据性质（r1 活库实测裁定·具名白名单，不补 RLS、零迁移）**：

| 表 | 创建 | 运行时角色直接权限（`has_table_privilege` × SELECT/INSERT/UPDATE/DELETE） | 访问路径 | 数据性质 |
|---|---|---|---|---|
| `ai_model_concurrency_lease` | 0120:120 | app_role=全 0 · PUBLIC=全 0 · 其余 10 个运行时/definer 角色（privacy_api_owner/privacy_worker_owner/privacy_worker_executor/scoring_definer_owner/event_retention_worker/qbank_control_executor/memory_runtime/memory_summarizer/memory_admission_issuer/online_judge_owner）全 0 | 仅 SECURITY DEFINER（`ai_model_admission_acquire/record_scoped`，入口 `ai_cost_require_request_owner` GUC 绑主，0035:4-12） | 跨副本并发槽认领状态（owner/slot/过期时间·瞬态·无用户内容） |
| `ai_model_fee_ledger` | 0120:74 | 同上全 0 | 仅 SECURITY DEFINER（record 写入路径 owner-gated；**全库无任何读取该表的函数**） | 每次调用的钱事实（金额/token 数·无 prompt/output 内容·非应用读面） |
| `ai_model_invocation_transition_permit` | 0088:15 | 同上全 0（0088:27 `REVOKE ALL ... FROM PUBLIC, app_role`） | 仅 BEFORE 触发器消费（`ai_model_consume_transition_permit` NOT app_role-executable，实测 has_function_privilege=false） | 事务本地 capability 存根（owner/idempotency/期望状态·无内容） |

**角色枚举勘正（rev r2 · r1 复审 P2-4 + EXEC 令）**：上行「其余 10 个运行时/definer 角色」系起草时普查值的**不完整清单**——非超用户角色全量实测 **24 个**（另 12 个：memory_policy_releaser/memory_reviewer/online_judge_executor/online_judge_scheduler/privacy_guard_owner/privacy_issuer/scoring_worker_executor/qbank_control_definer/rag_control_definer/rag_control_executor/rag_control_login/app_gateway_role；此为 authoring-time 普查值，**以 G 探针的机器复验为准**）。rev r2 起 G 探针不再硬编码 app_role/PUBLIC：`pg_roles` 全角色动态枚举（排除 superuser、白名单表 owner、BYPASSRLS、`pg_%` 保留）+ PUBLIC 伪角色，每次运行实测复核——终态读数 26 principals（24 角色+PUBLIC+本 proof 临时 runtime login）×3 表×四权=312 三元组全 0、violations=[]（§9-R2）。

裁定：三表均「运行时角色零直接权限、只经受控函数（且入口 owner 绑定）访问、无任何 API 读面暴露用户可区分数据」——按证伪路 §7-3 第二分支进**具名白名单**：proof 内以常量列名+逐表理由，G 断言 live 复核零权限面 + SD 入口 owner-gated witness + 迁移 REVOKE 源文 witness，白名单全文写入收据，不静默放行。补 RLS 对运行时行为面零变化且属动授权根（§1 零触碰），本刀不动。

## §0-R3 rev r3 修订现状（post-prove 证伪修订 · 2026-11-06 · 源=`meetwise/.tmp/reviews/priv1-post-2.md` FAIL P0=0 P1=3 P2=4·三 P1 全部实测成立·按其 §7 修订清单执行）

证伪路三 P1 同根：proof 的全库反演把完备性建在四个列名巧合+具名钉上，覆盖面外存在真实泄漏。r3 逐条处置：

1. **【P1-1 → 修】`auth_user_session`（`user_id` 别名归属，0169 授 app_role SELECT/INSERT/UPDATE，零 RLS——证伪路活体实证跨 owner 读+吊销他人会话行）**：动授权根修根——新迁移 **`0225_auth_user_session_owner_rls.sql`**（协调方派单明确「补 RLS」路径）：ENABLE+FORCE RLS + `p_owner FOR ALL TO app_role USING/WITH CHECK (user_id = current_setting('app.principal_user', true))`（与 0001 canonical p_owner 及 sql/09_auth `p_user_account_self` 同形）。三条应用路径（`apps/api/src/platform/auth-session.ts` 的 issueSessionToken INSERT / revokeSession UPDATE / isSessionActive SELECT）**逐一核实均已在 `db.asPrincipal(uid)` 事务内执行**（principal.guard 时序亲读：asPrincipal 先 BEGIN+SET LOCAL ROLE app_role+set_config GUC 再跑语句）——谓词恒自满足，**零代码改动**，认证/登出流程零破坏（`pnpm neg:auth` 90 例全绿复跑亲证）。跨用户合法会话管理面（如管理员强制下线）今日不存在：全库无任何函数体引用本表（r3 活库普查）；未来若需要必须走显式受控函数（入口 owner 绑定闸），禁直连表面——写明于此，不入白名单。
2. **【P1-1 同根 → 修】列名覆盖扩面**：`ATTRIBUTION_COLUMNS` 四名 → **十名**（补 `user_id` + `candidate_user_id`/`recruiter_user_id`/`payer_user_id`/`access_principal_user_id`/`request_owner_user_id`，全库普查（活库 642 distinct 列名×归属语义逐个确认）后纳入）+ 新增第二反演类 `ACTOR_BY_COLUMNS` 九名（`added_by/reviewed_by/recorded_by/resolved_by/consumed_by/settled_by/entered_by/confirmed_by/failed_by`——行为人归属，其表全部已有 RLS 除 offline_remit_record 入白名单）。语义排除具名+理由：`lease_owner`（副本租约持有者非用户）/`owner_kind`（语料 owner 类别判别符非用户 id）；`subject_id/data_subject_id/actor`（行为作用对象混指涉·非所有权形）不入两族、其表现状全部经兄弟归属列+RLS 覆盖，入收据如实记录。**新别名防再开洞**：G-SCAN 迁移链列普查扫描钉（静态 CREATE TABLE 体+ADD COLUMN+行内建表·plpgsql 变量排除）——凡归属形列名必须∈两常量∪具名语义排除集，新别名（证伪 F5 的 `created_by` 形）即红（MUT-F5A 实测红）。
3. **【P2-3 同批 → 白名单扩员】`ai_cost_reservation`（`request_owner_user_id`，零 RLS）**：r3 活库复核 role_table_grants 仅 owner（meetwise）——与三账本表同信任形（零运行时直接权限+仅经 `ai_cost_require_request_owner` 闸的 SD 路径），按证伪 §7-1 第二分支进 `RLS_FREE_ALLOWLIST`（白名单 3→5，`offline_remit_record` 同批入，理由：admin 台账（entered_by/confirmed_by/failed_by 行为人归属）·零运行时权限·仅经 admin 闸 SD 路径）。
4. **【P1-2 → 修】所有权漂移抓捕（G-O 臂）**：凡带归属列的关系（r/p/v/m）的 owner 必须∈**固定 owner 名单**（迁移链声明的迁移执行超用户 `meetwise` + 三个迁移声明的 definer owner：`rag_control_definer`（0073:17/:220/:278）/`privacy_worker_owner`（0048:16/0107:49）/`online_judge_owner`（0050:17））；非超用户固定 owner 活体断言 NOLOGIN·NOINHERIT·NOBYPASSRLS 角色形（0073/0048/0050 原文 witness）+ 其名下归属关系恒 ENABLE+FORCE RLS；运行时角色（如 `memory_runtime`，角色形与 definer 同·唯名单区分）成为 owner 即红——**ALTER OWNER 变异必红（MUT-F2 实测红）**。
5. **【P1-3 → 修】SD 读者面（G-SD 臂）+ 视局面（G-V 臂）**：动态枚举 app_role/PUBLIC 可执行 SD 函数（prokind='f' 非触发器返回型）；超用户属主且体触归属列/受保护表者必须带标准首闸 witness（`principal IS NULL` 系 / `ai_cost_require_request_owner`）或∈具名 `SD_GATE_ALLOWLIST`（16 成员：12 个 gateway 函数+4 个 qbank bounded reader，逐成员活体钉自证 witness（prosrc/proconfig 子串+EXECUTE 面 app_role=yes/PUBLIC=no）+理由）；非超用户属主的被标记者其 owner 角色形由 G-O 断言（NOBYPASSRLS → RLS 照管 fail-closed）。r3 活库读数：可执行 SD=155·被标记=125·标准闸=12·非超用户属主=97·白名单=16。视图：全库枚举 relkind v/m（现 2 个），凡体引归属列者必须 `security_invoker=true` 或∈具名 `VIEW_EXEMPT`（成员契约=超用户属主+钉死 invoker 态+**体全等钉**（pg16 pg_get_viewdef 归一后逐字））；`qbank_visible_ref`（0016:63-65 设计内 definer-rights，0016:71 fail-closed DO 亲证）与 `qbank_retrieval_candidate`（0068:111-121）两枚 exemption 全钉——**视图体漂移变异必红（MUT-F7 实测红）**。
6. **【P2 余项如实注】**：P2-1（新 BYPASSRLS 角色+超用户铸造才可利用）不在本刀授权面（动角色铸造根），如实留给后继；P2-2（`interview_event_retention_purge` 体钉）r3 处置=该函数属主为 `event_retention_worker`（非超用户·RLS 照管·0219 `app.event_ttl_sweep` 策略面已由 I3 收据钉）——G-SD 判据按属主分类后其不属超用户读者面；P2-4（SD 全平面信任锚申明）由 G-SD 收据三分类计数（155/125/12/97/16）如实承载。

**覆盖面表述收窄（按证伪 §7-6）**：本 proof 的完备性声明自 r3 起如实限定为「凡带两族归属列名的表/视图（活库内省）+迁移链静态扫描（新别名防漏）+SD 动态枚举（app/PUBLIC 可执行面）+视图全枚举+固定 owner 名单」五面之并；动态 SQL 建表与未来非 PG 内省可达形态不在其内，G-SCAN 静态层为第二道网。

**rev r3 文件面（post-prove 证伪修订·动授权根一处=协调方派单明示的 0225 RLS 修根）**：新增受管件恰 1=`packages/db/migrations/0225_auth_user_session_owner_rls.sql`（cap 按合并树实测 **2495→2496** 恰等步进·四联动点 2_496/f-2496.md/:2497 恰等改·CAP-SANCTION-2496 注记两 policy 脚本各追加一条）；行内 additive 改=`packages/db/test/tenant-rls-isolation.proof.ts`（rev r3：M8 会话矩阵+G 扩面两族+G-SCAN 迁移列扫描钉+G-O 所有权+G-SD 读者+G-V 视图+I3 census 341/167+收据五面扩展）、`packages/db/sql/09_auth.sql`（auth_user_session 建表+GRANT+RLS+策略镜像块·sql/ 兼容链世界同步）、`packages/db/test/interview-event-retention.proof.ts`+`packages/db/test/job-queue-index.proof.ts`（迁移计数断言 222→223·链头 0225）、`scripts/run-e2e-isolated.mjs`（注释行迁移链计数 222→223 勘正·注册面零改）、两 policy 脚本（CAP-SANCTION-2496+数值）、本卷。授权根触碰面恰一处=0225（派单令文明示「补 RLS」·其余 principal.ts/app_role/0001 零触碰）。

## §1 修法

**授权根零触碰**：不动 `0001_baseline.sql` 的 ENABLE/FORCE RLS 与 `p_owner`、不动 `principal.ts` `asPrincipal`/`set_config`/`provisionRuntimeLogin`、不动 `app_role`、不接线 `packages/db/src/tenant/`、不加 tenant/org 列（候选 B 默认 Ban 维持）。本刀只**证**隔离、不加不改隔离。

**新件恰 2**：

1. `packages/db/test/tenant-rls-isolation.proof.ts`（rev r1） — 隔离真 PG（`run-e2e-isolated.mjs` one-off pgvector 容器 · pre-migrate 全迁移链 222 件先行）owner 隔离实证 prove，入口先 `assertIsolatedTestTarget`（容器 nonce · 禁指本机开发库/云库）：
   - **矩阵 M1–M6**（r0 面 · C-P3 断言强度不弱化 · 每负臂前置防空转正对照）：M1 跨 owner SELECT=0（A/B 自读 ≥1 正对照）；M2 冒充 owner INSERT→**42501**（自有 INSERT 正对照）；M3 跨 owner UPDATE/DELETE=0 rows（自有 UPDATE ≥1/DELETE =1 正对照·user_memory 全 CRUD grant 面）；M4 GUC 未设/空串→0 rows（池化连接 placeholder **已定义空串**与从未设 NULL 两态都算未设面，承重断言是 0 行 default deny）；M5 角色逃逸面动态化：`provisionRuntimeLogin` 真实 provisioning + 裸查=42501 拒 + `SET LOCAL ROLE app_role` + GUC 两臂；M6 应用层守卫机理（`guardInterviewPrivacyTx` 原查询跨 owner=0 行 + 404/410 分支源文 witness）；
   - **矩阵 M7（rev r1 新增·证伪路 §7-2）**：canonical 七表族**每表全 CRUD 负臂**——跨 owner SELECT=0 / 冒充 INSERT 被拒且行实测不存在 / 跨 owner UPDATE=0 行且 B 行实测未变 / 跨 owner DELETE=0 行且 B 行实测仍在；每个有 grant 的 op 配自有行正对照（防空转绿）；grant 故意缺席的 op（interview/ai_graph_run/notification 的 DELETE、interview_event 的 UPDATE/DELETE=append-only 面设计）钉权限缺席面；vector_chunk 的 DELETE 钉 0125 purge-gate 围栏（无 purge 上下文自有行删除也 42501=文档化 fail-closed）；
   - **内省 I1–I3**（真 `pg_policies`/`pg_class`/`pg_proc` 实读·Ban 迁移 grep 代替）：I1 canonical 七表 `relrowsecurity=true ∧ relforcerowsecurity=true`；**I2（rev r1 改全等·证伪路 §7-1）**：按 TO 角色分组——只取 roles 含 `app_role` 或 `PUBLIC` 的策略集合为 app_role 面（伴生 role-scoped 策略如 scoring_definer_owner/privacy_worker_owner/event_retention_worker 不参与判定，仅入收据），集合非空 + 覆盖读侧（ALL/SELECT/UPDATE/DELETE 的 USING）与写侧（ALL/INSERT/UPDATE 的 WITH CHECK）+ **每条逐策略 deparse 归一化后与钉住的谓词常量全等**（Ban 子串/SOME；interview_event 函数式谓面钉 `interview_event_stream_privacy_active(owner_user_id, stream_key)` 全等 + live `pg_proc.prosrc` 首道 owner 闸 witness `principal IS NULL / principal <> target_owner` + EXECUTE 面 app_role=yes/PUBLIC=no）；I3 策略普查（总数 340 + RLS 表 166）**从记录升格为恰等断言**（漂移=并线时强制有意识重算，cap 同形）+ 全策略名单与 app_role 面名单入 `TENANT_RLS_ISO_RECEIPT` JSON；`visibility='global'` 共享语料面（rag_corpus_document）单列报告、不入 owner 数据面结论；
   - **反演 G（rev r1 新增·证伪路 §7-3）**：全库反演——所有带 `owner_user_id`（及 `tenant_id`/`org_id`/`workspace_id` 归属列，按 §0 偏差 2 定义）的表（relkind r/p）必须 `relrowsecurity=true`，未覆盖差集必须为空**或恰等于具名白名单**（§0-R1 三表：逐表 live 复核 app_role 与 PUBLIC 四权全 0 + SD 入口 owner-gated witness + 0120:132/0088:27 REVOKE 源文 witness），白名单+普查（112 表/109 RLS/3 未覆盖）写入收据——新表漏 RLS（MUT-F 形态）差集非空即红，静默放行 Ban；
   - **T1 记录性内省**（按 §0 偏差 2 收窄）：零 tenant/org RLS 谓词策略 + canonical 族内零 tenant/org 列 + 列普查入 receipt；
   - **S 静态钉**：`principal.ts` SET LOCAL ROLE + set_config witness · `0001_baseline.sql` ENABLE+FORCE+owner 谓词 witness · `packages/db/src/tenant/index.ts` 「应用层 tenant ≠ RLS」头注 witness · 公开 DELETE=503 witness（`privacy.controller.ts` `@Delete('interview-data/:id')` + `HttpStatus.SERVICE_UNAVAILABLE`）。
2. `ai-docs/delivery/harness/priv1-owner-isolation-REQUEST.md` — 本卷。

**既有文件 additive 行内改（零新增件）**：根 `package.json` + `packages/db/package.json` 具名 CMD（`tenant-rls-isolation:prove` → `run-e2e-isolated.mjs tenant-rls-isolation:prove:raw` → `pnpm -C packages/db prove:tenant-rls-isolation`）；`scripts/run-e2e-isolated.mjs` 恰 4 注册点沿 `tenant-wiring-neg:prove:raw` 同形（watchlist/rawTargets/isolatedCommand 分派/pre-migrate 名单第四注册位）；两 policy 脚本 cap 链注**纯追加**（CAP-SANCTION-2491）+ 四联动点恰等改（`public-text-policy.mjs` MAX_FILES `2_489`→`2_491`、`public-text-policy.proof.mjs` loop/atCap/overCap 三处 `2_491`/`f-2491.md`/`:2492`）——不改写任何既有注记。基线亲证：起草前 main `e282c5ebd` 树 `node scripts/ai-docs/check-docs.mjs` EXIT=0 scanned **2489=cap 2489 恰等**。

**cap 算式**：届扫 2489 + 本刀新受管件恰 2 = **2491** 恰等零多放。（rev r2 EXEC 期 rebase 落点如实重算承登：origin/main `db0dc8bfe` 届扫 2493=cap 2493 恰等（RTX/SBG 两波已并）→ union=2493+本支受管恰 2=**2495** 恰等零多放·预登 2491 史录保留零洗·四联动点 2_495/f-2495.md/:2496 恰等改·详 CAP-SANCTION-2495 注记。）**在飞同号竞争如实列**（2026-11-06 本地 ref 实测 · fetch 网络败未刷新）：s3caps-draft ahead=6 / ksw-draft ahead=3 / fastm-draft ahead=3 / xs-draft ahead=14（均 merge-base 92a82a944 两 policy 热面）+ uc31-rev ahead=4（同基两 policy 热面）+ rtx-draft ahead=3（merge-base e282c5ebd=届 tip 两 policy 热面）——并线期沿常设预授权「cap 以合并树实测恰等步进免再询」届时取大重算承登，冲突区 dual-keep 双留史录。

**行文口径**：全文 PG-retained（`ai-docs/delivery/adr-postgres-retained.md`），零 MySQL/Qdrant 切流方向表述；隔离 shell 仅测试基础设施，≠ 产品栈变更 ≠ cutover 证据。

**rev r1 文件面**（按证伪路 §7 修订）：只改 `packages/db/test/tenant-rls-isolation.proof.ts` + 本卷两受管件，**零新增受管件、零迁移、零授权根触碰**（三表裁定白名单见 §0-R1，不写迁移补 RLS）——注册面（runner 四注册点/CMD/两 policy cap 2491）零改动，cap 算式不变仍 2491 恰等。

## §2 验收（rev r1 · 变异从 1 形扩到 8 形全红）

- **变异测试（红先证 · `/tmp` 全仓拷贝 node_modules symlink 回真树 + 追加 `0225_mut_*.sql` 经同一 runner 隔离容器全链复跑·applied=223 逐跑亲证）**——**八形全部必须红**（r0 单形不能外推全族，证伪路 §2/§7-4）：

| # | 变异 SQL（追加迁移） | 破坏形态 | r0 读数 | r1 必红面 |
|---|---|---|---|---|
| A | `DROP POLICY p_owner ON ai_graph_run` | 删策略 | r0 红（仅内省） | I2 ai_graph_run 面空 + M7 ai_graph_run 行为臂 |
| A2 | `DROP POLICY p_owner ON interview_event` | 删策略（app_role 唯一策略） | **r0 满绿（假绿）** | I2 interview_event 面空 + M7 interview_event 行为臂 |
| B | `ALTER TABLE user_memory NO FORCE ROW LEVEL SECURITY` | FORCE 关闭 | r0 红（仅 I1） | I1 user_memory |
| C | `ALTER ROLE app_role BYPASSRLS` | 角色逃逸 | r0 红（10 失败） | M1/M3/M4/M5/M7 行为面 |
| D | interview `p_owner` 谓词加 `OR current_setting(...) IS NULL` | GUC 缺省放行 | r0 红（仅 M5f） | I2 interview 全等失配 + M5f（M4a 池面 v=`''` 不触 NULL 臂，承重=真登录臂，r0 同注） |
| E | interview_event `p_owner`→`TO app_role USING(true) WITH CHECK(true)` | 谓词恒真 | **r0 满绿（假绿·实测跨 owner 读 n=1）** | I2 interview_event 全等失配 + M7 interview_event 行为臂 |
| E2 | user_memory `p_owner`→`USING(true) WITH CHECK(true)` | 谓词恒真 | r0 红（M3+I2） | 同 r0 + M7 user_memory |
| F | 新建 `priv_isolation_decoy(id, owner_user_id NOT NULL)` 零 RLS | 新表漏 RLS | **r0 满绿（假绿）** | G 反演差集非空 |

  r0 的 MUT-PRIV1-1（`0001_baseline.sql` user_memory 手术替换 `USING (true)`）由 E2 同形追加迁移承载；r0 两读数（M3 `upd=1 del=1` + I2 `qual=false chk=false` 红）如实承登不洗。（rev r2 EXEC 期：八形全部重跑仍全红+新增 G2 第三角色授权/H2 fence 钉自证两形，11 形读数见 §9-R2。）（rev r3 post-prove 证伪期：原 11 形全重跑仍全红+新增四形必红=F2 ALTER OWNER 所有权漂移（G-O 固定名单）/F6 无闸 SD 读者（G-SD）/F7 视图体漂移（G-V 体全等钉）/UID user_id 会话表去 RLS（M8 行为+I3 census+G 反演）+补充 F5A `created_by` 别名形（G-SCAN 扫描钉有牙证据）——**16 形全红**，读数见 §9-R3。）（rev r2-一体席 re-dual 收敛期：扩面后新三形必红=UA2R user_account 恒真化（I2-E 全等面·扩面新牙）/W1R definer 属主表 NO FORCE（G-O2·乙席 W1 假绿转红）/SD2 definer 属主降 BYPASSRLS 旗（G-SD 非 super 具名臂）——**三形全红+还原绿**，读数见 §9-R2-一体席。）
- **新 proof 绿**：`pnpm tenant-rls-isolation:prove` 隔离容器真迁移链 EXIT=0。attempts 全录：本卷 §9（r0 台账 + §9-R1 rev r1 台账）。
- **相关既有 proof**：`pnpm db:prove` · `pnpm uc033:cross-user-authz:prove` · `pnpm neg:resume` · `pnpm tenant-wiring-neg:prove`（同锚热面回归）。
- **静态面**：受影响包 typecheck/lint 不高于基线 · `pnpm arch` · `node scripts/e2e-static-guards.mjs` · `node scripts/provider-egress-inventory.mjs` · `node scripts/ai-docs/check-docs.mjs`（届扫=cap 恰等·r3 起 2496）· `node scripts/ai-docs/public-text-policy.proof.mjs`（12/12）· markers 0 · 迁移编号唯一性（`node scripts/check-migration-version-uniqueness.mjs`）。rev r1 零迁移零新增受管件 cap 不动；rev r3 起有迁移 → `migrate:prove`/`drift:prove` 适用必跑；不跑浏览器 UI runner。

**EXIT 契约**：新 proof EXIT=0 ≠ GAP-PRIV-01 CLOSED ≠ backlog `:57` 翻面 ≠ 应用层 tenant=RLS 等价 ≠ 授权根已迁 ≠ HA ≠ releaseEvidence ≠ UC-052 flip ≠ DELETE 开放 ≠ R-A 缺口消失。PREREQ 缺（无 docker/PG）→ 诚实非零 EXIT 记 attempt，Ban 弱断言凑绿，Ban retry-to-green。

**翻面建议（留 nail · 本刀不执行）**：`:57` 行目标句「MySQL 时代」措辞已被 PG-retained superseded；建议 nail 阶段将行内目标改写为「候选 A prove 绿 + 跨 owner fail-closed 维持」PG-retained 口径后，以独立 SSOT 翻行刀处置（立卷刀 `:779` 钉「prove 绿不自动关行」）。本卷只建议，不动 backlog。

## §8 停止条件

`post_prove_dual_pass`（EXEC 已行使·rev r2 台账见 §9-R2；r0 起草期本行承 `draft:awaiting_pre_exec_dual`·史录保留）。pre-exec dual（mw-privacy-int + mw-e2e-ha）BOTH PASS + 协调方 AUTHORIZE 前：Ban push · Ban nail · Ban self-write `post_prove_dual_pass` · Ban SSOT 翻行（backlog `:57`/checklist/matrix/queue）· Ban 翻 coveredCount · Ban 借 `:60`/`:64`/`:68` 证据 · Ban 开公开 DELETE · Ban UC-050/051/052 covered flip · Ban retry-to-green · Ban 接线 `packages/db/src/tenant/` · Ban 加 tenant/org 列 · Ban 动授权根（RLS/asPrincipal/set_config/app_role）· Ban secrets/`.env*` · Ban 冒充 dual/代签。prove 复现或门红无法收窄 → 停，如实记 attempt 报告。若双审判 M6 witness 化（apps/api 依赖不可 import）强度不足，回炉补动态守卫面（如经 apps/api 侧姊妹 proof），Ban 静默降级。

## §9（r0 台账 · 如实承登不洗 · r1 见 §9-R1）

**实际改动文件**：新增 `packages/db/test/tenant-rls-isolation.proof.ts`、`ai-docs/delivery/harness/priv1-owner-isolation-REQUEST.md`；行内 additive：根 `package.json`、`packages/db/package.json`、`scripts/run-e2e-isolated.mjs`（恰 4 注册点）、`scripts/ai-docs/public-text-policy.mjs`（MAX_FILES + 链注追加）、`scripts/ai-docs/public-text-policy.proof.mjs`（loop/atCap/overCap + 链注追加）。零迁移 · 零授权根触碰 · 零 SSOT 编辑。（rev r1 只改其中前两件，其余零触碰。）

**prove attempts 台账**（Asia/Shanghai · 树 `line/priv1-draft` · base `e282c5ebd`）：

| # | 时点 | CMD | EXIT | 读数 |
|---|---|---|---|---|
| 1 | 2026-11-06 02:49 | `pnpm tenant-rls-isolation:prove` | 1 | 12 失败=内省归一化/死表/占位符语义三缺陷（本 proof 自身缺陷·非隔离面红）· 诚实保留 |
| 2 | 2026-11-06 02:53 | 同上 | 0 | 40 PASS · 读数同 #3 |
| 3 | 2026-11-06 03:02 | 同上（终码 re-run：lint 清理 unused import+naming disable 注释后复跑·断言零变化） | **0** | **40 PASS** · receipt：policies=340 · rlsTables=166 · tenantPredicatePolicies=0 · org 列 5 全在 qbank 族 |
| MUT-1 | 2026-11-06 02:54 | `/tmp/priv1-mut` 变异树同 CMD（attempt2 码） | 1 | M3 红 `upd=1 del=1` + I2 user_memory `qual=false chk=false` · 共 2 失败 |
| MUT-2 | 2026-11-06 03:04 | 同变异树·终码 re-run | **1** | 同 M3 红 `upd=1 del=1` + I2 user_memory 红 · **终码变异红承** |

隔离收据：`.tmp/isolated-proof-receipts/2026-11-05T19-02-21-584Z-34673-*.json`（终码绿）/ `/tmp/priv1-mut/.tmp/isolated-proof-receipts/2026-11-05T18-54-35-896Z-85657-*.json`（变异红·副本 `/tmp/priv1-mut-receipt.json`）。

**门读数（r0 终验承登 · 2026-11-06）**：新 proof attempt3 EXIT=0（40 PASS）+ 变异树 EXIT=1（M3+I2 红）· `pnpm db:prove` EXIT=0 · `pnpm uc033:cross-user-authz:prove` EXIT=0（51 例）· `pnpm neg:resume` EXIT=0（91 例）· `pnpm tenant-wiring-neg:prove` EXIT=0（N1–N7）· packages/db `tsc --noEmit` EXIT=0（tsconfig 含 test/）· eslint 触面 2 warnings=基线同面 2（零新增）· `pnpm arch` EXIT=0（0 error · 8 既有 warning）· `node scripts/e2e-static-guards.mjs` EXIT=0 · `node scripts/provider-egress-inventory.mjs` EXIT=0 · `node scripts/ai-docs/check-docs.mjs` EXIT=0 scanned **2491=cap 2491 恰等** · `node scripts/ai-docs/public-text-policy.proof.mjs` **12/12** EXIT=0 · markers=0（改动集代码面零命中）· 浏览器 UI runner 未跑（按派单）。

## §9-R1 rev r1 台账（2026-11-06 · 树 `line/priv1-draft` · 基 `e282c5ebd` · 审查源 `meetwise/.tmp/reviews/priv1-pre-1.md`（PASS）+ `priv1-pre-2.md`（FAIL·按其 §7 修订））

**rev r1 内容**（证伪路两 P1 全修，r0 断言面零弱化）：① I2 改按 TO 角色分组全等断言（只判 roles 含 app_role/PUBLIC 的策略集合，逐条 USING/WITH CHECK 与钉住谓词全等，Ban 子串/SOME；interview_event 函数谓面钉函数全等 + live prosrc 首道 owner 闸 witness + EXECUTE 面）；② M7 七表族全 CRUD 负臂（跨 owner 读/写/改/删逐表实测被拒 + 有 grant 的 op 配自有行正对照 + grant 缺席/围栏面钉）；③ G 全库反演（owner/tenant/org/workspace 归属列表必须有 RLS，差集非空即红）+ 三表具名白名单（§0-R1 裁定：零直接权限+SD owner-gated，逐表 live 复核写收据，不静默）；④ I3 普查 340/166 升恰等断言；⑤ 收据增 appFacing 名单/owner 列普查/白名单。附带修：ai_graph_run/interview_event 种子经 GUC 事务（projection write guard 对 admin 也 fail-closed，实测发现）。

**prove attempts（Asia/Shanghai）**：

| # | 时点 | CMD | EXIT | 读数 |
|---|---|---|---|---|
| R1-1 | 03:44 | `pnpm tenant-rls-isolation:prove` | 1 | 环境红（P0001）：新种子触 projection write guard 对 admin 也需 GUC——proof 种子缺陷诚实保留，非隔离面红 |
| R1-2 | 03:45 | 同上 | 1 | 1 失败：I2 vector_chunk readExact（UPDATE 策略 USING 为写形谓词，期望集缺该形——proof 断言期望集缺陷，非隔离面红）|
| R1-3 | 03:47 | 同上（终码） | **0** | **98 PASS** · receipt：policies=340 · rlsTables=166 · ownerColumnCensus=112/109/未覆盖3 · allowlist 三表 app_role+PUBLIC 四权全 0 · SD gated witness 过 |

**变异（`/tmp/priv1-mut-r1` = clone @ `391426228` + r1 proof 文件 + node_modules symlink；每跑追加 `0225_mut_*.sql`、`applied=223` 逐跑亲证、跑后删变异文件；log `/tmp/priv1-mut-<ID>.log`）**——**八形全红（EXIT=1）**：

| ID | 时点 | 失败数 | 红读数（首因） |
|---|---|---|---|
| A | 03:49 | 6 | I2 ai_graph_run appFacing=空（伴生策略不复判）+ M7 ai_graph_run 行为臂（own pos=0）+ census 339/340 |
| A2 | 03:49 | 5 | **r0 假绿转红**：I2 interview_event appFacing=空（5 伴生策略在册不代偿）+ M7 interview_event 行为臂 |
| B | 03:49 | 1 | I1 user_memory force=false |
| C | 03:50 | 30 | 行为面全红（M1 cross=1、M2 insert 成功、M3 upd=1 del=1、M4 n=5、M5a bypassrls=true、M7 各表 neg=1） |
| D | 03:50 | 3 | I2 interview 全等失配（USING+WITH CHECK）+ M5f n=4（M4a 池面 v=`''` 不触 NULL 臂，承重=真登录臂） |
| E | 03:50 | 3 | **r0 假绿转红**：I2 interview_event 全等失配×2 + M7 interview_event 跨 owner SELECT neg=1（恒真世界 A 实读 B 行） |
| E2 | 03:50 | 6 | M3 `upd=1 del=1` + M7 user_memory×3 + I2 user_memory 全等失配×2（r0 MUT-PRIV1-1 同形） |
| F | 03:50 | 1 | **r0 假绿转红**：G 反演 uncovered=[3 白名单表 + `priv_isolation_decoy`]，白名单外新表即红 |

**门读数（r1 终验 · 2026-11-06）**：`pnpm tenant-rls-isolation:prove` EXIT=0（**98 PASS**，终态复跑 receipt `2026-11-05T19-54-40-881Z-61664-*.json`）+ 变异八形全红如上 · `pnpm db:prove` EXIT=0（四原语）· `pnpm uc033:cross-user-authz:prove` EXIT=0（51 例）· `pnpm neg:resume` EXIT=0（91 例）· `pnpm tenant-wiring-neg:prove` EXIT=0 · packages/db `tsc --noEmit` EXIT=0 · packages/db eslint 全包 **1042 warnings=cap 1042 基线恰等·0 errors**（r1 proof 文件自身 0 warning）· `pnpm arch` EXIT=0（0 error · 8 既有 warning）· `node scripts/e2e-static-guards.mjs` EXIT=0（runners=6/helpers=21/flags=9）· `node scripts/provider-egress-inventory.mjs` EXIT=0（adapters=5/operations=10/pairs=55）· `node scripts/ai-docs/check-docs.mjs` EXIT=0 scanned **2491=cap 2491 恰等**（r1 零新增受管件，cap 不动）· `node scripts/ai-docs/public-text-policy.proof.mjs` **12/12** EXIT=0 · markers=0（改动集代码面零命中）· 零迁移 → `migrate:prove`/`drift:prove` 不适用未跑 · 浏览器 UI runner 未跑。

**状态**: `post_prove_dual_pass`

## §9-R2 rev r2 EXEC 台账（2026-11-06 · 树 `line/priv1-draft` · rebase 后基 `db0dc8bfe`=#214 · 本支 tip `a8b20cb51` · 源=EXEC 令四项 + `priv1-r1.md` §6 P2×4 + `priv1-pre-2.md` §8 附记实现告警）

**rev r2 内容**（r0/r1 断言面零弱化 · 只改 proof+本卷+rebase 触面，零新增受管件、零迁移、零授权根触碰）：

1. **G 探针全角色动态枚举（P2-1）**：白名单三表零权限探针不再硬编码 app_role/PUBLIC——`pg_roles` 全量动态枚举（排除 superuser、白名单表 owner、BYPASSRLS、`pg_%` 保留）+ PUBLIC 伪角色，逐 (表,角色,权) 断言；唯一例外是具名三元组白名单 `RLS_FREE_GRANT_TRIPLES`——**现存恒空**（24 角色+PUBLIC×3 表×四权=312 三元组活体全 0），每条若加须写明理由+迁移 witness，为绿扩白名单 Ban。RLS 表上的设计内非 owner 访问面（event_retention_worker `qual=true` 0219 retention purge 面、p_vchunk_read qbank 面 0016/0018 已由 I2 全等钉、rag global 析取 0032 已由 I3 钉）系 **RLS 约束的 policy 面，不入本白名单**——白名单表无 RLS，一条 grant=全权无控访问；全库伴生角色 grant 面（privacy/scoring/memory/qbank/rag 诸角色·百级三元组）全部落在 relrowsecurity=true 表上受策略约束，由 I2 全等+receipt 名录钉，盲收进白名单即「为绿扩白名单」故不收。
2. **fence 分支 + interview_privacy_active 函数体钉（P2-2）**：与 `stream_privacy_active` 首道闸钉同形（live `pg_proc.prosrc` 子串 + `rowCount===1` 防重载 + EXECUTE 面 app_role=yes/PUBLIC=no）——① `interview_event_stream_privacy_active` 首闸之后的 fence 面（interview 墓碑 `interview_privacy_active(target_stream)` 调用 + resume_quiz/resume_diagnosis 属主复核 `q/d.owner_user_id=target_owner`）；② `interview_privacy_active(text)` 自身体（0076 现行体：`principal IS NULL`/`length(principal)=0` 首闸 + `i.owner_user_id=principal` 属主复核 + 擦除围栏状态集 `'requested','fenced',...`——即 ai_graph_run 谓词的函数根）。
3. **角色枚举勘正 24（P2-4）**：§0-R1 注记（起草 12 名系不完整普查清单；authoring-time 普查以 G 探针机器复验为准）。
4. **I3 恰等 census 的并线落点（P2-3）**：见下行 rebase 记录。

**rebase 与 census 重计（EXEC 令①·设计行为逐条亲证）**：`git fetch origin` 一次成功（HTTP/2 默认未败）→ origin/main `db0dc8bfe`=#214（rtx+rtx-status-pin+sbg 三刀 12 commit）· rebase 冲突=两 policy 脚本各 1 处，dual-keep（main 侧 RTX 起草/RTX nail/SBG 起草/SBG nail 注史录全保留+本支 PRIV1 起草注并留+新增 **CAP-SANCTION-2495** union 注）· cap 按合并树实测 **2493→2495** 恰等步进（main 届扫 2493=cap 2493 恰等+本支受管恰 2；四联动点 2_495/f-2495.md/:2496 恰等改；合并树 docs:check 届核亲跑 scanned **2495=cap 2495** EXIT=0）· **I3 EXACT census：主线新增迁移=0**（`git diff e282c5ebd..db0dc8bfe -- packages/db/migrations` 空·迁移链 222 件不变·rtx/sbg 两刀零迁移零新表）→ 340/166 **无漂移**，数字未动系逐表核查后实测无漂移、非静默改数（活体亲证 I3 EXACT 绿：policies=340/340 · rlsTables=166/166）；主线新增带归属列表=0，**无新增表处置项**。机制结论（白名单三表裁定、I2 全等谓词、M1–M7 行为面、S 静态钉）在届 tip 活体复验全部成立，无停下上报事由。

**prove attempts（Asia/Shanghai）**：

| # | 时点 | CMD | EXIT | 读数 |
|---|---|---|---|---|
| R2-1 | 04:32 | `pnpm tenant-rls-isolation:prove`（真树终码首跑） | 0 | **101 PASS**（=R1 98+新断言 3）· receipt：policies=340 · rlsTables=166 · ownerColumnCensus=112/109/未覆盖恰 3 白名单表 · **allowlistProbe principals=26 · triples=312 · namedTriples=0 · violations=[]** |
| R2-2 | 04:35 / 04:37 | 同上（/tmp 克隆基线·首两跑） | 1 | 环境红 `isolated_postgres_database_not_ready:boot`——克隆缺 `packages/db/node_modules`（pnpm workspace 依赖面）→ host 探针模块解析失败·补 symlink 后消除·非隔离/断言面红·如实登记 |
| R2-3 | 04:40 | 同上（克隆基线终跑） | 0 | 101 PASS · applied=222 |

**变异（`/tmp/priv1-exec-mut` = clone @ `a8b20cb51` + 工作树终码 proof/policy 三件 + node_modules 双 symlink；每跑追加 `0225_mut_<ID>.sql`、`applied=223` 逐跑亲证、跑后删变异文件·迁移目录还原 222 件亲证；log `/tmp/priv1-exec-mut-<ID>.log`）**——**11 形全红（EXIT=1）**：

| ID | 变异 SQL（追加迁移） | 失败数 | 红读数（首因） |
|---|---|---|---|
| A | `DROP POLICY p_owner ON ai_graph_run` | 6 | M7 ai_graph_run 行为臂×3 + I2 appFacing=空×2 + I3 census 339/340 |
| A2 | `DROP POLICY p_owner ON interview_event` | 5 | M7 interview_event 行为臂×2（r0 假绿形态保持红）+ I2 appFacing=空×2 + census 339/340 |
| B | `ALTER TABLE user_memory NO FORCE ROW LEVEL SECURITY` | 1 | I1 user_memory force=false |
| C | `ALTER ROLE app_role BYPASSRLS` | 33 | 行为面全红（M1 rowCount=1 · M2 insert-succeeded · M3 upd=1 del=1 · M4a/b n=5 等） |
| D | interview `p_owner` 谓词加 `OR current_setting(...) IS NULL` | 3 | M5f n=4（真登录 GUC 未设全泄）+ I2 interview readExact/writeExact=false |
| E | interview_event `p_owner`→`USING(true) WITH CHECK(true)` | 3 | M7 sel neg=1（恒真世界真实泄漏被抓）+ I2 readExact/writeExact=false |
| E2 | user_memory `p_owner`→`USING(true) WITH CHECK(true)` | 6 | M3 upd=1 del=1 + M7 user_memory×3 + I2 ×2 |
| F | 新建 `priv_isolation_decoy(owner_user_id)` 零 RLS | 1 | G 反演 uncovered=[3 白名单+decoy] census=113/109 |
| G1 | `GRANT SELECT ON ai_model_fee_ledger TO app_role` | 2 | G allowlist held=[app_role:SELECT] + receipt violations=[(ai_model_fee_ledger,app_role,SELECT)]——白名单非永久豁免保持 |
| G2（EXEC 新增·第三角色授权） | `GRANT SELECT ON ai_model_concurrency_lease TO memory_runtime` | 2 | **r1 复审同形假绿转红**：held=[memory_runtime:SELECT] + violations=[(ai_model_concurrency_lease,memory_runtime,SELECT)]——全角色枚举后第三角色漂移必红（EXEC 令验证项达成） |
| H2（EXEC 新增·fence 钉自证） | `interview_event_stream_privacy_active` 体改：首闸保持、删墓碑 fence 调用+quiz/diagnosis 属主复核 | 1 | I2 fence 分支钉 fence=false（首闸钉 rows=1 仍绿——变异只坏 fence 面即被新钉抓捕·新钉有牙实证） |

**门读数（r2 终验 · 2026-11-06）**：新 proof EXIT=0（**101 PASS** · 真树 receipt `2026-11-05T20-33-01-964Z-95677-*.json` + 终态复跑 `20-38-01-771Z-14054-*.json`）+ 变异 11 形全红如上 · `pnpm db:prove` EXIT=0（四原语）· `pnpm uc033:cross-user-authz:prove` EXIT=0（51 例）· `pnpm neg:resume` EXIT=0（91 例）· packages/db `tsc --noEmit` EXIT=0 · packages/db eslint 全包 **1042 warnings=cap 1042 基线恰等 · 0 errors**（proof 文件自身 0 warning）· `pnpm arch` EXIT=0（0 error · 8 既有 warning）· `node scripts/e2e-static-guards.mjs` EXIT=0（runners=6/helpers=21/flags=9）· `node scripts/provider-egress-inventory.mjs` EXIT=0（adapters=5/operations=10/pairs=55）· `node scripts/ai-docs/check-docs.mjs` EXIT=0 scanned **2495=cap 2495 恰等**（rebase union 步进·见 CAP-SANCTION-2495）· `node scripts/ai-docs/public-text-policy.proof.mjs` **12/12** EXIT=0 · markers=0（改动集代码面零命中）· 零迁移 → `migrate:prove`/`drift:prove` 不适用未跑 · 浏览器 UI runner 未跑（按派单）。

**状态**: `post_prove_dual_pass`

## §9-R3 rev r3 post-prove 证伪修订台账（2026-11-06 · 树 `line/priv1-draft`（meetwise-priv1 worktree）· 基 `db0dc8bfe`=#214 · r2 期 tip `a8b20cb51` · 本支 r2 期已产 3 commit（731c33e2a/a8b20cb51/6e9b4d698） · 源=`meetwise/.tmp/reviews/priv1-post-2.md` FAIL（P0=0 · P1=3 · P2=4·互盲第二路·其 §1 门读数亲核与本卷 §9-R2 一致）· 协调方派单八项随令执行）

**rev r3 内容**（三 P1 同根=覆盖面缺口·修法五面详 §0-R3 · 断言面只增不减）：① `auth_user_session` 动授权根修根=新迁移 **0225**（派单令文明示「补 RLS」路径）+ sql/09_auth.sql 镜像块；三条代码路径核实均已在 `db.asPrincipal(uid)` 内（principal.guard 时序亲读）零代码改·`pnpm neg:auth` 90 例全绿认证零破坏；跨用户会话管理面不存在如实写明（§0-R3-1）。② 归属列普查扩面（642 列名全普查）：`ATTRIBUTION_COLUMNS` 4→10 + `ACTOR_BY_COLUMNS` 9 + G-SCAN 迁移链列扫描钉（新别名即红）。③ `RLS_FREE_ALLOWLIST` 3→5（ai_cost_reservation+offline_remit_record·零运行时权限活体复核沿 r2 探针形）。④ G-O 所有权固定名单（meetwise+0073/0048/0050 三 definer·角色形活体断言）。⑤ G-SD 读者面（155 可执行 SD 动态枚举·超用户被标记者须首闸或 16 成员具名白名单逐成员活体 witness）+ G-V 视局面（2 视图全枚举·exemption=属主+invoker 态+体全等钉）。⑥ I3 census 341/167（0225 +1 policy +1 RLS 表）。⑦ 迁移计数断言同步 222→223（interview-event-retention+job-queue-index 两 proof·链头 0225）。

**prove attempts（Asia/Shanghai）**：

| # | 时点 | CMD | EXIT | 读数 |
|---|---|---|---|---|
| R3-1 | 21:42 | `pnpm tenant-rls-isolation:prove`（真树首跑） | 1 | 4 失败=本 proof 自身三缺陷一真洞：G-SCAN 扫描器漏 suspectRe 过滤（619 suspects）·G-O forceRls 列别名 snake/camel 失配（rag 五表误报 rls/force off）·G-SD qbank manifest witness 签名形状失配·G-V 体全等缺 trim——诚实保留修后复跑 |
| R3-2 | 21:43 | 同上（MUT-F5A 变异先红后绿反证·扫描器补 inline 建表臂修） | 1 | 1 失败：G-SCAN 漏行内单行 CREATE TABLE 形 |
| R3-3 | 21:45 | 同上（终码） | **0** | **124 PASS** · receipt：policies=341 · rlsTables=167 · ownerColumnCensus=125/120/未覆盖恰 5 白名单（userScope 122/118 actorBy 6/5）· allowlistProbe principals=26 triples=520 namedTriples=0 violations=[] · ownership rels=125 owners={meetwise:119,rag_control_definer:5,privacy_worker_owner:1} violations=[] · sd 155/flagged 125/standardGated 12/nonSuper 97/allowlist 16 violations=[] · views=2 全 exemption violations=[] · sessionFace 全 true |
| R3-4 | 21:58 | 同上（lint 修 unused-disable 后终码 re-run·断言零变化） | **0** | **124 PASS** · receipt `2026-11-05T21-58-11-216Z-93557-*.json` |

**变异（`/tmp/priv1-r3-mut` = clone @ `6e9b4d698` + 工作树六件改面文件拷入 + node_modules 双 symlink；每跑追加 `0226_mut_<ID>.sql`、applied=224 逐跑亲证、跑后删变异文件·迁移目录还原 223 件亲证；log `/tmp/priv1-r3-mut-<ID>.log`）**——**16 形全红（EXIT=1）**：

| ID | 变异 SQL（追加迁移） | 失败数 | 红读数（首因） |
|---|---|---|---|
| A | `DROP POLICY p_owner ON ai_graph_run` | 6 | M7 ai_graph_run 行为臂×3 + I2 appFacing/census（r0 形保持红） |
| A2 | `DROP POLICY p_owner ON interview_event` | 5 | M7 interview_event 行为臂 + I2 appFacing=[] + census（r0 假绿保持红） |
| B | `ALTER TABLE user_memory NO FORCE ROW LEVEL SECURITY` | 1 | I1 user_memory force=false |
| C | `ALTER ROLE app_role BYPASSRLS` | 39 | 行为面全红（M1 rowCount=1 · M2 insert-succeeded · M3 upd=1 del=1） |
| D | interview `p_owner` 加 `OR current_setting(...) IS NULL` | 3 | M5f n=4 + I2 interview readExact/writeExact=false |
| E | interview_event `p_owner`→`USING(true) WITH CHECK(true)` | 3 | M7 sel neg=1（恒真世界真实泄漏被抓）+ I2 ×2 |
| E2 | user_memory `p_owner`→`USING(true) WITH CHECK(true)` | 6 | M3 upd=1 del=1 + M7 user_memory + I2 |
| F | 新建 `priv_isolation_decoy(owner_user_id)` 零 RLS | 1 | G 反演 uncovered=[5 白名单+decoy] census=126/120 |
| **F2（r3 新增）** | `ALTER TABLE ai_model_fee_ledger OWNER TO memory_runtime` | 1 | **G-O**：owners={memory_runtime:1} violation=(ai_model_fee_ledger not-in-fixed-list)——r2 假绿转红 |
| **F5A（r3 补充）** | `priv_alias_decoy(created_by)` 零 RLS（证伪 §4-1 合成对照形） | 1 | **G-SCAN**：unknown=[created_by] suspects=20——别名盲区防再开洞有牙（首跑漏行内建表形即修） |
| **F6（r3 新增）** | `priv_sd_leak_probe()` SECURITY DEFINER 读 user_memory 全表+GRANT EXECUTE TO app_role | 1 | **G-SD** reader face：无闸不在白名单——r2 假绿转红 |
| **F7（r3 新增）** | `CREATE OR REPLACE VIEW qbank_visible_ref` 加 `OR v.kind='memory'` | 1 | **G-V**：body drifted from pinned definition——r2 假绿转红 |
| G1 | `GRANT SELECT ON ai_model_fee_ledger TO app_role` | 2 | G allowlist held=[app_role:SELECT] + violations |
| G2 | `GRANT SELECT ON ai_model_concurrency_lease TO memory_runtime` | 2 | G allowlist held=[memory_runtime:SELECT] + violations |
| H2 | `interview_event_stream_privacy_active` 体改：首闸保持删 fence 面 | 1 | I2 fence=false（首闸钉 rows=1 仍绿·变异只坏 fence 面即被抓） |
| **UID（r3 新增）** | `ALTER TABLE auth_user_session DISABLE ROW LEVEL SECURITY` | 7 | **M8b/c/d/e 行为红（跨 owner 读 neg=1·吊销 neg=1·冒名 INSERT 成功·GUC 缺省 n=4）+ M8g rls=false + I3 census 166/167 + G 反演 uncovered=[…auth_user_session…]——P1-1 泄漏形复现必红** |

**门读数（r3 终验 · 2026-11-06）**：新 proof EXIT=0（**124 PASS**·终码 receipt `2026-11-05T21-58-11-216Z-93557-*.json`）+ 变异 16 形全红如上 · `pnpm db:prove` EXIT=0（四原语）· `pnpm neg:auth` EXIT=0（**90 例全绿**·认证/登出零破坏）· `pnpm uc033:cross-user-authz:prove` EXIT=0（51 例）· `pnpm neg:resume` EXIT=0（91 例）· `pnpm migrate:prove` EXIT=0 · `pnpm drift:prove` EXIT=0（sql/ 镜像块同步亲证零漂移）· 迁移编号唯一性 `node scripts/check-migration-version-uniqueness.mjs` EXIT=0（files=223 violations=0·exemptions 0143/0152/0160 既有）· 计数同步两 proof 复跑 EXIT=0（interview-event-retention 39 PASS 链头 0225 + job-queue-index 45 项失败 0）· packages/db `tsc --noEmit` EXIT=0 · packages/db eslint **1042 warnings=cap 1042 基线恰等 · 0 errors**（proof 文件 0 warning·lint 修一 unused-disable 后归位）· 根 eslint **5410=cap 5410 恰等 · 0 errors** · `pnpm arch` EXIT=0（0 error · 8 既有 warning）· `node scripts/e2e-static-guards.mjs` EXIT=0（runners=6/helpers=21/flags=9）· `node scripts/provider-egress-inventory.mjs` EXIT=0（adapters=5/operations=10/pairs=55）· `node scripts/ai-docs/check-docs.mjs` EXIT=0 scanned **2496=cap 2496 恰等**（新受管件恰 1=迁移 0225·CAP-SANCTION-2496 步进·步进前 PTP_FILE_LIMIT:2496>2495 红真 EXIT=1 亲证）· `node scripts/ai-docs/public-text-policy.proof.mjs` **12/12** EXIT=0 · markers=0（改动集 11 文件五类标记词零命中）· 活库普查一次性容器 `priv1-r2-census` 用后已删·未用 git stash·未 push·浏览器 UI runner 未跑（按派单）· 未跑 `pnpm tenant-wiring-neg:prove`（不在派单门列表）。

**状态**: `post_prove_dual_pass`

## §9-R2-一体席 rev r2 re-dual 收敛台账（2026-11-07 · 树 `line/priv1-draft`（meetwise-priv1 worktree）@ `b9a55fb55` · 源=两席 re-dual FAIL 报告 `meetwise/.tmp/reviews/priv1-redual-甲.md`（P1-甲1 盲表族）+ `priv1-redual-乙.md`（P1-1 93 表策略盲区 / P2-1 G-O FORCE 缺口 / P2-2 G-SD 非 super 跳过）· 一体席=起草+落码同一席 · 本节编号「rev r2」系协调方工单口径，与卷内既有 §9-R2（EXEC 期 rev r2）不同轮，勿混淆）

**修法面**（两席已裁定：单文件断言扩面，不动授权根、零新迁移、零产品码改动；本席实测扩面读数与两席口径对账：乙席 93 张=101 app 面向表−8 已覆盖，甲席 48 张盲族与乙席 93 张系两种口径（带归属列 vs 全部 app 面向），本席以 pg 目录实测 101 张/139 条策略为准全量扩）：

1. **I2-E 全等断言扩面（P1-甲1/乙P1-1）**：I2 全等面从 canonical 7 表+会话表扩到**全部带 app_role/PUBLIC 面向策略的表（活库实测 101 张/139 条策略）**，按判据如实分两桶：
   - **owner-form 桶（83 表）**：每表每条 app 面向策略**逐条双射全等钉**（policyname+cmd+USING/WITH CHECK 两侧 deparse 归一化全字符串全等，Ban 子串/SOME）。谓词形按实名登记：归属列等值形（`owner_user_id`/`user_id`/`candidate_user_id`/`recruiter_user_id` 等 = `current_setting('app.principal_user', true)`）、凭据 PK 等值形（`user_account.id`）、隐私围栏复合形（owner 等值 ∧ `interview_privacy_active(...)`，9 表）、函数谓词形（`interview_event_stream_privacy_active`，已有 I2 钉）、party 双臂 OR 形（application_route_binding/job_application 读侧+recruiter INSERT EXISTS 形）、派生 EXISTS 形（checkpoint 三表 enrollment 形 / privacy_deletion_target、privacy_preview_sink_line 父请求形 / resume_blob、resume_profile resume 围栏形）、status 写入闸形（interview_answer_artifact/job/submission）。断言五条：反演（app 面向表∈两桶，不在即红=新表漏钉 cap 式）、钉完备（钉表面被删即红=有意识重钉）、RLS+FORCE 面（101 表全 true）、全等面（83 表双射全等+18 表名集）、registered face（恰 1）。
   - **shared/control 桶（18 表）**：无归属列且设计上共享的表（qbank 控制面/系统语料 15+qbank_curator、qbank_org_curator 目录 2（user_id 为目录身份非行所有权）+level_policy_version 1）——**不为凑数强断言 owner 形**（无所有权列可钉），改钉：全策略名集双射（含 companion，增删漂移即红）+RLS ENABLE+FORCE+收据具名注记（逐表设计面注记入 `receipt.appFaceCensus.sharedControlTables`）。其谓词级漂移（如 qbank 控制面恒真化）属 qbank 控制面 proofs 管辖，如实披露为**本刀 owner 隔离牙之外**（两席 P1 实证形 W4/UA2 均在 owner-form 桶内，已红）。
2. **G-O2 FORCE 契约扩面（乙P2-1）**：全量非超用户属主关系（r/p/v/m 全枚举，不限归属列）必须∈固定 definer 名单**且恒 RLS ENABLE+FORCE**——活库读数 rels=189（meetwise 155 含 2 视图 · online_judge_owner 8 · privacy_worker_owner 1 · rag_control_definer 25）violations=[]；**definer 属主非归属列表=恰 28 张**（online_judge 8+rag 20，与甲席口径恰等，逐表名录入收据 `ownershipCensus.allRelations.definerOwnedNonAttribution`）——即 r3 被跳过的 FORCE 契约缺口面。非超属主视图触红属设计行为（definer 视图=bypass 面须走 G-V 具名，不得静默挪属主）。
3. **G-SD 非 super 具名臂（乙P2-2）**：proof.ts（r3 版 :1504）`continue` 跳过改为断言臂——被标记非超属主 SD 函数（活库 97 个）逐函数断言：属主保持 NOSUPERUSER/NOBYPASSRLS（RLS 照管前提从无断言假设升级为活体断言）+EXECUTE 面 app_role=yes/PUBLIC=no；**97 个具名全名单入收据 `sdReaderCensus.nonSuperNamed`**（owners={memory_runtime:73, privacy_api_owner:19, scoring_definer_owner:4, event_retention_worker:1}）；**`interview_event_retention_purge` 具名在册断言**（0219 设计内跨 owner 保留期清扫面：worker-select qual-true+函数自设 `app.event_ttl_sweep` 删除闸——如实登记，处置归协调方/用户）。
4. **read_decided 设计级上报（乙 P1-1 伴生面·零产品改动）**：`job_route_decision.p_job_route_decision_read_decided`（`0104_job_route_decision.sql:240-242`）= app_role 面向 SELECT、谓词 `route_outcome='route_decided'`、**无 principal 绑定**——app_role 携任意 GUC 可跨 owner 读全体用户的已决路由决策行（乙席活体实证）。本刀不改产品：proof 将该面 **exact-pin 防加宽**（谓词加宽/删除/新增即红）+收据 `registeredNonOwnerFaces` 具名（face='registered-cross-owner-read'）；**是否属预期招聘可见性设计（如 candidate 绑定面注释所示意图）归协调方/用户裁定**，裁定前该面如实登记为「存在且当前无收据兜底」。
5. **变异自证三形**（真树追加 `0226_mut_*.sql` 经同一 runner 隔离容器全链复跑，applied=224 逐跑亲证，跑后删文件·迁移目录还原 223 件亲证）：

| ID | 变异 SQL | EXIT | 失败数 | 红读数（首因） | 对账 |
|---|---|---|---|---|---|
| UA2R | `ALTER POLICY p_user_account_self ON user_account USING(true) WITH CHECK(true)` | 1 | 1 | **I2-E 全等面**：`(user_account.p_user_account_self: USING/ WITH CHECK exact-mismatch … got="true")` | 甲席 UA2 形（r3 版 124 PASS 满绿）→ 扩面后必红 |
| W1R | `ALTER TABLE online_judge_candidate NO FORCE ROW LEVEL SECURITY` | 1 | 1 | **G-O2**：`(online_judge_candidate,owner=online_judge_owner rls/force off)` | 乙席 W1 形（r3 版 124 PASS 满绿）→ 扩面后必红 |
| SD2 | `ALTER ROLE memory_runtime BYPASSRLS` | 1 | 2 | **G-SD 具名臂**：memory_runtime 名下 73 个被标记 SD 函数逐个 `definer owner holds BYPASSRLS`（新具名臂+既有 reader face 共享 violations 双红） | 乙席 P2-2 跳过面 → 具名臂必红 |
| 还原 | 删三变异文件后复跑 | **0** | 0 | **132 PASS / 0 FAIL** · applied=223 | 断言数 124→132（+8：I2-E×5+G-O2×1+G-SD×2），断言面只增不减 |

**prove attempts（Asia/Shanghai · 真树 · docker 隔离容器 runner 自管）**：

| # | 时点 | CMD | EXIT | 读数 |
|---|---|---|---|---|
| U-1 | 2026-11-07（r3 终码基线复跑） | `pnpm tenant-rls-isolation:prove` | 0 | 124 PASS（扩面前基线亲证）· receipt `…-ae416ac8-…json` |
| S-1 | 同日（扩面码·静态门先行） | `tsc --noEmit` / 文件级 eslint | 1→修 | 本席代码缺陷×2 均被静态门拦截于 runner 之前：TS undefined narrowing×4（noUncheckedIndexedAccess）+ eslint 命名规约 99 warnings（snake_case 键名）→ 改 narrowing 处理+两常量表改数组形后 tsc=0/文件 eslint=0（cap 1042 恰等保持）· 非隔离面红、诚实保留修后复跑 |
| U-2 | 同日（扩面终码首绿） | `pnpm tenant-rls-isolation:prove` | **0** | I2-E 五臂+G-O2+G-SD 两臂全绿（详见门读数）· receipt `…-98607086-…json` |
| U-3 | 同日（还原终验） | 同上 | **0** | **132 PASS / 0 FAIL** · receipt `2026-11-06T19-45-39-491Z-43742-*.json` · applied=223 |

**扩面读数（U-5 receipt 摘录）**：appFaceCensus: appFacingPolicyTotal=139 · ownerFormTables=83 · sharedControlTables=18 · registeredNonOwnerFaces=[job_route_decision.p_job_route_decision_read_decided]；ownershipCensus.allRelations: total=189 · owners={meetwise:155, online_judge_owner:8, privacy_worker_owner:1, rag_control_definer:25} · definerOwnedNonAttribution=28 张 · violations=[]；sdReaderCensus.nonSuperNamed=97（memory_runtime 73/privacy_api_owner 19/scoring_definer_owner 4/event_retention_worker 1·全部 appExec=true/publicExec=false）；既有读数零漂移（policies=341/rlsTables=167/census 125/120/白名单 5/principals=26/triples=520/views=2/sessionFace 全 true）。

**设计级上报（归协调方/用户裁定·本刀零产品改动）**：① `p_job_route_decision_read_decided`（0104:240-242）跨主读面——proof 已 exact-pin+收据具名；② `interview_event_retention_purge`（0219:115-149）跨 owner 保留期清扫面（worker-select qual-true+自设 sweep GUC·app_role EXECUTE 显式 GRANT）——proof 已具名在册+属主形/EXECUTE 面断言。两面的「是否属预期设计」与「补绑定收窄/白名单化」处置不在本刀授权面，留协调方。

**门读数（rev r2-一体席 终验 · 2026-11-07）**：新 proof EXIT=0（**132 PASS**·receipt `2026-11-06T19-45-39-491Z-43742-*.json`）+ 变异三形全红+还原绿如上 · `pnpm db:prove` EXIT=0（四原语）· `pnpm neg:auth` EXIT=0（90 例全绿）· `pnpm uc033:cross-user-authz:prove` EXIT=0（51 例）· `pnpm neg:resume` EXIT=0（91 例）· `pnpm tenant-wiring-neg:prove` EXIT=0（N1–N7）· `pnpm migrate:prove` EXIT=0 · `pnpm drift:prove` EXIT=0 · 迁移编号唯一性 EXIT=0（files=223）· 计数同步两 proof（interview-event-retention/job-queue-index）复跑 EXIT=0 · packages/db `tsc --noEmit` EXIT=0 · packages/db eslint **1042=cap 1042 恰等 · 0 errors**（proof 文件 0 warning）· 根 eslint **5410=cap 5410 恰等 · 0 errors** · `pnpm arch` EXIT=0 · `node scripts/e2e-static-guards.mjs` EXIT=0 · `node scripts/provider-egress-inventory.mjs` EXIT=0 · `node scripts/ai-docs/check-docs.mjs` EXIT=0 scanned **2496=cap 2496 恰等**（零新增受管件·cap 不动）· `node scripts/ai-docs/public-text-policy.proof.mjs` **12/12** EXIT=0 · markers=0（改动集零命中）· 活库普查一次性容器用后已删（docker ps -a 零残留）· 浏览器 UI runner 未跑（按令）。

**改动在树未 commit 待门开行使**：本轮改动（`packages/db/test/tenant-rls-isolation.proof.ts` 单文件+本卷）留在工作树，**零 commit 零 push**（协调方 commit 门冻结中），待门开行使。

**状态**: `post_prove_dual_pass`

---

## §9-R3-一体席 rev r3 一体席小修落码台账（2026-11-07 · 树 `line/priv1-draft`（meetwise-priv1 worktree）@ `b9a55fb55`（HEAD 未动）· 源=rev r2 确认乙席 FAIL 报告 `meetwise-priv1/.tmp/reviews/priv1-rev2-confirm-乙.md`（P1-乙1 rag_runtime schema 盲区 BYPASSRLS 变异满绿实证 + P2-乙2 两清扫面登记网漏 + P2-乙3 谓词单点臂零冗余）· 一体席=小修落码同一席 · 本节编号「rev r3」系协调方工单口径，与卷内既有 §9-R3（EXEC 期 rev r3 post-prove）不同轮，勿混淆）

**修法面**（乙席已裁定：普查域放宽+名册驱动角色形状断言+登记面补全，单文件断言级，不动授权根、零新迁移、零产品码改动 · `packages/db/test/tenant-rls-isolation.proof.ts` 2207→2418 行）：

1. **G-SD 普查域放宽（P1-乙1）**：SD 普查 WHERE 从 `nspname='public'` 放宽为 `nspname NOT IN ('pg_catalog','information_schema')`——活库实测放宽后新增可执行 SD **恰 8 个、全在 `rag_runtime` schema**（`rag_register_private_document`/`rag_publish_private_document_version`/`rag_bind_query`/`rag_record_citation`/`rag_tombstone_private_document`/`rag_resolve_query_binding`/`rag_search_bound`/`rag_evidence_bound`，owner=`rag_runtime_definer`（0073:20 建 role/:35 建 schema），全部体触用户域 `owner_user_id` 面）；`rag_control` schema 27 个 SD 因 app_role/PUBLIC EXECUTE=0 被同一特权过滤挡在普查外（0073 ACL fail-closed，如实）。**非 public 可执行 SD 集 cap 钉=上述 8 函数具名名册**（`NON_PUBLIC_SD_ROSTER`，name+schema+owner 双射；新非 public SD=有意识名册编辑）+ 全部 8 个入非超属主具名集断言。sdReaderCensus 读数：executableSd 155→**163** · flagged 126→**147** · nonSuperOwned 97→**107**（+8 rag_runtime+2 assert_interview_answer_* 由表集放宽带出）· violations=[]。**基线勘正（rev3-confirm O1·2026-11-07）：放宽带前基线实为 125/97（非 126/98·转录失真）——r2 席日志、rev2-confirm-乙、rev3-confirm 三方独立计数一致，且 126+22=148≠147 不自洽而 125+22=147 恰等；proof 头注已同步勘正，后值 147/107 有活体断言钉不受影响。**
2. **名册驱动 definer 角色形状断言（P1-乙1 修法 B）**：放宽普查域内全部可执行 SD 函数的**去重非超属主集必须恰等迁移链声明 definer 名册**（`SD_DEFINER_ROSTER`：memory_runtime/privacy_api_owner/scoring_definer_owner/event_retention_worker/rag_runtime_definer，活库恰 5），逐角色活体断言 **NOLOGIN NOINHERIT NOSUPERUSER NOBYPASSRLS**——独立于 flag 正则（体逃 colRe/tabRe 的函数其属主形仍被钉），role 级 BYPASSRLS 升格无法靠正则漏检躲过。
3. **tabRe 表集放宽根因修 + 两清扫面入册（P2-乙2）**：G-SD 保护表网（tabRe TABLES）从 canonical 13 名扩为**全部 app 面向钉集（APP_FACE_PINS 83+APP_FACE_SHARED 18+既有 13）**——两 super 属主无 principal 闸跨 owner 清扫面 `commerce_outbox_relayed_retention_purge`（0212:6）/`ai_usage_calibration_observation_retention_purge`（0177:153）由此入普查，按 read_decided 同处置**登记不修码**：`REGISTERED_CROSS_OWNER_PURGE_FACES` 常量（体 witness 钉：invalid_input 异常码+时间窗/批次帽+EXECUTE 面 app=yes/PUBLIC=no）+ 新断言臂（恰等登记集）+ **receipt.appFaceCensus.registeredNonOwnerFaces 由 1（read_decided policy face）扩为 3**（+2 个 face='registered-cross-owner-purge' function face）。登记网全景=read_decided 读面+两 purge 函数面+interview_event_retention_purge 具名臂。表集放宽同时新带出 10 个 super 属主已体内闸函数入证据 allowlist（6 gateway_admin_*+gateway_active_candidate 带全局 `gateway_require_active_admin/recruiter` witness；qbank_active_generation_metadata/qbank_active_source_id/qbank_lock_retrieval_cache_epoch 有界控制面单体读体钉），allowlist 16→**26** 条，零放松。
4. **P2-乙3 谓词单点臂冗余对照**：I2-E exact-face 臂（confirm-乙 实证删臂+COALESCE 加宽=131/0 绿）后补 **SHA-256 多重集 digest 臂**（`APP_FACE_POLICY_DIGEST=b083ad4abf524194`，输入=139 条 app 面向策略 sorted `table.policy|cmd|roles|normQual=>normWithCheck`，roles 入 Hash 兼堵 P3-乙6 roles 换绑盲区）——谓词/roles/增删漂移在 exact-face 臂被删后仍红。
5. **变异自证（活库直打·零迁移落树 · 一次性普查容器 `priv1-r3it-census` 直跑 proof harness · 每轮还原）**：

| ID | 变异 | EXIT | 失败 | 红读数（首因） | 对账 |
|---|---|---|---|---|---|
| R3-A | `ALTER ROLE rag_runtime_definer BYPASSRLS` | **1** | 3 | **G-SD definer roster shape** `broken=[rag_runtime_definer]` + **非超具名臂** 8×`rag_runtime_definer holds BYPASSRLS` + reader face（共享 violations） | confirm-乙 P1-乙1 满绿盲区 → 本轮必红 ✓ |
| R3-B | CREATE OR REPLACE `commerce_outbox_relayed_retention_purge`（异常码 `…_invalid_input`→`…_bad_input`，witness 漂移） | **1** | 2 | **registered purge face**：`commerce_outbox_relayed_retention_purge: registered purge-face body drifted, missing witnesses [commerce_outbox_retention_invalid_input]` | P2-乙2 登记面核：登记非静默 pass、体漂移即红 ✓ |
| R3-C（附加） | 删 exact-face 臂 proof 副本 + `ALTER POLICY p_owner ON payment_order USING/WITH CHECK COALESCE(…)` | **1** | 1 | **I2-E exact-face redundancy digest** `digest=0f193e6c01028aa6 want=b083ad4abf524194` | confirm-乙 P2-乙3 同形实验（删臂+加宽）原 131/0 绿 → 本轮恰 digest 单臂红 ✓ |
| 还原 | role NOBYPASSRLS+函数体/策略复原后复跑 | **0** | 0 | **137 PASS / 0 FAIL** | 终态复原亲证 ✓ |

**门读数（rev r3-一体席 终验 · 2026-11-07）**：`pnpm tenant-rls-isolation:prove`（官方 runner）EXIT=0 · **137 PASS / 0 FAIL**（断言 132→137：+5：G-SD non-public roster/rag_runtime 具名/definer roster shape/registered purge faces/I2-E digest）· applied=223 · receipt `2026-11-06T20-19-48-412Z-73846-b7064a03-….json`（outcome=passed · releaseEvidence=false）· sdReaderCensus：163/147/12/107 · nonPublicRoster=8 · definerOwners=5 · registeredNonOwnerFaces=3 · violations=[] · I2-E digest 恰等 · packages/db `tsc --noEmit` EXIT=0 · packages/db eslint **1042=cap 1042 恰等 · 0 errors**（proof 文件 0 warning）· `node scripts/ai-docs/check-docs.mjs` EXIT=0 scanned **2496=cap 2496 恰等** · `node scripts/ai-docs/public-text-policy.proof.mjs` **12/12** EXIT=0 · markers=0（改动集 2 文件标记词零命中）· 其余 §2/§9 行为键本轮未复跑（按令小修面：proof+静态门+docs/PTP/markers）。

**改动在树未 commit 待门开行使**：本轮改动（proof 单文件+本卷节）留在工作树，**零 commit 零 push**（协调方 commit 门冻结中）· 变异全走活库（ALTER ROLE/CREATE OR REPLACE/ALTER POLICY）零迁移文件落树（223 件亲证）· 普查容器 `priv1-r3it-census` 用后已删（`docker ps -a` 零 priv1 残留）· est live=0。

**状态**: `post_prove_dual_pass`

---

**Status**: `post_prove_dual_pass`（起草并实现随刀 · rev r1 按证伪路 §7 修订完成，两份审查已登记 §9-R1 · rev r2 EXEC 期 rebase 并线+四条 P2 吸收+变异 11 形全红+门全绿，台账 §9-R2 · rev r3 post-prove 证伪路三 P1 修订（源=`priv1-post-2.md`）+变异 16 形全红+门全绿，台账 §9-R3 · rev r2-一体席（协调方工单口径）re-dual 两席 FAIL 收敛修订：I2 全等面扩 101 表/G-O2 FORCE 契约扩全量属主/G-SD 非 super 具名臂+变异三形红+还原绿+门全绿，台账 §9-R2-一体席 · rev r3-一体席（协调方工单口径·与卷内既有 §9-R3 EXEC 期不同轮勿混淆）按 rev r2 确认乙席 FAIL 小修：G-SD 普查域放宽非系统 schema 全量（rag_runtime 8 函数具名 cap 钉）+名册驱动 definer 角色形状断言（5 角色 NOBYPASSRLS 活体）+tabRe 表集放宽根因修+两清扫面登记（registeredNonOwnerFaces 1→3）+I2-E digest 冗余臂+变异三形红+还原绿+门全绿（137 PASS），台账 §9-R3-一体席 · post-prove dual BOTH PASS + 协调方 AUTHORIZE 前 Ban push/Ban nail/Ban SSOT · alone ≠ dual · STOP）
