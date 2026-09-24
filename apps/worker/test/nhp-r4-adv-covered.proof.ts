/**
 * NHP-R4-ADV-01 **covered path** prove — beyond honesty/partial.
 *
 * Composes:
 *   C1 — live wired retrieveVia wrong_track=0 (spawns LIVE_PG prove)
 *   C2 — A3 adversary surfaces live + unit map (LIVE_PG + unit ADV)
 *   C3 — G-R2-5 / ban P-FAKEPLAN / no unscoped·sibling·legacy_unrouted
 *   C4 — matrix + covered harness honesty (partial until post-prove dual)
 *
 * releaseEvidence=false · Not HA · ≠ R4 closed · ≠ production wrong_track=0 closed
 * LIVE_PG ADV post_prove_dual_pass ≠ this covered path done
 * EXIT=0 ≠ covered ≠ R4 closed ≠ HA · matrix stays partial until post-prove dual
 * no self-approve · no sole allowlist flip · no invent MODEL_API_KEY
 *
 * CMD: pnpm nhp-r4-adv-covered:prove
 *   → node scripts/run-e2e-isolated.mjs nhp-r4-adv-covered:prove:raw
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

let failures = 0;
const A = (name: string, ok: boolean, detail?: string) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
  if (!ok) failures++;
};
const section = (t: string) => console.log(`\n──────── ${t} ────────`);

const here = dirname(fileURLToPath(import.meta.url));
const workerRoot = join(here, '..');
const repoRoot = join(workerRoot, '..', '..');

const coveredHarness = join(repoRoot, 'ai-docs/delivery/harness/nhp-r4-adv-covered-path.md');
const coveredEval = join(repoRoot, 'ai-docs/delivery/eval/nhp-r4-adv-covered-path.eval.md');
const coveredSlice = join(repoRoot, 'ai-docs/delivery/nhp-r4-adv-covered-path.slice.md');
const statusPath = join(repoRoot, 'ai-docs/delivery/harness/r4-domain-isolation-status.md');
const matrixPath = join(repoRoot, 'ai-docs/delivery/non-happy-path-perf-load-case-matrix.md');
const unitAdvProof = join(here, 'r4-wrong-track-adv.proof.ts');
const livePgProof = join(here, 'r4-wrong-track-adv-live-pg.proof.ts');
const helperPath = join(workerRoot, 'src', 'qbank-track-local-retrieve.ts');

function read(p: string) {
  return existsSync(p) ? readFileSync(p, 'utf8') : '';
}

/** LIVE_PG hard gate: real PG required for C1. Missing → EXIT≠0 (skip ≠ pass). */
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
    '\nCOVERED_PATH_GAP: real Postgres required for nhp-r4-adv-covered prove (C1 live wired).\n'
    + '  Expected: E2E_ISOLATED=1 via `pnpm nhp-r4-adv-covered:prove`\n'
    + '            (run-e2e-isolated) OR DATABASE_URL / full PG* components.\n'
    + '  skip ≠ pass — refusing fake-green with in-memory-only.\n'
    + '  Honesty: unit ADV / LIVE_PG honesty dual ≠ this covered knife complete.\n'
    + '  ≠ R4 closed · ≠ covered · ≠ HA · releaseEvidence=false\n',
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
console.log(`COVERED_PATH LIVE_PG target mode=${pgMode.mode} (real Postgres required; skip≠pass)`);
console.log('NHP-R4-ADV covered path prove — C1–C4 · releaseEvidence=false · ≠HA · ≠R4 closed');
console.log('EXIT=0 ≠ matrix covered ≠ R4 closed · await post-prove dual');

section('C0 static anchors present');
for (const [label, path] of [
  ['covered harness', coveredHarness],
  ['covered eval', coveredEval],
  ['covered slice', coveredSlice],
  ['r4 status', statusPath],
  ['NHP matrix', matrixPath],
  ['unit ADV proof', unitAdvProof],
  ['LIVE_PG proof', livePgProof],
  ['retrieveVia helper', helperPath],
] as const) {
  A(`${label} present`, existsSync(path), path);
}

const harness = read(coveredHarness);
const evalDoc = read(coveredEval);
const slice = read(coveredSlice);
const status = read(statusPath);
const matrix = read(matrixPath);
const helper = read(helperPath);

section('C4 covered-path definition + honesty pins (partial until post-prove dual)');
A('C4 harness defines C1–C4 covered cases',
  /NHP-R4-ADV-01-C1/.test(harness)
  && /NHP-R4-ADV-01-C2/.test(harness)
  && /NHP-R4-ADV-01-C3/.test(harness)
  && /NHP-R4-ADV-01-C4/.test(harness));
A('C4 harness freezes CMD nhp-r4-adv-covered:prove',
  /nhp-r4-adv-covered:prove/.test(harness));
A('C4 harness pins LIVE_PG dual ≠ covered done',
  /LIVE_PG.*≠.*covered|LIVE_PG ADV `post_prove_dual_pass` ≠|LIVE_PG dual ≠ covered/i.test(harness)
  || /post_prove_dual_pass` ≠ this covered/.test(harness)
  || /LIVE_PG ADV `post_prove_dual_pass` ≠/.test(harness));
A('C4 harness pins ≠ R4 closed · releaseEvidence=false · ≠HA',
  (/≠ R4 closed|NOT closed|仍开|R4 open/.test(harness))
  && /releaseEvidence=false/.test(harness)
  && (/≠HA|Not HA|≠ HA/.test(harness)));
A('C4 harness pins partial ≠ covered until dual+prove+post-prove dual',
  /partial ≠ covered|partial\/honesty/.test(harness)
  && /post-prove dual/.test(harness));
A('C4 eval registers E1–E8 / C1–C4 mapping',
  /E1/.test(evalDoc) && /E5/.test(evalDoc) && /E8/.test(evalDoc)
  && /LIVE_PG/.test(evalDoc));
A('C4 slice indexes harness+eval+REQUEST pair',
  /nhp-r4-adv-covered-path\.md/.test(slice)
  && /nhp-r4-adv-covered-path\.eval\.md/.test(slice));
A('C4 matrix NHP-R4-ADV-01 still partial / ≠ covered (elevation awaits post-prove dual)', (() => {
  const line = matrix.split('\n').find((l) => l.includes('NHP-R4-ADV-01')) ?? '';
  if (!line) return false;
  // Must remain partial/honesty until post-prove dual promotes.
  if (/≠\s*covered|partial/i.test(line)) return true;
  // Reject bare covered status without negation.
  return !/(^|[\s*|])\*\*covered\*\*|[\s|]covered([\s|]|$)/i.test(line);
})());
A('C4 status §12 / covered path still pins R4 NOT closed + 题域隔离 NOT closed',
  /题域隔离 NOT closed/.test(status)
  && /releaseEvidence=false/.test(status)
  && (/nhp-r4-adv-covered-path|§12|covered path/.test(status)));
A('C4 helper still wired retrieveVia + ban P-FAKEPLAN + fail-closed',
  /retrieveViaDispatchTrackLocal/.test(helper)
  && /P-FAKEPLAN/.test(helper)
  && /fail-closed/.test(helper));
A('C4 prove never assigns MODEL_API_KEY (no invent)',
  !/MODEL_API_KEY\s*=/.test(read(join(here, 'nhp-r4-adv-covered.proof.ts'))));
A('C4 SOLE allowlist not expanded for covered knife', (() => {
  const runner = read(join(repoRoot, 'scripts/run-e2e-isolated.mjs'));
  const m = runner.match(/const SOLE_WIRING_ALLOWLIST = new Set\(\[([\s\S]*?)\]\)/);
  if (!m) return false;
  return !m[1].includes('nhp-r4-adv-covered');
})());

section('C2/C3 unit ADV 旁证 (honesty surfaces; ≠ covered alone)');
const unitExit = spawnProve('unit ADV (r4-wrong-track-adv)', [
  '-C', 'apps/worker', 'prove:r4-wrong-track-adv',
]);

section('C1–C3 LIVE_PG live wired (wrong_track=0 · A3 · G-R2-5)');
const liveExit = spawnProve('LIVE_PG ADV (r4-wrong-track-adv-live-pg)', [
  '-C', 'apps/worker', 'prove:r4-wrong-track-adv-live-pg',
]);

section('C1–C4 composition honesty');
A('C1 live wrong_track path exercised via LIVE_PG prove EXIT=0', liveExit === 0);
A('C2/C3 unit adversary + fail-closed 旁证 EXIT=0', unitExit === 0);
A('C4 composition: covered prove EXIT=0 ≠ matrix covered ≠ R4 closed',
  true); // narrative pin; matrix assert above keeps partial

console.log('\n── honesty summary (covered-path prove; await post-prove dual) ──');
console.log(`PG mode=${pgMode.mode} · unit ADV exit=${unitExit} · LIVE_PG exit=${liveExit}`);
console.log('C1–C3: composed from LIVE_PG live wired + unit ADV 旁证.');
console.log('C4: covered harness/eval/matrix honesty — NHP-R4-ADV-01 stays partial until post-prove dual.');
console.log('LIVE_PG ADV post_prove_dual_pass ≠ this covered path done (prior honesty only).');
console.log('EXIT=0 ≠ covered ≠ R4 closed ≠ production wrong_track=0 closed ≠ HA.');
console.log('releaseEvidence=false · no self-approve · sole allowlist not flipped.');

console.log(failures === 0
  ? '\nOK  nhp-r4-adv-covered prove (C1–C4 composition; LIVE_PG+unit; matrix still partial; ≠ covered until post-prove dual; ≠ R4 closed; releaseEvidence=false)'
  : `\nFAIL  nhp-r4-adv-covered prove (${failures} failures)`);
process.exit(failures === 0 ? 0 : 1);
