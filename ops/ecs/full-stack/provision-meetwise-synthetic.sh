#!/bin/bash
set -euo pipefail

# P0-1 降权执行：装配最小权限账号 meetwise-synthetic（uid/gid 2001，无 shell），
# 由它执行「上传 tarball 的不可信 JS」（loader.mjs/db-verify.mjs/target-inspect.mjs/
# prepare-full-stack-release.mjs 的 compute 模式），把 root 从「跑不可信代码」里抽离。
#
# 权限模型（一句话）：root 保留 manifest 签名私钥 + host .env 的独占读；meetwise-synthetic
# 只拿到「它执行任务所需的最小读/写/窄 sudo」。
#   - 读 seed/target/read-only verifier/test-account descriptor：0640 root:meetwise-synthetic
#   - migration env：0600 root:root，synthetic 永不可读
#   - 读 release 源码树 + node_modules：经 meetwise 补充组（root:meetwise g+rX，install_deps 落）
#   - traverse /etc/meetwise：0711 root:root（所有运行账号只能按已知路径进入，不能列目录；
#     具体可读范围仍由各文件 0600/0640/0644 决定，避免首装夺走 legacy meetwise 的 CA 访问）
#   - traverse /srv/meetwise-full-stack：0750 root:meetwise（meetwise 补充组）
#   - 写合成状态：/var/lib/meetwise-preview-synthetic 0700 meetwise-synthetic:meetwise-synthetic
#   - 窄 sudo：systemctl stop|start nginx + docker compose ps|stop|up worker（维护窗口）
#
# 签名私钥 /etc/meetwise/preview-release-ed25519.pem 恒为 0600 root:root，绝不组可读——
# 这是本脚本的硬不变量（合成账号即便被利用也不能窃私钥伪造公网 manifest）。
#
# 幂等：可重复运行；每次运行都会把目标权限/所有权/组成员收敛到上述状态。

if [[ "${EUID}" -ne 0 ]]; then echo 'provision_requires_root' >&2; exit 2; fi

ACCT=meetwise-synthetic
UID_=2001
GID_=2001
ETC=/etc/meetwise
STATE=/var/lib/meetwise-preview-synthetic
STATE_LOCK_HELPER=/usr/local/lib/meetwise-preview-controller/full-stack/full-stack-preview-publisher.mjs
MIGRATE_ENV="$ETC/full-stack-migrate.env"
VERIFIER_ENV="$ETC/full-stack-verifier.env"
ACCOUNT_ENV="$ETC/preview-test-accounts.env"
SIGNING_KEY="$ETC/preview-release-ed25519.pem"
SUDOERS=/etc/sudoers.d/meetwise-synthetic

# 1. 专用组 + 账号（无家目录、无登录 shell、系统账号）。
getent group "$ACCT" >/dev/null 2>&1 || groupadd --gid "$GID_" "$ACCT"
getent passwd "$ACCT" >/dev/null 2>&1 || useradd --uid "$UID_" --gid "$GID_" --no-create-home --shell /usr/sbin/nologin --system "$ACCT"
# meetwise 补充组是承重项：synthetic 靠它 traverse /srv/meetwise-full-stack（0750 root:meetwise）读
# release 树跑 loader/compute。组不存在则 fail-closed——绝不静默跳过（会在部署期变成 loader 读路径失败
# 的隐性断裂）。install-full-stack-runtime.sh 早于本脚本创建 meetwise 组，故此处它必须已在。
getent group meetwise >/dev/null 2>&1 || { echo 'provision_meetwise_group_missing' >&2; exit 2; }
usermod --append --groups meetwise "$ACCT"
# 冒烟断言：确认补充组确实落到账号（usermod 静默异常 / NSS 缓存边角），否则 fail-closed。
/usr/sbin/runuser -u "$ACCT" -- /usr/bin/id -nG | tr ' ' '\n' | grep -qx meetwise || { echo 'provision_meetwise_group_not_applied' >&2; exit 2; }

# 2. /etc/meetwise 对非 root 仅开放 execute（按已知路径 traverse），不开放 read/list。
#    目录不交给 synthetic 组，否则 legacy meetwise 在接管完成前无法读取其 0644 CA。
chown root:root "$ETC"
chmod 0711 "$ETC"
# 签名私钥锁死 root（即便 /etc/meetwise 组可进入，文件本身 0600 root:root 也读不到）。
if [[ -e "$SIGNING_KEY" ]]; then chown root:root "$SIGNING_KEY"; chmod 0600 "$SIGNING_KEY"; fi

# 3. seed/target/read-only verifier/test-account descriptor → 0640
#    root:meetwise-synthetic。迁移凭据始终 root:root 0600，绝不交给 loader。
#    不碰 full-stack-common.env（仅供 systemd root 用，含非合成字段，不扩大其暴露面）。
for f in "$ETC/preview-synthetic.seed" "$ETC/preview-synthetic-target.json" "$VERIFIER_ENV" "$ACCOUNT_ENV"; do
  [[ -f "$f" ]] || continue
  chown "root:$ACCT" "$f"
  chmod 0640 "$f"
done
if [[ -f "$MIGRATE_ENV" ]]; then chown root:root "$MIGRATE_ENV"; chmod 0600 "$MIGRATE_ENV"; fi

# 4. RDS CA（路径在 migrate-env 里，运行时才解析）。CA 是**公开证书链**（非私钥），故设
#    0644 root:root——meetwise-synthetic 与「旧 systemd api/worker 以 meetwise 用户运行时直接读该
#    CA 做 Postgres TLS」都能读。绝不把它 chown 成 meetwise-synthetic 组：那会夺走旧 app 的读权、
#    在过渡期一重启就断库（非破坏性铁律）。只处理落在 /etc/meetwise 内的 CA；在别处则不碰，
#    避免误改旧 app 依赖的外部文件。
if [[ -f "$MIGRATE_ENV" ]]; then
  set -a
  # shellcheck disable=SC1090
  . "$MIGRATE_ENV"
  set +a
  if [[ -n "${DATABASE_SSL_CA_PATH:-}" ]]; then
    ca="$(readlink -f "$DATABASE_SSL_CA_PATH" 2>/dev/null || true)"
    if [[ -n "$ca" && -f "$ca" && "$ca" == "$ETC"/* ]]; then
      chown root:root "$ca"
      chmod 0644 "$ca"
    fi
  fi
fi

# 5. 合成状态根：synthetic 独占写（回执/manifest/credentials/global lock 都落这里）。
#    Existing root-owned state from a legacy install may be repaired through the
#    trusted fd helper; symlinks, non-directories and unexpected owners fail
#    closed.  The helper creates/normalizes the lock without replacing an inode.
if [[ -L "$STATE" || ( -e "$STATE" && ! -d "$STATE" ) ]]; then
  echo 'provision_synthetic_state_root_invalid' >&2
  exit 2
fi
install -d -o "$ACCT" -g "$ACCT" -m 0700 "$STATE"
[[ -f "$STATE_LOCK_HELPER" && ! -L "$STATE_LOCK_HELPER" ]] || { echo 'provision_synthetic_state_lock_helper_missing' >&2; exit 2; }
/usr/bin/node "$STATE_LOCK_HELPER" synthetic-lock-repair --repair-state || { echo 'provision_synthetic_state_lock_invalid' >&2; exit 2; }

# 6. 窄 sudo：只放行 loader.mjs 维护窗口所需的确切 argv（与 loader 的 runPrivileged/
#    runPrivilegedCapture 逐字节一致）。docker 启停/查询只作用于 worker 服务、固定
#    project-directory 与 compose 文件；ps 只认 running/restarting 两种状态，无通配符。
#    绝不放行 `docker inspect`（需动态容器 id，通配会泄露容器 env 密钥）。
cat > "$SUDOERS" <<'EOF'
Defaults:meetwise-synthetic !requiretty
meetwise-synthetic ALL=(root) NOPASSWD: /usr/bin/systemctl stop nginx.service, /usr/bin/systemctl start nginx.service
meetwise-synthetic ALL=(root) NOPASSWD: /usr/bin/docker compose --project-directory /srv/meetwise-compose -f /srv/meetwise-compose/docker/compose.prod.yml ps --status running -q worker
meetwise-synthetic ALL=(root) NOPASSWD: /usr/bin/docker compose --project-directory /srv/meetwise-compose -f /srv/meetwise-compose/docker/compose.prod.yml ps --status restarting -q worker
meetwise-synthetic ALL=(root) NOPASSWD: /usr/bin/docker compose --project-directory /srv/meetwise-compose -f /srv/meetwise-compose/docker/compose.prod.yml stop worker
meetwise-synthetic ALL=(root) NOPASSWD: /usr/bin/docker compose --project-directory /srv/meetwise-compose -f /srv/meetwise-compose/docker/compose.prod.yml up -d worker
EOF
chmod 0440 "$SUDOERS"
visudo -cf "$SUDOERS"

echo provision_meetwise_synthetic_ok
