/**
 * Caps child for uc018:perf-load:prove:raw.
 *
 * Enforces ≤2 vCPU / 4 GiB on the Node prove/API process via Docker
 * `--cpus=2 --memory=4g --network=host`, and records PG container HostConfig
 * (already started by run-e2e-isolated with the same caps) into
 * `.tmp/uc018-perf-load-receipts/_caps-evidence.json` for the prove to embed.
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

// Pass through isolated attestation env (no DATABASE_URL — forbidden by assertIsolatedTestTarget)
const passEnv = [
  'E2E_ISOLATED',
  'E2E_TEST_CONTAINER',
  'E2E_TEST_TARGET_TOKEN',
  'E2E_ISOLATION_STACK',
  'PGHOST',
  'PGPORT',
  'PGUSER',
  'PGPASSWORD',
  'PGDATABASE',
  'DATABASE_SSL_MODE',
  'PATH',
  'HOME',
  'NODE_OPTIONS',
];

const dockerArgs = [
  'run',
  '--rm',
  '--name', API_NAME,
  '--cpus', CPUS,
  '--memory', MEMORY,
  '--network', 'host',
  '-v', `${ROOT}:${ROOT}`,
  '-w', join(ROOT, 'apps/api'),
  '-u', `${process.getuid?.() ?? 1000}:${process.getgid?.() ?? 1000}`,
];
for (const k of passEnv) {
  if (process.env[k] != null && process.env[k] !== '') {
    dockerArgs.push('-e', `${k}=${process.env[k]}`);
  }
}
dockerArgs.push(
  NODE_IMAGE,
  'node',
  '--import',
  '@swc-node/register/esm-register',
  'test/uc-e2e-018-perf-load.proof.ts',
);

// Pre-write caps stub; update after inspect of running/created container.
// We inspect immediately after create by using a brief detached start — simpler:
// run attached, and inspect HostConfig from a create+start pattern.
// Practical approach: docker create → inspect → start -a

const createArgs = dockerArgs.filter((a, i) => !(a === 'run' || (dockerArgs[i - 1] === 'run')));
// Rebuild as: docker create ... then start -a
const create = [
  'create',
  '--name', API_NAME,
  '--cpus', CPUS,
  '--memory', MEMORY,
  '--network', 'host',
  '-v', `${ROOT}:${ROOT}`,
  '-w', join(ROOT, 'apps/api'),
  '-u', `${process.getuid?.() ?? 1000}:${process.getgid?.() ?? 1000}`,
];
for (const k of passEnv) {
  if (process.env[k] != null && process.env[k] !== '') {
    create.push('-e', `${k}=${process.env[k]}`);
  }
}
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
