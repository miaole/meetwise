# HA-4 EXEC 收据 · R-26 备份（pg_dump 定时档+完整性校验+隔离容器 restore 演练+RETAIN_COUNT 轮转）

**席**: `ha4-exec` · **分支**: `line/ha-4-backup` · **任务书**: `ai-docs/delivery/harness/ha-4-backup-REQUEST.md`（§1 W1-W4 + §4 V1-V7 + §9 双审终裁 + §10 双席补线落卷）
**Base**: 开工时主线 `feat/mysql-schema-skeleton` @`9f6edf8f`（merge-base=tip → 首次 rebase no-op·"up to date" EXIT=0）；**会话中途主线推进**（h1 docs-only 链 `61034dab`/`1e5e218a`/`6fda16ee`/`141da56f` 落主线）→ **二次 rebase 干净零冲突**（a4f8cd02→3d83b3b2 内容零改·stash -u→rebase→pop·落卷树=`141da56f`+本提交）
**日期**: 2026-10-10 · **markers=0** · **est live=0**（零 Key 零外呼零模型调用·零生产操作·零真实数据触碰·沙箱全灭已 down -v）· **pins 十一值零翻转**

---

## 一、rebase 重定位与双席勘误（逐锚亲证）

| 锚 | REQUEST/补线记载 | 实物（落卷树亲证） | 判 |
|---|---|---|---|
| `ops/deploy/remote-deploy.sh` .env provision | :33 | :33 `env_file_missing…机器一次性 provision` | 零漂 |
| `ops/deploy/bootstrap-ecs.sh` .env provision | 原载 :41-43 → **勘误 :46-53** | :46-53（==4 步·.env 保留/0600）；:41-43 系 ssh 公钥安装 | 勘误成立（席1③） |
| `ai-docs/delivery/north-star-ha.md` retained 行 | 原载 :29 → **勘误 :32** | :32 「retained = Postgres (+pgvector + PostgresSaver)」 | 勘误成立 |
| `requirements/use-cases/…` 路径 | 原载根级 → **勘误加前缀 `ai-docs/`** | 根级 `requirements/` 不存在（ls EXIT=1）；`ai-docs/requirements/use-cases/expert-interview-coach-agent-graph.md:785/:924`「备份/恢复演练」外部依赖语义在位 | 勘误成立 |
| `docker/compose.prod.yml` cloud-only 契约/安全锚/rds_ca | :1-3 / :124-131 / :385-387 | rebase 后逐条对齐（:385-387 secrets.rds_ca 定义零漂·stop_grace_period×2=HA-2 既有） | 零漂 |

## 二、双席处方兑现（§10 全兑）

| 处方 | 兑现 |
|---|---|
| 席1-① TLS 契约连接面 | `docker/compose.backup.yml:20-25` 注记+`BACKUP_DATABASE_URL` 独立变量（:53）不与 `RUNTIME_/MIGRATION_DATABASE_URL` 及四低权登录混挂；`secrets: [rds_ca]`（:79）同源 `RDS_CA_HOST_PATH`（:82-83）；RDS 形态 sslrootcert 契约写入变量描述+runbook §1 |
| 席1-② pg_dump major ≥ RDS major | beat 内硬断言（`scripts/backup/backup.sh:75-84` fail-loud exit 1）+逐拍入收据 `versions.clientGteServer`；演练面三侧比对（`restore-drill.sh` receipt `versions`）；**生产 RDS major 仓内零证据=如实登记空白**，启用核验入 runbook §2-1 |
| 席1-③ BACKUP_DATABASE_URL 沿 .env provision 先例 | compose `:?` 必填（不 default）+runbook §1 provision 表（remote-deploy.sh:33/bootstrap-ecs.sh:46-53 同口径） |
| 席2-① 定时形态甲 | compose 服务 interval 循环（`backup-loop.sh` 顺序循环·构造性不双跑）+mkdir 幂等锁防御层（V4 探针 exit 4 实证） |
| 席2-② 专用只读登录+全库完备性硬判据 | `docker/env/migrate.env.example` 追加 `BACKUP_DB_USER/PASSWORD` 模板对（+8 append·provision SQL 在 runbook §1）；dump 零表过滤（`pg_dump --format=custom` 裸调）；V2 表清单双向等值实测裁决=完备性实证（175/175） |
| 席2-③ PITR 降级 dump 定时档 | runbook §4 如实边界（RPO=间隔量级·默认 21600s；`BACKUP_INTERVAL_SECONDS` 秒级可配·沙箱定值 4s 入 V4 收据）；无 WAL 归档零触碰 |

## 三、W1-W4 落码对账（file:line·全亲测）

| 件 | 落点 |
|---|---|
| **W1 载体+服务** | `docker/compose.backup.yml`（86 行·非治理独立件·零触 prod/override）：安全锚复制形制 `:10-16`（prod :124-131 同款·注释声明锚不可跨文件）、`backup` 服务 :18-79（pgvector/pgvector:pg16 :20·command=loop :23-24·`BACKUP_DATABASE_URL` :? :52-53·interval 默认 21600s 秒级 :55-57·retain 默认 7 :58·bind 卷 :64-77·rds_ca :79）、零 ports/expose；`docker/compose.backup.sandbox.yml`（沙箱 overlay·name=meetwise-ha4-backup·seed-pg 回环 15433·哑凭据沿 ha.sandbox 先例·drill 目标+driver 双 throwaway·profile ha4-drill） |
| **W2 三件套校验** | `scripts/backup/backup.sh`：`pg_dump --format=custom`（:41·零表过滤）→ `pg_restore --list` EXIT 硬断言（:45-53）→ TOC 计数锚定 regex（:54-57 `^[0-9]+; 1259 [0-9]+ TABLE `，ACL 行不误配）→ size>0（:58-61）→ sha256（:73）→ major 断言（:75-84）→ 逐拍 JSON 收据（:99-112·卷侧不落 git·0600） |
| **W3 restore 演练** | `scripts/backup/restore-drill.sh`（闸 :32-35·目标=独立 throwaway 容器 TCP :56-71·T4 TOC 完备 :82-95·**ACL 显式处置** :97-118 先建角色+闭包断言·零过滤 restore :120-126·T1 表集双向 :128-142·T2 行数全表 :144-163·T3 密文字节 md5 聚合零解密 :165-181·收据 :183-215） |
| **W4 轮转+磁盘预算** | `scripts/backup/rotate.sh`（两段式：碎片清扫 :27-45→FIFO :47-60→收据 :70-82·`ROTATE_EXCLUDE_STAMP` 当拍豁免）；磁盘预算=沙箱实测 dump 1,801,971 B×7≈12.0 MiB·卷目录实测 8,640 KiB·宿主 df 可用 55.5 GiB（`df -k` 实读 58,258,260 KiB）；生产启用公式（实测首拍×N×1.5 峰值系数）入 runbook §2-2 |
| **C3 provision** | `docker/env/migrate.env.example` +8（BACKUP_DB_USER/PASSWORD 空模板·provision SQL=runbook §1·migrate CLI 不 provision 该角色·注释如实） |
| **C5 runbook** | `ai-docs/delivery/harness/ha-4-backup-runbook.md`（恢复步骤=谁/在哪/命令/断言 §3·启用 checklist §2·诚实边界 §4·零改 LEDGER/backlog） |
| **闸** | `MEETWISE_HA4_BACKUP_AUTHORIZED=1`（loop/beat/seed/drill 四入口缺省拒跑 exit 3·负控实录 EXIT=3 在 v5-config.receipt.json·协调方本刀明示授权=闸放行依据） |

## 四、V1-V7 实录（CMD+EXIT·细节随同目录 JSON）

| # | 验证 | 结果 | 关键读数（CMD 见 verification-matrix.md） |
|---|---|---|---|
| V1 | 备份产出 | **PASS** EXIT=0 | 沙箱种子（全 160 迁移+哨兵·`seed.receipt.json` tables=175 resume=1 resume_blob=1 vector_chunk=1 checkpoints/blobs/writes=1·server 16.15）→ beat `meetwise-20261010T190809Z.dump` 存在 1,801,971 B 0600·`pg_restore --list` EXIT=0·toc 175/174·sha256 `dcfaebdf…`·收据 `backup-20261010T190809Z.json` |
| V2 | restore 演练 | **PASS** EXIT=0 | throwaway pgvector:pg16 目标容器·**24 角色显式预建**（app_role/memory_runtime/… 全闭包断言·零 --no-acl 零过滤）→ restore EXIT=0·表集双向等值 175/175·全表行数等值（非空 19 表）·resume_blob/checkpoint_blobs 密文字节 md5 等值·零解密·容器即弃 |
| V3 | 轮转 | **PASS** EXIT=0 | V3a retain=7：碎片档（无 ok 收据）被清扫+4 收据档全保·收据 kept/deleted 与卷实物一致；V3b retain=2：恰留 2 最新（190809+0103）·恰删 2 最旧（0102+0101） |
| V4 | 定时形态 | **PASS** | 甲形态 loop：4 拍连续实录 `191143/47/51/55`（interval=4s·delta 4,4,4·时间戳严格递增=顺序无重叠·`v4-backup-loop-full.log`）；幂等探针（预持锁）→ `ha4_backup_already_running` **EXIT=4** 零新产物；失败拍 loop 存活实录（version-gap 红×6 拍后自愈重绿·见 attempts） |
| V5 | compose config | **PASS** EXIT=0×3 | backup-only / merged / prod-only 全绿（stub 87 vars）；prod 四服务零漂（migrate 97/api 108/worker 167/web 41 行 byte-equal）；闸负控 EXIT=3 |
| V6 | 安全面 | **PASS** | 产物 0600/目录 0700；收据+日志+evidence grep `postgres://`/`sslmode=`/哑密串 **0 命中**；config 含 read_only/cap_drop ALL/no-new-privileges；ports=0 expose=0；bind 路径 `git grep` HEAD 0 命中 |
| V7 | 零回归 | **PASS** | apps/packages/ops/e2e 零 diff；改动集=新增件+REQUEST(m)+env.example(+8)；markers=0；V5 双跑零漂；pins/privacy sink 零翻转 |

## 五、磁盘预算（W4 · 实测入收据）

沙箱：单份 dump 1,801,971 B（全 175 表 schema+19 非空表种子）·retain 7 → 峰值 ≈12.0 MiB；卷目录实测 8,640 KiB（4 档）；宿主 df 可用 58,258,260 KiB。**生产尺度读数不可得（est live=0 零生产操作）**——启用 checklist（runbook §2-2）钉死：`df` 余量 ≥ 首拍实测×N×1.5，未过不得启用（禁静默超售）。

## 六、停止条件核查

沙箱起不来：未触发（seed/drill/beat 容器全生命周期可控）；restore 演练数据不一致：未触发（终版全绿；过程红=顺序不稳定假阳性·见 attempts）；V 矩阵红：未触发（终态 7/7 PASS）。

## 七、诚实边界与非宣称

本刀 ≠ PITR ≠ 容灾 ≠ 异地备份 ≠ 「备份已生效」（预览宿主实机启用=另行授权·runbook §2 checklist 为启用前置非本刀可证面）；生产 RDS major 仓内零证据（空白如实登记）；restore 演练 PASS ≠ 生产库可恢复（生产首演=启用后实机）；`backup_pitr` honest_unresolved 零翻转；V 矩阵 PASS ≠ DONE（claimDone=false·走双审+nail）；loop 容器 SIGTERM 默认死（无优雅陷阱·无状态 cron 形·碎片由轮转清扫兜底·告警面归 §5-3 非范围）。

## 八、attempts 全账（Ban retry-to-green · 红因全录·产品码零触）

1. seed#1/#2 红：checkpoint 隐私围栏 `checkpoint_privacy_fenced`（0047 触发器查 enrollment+`app.principal_user`/`app.checkpoint_thread_id`/`app.checkpoint_epoch` 三 GUC）→ 修 seed 沿围栏播种（SET LOCAL·零触 DDL/触发器）。
2. 循环拍红×6：`set -o pipefail` dash 不支持+版本 sed BRE 备择形失配→ fail-loud 路径按设计工作（拍红 loop 存活·收据/退出码落账）→ `set -eu`+`^pg_dump.* ([0-9]+)\.` 解析。
3. TOC 计数 0：tab 形 grep 失配（TOC 实为空格分隔）→ 锚定 regex `; 1259 …TABLE `。
4. rotate JSON 损毁一拍：stdout 尾空行被命令替换剥除→`tail -1` 吃进 summary 行 → stdout=纯 JSON 数组·summary 移 stderr。
5. 轮转自噬一拍：beat 收据后写→当拍档被碎片清扫误删 → `ROTATE_EXCLUDE_STAMP` 豁免+清扫先于 FIFO。
6. drill 演化红×5：DRILL_DUMP_PATH 需 `-e` 透传；`cap_drop ALL` 下 gosu 不可 setuid → 目标改独立 throwaway 容器（TCP 恢复=更忠实事故路径·driver 保持锚形零弱化）；库级重置替代 schema 级（extension 残留）；`down --remove-orphans` 误灭 tmpfs 种子（fail-loud 抓到 source=0）→ 重种。
7. V2 T2 红×2：UNION ALL 无外层 ORDER BY 被 planner 重排（ANALYZE 状态差异）→ 两侧加 `ORDER BY 1`（数据实等值·diff 对读自证）。
8. 主线中途推进：h1 链并入（9f6edf8f→141da56f）→ 二次 rebase 零冲突+V5/V7 全量复验（双跑同绿）。

**沙箱终态**：`compose --profile ha4-drill down -v --remove-orphans` EXIT=0·meetwise-ha4-* 容器 0 台·邻 worktree 容器（meetwise-ha-dual-postgres）零触碰。
