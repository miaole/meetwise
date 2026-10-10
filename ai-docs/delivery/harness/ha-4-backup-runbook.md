# HA-4 备份/恢复运行手册（R-26 · 预览环境尺度 · dump 定时档）

**状态**：机制+演练证据已落卷（`receipts/ha-4/`·EXEC @`line/ha-4-backup`）；**预览宿主实机启用=另行协调方授权**（非本册可宣称「备份已生效」）。本册不是 PITR 手册（WAL 归档不在本刀）；RPO=备份间隔量级如实（默认 6h）；宿主整机故障=dump 与宿主同灭（异地副本归 S15 后刀）；RPO/RTO 业务签署目标不在本册（`rag-production-release-runbook.md:257` 口径维持）。

## 1. 载体与分工（谁·在哪）

| 角色 | 谁执行 | 在哪 |
|---|---|---|
| 备份服务运行 | `docker/compose.backup.yml` 的 `backup` 服务（pgvector/pgvector:pg16·interval 循环形态甲） | 预览宿主 `/srv/meetwise-compose`（repo checkout·`--project-directory` 指仓库根） |
| 产物落盘 | 宿主 bind 卷 `BACKUP_DIR_HOST`（建议 `/srv/meetwise-compose 同盘` 治理面，如 `/srv/meetwise-compose/backups`；**操作员按机 provision，路径不入 git**） | 目录 0700·文件 0600·含密文 PII 关联资产 |
| 恢复演练 | `scripts/backup/restore-drill.sh`（throwaway 容器内执行） | 隔离容器·`--rm` 即弃 |
| 授权闸 | `MEETWISE_HA4_BACKUP_AUTHORIZED=1`（协调方设·缺省拒跑 exit 3） | 机器 `.env` provision |

**凭据 provision（沿 `.env` 机器一次性先例·`remote-deploy.sh:33`·`bootstrap-ecs.sh:46-53`）**——`.env` 追加（值不进仓不入册）：

```sh
BACKUP_DATABASE_URL=postgres://<BACKUP_DB_USER>:<BACKUP_DB_PASSWORD>@<rds-endpoint>/<db>?sslmode=verify-full&sslrootcert=/run/secrets/rds_ca
BACKUP_DIR_HOST=/srv/meetwise-compose/backups
BACKUP_INTERVAL_SECONDS=21600   # RPO=间隔量级·秒级可配
BACKUP_RETAIN_COUNT=7
RDS_CA_HOST_PATH=<宿主上未入仓的 PEM 路径>   # 与 compose.prod.yml 同源 secret
MEETWISE_HA4_BACKUP_AUTHORIZED=1              # 协调方授权后置位
```

**专用只读登录（席2 终裁·最小权限）**——由 migrator/DBA 在 RDS 上一次性执行（入 provision 面·不在部署路径）：

```sql
CREATE ROLE backup_readonly LOGIN PASSWORD '<机器一次性 provision>';
GRANT CONNECT ON DATABASE <db> TO backup_readonly;
GRANT USAGE ON SCHEMA public TO backup_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO backup_readonly;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO backup_readonly;
```

完备性硬判据（席2）：dump 零表过滤 + V2 表清单等值实测裁决（`receipts/ha-4/v2-restore-drill.receipt.json` `tableSetEqualBothDirections=true`）；启用后首演须在宿主重复该裁决（实机首演=启用授权后另行）。

## 2. 启用前置 checklist（每次实机启用逐条打钩）

1. **pg_dump major ≥ RDS major**（席1-②）：`docker run --rm pgvector/pgvector:pg16 pg_dump --version` 客户端 major（16）≥ `SELECT current_setting('server_version_num')::int/10000`（RDS major·仓内零证据·启用时亲证）。客户端低=必须换更高 major 客户端镜像，禁硬 dump。
2. **磁盘预算**：`df -m "$BACKUP_DIR_HOST"` 余量 ≥ 单份 dump 实测体积 × `BACKUP_RETAIN_COUNT` × 1.5 峰值系数；单份体积=首拍收据 `sizeBytes`（沙箱种子读数见 `receipts/ha-4/exec-receipt.md` 磁盘预算节）。禁静默超售（§6-4）。
3. `.env` 七值 provision 齐（上表）·`BACKUP_DIR_HOST` 目录 `install -d -m 0700`。
4. `docker compose -f docker/compose.prod.yml -f docker/compose.backup.yml --project-directory . config -q` EXIT=0 且 prod 四服务字段零漂（V5 复核命令同 `receipts/ha-4/v5-config.receipt.json`）。
5. 拉起：`docker compose -f docker/compose.prod.yml -f docker/compose.backup.yml --project-directory . up -d backup`；`docker compose logs backup | grep ha4_backup_ok` 首拍在位。

## 3. 恢复步骤（真事故路径·谁·在哪·用什么命令·断言什么）

**谁**：值班运维（docker 组成员）·**在哪**：预览宿主（dump 所在机）。假设源库已不可用。

```sh
# 1) 选档：取 BACKUP_DIR_HOST 内最新收据 PASS 的 dump（sha256 先验）
ls -1t "$BACKUP_DIR_HOST"/meetwise-*.dump | head -1
sha256sum "$BACKUP_DIR_HOST/<meetwise-<STAMP>.dump>"   # 对 beat 收据 records 的 sha256

# 2) 起替换 PG（RDS：从 dump 恢复到新实例；容器形态示例为临时宿主自愈档）
docker run -d --name meetwise-restore -e POSTGRES_PASSWORD='<一次性>' pgvector/pgvector:pg16

# 3) 预建角色（dump 不携带集群级角色——演练同款 ACL 处置·显式不静默）
docker exec meetwise-restore psql -U postgres -Atq -c \
  "SELECT quote_ident(rolname) FROM pg_roles WHERE rolname NOT LIKE 'pg\\_%'"   # 目标已有角色
# 把源库角色全集（可用 dump 内 `pg_restore --list` 的 OWNER 行或历史清单）按上差集逐个
# CREATE ROLE <name> NOLOGIN;  ——之后恢复零过滤（禁 --no-acl）

# 4) 恢复（零语句过滤）
docker exec -i meetwise-restore sh -c 'createdb -U postgres meetwise && pg_restore --format=custom --dbname="host=127.0.0.1 user=postgres dbname=meetwise"' \
  < "$BACKUP_DIR_HOST/<meetwise-<STAMP>.dump>"   # 或 pg_restore -h <新RDS> …

# 5) 断言（与演练同判据·receipts/ha-4/v2-restore-drill.receipt.json 同形）
#   a. pg_restore EXIT=0
#   b. 表清单集合与源库等值（pg_tables 双向 comm 空）
#   c. 全表行数等值（生成式 UNION ALL 计数两侧 cmp 等值）
#   d. 密文列字节等值（resume_blob/checkpoint_blobs encode hex md5 聚合等值·零解密）
# 6) 切流：把 RUNTIME_DATABASE_URL/MIGRATION_DATABASE_URL 等指向新端点→重跑 migrate→按部署手册拉起
```

**登记**：恢复完成后在 `receipts/ha-4/` 落一份实机演练收据（同 v2 字段形制）——「备份文件存在」≠演练（`rag-production-release-runbook.md:195`）。

## 4. 非范围与诚实边界（零翻转登记）

- **不是 PITR**：无 WAL 归档/时点恢复；恢复点粒度=`BACKUP_INTERVAL_SECONDS` 量级（默认 6h·上次成功拍至故障点之间的写入不可恢复——如实告知业务方）。
- **不是容灾**：dump 与宿主同盘同灭；异地副本=S15 后刀。
- **`backup_pitr` sink 维持 `honest_unresolved` 零翻转**（`privacy-erasure-preview.ts:42/:84`）；删除传播到备份=隐私线后刀。
- **失败告警/监控不在本刀**（§5-3）：失败只落收据+退出码；值守以 `docker compose logs backup` 的 `ha4_backup_beat_failed` 行与卷侧 `receipts/backup-*.json` `ok:false` 为观察面。
- `MODEL_BACKUP_*`=模型备用端点计费面，与本备份零关（词面正交·§6-6）。
