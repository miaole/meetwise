# PRIV1 · GAP-PRIV-01 owner 隔离实证 REQUEST（候选 A prove · backlog `:57` · PG-retained）

**Status**: `draft:awaiting_pre_exec_dual`
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null
**Date**: 2026-11-06
**Rev**: r1（pre-exec dual 审后修订 · 源=`priv1-pre-1.md` PASS + `priv1-pre-2.md` FAIL·按其 §7 · 见 §0-R1/§9-R1）
**Base / parent tip**: `origin/main` `e282c5ebd`（cap 2489 · 开工时点 origin/main 实测值 · fetch 两次失败：attempt1 默认 HTTP/2 `Failed to connect to github.com port 443` · attempt2 `-c http.version=HTTP/1.1` 同败 · origin/main 本地 ref 开工前已恰在 `e282c5ebd` · 零位移如实登记）
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

裁定：三表均「运行时角色零直接权限、只经受控函数（且入口 owner 绑定）访问、无任何 API 读面暴露用户可区分数据」——按证伪路 §7-3 第二分支进**具名白名单**：proof 内以常量列名+逐表理由，G 断言 live 复核零权限面 + SD 入口 owner-gated witness + 迁移 REVOKE 源文 witness，白名单全文写入收据，不静默放行。补 RLS 对运行时行为面零变化且属动授权根（§1 零触碰），本刀不动。

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

**cap 算式**：届扫 2489 + 本刀新受管件恰 2 = **2491** 恰等零多放。**在飞同号竞争如实列**（2026-11-06 本地 ref 实测 · fetch 网络败未刷新）：s3caps-draft ahead=6 / ksw-draft ahead=3 / fastm-draft ahead=3 / xs-draft ahead=14（均 merge-base 92a82a944 两 policy 热面）+ uc31-rev ahead=4（同基两 policy 热面）+ rtx-draft ahead=3（merge-base e282c5ebd=届 tip 两 policy 热面）——并线期沿常设预授权「cap 以合并树实测恰等步进免再询」届时取大重算承登，冲突区 dual-keep 双留史录。

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

  r0 的 MUT-PRIV1-1（`0001_baseline.sql` user_memory 手术替换 `USING (true)`）由 E2 同形追加迁移承载；r0 两读数（M3 `upd=1 del=1` + I2 `qual=false chk=false` 红）如实承登不洗。
- **新 proof 绿**：`pnpm tenant-rls-isolation:prove` 隔离容器真迁移链 EXIT=0。attempts 全录：本卷 §9（r0 台账 + §9-R1 rev r1 台账）。
- **相关既有 proof**：`pnpm db:prove` · `pnpm uc033:cross-user-authz:prove` · `pnpm neg:resume` · `pnpm tenant-wiring-neg:prove`（同锚热面回归）。
- **静态面**：受影响包 typecheck/lint 不高于基线 · `pnpm arch` · `node scripts/e2e-static-guards.mjs` · `node scripts/provider-egress-inventory.mjs` · `node scripts/ai-docs/check-docs.mjs`（届扫 2491=cap 恰等）· `node scripts/ai-docs/public-text-policy.proof.mjs`（12/12）· markers 0。rev r1 零迁移零新增受管件，cap 不动；不跑浏览器 UI runner；不跑 `migrate:prove`/`drift:prove`（无迁移）。

**EXIT 契约**：新 proof EXIT=0 ≠ GAP-PRIV-01 CLOSED ≠ backlog `:57` 翻面 ≠ 应用层 tenant=RLS 等价 ≠ 授权根已迁 ≠ HA ≠ releaseEvidence ≠ UC-052 flip ≠ DELETE 开放 ≠ R-A 缺口消失。PREREQ 缺（无 docker/PG）→ 诚实非零 EXIT 记 attempt，Ban 弱断言凑绿，Ban retry-to-green。

**翻面建议（留 nail · 本刀不执行）**：`:57` 行目标句「MySQL 时代」措辞已被 PG-retained superseded；建议 nail 阶段将行内目标改写为「候选 A prove 绿 + 跨 owner fail-closed 维持」PG-retained 口径后，以独立 SSOT 翻行刀处置（立卷刀 `:779` 钉「prove 绿不自动关行」）。本卷只建议，不动 backlog。

## §8 停止条件

`draft:awaiting_pre_exec_dual`。pre-exec dual（mw-privacy-int + mw-e2e-ha）BOTH PASS + 协调方 AUTHORIZE 前：Ban push · Ban nail · Ban self-write `post_prove_dual_pass` · Ban SSOT 翻行（backlog `:57`/checklist/matrix/queue）· Ban 翻 coveredCount · Ban 借 `:60`/`:64`/`:68` 证据 · Ban 开公开 DELETE · Ban UC-050/051/052 covered flip · Ban retry-to-green · Ban 接线 `packages/db/src/tenant/` · Ban 加 tenant/org 列 · Ban 动授权根（RLS/asPrincipal/set_config/app_role）· Ban secrets/`.env*` · Ban 冒充 dual/代签。prove 复现或门红无法收窄 → 停，如实记 attempt 报告。若双审判 M6 witness 化（apps/api 依赖不可 import）强度不足，回炉补动态守卫面（如经 apps/api 侧姊妹 proof），Ban 静默降级。

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

**状态**: `draft:awaiting_pre_exec_dual`

---

**Status**: `draft:awaiting_pre_exec_dual`（起草并实现随刀 · rev r1 按证伪路 §7 修订完成，两份审查已登记 §9-R1 · prove/mutation 读数已实测在卷 · pre-exec dual BOTH PASS + 协调方 AUTHORIZE 前 Ban push/Ban nail/Ban SSOT · alone ≠ dual · STOP）
