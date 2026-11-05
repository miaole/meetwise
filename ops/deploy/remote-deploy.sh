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
# --self-test(12 臂信号矩阵×文件/stdin 两种调用形态=24 跑,发真信号验证回滚,零 docker
# 依赖,走桩 compose)。
set -euo pipefail

# stdin 形态(生产=ssh 'bash -s -- …' < 本脚本)下 BASH_SOURCE 是空数组,set -u 下取 [0]
# 即 unbound variable 开工炸退;:- 兜底空串。SELF_PATH 仅 --self-test 复跑自身时需要,
# 部署路径零引用;stdin 形态无自身文件可复跑,self_test 入口如实拒(见下)。
SELF_PATH=""
if [[ -n "${BASH_SOURCE[0]:-}" ]]; then
  SELF_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/$(basename "${BASH_SOURCE[0]}")"
fi

# ── 信号回滚自测(真信号×桩 compose·不触真 /srv 与 docker daemon)───────────────
#   12 臂信号矩阵 × 2 种调用形态共 24 跑。形态:file=bash <script> refs;stdin=
#   bash -s -- refs < script(=deploy.yml 生产原形,曾被 BASH_SOURCE 空数组炸退的形态)。
#   臂:TERM/INT/HUP × pull/migrate/up 九臂(非零退出+.env 逐字节恢复+回滚 up 恰一次;
#   @up 臂=部署 up+回滚 up 恰两次)+连发两信号臂(回滚恰一次·防重入)+回滚 up 中再发
#   信号臂(回滚恰一次·不重入)+无信号臂(退出零+deploy_ok+.env 落新镜像行恰一次)。
#   信号窗=对应桩调用已落日志(trap 必已安装,避免信号落在安装前的假红);轮询窗
#   240×0.05s=12s,慢机不再误红。
self_test() {
  if [[ -z "$SELF_PATH" || ! -f "$SELF_PATH" ]]; then
    echo "self-test requires file-form invocation(stdin 形态无自身路径可复跑·部署路径不受影响)" >&2
    return 1
  fi
  local sandbox stubbin proj envf old_be old_web new_be new_web rc form arm sig phase calls out arm_pid n env_state ups
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
  ln -s "$(command -v bash)" "$stubbin/bash"  # 子进程 bash=宿主同版本:bash 3.2 / 5.x 各自全矩阵验证
  cat > "$stubbin/docker" <<'STUB'
#!/usr/bin/env bash
printf '%s\n' "$*" >> "${DOCKER_CALL_LOG:?}"
case "$*" in *pull*|*" run "*|*" up "*) sleep 2 ;; esac
exit 0
STUB
  chmod +x "$stubbin/docker"
  # 等待调用日志出现第 $3 个 $2 匹配(信号窗=该桩调用已在跑·trap 必已安装)·上限 12s
  selftest_wait_call() {
    local log="$1" pat="$2" want="$3" have
    for n in $(seq 1 240); do
      have="$(grep -c "$pat" "$log" 2>/dev/null)"; have="${have:-0}"
      [[ "$have" -ge "$want" ]] && return 0
      sleep 0.05
    done
    return 1
  }
  local failed=0 want_ups
  for form in file stdin; do
    for arm in TERM@pull INT@pull HUP@pull TERM@migrate INT@migrate HUP@migrate TERM@up INT@up HUP@up double@pull reenter@pull none; do
      sig="${arm%%@*}"; phase="${arm##*@}"
      cp "$sandbox/env.orig" "$envf"  # 每臂复位 .env 到部署前态,臂间零串扰
      calls="$sandbox/calls-$form-$arm.log"; : > "$calls"
      out="$sandbox/out-$form-$arm.txt"; : > "$out"
      if [[ "$form" == file ]]; then
        DEPLOY_PROJECT_DIR="$proj" PATH="$stubbin:/usr/bin:/bin" DOCKER_CALL_LOG="$calls" \
          bash "$SELF_PATH" "reg/ns/img@sha256:$new_be" "reg/ns/img@sha256:$new_web" >"$out" 2>/dev/null &
      else
        DEPLOY_PROJECT_DIR="$proj" PATH="$stubbin:/usr/bin:/bin" DOCKER_CALL_LOG="$calls" \
          bash -s -- "reg/ns/img@sha256:$new_be" "reg/ns/img@sha256:$new_web" < "$SELF_PATH" >"$out" 2>/dev/null &
      fi
      arm_pid=$!
      rc=0
      case "$arm" in
        double@pull)
          selftest_wait_call "$calls" pull 1 || true
          kill -s TERM "$arm_pid" 2>/dev/null || true
          sleep 0.3
          kill -s INT "$arm_pid" 2>/dev/null || true ;;
        reenter@pull)
          selftest_wait_call "$calls" pull 1 || true
          kill -s TERM "$arm_pid" 2>/dev/null || true
          selftest_wait_call "$calls" ' up ' 1 || true  # 回滚 up 已开跑:二发信号须被吞(trap 已自撤)
          kill -s TERM "$arm_pid" 2>/dev/null || true ;;
        none) : ;;
        *)  # 信号窗=对应相位的桩调用已落日志(.env 已改写=半部署风险面内)
          case "$phase" in
            pull) selftest_wait_call "$calls" pull 1 || true ;;
            migrate) selftest_wait_call "$calls" ' run --rm -T migrate' 1 || true ;;
            up) selftest_wait_call "$calls" ' up -d --no-deps' 1 || true ;;
          esac
          kill -s "$sig" "$arm_pid" 2>/dev/null || true ;;
      esac
      wait "$arm_pid" || rc=$?
      env_state="$(cmp -s "$envf" "$sandbox/env.orig" && echo restored || echo changed)"
      ups="$(grep -c ' up -d --no-deps' "$calls")"
      case "$arm" in
        *@up) want_ups=2 ;;  # 部署 up+回滚 up
        *) want_ups=1 ;;     # 仅回滚 up(或 none 臂的部署 up)
      esac
      if [[ "$arm" == none ]]; then
        if [[ $rc -eq 0 && "$env_state" == changed && "$(grep -c "sha256:$new_be" "$envf")" == 1 \
          && "$(grep -c "sha256:$new_web" "$envf")" == 1 && "$ups" == 1 && "$(grep -c 'deploy_ok' "$out")" == 1 ]]; then
          echo "self-test[$form] arm[$arm]: PASS (exit 0 + env carries new refs + one up + deploy_ok)"
        else
          echo "self-test[$form] arm[$arm]: FAIL (exit=$rc env_state=$env_state env_be=$(grep -c "sha256:$new_be" "$envf") env_web=$(grep -c "sha256:$new_web" "$envf") ups=$ups deploy_ok=$(grep -c 'deploy_ok' "$out"))" >&2
          failed=1
        fi
      elif [[ $rc -ne 0 && "$env_state" == restored && "$ups" == "$want_ups" ]]; then
        echo "self-test[$form] arm[$arm]: PASS (non-zero exit + env restored byte-identical + up x$want_ups)"
      else
        echo "self-test[$form] arm[$arm]: FAIL (exit=$rc env_state=$env_state ups=$ups want=$want_ups)" >&2
        failed=1
      fi
    done
  done
  rm -rf "$sandbox"
  if [[ $failed -ne 0 ]]; then echo "self-test: FAILED" >&2; return 1; fi
  echo "self-test: 24/24 arms PASS (12 arms x file/stdin)"
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
