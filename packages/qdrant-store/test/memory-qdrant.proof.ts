/**
 * G2 sub-slice P13 — opt-in minimal memory *vector* slice via Qdrant bridge.
 *
 * Exercises owner-scoped memory upsert + ANN recall against live Qdrant through
 * ProductVectorStoreQdrantBridge → QdrantVectorStoreAdapter.
 *
 * HARD:
 *   - Opt-in ONLY (`pnpm memory:qdrant:prove`) — does NOT flip default memory*
 *     (still run-e2e-isolated → pgvector)
 *   - Does NOT claim lean `memory:prove` (episode/RLS) or memory-two-stage-recall covered
 *   - Product memory* vector paths cannot select Qdrant without large rewrite (PREREQ)
 *   - Fail-closed EXIT=3 when Qdrant /readyz missing (never fake-green)
 *   - releaseEvidence=false · Not HA · 本绿 ≠ 已迁 · G2 still open
 *
 * PREREQ (product memory* — honesty · no fake-green):
 *   - `apps/worker/test/memory.proof.ts` lean MVP = episode exact-match + weak dims
 *     on Postgres (+ RLS) — **not a vector path at all**; cannot "opt-in" to Qdrant.
 *   - `memory-two-stage-recall` / admission / consent / generation / SQL hard-filter
 *     before ANN remain bound to pg PoolClient + roles. This prove is the
 *     **minimal memory vector slice** only (kind=memory upsert + owner-scoped ANN).
 *     ≠ product memory backend selector; ≠ G2 closed.
 *
 * Harness: ai-docs/delivery/harness/qdrant-memory-prove.md
 * Root: pnpm memory:qdrant:prove
 *
 * EXIT=0 → honesty pins + live minimal memory vector recall OK
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
const scriptLabel = 'pnpm memory:qdrant:prove';

const harnessPath = join(repoRoot, 'ai-docs/delivery/harness/qdrant-memory-prove.md');
const ragHarness = join(repoRoot, 'ai-docs/delivery/harness/qdrant-rag-prove.md');
const vsHarness = join(repoRoot, 'ai-docs/delivery/harness/qdrant-vectorstore-prove.md');
const statusPath = join(repoRoot, 'ai-docs/delivery/harness/r5-retirement-sole-stack-status.md');
const deepenHarness = join(repoRoot, 'ai-docs/delivery/harness/qdrant-backed-prove-deepen.md');
const retrievalPath = join(repoRoot, 'packages/db/src/retrieval-store.ts');
const leanMemoryPath = join(repoRoot, 'apps/worker/test/memory.proof.ts');
const twoStagePath = join(repoRoot, 'packages/db/test/memory-two-stage-recall.proof.ts');
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
    if (/pnpm memory:qdrant:prove/.test(h)) pass('harness pins pnpm memory:qdrant:prove');
    else fail('harness must pin pnpm memory:qdrant:prove');
    if (/releaseEvidence\s*=\s*false/i.test(h)) pass('harness releaseEvidence=false');
    else fail('harness must pin releaseEvidence=false');
    if (/Not HA/i.test(h)) pass('harness Not HA');
    else fail('harness must pin Not HA');
    if (/EXIT\s*=\s*3|EXIT=3/.test(h)) pass('harness pins EXIT=3 PREREQ');
    else fail('harness must pin EXIT=3 when Qdrant missing');
    if (/G2/.test(h) && /(仍|GAP|open|未)/i.test(h)) pass('harness keeps G2 open');
    else fail('harness must keep G2 explicitly open');
    if (/PREREQ/i.test(h) && /(episode|two-stage|admission|consent|lean|大.*改|large rewrite)/i.test(h)) {
      pass('harness documents product memory* PREREQ blockers');
    } else fail('harness must document product memory* PREREQ blockers');
    if (/opt-in|显式|不得.*默认|≠.*默认/i.test(h) && /memory:prove|memory\*/i.test(h)) {
      pass('harness: default memory* remains pgvector (opt-in only)');
    } else fail('harness must keep default memory* intact / opt-in only');
    if (/不得|禁止|≠/.test(h) && /(episode|two-stage|covered|cutover|默认)/i.test(h)) {
      pass('harness forbids overclaim (episode/two-stage/covered/default/cutover)');
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

  if (existsSync(leanMemoryPath)) {
    const t = readFileSync(leanMemoryPath, 'utf8');
    if (/createPool|asPrincipal|wasAsked|user_memory|pgvector|run-e2e-isolated|memory:prove/.test(t)
      && !/@meetwise\/qdrant-store/.test(t)) {
      pass('lean memory:prove still PG episode/RLS path (not vector — blocker intact)');
    } else fail('lean memory.proof.ts must remain PG episode path without qdrant-store');
  } else fail(`lean memory.proof.ts missing: ${leanMemoryPath}`);

  if (existsSync(twoStagePath)) {
    const t = readFileSync(twoStagePath, 'utf8');
    if (/recallHybridCandidates|createPool|admission|consent|run-e2e-isolated|asPrincipal/.test(t)) {
      pass('memory-two-stage-recall still pgvector-isolated product path (blocker intact)');
    } else fail('memory-two-stage-recall must still evidence pgvector product path');
  } else fail(`memory-two-stage-recall proof missing: ${twoStagePath}`);

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
    if (scripts['memory:qdrant:prove']
      && /packages\/qdrant-store|prove:memory-qdrant/.test(scripts['memory:qdrant:prove'])) {
      pass('root package.json wires memory:qdrant:prove → qdrant-store (opt-in)');
    } else fail('root package.json must wire memory:qdrant:prove to qdrant-store');
    for (const name of ['vectorstore:prove', 'memory:prove', 'rag03-route:prove'] as const) {
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
  if (existsSync(ragHarness)) pass('rag:qdrant harness present (P13 sibling)');
  else note('rag:qdrant harness missing (non-fatal if status/harness ok)');

  if (existsSync(deepenHarness)) {
    const d = readFileSync(deepenHarness, 'utf8');
    if (/memory:qdrant:prove/.test(d)) pass('deepen harness inventories memory:qdrant:prove');
    else fail('deepen harness must inventory memory:qdrant:prove as qdrant-native opt-in');
  } else {
    note('deepen harness missing (non-fatal for this prove if status/harness ok)');
  }

  if (exitCode !== 0 && exitCode !== 3) {
    note('static honesty failed — skip live Qdrant');
    note('releaseEvidence=false; Not HA; G2 still GAP; ≠ memory covered; ≠ default switched');
    finish();
    return;
  }

  // --- live Qdrant via product bridge (fail-closed) ---
  const collection = `meetwise_g2_mem_qdrant_${process.pid}`;
  const bridge = createProductVectorStoreQdrantBridge({ collection });

  try {
    await bridge.requireReadyz();
    pass(`qdrant readyz OK @ ${bridge.url}`);
  } catch (e) {
    prereq(`qdrant readyz failed: ${(e as Error).message}`);
    prereq('docker compose -f docker/compose.mysql-local.yml up -d qdrant');
    prereq('wait until curl -sf http://127.0.0.1:6333/readyz succeeds');
    note('refuse silent fake-green: memory Qdrant prove not covered without /readyz');
    note('COVERED when EXIT=0 only: minimal memory vector slice via bridge against live Qdrant');
    note('STILL-GAP G2: memory*/rag*/vectorstore:prove defaults remain pgvector-isolated');
    note('PREREQ remains: lean memory:prove is PG episode (not vector); two-stage/admission/consent need large rewrite');
    note('releaseEvidence=false; Not HA; ≠ fixtures retired; ≠ memory covered; ≠ default switched');
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

  const OWNER_A = 'memA';
  const OWNER_B = 'memB';
  const N = 24;
  const vecs = Array.from({ length: N }, (_, i) => embed(i + 101));

  try {
    for (let i = 0; i < N; i++) {
      await bridge.upsertVectorChunk(OWNER_A, {
        id: `mem-vc${i}`,
        kind: 'memory',
        refId: `mm${i}`,
        contentHash: `mh${i}`,
        embedding: vecs[i]!,
      });
    }
    pass(`memory vector slice: upsert ${N} owner-A memory chunks via bridge→adapter`);
  } catch (e) {
    fail(`upsert memory failed: ${(e as Error).message}`);
    finish();
    return;
  }

  // ① Owner self-recall
  try {
    const self = await bridge.annSearch(OWNER_A, 'memory', vecs[5]!, 5);
    const top = self[0];
    if (top?.refId === 'mm5' && (top.distance ?? Infinity) < 1e-3) {
      pass(`memory ANN 自查:ownerA top-1 = mm5,距离≈0 (${top.distance})`);
    } else {
      fail(`memory self-recall failed: ${JSON.stringify(self.slice(0, 3))}`);
    }
  } catch (e) {
    fail(`annSearch self-recall failed: ${(e as Error).message}`);
    finish();
    return;
  }

  // ② Cross-owner isolation
  try {
    const bSees = await bridge.annSearch(OWNER_B, 'memory', vecs[5]!, 5);
    if (!bSees.some((h) => h.refId === 'mm5')) {
      pass('memory 私有:ownerB 检索不到 ownerA 的成长档案(不串户)');
    } else fail(`memory leaked to ownerB: ${JSON.stringify(bSees)}`);
  } catch (e) {
    fail(`cross-owner check failed: ${(e as Error).message}`);
  }

  // ③ OwnerB own memory does not collide / can recall own
  try {
    const vb = embed(777);
    await bridge.upsertVectorChunk(OWNER_B, {
      id: 'mem-b0',
      kind: 'memory',
      refId: 'mmB0',
      contentHash: 'mhB0',
      embedding: vb,
    });
    const bOwn = await bridge.annSearch(OWNER_B, 'memory', vb, 3);
    const aSeesB = await bridge.annSearch(OWNER_A, 'memory', vb, 3);
    if (bOwn.some((h) => h.refId === 'mmB0')) pass('memory 私有:ownerB 能召回自己的 mmB0');
    else fail(`ownerB self recall failed: ${JSON.stringify(bOwn)}`);
    if (!aSeesB.some((h) => h.refId === 'mmB0')) pass('memory 私有:ownerA 检索不到 ownerB 的 mmB0');
    else fail(`ownerA saw ownerB memory: ${JSON.stringify(aSeesB)}`);
  } catch (e) {
    fail(`ownerB isolation round-trip failed: ${(e as Error).message}`);
  }

  // ④ ANN ≈ brute within owner corpus
  try {
    const q = embed(106).map((x, i) => x + (i % 9 === 0 ? 0.02 : 0));
    const ann = (await bridge.annSearch(OWNER_A, 'memory', q, 5)).map((r) => r.refId);
    const brute = vecs
      .map((v, i) => ({ id: `mm${i}`, s: cosine(q, v) }))
      .sort((a, b) => b.s - a.s)
      .slice(0, 5)
      .map((x) => x.id);
    const overlap = ann.filter((id) => brute.includes(id)).length;
    if (overlap >= 4 && ann[0] === brute[0]) {
      pass(`memory ANN top-5 与暴力余弦 top-5 重合 ${overlap}/5`);
    } else {
      fail(`ANN vs brute overlap ${overlap}/5 ann=${JSON.stringify(ann)} brute=${JSON.stringify(brute)}`);
    }
  } catch (e) {
    fail(`ANN vs brute failed: ${(e as Error).message}`);
  }

  // ⑤ Idempotent upsert
  try {
    const first = pointIdForChunk(OWNER_A, 'memory', 'mh0');
    const again = await bridge.upsertVectorChunk(OWNER_A, {
      id: 'mem-vcX',
      kind: 'memory',
      refId: 'mm0',
      contentHash: 'mh0',
      embedding: vecs[0]!,
    });
    if (again.pointId === first) pass('同 hash 幂等去重(同 pointId)');
    else fail(`idempotent upsert expected ${first}, got ${again.pointId}`);
  } catch (e) {
    fail(`idempotent upsert failed: ${(e as Error).message}`);
  }

  note('COVERED (this prove): minimal memory vector upsert+owner-scoped ANN via Qdrant bridge when EXIT=0');
  note('STILL-GAP G2: memory*/rag*/vectorstore:prove defaults remain pgvector-isolated — NOT claimed covered on Qdrant');
  note('PREREQ: lean memory:prove is PG episode/RLS (not vector); memory-two-stage-recall/admission/consent cannot select Qdrant without large rewrite');
  note('STILL-GAP: ≠ episode exact-match covered, ≠ two-stage recall, ≠ consent/admission ledger');
  note('releaseEvidence=false; Not HA; 本绿≠已迁; ≠ cutover; ≠ fixtures retired; ≠ memory covered');
  finish();
}

main().catch((e) => {
  fail(`unhandled: ${(e as Error).message}`);
  finish();
});
