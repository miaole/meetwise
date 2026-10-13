# HA-4 验证矩阵（V1-V7 · 沙箱 · est live=0 · CMD+EXIT 逐条他人可复跑）

前置：`cd` 仓库根（worktree `meetwise-ha4`）·闸 `MEETWISE_HA4_BACKUP_AUTHORIZED=1`（协调方授权）·沙箱材质在 `.tmp/ha4-backup/`（gitignored）。

| # | 验证 | CMD（原样复跑） | EXIT | 判据落点 |
|---|---|---|---|---|
| 闸负控 | 缺省拒跑 | `bash scripts/backup/sandbox-seed.sh`（不设闸） | **3** | `ha4_seed_not_authorized` |
| 种子 | 全迁移+哨兵 | `MEETWISE_HA4_BACKUP_AUTHORIZED=1 bash scripts/backup/sandbox-seed.sh` | **0** | `applied=160 tables=175`+`ha4_seed_ok`；`receipts/ha-4/seed.receipt.json` |
| V1 | 备份产出 | `MEETWISE_HA4_BACKUP_AUTHORIZED=1 BACKUP_DATABASE_URL='…backup-seed-pg…sslmode=disable' BACKUP_DIR_HOST=.tmp/ha4-backup/backups RDS_CA_HOST_PATH=$PWD/.tmp/ha4-backup/dummy-rds-ca.pem docker compose -f docker/compose.backup.yml -f docker/compose.backup.sandbox.yml --project-directory . run --rm backup sh /work/backup-scripts/backup.sh` | **0** | `ha4_backup_ok stamp=20261010T190809Z size=1801971 sha256=dcfaebdf… toc_tables=175`；`receipts/ha-4/backup-20261010T190809Z.json`（pgRestoreListExit=0·clientGteServer=true·mode 0600） |
| V2 | restore 演练 | `…docker compose -f docker/compose.backup.yml -f docker/compose.backup.sandbox.yml --project-directory . --profile ha4-drill run --rm -e DRILL_DUMP_PATH=/backups/meetwise-20261010T190809Z.dump restore-drill sh /work/backup-scripts/restore-drill.sh`（目标容器先 `down` 保洁净） | **0** | `ha4_drill_ok restore_exit=0 tables=175 nonempty=19 roles_precreated=24 ciphertext_bytes_equal=true`；`receipts/ha-4/v2-restore-drill.receipt.json`（tableSetEqualBothDirections=true·rowCountsEqualAllTables=true·decryptionPerformed=false·aclDisposal=pre-created 24） |
| V3a | 轮转 retain=7+碎片清扫 | 植 3 假档（带 ok 收据）+1 碎片档（无收据）→ `docker run --rm -v $PWD/scripts/backup:/work/backup-scripts:ro -v $PWD/.tmp/ha4-backup/backups:/backups pgvector/pgvector:pg16 sh -c 'BACKUP_DIR=/backups BACKUP_RETAIN_COUNT=7 sh /work/backup-scripts/rotate.sh'` | **0** | stdout=`["meetwise-20991231T235959Z.dump"]`（碎片即删）·`rotation-20261010T191100Z.json` keptCount=4 与卷一致 |
| V3b | 轮转 retain=2 | 同上 `BACKUP_RETAIN_COUNT=2` | **0** | `rotation-20261010T191106Z.json` kept=[190809,0103] deleted=[0102,0101]·卷实物恰 2 档 |
| V4 | 两拍实录 | `…up -d backup`（`BACKUP_INTERVAL_SECONDS=4`）→ sleep 13 → `docker logs meetwise-ha4-backup-backup-1` | **0** | 拍戳 `191143/191147/191151/191155`（delta 4,4,4·严格递增=顺序无重叠）；卷侧 `backup-20261010T1911{47,51,55}Z.json` |
| V4b | 幂等探针（错过一拍不双跑） | `docker run --rm -v $PWD/scripts/backup:/work/backup-scripts:ro -v $PWD/.tmp/ha4-backup/backups:/backups pgvector/pgvector:pg16 sh -c 'mkdir /tmp/ha4-backup.lock && BACKUP_DIR=/backups BACKUP_DATABASE_URL=unused-probe sh /work/backup-scripts/backup.sh; rc=$?; rmdir /tmp/ha4-backup.lock; exit $rc'` | **4** | `ha4_backup_already_running…without double-running`·零新产物（锁=构造性顺序+防御层双证） |
| V5 | config 三连 | `docker compose -f docker/compose.backup.yml --project-directory . --env-file .tmp/ha4-config-stubs.env config -q`；`docker compose -f docker/compose.prod.yml -f docker/compose.backup.yml --project-directory . --env-file .tmp/ha4-config-stubs.env config`；prod-only 同形 | **0/0/0** | stub=87 vars；prod 四服务逐一切片 byte-equal（97/108/167/41）·merged 仅增 backup+default 网+同名 rds_ca secret |
| V6 | 安全面 | `ls -la` 卷；`grep -rc "postgres://\|sslmode=\|ha4_sandbox_dummy" receipts/ha-4/ 卷receipts evidence`；config 切片 grep read_only/cap_drop/ports | — | 0600/0700·**0 命中**·read_only+cap_drop ALL+no-new-privileges·ports=0 expose=0·bind 路径 HEAD 0 命中（`v6-security.receipt.json`） |
| V7 | 零回归 | `git diff --name-only feat/mysql-schema-skeleton -- apps/ packages/ ops/ e2e/ \| wc -l`；markers grep | **0/0** | 改动集=新增件+REQUEST+env.example+收据（`v7-regression.receipt.json`） |

复跑注意：①V2 前须 `--profile ha4-drill down`（目标容器跨 run 常驻·角色为集群级·复用会使 rolesPrecreated=0——机制仍绿但非洁净单 run 记录）；②种子库为 tmpfs·`down -v` 即灭·重跑先 `sandbox-seed.sh`；③沙箱哑 URL 只允许出现在 compose.backup.sandbox.yml（先例形）·禁入收据/日志。

**rev2 勘误与补线注记（append-only · 2026-10-10 · `ha4-exec2` · 上文原文零改·详见 exec-receipt.md §九）**：
① **V4 行拍戳勘误**：`191143/191147/191151/191155` → 落卷实物 **`191147/191151/191155/191159`**（`v4-backup-loop-full.log` 实录=loop 第 2-5 拍·191143Z 收据未落卷如实登记；卷侧 `backup-20261010T1911{47,51,55}Z.json` 三件在位·191159Z 拍收据未提交）。interval=4s·delta 4,4,4·严格递增实质成立注记保留。
② **F1 补闸**：`scripts/backup/backup.sh` 头部补 `MEETWISE_HA4_BACKUP_AUTHORIZED` 闸（exit 3·锁检查前·四入口同形收口）→ 四入口负控实录齐：beat/loop/seed/drill 各 EXIT=3（CMD 逐条见 `gate-negative-control.receipt.json`）；beat 正控复跑 **EXIT=0**（stamp `20261010T193712Z`·size 1801975·sha256 `f98466f2…`·toc 175/174·收据 `backup-20261010T193712Z.json`）；V4b 锁探针授权态复验 **EXIT=4** 零产物（闸先于锁·锁层零变）；沙箱即用即灭终态 0 容器。
③ **复跑注意追加④**：V4b 探针 CMD 现须并设 `MEETWISE_HA4_BACKUP_AUTHORIZED=1` 方达锁层（rev2 闸先于锁；未设闸即在闸处 exit 3 不及锁——原样 CMD 的 EXIT=4 实录属 e02a3549 树·仍然有效于其执行时点）。
④ **V7 基线注记**：产品码零 diff 判据=vs merge-base `141da56f`（0 文件）；vs 已推进主线 tip `3af029a9` 的 16 个产品路径 diff 文件系他刀（entpay-slice3/ha-5）主线落卷·非本分支产物。markers=0（五 token TODO/FIXME/XXX/PLACEHOLDER/待填 grep 0 命中）。
