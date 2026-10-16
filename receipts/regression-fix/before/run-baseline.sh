#!/bin/zsh
export PATH="/Users/miaole/.nvm/versions/node/v22.19.0/bin:$PATH"
cd /Users/miaole/Desktop/golucky/meetwise-regfix
runt() {
  local secs="$1"; local name="$2"; shift 2
  local log="receipts/regression-fix/before/${name}.log"
  echo "=== [BEFORE] ${name} (cap ${secs}s) :: $* ==="
  ( "$@" > "$log" 2>&1 ) &
  local pid=$!
  local waited=0
  while kill -0 $pid 2>/dev/null && (( waited < secs )); do sleep 5; (( waited += 5 )); done
  if kill -0 $pid 2>/dev/null; then kill -9 $pid 2>/dev/null; echo "TIMEOUT after ${secs}s" >> "$log"; fi
  wait $pid; local ec=$?
  echo "EXIT=${ec}" >> "$log"
  echo "[BEFORE] ${name} EXIT=${ec}"
}
runt 300 web-prove-public-copy pnpm -C apps/web prove:public-copy
runt 300 web-typecheck pnpm -C apps/web typecheck
runt 300 api-prove-begin-guard-merge pnpm -C apps/api prove:begin-guard-merge
runt 300 uc025-nhp-fault pnpm uc025:nhp-fault:prove
runt 300 uc025-nhp-bound pnpm uc025:nhp-bound:prove
runt 300 uc025-nhp-neg pnpm uc025:nhp-neg:prove
runt 300 e2e-platform-prove pnpm e2e-platform:prove
runt 300 g6-e2e-iso-blocked-prove pnpm g6-e2e-iso-blocked:prove
runt 300 entpay-s1 pnpm entpay:s1:prove
runt 300 recruiter-prove pnpm recruiter:prove
runt 300 runtime-role-prove pnpm runtime-role:prove
runt 300 uc025-stale-quiz-expiry pnpm uc025:stale-quiz-expiry:prove
runt 300 uc025-nhp-adv pnpm uc025:nhp-adv:prove
runt 300 uc025-nhp-fault-isolated pnpm uc025:nhp-fault-isolated:prove
runt 300 uc001-nhp-fault pnpm -C apps/api prove:uc001-nhp-fault
runt 300 neg-interview pnpm neg:interview
runt 300 interview-prove pnpm interview:prove
runt 300 web-prove pnpm -C apps/web prove
echo "BASELINE DONE"
