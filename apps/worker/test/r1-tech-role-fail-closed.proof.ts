/**
 * R1 / GAP-RAG-01 prove — adaptive role fail-closed gate.
 * releaseEvidence=false · Not HA · does not claim R2 wiring or R4 topic isolation.
 *
 * Covers:
 *   - flag default off → legacy「技术岗」
 *   - flag on + missing route → adaptive_role_route_missing
 *   - flag on + route snapshot role → uses route (deps alone insufficient)
 *   - static: main.ts no longer injects role: '技术岗'
 *   - static: interview-consumer no longer uses ?? '技术岗'
 *   - static: harness + eval doc present; R1 NOT closed; R2/R4 non-claims; 假绿标红
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  ADAPTIVE_ROLE_ROUTE_MISSING,
  LEGACY_TECH_ROLE_DEFAULT,
  MEETWISE_TECH_ROLE_FAIL_CLOSED_ENV,
  isTechRoleFailClosedEnabled,
  resolveAdaptiveInterviewRole,
} from '../src/adaptive-role-resolve.ts';

let failures = 0;
const A = (name: string, ok: boolean, detail?: string) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
  if (!ok) failures++;
};

function caughtCode(fn: () => unknown): string | undefined {
  try {
    fn();
    return undefined;
  } catch (e) {
    return (e as { code?: string })?.code ?? `unexpected:${(e as Error).message}`;
  }
}

const here = dirname(fileURLToPath(import.meta.url));
const workerRoot = join(here, '..');
const repoRoot = join(workerRoot, '..', '..');
const mainPath = join(workerRoot, 'src/main.ts');
const consumerPath = join(workerRoot, 'src/interview-consumer.ts');
const resolvePath = join(workerRoot, 'src/adaptive-role-resolve.ts');
const harnessPath = join(repoRoot, 'ai-docs/delivery/harness/r1-tech-role-fail-closed.md');

// --- unit: flag ---
A('flag default off (empty env)', isTechRoleFailClosedEnabled({}) === false);
A('flag 0 off', isTechRoleFailClosedEnabled({ [MEETWISE_TECH_ROLE_FAIL_CLOSED_ENV]: '0' }) === false);
A('flag 1 on', isTechRoleFailClosedEnabled({ [MEETWISE_TECH_ROLE_FAIL_CLOSED_ENV]: '1' }) === true);
A('flag true on', isTechRoleFailClosedEnabled({ [MEETWISE_TECH_ROLE_FAIL_CLOSED_ENV]: 'true' }) === true);

// --- unit: legacy (flag off) ---
A('flag-off missing sources → legacy 技术岗',
  resolveAdaptiveInterviewRole({}, {}) === LEGACY_TECH_ROLE_DEFAULT
  && LEGACY_TECH_ROLE_DEFAULT === '技术岗');
A('flag-off prefers deps role over legacy',
  resolveAdaptiveInterviewRole({ roleFromDeps: '后端工程师' }, {}) === '后端工程师');
A('flag-off prefers route over deps',
  resolveAdaptiveInterviewRole({
    roleFromRouteSnapshot: 'backend/nodejs',
    roleFromDeps: '技术岗',
  }, {}) === 'backend/nodejs');

// --- unit: fail-closed (flag on) ---
const on = { [MEETWISE_TECH_ROLE_FAIL_CLOSED_ENV]: '1' };
A('flag-on missing route throws adaptive_role_route_missing',
  caughtCode(() => resolveAdaptiveInterviewRole({}, on)) === ADAPTIVE_ROLE_ROUTE_MISSING);
A('flag-on deps alone still fail-closed (no silent 技术岗 via deps)',
  caughtCode(() => resolveAdaptiveInterviewRole({ roleFromDeps: '技术岗' }, on)) === ADAPTIVE_ROLE_ROUTE_MISSING);
A('flag-on blank route still fail-closed',
  caughtCode(() => resolveAdaptiveInterviewRole({
    roleFromRouteSnapshot: '   ',
    roleFromJobRouteMetadata: '',
    roleFromDeps: '技术岗',
  }, on)) === ADAPTIVE_ROLE_ROUTE_MISSING);
A('flag-on route snapshot role accepted',
  resolveAdaptiveInterviewRole({ roleFromRouteSnapshot: 'backend/nodejs' }, on) === 'backend/nodejs');
A('flag-on job route metadata role accepted',
  resolveAdaptiveInterviewRole({ roleFromJobRouteMetadata: 'frontend/react' }, on) === 'frontend/react');

// --- static: hardcode path addressed ---
for (const [label, path] of [
  ['resolver module', resolvePath],
  ['main.ts', mainPath],
  ['interview-consumer.ts', consumerPath],
  ['harness', harnessPath],
] as const) {
  A(`${label} present`, existsSync(path), path);
}

if (existsSync(mainPath)) {
  const main = readFileSync(mainPath, 'utf8');
  A('main.ts no longer injects role: \'技术岗\' hardcode',
    !/role:\s*['"]技术岗['"]/.test(main));
  A('main.ts documents R1 resolver / fail-closed',
    /resolveAdaptiveInterviewRole|MEETWISE_TECH_ROLE_FAIL_CLOSED|GAP-RAG-01/.test(main));
}

if (existsSync(consumerPath)) {
  const consumer = readFileSync(consumerPath, 'utf8');
  A('interview-consumer no longer uses ?? \'技术岗\' silent default',
    !/\?\?\s*['"]技术岗['"]/.test(consumer));
  A('interview-consumer calls resolveAdaptiveInterviewRole',
    /resolveAdaptiveInterviewRole/.test(consumer));
  A('interview-consumer probes getInterviewRouteSnapshot under fail-closed',
    /getInterviewRouteSnapshot/.test(consumer) && /isTechRoleFailClosedEnabled/.test(consumer));
}

const evalPath = join(repoRoot, 'ai-docs/delivery/eval/r1-tech-role-fail-closed.eval.md');
A('eval proof doc present', existsSync(evalPath), evalPath);

if (existsSync(harnessPath)) {
  const harness = readFileSync(harnessPath, 'utf8');
  A('harness pins releaseEvidence=false + Not HA',
    /releaseEvidence=false/.test(harness) && /Not HA/.test(harness));
  A('harness explicitly says R1 not closed / pass ≠ R1 已关',
    /R1 是否已关[\s\S]{0,80}否|pass ≠ R1 已关|R1 未关/.test(harness));
  A('harness does not claim R2 wiring done',
    /不宣称 R2|不接线.*R2|R2 仍缺口|R2.*未/.test(harness));
  A('harness does not claim R4 topic isolation closed',
    /不宣称题域隔离已关|R4/.test(harness) && /题域隔离/.test(harness));
  A('harness names prove CMD',
    /r1-tech-role-fail-closed:prove/.test(harness));
  A('harness has false-green / 假绿 section',
    /假绿/.test(harness));
  A('harness lists E1–E9 style eval IDs',
    /E1/.test(harness) && /E4/.test(harness) && /E9/.test(harness));
}

if (existsSync(evalPath)) {
  const ev = readFileSync(evalPath, 'utf8');
  A('eval doc pins pass ≠ R1 已关 + releaseEvidence=false',
    /pass ≠ R1 已关|R1 未关|不宣称 R1 已关/.test(ev) && /releaseEvidence=false/.test(ev));
  A('eval doc maps harness IDs and names mw-rag-route',
    /E1/.test(ev) && /mw-rag-route/.test(ev));
  A('eval doc lists false-green checklist',
    /假绿/.test(ev));
}

console.log(failures === 0
  ? '✓ R1 tech-role fail-closed proof passed (R2 unwired; R4 topic isolation NOT closed; releaseEvidence=false)'
  : `✗ ${failures} failures`);
process.exit(failures === 0 ? 0 : 1);
