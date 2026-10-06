#!/usr/bin/env bash
# MW_SG_DOCKER: session-activate pre-existing docker group (Ban grant/chmod/sudo)
if [ "${MW_SG_DOCKER:-}" != 1 ]; then
  if ! docker info >/dev/null 2>&1; then
    if getent group docker 2>/dev/null | awk -F: -v u="$(id -un)" '{n=split($4,a,","); for(i=1;i<=n;i++) if(a[i]==u) exit 0; exit 1}'; then
      export MW_SG_DOCKER=1
      quoted=$(printf "%q " "$0" "$@")
      exec sg docker -c "$quoted"
    fi
  fi
fi

# usage: cell.sh <cell> <prefix> <inject> <ub|-> <mut:none|929|zero> <attempt numbers...>
set -u
ROOT=/workspace/meetwise-wt-an-perf-prove6; cd $ROOT; T=$ROOT/.tmp/an-perf-tear/tools
cell=$1 pre=$2 inj=$3 ub=$4 mut=$5; shift 5
F=packages/db/src/principal.ts
git diff --exit-code -- $F >/dev/null || { echo "principal dirty before cell"; exit 8; }
case $mut in 929) sed -i '929d' $F;; zero) sed -i '929d;931d' $F;; esac
echo "MUT=$mut $(git diff --stat -- $F | tail -1)" | tee -a $ROOT/.tmp/an-perf-tear/mut-log.txt
for n in "$@"; do
  if [ "$ub" = "-" ]; then $T/attempt.sh $pre-$n $inj >/dev/null; else $T/attempt.sh $pre-$n $inj $ub >/dev/null; fi
  python3 $T/analyze.py $cell $ROOT/.tmp/an-perf-tear/$pre-$n
done
git checkout -- $F && git diff --exit-code -- $F && echo "RESTORED $F exit=$?" | tee -a $ROOT/.tmp/an-perf-tear/mut-log.txt
