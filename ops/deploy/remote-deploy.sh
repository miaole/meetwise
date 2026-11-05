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
# 信号回滚:HUP/TERM/INT 与 ERR 同走 restore_and_fail(快照回写 .env+尽力拉回上一版),
# 连接掉线/调度器终止不再把 .env 留在半部署态。沙箱自测:bash ops/deploy/remote-deploy.sh
# --self-test(发真信号验证回滚,零 docker 依赖,走桩 compose)。
set -euo pipefail

SELF_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/$(basename "${BASH_SOURCE[0]}")"

# ── 信号回滚自测(真信号×桩 compose·不触真 /srv 与 docker daemon)───────────────
#   臂1 TERM 臂2 INT 臂3 HUP:.env 改写后立即发信号 → 断言 非零退出+.env 原样恢复
#      +回滚 up 恰一次;臂4 无信号走通 → 退出零+deploy_ok+.env 落新镜像行。
self_test() {
  local sandbox stubbin proj envf old_be old_web new_be new_web rc
  set -m  # 后台作业独立进程组:SIGINT 不被继承忽略(foreground SSH 会话里 INT 本就可捕获)
  sandbox="$(mktemp -d)"
  stubbin="$sandbox/bin"; proj="$sandbox/srv/meetwise-compose"
  mkdir -p "$stubbin" "$proj/docker"
  printf 'services: {}\n' > "$proj/docker/compose.prod.yml"
  printf 'services: {}\n' > "$proj/docker/compose.prod.override.yml"
  envf="$proj/.env"
  old_be="$(printf '1%.0s' {1..64})"; old_web="$(printf '2%.0s' {1..64})"
  new_be="$(printf 'a%.0s' {1..64})"; new_web="$(printf 'b%.0s' {1..64})"
  printf 'PROVISIONED_SECRET=never-touch\nBACKEND_IMAGE=reg/ns/img@sha256:%s\nWEB_IMAGE=reg/ns/img@sha256:%s\n' \
    "$old_be" "$old_web" > "$envf"
  cp "$envf" "$sandbox/env.orig"
  cat > "$stubbin/docker" <<'STUB'
#!/usr/bin/env bash
printf '%s\n' "$*" >> "${DOCKER_CALL_LOG:?}"
case "$*" in *pull*) sleep 3 ;; esac
exit 0
STUB
  chmod +x "$stubbin/docker"
  local failed=0 arm sig arm_pid calls
  for arm in TERM INT HUP none; do
    cp "$sandbox/env.orig" "$envf"  # 每臂复位 .env 到部署前态,臂间零串扰
    calls="$sandbox/calls-$arm.log"; : > "$calls"
    DEPLOY_PROJECT_DIR="$proj" PATH="$stubbin:/usr/bin:/bin" DOCKER_CALL_LOG="$calls" \
      bash "$SELF_PATH" "reg/ns/img@sha256:$new_be" "reg/ns/img@sha256:$new_web" >/dev/null 2>&1 &
    rc=0
    arm_pid=$!
    if [[ "$arm" != none ]]; then
      # 信号窗=.env 已改写为新镜像行(此后被终止即半部署风险面)
      for _ in $(seq 1 100); do grep -q "sha256:$new_be" "$envf" 2>/dev/null && break; sleep 0.05; done
      kill -s "$arm" "$arm_pid" 2>/dev/null || true
    fi
    wait "$arm_pid" || rc=$?
    if [[ "$arm" == none ]]; then
      if [[ $rc -eq 0 && "$(grep -c "sha256:$new_be" "$envf")" == 1 && "$(grep -c ' up -d --no-deps --wait' "$calls")" == 1 ]]; then
        echo "self-test arm[$arm]: PASS (exit 0 + env carries new refs + one up)"
      else
        echo "self-test arm[$arm]: FAIL (exit=$rc env_new=$(grep -c "sha256:$new_be" "$envf") ups=$(grep -c ' up -d --no-deps --wait' "$calls"))" >&2
        failed=1
      fi
    else
      if [[ $rc -ne 0 && "$(cmp -s "$envf" "$sandbox/env.orig" && echo same || echo diff)" == same && "$(grep -c ' up -d --no-deps --wait' "$calls")" == 1 ]]; then
        echo "self-test arm[$arm]: PASS (non-zero exit + env restored byte-identical + rollback up x1)"
      else
        echo "self-test arm[$arm]: FAIL (exit=$rc env_state=$(cmp -s "$envf" "$sandbox/env.orig" && echo restored || echo half-deployed) ups=$(grep -c ' up -d --no-deps --wait' "$calls"))" >&2
        failed=1
      fi
    fi
  done
  rm -rf "$sandbox"
  if [[ $failed -ne 0 ]]; then echo "self-test: FAILED" >&2; return 1; fi
  echo "self-test: 4/4 arms PASS"
}

if [[ "${1:-}" == '--self-test' ]]; then self_test; exit $?; fi

BACKEND_REF="${1:?usage: remote-deploy.sh <backend_ref@sha256> <web_ref@sha256>}"
WEB_REF="${2:?usage: remote-deploy.sh <backend_ref@sha256> <web_ref@sha256>}"

# 摘要必须是内容寻址的 @sha256,拒绝可变 tag —— 保证「审批的镜像」= 「运行的镜像」。
for ref in "$BACKEND_REF" "$WEB_REF"; do
  [[ "$ref" =~ ^[A-Za-z0-9._/-]+@sha256:[a-f0-9]{64}$ ]] || { echo "deploy_ref_not_pinned_by_digest:$ref" >&2; exit 2; }
done

PROJECT_DIR="${DEPLOY_PROJECT_DIR:-/srv/meetwise-compose}"  # 沙箱自测经 DEPLOY_PROJECT_DIR 注入,生产默认不变
COMPOSE_FILE="$PROJECT_DIR/docker/compose.prod.yml"
# 非治理叠加层:部署期运行时旋钮(如 web HOSTNAME=0.0.0.0),与受治理的
# compose.prod.yml 一起加载。后加载者覆盖/合并,故 override 里的键生效。
OVERRIDE_FILE="$PROJECT_DIR/docker/compose.prod.override.yml"
ENV_FILE="$PROJECT_DIR/.env"
dc() { docker compose --project-directory "$PROJECT_DIR" -f "$COMPOSE_FILE" -f "$OVERRIDE_FILE" "$@"; }

[[ -f "$COMPOSE_FILE" ]] || { echo "compose_file_missing:$COMPOSE_FILE" >&2; exit 2; }
[[ -f "$OVERRIDE_FILE" ]] || { echo "compose_override_missing:$OVERRIDE_FILE" >&2; exit 2; }
[[ -f "$ENV_FILE" ]] || { echo "env_file_missing:$ENV_FILE (secrets/DB creds 由机器一次性 provision,部署不下发)" >&2; exit 2; }

# 1. 快照当前生效的镜像行,供失败回滚。.env 里除这两行外都是一次性 provision 的
#    云凭据/模型 key,本脚本一律不碰。
BACKUP="$(mktemp)"; cat "$ENV_FILE" > "$BACKUP"

restore_and_fail() {
  trap - ERR HUP TERM INT  # 防重入:回滚自身不再被后续信号打断
  echo "deploy_failed → 回滚到上一版镜像" >&2
  if [[ ! -f "$BACKUP" ]]; then  # 信号早于快照=.env 未被触碰,无物可还
    echo "rollback_snapshot_missing(.env 未触·直接退非零)" >&2
    exit 1
  fi
  cat "$BACKUP" > "$ENV_FILE"
  # 尽力把上一版重新拉起;回滚本身失败也如实退非零,让部署红着可重试。
  dc up -d --no-deps --wait --wait-timeout 180 api worker web >&2 || echo "rollback_restart_failed(需人工介入)" >&2
  rm -f "$BACKUP"
  exit 1
}
trap restore_and_fail ERR HUP TERM INT

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
#    -T + </dev/null 关键:本脚本经 `ssh 'bash -s' < remote-deploy.sh` 从 stdin 读入;
#    `docker compose run`(默认分配 TTY 并代理 stdin)会吞掉脚本剩余行(下面的 up 与
#    deploy_ok),导致 up 从不执行、容器不被重建,却仍 exit 0 = 假绿。-T 禁 TTY、
#    </dev/null 断开 stdin,保证后续步骤照常执行。
dc run --rm -T migrate </dev/null

# 5. 起/滚动更新长期服务,--wait 等 compose 内建健康检查(api:/readyz/api、
#    worker:/readyz/worker、web:/login)通过;超时/不健康 → trap 回滚。
#    --no-deps:migrate 已在上一步单独 run 过并退出;此处不让 depends_on 重复触发
#    一次性 migrate(否则 `--wait` 会一直等一个正常退出的服务而挂住)。
dc up -d --no-deps --wait --wait-timeout 180 api worker web

# 6. 成功:清理回滚快照与全部 trap,输出被部署的摘要身份。
trap - ERR HUP TERM INT
rm -f "$BACKUP"
echo "deploy_ok backend=$BACKEND_REF web=$WEB_REF"
