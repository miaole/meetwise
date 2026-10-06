#!/usr/bin/env python3
# harness analyzer (not product code): python3 analyze.py <cell> <attemptDir>
import json, re, sys, os
cell, d = sys.argv[1], sys.argv[2]
meta = json.load(open(f'{d}/meta.json'))
log = open(f'{d}/prove.log').read()
lines = log.split('\n')
ts = []
for l in open(f'{d}/prove.ts.log'):
    t, _, rest = l.rstrip('\n').partition(' ')
    ts.append((int(t), rest))
aux = dict(re.findall(r'(\w+)=(\S+)', open(f'{d}/aux.txt').read()))
inj = open(f'{d}/inject.log').read() if os.path.exists(f'{d}/inject.log') else ''
info = open(f'{d}/attempt-info.txt').read()
pg = meta.get('pg')
fails = []; obs = {}
EXIT = meta['prove_exit']; obs['prove_exit'] = EXIT
# Unhandled block (C-a: full Node printed block incl. Emitted-at section)
unh_idx = [i for i, l in enumerate(lines) if "Unhandled 'error' event" in l]
obs['unhandled_n'] = len(unh_idx)
block = ''
if unh_idx:
    i0 = max(0, unh_idx[0] - 3); j = unh_idx[0]
    while j < len(lines) and not lines[j].startswith('Node.js v'): j += 1
    block = '\n'.join(lines[i0:j + 1])
    open(f'{d}/unhandled-block.txt', 'w').write(block + '\n')
em = re.search(r"Emitted 'error' event on (\w+) instance at:", block)
obs['emitted_on'] = em.group(1) if em else None
emitted_section = block[em.start():] if em else ''
fr = re.findall(r'\S*(pg/lib/client\.js:\d+|pg-pool/index\.js:\d+)', emitted_section)
obs['emitted_at_pg_frames'] = fr[:6]
obs['block_pg_frame'] = bool(re.search(r'pg/lib/client\.js|pg-pool/index\.js', block))
own = block[:em.start()] if em else block
obs['own_stack_pg_frame'] = bool(re.search(r'pg/lib/client\.js|pg-pool/index\.js', own))
obs['block_57P01'] = bool(re.search(r'57P01|terminating connection due to administrator command', block))
m = re.search(r"^\s*(\w*Error[^\n]*|error: [^\n]*)", own, re.M)
obs['unhandled_text'] = (m.group(1)[:160] if m else None)
dpe = [l for l in lines if '"event":"db_pool_error"' in l]
obs['db_pool_error_n'] = len(dpe); obs['db_pool_error_msgs'] = sorted(set(re.findall(r'"error_message":"([^"]*)"', '\n'.join(dpe))))
obs['summary'] = bool(re.search(r'^SUMMARY ', log, re.M)); obs['allPass_true'] = 'SUMMARY allPass=true' in log
obs['cmd_exit0_line'] = 'CMD=pnpm uc018:perf-load:prove EXIT=0' in log
obs['perf_run3_line'] = bool(re.search(r'^PERF run3: ', log, re.M))
obs['seedAbandonTargets_in_log'] = 'seedAbandonTargets' in log
obs['state29'] = 'state_bytes=29 logs_bytes=29' in log
obs['form'] = 'F1' if obs['summary'] and not obs['allPass_true'] else ('F2' if not obs['summary'] else 'PASS')
obs['CTU_present'] = 'Connection terminated unexpectedly' in log
# first error line
errt = next((t for t, l in ts if re.search(r"Connection terminated|db_pool_error|Unhandled 'error'|terminating connection|ECONNREFUSED", l)), None)
obs['t_first_error'] = errt
# J-2 events
evs = []
for l in open(f'{d}/events.jsonl'):
    try: evs.append(json.loads(l))
    except Exception: fails.append('AUX_EXIT_UNEXPECTED:events_unparseable')
pge = [e for e in evs if e.get('Actor', {}).get('Attributes', {}).get('name') == pg]
seq = [(e['Action'], int(e['timeNano']) // 1_000_000, e['Actor']['Attributes'].get('signal'), e['Actor']['Attributes'].get('exitCode')) for e in pge if e['Action'] in ('create', 'start', 'kill', 'die', 'destroy', 'oom', 'restart', 'stop')]
obs['pg_events'] = seq
if not any(a in ('create', 'start') for a, *_ in seq): fails.append('AUX_EXIT_UNEXPECTED:events_no_pg_create_start')
before = [s for s in seq if errt is not None and s[1] < errt and s[0] in ('kill', 'die', 'destroy', 'oom')]
obs['pg_teardown_before_first_error'] = before
procs = open(f'{d}/procs.txt').read()
foreign_emit = [l for l in procs.split('\n') if 'uc018-receipt-backfill-emit' in l]
obs['foreign_emit_proc_lines'] = len(foreign_emit)
tsl = len(re.findall(r'^\d+\.\d+$', procs, re.M)); dur = (meta['t_end'] - meta['t_start']) / 1000
if tsl < dur - 1 or 'run-e2e-isolated' not in procs: fails.append(f'AUX_EXIT_UNEXPECTED:procs tsl={tsl} dur={dur:.1f}')
ic = meta.get('inject_cmd') or {}
if errt is None: j2 = 'OUT'
elif meta['inject'] == 'B' and ic.get('t0') and ic['t0'] <= errt and any(a == 'kill' and ic['t0'] <= t <= ic['t1'] for a, t, *_ in seq): j2 = 'B-restart(inject-initiated)'
elif any(a == 'kill' and sig == '9' for a, t, sig, _ in before) and any(a == 'die' and ec == '137' for a, t, _, ec in before) and any(a == 'destroy' for a, *_ in before):
    j2 = 'L3-sim' if (meta['inject'] == 'C' and ic.get('t0') and ic['t0'] <= min(t for a, t, *_ in before)) else ('L3 IN' if foreign_emit else 'EXTERNAL-OTHER')
elif any(a in ('oom', 'die') for a, *_ in before): j2 = 'B-restart' if meta['inject'] == 'B' else 'L2-self IN'
else: j2 = 'L1/client-side'
if meta['inject'] == 'C' and ic.get('t0') and errt is not None:
    k9 = [t for a, t, sig, _ in seq if a == 'kill' and sig == '9']; dd = [t for a, t, _, ec in seq if a == 'die' and ec == '137']; ds = [t for a, *r in seq for t in [r[0]] if a == 'destroy']
    obs['C_seq_ms_rel_first_error'] = {'kill9': (k9[0] - errt) if k9 else None, 'die137': (dd[0] - errt) if dd else None, 'destroy': (ds[0] - errt) if ds else None, 'inject_cmd_t0': ic['t0'] - errt}
    obs['J2_kill_start_reading'] = 'L3-sim' if (k9 and dd and ds and ic['t0'] <= k9[0] < errt and k9[0] < dd[0] < ds[0] and not foreign_emit) else 'no'
    if j2 != 'L3-sim': j2 = 'L3-sim-temporal-mismatch(die/destroy after first error)' if obs['J2_kill_start_reading'] == 'L3-sim' else j2
obs['J2'] = j2
# AUX
if aux.get('ps_before_exit') != '0' or aux.get('rows') is None: pass
pb = open(f'{d}/ps-before.txt').read().strip(); pa = open(f'{d}/ps-after.txt').read().strip()
if pb: fails.append('SERIAL_NOT_EMPTY')
if pa: fails.append('AUX_EXIT_UNEXPECTED:ps_after_nonempty')
for k in ('events', 'procs'):
    if aux.get(f'{k}_kill_exit') != '0': fails.append(f'AUX_EXIT_UNEXPECTED:{k}_kill_exit={aux.get(k+"_kill_exit")}')
    if aux.get(f'{k}_wait') not in ('143', '0'): fails.append(f'AUX_EXIT_UNEXPECTED:{k}_wait={aux.get(k+"_wait")}')
obs['aux'] = {k: aux.get(k) for k in ('events_kill_exit', 'events_wait', 'procs_kill_exit', 'procs_wait')}
# MUT check
mut = {'A-MUT': 1, 'B-MUT': 2, 'C-MUT': 2}.get(cell)
dl = re.search(r'(\d+) deletions?\(-\)', info)
obs['mut_deletions'] = int(dl.group(1)) if dl else 0
if (mut or 0) != obs['mut_deletions']: fails.append(f'MUT_STATE_MISMATCH expected={mut} got={obs["mut_deletions"]}')
# inject self
if meta['inject'] != 'none':
    obs['psql_exit'] = meta.get('psql_exit')
    gls = re.findall(r'GATE_LOOP_START t0_ms=(\d+) iv_rows=(\d+)', inj)
    obs['gate_loop_start'] = gls; obs['t_load2'] = meta.get('t_load2'); obs['t_perf1'] = meta.get('t_perf1')
    marks = re.findall(r'NOTICE:\s+((?:GATE_BC|INJECT_\w+)[^\n]*)', inj)
    obs['marker'] = marks
    if meta.get('t_perf1') is None: fails.append('INJECT_NOT_REACHED')
    if len(gls) != 1 or gls[0][1] != '0' or not meta.get('t_load2') or int(gls[0][0]) >= meta['t_load2']: fails.append('INJECT_LATE')
    if meta.get('psql_exit') != 0: fails.append(f'INJECT_SELF_EXIT psql={meta.get("psql_exit")}')
    if len(marks) != 1: fails.append(f'INJECT_MARKER_COUNT {len(marks)}')
    mk = marks[0] if marks else ''
    if meta.get('t_perf3') and meta.get('t_gate_marker') and meta['t_perf3'] < meta['t_gate_marker']: fails.append('INJECT_LATE:perf3_before_gate')
    if meta['inject'] == 'A':
        mm = re.match(r'INJECT_A phase=seed killed=(\d+)', mk)
        if not mm: fails.append(mk.split(' ')[0] or 'INJECT_NO_MARKER')
        elif int(mm.group(1)) < 1: fails.append('INJECT_MISS')
    else:
        if not mk.startswith('GATE_BC phase=seed'): fails.append(mk.split(' ')[0] or 'INJECT_NO_MARKER')
        else:
            obs['inject_cmd'] = {k: ic.get(k) for k in ('cmd', 'exit', 't0', 't1')} | {'stdout': (ic.get('stdout') or '').strip()}
            if ic.get('exit') != 0 or (ic.get('stdout') or '').strip() != pg: fails.append('INJECT_CMD_SELF_FAIL')
            gm = re.search(r'ts_ms=(\d+)', mk); obs['D_gate_to_cmd_return_ms'] = (ic.get('t1') - int(gm.group(1))) if gm and ic.get('t1') else None
            kt = [t for a, t, *_ in seq if a == 'kill']; obs['kill_event_ms'] = kt[:1]; obs['D_gate_to_kill_event_ms'] = (kt[0] - int(gm.group(1))) if kt and gm else None
    if meta['inject'] == 'B':
        obs['port_before'] = (meta.get('port_before') or {}).get('stdout', '').strip(); pa_ = meta.get('port_after') or {}
        obs['port_after'] = pa_.get('stdout', '').strip() or pa_.get('stderr', '').strip(); obs['port_changed'] = obs['port_before'] != obs['port_after']
# cell expectations
U, E, P = obs['unhandled_n'] > 0, obs['emitted_on'], obs['block_pg_frame']
def need(c, tag):
    if not c: fails.append(tag)
if cell == 'PC':
    need(EXIT == 0, 'EXIT!=0'); need(obs['allPass_true'] and obs['cmd_exit0_line'], 'NO_SUMMARY_PASS'); need(not U, 'UNHANDLED'); need(obs['db_pool_error_n'] == 0, 'DB_POOL_ERROR'); need(j2 == 'OUT', 'J2_NOT_OUT')
elif cell.endswith('MUT'):
    need(EXIT == 1, 'EXIT!=1'); need(not obs['summary'], 'SUMMARY_PRESENT')
    if not U:
        fails.append('INJECT_KIND_POOLQUERY_RACE' if cell != 'A-MUT' and obs['seedAbandonTargets_in_log'] else 'NO_UNHANDLED')
    else:
        need(E == 'Client' if cell == 'A-MUT' else E in ('Client', 'BoundPool'), f'EMITTED_ON={E}'); need(P, 'UNHANDLED_NOT_PG')
    if cell == 'A-MUT':
        if U and not obs['block_57P01']: fails.append('A_FATAL_ON_ACTIVE')
        need(not obs['pg_teardown_before_first_error'], 'PG_DIED')
    else:
        need(obs['db_pool_error_n'] == 0, 'MUT_NOT_APPLIED')
    if cell == 'C-MUT': need(obs['state29'], 'NO_STATE29')
else:
    need(EXIT == 1, 'POST_EXIT_UNEXPECTED' if EXIT == 0 else 'EXIT!=1'); need(not U, 'UNHANDLED')
    if cell == 'A-POST':
        need(any('terminating connection due to administrator command' in m for m in obs['db_pool_error_msgs']), 'A_FATAL_ON_ACTIVE')
        need(not obs['pg_teardown_before_first_error'], 'PG_DIED')
    if cell == 'B-POST':
        if obs['db_pool_error_n'] < 1: fails.append('INJECT_KIND_POOLQUERY_RACE')
        need(obs['form'] == 'F2' and not obs['perf_run3_line'] and obs['seedAbandonTargets_in_log'], 'INJECT_PHASE_DRIFT')
    if cell == 'C-POST':
        need(obs['db_pool_error_n'] >= 1, 'DB_POOL_ERROR_0'); need(obs['state29'], 'NO_STATE29'); need(j2 == 'L3-sim', f'J2_NOT_L3SIM({j2})')
res = {'cell': cell, 'attempt': os.path.basename(d), 'pass': not fails, 'fails': fails, 'obs': obs}
json.dump(res, open(f'{d}/verdict.json', 'w'), indent=1, default=str)
print(json.dumps({'attempt': res['attempt'], 'pass': res['pass'], 'fails': fails, 'exit': EXIT, 'J2': j2, 'emitted': E, 'frames': obs['emitted_at_pg_frames'][:2], 'dpe': obs['db_pool_error_n'], 'marker': obs.get('marker'), 'form': obs['form']}, default=str))
