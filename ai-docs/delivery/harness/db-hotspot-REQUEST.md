# DB-HOTSPOT REQUEST — DB 热点/锁族刀（批5 盘点 Top10·三件同域一卷 #116 预算全局热点行+#9 会话级 advisory 锁+#248 privacy_active 逐行求值·两件零迁移+一件认领 0206）

**Status**: **`draft:awaiting_pre_exec_dual`**（起草席写完即停零码动·本刀恰 1 .md·⛔push ⛔merge 主线·待 pre-exec 双审两外席·**Ban self-approve**·**alone≠dual**·**Dual PASS ≠ 开工**）。

> 战役 meetwise · 支线 `line/db-hotspot` · 工作树 `meetwise-dbh2` · 起草基线 @origin/feat/mysql-schema-skeleton=`4124c803`（派单「fetch 后 origin tip≥最新」：fetch 后 origin tip=`4124c803`·含 origin/main `112e6d26` 祖先亲证 `git merge-base --is-ancestor` EXIT=0·本刀 worktree 即建于该 tip）·⛔push ⛔merge 主线（push/翻面权归协调方）。主仓建支线：`git worktree add ../meetwise-dbh2 -b line/db-hotspot 4124c803`。
> 立项出处（不自建 SSOT 行——行翻面权归协调方）：①协调方派单 brief（2026-10-16·批5 盘点席 Top10「DB-HOTSPOT 数据库热点/锁族刀」：#116 成本预算全局热点行+#9 会话级 advisory 锁+#248 interview_privacy_active·同性能族三件）；②三件 issues-master 原文仓外（协调方持有·不阻起草·EXEC 立项如已入卷照 §0 协议补锚）；③TASK-SOP-v2 闸列+LEDGER 位图（只读）。

## 必读清单（执行/双审开工前精读·显式路径）

1. 本卷 + `ai-docs/delivery/harness/TASK-SOP-v2.md`（闸列）+ `ai-docs/delivery/harness/product-campaign-LEDGER.md`（只读·批5 位图）。
2. 规范：`ai-docs/rules/global/production-invariants.md` + `ai-docs/rules/backend/qbank-control-definer-sealed-manifest.md`（SECURITY DEFINER 形制）+ `ai-docs/architecture/backend/rls-isolation.md` + `ai-docs/architecture/backend/high-concurrency-review.md`。
3. 隐私围栏语义权威：`packages/db/migrations/0058_interview_privacy_queue_fence.sql` 头注（admission-vs-delete TOCTOU 序说=件③分层判据）+ `packages/db/migrations/0037_ai_model_invocation_durable_claim.sql` 头注（「模型供应商请求不能由一个长事务 advisory lock 承重」=件② 同族先例）。

## §0 现状锚（起草席亲读+blob 亲算 @`4124c803`·`git rev-parse HEAD:<path>` 亲算·**EXEC 立项照本节对届时 tip 重 pin——结论不变只更行号·定性翻案即停**）

### 0.0 防重三对表

- `git worktree list` 建后 20 树（本席 `meetwise-dbh2` 唯一新增·建前 19 树无 dbh2）；`git branch --list "line/db-hotspot"` 唯一命中=本席分支。
- `ls ai-docs/delivery/harness/ | rg -i "hotspot|dbh"` 零命中（`dbhy1-*` 系 db-hygiene 卫生刀·非本卷）+ `rg -l "db-hotspot|DB-HOTSPOT" ai-docs/` 全域零命中——无同名卷无冒名卷·可落卷。

### 0.1 blob 锚表

| 文件 | blob @`4124c803` | 本刀触面 |
|---|---|---|
| `packages/db/src/model-op/ai-cost-governance.ts` | `79940b2b` | **件① 触**（决策缓存短路面） |
| `packages/ai-runtime/src/invoke.ts` | `44340f39` | 零字节 Ban（reserve 调用点 :931 零改·缓存收在 wrapper 内） |
| `apps/worker/src/rag-cost-governance.ts` | `84ea559a` | 零字节 Ban（:117 调用点零改·同上） |
| `packages/db/migrations/0204_ai_cost_cached_input_price.sql` | `3648e7d0` | 零字节 Ban（tf_ai_cost_reserve_text 现行全量体=权威函数零触） |
| `packages/db/migrations/0033_ai_cost_governance.sql` | `2cce4019` | 零字节 Ban（:70 REVOKE …ai_cost_budget_policy/ai_cost_budget_month… FROM app_role=件① 形状判据） |
| `packages/db/src/interview/interview-graph-lease.ts` | `d30a4048` | **件② 触**（session 锁→事务级锁改造） |
| `apps/worker/src/interview-consumer.ts` | `265798df` | 零字节 Ban（:451-453 fence 调用面零改） |
| `packages/db/migrations/0058_interview_privacy_queue_fence.sql` | `f5dd45d5` | 零字节 Ban（locking 谓词权威零触·件③ 只 additive 新函数） |
| `packages/db/src/checkpoint/checkpoint-privacy.ts` | `6b4ccc3a` | 零字节 Ban（:34 isInterviewPrivacyActive locking 面保留） |
| `apps/api/src/modules/privacy/privacy.service.ts` | `d234114b` | **件③ 触**（:54/:55 切 read 层+聚合形） |
| `apps/api/src/modules/profile/profile.service.ts` | `2dce92db` | **件③ 触**（:53/:62/:85） |
| `apps/api/src/modules/interview/interview.service.ts` | `cf23ed37` | **件③ 触**（:677/:718/:719 切 read 层；begin/abandon/preview 直锁 admission 面 :122/:493/:642 零触） |
| `apps/api/src/modules/interview/interview-learning.ts` | `109a1985` | **件③ 触**（:57） |
| `packages/db/src/memory/memory-store.ts` | `4ec7fc62` | **件③ 触**（:67/:76） |
| `packages/ai-runtime/src/qa-tool-layer.ts` | `e68213d9` | **件③ 触**（:115/:257） |
| `apps/worker/src/weakness-backfill.ts` | `8af323cc` | **件③ 触**（:50） |
| `apps/worker/src/commerce-reconcile.ts` | `5ed1b0ed` | 零字节 Ban（:50 fence-first 单点=locking 面保留） |
| `packages/db/migrations/0206_interview_privacy_active_read_tier.sql` | （新建） | **件③ 产出**（认领 0206） |

### 0.2 三件触点事实（file:line 亲证 @`4124c803`）

- **件①（#116）成本预算全局热点行**：每次模型调用 reserve 走 `ai_cost_reserve_text_scoped`→`tf_ai_cost_reserve_text`（现行全量体=0204：`:92` `SELECT * INTO policy FROM ai_cost_budget_policy WHERE scope_id=p_scope_id FOR UPDATE`+`:133` `SELECT * INTO budget FROM ai_cost_budget_month WHERE scope_id=p_scope_id AND period_key=period FOR UPDATE`+`:134-137` budget_exhausted 拒绝面）——单 scope 全部并发调用在同一 (policy 行, month 行) 上串行排队，锁持至 reserve+dispatch 标记同一事务提交（`invoke.ts:926-953` asPrincipal 单事务内 `:931` reserveAiTextCost；RAG 面 `rag-cost-governance.ts:117` 同族）。排空态（预算耗尽后）每次调用仍全量排队上锁只为领一个 budget_exhausted=热点放大主害。**形状判据**：`0033:70` REVOKE ALL ON ai_cost_price_book/ai_cost_budget_policy/ai_cost_budget_month/ai_cost_reservation FROM app_role——TS 侧对两表零直读权，**纯 TS 预查（直查表）不成立**，预查形唯一零迁移承载=对 reserve 返回决策的进程内短窗缓存。
- **件②（#9）会话级 advisory 锁独占连接**：`interview-graph-lease.ts:18` `pool.connect()` 取专用连接+`:22` `pg_try_advisory_lock(hashtext(GRAPH_NAME),hashtext(owner:interviewId))`（**session 级**）+`:50-52` finally `pg_advisory_unlock`+release——锁跨 `fn` 全程持有（interview-consumer.ts:453 起=整段 graph resume invoke 含分钟级模型 RPC），期间独占一个池连接。两害：①PgBouncer 事务池下 session 级锁失效形（unlock 语句可能落与加锁不同的 server 连接=解锁 no-op+原 server session 锁悬挂；且长持独占连接在事务池语义下本就不成立）；②每在飞图独占一连接=池饥饿。同族先例在案：0037 头注「模型供应商请求不能由一个长事务 advisory lock 承重」（durable claim 形）——本刀件② 即 graph 面（ai_graph_run lease/version 已是持久 fence）把锁收窄到事务级。
- **件③（#248）privacy_active 每调取锁+列表逐行求值**：`0058:31-56` `interview_privacy_active(text)` 每次求值先 `PERFORM pg_advisory_xact_lock(hashtext('meetwise:interview_privacy:'‖target))`（`:40`）再所有权+active-erasure EXISTS；同键被 `privacy_begin_checkpoint_erasure`（`:118` 起·锁在 `:149`）整删除事务持有——读路径逐行求值时与围栏删除同键互斥=列表延迟尖峰+锁队放大。逐行求值面亲证：`privacy.service.ts:54/:55`（导出=principal 全量 interview/assessment 扫描·无界）；`profile.service.ts:53/:62/:85`；`interview.service.ts:677/:718/:719`；`interview-learning.ts:57`；`memory-store.ts:67/:76`；`qa-tool-layer.ts:115/:257`；`weakness-backfill.ts:50`。**语义分层判据（0058 头注+invoke.ts:922-929 注）**：该锁仅对 admission/claim/dispatch vs deletion 的 TOCTOU 承重（`checkpoint-privacy.ts:34` isInterviewPrivacyActive 与 `commerce-reconcile.ts:50` fence-first=必锁面）；只读列表/聚合/导出面求值不参与该串行化=可无锁化。测试镜像面现状：`CREATE OR REPLACE FUNCTION interview_privacy_active` 镜像 17 文件·全域引用 36 文件（`rg -l` 亲算·件③ diff 面上界披露）。
- **事务形锚**：`asPrincipal`（principal.ts:995-1005）=BEGIN+SET LOCAL ROLE app_role+set_config principal+fn+COMMIT/ROLLBACK——件② 事务级锁的宿主事务形。

### 0.3 迁移号裁量（派单授权「预查形零迁移优先·若须迁移认领 0206」）

- 件① 预查形=**零迁移零 DDL**（决策缓存纯 TS·无新函数无新表）。
- 件② 事务级锁改造=**零迁移零 DDL**（pg_advisory_xact_lock 为内建·零新对象）。
- 件③ read 分层=**须迁移·认领 0206**（app_role 对 privacy_erasure_request/privacy_checkpoint_target 零 SELECT 权=0048:61-62 显式 REVOKE 亲证·聚合必须落 SECURITY DEFINER 函数；`0206_interview_privacy_active_read_tier.sql` 单文件 additive：两函数+ACL，零表零列零 DROP）。0205 留白给在飞邻刀（主线链顶 0204 亲证·claim 冲突时 EXEC 顺延取最小未占并如实登记·b110 先例）。

## §1 修法（三件一卷定稿·EXEC 立项不得改本节契约与 §5 pins·改则回炉重审）

### 1.0 三件分判

#116/#9=#248 三件互不同文件零交叠（§0.1 触面列互斥亲证）；#116/#9 零迁移、#248 唯一迁移 0206。三件同卷理由=同性能族（热点行/锁/逐行锁求值）+派单同域令。

### 1.1 件①（#116）预算热点行·决策缓存预查形（零迁移·`ai-cost-governance.ts` 单码文件）

- `packages/db/src/model-op/ai-cost-governance.ts` 进程内决策缓存：键=(scopeId, period)，period 与 SQL 同式派生（UTC `YYYY-MM`）；值=终态拒绝 decision；**只缓存 `budget_exhausted`**（热点语义恰在此：排空态每次调用仍全量上锁排队）。命中→`reserveAiTextCost` 直接返回 `{decision:'budget_exhausted', reservedMicroCny:0}` **零 SQL**（热点行零触碰；调用方 invoke.ts `:939-945` 既有 refuseOrRelease 臂照常走=claim 释放可重领，AG-D 语义零漂）。
- TTL：模块导出常量 `AI_COST_EXHAUSTED_CACHE_TTL_MS = 30_000`（非 env）；写后 30s 内同 (scope,period) 短路。失效三通道：①TTL 到期；②同 scope 任一次 reserve 返回非 exhausted→删除缓存条目（自愈）；③period 翻月键自然分片。
- 语义披露（双审必读）：a) 30s 窗内预算调增延迟生效≤TTL——决策权仍在权威 SQL 函数，缓存只是「同一终态拒绝的短窗重放」；b) 幂等重放变形：对已 reserved 键的窗口内重放本应回 held、短路后回 budget_exhausted→调用方走 AG-D 瞬时拒绝族（释放 claim 后窗过期重领即得 held）——**无双重计费无丢单**（dispatch 从未在非 held/reserved 下发生），如实披露并由新 proof 臂钉死该行为面；c) `policy_missing`/`price_missing` 不缓存（启用翻面/价目落库须即时生效·且 policy_missing 路径不上 month 行锁非热点）。
- 测试缝：导出 `__resetAiCostExhaustedCacheForTest()`；既有 budget_exhausted 语义 proof（ag11/model-invocation-reconcile/model-op00）在用例间复位缓存（机械 append·既有断言零改零删）。

### 1.2 件②（#9）fence 事务级锁改造（零迁移·PgBouncer 事务池兼容·`interview-graph-lease.ts` 单码文件）

- `withInterviewGraphFence`：删 `:18` 专用 `pool.connect()` 与 `:50-52` session unlock/release；改**单个 asPrincipal 事务**内依次 `SELECT pg_advisory_xact_lock(hashtext($1),hashtext($2))`（同键）→既有 lease 行 `FOR UPDATE`/INSERT/CAS 逻辑逐字搬入→COMMIT（锁随事务自动释放）。fn 与 renew/assert/release 面零改（durable lease/version 仍是 invoke 全程唯一 fence——对齐 0037 durable-claim 先例：锁只护 begin 竞态窗，不护长调用）。连接只在 begin 短事务内占用，事务池语义下成立。
- 键与 acquired:false 返回形零变；`assertInterviewGraphFence`/`renewInterviewGraphFence`/`releaseInterviewGraphFence` 零字节。
- **语义 delta 披露（双审必读）**：同 leaseOwner 重复并发 begin（同 worker 双投递）由「try-lock 立即拒绝」变「行锁串行后 CAS 接管 version+1」——败者在下次 assert/renew 处 fail-closed 出局（投影拒绝·零状态污染·至多一次浪费调用）；异 leaseOwner 并发 begin 仍被未过期 lease 挡=acquired:false 不变。首 begin 竞态（无 run 行双 INSERT）由事务级锁串行化保持优雅拒绝（否则撞 `uq_active_run` 唯一冲突=粗糙 500，`0001_baseline.sql:36-37` 亲证）——此即锁不可全删的判据。

### 1.3 否决（六件·EXEC 期不得翻案·翻案=回炉重审）

1. **#116 预算行分片/子行迁移案**（policy/month 行按 owner 或 hash 分片）——改表结构+语义重制+迁移，违「预查形零迁移优先」派单令；热点是排空态拒绝排队，分片治标过重。否决。
2. **#116 外置预算服务案**（Redis/内存预算账本替代 DB 行）——预算一致性权威在 DB 单行 CAS，双写引入漂移面与对账负担。否决。
3. **#9 连接池化 dedicated session lane 案**（直连 DSN 绕 PgBouncer 保 session 锁）——连接栈旁路新面+infra 依赖，落派单明示否决面「连接栈更换」；事务级锁改造以零 infra 达成兼容。否决。
4. **#9 弃锁纯靠 lease TTL 案**（删 begin 锁只留租约）——首 begin 竞态双 INSERT 撞 `uq_active_run`=粗糙 500（0.2 亲证），且 INSERT/CAS 优雅拒绝形丢失。否决。
5. **#248 单函数直接去锁案**（interview_privacy_active 原函数删 advisory lock）——invoke pre-dispatch「shares the deletion transaction's advisory lock」（invoke.ts:922-924 注）与 commerce fence-first 的 admission-vs-delete TOCTOU 语义即靠此锁——去锁=围栏时间窗复活。否决（分层才两全）。
6. **#248 app_role 直读 erasure 表 GRANT SELECT 案**——反转 `0048:61-62` 显式 REVOKE 的隐私最小面；聚合必须 SECURITY DEFINER 封装。否决。

### 1.4 件③（#248）privacy 谓词分层+单查询聚合（迁移 0206·7 码文件+1 迁移）

- **0206 迁移**（`0206_interview_privacy_active_read_tier.sql`·additive 单文件）：①`interview_privacy_active_read(target_interview text)`——SECURITY DEFINER·0058 形制逐字（同 search_path/owner privacy_api_owner/REVOKE PUBLIC+GRANT app_role），布尔体=0058 `:32-55` 去 `:40` 锁行（所有权+active-erasure EXISTS 原样）；②`interview_privacy_fenced_targets()` RETURNS TABLE(thread_id text)——单查询聚合 principal 全量围栏集（active 状态 erasure request join，owner 等值谓词内嵌）；头注写明「只读面专用·admission 面仍须走原 locking 谓词」。
- **TS 调用面分层**（0.2 判据）：切换 7 码文件 11 查询=无界扫描/聚合面（privacy.service :54/:55 与 profile.service :53/:62/:85 改**聚合形**：一次 `interview_privacy_fenced_targets()` 取围栏集→原 SQL 改反连接 `!= ALL($n)`/`NOT IN`，每请求恰一次聚合查询替代逐行函数求值）；有界限读面（interview.service :677/:718/:719、interview-learning :57、memory-store :67/:76、qa-tool-layer :115/:257、weakness-backfill :50）改调 `interview_privacy_active_read(...)`（LIMIT 有界·无锁逐行）。
- **保留 locking 面（零字节 Ban）**：`checkpoint-privacy.ts:34`（invoke pre-dispatch :922-929 消费）·`commerce-reconcile.ts:50`（fence-first）·interview.service begin/abandon/preview 直锁 admission 面（:122/:493/:642）·0058 全部函数与触发器。
- 测试镜像面：17 个内嵌 `CREATE OR REPLACE FUNCTION interview_privacy_active` 镜像 proof 中触达切换查询的随刀 append read twin/fenced set 镜像 stub（机械 DDL append·既有 stub 断言零改零删；实际触达集以门矩阵红集为准·上界=36 引用文件如实披露）。

### 1.5 proof 面（EXEC 新臂组）

- 件① `ag11-settle-relax.proof.ts` 新臂组 ≥4：臂1 排空态第二调用零 SQL（mock 计数器短路判别·改前红=现形每调必锁）；臂2 TTL 过窗复查（注入时钟/复位缝·窗内拒绝窗外放行）；臂3 自愈失效（非 exhausted 返回清键）；臂4 重放变形行为钉死（窗口内已 reserved 键重放得 budget_exhausted→AG-D 拒绝族·窗过期重领得 held·无双重计费断言）。
- 件② `uc-e2e-002-cross-device-lease.proof.ts` 新臂 ≥3（既有臂零改零删）：臂1 并发双 begin 恰一 acquired（既有 FENCE_RACE 可观测面在事务级锁形下复证）；臂2 同 leaseOwner 重复 begin=version 严格递增+前任 assertInterviewGraphFence 翻 false（fail-closed 判别臂）；臂3 锁连接占用收窄形（begin 事务外无持有连接断言·源级形制臂）。
- 件③ 新 `interview-privacy-read-tier.proof.ts`（packages/db/test·隔离库）≥4：臂1 read twin 与 locking 谓词对未围栏面试布尔恒等；臂2 围栏中（erasure active）两者均 false 且 read twin 不取锁（pg_locks advisory 键零命中判别）；臂3 fenced_targets 聚合集=逐行求值集恒等；臂4 ACL 形（app_role 可 EXECUTE·PUBLIC 零）+0058 原函数体字节零漂断言。api 侧既有 privacy/profile/interview list proof 随镜像 append 全绿。

## §2 门矩阵（八门·起草席基线亲跑值在卷·EXEC 期复跑+新臂落值）

1. **门1 判别臂双向**：件①臂1+件②臂2+件③臂2 改前红改后绿（stash/checkout 取证·判别臂协议形）。
2. **门2 邻面 proof**：`pnpm -C packages/db prove:uc002-lease`（既有臂零改全绿）+`pnpm -C apps/worker prove:ag11-settle-relax`（既有臂零改+件①新臂）+`prove:adaptive-flow`/`prove:adaptive-resume`（fence 消费面）+`prove:model-invocation-reconcile`+`prove:model-op00-db-state`+`prove:commerce-reconcile`+api 侧 `prove:unstube-erase`/`prove:uc002-http` 全 EXIT=0。
3. **门3 neg 面**：api `neg:auth`/`neg:commerce`/`neg:resume` 全绿恰等基线（权限/围栏拒绝面零回归）。
4. **门4 typecheck**：`pnpm turbo typecheck --force` 8/8·0 cached·EXIT=0。起草基线亲跑在卷（8/8·0 cached·EXIT=0）。
5. **门5 lint**：`pnpm turbo lint --force` 12/12·EXIT=0·**六值恰等不破**：root 5235/api 1421/db 1042/worker 954/web 601/ai-runtime 628（起草基线亲跑六值全恰等在卷·新增行零 warning 纪律）。
6. **门6 docs:check**：EXIT=0 ≤**2232**（MAX_FILES 2_232·`public-text-policy.mjs:110` 亲证）。起草基线亲跑 **2223**（本卷前）；本 REQUEST 落卷后预期 **2224**≤2232 余 8·EXEC 期以届树复跑值为准。
7. **门7 markers**：改动集全部新增行五类标记词运行时组装直扫 0/0（`['T','O','D','O']`/`['F','I','X','M','E']`/`['X','X','X']`/`['H','A','C','K']` join 词面+冲突标记对 `<` 连五 `>` 连·词面不入卷防自匹配）+全树行首冲突标记 grep EXIT=1 零命中。
8. **门8 diff 面**：EXEC 预估 **≤20 tracked**=2 码件①②（ai-cost-governance.ts+interview-graph-lease.ts）+7 码件③（privacy/profile/interview/interview-learning/memory-store/qa-tool-layer/weakness-backfill）+1 迁移（0206）+proof（ag11+uc002-lease+新 read-tier proof+镜像随红集·上界 17 文件如实披露）+docs（本 REQUEST）·frozen-lockfile 零 lockfile 改。本起草卷 diff 恰 1 docs 零码面。

**停止条件（四类·命中即停上报）**：①**现场漂移**——届时 tip 对 §0.1 任一锚 blob/机制漂移（0204 reserve 体形变/0058 谓词形变/lease 形变/0033:70 REVOKE 面变动）→停·重 pin 回炉；②**机制不满足**——件①臂1 或件②臂1/2 或门2 邻面红且根因在本刀面→停·如实升级（Ban 就地改契约）；③**越界需要**——任何 §1.3 否决面诉求/0206 之外新迁移号/env 闸/interview.service admission 面触碰→停·另刀或协调方裁决；④**验收红不可修**——既有门回归红且 delta 非本刀可归因→停·Ban retry-to-green 掩盖。

## §5 pins（Ban+预算）

- est live=0（起草+EXEC 全程本地静态门+隔离库注入 proof·零模型外呼零生产宿主操作）· 0 Key 值 · `actualSpendCny=null`。
- 迁移纪律：**恰一 0206**（additive 单文件·零表零列零 DROP 零 ALTER）；件①②零迁移零 DDL 零 env 闸（TTL 系模块常量非 env）。0205 留白在飞邻刀·claim 冲突顺延最小未占+登记。
- frozen-lockfile 零 lockfile 改；lint 六 cap（5235/1421/1042/954/601/628）与 docs cap 2232 不放宽不上调。
- **权威函数零字节 Ban**：`tf_ai_cost_reserve_text`（0204 全量体）·`interview_privacy_active`/`assert_interview_privacy_active`/`privacy_begin_checkpoint_erasure`（0058 全函数）·`enforce_*_privacy_active` 触发器——本刀只 additive/调用面分层·权威语义体零触。
- 零字节 Ban（blob @§0.1）：`invoke.ts`·`rag-cost-governance.ts`·`interview-consumer.ts`·`checkpoint-privacy.ts`·`commerce-reconcile.ts`·`0033`·`0204`·`0058`。
- 语义保留承诺：AG-D cost_* 瞬时拒绝族语义零漂（件① 短路同走既有 refuseOrRelease 臂）；幂等重放 held/settled 权威面不破坏（窗口变形 1.1-b 已披露）；lease/version/TTL/renew/assert/release 六面语义零漂（件② 只改锁承载层）；admission-vs-delete TOCTOU 串行化零削弱（件③ 分层不摘 admission 面锁）。
- Ban self-approve · alone≠dual · Dual PASS ≠ 开工（开工须协调方明示授权·committed SHA 重钉）· post BOTH PASS ≠ push · ⛔push ⛔merge 主线 ⛔force push ⛔pull --rebase · 禁就地扩面（§1.3 否决六件 EXEC 期不得翻案）。

## §8 STOP（开工条款 + 待裁决项）

**STOP · `draft:awaiting_pre_exec_dual` · alone≠dual · Dual PASS ≠ 开工 · 本 commit 不预 claim 任何 EXEC 门值（§2 起草基线值=证据在卷非 EXEC 承诺）。** 开工三条款：①pre-exec 双审两外席 **BOTH PASS 落卷**；②**协调方明示 EXEC 授权**；③EXEC 立项**不得改 §1-修法定稿契约与 §5 pins**（改则回炉重审）·立项时照 §0 协议对届时 tip 全量重 pin（行号漂移如实改锚·结论不变只更行号）·迁移号按 §0.3 对届链复核（0206 被占则顺延最小未占+如实登记）。

**待裁决项**：①件① 短路窗 TTL 定值（本卷钉 30_000ms 模块常量·双审可裁它值·env 化诉求即越界停）；②件① 幂等重放窗口变形（1.1-b）接受度；③件② 同 leaseOwner 重复 begin 接管语义（1.2 delta）接受度；④0206 函数命名（`interview_privacy_active_read`/`interview_privacy_fenced_targets`）与镜像 append 面宽度（红集 vs 全量 17）。

---

*DB-HOTSPOT REQUEST · 2026-10-16 · **STOP=`draft:awaiting_pre_exec_dual`（三处同值：Status 行+本卷尾+§8·待 pre-exec 双审两外席·alone≠dual·Ban self-approve·Dual PASS ≠ 开工·⛔push）** · base origin/feat/mysql-schema-skeleton @`4124c803`（fetch 后 origin tip 等号亲证·origin/main 祖先亲证）· 分支 `line/db-hotspot` · 工作树 `meetwise-dbh2`（主仓 `git worktree add` 本起草席立·防重三查 §0.0 过）· 三件同域=#116 预算全局热点行（0204:92/:133 FOR UPDATE·0033:70 REVOKE=TS 零直读判据·修法=exhausted 决策缓存 30s 短路·零迁移）+#9 会话级 advisory 锁独占连接（interview-graph-lease.ts:18/:22·PgBouncer 事务池冲突·修法=事务级锁+lease 行 CAS 单事务·零迁移）+#248 privacy_active 每调取锁+列表逐行求值（0058:40/:149·11 读面 7 码文件亲证·修法=read twin+fenced set 聚合分层·认领 0206）· 否决六件（分片/外置账本/session lane/弃锁/单函数去锁/GRANT 直读）· 门八（邻 proof+neg+typecheck 8/8+lint 12/12 六值恰等+docs:check 2223≤2232+markers+diff 面）· est live=0 · 审计链=本卷*
