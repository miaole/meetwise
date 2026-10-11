// FLK rootcause experiment lib — external driver only.
// Zero product/test/harness surface touched: this library only launches docker
// containers and spawns the tree's own pnpm targets with the same env the
// runner (scripts/run-e2e-isolated.mjs) would construct.  The runner itself is
// never imported, never modified; sequence steps mirror :1840/:1976-1988/:2146-2173/
// :2175-2188/:2295-2331 read-only.
import { createRequire } from 'node:module';
import { randomUUID } from 'node:crypto';
import { spawn } from 'node:child_process';
import { appendFileSync, writeFileSync } from 'node:fs';
// `pg` is a direct dependency of the db workspace (not the repo root) — resolve
// from packages/db exactly like the runner's probeHostSql does (:2123-2127).
const requireDb = createRequire('/Users/miaole/Desktop/golucky/meetwise-line-flk/packages/db/package.json');
const { Client } = requireDb('pg');

export const ROOT = '/Users/miaole/Desktop/golucky/meetwise-line-flk';
export const IMAGE = 'pgvector/pgvector:pg16';
const CONTAINER_PORT_TTL_MS = 120_000;

export const capture = (cmd, args, opts = {}) => new Promise((resolve, reject) => {
  const child = spawn(cmd, args, { cwd: opts.cwd ?? ROOT, env: opts.env ?? process.env, timeout: opts.timeoutMs ?? 10_000 });
  let out = '';
  const ondata = (d) => { out += d; };
  child.stdout.on('data', ondata);
  child.stderr.on('data', ondata);
  child.on('error', reject);
  child.on('close', (code) => (code === 0 ? resolve(out) : reject(new Error(`${cmd} ${args.join(' ')} exit=${code}: ${out.slice(0, 400)}`))));
});

export const nowMs = () => Date.now();
export const log = (file, line) => {
  const text = `${new Date().toISOString()} ${line}`;
  if (file) appendFileSync(file, `${text}\n`);
  console.log(text);
};

export function baseEnvFor(container, token, port) {
  // Mirror scripts/run-e2e-isolated.mjs baseEnv (:1976-1988) with NO shell
  // inheritance: cloud credentials / stale E2E_* / PG* cannot leak in
  // (runner strips them from inheritedEnv :1973; we never inherit at all).
  return {
    PATH: process.env.PATH,
    HOME: process.env.HOME,
    E2E_ISOLATED: '1',
    E2E_TEST_CONTAINER: container,
    E2E_TEST_TARGET_TOKEN: token,
    DATABASE_SSL_MODE: 'disable',
    PGHOST: '127.0.0.1',
    PGUSER: 'meetwise',
    PGPASSWORD: 'meetwise_dev_password',
    PGDATABASE: 'meetwise',
    ...(port ? { PGPORT: String(port) } : {}),
  };
}

export async function bootContainer(name, token, { keep = false } = {}) {
  const args = ['run', ...(keep ? ['-d'] : ['--rm', '-d']), '--name', name,
    '-e', 'POSTGRES_USER=meetwise',
    '-e', 'POSTGRES_PASSWORD=meetwise_dev_password',
    '-e', 'POSTGRES_DB=meetwise',
    '-p', '127.0.0.1::5432', IMAGE,
    'postgres', '-c', `meetwise.e2e_run_token=${token}`];
  const t0 = nowMs();
  await capture('docker', args, { timeoutMs: CONTAINER_PORT_TTL_MS });
  const portOut = await capture('docker', ['port', name, '5432/tcp'], { timeoutMs: 10_000 });
  const m = portOut.match(/127\.0\.0\.1:(\d+)/);
  if (!m) throw new Error(`isolated_postgres_port_unparseable:${portOut}`);
  return { container: name, token, port: Number(m[1]), bootMs: nowMs() - t0 };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Host-side real SQL probe — mirror probeHostSql (:2123-2127): pg Client,
// connectionTimeoutMillis=2000, SELECT 1.  Returns {ok, code, ms}.
export async function probeHostSql(port) {
  const client = new Client({
    host: '127.0.0.1', port, user: 'meetwise', password: 'meetwise_dev_password',
    database: 'meetwise', ssl: false, connectionTimeoutMillis: 2000,
  });
  const t0 = nowMs();
  try {
    await client.connect();
    await client.query('SELECT 1');
    return { ok: true, code: null, ms: nowMs() - t0 };
  } catch (err) {
    return { ok: false, code: err?.code ?? err?.message?.slice(0, 60), ms: nowMs() - t0 };
  } finally {
    await client.end().catch(() => undefined);
  }
}

// TCP-only connect probe (the ECONNREFUSED signal class, no SQL round trip).
export async function probeTcpConnect(port) {
  const { default: net } = await import('node:net');
  return new Promise((resolve) => {
    const t0 = nowMs();
    const socket = net.connect({ host: '127.0.0.1', port });
    const done = (outcome) => { try { socket.destroy(); } catch { /* noop */ } resolve({ outcome, ms: nowMs() - t0 }); };
    socket.setTimeout(2000);
    socket.on('connect', () => done('ok'));
    socket.on('error', (err) => done(err.code ?? 'unknown'));
    socket.on('timeout', () => done('timeout'));
  });
}

// waitForPostgres equivalent (:2146-2173): 3-consecutive (in-container psql
// SELECT 1 + host SQL probe), 90 attempts, 1s backoff.  Returns attempt count.
export async function waitForPostgres(container, port, { consecutive = 3, label = 'boot', logFile } = {}) {
  let streak = 0;
  for (let attempt = 0; attempt < 90; attempt++) {
    try {
      await capture('docker', ['exec', container, 'psql', '-v', 'ON_ERROR_STOP=1', '-U', 'meetwise', '-d', 'meetwise', '-Atqc', 'SELECT 1'], { timeoutMs: 5_000 });
      const host = await probeHostSql(port);
      if (!host.ok) throw new Error(`host_probe_${host.code}`);
      streak += 1;
      if (streak >= consecutive) {
        log(logFile, `E2E_POSTGRES_READY label=${label} consecutive=${streak} attempt=${attempt + 1}`);
        return attempt + 1;
      }
    } catch {
      streak = 0;
      await sleep(1_000);
    }
  }
  throw new Error(`isolated_postgres_database_not_ready:${label}`);
}

export async function migrate(env, logFile) {
  const t0 = nowMs();
  const out = await capture('pnpm', ['-C', 'packages/db', 'migrate'], { env, timeoutMs: 300_000 });
  log(logFile, `MIGRATE applied ms=${nowMs() - t0} ${out.match(/applied=\d+ skipped=\d+/)?.[0] ?? 'no-summary'}`);
}

export async function dockerRunning(container) {
  try {
    const out = await capture('docker', ['inspect', '--format', '{{.State.Running}}', container], { timeoutMs: 5_000 });
    return String(out).trim() === 'true';
  } catch {
    return false;
  }
}

// emitFailureDiagnostic equivalent (:2138-2144): byte counts only, raw state
// and logs never persisted.  Missing container => dockerDiagnostic catch value
// 'docker_diagnostic_unavailable' (29 bytes) — the cold-5.log state_bytes=29 band.
export async function withheldDiagnostics(container) {
  const diag = async (args) => capture('docker', args, { timeoutMs: 5_000 }).catch(() => 'docker_diagnostic_unavailable');
  const [state, logs] = await Promise.all([
    diag(['inspect', '--format', '{{json .State}}', container]),
    diag(['logs', '--tail', '80', container]),
  ]);
  return { state_bytes: Buffer.byteLength(state), logs_bytes: Buffer.byteLength(logs) };
}

// Teed raw prove spawn — mirrors the A'' authorized CMD shape:
//   set -o pipefail; pnpm -C packages/db prove:privacy-authorization 2>&1 | tee LOG; rc=$?; PROCESS_EXIT line appended.
export function runProveRawTeed(env, logPath) {
  return new Promise((resolve) => {
    const cmd = `set -o pipefail; pnpm -C packages/db prove:privacy-authorization 2>&1 | tee "${logPath}"; rc=$?; printf '\\nPROCESS_EXIT=%s\\n' "$rc" | tee -a "${logPath}"; exit $rc`;
    const startedAt = new Date().toISOString();
    const child = spawn('/bin/zsh', ['-c', cmd], { cwd: ROOT, env });
    child.on('close', (code) => resolve({ exit: code ?? 1, startedAt, finishedAt: new Date().toISOString() }));
    child.on('error', () => resolve({ exit: 1, startedAt, finishedAt: new Date().toISOString() }));
  });
}

export async function cleanupContainer(container) {
  await capture('docker', ['rm', '-f', container], { timeoutMs: 15_000 }).catch(() => undefined);
}

export const newContainerName = (label) => `meetwise-e2e-${process.pid}-${label}-${Date.now()}`;
export const newToken = () => randomUUID();
export const writeJson = (path, obj) => writeFileSync(path, `${JSON.stringify(obj, null, 2)}\n`);
