/**
 * G2 sub-slice — Qdrant-backed vectorstore adapter prove (real path).
 *
 * Live upsert/annSearch against compose.mysql-local Qdrant :6333 when available.
 * Fail-closed EXIT=3 when /readyz missing (never fake-green).
 *
 * HARD:
 *   - Does NOT flip E2E_ISOLATION_STACK default off pgvector-legacy
 *   - Does NOT retire fixtures / cut annSearch / claim RAG/memory covered
 *   - Does NOT close G2 (defaults still pgvector-isolated)
 *   - releaseEvidence=false · Not HA · 本绿 ≠ 已迁
 *
 * Harness: ai-docs/delivery/harness/qdrant-vectorstore-adapter.md
 * Root: pnpm qdrant-store:vectorstore-adapter:prove
 *
 * EXIT=0 → honesty pins + live adapter upsert/search OK
 * EXIT=1 → honesty / assertion failure
 * EXIT=3 → Qdrant PREREQ missing
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  QDRANT_VECTOR_SIZE,
  createQdrantVectorStoreAdapter,
  pointIdForChunk,
} from '../src/index.ts';

const here = dirname(fileURLToPath(import.meta.url));
const pkgRoot = join(here, '..');
const repoRoot = join(pkgRoot, '..', '..');
const scriptLabel = 'pnpm qdrant-store:vectorstore-adapter:prove';

const harnessPath = join(repoRoot, 'ai-docs/delivery/harness/qdrant-vectorstore-adapter.md');
const statusPath = join(repoRoot, 'ai-docs/delivery/harness/r5-retirement-sole-stack-status.md');
const deepenHarness = join(repoRoot, 'ai-docs/delivery/harness/qdrant-backed-prove-deepen.md');
const retrievalPath = join(repoRoot, 'packages/db/src/retrieval-store.ts');
const vectorstoreProofPath = join(repoRoot, 'packages/db/test/vectorstore.proof.ts');
const e2eIsolatedPath = join(repoRoot, 'scripts/run-e2e-isolated.mjs');
const rootPkgPath = join(repoRoot, 'package.json');
const adapterSrcPath = join(pkgRoot, 'src/vectorstore-adapter.ts');

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

const DIM = QDRANT_VECTOR_SIZE;
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

async function main() {
  // --- static honesty ---
  if (!existsSync(adapterSrcPath)) fail(`adapter missing: ${adapterSrcPath}`);
  else pass('vectorstore-adapter.ts present');

  if (existsSync(harnessPath)) {
    const h = readFileSync(harnessPath, 'utf8');
    if (/pnpm qdrant-store:vectorstore-adapter:prove/.test(h)) {
      pass('harness pins pnpm qdrant-store:vectorstore-adapter:prove');
    } else fail('harness must pin pnpm qdrant-store:vectorstore-adapter:prove');
    if (/releaseEvidence\s*=\s*false/i.test(h)) pass('harness releaseEvidence=false');
    else fail('harness must pin releaseEvidence=false');
    if (/Not HA/i.test(h)) pass('harness Not HA');
    else fail('harness must pin Not HA');
    if (/EXIT\s*=\s*3|EXIT=3/.test(h)) pass('harness pins EXIT=3 PREREQ');
    else fail('harness must pin EXIT=3 when Qdrant missing');
    if (/G2/.test(h) && /(仍|GAP|open|未)/i.test(h)) pass('harness keeps G2 open');
    else fail('harness must keep G2 explicitly open');
    if (/不得|禁止|≠/.test(h) && /RAG|memory|default|切/.test(h)) {
      pass('harness forbids overclaim (RAG/memory/default/cutover)');
    } else fail('harness must forbid overclaim');
  } else {
    fail(`harness missing: ${harnessPath}`);
  }

  if (existsSync(statusPath)) {
    const st = readFileSync(statusPath, 'utf8');
    if (/P1[01]|vectorstore-adapter|Qdrant.*adapter|adapter.*real/.test(st)) {
      pass('status Proven pins vectorstore-adapter slice (P10/P11)');
    } else fail('status must Proven-pin vectorstore-adapter real-path slice');
    if (/G2[\s\S]{0,220}(仍|GAP|未|not default|未成默认)/i.test(st) || /\| G2 \|[\s\S]*?未/.test(st)) {
      pass('status: G2 still open');
    } else fail('status: G2 must remain explicitly open');
    if (/releaseEvidence\s*=\s*false/i.test(st) && /Not HA/i.test(st)) {
      pass('status releaseEvidence=false · Not HA');
    } else fail('status must pin releaseEvidence=false · Not HA');
  } else fail(`status missing: ${statusPath}`);

  if (existsSync(retrievalPath)) {
    const t = readFileSync(retrievalPath, 'utf8');
    if (/export async function annSearch/.test(t)) pass('retrieval-store.ts annSearch intact (不切向量真相)');
    else fail('retrieval-store.ts must keep export async function annSearch');
  } else fail(`retrieval-store.ts missing: ${retrievalPath}`);

  if (existsSync(vectorstoreProofPath)) {
    const t = readFileSync(vectorstoreProofPath, 'utf8');
    if (/pgvector/.test(t)) pass('vectorstore.proof.ts still bound to pgvector');
    else fail('vectorstore.proof.ts must still evidence pgvector');
  } else fail(`vectorstore.proof.ts missing: ${vectorstoreProofPath}`);

  if (existsSync(e2eIsolatedPath)) {
    const t = readFileSync(e2eIsolatedPath, 'utf8');
    if (/pgvector-legacy/.test(t) && /mysql-qdrant-redis/.test(t)) {
      pass('run-e2e-isolated.mjs dual-track names present');
    } else fail('run-e2e-isolated.mjs must keep dual-track names');
    // Default must remain legacy: env unset → write pgvector-legacy
    if (/process\.env\.E2E_ISOLATION_STACK\s*=\s*LEGACY_STACK/.test(t)
      || /E2E_ISOLATION_STACK.*=.*pgvector-legacy/.test(t)) {
      pass('E2E_ISOLATION_STACK default path still pgvector-legacy (G1 open; not flipped)');
    } else fail('must not flip E2E_ISOLATION_STACK default off pgvector-legacy');
    if (/E2E_PG_IMAGE/.test(t) && /pgvector\/pgvector/.test(t)) {
      pass('E2E_PG_IMAGE / pgvector intact (fixtures not retired)');
    } else fail('E2E_PG_IMAGE / pgvector must remain intact');
  } else fail(`run-e2e-isolated.mjs missing: ${e2eIsolatedPath}`);

  if (existsSync(rootPkgPath)) {
    const pkg = JSON.parse(readFileSync(rootPkgPath, 'utf8')) as { scripts?: Record<string, string> };
    const scripts = pkg.scripts || {};
    if (scripts['qdrant-store:vectorstore-adapter:prove']
      && /packages\/qdrant-store|prove:vectorstore-adapter/.test(scripts['qdrant-store:vectorstore-adapter:prove'])) {
      pass('root package.json wires qdrant-store:vectorstore-adapter:prove');
    } else fail('root package.json must wire qdrant-store:vectorstore-adapter:prove');
    // Must NOT silently re-route default product proves; allow explicit *(vectorstore|rag|memory):qdrant* opt-in (P12/P13)
    for (const name of ['vectorstore:prove', 'memory:prove', 'rag03-route:prove'] as const) {
      if (scripts[name] && /run-e2e-isolated/.test(scripts[name])) {
        pass(`package.json: ${name} still pgvector-isolated (G2 GAP)`);
      } else fail(`package.json: ${name} must remain run-e2e-isolated (honest G2 GAP)`);
    }
    for (const [k, v] of Object.entries(scripts)) {
      if (!/^(vectorstore|memory|rag)/.test(k)) continue;
      if (!/qdrant-store|packages\/qdrant-store/.test(v)) continue;
      if (/^(vectorstore|rag|memory):qdrant(:|$)/.test(k)) {
        pass(`package.json: ${k} allowed as explicit opt-in Qdrant prove (P12/P13)`);
        continue;
      }
      fail(`package.json: ${k} must NOT route to qdrant-store (would fake G2 close)`);
    }
    pass('package.json: only *(vectorstore|rag|memory):qdrant* may route to qdrant-store among vector/rag/memory');
  } else fail(`root package.json missing: ${rootPkgPath}`);

  if (existsSync(deepenHarness)) {
    const d = readFileSync(deepenHarness, 'utf8');
    if (/vectorstore-adapter/.test(d)) pass('deepen harness inventories vectorstore-adapter');
    else fail('deepen harness must inventory vectorstore-adapter as qdrant-native additive');
  } else {
    note('deepen harness missing (non-fatal for adapter prove if status/harness ok)');
  }

  // Deterministic point id sanity (no live needed)
  const a = pointIdForChunk('userA', 'memory', 'h7');
  const b = pointIdForChunk('userA', 'memory', 'h7');
  const c = pointIdForChunk('userB', 'memory', 'h7');
  if (a === b && /^[0-9a-f-]{36}$/i.test(a) && a !== c) {
    pass(`pointIdForChunk deterministic+tenant-scoped (${a})`);
  } else fail('pointIdForChunk must be deterministic UUID and owner-scoped');

  if (exitCode !== 0 && exitCode !== 3) {
    note('static honesty failed — skip live Qdrant');
    note('releaseEvidence=false; Not HA; G2 still GAP; ≠ RAG/memory covered; ≠ default switched');
    finish();
    return;
  }

  // --- live Qdrant (fail-closed) ---
  const collection = `meetwise_g2_vs_adapter_${process.pid}`;
  const adapter = createQdrantVectorStoreAdapter({ collection });

  try {
    await adapter.requireReadyz();
    pass(`qdrant readyz OK @ ${adapter.url}`);
  } catch (e) {
    prereq(`qdrant readyz failed: ${(e as Error).message}`);
    prereq('docker compose -f docker/compose.mysql-local.yml up -d qdrant');
    prereq('wait until curl -sf http://127.0.0.1:6333/readyz succeeds');
    note('refuse silent fake-green: adapter real-path not covered without /readyz');
    note('COVERED when EXIT=0 only: adapter upsert+annSearch against live Qdrant');
    note('STILL-GAP G2: vectorstore/rag*/memory* defaults remain pgvector-isolated');
    note('releaseEvidence=false; Not HA; ≠ fixtures retired; ≠ RAG/memory covered; ≠ default switched');
    finish();
    return;
  }

  try {
    const ensured = await adapter.ensureCollection();
    pass(`ensureCollection collection=${ensured.collection} created=${ensured.created}`);
  } catch (e) {
    fail(`ensureCollection failed: ${(e as Error).message}`);
    finish();
    return;
  }

  const QOWNER = '__system_qbank__';
  const OWNER = 'userA';
  const N = 12;
  const vecs = Array.from({ length: N }, (_, i) => embed(i + 1));

  try {
    for (let i = 0; i < N; i++) {
      await adapter.upsertVectorChunk(QOWNER, {
        id: `vc${i}`,
        kind: 'qbank',
        refId: `q${i}`,
        contentHash: `h${i}`,
        embedding: vecs[i]!,
      });
    }
    pass(`upsert ${N} qbank chunks via adapter`);
  } catch (e) {
    fail(`upsert qbank failed: ${(e as Error).message}`);
    finish();
    return;
  }

  // Idempotent overwrite same contentHash
  try {
    const first = pointIdForChunk(QOWNER, 'qbank', 'h0');
    const again = await adapter.upsertVectorChunk(QOWNER, {
      id: 'vcX',
      kind: 'qbank',
      refId: 'q0',
      contentHash: 'h0',
      embedding: vecs[0]!,
    });
    if (again.pointId === first) pass('idempotent upsert: same owner+kind+hash → same pointId');
    else fail(`idempotent upsert expected pointId=${first}, got ${again.pointId}`);
  } catch (e) {
    fail(`idempotent upsert failed: ${(e as Error).message}`);
  }

  try {
    const self = await adapter.annSearch(OWNER, 'qbank', vecs[7]!, 5);
    const top = self[0];
    if (top?.refId === 'q7' && (top.distance ?? Infinity) < 1e-3) {
      pass(`annSearch self-recall top-1=q7 distance≈0 (${top.distance})`);
    } else {
      fail(`annSearch self-recall failed: ${JSON.stringify(self.slice(0, 3))}`);
    }
  } catch (e) {
    fail(`annSearch qbank failed: ${(e as Error).message}`);
    finish();
    return;
  }

  // qbank shared: userB also sees
  try {
    const bSees = await adapter.annSearch('userB', 'qbank', vecs[7]!, 5);
    if (bSees.some((h) => h.refId === 'q7')) pass('qbank shared: userB recalls q7');
    else fail(`qbank shared failed for userB: ${JSON.stringify(bSees.slice(0, 3))}`);
  } catch (e) {
    fail(`qbank shared search failed: ${(e as Error).message}`);
  }

  // memory private
  try {
    await adapter.upsertVectorChunk(OWNER, {
      id: 'mA',
      kind: 'memory',
      refId: 'mem-a',
      contentHash: 'hm',
      embedding: vecs[7]!,
    });
    const aSees = await adapter.annSearch(OWNER, 'memory', vecs[7]!, 5);
    const bSees = await adapter.annSearch('userB', 'memory', vecs[7]!, 5);
    if (aSees.some((h) => h.refId === 'mem-a')) pass('memory private: owner recalls mem-a');
    else fail(`memory owner recall failed: ${JSON.stringify(aSees)}`);
    if (!bSees.some((h) => h.refId === 'mem-a')) pass('memory private: userB does not recall mem-a');
    else fail(`memory leaked to userB: ${JSON.stringify(bSees)}`);
  } catch (e) {
    fail(`memory private checks failed: ${(e as Error).message}`);
  }

  note('COVERED (this prove): QdrantVectorStoreAdapter upsert+annSearch against live Qdrant when EXIT=0');
  note('STILL-GAP G2: vectorstore:prove / rag* / memory* defaults remain pgvector-isolated — NOT claimed covered on Qdrant');
  note('STILL-GAP G1: E2E_ISOLATION_STACK default still pgvector-legacy (not flipped)');
  note('releaseEvidence=false; Not HA; 本绿≠已迁; ≠ cutover; ≠ fixtures retired; ≠ RAG/memory covered');
  finish();
}

main().catch((e) => {
  fail(`unhandled: ${(e as Error).message}`);
  finish();
});
