# HA-4 · 备份/恢复（R-26 备份/PITR 未找到 · HA 簇高优先 · EXEC REQUEST 起草 · docs-only 零码动）

**Status**: **`draft:awaiting_pre_exec_dual`**（起草席 `ha4-draft` · docs-only · Ban self-approve · 待预执行双审 PASS 后才派 EXEC coding · **Dual PASS ≠ 开工**）
**Date**: 2026-10-10
**审计项**: LEDGER HA 簇 R-26 P1（`ai-docs/delivery/harness/product-campaign-LEDGER.md:131`「备份/PITR 未找到」·HA 门映射「备份证据」·优先「高」）·HA-1 判据 B3 把 R-26 备份列为 claimProductionHA 簇配套收口前置（`harness/ha-1-redundancy-REQUEST.md:111`）·HA-1 非范围项明示 R-26 归后刀（同卷 :135）
**Base**: 主线 `feat/mysql-schema-skeleton` @`9f6edf8f`（本席 `git log` 亲证主线 tip·HA-1 nail 已落）·分支 `line/ha-4-backup`（新立工作树 `meetwise-ha4`：`git -C ../meetwise worktree add ../meetwise-ha4 -b line/ha-4-backup 9f6edf8f`·与 `meetwise-ha1`/`meetwise-ha2` 同点分叉互不触碰）
**蓝本**: LEDGER:125-137（HA 簇表+执行裁定）+ 姊妹刀格式先例 `harness/ha-1-redundancy-REQUEST.md` / `harness/ha-2-graceful-REQUEST.md` + 隐私面登记 `packages/domain/src/privacy-erasure-preview.ts:42/:84`、`ai-docs/architecture/ai/privacy-deletion-sink-inventory.md:123`
**席位**: ha4-draft（北星门 2 HA 簇 R-26 起草席）
**Honesty**: 全部涉案面 file:line 起草席亲读（§1 全录·rg/grep/sed 实证）；零实跑零 prove（本刀=REQUEST 起草·prove 判据 §4 待 EXEC 兑现）；est live=0（纯沙箱 compose+脚本·零 Key 零外呼零模型调用零生产操作）。

---

## §0 立靶（R-26 是什么·凭什么是本刀）

### 0.1 现状一句话

全仓**零数据备份机械**：rg `pg_dump|pg_restore|pg_basebackup|wal-g|wal_level|archive_mode|barman` @`9f6edf8f` 实树 **0 命中**；compose 全家桶零备份服务；宿主 cron/systemd timer 零备份作业（旧 timer 已被蓄意清场，`ops/deploy/bootstrap-ecs.sh:26-30`）；README/ops 零备份承诺。而下游文档面**多处把备份当既有依赖**（退役条件含「备份恢复演练成功」`ai-docs/architecture/ai/rag-production-release-runbook.md:195`；隐私 sink 目录把 `backup_pitr` 登记为 `honest_unresolved` 邻接面 `packages/domain/src/privacy-erasure-preview.ts:84`）。LEDGER:131 定级 **R-26 P1「备份/PITR 未找到 → 备份证据」**——本刀交付**预览环境尺度的本地备份+完整性校验+restore 演练**三件本体；云上传归 S15（写死非范围）。

### 0.2 授权链

1. LEDGER:125-134 HA 簇表=北星门 2「Production 100% HA」专属工作面；:136 执行裁定「HA 簇在 P0 四断链+批1 收口后启动」——HA-1（R-17）已 nail 落主线 @`b4b756b4`、HA-2（R-18/19）已 EXEC 落卷 @`line/ha-2-graceful`，簇内 R-26 顺位由**协调方开工时点亲证**（§9 条款①）。
2. HA-1 判据 **B3**（`ha-1-redundancy-REQUEST.md:111`）：claimProductionHA 证据链要求「HA 簇配套收口：R-18/19 优雅停机+R-22 DB 韧性+**R-26 备份**+R-47 告警」——本刀=B3 链条的备份件。
3. 隐私面既有登记（不翻面只承账）：`PRIVACY_PREVIEW_ADJACENT_SINKS` 含 `backup_pitr`（`privacy-erasure-preview.ts:42`），其 `defaultDisposition: 'honest_unresolved'`（:84）；sink 目录裁定「本地行删除 ≠ 备份消失」（`privacy-deletion-sink-inventory.md:123`）——本刀落备份本体后该面从「无 target 可登记」变「有 target 可核」，**是否翻转 disposition=隐私线裁决非本刀**（§5）。

### 0.3 诚实边界（先写死再设计）

本刀交付=**宿主本地 dump 档+校验+演练**。**不是 PITR**（WAL 归档/时点恢复不在本刀·降级裁决见 §5-2）；**不是容灾**（宿主机整体故障时 dump 与宿主同灭——异地副本归 S15 云上传后刀）；**不签 RPO/RTO 目标**（`rag-production-release-runbook.md:257` 要求业务签署的 RPO/RTO 实测——本刀只交付机制与演练证据·dump 档位的恢复点粒度=备份间隔量级·如实登记不粉饰）。预览宿主实机启用备份=另行协调方授权，本刀验证面=本地/沙箱 compose，**est live=0**。

---

## §1 现状盘点（亲读 @`9f6edf8f` · file:line 全锚）

### 1.1 备份零存在面（亲证）

| 面 | 现值 | 锚（@9f6edf8f 实测） |
|---|---|---|
| 备份工具 | **零**——`pg_dump/pg_restore/pg_basebackup/wal-g/wal_level/archive_mode/barman` 全仓 rg **0 命中**（`--glob '!node_modules'`） | 亲证 grep（本席实跑） |
| compose 备份服务 | **零**——prod compose 服务仅 migrate/api/worker/web | `docker/compose.prod.yml:223/:236/:271/:352` |
| prod compose 卷声明 | **deliberately declares no PostgreSQL, Redis, MinIO, volumes**（cloud-only 契约·连卷都不许有） | `docker/compose.prod.yml:1-3` |
| DB 形态 | 云托管 RDS：`RUNTIME_DATABASE_URL`+`DATABASE_SSL_MODE: verify-full`+`/run/secrets/rds_ca`；迁移面同构 | `docker/compose.prod.yml:12-14/:133-137` |
| cron | **零备份 cron**——全仓 `cron/schedule` 仅 CI 定时（nightly `0 18 * * *`·deps-audit 周一 `20 20 * * 0`） | `.github/workflows/nightly.yml:6-7`；`.github/workflows/deps-audit.yml:18-19` |
| systemd timer | 旧 CD 全部 timer（含 preview 系）已被蓄意停用清场——宿主侧定时任务=反惯性面 | `ops/deploy/bootstrap-ecs.sh:26-30` |
| env 快照 | 唯一「backup」动作=部署事务内 `.env` mktemp 快照，成功/回滚后即删——**非数据备份** | `ops/deploy/remote-deploy.sh:37-44/:76` |
| ops/recovery | 仅 `fence-reflow-repair.ts`（围栏数据修复脚本）——非备份 | `ops/recovery/` 目录亲证 |
| 文档承诺 | README/ops 零备份声明；架构面**反向依赖**（退役条件/擦除 sink/外部依赖清单三处把备份当应有物） | `rag-production-release-runbook.md:195/:257`；`privacy-deletion-sink-inventory.md:123`；`requirements/use-cases/expert-interview-coach-agent-graph.md:785/:924` |
| 词面假阳性登记 | 「backup」现有多义：MODEL_BACKUP_*=模型故障切换**备用端点**计费 env；remote-deploy .env 事务快照——均与数据备份正交，EXEC 命名不得混淆 | `docker/compose.prod.yml:194-197/:289-293`；`docker/compose.ha.yml:213-235` |
| 措辞张力登记 | `remote-deploy.sh:6` 注释「数据库数据是持久卷」vs `compose.prod.yml:1-3`「no volumes」——EXEC 亲证预览宿主 DB 实际形态（云 RDS vs 宿主驻留）后如实记账，本刀不臆断 | 两锚如实并列 |
| 云侧 RDS 备份 | 云托管 RDS 可能自带平台备份——**仓库内零证据零承诺面**；云侧配置核验=EXEC 亲证登记项（不宣称·不依赖） | 无仓内锚（如实登记为空白） |

### 1.2 数据资产清单（本刀备份对象盘点）

| 资产 | 内容 | 承重面 | 锚 |
|---|---|---|---|
| **PostgreSQL 单面承重** | 业务全表+resume/OCR 密文工件（`ciphertext bytea`+pgcrypto 封装）+pgvector 向量（HNSW）+LangGraph PostgresSaver checkpoint+interview_event 账本（SSE 重放事实源） | **唯一持久数据面**——pins `PG-retained` 明文 | `packages/db/migrations/`（160 文件·至 0158）；`0001_baseline.sql:168/:188/:279-285`（pgcrypto/ciphertext/vector 扩展）；`0038_resume_ocr_artifact.sql:11`；`0121_resume_pgcrypto_runtime_acl.sql:15-17`、`0151_pgp_sym_encrypt_grant.sql:21-22`（pgp_sym_decrypt 仅 app_role）；`ai-docs/delivery/north-star-ha.md:29`「retained = Postgres (+pgvector + PostgresSaver)」 |
| DB 登录分权 | migrator 供给四低权 runtime login（APP_RUNTIME/QBANK_CONTROL/PRIVACY_WORKER/RAG_CONTROL） | 备份登录选型=终裁点（§2-6） | `docker/env/migrate.env.example`（APP_RUNTIME_DB_USER 等四对） |
| Tair（RAG_REDIS_URL） | RAG 缓存+worker 唤醒通道 | 可重建性=EXEC 亲证登记点；**本刀不纳入备份面** | `docker/compose.prod.yml:65`；`apps/worker/src/rag-redis-cache.ts`；`apps/worker/src/worker-job-wakeup-redis.ts` |
| 对象存储 | OBJECT_STORAGE_* 仅 dev MinIO（:9009）+env 样例+e2e 脚本消费；**产品码（apps/packages src）零消费**——预览环境数据面无对象存储承重 | 非备份对象（如实登记） | `docker/compose.dev.yml:35-51/:63`；`docker/env/api.env.example:8-11`；`docker/env/worker.env.example:32-35`；产品码零命中（本席 rg 实证） |
| env 配置 | `/srv/meetwise-compose/.env` 机器一次性 provision 凭据（部署不下发）；无常驻副本 | 配置资产清单·本刀范围外（Ban 入产物） | `ops/deploy/remote-deploy.sh:28/:33`；`ops/deploy/bootstrap-ecs.sh:41-43` |
| 镜像 | ACR `@sha256` 摘要钉=可重拉部署事实 | 非备份对象（登记即可） | `ops/deploy/remote-deploy.sh:19-21` |
| dev 卷 | dev compose 有 `meetwise_postgres_dev/redis_dev/minio_dev` 三卷——**dev 数据非本刀对象**（演练种子库另起，见 §4-V2） | 参考 | `docker/compose.dev.yml:60-63` |

**靶心一句话**：持久数据全部押在单实例 PG 上（含密文 PII 工件/向量/checkpoint），而这唯一的持久面**没有任何仓库内备份机械、零演练、零证据**——R-26 就是这一句。

---

## §2 修法设计（预览环境尺度·简化优先 · EXEC 依此实现）

**载体原则：`docker/compose.prod.yml` 零原地改**（:1-3 cloud-only 契约连卷都禁·治理稳定契约）——备份机械落**独立非治理载体** `docker/compose.backup.yml` + `scripts/backup/` 脚本（沿 HA-2 C8 独立 proof compose 先例 `docker/compose.ha-2-proof.yml`·HA-1 非治理叠加层先例 `docker/compose.ha.yml`）。

| 件 | 修法（EXEC 依此实现） | 锚 |
|---|---|---|
| **W1 pg_dump 定时备份（主件）** | backup 服务：镜像复用 `pgvector/pgvector:pg16`（postgres 系镜像自带 pg_dump/pg_restore 客户端·零新镜像构建）；对 `BACKUP_DATABASE_URL`（EXEC 定名·不与 migrate 专用变量混挂）周期执行 `pg_dump -Fc` **单文件全库**（业务+checkpoint+向量+密文工件一体·简化优先）；产物落**宿主 bind 卷**（宿主路径 EXEC 定值入收据·建议与 `/srv/meetwise-compose` 同盘治理面）；容器安全形制沿 `x-container-runtime-security` 同款（read_only+cap_drop ALL+no-new-privileges+tmpfs /tmp·`docker/compose.prod.yml:124-131` 形制）。**定时形态二择一（双审终裁）**：甲=compose 服务内 interval 循环（自包含零宿主依赖·起草席推荐）；乙=宿主 cron/systemd timer（`bootstrap-ecs.sh:26-30` 刚清场全部 timer·宿主耦合·不推荐·若裁须给治理理由）。 | `docker/compose.ha.sandbox.yml:23-24`（pgvector 镜像先例）；`docker/compose.prod.yml:124-131` |
| **W2 备份完整性校验** | 每次 dump 落盘后立即执行：`pg_restore --list <dump>` 目录解析 EXIT=0（catalog 结构有效）+ sha256 记账 + size>0 断言；逐次收据 JSON（时间戳/dump 名/size/sha256/EXIT）落 `receipts/ha-4/` 形制目录（运行时收据落宿主卷侧·不落 git） | `rag-production-release-runbook.md:195`（「备份文件存在」≠演练——校验与 W3 分层） |
| **W3 restore 演练（隔离容器）** | 演练脚本：起 throwaway PG 容器（`pgvector/pgvector:pg16`——**restore 目标库必须 pgvector 在位**：dump 含 vector 扩展对象 `0001_baseline.sql:282`）→ `pg_restore` → 断言：restore EXIT=0 + 表清单集合与源库等值 + 哨兵种子表行数等值 + 抽样字段逐值等值 → 演练容器即弃。演练全在沙箱种子库上跑（est live=0） | `docker/compose.ha.sandbox.yml:23-42`（沙箱 PG 形制先例） |
| **W4 保留策略轮转** | `BACKUP_RETAIN_COUNT`（EXEC 定值·建议 7）份 FIFO 轮转：超限删最旧+轮转清单收据（删了哪份/剩哪份/为何）；**磁盘预算入收据**：dump 体积实测×保留份数 vs 预览宿主磁盘余量（单机 4G 信封宿主·Ban 静默超售磁盘） | `ha-1-redundancy-REQUEST.md:45`（单机 4G 预览信封语境） |
| **凭据与密文面（终裁点）** | pg_dump 登录选型（app runtime 登录 / 专用只读登录 / migrator 登录）=**EXEC 双审终裁**：pgp_sym_decrypt 仅授 app_role（`0121:15-17`·`0151:21-22`）⇒ dump 捕获的是**密文字节**、restore 后仍密文、不构成明文外泄；但 dump 文件本身=PII 关联资产：产物权限 0600/目录 0700 + **Ban 入 git** + Ban 凭据/明文入日志收据 | `0121_resume_pgcrypto_runtime_acl.sql:15-17`；`0151_pgp_sym_encrypt_grant.sql:21-22` |

---

## §3 逐条改动清单（EXEC 落码对账表 · 名字可随仓惯例定·文件不得私造清单外）

| # | 码面 | 现状（亲读） → 目标 |
|---|---|---|
| C1 | `docker/compose.backup.yml`（新增） | W1 载体：backup 服务（pgvector/pgvector:pg16 镜像·interval 循环或等价形态·宿主 bind 卷挂点·安全形制沿 compose.prod.yml:124-131 锚形）；**零触 compose.prod.yml/override** |
| C2 | `scripts/backup/`（新增·目录名 EXEC 可随仓惯例定） | dump 执行脚本（pg_dump -Fc+落盘命名）+校验脚本（pg_restore --list+sha256+size）+轮转脚本（RETAIN_COUNT FIFO）+演练脚本（§4-V2 全链）；env-gated 授权闸沿仓惯例（`MEETWISE_HA_*` 系先例 `scripts/ha/fault-inject.mjs:5-27` 同形·闸名 EXEC 定·协调方设） |
| C3 | 备份登录 provision（若终裁需专用登录） | 沿 migrate provision 面扩展（`docker/env/migrate.env.example` 四登录先例）——若终裁复用既有登录则本行零改动并落卷理由 |
| C4 | `receipts/ha-4/`（收据目录·EXEC 落卷时建） | V 矩阵收据（CMD+EXIT 逐条·他人可复跑）——沿 `receipts/ha-1/`、`receipts/ha-2/` 形制 |
| C5 | 文档面登记 | 备份运行手册一页（恢复步骤=谁·在哪·用什么命令·断言什么——落 ops/ 或 ai-docs/delivery/harness/·EXEC 定落点）；**零改 LEDGER/backlog SSOT**（nail 时才动） |

---

## §4 验证矩阵（全本地/沙箱 · est live=0 · 每项 CMD+EXIT+收据 · Ban retry-to-green）

| # | 验证 | 判据（PASS 语义） |
|---|---|---|
| V1 | 备份产出断言 | 沙箱种子 PG（含密文工件表+vector_chunk+checkpoint 面）→ 触发一次备份 → dump 文件存在+size>0+`pg_restore --list` EXIT=0+sha256/size 入收据 |
| V2 | restore 演练（隔离容器） | throwaway pgvector:pg16 容器 pg_restore 该 dump → EXIT=0 + 表清单集合与源库等值 + 哨兵种子表行数等值 + 抽样字段逐值等值（密文列比对**字节等值**即可·不解密）；演练容器销毁留收据 |
| V3 | 轮转策略断言 | 制造 RETAIN_COUNT+dummy 份 → 轮转后恰保留 N 份、最旧被删、保留集合与收据清单一致 |
| V4 | 定时形态断言 | 形态甲=间隔配置静态断言+连续两拍产出两份产物实录；形态乙（若终裁）=cron/timer 配置断言+一次手动触发实录；两种形态都断言「错过一拍不双跑」（幂等锁或等价机制） |
| V5 | compose config 断言 | `docker compose -f docker/compose.backup.yml config` EXIT=0；**先 stub 全部 `:?` 必填变量**（沿 HA-2 §9-3② 教训：缺值报错≠绿）；prod compose 合载（`-f compose.prod.yml -f compose.backup.yml`）config 亦 EXIT=0 且 prod 原 services 字段零漂 |
| V6 | 安全面断言 | 产物文件权限 0600/目录 0700；产物/日志/收据 grep 零密码串零 DATABASE_URL 明文；backup 服务 config 含 read_only/cap_drop/no-new-privileges；宿主 bind 卷路径不入 git |
| V7 | 既有零回归 | 本刀零产品码触碰（apps/packages src 零 diff）基线记账；markers=0 自检；V5 双 config 对 prod 面字段零漂实证 |

---

## §5 非范围（写死 · 越界即废）

1. **云存储上传/异地副本** → **S15 买云后刀**（本刀产物只落宿主本地卷；宿主整机故障=dump 同灭如实登记，不叙事容灾）。
2. **完整 PITR（WAL 归档/pg_basebackup/wal-g/时点恢复）** → 降级裁决：起草席推荐 **dump 定时档**（预览尺度下 RPO=备份间隔量级·如实；WAL 归档运维面重·与 EXTREV-7 简化优先相抵）；预览尺度是否必须完整 PITR=**双审终裁留位**——终裁要 PITR 则本 REQUEST 漂移须补审，不得由 EXEC 顺手加。
3. **R-22 DB 韧性 / R-47 告警** → 后刀；备份**失败告警/监控面不在本刀**（本刀只落收据与退出码）。
4. **隐私擦除对备份的延伸** → `backup_pitr` sink 维持 `honest_unresolved` **零翻转**（删除传播到备份=隐私线后刀）；本刀只保证 dump 含密文+权限面。
5. **预览宿主实机启用** → 本刀验证面=本地/沙箱 compose；预览宿主部署启用=另行协调方授权；云侧 RDS 平台备份配置的核验/变更=EXEC 只登记不操作。**est live=0**（零生产操作·零真实数据触碰·零模型外呼）。
6. **compose.prod.yml / override 原地改**（:1-3 cloud-only 契约+治理稳定契约）；既有 NOT_HA 钉/收据面/`probe.multi.mjs` fail-closed 零改零弱化。
7. RPO/RTO 业务签署目标（runbook:257 口径——须业务侧输入·本刀不签）。

---

## §6 Ban

1. Ban 原地改 `docker/compose.prod.yml`/override（§5-6）；Ban 备份服务暴露 0.0.0.0 端口（PG/备份面全容器网或宿主回环·沿 compose.prod.yml:250-253 铁律同口径）。
2. Ban 备份产物/凭据/DATABASE_URL 明文入 git、入收据正文、入日志；Ban 产物权限宽于 0600/0700。
3. Ban 把「有 dump 文件」叙事成 PITR/零数据丢失/RPO-RTO 达标（runbook:257「不是只证明备份文件存在」）；Ban 把演练 EXIT=0 叙事成「生产备份已生效」（预览宿主启用=另行授权）。
4. Ban 静默超售宿主磁盘（W4 预算必须实测入收据）。
5. Ban 触 privacy sink 面（`backup_pitr` 零翻转）·Ban 触 R-22 池参数·Ban 触 SSE/租约/停机链（HA-1/HA-2 已落面零回归）。
6. Ban 与 MODEL_BACKUP_*（模型备用端点）词面混用——备份变量命名须可区分（EXEC 定名入收据）。
7. Ban retry-to-green（attempts 全账）·Ban skip-as-pass·Ban secrets/Key 入库·Ban SSOT 无关触碰（LEDGER/backlog 只读引用·nail 时才改）。
8. Ban 自批/自审；alone≠dual；Dual PASS ≠ 开工。

---

## §7 pins（十一值照抄 `harness/entpay-slice2-REQUEST.md:139`·零翻转）

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained（业务+LangGraph PostgresSaver+pgvector；禁 MySQL/Qdrant 业务切流叙事） · 公开 DELETE=503（interview-data 行按 UNSTUB-ERASE supersession 现值照抄·interview-data 面仍 503 关闭·原值行代码块内零改） · g7SuiteGreen=false · r1Closed=false · 脚注 actualSpendCny=null（本刀零模型外呼·零消耗）

---

## §8 Non-claims

本刀 ≠ PITR ≠ 容灾 ≠ 异地备份 ≠ 云备份（S15）≠ HA（R-17 已落不重宣·本刀是 B3 配套件）≠ 「备份已生效」（实机启用=另行授权）≠ 擦除闭环（backup_pitr honest_unresolved 维持）≠ RPO/RTO 达标声明。dump 含密文工件 ≠ 备份可公开/可降权保管（密文≠脱敏·文件面仍 PII 关联资产）。restore 演练在沙箱种子库 PASS ≠ 生产库可恢复（生产首演=启用授权后的实机演练·另行）。V 矩阵 PASS ≠ DONE（claimDone=false · 完成判定走双审+nail）。

---

## §9 STOP（开工三条款 · 缺一不得动码）

1. **协调方开工授权**：LEDGER:136 HA 簇执行序内本刀顺位亲证（HA-2 收口状态由协调方确认）+ 沙箱授权闸（`MEETWISE_HA_*` 系=1 由协调方设·闸名 EXEC 定——备份 compose 拉起与演练不得默认可跑）。
2. **本档预执行双审 BOTH PASS**（mw-e2e-ha 系主审+第二域对抗·`reviews/REQUEST-2026-10-10-ha-4-backup-*-mw-*.md` 落卷）+ §2 两个终裁点有裁定（①定时形态甲/乙；②备份登录选型）+ §5-2 PITR 降级裁决有确认。
3. **EXEC 边界确认**：EXEC 不得改 §2 修法口径与 §6 Ban；漂移须回本 REQUEST 补审；任何越 §5 非范围冲动（顺手做 WAL 归档/云上传/动 privacy sink）= 停手上报。

任一缺失 → 保持 `draft:awaiting_pre_exec_dual`，零码动。

---

*HA-4 BACKUP REQUEST（起草） · 2026-10-10 · ha4-draft 席 · base `feat/mysql-schema-skeleton` @`9f6edf8f`（主线 tip 亲证） · R-26 P1 备份/PITR 未找到=全仓零备份机械零证据（§1.1 亲证表） · 修法=本地 pg_dump 定时+完整性校验+隔离容器 restore 演练+N 份轮转（预览尺度·简化优先） · 云上传归 S15·完整 PITR 降级裁决留双审 · est live=0 · pins 十一值零翻转 · markers=0 · ⛔push ⛔动主线仓 ⛔触其他工作树 · Ban self-approve · alone≠dual · Dual PASS ≠ 开工*

---

## §10 预执行双审落卷（EXEC 开工前 · append-only 登记 · 本节为补线与终裁账）

**双审状态**：席2 PASS＋席1 PASS（分歧无）·协调方明示授权 R-26 EXEC（开工三条款 §9-1/9-2/9-3 齐）。预执行双审卷（`reviews/REQUEST-2026-10-10-ha-4-backup-*-mw-*.md` 形制）未落仓，双席处方以协调方明示文本为准随本节与 EXEC 收据落卷（如实登记·不虚称卷面在位）。

**席1 补线（3 条 · EXEC 全兑现）**：
1. **①连接面沿 TLS 契约登记**：backup 服务连接变量独立定名 `BACKUP_DATABASE_URL`（与 migrate 面的 `MIGRATION_DATABASE_URL` / runtime 面 `RUNTIME_DATABASE_URL` 分离不混挂）；RDS 形态下该 URL 由机器一次性 provision 携带 `sslmode=verify-full&sslrootcert=/run/secrets/rds_ca`，`rds_ca` secret 与 compose.prod.yml:385-387 同源同定义（同一 `RDS_CA_HOST_PATH` 供值）。
2. **②pg_dump major ≥ RDS major 亲证登记入收据**：沙箱验证面 = pgvector:pg16 自带客户端（pg_dump 16.x）对 PG16 服务端 major 等值亲证；生产 RDS major 仓内零证据（如实登记空白），实机启用核验列入运行手册 checklist（客户端 16 ≥ 服务端 major 为启用前置断言，非本刀可证面）。
3. **③BACKUP_DATABASE_URL 沿 .env provision 先例**：机器一次性 provision、部署不下发（`ops/deploy/remote-deploy.sh:33` env_file_missing 守卫同口径；`ops/deploy/bootstrap-ecs.sh:46-53` .env provision 步骤同源——双席勘误：REQUEST §1.1 原载 `:41-43` 系 ssh 公钥安装步骤，.env provision 实锚 `:46-53`）。

**席2 三终裁（裁定·EXEC 全兑现）**：
1. **定时形态裁甲**：compose 服务内 interval 循环（自包含零宿主依赖·循环单线程顺序执行=构造性不双跑；幂等锁另设防御层）。
2. **备份登录**：最小权限专用只读登录优先（`BACKUP_DB_USER`/`BACKUP_DB_PASSWORD` 沿 migrate.env.example 四登录先例扩展·provision 面与 SQL 样例入运行手册）；**全库 dump 完备性为硬判据**（pg_dump 零表过滤零 --table/--exclude）；**V2 表清单等值为实测裁决**（源库↔restore 目标库表集合双向等值=完备性的实证判据）。
3. **PITR 降级确认**：dump 定时档（§5-2 降级裁决成立）；RPO=备份间隔量级如实登记（BACKUP_INTERVAL_SECONDS 默认 21600s=6h 量级），不叙事 PITR、不签 RPO/RTO 目标（runbook:257 口径维持）。

**双席勘误（REQUEST 原文锚漂移三处 · 原文零改·以本节为准）**：
- `ops/deploy/bootstrap-ecs.sh` `.env provision` 锚：REQUEST §1.1 载 `:41-43` → 实锚 `:46-53`（:41-43 为 ssh 公钥安装步骤）。
- `ai-docs/delivery/north-star-ha.md` 「retained = Postgres (+pgvector + PostgresSaver)」锚：REQUEST §1.2 载 `:29` → 实锚 `:32`。
- `requirements/use-cases/expert-interview-coach-agent-graph.md` 路径：仓内实路径带前缀 `ai-docs/`（根级 `requirements/` 不存在·亲证 ls EXIT=1）→ 实锚 `ai-docs/requirements/use-cases/expert-interview-coach-agent-graph.md:785/:924`（外部依赖「备份/恢复演练」反依赖语义零变）。

*`executed:awaiting_post_prove_dual`（EXEC 席 `ha4-exec` 落卷 @line/ha-4-backup：W1-W4+§3 C1/C2/C3/C5 全兑·V1-V7 终态 7/7 PASS（V1 产出 175 表 sha256 入账/V2 演练 24 角色预建零过滤 restore+表集双向等值+全表行数等值+密文字节 md5 等值零解密/V3 轮转双 retain 值+碎片清扫/V4 形态甲 4s 间隔 4 拍实录+锁探针 EXIT=4/V5 三 config 全绿+prod 四服务 byte-equal 零漂/V6 0600/0700+零凭据泄漏+零端口/V7 产品码零 diff+markers=0）·二次 rebase 干净（会话中主线推进 h1 链 9f6edf8f→141da56f·a4f8cd02→3d83b3b2 内容零改）·双席处方六条+三终裁+勘误三处全兑现（§10）·ACL 处置=先建角色零 --no-acl（24 角色全闭包入收据）·attempts 八组全账入 receipts/ha-4/exec-receipt.md·沙箱全灭 est live=0·RDS major 仓内零证据如实登记空白·实机启用 checklist 入 runbook §2·markers=0·est live=0·pins 十一值零翻转·⛔push·alone≠dual·待 post-prove 双审）*

*`rev2:post-prove-fix`（修复席 `ha4-exec2` 落卷 @line/ha-4-backup·基树 e02a3549：post-prove 双席裁决合并处方=席1 语义面 PASS·声明面 FAIL（F1+F2）+席2 FAIL 窄面勘误级同源→取强方案执行——**F1 补闸**：`scripts/backup/backup.sh` 头部（锁检查前）补 `MEETWISE_HA4_BACKUP_AUTHORIZED` 同形闸（exit 3·+9 行·闸外逻辑零触）→「四入口 loop/beat/seed/drill 缺省拒跑 exit 3」声明为真·**四入口负控实录齐**（beat/loop/seed/drill 各 EXIT=3 落 `receipts/ha-4/gate-negative-control.receipt.json`+exec-receipt.md §9-2 gateNegativeControl 段四条·beat 正控复跑 EXIT=0 stamp 193712Z 收据在卷·V4b 锁探针授权态复验 EXIT=4=闸纯增量实证·沙箱即用即灭 0 容器）·**F2 勘误**：V4 拍戳「191143/47/51/55」→落卷实物「191147/51/55/59」（log=loop 第 2-5 拍·191143Z 未落卷如实登记·严格递增实质成立保留·exec-receipt.md:49+verification-matrix.md:13 原文零改注记承载）·**行锚系统性重钉**（席1 处方③）：compose.backup.yml 86→79 行+安全锚 :37-44+backup.sh/restore-drill.sh/rotate.sh 锚全表实值重钉（exec-receipt.md §9-5）·**收据双侧断言建议落卷**（席1 nano）：restore-drill.sh:215 clientGteServer 硬编码→实机首演建议双侧计算断言注记（零改码）·**V7 复验**：vs merge-base 141da56f 产品码 0 diff·markers=0（五 token 0 命中）·主线再推进 141da56f→3af029a9 如实登记（16 产品路径 diff 系他刀 entpay-slice3/ha-5 主线落卷·非本分支·rev2 零 rebase 归协调方合并裁决）·零语义改动（闸外零触）·零产品码触碰·est live=0·pins 十一值零翻转·⛔push·alone≠dual·待 post-prove 复审）*

---

## nail 落卷（2026-10-11 · post-prove 双席 PASS+rev2 勘误席2 确认）

**双审结果**：席1（备份/restore 语义）语义面 PASS·声明面 FAIL（F1 授权闸账面失实+F2 V4 拍戳漂一位）+席2（治理/回归）FAIL 窄面勘误级同源（F1/F2 同）→ rev2 修复落卷 @e58541a8（F1 取席1 推荐案补闸让「四入口」声明为真 +112/-0 纯追加）→ 席2 窄域确认「R-26 可 nail」（三项全过·四入口负控独立重跑 EXIT=3×4·正控复跑在卷·残余无阻断）。merge 落主线 @007b718f（席2 nail 合并点两断言重验：①产品文件集=16 与主线推进全等归因账实相符 ②V5 prod 四服务 byte-equal 切片 cmp 形零漂·markers=0）。

**V 矩阵（7/7 PASS）**：V1 备份产出（160 迁移·175 表·sha256）·V2 restore 演练（24 角色预建 ACL 显式处置·表集双向等值·密文字节等值零解密·容器即弃）·V3 轮转（retain 7/2 两形）·V4 定时甲 4s×4 拍严格递增+锁探针 EXIT=4·V5 config 三连+prod byte-equal·V6 安全面（0600/0700·零凭明文）·V7 零产品码回归。

**诚实边界（随卷）**：≠PITR≠容灾≠「备份已生效」·dump 档 RPO=间隔量级如实·生产 RDS major 空白登记（启用 checklist）·实机启用另行授权·云上传=S15·WAL 归档留后刀·backup_pitr 零翻转。

**Status**: `nail:closed`（post-prove 双席 PASS+rev2 勘误席2 确认·merge 落主线 @007b718f·R-26 备份闭环正式解除·HA 簇 R-17/18/19/22/26/47 全动码收口完成·markers=0·est live=0）。
