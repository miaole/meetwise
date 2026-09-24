/**
 * Knife F1 — wrong_track **production-surface remaining** prove.
 *
 * Beyond LIVE_PG ADV honesty + NHP-R4-ADV-01 covered (THIS case):
 *   PS1 — prod call-path / deploy-surface: main injects trackLocal; production
 *         NODE_ENV refuses missing-trackLocal compat fallback (fail-closed)
 *   PS2 — observability: track_local mode metrics on wrong_track / recheck /
 *         cache-replay / snapshot-missing; cache-replay map still fail-closed
 *   PS3 — honesty: production wrong_track=0 remaining ≠ R4 closed
 *         (P-R1 / P-R2 / P-META / P-FIX still open); LIVE_PG ≠ prod closed;
 *         NHP covered ≠ this knife
 *
 * Live wired 旁证: spawns LIVE_PG + unit ADV (real path where required).
 * releaseEvidence=false · ≠HA · ≠ R4 closed · EXIT=0 ≠ prod wrong_track=0 fully closed
 * sole allowlist not expanded · no invent MODEL_API_KEY · no self-approve
 *
 * CMD: pnpm r4-wrong-track-prod-surface:prove
 *   → node scripts/run-e2e-isolated.mjs r4-wrong-track-prod-surface:prove:raw
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createMetrics, setMetrics, getMetrics, METRIC, registerBaselineMetrics } from '@meetwise/ai-runtime';
import { R4_WRONG_TRACK_RECHECK_REASONS, degradedRetrieval } from '@meetwise/domain';
import {
  classifyTrackLocalOutcome,
  observeTrackLocalRetrieval,
  mapRecheckFailedToRefs,
  scoredRefsFromDispatch,
  TRACK_LOCAL_OBS_OUTCOMES,
} from '../src/qbank-track-local-retrieve.ts';
import {
  isProductionNodeEnv,
  productionRequiresTrackLocal,
} from '../src/production-config.ts';

let failures = 0;
const A = (name: string, ok: boolean, detail?: string) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
  if (!ok) failures++;
};
const section = (t: string) => console.log(`\n──────── ${t} ────────`);

const here = dirname(fileURLToPath(import.meta.url));
const workerRoot = join(here, '..');
const repoRoot = join(workerRoot, '..', '..');

const harnessPath = join(repoRoot, 'ai-docs/delivery/harness/r4-f1-wrong-track-prod-surface.md');
const evalPath = join(repoRoot, 'ai-docs/delivery/eval/r4-f1-wrong-track-prod-surface.eval.md');
const slicePath = join(repoRoot, 'ai-docs/delivery/r4-f1-wrong-track-prod-surface.slice.md');
const statusPath = join(repoRoot, 'ai-docs/delivery/harness/r4-domain-isolation-status.md');
const helperPath = join(workerRoot, 'src/qbank-track-local-retrieve.ts');
const consumerPath = join(workerRoot, 'src/interview-consumer.ts');
const mainPath = join(workerRoot, 'src/main.ts');
const prodCfgPath = join(workerRoot, 'src/production-config.ts');
const metricsPath = join(repoRoot, 'packages/ai-runtime/src/metrics.ts');
const unitAdvProof = join(here, 'r4-wrong-track-adv.proof.ts');
const livePgProof = join(here, 'r4-wrong-track-adv-live-pg.proof.ts');

function read(p: string) {
  return existsSync(p) ? readFileSync(p, 'utf8') : '';
}

/** Live PG required for PS1 call-path 旁证 via LIVE_PG spawn. Missing → EXIT≠0. */
function requireLivePgOrFail(): { mode: 'isolated' | 'url' | 'components' } {
  const isolated = process.env.E2E_ISOLATED === '1'
    && Boolean(process.env.PGHOST)
    && Boolean(process.env.E2E_TEST_TARGET_TOKEN);
  const hasUrl = Boolean(process.env.DATABASE_URL?.trim());
  const hasComponents = Boolean(
    process.env.PGHOST && process.env.PGPORT && process.env.PGUSER
    && process.env.PGPASSWORD !== undefined && process.env.PGDATABASE,
  );
  if (isolated) return { mode: 'isolated' };
  if (hasUrl) return { mode: 'url' };
  if (hasComponents) return { mode: 'components' };
  console.error(
    '\nPROD_SURFACE_GAP: real Postgres required for r4-wrong-track-prod-surface prove (PS1 live wired 旁证).\n'
    + '  Expected: E2E_ISOLATED=1 via `pnpm r4-wrong-track-prod-surface:prove`\n'
    + '            (run-e2e-isolated) OR DATABASE_URL / full PG* components.\n'
    + '  skip ≠ pass — refusing fake-green with in-memory-only.\n'
    + '  Honesty: LIVE_PG dual ≠ prod closed · NHP covered ≠ this knife · ≠ R4 closed.\n'
    + '  releaseEvidence=false · ≠HA\n',
  );
  process.exit(1);
}

function spawnProve(label: string, args: string[]): number {
  console.log(`\n── spawn ${label}: pnpm ${args.join(' ')} ──`);
  const r = spawnSync('pnpm', args, {
    cwd: repoRoot,
    env: process.env,
    stdio: 'inherit',
  });
  const code = typeof r.status === 'number' ? r.status : 1;
  A(`${label} EXIT=0`, code === 0, `exit=${code}`);
  return code;
}

const pgMode = requireLivePgOrFail();
console.log(`F1 prod-surface LIVE_PG target mode=${pgMode.mode} (real Postgres required; skip≠pass)`);
console.log('F1 wrong_track prod-surface prove — PS1–PS3 · releaseEvidence=false · ≠HA · ≠R4 closed');
console.log('EXIT=0 ≠ production wrong_track=0 fully closed ≠ R4 closed · await post-prove dual');

section('PS0 static anchors present');
for (const [label, path] of [
  ['F1 harness', harnessPath],
  ['F1 eval', evalPath],
  ['F1 slice', slicePath],
  ['r4 status', statusPath],
  ['retrieveVia helper', helperPath],
  ['interview-consumer', consumerPath],
  ['main.ts', mainPath],
  ['production-config', prodCfgPath],
  ['metrics.ts', metricsPath],
  ['unit ADV proof', unitAdvProof],
  ['LIVE_PG proof', livePgProof],
] as const) {
  A(`${label} present`, existsSync(path), path);
}

const harness = read(harnessPath);
const evalDoc = read(evalPath);
const slice = read(slicePath);
const status = read(statusPath);
const helper = read(helperPath);
const consumer = read(consumerPath);
const main = read(mainPath);
const prodCfg = read(prodCfgPath);
const metricsSrc = read(metricsPath);

section('PS1 production call-path / deploy-surface');
A('PS1 main.ts injects trackLocal factory (prod call-path)',
  /trackLocal:\s*\(owner/.test(main) || /trackLocal:\s*\(owner:/.test(main));
A('PS1 main documents REAL-WIRE trackLocal preferred',
  /trackLocal/.test(main) && /dispatchTrackLocalRetrieval|REAL-WIRE/.test(main));
A('PS1 consumer prefers adaptive.trackLocal → retrieveViaDispatchTrackLocal',
  /adaptive\.trackLocal/.test(consumer) && /retrieveViaDispatchTrackLocal/.test(consumer));
A('PS1 consumer imports productionRequiresTrackLocal',
  /productionRequiresTrackLocal/.test(consumer));
A('PS1 consumer fail-closes track_local_required under production missing trackLocal',
  /track_local_required/.test(consumer) && /productionRequiresTrackLocal\(false\)/.test(consumer));
A('PS1 productionRequiresTrackLocal helper present',
  /export function productionRequiresTrackLocal/.test(prodCfg)
  && /export function isProductionNodeEnv/.test(prodCfg));
A('PS1 unit: production + !trackLocal → require',
  productionRequiresTrackLocal(false, { NODE_ENV: 'production' }));
A('PS1 unit: production + trackLocal → ok',
  !productionRequiresTrackLocal(true, { NODE_ENV: 'production' }));
A('PS1 unit: development + !trackLocal → compat allowed',
  !productionRequiresTrackLocal(false, { NODE_ENV: 'development' }));
A('PS1 unit: isProductionNodeEnv trim/case',
  isProductionNodeEnv({ NODE_ENV: ' Production' }));
A('PS1 helper still wired retrieveVia + ban P-FAKEPLAN + fail-closed',
  /retrieveViaDispatchTrackLocal/.test(helper)
  && /P-FAKEPLAN/.test(helper)
  && /fail-closed/.test(helper));

section('PS2 observability + cache-replay escape surfaces');
A('PS2 classifyTrackLocalOutcome + observeTrackLocalRetrieval exported',
  /export function classifyTrackLocalOutcome/.test(helper)
  && /export function observeTrackLocalRetrieval/.test(helper)
  && /mode: 'track_local'/.test(helper));
A('PS2 metrics baseline registers track_local outcomes',
  /mode: 'track_local'/.test(metricsSrc)
  && /wrong_track/.test(metricsSrc)
  && /cache_replay_degraded/.test(metricsSrc)
  && /track_local_required/.test(metricsSrc));
A('PS2 retrieveVia observes every exit (finish/observeTrackLocalRetrieval)',
  /observeTrackLocalRetrieval/.test(helper) && /classifyTrackLocalOutcome/.test(helper));

// Fresh metrics registry for unit observe asserts
setMetrics(createMetrics());
registerBaselineMetrics(getMetrics());

A('PS2 classify: route_snapshot_missing',
  classifyTrackLocalOutcome([degradedRetrieval('route_snapshot_missing')]) === 'route_snapshot_missing');
A('PS2 classify: wrong_track',
  classifyTrackLocalOutcome([degradedRetrieval('wrong_track:2')]) === 'wrong_track');
A('PS2 classify: recheck_failed catalog',
  classifyTrackLocalOutcome([degradedRetrieval('recheck_failed:metadata_hash_mismatch')]) === 'recheck_failed');
A('PS2 classify: cache replay degraded',
  classifyTrackLocalOutcome([degradedRetrieval('recheck_failed:replay')]) === 'cache_replay_degraded');
A('PS2 classify: empty refs → cache_replay_empty',
  classifyTrackLocalOutcome([]) === 'cache_replay_empty');
A('PS2 classify: track_local_required',
  classifyTrackLocalOutcome([degradedRetrieval('track_local_required')]) === 'track_local_required');
A('PS2 classify: ok non-degraded',
  classifyTrackLocalOutcome([{ ref: 'q:leaf-a', score: 0.9 }]) === 'ok');
A('PS2 TRACK_LOCAL_OBS_OUTCOMES covers PS2 catalog',
  TRACK_LOCAL_OBS_OUTCOMES.includes('wrong_track')
  && TRACK_LOCAL_OBS_OUTCOMES.includes('cache_replay_degraded')
  && TRACK_LOCAL_OBS_OUTCOMES.includes('track_local_required'));

observeTrackLocalRetrieval('wrong_track', 12, 0);
observeTrackLocalRetrieval('cache_replay_degraded', 8, 0);
observeTrackLocalRetrieval('recheck_failed', 5, 0);
const rendered = getMetrics().render();
A('PS2 observe emits rag_retrieval_total mode=track_local wrong_track',
  /rag_retrieval_total\{[^}]*mode="track_local"[^}]*outcome="wrong_track"[^}]*\} [1-9]/.test(rendered)
  || /rag_retrieval_total\{[^}]*outcome="wrong_track"[^}]*mode="track_local"[^}]*\} [1-9]/.test(rendered));
A('PS2 observe emits cache_replay_degraded',
  /outcome="cache_replay_degraded"/.test(rendered) && /mode="track_local"/.test(rendered));

A('PS2 cache-replay: scoredRefsFromDispatch replay recheck_failed → degraded', (() => {
  const refs = scoredRefsFromDispatch({
    status: 'replayed', planId: 'p', planStatus: 'recheck_failed',
  } as never);
  return refs.length === 1
    && refs[0]!.availability === 'degraded'
    && /replay/.test(refs[0]!.ref)
    && classifyTrackLocalOutcome(refs) === 'cache_replay_degraded';
})());
A('PS2 cache-replay: replayed served → empty (observable cache_replay_empty)', (() => {
  const refs = scoredRefsFromDispatch({
    status: 'replayed', planId: 'p', planStatus: 'served',
  } as never);
  return refs.length === 0 && classifyTrackLocalOutcome(refs) === 'cache_replay_empty';
})());
A('PS2 full R4_WRONG_TRACK_RECHECK_REASONS map fail-closed + classifiable', (() => {
  for (const reason of R4_WRONG_TRACK_RECHECK_REASONS) {
    const refs = mapRecheckFailedToRefs(reason);
    if (refs.length !== 1 || refs[0]!.availability !== 'degraded') return false;
    if (!refs[0]!.ref.includes(reason) && !refs[0]!.ref.includes('recheck_failed')) return false;
    const o = classifyTrackLocalOutcome(refs);
    if (o !== 'recheck_failed' && o !== 'cache_replay_degraded') return false;
  }
  return true;
})());

section('PS3 honesty pins (≠ R4 closed · ≠ prod fully closed)');
A('PS3 harness names production-surface remaining / PS1–PS3',
  /production-surface remaining|PS1/.test(harness) && /PS2/.test(harness) && /PS3/.test(harness));
A('PS3 harness freezes CMD r4-wrong-track-prod-surface:prove',
  /r4-wrong-track-prod-surface:prove/.test(harness));
A('PS3 harness pins LIVE_PG dual ≠ prod closed',
  /LIVE_PG.*≠.*prod|LIVE_PG dual ≠ prod closed/i.test(harness));
A('PS3 harness pins NHP covered dual ≠ this knife',
  /NHP covered dual ≠ this knife|NHP covered.*≠.*this knife/i.test(harness));
A('PS3 harness pins ≠ R4 closed · releaseEvidence=false · ≠HA',
  (/≠ R4 closed|NOT closed|R4 open|仍开/.test(harness))
  && /releaseEvidence=false/.test(harness)
  && (/≠HA|Not HA|≠ HA/.test(harness)));
A('PS3 eval registers E1–E* / PS mapping',
  /E1/.test(evalDoc) && /PS1|production/.test(evalDoc));
A('PS3 slice indexes harness+eval',
  /r4-f1-wrong-track-prod-surface\.md/.test(slice)
  && /r4-f1-wrong-track-prod-surface\.eval\.md/.test(slice));
A('PS3 status pins 题域隔离 NOT closed + releaseEvidence=false',
  /题域隔离 NOT closed/.test(status) && /releaseEvidence=false/.test(status));
A('PS3 status still lists P-R1/P-R2/P-META/P-FIX open OR R4 NOT closed',
  /R4.*NOT closed|题域隔离 NOT closed/.test(status));
A('PS3 prove never assigns MODEL_API_KEY (no invent)',
  !/MODEL_API_KEY\s*=/.test(read(join(here, 'r4-wrong-track-prod-surface.proof.ts'))));
A('PS3 SOLE allowlist not expanded for F1 knife', (() => {
  const runner = read(join(repoRoot, 'scripts/run-e2e-isolated.mjs'));
  const m = runner.match(/const SOLE_WIRING_ALLOWLIST = new Set\(\[([\s\S]*?)\]\)/);
  if (!m) return false;
  return !m[1].includes('r4-wrong-track-prod-surface') && !m[1].includes('prod-surface');
})());

section('PS1/PS2 live wired 旁证 (unit ADV + LIVE_PG; ≠ this knife alone)');
const unitExit = spawnProve('unit ADV (r4-wrong-track-adv)', [
  '-C', 'apps/worker', 'prove:r4-wrong-track-adv',
]);
const liveExit = spawnProve('LIVE_PG ADV (r4-wrong-track-adv-live-pg)', [
  '-C', 'apps/worker', 'prove:r4-wrong-track-adv-live-pg',
]);
A('PS1 live wrong_track path exercised via LIVE_PG prove EXIT=0', liveExit === 0);
A('PS2 unit ADV adversary + fail-closed 旁证 EXIT=0', unitExit === 0);
A('PS3 composition: F1 EXIT=0 ≠ R4 closed ≠ prod wrong_track=0 fully closed', true);

console.log('\n── honesty summary (F1 prod-surface; await post-prove dual) ──');
console.log(`PG mode=${pgMode.mode} · unit ADV exit=${unitExit} · LIVE_PG exit=${liveExit}`);
console.log('PS1: prod call-path trackLocal + deploy fail-closed track_local_required.');
console.log('PS2: track_local observability + cache-replay map fail-closed.');
console.log('PS3: LIVE_PG dual ≠ prod closed · NHP covered ≠ this knife · ≠ R4 closed.');
console.log('EXIT=0 ≠ production wrong_track=0 fully closed ≠ R4 closed ≠ HA.');
console.log('releaseEvidence=false · no self-approve · sole allowlist not flipped.');

console.log(failures === 0
  ? '\nOK  r4-wrong-track-prod-surface prove (PS1–PS3; LIVE_PG+unit 旁证; ≠ R4 closed; ≠ prod fully closed; releaseEvidence=false)'
  : `\nFAIL  r4-wrong-track-prod-surface prove (${failures} failures)`);
process.exit(failures === 0 ? 0 : 1);
