set -u
O=/workspace/meetwise-wt-an-perf-prove6/.tmp/an-perf-tear
L=$(docker ps -a --filter name=meetwise-e2e-r2pool- --format '{{.Names}}'); echo "nb4_list_exit=$? rows=$(printf '%s' "$L" | grep -c .)" > $O/lcli-aux.txt
docker ps -a --filter name=meetwise-e2e --filter name=meetwise-uc018 --format '{{.Names}}' | wc -l >> $O/lcli-aux.txt
S=()
for i in 1 2 3 4 5; do a=$(date +%s%3N); v=$(docker version --format '{{.Server.Version}}'); e=$?; b=$(date +%s%3N); echo "sample$i exit=$e out=$v ms=$((b-a))" >> $O/lcli-aux.txt; S+=($((b-a))); done
DV=$(docker version 2>&1)
SV=$(docker version --format '{{.Server.Version}}'); CV=$(docker version --format '{{.Client.Version}}')
python3 - "$O" "$SV" "$CV" "${S[@]}" <<'PY'
import sys, json, math
o, sv, cv, *s = sys.argv[1:]; s=[int(x) for x in s]
L=max(s); UB=min(109, 110-math.ceil(2*L/1.39))
d={"L_cli_samples_ms":s,"L_cli_ms":L,"k":2,"t_round_ms":1.39,"U_min":6,"formula":"U_B = min(109, 110 - ceil(k*L_cli/t_round))","U_B":UB,
   "BC_MARGIN_INFEASIBLE":UB<6,"docker_version":{"Server.Version":sv,"Client.Version":cv},"measured_at":__import__('datetime').datetime.now().astimezone().isoformat(),
   "note":"measured once before first prove (after NB-4 cleanup) · Ban re-measure / change k / t_round / U_B · C-c docker version recorded for audit only"}
json.dump(d,open(o+'/margin.json','w'),indent=2); print(json.dumps(d,indent=2))
PY
echo "$DV" > $O/docker-version-full.txt
