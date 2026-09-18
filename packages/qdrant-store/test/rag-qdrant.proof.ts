/**
 * G2 sub-slice P13 — opt-in minimal RAG *retrieval* slice via Qdrant bridge.
 *
 * Exercises a thin qbank ANN retrieval path against live Qdrant through
 * ProductVectorStoreQdrantBridge → QdrantVectorStoreAdapter.
 *
 * HARD:
 *   - Opt-in ONLY (`pnpm rag:qdrant:prove`) — does NOT flip default rag*
 *     (still run-e2e-isolated → pgvector)
 *   - Does NOT claim rag03–rag07 / hybrid / route / R4 / generation covered
 *   - Product rag* cannot select Qdrant without large rewrite (PREREQ below)
 *   - Fail-closed EXIT=3 when Qdrant /readyz missing (never fake-green)
 *   - releaseEvidence=false · Not HA · 本绿 ≠ 已迁 · G2 still open
 *
 * PREREQ (product rag* — honesty · no fake-green):
 *   packages/db hybridQbankSearch / rag04 track-local / generation annSearch /
 *   serving_scope SQL hard-filter / route snapshot / to_tsvector hybrid remain
 *   bound to pg PoolClient + RLS. This prove is the **minimal retrieval slice**
 *   only (qbank upsert + ANN via bridge). It is NOT a product rag* backend
 *   selector and does NOT close G2.
 *
 * Harness: ai-docs/delivery/harness/qdrant-rag-prove.md
 * Root: pnpm rag:qdrant:prove
 *
 * EXIT=0 → honesty pins + live minimal qbank retrieval OK
 * EXIT=1 → honesty / assertion failure
 * EXIT=3 → Qdrant PREREQ missing
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  QDRANT_VECTOR_SIZE,
  createProductVectorStoreQdrantBridge,
  pointIdForChunk,
} from '../src/index.ts';

const here = dirname(fileURLToPath(import.meta.url));
const pkgRoot = join(here, '..');
const repoRoot = join(pkgRoot, '..', '..');
const scriptLabel = 'pnpm rag:qdrant:prove';

const harnessPath = join(repoRoot, 'ai-docs/delivery/harness/qdrant-rag-prove.md');
const memoryHarness = join(repoRoot, 'ai-docs/delivery/harness/qdrant-memory-prove.md');
const vsHarness = join(repoRoot, 'ai-docs/delivery/harness/qdrant-vectorstore-prove.md');
const statusPath = join(repoRoot, 'ai-docs/delivery/harness/r5-retirement-sole-stack-status.md');
const deepenHarness = join(repoRoot, 'ai-docs/delivery/harness/qdrant-backed-prove-deepen.md');
const retrievalPath = join(repoRoot, 'packages/db/src/retrieval-store.ts');
const rag04Path = join(repoRoot, 'packages/db/test/rag04-track-local-retrieval.proof.ts');
const bridgeSrcPath = join(pkgRoot, 'src/product-vectorstore-bridge.ts');
const e2eIsolatedPath = join(repoRoot, 'scripts/run-e2e-isolated.mjs');
const rootPkgPath = join(repoRoot, 'package.json');

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
const cosine = (a: number[], b: number[]) => {
  let d = 0;
  for (let i = 0; i < a.length; i++) d += a[i]! * b[i]!;
  return d;
};

function finish() {
  for (const line of lines) console.log(line);
  console.log(`CMD=${scriptLabel} EXIT=${exitCode}`);
  process.exit(exitCode);
}

function isExplicitQdrantOptIn(k: string): boolean {
  return /^(vectorstore|rag|memory):qdrant(:|$)/.test(k);
}

async function main() {
  // --- static honesty ---
  if (!existsSync(bridgeSrcPath)) fail(`bridge missing: ${bridgeSrcPath}`);
  else {
    const b = readFileSync(bridgeSrcPath, 'utf8');
    if (/PREREQ/i.test(b) && /retrieval-store/.test(b) && /large rewrite|大.*改/.test(b)) {
      pass('bridge documents PREREQ: retrieval-store cannot select Qdrant without large rewrite');
    } else fail('bridge must document PREREQ (retrieval-store · large rewrite)');
  }

  if (existsSync(harnessPath)) {
    const h = readFileSync(harnessPath, 'utf8');
    if (/pnpm rag:qdrant:prove/.test(h)) pass('harness pins pnpm rag:qdrant:prove');
    else fail('harness must pin pnpm rag:qdrant:prove');
    if (/releaseEvidence\s*=\s*false/i.test(h)) pass('harness releaseEvidence=false');
    else fail('harness must pin releaseEvidence=false');
    if (/Not HA/i.test(h)) pass('harness Not HA');
    else fail('harness must pin Not HA');
    if (/EXIT\s*=\s*3|EXIT=3/.test(h)) pass('harness pins EXIT=3 PREREQ');
    else fail('harness must pin EXIT=3 when Qdrant missing');
    if (/G2/.test(h) && /(仍|GAP|open|未)/i.test(h)) pass('harness keeps G2 open');
    else fail('harness must keep G2 explicitly open');
    if (/PREREQ/i.test(h) && /(hybrid|rag04|generation|serving_scope|route|大.*改|large rewrite)/i.test(h)) {
      pass('harness documents product rag* PREREQ blockers');
    } else fail('harness must document product rag* PREREQ blockers');
    if (/opt-in|显式|不得.*默认|≠.*默认/i.test(h) && /rag03|rag\*|rag04/i.test(h)) {
      pass('harness: default rag* remains pgvector (opt-in only)');
    } else fail('harness must keep default rag* intact / opt-in only');
    if (/不得|禁止|≠/.test(h) && /(hybrid|R4|covered|cutover|默认)/i.test(h)) {
      pass('harness forbids overclaim (hybrid/R4/covered/default/cutover)');
    } else fail('harness must forbid overclaim');
  } else {
    fail(`harness missing: ${harnessPath}`);
  }

  if (existsSync(statusPath)) {
    const st = readFileSync(statusPath, 'utf8');
    if (/P13|rag:qdrant:prove|memory:qdrant:prove/i.test(st)) {
      pass('status Proven pins P13 rag/memory:qdrant prove slice');
    } else fail('status must Proven-pin P13 rag/memory:qdrant prove slice');
    if (/G2[\s\S]{0,280}(仍|GAP|未|not default|未成默认)/i.test(st) || /\| G2 \|[\s\S]*?未/.test(st)) {
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
    if (!/@meetwise\/qdrant-store|createQdrant|QdrantVectorStore/.test(t)) {
      pass('retrieval-store.ts not wired to qdrant-store (PREREQ still holds)');
    } else fail('retrieval-store must NOT import qdrant-store this slice (would imply cutover)');
  } else fail(`retrieval-store.ts missing: ${retrievalPath}`);

  if (existsSync(rag04Path)) {
    const t = readFileSync(rag04Path, 'utf8');
    if (/hybridQbankSearch|serving_scope|run-e2e-isolated|createPool/.test(t)) {
      pass('rag04 still pgvector-isolated product path (blocker intact — honesty)');
    } else fail('rag04 must still evidence pgvector product path');
  } else fail(`rag04 proof missing: ${rag04Path}`);

  if (existsSync(e2eIsolatedPath)) {
    const t = readFileSync(e2eIsolatedPath, 'utf8');
    if (/process\.env\.E2E_ISOLATION_STACK\s*=\s*LEGACY_STACK/.test(t)
      || /E2E_ISOLATION_STACK.*=.*pgvector-legacy/.test(t)) {
      pass('E2E_ISOLATION_STACK default path still pgvector-legacy (G1 open; not flipped)');
    } else fail('must not flip E2E_ISOLATION_STACK default off pgvector-legacy');
    if (/E2E_PG_IMAGE/.test(t) && /pgvector\/pgvector/.test(t)) {
      pass('E2E_PG_IMAGE / pgvector intact (fixtures not retired)');
    } else fail('E2E_PG_IMAGE / pgvector must remain intact');
    // P13 standalone only — must NOT inflate SOLE_WIRING_ALLOWLIST (mw-e2e-ha B5)
    {
      const m = t.match(/SOLE_WIRING_ALLOWLIST\s*=\s*new Set\(([\s\S]*?)\)/);
      if (!m) fail('SOLE_WIRING_ALLOWLIST Set not parseable');
      else if (/sole-stack:rag-qdrant:prove|sole-stack:memory-qdrant:prove/.test(m[1])) {
        fail('SOLE_WIRING_ALLOWLIST must NOT include sole-stack:rag/memory-qdrant (P13 standalone only)');
      } else {
        pass('SOLE_WIRING_ALLOWLIST excludes rag/memory-qdrant (P13 standalone package scripts only)');
      }
    }
  } else fail(`run-e2e-isolated.mjs missing: ${e2eIsolatedPath}`);

  if (existsSync(rootPkgPath)) {
    const pkg = JSON.parse(readFileSync(rootPkgPath, 'utf8')) as { scripts?: Record<string, string> };
    const scripts = pkg.scripts || {};
    if (scripts['rag:qdrant:prove']
      && /packages\/qdrant-store|prove:rag-qdrant/.test(scripts['rag:qdrant:prove'])) {
      pass('root package.json wires rag:qdrant:prove → qdrant-store (opt-in)');
    } else fail('root package.json must wire rag:qdrant:prove to qdrant-store');
    for (const name of ['vectorstore:prove', 'memory:prove', 'rag03-route:prove', 'rag04-track-local:prove'] as const) {
      if (scripts[name] && /run-e2e-isolated/.test(scripts[name])) {
        pass(`package.json: ${name} still pgvector-isolated (G2 GAP)`);
      } else fail(`package.json: ${name} must remain run-e2e-isolated (honest G2 GAP)`);
    }
    for (const [k, v] of Object.entries(scripts)) {
      if (!/^(vectorstore|memory|rag)/.test(k)) continue;
      if (!/qdrant-store|packages\/qdrant-store/.test(v)) continue;
      if (isExplicitQdrantOptIn(k)) {
        pass(`package.json: ${k} allowed as explicit opt-in Qdrant prove (P12/P13)`);
        continue;
      }
      fail(`package.json: ${k} must NOT route to qdrant-store (would fake G2 close)`);
    }
    pass('package.json: only *(vectorstore|rag|memory):qdrant* may route to qdrant-store among vector/rag/memory');
    if (scripts['e2e-isolation:sole-rag-qdrant:prove'] || scripts['e2e-isolation:sole-memory-qdrant:prove']) {
      fail('package.json must NOT wire e2e-isolation:sole-rag/memory-qdrant (standalone only)');
    } else {
      pass('package.json: no sole-rag/memory-qdrant scripts (P13 standalone only)');
    }
  } else fail(`root package.json missing: ${rootPkgPath}`);

  if (existsSync(vsHarness)) pass('vectorstore-qdrant harness present (P12 parallel)');
  else note('vectorstore-qdrant harness missing (non-fatal)');
  if (existsSync(memoryHarness)) pass('memory:qdrant harness present (P13 sibling)');
  else note('memory:qdrant harness missing (non-fatal if status/harness ok)');

  if (existsSync(deepenHarness)) {
    const d = readFileSync(deepenHarness, 'utf8');
    if (/rag:qdrant:prove/.test(d)) pass('deepen harness inventories rag:qdrant:prove');
    else fail('deepen harness must inventory rag:qdrant:prove as qdrant-native opt-in');
  } else {
    note('deepen harness missing (non-fatal for this prove if status/harness ok)');
  }

  if (exitCode !== 0 && exitCode !== 3) {
    note('static honesty failed — skip live Qdrant');
    note('releaseEvidence=false; Not HA; G2 still GAP; ≠ RAG covered; ≠ default switched');
    finish();
    return;
  }

  // --- live Qdrant via product bridge (fail-closed) ---
  const collection = `meetwise_g2_rag_qdrant_${process.pid}`;
  const bridge = createProductVectorStoreQdrantBridge({ collection });

  try {
    await bridge.requireReadyz();
    pass(`qdrant readyz OK @ ${bridge.url}`);
  } catch (e) {
    prereq(`qdrant readyz failed: ${(e as Error).message}`);
    prereq('docker compose -f docker/compose.mysql-local.yml up -d qdrant');
    prereq('wait until curl -sf http://127.0.0.1:6333/readyz succeeds');
    note('refuse silent fake-green: rag Qdrant prove not covered without /readyz');
    note('COVERED when EXIT=0 only: minimal qbank retrieval slice via bridge against live Qdrant');
    note('STILL-GAP G2: rag*/memory*/vectorstore:prove defaults remain pgvector-isolated');
    note('PREREQ remains: product rag* (hybrid/route/generation/serving_scope) cannot select Qdrant without large rewrite');
    note('releaseEvidence=false; Not HA; ≠ fixtures retired; ≠ RAG covered; ≠ default switched');
    finish();
    return;
  }

  try {
    const ensured = await bridge.ensureCollection();
    pass(`ensureCollection collection=${ensured.collection} created=${ensured.created}`);
  } catch (e) {
    fail(`ensureCollection failed: ${(e as Error).message}`);
    finish();
    return;
  }

  const QOWNER = '__system_qbank__';
  const OWNER = 'userA';
  const N = 40;
  const vecs = Array.from({ length: N }, (_, i) => embed(i + 11));

  try {
    for (let i = 0; i < N; i++) {
      await bridge.upsertVectorChunk(QOWNER, {
        id: `rag-vc${i}`,
        kind: 'qbank',
        refId: `rq${i}`,
        contentHash: `rh${i}`,
        embedding: vecs[i]!,
      });
    }
    pass(`rag retrieval slice: upsert ${N} qbank chunks via bridge→adapter`);
  } catch (e) {
    fail(`upsert qbank failed: ${(e as Error).message}`);
    finish();
    return;
  }

  // ① ANN self-recall (minimal retrieval)
  try {
    const self = await bridge.annSearch(OWNER, 'qbank', vecs[9]!, 5);
    const top = self[0];
    if (top?.refId === 'rq9' && (top.distance ?? Infinity) < 1e-3) {
      pass(`ANN retrieval 自查:top-1 = rq9,距离≈0 (${top.distance})`);
    } else {
      fail(`ANN self-recall failed: ${JSON.stringify(self.slice(0, 3))}`);
    }
  } catch (e) {
    fail(`annSearch self-recall failed: ${(e as Error).message}`);
    finish();
    return;
  }

  // ② ANN ≈ brute cosine
  try {
    const q = embed(20).map((x, i) => x + (i % 13 === 0 ? 0.015 : 0));
    const ann = (await bridge.annSearch(OWNER, 'qbank', q, 5)).map((r) => r.refId);
    const brute = vecs
      .map((v, i) => ({ id: `rq${i}`, s: cosine(q, v) }))
      .sort((a, b) => b.s - a.s)
      .slice(0, 5)
      .map((x) => x.id);
    const overlap = ann.filter((id) => brute.includes(id)).length;
    if (overlap >= 4 && ann[0] === brute[0]) {
      pass(`ANN top-5 与暴力余弦 top-5 重合 ${overlap}/5`);
    } else {
      fail(`ANN vs brute overlap ${overlap}/5 ann=${JSON.stringify(ann)} brute=${JSON.stringify(brute)}`);
    }
  } catch (e) {
    fail(`ANN vs brute failed: ${(e as Error).message}`);
  }

  // ③ qbank shared read (retrieval slice tenant shape)
  try {
    const bSees = await bridge.annSearch('userB', 'qbank', vecs[9]!, 5);
    if (bSees.some((h) => h.refId === 'rq9')) {
      pass('qbank 共享读:userB 可检索到策展题（retrieval 公共知识面）');
    } else fail(`qbank shared failed: ${JSON.stringify(bSees.slice(0, 3))}`);
  } catch (e) {
    fail(`qbank shared check failed: ${(e as Error).message}`);
  }

  // ④ Idempotent upsert
  try {
    const first = pointIdForChunk(QOWNER, 'qbank', 'rh0');
    const again = await bridge.upsertVectorChunk(QOWNER, {
      id: 'rag-vcX',
      kind: 'qbank',
      refId: 'rq0',
      contentHash: 'rh0',
      embedding: vecs[0]!,
    });
    if (again.pointId === first) pass('同 hash 幂等去重(同 pointId)');
    else fail(`idempotent upsert expected ${first}, got ${again.pointId}`);
  } catch (e) {
    fail(`idempotent upsert failed: ${(e as Error).message}`);
  }

  note('COVERED (this prove): minimal qbank ANN retrieval slice via Qdrant bridge when EXIT=0');
  note('STILL-GAP G2: rag*/memory*/vectorstore:prove defaults remain pgvector-isolated — NOT claimed covered on Qdrant');
  note('PREREQ: product rag* (hybridQbankSearch / rag04 serving_scope / generation / route snapshot) cannot select Qdrant without large rewrite');
  note('STILL-GAP: ≠ hybrid lexical, ≠ R4 track isolation, ≠ rag03–rag07 product proves migrated');
  note('releaseEvidence=false; Not HA; 本绿≠已迁; ≠ cutover; ≠ fixtures retired; ≠ RAG covered');
  finish();
}

main().catch((e) => {
  fail(`unhandled: ${(e as Error).message}`);
  finish();
});
