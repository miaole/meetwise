#!/bin/bash
set -euo pipefail
PATH=/usr/sbin:/usr/bin:/sbin:/bin
export PATH
[[ "$EUID" -eq 0 ]] || { echo full_stack_edge_close_requires_root >&2; exit 2; }
source /usr/local/lib/meetwise-preview-controller/controller-lib.sh
# compose 单机：web 是容器，物理关闭 = `docker compose stop web`（粘性 stop，restart:unless-stopped
# 不会自动拉起）；Funnel 仍在宿主 Tailscale（不变）。判定与 publisher.revoke() 完全一致：
# `stop web` 之后 `ps --status running -q web` 必须为空，否则 fail-closed。
COMPOSE_DIR=/srv/meetwise-compose
COMPOSE_FILE="$COMPOSE_DIR/docker/compose.prod.yml"
compose() { /usr/bin/docker compose --project-directory "$COMPOSE_DIR" -f "$COMPOSE_FILE" "$@"; }
web_running() { compose ps --status running -q web 2>/dev/null | grep -q .; }

failed=0
# Funnel 撤销先启动，绝不让容器停止或 D-Bus 查询推迟唯一公网关闭操作。
controller_tailscale_funnel --https=443 off >/dev/null 2>&1 &
funnel_pid=$!
# web 容器停止：并发启动、独立 15s 预算（一个挂死的 docker 调用不得再叠加 15s 延迟）。
timeout --kill-after=1s 15s compose stop web >/dev/null 2>&1 &
web_pid=$!
if ! wait "$web_pid" && web_running; then failed=1; fi
# 授权性判定：stop 之后仍 running 的 web 容器 = 物理关闭失败。
web_running && failed=1
wait "$funnel_pid" || true
controller_funnel_status_is_closed || failed=1
exit "$failed"
