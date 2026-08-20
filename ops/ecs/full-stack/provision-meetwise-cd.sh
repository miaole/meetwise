#!/bin/bash
set -euo pipefail
PATH=/usr/sbin:/usr/bin:/sbin:/bin
export PATH
umask 077

# provision-meetwise-cd.sh —— 幂等装配 full-stack CD 的「ECS 侧」（Docker Compose 单机）。
#
# 生成前门禁（scope / non-goals / verify）：
#   scope     : 把一台已有 /etc/meetwise 冻结凭据、但从未装过新 CD 链的 ECS，一次性收敛到
#               「push→meetwise-cd forced-command→root dispatch→docker compose」所需的地基。
#   non-goals : 绝不做破坏性切换——不切 current、不停旧 systemd app 单元、不 compose up、不签
#               manifest、不碰公网 funnel。首次真正发布仍由 CD 的 install-full-stack-runtime.sh +
#               meetwise-cd 发布仪式（stage→flip→synthetic-verify→publish→activate→confirm）完成。
#               本脚本也不写任何密钥/.env（含密钥的 /srv/meetwise-compose/.env 由运维单独放置，
#               本脚本只校验其存在与必需键齐备）。
#   verify    : 幂等重跑收敛；末尾自检 docker compose / nginx / meetwise-cd 账号 + forced-command /
#               sudoers / dispatch 安装 / synthetic 账号 / 必需凭据 —— 任一缺失 fail-closed。
#
# 安全模型（与 meetwise-cd-receive.sh / meetwise-cd-root.sh 契约一致）：
#   - meetwise-cd 系统账号：家目录 /var/lib/meetwise-cd（0700 自有），authorized_keys 用
#     `command="/usr/local/bin/meetwise-cd-receive",restrict`（restrict 蕴含 no-pty/no-*-forwarding/
#     no-user-rc/no-X11），任何 ssh 会话都被强制成那一个入口，无交互 shell。
#   - 窄 sudo：meetwise-cd 只能免密跑 /usr/local/sbin/meetwise-cd-root（无通配），root dispatch
#     再对每个子命令+参数二次校验（纵深防御）。
#   - meetwise-synthetic 降权账号由 provision-meetwise-synthetic.sh 装（P0-1：不可信 tarball JS 不再以
#     root 跑）。本脚本编排调用它。
#   - 签名私钥 /etc/meetwise/preview-release-ed25519.pem 恒 0600 root:root，本脚本绝不读/改它。
#
# 用法：
#   sudo provision-meetwise-cd.sh --source-root <解包的 release 源码根> --deploy-pubkey <SSH 公钥文件>
#     --source-root   含 ops/ecs/full-stack/*、docker/compose.prod.yml、scripts/preview-synthetic-data/*
#     --deploy-pubkey meetwise-cd forced-command authorized_keys 用的 SSH 公钥；对应私钥只进
#                     GitHub Secret ECS_CD_DEPLOY_KEY，绝不上 ECS。

if [[ "${EUID}" -ne 0 ]]; then echo 'provision_cd_requires_root' >&2; exit 2; fi

SOURCE_ROOT=""
DEPLOY_PUBKEY=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --source-root)   SOURCE_ROOT="${2:-}"; shift 2 ;;
    --deploy-pubkey) DEPLOY_PUBKEY="${2:-}"; shift 2 ;;
    *) echo "provision_cd_unknown_arg:$1" >&2; exit 2 ;;
  esac
done
[[ -n "$SOURCE_ROOT" && -d "$SOURCE_ROOT" ]] || { echo 'provision_cd_source_root_invalid' >&2; exit 2; }
SOURCE_ROOT="$(readlink -f "$SOURCE_ROOT")"

FULL_STACK="$SOURCE_ROOT/ops/ecs/full-stack"
RECEIVE_SRC="$FULL_STACK/meetwise-cd-receive.sh"
ROOT_SRC="$FULL_STACK/meetwise-cd-root.sh"
SYNTH_SRC="$FULL_STACK/provision-meetwise-synthetic.sh"
COMPOSE_SRC="$SOURCE_ROOT/docker/compose.prod.yml"
CONTROLLER_MANIFEST="$FULL_STACK/cd-controller-files.txt"
for f in "$RECEIVE_SRC" "$ROOT_SRC" "$SYNTH_SRC" "$COMPOSE_SRC" "$CONTROLLER_MANIFEST"; do
  [[ -f "$f" ]] || { echo "provision_cd_source_missing:$f" >&2; exit 2; }
done

CD_USER=meetwise-cd
CD_HOME=/var/lib/meetwise-cd
CD_INCOMING="$CD_HOME/incoming"
CD_SSH="$CD_HOME/.ssh"
RECEIVE_DST=/usr/local/bin/meetwise-cd-receive
ROOT_DST=/usr/local/sbin/meetwise-cd-root
CONTROLLER_VERSION=/etc/meetwise/cd-controller-version
SUDOERS=/etc/sudoers.d/meetwise-cd
COMPOSE_DIR=/srv/meetwise-compose
COMPOSE_DST="$COMPOSE_DIR/docker/compose.prod.yml"
COMPOSE_ENV="$COMPOSE_DIR/.env"
ETC=/etc/meetwise
CONTROLLER_RUN=/run/meetwise-preview-controller
CONTROLLER_STATE=/var/lib/meetwise-preview-controller
PUBLIC_MANIFEST_ROOT=/usr/share/meetwise-preview
FULL_STACK_RELEASES=/srv/meetwise-full-stack/releases
FULL_STACK_SNAPSHOTS="$CONTROLLER_STATE/full-stack-rollback"

die() { echo "provision_cd_$1" >&2; exit "${2:-64}"; }

# --- 0. 承重前置：meetwise 组必须已存在（基座 provisioning / install 脚本先建）。缺则在任何
#        变更前 fail-closed，绝不半装（synthetic 也依赖 meetwise 补充组遍历 /srv）。 ---------
getent group meetwise >/dev/null 2>&1 || die meetwise_group_missing_run_base_provisioning_first 2

# --- 1. Docker Engine + compose 插件 ---------------------------------------------------
# Alibaba Cloud Linux 4 上 docker 包名有差异；尽力而为安装，最终以 `docker compose version` 硬校验。
if ! command -v docker >/dev/null 2>&1 || ! docker compose version >/dev/null 2>&1; then
  dnf -y install docker docker-compose-plugin >/dev/null 2>&1 \
    || dnf -y install docker-ce docker-ce-cli containerd.io docker-compose-plugin >/dev/null 2>&1 \
    || true
fi
systemctl enable --now docker >/dev/null 2>&1 || die docker_service_unavailable 70
command -v docker >/dev/null 2>&1 || die docker_missing 70
docker compose version >/dev/null 2>&1 || die docker_compose_plugin_missing 70

# --- 2. nginx（宿主 funnel 唯一公网入口：funnel→nginx:80→web:3000）--------------------
if ! command -v nginx >/dev/null 2>&1; then
  dnf -y install nginx >/dev/null 2>&1 || true
fi
command -v nginx >/dev/null 2>&1 || die nginx_missing 70

# --- 2a. root-owned publication controller roots --------------------------------------
# These directories are part of the trusted controller boundary.  Create them before
# installing/enabling any unit so a clean host cannot inherit attacker-owned parents.
install -d -o root -g root -m 0700 "$CONTROLLER_RUN"
install -d -o root -g root -m 0700 "$CONTROLLER_STATE"
install -d -o root -g root -m 0700 "$FULL_STACK_SNAPSHOTS"
install -d -o root -g root -m 0755 "$PUBLIC_MANIFEST_ROOT"
install -d -o root -g root -m 0755 "$(dirname "$FULL_STACK_RELEASES")"
install -d -o root -g meetwise -m 0750 "$FULL_STACK_RELEASES"
install -o root -g root -m 0600 /dev/null "$CONTROLLER_RUN/publication.lock"

# --- 3. meetwise-cd 系统账号 + 家目录 + incoming ---------------------------------------
# 需要真实 login shell（sshd 用它 -c 跑 forced command；nologin 会拒绝）；无交互靠 forced-command+restrict。
getent passwd "$CD_USER" >/dev/null 2>&1 \
  || useradd --system --home-dir "$CD_HOME" --no-create-home --shell /bin/bash "$CD_USER"
install -d -o "$CD_USER" -g "$CD_USER" -m 0700 "$CD_HOME"
install -d -o "$CD_USER" -g "$CD_USER" -m 0700 "$CD_INCOMING"
install -d -o "$CD_USER" -g "$CD_USER" -m 0700 "$CD_SSH"

# --- 4. forced-command authorized_keys --------------------------------------------------
# 幂等：每次都按传入公钥重写 authorized_keys（单一 key、单一 forced command）。restrict 蕴含
# no-pty/no-user-rc/no-*-forwarding/no-X11。缺 --deploy-pubkey 时：已存在则保留、不存在则 fail-closed。
if [[ -n "$DEPLOY_PUBKEY" ]]; then
  [[ -f "$DEPLOY_PUBKEY" ]] || die deploy_pubkey_missing 2
  # 只接受单行 ssh-ed25519/ssh-rsa 公钥，拒绝夹带换行/命令注入。
  pub="$(tr -d '\r' < "$DEPLOY_PUBKEY")"
  [[ "$(printf '%s' "$pub" | wc -l)" -eq 0 && "$pub" =~ ^(ssh-ed25519|ssh-rsa|ecdsa-sha2-[a-z0-9-]+)\  ]] || die deploy_pubkey_malformed 2
  tmp="$CD_SSH/authorized_keys.tmp.$$"
  printf 'command="%s",restrict %s\n' "$RECEIVE_DST" "$pub" > "$tmp"
  chown "$CD_USER:$CD_USER" "$tmp"; chmod 0600 "$tmp"
  mv -f "$tmp" "$CD_SSH/authorized_keys"
elif [[ ! -f "$CD_SSH/authorized_keys" ]]; then
  die deploy_pubkey_required_on_first_run 2
fi

# --- 5. forced-command 入口 + root dispatch --------------------------------------------
install -o root -g root -m 0755 "$RECEIVE_SRC" "$RECEIVE_DST"
install -o root -g root -m 0755 "$ROOT_SRC" "$ROOT_DST"

# The root controller is a separately provisioned trust bundle. Application CD
# may upload source, but can neither replace this bundle nor change its digest.
controller_rows="$(mktemp)"
while IFS='|' read -r source destination mode; do
  [[ -n "$source" && "$source" != \#* && "$destination" == /* && "$mode" =~ ^0[0-7]{3}$ ]] || continue
  [[ -f "$SOURCE_ROOT/$source" && ! -L "$SOURCE_ROOT/$source" ]] || die "controller_source_missing:$source" 2
  install -d -o root -g root -m 0755 "$(dirname "$destination")"
  install -o root -g root -m "$mode" "$SOURCE_ROOT/$source" "$destination"
  printf '%s|%s|%s|%s\n' "$source" "$destination" "$mode" "$(sha256sum "$SOURCE_ROOT/$source" | awk '{print $1}')" >> "$controller_rows"
done < "$CONTROLLER_MANIFEST"
controller_digest="$(sha256sum "$controller_rows" | awk '{print $1}')"
rm -f "$controller_rows"
printf '%s\n' "$controller_digest" > "$CONTROLLER_VERSION.tmp"
chown root:root "$CONTROLLER_VERSION.tmp"; chmod 0600 "$CONTROLLER_VERSION.tmp"
mv -f "$CONTROLLER_VERSION.tmp" "$CONTROLLER_VERSION"

# --- 6. 窄 sudoers（只放行 root dispatch，无通配；dispatch 内部二次校验）----------------
tmp_sudoers="$SUDOERS.tmp.$$"
cat > "$tmp_sudoers" <<EOF
Defaults:meetwise-cd !requiretty
meetwise-cd ALL=(root) NOPASSWD: $ROOT_DST
EOF
chmod 0440 "$tmp_sudoers"
visudo -cf "$tmp_sudoers" >/dev/null || { rm -f "$tmp_sudoers"; die sudoers_invalid 70; }
mv -f "$tmp_sudoers" "$SUDOERS"

# --- 7. /srv/meetwise-compose + compose.prod.yml（.env 由运维单独放，仅校验）------------
install -d -o root -g root -m 0755 "$COMPOSE_DIR"
install -d -o root -g root -m 0755 "$COMPOSE_DIR/docker"
install -o root -g root -m 0644 "$COMPOSE_SRC" "$COMPOSE_DST"

# --- 8. synthetic 降权账号 + 权限（P0-1）-----------------------------------------------
bash "$SYNTH_SRC"
systemctl daemon-reload
nginx -t >/dev/null
systemctl enable meetwise-cd-controller-rollout-recovery.service meetwise-full-stack-publication-recovery.service meetwise-full-stack-edge-restore.service nginx.service >/dev/null
[[ "$(systemctl is-enabled meetwise-cd-controller-rollout-recovery.service)" == "enabled" ]] || die controller_rollout_recovery_not_enabled 70

# --- 9. 必需凭据自检（缺失只告警，不臆造密钥）------------------------------------------
warn() { echo "provision_cd_warn_$1" >&2; }
[[ -f "$ETC/preview-release-ed25519.pem" ]]      || warn signing_key_absent
[[ -f "$ETC/probe-receipt-ed25519.pub.pem" ]]    || warn probe_receipt_pubkey_absent
[[ -f "$ETC/full-stack-migrate.env" ]]           || warn migrate_env_absent
[[ -f "$ETC/full-stack-verifier.env" ]]          || warn verifier_env_absent
[[ -f "$ETC/preview-test-accounts.env" ]]        || warn preview_test_accounts_env_absent
[[ -f "$ETC/preview-synthetic-target.json" ]]    || warn synthetic_target_absent
[[ -f "$ETC/preview-synthetic.seed" ]]           || warn synthetic_seed_absent
[[ -f "$ETC/acr-pull.env" ]]                     || warn acr_pull_env_absent

# .env 校验：存在则检查必需键齐备（值不读、不打印）；不存在则列出运维待补键。
REQUIRED_ENV_KEYS=(ACR_REGISTRY ACR_NAMESPACE RDS_CA_HOST_PATH RUNTIME_DATABASE_URL MIGRATION_DATABASE_URL WEB_ORIGIN AUTH_SECRET NEXT_PUBLIC_API_BASE)
if [[ -f "$COMPOSE_ENV" ]]; then
  missing=()
  for k in "${REQUIRED_ENV_KEYS[@]}"; do
    grep -qE "^(export[[:space:]]+)?$k=" "$COMPOSE_ENV" || missing+=("$k")
  done
  if [[ ${#missing[@]} -gt 0 ]]; then
    echo "provision_cd_compose_env_missing_keys: ${missing[*]}" >&2
  else
    echo 'compose .env present with required keys'
  fi
else
  echo "provision_cd_compose_env_absent: create $COMPOSE_ENV (0600 root:root) with keys: ${REQUIRED_ENV_KEYS[*]} + all compose \${VAR:?} runtime/worker/migration secrets" >&2
fi

echo provision_meetwise_cd_ok
