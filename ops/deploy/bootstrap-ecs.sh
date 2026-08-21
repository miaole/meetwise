#!/usr/bin/env bash
# 精简 CD —— ECS 一次性切换脚本(在机器上以 root 跑一次)。
# 作用:把这台机器从「旧 2571 行 meetwise-cd 事务控制器 + 一堆自动 systemd 定时器」
# 切换到「普通 docker compose 部署」。跑完后 GitHub Actions 的 deploy.yml 即可工作。
#
# 用法(在 ECS 上):
#   sudo bash bootstrap-ecs.sh "<部署用公钥 ssh-ed25519 AAAA... >"
# 或把公钥放到 /root/meetwise-deploy.pub 后:
#   sudo bash bootstrap-ecs.sh
#
# 幂等:可重复跑。不删数据,不动 .env 里的凭据。
set -euo pipefail
[[ "${EUID:-$(id -u)}" -eq 0 ]] || { echo 'must run as root' >&2; exit 2; }

DEPLOY_USER=meetwise-deploy
PROJECT_DIR=/srv/meetwise-compose
PUBKEY="${1:-}"
[[ -n "$PUBKEY" ]] || { [[ -f /root/meetwise-deploy.pub ]] && PUBKEY="$(cat /root/meetwise-deploy.pub)"; }
[[ -n "$PUBKEY" ]] || { echo '缺少部署公钥:传参或放到 /root/meetwise-deploy.pub' >&2; exit 2; }
[[ "$PUBKEY" == ssh-* ]] || { echo 'deploy_pubkey_invalid(应以 ssh- 开头)' >&2; exit 2; }

echo '== 1. 停用旧 CD 的所有自动 systemd 单元(定时器会与新部署打架、乱动公网边缘)=='
# 旧管线装了一批 meetwise-full-stack-* / meetwise-cd-* / meetwise-preview-* 的
# service/timer(edge-probe / revocation-retry / publication-recovery / release-recovery
# / rollout-recovery 等)。全部停用并禁用;不存在的忽略。
mapfile -t OLD_UNITS < <(systemctl list-unit-files --no-legend 'meetwise-full-stack-*' 'meetwise-cd-*' 'meetwise-preview-*' 'meetwise-web-preview*' 2>/dev/null | awk '{print $1}')
for u in "${OLD_UNITS[@]:-}"; do
  [[ -n "$u" ]] || continue
  systemctl disable --now "$u" 2>/dev/null || true
  echo "  disabled: $u"
done
systemctl reset-failed 2>/dev/null || true

echo '== 2. 建部署账号(docker 组,可跑 compose;无需登录 shell 之外的权限)=='
getent group docker >/dev/null 2>&1 || groupadd docker
id -u "$DEPLOY_USER" >/dev/null 2>&1 || useradd --create-home --shell /bin/bash --system "$DEPLOY_USER"
usermod --append --groups docker "$DEPLOY_USER"

echo '== 3. 装部署公钥(tailnet-only 可达 + 主机 key 已钉,故用普通 key 即可)=='
install -d -m 0700 -o "$DEPLOY_USER" -g "$DEPLOY_USER" "/home/$DEPLOY_USER/.ssh"
AUTH="/home/$DEPLOY_USER/.ssh/authorized_keys"
touch "$AUTH"
grep -qxF "$PUBKEY" "$AUTH" || printf '%s\n' "$PUBKEY" >> "$AUTH"
chown "$DEPLOY_USER:$DEPLOY_USER" "$AUTH"; chmod 0600 "$AUTH"

echo '== 4. 确认 compose 目录 + 保留既有 .env(含 DB/模型凭据,部署不下发)=='
install -d -m 0755 "$PROJECT_DIR/docker"
if [[ ! -f "$PROJECT_DIR/.env" ]]; then
  echo "  警告:$PROJECT_DIR/.env 不存在 —— 需先把 DB/模型等凭据写入(一次性 provision)" >&2
fi
# 部署账号需能读写 compose 目录(改 .env 两行镜像 / scp 覆盖 compose 文件)。
chown -R "$DEPLOY_USER:$DEPLOY_USER" "$PROJECT_DIR/docker"
[[ -f "$PROJECT_DIR/.env" ]] && chown "$DEPLOY_USER:$DEPLOY_USER" "$PROJECT_DIR/.env" && chmod 0600 "$PROJECT_DIR/.env"

echo '== 5. 简单 nginx:恒定反代 web:3000(去掉旧 funnel/Pages 门控)=='
if [[ -f "$PROJECT_DIR/docker/meetwise-nginx.conf" ]]; then
  install -m 0644 "$PROJECT_DIR/docker/meetwise-nginx.conf" /etc/nginx/conf.d/meetwise.conf
  # 旧的 funnel/preview 配置若存在则移走,避免两份 server 冲突。
  for old in meetwise-full-stack.conf meetwise-preview.conf; do
    [[ -f "/etc/nginx/conf.d/$old" ]] && mv "/etc/nginx/conf.d/$old" "/etc/nginx/conf.d/$old.retired"
  done
  # 摘掉发行版自带的 default_server(serve /usr/share/nginx/html 欢迎页),否则它会
  # 抢占 :80 默认流量,导致公网命中欢迎页而非应用;本站的 conf 是唯一 default_server。
  if grep -qE 'listen[[:space:]]+[0-9.:]*80[[:space:]]+default_server' /etc/nginx/nginx.conf; then
    sed -i -E 's/(listen[[:space:]]+[0-9.:]*80)[[:space:]]+default_server/\1/' /etc/nginx/nginx.conf
    echo '  发行版默认 default_server 已摘除'
  fi
  nginx -t && systemctl reload nginx && echo '  nginx reloaded'
else
  echo "  提示:把 ops/deploy/nginx.conf 放到 $PROJECT_DIR/docker/meetwise-nginx.conf 后重跑本步" >&2
fi

echo
echo '完成。接下来:在 GitHub 配置 secret ECS_DEPLOY_KEY(对应上面公钥的私钥),'
echo '然后 push main 或手动触发 deploy.yml 即可。'
