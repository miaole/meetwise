// harness driver (not product code). args: <attemptDir> <inject:none|A|B|C> [ub]
import { spawn } from 'node:child_process';
import { createWriteStream, readFileSync, writeFileSync } from 'node:fs';
import { createInterface } from 'node:readline';
const [dir, inj, ubArg] = process.argv.slice(2);
const ROOT = '/workspace/meetwise-wt-an-perf-prove6';
const TOOLS = ROOT + '/.tmp/an-perf-tear/tools';
const CMD = './scripts/with-docker-session.sh env -u MODEL_API_KEY -u MODEL_BASE_URL pnpm uc018:perf-load:prove';
const now = () => Date.now();
const meta = { inject: inj, ub: ubArg ? Number(ubArg) : null, cmd: CMD, t_start: now() };
const plog = createWriteStream(dir + '/prove.log'), pts = createWriteStream(dir + '/prove.ts.log');
const ilog = createWriteStream(dir + '/inject.log'), its = createWriteStream(dir + '/inject.ts.log');
let pg = null, injStarted = false, psqlDone = null, injCmdDone = null;
function run(cmd, args, input) {
  return new Promise((res) => {
    const t0 = now(); const c = spawn(cmd, args); let out = '', err = '';
    c.stdout.on('data', (d) => out += d); c.stderr.on('data', (d) => err += d);
    if (input != null) { c.stdin.end(input); }
    c.on('close', (code) => res({ cmd: [cmd, ...args].join(' '), exit: code, stdout: out, stderr: err, t0, t1: now() }));
  });
}
function startInject() {
  injStarted = true; meta.t_inject_spawn = now();
  const sql = inj === 'A' ? readFileSync(TOOLS + '/inject-a.sql', 'utf8')
    : readFileSync(TOOLS + '/gate-bc.sql.tmpl', 'utf8').replace('<UB>', String(meta.ub));
  writeFileSync(dir + '/inject-' + (inj === 'A' ? 'a' : 'bc') + '.sql', sql);
  if (inj === 'B') run('docker', ['port', pg, '5432/tcp']).then((r) => { meta.port_before = r; });
  const c = spawn('docker', ['exec', '-i', pg, 'psql', '-X', '-v', 'ON_ERROR_STOP=1', '-U', 'meetwise', '-d', 'meetwise', '-qtA']);
  let buf = '';
  const onData = (d) => { buf += d; const s = String(d); ilog.write(s); for (const l of s.split('\n')) if (l) its.write(`${now()} ${l}\n`);
    if (!meta.t_gate_marker && /GATE_BC phase=seed|INJECT_[A-Z_]+|INJECT_A phase/.test(s)) meta.t_gate_marker = now(); };
  c.stdout.on('data', onData); c.stderr.on('data', onData);
  c.stdin.end(sql);
  psqlDone = new Promise((res) => c.on('close', async (code) => {
    meta.psql_exit = code; meta.t_psql_close = now();
    if ((inj === 'B' || inj === 'C') && /GATE_BC phase=seed/.test(buf)) {
      const r = inj === 'B' ? await run('docker', ['restart', '-t', '0', pg]) : await run('docker', ['rm', '-f', pg]);
      meta.inject_cmd = r;
      if (inj === 'B') meta.port_after = await run('docker', ['port', pg, '5432/tcp']);
    }
    res();
  }));
}
const p = spawn('bash', ['-c', CMD + ' 2>&1'], { cwd: ROOT });
const rl = createInterface({ input: p.stdout });
rl.on('line', (l) => {
  const t = now(); plog.write(l + '\n'); pts.write(`${t} ${l}\n`);
  let m;
  if (!pg && (m = l.match(/^E2E isolated PostgreSQL: (\S+) on/))) { pg = m[1]; meta.pg = pg; }
  if (/^PERF run1: /.test(l) && !meta.t_perf1) { meta.t_perf1 = t; if (inj !== 'none' && pg && !injStarted) startInject(); }
  if (/^LOAD run2: /.test(l) && !meta.t_load2) meta.t_load2 = t;
  if (/^PERF run3: /.test(l) && !meta.t_perf3) meta.t_perf3 = t;
});
p.on('close', async (code) => {
  meta.prove_exit = code; meta.t_end = now();
  plog.write(`RAW_EXIT=${code}\n`);
  if (psqlDone) await Promise.race([psqlDone, new Promise((r) => setTimeout(r, 15000))]);
  writeFileSync(dir + '/meta.json', JSON.stringify(meta, null, 2) + '\n');
  plog.end(); ilog.end(); console.log(`RAW_EXIT=${code}`); process.exit(0);
});
