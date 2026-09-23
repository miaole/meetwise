/**
 * R1 / GAP-RAG-01 prove — adaptive role fail-closed gate
 * (post G-R4-3 / R1 product-close default flip).
 * releaseEvidence=false · Not HA · does not claim R4 topic isolation closed.
 *
 * Covers:
 *   - flag default ON (empty env) → fail-closed
 *   - flag explicit 0 → legacy「技术岗」
 *   - flag on + missing route → adaptive_role_route_missing
 *   - flag on + route snapshot role → uses route (deps alone insufficient)
 *   - static: main.ts no longer injects role: '技术岗'
 *   - static: interview-consumer no longer uses ?? '技术岗'
 *   - static: harness + eval doc present; ≠ R4 closed; 假绿标红; releaseEvidence=false
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
A('flag default on (empty env)', isTechRoleFailClosedEnabled({}) === true);
A('flag 0 off', isTechRoleFailClosedEnabled({ [MEETWISE_TECH_ROLE_FAIL_CLOSED_ENV]: '0' }) === false);
A('flag false off', isTechRoleFailClosedEnabled({ [MEETWISE_TECH_ROLE_FAIL_CLOSED_ENV]: 'false' }) === false);
A('flag off token off', isTechRoleFailClosedEnabled({ [MEETWISE_TECH_ROLE_FAIL_CLOSED_ENV]: 'off' }) === false);
A('flag 1 on', isTechRoleFailClosedEnabled({ [MEETWISE_TECH_ROLE_FAIL_CLOSED_ENV]: '1' }) === true);
A('flag true on', isTechRoleFailClosedEnabled({ [MEETWISE_TECH_ROLE_FAIL_CLOSED_ENV]: 'true' }) === true);

// --- unit: legacy (flag explicit off) ---
const off = { [MEETWISE_TECH_ROLE_FAIL_CLOSED_ENV]: '0' };
A('flag-off missing sources → legacy 技术岗',
  resolveAdaptiveInterviewRole({}, off) === LEGACY_TECH_ROLE_DEFAULT
  && LEGACY_TECH_ROLE_DEFAULT === '技术岗');
A('flag-off prefers deps role over legacy',
  resolveAdaptiveInterviewRole({ roleFromDeps: '后端工程师' }, off) === '后端工程师');
A('flag-off prefers route over deps',
  resolveAdaptiveInterviewRole({
    roleFromRouteSnapshot: 'backend/nodejs',
    roleFromDeps: '技术岗',
  }, off) === 'backend/nodejs');

// --- unit: fail-closed (product default / flag on) ---
A('empty-env missing route throws adaptive_role_route_missing (product default)',
  caughtCode(() => resolveAdaptiveInterviewRole({}, {})) === ADAPTIVE_ROLE_ROUTE_MISSING);
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
A('empty-env route snapshot role accepted (product default)',
  resolveAdaptiveInterviewRole({ roleFromRouteSnapshot: 'backend/nodejs' }, {}) === 'backend/nodejs');

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
  A('harness documents product default ON / fail-closed flip',
    /默认\s*on|product default ON|defaultFlipped|fail-closed.*默认|默认.*fail-closed|MEETWISE_TECH_ROLE_FAIL_CLOSED.*默认\s*(on|1)/i.test(harness)
    || /产品默认/.test(harness));
  A('harness does not claim R4 topic isolation closed',
    /不宣称题域隔离已关|R4/.test(harness) && /题域隔离/.test(harness));
  A('harness names prove CMD',
    /r1-tech-role-fail-closed:prove/.test(harness));
  A('harness has false-green / 假绿 section',
    /假绿/.test(harness));
  A('harness lists E1–E9 style eval IDs',
    /E1/.test(harness) && /E4/.test(harness) && /E9/.test(harness));
  A('harness ≠ claim R4/FUNNEL closed from this contract prove',
    /≠.*R4|不宣称.*R4|R4.*NOT closed|题域隔离.*NOT closed|不宣称题域隔离已关/i.test(harness));
}

if (existsSync(evalPath)) {
  const ev = readFileSync(evalPath, 'utf8');
  A('eval doc pins releaseEvidence=false',
    /releaseEvidence=false/.test(ev));
  A('eval doc maps harness IDs and names mw-rag-route',
    /E1/.test(ev) && /mw-rag-route/.test(ev));
  A('eval doc lists false-green checklist',
    /假绿/.test(ev));
}

console.log(failures === 0
  ? '✓ R1 tech-role fail-closed proof passed (product default ON; ≠ R4 topic isolation closed; releaseEvidence=false)'
  : `✗ ${failures} failures`);
process.exit(failures === 0 ? 0 : 1);
