/**
 * No-database proof: interview-dispatch:prove fail-closes without inventing
 * a local Docker Postgres, and a successful remote run can write a receipt.
 * Does not connect to Postgres and does not start compose.
 */
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { assertInterviewDispatchRemoteGate } from './interview-dispatch-remote-gate.mjs';
import { writeInterviewDispatchRemoteReceipt } from './interview-dispatch-receipt.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const WRAPPER = join(ROOT, 'scripts', 'run-interview-dispatch-prove.mjs');
const GATE = join(ROOT, 'scripts', 'interview-dispatch-remote-gate.mjs');
const RECEIPT = join(ROOT, 'scripts', 'interview-dispatch-receipt.mjs');

let failures = 0;
const A = (name, ok) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
  if (!ok) failures += 1;
};

function expectThrow(env, code) {
  try {
    assertInterviewDispatchRemoteGate(env);
    return false;
  } catch (error) {
    return error instanceof Error && error.message === code;
  }
}

function runWrapper(env, extraArgs = []) {
  return spawnSync(process.execPath, [WRAPPER, ...extraArgs], {
    cwd: ROOT,
    env: { ...env, PATH: process.env.PATH },
    encoding: 'utf8',
    timeout: 15_000,
    shell: false,
  });
}

const wrapperSource = await readFile(WRAPPER, 'utf8');
const gateSource = await readFile(GATE, 'utf8');
const receiptSource = await readFile(RECEIPT, 'utf8');
const pgProofSource = await readFile(join(ROOT, 'apps/worker/test/interview-dispatch-fairness-pg.proof.ts'), 'utf8');
const packageJson = await readFile(join(ROOT, 'package.json'), 'utf8');
const ciYml = await readFile(join(ROOT, '.github', 'workflows', 'ci.yml'), 'utf8');

const invokesLocalDb = (source) =>
  /from\s+['"][^'"]*run-e2e-isolated|spawn\([^)]*run-e2e-isolated|compose\.dev\.yml|['"]db:up['"]|docker\s+compose\s+-f/.test(source);

A(
  '包装器 / 门 / 回执 / pg 证明不调用 compose、db:up 或 run-e2e-isolated',
  !invokesLocalDb(wrapperSource)
    && !invokesLocalDb(gateSource)
    && !invokesLocalDb(receiptSource)
    && !invokesLocalDb(pgProofSource)
    && wrapperSource.includes('assertInterviewDispatchRemoteGate')
    && wrapperSource.includes('--gate-only')
    && wrapperSource.includes('.tmp')
    && wrapperSource.includes('interview-dispatch-receipts')
    && pgProofSource.includes('assertInterviewDispatchRemotePostgres()')
    && !pgProofSource.includes('E2E_ISOLATED'),
);

A(
  '根脚本把 prove 接到包装器，raw 仍是 SQL 证明',
  packageJson.includes('"interview-dispatch:prove": "node scripts/run-interview-dispatch-prove.mjs"')
    && packageJson.includes('"interview-dispatch:prove:raw": "pnpm -C apps/worker prove:interview-dispatch-pg"')
    && packageJson.includes('"interview-dispatch:gate:prove": "node scripts/interview-dispatch-prove.proof.mjs"'),
);

A(
  'per-push CI 只跑无库 unit/gate，不跑远程 SQL prove',
  ciYml.includes('pnpm interview-dispatch:unit:prove')
    && ciYml.includes('pnpm interview-dispatch:gate:prove')
    && !/run:\s*pnpm interview-dispatch:prove\s*$/m.test(ciYml),
);

A(
  '缺远程配置失败关闭',
  expectThrow({}, 'interview_dispatch_prove_requires_remote_postgres')
    && expectThrow({ E2E_CLOUD_ISOLATED: '1' }, 'interview_dispatch_prove_requires_remote_postgres'),
);

A(
  '本地 Docker / loopback / compose 主机失败关闭',
  expectThrow(
    { E2E_ISOLATED: '1', PGHOST: '127.0.0.1', E2E_TEST_CONTAINER: 'meetwise-e2e-x' },
    'interview_dispatch_prove_forbids_local_docker_db',
  )
    && expectThrow({ E2E_CLOUD_ISOLATED: '1', PGHOST: 'postgres' }, 'interview_dispatch_prove_forbids_local_docker_db')
    && expectThrow({ E2E_CLOUD_ISOLATED: '1', PGHOST: 'localhost' }, 'interview_dispatch_prove_forbids_local_docker_db')
    && expectThrow({ E2E_CLOUD_ISOLATED: '1', PGHOST: 'meetwise-postgres-dev' }, 'interview_dispatch_prove_forbids_local_docker_db')
    && expectThrow({ E2E_CLOUD_ISOLATED: '1', PGHOST: '::1' }, 'interview_dispatch_prove_forbids_local_docker_db'),
);

A(
  'DATABASE_URL 失败关闭，即使同时给了远程标志',
  expectThrow(
    { E2E_CLOUD_ISOLATED: '1', PGHOST: '10.0.0.8', DATABASE_URL: 'postgresql://meetwise@10.0.0.8/meetwise' },
    'interview_dispatch_prove_forbids_database_url',
  ),
);

let remoteOk = true;
try { assertInterviewDispatchRemoteGate({ E2E_CLOUD_ISOLATED: '1', PGHOST: '10.0.0.8' }); }
catch { remoteOk = false; }
A('合法远程配置可通过门（不连库）', remoteOk);

const missing = runWrapper({ HOME: process.env.HOME ?? '' });
A(
  '包装器缺配置非零退出且立即失败关闭',
  missing.status === 1
    && missing.stderr.includes('interview_dispatch_prove_requires_remote_postgres')
    && !missing.stdout.includes('interview_dispatch_prove_shallow_gate_ok'),
);

const local = runWrapper({
  HOME: process.env.HOME ?? '',
  E2E_CLOUD_ISOLATED: '1',
  PGHOST: '127.0.0.1',
});
A(
  '包装器拒绝 loopback，不进入 raw SQL',
  local.status === 1
    && local.stderr.includes('interview_dispatch_prove_forbids_local_docker_db'),
);

const gated = runWrapper({
  HOME: process.env.HOME ?? '',
  E2E_CLOUD_ISOLATED: '1',
  PGHOST: '10.0.0.8',
}, ['--gate-only']);
A(
  '浅层远程标记 --gate-only 通过且不连库（不是 cloud attestation）',
  gated.status === 0 && gated.stdout.includes('interview_dispatch_prove_shallow_gate_ok'),
);

const rawLocal = spawnSync(process.execPath, [
  join(ROOT, 'node_modules/tsx/dist/cli.mjs'),
  'test/interview-dispatch-fairness-pg.proof.ts',
], {
  cwd: join(ROOT, 'apps/worker'),
  env: {
    PATH: process.env.PATH,
    HOME: process.env.HOME ?? '',
    E2E_ISOLATED: '1',
    PGHOST: '127.0.0.1',
    E2E_TEST_CONTAINER: 'meetwise-e2e-x',
  },
  encoding: 'utf8',
  timeout: 15_000,
  shell: false,
});
A(
  'pg 证明在本地 Docker 标记下立即失败关闭，不改起容器',
  rawLocal.status !== 0
    && `${rawLocal.stderr}${rawLocal.stdout}`.includes('interview_dispatch_prove_forbids_local_docker_db'),
);

const temporaryRoot = await mkdtemp(join(tmpdir(), 'meetwise-interview-dispatch-receipt-'));
try {
  const startedAt = new Date('2026-09-04T11:00:00.000Z');
  const finishedAt = new Date('2026-09-04T11:00:02.000Z');
  const { receipt, finalPath } = await writeInterviewDispatchRemoteReceipt({
    repoRoot: ROOT,
    receiptRoot: temporaryRoot,
    outcome: 'passed',
    exitCode: 0,
    startedAt,
    finishedAt,
  });
  const persisted = JSON.parse(await readFile(finalPath, 'utf8'));
  const serialized = JSON.stringify(persisted);
  A(
    '成功回执 class/路径/releaseEvidence 诚实，且不含连接串字段',
    receipt.class === 'remote_untrusted_interview_dispatch_receipt'
      && receipt.target === 'interview-dispatch:prove'
      && receipt.releaseEvidence === false
      && receipt.perPushCi === false
      && receipt.inventedLocalDocker === false
      && persisted.schemaMigrationManifest.count >= 1
      && persisted.sourceDigests['scripts/run-interview-dispatch-prove.mjs']?.startsWith('sha256:')
      && !Object.hasOwn(persisted, 'PGHOST')
      && !Object.hasOwn(persisted, 'DATABASE_URL')
      && !/postgresql:\/\//.test(serialized)
      && persisted.citeIn === 'ai-docs/architecture/current-runtime-truth.md',
  );
  let rejectedFail = false;
  try {
    await writeInterviewDispatchRemoteReceipt({
      repoRoot: ROOT,
      receiptRoot: temporaryRoot,
      outcome: 'failed',
      exitCode: 1,
      startedAt,
      finishedAt,
    });
  } catch (error) {
    rejectedFail = error instanceof Error && error.message === 'interview_dispatch_receipt_pass_only';
  }
  A('失败不得写通过回执', rejectedFail);
} finally {
  await rm(temporaryRoot, { recursive: true, force: true });
}

console.log(failures === 0
  ? '\n✓ interview-dispatch prove gate / receipt path passed (no database)'
  : `\n✗ ${failures} failures`);
process.exit(failures === 0 ? 0 : 1);
