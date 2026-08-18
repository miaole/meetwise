#!/usr/bin/env node
import { createRequire } from 'node:module';
import { closeSync, fsyncSync, lstatSync, mkdirSync, openSync, readFileSync, readdirSync, realpathSync, renameSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { sha256 } from './catalog.mjs';

const STATE_ROOT = '/var/lib/meetwise-preview-synthetic';
const TARGET_FILE = '/etc/meetwise/preview-synthetic-target.json';

function factoryDigest() {
  const root = dirname(new URL(import.meta.url).pathname);
  return sha256(['catalog.mjs', 'db-verify.mjs', 'loader.mjs', 'target-inspect.mjs'].map((name) => [name, sha256(readFileSync(join(root, name)))]));
}

function rootJson(path) {
  const stat = lstatSync(path);
  if (!stat.isFile() || stat.isSymbolicLink() || stat.uid !== 0 || stat.gid !== 0 || (stat.mode & 0o777) !== 0o600) throw new Error(`unsafe_root_json:${path}`);
  return JSON.parse(readFileSync(path, 'utf8'));
}

function rootJsonOrNull(path) {
  try { return rootJson(path); }
  catch (error) { if (error?.code === 'ENOENT') return null; throw error; }
}

function durableWrite(path, value) {
  const temp = `${path}.tmp-${process.pid}`; writeFileSync(temp, `${JSON.stringify(value, null, 2)}\n`, { mode: 0o600 });
  let fd = openSync(temp, 'r'); fsyncSync(fd); closeSync(fd); renameSync(temp, path); fd = openSync(dirname(path), 'r'); fsyncSync(fd); closeSync(fd);
}

function releaseDigest(root) {
  const rows = [];
  const visit = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      if (entry.name === 'node_modules' || entry.name === '.next') continue;
      const path = join(dir, entry.name);
      if (entry.isSymbolicLink()) throw new Error(`release_symlink_rejected:${relative(root, path)}`);
      if (entry.isDirectory()) visit(path);
      else if (entry.isFile()) rows.push([relative(root, path), sha256(readFileSync(path))]);
    }
  };
  for (const scope of ['apps/api', 'packages/contracts', 'packages/db']) visit(join(root, scope));
  return sha256(rows);
}

function parseArgs() {
  const values = Object.fromEntries(process.argv.slice(2).reduce((rows, value, index, all) => index % 2 === 0 ? [...rows, [value, all[index + 1]]] : rows, []));
  const profile = values['--profile']; const datasetId = values['--dataset-id']; const phase = values['--phase'];
  if (!['showcase-v1', 'large-v1'].includes(profile) || !/^[a-z0-9][a-z0-9._-]{2,63}$/.test(datasetId ?? '') || !['pre', 'post'].includes(phase)) throw new Error('usage: db-verify.mjs --profile showcase-v1|large-v1 --dataset-id id --phase pre|post');
  return { profile, datasetId, phase };
}

export function allowedInterviewStates(phase, recovery) {
  return phase === 'pre' && recovery ? ['created', 'abandoned'] : ['abandoned'];
}

async function main() {
  if (process.getuid?.() !== 0) throw new Error('db_verify_requires_root');
  const { profile, datasetId, phase } = parseArgs();
  const target = rootJson(TARGET_FILE); const targetDigest = sha256(target); const approval = target.approvedProfiles?.[profile];
  if (!approval || approval.datasetId !== datasetId || target.database !== 'meetwise_preview') throw new Error('db_verify_target_not_approved');
  if (target.factoryDigest !== factoryDigest()) throw new Error('db_verify_factory_mismatch');
  const databaseUrl = new URL(process.env.DATABASE_URL);
  if (databaseUrl.hostname !== target.rdsEndpoint || Number(databaseUrl.port || 5432) !== target.rdsPort || process.env.PG_TLS_SERVERNAME !== target.tlsServername) throw new Error('db_verify_endpoint_mismatch');
  const datasetDir = join(STATE_ROOT, datasetId); mkdirSync(datasetDir, { recursive: true, mode: 0o700 });
  const dirStat = lstatSync(datasetDir); if (!dirStat.isDirectory() || dirStat.isSymbolicLink() || dirStat.uid !== 0 || dirStat.gid !== 0 || (dirStat.mode & 0o777) !== 0o700) throw new Error('unsafe_dataset_directory');
  const state = rootJsonOrNull(join(datasetDir, 'manifest.json'));
  if (phase === 'post' && !state) throw new Error('db_verify_manifest_missing');
  if (state && (state.datasetId !== datasetId || state.catalogDigest !== approval.catalogDigest || state.targetDigest !== targetDigest || !['loading', 'loaded_unverified', 'verifying', 'ready'].includes(state.status))) throw new Error('db_verify_manifest_mismatch');
  const require = createRequire('/srv/meetwise-full-stack/current/packages/db/package.json'); const pg = require('pg');
  const ssl = { ca: readFileSync(process.env.DATABASE_SSL_CA_PATH, 'utf8'), rejectUnauthorized: true, servername: process.env.PG_TLS_SERVERNAME };
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl, max: 1 }); const client = await pool.connect();
  const scalar = async (query) => Number((await client.query(query)).rows[0].n);
  try {
    await client.query('BEGIN READ ONLY ISOLATION LEVEL REPEATABLE READ');
    const identity = (await client.query('SELECT current_database() AS database, current_user AS role, inet_server_addr()::text AS server_addr, inet_server_port() AS server_port')).rows[0];
    if (identity.database !== target.database || identity.role !== target.expectedDbRole || Number(identity.server_port ?? target.rdsPort) !== target.rdsPort) throw new Error('db_verify_wrong_identity');
    const ledger = (await client.query('SELECT version, checksum FROM schema_migrations ORDER BY version')).rows;
    const schemaLedgerDigest = sha256(ledger); const schemaHead = ledger.at(-1)?.version;
    if (schemaLedgerDigest !== target.schemaLedgerDigest || `${schemaHead}.sql` !== target.schemaHead) throw new Error('db_verify_schema_mismatch');
    const releasePath = realpathSync('/srv/meetwise-full-stack/current');
    if (releasePath !== target.releasePath || releaseDigest(releasePath) !== target.releaseTreeDigest || sha256(readFileSync(join(releasePath, 'packages/contracts/src/openapi.ts'))) !== target.apiContractDigest) throw new Error('db_verify_release_mismatch');
    const counts = {
      accounts: await scalar('SELECT count(*) n FROM user_account'), jobs: await scalar('SELECT count(*) n FROM job_posting'), applications: await scalar('SELECT count(*) n FROM job_application'), resumes: await scalar('SELECT count(*) n FROM resume'), interviews: await scalar('SELECT count(*) n FROM interview'),
      recruiters: await scalar("SELECT count(*) n FROM user_account WHERE role='recruiter'"), candidates: await scalar("SELECT count(*) n FROM user_account WHERE role='candidate'"), declined: await scalar("SELECT count(*) n FROM job_application WHERE status='declined'"), invited: await scalar("SELECT count(*) n FROM job_application WHERE status='invited'"),
    };
    const keys = ['accounts', 'jobs', 'applications', 'resumes', 'interviews']; const recovery = phase === 'pre' && state !== null;
    const interviewStates = allowedInterviewStates(phase, recovery);
    const forbidden = {
      nonCatalogAccounts: await scalar("SELECT count(*) n FROM user_account WHERE email !~ '^preview\\.[bc]\\.[0-9]{3}@synthetic\\.meetwise\\.invalid$'"), numericScores: await scalar('SELECT count(*) n FROM job_application WHERE score IS NOT NULL'), invalidApplicationStates: await scalar("SELECT count(*) n FROM job_application WHERE status NOT IN ('invited','declined')"), invalidResumeStates: await scalar("SELECT count(*) n FROM resume WHERE status <> 'ingested'"), invalidInterviewStates: await scalar(`SELECT count(*) n FROM interview WHERE status NOT IN (${interviewStates.map((state) => `'${state}'`).join(',')})`), invalidJobStates: await scalar("SELECT count(*) n FROM job_posting WHERE status <> 'open'"), queuedOrRunningJobs: await scalar("SELECT count(*) n FROM interview_job WHERE status IN ('queued','running')"), rawAnswerJobs: await scalar("SELECT count(*) n FROM interview_job WHERE payload ? 'answer'"), modelInvocations: await scalar('SELECT count(*) n FROM ai_model_invocation'), paymentOrders: await scalar('SELECT count(*) n FROM payment_order'), consumptions: await scalar('SELECT count(*) n FROM entitlement_consumption'), answerEvents: await scalar("SELECT count(*) n FROM interview_event WHERE kind='answer_evaluated'"),
    };
    if (Object.values(forbidden).some((value) => value !== 0)) throw new Error(`db_verify_forbidden_side_effect:${JSON.stringify(forbidden)}`);
    const countMismatch = recovery
      ? keys.some((key) => counts[key] < approval.expectedBaseline[key] || counts[key] > approval.expectedCumulative[key])
      : keys.some((key) => counts[key] !== (phase === 'pre' ? approval.expectedBaseline[key] : approval.expectedCumulative[key]));
    if (countMismatch) throw new Error(`db_verify_count_mismatch:${JSON.stringify(counts)}`);
    const receipt = { schemaVersion: 1, phase, status: 'verified', recovery, datasetId, profile, targetDigest, catalogDigest: state?.catalogDigest ?? approval.catalogDigest, factoryDigest: target.factoryDigest, identity: { database: identity.database, role: identity.role, endpoint: databaseUrl.hostname, port: target.rdsPort, tlsServername: process.env.PG_TLS_SERVERNAME, serverAddr: identity.server_addr ?? null }, schemaHead, schemaLedgerDigest, releasePath, releaseTreeDigest: target.releaseTreeDigest, apiContractDigest: target.apiContractDigest, counts, forbidden, verifiedAt: new Date().toISOString() };
    receipt.receiptDigest = sha256(receipt); durableWrite(join(datasetDir, `${phase}-db-verification.json`), receipt); process.stdout.write(`${JSON.stringify(receipt, null, 2)}\n`);
    await client.query('COMMIT');
  } catch (error) { await client.query('ROLLBACK').catch(() => {}); throw error; } finally { client.release(); await pool.end(); }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main().catch((error) => { process.stderr.write(`${error instanceof Error ? error.message : 'db_verify_failed'}\n`); process.exitCode = 1; });
