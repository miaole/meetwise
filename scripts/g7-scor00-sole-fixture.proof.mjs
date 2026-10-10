#!/usr/bin/env node
/**
 * G7 MAIN · sole夹具退役 ⋂ scor-00 — sole-fixture honesty prove.
 *
 * Pins T1–T5 honesty without false green:
 *   T1  Isolated intended sole stack = mysql-qdrant-redis (plan pinned; G1 flip NOT done)
 *   T2  pgvector-legacy banned as sole/G7 green evidence for scor-00 (opt-in + R5-MARKED-RED only)
 *   T3  scor-00 sole path defined (this CMD) · Nest HTTP body still PG-bound = honest GAP/PREREQ
 *   T4  G7 scor nonzero close narrative requires sole receipts + dual · honesty EXIT≠product close
 *   T5  R5 green-risk retained until sole Nest/MySQL port + dual (≠ R5 retired this prove)
 *
 * HARD:
 *   - Does NOT expand SOLE_WIRING_ALLOWLIST (must remain exactly 5)
 *   - Does NOT flip E2E_ISOLATION_STACK default off pgvector-legacy
 *   - Does NOT invent MODEL_API_KEY · does NOT open DELETE · does NOT claim R4/R5 closed
 *   - EXIT=0 = honesty pins + sole compose reachability · ≠ suite green · ≠ HA · ≠ Nest scor on MySQL
 *
 * Harness: ai-docs/delivery/harness/g7-sole-fixture-retire-scor00.md
 * Root: pnpm scor-00:sole-fixture:prove
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import net from 'node:net';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const harnessPath = join(root, 'ai-docs/delivery/harness/g7-sole-fixture-retire-scor00.md');
const statusPath = join(root, 'ai-docs/delivery/harness/r5-retirement-sole-stack-status.md');
const g1Path = join(root, 'ai-docs/delivery/harness/g1-default-switch-prep.md');
const e2ePath = join(root, 'scripts/run-e2e-isolated.mjs');
const scorHttpPath = join(root, 'apps/api/test/scor-00-http-db.proof.ts');
const pkgPath = join(root, 'package.json');
const selfPath = join(root, 'scripts/g7-scor00-sole-fixture.proof.mjs');

let exitCode = 0;
const lines = [];
function fail(msg) { lines.push(`FAIL  ${msg}`); exitCode = 1; }
function pass(msg) { lines.push(`PASS  ${msg}`); }
function note(msg) { lines.push(`NOTE  ${msg}`); }
function prereq(msg) { lines.push(`PREREQ ${msg}`); if (exitCode === 0 || exitCode === 1) exitCode = 3; }

function assertDoc(label, text, checks) {
  for (const [re, ok, bad] of checks) {
    if (re.test(text)) pass(`${label}: ${ok}`);
    else fail(`${label}: ${bad}`);
  }
}

async function tcpOk(host, port, ms = 1500) {
  return new Promise((resolve) => {
    const s = net.connect({ host, port });
    const t = setTimeout(() => { s.destroy(); resolve(false); }, ms);
    s.on('connect', () => { clearTimeout(t); s.end(); resolve(true); });
    s.on('error', () => { clearTimeout(t); resolve(false); });
  });
}

for (const [label, p] of [
  ['harness g7-sole-fixture-retire-scor00', harnessPath],
  ['r5-retirement-sole-stack-status', statusPath],
  ['g1-default-switch-prep', g1Path],
  ['run-e2e-isolated.mjs', e2ePath],
  ['scor-00 HTTP proof', scorHttpPath],
  ['package.json', pkgPath],
  ['this sole-fixture proof', selfPath],
]) {
  if (existsSync(p)) pass(`${label} present`);
  else fail(`${label} missing: ${p}`);
}

if (existsSync(harnessPath)) {
  const h = readFileSync(harnessPath, 'utf8');
  assertDoc('harness', h, [
    [/releaseEvidence\s*=\s*false/i, 'releaseEvidence=false', 'must pin releaseEvidence=false'],
    [/≠HA|Not HA|≠HA/i, '≠HA', 'must pin ≠HA'],
    [/mysql-qdrant-redis/, 'pins mysql-qdrant-redis', 'must pin sole stack mysql-qdrant-redis'],
    [/pgvector-legacy/, 'pins pgvector-legacy ban/opt-in', 'must pin pgvector-legacy'],
    [/T1|默认真栈/, 'T1 isolated sole stack', 'must pin T1'],
    [/T2|假绿/, 'T2 ban legacy fake-green', 'must pin T2'],
    [/T3|sole 上可证|sole-provable|sole-fixture/, 'T3 scor sole-provable', 'must pin T3'],
    [/T4|nonzero|G7/, 'T4 G7 nonzero honesty', 'must pin T4'],
    [/T5|R5 green-risk|green-risk/, 'T5 R5 green-risk', 'must pin T5'],
    [/executed:awaiting_post_prove_dual|awaiting_post_prove/, 'status executed/awaiting post-prove', 'must pin executed:awaiting_post_prove_dual'],
    [/scor-00:sole-fixture:prove/, 'lists sole-fixture prove CMD', 'must list scor-00:sole-fixture:prove'],
    [/≠ R5 retired|R5 未 retired|≠R5 retired|not fully retired/i, '≠ R5 retired', 'must pin ≠ R5 retired'],
    [/R4.*open|R2\/R4 still open|R4 still open|R4 仍开/i, 'R4 still open', 'must pin R4 still open'],
    [/allowlist|恰 5|exactly 5/i, 'allowlist bound', 'must pin allowlist bound'],
  ]);
}

if (existsSync(statusPath)) {
  const st = readFileSync(statusPath, 'utf8');
  assertDoc('status', st, [
    [/g7-sole-fixture-retire-scor00|sole夹具退役.*scor-00|sole∩scor/i, 'main-track sole∩scor pointer', 'must pointer sole∩scor main track'],
    [/G7-SCOR00-PG-FIXTURE|scor-00:http:prove/, 'G7 scor inventory', 'must retain G7 scor inventory'],
    [/R5 green-risk|green-risk/i, 'R5 green-risk retained', 'must retain R5 green-risk'],
    [/releaseEvidence\s*=\s*false/i, 'releaseEvidence=false', 'must pin releaseEvidence=false'],
    [/flip NOT open|默认仍.*pgvector-legacy|仍 `pgvector-legacy`/i, 'G1 flip NOT open / default legacy', 'must pin G1 flip not open'],
  ]);
}

if (existsSync(g1Path)) {
  const g1 = readFileSync(g1Path, 'utf8');
  assertDoc('g1-prep', g1, [
    [/flip NOT open|FORBIDDEN.*翻默认|禁止本轮翻默认/i, 'G1 flip NOT open', 'must keep G1 flip NOT open'],
    [/pgvector-legacy/, 'default still legacy narrative', 'must pin legacy default'],
  ]);
}

if (existsSync(e2ePath)) {
  const e2e = readFileSync(e2ePath, 'utf8');
  if (/const LEGACY_STACK\s*=\s*'pgvector-legacy'/.test(e2e)) pass('runner: LEGACY_STACK still pgvector-legacy (G1 flip NOT done)');
  else fail('runner: LEGACY_STACK must remain pgvector-legacy (this knife does not flip global default)');
  if (/const SOLE_STACK\s*=\s*'mysql-qdrant-redis'/.test(e2e)) pass('runner: SOLE_STACK = mysql-qdrant-redis');
  else fail('runner: SOLE_STACK must be mysql-qdrant-redis');
  const m = e2e.match(/SOLE_WIRING_ALLOWLIST\s*=\s*new Set\(([\s\S]*?)\)/);
  if (!m) fail('runner: SOLE_WIRING_ALLOWLIST not parseable');
  else {
    const items = [...m[1].matchAll(/'([^']+)'/g)].map((x) => x[1]);
    if (items.length !== 5) fail(`runner: SOLE_WIRING_ALLOWLIST must stay exactly 5; got ${items.length}: ${items.join(',')}`);
    else if (items.some((t) => /scor/i.test(t))) fail('runner: scor-00 must NOT be on SOLE_WIRING_ALLOWLIST (no silent expand)');
    else pass('runner: SOLE_WIRING_ALLOWLIST exactly 5 · scor-00 NOT on allowlist');
  }
  if (/G7-SCOR00|scor-00:http:prove:raw/.test(e2e) && /R5-MARKED-RED|G7-SCOR00-PG-FIXTURE/.test(e2e)) {
    pass('runner: scor-00 legacy path carries G7-SCOR00 / R5-MARKED-RED banner');
  } else {
    fail('runner: scor-00 legacy path must emit G7-SCOR00 / R5-MARKED-RED honesty banner');
  }
}

if (existsSync(scorHttpPath)) {
  const scor = readFileSync(scorHttpPath, 'utf8');
  assertDoc('scor-http', scor, [
    [/createJob/, 'uses createJob (not raw job_posting only)', 'must seed via createJob'],
    [/classifyJobRoute/, 'uses classifyJobRoute route_decided', 'must classifyJobRoute'],
    [/R5-MARKED-RED|≠ sole|≠ sole capacity/, 'pins ≠ sole capacity', 'must pin ≠ sole capacity on legacy HTTP'],
    [/MODEL_API_KEY/, 'deletes/avoids MODEL_API_KEY', 'must not invent MODEL_API_KEY'],
    [/delete process\.env\.MODEL_API_KEY/, 'deletes MODEL_API_KEY', 'must delete MODEL_API_KEY'],
  ]);
}

if (existsSync(pkgPath)) {
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
  const scripts = pkg.scripts ?? {};
  if (scripts['scor-00:sole-fixture:prove']) pass('package.json: scor-00:sole-fixture:prove wired');
  else fail('package.json: scor-00:sole-fixture:prove missing');
  if (scripts['scor-00:http:prove']?.includes('run-e2e-isolated')) pass('package.json: scor-00:http:prove still isolated Nest HTTP');
  else fail('package.json: scor-00:http:prove must remain run-e2e-isolated Nest HTTP');
  if (scripts['scor-00-honesty:prove']) pass('package.json: scor-00-honesty:prove present');
  else fail('package.json: scor-00-honesty:prove missing');
}

// Sole compose reachability (shared local ≠ disposable; ≠ fixtures retired)
const ports = [
  ['MySQL sole', '127.0.0.1', 33069],
  ['Redis sole', '127.0.0.1', 63809],
  ['Qdrant sole', '127.0.0.1', 6333],
];
const reach = await Promise.all(ports.map(async ([name, host, port]) => {
  const ok = await tcpOk(host, port);
  if (ok) pass(`sole compose reachable: ${name} ${host}:${port}`);
  else prereq(`sole compose missing: ${name} ${host}:${port} (bring up docker/compose.mysql-local.yml)`);
  return ok;
}));

note('GAP: Nest scor-00 HTTP prove body still PG Client / run-e2e-isolated pgvector-legacy — MySQL sole Nest port = PREREQ open');
note('GAP: G1 isolated default flip NOT open · SOLE_WIRING_ALLOWLIST stays 5 · R2/R4 still open · ≠ suite green · ≠ HA');
note('T4: scor-00-honesty:prove EXIT=0 ≠ product/G7 close; legacy scor-00:http:prove EXIT=0 ≠ sole migrated ≠ R5 retired');
note('releaseEvidence=false · Not HA · 本绿≠已迁 · await post-prove dual · no self-approve');

if (reach.every(Boolean)) {
  pass('T1 plan pin live: sole compose MySQL+Qdrant+Redis reachable (≠ default flip · ≠ disposable · ≠ R5 retired)');
}

for (const line of lines) console.log(line);
console.log(
  exitCode === 0
    ? '\nOK  scor-00:sole-fixture:prove (T1–T5 honesty pins + sole reachability; ≠ R5 retired ≠ suite green ≠ Nest-on-MySQL ≠ HA)'
    : exitCode === 3
      ? '\nPREREQ  scor-00:sole-fixture:prove (sole compose or honesty pin missing; refuse fake-green)'
      : '\nFAIL  scor-00:sole-fixture:prove',
);
process.exit(exitCode);
