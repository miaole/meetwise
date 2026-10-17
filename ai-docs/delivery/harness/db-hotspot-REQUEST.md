# DB-HOTSPOT REQUEST — DB 热点/锁族刀（批5 盘点 Top10·三件同域一卷 #116 预算全局热点行+#9 会话级 advisory 锁+#248 privacy_active 逐行求值·两件零迁移+一件认领 0206）

**Status**: **`executed:awaiting_post_prove_dual`**（EXEC 已落卷·待 post-prove 双审两外席·**Ban self-approve**·**alone≠dual**·⛔push ⛔merge 主线·push/翻面权归协调方）。

> 战役 meetwise · 支线 `line/db-hotspot` · 工作树 `meetwise-dbh2` · 起草基线 @origin/feat/mysql-schema-skeleton=`4124c803`（派单「fetch 后 origin tip≥最新」：fetch 后 origin tip=`4124c803`·含 origin/main `112e6d26` 祖先亲证 `git merge-base --is-ancestor` EXIT=0·本刀 worktree 即建于该 tip）·⛔push ⛔merge 主线（push/翻面权归协调方）。主仓建支线：`git worktree add ../meetwise-dbh2 -b line/db-hotspot 4124c803`。
> 立项出处（不自建 SSOT 行——行翻面权归协调方）：①协调方派单 brief（2026-10-16·批5 盘点席 Top10「DB-HOTSPOT 数据库热点/锁族刀」：#116 成本预算全局热点行+#9 会话级 advisory 锁+#248 interview_privacy_active·同性能族三件）；②三件 issues-master 原文仓外（协调方持有·不阻起草·EXEC 立项如已入卷照 §0 协议补锚）；③TASK-SOP-v2 闸列+LEDGER 位图（只读）。

## 必读清单（执行/双审开工前精读·显式路径）

1. 本卷 + `ai-docs/delivery/harness/TASK-SOP-v2.md`（闸列）+ `ai-docs/delivery/harness/product-campaign-LEDGER.md`（只读·批5 位图）。
2. 规范：`ai-docs/rules/global/production-invariants.md` + `ai-docs/rules/backend/qbank-control-definer-sealed-manifest.md`（SECURITY DEFINER 形制）+ `ai-docs/architecture/backend/rls-isolation.md` + `ai-docs/architecture/backend/high-concurrency-review.md`。
3. 隐私围栏语义权威：`packages/db/migrations/0058_interview_privacy_queue_fence.sql` 头注（admission-vs-delete TOCTOU 序说=件③分层判据·**谓词体现行权威=0076 同名 CREATE OR REPLACE 体〔rev2 R1-⑤·见 §9-rev2〕**）+ `packages/db/migrations/0037_ai_model_invocation_durable_claim.sql` 头注（「模型供应商请求不能由一个长事务 advisory lock 承重」=件② 同族先例）。

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
| `packages/db/migrations/0058_interview_privacy_queue_fence.sql` | `f5dd45d5` | 零字节 Ban（locking 谓词权威零触·件③ 只 additive 新函数·**现行权威=0076**〔rev2 R1-⑤〕） |
| `packages/db/migrations/0076_privacy_erasure_legacy_request_pause.sql` | `78d9da03` | 零字节 Ban〔rev2 R1-② 增锚〕（:88-118 `interview_privacy_active` 现行权威替换体=件③ read twin copy source·active 状态集 7 项含 `authorization_paused`；blob 三 ref 恒等亲证 @`4124c803`/届 tip/origin tip） |
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
- **件③（#248）privacy_active 每调取锁+列表逐行求值**：`0058:31-56` `interview_privacy_active(text)`〔rev2 R1-⑤：**现行权威=0076 :88-118 同名 CREATE OR REPLACE 体**·0058 体系历史版本〕 每次求值先 `PERFORM pg_advisory_xact_lock(hashtext('meetwise:interview_privacy:'‖target))`（0058`:40`/0076`:97`）再所有权+active-erasure EXISTS；同键被 `privacy_begin_checkpoint_erasure`（0058 `:118` 起·锁在 `:149`）整删除事务持有——读路径逐行求值时与围栏删除同键互斥=列表延迟尖峰+锁队放大。逐行求值面亲证：`privacy.service.ts:54/:55`（导出=principal 全量 interview/assessment 扫描·无界）；`profile.service.ts:53/:62/:85`；`interview.service.ts:677/:718/:719`；`interview-learning.ts:57`；`memory-store.ts:67/:76`；`qa-tool-layer.ts:115/:257`；`weakness-backfill.ts:50`。**语义分层判据（0058 头注+invoke.ts:922-929 注）**：该锁仅对 admission/claim/dispatch vs deletion 的 TOCTOU 承重（`checkpoint-privacy.ts:34` isInterviewPrivacyActive 与 `commerce-reconcile.ts:50` fence-first=必锁面）；只读列表/聚合/导出面求值不参与该串行化=可无锁化。测试镜像面现状：`CREATE OR REPLACE FUNCTION interview_privacy_active` 镜像 17 文件·全域引用 36 文件（`rg -l` 亲算·件③ diff 面上界披露·**36 系测试侧含口径**〔rev2 席1 P2+R5：proof/mirror 测试文件计入后的全域上界·非纯 src 面〕）。
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
- TTL：模块导出常量 `AI_COST_EXHAUSTED_CACHE_TTL_MS = 30_000`（非 env）；写后 30s 内同 (scope,period) 短路。失效三通道：①TTL 到期；②同 scope 任一次 reserve 返回非 exhausted→删除缓存条目（自愈·**窄效化如实降格〔rev2 席1 P2-B〕：仅当同 scope 后续 reserve 实际发生且返回非 exhausted 才清键——settle/release 等预算回流路径本身不触发清键·回补后自愈须待下一次 reserve 或 TTL 到期**）；③period 翻月键自然分片。
- 语义披露（双审必读）：a) 30s 窗内预算调增延迟生效≤TTL——决策权仍在权威 SQL 函数，缓存只是「同一终态拒绝的短窗重放」；b) 幂等重放变形：对已 reserved 键的窗口内重放本应回 held、短路后回 budget_exhausted→调用方走 AG-D 瞬时拒绝族（释放 claim 后窗过期重领即得 held）——**无双重计费无丢单**（dispatch 从未在非 held/reserved 下发生），如实披露并由新 proof 臂钉死该行为面。**重放变形族全枚举拓宽〔rev2 席2 R3〕：held/unknown/settled/released/binding_mismatch 全族窗内一律被遮蔽为 budget_exhausted；其中 binding_mismatch 本应终态 fail（非瞬时族）——窗内被延迟 ≤TTL+一次浪费循环（调用方照 AG-D 释放 claim 后重投·窗过期即得真值终态 fail·零终态漂零资损）·proof 臂4 增 binding_mismatch-in-window 覆盖**；c) `policy_missing`/`price_missing` 不缓存（启用翻面/价目落库须即时生效·且 policy_missing 路径不上 month 行锁非热点）；d) 边界小额保守误拒〔rev2 席1 P2-A〕：预算临界回补/调增后 ≤TTL 内本应成功的小额调用仍被保守拒绝——零资损零丢单·只延迟·≤TTL 如实披露；e) 窗内分类遮蔽枚举〔rev2 席1 P2-C〕：窗内一切真值分类被统一遮蔽为 budget_exhausted——①预算回补后本应成功的新调用（真=reserved/held）②幂等重放变形族（真=held/unknown/settled/released/binding_mismatch·见 b/R3）③预算调增即时生效面（≤TTL 延迟）；f) 返回形 drift 注记〔rev2 席1 P2-D〕：短路返回形恒为 `{decision:'budget_exhausted', reservedMicroCny:0}`·窗内重放变形真值若为 held/settled 等形则 decision 与 reservedMicroCny 两字段均与真值 drift——调用方既有 refuseOrRelease 臂以 decision 分派·该 drift 面由 proof 臂4 钉死。
- 测试缝：导出 `__resetAiCostExhaustedCacheForTest()`；既有 budget_exhausted 语义 proof（ag11/model-invocation-reconcile/model-op00）在用例间复位缓存（机械 append·既有断言零改零删）。

### 1.2 件②（#9）fence 事务级锁改造（零迁移·PgBouncer 事务池兼容·`interview-graph-lease.ts` 单码文件）

- `withInterviewGraphFence`：删 `:18` 专用 `pool.connect()` 与 `:50-52` session unlock/release；改**单个 asPrincipal 事务**内依次 `SELECT pg_advisory_xact_lock(hashtext($1),hashtext($2))`（同键）→既有 lease 行 `FOR UPDATE`/INSERT/CAS 逻辑逐字搬入→COMMIT（锁随事务自动释放）。fn 与 renew/assert/release 面零改（durable lease/version 仍是 invoke 全程唯一 fence——对齐 0037 durable-claim 先例：锁只护 begin 竞态窗，不护长调用）。连接只在 begin 短事务内占用，事务池语义下成立。
- 键与 acquired:false 返回形零变；`assertInterviewGraphFence`/`renewInterviewGraphFence`/`releaseInterviewGraphFence` 零字节。
- **语义 delta 披露（双审必读）**：同 leaseOwner 重复并发 begin（同 worker 双投递）由「try-lock 立即拒绝」变「行锁串行后 CAS 接管 version+1」——败者在下次 assert/renew 处 fail-closed 出局（**业务投影零污染〔rev2 席1 P1-a 降格·原「零状态污染」表述过强〕：四护栏=version CAS 严格递增+lease TTL 未过期判+assert 版本一致 fail-closed+renew 三项同判不复活·+heartbeat 停跳；checkpoint 写接管察觉窗存在有限 fork 窗=新引入·原 session 锁形不存在（try-lock 立即拒绝·无窗）·到达需 job lease 过期+同 worker 重投·至多一次浪费调用**）；异 leaseOwner 并发 begin 仍被未过期 lease 挡=acquired:false 不变。**跨 owner 接管窗前移〔rev2 席2 R4〕：原 session 锁形下跨 owner begin 在 invoke 全程被 try-lock 挡死·接管只在 fn 完成释放后可达；事务级锁形下跨 owner 接管自 lease TTL 过期起即可达（invoke 未完亦可）——checkpoint 写层 assert/renew/version 判别兜底·由既有臂承重**。**interview-consumer.ts:452 注释陈旧登记〔rev2 席2 R4〕：该行注释「advisory lock 覆盖 invoke 全程」于件② 后失真——该文件零字节 Ban 本刀不改·登记为 EXEC 后注释债·不阻门**。首 begin 竞态（无 run 行双 INSERT）由事务级锁串行化保持优雅拒绝（否则撞 `uq_active_run` 唯一冲突=粗糙 500，`0001_baseline.sql:36-37` 亲证）——此即锁不可全删的判据。

### 1.3 否决（六件·EXEC 期不得翻案·翻案=回炉重审）

1. **#116 预算行分片/子行迁移案**（policy/month 行按 owner 或 hash 分片）——改表结构+语义重制+迁移，违「预查形零迁移优先」派单令；热点是排空态拒绝排队，分片治标过重。否决。
2. **#116 外置预算服务案**（Redis/内存预算账本替代 DB 行）——预算一致性权威在 DB 单行 CAS，双写引入漂移面与对账负担。否决。
3. **#9 连接池化 dedicated session lane 案**（直连 DSN 绕 PgBouncer 保 session 锁）——连接栈旁路新面+infra 依赖，落派单明示否决面「连接栈更换」；事务级锁改造以零 infra 达成兼容。否决。
4. **#9 弃锁纯靠 lease TTL 案**（删 begin 锁只留租约）——首 begin 竞态双 INSERT 撞 `uq_active_run`=粗糙 500（0.2 亲证），且 INSERT/CAS 优雅拒绝形丢失。否决。
5. **#248 单函数直接去锁案**（interview_privacy_active 原函数删 advisory lock）——invoke pre-dispatch「shares the deletion transaction's advisory lock」（invoke.ts:922-924 注）与 commerce fence-first 的 admission-vs-delete TOCTOU 语义即靠此锁——去锁=围栏时间窗复活。否决（分层才两全）。
6. **#248 app_role 直读 erasure 表 GRANT SELECT 案**——反转 `0048:61-62` 显式 REVOKE 的隐私最小面；聚合必须 SECURITY DEFINER 封装。否决。

### 1.4 件③（#248）privacy 谓词分层+单查询聚合（迁移 0206·7 码文件+1 迁移）

- **0206 迁移**（`0206_interview_privacy_active_read_tier.sql`·additive 单文件）：①`interview_privacy_active_read(target_interview text)`——SECURITY DEFINER·0058 形制逐字（同 search_path/owner privacy_api_owner/REVOKE PUBLIC+GRANT app_role），布尔体=**0076 `:88-118` 现行权威替换体**去 `:97` 锁行（所有权+active-erasure EXISTS 原样·**active 状态集枚举 7 项：`'requested','fenced','purging','pending_external','completed','partial_failed','authorization_paused'`**·〔rev2 R1-① 订正：原写「0058 `:32-55` 去 `:40` 锁行」系错源——0058 体仅 6 项缺 `authorization_paused`·照卷直写将令 paused-legacy 面 read 判 active=**围栏泄漏**·双审席2 权威体错源定谳·rev 席 blob/行号亲证〕）；②`interview_privacy_fenced_targets()` RETURNS TABLE(thread_id text)——单查询聚合 principal 全量围栏集（active 状态 erasure request join·**状态集同步=同上 7 项**〔rev2 R1-④〕，owner 等值谓词内嵌）；头注写明「只读面专用·admission 面仍须走原 locking 谓词」。
- **TS 调用面分层**（0.2 判据）：切换 7 码文件 **14 调用点/13 SQL 串**〔rev2 席1 P2+席2 R5 勘误·原写「11 查询」系漏计·与 §0.2 行位清单 2+3+3+1+2+2+1=14 调用点自洽〕=无界扫描/聚合面（privacy.service :54/:55 与 profile.service :53/:62/:85 改**聚合形**：一次 `interview_privacy_fenced_targets()` 取围栏集→原 SQL 改反连接 `!= ALL($n)`/`NOT IN`，每请求恰一次聚合查询替代逐行函数求值·**同语句 CTE 或同事务单快照钉〔rev2 R6〕——禁止两次独立 autocommit 查询拼接围栏集与业务集**）；有界限读面（interview.service :677/:718/:719〔rev2 R6：:677 系 create() 复用检查·处 `pg_advisory_xact_lock(owner,'iv-create')` 同事务内=**准入事务复用面非纯只读面**·EXEC 立项对该点切换与 admission 语义关系明示·详 §9-rev2〕、interview-learning :57、memory-store :67/:76、qa-tool-layer :115/:257、weakness-backfill :50）改调 `interview_privacy_active_read(...)`（LIMIT 有界·无锁逐行）。
- **保留 locking 面（零字节 Ban）**：`checkpoint-privacy.ts:34`（invoke pre-dispatch :922-929 消费）·`commerce-reconcile.ts:50`（fence-first）·interview.service begin/abandon/preview 直锁 admission 面（:122/:493/:642）·**补录四处〔rev2 席1 P2〕：`apps/worker/src/score-writer.ts:71`（D3 fence 序 isInterviewPrivacyActive）·`packages/db/src/interview/interview-jobs.ts:158`（claim 谓词内嵌）·`packages/db/src/interview/interview-jobs.ts:243`（resume 谓词内嵌）·`apps/api/src/modules/interview/interview.service.ts:69`（assertInterviewPrivacyActive 面）**·0058 全部函数与触发器（interview_privacy_active 体现行权威=0076〔rev2 R1-⑤〕）。
- 测试镜像面：17 个内嵌 `CREATE OR REPLACE FUNCTION interview_privacy_active` 镜像 proof 中触达切换查询的随刀 append read twin/fenced set 镜像 stub（机械 DDL append·既有 stub 断言零改零删；实际触达集以门矩阵红集为准·上界=36 引用文件如实披露）。

### 1.5 proof 面（EXEC 新臂组）

- 件① `ag11-settle-relax.proof.ts` 新臂组 ≥4：臂1 排空态第二调用零 SQL（mock 计数器短路判别·改前红=现形每调必锁）；臂2 TTL 过窗复查（注入时钟/复位缝·窗内拒绝窗外放行）；臂3 自愈失效（非 exhausted 返回清键）；臂4 重放变形行为钉死（窗口内已 reserved 键重放得 budget_exhausted→AG-D 拒绝族·窗过期重领得 held·无双重计费断言·**增 binding_mismatch-in-window 臂〔rev2 席2 R3〕：重放键真值 binding_mismatch 窗内遮蔽为 budget_exhausted·窗过期得真值终态 fail**）。
- 件② `uc-e2e-002-cross-device-lease.proof.ts` 新臂 ≥3（既有臂零改零删）：臂1 并发双 begin 恰一 acquired（既有 FENCE_RACE 可观测面在事务级锁形下复证）；臂2 同 leaseOwner 重复 begin=version 严格递增+前任 assertInterviewGraphFence 翻 false（fail-closed 判别臂·**增败者 checkpoint 判别〔rev2 席1 P1-a〕：臂2 加败者窗内 checkpoint 写不落/被拒断言；若隔离库取证不可判别则 EXEC 立项如实登记不可判别面·Ban 静默漏登**）；臂3 锁连接占用收窄形（begin 事务外无持有连接断言·源级形制臂）。
- 件③ 新 `interview-privacy-read-tier.proof.ts`（packages/db/test·隔离库）≥4：臂1 read twin 与 locking 谓词对未围栏面试布尔恒等；臂2 围栏中（erasure active）两者均 false 且 read twin 不取锁（pg_locks advisory 键零命中判别）；臂3 fenced_targets 聚合集=逐行求值集恒等；臂4 ACL 形（app_role 可 EXECUTE·PUBLIC 零）+0058 原函数体字节零漂断言。api 侧既有 privacy/profile/interview list proof 随镜像 append 全绿。

## §2 门矩阵（八门·起草席基线亲跑值在卷·EXEC 期复跑+新臂落值）

1. **门1 判别臂双向**：件①臂1+件②臂2+件③臂2 改前红改后绿（stash/checkout 取证·判别臂协议形）。
2. **门2 邻面 proof**：`pnpm -C packages/db prove:uc002-lease`（既有臂零改全绿）+`pnpm -C apps/worker prove:ag11-settle-relax`（既有臂零改+件①新臂）+`prove:adaptive-flow`/`prove:adaptive-resume`（fence 消费面）+`prove:model-invocation-reconcile`+`prove:model-op00-db-state`+`prove:commerce-reconcile`+api 侧 `prove:unstube-erase`/`prove:uc002-http` 全 EXIT=0。
3. **门3 neg 面**：api `neg:auth`/`neg:commerce`/`neg:resume` 全绿恰等基线（权限/围栏拒绝面零回归）。
4. **门4 typecheck**：`pnpm turbo typecheck --force` 8/8·0 cached·EXIT=0。起草基线亲跑在卷（8/8·0 cached·EXIT=0）。
5. **门5 lint**：`pnpm turbo lint --force` 12/12·EXIT=0·**六值恰等不破**：root 5235/api 1421/db 1042/worker 954/web 601/ai-runtime 628（起草基线亲跑六值全恰等在卷·新增行零 warning 纪律·〔rev2 P1-b：**六值系起草基线非届值**——EXEC 立项照 cap-sanction 协议对届 tip 重测步进·届 tip lint 增量 +906 行实测在卷·「恰等」读作「对届步进基线恰等」·§5 cap「不放宽不上调」系 sanction 面非届值面——操作矛盾以此消解〕）。
6. **门6 docs:check**：EXIT=0 ≤**2232**（MAX_FILES 2_232·`public-text-policy.mjs:110` 亲证）。起草基线亲跑 **2223**（本卷前）；本 REQUEST 落卷后预期 **2224**≤2232 余 8·EXEC 期以届树复跑值为准（〔rev2 P1-b：同门5——起草值非届值·照 cap-sanction 对届 tip 重测步进〕）。
7. **门7 markers**：改动集全部新增行五类标记词运行时组装直扫 0/0（`['T','O','D','O']`/`['F','I','X','M','E']`/`['X','X','X']`/`['H','A','C','K']` join 词面+冲突标记对 `<` 连五 `>` 连·词面不入卷防自匹配）+全树行首冲突标记 grep EXIT=1 零命中。
8. **门8 diff 面**：EXEC 预估 **码+迁移+proof 主面 ≤13 tracked**〔rev2 席1 门8 订正·原「≤20 tracked」系含镜像聚合口径〕=2 码件①②（ai-cost-governance.ts+interview-graph-lease.ts）+7 码件③（privacy/profile/interview/interview-learning/memory-store/qa-tool-layer/weakness-backfill）+1 迁移（0206）+proof 主面（ag11+uc002-lease+新 read-tier proof）·**镜像随红集另计（上界 17 如实披露）**+docs（本 REQUEST）·frozen-lockfile 零 lockfile 改。本起草卷 diff 恰 1 docs 零码面。

**停止条件（四类·命中即停上报）**：①**现场漂移**——届时 tip 对 §0.1 任一锚 blob/机制漂移（0204 reserve 体形变/0058 谓词形变/lease 形变/0033:70 REVOKE 面变动）→停·重 pin 回炉；②**机制不满足**——件①臂1 或件②臂1/2 或门2 邻面红且根因在本刀面→停·如实升级（Ban 就地改契约）；③**越界需要**——任何 §1.3 否决面诉求/0206 之外新迁移号/env 闸/interview.service admission 面触碰→停·另刀或协调方裁决；④**验收红不可修**——既有门回归红且 delta 非本刀可归因→停·Ban retry-to-green 掩盖。

## §5 pins（Ban+预算）

- est live=0（起草+EXEC 全程本地静态门+隔离库注入 proof·零模型外呼零生产宿主操作）· 0 Key 值 · `actualSpendCny=null`。
- 迁移纪律：**恰一 0206**（additive 单文件·零表零列零 DROP 零 ALTER）；件①②零迁移零 DDL 零 env 闸（TTL 系模块常量非 env）。0205 留白在飞邻刀·claim 冲突顺延最小未占+登记。
- frozen-lockfile 零 lockfile 改；lint 六 cap（5235/1421/1042/954/601/628）与 docs cap 2232 不放宽不上调（〔rev2 P1-b：cap sanction 面不变·届值照 cap-sanction 协议对届 tip 重测步进·起草六值非届值〕）。
- **权威函数零字节 Ban**：`tf_ai_cost_reserve_text`（0204 全量体）·`interview_privacy_active`/`assert_interview_privacy_active`/`privacy_begin_checkpoint_erasure`（0058 全函数·**`interview_privacy_active` 现行权威体=0076 `:88-118` 替换体——0076 全函数含 `assert_checkpoint_enrollment_not_privacy_fenced` 替换体一并入零字节 Ban〔rev2 R1-③/⑤〕**）·`enforce_*_privacy_active` 触发器——本刀只 additive/调用面分层·权威语义体零触。
- **ai-cost-governance.ts:1-4 头注改写义务**〔rev2 席1 P2-E+席2 R2 合并〕：现头注「此文件不缓存决策…避免多 worker 的本地状态把预算打穿」与本刀件① 相抵——EXEC 件① 落地必须同步改写该头注为新契约明示：**「只缓存终态拒绝（budget_exhausted）·绝不缓存授予（reserved/held 族）」**·漏改=门8 diff 面 review 必挂项。
- 零字节 Ban（blob @§0.1）：`invoke.ts`·`rag-cost-governance.ts`·`interview-consumer.ts`·`checkpoint-privacy.ts`·`commerce-reconcile.ts`·`0033`·`0204`·`0058`·**`0076`〔rev2 R1-③〕**。
- 语义保留承诺：AG-D cost_* 瞬时拒绝族语义零漂（件① 短路同走既有 refuseOrRelease 臂）；幂等重放 held/settled 权威面不破坏（窗口变形 1.1-b 已披露）；lease/version/TTL/renew/assert/release 六面语义零漂（件② 只改锁承载层）；admission-vs-delete TOCTOU 串行化零削弱（件③ 分层不摘 admission 面锁）。
- Ban self-approve · alone≠dual · Dual PASS ≠ 开工（开工须协调方明示授权·committed SHA 重钉）· post BOTH PASS ≠ push · ⛔push ⛔merge 主线 ⛔force push ⛔pull --rebase · 禁就地扩面（§1.3 否决六件 EXEC 期不得翻案）。

## §8 STOP（开工条款 + 待裁决项）

**STOP · `executed:awaiting_post_prove_dual` · alone≠dual · post BOTH PASS ≠ push · EXEC 门值见 §9-EXEC（届实测在卷）。** 开工三条款：①pre-exec 双审两外席 **BOTH PASS 落卷**；②**协调方明示 EXEC 授权**；③EXEC 立项**不得改 §1-修法定稿契约与 §5 pins**（改则回炉重审）·立项时照 §0 协议对届时 tip 全量重 pin（行号漂移如实改锚·结论不变只更行号）·迁移号按 §0.3 对届链复核（0206 被占则顺延最小未占+如实登记）。

**待裁决项**：①件① 短路窗 TTL 定值（本卷钉 30_000ms 模块常量·双审可裁它值·env 化诉求即越界停）；②件① 幂等重放窗口变形（1.1-b）接受度；③件② 同 leaseOwner 重复 begin 接管语义（1.2 delta）接受度；④0206 函数命名（`interview_privacy_active_read`/`interview_privacy_fenced_targets`）与镜像 append 面宽度（红集 vs 全量 17）。

## §9-rev（协调方裁决 rev 注记·2026-10-16·0206 认领确认+邻刀消歧登记·零码面零状态翻面）

- **裁决**：协调方裁决令（2026-10-16·两新刀迁移号撞号协调）——**本卷 DB-HOTSPOT 保 `0206_interview_privacy_active_read_tier.sql` 认领不变**（先起草先认领·§0.3 认领在案·协调方确认「§0.0 已预登『被占则顺延』条款但 0206 现未被占」=保号行使非例外）。
- **邻刀消歧登记**：TRACE-RECON（`line/trace-recon`·worktree `meetwise-trc`）原认领 0205 与主线 AG-15 `0205_ai_graph_run_observability_columns.sql` 撞号（AG-15 已 nail——`origin/feat/mysql-schema-skeleton`@`1b01366` 迁移链 **205 文件头 0205**·blob `39011c3` 亲证）——协调方裁决其顺延认领 **`0207_ai_trace_backfill_scoped.sql`**（全 ref 防撞重扫 0207 零占用后认领）。
- **事实更新（不触本卷 §0.3/§5 原文·以本条为准）**：本卷 §0.3/§5「0205 留白给在飞邻刀（主线链顶 0204）」系起草时态——0205 已被主线 AG-15 占用·在飞邻刀题面号自本 rev 起=**0207**；本刀 0206 认领不受影响·两刀号面 0206/0207 互斥零交叠。
- **扫描证（rev 席亲跑 2026-10-16）**：`git for-each-ref refs/heads refs/remotes` 逐 ref `git ls-tree` 扫 `packages/db/migrations/` 0205-0209 号段——仅 0205（AG-15·8 ref 命中）·**0206/0207 全 ref 零文件命中**（本卷 0206 系题面认领未落文件·无他占）。
- **卫生回执**：markers 改动集五类标记词零命中（运行时组装口径沿 `scripts/i6-239-gates.proof.mjs` §2-7·词面不入卷防自匹配·EXIT=0）；docs:check 本树亲跑 EXIT=0（2224≤cap 2232）；本 rev commit 仍恰 1 tracked `.md`=本卷零码面；STOP 三处同值不变 `draft:awaiting_pre_exec_dual`。

## §9-rev2（双审 FAIL 合并裁决 rev 注记·2026-10-16·rev 席落卷·零码面·本节为权威订正体——与本卷正文冲突处以本节及正文内 〔rev2…〕 标为准）

**裁决来历**：pre-exec 双审两外席双 FAIL——席1 FAIL（P1-a 件② 状态污染表述过强+P1-b 门矩阵恰等/不上调操作矛盾+P2 批量五处）·席2 FAIL（R1 件③ 权威体错源最高优先+R2-R7 批量）——协调方合并裁决令（2026-10-16）全案落卷·rev 席逐件 blob/行号/形制亲证后修订·门7/门6 届树实测复跑在卷底。

### R1 件③ 权威体错源（席2 P1·最高优先·五件全落）

- **错源定谳（rev 席亲证）**：`interview_privacy_active` 现行权威=**0076 `:88-118` 同名 CREATE OR REPLACE 体**（`0076_privacy_erasure_legacy_request_pause.sql`·blob `78d9da03` @`4124c803`/届 tip/origin tip 三 ref 恒等亲证）·active 状态集 **7 项含 `authorization_paused`**（`:109`）——非 0058 `:32-55`（6 项·历史版本）。照原卷直写（0058 体去锁行）→ `authorization_paused` legacy 请求在 read 面判 active=false 而 locking 面判 true=**围栏泄漏**（0076:63-65 明示 paused 请求必须保持 privacy fence）。
- **五件落点**：①§1.4 copy source 改 0076 `:88-118` 体去 `:97` 锁行+枚举 7 状态（正文已订正）；②§0.1 增 0076 blob 锚行（已落）；③§5 权威函数零字节 Ban+零字节 Ban 清单增 0076 替换体/全函数（已落）；④`interview_privacy_fenced_targets` 聚合状态集同步 7 项（§1.4 已订正）；⑤全卷 0058 引用处标「现行权威=0076」——必读清单#3·§0.1 表行·§0.2 件③·§1.4 保留 locking 面·§5 Ban·卷尾摘要（均已落标）。

### P1-a 件② 状态污染表述降格（席1 P1）

- 「零状态污染」降格为「**业务投影零污染（四护栏+heartbeat 停跳）**；checkpoint 写接管察觉窗存在**有限 fork 窗**（新引入·原 session 锁形不存在——try-lock 立即拒绝无窗；到达需 job lease 过期+同 worker 重投）」——§1.2 delta 披露已照此改写（rev 席形制亲证：四护栏=interview-graph-lease.ts version CAS `:41-46`/TTL 判 `:40`/assert `:61-68`/renew `:71-79`·heartbeat=renew 停跳即失推进权）。
- §1.5 件② 臂2 增**败者 checkpoint 判别**（窗内 checkpoint 写不落/被拒断言）或**如实登记不可判别**（隔离库取证不足时 EXEC 立项明示·Ban 静默漏登）——已落。

### P1-b 门矩阵届值消歧（席1 P1）

- 门5 lint 六值/门6 docs:check 起草基线值**非届值**——EXEC 立项照 cap-sanction 协议**对届 tip 重测步进**（届 tip lint 增量 **+906 行实测在卷**）；「恰等」读作「对届步进基线恰等」·§5 cap「不放宽不上调」系 sanction 面约束非届值冻结——「恰等基线」与「不上调」操作矛盾以此消解。门5/门6/§5 三处已落标。

### 席1 P2 批量（六件全落）

- **保留 locking 面补录四处**（§1.4 已落·rev 席 file:line 亲证）：`score-writer.ts:71`（D3 fence 序）·`interview-jobs.ts:158`/`:243`（claim/resume 谓词内嵌·`packages/db/src/interview/`）·`interview.service.ts:69`（assert 面）。
- **计数勘误**：「11 查询」改「**14 调用点/13 SQL 串**」（§1.4 已落·与 §0.2 行位清单 2+3+3+1+2+2+1=14 自洽）。
- **「全域引用 36」标注测试侧口径**（§0.2 已落：proof/mirror 测试文件计入的全域上界·非纯 src 面）。
- **门8 diff 面**：「≤20 tracked」改「**码+迁移+proof 主面 ≤13·镜像随红集另计（上界 17 如实披露）**」（§2 门8 已落·2+7+1+3=13 自洽）。
- **P2-A/P2-B/P2-C/P2-D 四披露**（§1.1 已落）：d) 边界小额保守误拒 ≤TTL；e) 窗内分类遮蔽枚举（预算回补真=reserved/held·重放族·调增延迟）；f) 返回形 drift 注记（decision+reservedMicroCny 两字段）；B) 自愈通道② 窄效化（settle/release 不触发清键·须待下一次 reserve 或 TTL）。
- **P2-E 头注改写义务**（§5 已落）：`ai-cost-governance.ts:1-4` 现头注「不缓存决策」与件① 相抵·EXEC 必须同步改写为「只缓存终态拒绝绝不缓存授予」。

### 席2 P2 批量（R2-R7 全落）

- **R2** 头注改写=与席1 P2-E 同源**合并**（§5 单条承载·不重复立法）。
- **R3 披露拓宽**（§1.1-b+§1.5 件① 臂4 已落）：重放变形族 **held/unknown/settled/released/binding_mismatch 全族**窗内标 budget_exhausted（`AiCostDecision` 九值族亲证 ai-cost-governance.ts:7）；binding_mismatch 本应终态 fail→≤TTL 延迟+一次浪费循环（零终态漂零资损）；proof 臂4 增 binding_mismatch-in-window 覆盖。
- **R4 两条**（§1.2 已落）：跨 owner 接管窗前移（session 锁形=fn 完成后可达→事务级锁形=lease TTL 过期即可达·invoke 未完亦可）；`interview-consumer.ts:452` 注释「advisory lock 覆盖 invoke 全程」陈旧登记（零字节 Ban 不改·注释债）。
- **R5 计数勘误**=与席1「11 查询→14 调用点/13 SQL 串」同源合并（§1.4 单点承载）。
- **R6 两钉**（§1.4 已落）：聚合形**同语句 CTE/同事务单快照**钉（禁两次独立 autocommit 拼接围栏集与业务集=窗口 TOCTOU 复活面）；`:677` **准入事务复用面明示**（create() 复用检查处 `pg_advisory_xact_lock(owner,'iv-create')` 同事务内·非纯只读面——EXEC 立项对该点切换与 admission-vs-delete 串行化语义关系明示：论证等价或该点保留 locking 谓词）。
- **R7 锁家族残余热点登记（后刀候选·本刀零触）**：①**0059 RLS 内嵌**——policy USING/WITH CHECK 内嵌 `interview_privacy_active` 逐行锁求值（`0059:48-49/:53-54` 亲证）；②**scoring_definer assert 面**（0100/0103/0158 族 SECURITY DEFINER assert 锁面）；③**0092 transcript fence**（`accepted_unscored→fenced` 状态机+读侧 watermark·`0092:65/:90/:139` 亲证）——三处另立后刀。

### 卫生回执（rev2 席亲跑 2026-10-16）

- markers：改动集五类标记词运行时组装直扫 **0/0**+全树行首冲突标记 grep EXIT=1（沿 `scripts/i6-239-gates.proof.mjs` §2-7 口径·见下命令值）。
- docs:check 届树实测：**EXIT=0·2224≤cap 2232**（本 rev2 落卷后仍 1 文件不增数·亲跑值）。
- diff 面：本 rev2 commit 恰 1 tracked `.md`（本 REQUEST）零码面；STOP 三处同值不变 `draft:awaiting_pre_exec_dual`。

## §9-EXEC（EXEC 席落卷记录·2026-10-17·七字段+P2 落点）

**① 波序并线与重 pin**：`git merge --no-ff origin/feat/mysql-schema-skeleton@ce4bfd1d0` → merge commit `7036595e2`（merge-base 恰 `4124c803`=起草基线等号·merge-tree --write-tree 预演 EXIT=0 零冲突·⛔pull --rebase/force push 未用）。§0.1 全量重 pin：18 blob 锚对届树亲算**全 OK 零漂移**（含 0076=`78d9da03` 三 ref 恒等）；§0.2 行锚全亲证（含 interview-consumer.ts `:451` 注释行、unlock 行锚 `:55`/`:56` 照实）。迁移链届 206 文件·0206 未被占（链顶 0205=AG-15）。

**② 件① 落点（#116）**：`packages/db/src/model-op/ai-cost-governance.ts`——头注按 P2-E/R2 改写为「只缓存终态拒绝（budget_exhausted）·绝不缓存授予（reserved/held 族）」；`AI_COST_EXHAUSTED_CACHE_TTL_MS=30_000` 模块导出常量（非 env）；键=(scopeId,period)·period 与 SQL 同式 UTC `YYYY-MM`；三通道失效（TTL 惰性逐出/同 scope 任一次 reserve 返回非 exhausted 清键[含 reserveAiCost 面]/翻月分片）；`__resetAiCostExhaustedCacheForTest()` 测试缝（barrel `index.ts` 导出 +1）。proof=`ag11` 新臂 ν/ξ/ο/π 四臂（零 SQL 计数短路/TTL 过窗/自愈清键+绝不缓存授予/重放变形 held·binding_mismatch 窗内遮蔽窗外真值+零双重计费）+12 既有臂机械复位（断言零改零删）；`model-invocation-reconcile`/`model-op00` 主链起点复位缝（两 proof rg 亲证零 budget_exhausted 断言面·复位系防滞留）。

**③ 件② 落点（#9）**：`interview-graph-lease.ts`——删 `:18` 专用 `pool.connect()`+`:22` session try-lock+`:55`/`:56` unlock/release（锚照实）；改**单 asPrincipal 事务** `pg_advisory_xact_lock(hashtext,hashtext)`（同键）→lease 行 FOR UPDATE/INSERT/CAS 逐字搬入→COMMIT 自动释锁；fn/renew/assert/release 零字节；键与 acquired:false 返回形零变；文件头注同步改写（事务级锁+lease 双层语义）。proof=`uc002-lease` 新臂 X1/X2/X3（真并发恰一胜/同 leaseOwner 接管 version 严格递增+前任 assert/renew fail-closed[判别臂·session 锁形下红]/X3 锁连接收窄双判别[pg_locks 悬挂零命中+源级形制三件零残留]）·既有 L1–L3 零改全绿。

**④ 件③ 落点（#248）**：`0206_interview_privacy_active_read_tier.sql`（additive·零表零列零 DROP 零 ALTER）——`interview_privacy_active_read(text)`=0076 `:88-118` 权威体去 `:97` 锁行·**7 状态含 authorization_paused**；`interview_privacy_fenced_targets()` 聚合（owner 等值谓词内嵌·同 7 状态）；两函数 OWNER privacy_api_owner+REVOKE PUBLIC+GRANT app_role；0076 `:114` REVOKE CREATE ON SCHEMA public 系 schema 级 DDL 面排除注记（P2-1）。TS 切换 **7 码文件 14 调用点/13 SQL 串**：聚合面 5 点（privacy :54/:55·profile :53/:62/:85→一次 fenced_targets 反连接 `!= ALL($n)`·同 asPrincipal 事务单点钉）；有界读面 9 点切 `interview_privacy_active_read`（interview :677/:718/:719·interview-learning :57·memory-store :67/:76·qa-tool-layer :115/:257·weakness-backfill :50）。**R6 `:677` 切换等价论证**：create() 复用查询只做复用决策、不向候选面试写任何负载；新建 id 不可能是删除目标；真 admission 边界（begin/abandon/preview 直锁+assert 面）保留 locking 谓词——若围栏在复用检查与 admission 之间提交，admission 处 fail-closed 拒绝=围栏时间窗不复活。保留 locking 面零字节（checkpoint-privacy :34/:25·commerce-reconcile :50·interview :69/:122/:493/:642·interview-jobs :158/:243·score-writer :71·0058/0076 全函数与触发器）。proof=新 `interview-privacy-read-tier.proof.ts` 四臂 R1–R4（twin↔locking 恒等含跨主体/空 principal·围栏中双 false+locking 取锁/read twin 零锁 pg_locks 判别·聚合集=逐行求值集恒等+跨主体隔离·ACL 形+权威体 prosrc 字节零漂+authorization_paused 双谓词均围栏）+注册三处（packages/db package.json+根别名+isolated runner 来源表/命令链/allowlist/migrate 集）。

**⑤ 门矩阵届值（八门）**：门1 判别臂=件①ν（无缓存形计数≥1 红·缓存形 0 绿）+件②X2（session 形 acquired:false 红·事务形接管绿）+件③R2 read-twin 零锁（0206 缺位红·落位绿）全双向成立；门2 邻面=uc002-lease EXIT=0（20 断言）·ag11 EXIT=0（16 臂）·adaptive-flow/adaptive-resume/model-invocation-reconcile/model-op00-db-state/commerce-reconcile 全 EXIT=0·uc002-http EXIT=0；门3 neg=auth/commerce/resume 全 EXIT=0（_neg-harness 镜像 stub 补后）；门4 typecheck 8/8·0 cached EXIT=0；门5 lint 12/12 EXIT=0 **六值恰等届步进基线**：root 5235/api 1421/db 1042/worker 954/web 601/ai-runtime 628（新增行零 warning 纪律达成·api 1424→1421 与 db 1045→1042 两轮归零亲证）；门6 docs:check EXIT=0 **2237≤2240**（届 cap 已随 b7dde4049 步进 2232→2240·P2-4 显式落值）；门7 markers=改动集 19 文件 8819 行五类标记词运行时组装直扫 **0 命中**+全树行首冲突标记 grep **EXIT=1 零命中**（注：`scripts/i6-239-gates.proof.mjs` 系 i6-239 刀专属门·其申报面硬编码非本卷门·未用）；门8 diff 面=**20 tracked**（主面 13=2+7+1+3·恰符；另登记 5：`index.ts` barrel 缝导出+根 `package.json` 别名+`packages/db/package.json` prove 注册+`scripts/run-e2e-isolated.mjs` target 注册+`_neg-harness.ts` 镜像 stub——镜像红集实际触达=1 文件·上界 17 披露不变）·frozen-lockfile 零 lockfile 改。

**⑥ 门2 基线红升级（非本刀 delta·亲证）**：`prove:unstube-erase` EXIT=1·failure_class=privacy_contract_failed——**stash 本刀全量改动后在净容器重跑同崩**（崩点=`interview_event_immutable` RAISE @`purgeInterviewProjectionTarget`（`packages/db/src/transcript/int-transcript-projection.ts:77`·0195 append-only 触发器 vs 0096 投影 purge 链）·merge diff `4124c803..7036595e2` 零触该链文件·本刀 20 文件 delta 与该链零交叠）→上游基线红·如实升级协调方·Ban retry-to-green 掩盖。

**⑦ P2 吸收落点**：P2-1=0206 头注 schema 级 DDL 排除注记（已落）；P2-2=unlock 行锚 `:55`/`:56` 照实（已落）；P2-3=同键自愈唯一通道=TTL——proof 臂ξ/ο 以复位缝承载过窗·臂ο 复证「非 exhausted 到达 SQL 才清键」窄效化（已落）；P2-4=docs 届 cap 2240 显式（⑤已落）；P2-6=「全域引用」口径更正——`rg -l interview_privacy_active` 全域=100 文件（含 ai-docs/receipts 文档面）·纯 src 触面=7 切换文件+10 保留面文件+测试镜像 17（本注记为口径基准）；席2 R4=interview-consumer.ts `:451` 行锚为准·该注释「advisory lock 覆盖 invoke 全程」于件② 后失真·零字节 Ban 未改=注释债（本条登记）；P1-a 不可判别面=同 leaseOwner 接管窗内 checkpoint 写的 DB 层取证不可判别（lease 接管不 bump checkpoint fence_epoch·写拒绝由消费层 assert/renew fail-closed 承重）——X2 臂以 assert/renew 翻 false 判别+本条如实登记；RESERVE 排序面（interview-consumer.ts :359-373）与本刀触面（ai-cost-governance.ts）零交叠亲证·merge 届 tip 下不冲突。

**⑧ STOP 翻面**：三处同值 → **`executed:awaiting_post_prove_dual`**（本节+Status 行+§8）·待 post-prove 双审两外席·alone≠dual·Ban self-approve·post BOTH PASS ≠ push·⛔push。

## §9-EXEC-rev1（post 席1 P1×2 修复落卷 rev 注记·2026-10-17·proof 双修+披露订正+簿记·零契约变更零 §1/§5 触面·与本卷正文冲突处以本节为准）

- **P1-B proof 闪断修复（两文件）**：`pg_advisory_xact_lock(hashtext(k))` 单 int4 形先隐式宽化 int64 再拆键——负哈希落 `classid=4294967295+objid=无符号低 32 位`（dev 库实证 key −88810555→{4294967295, 4206156741}）；旧过滤 `classid=0 AND objid::bigint=hashtext::bit(32)::bigint` 对负哈希计 0（真锁行 classid=4294967295≠0）=约 50% fixture 抽中负哈希即红。修法（双侧落无符号域）：`interview-privacy-read-tier.proof.ts` advisoryLockCount 过滤改 `objid::bigint=(hashtext($1)::bigint & 4294967295) AND classid::bigint=(CASE WHEN hashtext($1)<0 THEN 4294967295 ELSE 0 END)`；`uc-e2e-002-cross-device-lease.proof.ts` X3 过滤同式归一（双 int4 形逐键按 uint32 落 classid/objid·无 int64 拆分→双侧纯 `& 4294967295` 无 CASE）。**验证证**：read-tier proof 连续 5 次全绿（R2 持锁臂 held≥1 与零锁臂 held=0 双向成立·随机后缀 fixture 多次抽签）；隔离探针构造验证（PG16 同镜像一次性容器）：同键锁实持时新过滤计 1/旧过滤计 0（负哈希两 key 双证）·探针已销毁。X3 判别力核：构造验证中双 int4 同键锁实持时过滤计 1（`dangling===0` 断言有悬挂即红·非空真）+uc002-lease proof 全绿（20 断言含 X3）——探针并实测旧 bit(32) 形在 PG16 系零扩展（`int4::bit(32)::bigint`=无符号重释·与掩码式恒等），X3 旧过滤实可匹配真锁行·席1「恒 0 空真」子判在 PG16 实证下不成立·本归一化维持落码（显式无符号域形制·两形恒等零行为差）·如实登记。
- **P1-A 去锁披露订正（两文件+本节）**：0059 RLS 十表 policy USING/WITH CHECK 仍内嵌 `interview_privacy_active`（rev2 R7 残余① 在案）——14 切换点**5/9 拆分口径**：仅 5 个 interview 表点真去锁（interview 表 RLS 不内嵌该谓词：privacy :58·profile :57·interview.service :677/:718/:719）；其余 9 点（assessment_report×5〔privacy :59·profile :91·interview-learning :57·memory-store :67/:76〕+learning_plan×2〔qa-tool-layer :115·weakness-backfill :50〕+interview_question×1〔profile :66〕+interview_job×1〔qa-tool-layer :257〕）=显式逐行锁求值减半非消除（每行仍经 RLS 内嵌谓词求值）·与 R7 残余登记对齐。`privacy.service.ts`/`profile.service.ts` 三处读分层注释按「RLS 内嵌锁谓词仍在·本切换=每行求值减半；真去锁限 interview 表面」改写；`profile.service.ts:81` 陈旧注释（仍述 `interview_privacy_active(interview_id)` 逐行谓词形）同步订正。
- **P2 簿记三件**：⑤ 门8 diff 面 **20→21 tracked**（EXEC commit `b3e5a4890` `git show --stat` 亲证 21 files·主面 13+另登记 5 之外补列两复位缝 proof=`model-invocation-reconcile.proof.ts`/`model-op00-db-state.proof.ts`+本卷 REQUEST·此前 20 计漏列）；⑥ 崩点锚订正 `int-transcript-projection.ts` **:77→:94**（`purgeInterviewProjectionTarget` 声明行·结论不变只更行号）+补 0195 迁移侧锚 **`0195_interview_event_settlement_append_only.sql:23`**（`RAISE EXCEPTION 'interview_event_immutable'` 行）；`reserveAiCost` 写缓存面登记备查（`ai-cost-governance.ts:86`·同 scope 非 exhausted 清键写入通道=件① 自愈通道② 承重面·后刀/审计线索）。


---
 · 2026-10-16 · **STOP=`executed:awaiting_post_prove_dual`（三处同值：Status 行+本卷尾+§8·EXEC 已落卷见 §9-EXEC·待 post-prove 双审两外席·alone≠dual·Ban self-approve·post BOTH PASS ≠ push·⛔push）** · base origin/feat/mysql-schema-skeleton @`4124c803`（fetch 后 origin tip 等号亲证·origin/main 祖先亲证）· 分支 `line/db-hotspot` · 工作树 `meetwise-dbh2`（主仓 `git worktree add` 本起草席立·防重三查 §0.0 过）· 三件同域=#116 预算全局热点行（0204:92/:133 FOR UPDATE·0033:70 REVOKE=TS 零直读判据·修法=exhausted 决策缓存 30s 短路·零迁移）+#9 会话级 advisory 锁独占连接（interview-graph-lease.ts:18/:22·PgBouncer 事务池冲突·修法=事务级锁+lease 行 CAS 单事务·零迁移）+#248 privacy_active 每调取锁+列表逐行求值（0058:40/:149·**谓词体现行权威=0076**〔rev2 R1-⑤〕·14 调用点/13 SQL 串 7 码文件亲证〔rev2 R5 勘误〕·修法=read twin+fenced set 聚合分层·认领 0206）· 否决六件（分片/外置账本/session lane/弃锁/单函数去锁/GRANT 直读）· 门八（邻 proof+neg+typecheck 8/8+lint 12/12 六值〔rev2 P1-b：届值照 cap-sanction 步进〕+docs:check 2223≤2232+markers+diff 面〔rev2：主面 ≤13+镜像另计〕）· est live=0 · 审计链=本卷+§9-rev+§9-rev2*
