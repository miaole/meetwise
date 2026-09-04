/**
 * Static registry check for the first golden-task batch.
 * Does not execute mapped gates and never sets releaseEvidence.
 *
 * Honesty: planned/unmapped cannot claim covering commands; mapped/partial
 * commands must exist in root package.json; docs/README/strategy status must
 * match; quality eval (`scoring:eval`) cannot be listed as a covering gate.
 */
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const SCHEMA_VERSION = 2;
export const ALLOWED_STATUS = new Set(['mapped', 'partial', 'planned', 'unmapped']);
export const FORBIDDEN_STATUS = new Set(['passed', 'green', 'release_ready', 'pass']);
export const EVIDENCE_KINDS = new Set(['none', 'deterministic-prove', 'live-e2e', 'quality-eval']);
export const SUBJECTS = new Set(['ai-output', 'mechanism']);
export const REQUIRED_IDS = ['GT-01', 'GT-02', 'GT-03', 'GT-04', 'GT-05', 'GT-06', 'GT-07', 'GT-08'];
/** Strategy lines 1–4 judge model output quality. They may be planned/partial only. */
export const AI_OUTPUT_IDS = new Set(['GT-01', 'GT-02', 'GT-03', 'GT-04']);
export const FORBIDDEN_MAPPED_COMMANDS = new Set(['scoring:eval']);
export const META_MAPPED_COMMANDS = new Set([
  'docs:check', 'golden-tasks:check', 'golden-tasks:prove', 'arch', 'api:smoke',
  'regression', 'regression:core', 'regression:live', 'hooks:install', 'dev',
  'compose:demo', 'compose:down', 'release', 'db:up',
]);
export const STRATEGY_PATH = 'ai-docs/testing/strategy/test-strategy.md';
export const README_PATH = 'ai-docs/testing/golden-tasks/README.md';
export const REGISTRY_PATH = 'ai-docs/testing/golden-tasks/registry.json';

export function isCoveringCommandShape(command) {
  return /:(prove|isolated)$/.test(command) || /^neg:/.test(command);
}

export function readmeStatusColumn(row) {
  const cols = String(row).split('|').map((col) => col.trim());
  return cols[3] ?? '';
}

export function strategyStatusMentions(strategy, id) {
  const re = new RegExp(`\`${id}\` \\*\\*(mapped|partial|planned|unmapped)\\*\\*`, 'g');
  return [...String(strategy).matchAll(re)].map((match) => match[1]);
}

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

export function parseFrontmatter(text) {
  const match = String(text).match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};
  const out = {};
  for (const line of match[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z0-9_]+):\s*(.+)$/);
    if (kv) out[kv[1]] = kv[2].trim();
  }
  return out;
}

function asStringArray(value, label, errors) {
  if (!Array.isArray(value)) {
    errors.push(`${label} must be an array`);
    return [];
  }
  for (const [index, item] of value.entries()) {
    if (typeof item !== 'string' || !item.trim()) errors.push(`${label}[${index}] must be a non-empty string`);
  }
  return value.filter((item) => typeof item === 'string');
}

/**
 * @param {{
 *   registry: any,
 *   pkgScripts: Record<string, string | undefined>,
 *   docs: Record<string, string>,
 *   readme: string,
 *   strategy: string,
 * }} input
 * @returns {string[]}
 */
export function validateGoldenTasksRegistry(input) {
  const errors = [];
  const { registry, pkgScripts, docs, readme, strategy } = input;

  if (registry.releaseEvidence !== false) errors.push('registry.releaseEvidence must be false');
  if (registry.schemaVersion !== SCHEMA_VERSION) errors.push(`registry.schemaVersion must be ${SCHEMA_VERSION}`);
  if (!Array.isArray(registry.tasks) || registry.tasks.length !== REQUIRED_IDS.length) {
    errors.push(`registry must list exactly the first ${REQUIRED_IDS.length} tasks`);
  }
  const tasks = Array.isArray(registry.tasks) ? registry.tasks : [];
  const ids = tasks.map((task) => task.id);
  for (const id of REQUIRED_IDS) {
    if (!ids.includes(id)) errors.push(`missing ${id}`);
  }
  if (new Set(ids).size !== ids.length) errors.push('duplicate task id');

  for (const task of tasks) {
    const id = typeof task.id === 'string' ? task.id : '(missing-id)';
    if (FORBIDDEN_STATUS.has(String(task.status))) errors.push(`${id} forbids status=${task.status}`);
    if (!ALLOWED_STATUS.has(task.status)) errors.push(`${id} unknown status=${task.status}`);
    if (!EVIDENCE_KINDS.has(task.evidenceKind)) errors.push(`${id} unknown evidenceKind=${task.evidenceKind}`);
    if (!SUBJECTS.has(task.subject)) errors.push(`${id} unknown subject=${task.subject}`);
    if (AI_OUTPUT_IDS.has(id) && task.subject !== 'ai-output') {
      errors.push(`${id} is an AI-output golden task; subject must be ai-output`);
    }
    if (!AI_OUTPUT_IDS.has(id) && task.subject === 'ai-output') {
      errors.push(`${id} is a mechanism task; subject must be mechanism`);
    }
    if (task.subject === 'ai-output' && task.status === 'mapped') {
      errors.push(`${id} ai-output cannot be mapped (fixture/fake-model must not green model output)`);
    }

    if (typeof task.doc !== 'string' || !task.doc.startsWith('ai-docs/testing/golden-tasks/')) {
      errors.push(`${id} doc path invalid`);
    } else if (!(task.doc in docs)) {
      errors.push(`${id} doc missing: ${task.doc}`);
    } else {
      const fm = parseFrontmatter(docs[task.doc]);
      if (fm.id !== task.id) errors.push(`${id} doc frontmatter id=${fm.id ?? 'missing'} !== registry`);
      if (fm.status !== task.status) errors.push(`${id} doc frontmatter status=${fm.status ?? 'missing'} !== ${task.status}`);
      if (fm.subject !== task.subject) errors.push(`${id} doc frontmatter subject=${fm.subject ?? 'missing'} !== ${task.subject}`);
    }

    const mapped = asStringArray(task.mappedCommands, `${id} mappedCommands`, errors);
    if (new Set(mapped).size !== mapped.length) errors.push(`${id} duplicate mappedCommands`);
    const covers = asStringArray(task.covers, `${id} covers`, errors);
    const uncovered = asStringArray(task.uncovered, `${id} uncovered`, errors);

    if (!Array.isArray(task.relatedCommands)) {
      errors.push(`${id} relatedCommands must be an array`);
    } else {
      const relatedNames = [];
      for (const [index, related] of task.relatedCommands.entries()) {
        if (!related || typeof related !== 'object') {
          errors.push(`${id} relatedCommands[${index}] must be an object`);
          continue;
        }
        if (typeof related.command !== 'string' || !related.command.trim()) {
          errors.push(`${id} relatedCommands[${index}].command missing`);
        } else {
          relatedNames.push(related.command);
          if (!pkgScripts[related.command]) {
            errors.push(`${id} related command missing in package.json: ${related.command}`);
          }
          if (mapped.includes(related.command)) {
            errors.push(`${id} ${related.command} cannot be both mapped and related`);
          }
        }
        if (typeof related.notCovered !== 'string' || !related.notCovered.trim()) {
          errors.push(`${id} relatedCommands[${index}].notCovered must explain why it is not a covering gate`);
        }
      }
      if (new Set(relatedNames).size !== relatedNames.length) errors.push(`${id} duplicate relatedCommands`);
    }

    if (task.status === 'mapped' || task.status === 'partial') {
      if (mapped.length === 0) errors.push(`${id} ${task.status} requires mappedCommands`);
      if (covers.length === 0) errors.push(`${id} ${task.status} requires covers`);
      if (task.evidenceKind === 'none') errors.push(`${id} ${task.status} cannot use evidenceKind=none`);
    }
    if (task.status === 'partial' && uncovered.length === 0) {
      errors.push(`${id} partial requires uncovered (otherwise use mapped)`);
    }
    if ((task.status === 'planned' || task.status === 'unmapped')) {
      if (mapped.length > 0) errors.push(`${id} ${task.status} must not claim mappedCommands`);
      if (covers.length > 0) errors.push(`${id} ${task.status} must not claim covers`);
      if (uncovered.length === 0) errors.push(`${id} ${task.status} requires uncovered`);
      if (task.evidenceKind !== 'none') errors.push(`${id} ${task.status} evidenceKind must be none`);
    }
    if (task.status === 'mapped' && task.evidenceKind === 'quality-eval') {
      errors.push(`${id} mapped cannot use evidenceKind=quality-eval (quality eval is not a covering prove)`);
    }

    for (const command of mapped) {
      if (!pkgScripts[command]) errors.push(`${id} mapped command missing in package.json: ${command}`);
      if (FORBIDDEN_MAPPED_COMMANDS.has(command)) {
        errors.push(`${id} ${command} cannot be a covering gate (inconclusive quality eval, not a prove)`);
      }
      if (META_MAPPED_COMMANDS.has(command)) {
        errors.push(`${id} ${command} is a meta/docs script, not a covering gate`);
      }
      if (!isCoveringCommandShape(command)) {
        errors.push(`${id} ${command} is not a prove/isolated/neg covering shape`);
      }
    }

    const readmeRow = String(readme).split(/\r?\n/).find((line) => line.includes(`[${id}]`));
    if (!readmeRow) errors.push(`${id} missing from README table`);
    else if (readmeStatusColumn(readmeRow) !== `\`${task.status}\``) {
      errors.push(`${id} README status drift (expected \`${task.status}\`)`);
    }

    const strategyHits = strategyStatusMentions(strategy, id);
    if (strategyHits.length === 0) errors.push(`${id} test-strategy status drift (missing ${id})`);
    else if (strategyHits.some((status) => status !== task.status)) {
      errors.push(`${id} test-strategy status drift (expected ${task.status}, found ${[...new Set(strategyHits)].join(',')})`);
    }
  }

  return errors;
}

export function loadGoldenTasksFromDisk(root = ROOT) {
  const registry = JSON.parse(readFileSync(join(root, REGISTRY_PATH), 'utf8'));
  const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
  const docs = {};
  for (const task of registry.tasks ?? []) {
    if (typeof task.doc === 'string') {
      try {
        docs[task.doc] = readFileSync(join(root, task.doc), 'utf8');
      } catch {
        // validateGoldenTasksRegistry reports missing docs
      }
    }
  }
  return {
    registry,
    pkgScripts: pkg.scripts ?? {},
    docs,
    readme: readFileSync(join(root, README_PATH), 'utf8'),
    strategy: readFileSync(join(root, STRATEGY_PATH), 'utf8'),
  };
}

export function main(root = ROOT) {
  const errors = validateGoldenTasksRegistry(loadGoldenTasksFromDisk(root));
  if (errors.length) {
    console.error('golden-tasks check failed:');
    for (const error of errors) console.error(`- ${error}`);
    process.exitCode = 1;
    return errors;
  }
  console.log('golden-tasks check passed: 8 first-batch entries; schemaVersion=2; releaseEvidence=false; ai-output not mapped');
  return [];
}

const invoked = process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;
if (invoked) main();
