#!/usr/bin/env node
/**
 * E2E case inventory + full-suite harness static prove.
 * Checks docs exist; pins「禁止 mysql-stack 冒充 E2E」; requires ≥N families;
 * cross-refs gap-bug-backlog BUG-FAKE-R5 / BUG-E2E-ISO / BUG-FAKE-QBANK-EVAL;
 * pins 连通绿不计入业务 covered / releaseEvidence=false / Not HA / 本绿≠已迁.
 * Does NOT run full E2E suites. Does NOT claim full E2E green / cutover.
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const inventoryPath = join(root, 'ai-docs/delivery/e2e-case-inventory.md');
const harnessPath = join(root, 'ai-docs/delivery/harness/e2e-full-suite.inventory.md');
const backlogPath = join(root, 'ai-docs/delivery/gap-bug-backlog.md');
const gatePath = join(root, 'ai-docs/delivery/impl-review-gate.md');
const packageJsonPath = join(root, 'package.json');
const scriptPath = join(root, 'scripts/e2e-case-inventory.proof.mjs');

const MIN_FAMILIES = 10;

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
  ['e2e-case-inventory', inventoryPath],
  ['e2e-full-suite harness', harnessPath],
  ['gap-bug-backlog', backlogPath],
  ['impl-review-gate', gatePath],
  ['package.json', packageJsonPath],
  ['proof script', scriptPath],
]) {
  if (existsSync(path)) pass(`${label} present: ${path}`);
  else fail(`${label} missing: ${path}`);
}

function mustPin(doc, label, re, msg) {
  if (re.test(doc)) pass(`${label}: ${msg}`);
  else fail(`${label}: must pin ${msg}`);
}

if (existsSync(inventoryPath) && existsSync(harnessPath)) {
  const inv = readFileSync(inventoryPath, 'utf8');
  const har = readFileSync(harnessPath, 'utf8');

  for (const [label, doc] of [
    ['inventory', inv],
    ['harness', har],
  ]) {
    mustPin(doc, label, /releaseEvidence\s*=\s*false/i, 'releaseEvidence=false');
    mustPin(doc, label, /Not HA/i, 'Not HA');
    mustPin(doc, label, /本绿\s*≠\s*已迁|本绿 ≠ 已迁/, '本绿≠已迁');
    mustPin(
      doc,
      label,
      /禁止.*mysql-stack.*冒充|mysql-stack.*冒充.*E2E|禁止用 mysql-stack/,
      '禁止 mysql-stack 冒充 E2E',
    );
    mustPin(
      doc,
      label,
      /连通绿不计入业务 covered|连通绿.*不.*covered|永不.*covered|不计.*业务 covered/,
      '连通绿不计入业务 covered',
    );
    mustPin(doc, label, /MySQL\s*\+\s*Qdrant\s*\+\s*Redis|MySQL\+Qdrant\+Redis/, 'MySQL+Qdrant+Redis sole stack');
    mustPin(doc, label, /BUG-FAKE-R5/, 'BUG-FAKE-R5');
    mustPin(doc, label, /BUG-E2E-ISO/, 'BUG-E2E-ISO');
    mustPin(doc, label, /BUG-FAKE-QBANK-EVAL/, 'BUG-FAKE-QBANK-EVAL');
  }

  // Matrix shape: 需求ID → 用例 → 缺口
  mustPin(inv, 'inventory', /需求ID/, '需求ID column/matrix');
  mustPin(inv, 'inventory', /用例/, '用例 acceptance');
  mustPin(inv, 'inventory', /gap-bug-backlog|缺口/, '缺口 / gap-bug-backlog cross-ref');

  // Family IDs / catalog breadth
  const familyIds = [
    'F-ISO',
    'F-PERF',
    'F-VEC',
    'F-RAG',
    'F-QBANK',
    'F-PRIV',
    'F-WAKEUP',
    'F-MEM',
    'F-INT',
    'F-SCOR',
    'F-CONN',
  ];
  let familyHits = 0;
  for (const id of familyIds) {
    if (inv.includes(id)) familyHits += 1;
  }
  if (familyHits >= MIN_FAMILIES) {
    pass(`inventory lists ≥${MIN_FAMILIES} family ids (hit ${familyHits})`);
  } else {
    fail(`inventory must list ≥${MIN_FAMILIES} family ids (hit ${familyHits})`);
  }

  // Concrete script names from package.json surface
  for (const name of [
    'e2e:isolated',
    'verify:e2e-performance',
    'vectorstore:prove',
    'privacy-erasure:http:prove',
    'worker-wakeup:prove',
    'rag:adversarial:pg-eval',
  ]) {
    if (inv.includes(name) || har.includes(name)) {
      pass(`docs mention script ${name}`);
    } else {
      fail(`inventory/harness must mention script ${name}`);
    }
  }

  // Harness: how to run + EXIT per family
  mustPin(har, 'harness', /EXIT/, 'EXIT recording');
  mustPin(har, 'harness', /e2e:isolated|verify:e2e-performance/, 'full-run command families');
  mustPin(har, 'harness', /不宣称.*full E2E|不宣称 full E2E|不要求跑完|不宣称 full E2E green/, 'does not claim full E2E green / no mandatory full run');
  mustPin(har, 'harness', /mw-e2e-ha/, 'mw-e2e-ha review hook');
  mustPin(har, 'harness', /pgvector/, 'pgvector fake-green risk');

  // F-CONN never business covered
  if (/F-CONN/.test(inv) && /conn-only|永不/.test(inv)) {
    pass('inventory marks F-CONN as conn-only / never business covered');
  } else {
    fail('inventory must mark F-CONN conn-only / never business covered');
  }
}

if (existsSync(backlogPath)) {
  const bl = readFileSync(backlogPath, 'utf8');
  for (const id of ['BUG-FAKE-R5', 'BUG-E2E-ISO', 'BUG-FAKE-QBANK-EVAL', 'BUG-FAKE-CONN']) {
    if (bl.includes(id)) pass(`gap-bug-backlog contains ${id}`);
    else fail(`gap-bug-backlog missing ${id}`);
  }
}

if (existsSync(gatePath)) {
  const gate = readFileSync(gatePath, 'utf8');
  if (/禁止.*mysql-stack|mysql-stack.*冒充/.test(gate) && /e2e-full-suite\.inventory\.md/.test(gate)) {
    pass('impl-review-gate pins 禁止 mysql-stack 冒充 E2E + full-suite harness path');
  } else {
    fail('impl-review-gate must pin 禁止 mysql-stack 冒充 E2E and harness/e2e-full-suite.inventory.md');
  }
}

if (existsSync(packageJsonPath)) {
  const pkg = readFileSync(packageJsonPath, 'utf8');
  if (/e2e-case-inventory:prove/.test(pkg) && /e2e-case-inventory\.proof\.mjs/.test(pkg)) {
    pass('package.json pins e2e-case-inventory:prove → proof script');
  } else {
    fail('package.json must pin e2e-case-inventory:prove to e2e-case-inventory.proof.mjs');
  }
}

lines.push(
  'NOTE  EXIT=0 ⇒ inventory+harness static pins only; ≠ full E2E green; ≠ cutover; 连通绿≠业务 covered; releaseEvidence=false; Not HA; 本绿≠已迁',
);

for (const line of lines) console.log(line);
console.log(`CMD=node ${scriptPath} EXIT=${exitCode}`);
process.exit(exitCode);
