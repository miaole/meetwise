#!/usr/bin/env bash
# harness per-attempt J-2 wrapper (not product code). usage: attempt.sh <id> <inject> [ub]
set -u
ROOT=/workspace/meetwise-wt-an-perf-prove6; cd $ROOT
D=$ROOT/.tmp/an-perf-tear/$1; mkdir -p $D; shift
{ echo "start $(date --iso-8601=ns) sha=$(git rev-parse HEAD)"; git diff --stat -- packages/db/src/principal.ts; } > $D/attempt-info.txt
docker ps -a --filter name=meetwise-e2e-r2pool- --format '{{.Names}}' > $D/nb4.txt; echo "nb4_list_exit=$?" >> $D/aux.txt
for n in $(cat $D/nb4.txt); do docker rm -f $n >> $D/nb4-rm.txt; echo "nb4_rm_exit=$?" >> $D/aux.txt; done
docker ps -a --filter name=meetwise-e2e --filter name=meetwise-uc018 --format '{{.Names}}' > $D/ps-before.txt; echo "ps_before_exit=$? rows=$(wc -l < $D/ps-before.txt)" >> $D/aux.txt
if [ -s $D/ps-before.txt ]; then echo "SERIAL_NOT_EMPTY abort" >> $D/aux.txt; exit 9; fi
docker events --filter type=container --format '{{json .}}' > $D/events.jsonl & EV=$!
( while :; do date +%s.%N; pgrep -af 'uc018-receipt-backfill-emit|run-e2e-isolated'; sleep 1; done ) > $D/procs.txt 2>&1 & PR=$!
sleep 0.5
node $ROOT/.tmp/an-perf-tear/tools/drive.mjs $D "$@" > $D/driver.out 2>&1
sleep 5
kill -TERM $EV; echo "events_kill_exit=$?" >> $D/aux.txt; wait $EV; echo "events_wait=$?" >> $D/aux.txt
kill -TERM $PR; echo "procs_kill_exit=$?" >> $D/aux.txt; wait $PR; echo "procs_wait=$?" >> $D/aux.txt
docker ps -a --filter name=meetwise-e2e --filter name=meetwise-uc018 --format '{{.Names}}' > $D/ps-after.txt; echo "ps_after_exit=$? rows=$(wc -l < $D/ps-after.txt)" >> $D/aux.txt
cp -r $ROOT/.tmp/uc018-perf-load-receipts $D/raw-receipts 2>/dev/null
git checkout -- ai-docs/delivery/receipts/uc018-perf-load
echo "end $(date --iso-8601=ns)" >> $D/attempt-info.txt
cat $D/driver.out
