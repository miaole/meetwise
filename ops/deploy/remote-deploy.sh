#!/usr/bin/env bash
# 精简 CD —— 机器侧部署脚本(替代原 2571 行 meetwise-cd 控制器 + 27 步事务链)。
#
# 设计取舍:那台 4G ECS 用 docker compose 跑 api/worker/web,镜像在 CI 里构建并
# 以 @sha256 摘要推到 ACR;本脚本只做「拉新镜像 → 幂等迁移 → 起服务 → 健康检查 →
# 失败回滚」。数据库数据是持久卷、迁移是幂等(只应用未跑过的),所以**不再**每次部署
# 重灌/重校验合成 showcase 数据——那是一次性手动的事,不进部署路径。
#
# 由 GitHub Actions 经 SSH 调用:
#   ssh meetwise-ecs 'bash -s -- <backend_ref> <web_ref>' < ops/deploy/remote-deploy.sh
# 其中 *_ref 是完整的 <registry>/<ns>/<image>@sha256:<digest>(摘要即被部署事实,
# tag 只用于人读定位)。
set -euo pipefail

BACKEND_REF="${1:?usage: remote-deploy.sh <backend_ref@sha256> <web_ref@sha256>}"
WEB_REF="${2:?usage: remote-deploy.sh <backend_ref@sha256> <web_ref@sha256>}"

# 摘要必须是内容寻址的 @sha256,拒绝可变 tag —— 保证「审批的镜像」= 「运行的镜像」。
for ref in "$BACKEND_REF" "$WEB_REF"; do
  [[ "$ref" =~ ^[A-Za-z0-9._/-]+@sha256:[a-f0-9]{64}$ ]] || { echo "deploy_ref_not_pinned_by_digest:$ref" >&2; exit 2; }
done

PROJECT_DIR=/srv/meetwise-compose
COMPOSE_FILE="$PROJECT_DIR/docker/compose.prod.yml"
ENV_FILE="$PROJECT_DIR/.env"
dc() { docker compose --project-directory "$PROJECT_DIR" -f "$COMPOSE_FILE" "$@"; }

[[ -f "$COMPOSE_FILE" ]] || { echo "compose_file_missing:$COMPOSE_FILE" >&2; exit 2; }
[[ -f "$ENV_FILE" ]] || { echo "env_file_missing:$ENV_FILE (secrets/DB creds 由机器一次性 provision,部署不下发)" >&2; exit 2; }

# 1. 快照当前生效的镜像行,供失败回滚。.env 里除这两行外都是一次性 provision 的
#    云凭据/模型 key,本脚本一律不碰。
BACKUP="$(mktemp)"; cat "$ENV_FILE" > "$BACKUP"

restore_and_fail() {
  echo "deploy_failed → 回滚到上一版镜像" >&2
  cat "$BACKUP" > "$ENV_FILE"
  # 尽力把上一版重新拉起;回滚本身失败也如实退非零,让部署红着可重试。
  dc up -d --no-deps --wait --wait-timeout 180 api worker web >&2 || echo "rollback_restart_failed(需人工介入)" >&2
  rm -f "$BACKUP"
  exit 1
}
trap restore_and_fail ERR

# 2. 只重写两行镜像引用(用 @sha256 钉死),其余 .env 原样保留。
tmp_env="$(mktemp)"
grep -vE '^(BACKEND_IMAGE|WEB_IMAGE)=' "$ENV_FILE" > "$tmp_env"
printf 'BACKEND_IMAGE=%s\n' "$BACKEND_REF" >> "$tmp_env"
printf 'WEB_IMAGE=%s\n' "$WEB_REF" >> "$tmp_env"
# 原地覆盖写:/srv/meetwise-compose 目录是 root 属主,部署账号不能在其中 unlink/新建
# (install/mv 会失败);.env 本身归部署账号,truncate+写同一 inode 只需文件写权限。
cat "$tmp_env" > "$ENV_FILE"; rm -f "$tmp_env"

# 3. 拉新镜像(拉取失败即回滚,不动运行中的旧版)。
dc pull

# 4. 迁移:一次性服务,跑到结束;非零退出 → trap 回滚。迁移幂等,只应用新增。
dc run --rm migrate

# 5. 起/滚动更新长期服务,--wait 等 compose 内建健康检查(api:/readyz/api、
#    worker:/readyz/worker、web:/login)通过;超时/不健康 → trap 回滚。
#    --no-deps:migrate 已在上一步单独 run 过并退出;此处不让 depends_on 重复触发
#    一次性 migrate(否则 `--wait` 会一直等一个正常退出的服务而挂住)。
dc up -d --no-deps --wait --wait-timeout 180 api worker web

# 6. 成功:清理回滚快照,输出被部署的摘要身份。
trap - ERR
rm -f "$BACKUP"
echo "deploy_ok backend=$BACKEND_REF web=$WEB_REF"
