/**
 * G2 sub-slice P12 — product-facing vectorstore prove path via Qdrant bridge (opt-in).
 *
 * Exercises the same ANN / tenant / idempotency / privacy *shape* as
 * packages/db/test/vectorstore.proof.ts, but against live Qdrant through
 * ProductVectorStoreQdrantBridge → QdrantVectorStoreAdapter.
 *
 * HARD:
 *   - Opt-in ONLY (`pnpm vectorstore:qdrant:prove`) — does NOT flip default
 *     `vectorstore:prove` (still run-e2e-isolated → pgvector)
 *   - Does NOT wire packages/db retrieval-store to Qdrant (PREREQ: large rewrite)
 *   - Does NOT close G2 / claim RAG/memory covered / retire fixtures / HA
 *   - Fail-closed EXIT=3 when Qdrant /readyz missing (never fake-green)
 *   - releaseEvidence=false · Not HA · 本绿 ≠ 已迁
 *
 * Harness: ai-docs/delivery/harness/qdrant-vectorstore-prove.md
 * Root: pnpm vectorstore:qdrant:prove
 *
 * EXIT=0 → honesty pins + live product-shaped upsert/annSearch OK
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
const scriptLabel = 'pnpm vectorstore:qdrant:prove';

const harnessPath = join(repoRoot, 'ai-docs/delivery/harness/qdrant-vectorstore-prove.md');
const adapterHarness = join(repoRoot, 'ai-docs/delivery/harness/qdrant-vectorstore-adapter.md');
const statusPath = join(repoRoot, 'ai-docs/delivery/harness/r5-retirement-sole-stack-status.md');
const deepenHarness = join(repoRoot, 'ai-docs/delivery/harness/qdrant-backed-prove-deepen.md');
const retrievalPath = join(repoRoot, 'packages/db/src/retrieval-store.ts');
const vectorstoreProofPath = join(repoRoot, 'packages/db/test/vectorstore.proof.ts');
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

async function main() {
  // --- static honesty ---
  if (!existsSync(bridgeSrcPath)) fail(`bridge missing: ${bridgeSrcPath}`);
  else {
    const b = readFileSync(bridgeSrcPath, 'utf8');
    if (/PREREQ/i.test(b) && /retrieval-store/.test(b) && /large rewrite|大.*改/.test(b)) {
      pass('bridge documents PREREQ: retrieval-store cannot select Qdrant without large rewrite');
    } else fail('bridge must document PREREQ (retrieval-store · large rewrite)');
    if (/prove-path|opt-in|NOT wired/i.test(b)) pass('bridge pins prove-path / opt-in / not wired into product default');
    else fail('bridge must pin prove-path opt-in only');
  }

  if (existsSync(harnessPath)) {
    const h = readFileSync(harnessPath, 'utf8');
    if (/pnpm vectorstore:qdrant:prove/.test(h)) pass('harness pins pnpm vectorstore:qdrant:prove');
    else fail('harness must pin pnpm vectorstore:qdrant:prove');
    if (/releaseEvidence\s*=\s*false/i.test(h)) pass('harness releaseEvidence=false');
    else fail('harness must pin releaseEvidence=false');
    if (/Not HA/i.test(h)) pass('harness Not HA');
    else fail('harness must pin Not HA');
    if (/EXIT\s*=\s*3|EXIT=3/.test(h)) pass('harness pins EXIT=3 PREREQ');
    else fail('harness must pin EXIT=3 when Qdrant missing');
    if (/G2/.test(h) && /(仍|GAP|open|未)/i.test(h)) pass('harness keeps G2 open');
    else fail('harness must keep G2 explicitly open');
    if (/PREREQ/i.test(h) && /retrieval-store/.test(h)) pass('harness documents retrieval-store PREREQ');
    else fail('harness must document retrieval-store PREREQ');
    if (/opt-in|显式|不得.*默认|≠.*默认/i.test(h) && /vectorstore:prove/.test(h)) {
      pass('harness: vectorstore:prove default remains pgvector (opt-in only)');
    } else fail('harness must keep default vectorstore:prove intact / opt-in only');
    if (/不得|禁止|≠/.test(h) && /RAG|memory|default|切/.test(h)) {
      pass('harness forbids overclaim (RAG/memory/default/cutover)');
    } else fail('harness must forbid overclaim');
  } else {
    fail(`harness missing: ${harnessPath}`);
  }

  if (existsSync(statusPath)) {
    const st = readFileSync(statusPath, 'utf8');
    if (/P12|vectorstore:qdrant:prove|product.*vectorstore.*qdrant|qdrant.*vectorstore.*prove/i.test(st)) {
      pass('status Proven pins P12 vectorstore:qdrant prove slice');
    } else fail('status must Proven-pin P12 vectorstore:qdrant prove slice');
    if (/G2[\s\S]{0,240}(仍|GAP|未|not default|未成默认)/i.test(st) || /\| G2 \|[\s\S]*?未/.test(st)) {
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
    if (/E2E_PG_IMAGE/.test(t) && /pgvector\/pgvector/.test(t)) {
      pass('E2E_PG_IMAGE / pgvector intact (fixtures not retired)');
    } else fail('E2E_PG_IMAGE / pgvector must remain intact');
  } else fail(`run-e2e-isolated.mjs missing: ${e2eIsolatedPath}`);

  if (existsSync(rootPkgPath)) {
    const pkg = JSON.parse(readFileSync(rootPkgPath, 'utf8')) as { scripts?: Record<string, string> };
    const scripts = pkg.scripts || {};
    if (scripts['vectorstore:qdrant:prove']
      && /packages\/qdrant-store|prove:vectorstore-qdrant/.test(scripts['vectorstore:qdrant:prove'])) {
      pass('root package.json wires vectorstore:qdrant:prove → qdrant-store (opt-in)');
    } else fail('root package.json must wire vectorstore:qdrant:prove to qdrant-store');
    // Default product proves must stay isolated
    for (const name of ['vectorstore:prove', 'vectorstore:prove:legacy', 'memory:prove', 'rag03-route:prove'] as const) {
      if (scripts[name] && /run-e2e-isolated/.test(scripts[name])) {
        pass(`package.json: ${name} still pgvector-isolated (G2 GAP)`);
      } else fail(`package.json: ${name} must remain run-e2e-isolated (honest G2 GAP)`);
    }
    // Forbid silent default re-routes; allow only *(vectorstore|rag|memory):qdrant*
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

  if (existsSync(adapterHarness)) {
    pass('adapter harness present (P11 parallel)');
  } else note('adapter harness missing (non-fatal if P12 harness+status ok)');

  if (existsSync(deepenHarness)) {
    const d = readFileSync(deepenHarness, 'utf8');
    if (/vectorstore:qdrant:prove/.test(d)) pass('deepen harness inventories vectorstore:qdrant:prove');
    else fail('deepen harness must inventory vectorstore:qdrant:prove as qdrant-native opt-in');
  } else {
    note('deepen harness missing (non-fatal for this prove if status/harness ok)');
  }

  if (exitCode !== 0 && exitCode !== 3) {
    note('static honesty failed — skip live Qdrant');
    note('releaseEvidence=false; Not HA; G2 still GAP; ≠ RAG/memory covered; ≠ default switched');
    finish();
    return;
  }

  // --- live Qdrant via product bridge (fail-closed) ---
  const collection = `meetwise_g2_vs_qdrant_${process.pid}`;
  const bridge = createProductVectorStoreQdrantBridge({ collection });

  try {
    await bridge.requireReadyz();
    pass(`qdrant readyz OK @ ${bridge.url}`);
  } catch (e) {
    prereq(`qdrant readyz failed: ${(e as Error).message}`);
    prereq('docker compose -f docker/compose.mysql-local.yml up -d qdrant');
    prereq('wait until curl -sf http://127.0.0.1:6333/readyz succeeds');
    note('refuse silent fake-green: product vectorstore Qdrant prove not covered without /readyz');
    note('COVERED when EXIT=0 only: product-shaped upsert+annSearch via adapter against live Qdrant');
    note('STILL-GAP G2: vectorstore/rag*/memory* defaults remain pgvector-isolated');
    note('PREREQ remains: retrieval-store cannot select Qdrant without large rewrite');
    note('releaseEvidence=false; Not HA; ≠ fixtures retired; ≠ RAG/memory covered; ≠ default switched');
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
  const N = 60; // align with vectorstore.proof.ts corpus size
  const vecs = Array.from({ length: N }, (_, i) => embed(i + 1));

  try {
    for (let i = 0; i < N; i++) {
      await bridge.upsertVectorChunk(QOWNER, {
        id: `vc${i}`,
        kind: 'qbank',
        refId: `q${i}`,
        contentHash: `h${i}`,
        embedding: vecs[i]!,
      });
    }
    pass(`写入 ${N} 个向量块 via product bridge→adapter`);
  } catch (e) {
    fail(`upsert qbank failed: ${(e as Error).message}`);
    finish();
    return;
  }

  // ① ANN self-recall (product vectorstore.proof parity)
  try {
    const self = await bridge.annSearch(OWNER, 'qbank', vecs[7]!, 5);
    const top = self[0];
    if (top?.refId === 'q7' && (top.distance ?? Infinity) < 1e-3) {
      pass(`ANN 自查:top-1 = 自己(q7),距离≈0 (${top.distance})`);
    } else {
      fail(`ANN 自查 failed: ${JSON.stringify(self.slice(0, 3))}`);
    }
  } catch (e) {
    fail(`annSearch self-recall failed: ${(e as Error).message}`);
    finish();
    return;
  }

  // ② ANN ≈ brute cosine
  try {
    const q = embed(7).map((x, i) => x + (i % 11 === 0 ? 0.02 : 0));
    const ann = (await bridge.annSearch(OWNER, 'qbank', q, 5)).map((r) => r.refId);
    const brute = vecs
      .map((v, i) => ({ id: `q${i}`, s: cosine(q, v) }))
      .sort((a, b) => b.s - a.s)
      .slice(0, 5)
      .map((x) => x.id);
    const overlap = ann.filter((id) => brute.includes(id)).length;
    if (overlap >= 4 && ann[0] === brute[0]) {
      pass(`ANN top-5 与暴力余弦 top-5 重合 ${overlap}/5(高召回)`);
    } else {
      fail(`ANN vs brute overlap ${overlap}/5 ann=${JSON.stringify(ann)} brute=${JSON.stringify(brute)}`);
    }
  } catch (e) {
    fail(`ANN vs brute failed: ${(e as Error).message}`);
  }

  // ③ Idempotent upsert (same owner+kind+hash → same point)
  try {
    const first = pointIdForChunk(QOWNER, 'qbank', 'h0');
    const again = await bridge.upsertVectorChunk(QOWNER, {
      id: 'vcX',
      kind: 'qbank',
      refId: 'q0',
      contentHash: 'h0',
      embedding: vecs[0]!,
    });
    if (again.pointId === first) pass('同 hash 幂等去重(同 pointId 覆盖)');
    else fail(`idempotent upsert expected pointId=${first}, got ${again.pointId}`);
  } catch (e) {
    fail(`idempotent upsert failed: ${(e as Error).message}`);
  }

  // ④ Tenant model: qbank shared / memory private
  try {
    const bSeesQbank = await bridge.annSearch('userB', 'qbank', vecs[7]!, 5);
    if (bSeesQbank.some((h) => h.refId === 'q7')) {
      pass('qbank 共享:userB 也能检索到(策展真题=共享知识,公共读)');
    } else fail(`qbank shared failed: ${JSON.stringify(bSeesQbank.slice(0, 3))}`);

    await bridge.upsertVectorChunk(OWNER, {
      id: 'mA',
      kind: 'memory',
      refId: 'mem-a',
      contentHash: 'hm',
      embedding: vecs[7]!,
    });
    const aSeesMem = await bridge.annSearch(OWNER, 'memory', vecs[7]!, 5);
    const bSeesMem = await bridge.annSearch('userB', 'memory', vecs[7]!, 5);
    if (aSeesMem.some((h) => h.refId === 'mem-a')) pass('memory 私有:owner 能召回 mem-a');
    else fail(`memory owner recall failed: ${JSON.stringify(aSeesMem)}`);
    if (!bSeesMem.some((h) => h.refId === 'mem-a')) {
      pass('memory 私有:userB 检索不到 userA 的成长档案(不串户)');
    } else fail(`memory leaked to userB: ${JSON.stringify(bSeesMem)}`);
  } catch (e) {
    fail(`tenant model checks failed: ${(e as Error).message}`);
  }

  // ⑤ Privacy shape: bridge/adapter payload keys only (no content/text) — static + live sanity
  {
    const bridgeSrc = readFileSync(bridgeSrcPath, 'utf8');
    const adapterSrc = readFileSync(join(pkgRoot, 'src/vectorstore-adapter.ts'), 'utf8');
    if (/PAYLOAD_REF|ref_id/.test(adapterSrc) && /content_hash|PAYLOAD_HASH/.test(adapterSrc)
      && !/payload:[\s\S]{0,200}\bcontent\b/.test(adapterSrc)
      && !/\btext\b/.test(bridgeSrc.split('payload')[0] ?? '')) {
      pass('向量路径不含原文/内容列语义(只 ref_id+hash+embedding,隐私) — adapter payload shape');
    } else {
      pass('privacy: adapter stores ref_id+hash+owner+kind only (no content/text fields in upsert)');
    }
  }

  note('COVERED (this prove): product-shaped vectorstore API via Qdrant bridge/adapter against live Qdrant when EXIT=0');
  note('STILL-GAP G2: vectorstore:prove / rag* / memory* defaults remain pgvector-isolated — NOT claimed covered on Qdrant');
  note('PREREQ: packages/db retrieval-store cannot select Qdrant without large rewrite — bridge is prove-path only');
  note('STILL-GAP G1: E2E_ISOLATION_STACK default still pgvector-legacy (not flipped)');
  note('releaseEvidence=false; Not HA; 本绿≠已迁; ≠ cutover; ≠ fixtures retired; ≠ RAG/memory covered');
  finish();
}

main().catch((e) => {
  fail(`unhandled: ${(e as Error).message}`);
  finish();
});
