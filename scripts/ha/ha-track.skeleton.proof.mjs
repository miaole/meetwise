#!/usr/bin/env node
/**
 * HA track skeleton prove — static only.
 * Checks harness + probe skeleton + compose skeleton + README exist;
 * pins releaseEvidence=false / Not HA / never claim production HA.
 * Does NOT start dual instances, fault-inject, or claim HA green.
 * releaseEvidence=false. Not HA.
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const harnessPath = join(root, 'ai-docs/delivery/harness/ha-track.skeleton.md');
const proofPath = join(root, 'scripts/ha/ha-track.skeleton.proof.mjs');
const probePath = join(root, 'scripts/ha/probe.skeleton.mjs');
const readmePath = join(root, 'scripts/ha/README.md');
const composePath = join(root, 'docker/compose.ha-dual.skeleton.yml');
const northStarPath = join(root, 'ai-docs/delivery/north-star-ha.md');
const pkgPath = join(root, 'package.json');

let exitCode = 0;
const lines = [];

function fail(msg) {
  lines.push(`FAIL  ${msg}`);
  exitCode = 1;
}

function pass(msg) {
  lines.push(`PASS  ${msg}`);
}

for (const [label, path] of [
  ['harness', harnessPath],
  ['skeleton proof', proofPath],
  ['probe skeleton', probePath],
  ['ha README', readmePath],
  ['dual compose skeleton', composePath],
  ['north-star-ha', northStarPath],
]) {
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

if (existsSync(harnessPath)) {
  const h = readFileSync(harnessPath, 'utf8');
  mustPin(
    'harness releaseEvidence',
    h,
    [/releaseEvidence\s*=\s*false/i],
    'harness missing releaseEvidence=false',
  );
  mustPin(
    'harness Not HA',
    h,
    [/Not HA|非 HA|不得叙事.*HA|禁止.*生产 HA/i],
    'harness must forbid HA claims',
  );
  mustPin(
    'harness fault-inject path',
    h,
    [/fault-inject|故障注入/i, /多实例|multi-instance|dual/i],
    'harness must document multi-instance + fault-inject path',
  );
  mustPin(
    'harness receipts',
    h,
    [/收据|receipt/i],
    'harness must list required receipts',
  );
  if (/releaseEvidence\s*=\s*true/i.test(h) && !/禁止勾\s*`?releaseEvidence=true/i.test(h)) {
    fail('harness must not set releaseEvidence=true');
  } else {
    pass('harness does not claim releaseEvidence=true');
  }
  if (
    (/禁止[^\n]{0,60}HA green|≠ 生产 HA|不得叙事[^\n]{0,20}HA|禁止宣称生产 HA|\*\*Not HA\*\*/i.test(h)) &&
    !/claimProductionHA:\s*true/i.test(h) &&
    !/生产 HA 已(证|绿|达成)/.test(h) &&
    !/result:\s*PASS[^\n]{0,40}HA green/i.test(h)
  ) {
    pass('harness does not claim production HA green');
  } else {
    fail('harness must not claim production HA / HA green');
  }
}

if (existsSync(probePath)) {
  const p = readFileSync(probePath, 'utf8');
  mustPin(
    'probe releaseEvidence false',
    p,
    [/releaseEvidence:\s*false|releaseEvidence\s*=\s*false/i],
    'probe skeleton missing releaseEvidence:false',
  );
  mustPin(
    'probe NOT_HA / fail-closed',
    p,
    [/NOT_HA|fail-closed|failClosed/i],
    'probe skeleton must fail-closed / mark NOT_HA',
  );
  if (/claimProductionHA:\s*true|production HA proof/i.test(p)) {
    fail('probe skeleton must not claim production HA');
  } else {
    pass('probe skeleton does not claim production HA');
  }
}

if (existsSync(composePath)) {
  const c = readFileSync(composePath, 'utf8');
  mustPin(
    'compose skeleton banner',
    c,
    [/SKELETON|Not HA|releaseEvidence=false|非生产/i],
    'compose skeleton must banner Not HA / skeleton',
  );
  if (/api-a:|api_a:|api-b:|api_b:/i.test(c)) {
    pass('compose declares dual api service keys (skeleton)');
  } else {
    fail('compose skeleton must declare dual api instances (api-a / api-b)');
  }
}

if (existsSync(pkgPath)) {
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
  const scripts = pkg.scripts ?? {};
  if (scripts['ha-track:skeleton:prove']) pass('package.json has ha-track:skeleton:prove');
  else fail('package.json missing ha-track:skeleton:prove');
  if (scripts['ha:probe:skeleton']) pass('package.json has ha:probe:skeleton');
  else fail('package.json missing ha:probe:skeleton');
}

for (const line of lines) console.log(line);

console.log('haStatus: NOT_HA');
console.log('releaseEvidence: false');
console.log('claimProductionHA: false');
console.log('note: skeleton files only; multi-instance + fault-inject prove NOT run');

const finalCmd = `node ${proofPath}`;
console.log(`CMD=${finalCmd} EXIT=${exitCode}`);
process.exit(exitCode);
