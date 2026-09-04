/**
 * Static registry check for the first golden-task batch.
 * Does not execute mapped gates and never sets releaseEvidence.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const ALLOWED = new Set(['mapped', 'partial', 'planned', 'unmapped']);
const FORBIDDEN_STATUS = new Set(['passed', 'green', 'release_ready', 'pass']);
const REQUIRED_IDS = ['GT-01', 'GT-02', 'GT-03', 'GT-04', 'GT-05', 'GT-06', 'GT-07', 'GT-08'];

const registry = JSON.parse(readFileSync(join(ROOT, 'ai-docs/testing/golden-tasks/registry.json'), 'utf8'));
const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
const errors = [];

if (registry.releaseEvidence !== false) errors.push('registry.releaseEvidence must be false');
if (registry.schemaVersion !== 1) errors.push('registry.schemaVersion must be 1');
if (!Array.isArray(registry.tasks) || registry.tasks.length !== 8) errors.push('registry must list exactly the first 8 tasks');

const ids = registry.tasks.map((task) => task.id);
for (const id of REQUIRED_IDS) {
  if (!ids.includes(id)) errors.push(`missing ${id}`);
}
if (new Set(ids).size !== ids.length) errors.push('duplicate task id');

for (const task of registry.tasks) {
  if (FORBIDDEN_STATUS.has(String(task.status))) errors.push(`${task.id} forbids status=${task.status}`);
  if (!ALLOWED.has(task.status)) errors.push(`${task.id} unknown status=${task.status}`);
  if (typeof task.doc !== 'string' || !task.doc.startsWith('ai-docs/testing/golden-tasks/')) {
    errors.push(`${task.id} doc path invalid`);
  } else {
    try {
      readFileSync(join(ROOT, task.doc), 'utf8');
    } catch {
      errors.push(`${task.id} doc missing: ${task.doc}`);
    }
  }
  if ((task.status === 'mapped' || task.status === 'partial') && (!Array.isArray(task.mappedCommands) || task.mappedCommands.length === 0)) {
    errors.push(`${task.id} ${task.status} requires mappedCommands`);
  }
  if (task.status === 'planned' && Array.isArray(task.mappedCommands) && task.mappedCommands.length > 0) {
    errors.push(`${task.id} planned must not claim mappedCommands`);
  }
  for (const command of task.mappedCommands ?? []) {
    if (!pkg.scripts?.[command]) errors.push(`${task.id} mapped command missing in package.json: ${command}`);
  }
}

if (errors.length) {
  console.error('golden-tasks check failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('golden-tasks check passed: 8 first-batch entries; releaseEvidence=false; no fake passed status');
