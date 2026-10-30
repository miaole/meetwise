# HA-1 REQUEST — 队列 status/lease 前导索引 + 队列 gauge 聚合改形（R-50 · HA 簇配套 · EXEC REQUEST 起草 · docs-only 零码动）

**Status**: **`draft:awaiting_pre_exec_dual`**（起草落卷即停 · 本卷恰 1 新 `.md` · 零产品码零迁移零依赖 · pre-exec 双审 BOTH PASS + 协调方明示 EXEC 授权前不得落码 · alone≠dual · Ban self-approve · est live=0 · markers=0 · ⛔push ⛔动主仓）

**席位**：meetwise HA 簇配套起草席（docs-only 起草 · 协调方授权 · 新建 worktree `meetwise-ha1` · 分支 `line/ha1-draft`）。
**基线**：`origin/main` @ **`99e4e3f385d7f992a88aad4b3e5f31d1e77ba3d3`**（short `99e4e3f38` · 2026-10-30 · 本卷全部 file:line 与 blob 均对 `HEAD=99e4e3f38` 亲读/`git rev-parse` 亲算）。本树落卷前 `node scripts/ai-docs/check-docs.mjs` 亲跑 **EXIT=0 · scanned 2459**（cap `MAX_FILES=2_461` · `scripts/ai-docs/public-text-policy.mjs:282`）；本卷落卷后 **EXIT=0 · scanned 2460**（净增 1 · 余 1）。
**审计项（不自建 SSOT 行，翻面权归协调方）**：①`ai-docs/delivery/harness/product-campaign-LEDGER.md:136`「R-20/R-21/R-23/R-24/R-36/R-37/R-44/R-50/R-51 | 连接预算/PgBouncer/多实例状态/队列指标/登录锁定/scrypt/索引/生命周期 | HA 配套 | 中」；②`ai-docs/delivery/harness/ha-6-companion-REQUEST.md:106`「余六件——后刀」；③审计底稿 `~/Documents/Meetwise学习与审查/03-原始清单与评审/refactor-backlog.md:494-500` **R-50 原文**（本文不自建条目号，逐字引用底稿）。
**必读清单（EXEC 立项前逐件亲读·显式路径）**：`AGENTS.md` → `ai-docs/delivery/north-star-ha.md`（`:24` 状态钉 · `:46` 硬约束 · `:55` G7 · `:67` 本地一律 NOT_HA）→ `ai-docs/delivery/harness/product-campaign-LEDGER.md:136` → `ai-docs/delivery/harness/ha-6-companion-REQUEST.md:5`/`:106` → 机制源 `packages/db/migrations/0132_job_route_classify_worker_dispatch.sql`（`:15`-`:59` `gateway_dispatch_owners` 五分支）· `packages/db/migrations/0042_runtime_observability_gateway.sql`（`:5`-`:26` gauge 四表 FILTER 聚合 · `:45`-`:47` ACL）· `packages/db/src/jobs/gateway-dispatch.ts`（`:22`-`:26` owner 枚举 seam · `:58`-`:67` gauge seam）· `apps/worker/src/main.ts`（`:217`-`:241` gauge 数据源与刷新 · `:510` 对账间隔 5s · `:660`-`:667` 四消费循环 · `:773`-`:776` gauge 循环 15s）→ 索引面 `packages/db/migrations/0001_baseline.sql`（`:109`-`:122` entitlement_consumption · `:224`-`:239` ai_report · `:253`-`:268` interview_job）· `0007_resume_quiz.sql:17`-`31` · `0008_resume_diagnosis.sql:18`-`32` → 迁移运行器 `packages/db/src/migrate.ts`（`:11`-`:24` 三执行模式 · `:204`-`:228` concurrent-index 单语句正则 · `:609` 注记检测）→ 并发/部分索引先例 `0198_trace_created_at_index.sql:1`-`:9` · `0211_outbox_unsettled_partial.sql:1`-`:9` · `0219_interview_event_retention_purge.sql:45`-`:47` → 回归面 `packages/db/test/interview-event-retention.proof.ts:76`-`:83`（链头 0219/文件数 217 钉）· `packages/db/test/runtime-role.proof.ts:108`-`:113`（gauge 消费断言）· `packages/db/test/migrate.proof.ts`（concurrent-index/特权面）· `packages/ai-runtime/src/metrics.ts:67`-`:77`/`:153`-`:156` → 告警面 `ai-docs/observability/alerting-runbook.md:141`/`:169`/`:188` → 注册面 `scripts/run-e2e-isolated.mjs`（`level-policy-migrate:prove` 同形：`:894` 目标表 · `:3357` 命令映射 · `:2839` 允许清单）· `packages/db/package.json:25`/`:30`。
**Honesty**：六条候选的判定全部对 `99e4e3f38` 实树亲读（§认领核对），未凭记忆；本刀只在六条中取 **R-50**，其余五条只作判定与剔除记录（§2 非范围）。零实跑零 prove（本刀=REQUEST 起草；prove 判据见 §4 待 EXEC 兑现）；`est live=0`（动态面全在隔离 PG 容器，零生产操作、零真实流量、零模型外呼）。

---

## 认领核对 · 六条逐条判定（对 `99e4e3f38` 亲读 · file:line 逐字）

> 权威定义取自审计底稿 `.../refactor-backlog.md`（外部底稿，非本仓 tracked）；LEDGER/ha-6 只作派单映射。**本仓 north-star-ha.md 对六条 R 号零命中**（`grep -n "R-24\|R-36\|R-37\|R-44\|R-50\|R-51" ai-docs/delivery/north-star-ha.md` = 0 行；本席亲跑）——认领来源按实际登记处订正，见 §0.1-勘误①。

| 项 | 底稿原文（逐字） | 底稿锚 | 当前实树证据（`99e4e3f38` 亲读） | 判定 | 处置 |
|---|---|---|---|---|---|
| **R-24** | 「对账器/清理循环在每个 worker 副本上同时运行，无 leader 选举；安全性依赖行锁/SKIP LOCKED，但会重复做全表聚合」（P2·S） | `refactor-backlog.md:67`/`:284`-`:290` | `apps/worker/src/main.ts:660`-`:667` 四消费循环逐副本起；`:773`-`:776` gauge 循环逐副本 15s；`0132:23`-`:44` 全局 owner 枚举逐副本 5s；全仓无 leader 选举实现（底稿证据面，本席复核 loop 起法在树）。HA-7 非声称 `receipts/archive/2026-09-batch23/harness/ha-7-queue-metrics-REQUEST.md:94`「≠ R-24 全量闭环」 | **未做**（HA-7 只补观测，未动选举/聚合成本） | **不选**：leader 选举=编排改动，且底稿 `:290` 自己的建议是「保持无 leader，把 gauge 与枚举改走部分索引/物化计数」——即先由 R-50 吃掉重复聚合的成本，本刀即该前置。 |
| **R-36** | 「登录限流按 email 单维度且在进程内：攻击者可任意锁定他人账号，也无法抵御分布式撞库」（P1·S） | `refactor-backlog.md:79`/`:381`-`:388` | 双/三维已落：`apps/api/src/modules/auth/auth.service.ts:88`-`:93` 三桶 `login:${email}`→`login:ip:*`→`login:global`；`packages/db/src`/worker 无 Redis 共享态。**targeted lockout 仍可**（per-email 桶 5/0.2 仍可被耗尽）；共享态按 HA-6 R-23 裁定「接受 ×N 稀释」（`ha-6-companion-REQUEST.md:98` W2） | **半做**（维度已落；targeted lockout + 共享态未解，后者已裁定接受） | **不选**：剩余面=Redis/验证码/渐进延迟，属云侧或产品决策，非本刀本地结构补强；且 HA-6 已对该残面作接受裁定，翻案越界。 |
| **R-37** | 「密码哈希使用同步 scryptSync，会阻塞事件循环；叠加登录路径上密码长度上限可能不生效」（P1·S） | `refactor-backlog.md:80`/`:389`-`:396` | **已落**：`packages/domain/src/auth.ts:5`-`:21` `promisify(scryptCallback)` 异步三参形；`ai-docs/delivery/harness/authz-34-residual-REQUEST.md:3` Status `closed`（nail merge `ed82b873`，对本席 HEAD `git merge-base --is-ancestor` 亲证 EXIT=0） | **已落地** | **剔除**（无可做面）。 |
| **R-44** | 「队列健康指标只有 queued/running_expired/dead 三个计数：缺少最老排队年龄/延迟、attempts 分布、job 时长、unknown 调用数与报告隔离的独立指标」（P1·S） | `refactor-backlog.md:87`/`:444`-`:450` | **半做**：`packages/ai-runtime/src/metrics.ts:72`-`:77` 仅 `jobsQueued/jobsRunningExpired/jobsDead/jobsFailed`；HA-7 只加失败 counter（`report-worker.ts:177` 等），非声称 `ha-7...REQUEST.md:94`「本刀只补观测消费侧」。age/duration/attempts/unknown/quarantine 独立指标均无 | **半做**（仅失败 counter） | **不选（本刀为它让路）**：age=`min(created_at) WHERE status='queued'`；无 status 前导索引即每拍全表扫（`ix_ijob_claim` 以 owner 开头，`0001:268`）——先做 R-50 才是 R-44 的硬前置。 |
| **R-50** | 「队列调度/gauge 的过滤条件（status/lease）没有以 status 开头的索引：每 5 秒×多循环×多副本全表扫描」（P1·S） | `refactor-backlog.md:93`/`:494`-`:500` | **未做**：四 job 表索引全以 owner 开头（`0001:239` ai_report / `0001:268` interview_job / `0007:31` quiz_job / `0008:32` diagnosis_job）；`entitlement_consumption` 无 `(status,lease)` 索引（`0001:109`-`:122` 表体 + 全迁移 CREATE INDEX 零命中，本席 rg 亲证）；`0132:23`-`:44` 五分支全局按 status/lease 过滤；`0042:10`-`:24` 四表 FILTER 全表聚合；`main.ts:773`-`:776` 15s/副本、`main.ts:510` 5s/副本 | **未做**（本刀靶） | **选中**（理由见下）。 |
| **R-51** | 「核心表无限增长且没有保留/归档/分区/vacuum 调优策略」（P1·M） | `refactor-backlog.md:94`/`:502` 起 | **半做**：`0212_outbox_relayed_retention.sql`（outbox relayed 保留清扫）· `0219_interview_event_retention_purge.sql`（interview_event 保留清扫）· `0213_interview_job_autovacuum_reloptions.sql`（interview_job autovacuum 调优）已落；四 job 终态行零 retention（`alerting-runbook.md:141`/`:169`/`:188` · HA-7 `:49` 明列「R-51 本体未实现」）；checkpoint/trace 保留面未落 | **半做**（三小件已落；job 终态/checkpoint 保留未落） | **不选**：剩面=删改语义重刀（HA-7 明确越界即废），且其时间型清理同样需要 R-50 类索引先行。 |

**选条理由（按价值排序的书面结论）**：
1. **硬前置性最强**：R-50 是 R-44（最老排队年龄=按 status+created_at 取 min）与 R-51（按时间清理需时间索引）的共同前置；底稿 R-24 `:290` 的修法原文也把「gauge 与枚举改走部分索引/物化计数」列为首选——**R-50 是 R-24/R-44/R-51 三条同时吃到的结构性前置**。
2. **对多实例的收益是线性的**：`0132` owner 枚举每 5s×四队列×N 副本；`0042` gauge 每 15s×四表×N 副本。HA-1 拓扑（api×2+worker×2）把这些全部翻倍；索引把「扫全表历史」降为「扫匹配 status 的键段」，收益随 `done` 历史行数线性放大（底稿 `:498`「扫描成本随历史线性增长」）。
3. **本地可证且零云**：真隔离 PG 上 EXPLAIN 可判（`enable_seqscan=off` 适用性 + 默认计划 no Seq Scan 双口径），不依赖任何云资源/密钥。
4. **S 体量、单点可回滚**：5 条并发索引 + 1 条函数改形，全部 additive；回滚=DOP INDEX CONCURRENTLY + 以 0042 原体重放函数（§1 回滚形）。
5. 其余五条：R-37=已落地剔除；R-36=残面属云侧/产品裁决；R-44/R-51=被本刀前置；R-24=底稿建议先由 R-50 吃掉成本，编排改动留后。

---

## §0 现状锚（`git rev-parse HEAD:<path>` 亲算 · 8 hex · 全部对 `99e4e3f38`）

### 0.1 订正与勘误（起草席亲跑亲读，如实登记）

1. **勘误① 派单文档指位**：任务前置称六条列于 `ai-docs/delivery/north-star-ha.md`；本席在该文件 `grep -n "R-24\|R-36\|R-37\|R-44\|R-50\|R-51"` **0 命中**（亲跑）。六条的实登记面=`product-campaign-LEDGER.md:136` + `ha-6-companion-REQUEST.md:106`；本卷据此认领，不以 north-star-ha 为条目来源。
2. **勘误② 行号漂移**：`ha-6-companion-REQUEST.md:5`/`:106` 引 `product-campaign-LEDGER.md:134`；当前实树该表尾行在 **`:136`**（表头起 `:128`，中间新增两行）。本卷按 `:136` 钉，引用时保留原文 `:134` 并注明漂移。
3. **勘误③ 描述错位**：`ha-6-companion-REQUEST.md:106` 写「R-44 索引 / R-50/51 生命周期」；底稿权威定义是 **R-44=队列健康指标 / R-50=索引 / R-51=数据生命周期**（`refactor-backlog.md:87`/`:93`/`:94`）。本刀取 **R-50=索引**，按底稿口径，不按 ha-6 的错位标签。
4. **勘误④ R-24 名目**：LEDGER 同行把「队列指标」列在 R-24 位，HA-7 卷名亦写「R-24 队列指标」；底稿 R-24 实义是「无 leader 选举的重复全表聚合」，队列指标实为 R-44。两者是关联项（底稿 `:290` 互指），但不可互借关闭；本卷非声称里分别钉死。
5. **事实钉**：`packages/db/migrations/*.sql` 当前 **217** 件，链头 `0219_interview_event_retention_purge`（本席 `ls | wc -l` = 217 亲证）；任何新迁移都会打破 `interview-event-retention.proof.ts:81`-`:83` 的「链头 0219 / 文件数 217」双钉——本卷已把它列为 EXEC 必须同步的最小子项（§3-C6）。

### 0.2 blob 锚表（`git rev-parse HEAD:<path>` 8 hex · 行数）

| 文件 | blob（行数） | 本卷用到的锚 |
|---|---|---|
| `packages/db/migrations/0042_runtime_observability_gateway.sql` | `ccac352d`（48） | `:5`-`:7` 签名/SECURITY DEFINER · `:10`-`:24` 四表三列 FILTER 聚合 · `:45`-`:47` REVOKE/GRANT |
| `packages/db/migrations/0132_job_route_classify_worker_dispatch.sql` | `866a4ee7`（68） | `:11`-`:13` route_pending 部分索引先例 · `:15`-`:20` 函数头 · `:23`-`:29` interview · `:30`-`:34` quiz · `:35`-`:39` diagnosis · `:40`-`:44` report · `:45`-`:53` commerce |
| `packages/db/src/jobs/gateway-dispatch.ts` | `1f752a27`（108） | `:22`-`:26` `gatewayDispatchOwners` · `:58`-`:67` `gatewayJobGauges` |
| `apps/worker/src/main.ts` | `6962c0a6`（881） | `:217`-`:221` 数据源注释 · `:226` 「小表全扫可接受」 · `:229`-`:238` `refreshJobGauges` · `:510` `jobReconcileIntervalMs` 5s · `:660`/`:663`/`:665` 三消费循环 · `:773`-`:776` gauge 循环 15s · `:878` 启动日志 |
| `packages/db/src/interview/interview-jobs.ts` | `7401cc04`（401） | `:154`-`:181` per-owner claim（owner 前导） · `:331`-`:345` per-owner sweep · `:398`-`:401` 旧全局 owner 枚举（现由 0132 网关取代） |
| `packages/db/migrations/0001_baseline.sql` | `d68f8dd0`（485） | `:109`-`:122` entitlement_consumption 表体 · `:224`-`:239` ai_report 表体+`ix_report_claimable` · `:253`-`:268` interview_job 表体+`ix_ijob_claim` |
| `packages/db/migrations/0007_resume_quiz.sql` | `dc5592e4` | `:17`-`:31` quiz_job 表体+`ix_quizjob_claim` |
| `packages/db/migrations/0008_resume_diagnosis.sql` | `88e931e4` | `:18`-`:32` diagnosis_job 表体+`ix_diagnosisjob_claim` |
| `packages/db/src/migrate.ts` | `b13c6fec`（631） | `:11`-`:24` 三执行模式契约 · `:204`-`:228` 单条 CONCURRENTLY 正则（只允许一个语句、谓词仅 `IS NULL`/`= '字面量'`） · `:609` 注记检测 |
| `packages/db/migrations/0198_trace_created_at_index.sql` | `50823c80` | `:1`-`:9` 单索引并发迁移先例（IF NOT EXISTS 幂等） |
| `packages/db/migrations/0211_outbox_unsettled_partial.sql` | `0f3dc6d0` | `:1`-`:9` 部分索引并发迁移先例（`WHERE status='pending'`） |
| `packages/db/migrations/0219_interview_event_retention_purge.sql` | `6bccd18b` | `:45`-`:47` 「后继刀为 created_at 补索引须独立并发迁移」明示 |
| `packages/db/migrations/0213_interview_job_autovacuum_reloptions.sql` | `e188a1d0` | `:1`-`:10` R-51 半件的 autovacuum 调优（本刀不重复、不撤销） |
| `packages/db/test/interview-event-retention.proof.ts` | `5a8ec1d7`（323） | `:76`-`:83` 链头 0219 + 文件数 217 双钉（本刀必须同步） |
| `packages/db/test/runtime-role.proof.ts` | `7c32f040`（130） | `:108`-`:113` `gateway_job_gauges()` 四行/列名断言（本刀回归面） |
| `packages/db/test/migrate.proof.ts` | `0ca7c391` | concurrent-index 有效性/谓词/特权面既有断言（本刀回归面，零改） |
| `packages/ai-runtime/src/metrics.ts` | `277d0e77`（213） | `:67`-`:77` 队列指标仅四件 · `:153`-`:156` 四队列 0 预填 |
| `packages/db/package.json` | `2566537c` | `:25` `prove:migrate` · `:30` `prove:level-policy`（注册形先例） |
| `scripts/run-e2e-isolated.mjs` | `dff85f04` | `:594`/`:614` 目标表条目 · `:894` `level-policy-migrate:prove` 形 · `:2839` 允许清单 · `:3357` 命令映射 |
| `scripts/ai-docs/public-text-policy.mjs` | `c633ef6c` | `:282` `MAX_FILES = 2_461` |
| `ai-docs/observability/alerting-runbook.md` | `e7097d5a` | `:141`/`:169`/`:188` 四队终态行零 retention（R-51 登记，本刀不修） |
| `apps/worker/src/report-worker.ts` | `e89fec16` | `:177` HA-7 失败 counter 落点（R-44 半件，零改） |
| `ai-docs/delivery/north-star-ha.md` | `fdcaa83e` | `:24` releaseEvidence=false · `:46` 不宣称 HA · `:55` G7 · `:67` 本地一律 NOT_HA |
| `ai-docs/delivery/harness/product-campaign-LEDGER.md` | `a5065950` | `:136` 六条同行 · `:138` pins 维持 |
| `ai-docs/delivery/harness/ha-6-companion-REQUEST.md` | `75ebbc3f` | `:5` 前序三件 · `:106` 余六件后刀 · `:98` W2 接受 ×N |
| `receipts/archive/2026-09-batch23/harness/ha-7-queue-metrics-REQUEST.md` | `2b330a44` | `:27` DLQ 只增不减 · `:41` runbook 登记 · `:49` R-51 本体未实现 · `:94` 非声称三条 |
| `ai-docs/delivery/harness/authz-34-residual-REQUEST.md` | `58aaff8d` | `:3` Status closed（R-37 已落地佐证） |
| `packages/domain/src/auth.ts` | `697da7dc` | `:5`-`:21` 异步 scrypt（R-37 已落地） |
| `apps/api/src/modules/auth/auth.service.ts` | `3b0d7a59` | `:19`-`:28` ip/global 桶参数 · `:88`-`:93` 三桶登录（R-36 半做） |

### 0.3 索引普查（R-50 缺口本体 · 本席逐条 `CREATE INDEX` 亲证）

| 表 | 现有索引（全部 owner 前导） | 锚 | status/lease 前导索引 |
|---|---|---|---|
| `interview_job` | `ix_ijob_claim (owner_user_id, status, seq, created_at)` | `0001:268` | **无** |
| `ai_report` | `ix_report_claimable (owner_user_id, status)` | `0001:239` | **无** |
| `quiz_job` | `ix_quizjob_claim (owner_user_id, status, created_at)` | `0007:31` | **无** |
| `diagnosis_job` | `ix_diagnosisjob_claim (owner_user_id, status, created_at)` | `0008:32` | **无** |
| `entitlement_consumption` | 仅 PK + `UNIQUE(owner_user_id, idempotency_key)`；全迁移 CREATE INDEX 零命中 | `0001:109`-`:122` | **无** |
| `commerce_outbox` | `ix_outbox_unsettled (owner_user_id) WHERE status='pending'` | `0211:7`-`:9` | **已覆盖**（部分索引谓词即 status，枚举无需再建；本刀列为「无须新增」并断言其仍在） |

`WHERE owner_user_id=$1` 的 per-owner claim/sweep 走现有 owner 前导索引是正确的（`interview-jobs.ts:154`-`:181`/`:331`-`:345`），**本刀不动**；缺口只在**无 owner 谓词的全局枚举/聚合**。

### 0.4 全局查询路径（每副本 × 每拍）

| 路径 | 查询（逐字摘要） | 锚 | 频率 | 副本数 | 当前计划 |
|---|---|---|---|---|---|
| owner 枚举 interview | `WHERE j.status='queued' OR (j.status='running' AND lease_expires_at < clock_timestamp()) GROUP BY owner ORDER BY min(created_at)` | `0132:25`-`:29` | 5s（`main.ts:510`） | N | 全表扫 |
| owner 枚举 quiz | `WHERE status='queued' OR (status='running' AND lease < now())` | `0132:32`-`:34` | 5s | N | 全表扫 |
| owner 枚举 diagnosis | 同形 | `0132:37`-`:39` | 5s | N | 全表扫 |
| owner 枚举 report | `WHERE status IN ('queued','failed') OR (status='running' AND lease < now())` | `0132:42`-`:44` | 5s | N | 全表扫 |
| owner 枚举 commerce | `WHERE status='reserved' AND lease_expires_at < clock_timestamp()` | `0132:47`-`:49` | 30s | N | 全表扫 |
| gauge 四表 | `count(*) FILTER (WHERE status=...)` ×4 表 | `0042:10`-`:24` | 15s（`main.ts:776`） | N | 全表扫（`main.ts:226` 注释自认「小表全扫可接受」） |

### 0.5 靶心一句话

`done` 历史行只增不删（R-51 未收口），而每副本每 5s 的 owner 枚举与每 15s 的 gauge 聚合都**不带 owner 谓词**，现有索引全部 owner 前导，于是每条查询都退化为对整张历史表顺序扫描；HA-1 拓扑把副本翻倍、R-51 迟迟不落又把历史继续做大——**R-50 的修法是把「按 status/lease 过滤」变成索引可服务的键段，并把 gauge 的多 FILTER 单遍聚合改成逐 status 的可索引子查询**。这样 R-24 的重复聚合成本被结构性压小（不必先做 leader 选举），R-44 的 age 指标与 R-51 的时间清理也拿到可用的索引基座。

---

## §1 修法（W1 五索引 + W2 gauge 改形 + W3 proof + W4 链头钉）

### W1 · 五条 status 前导复合索引（5 条独立并发迁移）

形态统一：`(status, lease_expires_at)`，btree，无部分谓词。理由见 §1.3（部分索引 13 条的替代被否决：迁移条数与热表写放大均不合算）。每条迁移按运行器契约**恰一个** `CREATE INDEX CONCURRENTLY IF NOT EXISTS`（`migrate.ts:204`-`:228` 正则只收单语句，谓词只收 `IS NULL`/`= '字面量'`，本形无谓词）。

| # | 表 | 索引名 | 键 | 迁移拟名（EXEC 立项日按链顶顺延；本卷起草日链顶=0219） |
|---|---|---|---|---|
| W1-1 | `interview_job` | `ix_ijob_status_lease` | `(status, lease_expires_at)` | `0220_job_queue_interview_status_lease_index.sql` |
| W1-2 | `quiz_job` | `ix_quizjob_status_lease` | `(status, lease_expires_at)` | `0221_job_queue_quiz_status_lease_index.sql` |
| W1-3 | `diagnosis_job` | `ix_diagnosisjob_status_lease` | `(status, lease_expires_at)` | `0222_job_queue_diagnosis_status_lease_index.sql` |
| W1-4 | `ai_report` | `ix_report_status_lease` | `(status, lease_expires_at)` | `0223_job_queue_report_status_lease_index.sql` |
| W1-5 | `entitlement_consumption` | `ix_entitlementconsumption_status_lease` | `(status, lease_expires_at)` | `0224_entitlement_consumption_status_lease_index.sql` |

每条迁移文件头含稳定内容标记（供 A1 静态发现，不靠文件名/编号）：`-- job-queue-index: <table>`（`<table>` 为五表名之一），并含 `-- @migration-mode concurrent-index`（`migrate.ts:609` 检测）。索引名 ≤63 字节；五名全仓唯一。
覆盖判定：`status='queued'`/`'failed'`/`'quarantined'`/`'reserved'` 等值走键段前缀；`status='running' AND lease_expires_at < now()` 走等值+范围；`status IN ('queued','failed')` 走两段。`commerce_outbox` 由 `0211` 的 `WHERE status='pending'` 部分索引覆盖，**本刀不新增**（A8 断言其仍在）。

### W2 · `gateway_job_gauges()` 改形为逐 status 可索引子查询（1 条事务迁移）

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

语义逐条不变：四行、`queue` 名与顺序不变、`dead` 谓词逐表不变（report=quarantined，其余=failed，沿 `main.ts:217`-`:219`）。`CREATE OR REPLACE` 保留 owner/ACL，随后 REVOKE/GRANT 与 `0042:45`-`:47` 逐字同形（幂等重发）。**不新增参数、不改返回列、不动 `gateway_cost_budget_snapshot`**（`0042:28` 起）。

### W3 · 证明载体（1 新 proof + 注册）

`packages/db/test/job-queue-index.proof.ts`（新生），`packages/db/package.json` 加一行 `"prove:job-queue-index": "tsx test/job-queue-index.proof.ts"`；`scripts/run-e2e-isolated.mjs` 沿 `level-policy-migrate:prove` 同形**纯 additive** 注册三处：目标 provenance 条目（`:894` 形）、`isolatedCommand` 分支（`:3357` 形，`['pnpm',['-C','packages/db','prove:job-queue-index']]`）、允许清单（`:2839` 形）。不入 `LIVE_E2E_TARGETS`（`:89`）。

证明用真隔离 PG（`pgvector/pgvector:pg16` 固定镜像，沿 `run-e2e-isolated` 现形；`assertIsolatedTestTarget` 门），**不依赖云、不读 `.env*`、零模型外呼**。

### W4 · 链头钉最小同步（既有 proof 的 bounded 更新）

新增 6 条迁移后，`packages/db/test/interview-event-retention.proof.ts:81`-`:83` 的「链头 0219 + 文件数 217」双钉必红。**仅**改该处：链头字符串→EXEC 实际新链头（按本卷拟名=最后一条 `0225_...`）、`manifest.length === 217`→`223`、注释里的「现最大 0218 顺延·0219 认领」→对应新值。**该文件其余断言零字节零触**（Ban 借机改任何其他断言/放宽任何判据）。

### 1.3 否决表（落选项诚实留痕）

| 落选项 | 否决理由 |
|---|---|
| 13 条按 status 的部分索引（queued/running/failed/quarantined × 四表 + 五表） | 底稿 `:500` 建议的是部分索引；但按本刀五表全状态枚举需 **13 条**独立迁移（运行器只收单条 CONCURRENTLY），且每张热表多 2-3 条 btree 维护路径。复合 `(status, lease)` 5 条即可覆盖等值/范围/多值，写放大更低。**部分索引的写放大优势留给 R-51 收口后再评**。 |
| 只加索引、不改 gauge 函数 | gauge 的多 FILTER 单遍聚合不会因索引改变计划（PG 不拆 FILTER），R-50 的 15s 半边等于没修；只做一半会造成「索引在、扫描照旧」的假绿。 |
| gauge 改用 `pg_class.reltuples` 估算/物化计数 | 估算对告警会出假阴性（排队 99 但估算 0），与 HA 告警的 fail-closed 口径冲突；物化计数引入新状态与刷新正确性问题，体量远超 S。 |
| 合并为一条 `multi-statement` 迁移 | 运行器 `migrate.ts:11`-`:24` 明示 CONCURRENTLY 必须非事务；`executionMode` 不可混用。 |
| 在 0219 之前插号 | 违反只前进/链头单调；且 `migrate.proof.ts`/唯一性门按目录序断言。 |
| 改 per-owner claim/sweep 查询 | 它们走 owner 前导索引已正确（`interview_job.ts:154`-`:181`/`:331`-`:345`），改查询=产品语义改动，越界。 |
| 做 leader 选举（R-24 本体） | 编排改动，非本刀；底稿 `:290` 明示先走索引/物化计数。 |
| 做 R-44 的 age/duration/attempts 指标 | 独立条目；本刀只提供其索引基座，指标落 R-44 后刀。 |
| 做 R-51 的终态行 retention | 删改语义重刀，HA-7 `:49` 明示越界即废；本刀只索引，不删一行。 |

**回滚形**：五索引各一句 `DROP INDEX CONCURRENTLY IF EXISTS public.<name>;`（非事务）；gauge 以 `0042:5`-`:26` 原体 `CREATE OR REPLACE` 重放（ACL 不变）。回滚不删表、不删行、不改任何既有索引。

---

## §2 非范围（全列 · 越界即废）

1. **R-24 leader 选举/对账循环编排**——本刀零触；只通过索引降低重复聚合成本。
2. **R-36 登录锁定残面**（Redis 共享态/验证码/渐进延迟/targeted lockout 策略）——HA-6 R-23 已裁定接受 ×N，本刀零触 `auth.service.ts`/`rate-limit.service.ts`。
3. **R-37 scrypt**——已落地（authz-34 nail），本刀零触。
4. **R-44 新指标**（oldest_queued_age/running_expired_age/attempts 直方图/job_duration/unknown age/quarantined_total）——后刀；本刀只交付索引基座。
5. **R-51 retention/分区/归档**——后刀；本刀不 DELETE/不建分区/不改 autovacuum（`0213` 零触）。
6. **per-owner claim/sweep 查询与索引**（`ix_ijob_claim` 等）——零改；`0001`/`0007`/`0008` 的既有索引零删零改。
7. **`commerce_outbox` 新索引**——`0211` 部分索引已覆盖，本刀只断言其仍在。
8. **`gateway_cost_budget_snapshot`/`gateway_dispatch_owners`/其它网关函数**——零触（本刀只改 `gateway_job_gauges`）。
9. **告警阈值/runbook/alert.rules**——零触；R-51 的 DLQ 风险登记维持 `alerting-runbook.md:141`/`:169`/`:188` 原样。
10. **pins/SSOT 翻面**：`haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` 维持；LEDGER/checklist/backlog 只读引用，翻面权归协调方。
11. **云侧/生产库/生产宿主**：零操作；证明只在隔离 PG 容器。
12. **迁移编号的最终值**：以 EXEC 立项日链顶顺延为准；本卷拟名 0220-0225 只作起草基线。

---

## §3 逐条改动清单（EXEC 落码对账表）

| # | 码面 | 现状（亲读） → 目标 |
|---|---|---|
| C1 | `packages/db/migrations/0220_job_queue_interview_status_lease_index.sql`（新增） | 不存在 → `-- job-queue-index: interview_job` + `@migration-mode concurrent-index` + `CREATE INDEX CONCURRENTLY IF NOT EXISTS ix_ijob_status_lease ON public.interview_job (status, lease_expires_at);` |
| C2 | `0221_job_queue_quiz_status_lease_index.sql`（新增） | 同形 → `ix_quizjob_status_lease ON public.quiz_job (status, lease_expires_at)` |
| C3 | `0222_job_queue_diagnosis_status_lease_index.sql`（新增） | 同形 → `ix_diagnosisjob_status_lease ON public.diagnosis_job (status, lease_expires_at)` |
| C4 | `0223_job_queue_report_status_lease_index.sql`（新增） | 同形 → `ix_report_status_lease ON public.ai_report (status, lease_expires_at)` |
| C5 | `0224_entitlement_consumption_status_lease_index.sql`（新增） | 同形 → `ix_entitlementconsumption_status_lease ON public.entitlement_consumption (status, lease_expires_at)` |
| C6 | `0225_job_gauge_index_friendly.sql`（新增·事务迁移） | 不存在 → W2 的 `CREATE OR REPLACE FUNCTION gateway_job_gauges()` + REVOKE/GRANT（与 `0042:45`-`:47` 同形）；**唯一改函数体的迁移** |
| C7 | `packages/db/test/job-queue-index.proof.ts`（新增） | 不存在 → §4 的 43 断言载体 |
| C8 | `packages/db/package.json` | `:25`/`:30` 形 → additive 一行 `"prove:job-queue-index": "tsx test/job-queue-index.proof.ts"`；既有脚本零删改 |
| C9 | `scripts/run-e2e-isolated.mjs` | `:894`/`:3357`/`:2839` 形 → additive 三处（provenance 条目、命令分支、允许清单）；既有目标零删改 |
| C10 | `packages/db/test/interview-event-retention.proof.ts` | `:81`-`:83` 链头 0219/217 → 新链头/223；**仅此两断言与同行注释数字**，其余零触 |
| C11 | `ai-docs/delivery/receipts/ha1/*.log`（新增·真跑收据） | 不存在 → EXIT 读数与 PIN 行；`.log` 不入 PTP 扫描面（`public-text-policy.mjs:39` `TEXT_EXTENSIONS` 不含 `.log`） |

**EXEC 改动集口径**：11 条 tracked（5 并发迁移 + 1 事务迁移 + 1 新 proof + 2 注册面 + 1 既有 proof 两行 + 收据 `*.log` 若 tracked）。**多任何未登记 tracked 路径即停**。

---

## §4 prove 判据（43 断言 = 静态 8 + 动态 35 · 全在隔离 PG · Ban retry-to-green）

### A. 静态确定性（8 断言 · 零 DB）

- **A1** 按内容标记 `-- job-queue-index: <table>` 在 `packages/db/migrations/*.sql` 中恰发现 **5** 个文件，五表各恰一（不依赖文件名/编号）。
- **A2** 五文件各含 `-- @migration-mode concurrent-index`（与 `migrate.ts:609` 检测同形）。
- **A3** 五文件剥注释后各恰 **一个**语句、以 `;` 结尾，且含 `CREATE INDEX CONCURRENTLY IF NOT EXISTS`（`migrate.ts:204`-`:228` 正则同口径）。
- **A4** 五语句键列逐字 `(status, lease_expires_at)`（列序/大小写/空格归一后全等），无 `WHERE` 谓词。
- **A5** 五索引名逐字 `ix_ijob_status_lease`/`ix_quizjob_status_lease`/`ix_diagnosisjob_status_lease`/`ix_report_status_lease`/`ix_entitlementconsumption_status_lease`，全仓唯一，长度 ≤63。
- **A6** 负断言：除五新文件外，全仓迁移对五表**无** `ON <table> (status` / `ON <table>(status` 形索引（防已存在而重复建）。
- **A7** additive-only：五新文件不含 `DROP`/`ALTER`/`INSERT`/`UPDATE`/`DELETE` token；C6 只含 `CREATE OR REPLACE FUNCTION` + `REVOKE`/`GRANT`，不含 `DROP FUNCTION`。
- **A8** 既有索引在树且未被新文件触碰：`ix_report_claimable`（`0001:239`）、`ix_ijob_claim`（`0001:268`）、`ix_quizjob_claim`（`0007:31`）、`ix_diagnosisjob_claim`（`0008:32`）、`ix_outbox_unsettled`（`0211:7`-`:9`）。

### B. 动态（35 断言 · 隔离 PG + 真迁移链 + 种子数据）

**夹具**：每表种子 `done` ≥ 50,000 行（模拟历史），`queued` 恰 5、`running` 且 `lease_expires_at = now() - interval '1 hour'` 恰 5、终态 `failed`（report 为 `quarantined`）恰 3；`entitlement_consumption` 种子 `reserved` + 过期租约恰 5、`confirmed` ≥ 50,000。种子后 `ANALYZE` 五表。唯一约束按表体满足（`quiz_id`/`diagnosis_id`/`interview_id`/`idempotency_key` 逐行唯一）。

| # | 断言 | 判据 |
|---|---|---|
| B1-B5 | 五索引存在 | `pg_indexes` 按名命中，`tablename` 逐表对应 |
| B6 | 全部有效 | 五索引 `pg_index.indisvalid = true`（CONCURRENTLY 失败会留 invalid，必须抓） |
| B7 | 全部就绪 | 五索引 `indisready = true` |
| B8-B12 | 定义逐字 | `pg_get_indexdef` 含 `(status, lease_expires_at)` 且**无** `WHERE`（五表各 1） |
| B13 | 种子前置 | 五表计数与夹具合同全等（防种子失败造成空表假绿） |
| B14-B18 | 五条 dispatch 枚举默认计划 | `EXPLAIN (FORMAT JSON)` 对应 `0132:25`-`:49` 五查询：计划含对应新索引、且对目标表**无** `Seq Scan`（五表各 1） |
| B19-B23 | running-expired 单条件默认计划 | `WHERE status='running' AND lease_expires_at < now()`（report/entitlement 同义）五表各 1：计划含对应新索引 |
| B24 | 适用性硬门 | `SET LOCAL enable_seqscan = off` 下五条 dispatch 查询全部走对应新索引（防统计波动导致默认计划退化时仍能证明索引可服务；与 B14-B18 双口径） |
| B25 | gauge 数值等价 | `SELECT * FROM gateway_job_gauges()` 四行三列与 `0042:10`-`:24` 原 FILTER 查询逐值全等（种子计数） |
| B26 | gauge 元数据/ACL | `prosecdef = true`；owner 与 `0042` 时点相同；`has_function_privilege('app_gateway_role','gateway_job_gauges()','EXECUTE') = true`；返回列名/类型仍为 `queue text, queued bigint, running_expired bigint, dead bigint` |
| B27-B30 | gauge queued 子查询默认计划 | 四表 `count(*) WHERE status='queued'` 各 1：计划含对应新索引（或 index-only scan） |
| B31-B34 | gauge running-expired 子查询默认计划 | 四表 `count(*) WHERE status='running' AND lease < now()` 各 1：计划含对应新索引 |
| B35 | gauge 终态子查询适用性 | `enable_seqscan=off` 下四表 `failed`/`quarantined` 子查询全部走对应新索引 |

**口径与诚实边界**：
- B14-B23/B27-B34 的 EXPLAIN 是**子句体计划**（与 `rag03-hnsw-completeness.proof.ts:190`-`:280` 的 substituted-body 同形），不等于 live 函数内层计划；B25 用 live 调用证**数值**等价，两者分工在收据中逐行标明。
- 若某默认计划在种子规模下仍选 `Seq Scan`（例如 `failed` 行数占比极高），**不得改断言迁就**：该条按机制红上报，登记为残面并回 REQUEST 重裁索引形态；`enable_seqscan=off` 的适用性条仍须绿（用来区分「索引不可用」与「规划器不选」）。
- `main.ts:226` 原注释「小表全扫可接受」在本刀后应被证明为历史口径；不修改该注释（产品码零触），只在 proof 输出 PIN 行。

**EXEC 主门（§2 验收）**：
1. `pnpm -C packages/db prove:job-queue-index` 经隔离 runner **EXIT=0**，43 断言全 PASS，PIN 行入 `ai-docs/delivery/receipts/ha1/*.log`。
2. `pnpm migrate:prove` **EXIT=0**（真链全量 apply，含 6 新迁移）。
3. `pnpm -C packages/db prove:migrate` 的 concurrent-index 面零回归。
4. `interview-event-retention:prove:raw` **EXIT=0**（C10 同步后链头/文件数复绿）。
5. `runtime-role:prove` **EXIT=0**（`gateway_job_gauges` 四行/列名/ACL 不回归）。
6. `drift:prove` 零漂移；`uniqueness` files=223 violations=0。
7. `node scripts/ai-docs/check-docs.mjs` EXIT=0；`node scripts/ai-docs/public-text-policy.proof.mjs` 12/12 EXIT=0；改动集 markers 零命中。

---

## §5 Ban

Ban push/force-push（git 写只本 worktree commit）· Ban 动主仓 · Ban self-approve（pre-exec 双审两独立外席·alone≠dual）· Ban retry-to-green（红即停·attempts 全账·Ban 改断言迁就）· **Ban 让 EXPLAIN 假绿**（不得用 `enable_seqscan=off` 冒充默认计划；两口径必须分开报）· **Ban 把 substituted-body 计划写成 live 函数内层计划** · **Ban 只做索引就宣称 gauge 已修 / 只改 gauge 就宣称 R-50 收口** · **Ban 借 C10 同步改 `interview-event-retention.proof.ts` 任何其他断言** · **Ban 在迁移里混入多语句 CONCURRENTLY 或 `WHERE` 谓词（运行器正则外）** · Ban 改 per-owner claim/sweep 查询或既有 owner 前导索引 · Ban 做 R-24 选举/R-44 指标/R-51 删除（各自后刀）· Ban 新增 `commerce_outbox` 索引（0211 已覆盖）· Ban 改 `gateway_dispatch_owners`/`gateway_cost_budget_snapshot`/告警阈值/runbook · Ban 生产库/云侧/宿主操作 · Ban secrets 入树入据 · Ban 翻 pins · Ban 借本刀宣 HA/HA 簇收口/R-50 已关（§7）· **Ban 在代码注释写任务号/刀号**（迁移头注只写语义标记 `job-queue-index: <table>`）。

---

## §6 pins（十一值照抄 `harness/5e-cleanup-sweep-2-REQUEST.md` 经 ha-1..ha-6 同款 · EXEC/审查不得改口 · 本刀零翻转）

`haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` · `coveredCount=8` · `ms3EqualsR4Closed=false` · `PG-retained`（业务+LangGraph PostgresSaver+pgvector；禁 MySQL/Qdrant 业务切流叙事）· 公开 `DELETE /privacy/interview-data/:id` = 503 · `g7SuiteGreen=false` · `r1Closed=false` · 脚注 `actualSpendCny=null`（本刀零模型外呼·零消耗·est live=0）。

**本卷附加钉**：R-50 判定=底稿 `refactor-backlog.md:93`/`:494`-`:500` 原文 · 五索引键序固定 `(status, lease_expires_at)` · gauge 返回四行顺序固定 · `commerce_outbox` 走 0211 不新增 · 链头钉同步只准动 C10 两断言 · 计划口径=substituted-body 与 live 数值分工 · 隔离镜像固定 `pgvector/pgvector:pg16` · 本刀不宣称 HA/簇收口。

---

## §7 Non-claims

本刀 ≠ HA ≠ `haStatus` 翻转 ≠ HA 簇收口 ≠ R-50 全量闭环之外的任何条目（R-24/R-36/R-44/R-51 各自仍开/半开）≠ R-44 指标已补（本刀只给索引基座）≠ R-51 保留/分区已做（本刀一行不删）≠ R-24 leader 选举已做 ≠ 生产容量/负载绿（EXPLAIN 计划 ≠ 生产 SLO）≠ 索引在百万级生产表上的真实收益（种子 5 万行为本地口径，非生产实测）≠ gauge 指标语义/告警阈值变更（数值等价，阈值零触）≠ 已跑全量套件（`g7SuiteGreen=false` 维持）· prove EXIT=0 ≠ DONE（`claimDone=false` · 完成判定走双审+nail）· `est live=0`。

---

## §8 STOP（开工三条款 + 停止条件五类）

**STOP · `draft:awaiting_pre_exec_dual`（三处钉：Status 行 + 本节 + 卷尾 · 同值）。** 开工三条款（未履行不得 EXEC）：① **pre-exec 双审两独立外席 BOTH PASS 落卷**（含 W1 复合索引 vs 13 条部分索引的形态裁决、W2 gauge 改形的数值等价面）；② **协调方明示 EXEC 授权**（LEDGER:136 HA 簇解锁亲证 · 批1 收口状态确认）；③ **§0 全量对届时 tip 重 pin**——五表索引普查/0132/0042 谓词/链头 0219/文件数 217/既有 proof 钉任一漂移且结论受疑即回炉。

- **现场漂移**：`origin/main` 届 tip 的五表索引清单、`0132` 五分支谓词、`0042` gauge 列语义、`interview-event-retention.proof.ts:81`-`:83` 链头钉、`migrate.ts` concurrent-index 正则任一变化 → 停·重 pin；拟名 0220-0225 与届链顶撞号 → 按链顶顺延并同步 C10。
- **机制不满足**：若现有索引已出现 status 前导（A6 红）、或 `entitlement_consumption` 已有 `(status,lease)` 索引、或 `0211` 的 commerce_outbox 索引被移除 → 停手上报，不重复建、不顺手补。
- **计划红分诊**：B14-B18/B27-B34 默认计划仍 `Seq Scan` → 先分**仪器红**（种子不足/未 ANALYZE/统计过期）与**机制红**（索引形态不适用）；仪器红只许修夹具并重跑（attempts 入账），机制红即停手上报（Ban 改断言迁就、Ban 用 `enable_seqscan=off` 冒充默认计划）。
- **跨刀红**：C10 同步后 `interview-event-retention:prove:raw` 仍红（非链头/计数原因）→ 停·stash 对照亲证基线，不得借机改该 proof 其他断言。
- **越界需要**：修法诉求超出 §3 的 11 条 tracked（要做 leader 选举/新指标/删除保留/改告警/改 per-owner 查询）→ 停·另刀或协调方裁决。
- **验收红不可修**：docs:check >2461 / PTP 红 / migrate:prove 红且根因不在本刀交付面 → 停·stash 对照亲证基线·如实登记·Ban 借机修。

---

## §9 状态

**`draft:awaiting_pre_exec_dual`**（2026-10-30 起草落卷即停 · 前无状态 · pre-exec 双审两独立外席待派 · Ban self-approve · alone≠dual · ⛔push ⛔动主仓 · est live=0 · markers=0 · cap 零步进（2459→2460，cap 2461）· 收据/EXEC 记录待后续席追加，本节 append-only 不改既有字）。

---

*HA-1 REQUEST · 2026-10-30 起草落卷 · 认领=R-50（底稿 `refactor-backlog.md:93`/`:494`-`:500` 原文；本仓实登记=`product-campaign-LEDGER.md:136` + `ha-6-companion-REQUEST.md:106`；north-star-ha.md 对六条 R 号零命中已勘误）· 六条判定=R-37 已落地剔除 / R-36 半做（残面归 HA-6 R-23 接受 ×N）/ R-24 未做（编排改动后置）/ R-44 半做（仅失败 counter）/ R-51 半做（outbox+interview_event+autovacuum 已落，job 终态未落）/ **R-50 选中**（R-24/R-44/R-51 共同硬前置）· 修法=五条 `(status, lease_expires_at)` 并发索引 + `gateway_job_gauges()` 逐 status 子查询改形 + 43 断言隔离 proof + 链头钉两行同步 · 全锚 @`99e4e3f38` 亲读亲算 · pins 十一值零翻转 · est live=0 · markers=0 · cap 零步进 · ⛔push ⛔动主仓 · Ban self-approve · alone≠dual · Dual PASS ≠ 开工 · proof EXIT=0 ≠ DONE · STOP=`draft:awaiting_pre_exec_dual`*

*卫生声明：markers=0 = 本卷改动集五类标记词与行首冲突标记 grep 零命中——词面由门命令运行时组装、卷内不复抄（防自匹配；沿 ha-3/ha-6 同款）。*
