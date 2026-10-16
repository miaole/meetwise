#!/usr/bin/env node
/**
 * HA multi-instance track prove — static honesty + file presence.
 * releaseEvidence=false · Not HA · does NOT start instances or claim HA green.
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const paths = {
  harness: join(root, 'ai-docs/delivery/harness/ha-track.multi-instance.md'),
  skeletonHarness: join(root, 'ai-docs/delivery/harness/ha-track.skeleton.md'),
  northStar: join(root, 'ai-docs/delivery/north-star-ha.md'),
  bringUp: join(root, 'scripts/ha/bring-up-dual.mjs'),
  stub: join(root, 'scripts/ha/dual-livez-stub.mjs'),
  fault: join(root, 'scripts/ha/fault-inject.stub.mjs'),
  faultReal: join(root, 'scripts/ha/fault-inject.mjs'),
  probe: join(root, 'scripts/ha/probe.multi.mjs'),
  buildImage: join(root, 'scripts/ha/build-backend-image.mjs'),
  readme: join(root, 'scripts/ha/README.md'),
  composeSkeleton: join(root, 'docker/compose.ha-dual.skeleton.yml'),
  composeReal: join(root, 'docker/compose.ha-dual.yml'),
  composeShared: join(root, 'docker/compose.ha-dual.shared.yml'),
  dockerfileHaDual: join(root, 'docker/Dockerfile.ha-dual'),
  proveShared: join(root, 'scripts/ha/prove-shared-state.mjs'),
  proveNestSession: join(root, 'scripts/ha/prove-nest-session.mjs'),
  prepareNestPg: join(root, 'scripts/ha/prepare-nest-pg.mjs'),
  composePg: join(root, 'docker/compose.ha-dual.pg.yml'),
  redisResp: join(root, 'scripts/ha/redis-resp-once.mjs'),
  pkg: join(root, 'package.json'),
};

let exitCode = 0;
const lines = [];
function fail(msg) {
  lines.push(`FAIL  ${msg}`);
  exitCode = 1;
}
function pass(msg) {
  lines.push(`PASS  ${msg}`);
}

for (const [label, path] of Object.entries(paths)) {
  if (existsSync(path)) pass(`${label} present: ${path}`);
  else fail(`${label} missing: ${path}`);
}

function mustPin(label, text, patterns, failMsg) {
  const ok = patterns.every((p) =>
    typeof p === 'string' ? text.includes(p) : p.test(text),
  );
  if (ok) pass(`${label} honesty pin OK`);
  else fail(failMsg);
}

if (existsSync(paths.harness)) {
  const h = readFileSync(paths.harness, 'utf8');
  mustPin(
    'multi harness releaseEvidence',
    h,
    [/releaseEvidence\s*=\s*false/i],
    'multi harness missing releaseEvidence=false',
  );
  mustPin(
    'multi harness Not HA',
    h,
    [/Not HA|NOT_HA|非 HA/i],
    'multi harness must forbid HA claims',
  );
  mustPin(
    'multi harness PREREQ/GAP',
    h,
    [/PREREQ_GAP|prereq|GAP/i],
    'multi harness must document PREREQ_GAP path',
  );
  mustPin(
    'multi harness C1 real compose',
    h,
    [/compose\.ha-dual\.yml|C1/i, /MEETWISE_HA_DUAL_AUTHORIZED/i],
    'multi harness must document C1 real compose + MEETWISE_HA_DUAL_AUTHORIZED',
  );
  mustPin(
    'multi harness C2/C3/C4',
    h,
    [/C2|dual|livez/i, /C3|shared/i, /C4|fault-inject|故障/i],
    'multi harness must map ladder C2–C4',
  );
  mustPin(
    'multi harness C3 shared path',
    h,
    [/compose-shared|compose\.ha-dual\.shared|prove:shared|prove-shared-state/i, /MEETWISE_HA_SHARED_AUTHORIZED/i],
    'multi harness must document C3 compose-shared + MEETWISE_HA_SHARED_AUTHORIZED',
  );
  mustPin(
    'multi harness C4 compose fault',
    h,
    [/fault-inject\.mjs|ha:fault-inject(?!:stub)/i, /MEETWISE_HA_FAULT_AUTHORIZED/i],
    'multi harness must document C4 fault-inject.mjs + MEETWISE_HA_FAULT_AUTHORIZED',
  );
  mustPin(
    'multi harness Nest session C3b',
    h,
    [/Nest.*session|nest-session|prove:nest-session/i, /compose-pg|prepare:nest-pg|LOCAL_OK|GAP|PREREQ/i],
    'multi harness must document Nest session C3b (compose-pg / prove / PREREQ)',
  );
  if (/releaseEvidence\s*=\s*true/i.test(h) && !/禁止|不得|false/i.test(h)) {
    fail('multi harness must not set releaseEvidence=true');
  } else {
    pass('multi harness does not claim releaseEvidence=true');
  }
}

if (existsSync(paths.composeReal)) {
  const c = readFileSync(paths.composeReal, 'utf8');
  mustPin(
    'compose.ha-dual honesty',
    c,
    [/releaseEvidence=false|Not HA/i, /api-a/, /api-b/],
    'compose.ha-dual.yml must pin Not HA and define api-a/api-b',
  );
  if (/claimProductionHA:\s*true|releaseEvidence=true/i.test(c) && !/禁止|false/i.test(c)) {
    fail('compose.ha-dual must not claim production HA');
  } else {
    pass('compose.ha-dual does not claim production HA');
  }
}

if (existsSync(paths.composeShared)) {
  const cs = readFileSync(paths.composeShared, 'utf8');
  mustPin(
    'compose.ha-dual.shared honesty',
    cs,
    [/releaseEvidence=false|Not HA/i, /sole_stack|meetwise-mysql-local_default/i, /REDIS_URL|redis:\/\/redis/i],
    'compose.ha-dual.shared.yml must pin Not HA and sole-stack Redis attach',
  );
}

if (existsSync(paths.proveShared)) {
  const ps = readFileSync(paths.proveShared, 'utf8');
  mustPin(
    'prove-shared honesty',
    ps,
    [/releaseEvidence:\s*false|releaseEvidence\s*=\s*false/i, /NOT_HA|Not HA/i, /MEETWISE_HA_SHARED_AUTHORIZED/i],
    'prove-shared-state.mjs missing honesty / auth pins',
  );
  mustPin(
    'prove-shared require-shared fail-closed',
    ps,
    [/require-shared|requireShared/i, /EXIT=1|process\.exit\(1\)/i],
    'prove-shared must fail-closed on --require-shared',
  );
}

if (existsSync(paths.proveNestSession)) {
  const ns = readFileSync(paths.proveNestSession, 'utf8');
  mustPin(
    'prove-nest-session honesty',
    ns,
    [/releaseEvidence:\s*false|releaseEvidence\s*=\s*false/i, /NOT_HA|Not HA/i, /nestSessionOk/i],
    'prove-nest-session.mjs missing honesty / nestSessionOk pins',
  );
  mustPin(
    'prove-nest-session require-session fail-closed',
    ns,
    [/require-session|requireSession/i, /EXIT=1|process\.exit\(1\)/i],
    'prove-nest-session must fail-closed on --require-session',
  );
  mustPin(
    'prove-nest-session PREREQ/GAP honesty',
    ns,
    [/PREREQ_GAP|postgres|placeholder/i, /sole|MySQL/i],
    'prove-nest-session must document Postgres PREREQ vs sole MySQL GAP',
  );
  // Local nestSessionOk=true is allowed only with hard Not HA / releaseEvidence=false pins.
  if (/nestSessionOk\s*[=:]\s*true/i.test(ns) && !/releaseEvidence:\s*false|releaseEvidence=false/i.test(ns)) {
    fail('prove-nest-session must keep releaseEvidence=false even when nestSessionOk local true');
  } else {
    pass('prove-nest-session keeps releaseEvidence=false with optional local nestSessionOk');
  }
  if (/haStatus:\s*HA[^_]|claimProductionHA:\s*true/i.test(ns) && !/false|禁止|≠|refuse/i.test(ns)) {
    fail('prove-nest-session must not claim production HA');
  } else {
    pass('prove-nest-session does not claim production HA');
  }
}

if (existsSync(paths.buildImage)) {
  const b = readFileSync(paths.buildImage, 'utf8');
  mustPin(
    'build-image honesty',
    b,
    [/releaseEvidence:\s*false|releaseEvidence\s*=\s*false/i, /NOT_HA|Not HA/i],
    'build-backend-image.mjs missing honesty pins',
  );
}

for (const [label, path] of [
  ['bring-up', paths.bringUp],
  ['stub', paths.stub],
  ['fault', paths.fault],
  ['faultReal', paths.faultReal],
  ['probe.multi', paths.probe],
]) {
  if (!existsSync(path)) continue;
  const t = readFileSync(path, 'utf8');
  mustPin(
    `${label} releaseEvidence false`,
    t,
    [/releaseEvidence:\s*false|releaseEvidence\s*=\s*false/i],
    `${label} missing releaseEvidence=false`,
  );
  mustPin(
    `${label} NOT_HA`,
    t,
    [/NOT_HA|Not HA/i],
    `${label} must mark NOT_HA`,
  );
  if (/haStatus:\s*['"]?HA['"]?[^_]|claimProductionHA:\s*true|releaseEvidence:\s*true/i.test(t)) {
    if (
      /releaseEvidence:\s*true/i.test(t) &&
      !/never|Never|NEVER|禁止|不等于|≠|refuse|不得/.test(t)
    ) {
      fail(`${label} must not set releaseEvidence:true`);
    } else if (/claimProductionHA:\s*true/.test(t)) {
      fail(`${label} must not claimProductionHA:true`);
    } else {
      pass(`${label} does not claim HA green / releaseEvidence=true`);
    }
  } else {
    pass(`${label} does not claim HA green / releaseEvidence=true`);
  }
}

if (existsSync(paths.bringUp)) {
  const t = readFileSync(paths.bringUp, 'utf8');
  mustPin(
    'bring-up real compose path',
    t,
    [/compose\.ha-dual\.yml/, /MEETWISE_HA_DUAL_AUTHORIZED/, /ha-dual-local|MEETWISE_HA_BACKEND_IMAGE/],
    'bring-up must wire compose.ha-dual.yml + auth + image tag',
  );
}


if (existsSync(paths.faultReal)) {
  const fr = readFileSync(paths.faultReal, 'utf8');
  mustPin(
    'faultReal honesty',
    fr,
    [/releaseEvidence:\s*false|releaseEvidence\s*=\s*false/i, /NOT_HA|Not HA/i, /MEETWISE_HA_FAULT_AUTHORIZED/i],
    'fault-inject.mjs missing honesty / FAULT_AUTHORIZED pins',
  );
  mustPin(
    'faultReal require-fault fail-closed',
    fr,
    [/require-fault|requireFault/i, /EXIT=1|process\.exit\(1\)/i],
    'fault-inject.mjs must fail-closed on --require-fault',
  );
  mustPin(
    'faultReal compose kill path',
    fr,
    [/docker stop|COMPOSE_A_DOWN_B_UP|compose-kill|--kill/i, /SHARED_OK_SURVIVOR|with-shared-survivor/i],
    'fault-inject.mjs must implement compose kill + shared survivor',
  );
}

if (existsSync(paths.probe)) {
  const p = readFileSync(paths.probe, 'utf8');
  mustPin(
    'probe.multi require-evidence fail-closed',
    p,
    [/require-evidence|requireEvidence/i, /EXIT=1|process\.exit\(1\)/i],
    'probe.multi must fail-closed on --require-evidence',
  );
}


if (existsSync(paths.proveNestSession)) {
  const ns = readFileSync(paths.proveNestSession, 'utf8');
  mustPin(
    'prove-nest-session --prove sticky path',
    ns,
    [/--prove/, /nest-session\.OK\.json|NEST_SESSION_LOCAL_OK/i, /releaseEvidence:\s*false|releaseEvidence=false/i],
    'prove-nest-session must support --prove sticky OK while keeping releaseEvidence=false',
  );
  mustPin(
    'prove-nest-session require-session fail-closed',
    ns,
    [/require-session|requireSession/i, /EXIT=1|process\.exit\(1\)|exit =/i],
    'prove-nest-session must fail-closed on --require-session when nestSessionOk false',
  );
}

if (existsSync(paths.composePg)) {
  const pg = readFileSync(paths.composePg, 'utf8');
  mustPin(
    'compose PG overlay Not HA',
    pg,
    [/releaseEvidence=false|Not HA/i, /AUTH_SECRET/i, /meetwise_ha_runtime/i],
    'compose.ha-dual.pg.yml must wire AUTH_SECRET+runtime DB and stay Not HA',
  );
}

if (existsSync(paths.pkg)) {
  const pkg = JSON.parse(readFileSync(paths.pkg, 'utf8'));
  const scripts = pkg.scripts ?? {};
  for (const key of [
    'ha-track:multi:prove',
    'ha:dual:bring-up',
    'ha:dual:stub',
    'ha:dual:build-image',
    'ha:dual:compose',
    'ha:dual:compose-shared',
    'ha:probe:multi',
    'ha:fault-inject',
    'ha:fault-inject:stub',
    'ha:prove:shared',
    'ha:prove:nest-session',
    'ha:prepare:nest-pg',
    'ha:dual:compose-pg',
  ]) {
    if (scripts[key]) pass(`package.json has ${key}`);
    else fail(`package.json missing ${key}`);
  }
}

for (const line of lines) console.log(line);
console.log('haStatus: NOT_HA');
console.log('releaseEvidence: false');
console.log('claimProductionHA: false');
console.log(
  'note: multi-instance track files only; ladder C/D not green; Nest session may be LOCAL_OK via compose-pg but STILL Not HA; real compose path ≠ production HA',
);
console.log(`CMD=node ${join(root, 'scripts/ha/ha-track.multi.proof.mjs')} EXIT=${exitCode}`);
process.exit(exitCode);
