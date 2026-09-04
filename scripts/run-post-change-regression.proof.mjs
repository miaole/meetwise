/**
 * Deterministic proofs for the post-change regression entrypoint.
 * Does not run Docker, live providers, or CI verify. releaseEvidence=false.
 */
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  ALWAYS_ON_REQUIRED,
  CORE_REQUIRED,
  KNOWN_FLAGS,
  LANE_ORDER,
  LIVE_REQUIRED,
  OPTIONAL_ALWAYS_ON,
  REVIEW_VERIFY_DOCS,
  REVIEW_VERIFY_GATE,
  REVIEW_VERIFY_REQUIRED_PHRASES,
  collectReviewVerifyGateGaps,
  parseRegressionArgs,
  planRegression,
  resolveLiveProviderKey,
  summarizeOutcome,
} from './run-post-change-regression.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const runnerPath = resolve(ROOT, 'scripts/run-post-change-regression.mjs');
let passed = 0;

const test = (name, fn) => {
  fn();
  passed += 1;
  console.log(`PASS regression-prove: ${name}`);
};

const testAsync = async (name, fn) => {
  await fn();
  passed += 1;
  console.log(`PASS regression-prove: ${name}`);
};

function spawnRegression(argv, envExtra = {}) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(process.execPath, [runnerPath, ...argv], {
      cwd: ROOT,
      env: {
        PATH: process.env.PATH,
        LANG: 'C',
        LC_ALL: 'C',
        TZ: 'UTC',
        REGRESSION_SKIP_DOTENV: '1',
        ...envExtra,
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => { stdout += String(chunk); });
    child.stderr.on('data', (chunk) => { stderr += String(chunk); });
    child.on('error', reject);
    child.on('exit', (code, signal) => {
      resolvePromise({ code: signal ? 1 : (code ?? 1), stdout, stderr });
    });
  });
}

const scripts = JSON.parse(readFileSync(resolve(ROOT, 'package.json'), 'utf8')).scripts;
const skill = readFileSync(resolve(ROOT, 'ai-docs/skills/testing/SKILL.md'), 'utf8');
const runGates = readFileSync(resolve(ROOT, 'ai-docs/skills/testing/run-gates.md'), 'utf8');
const selection = readFileSync(resolve(ROOT, 'ai-docs/skills/testing/regression-selection.md'), 'utf8');
const strategy = readFileSync(resolve(ROOT, 'ai-docs/testing/strategy/test-strategy.md'), 'utf8');

test('flag 解析：只认 --core / --live / --dry-run，未知 flag 单独列出', () => {
  assert.deepEqual(parseRegressionArgs([]), {
    wantCore: false, wantLive: false, dryRun: false, unknown: [],
  });
  assert.deepEqual(parseRegressionArgs(['--core', '--live', '--dry-run']), {
    wantCore: true, wantLive: true, dryRun: true, unknown: [],
  });
  assert.deepEqual(parseRegressionArgs(['--help', '--core']), {
    wantCore: true, wantLive: false, dryRun: false, unknown: ['--help'],
  });
  assert.deepEqual([...KNOWN_FLAGS], ['--core', '--live', '--dry-run']);
});

test('车道顺序固定为 always-on → core → live', () => {
  assert.deepEqual([...LANE_ORDER], ['always-on', 'core', 'live']);
  const plan = planRegression({ wantCore: true, wantLive: true, scripts });
  const firstCore = plan.steps.indexOf(CORE_REQUIRED[0]);
  const firstLive = plan.steps.indexOf(LIVE_REQUIRED[0]);
  const lastAlways = Math.max(...plan.alwaysOn.map((name) => plan.steps.indexOf(name)));
  assert.ok(lastAlways >= 0 && firstCore > lastAlways, 'core must follow always-on');
  assert.ok(firstLive > firstCore, 'live must follow core');
});

test('必跑 always-on 缺失脚本 fail-closed，可选守卫缺席则跳过而不是记通过', () => {
  const requiredOnly = Object.fromEntries(ALWAYS_ON_REQUIRED.map((name) => [name, 'true']));
  const missingDocs = planRegression({ wantCore: false, wantLive: false, scripts: { 'golden-tasks:check': 'x' } });
  assert.ok(missingDocs.missingRequired.includes('docs:check'));
  const noOptional = planRegression({ wantCore: false, wantLive: false, scripts: requiredOnly });
  assert.equal(noOptional.missingRequired.length, 0);
  assert.deepEqual(noOptional.optionalPresent, []);
  assert.ok(OPTIONAL_ALWAYS_ON.every((name) => noOptional.optionalAbsent.includes(name)));
  assert.ok(noOptional.steps.every((name) => ALWAYS_ON_REQUIRED.includes(name)));
  const withOptional = planRegression({
    wantCore: false,
    wantLive: false,
    scripts: { ...requiredOnly, 'public-text-policy:prove': 'node x' },
  });
  assert.ok(withOptional.steps.includes('public-text-policy:prove'));
  assert.ok(withOptional.optionalPresent.includes('public-text-policy:prove'));
});

test('--core / --live 所需脚本缺失也 fail-closed', () => {
  const base = Object.fromEntries(ALWAYS_ON_REQUIRED.map((name) => [name, 'true']));
  const coreMissing = planRegression({ wantCore: true, wantLive: false, scripts: base });
  assert.ok(coreMissing.missingRequired.includes('db:prove'));
  const liveMissing = planRegression({ wantCore: false, wantLive: true, scripts: base });
  assert.ok(liveMissing.missingRequired.includes('e2e:isolated'));
});

test('空白或缺失 MODEL_API_KEY 一律视为无 Key，dotenv 有值才算有', () => {
  assert.equal(resolveLiveProviderKey({}, {}).ok, false);
  assert.equal(resolveLiveProviderKey({ MODEL_API_KEY: '' }, {}).ok, false);
  assert.equal(resolveLiveProviderKey({ MODEL_API_KEY: '   ' }, {}).ok, false);
  assert.equal(resolveLiveProviderKey({}, { MODEL_API_KEY: '' }).ok, false);
  assert.equal(resolveLiveProviderKey({}, { MODEL_API_KEY: 'sk-test-not-used' }).ok, true);
  assert.equal(resolveLiveProviderKey({ MODEL_API_KEY: 'sk-test-not-used' }, {}).ok, true);
});

test('成功摘要区分 always-on / core / live，从不把未跑车道写成通过', () => {
  assert.equal(summarizeOutcome({ wantCore: false, wantLive: false }), 'passed_always_on');
  assert.equal(summarizeOutcome({ wantCore: true, wantLive: false }), 'passed_always_on_and_core');
  assert.equal(summarizeOutcome({ wantCore: false, wantLive: true }), 'passed_always_on_and_http_e2e');
  assert.equal(summarizeOutcome({ wantCore: true, wantLive: true }), 'passed_always_on_core_and_http_e2e');
});

test('review/verify 门禁语言在脚本与技能文档中一致，缺席则 fail-closed', () => {
  assert.deepEqual([...REVIEW_VERIFY_REQUIRED_PHRASES], [
    'review/verify',
    'automation does not trust AI outputs',
    'multi-round allowed',
  ]);
  assert.equal(REVIEW_VERIFY_GATE.trust, 'automation_does_not_trust_ai_outputs');
  assert.equal(REVIEW_VERIFY_GATE.rounds, 'multi_round_allowed');
  assert.equal(REVIEW_VERIFY_GATE.failClosed, true);
  assert.equal(REVIEW_VERIFY_GATE.secrets, 'none');
  assert.equal(REVIEW_VERIFY_GATE.releaseEvidence, false);
  assert.deepEqual(collectReviewVerifyGateGaps(ROOT), []);
  for (const phrase of REVIEW_VERIFY_REQUIRED_PHRASES) {
    assert.match(skill, new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    assert.match(runGates, new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
  const fixture = mkdtempSync(join(tmpdir(), 'meetwise-regression-review-'));
  try {
    for (const relative of REVIEW_VERIFY_DOCS) {
      const target = resolve(fixture, relative);
      mkdirSync(dirname(target), { recursive: true });
      writeFileSync(target, 'no gate language here\n', 'utf8');
    }
    const gaps = collectReviewVerifyGateGaps(fixture);
    assert.ok(gaps.length >= REVIEW_VERIFY_DOCS.length * REVIEW_VERIFY_REQUIRED_PHRASES.length);
    assert.ok(gaps.every((gap) => !gap.includes('sk-') && !gap.includes('KEY=')));
  } finally {
    rmSync(fixture, { recursive: true, force: true });
  }
});

test('技能文档与脚本对 always-on / --core / --live 和必跑顺序一致', () => {
  for (const name of ALWAYS_ON_REQUIRED) {
    assert.match(runGates, new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
  for (const name of CORE_REQUIRED) {
    assert.match(runGates, new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
  assert.match(skill, /pnpm regression/);
  assert.match(skill, /--core/);
  assert.match(skill, /--live/);
  assert.match(skill, /always-on/);
  assert.match(runGates, /always-on/);
  assert.match(runGates, /先跑完 always-on/);
  assert.match(runGates, /live_provider_key_missing/);
  assert.match(selection, /pnpm regression --live/);
  assert.match(strategy, /pnpm regression --core/);
  assert.match(strategy, /pnpm regression --live/);
  assert.doesNotMatch(runGates, /等价于依次/);
  assert.match(skill, /releaseEvidence/);
  assert.match(skill, /出处/);
});

await testAsync('未知 flag 退出码 2，不打印通过摘要', async () => {
  const result = await spawnRegression(['--oops']);
  assert.equal(result.code, 2);
  assert.match(result.stderr, /regression_unknown_flag:--oops/);
  assert.doesNotMatch(`${result.stdout}${result.stderr}`, /REGRESSION_SUMMARY/);
  assert.doesNotMatch(`${result.stdout}${result.stderr}`, /passed_always_on/);
});

await testAsync('--live 无 Key 立即非零退出，不跑、不记通过', async () => {
  const result = await spawnRegression(['--live'], { MODEL_API_KEY: '' });
  assert.equal(result.code, 1);
  assert.match(result.stderr, /live_provider_key_missing:MODEL_API_KEY/);
  assert.match(result.stderr, /regression_live_not_run/);
  assert.match(result.stdout, /review\/verify: automation does not trust AI outputs; multi-round allowed/);
  assert.doesNotMatch(`${result.stdout}${result.stderr}`, /REGRESSION_SUMMARY/);
  assert.doesNotMatch(`${result.stdout}${result.stderr}`, /REGRESSION_PLAN/);
  assert.doesNotMatch(`${result.stdout}${result.stderr}`, /========== regression:/);
});

await testAsync('--dry-run --live 无 Key 同样 fail-closed', async () => {
  const result = await spawnRegression(['--dry-run', '--live']);
  assert.equal(result.code, 1);
  assert.match(result.stderr, /live_provider_key_missing:MODEL_API_KEY/);
  assert.doesNotMatch(result.stdout, /dryRun":true/);
});

await testAsync('--dry-run 列出 always-on（含已存在的可选守卫），不含 core/live', async () => {
  const result = await spawnRegression(['--dry-run']);
  assert.equal(result.code, 0);
  const line = result.stdout.split('\n').find((row) => row.startsWith('REGRESSION_PLAN '));
  assert.ok(line, 'dry-run must print REGRESSION_PLAN');
  const plan = JSON.parse(line.slice('REGRESSION_PLAN '.length));
  assert.equal(plan.releaseEvidence, false);
  assert.equal(plan.dryRun, true);
  assert.deepEqual(plan.order, ['always-on', 'core', 'live']);
  assert.deepEqual(plan.requested, { alwaysOn: true, core: false, live: false });
  assert.deepEqual(plan.reviewVerify, REVIEW_VERIFY_GATE);
  assert.match(result.stdout, /REGRESSION_REVIEW_VERIFY_GATE /);
  assert.match(result.stdout, /review\/verify: automation does not trust AI outputs; multi-round allowed/);
  assert.match(result.stdout, /secrets: none/);
  for (const name of ALWAYS_ON_REQUIRED) {
    assert.ok(plan.steps.includes(name), `dry-run missing required ${name}`);
  }
  assert.ok(!plan.steps.includes('db:prove'));
  assert.ok(!plan.steps.includes('e2e:isolated'));
  for (const name of OPTIONAL_ALWAYS_ON) {
    if (scripts[name]) assert.ok(plan.optionalWired.includes(name), `present optional ${name} must be wired`);
    else assert.ok(plan.optionalAbsent.includes(name));
  }
  assert.doesNotMatch(result.stdout, /REGRESSION_SUMMARY/);
});

await testAsync('--dry-run --core --live 在有 Key 时按固定顺序展开三车道', async () => {
  const result = await spawnRegression(['--dry-run', '--core', '--live'], { MODEL_API_KEY: 'sk-test-not-used' });
  assert.equal(result.code, 0, result.stderr);
  const line = result.stdout.split('\n').find((row) => row.startsWith('REGRESSION_PLAN '));
  const plan = JSON.parse(line.slice('REGRESSION_PLAN '.length));
  assert.deepEqual(plan.requested, { alwaysOn: true, core: true, live: true });
  const firstCore = plan.steps.indexOf('db:prove');
  const lastAlways = Math.max(...ALWAYS_ON_REQUIRED.map((name) => plan.steps.indexOf(name)));
  assert.ok(firstCore > lastAlways);
  assert.equal(plan.steps.at(-1), 'e2e:isolated');
  assert.doesNotMatch(result.stdout, /passed_always_on/);
});

console.log(`PASS regression proof: ${passed} scenarios; releaseEvidence=false`);
