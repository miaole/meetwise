set -u
ROOT=/workspace/meetwise-wt-an-perf-prove6; D=$ROOT/.tmp/an-perf-tear/R2; mkdir -p $D; cd $ROOT
docker ps -a --filter name=meetwise-e2e --filter name=meetwise-uc018 --format '{{.Names}}' > $D/ps-before.txt; echo "ps_before rows=$(wc -l <$D/ps-before.txt)" > $D/aux.txt
N=meetwise-e2e-r2pool-$$-$(date +%s%3N); PW=$(openssl rand -hex 16)
CID=$(docker run --rm -d --name $N -e POSTGRES_USER=meetwise -e POSTGRES_DB=meetwise -e POSTGRES_PASSWORD=$PW -p 127.0.0.1::5432 pgvector/pgvector:pg16); e=$?
echo "run_exit=$e cid_ok=$([[ $CID =~ ^[0-9a-f]{64}$ ]] && echo 1 || echo 0) name=$N" >> $D/aux.txt
P=$(docker port $N 5432/tcp); e=$?; echo "port_exit=$e port_ok=$([[ $P =~ ^127\.0\.0\.1:[0-9]+$ ]] && echo 1 || echo 0) port=$P" >> $D/aux.txt
c=0; for i in $(seq 1 60); do if docker exec $N pg_isready -U meetwise -d meetwise | grep -q 'accepting connections'; then c=$((c+1)); else c=0; fi; [ $c -ge 3 ] && break; sleep 0.5; done; echo "pg_isready_consecutive=$c" >> $D/aux.txt
sleep 2
DATABASE_URL="postgres://meetwise:$PW@$P/meetwise" pnpm -C packages/db exec tsx test/pool-error-listener.proof.ts > $D/r2.log 2>&1; e=$?; echo "R2_EXIT=$e" >> $D/aux.txt
grep -v "$PW" $D/r2.log > $D/r2.tmp; mv $D/r2.tmp $D/r2.log
R=$(docker rm -f $N); e=$?; echo "rm_exit=$e rm_ok=$([ "$R" = "$N" ] && echo 1 || echo 0)" >> $D/aux.txt
docker ps -a --filter name=meetwise-e2e --filter name=meetwise-uc018 --format '{{.Names}}' > $D/ps-after.txt; echo "ps_after rows=$(wc -l <$D/ps-after.txt)" >> $D/aux.txt
