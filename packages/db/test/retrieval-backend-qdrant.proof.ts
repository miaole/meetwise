/**
 * G2 sub-slice P14 — retrieval-store product backend selector → Qdrant (opt-in).
 *
 * Proves:
 *   1) default/unset → pgvector path (no Qdrant required)
 *   2) RETRIEVAL_VECTOR_BACKEND=qdrant + live Qdrant → upsert/annSearch EXIT=0
 *   3) backend=qdrant + bad QDRANT_URL → child EXIT=3 (fail-closed)
 *
 * HARD:
 *   - Does NOT flip default (pgvector remains default)
 *   - Does NOT close G2 / claim full RAG covered / retire fixtures / HA
 *   - Qdrant path = thin adapter subset only (honesty PREREQ remains for
 *     qbank generation / hybrid / HNSW plan / RLS / serving_scope)
 *   - retrieval-store.ts stays SQL-bound (selector is retrieval-backend.ts)
 *   - releaseEvidence=false · Not HA · 本绿 ≠ 已迁
 *
 * Harness: ai-docs/delivery/harness/retrieval-backend-qdrant.md
 * Root: pnpm retrieval-store:qdrant:prove
 *
 * EXIT=0 → honesty + default=pg + live qdrant OK + bad-URL child EXIT=3
 * EXIT=1 → honesty / assertion failure
 * EXIT=3 → live Qdrant PREREQ missing
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  RETRIEVAL_VECTOR_BACKEND_ENV,
  resolveRetrievalVectorBackend,
  createRetrievalVectorBackend,
} from '../src/retrieval-backend.ts';

const here = dirname(fileURLToPath(import.meta.url));
const pkgRoot = join(here, '..');
const repoRoot = join(pkgRoot, '..', '..');
const scriptLabel = 'pnpm retrieval-store:qdrant:prove';

const harnessPath = join(repoRoot, 'ai-docs/delivery/harness/retrieval-backend-qdrant.md');
const statusPath = join(repoRoot, 'ai-docs/delivery/harness/r5-retirement-sole-stack-status.md');
const retrievalPath = join(pkgRoot, 'src/retrieval-store.ts');
const backendPath = join(pkgRoot, 'src/retrieval-backend.ts');
const rootPkgPath = join(repoRoot, 'package.json');
const e2eIsolatedPath = join(repoRoot, 'scripts/run-e2e-isolated.mjs');
const vectorstoreProofPath = join(pkgRoot, 'test/vectorstore.proof.ts');

let exitCode = 0;
const lines: string[] = [];

function fail(msg: string) {
  lines.push(`FAIL  ${msg}`);
  if (exitCode === 0) exitCode = 1;
}
function pass(msg: string) {
  lines.push(`PASS  ${msg}`);
}
function note(msg: string) {
  lines.push(`NOTE  ${msg}`);
}
function prereq(msg: string) {
  lines.push(`PREREQ ${msg}`);
  if (exitCode === 0 || exitCode === 1) exitCode = 3;
}

const DIM = 512;
function embed(seed: number): number[] {
  let s = (seed * 2654435761) >>> 0;
  const v: number[] = [];
  for (let i = 0; i < DIM; i++) {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    v.push(s / 2 ** 32 - 0.5);
  }
  const nrm = Math.hypot(...v) || 1;
  return v.map((x) => x / nrm);
}

function finish() {
  for (const line of lines) console.log(line);
  console.log(`CMD=${scriptLabel} EXIT=${exitCode}`);
  process.exit(exitCode);
}

/** Child mode: force qdrant + bad URL and expect requireReadyz throw → process EXIT=3. */
async function runBadUrlChild(): Promise<void> {
  const badUrl = process.env.RETRIEVAL_BACKEND_BAD_URL_CHILD;
  if (badUrl !== '1') return;
  try {
    await createRetrievalVectorBackend({
      env: {
        ...process.env,
        [RETRIEVAL_VECTOR_BACKEND_ENV]: 'qdrant',
        QDRANT_URL: process.env.QDRANT_URL || 'http://127.0.0.1:1',
      },
      requireReadyz: true,
    });
    console.error('BAD_URL_CHILD unexpected success');
    process.exit(1);
  } catch (e) {
    console.error(`BAD_URL_CHILD expected fail: ${(e as Error).message}`);
    process.exit(3);
  }
}

async function main() {
  await runBadUrlChild();

  // --- static honesty ---
  if (!existsSync(backendPath)) {
    fail(`retrieval-backend.ts missing: ${backendPath}`);
  } else {
    const b = readFileSync(backendPath, 'utf8');
    if (/RETRIEVAL_VECTOR_BACKEND/.test(b) && /resolveRetrievalVectorBackend/.test(b)) {
      pass('retrieval-backend.ts exposes RETRIEVAL_VECTOR_BACKEND + resolveRetrievalVectorBackend');
    } else fail('retrieval-backend must expose env + resolveRetrievalVectorBackend');
    if (/default|DEFAULT|pgvector/.test(b) && /qdrant/.test(b)) {
      pass('retrieval-backend documents default=pgvector + qdrant opt-in');
    } else fail('retrieval-backend must document default pgvector + qdrant opt-in');
    if (/G2|releaseEvidence\s*=\s*false|Not HA/i.test(b)) {
      pass('retrieval-backend honesty pins (G2 / releaseEvidence=false / Not HA)');
    } else fail('retrieval-backend must pin honesty (G2 / releaseEvidence=false / Not HA)');
    if (/generation|hybrid|HNSW|RLS|serving_scope/i.test(b)) {
      pass('retrieval-backend documents remaining feature PREREQ (generation/hybrid/HNSW/RLS)');
    } else fail('retrieval-backend must document remaining SQL/HNSW/qbank feature PREREQ');
  }

  if (existsSync(retrievalPath)) {
    const t = readFileSync(retrievalPath, 'utf8');
    if (/export async function annSearch/.test(t) && /export async function upsertVectorChunk/.test(t)) {
      pass('retrieval-store.ts pgvector annSearch/upsert intact');
    } else fail('retrieval-store.ts must keep pgvector upsert/annSearch exports');
    if (!/@meetwise\/qdrant-store|createQdrant|QdrantVectorStore/.test(t)) {
      pass('retrieval-store.ts remains SQL-bound (no qdrant-store import; selector is separate factory)');
    } else fail('retrieval-store.ts must NOT import qdrant-store (keep factory separate; no silent cutover)');
    if (/retrieval-backend|RETRIEVAL_VECTOR_BACKEND/.test(t)) {
      pass('retrieval-store.ts points at backend selector (P14)');
    } else fail('retrieval-store.ts header must point at retrieval-backend selector');
  } else fail(`retrieval-store.ts missing: ${retrievalPath}`);

  if (existsSync(harnessPath)) {
    const h = readFileSync(harnessPath, 'utf8');
    if (/pnpm retrieval-store:qdrant:prove/.test(h)) pass('harness pins pnpm retrieval-store:qdrant:prove');
    else fail('harness must pin pnpm retrieval-store:qdrant:prove');
    if (/releaseEvidence\s*=\s*false/i.test(h)) pass('harness releaseEvidence=false');
    else fail('harness must pin releaseEvidence=false');
    if (/Not HA/i.test(h)) pass('harness Not HA');
    else fail('harness must pin Not HA');
    if (/EXIT\s*=\s*3|EXIT=3/.test(h) && /bad|坏|URL|readyz/i.test(h)) {
      pass('harness pins EXIT=3 for bad URL / missing Qdrant');
    } else fail('harness must pin EXIT=3 for bad URL / missing Qdrant');
    if (/G2/.test(h) && /(仍|GAP|open|未)/i.test(h)) pass('harness keeps G2 open');
    else fail('harness must keep G2 explicitly open');
    if (/default|默认/.test(h) && /pgvector/i.test(h)) pass('harness: default remains pgvector');
    else fail('harness must keep default=pgvector');
    if (/generation|hybrid|HNSW|RLS|serving_scope|qbank/i.test(h) && /PREREQ|仍|GAP|未/i.test(h)) {
      pass('harness documents remaining feature PREREQ honesty');
    } else fail('harness must document remaining feature PREREQ');
  } else {
    fail(`harness missing: ${harnessPath}`);
  }

  if (existsSync(statusPath)) {
    const st = readFileSync(statusPath, 'utf8');
    if (/P14|retrieval-store:qdrant:prove|retrieval-backend/i.test(st)) {
      pass('status Proven pins P14 retrieval-backend / retrieval-store:qdrant prove');
    } else fail('status must Proven-pin P14 retrieval-backend selector slice');
    if (/G2[\s\S]{0,280}(仍|GAP|未|not default|未成默认)/i.test(st) || /\| G2 \|/.test(st)) {
      pass('status: G2 still open');
    } else fail('status: G2 must remain explicitly open');
    if (/releaseEvidence\s*=\s*false/i.test(st) && /Not HA/i.test(st)) {
      pass('status releaseEvidence=false · Not HA');
    } else fail('status must pin releaseEvidence=false · Not HA');
  } else fail(`status missing: ${statusPath}`);

  if (existsSync(vectorstoreProofPath)) {
    const t = readFileSync(vectorstoreProofPath, 'utf8');
    if (/pgvector/.test(t)) pass('vectorstore.proof.ts still bound to pgvector (default path intact)');
    else fail('vectorstore.proof.ts must still evidence pgvector');
  } else fail(`vectorstore.proof.ts missing: ${vectorstoreProofPath}`);

  if (existsSync(e2eIsolatedPath)) {
    const t = readFileSync(e2eIsolatedPath, 'utf8');
    if (/process\.env\.E2E_ISOLATION_STACK\s*=\s*LEGACY_STACK/.test(t)
      || /E2E_ISOLATION_STACK.*=.*pgvector-legacy/.test(t)) {
      pass('E2E_ISOLATION_STACK default path still pgvector-legacy (G1 open; not flipped)');
    } else fail('must not flip E2E_ISOLATION_STACK default off pgvector-legacy');
  } else fail(`run-e2e-isolated.mjs missing: ${e2eIsolatedPath}`);

  if (existsSync(rootPkgPath)) {
    const pkg = JSON.parse(readFileSync(rootPkgPath, 'utf8')) as { scripts?: Record<string, string> };
    const scripts = pkg.scripts || {};
    if (scripts['retrieval-store:qdrant:prove']
      && /packages\/db|prove:retrieval-backend-qdrant/.test(scripts['retrieval-store:qdrant:prove'])) {
      pass('root package.json wires retrieval-store:qdrant:prove → db prove (opt-in)');
    } else fail('root package.json must wire retrieval-store:qdrant:prove to packages/db');
    for (const name of ['vectorstore:prove', 'memory:prove', 'rag03-route:prove'] as const) {
      if (scripts[name] && /run-e2e-isolated/.test(scripts[name])) {
        pass(`package.json: ${name} still pgvector-isolated (G2 GAP)`);
      } else if (scripts[name]) {
        fail(`package.json: ${name} must remain run-e2e-isolated (honest G2 GAP)`);
      } else {
        note(`package.json: ${name} not present (non-fatal)`);
      }
    }
  } else fail(`root package.json missing: ${rootPkgPath}`);

  // --- resolve: default / unset / explicit pgvector ---
  try {
    const unsetEnv = { ...process.env };
    delete unsetEnv[RETRIEVAL_VECTOR_BACKEND_ENV];
    const a = resolveRetrievalVectorBackend({ env: unsetEnv });
    const b = resolveRetrievalVectorBackend({ env: { [RETRIEVAL_VECTOR_BACKEND_ENV]: '' } });
    const c = resolveRetrievalVectorBackend({ env: { [RETRIEVAL_VECTOR_BACKEND_ENV]: 'pgvector' } });
    const d = resolveRetrievalVectorBackend({ env: { [RETRIEVAL_VECTOR_BACKEND_ENV]: 'pg' } });
    if (a === 'pgvector' && b === 'pgvector' && c === 'pgvector' && d === 'pgvector') {
      pass('resolve: unset/empty/pgvector/pg → pgvector (default intact)');
    } else fail(`resolve default failed: unset=${a} empty=${b} pgvector=${c} pg=${d}`);
  } catch (e) {
    fail(`resolve default threw: ${(e as Error).message}`);
  }

  try {
    const q = resolveRetrievalVectorBackend({ env: { [RETRIEVAL_VECTOR_BACKEND_ENV]: 'qdrant' } });
    if (q === 'qdrant') pass('resolve: RETRIEVAL_VECTOR_BACKEND=qdrant → qdrant');
    else fail(`resolve qdrant failed: ${q}`);
  } catch (e) {
    fail(`resolve qdrant threw: ${(e as Error).message}`);
  }

  try {
    resolveRetrievalVectorBackend({ env: { [RETRIEVAL_VECTOR_BACKEND_ENV]: 'bogus' } });
    fail('resolve bogus must throw');
  } catch {
    pass('resolve: unknown backend fail-closed (throw)');
  }

  // create pg path (no network)
  try {
    const unsetEnv = { ...process.env };
    delete unsetEnv[RETRIEVAL_VECTOR_BACKEND_ENV];
    const pg = await createRetrievalVectorBackend({ env: unsetEnv });
    if (pg.backend === 'pgvector' && pg.mode === 'client-bound') {
      pass('createRetrievalVectorBackend default → pgvector client-bound (no Qdrant)');
    } else fail(`default create unexpected: ${JSON.stringify(pg)}`);
  } catch (e) {
    fail(`create default threw: ${(e as Error).message}`);
  }

  if (exitCode !== 0 && exitCode !== 3) {
    note('static honesty failed — skip live Qdrant / bad-URL child');
    note('releaseEvidence=false; Not HA; G2 still GAP; ≠ full RAG covered; ≠ default switched');
    finish();
    return;
  }

  // --- bad URL child must EXIT=3 ---
  {
    const tsxBin = join(pkgRoot, 'node_modules', '.bin', 'tsx');
    const tsxAlt = join(repoRoot, 'node_modules', '.bin', 'tsx');
    const runner = existsSync(tsxBin) ? tsxBin : existsSync(tsxAlt) ? tsxAlt : 'tsx';
    const child = spawnSync(
      runner,
      [join(here, 'retrieval-backend-qdrant.proof.ts')],
      {
        env: {
          ...process.env,
          RETRIEVAL_BACKEND_BAD_URL_CHILD: '1',
          [RETRIEVAL_VECTOR_BACKEND_ENV]: 'qdrant',
          QDRANT_URL: 'http://127.0.0.1:1',
        },
        encoding: 'utf8',
        cwd: repoRoot,
      },
    );
    const code = child.status ?? 1;
    if (code === 3) {
      pass('bad URL child: RETRIEVAL_VECTOR_BACKEND=qdrant + QDRANT_URL=http://127.0.0.1:1 → EXIT=3');
    } else {
      fail(`bad URL child expected EXIT=3, got ${code}; stderr=${(child.stderr || '').slice(0, 400)}`);
    }
  }

  // --- live Qdrant via selector ---
  const collection = `meetwise_g2_retrieval_backend_${process.pid}`;
  let qdrant;
  try {
    qdrant = await createRetrievalVectorBackend({
      env: { ...process.env, [RETRIEVAL_VECTOR_BACKEND_ENV]: 'qdrant' },
      collection,
      requireReadyz: true,
    });
  } catch (e) {
    prereq(`qdrant create/readyz failed: ${(e as Error).message}`);
    prereq('docker compose -f docker/compose.mysql-local.yml up -d qdrant');
    prereq('wait until curl -sf http://127.0.0.1:6333/readyz succeeds');
    note('refuse silent fake-green: retrieval-backend Qdrant path not covered without /readyz');
    note('STILL-GAP G2: vectorstore/rag*/memory* defaults remain pgvector-isolated');
    note('releaseEvidence=false; Not HA; ≠ fixtures retired; ≠ full RAG covered; ≠ default switched');
    finish();
    return;
  }

  if (qdrant.backend !== 'qdrant') {
    fail(`expected qdrant backend, got ${qdrant.backend}`);
    finish();
    return;
  }
  pass(`createRetrievalVectorBackend(qdrant) readyz OK @ ${qdrant.url}`);

  try {
    const ensured = await qdrant.ensureCollection();
    pass(`ensureCollection collection=${ensured.collection} created=${ensured.created}`);
  } catch (e) {
    fail(`ensureCollection failed: ${(e as Error).message}`);
    finish();
    return;
  }

  // One honest code path: memory upsert + ANN self-recall (adapter subset)
  const OWNER = 'userA';
  const vec = embed(42);
  try {
    const up = await qdrant.upsertVectorChunk(OWNER, {
      id: 'm-sel-1',
      kind: 'memory',
      refId: 'mem-sel-1',
      contentHash: 'h-sel-1',
      embedding: vec,
    });
    if (up.pointId) pass(`upsert memory via selector→adapter pointId=${up.pointId}`);
    else fail('upsert missing pointId');
  } catch (e) {
    fail(`upsert failed: ${(e as Error).message}`);
    finish();
    return;
  }

  try {
    const hits = await qdrant.annSearch(OWNER, 'memory', vec, 5);
    const top = hits[0];
    if (top?.refId === 'mem-sel-1' && (top.distance ?? Infinity) < 1e-3) {
      pass(`ANN self-recall via selector: top-1=mem-sel-1 distance≈0 (${top.distance})`);
    } else {
      fail(`ANN self-recall failed: ${JSON.stringify(hits.slice(0, 3))}`);
    }
  } catch (e) {
    fail(`annSearch failed: ${(e as Error).message}`);
  }

  // Tenant: other owner must not see memory
  try {
    const leaked = await qdrant.annSearch('userB', 'memory', vec, 5);
    if (!leaked.some((h) => h.refId === 'mem-sel-1')) {
      pass('memory private via selector: userB does not see userA chunk');
    } else fail(`memory leaked to userB: ${JSON.stringify(leaked)}`);
  } catch (e) {
    fail(`tenant check failed: ${(e as Error).message}`);
  }

  note('COVERED (this prove): RETRIEVAL_VECTOR_BACKEND selector + qdrant adapter memory path live when EXIT=0');
  note('COVERED: default/unset → pgvector; bad URL child → EXIT=3');
  note('STILL-GAP G2: vectorstore:prove / rag* / memory* defaults remain pgvector-isolated');
  note('STILL-PREREQ: qbank generation / hybrid / HNSW plan / RLS / serving_scope not on Qdrant path');
  note('STILL-GAP G1: E2E_ISOLATION_STACK default still pgvector-legacy (not flipped)');
  note('releaseEvidence=false; Not HA; 本绿≠已迁; ≠ cutover; ≠ fixtures retired; ≠ full RAG covered');
  finish();
}

main().catch((e) => {
  fail(`unhandled: ${(e as Error).message}`);
  finish();
});
