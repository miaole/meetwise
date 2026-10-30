# HA-1 REQUEST — 队列 status/lease 前导索引 + 队列 gauge 聚合改形（R-50 · HA 簇配套 · EXEC REQUEST 起草 · docs-only 零码动 · **rev r1**）

**Status**: **`draft:awaiting_pre_exec_dual`**（rev r1 修订落卷即停 · 本卷恰 1 tracked `.md`（仅本文件）· 零产品码零迁移零依赖 · pre-exec 双审 BOTH PASS + 协调方明示 EXEC 授权前不得落码 · alone≠dual · Ban self-approve · est live=0 · markers=0 · ⛔push ⛔动主仓）

**席位**：meetwise HA 簇配套起草席（docs-only 起草 · 协调方授权 · 新建 worktree `meetwise-ha1` · 分支 `line/ha1-draft`）；**rev r1 = 修订席**（双审两席均 FAIL · 两席独立命中同一 P0 · 本 rev 只改本卷，不落码不开 EXEC）。
**基线**：`origin/main` @ **`99e4e3f385d7f992a88aad4b3e5f31d1e77ba3d3`**（short `99e4e3f38` · 2026-10-30 · 本卷 file:line 与 blob 均对 `HEAD=99e4e3f38` 亲读/`git rev-parse` 亲算）· 本支 HEAD `c36f53907`（rev r0 落卷 commit）+ 本 rev r1 修订 commit。本树 rev r1 落卷前 `node scripts/ai-docs/check-docs.mjs` 亲跑 **EXIT=0 · scanned 2460**（cap `MAX_FILES=2_461` · `scripts/ai-docs/public-text-policy.mjs:282`）——**本 rev 只改既有 tracked 一件 ⇒ 落卷后仍 2460（净增 0 · 余 1）**。
**审计项（不自建 SSOT 行，翻面权归协调方）**：①`ai-docs/delivery/harness/product-campaign-LEDGER.md:136`「R-20/R-21/R-23/R-24/R-36/R-37/R-44/R-50/R-51 | 连接预算/PgBouncer/多实例状态/队列指标/登录锁定/scrypt/索引/生命周期 | HA 配套 | 中」；②`ai-docs/delivery/harness/ha-6-companion-REQUEST.md:106`「余六件——后刀」；③审计底稿 `~/Documents/Meetwise学习与审查/03-原始清单与评审/refactor-backlog.md:494-500` **R-50 原文**（本文不自建条目号，逐字引用底稿）。
**必读清单（EXEC 立项前逐件亲读·显式路径）**：`AGENTS.md` → `ai-docs/delivery/north-star-ha.md`（`:24` 状态钉 · `:46` 硬约束 · `:55` G7 · `:67` 本地一律 NOT_HA）→ `ai-docs/delivery/harness/product-campaign-LEDGER.md:136` → `ai-docs/delivery/harness/ha-6-companion-REQUEST.md:5`/`:106` → **机制源（rev r1 订正为 live 定义）** `packages/db/migrations/0144_db_trigfam_unify.sql`（`:883`-`:933` `tf_gateway_dispatch_owners` **六 work 臂** · `:935`-`:944` `gateway_dispatch_owners` 薄壳 · `:946`-`:949` §8 演进规则冻结）· 原贴（现已非 live·仅作索引与史录面）`packages/db/migrations/0132_job_route_classify_worker_dispatch.sql`（`:11`-`:13` `ix_job_semantic_revision_route_pending` 部分索引 · `:15`-`:60` 六臂原贴）· `packages/db/migrations/0042_runtime_observability_gateway.sql`（`:5`-`:26` gauge 四表 FILTER 聚合 · `:45`-`:48` ACL）· `packages/db/src/jobs/gateway-dispatch.ts`（`:22`-`:26` owner 枚举 seam · `:58`-`:67` gauge seam）· `apps/worker/src/main.ts`（`:217`-`:241` gauge 数据源与刷新 · `:510` 对账间隔 5s · `:660`-`:667` 四消费循环 · `:768` privacy checkpoint 擦除循环 5s · `:773`-`:776` gauge 循环 15s）→ 索引面 `packages/db/migrations/0001_baseline.sql`（`:109`-`:122` entitlement_consumption · `:135` `ix_outbox_pending` · `:224`-`:239` ai_report · `:253`-`:268` interview_job）· `0007_resume_quiz.sql:17`-`:31` · `0008_resume_diagnosis.sql:18`-`:32` · **`0010_consumption_stale_lease_idx.sql:7`-`:9`（`ix_consumption_stale_lease` · rev r1 实测已覆盖 commerce 臂）** · `0049_resume_reference_foundation.sql:34`-`:36` · `0055_resume_reference_legacy_backfill_index.sql:11`-`:13` · `0064_interview_resume_epoch_reference.sql:37`-`:38` · `0190_outbox_consumption_unique_concurrent.sql:12`-`:13` → 迁移运行器 `packages/db/src/migrate.ts`（`:11`-`:24` 三执行模式 · `:204`-`:228` concurrent-index 单语句/谓词正则 · `:336`-`:340` 定义/有效性断言 · `:241`-`:243` 并发建索引超时 300s · `:430`-`:455` checksum/前缀门 · `:470`-`:479` 重放路径逐次断言 · `:487`-`:495` fresh 执行路径自愈 · `:609` 注记检测）→ 并发/部分索引先例 `0198_trace_created_at_index.sql:1`-`:9` · `0211_outbox_unsettled_partial.sql:1`-`:9` · `0219_interview_event_retention_purge.sql:45`-`:47` · `0213_interview_job_autovacuum_reloptions.sql:1`-`:10` → 回归面 `packages/db/test/interview-event-retention.proof.ts:76`-`:83`（链头 0219/文件数 217 钉）· `packages/db/test/runtime-role.proof.ts:108`-`:113`（gauge 四行/列名断言）· `packages/db/test/migrate.proof.ts`（concurrent-index/特权面）· `packages/ai-runtime/src/metrics.ts:67`-`:77`/`:153`-`:156` → 告警面 `ai-docs/observability/alerting-runbook.md:124`（下钻锚指 `0042:5-26`·rev r1 登记将过期）/`:141`/`:169`/`:188` → 注册面 `scripts/run-e2e-isolated.mjs`（`level-policy-migrate:prove` 同形：`:894` 目标表 · `:3357` 命令映射 · `:2839` 允许清单 · `:89` `LIVE_E2E_TARGETS`）· `packages/db/package.json:25`/`:30` → 计数预算面 `scripts/ai-docs/public-text-policy.mjs`（`:36` `MANAGED_ROOTS` 含 `packages` · `:39` `TEXT_EXTENSIONS` 含 `.sql`/`.ts`、不含 `.log` · `:282` `MAX_FILES` · `:482` `git ls-files --cached --others` 未跟踪新增亦计面）· `scripts/ai-docs/public-text-policy.proof.mjs:452`/`:459`/`:474`/`:477`（cap 四联动点）· `.github/workflows/ci.yml:49`（`pnpm docs:check`）。
**Honesty**：六条候选的判定全部对 `99e4e3f38` 实树亲读（§认领核对），未凭记忆；本刀只在六条中取 **R-50**，其余五条只作判定与剔除记录（§2 非范围）。零实跑零 prove（本刀=REQUEST 卷；prove 判据见 §4 待 EXEC 兑现）；`est live=0`（动态面全在隔离 PG 容器，零生产操作、零真实流量、零模型外呼）。**rev r1 的量化读数来自双审两席在隔离 PG16 的实测（本节逐处标「席测」），修订席未重跑；EXEC 必须在自己的隔离容器复测并入收据。**

---

## rev r1 修订小节（双审两席 FAIL → 逐条落法）

> 触发：pre-exec 双审两席均 **FAIL**，且**两席独立命中同一 P0**（cap 必撞 + `entitlement_consumption` 索引已存在）。两席另外各自给出 P1/P2，本 rev 全数处置，**无一条以「不予采纳」草率结案**：精确修 20 条、降为残面并写明理由与归属 6 条。

### P0（2 条 · 全采纳）

| # | 命中 | 落法 |
|---|---|---|
| **P0-1** | **EXEC 必撞 PTP cap，自设门不可达**（两席独立同判）。事实：`packages/db/migrations/*.sql` 与 `packages/db/test/*.ts` 都在 `MANAGED_ROOTS`（`public-text-policy.mjs:36`）且扩展名 ∈ `TEXT_EXTENSIONS`（`:39`），扫描面用 `git ls-files --cached --others`（`:482`）⇒ **未跟踪的新增文件同样计数**。rev r0 交付面 = 6 条迁移 `.sql` + 1 个 proof `.ts` = **2467 > 2461**（收据若落 `.json` 再 +1 = 2468）⇒ §4 门 7「docs:check EXIT=0」**不可达** ⇒ §8「验收红不可修」自动触发；且 `.github/workflows/ci.yml:49` 就是 `pnpm docs:check` ⇒ 并线即 CI 红。 | **精确修**：①§3 增 **C12**（`public-text-policy.mjs`：`MAX_FILES` 2461→**2466** + `CAP-SANCTION-2466` 注记）与 **C13**（`public-text-policy.proof.mjs`：**四处联动** `:452` 循环 `2_466` / `:459` `scannedFiles === 2_466` / `:474` `'ai-docs/f-2466.md'` / `:477` `PTP_FILE_LIMIT:2467`）；②§1 明写 **EXEC 终态算式**（2460 + 5 sql + 1 ts = 2466 恰等零多放）；③§4 门 7 改「**cap 已 sanction 后** EXIT=0」；④§8「验收红不可修」改判为「> sanctioned cap」；⑤先例形逐项对清：`public-text-policy.mjs:280` `CAP-SANCTION-2461` 的 union 算式 + 四联动点写法即本 rev 模板。 |
| **P0-2** | **`entitlement_consumption` 已有 status 谓词索引，W1-5 是多余；§0.3 的「无」是假证**（席1 亲跑实测）。`0010_consumption_stale_lease_idx.sql:7`-`:9` 已建 `CREATE INDEX IF NOT EXISTS ix_consumption_stale_lease ON entitlement_consumption (lease_expires_at) WHERE status = 'reserved';`；真链第 10 位、全仓无 `DROP INDEX` 命中（`grep -rn "DROP INDEX" packages/db/migrations/` 无 `ix_consumption_stale_lease`）、`packages/db/sql/02_commerce.sql:50`-`:53` 逐字同形镜像。席测（50k confirmed + 5 reserved/expired）：`WHERE status='reserved' AND lease_expires_at < now()` **在加新索引之前就走** `Index Scan using ix_consumption_stale_lease`，2 buffers / 0.014ms；加 W1-5 后 planner **仍选旧部分索引**，新索引 **0 次使用** ⇒ 纯写放大。连带三处：§8 停手条件写成「已有 `(status,lease)` 索引」而实际形态是 `(lease_expires_at) WHERE status='reserved'` ⇒ **保险丝永不触发**；A6 负断言 `ON <table> (status` 结构上看不见 `(col) WHERE status=...` ⇒ 天然漏检。 | **精确修**：①**删除 W1-5 / C5**（迁移 6→5，链头与 C10 的 `217→222` 相应调整）；②§0.3 表补该索引行（标「已覆盖·不新建·A8 断言仍在」），§1.5 补「五表缺口实为四表」书面结论；③**A6 负断言扩到隐式 status 谓词**：`ON <table> (<col>) WHERE status\s*=\s*'<lit>'` 形态；④§8 停手条件改为「四目标表出现 status 前导或隐式 status 谓词索引」，并明写 `entitlement_consumption` 的既有索引是**预期命中**，不得据此误停。 |
| **P0-3（附带·由 P0-2 解）** | B19-B23 按 rev r0 现文对该表**必红**：判据「五表各 1：计划含对应新索引」，而该表默认计划选旧索引 ⇒ EXEC 第一天按 §8 机制红整刀停。 | **随 P0-2 删表即解**：断言收为四表；`entitlement_consumption` 只留 A8「既有索引仍在」+ §8 停手条件。**另补**：判据本身改为「含**对应**新索引」而非「含任一索引」，防旧索引冒充。 |

### P1（8 条 · 全采纳）

| # | 命中 | 落法 |
|---|---|---|
| **P1-1** | **机制源钉在过期迁移**（两席）：`gateway_dispatch_owners` 的 live 定义在 `0144_db_trigfam_unify.sql:883`-`:933`（`tf_gateway_dispatch_owners` 六臂）+ `:935`-`:944` 薄壳，**不在 0132**；`:946`-`:949` 是 §8 演进规则冻结。rev r0 全篇引 0132 是过期源 ⇒「0144 改体不会触发停手」而 0144 才是会变的那份。 | **精确修**：机制源改钉 `0144:883`-`:949`；0132 降为「原贴·索引面仍在位」；§8「现场漂移」漂移面换文件（`0144` 六臂谓词 + §8 冻结段）。 |
| **P1-2** | **0132 是 6 个 WHEN 分支不是 5 个**（两席）：`:54`-`:60` 有 `job_route`（`job_semantic_revision WHERE status='route_pending' GROUP BY owner`），已由 `0132:11`-`:13` 部分索引 `ix_job_semantic_revision_route_pending` 覆盖 ⇒ 零触。 | **精确修**：§0.2/§0.3/§0.4 各增该表行（标「已覆盖·零触」）；「五分支」→「**六分支（四 job 表 + commerce 双表 + job_route）**」；A8 增该索引断言；§0.4 补其调用点 `route-classify-consumer.ts:56`。 |
| **P1-3** | **第 7 处同类全局枚举零索引**（席2）：`0048_checkpoint_physical_erasure.sql:374`-`:386` 的 `privacy_list_claimable_checkpoint_targets`（`WHERE status='pending' OR (status='leased' AND lease_expires_at<now()) OR status='failed' ORDER BY ... LIMIT 32`，无 owner 谓词），`privacy_deletion_target` **全迁移零索引**；调用点 `privacy-erasure-worker.ts:37`-`:38`（5s）+ `main.ts:768` 逐副本。 | **降为残面 + 归属**：§2 增非范围行（同类缺陷但非队列/gauge 面，归 R-51/隐私刀，本刀零触）；§0.5 限定为「**在队列/gauge 面**，缺口只在…」，不再以「全局枚举全修」口径措辞。 |
| **P1-4** | **链头钉共 4 处，其中 3 处基线已红**（席2 命中「1 处」，本 rev 按真链复核为 3 处）：`interview-event-retention.proof.ts:81`-`:83`（0219/217）、`apps/api/test/i2b.proof.ts:153`-`:154`（钉 0218，**基线树即为假**）、`entpay-s3.proof.ts:70`-`:71`（0159）、`entpay-s2.proof.ts:83`-`:84`（0157）均陈旧。已排除误报：`dbhy1.proof.ts:288`-`:293`（extra 只统计 `f<'0145_'`）、`:357`（sql⊆mig 单向）、`migrate.proof.ts:317`（无计数钉）、`checkpoint-schema.proof.ts:109`-`:111`（只打印 `total=`）。`i2b:prove` 不在 CI（`.github/workflows/*.yml` 零命中）。 | **精确修**：§0.1 增「事实钉之二：链头钉共 4 处，i2b/entpay-s2/s3 **基线已红**（非本刀引入）」；§2 增「不修这三处链头钉」；§8「跨刀红」补「三件若在 EXEC 期红，按基线已红登记，不计本刀新增红、不得顺手改」。 |
| **P1-5** | **卷内无任何改前/改后量化对比**（席1 实测补齐）。 | **精确修**：§1.4 新增「改前/改后 EXPLAIN 对比表」（5 条 dispatch + 4 表 gauge + 索引体积/写代价），§0.5 与 §7 各引一处；逐处标「席测·待 EXEC 复测」。 |
| **P1-6** | **`clock_timestamp()` 是 volatile ⇒ lease 列不进 Index Cond**（席2 实测）：`0132:27`/`:34`/`:39`/`:44`/`:49` 与 W2 体全用 `clock_timestamp()` ⇒ 计划是 `Index Cond: (status='running')` + `Filter: (lease_expires_at < clock_timestamp())`；因 `running` 行天然很少结果仍达标，但 §1「覆盖判定」那句错，且 B19-B23/B31-B34 只断「计划含对应新索引」⇒ status 单列即可让它出现，**对第二列零判别力**。 | **精确修**：①§1 覆盖判定改「status 前缀全覆盖；`running` 臂因 volatile 谓词只走 status 等值 + heap 过滤（实测口径），lease 列收益留给 R-44/R-51 的时间范围查询」；②B16-B19/B27-B30 改判 **`Index Cond` 文本是否含 `lease_expires_at`**，若维持 `clock_timestamp()` 则该条按「**不适用**」明示登记，**不得静默算绿**；③给可选修法：W2 body 内先 `v_cutoff timestamptz := clock_timestamp();` 再用 `lease_expires_at < v_cutoff`（标为 EXEC 可选项，选了则断言按两列判）。 |
| **P1-7** | **`SET LOCAL enable_seqscan=off` 是构造性假绿**（席2 实测）：`SET LOCAL` 在非事务块内报 WARNING 并**回滚**（`SHOW enable_seqscan` 仍 `on`）⇒ 若 EXEC 用 `pool.query('SET LOCAL …')` 再 `pool.query('EXPLAIN …')`，B24/B35 会在**默认计划**上量测并照样通过。 | **精确修**：B20/B31 明确「**单 client + 同一事务**：`BEGIN; SET LOCAL enable_seqscan=off; <EXPLAIN>; ROLLBACK;`」，每条 EXPLAIN 前加**自检断言** `current_setting('enable_seqscan')='off'`，并增「该计划与默认计划不同」或「Index Cond 含两列」判别项。 |
| **P1-8** | **回滚形违反 runner fail-closed**（席2）：`migrate.ts:470`-`:479` 对已记账的 `concurrent-index` 版本每次重放都 `assertConcurrentIndexDefinition`；`:336`-`:340` 定义不符抛 `migration_concurrent_index_definition_mismatch`、`indisvalid/indisready/indislive` 任一假抛 `migration_concurrent_index_not_valid`，**重放路径不自愈**（自愈只在 fresh 执行路径 `:487`-`:495`）。⇒ rev r0 的回滚（DROP 索引）后任何一次 `pnpm migrate` 都会红，且改迁移再跑会被 `:430`-`:455` checksum 门先拦。 | **精确修**：§1.5 回滚形改为「①`DELETE FROM schema_migrations WHERE version IN (...)` 与 `DROP INDEX CONCURRENTLY` 必须**同一运维动作成对执行**；②gauge 回滚只能以**前向迁移**重放 0042 体（不能改 0042，checksum 门）；③若走前向迁移，链头钉与 cap 再各 +1」，并写进 §8 停止条件。 |

### P2（16 条 · 逐条「精确修」或「降为残面」）

1. **W2 与 0144:946-949 演进规则正面冲突** → **精确修（合规声明）**：该冻结只覆盖 `tf_` 13 名（`db-trigfam-unify.proof.ts:61`-`:64`）与 REQUEST 附录 A Tier-2 长尾；`gateway_job_gauges` 不属任一（`grep -n gateway_job_gauges 0144_db_trigfam_unify.sql` = 0 行·本席亲跑；Tier-2 名单亦不含）⇒ 本刀是**首次体变更非重贴**。**不作 `_v2` 包装**：新增 `tf_gateway_job_gauges` 会破 `db-trigfam-unify.proof.ts:61-64` 的 13 名精确集合门，代价更高。理由须逐字登记进 C6 头注（防后人误判）。
2. **§1.5 首个否决项理由改** → **精确修**：真正决定性约束是**谓词语法**——`migrate.ts:216`-`:222` 正则只接受 `WHERE <col> IS NULL` 或 `WHERE <col> = '<literal>'`，`IN`/`OR` 一律拒收 ⇒「一个部分索引覆盖 queued+running」在不动 runner 前提下**不可表达**；并解释为何 `0010` 那种单值部分索引是既有惯例而本刀不能用同一惯例（四队列每表需 queued/running-expired/终态三值 ⇒ 3 条迁移/表 = 12 条，见 §1.5 否决表）。
3. **`dead` 列修不动**（席1 实测 400k quarantined：`count(*) WHERE status='quarantined'` 默认 Parallel Seq Scan 42.2ms / 禁 seqscan 29.7ms / VACUUM 后 Index Only Scan 33.1ms、Heap Fetches 0；整 gauge 体 45.1ms → 23.5ms 仅 **2.1x**）→ **降为残面 + 量化阈值**：§1.2 与 §7 明写「`dead` 列仍为 O(终态集)，本刀只压 queued/running_expired；终态集成本归 R-44/R-51」，并给阈值（终态 40 万行时该列 ~30ms/拍/副本）；B31 判据改「索引可用 + 该列耗时不超过对比表所列上限」而非「必须走索引」。runbook `:141`/`:169`-`:178` 自登记「四队列终态行零 retention ⇒ `worker_jobs_dead` 单调累积」⇒ 400k 就是上线后稳态，据此改判。
4. **per-owner 路径实测会翻计划**（席1·70k 行）：claim 里两条 `NOT EXISTS (... r.interview_id=j.interview_id ...)` 加索引前是**两次 Seq Scan 70,013 行**（claim 合计 9.48ms），加索引后 0.101ms（`interview_job` 无 `interview_id` 前导索引：`0001:268`/`0049:34`/`0055:11`/`0064:37` 全 owner 打头）——**这是本刀最大的隐藏收益**，也证明「per-owner 路径已正确」不成立。sweep（`interview-jobs.ts:331`-`:345`）与 live-count 守卫（`:175`-`:180`）会从 `ix_ijob_claim(owner,status)` 翻到新索引 + owner Filter。→ **精确修**：§0.3 末段改实测口径；§4 增 **B32-B34** 三条「per-owner 计划非回归」；§2 增「相邻队列（privacy_deletion_target / online_judge_dispatch / ai_model_invocation）已核，不纳入，理由逐条」。
5. **§0.3 表头与两行普查不全** → **精确修**：表头改「现有索引（键序逐条注明·非全部 owner 前导）」；`entitlement_consumption` 行改为 `(lease_expires_at) WHERE status='reserved'`；`commerce_outbox` 补 `0001:135` `ix_outbox_pending (owner_user_id,status)` 与 `0190:12`-`:13` `uq_outbox_consumption`；另登 `packages/db-mysql/migrations/0001_skeleton.sql:42`-`:43` `idx_job_queue_claim (status, lease_expires_at)` 同形先例（仅形态佐证，非本仓契约）。
6. **HOT 破断无量化** → **精确修**：§1.5 增量化与边界——`interview-jobs.ts:309`-`:317`（`renewInterviewJobLease`、`LEASE_SECONDS=120`、只更新 `lease_expires_at`）与 `packages/db/src/commerce/commerce.ts:562`-`:571` 今天都是 HOT 可用；新增 `(status, lease_expires_at)` 后心跳**永久失去 HOT 资格**（每拍 +1 索引元组 + 堆膨胀，`0213` 的 autovacuum 调优只能缓解）；并明写**部分索引方案同样破 HOT**（running 行正是心跳行）⇒ rev r0「部分索引写放大更低」在心跳面不成立，该论点收窄为「迁移条数 12 条 vs 4 条」。
7. **建索引时长未量化** → **精确修**：§8 增「若累计/单条超 `MIGRATION_CONCURRENT_INDEX_TIMEOUT_MS`（`migrate.ts:241`-`:243` 默认 300s、上限 900s）则以 env 上调并在收据登记；上调后仍超则停手上报」。
8. **`sql/24` 镜像滞后** → **降为残面 + 登记**：`packages/db/sql/24_runtime_observability_gateway.sql:4`-`:24` 是 `gateway_job_gauges()` 的旧 FILTER 体镜像；本刀只改迁移 ⇒ 镜像滞后。当前无门抓（`schema-drift-check.mjs:1`-`:6` 只比列/UNIQUE/PK；`dbhy1.proof.ts:357` 只比对象名录且 sql⊆mig 单向）。§2-8 登记「已知滞后 + 无门覆盖的理由 + 归属（sql/ 镜像同步刀）」，**不在本刀增同步条目**（否则 cap 与断言面再扩，违反 S 体量）。
9. **gauge 数值等价的隐含前提未写** → **精确修**：§5 增 Ban「Ban 把 gauge 体拆成多条 `RETURN QUERY`」；§4 B21 增「同语句取数（单 `RETURN QUERY` ⇒ 单快照）」实现约束，并写清 0042 旧体单遍扫描同快照的对齐理由。
10. **`clock_timestamp()` 求值粒度变化未登记** → **精确修**：§7 增「≠ gauge 的 cutoff 瞬时语义逐位不变（旧=逐行 volatile 求值，新=每子查询一次；对告警口径无实质影响）」。
11. **门 1 命令绕开 runner** → **精确修**：§4 门 1 改 `node scripts/run-e2e-isolated.mjs job-queue-index:prove`；C9 明写 runner target id `job-queue-index:prove`；并补「一切触 DB 的门必须经 runner，未注册目标即停」。
12. **C1-C5 文件骨架不足** → **精确修**：规定「仅 C1-C4 头注含 `-- job-queue-index: <table>`（C6 严禁含该标记，否则 A1 会数出 5 个）」；`-- @migration-mode concurrent-index` 必须**独占整行**（`migrate.ts:609` 正则 `^\s*--\s*@migration-mode\s+concurrent-index\s*$`，行尾加注释即失效）；并附真运行器正则的代入验证结论（四条 DDL 全解析通过、`(status, lease_expires_at)` 两列均过长列名白名单）。
13. **EXPLAIN 执行角色未钉** → **精确修**：§4 动态门口径加「EXPLAIN 以 superuser 或 `SET row_security = off` 执行，principal GUC 状态在收据逐行登记」；理由：四表均 `ENABLE/FORCE RLS`，`0059:92`-`:94` 策略 `TO app_role USING (owner_user_id=current_setting('app.principal_user',true) …)`，`app_gateway_role` 无 SELECT（`0040:3`-`:5`/`0042:3`）⇒ 以受 RLS 约束角色 EXPLAIN 且 GUC 未设会走 `ix_ijob_claim`（owner 前导）而不含新索引。另登记（非本刀）「SECURITY DEFINER + FORCE RLS 下若迁移角色非 superuser/BYPASSRLS，`gateway_job_gauges()` 会因无适用策略返回全 0」。
14. **B26 列型断言取数方式未钉** → **精确修**：B22 补 `pg_get_function_result` 全串逐字比对，或 `pg_proc.proallargtypes + format_type` 双轨；并写明比对对象 = `0042:5-26` 时点的签名（`queue text, queued bigint, running_expired bigint, dead bigint`）。
15. **runbook 下钻锚会过期** → **精确修**：`alerting-runbook.md:124` 指向 `0042:5-26`，W2 后不再 live；§2-9 与 §7 登记该指针过期、指向新迁移（runbook 本刀零触，改指针归文档刀）。
16. **B1-B12 多为运行器已保证的恒真** → **精确修（诚实计数）**：§4 增「44 条 = 9 静态 + 12 元数据（B1-B11/B22）+ 21 EXPLAIN 形态（B12-B20/B23-B31/B32-B34）+ **2 条真行为**（B21 数值等价、B35 `idx_scan` 增量）」，并新增 B35 增量臂（`pg_stat_user_indexes.idx_scan` 执行前后必须增长），使「索引真被用」有行为证据而非只看 planner。

---

## 认领核对 · 六条逐条判定（对 `99e4e3f38` 亲读 · file:line 逐字）

> 权威定义取自审计底稿 `.../refactor-backlog.md`（外部底稿，非本仓 tracked）；LEDGER/ha-6 只作派单映射。**本仓 north-star-ha.md 对六条 R 号零命中**（`grep -n "R-24\|R-36\|R-37\|R-44\|R-50\|R-51" ai-docs/delivery/north-star-ha.md` = 0 行；本席亲跑）——认领来源按实际登记处订正，见 §0.1-勘误①。

| 项 | 底稿原文（逐字） | 底稿锚 | 当前实树证据（`99e4e3f38` 亲读） | 判定 | 处置 |
|---|---|---|---|---|---|
| **R-24** | 「对账器/清理循环在每个 worker 副本上同时运行，无 leader 选举；安全性依赖行锁/SKIP LOCKED，但会重复做全表聚合」（P2·S） | `refactor-backlog.md:67`/`:284`-`:290` | `apps/worker/src/main.ts:660`-`:667` 四消费循环逐副本起；`:773`-`:776` gauge 循环逐副本 15s；`0144:890`-`:926` 全局 owner 枚举六臂逐副本 5s；全仓无 leader 选举实现（底稿证据面，本席复核 loop 起法在树）。HA-7 非声称 `receipts/archive/2026-09-batch23/harness/ha-7-queue-metrics-REQUEST.md:94`「≠ R-24 全量闭环」 | **未做**（HA-7 只补观测，未动选举/聚合成本） | **不选**：leader 选举=编排改动，且底稿 `:290` 自己的建议是「保持无 leader，把 gauge 与枚举改走部分索引/物化计数」——即先由 R-50 吃掉重复聚合的成本，本刀即该前置。 |
| **R-36** | 「登录限流按 email 单维度且在进程内：攻击者可任意锁定他人账号，也无法抵御分布式撞库」（P1·S） | `refactor-backlog.md:79`/`:381`-`:388` | 双/三维已落：`apps/api/src/modules/auth/auth.service.ts:88`-`:93` 三桶 `login:${email}`→`login:ip:*`→`login:global`；`packages/db/src`/worker 无 Redis 共享态。**targeted lockout 仍可**（per-email 桶 5/0.2 仍可被耗尽）；共享态按 HA-6 R-23 裁定「接受 ×N 稀释」（`ha-6-companion-REQUEST.md:98` W2） | **半做**（维度已落；targeted lockout + 共享态未解，后者已裁定接受） | **不选**：剩余面=Redis/验证码/渐进延迟，属云侧或产品决策，非本刀本地结构补强；且 HA-6 已对该残面作接受裁定，翻案越界。 |
| **R-37** | 「密码哈希使用同步 scryptSync，会阻塞事件循环；叠加登录路径上密码长度上限可能不生效」（P1·S） | `refactor-backlog.md:80`/`:389`-`:396` | **已落**：`packages/domain/src/auth.ts:5`-`:21` `promisify(scryptCallback)` 异步三参形；`ai-docs/delivery/harness/authz-34-residual-REQUEST.md:3` Status `closed`（nail merge `ed82b873`，对本席 HEAD `git merge-base --is-ancestor` 亲证 EXIT=0） | **已落地** | **剔除**（无可做面）。 |
| **R-44** | 「队列健康指标只有 queued/running_expired/dead 三个计数：缺少最老排队年龄/延迟、attempts 分布、job 时长、unknown 调用数与报告隔离的独立指标」（P1·S） | `refactor-backlog.md:87`/`:444`-`:450` | **半做**：`packages/ai-runtime/src/metrics.ts:72`-`:77` 仅 `jobsQueued/jobsRunningExpired/jobsDead/jobsFailed`；HA-7 只加失败 counter（`report-worker.ts:177` 等），非声称 `ha-7...REQUEST.md:94`「本刀只补观测消费侧」。age/duration/attempts/unknown/quarantine 独立指标均无 | **半做**（仅失败 counter） | **不选（本刀为它让路）**：age=`min(created_at) WHERE status='queued'`；无 status 前导索引即每拍全表扫（`ix_ijob_claim` 以 owner 开头，`0001:268`）——先做 R-50 才是 R-44 的硬前置。 |
| **R-50** | 「队列调度/gauge 的过滤条件（status/lease）没有以 status 开头的索引：每 5 秒×多循环×多副本全表扫描」（P1·S） | `refactor-backlog.md:93`/`:494`-`:500` | **未做（rev r1 订正实为「缺口四表 + 一处假缺口」）**：四 job 表索引全以 owner 开头（`0001:239` ai_report / `0001:268` interview_job / `0007:31` quiz_job / `0008:32` diagnosis_job）；`commerce` 臂的两张表**已被覆盖**——`entitlement_consumption` 由 `0010:7`-`:9` `(lease_expires_at) WHERE status='reserved'` 覆盖、`commerce_outbox` 由 `0211:7`-`:9` `(owner_user_id) WHERE status='pending'` 覆盖；`job_route` 臂由 `0132:11`-`:13` 覆盖；`0144:890`-`:926` 六臂全局按 status/lease 过滤；`0042:10`-`:24` 四表 FILTER 全表聚合；`main.ts:773`-`:776` 15s/副本、`main.ts:510` 5s/副本 | **未做**（四 job 表为本刀靶） | **选中**（理由见下）。 |
| **R-51** | 「核心表无限增长且没有保留/归档/分区/vacuum 调优策略」（P1·M） | `refactor-backlog.md:94`/`:502` 起 | **半做**：`0212_outbox_relayed_retention.sql`（outbox relayed 保留清扫）· `0219_interview_event_retention_purge.sql`（interview_event 保留清扫）· `0213_interview_job_autovacuum_reloptions.sql`（interview_job autovacuum 调优）已落；四 job 终态行零 retention（`alerting-runbook.md:141`/`:169`/`:188` · HA-7 `:49` 明列「R-51 本体未实现」）；checkpoint/trace 保留面未落 | **半做**（三小件已落；job 终态/checkpoint 保留未落） | **不选**：剩面=删改语义重刀（HA-7 明确越界即废），且其时间型清理同样需要 R-50 类索引先行。 |

**选条理由（按价值排序的书面结论）**：
1. **硬前置性最强**：R-50 是 R-44（最老排队年龄=按 status+created_at 取 min）与 R-51（按时间清理需时间索引）的共同前置；底稿 R-24 `:290` 的修法原文也把「gauge 与枚举改走部分索引/物化计数」列为首选——**R-50 是 R-24/R-44/R-51 三条同时吃到的结构性前置**。
2. **对多实例的收益是线性的**：`0144:890`-`:926` owner 枚举每 5s×四队列×N 副本；`0042:10`-`:24` gauge 每 15s×四表×N 副本。HA-1 拓扑（api×2+worker×2）把这些全部翻倍；索引把「扫全表历史」降为「扫匹配 status 的键段」，收益随 `done` 历史行数线性放大（底稿 `:498`「扫描成本随历史线性增长」）。
3. **本地可证且零云**：真隔离 PG 上 EXPLAIN 可判（默认计划 + 事务内 `enable_seqscan=off` 双口径），不依赖任何云资源/密钥。
4. **S 体量、单点可回滚**：4 条并发索引 + 1 条函数改形，全部 additive（回滚形见 §1.5，rev r1 已修正为 runner-recognized 的成对动作）。
5. 其余五条：R-37=已落地剔除；R-36=残面属云侧/产品裁决；R-44/R-51=被本刀前置；R-24=底稿建议先由 R-50 吃掉成本，编排改动留后。

---

## §0 现状锚（`git rev-parse HEAD:<path>` 亲算 · 8 hex · 全部对 `99e4e3f38`）

### 0.1 订正与勘误（起草席/修订席亲跑亲读，如实登记）

1. **勘误① 派单文档指位**：任务前置称六条列于 `ai-docs/delivery/north-star-ha.md`；本席在该文件 `grep -n "R-24\|R-36\|R-37\|R-44\|R-50\|R-51"` **0 命中**（亲跑）。六条的实登记面=`product-campaign-LEDGER.md:136` + `ha-6-companion-REQUEST.md:106`；本卷据此认领，不以 north-star-ha 为条目来源。
2. **勘误② 行号漂移**：`ha-6-companion-REQUEST.md:5`/`:106` 引 `product-campaign-LEDGER.md:134`；当前实树该表尾行在 **`:136`**（表头起 `:128`，中间新增两行）。本卷按 `:136` 钉，引用时保留原文 `:134` 并注明漂移。
3. **勘误③ 描述错位**：`ha-6-companion-REQUEST.md:106` 写「R-44 索引 / R-50/51 生命周期」；底稿权威定义是 **R-44=队列健康指标 / R-50=索引 / R-51=数据生命周期**（`refactor-backlog.md:87`/`:93`/`:94`）。本刀取 **R-50=索引**，按底稿口径，不按 ha-6 的错位标签。
4. **勘误④ R-24 名目**：LEDGER 同行把「队列指标」列在 R-24 位，HA-7 卷名亦写「R-24 队列指标」；底稿 R-24 实义是「无 leader 选举的重复全表聚合」，队列指标实为 R-44。两者是关联项（底稿 `:290` 互指），但不可互借关闭；本卷非声称里分别钉死。
5. **事实钉之一（链头/文件数）**：`packages/db/migrations/*.sql` 当前 **217** 件，链头 `0219_interview_event_retention_purge`（`ls packages/db/migrations/*.sql | wc -l` = 217 亲证）；任何新迁移都会打破 `interview-event-retention.proof.ts:81`-`:83` 的「链头 0219 / 文件数 217」双钉——本卷已把它列为 EXEC 必须同步的最小子项（§3-C10）。
6. **事实钉之二（rev r1 新增·链头钉共 4 处，其中 3 处基线已红）**：全仓链头钉共 **4 处**——`packages/db/test/interview-event-retention.proof.ts:81`-`:83`（0219/217，**本刀必须同步**）、`apps/api/test/i2b.proof.ts:153`-`:154`（钉 `0218_remit_invoice_id_v7`，**基线树即为假**：真链头已是 0219）、`apps/api/test/entpay-s3.proof.ts:70`-`:71`（钉 `0159_entpay_my_offline_orders`）、`apps/api/test/entpay-s2.proof.ts:83`-`:84`（钉 `0157_billing_payer_route`）。后三件**非本刀引入**（rev r0 起草日即已陈旧），且 `i2b:prove` 不在 CI（`.github/workflows/*.yml` 对 `i2b|entpay` 零命中，本席亲跑）。**已排除的误报**：`dbhy1.proof.ts:288`-`:293`（extra 只统计 `f < '0145_'`，新增 0220+ 不计）、`dbhy1.proof.ts:357`（sql⊆mig 单向缺失统计）、`migrate.proof.ts:317`（无计数钉）、`checkpoint-schema.proof.ts:109`-`:111`（只打印 `total=`）。
7. **勘误⑤（rev r1·P0-2 假证纠正）**：rev r0 §0.3 写「`entitlement_consumption` 无 `(status,lease)` 索引（全迁移 CREATE INDEX 零命中）」为**错误证词**——该表由 `0010_consumption_stale_lease_idx.sql:7`-`:9` 的**部分索引**覆盖（`(lease_expires_at) WHERE status='reserved'`），形态即「status 定值 + lease 范围」。rev r0 的 `rg` 只搜 `ON <table> (status` 前导形，漏掉部分谓词形；本 rev 修正并扩 A6 的负断言形态（含隐式 status 谓词）。
8. **勘误⑥（rev r1·P0-1 计数面纠正）**：rev r0 §9 写「cap 零步进」只对**起草状态**成立；**EXEC 必撞 cap**（详见 rev r1 小节 P0-1 与 §3-C12/C13）。本 rev 已把 cap 步进登记为 EXEC 必做项，并把 §8 的验收红判据改为「> sanctioned cap」。

### 0.2 blob 锚表（`git rev-parse HEAD:<path>` 8 hex · 行数）

| 文件 | blob（行数） | 本卷用到的锚 |
|---|---|---|
| `packages/db/migrations/0042_runtime_observability_gateway.sql` | `ccac352d`（48） | `:5`-`:7` 签名/SECURITY DEFINER · `:10`-`:24` 四表三列 FILTER 聚合 · `:45`-`:48` REVOKE/GRANT |
| `packages/db/migrations/0144_db_trigfam_unify.sql` | `29afdf46`（950） | **`:883`-`:933` `tf_gateway_dispatch_owners` 六臂（live 定义）** · `:935`-`:944` 薄壳 · `:946`-`:949` §8 演进规则冻结（Ban 同名全量重贴） |
| `packages/db/migrations/0132_job_route_classify_worker_dispatch.sql` | `866a4ee7`（68） | `:11`-`:13` `ix_job_semantic_revision_route_pending` 部分索引（**仍在位·零触**） · `:15`-`:60` 六臂**原贴**（已被 0144 取代·仅史录） |
| `packages/db/migrations/0010_consumption_stale_lease_idx.sql` | `8126f56c`（9） | **`:7`-`:9` `ix_consumption_stale_lease (lease_expires_at) WHERE status='reserved'`（commerce 臂已覆盖·本刀不新建）** |
| `packages/db/migrations/0048_checkpoint_physical_erasure.sql` | `fe74445a`（490） | `:374`-`:386` `privacy_list_claimable_checkpoint_targets` 全局枚举（无 owner 谓词·`privacy_deletion_target` 零索引·**残面归 R-51/隐私刀**） |
| `packages/db/src/jobs/gateway-dispatch.ts` | `1f752a27`（108） | `:22`-`:26` `gatewayDispatchOwners` · `:58`-`:67` `gatewayJobGauges` |
| `apps/worker/src/main.ts` | `6962c0a6`（881） | `:217`-`:221` 数据源注释 · `:226` 「小表全扫可接受」 · `:229`-`:238` `refreshJobGauges` · `:510` `jobReconcileIntervalMs` 5s · `:660`/`:663`/`:665` 三消费循环 · `:768` privacy checkpoint 擦除循环 5s · `:773`-`:776` gauge 循环 15s · `:878` 启动日志 |
| `apps/worker/src/privacy-erasure-worker.ts` | `8d9dd2eb`（60） | `:37`-`:38` `runCheckpointPrivacyEraser(..., 5_000)`（残面调用点） |
| `apps/worker/src/route-classify-consumer.ts` | —（未入锚表·仅引调用点） | `:56` `gatewayDispatchOwners(pool,'job_route')` |
| `packages/db/src/interview/interview-jobs.ts` | `7401cc04`（401） | `:154`-`:181` per-owner claim（含两条 `NOT EXISTS … interview_id`） · `:175`-`:180` live-count 守卫 · `:309`-`:317` `renewInterviewJobLease`（HOT 面） · `:331`-`:345` per-owner sweep · `:398`-`:401` 旧全局 owner 枚举（现由 0144 网关取代） |
| `packages/db/migrations/0001_baseline.sql` | `d68f8dd0`（485） | `:109`-`:122` entitlement_consumption 表体 · `:135` `ix_outbox_pending (owner_user_id,status)` · `:224`-`:239` ai_report 表体+`ix_report_claimable` · `:253`-`:268` interview_job 表体+`ix_ijob_claim` |
| `packages/db/migrations/0007_resume_quiz.sql` | `dc5592e4` | `:17`-`:31` quiz_job 表体+`ix_quizjob_claim` |
| `packages/db/migrations/0008_resume_diagnosis.sql` | `88e931e4` | `:18`-`:32` diagnosis_job 表体+`ix_diagnosisjob_claim` |
| `packages/db/migrations/0049_resume_reference_foundation.sql` | `7c95a713`（87） | `:34`-`:36` `ix_interview_job_resume_reference (owner_user_id,resume_id)`（无 interview_id 前导） |
| `packages/db/migrations/0055_resume_reference_legacy_backfill_index.sql` | `cab74fdd`（12） | `:11`-`:13` `(created_at,id) WHERE reference_schema_version IS NULL` |
| `packages/db/migrations/0064_interview_resume_epoch_reference.sql` | `b8b64717`（180） | `:37`-`:38` `(owner_user_id, interview_id, …) WHERE reference_schema_version=64`（仍 owner 前导） |
| `packages/db/migrations/0190_outbox_consumption_unique_concurrent.sql` | `98d1ee12`（13） | `:12`-`:13` `uq_outbox_consumption (consumption_id)` |
| `packages/db-mysql/migrations/0001_skeleton.sql` | `04b9e018`（45） | `:42`-`:43` `idx_job_queue_claim (status, lease_expires_at)`（**仅形态佐证**·非本仓契约） |
| `packages/db/sql/02_commerce.sql` | `8fe32532`（131） | `:50`-`:53` `ix_consumption_stale_lease` 逐字镜像 |
| `packages/db/sql/24_runtime_observability_gateway.sql` | `e31faf13`（64） | `:4`-`:24` gauge 旧 FILTER 体镜像（**本刀后滞后·已登记**） |
| `packages/db/src/migrate.ts` | `b13c6fec`（631） | `:11`-`:24` 三执行模式契约 · `:204`-`:228` 单条 CONCURRENTLY 正则（一语句、谓词仅 `IS NULL`/`= '字面量'`） · `:241`-`:243` 超时 300s · `:336`-`:340` 定义/有效性断言 · `:430`-`:455` checksum/前缀门 · `:470`-`:479` 重放路径逐次断言 · `:487`-`:495` fresh 路径自愈 · `:609` 注记检测 |
| `packages/db/migrations/0198_trace_created_at_index.sql` | `50823c80` | `:1`-`:9` 单索引并发迁移先例（IF NOT EXISTS 幂等） |
| `packages/db/migrations/0211_outbox_unsettled_partial.sql` | `0f3dc6d0` | `:1`-`:9` 部分索引并发迁移先例（`WHERE status='pending'`） |
| `packages/db/migrations/0219_interview_event_retention_purge.sql` | `6bccd18b` | `:45`-`:48` 「后继刀为 created_at 补索引须独立并发迁移」明示 |
| `packages/db/migrations/0213_interview_job_autovacuum_reloptions.sql` | `e188a1d0` | `:1`-`:10` R-51 半件的 autovacuum 调优（本刀不重复、不撤销；HOT 面仅能缓解） |
| `packages/db/test/interview-event-retention.proof.ts` | `5a8ec1d7`（323） | `:76`-`:83` 链头 0219 + 文件数 217 双钉（本刀必须同步） |
| `apps/api/test/i2b.proof.ts` | `a6e4403d`（459） | `:153`-`:154` 链头钉 0218（**基线已红**·非本刀） |
| `apps/api/test/entpay-s3.proof.ts` | `09efdfb6`（196） | `:70`-`:71` 链头钉 0159（**基线已红**·非本刀） |
| `apps/api/test/entpay-s2.proof.ts` | `39cf4524`（255） | `:83`-`:84` 链头钉 0157（**基线已红**·非本刀） |
| `packages/db/test/runtime-role.proof.ts` | `7c32f040`（130） | `:108`-`:113` `gateway_job_gauges()` 四行/列名断言（本刀回归面） |
| `packages/db/test/db-trigfam-unify.proof.ts` | `739b6776`（579） | `:61`-`:64` `TF_MEMBERS` 13 名精确集合（新增 `tf_` 名会破门 ⇒ 本刀不引入） |
| `packages/db/test/migrate.proof.ts` | `0ca7c391` | concurrent-index 有效性/谓词/特权面既有断言（本刀回归面，零改） |
| `packages/ai-runtime/src/metrics.ts` | `277d0e77`（213） | `:67`-`:77` 队列指标仅四件 · `:153`-`:156` 四队列 0 预填 |
| `packages/db/package.json` | `2566537c` | `:25` `prove:migrate` · `:30` `prove:level-policy`（注册形先例）· `:41` `prove:runtime-role` · `:65` `prove:interview-event-retention` |
| `scripts/run-e2e-isolated.mjs` | `dff85f04` | `:89` `LIVE_E2E_TARGETS` · `:614`/`:2839`/`:3700` `interview-event-retention:prove:raw` 注册三处形 · `:894` `level-policy-migrate:prove` 形 · `:2839` 允许清单 · `:3357` 命令映射 |
| `scripts/schema-drift-check.mjs` | `5e4ac306`（92） | `:1`-`:6` 只比列 + UNIQUE/PK（**不覆盖函数体**） |
| `scripts/ai-docs/public-text-policy.mjs` | `c633ef6c` | `:36` `MANAGED_ROOTS` 含 `packages` · `:39` `TEXT_EXTENSIONS` 含 `.sql`/`.ts`、不含 `.log` · `:280` `CAP-SANCTION-2461` 先例 · `:282` `MAX_FILES = 2_461` · `:482` `git ls-files --cached --others` |
| `scripts/ai-docs/public-text-policy.proof.mjs` | `ed9c91e1`（493） | `:452` 循环 2_461 · `:459` `scannedFiles === 2_461` · `:474` `'ai-docs/f-2461.md'` · `:477` `PTP_FILE_LIMIT:2462`（cap 四联动点） |
| `.github/workflows/ci.yml` | `527a1d80`（369） | `:49` `pnpm docs:check`（**EXEC 撞 cap 即 CI 红**） |
| `ai-docs/observability/alerting-runbook.md` | `e7097d5a` | `:124` 下钻锚指 `0042:5-26`（**W2 后过期·本刀零触·已登记**） · `:141`/`:169`/`:188` 四队终态行零 retention（R-51 登记） |
| `apps/worker/src/report-worker.ts` | `e89fec16` | `:177` HA-7 失败 counter 落点（R-44 半件，零改） |
| `ai-docs/delivery/north-star-ha.md` | `fdcaa83e` | `:24` releaseEvidence=false · `:46` 不宣称 HA · `:55` G7 · `:67` 本地一律 NOT_HA |
| `ai-docs/delivery/harness/product-campaign-LEDGER.md` | `a5065950` | `:136` 六条同行 · `:138` pins 维持 |
| `ai-docs/delivery/harness/ha-6-companion-REQUEST.md` | `75ebbc3f` | `:5` 前序三件 · `:106` 余六件后刀 · `:98` W2 接受 ×N |
| `receipts/archive/2026-09-batch23/harness/ha-7-queue-metrics-REQUEST.md` | `2b330a44` | `:27` DLQ 只增不减 · `:41` runbook 登记 · `:49` R-51 本体未实现 · `:94` 非声称三条 |
| `ai-docs/delivery/harness/authz-34-residual-REQUEST.md` | `58aaff8d` | `:3` Status closed（R-37 已落地佐证） |
| `packages/domain/src/auth.ts` | `697da7dc` | `:5`-`:21` 异步 scrypt（R-37 已落地） |
| `apps/api/src/modules/auth/auth.service.ts` | `3b0d7a59` | `:19`-`:28` ip/global 桶参数 · `:88`-`:93` 三桶登录（R-36 半做） |

### 0.3 索引普查（R-50 缺口本体 · 本席逐条 `CREATE INDEX` 亲证 · **rev r1 订正**）

| 表 | 现有索引（键序逐条注明·**非**全部 owner 前导） | 锚 | status/lease 前导 | 处置 |
|---|---|---|---|---|
| `interview_job` | `ix_ijob_claim (owner_user_id, status, seq, created_at)`；`ix_interview_job_resume_reference (owner_user_id, resume_id) WHERE resume_id IS NOT NULL`；`ix_interview_job_reference_legacy_backfill (created_at, id) WHERE reference_schema_version IS NULL`；`ix_interview_job_v64_resume_epoch (owner_user_id, interview_id, …) WHERE reference_schema_version=64`。**`interview_id` 无前导索引** | `0001:268`/`0049:34`-`:36`/`0055:11`-`:13`/`0064:37`-`:38` | **无** | **新建** `ix_ijob_status_lease` |
| `ai_report` | `ix_report_claimable (owner_user_id, status)` | `0001:239` | **无** | **新建** `ix_report_status_lease` |
| `quiz_job` | `ix_quizjob_claim (owner_user_id, status, created_at)` | `0007:31` | **无** | **新建** `ix_quizjob_status_lease` |
| `diagnosis_job` | `ix_diagnosisjob_claim (owner_user_id, status, created_at)` | `0008:32` | **无** | **新建** `ix_diagnosisjob_status_lease` |
| `entitlement_consumption` | PK + `UNIQUE(owner_user_id, idempotency_key)` + **`ix_consumption_stale_lease (lease_expires_at) WHERE status='reserved'`** | `0001:109`-`:122` + **`0010:7`-`:9`**（镜像 `sql/02_commerce.sql:50`-`:53`） | **已覆盖**（status 固定为部分谓词 + lease 为键列） | **不新建**；A8 断言其仍在；席测新索引 0 次使用 ⇒ 纯写放大 |
| `commerce_outbox` | `ix_outbox_unsettled (owner_user_id) WHERE status='pending'`；`ix_outbox_pending (owner_user_id, status)`；`uq_outbox_consumption (consumption_id)` | `0211:7`-`:9`；`0001:135`；`0190:12`-`:13` | **已覆盖**（部分谓词即 status） | **不新建**；A8 断言其仍在 |
| `job_semantic_revision` | `ix_job_semantic_revision_route_pending (owner_user_id, created_at, revision) WHERE status='route_pending'` | `0132:11`-`:13` | **已覆盖**（部分谓词定 status·集合本身极小） | **零触**；A8 断言其仍在 |

**per-owner 路径实测口径（rev r1·P2-4）**：`WHERE owner_user_id=$1` 的 per-owner claim/sweep 走现有 owner 前导索引**并非「已足够」**——claim 内的两条 `NOT EXISTS (… r.interview_id=j.interview_id …)` 在 `interview_id` 无前导索引时会退化为**两次 Seq Scan**（席测 70k 行：加索引前 claim 合计 9.48ms／两次 70,013 行扫描，加索引后 0.101ms）。sweep（`:331`-`:345`）与 live-count 守卫（`:175`-`:180`）会从 `ix_ijob_claim(owner,status)` 翻到新索引 + owner `Filter`。**本刀不改这些查询**（产品语义零触），但 §4 增 B32-B34 作「计划非回归」守卫，并在 §7 如实登记该收益。

**形态佐证（非契约）**：`packages/db-mysql/migrations/0001_skeleton.sql:42`-`:43` 已有 `KEY idx_job_queue_claim (status, lease_expires_at)`（MySQL 侧 stub）——本刀键序与之同形，仅作惯例佐证，不构成对本仓 PG 的约束。

### 0.4 全局查询路径（每副本 × 每拍 · **六分支**）

| 路径 | 查询（逐字摘要） | 锚（live） | 频率 | 副本数 | 当前计划 |
|---|---|---|---|---|---|
| owner 枚举 interview | `WHERE j.status='queued' OR (j.status='running' AND j.lease_expires_at < clock_timestamp()) GROUP BY owner ORDER BY min(created_at)` | `0144:890`-`:896`（原贴 `0132:25`-`:29`） | 5s（`main.ts:510`） | N | 全表扫 |
| owner 枚举 quiz | `WHERE status='queued' OR (status='running' AND lease < clock_timestamp())` | `0144:897`-`:901`（原贴 `0132:32`-`:34`） | 5s | N | 全表扫 |
| owner 枚举 diagnosis | 同形 | `0144:902`-`:906`（原贴 `0132:37`-`:39`） | 5s | N | 全表扫 |
| owner 枚举 report | `WHERE status IN ('queued','failed') OR (status='running' AND lease < clock_timestamp())` | `0144:907`-`:911`（原贴 `0132:42`-`:44`） | 5s | N | 全表扫 |
| owner 枚举 commerce | `entitlement_consumption WHERE status='reserved' AND lease < clock_timestamp() UNION commerce_outbox WHERE status='pending'` | `0144:912`-`:920`（原贴 `0132:47`-`:53`） | 30s | N | **两表均已索引**（`0010:7`-`:9` / `0211:7`-`:9`）· 零触 |
| owner 枚举 job_route | `job_semantic_revision WHERE status='route_pending' GROUP BY owner` | `0144:921`-`:926`（原贴 `0132:54`-`:60`）；调用点 `route-classify-consumer.ts:56` | 分类 drain 族 | N | **已索引**（`0132:11`-`:13` 部分索引）· 零触 |
| gauge 四表 | `count(*) FILTER (WHERE status=...)` ×4 表 ×3 列 | `0042:10`-`:24` | 15s（`main.ts:776`） | N | 全表扫（`main.ts:226` 注释自认「小表全扫可接受」） |
| **非本刀·同类残面** | `privacy_checkpoint_target JOIN privacy_deletion_target WHERE pending OR leased-expired OR failed ORDER BY created_at LIMIT 32` | `0048:374`-`:386`；调用点 `privacy-erasure-worker.ts:37`-`:38`、`main.ts:768` | 5s | N | 零索引（**归 R-51/隐私刀·本刀零触**） |

### 0.5 靶心一句话（rev r1 收窄口径）

**在队列/gauge 面**，`done` 历史行只增不删（R-51 未收口），而每副本每 5s 的 owner 枚举与每 15s 的 gauge 聚合都**不带 owner 谓词**，四张 job 表的现有索引全部 owner 前导，于是每条查询都退化为对整张历史表顺序扫描；HA-1 拓扑把副本翻倍、R-51 迟迟不落又把历史继续做大——**R-50 的修法是把「按 status/lease 过滤」变成索引可服务的键段，并把 gauge 的多 FILTER 单遍聚合改成逐 status 的可索引子查询**。这样 R-24 的重复聚合成本被结构性压小（不必先做 leader 选举），R-44 的 age 指标与 R-51 的时间清理也拿到可用的索引基座。**缺口只有四张 job 表**：commerce 双表（`0010`/`0211`）与 job_route（`0132`）已有匹配的部分索引（rev r1 实测确认）；`entitlement_consumption` 再补一条 `(status,lease)` 在实测中 **0 次使用**，故本刀不建。量级见 §1.4（席测：interview dispatch 66x、report 118x、gauge 四表 FILTER 316x）。

---

## §1 修法（W1 四索引 + W2 gauge 改形 + W3 proof + W4 链头钉）

### 1.1 W1 · 四条 status 前导复合索引（4 条独立并发迁移）

形态统一：`(status, lease_expires_at)`，btree，无部分谓词。理由见 §1.5（12 条部分索引的替代被否决：迁移条数与热表写放大均不合算，且 runner 谓词语法不允许 `IN`/`OR`）。每条迁移按运行器契约**恰一个** `CREATE INDEX CONCURRENTLY IF NOT EXISTS`（`migrate.ts:204`-`:228` 正则只收单语句，谓词只收 `IS NULL`/`= '字面量'`，本形无谓词）。

| # | 表 | 索引名 | 键 | 迁移拟名（EXEC 立项日按链顶顺延；本卷起草日链顶=0219） |
|---|---|---|---|---|
| W1-1 | `interview_job` | `ix_ijob_status_lease` | `(status, lease_expires_at)` | `0220_job_queue_interview_status_lease_index.sql` |
| W1-2 | `quiz_job` | `ix_quizjob_status_lease` | `(status, lease_expires_at)` | `0221_job_queue_quiz_status_lease_index.sql` |
| W1-3 | `diagnosis_job` | `ix_diagnosisjob_status_lease` | `(status, lease_expires_at)` | `0222_job_queue_diagnosis_status_lease_index.sql` |
| W1-4 | `ai_report` | `ix_report_status_lease` | `(status, lease_expires_at)` | `0223_job_queue_report_status_lease_index.sql` |
| ~~W1-5~~ | ~~`entitlement_consumption`~~ | ~~`ix_entitlementconsumption_status_lease`~~ | ~~`(status, lease_expires_at)`~~ | **rev r1 撤销**：`0010:7`-`:9` 已覆盖（席测新索引 0 次使用 ⇒ 纯写放大）。不建、不断言、只在 A8 断言旧索引仍在。 |

每条迁移文件头含稳定内容标记（供 A1 静态发现，不靠文件名/编号）：`-- job-queue-index: <table>`（`<table>` 为四表名之一），并含 `-- @migration-mode concurrent-index`（`migrate.ts:609` 检测）。索引名 ≤63 字节；四名全仓唯一。

**覆盖判定（rev r1 订正·P1-6）**：
- `status='queued'` / `'failed'` / `'quarantined'` 等值 → 走键段**前缀全覆盖**（席测：由 Seq Scan 转 BitmapOr/Index Scan，见 §1.4）。
- `status='running' AND lease_expires_at < clock_timestamp()` → **因 `clock_timestamp()` 是 volatile，lease 列不进 `Index Cond`**：计划呈 `Index Cond: (status = 'running')` + `Filter: (lease_expires_at < clock_timestamp())`。`running` 行天然极少 ⇒ 收益仍达标，但**第二列的索引收益在本形态下不体现**；时间范围型收益（age/清理）留给 R-44/R-51 的查询，后者应改用 `now()`/绑定参数/常量以吃到两列条件。
- **可选修法（EXEC 允许，需登记）**：W2 body 内先取 `v_cutoff timestamptz := clock_timestamp();` 再用 `lease_expires_at < v_cutoff` ⇒ 只保留一个 volatile 求值点，仍不进 Index Cond（`v_cutoff` 非常量）；若要做到两列全用上，必须用 `now()` 或绑定参数——**这会改变事务时间语义**，本刀不建议。断言口径据此改为「`Index Cond` 含 `lease_expires_at`，否则按『不适用』明示登记」（§4 B16-B19/B27-B30）。
- `commerce_outbox` 由 `0211:7`-`:9` 覆盖、`entitlement_consumption` 由 `0010:7`-`:9` 覆盖、`job_route` 由 `0132:11`-`:13` 覆盖 ⇒ **本刀不新增**（A8 断言三者仍在）。

### 1.2 W2 · `gateway_job_gauges()` 改形为逐 status 可索引子查询（1 条事务迁移）

现状 `0042:10`-`:24` 是每表一条 `count(*) FILTER (...)` 三列聚合——单遍全表扫描，`(status, lease_expires_at)` 索引对它无吸引力（PG 不会为多 FILTER 单遍聚合拆索引）。改为每表三个标量子查询（保持签名/列名/列型逐字不变）：

```
CREATE OR REPLACE FUNCTION gateway_job_gauges()
RETURNS TABLE(queue text, queued bigint, running_expired bigint, dead bigint)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public AS $$
BEGIN
  RETURN QUERY
    SELECT 'interview_job'::text,
      (SELECT count(*)::bigint FROM public.interview_job WHERE status='queued'),
      (SELECT count(*)::bigint FROM public.interview_job WHERE status='running' AND lease_expires_at < clock_timestamp()),
      (SELECT count(*)::bigint FROM public.interview_job WHERE status='failed')
    UNION ALL
    SELECT 'report'::text,
      (SELECT count(*)::bigint FROM public.ai_report WHERE status='queued'),
      (SELECT count(*)::bigint FROM public.ai_report WHERE status='running' AND lease_expires_at < clock_timestamp()),
      (SELECT count(*)::bigint FROM public.ai_report WHERE status='quarantined')
    UNION ALL
    SELECT 'quiz_job'::text,
      (SELECT count(*)::bigint FROM public.quiz_job WHERE status='queued'),
      (SELECT count(*)::bigint FROM public.quiz_job WHERE status='running' AND lease_expires_at < clock_timestamp()),
      (SELECT count(*)::bigint FROM public.quiz_job WHERE status='failed')
    UNION ALL
    SELECT 'diagnosis_job'::text,
      (SELECT count(*)::bigint FROM public.diagnosis_job WHERE status='queued'),
      (SELECT count(*)::bigint FROM public.diagnosis_job WHERE status='running' AND lease_expires_at < clock_timestamp()),
      (SELECT count(*)::bigint FROM public.diagnosis_job WHERE status='failed');
END;
$$;

REVOKE ALL ON FUNCTION gateway_job_gauges() FROM PUBLIC, app_role;
GRANT EXECUTE ON FUNCTION gateway_job_gauges() TO app_gateway_role;
```

**语义逐条不变**：四行、`queue` 名与顺序不变、`dead` 谓词逐表不变（report=quarantined，其余=failed，沿 `main.ts:217`-`:219`）。`CREATE OR REPLACE` 保留 owner/ACL，随后 REVOKE/GRANT 与 `0042:45`-`:47` 逐字同形（幂等重发）。**不新增参数、不改返回列、不动 `gateway_cost_budget_snapshot`**（`0042:28` 起）。

**数值等价的隐含前提（rev r1·P2-9）**：本体是**单条** `RETURN QUERY SELECT … UNION ALL …` ⇒ PG 单语句单快照 ⇒ 与旧 FILTER 单遍扫描**同快照**（席2 实测：EXCEPT 双向空 + `pg_get_function_result` 逐字同 + `prosecdef=t`）。**若 EXEC 拆成多条 `RETURN QUERY`，plpgsql 会变成多快照**（每条语句各自取快照），告警口径出现跨行时间不一致 ⇒ §5 Ban 明列。C6 头注须写「单 `RETURN QUERY` 保单一快照」。

**合规声明（rev r1·P2-1·0144:946-949 §8 演进规则）**：该冻结的对象是 0144 §7 立账的 `tf_` 家族（13 名·`db-trigfam-unify.proof.ts:61`-`:64` 精确集合）与 REQUEST 附录 A 的 Tier-2 长尾（40 名）。`gateway_job_gauges` **不属任一集合**：全树仅 `0042:5`-`:26` 一份定义（`grep -n gateway_job_gauges packages/db/migrations/0144_db_trigfam_unify.sql` = 0 行·本席亲跑），不在 `TF_MEMBERS` 13 名清单，不在 Tier-2 名单。故本刀属**首次函数体变更**，非规则所禁的「同名全量重贴」（重贴 = 该函数已在 0144 迁过一遍后再抄一遍）。**不采用 `_v2` 包装**：新增 `tf_gateway_job_gauges` 会破 `db-trigfam-unify.proof.ts:61`-`:64` 的 13 名精确集合门，代价高于收益。C6 头注须逐字登记此理由。

**`dead` 列的诚实边界（rev r1·P2-3）**：`count(*)` 对匹配集是 **O(匹配行数)**，索引只省 I/O 不省计数。席测（400k quarantined）：`count(*) WHERE status='quarantined'` 默认 Parallel Seq Scan 42.2ms / 禁 seqscan 29.7ms / VACUUM 后 Index Only Scan 33.1ms（Heap Fetches 0）；整 gauge 体 45.1ms → 23.5ms，**仅 2.1x**（12 计数里 8 个降到 ~0，4 个 `dead` 仍几十 ms）。且 `alerting-runbook.md:141`/`:169`-`:178` 自登记「四队列终态行零 retention ⇒ `worker_jobs_dead` 单调累积」⇒ **400k 终态行就是上线后稳态**。故本刀**只压 queued/running_expired**，`dead` 列成本归 R-44/R-51；判据不许写成「必须走索引」（见 §4 B31）。

### 1.3 W3 · 证明载体（1 新 proof + 注册）

`packages/db/test/job-queue-index.proof.ts`（新生，44 断言载体），`packages/db/package.json` 加一行 `"prove:job-queue-index": "tsx test/job-queue-index.proof.ts"`；`scripts/run-e2e-isolated.mjs` 沿 `level-policy-migrate:prove` 同形**纯 additive** 注册三处：目标 provenance 条目（`:894` 形）、`isolatedCommand` 分支（`:3357` 形，`['pnpm',['-C','packages/db','prove:job-queue-index']]`）、允许清单（`:2839` 形）。**target id = `job-queue-index:prove`**；不入 `LIVE_E2E_TARGETS`（`:89`）。

证明用真隔离 PG（`pgvector/pgvector:pg16` 固定镜像，沿 `run-e2e-isolated` 现形；`assertIsolatedTestTarget` 门），**不依赖云、不读 `.env*`、零模型外呼**。

**EXPLAIN 执行角色（rev r1·P2-13）**：四表均 `ENABLE/FORCE RLS`，策略 `TO app_role USING (owner_user_id=current_setting('app.principal_user',true) …)`（`0059:92`-`:94`），而 `app_gateway_role` 无表 SELECT（`0040:3`-`:5`/`0042:3`）。若以受 RLS 约束角色 EXPLAIN 且 GUC 未设，计划会走 `ix_ijob_claim`（owner 前导）而**不含新索引** ⇒ B12-B19 直接假红。故本轮 EXPLAIN **一律以 superuser 或 `SET row_security = off` 执行**，并在收据逐行登记「role / `row_security` / `app.principal_user` 三态」。另**登记（非本刀）**：SECURITY DEFINER + FORCE RLS 下若迁移/函数属主角色非 superuser 且非 BYPASSRLS，`gateway_job_gauges()` 会因无适用策略返回全 0——其门禁归 runtime-role 面，本刀不改。

### 1.4 改前/改后量化对比（席测 · 隔离 PG16 · EXEC 必须复测并入收据）

夹具（席测）：各表 50k 终态 + 5 queued + 5 running-expired + 3 dead，`ANALYZE`。EXPLAIN 口径：默认计划，unlogged 隔离容器。

| 查询 | 改前 | 改后 | 倍数 |
|---|---|---|---|
| interview dispatch（`0144:890-896`） | Seq Scan **50,013 行** · 5.27ms · 667 buffers | BitmapOr on `ix_ijob_status_lease` · 0.079ms · 3 buffers | **66x** |
| report dispatch（`0144:907-911`） | Seq Scan · 5.06ms · 569 buffers | BitmapOr · 0.043ms · 5 buffers | **118x** |
| commerce dispatch（`0144:912-920`） | `Index Scan ix_consumption_stale_lease` · 0.014ms | **同一旧索引**（新索引 0 次使用） | 0（**故本刀不建该索引**） |
| gauge 四表 FILTER（`0042:10-24`） | 4×Seq Scan · 18.66ms | 12 InitPlan 全 Index Only Scan · 0.059ms | **316x** |
| 560k 行 interview（禁 index/bitmap 强制） | 29.1ms | 0.069ms | **420x** |
| claim 内两条 `NOT EXISTS`（70k 行） | 2×Seq Scan 70,013 行 · claim 合计 9.48ms | 0.101ms（新索引 serving） | **~94x** |

体积/写代价：索引 **~360kB/表**（PG16 btree dedup）；20k INSERT 102→110ms（**+7.8%**）。
**边界三条**：①上表是**席测本地口径**，非生产实测（§7 非声称）；②`dead` 列收益仅 2.1x，见 §1.2；③HOT 破断见 §1.5。

### 1.5 否决表（落选项诚实留痕）+ 回滚形

| 落选项 | 否决理由 |
|---|---|
| **12 条按 status 的部分索引**（queued / running-expired / 终态 × 四表） | **决定性约束是谓词语法**：`migrate.ts:216`-`:222` 的正则只接受 `WHERE <col> IS NULL` 或 `WHERE <col> = '<字面量>'`，`IN`/`OR` 一律拒收 ⇒「一个部分索引覆盖 queued+running」**在不动 runner 前提下不可表达**（`0010` 那种单值部分索引是既有惯例，但四队列每表需三值 ⇒ 3 条/表 = 12 条 + 迁移条数 + 热表 3 条 btree 维护路径）。复合 `(status, lease)` 4 条即可覆盖等值/范围/多值。**附注（rev r1 更正）**：「部分索引写放大更低」在**心跳面不成立**——`running` 行正是心跳行，部分索引同样破 HOT。 |
| 只加索引、不改 gauge 函数 | gauge 的多 FILTER 单遍聚合不会因索引改变计划（PG 不拆 FILTER），R-50 的 15s 半边等于没修；只做一半会造成「索引在、扫描照旧」的假绿。 |
| gauge 改用 `pg_class.reltuples` 估算/物化计数 | 估算对告警会出假阴性（排队 99 但估算 0），与 HA 告警的 fail-closed 口径冲突；物化计数引入新状态与刷新正确性问题，体量远超 S。 |
| 合并为一条 `multi-statement` 迁移 | 运行器 `migrate.ts:11`-`:24` 明示 CONCURRENTLY 必须非事务；`executionMode` 不可混用。 |
| 在 0219 之前插号 | 违反只前进/链头单调；且 `migrate.proof.ts`/唯一性门按目录序断言。 |
| 改 per-owner claim/sweep 查询 | 它们语义已正确（席测另有隐藏收益，见 §0.3 末段），改查询=产品语义改动，越界。 |
| 做 leader 选举（R-24 本体） | 编排改动，非本刀；底稿 `:290` 明示先走索引/物化计数。 |
| 做 R-44 的 age/duration/attempts 指标 | 独立条目；本刀只提供其索引基座。 |
| 做 R-51 的终态行 retention | 删改语义重刀，HA-7 `:49` 明示越界即废；本刀只索引，不删一行。 |
| 给 `entitlement_consumption` 也补 `(status,lease)` | rev r1 撤销：`0010:7`-`:9` 已覆盖，席测新索引 0 次使用（0.014ms 不变）⇒ 纯写放大。 |

**HOT 破断量化（rev r1·P2-6）**：`interview-jobs.ts:309`-`:317`（`renewInterviewJobLease`，`LEASE_SECONDS=120`，**只更新 `lease_expires_at`**）与 `packages/db/src/commerce/commerce.ts:562`-`:571` 今天都满足 HOT（更新列未被索引、页内有空位）。新增 `(status, lease_expires_at)` 后，心跳**永久失去 HOT 资格**：每拍（job 运行期 ~每 30-60s 一次）产生 **+1 索引元组**并阻止同页 HOT 链复用 ⇒ 堆膨胀与 autovacuum 压力上升；`0213` 的表级 autovacuum 调优（`scale_factor=0.02`/`threshold=200`）只能**缓解**，不能消除。此代价换 66x/118x/316x 的读侧收益，判定为净正，但须在 EXEC 收据登记写放大读数（20k INSERT +7.8% 席测）。

**回滚形（rev r1 订正·P1-8·runner fail-closed 兼容）**：
1. **索引回滚必须成对**：`DELETE FROM schema_migrations WHERE version IN ('0220_…','0221_…','0222_…','0223_…');` 与 `DROP INDEX CONCURRENTLY IF EXISTS public.<name>;` **同一运维动作**执行。理由：`migrate.ts:470`-`:479` 对已记账的 `concurrent-index` 版本**每次重放**都 `assertConcurrentIndexDefinition`，`:336`-`:340` 定义不符抛 `migration_concurrent_index_definition_mismatch`、`indisvalid/indisready/indislive` 任一假抛 `migration_concurrent_index_not_valid`，**重放路径不自愈**（自愈只在 fresh 执行路径 `:487`-`:495`）。只 DROP 不删账 ⇒ 任何一次 `pnpm migrate` 立即红。
2. **gauge 回滚只能走前向迁移**：`0042` 的 checksum 已记账（`:430`-`:455` 的 `migration_drift` 门），**禁止改 0042 重跑**；回滚 = 新写一条前向迁移，`CREATE OR REPLACE` 重放 `0042:5`-`:26` 原体（ACL 不变）。
3. **走前向迁移的连带**：链头钉（C10）与 cap（C12/C13）各 **+1**（文件数 222→223、扫描面 2466→2467），且必须在同一次 EXEC 内同步，不得留半态。
4. 回滚不删表、不删行、不改任何既有索引（`0010`/`0132`/`0211` 三者零触）。

### 1.6 W4 · 链头钉最小同步（既有 proof 的 bounded 更新）

新增 5 条迁移后，`packages/db/test/interview-event-retention.proof.ts:81`-`:83` 的「链头 0219 + 文件数 217」双钉必红。**仅**改该处：链头字符串→EXEC 实际新链头（按本卷拟名=最后一条 `0224_job_gauge_index_friendly`）、`manifest.length === 217`→`222`、注释里的「现最大 0218 顺延·0219 认领」→对应新值。**该文件其余断言零字节零触**（Ban 借机改任何其他断言/放宽任何判据）。**另三处链头钉（i2b/entpay-s2/s3）不修**，见 §0.1-事实钉之二 与 §2。

---

## §2 非范围（全列 · 越界即废）

1. **R-24 leader 选举/对账循环编排**——本刀零触；只通过索引降低重复聚合成本。
2. **R-36 登录锁定残面**（Redis 共享态/验证码/渐进延迟/targeted lockout 策略）——HA-6 R-23 已裁定接受 ×N，本刀零触 `auth.service.ts`/`rate-limit.service.ts`。
3. **R-37 scrypt**——已落地（authz-34 nail），本刀零触。
4. **R-44 新指标**（oldest_queued_age/running_expired_age/attempts 直方图/job_duration/unknown age/quarantined_total）——后刀；本刀只交付索引基座。
5. **R-51 retention/分区/归档**——后刀；本刀不 DELETE/不建分区/不改 autovacuum（`0213` 零触）。
6. **per-owner claim/sweep 查询与既有索引**（`ix_ijob_claim` 等）——查询零改；`0001`/`0007`/`0008`/`0010`/`0049`/`0055`/`0064`/`0132`/`0190`/`0211` 的既有索引零删零改（§4-B32-B34 只作计划非回归守卫）。
7. **`commerce_outbox` / `entitlement_consumption` / `job_semantic_revision` 新索引**——分别由 `0211`/`0010`/`0132` 覆盖，本刀只断言三者仍在（A8）。
8. **`gateway_cost_budget_snapshot`/`gateway_dispatch_owners`/其它网关函数**——零触（本刀只改 `gateway_job_gauges`）。**`sql/24_runtime_observability_gateway.sql:4`-`:24` 镜像滞后已知登记**：本刀只改迁移，`sql/` 侧仍是旧 FILTER 体；当前无门覆盖（`schema-drift-check.mjs:1`-`:6` 只比列 + UNIQUE/PK；`dbhy1.proof.ts:357` 只比对象名录且 sql⊆mig 单向），故不构成本刀红；同步归 `sql/` 镜像同步刀（若在本刀补，cap 与断言面再扩，违反 S 体量）。
9. **告警阈值/runbook/alert.rules**——零触；R-51 的 DLQ 风险登记维持 `alerting-runbook.md:141`/`:169`/`:188` 原样。**`alerting-runbook.md:124` 的下钻锚（指 `0042:5-26`）在本刀后过期**（W2 已改体），本刀不修（改指针归文档刀），已在 §7 登记。
10. **pins/SSOT 翻面**：`haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` 维持；LEDGER/checklist/backlog 只读引用，翻面权归协调方。
11. **云侧/生产库/生产宿主**：零操作；证明只在隔离 PG 容器。
12. **迁移编号的最终值**：以 EXEC 立项日链顶顺延为准；本卷拟名 0220-0224 只作起草基线。
13. **另三处链头钉（`apps/api/test/i2b.proof.ts:153-154` / `entpay-s3.proof.ts:70-71` / `entpay-s2.proof.ts:83-84`）**——**基线已红**（非本刀引入），本刀不修、不顺手改；EXEC 若遇其红按 §8「跨刀红」登记。
14. **privacy checkpoint 擦除派单 feed（`0048:374-386`，5s×N 副本，`privacy_deletion_target` 零索引）**——同类缺陷（全局 status/lease 枚举无索引），但**非队列/gauge 面**，且属删改语义域 ⇒ 归 R-51/隐私刀，本刀零触。
15. **相邻队列已逐条核过、均不纳入**：①`privacy_deletion_target`（见上条，`0048:374-386` 零索引，归隐私刀）；②`online_judge_dispatch`——**本仓树内不存在**（`packages/db/migrations` 与 `apps/worker/src` 对该名零命中·本席亲跑；仅出现在 receipts/归档的无关文本），无此队列可核；③`ai_model_invocation`——**已有** `0037:32`-`:33` 部分索引 `(created_at) WHERE status IN ('dispatching','unknown')`，其派单走 `gateway_model_invocation_owners`/`_backlog` 专用口、谓词是 `olderThanMs` 时间界，且不在六 work 臂内 ⇒ 属 R-44 观测域。三者均**不在本刀索引清单**，理由如上逐条。
16. **`dead` 列成本与终态集增长**——本刀只压 queued/running_expired；终态 40 万行时该列 ~30ms/拍/副本（席测），归 R-44/R-51。

---

## §3 逐条改动清单（EXEC 落码对账表 · rev r1 = 12 条有效登记）

| # | 码面 | 现状（亲读） → 目标 |
|---|---|---|
| C1 | `packages/db/migrations/0220_job_queue_interview_status_lease_index.sql`（新增） | 不存在 → 头注 `-- job-queue-index: interview_job` + **独占整行**的 `@migration-mode concurrent-index` + 单语句 `CREATE INDEX CONCURRENTLY IF NOT EXISTS ix_ijob_status_lease ON public.interview_job (status, lease_expires_at);` |
| C2 | `0221_job_queue_quiz_status_lease_index.sql`（新增） | 同形 → `ix_quizjob_status_lease ON public.quiz_job (status, lease_expires_at)` |
| C3 | `0222_job_queue_diagnosis_status_lease_index.sql`（新增） | 同形 → `ix_diagnosisjob_status_lease ON public.diagnosis_job (status, lease_expires_at)` |
| C4 | `0223_job_queue_report_status_lease_index.sql`（新增） | 同形 → `ix_report_status_lease ON public.ai_report (status, lease_expires_at)` |
| ~~C5~~ | ~~`0224_entitlement_consumption_status_lease_index.sql`~~ | **rev r1 撤销**（`0010:7`-`:9` 已覆盖·席测 0 次使用）⇒ 本行不计入改动集。 |
| C6 | `0224_job_gauge_index_friendly.sql`（新增·事务迁移） | 不存在 → W2 的 `CREATE OR REPLACE FUNCTION gateway_job_gauges()` + REVOKE/GRANT（与 `0042:45`-`:48` 同形）；**唯一改函数体的迁移**；头注**严禁**含 `-- job-queue-index:` 标记（否则 A1 数出 5 个）；须登记两条理由：①§8 演进规则合规（首次体变更·非重贴·不引入 `tf_` 名）②单 `RETURN QUERY` 保单一快照。 |
| C7 | `packages/db/test/job-queue-index.proof.ts`（新增） | 不存在 → §4 的 **44 断言**载体 |
| C8 | `packages/db/package.json` | `:25`/`:30`/`:41`/`:65` 形 → additive 一行 `"prove:job-queue-index": "tsx test/job-queue-index.proof.ts"`；既有脚本零删改 |
| C9 | `scripts/run-e2e-isolated.mjs` | `:894`/`:3357`/`:2839` 形 → additive 三处（provenance 条目、命令分支、允许清单）；**target id = `job-queue-index:prove`**；既有目标零删改；不入 `LIVE_E2E_TARGETS`（`:89`） |
| C10 | `packages/db/test/interview-event-retention.proof.ts` | `:81`-`:83` 链头 0219/**217** → 新链头 `0224_job_gauge_index_friendly`/**222**；**仅此两断言与同行注释数字**，其余零触 |
| C11 | `ai-docs/delivery/receipts/ha1/*.log`（新增·真跑收据） | 不存在 → EXIT 读数与 PIN 行；**必须落 `.log`**（`.log` ∉ `public-text-policy.mjs:39` `TEXT_EXTENSIONS` ⇒ 不入扫描面）；**Ban 落 `.json`**（∈ 扩展名 ⇒ 直接 +1 撞 cap） |
| C12 | `scripts/ai-docs/public-text-policy.mjs` | `:282` `MAX_FILES = 2_461` → **2_466**；并在 `:280` 链区（`CAP-SANCTION-2461` 之后）追加 `CAP-SANCTION-2466` 注记，逐项列清 **union 算式**（2460 起草届扫 + 5 迁移 sql + 1 proof ts = 2466 恰等零多放）与**四联动点**；`MANAGED_ROOTS`/`TEXT_EXTENSIONS`/扫描面三处**零改**（语义不变强度不减） |
| C13 | `scripts/ai-docs/public-text-policy.proof.mjs` | 四处联动：`:452` `for (let i = 0; i < 2_466; i += 1)` · `:459` `scannedFiles, 2_466` · `:474` `'ai-docs/f-2466.md'` · `:477` `${FILE_LIMIT}:2467`；并在链区补 `CAP-SANCTION-2466` 史录一行（沿 `:450` 同形） |

**EXEC 改动集口径（rev r1 重算）**：**12 条有效登记**（C1-C4 + C6 + C7-C13；~~C5~~ 撤销不计）。其中**新增受管文件 6 件**（5 条迁移 `.sql` + 1 个 proof `.ts`），**修改既有 tracked 5 件**（`package.json`/`run-e2e-isolated.mjs`/`interview-event-retention.proof.ts`/两个 policy 脚本），**收据 `*.log` 若非 tracked 不入面**。**多任何未登记 tracked 路径即停**。

**cap 终态算式（P0-1 明写）**：起草届树 scanned **2460**（cap 2461·余 1）→ EXEC 新增受管 6 件 → **2466**；cap 步进 `2461 → 2466`（恰等零多放）。若回滚走前向迁移（§1.5 第 3 条）则各 **+1**（迁移 222→223、扫描面 2466→2467，cap 须同步 2467）。收据落 `.json` 会 `+1` ⇒ **Ban**（见 C11）。

---

## §4 prove 判据（**44 断言** = 静态 9 + 动态 35 · 全在隔离 PG · Ban retry-to-green）

### A. 静态确定性（9 断言 · 零 DB）

- **A1** 按内容标记 `-- job-queue-index: <table>` 在 `packages/db/migrations/*.sql` 中恰发现 **4** 个文件，四表各恰一（不依赖文件名/编号）；**C6 不得含该标记**（否则数出 5 个）。
- **A2** 四文件各含 **独占整行**的 `-- @migration-mode concurrent-index`（与 `migrate.ts:609` 正则 `^\s*--\s*@migration-mode\s+concurrent-index\s*$` 同口径；行尾加注释即失效，断言按该正则原文匹配）。
- **A3** 四文件剥注释后各恰 **一个**语句、以 `;` 结尾，且含 `CREATE INDEX CONCURRENTLY IF NOT EXISTS`（`migrate.ts:204`-`:228` 正则同口径）。
- **A4** 四语句键列逐字 `(status, lease_expires_at)`（列序/大小写/空格归一后全等），无 `WHERE` 谓词。
- **A5** 四索引名逐字 `ix_ijob_status_lease`/`ix_quizjob_status_lease`/`ix_diagnosisjob_status_lease`/`ix_report_status_lease`，全仓唯一，长度 ≤63。
- **A6** 负断言（**rev r1 扩形**）：除四新文件外，全仓迁移对**四目标表**无 ①`ON <table> (status`／`ON <table>(status` 前导形，且无 ②**隐式 status 谓词**形 `ON <table> (<col>) WHERE status\s*=\s*'<字面量>'`。`entitlement_consumption`（`0010`）/`commerce_outbox`（`0211`）/`job_semantic_revision`（`0132`）的既有命中是**预期**，白名单放行后由 A8 正向断言。
- **A7** additive-only：四新文件不含 `DROP`/`ALTER`/`INSERT`/`UPDATE`/`DELETE` token；C6 只含 `CREATE OR REPLACE FUNCTION` + `REVOKE`/`GRANT`，不含 `DROP FUNCTION`。
- **A8** 既有索引在树且未被新文件触碰（**7 项**）：`ix_report_claimable`（`0001:239`）、`ix_ijob_claim`（`0001:268`）、`ix_quizjob_claim`（`0007:31`）、`ix_diagnosisjob_claim`（`0008:32`）、`ix_consumption_stale_lease`（`0010:7`-`:9`）、`ix_outbox_unsettled`（`0211:7`-`:9`）、`ix_job_semantic_revision_route_pending`（`0132:11`-`:13`）。
- **A9** C6 结构唯一性：全树 `gateway_job_gauges` 定义点 = `0042` + C6（2 处·无 `tf_` 兄弟函数），且 C6 体内含**恰一条** `RETURN QUERY`（保单一快照）。

### B. 动态（35 断言 · 隔离 PG + 真迁移链 + 种子数据）

**夹具**：四表各种子 `done` ≥ 50,000 行（模拟历史），`queued` 恰 5、`running` 且 `lease_expires_at = now() - interval '1 hour'` 恰 5、终态 `failed`（report 为 `quarantined`）恰 3；**控制组** `entitlement_consumption` 种子 `reserved` + 过期租约恰 5、`confirmed` ≥ 50,000（只用于 B11 前置与 A8 复核，不建新索引）；`interview_job` 另造 ≥ 20k 行**同 `interview_id` 族**（供 B32-B34 的 `NOT EXISTS` 面）。种子后 `ANALYZE` 四表。唯一约束按表体满足（`quiz_id`/`diagnosis_id`/`interview_id`/`idempotency_key` 逐行唯一，`interview_id` 族按夹具脚本显式构造）。

| # | 断言 | 判据 |
|---|---|---|
| B1-B4 | 四索引存在 | `pg_indexes` 按名命中，`tablename` 逐表对应 |
| B5 | 全部有效 | 四索引 `pg_index.indisvalid = true`（CONCURRENTLY 失败会留 invalid，必须抓） |
| B6 | 全部就绪 | 四索引 `indisready = true` |
| B7-B10 | 定义逐字 | `pg_get_indexdef` 含 `(status, lease_expires_at)` 且**无** `WHERE`（四表各 1） |
| B11 | 种子前置 | 四表计数与夹具合同全等 + `entitlement_consumption` 控制组计数全等（防种子失败造成空表假绿） |
| B12-B15 | 四条 dispatch 枚举默认计划 | `EXPLAIN (FORMAT JSON)` 对应 `0144:890-911` 四查询（interview/quiz/diagnosis/report）：计划**含对应新索引**（按索引名逐条匹配，禁「含任一索引」），且对目标表**无** `Seq Scan`（四表各 1） |
| B16-B19 | running-expired 单条件默认计划 | `WHERE status='running' AND lease_expires_at < now()`（rev r1 用 `now()` 而非 `clock_timestamp()` 作量测口径）四表各 1：**`Index Cond` 文本须含 `lease_expires_at`**；若 W2/枚举体维持 `clock_timestamp()` 形态导致该列不进 Index Cond，则该条按「**不适用**」明示登记（打印 `Index Cond` 原文），**不得静默算绿** |
| B20 | 适用性硬门 | **单 client + 同一事务**：`BEGIN; SET LOCAL enable_seqscan = off; <EXPLAIN>; ROLLBACK;`；每条 EXPLAIN 前**自检** `current_setting('enable_seqscan') = 'off'`；四查询全部走对应新索引，且**该计划与默认计划不同**或 **`Index Cond` 含两列**（二者取一，防在默认计划上量测） |
| B21 | gauge 数值等价 | `SELECT * FROM gateway_job_gauges()` 四行三列与 `0042:10`-`:24` 原 FILTER 查询逐值全等（种子计数）；**实现约束**：live 调用为单 `RETURN QUERY`（单快照），与旧体同快照对齐，收据标明取数语句 |
| B22 | gauge 元数据/ACL | `prosecdef = true`；owner 与 `0042` 时点相同（比对对象=`0042` 应用后 `pg_proc.proowner` 快照）；`has_function_privilege('app_gateway_role','gateway_job_gauges()','EXECUTE') = true`；**返回列名/类型取数方式钉死**：`pg_get_function_result('gateway_job_gauges()'::regprocedure)` 全串逐字等于 `TABLE(queue text, queued bigint, running_expired bigint, dead bigint)`（辅以 `proallargtypes + format_type` 双轨） |
| B23-B26 | gauge queued 子查询默认计划 | 四表 `count(*) WHERE status='queued'` 各 1：计划含对应新索引（或 index-only scan） |
| B27-B30 | gauge running-expired 子查询默认计划 | 四表 `count(*) WHERE status='running' AND lease < now()` 各 1：同 B16-B19 的 `Index Cond` 判据与「不适用」登记规则 |
| B31 | gauge 终态子查询：可用性 + 上限 | 事务内 `enable_seqscan=off`（含自检）下四表 `failed`/`quarantined` 子查询全部走对应新索引**或** index-only scan；且**该列耗时不超过 §1.4 对比表所列上限**（终态 40 万行时 ~30ms/拍/副本为登记基线）——**判据不是「必须走索引」**（`count(*)` 对匹配集是 O(匹配行数)，见 §1.2） |
| B32-B34 | per-owner 计划非回归（3 条） | ①claim 全语句（`interview-jobs.ts:154-181` 含两条 `NOT EXISTS`）默认计划**无** `interview_job` 的 `Seq Scan`；②sweep（`:329-345`）仍走索引 + owner `Filter`（非 Seq Scan）；③live-count 守卫（`:175-180`）仍走索引；三条各打印计划关键行入收据 |
| B35 | 索引真被使用的行为证据 | 记录 `pg_stat_user_indexes.idx_scan` 初值 → 执行 B12-B15 四查询 → 复读：**四索引 `idx_scan` 均增长**（防 planner 选择与真实执行脱节；与 B12-B15 分工在收据标明） |

**口径与诚实边界**：
- B12-B19/B23-B31 的 EXPLAIN 是**子句体计划**（与 `rag03-hnsw-completeness.proof.ts:190`-`:280` 的 substituted-body 同形），不等于 live 函数内层计划；B21 用 live 调用证**数值**等价，两者分工在收据中逐行标明。
- **EXPLAIN 角色口径**：以 superuser 或 `SET row_security = off` 执行；收据逐行登记 `current_user` / `row_security` / `app.principal_user` 三态（见 §1.3；受 RLS 约束角色会走 owner 前导索引 ⇒ 假红）。
- 若某默认计划在种子规模下仍选 `Seq Scan`（例如 `failed` 行数占比极高），**不得改断言迁就**：该条按机制红上报，登记为残面并回 REQUEST 重裁索引形态；`enable_seqscan=off` 的适用性条仍须绿（用来区分「索引不可用」与「规划器不选」）。
- `main.ts:226` 原注释「小表全扫可接受」在本刀后应被证明为历史口径；不修改该注释（产品码零触），只在 proof 输出 PIN 行。
- **诚实计数（P2-16）**：44 = **9 静态** + **12 元数据**（B1-B11 + B22）+ **21 EXPLAIN 形态**（B12-B20 + B23-B31 + B32-B34）+ **2 真行为**（B21 数值等价、B35 `idx_scan` 增量）。B1-B11 多为运行器已保证的恒真，价值在**防回归/防半态**而非新发现，此点如实入卷。

**EXEC 主门（§2 验收 · 一律经 runner）**：
1. `node scripts/run-e2e-isolated.mjs job-queue-index:prove` **EXIT=0**，44 断言全 PASS，PIN 行入 `ai-docs/delivery/receipts/ha1/*.log`（**禁**直跑 `pnpm -C packages/db prove:job-queue-index`：绕开 runner 且 `assertIsolatedTestTarget` 必抛）。
2. `node scripts/run-e2e-isolated.mjs migrate:prove` **EXIT=0**（真链全量 apply，含 5 新迁移）。
3. `migrate:prove` 的 concurrent-index 面零回归（定义/有效性/谓词/特权四类断言）。
4. `node scripts/run-e2e-isolated.mjs interview-event-retention:prove:raw` **EXIT=0**（C10 同步后链头/文件数复绿）。
5. `node scripts/run-e2e-isolated.mjs runtime-role:prove:raw` **EXIT=0**（`gateway_job_gauges` 四行/列名/ACL 不回归）。
6. `node scripts/schema-drift-check.mjs`（`drift:prove`）零漂移；`node scripts/check-migration-version-uniqueness.mjs` **files=222·violations=0**。
7. `node scripts/ai-docs/check-docs.mjs` **EXIT=0**（**cap 已 sanction 后**：C12/C13 生效、scanned 2466 ≤ 2466）；`node scripts/ai-docs/public-text-policy.proof.mjs` **12/12 EXIT=0**；改动集 markers 零命中。
8. 若任一触 DB 的门未在 runner 允许清单登记 → **停**（禁直连开发库/禁绕隔离门）。

---

## §5 Ban

Ban push/force-push（git 写只本 worktree commit）· Ban 动主仓 · Ban self-approve（pre-exec 双审两独立外席·alone≠dual）· Ban retry-to-green（红即停·attempts 全账·Ban 改断言迁就）· **Ban 让 EXPLAIN 假绿**（不得用 `enable_seqscan=off` 冒充默认计划；两口径必须分开报；`SET LOCAL` 必须在同一事务内且带 `current_setting` 自检）· **Ban 把 substituted-body 计划写成 live 函数内层计划** · **Ban 把 gauge 体拆成多条 `RETURN QUERY`**（plpgsql 多语句=多快照，破坏与旧 FILTER 的数值等价前提）· **Ban 只做索引就宣称 gauge 已修 / 只改 gauge 就宣称 R-50 收口** · **Ban 借 C10 同步改 `interview-event-retention.proof.ts` 任何其他断言** · **Ban 顺手改 i2b/entpay-s2/s3 的三处链头钉（基线已红·非本刀）** · **Ban 在迁移里混入多语句 CONCURRENTLY 或 `WHERE` 谓词（运行器正则外）** · **Ban 让 `@migration-mode concurrent-index` 与注释同行**（须独占整行）· Ban 改 per-owner claim/sweep 查询或既有 owner 前导索引 · Ban 做 R-24 选举/R-44 指标/R-51 删除（各自后刀）· Ban 新增 `commerce_outbox`/`entitlement_consumption`/`job_semantic_revision` 索引（`0211`/`0010`/`0132` 已覆盖）· Ban 改 `gateway_dispatch_owners`/`gateway_cost_budget_snapshot`/告警阈值/runbook · Ban 生产库/云侧/宿主操作 · Ban secrets 入树入据 · **Ban 收据落 `.json`**（撞 cap 面）· **Ban 只 DROP INDEX 不删账**（runner 重放必红·见 §1.5）· Ban 翻 pins · Ban 借本刀宣 HA/HA 簇收口/R-50 已关（§7）· **Ban 在代码注释写任务号/刀号**（迁移头注只写语义标记 `job-queue-index: <table>` 与登记用语义理由）。

---

## §6 pins（十一值照抄 `harness/5e-cleanup-sweep-2-REQUEST.md` 经 ha-1..ha-6 同款 · EXEC/审查不得改口 · 本刀零翻转）

`haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` · `coveredCount=8` · `ms3EqualsR4Closed=false` · `PG-retained`（业务+LangGraph PostgresSaver+pgvector；禁 MySQL/Qdrant 业务切流叙事）· 公开 `DELETE /privacy/interview-data/:id` = 503 · `g7SuiteGreen=false` · `r1Closed=false` · 脚注 `actualSpendCny=null`（本刀零模型外呼·零消耗·est live=0）。

**本卷附加钉**：R-50 判定=底稿 `refactor-backlog.md:93`/`:494`-`:500` 原文 · 四索引键序固定 `(status, lease_expires_at)` · gauge 返回四行顺序固定 · `entitlement_consumption`/`commerce_outbox`/`job_semantic_revision` 三者走既有索引不新增 · 链头钉同步只准动 C10 两断言 · 计划口径=substituted-body 与 live 数值分工 + `Index Cond` 文本判据 · 隔离镜像固定 `pgvector/pgvector:pg16` · EXPLAIN 以 superuser 或 `row_security=off` · cap 步进 `2461→2466` 恰等零多放 · 本刀不宣称 HA/簇收口。

---

## §7 Non-claims

本刀 ≠ HA ≠ `haStatus` 翻转 ≠ HA 簇收口 ≠ R-50 全量闭环之外的任何条目（R-24/R-36/R-44/R-51 各自仍开/半开）≠ R-44 指标已补（本刀只给索引基座）≠ R-51 保留/分区已做（本刀一行不删）≠ R-24 leader 选举已做 ≠ 生产容量/负载绿（EXPLAIN 计划 ≠ 生产 SLO）≠ **索引在百万级生产表上的真实收益（§1.4 为席测 5 万行本地口径，非生产实测）** ≠ **`dead` 列已优化（仍为 O(终态集)，终态 40 万行时 ~30ms/拍/副本；归 R-44/R-51）** ≠ **`count(*)` 复杂度下降（索引只省 I/O 不省计数）** ≠ **心跳写路径无代价（新增 `(status,lease_expires_at)` 使 `interview-jobs.ts:309-317`/`packages/db/src/commerce/commerce.ts:562-571` 的 HOT 永久失效，写放大 +7.8% 席测）** ≠ gauge 指标语义/告警阈值变更（数值等价，阈值零触）≠ **gauge 的 cutoff 瞬时语义逐位不变（旧=逐行 volatile 求值，新=每子查询一次；对告警口径无实质影响，但非逐位同）** ≠ **runbook 下钻锚仍指向 live 定义（`alerting-runbook.md:124` 指 `0042:5-26`，本刀后过期，归文档刀）** ≠ **`sql/24` 镜像已同步（仍滞后，无门覆盖，归镜像同步刀）** ≠ **链头钉全绿（i2b/entpay-s2/s3 三处基线已红，非本刀）** ≠ 已跑全量套件（`g7SuiteGreen=false` 维持）· prove EXIT=0 ≠ DONE（`claimDone=false` · 完成判定走双审+nail）· `est live=0`。

---

## §8 STOP（开工三条款 + 停止条件五类）

**STOP · `draft:awaiting_pre_exec_dual`（三处钉：Status 行 + 本节 + 卷尾 · 同值）。** 开工三条款（未履行不得 EXEC）：① **pre-exec 双审两独立外席 BOTH PASS 落卷**（含 W1 复合索引 vs 12 条部分索引的形态裁决、W2 gauge 改形的数值等价面、cap 步进授权）；② **协调方明示 EXEC 授权**（LEDGER:136 HA 簇解锁亲证 · 批1 收口状态确认 · **cap 2461→2466 步进授权**）；③ **§0 全量对届时 tip 重 pin**——四表索引普查/**`0144:883`-`:949` 六臂与 §8 冻结段**/0042 谓词/链头 0219/文件数 217/既有 proof 钉任一漂移且结论受疑即回炉。

- **现场漂移**：`origin/main` 届 tip 的四表索引清单、**`0144:883`-`:949` 六臂谓词与 §8 演进冻结段**（`0132` 仅史录）、`0042` gauge 列语义、`interview-event-retention.proof.ts:81`-`:83` 链头钉、`migrate.ts:204-228` 正则 / `:241-243` 超时 / `:470-479` 重放断言任一变化 → 停·重 pin；拟名 0220-0224 与届链顶撞号 → 按链顶顺延并同步 C10。
- **机制不满足**：若**四目标表**已出现 status 前导（A6 红）或隐式 status 谓词索引（`ON <t> (<col>) WHERE status='<lit>'`）→ 停手上报，不重复建、不顺手补。**注意保险丝的正确触发面**：`entitlement_consumption`（`0010`）/`commerce_outbox`（`0211`）/`job_semantic_revision`（`0132`）已有匹配形态是**预期命中**，不得据其停手，也不得据此给它们再建索引；仅当四目标表出现命中才停。
- **计划红分诊**：B12-B15/B23-B30 默认计划仍 `Seq Scan` → 先分**仪器红**（种子不足/未 ANALYZE/统计过期/EXPLAIN 角色受 RLS 约束）与**机制红**（索引形态不适用）；仪器红只许修夹具并重跑（attempts 入账），机制红即停手上报（Ban 改断言迁就、Ban 用 `enable_seqscan=off` 冒充默认计划）。B16-B19/B27-B30 若因 `clock_timestamp()` volatile 而 `Index Cond` 不含 lease 列 → 按「不适用」登记续行，**不判红**。
- **回滚/时长硬门**：任一条 `CREATE INDEX CONCURRENTLY` 超过 `MIGRATION_CONCURRENT_INDEX_TIMEOUT_MS`（`migrate.ts:241-243` 默认 300s、上限 900s）→ 以 env 上调并在收据登记；上调后仍超 → 停手上报。回滚必须按 §1.5 成对执行（`DELETE FROM schema_migrations` + `DROP INDEX CONCURRENTLY` 同一动作）；**只 DROP 不删账**或**改 0042 重放** → 立即停（前者使后续任何 `pnpm migrate` 红，后者被 `:430-455` checksum 门拦）。
- **跨刀红**：C10 同步后 `interview-event-retention:prove:raw` 仍红（非链头/计数原因）→ 停·stash 对照亲证基线，不得借机改该 proof 其他断言。**`i2b.proof.ts:153-154` / `entpay-s3.proof.ts:70-71` / `entpay-s2.proof.ts:83-84` 三处链头钉若在 EXEC 期红，按「基线已红」登记，不计本刀新增红、不得顺手改**（§0.1-事实钉之二）。
- **越界需要**：修法诉求超出 §3 的 12 条有效登记（要做 leader 选举/新指标/删除保留/改告警/改 per-owner 查询/给已覆盖表再建索引）→ 停·另刀或协调方裁决。
- **验收红不可修**：`docs:check` 扫描数 **> sanctioned cap（2466）** / PTP 红 / migrate:prove 红且根因不在本刀交付面 → 停·stash 对照亲证基线·如实登记·Ban 借机修。**注意**：C12/C13 未生效前撞 cap 是**预期红**（rev r0 的 P0-1），必须先落 cap 步进再跑门 7，不得把 cap 红当机制红停整刀。

---

## §9 状态

**`draft:awaiting_pre_exec_dual`**（rev r1 · 2026-10-30 修订落卷即停 · 前状态 rev r0 `draft:awaiting_pre_exec_dual` 双审 FAIL · 本 rev 逐条处置 P0×2 + P1×8 + P2×16 后重投 pre-exec 双审 · Ban self-approve · alone≠dual · ⛔push ⛔动主仓 · est live=0 · markers=0 · **起草面 cap 零步进（2460·cap 2461·余 1）**；**EXEC 面 cap 必步进 2461→2466**（C12/C13·已登记）· 收据/EXEC 记录待后续席追加，本节 append-only 不改既有字）。

**rev r1 落法汇总**：迁移数 **6→5**（删 W1-5/C5）· 断言总数 **43→44**（删该表 4 条：B1-B5/B8-B12/B14-B18/B19-B23 各 −1；新增 5 条：A9 + B32-B34 + B35）· 链头 0219→**0224**、文件数 217→**222** · cap 2461→**2466** · 三门读数：docs:check **EXIT=0 scanned 2460** / PTP **12/12 EXIT=0** / markers **0**。

---

*HA-1 REQUEST **rev r1** · 2026-10-30 修订落卷 · 认领=R-50（底稿 `refactor-backlog.md:93`/`:494`-`:500` 原文；本仓实登记=`product-campaign-LEDGER.md:136` + `ha-6-companion-REQUEST.md:106`；north-star-ha.md 对六条 R 号零命中已勘误）· 六条判定=R-37 已落地剔除 / R-36 半做（残面归 HA-6 R-23 接受 ×N）/ R-24 未做（编排改动后置）/ R-44 半做（仅失败 counter）/ R-51 半做（outbox+interview_event+autovacuum 已落，job 终态未落）/ **R-50 选中**（R-24/R-44/R-51 共同硬前置）· 修法=**四条** `(status, lease_expires_at)` 并发索引 + `gateway_job_gauges()` 逐 status 子查询改形 + **44** 断言隔离 proof + 链头钉两行同步 + cap 步进四联动 · 全锚 @`99e4e3f38` 亲读亲算 · pins 十一值零翻转 · est live=0 · markers=0 · ⛔push ⛔动主仓 · Ban self-approve · alone≠dual · Dual PASS ≠ 开工 · proof EXIT=0 ≠ DONE · STOP=`draft:awaiting_pre_exec_dual`*

*卫生声明：markers=0 = 本卷改动集五类标记词与行首冲突标记 grep 零命中——词面由门命令运行时组装、卷内不复抄（防自匹配；沿 ha-3/ha-6 同款）。*
