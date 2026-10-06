/**
 * Caps child for uc018:perf-load:prove:raw.
 *
 * Enforces ≤2 vCPU / 4 GiB on the Node prove/API process via Docker
 * `--cpus=2 --memory=4g` on the default bridge network, and records PG container
 * HostConfig (already started by run-e2e-isolated with the same caps) into
 * `.tmp/uc018-perf-load-receipts/_caps-evidence.json` for the prove to embed.
 *
 * C-PERF-CONTAINER-REACHABILITY (Line SS, pre-exec dual BOTH PASS): the API
 * container deliberately does NOT use `--network=host`.  On Docker Desktop/macOS
 * that flag shares the Docker *VM* network stack, where the host-loopback
 * published port of the isolated PG container (`-p 127.0.0.1::5432`) is
 * unreachable → ECONNREFUSED at assertIsolatedTestTarget.  Instead the container
 * stays on the default bridge with an explicit
 * `--add-host=host.docker.internal:host-gateway` entry, and PGHOST is overridden
 * to the literal `host.docker.internal` for THIS container only (the host-side
 * baseEnv in run-e2e-isolated.mjs keeps PGHOST='127.0.0.1' and every other prove
 * target is unchanged).  assertIsolatedTestEnvironment admits exactly the two
 * closed literals '127.0.0.1' | 'host.docker.internal' — the server-side nonce
 * tripwire (meetwise.e2e_run_token) remains the hard floor.  Validity domain of
 * the host-gateway literal is Docker Desktop/macOS; a plain Linux/CI topology
 * must re-verify reachability honestly before relying on it.
 *
 * If caps cannot be enforced → write enforced:false and still run (prove will EXIT≠0).
 */
import { spawnSync, execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const RAW_DIR = join(ROOT, '.tmp/uc018-perf-load-receipts');
const CAPS_PATH = join(RAW_DIR, '_caps-evidence.json');
const API_NAME = `meetwise-uc018-perf-api-${process.pid}-${Date.now()}`;
const CPUS = '2';
const MEMORY = '4g';
const NANO_CPUS_EXPECTED = 2_000_000_000; // 2 CPU
const MEMORY_EXPECTED = 4 * 1024 * 1024 * 1024; // 4 GiB
const NODE_IMAGE = process.env.UC018_PERF_NODE_IMAGE || 'node:20-bookworm';

mkdirSync(RAW_DIR, { recursive: true });

function sh(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { encoding: 'utf8', ...opts });
  return r;
}

function inspectHostConfig(name) {
  try {
    const out = execFileSync(
      'docker',
      ['inspect', '--format', '{{json .HostConfig}}', name],
      { encoding: 'utf8' },
    ).trim();
    return JSON.parse(out);
  } catch (e) {
    return { error: String(e?.message || e) };
  }
}

function capsOk(hc) {
  if (!hc || hc.error) return false;
  const nano = Number(hc.NanoCpus || 0);
  const mem = Number(hc.Memory || 0);
  // Allow exact match; Docker may report NanoCpus=2000000000 for --cpus=2
  return nano === NANO_CPUS_EXPECTED && mem === MEMORY_EXPECTED;
}

const pgContainer = process.env.E2E_TEST_CONTAINER;
if (!pgContainer) {
  writeFileSync(
    CAPS_PATH,
    `${JSON.stringify({ enforced: false, blocker: 'E2E_TEST_CONTAINER_missing' }, null, 2)}\n`,
  );
  console.error('UC018_CAPS: E2E_TEST_CONTAINER missing');
  process.exit(1);
}

const pgHost = inspectHostConfig(pgContainer);
const pgEnforced = capsOk(pgHost);
console.log(
  `UC018_CAPS pg container=${pgContainer} NanoCpus=${pgHost.NanoCpus} Memory=${pgHost.Memory} ok=${pgEnforced}`,
);

// Ensure node image present
const pull = sh('docker', ['image', 'inspect', NODE_IMAGE], { stdio: 'ignore' });
if (pull.status !== 0) {
  console.log(`UC018_CAPS pulling ${NODE_IMAGE}…`);
  const p = sh('docker', ['pull', NODE_IMAGE], { stdio: 'inherit' });
  if (p.status !== 0) {
    writeFileSync(
      CAPS_PATH,
      `${JSON.stringify({
        enforced: false,
        blocker: 'node_image_pull_failed',
        nodeImage: NODE_IMAGE,
        pg: { container: pgContainer, HostConfig: { NanoCpus: pgHost.NanoCpus, Memory: pgHost.Memory } },
      }, null, 2)}\n`,
    );
    process.exit(1);
  }
}

// Pass through isolated attestation env (no DATABASE_URL — forbidden by assertIsolatedTestTarget).
// PGHOST is NOT passed through: the host-side baseEnv value ('127.0.0.1') is meaningless inside
// the bridge container and is overridden below with the host-gateway literal, perf path only.
const passEnv = [
  'E2E_ISOLATED',
  'E2E_TEST_CONTAINER',
  'E2E_TEST_TARGET_TOKEN',
  'E2E_ISOLATION_STACK',
  'PGPORT',
  'PGUSER',
  'PGPASSWORD',
  'PGDATABASE',
  'DATABASE_SSL_MODE',
  'PATH',
  'HOME',
  'NODE_OPTIONS',
];

// docker create → inspect HostConfig → docker start -a (caps evidence comes from the
// created container's HostConfig; the proof output is streamed attached).
const create = [
  'create',
  '--name', API_NAME,
  '--cpus', CPUS,
  '--memory', MEMORY,
  // Default bridge + explicit host-gateway host entry (Docker Desktop/macOS supported path
  // to the host's loopback-published ports).  NOT --network=host: that shares the Docker VM
  // network stack on Docker Desktop/macOS and cannot reach 127.0.0.1-published ports.
  '--add-host=host.docker.internal:host-gateway',
  '-v', `${ROOT}:${ROOT}`,
  '-w', join(ROOT, 'apps/api'),
  '-u', `${process.getuid?.() ?? 1000}:${process.getgid?.() ?? 1000}`,
];
for (const k of passEnv) {
  if (process.env[k] != null && process.env[k] !== '') {
    create.push('-e', `${k}=${process.env[k]}`);
  }
}
// C-PERF-CONTAINER-REACHABILITY: single authorized PGHOST injection point.  The assert
// whitelist (isolated-test-target.ts) admits exactly '127.0.0.1' | 'host.docker.internal'.
create.push('-e', 'PGHOST=host.docker.internal');
create.push(
  NODE_IMAGE,
  'node',
  '--import',
  '@swc-node/register/esm-register',
  'test/uc-e2e-018-perf-load.proof.ts',
);

const cr = sh('docker', create, { cwd: ROOT });
if (cr.status !== 0) {
  console.error(cr.stderr || cr.stdout);
  writeFileSync(
    CAPS_PATH,
    `${JSON.stringify({
      enforced: false,
      blocker: 'api_container_create_failed',
      stderr: (cr.stderr || '').slice(0, 500),
      pg: { container: pgContainer, HostConfig: { NanoCpus: pgHost.NanoCpus, Memory: pgHost.Memory }, ok: pgEnforced },
    }, null, 2)}\n`,
  );
  process.exit(1);
}

const apiHost = inspectHostConfig(API_NAME);
const apiEnforced = capsOk(apiHost);
const enforced = pgEnforced && apiEnforced;

const capsDoc = {
  enforced,
  method: 'docker --cpus=2 --memory=4g',
  declared: { cpus: 2, memoryGiB: 4 },
  pg: {
    container: pgContainer,
    HostConfig: { NanoCpus: pgHost.NanoCpus, Memory: pgHost.Memory },
    ok: pgEnforced,
  },
  api: {
    container: API_NAME,
    HostConfig: { NanoCpus: apiHost.NanoCpus, Memory: apiHost.Memory },
    ok: apiEnforced,
  },
  expected: { NanoCpus: NANO_CPUS_EXPECTED, Memory: MEMORY_EXPECTED },
  blocker: enforced
    ? null
    : !pgEnforced
      ? 'pg_caps_mismatch'
      : 'api_caps_mismatch',
};
writeFileSync(CAPS_PATH, `${JSON.stringify(capsDoc, null, 2)}\n`);
console.log(`UC018_CAPS written enforced=${enforced} api NanoCpus=${apiHost.NanoCpus} Memory=${apiHost.Memory}`);

const start = sh('docker', ['start', '-a', API_NAME], { cwd: ROOT, stdio: 'inherit' });
sh('docker', ['rm', '-f', API_NAME], { stdio: 'ignore' });
process.exit(start.status ?? 1);
