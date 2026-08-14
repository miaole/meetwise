/**
 * Production migration entrypoint contract.
 *
 * The migrator normally receives DATABASE_URL, then provisions narrower
 * service logins and verifies the RAG control manifest through its own URL.
 * This proof executes that exact child entrypoint in an isolated PostgreSQL
 * cluster so URL/component split-brain cannot hide behind a parser-only test.
 */
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import {
  assertIsolatedTestTarget, assertQbankControlDefinerOwnership, assertQbankControlExecutorIdentity,
  createPool,
} from '../src/index.ts';
import { ingestQuestionBankArtifacts } from '../../../apps/worker/src/qbank-ingest.ts';

const pool = createPool();
const root = fileURLToPath(new URL('../../..', import.meta.url));
const suffix = String(process.pid);
const password = 'migration-cli-proof-password-2026';
const qbankControlUser = `cli_qbank_${suffix}`;
let failures = 0;
const check = (name: string, ok: boolean) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
  if (!ok) failures++;
};

async function runMigrationCli(): Promise<{ code: number; output: string }> {
  const host = process.env.PGHOST;
  const port = process.env.PGPORT;
  const database = process.env.PGDATABASE;
  const user = process.env.PGUSER;
  const migrationPassword = process.env.PGPASSWORD;
  if (!host || !port || !database || !user || migrationPassword === undefined)
    throw new Error('migration_cli_proof_target_missing');
  const target = new URL(`postgresql://${encodeURIComponent(user)}:${encodeURIComponent(migrationPassword)}@${host}:${port}/${encodeURIComponent(database)}`);
  const env: NodeJS.ProcessEnv = { ...process.env, DATABASE_URL: target.toString(), DATABASE_SSL_MODE: 'disable' };
  for (const name of ['PGHOST', 'PGPORT', 'PGUSER', 'PGPASSWORD', 'PGDATABASE'] as const) delete env[name];
  Object.assign(env, {
    APP_RUNTIME_DB_USER: `cli_runtime_${suffix}`,
    APP_RUNTIME_DB_PASSWORD: password,
    QBANK_CONTROL_DB_USER: qbankControlUser,
    QBANK_CONTROL_DB_PASSWORD: password,
    PRIVACY_WORKER_DB_USER: `cli_privacy_${suffix}`,
    PRIVACY_WORKER_DB_PASSWORD: password,
    RAG_CONTROL_DB_USER: `cli_ragcontrol_${suffix}`,
    RAG_CONTROL_DB_PASSWORD: password,
  });
  return new Promise((resolve, reject) => {
    let output = '';
    const child = spawn('pnpm', ['-C', 'packages/db', 'migrate'], { cwd: root, env, stdio: ['ignore', 'pipe', 'pipe'] });
    const append = (chunk: Buffer) => { if (output.length < 64 * 1024) output += chunk.toString('utf8'); };
    child.stdout.on('data', append);
    child.stderr.on('data', append);
    child.once('error', reject);
    child.once('exit', (code) => resolve({ code: code ?? 1, output }));
  });
}

async function main(): Promise<void> {
  await assertIsolatedTestTarget(pool);
  try {
    const first = await runMigrationCli();
    // A production deployment normally reruns the migration entrypoint after
    // the initial handoff.  The second invocation must verify the already
    // sealed manifest instead of attempting to take ownership from the
    // dedicated NOLOGIN definer with the ordinary migration login.
    const second = await runMigrationCli();
    const qbankControl = createPool({ user: qbankControlUser, password, max: 2 });
    let qbankManifestVerified = false;
    let qbankDefinerIngested = false;
    try {
      qbankManifestVerified = await assertQbankControlExecutorIdentity(qbankControl)
        .then(() => assertQbankControlDefinerOwnership(qbankControl))
        .then(() => true, () => false);
      const ingest = await ingestQuestionBankArtifacts(qbankControl, [{
        id: `question:migrate-cli-qbank-${suffix}`,
        competency: 'migration CLI QBank definer handoff',
        difficulty: 3,
        taxonomyVersion: 'v1',
        servingScopeId: 'backend/general',
        annotationSource: 'curator_reviewed',
        chunks: [
          { refId: `migrate-cli-qbank:${suffix}:prompt`, role: 'prompt', ordinal: 0, required: true, text: '低权控制登录必须在迁移后通过完整 definer manifest 写入题目。' },
          { refId: `migrate-cli-qbank:${suffix}:rubric`, role: 'rubric', ordinal: 0, required: true, text: '评分锚点：部署 handoff、RLS、helper 和 owner 必须一致。' },
          { refId: `migrate-cli-qbank:${suffix}:anti`, role: 'anti_pattern', ordinal: 0, text: '反例：迁移账户仍拥有 taxonomy guard。' },
        ],
      }], {
        id: 'migrate-cli-qbank-proof', dim: 512,
        async embed(texts: string[]) { return texts.map(() => new Array<number>(512).fill(0)); },
      });
      qbankDefinerIngested = ingest.questionCount === 1 && ingest.chunkCount === 3;
    } finally {
      await qbankControl.end();
    }
    const verifiedOutput = (result: { code: number; output: string }) => result.code === 0
      && /rag_control_manifest=verified/.test(result.output)
      && /qbank_control_manifest=verified/.test(result.output)
      && /runtime_login=provisioned/.test(result.output)
      && /qbank_control_login=provisioned/.test(result.output)
      && /privacy_worker_login=provisioned/.test(result.output);
    check('migration CLI accepts DATABASE_URL, provisions distinct low-privilege logins, verifies the RAG/QBank manifests, and repeats the sealed QBank handoff without taking foreign ownership',
      verifiedOutput(first)
      && verifiedOutput(second)
      && qbankManifestVerified
      && qbankDefinerIngested);
  } finally {
    await pool.end();
  }
  console.log(failures === 0
    ? '\n✓ migration CLI DATABASE_URL post-flight contract passed (local isolated evidence only)'
    : `\n✗ ${failures} migration CLI contract assertion(s) failed`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch(async () => {
  await pool.end().catch(() => undefined);
  console.error('migration_cli_proof_failed');
  process.exit(1);
});
