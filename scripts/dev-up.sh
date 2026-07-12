#!/usr/bin/env bash
# 一键起全栈(api + worker + web),含 .env + 必需密钥。防止漏起 worker(漏了则面试连不上/报告不可用)。
# 用法:bash scripts/dev-up.sh   日志:/tmp/mw-{api,worker,web}.log
set -e
cd "$(dirname "$0")/.."
pkill -f 'esm-register.*main.ts' 2>/dev/null || true
pkill -f 'next dev' 2>/dev/null || true
pkill -f 'next-server' 2>/dev/null || true
sleep 1
set -a; [ -f .env ] && . ./.env; set +a
export AUTH_SECRET="${AUTH_SECRET:-e2e-dev-secret-key}"
export PAY_PROVIDER_SECRET="${PAY_PROVIDER_SECRET:-e2e-pay-secret}"
export WORKER_BOOTSTRAP=1
export NEXT_PUBLIC_API_BASE="${NEXT_PUBLIC_API_BASE:-http://localhost:8787}"
export API_BASE_INTERNAL="${API_BASE_INTERNAL:-http://localhost:8787}"
echo "→ api (:8787)…";    corepack pnpm -C apps/api serve   > /tmp/mw-api.log    2>&1 &
echo "→ worker…";         corepack pnpm -C apps/worker start > /tmp/mw-worker.log 2>&1 &
echo "→ web (:3100)…";    PORT=3100 corepack pnpm -C apps/web dev > /tmp/mw-web.log 2>&1 &
sleep 11
echo "api=$(curl -s -o /dev/null -w '%{http_code}' http://localhost:8787/openapi.json)"
echo "web=$(curl -s -o /dev/null -w '%{http_code}' http://localhost:3100/)"
echo "worker=$(ps aux | grep 'apps/worker' | grep -v grep | wc -l | tr -d ' ') 进程"
echo "✓ 全栈就绪(三者都要在:api/web=200, worker=1)"
